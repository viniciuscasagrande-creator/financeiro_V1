import express from "express";
import cors from "cors";
import { state, calculateAccount, addLedgerEntry } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// CONTA FINANCEIRA DO PRODUTOR (CNPJ) & LEDGER
// ============================================================================

app.get("/api/health", (_, res) => {
  res.json({ ok: true, module: "conta-financeira-produtor", version: "0.2" });
});

app.get("/api/conta", (_, res) => {
  res.json(calculateAccount());
});

app.get("/api/ledger", (req, res) => {
  const { eventId, type } = req.query;
  let entries = state.ledger;
  if (eventId) entries = entries.filter(l => l.eventId === eventId);
  if (type) entries = entries.filter(l => l.type === type);
  res.json(entries);
});

app.get("/api/politica", (_, res) => {
  res.json(state.policy);
});

app.put("/api/politica", (req, res) => {
  state.policy = {
    ...state.policy,
    ...req.body,
    updatedAt: new Date().toISOString(),
    updatedBy: req.body.updatedBy || "Diretoria Financeira Disk"
  };
  res.json(state.policy);
});

// ============================================================================
// BLOQUEIOS, RETENÇÕES E LIBERAÇÕES (A TRAVA HUMANA & AUDITORIA)
// ============================================================================

app.post("/api/bloqueios", (req, res) => {
  const { eventId, value, reason, type = "BLOQUEIO", actor } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Identificador do evento é obrigatório." });
  }

  const numericValue = Number(value);
  if (!numericValue || numericValue <= 0) {
    return res.status(400).json({ error: "Valor do bloqueio/retenção deve ser maior que zero." });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: "Justificativa formal obrigatória com no mínimo 5 caracteres." });
  }

  const entry = addLedgerEntry({
    eventId,
    type: type === "RETENCAO" ? "RETENCAO" : "BLOQUEIO",
    value: numericValue,
    reason: reason.trim(),
    actor: actor || "Financeiro Disk"
  });

  res.status(201).json({
    message: `${type === 'RETENCAO' ? 'Retenção' : 'Bloqueio'} registrado no ledger com sucesso.`,
    entry,
    account: calculateAccount()
  });
});

app.post("/api/liberacoes", (req, res) => {
  const { eventId, value, reason, actor } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Identificador do evento é obrigatório." });
  }

  const numericValue = Number(value);
  if (!numericValue || numericValue <= 0) {
    return res.status(400).json({ error: "Valor de liberação deve ser maior que zero." });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: "Justificativa formal de liberação com no mínimo 5 caracteres é obrigatória." });
  }

  // Verifica se o valor a liberar não excede o saldo bloqueado ativo do evento
  const account = calculateAccount();
  const event = account.events.find(e => e.id === eventId);
  if (!event || numericValue > event.blocked) {
    return res.status(422).json({
      error: `Valor solicitado para liberação (R$ ${numericValue.toFixed(2)}) excede o saldo atualmente bloqueado do evento (R$ ${event ? event.blocked.toFixed(2) : 0}).`
    });
  }

  const entry = addLedgerEntry({
    eventId,
    type: "LIBERACAO",
    value: numericValue,
    reason: reason.trim(),
    actor: actor || "Financeiro Disk"
  });

  res.status(201).json({
    message: "Liberação de saldo registrada com sucesso no ledger.",
    entry,
    account: calculateAccount()
  });
});

// ============================================================================
// CRÉDITOS E ANTECIPAÇÕES AO PRODUTOR
// ============================================================================

app.get("/api/creditos", (_, res) => {
  res.json(state.credits);
});

