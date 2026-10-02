/**
 * Store Central da Conta Financeira do Produtor — Homologação PDT Novo
 * Vinculada ao CNPJ do produtor com segregação por evento e ledger imutável.
 * Invariante contábil: Saldo anterior + créditos - débitos = saldo atual.
 */

export const state = {
  producer: {
    id: "PROD-001",
    name: "Produtora Alpha Brasil Ltda.",
    cnpj: "14.829.301/0001-92",
    email: "financeiro@alphabrasil.com.br",
    manager: "Karine Mendes (Financeiro Disk)"
  },

  policy: {
    minimumSalesPercent: 50,
    releasePercent: 20,
    considerBlocks: true,
    considerCreditAmortization: true,
    requireApproval: true,
    requireSignature: true,
    allowAdministrativeException: true,
    updatedAt: "2026-10-02T10:00:00Z",
    updatedBy: "Diretoria Financeira Disk"
  },

  events: [
    {
      id: "EV-001",
      name: "Festival de Homologação 2026",
      salesTarget: 1000000.00,
      sold: 540000.00,
      grossSales: 540000.00,
      netRevenue: 486000.00,
      date: "15/11/2026"
    },
    {
      id: "EV-002",
      name: "Show de Outono Curitiba",
      salesTarget: 800000.00,
      sold: 240000.00,
      grossSales: 240000.00,
      netRevenue: 216000.00,
      date: "28/11/2026"
    },
    {
      id: "EV-003",
      name: "Arena Eletrônica Fest",
      salesTarget: 2000000.00,
      sold: 1500000.00,
      grossSales: 1500000.00,
      netRevenue: 1350000.00,
      date: "12/12/2026"
    }
  ],

  ledger: [
    {
      id: "L-001",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      type: "CREDITO_CONCEDIDO",
      value: 100000.00,
      balanceAfter: 100000.00,
      reason: "Concessão de crédito pré-evento para custeio de infraestrutura de som e luz",
      actor: "Karine (Financeiro Disk)",
      createdAt: "2026-09-20T10:00:00Z"
    },
    {
      id: "L-002",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      type: "AMORTIZACAO_CREDITO",
      value: 22000.00,
      balanceAfter: 78000.00,
      reason: "Amortização da 1ª parcela de crédito retida da bilheteria líquida",
      actor: "Motor de Conciliação Automática",
      createdAt: "2026-09-30T14:30:00Z"
    },
    {
      id: "L-003",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      type: "BLOQUEIO",
      value: 15000.00,
      balanceAfter: 63000.00,
      reason: "Reserva técnica operacional para monitoramento de chargeback preventivo",
      actor: "Mesa de Risco Disk",
      createdAt: "2026-10-01T12:00:00Z"
    },
    {
      id: "L-004",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      type: "REPASSE",
      value: 20000.00,
      balanceAfter: 43000.00,
      reason: "Repasse ordinário liberado conforme protocolo REP-2026-00041",
      actor: "Carlos (Tesouraria Disk)",
      createdAt: "2026-09-25T16:00:00Z"
    }
  ],

  credits: [
    {
      id: "CR-2026-001",
      protocol: "CR-2026-0001",
      producerId: "PROD-001",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      principal: 100000.00,
      interestRate: 2.0, // 2% a.m.
      installmentsCount: 5,
      installmentValue: 22000.00,
      amortizationModel: "PARCELAS_FIXAS", // "PARCELAS_FIXAS" | "PERCENTUAL_RECEBIVEIS" | "FECHAMENTO_EVENTO"
      receivablePercent: 15.0,
      totalDebt: 110000.00,
      outstandingDebt: 88000.00,
      amortizedTotal: 22000.00,
      status: "ATIVO",
      grantedAt: "2026-09-20T10:00:00Z",
      grantedBy: "Karine (Financeiro Disk)",
      notes: "Adiantamento para contratação de headliners e montagem de palco",
      amortizationHistory: [
        {
          id: "AM-1",
          date: "2026-09-30 14:30",
          value: 22000.00,
          type: "PARCELA_FIXA",
          balanceAfter: 88000.00,
          actor: "Motor de Conciliação Automática"
        }
      ]
    }
  ],

  requests: [
    {
      id: "RP-2026-00089",
      protocol: "REP-2026-00089",
      eventId: "EV-001",
      eventName: "Festival de Homologação 2026",
      value: 30000.00,
      status: "PRONTO_LIQUIDACAO",
      applicant: "João Silva (Produtor)",
      createdAt: "2026-10-01T10:20:00Z",
      signatures: {
        producer: { signed: true, signedBy: "João Silva (Produtor)", signedAt: "2026-10-01T11:00:00Z" },
        disk: { signed: true, signedBy: "Karine (Financeiro Disk)", signedAt: "2026-10-01T11:30:00Z" }
      },
      approval: { approved: true, approvedBy: "Karine (Adm Financeiro)", approvedAt: "2026-10-01T10:45:00Z" },
      liquidation: { liquidated: false }
    }
  ]
};

