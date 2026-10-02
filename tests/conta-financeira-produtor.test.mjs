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

console.log(`\nTodos os ${passed} testes da Conta Financeira do Produtor passaram com sucesso!`);
