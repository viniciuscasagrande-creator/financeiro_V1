import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  WalletCards,
  LockKeyhole,
  Landmark,
  ArrowDownToLine,
  Settings2,
  FileClock,
  PlusCircle,
  FileSignature,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  Percent,
  RefreshCw,
  Coins
} from "lucide-react";
import "./style.css";

const API = "http://localhost:3333/api";
const money = n => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function App() {
  const [tab, setTab] = useState("conta"); // 'conta' | 'creditos' | 'bloqueios' | 'ledger' | 'repasses' | 'politica'
  const [role, setRole] = useState("FINANCEIRO"); // 'PRODUTOR' | 'FINANCEIRO'

  // Dados reativos com fallback para rodar de forma 100% autônoma
  const [data, setData] = useState({
    producer: {
      id: "PROD-001",
      name: "Produtora Alpha Brasil Ltda.",
      cnpj: "14.829.301/0001-92",
      email: "financeiro@alphabrasil.com.br"
    },
    summary: {
      consolidatedBalance: 680000.0,
      availableForRepasse: 310000.0,
      futurePending: 250000.0,
      blocked: 70000.0,
      retained: 50000.0,
      outstandingCredits: 120000.0,
      totalSold: 890000.0,
      totalPaid: 210000.0
    },
    events: [
      {
        id: "EV-001",
        name: "Festival Curitiba 2026",
        salesTarget: 1000000.0,
        sold: 540000.0,
        salesPercent: 54.0,
        blocked: 40000.0,
        paid: 90000.0,
        outstandingDebt: 70000.0,
        eligibility: {
          ruleMet: true,
          salesPercent: 54.0,
          grossLimit: 108000.0,
          blocked: 40000.0,
          paid: 90000.0,
          availableToRequest: 38000.0
        }
      },
      {
        id: "EV-002",
        name: "Arena Verão 2026",
        salesTarget: 600000.0,
        sold: 210000.0,
        salesPercent: 35.0,
        blocked: 20000.0,
        paid: 0.0,
        outstandingDebt: 50000.0,
        eligibility: {
          ruleMet: false,
          salesPercent: 35.0,
          faltamVendas: 90000.0,
          grossLimit: 0.0,
          blocked: 20000.0,
          paid: 0.0,
          availableToRequest: 0.0
        }
      },
      {
        id: "EV-003",
        name: "Show Especial Teatro",
        salesTarget: 400000.0,
        sold: 140000.0,
        salesPercent: 35.0,
        blocked: 10000.0,
        paid: 0.0,
        outstandingDebt: 0.0,
        eligibility: {
          ruleMet: false,
          salesPercent: 35.0,
          faltamVendas: 60000.0,
          grossLimit: 0.0,
          blocked: 10000.0,
          paid: 0.0,
          availableToRequest: 0.0
        }
      }
    ],
    credits: [
      {
        id: "CR-2026-001",
        protocol: "CR-2026-0001",
        eventId: "EV-001",
        eventName: "Festival Curitiba 2026",
        principal: 100000.0,
        interestRate: 2.0,
        installmentsCount: 5,
        installmentValue: 22000.0,
        amortizationModel: "PARCELAS_FIXAS",
        receivablePercent: 15.0,
        totalDebt: 110000.0,
        outstandingDebt: 70000.0,
        amortizedTotal: 40000.0,
        status: "ATIVO",
        grantedAt: "20/09/2026 10:00",
        grantedBy: "Karine (Financeiro Disk)",
        notes: "Adiantamento para contratação de headliners e montagem de palco",
        amortizationHistory: [
          { id: "AM-1", date: "30/09/2026 14:30", value: 20000.0, type: "PARCELA_FIXA", balanceAfter: 90000.0, actor: "Sistema" },
          { id: "AM-2", date: "01/10/2026 09:15", value: 20000.0, type: "PARCELA_FIXA", balanceAfter: 70000.0, actor: "Sistema" }
        ]
      },
      {
        id: "CR-2026-002",
        protocol: "CR-2026-0002",
        eventId: "EV-002",
        eventName: "Arena Verão 2026",
        principal: 50000.0,
        interestRate: 2.5,
        installmentsCount: 4,
        installmentValue: 13750.0,
        amortizationModel: "PERCENTUAL_RECEBIVEIS",
        receivablePercent: 15.0,
        totalDebt: 55000.0,
        outstandingDebt: 50000.0,
        amortizedTotal: 5000.0,
        status: "ATIVO",
        grantedAt: "28/09/2026 11:00",
        grantedBy: "Karine (Financeiro Disk)",
        notes: "Capital de giro com retenção de 15% das vendas líquidas",
        amortizationHistory: [
          { id: "AM-3", date: "30/09/2026 18:00", value: 5000.0, type: "RETENCAO_RECEIVABLE_AUTOMATICA", balanceAfter: 50000.0, actor: "Motor Bilheteria" }
        ]
      }
    ],
    ledger: [
      { id: "L-001", eventId: "EV-001", eventName: "Festival Curitiba 2026", type: "CREDITO_CONCEDIDO", value: 100000.0, balanceAfter: 100000.0, reason: "Concessão de crédito CR-2026-0001", actor: "Karine (Financeiro Disk)", createdAt: "20/09/2026 10:00" },
      { id: "L-002", eventId: "EV-001", eventName: "Festival Curitiba 2026", type: "AMORTIZACAO_CREDITO", value: 20000.0, balanceAfter: 80000.0, reason: "Amortização parcela CR-2026-0001", actor: "Sistema", createdAt: "30/09/2026 14:30" },
      { id: "L-003", eventId: "EV-001", eventName: "Festival Curitiba 2026", type: "BLOQUEIO", value: 40000.0, balanceAfter: 40000.0, reason: "Reserva operacional preventiva", actor: "Mesa de Risco Disk", createdAt: "01/10/2026 12:00" },
      { id: "L-004", eventId: "EV-002", eventName: "Arena Verão 2026", type: "CREDITO_CONCEDIDO", value: 50000.0, balanceAfter: 50000.0, reason: "Concessão de crédito CR-2026-0002", actor: "Karine (Financeiro Disk)", createdAt: "28/09/2026 11:00" },
      { id: "L-005", eventId: "EV-002", eventName: "Arena Verão 2026", type: "BLOQUEIO", value: 20000.0, balanceAfter: 30000.0, reason: "Retenção cautelar de documentação", actor: "Compliance Disk", createdAt: "29/09/2026 15:00" }
    ],
    requests: [
      {
        id: "RP-2026-00089",
        protocol: "REP-2026-00089",
        eventId: "EV-001",
        eventName: "Festival Curitiba 2026",
        value: 30000.0,
        status: "PRONTO_LIQUIDACAO",
        applicant: "João Silva (Produtor)",
        createdAt: "01/10/2026 10:20",
        signatures: {
          producer: { signed: true, signedBy: "João Silva (Produtor)", signedAt: "01/10/2026 11:00" },
          disk: { signed: true, signedBy: "Karine (Financeiro Disk)", signedAt: "01/10/2026 11:30" }
        },
        approval: { approved: true, approvedBy: "Karine (Adm Financeiro)", approvedAt: "01/10/2026 10:45" },
        liquidation: { liquidated: false }
      }
    ],
    policy: {
      minimumSalesPercent: 50,
      releasePercent: 20,
      considerBlocks: true,
      considerCreditAmortization: true
    }
  });

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Carrega da API local se estiver rodando
  const loadFromApi = async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setData(prev => ({ ...prev, ...json }));
      }
    } catch (_) {
      // Backend não conectado: mantém o store local perfeitamente funcional
    }
  };

  useEffect(() => {
    loadFromApi();
  }, []);

  // Modais State
  const [modalCredito, setModalCredito] = useState(false);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [modalRepasse, setModalRepasse] = useState(false);

  // Form states: Conceder Crédito
  const [creditForm, setCreditForm] = useState({
    eventId: "EV-001",
    principal: "100000",
    interestRate: "2.0",
    installments: "5",
    amortization: "PARCELAS_FIXAS",
    receivablePercent: "15.0",
    notes: "Adiantamento pré-produção de palco e contratação artística"
  });

  // Form states: Bloqueio / Retenção
  const [blockForm, setBlockForm] = useState({
    eventId: "EV-001",
    type: "BLOQUEIO",
    value: "15000",
    reason: "Reserva técnica para cobertura de riscos operacionais"
  });

  // Form states: Repasse
  const [payoutForm, setPayoutForm] = useState({
    eventId: "EV-001",
    value: "38000"
  });

  // Handlers: Conceder Crédito
  const handleGrantCredit = async () => {
    const numPrincipal = parseFloat(creditForm.principal);
    if (!numPrincipal || numPrincipal <= 0) {
      notify("Informe um valor principal válido.", "error");
      return;
    }
    if (!creditForm.notes || creditForm.notes.trim().length < 5) {
      notify("Justificativa formal obrigatória com no mínimo 5 caracteres.", "error");
      return;
    }

    const numInterest = parseFloat(creditForm.interestRate) || 0;
    const numInstallments = parseInt(creditForm.installments) || 1;
    const totalDebt = numPrincipal * (1 + (numInterest * numInstallments) / 100);
    const installmentValue = totalDebt / numInstallments;
    const event = data.events.find(e => e.id === creditForm.eventId);

    const newCredit = {
      id: `CR-${Date.now()}`,
      protocol: `CR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: event.id,
      eventName: event.name,
      principal: numPrincipal,
      interestRate: numInterest,
      installmentsCount: numInstallments,
      installmentValue,
      amortizationModel: creditForm.amortization,
      receivablePercent: parseFloat(creditForm.receivablePercent) || 0,
      totalDebt,
      outstandingDebt: totalDebt,
      amortizedTotal: 0,
      status: "ATIVO",
      grantedAt: new Date().toLocaleString("pt-BR"),
      grantedBy: "Karine (Financeiro Disk)",
      notes: creditForm.notes.trim(),
      amortizationHistory: []
    };

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: event.id,
      eventName: event.name,
      type: "CREDITO_CONCEDIDO",
      value: numPrincipal,
      balanceAfter: (data.summary.consolidatedBalance + numPrincipal),
      reason: `Concessão de crédito ${newCredit.protocol}: ${newCredit.notes}`,
      actor: "Karine (Financeiro Disk)",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      credits: [newCredit, ...prev.credits],
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        outstandingCredits: prev.summary.outstandingCredits + totalDebt
      }
    }));

    setModalCredito(false);
    notify(`Crédito ${newCredit.protocol} de ${money(numPrincipal)} concedido com sucesso!`);
  };

  // Handlers: Amortizar Crédito (Parcela ou Manual)
  const handleAmortizeCredit = (credit, customAmount = null) => {
    const amountToAmortize = customAmount !== null ? customAmount : Math.min(credit.outstandingDebt, credit.installmentValue);
    if (amountToAmortize <= 0) return;

    credit.outstandingDebt = Math.max(0, credit.outstandingDebt - amountToAmortize);
    credit.amortizedTotal += amountToAmortize;
    if (credit.outstandingDebt === 0) credit.status = "LIQUIDADO";

    credit.amortizationHistory.unshift({
      id: `AM-${Date.now()}`,
      date: new Date().toLocaleString("pt-BR"),
      value: amountToAmortize,
      type: "PARCELA_FIXA",
      balanceAfter: credit.outstandingDebt,
      actor: role === "FINANCEIRO" ? "Financeiro Disk" : "Produtor"
    });

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: credit.eventId,
      eventName: credit.eventName,
      type: "AMORTIZACAO_CREDITO",
      value: amountToAmortize,
      balanceAfter: (data.summary.consolidatedBalance - amountToAmortize),
      reason: `Amortização de crédito ${credit.protocol}`,
      actor: "Motor Financeiro Automático",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        outstandingCredits: Math.max(0, prev.summary.outstandingCredits - amountToAmortize)
      }
    }));

    notify(`Amortização de ${money(amountToAmortize)} realizada no contrato ${credit.protocol}.`);
  };

  // Handlers: Simular Venda & Amortização Automática (15%)
  const handleSimulateSale = (credit) => {
    const saleAmount = 30000;
    const netSale = saleAmount * 0.9; // 10% taxas
    const deduction = Math.min(credit.outstandingDebt, netSale * (credit.receivablePercent / 100));

    credit.outstandingDebt = Math.max(0, credit.outstandingDebt - deduction);
    credit.amortizedTotal += deduction;
    if (credit.outstandingDebt === 0) credit.status = "LIQUIDADO";

    credit.amortizationHistory.unshift({
      id: `AM-${Date.now()}`,
      date: new Date().toLocaleString("pt-BR"),
      value: deduction,
      type: "RETENCAO_RECEIVABLE_AUTOMATICA",
      balanceAfter: credit.outstandingDebt,
      actor: "Motor de Bilheteria Automática"
    });

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: credit.eventId,
      eventName: credit.eventName,
      type: "AMORTIZACAO_CREDITO",
      value: deduction,
      balanceAfter: (data.summary.consolidatedBalance - deduction),
      reason: `Amortização automática de ${credit.receivablePercent}% retida de nova bilheteria (${money(saleAmount)})`,
      actor: "Motor de Bilheteria Automática",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        outstandingCredits: Math.max(0, prev.summary.outstandingCredits - deduction)
      }
    }));

    notify(`Venda de ${money(saleAmount)} processada! Retenção de ${money(deduction)} (${credit.receivablePercent}%) abatida do crédito.`);
  };

  // Handlers: Bloqueio / Retenção
  const handleBlockBalance = () => {
    const val = parseFloat(blockForm.value);
    if (!val || val <= 0) {
      notify("Informe um valor válido maior que zero.", "error");
      return;
    }
    if (!blockForm.reason || blockForm.reason.trim().length < 5) {
      notify("Justificativa formal com no mínimo 5 caracteres é obrigatória.", "error");
      return;
    }

    const event = data.events.find(e => e.id === blockForm.eventId);
    event.blocked = (event.blocked || 0) + val;
    event.eligibility.availableToRequest = Math.max(0, event.eligibility.availableToRequest - val);

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: event.id,
      eventName: event.name,
      type: blockForm.type,
      value: val,
      balanceAfter: (data.summary.consolidatedBalance - val),
      reason: blockForm.reason.trim(),
      actor: "Financeiro Disk",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        blocked: prev.summary.blocked + val,
        availableForRepasse: Math.max(0, prev.summary.availableForRepasse - val)
      }
    }));

    setModalBloqueio(false);
    notify(`${blockForm.type === 'RETENCAO' ? 'Retenção' : 'Bloqueio'} de ${money(val)} registrado com sucesso!`);
  };

  // Handlers: Liberar Bloqueio
  const handleReleaseBlock = (eventId, amount) => {
    const reason = prompt("Informe a justificativa formal para a liberação deste saldo:");
    if (!reason || reason.trim().length < 5) {
      notify("A justificativa de liberação deve ter pelo menos 5 caracteres.", "error");
      return;
    }

    const event = data.events.find(e => e.id === eventId);
    event.blocked = Math.max(0, (event.blocked || 0) - amount);
    event.eligibility.availableToRequest += amount;

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: event.id,
      eventName: event.name,
      type: "LIBERACAO",
      value: amount,
      balanceAfter: (data.summary.consolidatedBalance + amount),
      reason: reason.trim(),
      actor: "Financeiro Disk",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        blocked: Math.max(0, prev.summary.blocked - amount),
        availableForRepasse: prev.summary.availableForRepasse + amount
      }
    }));

    notify(`Saldo de ${money(amount)} liberado com sucesso no evento ${event.name}!`);
  };

  // Handlers: Solicitar Repasse
  const handleRequestPayout = () => {
    const val = parseFloat(payoutForm.value);
    const event = data.events.find(e => e.id === payoutForm.eventId);
    if (!val || val <= 0) {
      notify("Informe um valor válido.", "error");
      return;
    }
    if (val > event.eligibility.availableToRequest) {
      notify(`Valor excede o limite disponível para repasse (${money(event.eligibility.availableToRequest)}).`, "error");
      return;
    }

    const newRequest = {
      id: `RP-${Date.now()}`,
      protocol: `REP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      eventId: event.id,
      eventName: event.name,
      value: val,
      status: "EM_ANALISE",
      applicant: role === "PRODUTOR" ? "João Silva (Produtor)" : "Karine (Financeiro Disk)",
      createdAt: new Date().toLocaleString("pt-BR"),
      signatures: {
        producer: { signed: false },
        disk: { signed: false }
      },
      approval: { approved: false },
      liquidation: { liquidated: false }
    };

    event.eligibility.availableToRequest = Math.max(0, event.eligibility.availableToRequest - val);

    setData(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests],
      summary: {
        ...prev.summary,
        availableForRepasse: Math.max(0, prev.summary.availableForRepasse - val)
      }
    }));

    setModalRepasse(false);
    notify(`Solicitação ${newRequest.protocol} enviada para análise!`);
  };

  // Workflow Handlers
  const handleApprovePayout = (req) => {
    req.status = "AGUARDANDO_ASSINATURA_PRODUTOR";
    req.approval = { approved: true, approvedBy: "Karine (Financeiro Disk)", approvedAt: new Date().toLocaleString("pt-BR") };
    setData({ ...data });
    notify(`Solicitação ${req.protocol} aprovada! Aguardando assinatura do produtor.`);
  };

  const handleSignProducer = (req) => {
    req.signatures.producer = { signed: true, signedBy: "João Silva (Produtor)", signedAt: new Date().toLocaleString("pt-BR") };
    req.status = "AGUARDANDO_ASSINATURA_DISK";
    setData({ ...data });
    notify(`Termo assinado pelo Produtor em ${req.protocol}.`);
  };

  const handleSignDisk = (req) => {
    if (!req.signatures.producer.signed) {
      notify("Violação de Governança: Produtor deve assinar antes da Disk.", "error");
      return;
    }
    req.signatures.disk = { signed: true, signedBy: "Karine (Financeiro Disk)", signedAt: new Date().toLocaleString("pt-BR") };
    req.status = "PRONTO_LIQUIDACAO";
    setData({ ...data });
    notify(`Assinatura Disk registrada! Operação pronta para liquidação.`);
  };

  const handleLiquidatePayout = (req) => {
    req.status = "LIQUIDADO";
    req.liquidation = { liquidated: true, voucher: `COMP-PIX-${Date.now()}`, liquidatedBy: "Carlos (Tesouraria)" };

    const newLedgerEntry = {
      id: `L-${Date.now()}`,
      eventId: req.eventId,
      eventName: req.eventName,
      type: "REPASSE",
      value: req.value,
      balanceAfter: (data.summary.consolidatedBalance - req.value),
      reason: `Liquidação bancária PIX de repasse ${req.protocol}`,
      actor: "Carlos (Tesouraria Disk)",
      createdAt: new Date().toLocaleString("pt-BR")
    };

    setData(prev => ({
      ...prev,
      ledger: [newLedgerEntry, ...prev.ledger],
      summary: {
        ...prev.summary,
        totalPaid: prev.summary.totalPaid + req.value,
        consolidatedBalance: Math.max(0, prev.summary.consolidatedBalance - req.value)
      }
    }));

    notify(`Repasse ${req.protocol} liquidado via PIX na Tesouraria!`);
  };

  return (
    <div className="app">
      {toast && <div className="toast" style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>{toast.msg}</div>}

      {/* Sidebar */}
      <aside>
        <div className="brand">Disk<span>Financeiro</span></div>
        <div className="tag">CONTA FINANCEIRA V0.2</div>
        <nav>
          <button className={tab === 'conta' ? 'active' : ''} onClick={() => setTab('conta')}>
            <WalletCards /> Conta Financeira (CNPJ)
          </button>
          <button className={tab === 'creditos' ? 'active' : ''} onClick={() => setTab('creditos')}>
            <Landmark /> Créditos e Antecipações
          </button>
          <button className={tab === 'bloqueios' ? 'active' : ''} onClick={() => setTab('bloqueios')}>
            <LockKeyhole /> Retenções e Bloqueios
          </button>
          <button className={tab === 'ledger' ? 'active' : ''} onClick={() => setTab('ledger')}>
            <FileClock /> Extrato do Ledger
          </button>
          <button className={tab === 'repasses' ? 'active' : ''} onClick={() => setTab('repasses')}>
            <ArrowDownToLine /> Esteira de Repasses
          </button>
          <button className={tab === 'politica' ? 'active' : ''} onClick={() => setTab('politica')}>
            <Settings2 /> Política de Repasse
          </button>
        </nav>

        <div className="asideFooter">
          <small>Ambiente de Homologação PDT Novo</small>
          <button onClick={() => setRole(role === 'PRODUTOR' ? 'FINANCEIRO' : 'PRODUTOR')}>
            ⇄ {role === 'PRODUTOR' ? 'Entrar como Financeiro Disk' : 'Entrar como Produtor'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        <header>
          <div>
            <small>Conta Financeira Interna Vinculada ao CNPJ</small>
            <h1>{data.producer.name}</h1>
            <p>CNPJ: <strong>{data.producer.cnpj}</strong> · Gestor da Conta: Karine Mendes (Disk Ingressos)</p>
          </div>
          <span className={`roleBadge ${role === 'PRODUTOR' ? 'role-produtor' : 'role-financeiro'}`}>
            {role === 'PRODUTOR' ? '👤 VISÃO PRODUTOR' : '🛡️ FINANCEIRO DISK'}
          </span>
        </header>

        {/* ========================================================================= */}
        {/* ABA 1: CONTA FINANCEIRA DO PRODUTOR (CNPJ) */}
        {/* ========================================================================= */}
        {tab === 'conta' && (
          <>
            {/* Os 5 Blocos do Saldo Consolidado */}
            <section className="cards">
              <div className="card">
                <small>Saldo Consolidado</small>
                <strong>{money(data.summary.consolidatedBalance)}</strong>
                <span>Receita apurada líquida</span>
              </div>
              <div className="card primary">
                <small>Disponível p/ Repasse</small>
                <strong>{money(data.summary.availableForRepasse)}</strong>
                <span>Livre pela política vigente</span>
              </div>
              <div className="card">
                <small>A Liberar (Pendente)</small>
                <strong>{money(data.summary.futurePending)}</strong>
                <span>Aguardando atingir 50%</span>
              </div>
              <div className="card danger">
                <small>Bloqueado / Retido</small>
                <strong>{money(data.summary.blocked)}</strong>
                <span>Sob controle Disk</span>
              </div>
              <div className="card purple">
                <small>Créditos em Aberto</small>
                <strong>{money(data.summary.outstandingCredits)}</strong>
                <span>Saldo devedor total</span>
              </div>
            </section>

            {/* Detalhamento por Evento */}
            <section className="panel">
              <div className="panelHead">
                <div>
                  <h2>Detalhamento Contábil por Evento</h2>
                  <p>O ledger identifica a origem de cada centavo. Nenhuma operação mistura saldos entre eventos.</p>
                </div>
                {role === 'FINANCEIRO' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => setModalBloqueio(true)}>
                      <LockKeyhole style={{ width: 14, height: 14 }} /> + Bloquear/Reter
                    </button>
                    <button className="btn btn-primary" onClick={() => setModalCredito(true)}>
                      <Landmark style={{ width: 14, height: 14 }} /> + Conceder Crédito
                    </button>
                  </div>
                )}
              </div>

              <div className="tableContainer">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Meta de Vendas</th>
                      <th>Vendas Apuradas</th>
                      <th>Progresso</th>
                      <th>Bloqueado/Retido</th>
                      <th>Dívida Crédito</th>
                      <th>Disponível Repasse</th>
                      <th>Status Repasse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map(ev => (
                      <tr key={ev.id}>
                        <td>
                          <strong>{ev.name}</strong>
                          <br /><small style={{ color: '#64748b' }}>{ev.id}</small>
                        </td>
                        <td>{money(ev.salesTarget)}</td>
                        <td><strong>{money(ev.sold)}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(ev.salesPercent, 100)}%`, height: '100%', background: ev.salesPercent >= 50 ? '#10b981' : '#f59e0b' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{ev.salesPercent.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td><strong style={{ color: ev.blocked > 0 ? '#dc2626' : '#64748b' }}>{money(ev.blocked)}</strong></td>
                        <td><strong style={{ color: ev.outstandingDebt > 0 ? '#7c3aed' : '#64748b' }}>{money(ev.outstandingDebt)}</strong></td>
                        <td><strong style={{ color: '#2563eb' }}>{money(ev.eligibility.availableToRequest)}</strong></td>
                        <td>
                          <span className={`badge ${ev.eligibility.ruleMet ? 'badge-ok' : 'badge-wait'}`}>
                            {ev.eligibility.ruleMet ? '✓ Habilitado' : 'Aguardando 50%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: CRÉDITOS E ANTECIPAÇÕES AO PRODUTOR */}
        {/* ========================================================================= */}
        {tab === 'creditos' && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h2>Créditos e Antecipações ao Produtor</h2>
                <p>Recurso antecipado antes da receita do evento com amortização automática ou parcelada.</p>
              </div>
              {role === 'FINANCEIRO' && (
                <button className="btn btn-primary" onClick={() => setModalCredito(true)}>
                  <PlusCircle style={{ width: 14, height: 14 }} /> + Conceder Crédito / Antecipação
                </button>
              )}
            </div>

            <div className="tableContainer">
              <table>
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Evento Vinculado</th>
                    <th>Principal Concedido</th>
                    <th>Juros Contratados</th>
                    <th>Total da Dívida</th>
                    <th>Saldo Devedor Atual</th>
                    <th>Forma de Amortização</th>
                    <th>Status</th>
                    <th>Ações Operacionais</th>
                  </tr>
                </thead>
                <tbody>
                  {data.credits.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.protocol}</strong>
                        <br /><small style={{ color: '#64748b' }}>{c.grantedAt}</small>
                      </td>
                      <td><strong>{c.eventName}</strong></td>
                      <td>{money(c.principal)}</td>
                      <td><span className="badge badge-purple">{c.interestRate}% a.m.</span></td>
                      <td><strong>{money(c.totalDebt)}</strong></td>
                      <td><strong style={{ color: '#dc2626' }}>{money(c.outstandingDebt)}</strong></td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>
                          {c.amortizationModel === 'PARCELAS_FIXAS' && `${c.installmentsCount}x de ${money(c.installmentValue)}`}
                          {c.amortizationModel === 'PERCENTUAL_RECEBIVEIS' && `${c.receivablePercent}% das vendas líquidas`}
                          {c.amortizationModel === 'FECHAMENTO_EVENTO' && 'No encerramento do evento'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'ATIVO' ? 'badge-wait' : 'badge-ok'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.status === 'ATIVO' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline" style={{ fontSize: 11, padding: '5px 8px' }} onClick={() => handleAmortizeCredit(c)}>
                              Amortizar Parcela
                            </button>
                            {c.amortizationModel === 'PERCENTUAL_RECEBIVEIS' && (
                              <button className="btn btn-success" style={{ fontSize: 11, padding: '5px 8px' }} onClick={() => handleSimulateSale(c)}>
                                Simular Venda (15%)
                              </button>
                            )}
                          </div>
                        )}
                        {c.status === 'LIQUIDADO' && (
                          <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✓ Totalmente Quitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: RETENÇÕES E BLOQUEIOS ADMINISTRATIVOS */}
        {/* ========================================================================= */}
        {tab === 'bloqueios' && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h2>Central de Bloqueios e Retenções Administrativas</h2>
                <p>Mesa Financeiro Disk: Controle exclusivo de travas cautelares com motivo e auditoria obrigatória.</p>
              </div>
              {role === 'FINANCEIRO' && (
                <button className="btn btn-danger" onClick={() => setModalBloqueio(true)}>
                  <LockKeyhole style={{ width: 14, height: 14 }} /> + Novo Bloqueio / Retenção
                </button>
              )}
            </div>

            <div className="tableContainer">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Saldo Bloqueado Ativo</th>
                    <th>Motivo da Última Operação</th>
                    <th>Ação da Mesa Disk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map(e => (
                    <tr key={e.id}>
                      <td><strong>{e.name}</strong> ({e.id})</td>
                      <td><strong style={{ color: e.blocked > 0 ? '#dc2626' : '#64748b', fontSize: 15 }}>{money(e.blocked)}</strong></td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>
                          {e.blocked > 0 ? "Reserva técnica preventiva de chargebacks e pendências fiscais" : "Sem travas ativas"}
                        </span>
                      </td>
                      <td>
                        {e.blocked > 0 && role === 'FINANCEIRO' && (
                          <button className="btn btn-success" style={{ fontSize: 11 }} onClick={() => handleReleaseBlock(e.id, e.blocked)}>
                            Liberar Saldo
                          </button>
                        )}
                        {e.blocked === 0 && (
                          <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✓ Regularizado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: EXTRATO DO LEDGER INTERNO */}
        {/* ========================================================================= */}
        {tab === 'ledger' && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h2>Extrato da Conta Financeira (Ledger Imutável)</h2>
                <p>Invariante: Saldo anterior + créditos − débitos = saldo atual. Nenhuma tela altera saldos diretamente.</p>
              </div>
            </div>

            <div className="tableContainer">
              <table>
                <thead>
                  <tr>
                    <th>ID / Data</th>
                    <th>Evento</th>
                    <th>Tipo de Lançamento</th>
                    <th>Valor</th>
                    <th>Saldo Após Lançamento</th>
                    <th>Responsável</th>
                    <th>Justificativa / Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ledger.map(l => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.id}</strong>
                        <br /><small style={{ color: '#64748b' }}>{l.createdAt}</small>
                      </td>
                      <td><strong>{l.eventName}</strong></td>
                      <td>
                        <span className={`badge ${l.type.includes('CREDITO') ? 'badge-purple' : (l.type.includes('AMORTIZACAO') ? 'badge-ok' : (l.type.includes('BLOQUEIO') ? 'badge-blocked' : 'badge-blue'))}`}>
                          {l.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td><strong>{money(l.value)}</strong></td>
                      <td><strong style={{ color: '#0f172a' }}>{money(l.balanceAfter)}</strong></td>
                      <td><span style={{ fontSize: 11, fontWeight: 600 }}>{l.actor}</span></td>
                      <td><span style={{ fontSize: 12, color: '#334155' }}>{l.reason}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: ESTEIRA DE REPASSES */}
        {/* ========================================================================= */}
        {tab === 'repasses' && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h2>Esteira de Repasses (Motor 50% → 20% Integrado à Conta)</h2>
                <p>O motor consulta o saldo da Conta Financeira e abate bloqueios, retenções e amortizações de crédito.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setModalRepasse(true)}>
                + Solicitar Repasse
              </button>
            </div>

            <div className="tableContainer">
              <table>
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Evento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Assinatura Produtor</th>
                    <th>Assinatura Disk</th>
                    <th>Ações da Esteira</th>
                  </tr>
                </thead>
                <tbody>
                  {data.requests.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.protocol}</strong><br /><small>{req.createdAt}</small></td>
                      <td><strong>{req.eventName}</strong></td>
                      <td><strong>{money(req.value)}</strong></td>
                      <td><span className="badge badge-wait">{req.status}</span></td>
                      <td>
                        {req.signatures.producer.signed ? (
                          <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✓ {req.signatures.producer.signedBy}</span>
                        ) : (
                          <span style={{ color: '#d97706', fontSize: 11 }}>Pendente</span>
                        )}
                      </td>
                      <td>
                        {req.signatures.disk.signed ? (
                          <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✓ {req.signatures.disk.signedBy}</span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: 11 }}>Aguardando Produtor</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {req.status === 'EM_ANALISE' && role === 'FINANCEIRO' && (
                            <button className="btn btn-success" style={{ fontSize: 11 }} onClick={() => handleApprovePayout(req)}>
                              Aprovar
                            </button>
                          )}
                          {req.status === 'AGUARDANDO_ASSINATURA_PRODUTOR' && role === 'PRODUTOR' && (
                            <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={() => handleSignProducer(req)}>
                              <FileSignature style={{ width: 14, height: 14 }} /> Assinar Produtor
                            </button>
                          )}
                          {req.status === 'AGUARDANDO_ASSINATURA_DISK' && role === 'FINANCEIRO' && (
                            <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={() => handleSignDisk(req)}>
                              <FileSignature style={{ width: 14, height: 14 }} /> Assinar Disk
                            </button>
                          )}
                          {req.status === 'PRONTO_LIQUIDACAO' && role === 'FINANCEIRO' && (
                            <button className="btn btn-success" style={{ fontSize: 11 }} onClick={() => handleLiquidatePayout(req)}>
                              <Banknote style={{ width: 14, height: 14 }} /> Liquidar PIX
                            </button>
                          )}
                          {req.status === 'LIQUIDADO' && (
                            <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✓ Pago via PIX</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ABA 6: POLÍTICA DE REPASSE */}
        {/* ========================================================================= */}
        {tab === 'politica' && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h2>Política Operacional de Repasses</h2>
                <p>Parâmetros administrativos configuráveis sem alteração do código-fonte.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 14 }}>
              <div className="formGroup">
                <label>Gatilho Mínimo de Vendas Realizadas (%)</label>
                <input
                  type="number"
                  value={data.policy.minimumSalesPercent}
                  disabled={role !== 'FINANCEIRO'}
                  onChange={e => setData({ ...data, policy: { ...data.policy, minimumSalesPercent: Number(e.target.value) } })}
                />
                <small>Percentual mínimo da meta para habilitar o repasse (Padrão: 50%).</small>
              </div>
              <div className="formGroup">
                <label>Percentual Liberado para Repasse (%)</label>
                <input
                  type="number"
                  value={data.policy.releasePercent}
                  disabled={role !== 'FINANCEIRO'}
                  onChange={e => setData({ ...data, policy: { ...data.policy, releasePercent: Number(e.target.value) } })}
                />
                <small>Percentual das vendas brutas liberado (Padrão: 20%).</small>
              </div>
            </div>

            {role === 'FINANCEIRO' && (
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => notify("Política de repasse salva com sucesso!")}>
                Salvar Parâmetros da Política
              </button>
            )}
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CONCEDER CRÉDITO / ANTECIPAÇÃO */}
      {/* ========================================================================= */}
      {modalCredito && (
        <div className="modalBackdrop">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>Conceder Crédito / Antecipação ao Produtor</h3>
              <button className="closeBtn" onClick={() => setModalCredito(false)}><X /></button>
            </div>

            <div className="formGroup">
              <label>Evento Vinculado</label>
              <select value={creditForm.eventId} onChange={e => setCreditForm({ ...creditForm, eventId: e.target.value })}>
                {data.events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.id})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="formGroup">
                <label>Valor Principal (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 100000"
                  value={creditForm.principal}
                  onChange={e => setCreditForm({ ...creditForm, principal: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Taxa de Juros (% a.m.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={creditForm.interestRate}
                  onChange={e => setCreditForm({ ...creditForm, interestRate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="formGroup">
                <label>Quantidade de Parcelas</label>
                <input
                  type="number"
                  value={creditForm.installments}
                  onChange={e => setCreditForm({ ...creditForm, installments: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Forma de Amortização</label>
                <select value={creditForm.amortization} onChange={e => setCreditForm({ ...creditForm, amortization: e.target.value })}>
                  <option value="PARCELAS_FIXAS">Parcelas fixas mensais</option>
                  <option value="PERCENTUAL_RECEBIVEIS">Percentual dos recebíveis (ex: 15%)</option>
                  <option value="FECHAMENTO_EVENTO">No fechamento do evento</option>
                </select>
              </div>
            </div>

            {creditForm.amortization === 'PERCENTUAL_RECEBIVEIS' && (
              <div className="formGroup">
                <label>Percentual de Retenção sobre Vendas (%)</label>
                <input
                  type="number"
                  value={creditForm.receivablePercent}
                  onChange={e => setCreditForm({ ...creditForm, receivablePercent: e.target.value })}
                />
              </div>
            )}

            <div className="formGroup">
              <label>Justificativa Formal Obrigatória</label>
              <textarea
                rows="2"
                placeholder="Ex: Custeio pré-evento aprovado em comitê comercial Disk..."
                value={creditForm.notes}
                onChange={e => setCreditForm({ ...creditForm, notes: e.target.value })}
              />
            </div>

            <div className="modalFooter">
              <button className="btn btn-outline" onClick={() => setModalCredito(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGrantCredit}>Emitir Contrato & Registrar no Ledger</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BLOQUEIO / RETENÇÃO */}
      {/* ========================================================================= */}
      {modalBloqueio && (
        <div className="modalBackdrop">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>Novo Bloqueio ou Retenção Administrativa</h3>
              <button className="closeBtn" onClick={() => setModalBloqueio(false)}><X /></button>
            </div>

            <div className="formGroup">
              <label>Evento Destino</label>
              <select value={blockForm.eventId} onChange={e => setBlockForm({ ...blockForm, eventId: e.target.value })}>
                {data.events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.id})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="formGroup">
                <label>Tipo de Operação</label>
                <select value={blockForm.type} onChange={e => setBlockForm({ ...blockForm, type: e.target.value })}>
                  <option value="BLOQUEIO">Bloqueio Operacional</option>
                  <option value="RETENCAO">Retenção Cautelar</option>
                </select>
              </div>
              <div className="formGroup">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  value={blockForm.value}
                  onChange={e => setBlockForm({ ...blockForm, value: e.target.value })}
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Justificativa Formal Obrigatória (mínimo 5 caracteres)</label>
              <textarea
                rows="2"
                placeholder="Ex: Averiguação de chargebacks contestados..."
                value={blockForm.reason}
                onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
              />
            </div>

            <div className="modalFooter">
              <button className="btn btn-outline" onClick={() => setModalBloqueio(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleBlockBalance}>Confirmar Bloqueio no Ledger</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOLICITAR REPASSE */}
      {/* ========================================================================= */}
      {modalRepasse && (
        <div className="modalBackdrop">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>Solicitar Repasse Financeiro</h3>
              <button className="closeBtn" onClick={() => setModalRepasse(false)}><X /></button>
            </div>

            <div className="formGroup">
              <label>Evento</label>
              <select value={payoutForm.eventId} onChange={e => setPayoutForm({ ...payoutForm, eventId: e.target.value })}>
                {data.events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} (Disponível: {money(ev.eligibility.availableToRequest)})</option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label>Valor Solicitado (R$)</label>
              <input
                type="number"
                value={payoutForm.value}
                onChange={e => setPayoutForm({ ...payoutForm, value: e.target.value })}
              />
            </div>

            <div className="modalFooter">
              <button className="btn btn-outline" onClick={() => setModalRepasse(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleRequestPayout}>Enviar Solicitação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);