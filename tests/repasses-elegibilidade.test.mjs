/**
 * Testes Unitários e Integrados do Motor de Elegibilidade de Repasses (Pacote 23)
 * Cobertura:
 *  1. Evento com vendas < 50% bloqueado e cálculo exato de faltamVendas.
 *  2. Evento com vendas >= 50% liberando 20% do bruto elegível.
 *  3. Deduções canônicas de repasses anteriores e valores bloqueados/reservados.
 *  4. Sobrescrita hierárquica de políticas (Geral Disk → Produtor → Evento).
 *  5. Autorização Excepcional (A Trava Humana) com justificativa obrigatória (>= 5 chars) e SoD.
 *  6. Consumo atômico e único da autorização excepcional.
 *  7. Travas de limite na submissão de solicitação de repasse.
 */

import assert from 'node:assert/strict';
import { CoreFinanceiroStore } from '../js/state.js';

let passed = 0;
let lastAlert = null;
globalThis.alert = (msg) => { lastAlert = msg; };

function test(name, fn) {
  try {
    lastAlert = null;
    fn();
    console.log('✓', name);
    passed++;
  } catch (err) {
    console.error('✗', name, '\n ', err.message);
    process.exitCode = 1;
  }
}

console.log('--- Iniciando Testes do Motor de Elegibilidade de Repasses ---\n');

// 1. Evento com vendas < 50% bloqueado e cálculo de faltamVendas
test('Evento com vendas < 50% é bloqueado e faltamVendas calcula valor faltante exato', () => {
  const store = new CoreFinanceiroStore();
  // Limpa autorizações excepcionais para testar o comportamento estrito da regra padrão
  store.data.exceptionalAuthorizations = [];

  // evt-002: Meta R$ 600.000, Vendas R$ 250.000 (41.7%)
  const elig = store.calculatePayoutEligibility('evt-002');
  assert(elig !== null, 'Elegibilidade deve ser calculada');
  assert.equal(elig.progressPercent, 41.7, 'Progresso deve ser 41.7%');
  assert.equal(elig.minSalesPercent, 50, 'Gatilho mínimo deve ser 50%');
  assert.equal(elig.ruleMet, false, 'Gatilho da regra padrão não deve estar atingido');
  // Meta de 50% = 300.000; Vendas = 250.000 -> Faltam 50.000
  assert.equal(elig.faltamVendas, 50000, 'Faltam exatamente R$ 50.000 em vendas');
  assert.equal(elig.limiteBruto, 0, 'Limite bruto na regra padrão deve ser 0 quando < 50%');
  assert.equal(elig.status, 'BLOQUEADO', 'Status deve ser BLOQUEADO');
  assert.equal(elig.disponivelFinal, 0, 'Disponível final deve ser 0');
});

// 2. Evento com vendas >= 50% liberando 20%
test('Evento com vendas >= 50% habilita repasse e calcula limite bruto de 20%', () => {
  const store = new CoreFinanceiroStore();
  // evt-inverno: Meta R$ 1.000.000, Vendas R$ 520.000 (52%)
  const elig = store.calculatePayoutEligibility('evt-inverno');
  assert(elig !== null, 'Elegibilidade do Festival de Inverno deve existir');
  assert.equal(elig.progressPercent, 52, 'Progresso deve ser 52%');
  assert.equal(elig.ruleMet, true, 'Regra mínima de 50% deve estar atingida');
  assert.equal(elig.faltamVendas, 0, 'Faltam vendas deve ser 0');
  // 20% de 520.000 = 104.000
  assert.equal(elig.limiteBruto, 104000, 'Limite bruto deve ser 20% de 520.000 (R$ 104.000)');
});

// 3. Deduções de repasses anteriores e bloqueios
test('Fórmula canônica deduz repasses anteriores e valores bloqueados do limite bruto', () => {
  const store = new CoreFinanceiroStore();
  const elig = store.calculatePayoutEligibility('evt-inverno');
  // evt-inverno: Limite bruto R$ 104.000 - Repasses anteriores R$ 40.000 - Bloqueados R$ 10.000
  // Disponível = 104.000 - 50.000 = 54.000
  assert.equal(elig.previousPayouts, 40000, 'Repasses anteriores deve ser R$ 40.000');
  assert.equal(elig.blockedBalance, 10000, 'Bloqueados deve ser R$ 10.000');
  assert.equal(elig.totalDeductions, 50000, 'Total de deduções deve ser R$ 50.000');
  assert.equal(elig.disponivelFinal, 54000, 'Disponível final canônico deve ser R$ 54.000');
  assert.equal(elig.status, 'HABILITADO', 'Status deve ser HABILITADO');
});