export function addLedgerEntry({ eventId, type, value, reason, actor }) {
  const ev = state.events.find(e => e.id === eventId);
  const numericValue = Number(value);

  // Calcula saldo acumulado após este lançamento
  const previousEntries = state.ledger.filter(l => l.eventId === eventId);
  const previousNetBalance = previousEntries.reduce((acc, curr) => {
    if (curr.type === 'CREDITO_CONCEDIDO' || curr.type === 'LIBERACAO' || curr.type === 'VENDA_RECEITA') {
      return acc + curr.value;
    }
    if (curr.type === 'AMORTIZACAO_CREDITO' || curr.type === 'BLOQUEIO' || curr.type === 'RETENCAO' || curr.type === 'REPASSE') {
      return acc - curr.value;
    }
    return acc;
  }, 0);

  let newBalance = previousNetBalance;
  if (type === 'CREDITO_CONCEDIDO' || type === 'LIBERACAO' || type === 'VENDA_RECEITA') {
    newBalance += numericValue;
  } else {
    newBalance -= numericValue;
  }

  const entry = {
    id: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId,
    eventName: ev ? ev.name : "Evento Geral",
    producerId: state.producer.id,
    type, // 'BLOQUEIO' | 'RETENCAO' | 'LIBERACAO' | 'CREDITO_CONCEDIDO' | 'AMORTIZACAO_CREDITO' | 'REPASSE'
    value: numericValue,
    balanceAfter: Math.round(newBalance * 100) / 100,
    reason: (reason || "").trim(),
    actor: actor || "Financeiro Disk",
    createdAt: new Date().toISOString()
  };

  state.ledger.unshift(entry);
  return entry;
}

export function calculateAccount() {
  const eventsCalculated = state.events.map(event => {
    const entries = state.ledger.filter(l => l.eventId === event.id);

    // Bloqueios ativos: soma de BLOQUEIO + RETENCAO - LIBERACAO
    const blockedSum = entries
      .filter(l => l.type === "BLOQUEIO" || l.type === "RETENCAO")
      .reduce((acc, l) => acc + l.value, 0);

    const releasedSum = entries
      .filter(l => l.type === "LIBERACAO")
      .reduce((acc, l) => acc + l.value, 0);

    const activeBlocked = Math.max(0, blockedSum - releasedSum);

    // Repasses já realizados
    const paidSum = entries
      .filter(l => l.type === "REPASSE")
      .reduce((acc, l) => acc + l.value, 0);

    // Créditos concedidos e amortizações
    const creditsForEvent = state.credits.filter(c => c.eventId === event.id && c.status === "ATIVO");
    const outstandingDebtForEvent = creditsForEvent.reduce((acc, c) => acc + c.outstandingDebt, 0);

    // Amortização pendente estimada (próxima parcela ou percentual sobre a receita)
    let amortizationHold = 0;
    for (const c of creditsForEvent) {
      if (c.amortizationModel === "PARCELAS_FIXAS") {
        amortizationHold += Math.min(c.outstandingDebt, c.installmentValue || 0);
      } else if (c.amortizationModel === "PERCENTUAL_RECEBIVEIS") {
        const percentAmount = (event.sold * (c.receivablePercent / 100));
        amortizationHold += Math.min(c.outstandingDebt, percentAmount);
      }
    }

    // Regra canônica de elegibilidade de repasse (50% vendas -> 20% liberação)
    const salesPercent = event.salesTarget > 0 ? (event.sold / event.salesTarget) * 100 : 0;
    const ruleMet = salesPercent >= state.policy.minimumSalesPercent;
    const faltamVendas = ruleMet ? 0 : Math.max(0, (event.salesTarget * (state.policy.minimumSalesPercent / 100)) - event.sold);

    const grossLimit = ruleMet ? event.sold * (state.policy.releasePercent / 100) : 0;

    // Disponível para solicitar:
    // Limite bruto - repasses já realizados - bloqueios/retenções - retenção de amortização de crédito
    const deductions = paidSum + activeBlocked + (state.policy.considerCreditAmortization ? amortizationHold : 0);
    const availableToRequest = Math.max(0, grossLimit - deductions);

    return {
      ...event,
      salesPercent: Math.round(salesPercent * 10) / 10,
      blocked: activeBlocked,
      paid: paidSum,
      outstandingDebt: outstandingDebtForEvent,
      amortizationHold,
      eligibility: {
        ruleMet,
        salesPercent: Math.round(salesPercent * 10) / 10,
        minimumSalesPercent: state.policy.minimumSalesPercent,
        releasePercent: state.policy.releasePercent,
        faltamVendas: Math.round(faltamVendas * 100) / 100,
        grossLimit: Math.round(grossLimit * 100) / 100,
        paid: paidSum,
        blocked: activeBlocked,
        amortizationHold,
        availableToRequest: Math.round(availableToRequest * 100) / 100
      }
    };
  });

  // Consolidação por CNPJ
  const totalSold = eventsCalculated.reduce((acc, e) => acc + e.sold, 0);
  const totalPaid = eventsCalculated.reduce((acc, e) => acc + e.paid, 0);
  const totalBlocked = eventsCalculated.reduce((acc, e) => acc + e.blocked, 0);
  const totalOutstandingCredits = state.credits
    .filter(c => c.status === "ATIVO")
    .reduce((acc, c) => acc + c.outstandingDebt, 0);

  const totalAvailableForRepasse = eventsCalculated.reduce(
    (acc, e) => acc + e.eligibility.availableToRequest,
    0
  );

  // Saldo financeiro consolidado:
  // Saldo Consolidado = Vendas - Repasses Realizados
  const consolidatedBalance = Math.max(0, totalSold - totalPaid);
  const futurePending = Math.max(0, consolidatedBalance - totalAvailableForRepasse - totalBlocked);

  return {
    producer: state.producer,
    summary: {
      consolidatedBalance: Math.round(consolidatedBalance * 100) / 100,
      availableForRepasse: Math.round(totalAvailableForRepasse * 100) / 100,
      futurePending: Math.round(futurePending * 100) / 100,
      blocked: Math.round(totalBlocked * 100) / 100,
      retained: 0,
      outstandingCredits: Math.round(totalOutstandingCredits * 100) / 100,
      totalSold: Math.round(totalSold * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100
    },
    events: eventsCalculated
  };
}