app.post("/api/creditos", (req, res) => {
  const {
    eventId,
    principal,
    interestRate = 2.0,
    installments = 5,
    amortization = "PARCELAS_FIXAS",
    receivablePercent = 15.0,
    notes,
    actor
  } = req.body;

  const ev = state.events.find(e => e.id === eventId);
  if (!ev) {
    return res.status(404).json({ error: "Evento vinculado não encontrado." });
  }

  const numPrincipal = Number(principal);
  if (!numPrincipal || numPrincipal <= 0) {
    return res.status(400).json({ error: "Valor principal do crédito deve ser maior que zero." });
  }

  const numInterest = Number(interestRate || 0);
  const numInstallments = Math.max(1, Number(installments || 1));
  const numReceivablePercent = Number(receivablePercent || 0);

  // Cálculo de juros simples / taxa total contratual
  const totalDebt = numPrincipal * (1 + (numInterest * numInstallments) / 100);
  const installmentValue = totalDebt / numInstallments;

  const creditId = `CR-${Date.now()}`;
  const protocol = `CR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const creditContract = {
    id: creditId,
    protocol,
    producerId: state.producer.id,
    eventId: ev.id,
    eventName: ev.name,
    principal: numPrincipal,
    interestRate: numInterest,
    installmentsCount: numInstallments,
    installmentValue: Math.round(installmentValue * 100) / 100,
    amortizationModel: amortization, // 'PARCELAS_FIXAS' | 'PERCENTUAL_RECEBIVEIS' | 'FECHAMENTO_EVENTO'
    receivablePercent: numReceivablePercent,
    totalDebt: Math.round(totalDebt * 100) / 100,
    outstandingDebt: Math.round(totalDebt * 100) / 100,
    amortizedTotal: 0,
    status: "ATIVO",
    grantedAt: new Date().toISOString(),
    grantedBy: actor || "Karine (Financeiro Disk)",
    notes: (notes || "Concessão de crédito ao produtor aprovada pela diretoria").trim(),
    amortizationHistory: []
  };

  state.credits.unshift(creditContract);

  // Lançamento obrigatório no Ledger (Crédito Concedido)
  addLedgerEntry({
    eventId: ev.id,
    type: "CREDITO_CONCEDIDO",
    value: numPrincipal,
    reason: `Concessão de crédito contratual ${protocol}. Total c/ juros: R$ ${totalDebt.toFixed(2)}. ${creditContract.notes}`,
    actor: creditContract.grantedBy
  });

  res.status(201).json({
    message: `Crédito ${protocol} concedido com sucesso.`,
    credit: creditContract,
    account: calculateAccount()
  });
});

app.post("/api/creditos/:id/amortizar", (req, res) => {
  const credit = state.credits.find(c => c.id === req.params.id || c.protocol === req.params.id);
  if (!credit) {
    return res.status(404).json({ error: "Contrato de crédito não encontrado." });
  }

  if (credit.status !== "ATIVO") {
    return res.status(422).json({ error: "Este contrato de crédito já se encontra liquidado." });
  }

  const numValue = Number(req.body.value || credit.installmentValue || 0);
  if (numValue <= 0) {
    return res.status(400).json({ error: "Valor de amortização deve ser maior que zero." });
  }

  const amortizedValue = Math.min(numValue, credit.outstandingDebt);
  credit.outstandingDebt = Math.round((credit.outstandingDebt - amortizedValue) * 100) / 100;
  credit.amortizedTotal = Math.round((credit.amortizedTotal + amortizedValue) * 100) / 100;

  if (credit.outstandingDebt <= 0) {
    credit.status = "LIQUIDADO";
    credit.liquidatedAt = new Date().toISOString();
  }

  const historyItem = {
    id: `AM-${Date.now()}`,
    date: new Date().toLocaleString("pt-BR"),
    value: amortizedValue,
    type: req.body.type || "AMORTIZACAO_PARCELA",
    balanceAfter: credit.outstandingDebt,
    actor: req.body.actor || "Motor Financeiro Automático"
  };

  credit.amortizationHistory.unshift(historyItem);

  // Lança amortização no Ledger
  addLedgerEntry({
    eventId: credit.eventId,
    type: "AMORTIZACAO_CREDITO",
    value: amortizedValue,
    reason: `Amortização de R$ ${amortizedValue.toFixed(2)} referente ao crédito ${credit.protocol}. Saldo devedor: R$ ${credit.outstandingDebt.toFixed(2)}.`,
    actor: historyItem.actor
  });

  res.json({
    message: `Amortização de R$ ${amortizedValue.toFixed(2)} realizada com sucesso.`,
    credit,
    account: calculateAccount()
  });
});

// SIMULAÇÃO DE VENDA & AMORTIZAÇÃO AUTOMÁTICA PELA RECEITA (15% etc.)
app.post("/api/creditos/simular-venda", (req, res) => {
  const { eventId, grossSaleAmount } = req.body;
  const ev = state.events.find(e => e.id === eventId);
  if (!ev) return res.status(404).json({ error: "Evento não encontrado." });

  const sale = Number(grossSaleAmount || 20000);
  ev.sold += sale;
  ev.grossSales += sale;
  ev.netRevenue += (sale * 0.9); // 10% taxas

  // Verifica se há créditos vinculados a este evento com modelo PERCENTUAL_RECEBIVEIS
  const activeCredits = state.credits.filter(c => c.eventId === ev.id && c.status === "ATIVO" && c.amortizationModel === "PERCENTUAL_RECEBIVEIS");

  let totalAmortized = 0;
  for (const credit of activeCredits) {
    const deduction = Math.min(credit.outstandingDebt, (sale * 0.9) * (credit.receivablePercent / 100));
    if (deduction > 0) {
      credit.outstandingDebt = Math.round((credit.outstandingDebt - deduction) * 100) / 100;
      credit.amortizedTotal = Math.round((credit.amortizedTotal + deduction) * 100) / 100;
      totalAmortized += deduction;

      if (credit.outstandingDebt <= 0) {
        credit.status = "LIQUIDADO";
        credit.liquidatedAt = new Date().toISOString();
      }

      credit.amortizationHistory.unshift({
        id: `AM-${Date.now()}`,
        date: new Date().toLocaleString("pt-BR"),
        value: deduction,
        type: "RETENCAO_RECEIVABLE_AUTOMATICA",
        balanceAfter: credit.outstandingDebt,
        actor: "Motor Automático de Bilheteria"
      });

      addLedgerEntry({
        eventId: ev.id,
        type: "AMORTIZACAO_CREDITO",
        value: deduction,
        reason: `Amortização automática de ${credit.receivablePercent}% sobre nova bilheteria de R$ ${sale.toFixed(2)}.`,
        actor: "Motor Automático de Bilheteria"
      });
    }
  }

  res.json({
    message: `Venda de R$ ${sale.toFixed(2)} processada. Amortização automática: R$ ${totalAmortized.toFixed(2)}.`,
    event: ev,
    account: calculateAccount()
  });
});

// ============================================================================
// ESTEIRA DE REPASSES (INTEGRADA COM A CONTA FINANCEIRA)
// ============================================================================

app.get("/api/repasses/elegibilidade/:eventId", (req, res) => {
  const account = calculateAccount();
  const ev = account.events.find(e => e.id === req.params.eventId);
  if (!ev) return res.status(404).json({ error: "Evento não encontrado." });
  res.json(ev.eligibility);
});

app.get("/api/repasses/solicitacoes", (_, res) => {
  res.json(state.requests);
});

app.post("/api/repasses/solicitacoes", (req, res) => {
  const { eventId, value, applicant } = req.body;
  const account = calculateAccount();
  const ev = account.events.find(e => e.id === eventId);
  if (!ev) return res.status(404).json({ error: "Evento não encontrado." });

  const numValue = Number(value);
  if (!numValue || numValue <= 0) {
    return res.status(400).json({ error: "Valor solicitado deve ser maior que zero." });
  }

  if (!ev.eligibility.ruleMet && !req.body.exceptionAuthorization) {
    return res.status(422).json({
      error: `Evento ainda não atingiu ${state.policy.minimumSalesPercent}% da meta de vendas. Faltam R$ ${ev.eligibility.faltamVendas.toFixed(2)} em vendas para liberar o primeiro repasse.`
    });
  }

  if (numValue > ev.eligibility.availableToRequest && !req.body.exceptionAuthorization) {
    return res.status(422).json({
      error: `Valor solicitado (R$ ${numValue.toFixed(2)}) excede o disponível para repasse na conta financeira (R$ ${ev.eligibility.availableToRequest.toFixed(2)}).`
    });
  }

  const reqId = `RP-${Date.now()}`;
  const protocol = `REP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newRequest = {
    id: reqId,
    protocol,
    eventId: ev.id,
    eventName: ev.name,
    value: numValue,
    status: "EM_ANALISE",
    applicant: applicant || `${state.producer.name} (Produtor)`,
    createdAt: new Date().toISOString(),
    signatures: {
      producer: { signed: false, signedBy: null },
      disk: { signed: false, signedBy: null }
    },
    approval: { approved: false, approvedBy: null },
    liquidation: { liquidated: false }
  };

  state.requests.unshift(newRequest);

  res.status(201).json({
    message: `Solicitação ${protocol} criada com sucesso e enviada para a mesa do Financeiro Disk.`,
    request: newRequest
  });
});