// 4. Sobrescrita hierárquica de política (Geral Disk → Produtor → Evento)
test('Resolução de política obedece hierarquia: Geral Disk -> Produtor -> Evento', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  // Base global
  const globalPol = store.getPayoutPolicy();
  assert.equal(globalPol.minSalesPercent, 50, 'Global deve ter 50%');
  assert.equal(globalPol.releasePercent, 20, 'Global deve ter 20%');

  // Sobrescrita por Produtor (prod-abc)
  store.updatePayoutPolicy({
    scope: 'producer',
    targetId: 'prod-abc',
    policy: { minSalesPercent: 40, releasePercent: 25 }
  });

  const prodPol = store.getPayoutPolicy('prod-abc', 'evt-xyz-99');
  assert.equal(prodPol.minSalesPercent, 40, 'Produtor prod-abc deve receber 40%');
  assert.equal(prodPol.releasePercent, 25, 'Produtor prod-abc deve receber 25%');
  assert.equal(prodPol._appliedScope, 'Produtor', 'Escopo aplicado deve ser Produtor');

  // Outro produtor deve continuar com o global
  const otherProdPol = store.getPayoutPolicy('prod-outro', null);
  assert.equal(otherProdPol.minSalesPercent, 50, 'Outro produtor mantém global de 50%');
  assert.equal(otherProdPol.releasePercent, 20, 'Outro produtor mantém global de 20%');

  // Sobrescrita específica por Evento (evt-001)
  store.updatePayoutPolicy({
    scope: 'event',
    targetId: 'evt-001',
    policy: { minSalesPercent: 30, releasePercent: 15 }
  });

  const eventPol = store.getPayoutPolicy('prod-abc', 'evt-001');
  assert.equal(eventPol.minSalesPercent, 30, 'Evento específico prevalece com 30%');
  assert.equal(eventPol.releasePercent, 15, 'Evento específico prevalece com 15%');
  assert.equal(eventPol._appliedScope, 'Evento', 'Escopo aplicado deve ser Evento');
});

// 5. Autorização Excepcional (A Trava Humana)
test('Autorização Excepcional exige justificativa >= 5 chars e perfil Disk (SoD)', () => {
  const store = new CoreFinanceiroStore();

  // Teste 5.1: Produtor tentando emitir autorização excepcional é bloqueado
  store.login('producer', 'prod-abc');

  const blockedRes = store.authorizeExceptionalPayout({
    eventId: 'evt-002',
    amount: 30000,
    reason: 'Justificativa do produtor'
  });
  assert.equal(blockedRes, null, 'Produtor não pode emitir autorização excepcional');
  assert(lastAlert && lastAlert.includes('Apenas a mesa do Financeiro Disk'), 'Deve emitir alerta de bloqueio de permissão');

  // Teste 5.2: Disk tentando emitir sem justificativa válida (< 5 chars)
  store.login('disk');
  const invalidReasonRes = store.authorizeExceptionalPayout({
    eventId: 'evt-002',
    amount: 30000,
    reason: 'abc' // menos de 5 chars
  });
  assert.equal(invalidReasonRes, null, 'Justificativa curta deve ser rejeitada');
  assert(lastAlert && lastAlert.includes('no mínimo 5 caracteres'), 'Deve emitir alerta de justificativa obrigatória');

  // Teste 5.3: Emissão válida com justificativa formal
  // Limpa exceções anteriores de evt-002
  store.data.exceptionalAuthorizations = (store.data.exceptionalAuthorizations || []).filter(a => a.eventId !== 'evt-002');

  const validAuth = store.authorizeExceptionalPayout({
    eventId: 'evt-002',
    amount: 35000,
    reason: 'Adiantamento emergencial de infraestrutura de som e luz aprovado pela diretoria'
  });
  assert(validAuth !== null, 'Autorização excepcional válida deve ser criada');
  assert.equal(validAuth.amount, 35000, 'Valor autorizado deve ser R$ 35.000');
  assert.equal(validAuth.status, 'ATIVA', 'Status deve ser ATIVA');
  assert.equal(validAuth.consumed, false, 'Não deve estar consumida');

  // Verifica que o evento agora tem elegibilidade excepcional
  const eligExcep = store.calculatePayoutEligibility('evt-002');
  assert.equal(eligExcep.isExceptional, true, 'Evento deve estar sob exceção');
  assert.equal(eligExcep.status, 'EXCECAO_AUTORIZADA', 'Status deve ser EXCECAO_AUTORIZADA');
  assert.equal(eligExcep.disponivelFinal, 35000, 'Disponível final deve refletir a exceção autorizada');
});

