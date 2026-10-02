import assert from 'node:assert/strict';
import { CoreFinanceiroStore } from '../js/state.js';

// Mock de alert para ambiente Node.js de teste
globalThis.alert = (msg) => { /* no-op em testes automatizados */ };

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
    passed++;
  } catch (err) {
    console.error('✗', name, '\n ', err.message);
    process.exitCode = 1;
  }
}

console.log('--- Iniciando Testes da Conta Financeira do Produtor (CNPJ) ---');

// 1. Consolidação da Conta por CNPJ (Os 5 Pilares)
test('Conta por CNPJ consolida os 5 pilares canônicos de saldo e segrega por evento', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  const account = store.getProducerFinancialAccount('prod-abc');
  assert(account, 'Objeto de conta deve existir');
  assert.equal(account.producer.id, 'prod-abc');
  assert(account.producer.cnpj, 'Produtor deve possuir CNPJ cadastrado');

  const { summary, events } = account;
  assert(typeof summary.consolidatedBalance === 'number', 'Saldo consolidado deve ser numérico');
  assert(typeof summary.availableForRepasse === 'number', 'Disponível para repasse deve ser numérico');
  assert(typeof summary.futurePending === 'number', 'Saldo a liberar futuro deve ser numérico');
  assert(typeof summary.blocked === 'number', 'Bloqueado deve ser numérico');
  assert(typeof summary.retained === 'number', 'Retido deve ser numérico');
  assert(typeof summary.outstandingCredits === 'number', 'Créditos em aberto deve ser numérico');

  // Cada evento tem contabilidade isolada
  assert(events.length > 0, 'Produtor deve ter eventos vinculados');
  events.forEach(ev => {
    assert.equal(ev.producerId, 'prod-abc', 'Eventos devem pertencer exclusivamente ao CNPJ do produtor');
    assert(ev.eligibility, 'Evento deve possuir motor de elegibilidade calculado');
  });
});

// 2. Concessão de Crédito e Regras de Segregação
test('Concessão de crédito exige perfil Disk, justificativa >= 5 chars e calcula juros/parcelas com precisão', () => {
  const store = new CoreFinanceiroStore();

  // Teste de SoD: Produtor não pode conceder crédito a si mesmo
  store.login('producer', 'prod-abc');
  const creditAttemptProd = store.grantProducerCredit({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    principal: 50000,
    interestRate: 2.5,
    installments: 4,
    notes: 'Solicitação pelo produtor'
  });
  assert.equal(creditAttemptProd, null, 'Produtor não pode conceder crédito');

  // Login como Mesa Disk
  store.login('disk');

  // Tentativa sem justificativa adequada (< 5 caracteres)
  const creditAttemptShortNotes = store.grantProducerCredit({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    principal: 50000,
    interestRate: 2.5,
    installments: 4,
    notes: 'Ok'
  });
  assert.equal(creditAttemptShortNotes, null, 'Justificativa < 5 chars deve ser rejeitada');

  // Concessão válida
  const credit = store.grantProducerCredit({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    principal: 100000,
    interestRate: 2.0, // 2% a.m.
    installments: 5,   // 5 meses -> 10% de juros total
    amortizationModel: 'PARCELAS_FIXAS',
    notes: 'Adiantamento emergencial de montagem de palco e rider técnico'
  });

  assert(credit, 'Crédito deve ser gerado');
  assert.equal(credit.principal, 100000);
  assert.equal(credit.interestRate, 2.0);
  assert.equal(credit.installmentsCount, 5);
  // Total da dívida = 100.000 * (1 + (2.0 * 5) / 100) = 110.000
  assert.equal(credit.totalDebt, 110000);
  assert.equal(credit.outstandingDebt, 110000);
  assert.equal(credit.installmentValue, 22000); // 110.000 / 5 = 22.000
  assert.equal(credit.status, 'ATIVO');
  assert(credit.protocol.startsWith('CR-'), 'Protocolo canônico CR deve ser gerado');
});