app.post("/api/repasses/solicitacoes/:id/aprovar", (req, res) => {
  const r = state.requests.find(x => x.id === req.params.id || x.protocol === req.params.id);
  if (!r) return res.status(404).json({ error: "Solicitação não encontrada." });

  if (r.status !== "EM_ANALISE") {
    return res.status(422).json({ error: `Solicitação não pode ser aprovada no status atual: ${r.status}` });
  }

  r.status = "AGUARDANDO_ASSINATURA_PRODUTOR";
  r.approval = {
    approved: true,
    approvedBy: req.body.approver || "Karine (Adm Financeiro)",
    approvedAt: new Date().toISOString()
  };

  res.json({ message: "Solicitação aprovada. Aguardando assinatura digital do produtor.", request: r });
});

app.post("/api/repasses/solicitacoes/:id/reprovar", (req, res) => {
  const r = state.requests.find(x => x.id === req.params.id || x.protocol === req.params.id);
  if (!r) return res.status(404).json({ error: "Solicitação não encontrada." });

  const { reason, rejectedBy } = req.body;
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: "Motivo formal de reprovação obrigatório com no mínimo 5 caracteres." });
  }

  r.status = "REPROVADO";
  r.approval = {
    approved: false,
    reason: reason.trim(),
    rejectedBy: rejectedBy || "Financeiro Disk",
    rejectedAt: new Date().toISOString()
  };

  res.json({ message: `Solicitação ${r.protocol} reprovada.`, request: r });
});