// 6. Consumo único da autorização excepcional
test('Autorização Excepcional é consumida atomicamente na solicitação de repasse', () => {
  const store = new CoreFinanceiroStore();
  store.login('disk');

  // Limpa autorizações ativas prévias de evt-002 para teste isolado
  store.data.exceptionalAuthorizations = (store.data.exceptionalAuthorizations || []).filter(a => a.eventId !== 'evt-002');

  // Emite nova autorização
  const auth = store.authorizeExceptionalPayout({
    eventId: 'evt-002',
    amount: 25000,
    reason: 'Liberação de capital de giro pré-evento homologada'
  });
  assert(auth !== null);

  // Produtor efetua a solicitação de repasse para evt-002
  store.login('producer', 'prod-abc');
  const event = store.data.events.find(e => e.id === 'evt-002');
  const producer = store.data.producers.find(p => p.id === event.producerId);
  const bank = producer.bankAccounts[0];

  const payout = store.requestPayout({
    eventId: event.id,
    amount: 25000,
    bankAccountId: bank.id
  });

  assert(payout !== null, 'Solicitação com exceção ativa deve ser aprovada para criação');
  assert.equal(payout.exceptionalAuthorizationId, auth.id, 'Deve referenciar o ID da autorização');

  // A autorização deve estar consumida
  assert.equal(auth.consumed, true, 'Autorização deve ter sido consumida');
  assert.equal(auth.payoutId, payout.id, 'Autorização deve estar atrelada ao payoutId');

  // No próximo cálculo, como a autorização foi consumida, o evento volta a ser bloqueado
  const nextElig = store.calculatePayoutEligibility('evt-002');
  assert.equal(nextElig.isExceptional, false, 'Não deve mais estar sob exceção ativa');
  assert.equal(nextElig.status, 'BLOQUEADO', 'Evento deve retornar ao status BLOQUEADO');
  assert.equal(nextElig.disponivelFinal, 0, 'Disponível final deve voltar a 0');
});

// 7. Trava de limite máximo na submissão de solicitação
test('Solicitação de valor acima do disponível calculado pelo motor é bloqueada', () => {
  const store = new CoreFinanceiroStore();
  store.login('producer', 'prod-abc');

  // evt-inverno: disponível é 54.000
  const event = store.data.events.find(e => e.id === 'evt-inverno');
  const producer = store.data.producers.find(p => p.id === event.producerId);
  const bank = producer.bankAccounts[0];

  // Tentativa de solicitar R$ 54.001
  const exceededPayout = store.requestPayout({
    eventId: event.id,
    amount: 54001,
    bankAccountId: bank.id
  });
  assert.equal(exceededPayout, null, 'Solicitação acima do disponível deve ser nula');
  assert(lastAlert && lastAlert.includes('excede o limite disponível para repasse'), 'Deve disparar alerta de limite excedido');

  // Solicitação no limite exato de R$ 54.000
  const exactPayout = store.requestPayout({
    eventId: event.id,
    amount: 54000,
    bankAccountId: bank.id
  });
  assert(exactPayout !== null, 'Solicitação no valor de R$ 54.000 deve ser aceita');
  assert.equal(exactPayout.requestedAmount, 54000, 'Valor solicitado gravado deve ser 54000');
});

console.log(`\nTodos os ${passed} testes do Motor de Elegibilidade de Repasses passaram com sucesso!`);