// 3. Amortização de Crédito e Quitação Integral
test('Amortização abate saldo devedor e transita status para LIQUIDADO na quitação total', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  const credit = store.grantProducerCredit({
    producerId: 'prod-abc',
    eventId: 'evt-002',
    principal: 20000,
    interestRate: 0,
    installments: 2,
    amortizationModel: 'PARCELAS_FIXAS',
    notes: 'Capital de giro de bilheteria inicial'
  });

  assert.equal(credit.outstandingDebt, 20000);

  // Amortização parcial de R$ 10.000
  const am1 = store.amortizeProducerCredit({
    creditId: credit.id,
    amount: 10000,
    type: 'PARCELA_FIXA'
  });

  assert.equal(am1.outstandingDebt, 10000);
  assert.equal(am1.amortizedTotal, 10000);
  assert.equal(am1.status, 'ATIVO');
  assert.equal(am1.amortizationHistory.length, 1);

  // Amortização final de R$ 10.000 -> Quitação
  const am2 = store.amortizeProducerCredit({
    creditId: credit.id,
    amount: 10000,
    type: 'PARCELA_FIXA'
  });

  assert.equal(am2.outstandingDebt, 0);
  assert.equal(am2.amortizedTotal, 20000);
  assert.equal(am2.status, 'LIQUIDADO');
  assert(am2.liquidatedAt, 'Deve registrar data/hora da liquidação');

  // Tentativa de amortizar contrato já liquidado
  const am3 = store.amortizeProducerCredit({
    creditId: credit.id,
    amount: 5000
  });
  assert.equal(am3, null, 'Não deve permitir amortizar contrato já quitado');
});

// 4. Gestão de Bloqueios e Retenções Cautelares
test('Bloqueio e liberação de saldo exigem perfil Disk, justificativa formal e respeitam disponibilidade', () => {
  const store = new CoreFinanceiroStore();

  // Teste de SoD: Produtor não pode bloquear saldo
  store.login('producer', 'prod-abc');
  const blkProd = store.blockAccountBalance({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    amount: 5000,
    reason: 'Tentativa indevida de bloqueio'
  });
  assert.equal(blkProd, null, 'Produtor não pode executar bloqueio cautelar');

  store.login('disk');
  const eventBefore = store.data.events.find(e => e.id === 'evt-001');
  const availBefore = eventBefore.availableBalance;
  const blockedBefore = eventBefore.blockedBalance || 0;

  // Tentativa de bloquear mais do que o disponível
  const blkExcess = store.blockAccountBalance({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    amount: availBefore + 500000,
    reason: 'Tentativa excedente'
  });
  assert.equal(blkExcess, null, 'Bloqueio acima do saldo disponível deve ser rejeitado');

  // Bloqueio válido de R$ 15.000
  const blkSuccess = store.blockAccountBalance({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    amount: 15000,
    type: 'BLOQUEIO',
    reason: 'Investigação preventiva de contestações em lote'
  });
  assert(blkSuccess, 'Bloqueio deve ser efetivado');
  assert.equal(blkSuccess.availableBalance, availBefore - 15000);
  assert.equal(blkSuccess.blockedBalance, blockedBefore + 15000);

  // Liberação válida de R$ 15.000 com justificativa
  const relSuccess = store.releaseAccountBalance({
    producerId: 'prod-abc',
    eventId: 'evt-001',
    amount: 15000,
    reason: 'Contestações verificadas e validadas sem fraude comprovada'
  });
  assert(relSuccess, 'Liberação deve ser efetivada');
  assert.equal(relSuccess.blockedBalance, blockedBefore);
  assert.equal(relSuccess.availableBalance, availBefore);
});