app.post("/api/repasses/solicitacoes/:id/assinar", (req, res) => {
  const r = state.requests.find(x => x.id === req.params.id || x.protocol === req.params.id);
  if (!r) return res.status(404).json({ error: "Solicitação não encontrada." });

  const { role, signer } = req.body; // 'PRODUTOR' | 'DISK'

  if (role === "PRODUTOR") {
    if (r.status !== "AGUARDANDO_ASSINATURA_PRODUTOR") {
      return res.status(422).json({ error: `Solicitação não está na etapa de assinatura do produtor (status: ${r.status}).` });
    }
    r.signatures.producer = {
      signed: true,
      signedBy: signer || "João Silva (Produtor)",
      signedAt: new Date().toISOString()
    };
    r.status = "AGUARDANDO_ASSINATURA_DISK";
    return res.json({ message: "Assinatura do Produtor registrada.", request: r });
  }

  if (role === "DISK") {
    if (!r.signatures.producer.signed) {
      return res.status(422).json({ error: "Violação de Governança: a Disk Ingressos não pode assinar antes do Produtor." });
    }
    if (r.status !== "AGUARDANDO_ASSINATURA_DISK") {
      return res.status(422).json({ error: `Solicitação não está na etapa de assinatura Disk (status: ${r.status}).` });
    }
    r.signatures.disk = {
      signed: true,
      signedBy: signer || "Karine (Financeiro Disk)",
      signedAt: new Date().toISOString()
    };
    r.status = "PRONTO_LIQUIDACAO";
    return res.json({ message: "Assinatura Disk registrada. Operação pronta para pagamento.", request: r });
  }

  res.status(400).json({ error: "Role de assinatura inválida. Utilize 'PRODUTOR' ou 'DISK'." });
});

app.post("/api/repasses/solicitacoes/:id/liquidar", (req, res) => {
  const r = state.requests.find(x => x.id === req.params.id || x.protocol === req.params.id);
  if (!r) return res.status(404).json({ error: "Solicitação não encontrada." });

  if (r.status === "LIQUIDADO") {
    return res.status(422).json({ error: "Idempotência: este repasse já foi liquidado." });
  }

  if (r.status !== "PRONTO_LIQUIDACAO") {
    return res.status(422).json({ error: `Repasse não está pronto para liquidação (status: ${r.status}).` });
  }

  const { executor = "Carlos (Tesouraria Disk)", method = "PIX" } = req.body;

  // SoD: quem aprovou não pode liquidar
  if (r.approval.approvedBy && r.approval.approvedBy.toLowerCase() === executor.toLowerCase()) {
    return res.status(403).json({ error: "Segregação de Funções: quem aprovou não pode liquidar a mesma operação." });
  }

  const voucher = `COMP-PIX-${Date.now()}`;
  r.status = "LIQUIDADO";
  r.liquidation = {
    liquidated: true,
    liquidatedBy: executor,
    liquidatedAt: new Date().toISOString(),
    method,
    voucher
  };

  // Registra no Ledger como REPASSE
  addLedgerEntry({
    eventId: r.eventId,
    type: "REPASSE",
    value: r.value,
    reason: `Liquidação bancária via ${method} (${voucher}) para ${r.protocol}.`,
    actor: executor
  });

  res.json({
    message: `Repasse ${r.protocol} de R$ ${r.value.toFixed(2)} liquidado via ${method}.`,
    voucher,
    request: r,
    account: calculateAccount()
  });
});

// ============================================================================
// DASHBOARD GERAL CONSOLIDADO
// ============================================================================

app.get("/api/dashboard", (_, res) => {
  res.json({
    ...calculateAccount(),
    credits: state.credits,
    requests: state.requests,
    policy: state.policy
  });
});

const PORT = process.env.PORT || 3333;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Conta Financeira do Produtor API em http://localhost:${PORT}`);
  });
}

export { app };