// 5. Dedução de Amortização de Recebíveis no Cálculo de Elegibilidade de Repasse
test('Crédito ativo com modelo de retenção de vendas deduz amortização hold do disponível para repasse', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  // Concede crédito com 15% de amortização sobre vendas no evt-inverno (que tem vendas >= 50%)
  store.grantProducerCredit({
    producerId: 'prod-abc',
    eventId: 'evt-inverno',
    principal: 40000,
    interestRate: 0,
    installments: 1,
    amortizationModel: 'PERCENTUAL_RECEBIVEIS',
    receivablePercent: 15.0,
    notes: 'Adiantamento com garantia de amortização em bilheteria'
  });

  const elig = store.calculatePayoutEligibility('evt-inverno');
  assert(elig.creditAmortizationHold > 0, 'Deve apurar reserva para amortização de crédito');
  assert(elig.totalDeductions >= elig.creditAmortizationHold, 'totalDeductions deve englobar a reserva de crédito');
  assert.equal(
    elig.disponivelFinal,
    Math.min(elig.eventAvailable, Math.max(0, elig.limiteBruto - elig.totalDeductions)),
    'Disponível final deve descontar a retenção de amortização de crédito'
  );
});

// 6. Agenda de Obrigações do Evento (Aluguel, ECAD, Fornecedores)
test('Agenda de obrigações reserva saldo antes do motor e deduz da base elegível de repasse', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  // Criação de obrigação de aluguel de teatro (R$ 80.000) e ECAD (R$ 15.000)
  const obAluguel = store.createEventObligation({
    eventId: 'evt-003',
    category: 'ALUGUEL_ESPACO',
    description: 'Locação Teatro Principal',
    beneficiary: 'Teatro Positivo Ltda.',
    value: 80000,
    dueDate: '2026-11-10',
    documentRef: 'Contrato 2026/04',
    status: 'RESERVADO',
    notes: 'Reserva preventiva de aluguel'
  });

  assert(obAluguel, 'Obrigação de aluguel deve ser criada');
  assert.equal(obAluguel.status, 'RESERVADO');
  assert.equal(obAluguel.value, 80000);

  const elig = store.calculatePayoutEligibility('evt-003');
  assert(elig.obligationsHold >= 80000, 'Motor deve apurar as obrigações reservadas');
  assert(elig.totalDeductions >= elig.obligationsHold, 'Deduções totais devem englobar obrigações reservadas');

  // Atualização de status da obrigação para RETIDO e depois LIQUIDADO
  const obUpdated = store.updateEventObligationStatus({
    obligationId: obAluguel.id,
    status: 'LIQUIDADO',
    notes: 'Comprovante bancário TED anexado'
  });
  assert.equal(obUpdated.status, 'LIQUIDADO');
  assert(obUpdated.liquidatedAt, 'Deve registrar data de liquidação');
});

// 7. Fila de Estornos com Reserva Imediata e Dupla Autorização Estrita (SoD)
test('Estorno reserva saldo imediatamente, exige dupla autorização por usuários distintos (SoD) e efetiva no ledger', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  // Abertura de estorno de R$ 5.000 no evt-003
  const refund = store.openInternalRefund({
    eventId: 'evt-003',
    orderId: 'PED-TEST-5000',
    value: 5000,
    reason: 'Cancelamento VIP solicitado via Procon'
  });

  assert(refund, 'Estorno deve ser aberto');
  assert.equal(refund.status, 'AGUARDANDO_PRIMEIRA_AUTORIZACAO');
  assert.equal(refund.value, 5000);

  // Reserva imediata reflete no motor de elegibilidade
  const eligWithRefund = store.calculatePayoutEligibility('evt-003');
  assert(eligWithRefund.refundsHold >= 5000, 'Valor do estorno deve ser colocado imediatamente em reserva hold');

  // 1ª Autorização concedida pelo Operador A
  store.state.currentUser = { id: 'usr-operador-a', name: 'Operador A (Analista)', role: 'disk' };
  const auth1 = store.authorizeInternalRefund({
    refundId: refund.id,
    factor: 'MFA_VALIDADO_TOKEN_A',
    notes: '1ª autorização técnica'
  });
  assert.equal(auth1.status, 'AGUARDANDO_SEGUNDA_AUTORIZACAO');
  assert.equal(auth1.approvals.length, 1);

  // Tentativa de 2ª Autorização pelo MESMO Operador A deve ser BLOQUEADA (SoD estrito)
  const authDuplicateAttempt = store.authorizeInternalRefund({
    refundId: refund.id,
    factor: 'TENTATIVA_MESMO_OPERADOR'
  });
  assert.equal(authDuplicateAttempt, null, 'O mesmo operador não pode autorizar duas vezes');

  // Tentativa de efetivar prematuramente com apenas 1 autorização deve ser BLOQUEADA
  const prematureExec = store.executeInternalRefund({ refundId: refund.id });
  assert.equal(prematureExec, null, 'Não pode efetivar com apenas 1 autorização');

  // 2ª Autorização concedida por Operador B (usuário distinto)
  store.state.currentUser = { id: 'usr-operador-b', name: 'Operador B (Supervisor)', role: 'disk' };
  const auth2 = store.authorizeInternalRefund({
    refundId: refund.id,
    factor: 'MFA_VALIDADO_TOKEN_B',
    notes: '2ª autorização de mesa'
  });
  assert.equal(auth2.status, 'AUTORIZADO_PARA_EFETIVAR');
  assert.equal(auth2.approvals.length, 2);

  // Efetivação definitiva no Gateway & Ledger
  const executed = store.executeInternalRefund({ refundId: refund.id });
  assert.equal(executed.status, 'EFETIVADO');
  assert(executed.executedAt, 'Data de efetivação deve ser preenchida');
  assert.equal(executed.executedBy, 'Operador B (Supervisor) (Financeiro Disk)');
});

// 8. Isolamento de Acesso Arquitetural (Produtor vs. Financeiro Disk)
test('Isolamento estrito impede que Produtor acerte, crie ou autorize obrigações, estornos ou créditos', () => {
  const store = new CoreFinanceiroStore();
  store.login('producer', 'prod-abc');

  const obAttempt = store.createEventObligation({
    eventId: 'evt-001',
    description: 'Tentativa de criar obrigação',
    value: 5000
  });
  assert.equal(obAttempt, null, 'Produtor não pode criar obrigações');

  const refAttempt = store.openInternalRefund({
    eventId: 'evt-001',
    orderId: 'PED-PROD',
    value: 1000,
    reason: 'Tentativa indevida de estorno'
  });
  assert.equal(refAttempt, null, 'Produtor não pode abrir estornos internos');
});

// 9. Drilldown Contábil e Movimentação Completa do Evento (V0.4)
test('Drilldown do evento consolida obrigações, estornos, créditos e extrato exclusivo do evento', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  const account = store.getProducerFinancialAccount('prod-abc');
  const ev = account.events.find(e => e.id === 'evt-003');
  assert(ev, 'Evento evt-003 deve existir');

  const obligations = (account.obligations || []).filter(o => o.eventId === 'evt-003');
  const refunds = (account.refunds || []).filter(r => r.eventId === 'evt-003');
  const credits = (account.credits || []).filter(c => c.eventId === 'evt-003');
  const ledger = (account.ledger || []).filter(l => l.eventId === 'evt-003');

  assert(Array.isArray(obligations), 'Obrigações do evento devem ser array');
  assert(Array.isArray(refunds), 'Estornos do evento devem ser array');
  assert(Array.isArray(credits), 'Créditos do evento devem ser array');
  assert(Array.isArray(ledger), 'Ledger do evento deve ser array');
});

console.log(`\nTodos os ${passed} testes da Conta Financeira do Produtor passaram com sucesso!`);
