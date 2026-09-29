/**
 * Core Financeiro Unificado - Gerenciador de Estado Reativo
 * Padrão de Arquitetura Limitless: Trilha de Auditoria, Fluxo Formal de Assinaturas e Autenticação
 */
import { getFreshDatabase } from './mockData.js';

class CoreFinanceiroStore {
  constructor() {
    this.data = getFreshDatabase();
    this.enrichApprovalQueueWithAuditAndSignatures();

    this.state = {
      isLoggedIn: true,
      currentUser: {
        id: "usr-prod-01",
        name: "João Silva",
        role: "producer", // "producer" | "disk"
        email: "joao@produtoraabc.com.br",
        title: "Diretor Financeiro (Produtora ABC)",
        producerId: "prod-abc"
      },
      viewMode: 'producer',        // 'producer' | 'disk'
      currentView: 'overview',     // Produtor: overview, saldos, etc. | Disk: diskDashboard, diskProdutores, diskAprovacoes, etc.
      selectedProducerId: 'prod-abc', // No produtor é estritamente travado no prod-abc; no Disk pode selecionar qualquer um
      selectedEventId: 'all',
      statementFilter: 'all',
      activeToast: null,
      searchTerm: ''
    };

    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role');
      if (r === 'financeiro' || r === 'disk') {
        this.state.currentUser = {
          id: "usr-disk-01",
          name: "Maria Valente",
          role: "disk",
          email: "maria.valente@diskingressos.com.br",
          title: "Mesa de Operações & Tesouraria",
          producerId: null
        };
        this.state.viewMode = 'disk';
        this.state.currentView = 'diskDashboard';
      } else if (r === 'admin') {
        this.state.currentUser = {
          id: "usr-admin-01",
          name: "Vinicius Casagrande",
          role: "admin",
          email: "vinicius.casagrande@diskingressos.com.br",
          title: "Administrador Master",
          producerId: null
        };
        this.state.viewMode = 'disk';
        this.state.currentView = 'diskDashboard';
      }
    }

    this.listeners = [];
  }

  // Enriquece itens da fila com modelo formal de assinaturas e trilha de auditoria
  enrichApprovalQueueWithAuditAndSignatures() {
    this.data.approvalQueue = this.data.approvalQueue.map(item => {
      const isPaid = item.status === 'Pago';
      const isApproved = item.status === 'Aprovado' || isPaid;

      return {
        ...item,
        status: isPaid ? 'Pago' : (item.status === 'Em Análise' ? 'Em análise' : 'Aguardando análise'),
        documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        documentTitle: item.type === 'Repasse' ? 'Termo de Liberação de Repasse Financeiro' : (item.type === 'Antecipação' ? 'Contrato de Antecipação de Recebíveis' : 'Termo de Fechamento de Borderô'),
        signatures: {
          producer: {
            signed: isPaid,
            signedBy: isPaid ? "João Silva (Produtora ABC)" : null,
            signedAt: isPaid ? "28/09/2026 14:10" : null,
            ip: isPaid ? "177.136.241.10" : null,
            certAuth: isPaid ? "ICP-BRASIL-A1-CERT-98214" : null
          },
          disk: {
            signed: isPaid,
            signedBy: isPaid ? "Maria Valente (Tesouraria Disk)" : null,
            signedAt: isPaid ? "28/09/2026 14:35" : null,
            ip: isPaid ? "189.40.12.8" : null,
            certAuth: isPaid ? "DISK-AUTH-E-CNPJ-4410" : null,
            lockedUntilProducerSigns: !isPaid
          }
        },
        auditTrail: [
          { timestamp: "29/09/2026 09:14", actor: "João Silva (Produtor)", action: "Criou a solicitação de repasse", details: `Valor: R$ ${(item.requestedAmount || 80000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { timestamp: "29/09/2026 09:27", actor: "João Silva (Produtor)", action: "Conferiu dados bancários e enviou para análise", details: "Status: Aguardando análise" },
          { timestamp: "29/09/2026 09:28", actor: "Sistema Disk", action: "Notificou a mesa de aprovação do Financeiro Disk", details: "Entrou na Central de Aprovações" }
        ],
        rejection: null
      };
    });
  }

  getState() {
    const isAllProducers = this.state.selectedProducerId === 'all' || !this.state.selectedProducerId;
    let activeProd = null;
    let consolidatedTotals = null;

    if (isAllProducers && this.state.viewMode === 'disk') {
      const sumTotals = this.data.producers.reduce((acc, p) => ({
        grossSales: acc.grossSales + (p.totals?.grossSales || 0),
        netSales: acc.netSales + (p.totals?.netSales || 0),
        totalBalance: acc.totalBalance + (p.totals?.totalBalance || 0),
        availableBalance: acc.availableBalance + (p.totals?.availableBalance || 0),
        futureReceivables: acc.futureReceivables + (p.totals?.futureReceivables || 0),
        transferredAmount: acc.transferredAmount + (p.totals?.transferredAmount || 0),
        blockedBalance: acc.blockedBalance + (p.totals?.blockedBalance || 0),
        refundsAndChargebacks: acc.refundsAndChargebacks + (p.totals?.refundsAndChargebacks || 0),
      }), { grossSales: 0, netSales: 0, totalBalance: 0, availableBalance: 0, futureReceivables: 0, transferredAmount: 0, blockedBalance: 0, refundsAndChargebacks: 0 });

      activeProd = {
        id: 'all',
        name: 'Todos os Produtores (Consolidado)',
        tradeName: 'Carteira Global Disk Ingressos',
        cnpj: 'Consolidado Geral',
        rating: 'Carteira Geral',
        status: 'Ativo',
        hasBlock: false,
        contract: {
          number: 'MASTER-GLOBAL',
          diskFeePercent: 10.0,
          anticipationRateMonthly: 2.5
        },
        totals: sumTotals,
        bankAccounts: []
      };
      consolidatedTotals = sumTotals;
    } else {
      activeProd = this.data.producers.find(p => p.id === this.state.selectedProducerId) || this.data.producers[0];
      consolidatedTotals = activeProd.totals || {
        grossSales: 890000.00,
        netSales: 801000.00,
        totalBalance: 785000.00,
        availableBalance: 310000.00,
        futureReceivables: 245000.00,
        transferredAmount: 920000.00,
        blockedBalance: 25000.00,
        refundsAndChargebacks: 15000.00
      };
    }

    return {
      ...this.state,
      data: {
        ...this.data,
        producer: activeProd,
        bankAccounts: activeProd.bankAccounts || [],
        consolidatedTotals: consolidatedTotals
      },
      activeProducer: activeProd,
      pendingApprovalsCount: this.data.approvalQueue.filter(a => a.status === 'Aguardando análise' || a.status === 'Em análise' || a.status === 'Aguardando assinatura do Financeiro').length
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }

  // ==========================================================================
  // AUTENTICAÇÃO E PERFIS DE USUÁRIO (Uma única tela de login)
  // ==========================================================================
  login(role, producerId = "prod-abc") {
    if (role === 'producer') {
      const prod = this.data.producers.find(p => p.id === producerId) || this.data.producers[0];
      this.state.currentUser = {
        id: "usr-prod-01",
        name: "João Silva",
        role: "producer",
        email: prod.contactEmail || "joao@produtoraabc.com.br",
        title: "Diretor Geral",
        producerId: producerId
      };
      this.state.viewMode = 'producer';
      this.state.currentView = 'overview';
      this.state.selectedProducerId = producerId;
      this.state.selectedEventId = 'all';
    } else if (role === 'admin') {
      this.state.currentUser = {
        id: "usr-admin-01",
        name: "Vinicius Casagrande",
        role: "admin",
        email: "vinicius.casagrande@diskingressos.com.br",
        title: "Administrador Master",
        producerId: null
      };
      this.state.viewMode = 'disk';
      this.state.currentView = 'diskDashboard';
      this.state.selectedProducerId = 'all';
      this.state.selectedEventId = 'all';
    } else {
      this.state.currentUser = {
        id: "usr-disk-01",
        name: "Maria Valente",
        role: "disk",
        email: "maria.valente@diskingressos.com.br",
        title: "Gerente de Tesouraria e Risco",
        producerId: null
      };
      this.state.viewMode = 'disk';
      this.state.currentView = 'diskDashboard';
      this.state.selectedProducerId = 'all';
      this.state.selectedEventId = 'all';
    }
    this.state.isLoggedIn = true;
    this.showToast(
      "Sessão Autenticada",
      `Conectado como ${this.state.currentUser.name} (${this.state.currentUser.title})`,
      "info"
    );
    this.notify();
  }

  logout() {
    this.state.isLoggedIn = false;
    this.notify();
  }

  // Navegação
  setView(viewName) {
    this.state.currentView = viewName;
    this.notify();
  }

  setViewMode(mode) {
    if (mode === 'producer') {
      this.login('producer', 'prod-abc');
    } else {
      this.login('disk');
    }
  }

  setSelectedProducer(producerId) {
    if (this.state.currentUser.role === 'producer') {
      // Regra de segurança: Produtor NUNCA pode trocar de produtor!
      this.state.selectedProducerId = this.state.currentUser.producerId;
    } else {
      this.state.selectedProducerId = producerId;
    }
    this.state.selectedEventId = 'all';
    this.notify();
  }

  setSelectedEvent(eventId) {
    this.state.selectedEventId = eventId;
    this.notify();
  }

  setStatementFilter(filter) {
    this.state.statementFilter = filter;
    this.notify();
  }

  showToast(title, message, type = 'info', meta = null) {
    this.state.activeToast = { title, message, type, meta, timestamp: Date.now() };
    this.notify();
    setTimeout(() => {
      if (this.state.activeToast && Date.now() - this.state.activeToast.timestamp >= 5000) {
        this.state.activeToast = null;
        this.notify();
      }
    }, 5500);
  }

  closeToast() {
    this.state.activeToast = null;
    this.notify();
  }

  // ==========================================================================
  // FLUXO OFICIAL: SOLICITAÇÃO → ANÁLISE → DECISÃO → ASSINATURAS → LIBERAÇÃO
  // ==========================================================================

  // 1. Produtor Cria e Envia Solicitação
  requestPayout({ eventId, amount, bankAccountId, notes }) {
    const producer = this.getState().activeProducer;
    const event = this.data.events.find(e => e.id === eventId) || this.data.events.find(e => e.producerId === producer.id);
    const bank = producer.bankAccounts.find(b => b.id === bankAccountId) || producer.bankAccounts[0];
    const numericAmount = parseFloat(amount);

    const payoutId = `REP-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    const newApprovalItem = {
      id: payoutId,
      type: "Repasse",
      producerId: producer.id,
      producerName: producer.name,
      eventId: event.id,
      eventName: event.name,
      requestedAmount: numericAmount,
      requestDate: `${nowDate} ${nowTime}`,
      status: "Aguardando análise",
      stepIndex: 1,
      documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      documentTitle: "Termo de Liberação de Repasse Financeiro",
      bankName: bank.bankName,
      bankAccount: `${bank.agency} • ${bank.accountNumber}`,
      pixKey: bank.pixKey,
      checklist: {
        balanceSufficient: numericAmount <= event.availableBalance,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: !producer.hasBlock,
        limitPermitted: true,
        chargebackWarning: event.chargebackCases > 0 ? `${event.chargebackCases} chargeback(s) sob monitoramento` : 'Sem pendências'
      },
      auditPosition: {
        grossSales: event.grossSales,
        netRevenue: event.netRevenue,
        availableBefore: event.availableBalance,
        requested: numericAmount,
        availableAfter: Math.max(0, event.availableBalance - numericAmount)
      },
      signatures: {
        producer: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null },
        disk: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null, lockedUntilProducerSigns: true }
      },
      auditTrail: [
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Criou solicitação de repasse", details: `R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Conferiu valores e enviou para análise", details: "Status: Aguardando análise" },
        { timestamp: `${nowTime}`, actor: "Sistema Disk", action: "Notificou a Tesouraria Disk", details: "Entrou na Central de Aprovações" }
      ],
      rejection: null,
      notes: notes || "Solicitado pelo Produtor via Portal"
    };

    // Insere no topo da Fila
    this.data.approvalQueue.unshift(newApprovalItem);

    // Reserva o saldo temporariamente
    event.availableBalance = Math.max(0, event.availableBalance - numericAmount);
    producer.totals.availableBalance = Math.max(0, producer.totals.availableBalance - numericAmount);

    this.showToast(
      "🔔 Nova Solicitação Enviada",
      `${producer.name} · ${event.name} — R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado para análise da Disk.`,
      "warning"
    );

    this.notify();
    return newApprovalItem;
  }

  // 2. Financeiro Disk: Aprova a Operação (Gera Documento e Aguarda Assinatura do Produtor)
  approveOperationByDisk(requestId) {
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    const operator = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.status = "Aguardando assinatura do Produtor";
    item.stepIndex = 3;
    item.approvedBy = operator;
    item.approvedAt = `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`;

    // Regra central de segurança: O Financeiro Disk NUNCA assina antes do Produtor
    item.signatures.disk.lockedUntilProducerSigns = true;

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${operator} (Financeiro Disk)`, action: "Analisou e aprovou a operação", details: "Checklist de risco validado com sucesso" },
      { timestamp: `${nowTime}`, actor: "Sistema de Formalização", action: `Gerou documento ${item.documentId}`, details: "Aguardando assinatura digital do Produtor" }
    );

    this.showToast(
      "✓ Solicitação Aprovada pelo Financeiro",
      `Documento ${item.documentId} gerado. Aguardando assinatura digital do Produtor para posterior liberação da Disk.`,
      "info"
    );

    this.notify();
  }

  // 3. Financeiro Disk: Rejeita a Operação Formalmente (com motivo obrigatório e registro no histórico)
  rejectOperationByDisk(requestId, { reasonCategory, observation }) {
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    const operator = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.status = "Rejeitado";
    item.stepIndex = 0;
    item.rejection = {
      rejectedBy: operator,
      rejectedAt: `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`,
      reasonCategory: reasonCategory,
      observation: observation
    };

    // Estorna saldo de volta ao disponível
    const event = this.data.events.find(e => e.id === item.eventId);
    if (event && item.type === "Repasse") {
      event.availableBalance += item.requestedAmount;
    }
    const producer = this.data.producers.find(p => p.id === item.producerId);
    if (producer && item.type === "Repasse") {
      producer.totals.availableBalance += item.requestedAmount;
    }

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${operator} (Financeiro Disk)`, action: "Rejeitou a solicitação", details: `Motivo: ${reasonCategory} — Obs: ${observation}` }
    );

    this.showToast(
      "✕ Solicitação Rejeitada",
      `A solicitação ${item.id} foi rejeitada (${reasonCategory}). O produtor foi notificado e o saldo foi restabelecido.`,
      "danger"
    );

    this.notify();
  }

  // 4. Produtor Assina Digitalmente em Primeiro Lugar
  signByProducer(requestId) {
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    if (item.status !== "Aguardando assinatura do Produtor" && item.status !== "Aprovado") {
      alert("Este documento ainda não foi aprovado pelo Financeiro Disk para assinatura.");
      return;
    }

    const signer = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.signatures.producer.signed = true;
    item.signatures.producer.signedBy = `${signer} (${item.producerName})`;
    item.signatures.producer.signedAt = `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`;
    item.signatures.producer.ip = "177.136.241.10";
    item.signatures.producer.certAuth = `ICP-BRASIL-A1-${Math.floor(100000 + Math.random() * 900000)}`;

    // Agora o Financeiro é desbloqueado para assinar por último
    item.signatures.disk.lockedUntilProducerSigns = false;
    item.status = "Aguardando assinatura do Financeiro";

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${signer} (Produtor)`, action: `Assinou digitalmente ${item.documentId}`, details: `Autenticação: ${item.signatures.producer.certAuth}` },
      { timestamp: `${nowTime}`, actor: "Sistema de Assinaturas", action: "Notificou o Financeiro Disk para assinatura final", details: "Status: Aguardando assinatura do Financeiro" }
    );

    this.showToast(
      "✍️ Documento Assinado pelo Produtor",
      `O documento ${item.documentId} foi assinado por ${signer}. Encaminhado para a assinatura final do Financeiro Disk.`,
      "success"
    );

    this.notify();
  }

  signDocumentAsProducer(requestId) {
    return this.signByProducer(requestId);
  }

  // 5. Financeiro Disk Assina (SEMPRE POR ÚLTIMO) e Formaliza
  signByDisk(requestId) {
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    // TRAVA OBRIGATÓRIA DO SISTEMA: O Financeiro NUNCA assina antes do Produtor
    if (!item.signatures.producer.signed) {
      alert("BLOQUEIO DE SEGURANÇA: O Financeiro Disk é sempre o último signatário. O documento deve ser assinado primeiramente pelo Produtor.");
      return;
    }

    const operator = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.signatures.disk.signed = true;
    item.signatures.disk.signedBy = `${operator} (Tesouraria Disk)`;
    item.signatures.disk.signedAt = `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`;
    item.signatures.disk.ip = "189.40.12.8";
    item.signatures.disk.certAuth = `DISK-AUTH-E-CNPJ-${Math.floor(1000 + Math.random() * 9000)}`;

    item.status = "Documento assinado";

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${operator} (Financeiro Disk)`, action: `Assinou por último o documento ${item.documentId}`, details: `Autenticação: ${item.signatures.disk.certAuth}` },
      { timestamp: `${nowTime}`, actor: "Sistema de Formalização", action: "Documento Formalizado e Concluído", details: "Operação liberada para transferência financeira" }
    );

    this.showToast(
      "📜 Documento Formalizado com Sucesso",
      `Ambas as partes assinaram o documento ${item.documentId}. Liberado para pagamento na Tesouraria.`,
      "success"
    );

    this.notify();
  }

  signDocumentAsDisk(requestId) {
    return this.signByDisk(requestId);
  }

  // 6. Liberação Financeira / Transferência (PIX / TED / CNAB) → Ledger → Conciliação → Concluído / Pago
  executeFinalTransfer(requestId) {
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    if (!item.signatures.disk.signed || !item.signatures.producer.signed) {
      alert("BLOQUEIO: Transferências só podem ser executadas após a formalização completa de ambas as assinaturas.");
      return;
    }

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    item.status = "Pago";
    item.stepIndex = 5;
    item.paidDate = `${nowDate} ${nowTime}`;
    item.authCode = `DISK-PIX-TED-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const event = this.data.events.find(e => e.id === item.eventId);
    const producer = this.data.producers.find(p => p.id === item.producerId);
    const finalAmount = item.requestedAmount || item.netAmount;

    if (event) {
      event.payoutsDone += finalAmount;
    }
    if (producer) {
      producer.totals.transferredAmount += finalAmount;
    }

    if (item.type === "Antecipação" && this.data.anticipations?.history) {
      const histItem = this.data.anticipations.history.find(h => h.id === item.id);
      if (histItem) {
        histItem.status = "Pago";
        histItem.disbursementDate = `${nowDate} ${nowTime}`;
      }
    }

    if (item.type === "Borderô" && this.data.bordero) {
      this.data.bordero.status = "Fechado & Liquidado";
      this.data.bordero.closureDate = `${nowDate} (Homologado & Liquidado)`;
      if (event) event.status = "Encerrado & Conciliado";
    }

    // Registra débito oficial no Ledger em partidas dobradas
    const ledgerId = `LEDG-${Math.floor(10000 + Math.random() * 90000)}`;
    const eventTypeLedger = item.type === "Antecipação" ? "ANTECIPACAO_RECEBIVEIS_PAGA" : (item.type === "Borderô" ? "FECHAMENTO_BORDERO_LIQUIDADO" : "REPASSE_LIQUIDADO_PAGO");

    this.data.ledgerEntries.unshift({
      id: ledgerId,
      timestamp: `${nowDate} ${nowTime}`,
      eventType: eventTypeLedger,
      producerId: item.producerId,
      eventId: item.eventId,
      debitAccount: `Passivo: Saldo Produtor ${item.producerName}`,
      creditAccount: `Ativo: Conta Corrente Banco do Brasil (001) Disk`,
      amount: finalAmount,
      netProducer: finalAmount,
      feeDisk: item.discountFee || 0.00,
      refOrder: item.id,
      conciliated: true
    });

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: "Tesouraria Disk", action: "Pagamento processado via PIX/TED", details: `Autenticação: ${item.authCode}` },
      { timestamp: `${nowTime}`, actor: "Motor Contábil", action: `Ledger atualizado (${ledgerId})`, details: "Partidas dobradas conciliadas" },
      { timestamp: `${nowTime}`, actor: "Conciliação Bancária", action: "Conciliação confirmada em D-0", details: "Status: PAGO / CONCLUÍDO" }
    );

    this.showToast(
      "💰 Transferência Executada & Conciliada",
      `${item.id}: R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} creditado na conta de ${item.producerName}.`,
      "success"
    );

    this.notify();
  }

  // Solicitação de Antecipação de Recebíveis com Deságio Contratual
  requestAnticipation({ eventId, grossAmount, notes }) {
    const producer = this.getState().activeProducer;
    const event = this.data.events.find(e => e.id === eventId) || this.data.events.find(e => e.producerId === producer.id) || this.data.events[0];
    const numericAmount = parseFloat(grossAmount);
    const monthlyRate = producer.contract?.anticipationRateMonthly || this.data.anticipations?.monthlyRate || 2.0;
    const discountFee = numericAmount * (monthlyRate / 100);
    const netAmount = numericAmount - discountFee;
    const bank = producer.bankAccounts[0] || { bankName: "Itaú Unibanco (341)", agency: "0432", accountNumber: "48291-0", pixKey: "14.829.301/0001-92" };

    const antId = `ANT-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    const newApprovalItem = {
      id: antId,
      type: "Antecipação",
      producerId: producer.id,
      producerName: producer.name,
      eventId: event.id,
      eventName: event.name,
      requestedAmount: numericAmount,
      ratePercent: monthlyRate,
      discountFee: discountFee,
      netAmount: netAmount,
      requestDate: `${nowDate} ${nowTime}`,
      status: "Aguardando análise",
      stepIndex: 1,
      documentId: `CONTR-ANT-${Math.floor(1000 + Math.random() * 9000)}`,
      documentTitle: "Contrato de Cessão & Antecipação de Recebíveis de Cartão",
      bankName: bank.bankName,
      bankAccount: `${bank.agency} • ${bank.accountNumber}`,
      pixKey: bank.pixKey,
      checklist: {
        balanceSufficient: numericAmount <= (event.futureReceivables || 245000),
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: !producer.hasBlock,
        limitPermitted: true,
        chargebackWarning: event.chargebackCases > 0 ? `${event.chargebackCases} chargeback(s) monitorados` : 'Sem pendências'
      },
      auditPosition: {
        grossSales: event.grossSales,
        netRevenue: event.netRevenue,
        availableBefore: event.futureReceivables,
        requested: numericAmount,
        availableAfter: Math.max(0, event.futureReceivables - numericAmount)
      },
      signatures: {
        producer: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null },
        disk: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null, lockedUntilProducerSigns: true }
      },
      auditTrail: [
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Simulou e solicitou antecipação de recebíveis", details: `Bruto: R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Taxa (${monthlyRate}%): -R$ ${discountFee.toFixed(2)} | Líquido: R$ ${netAmount.toFixed(2)}` },
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Enviou para a mesa de crédito do Financeiro Disk", details: "Status: Aguardando análise" },
        { timestamp: `${nowTime}`, actor: "Mesa de Operações Disk", action: "Notificada para análise de risco e margem", details: "Entrou na Central de Aprovações" }
      ],
      rejection: null,
      notes: notes || "Solicitação voluntária de adiantamento de vendas parceladas no cartão de crédito."
    };

    this.data.approvalQueue.unshift(newApprovalItem);

    if (this.data.anticipations && this.data.anticipations.history) {
      this.data.anticipations.history.unshift({
        id: antId,
        requestDate: nowDate,
        disbursementDate: "Em análise",
        eventName: event.name,
        requestedAmount: numericAmount,
        discountFee: discountFee,
        netDisbursed: netAmount,
        status: "Aguardando análise"
      });
    }

    event.futureReceivables = Math.max(0, event.futureReceivables - numericAmount);
    producer.totals.futureReceivables = Math.max(0, producer.totals.futureReceivables - numericAmount);
    if (this.data.anticipations.eligibleAmount) {
      this.data.anticipations.eligibleAmount = Math.max(0, this.data.anticipations.eligibleAmount - numericAmount);
    }

    this.showToast(
      "⚡ Solicitação de Antecipação Enviada",
      `${producer.name} · ${event.name} — R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Líquido: R$ ${netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) encaminhado para aprovação da Disk.`,
      "warning"
    );

    this.notify();
    return newApprovalItem;
  }

  // Formalização e Envio do Borderô Oficial de Fechamento para Homologação
  submitBorderoClosure({ eventId, notes }) {
    const producer = this.getState().activeProducer;
    const event = this.data.events.find(e => e.id === eventId) || this.data.events[0];
    const bordero = this.data.bordero;
    const remainingBalance = bordero.summary.remainingBalance || 511318.50;
    const bank = producer.bankAccounts[0] || { bankName: "Itaú Unibanco (341)", agency: "0432", accountNumber: "48291-0", pixKey: "14.829.301/0001-92" };

    const borderoId = `BOR-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    const newApprovalItem = {
      id: borderoId,
      type: "Borderô",
      producerId: producer.id,
      producerName: producer.name,
      eventId: event.id,
      eventName: event.name,
      requestedAmount: remainingBalance,
      requestDate: `${nowDate} ${nowTime}`,
      status: "Aguardando análise",
      stepIndex: 1,
      documentId: `DOC-BOR-${Math.floor(1000 + Math.random() * 9000)}`,
      documentTitle: "Termo de Homologação e Fechamento Definitivo de Borderô",
      bankName: bank.bankName,
      bankAccount: `${bank.agency} • ${bank.accountNumber}`,
      pixKey: bank.pixKey,
      checklist: {
        balanceSufficient: true,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: !producer.hasBlock,
        limitPermitted: true,
        chargebackWarning: "Contas e borderô de ingressos conferidos sem divergência"
      },
      auditPosition: {
        grossSales: bordero.summary.grossRevenue,
        netRevenue: bordero.summary.netEventBalance,
        availableBefore: bordero.summary.remainingBalance,
        requested: remainingBalance,
        availableAfter: 0.00
      },
      signatures: {
        producer: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null },
        disk: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null, lockedUntilProducerSigns: true }
      },
      auditTrail: [
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Enviou fechamento oficial do Borderô para homologação", details: `Arrecadação: R$ ${bordero.summary.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Saldo a liquidar: R$ ${remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { timestamp: `${nowTime}`, actor: "Sistema Fiscal Disk", action: "Validação cruzada de ingressos emitidos e borderô contábil", details: "Status: Aguardando análise da Auditoria Disk" }
      ],
      rejection: null,
      notes: notes || "Fechamento definitivo e prestação de contas do evento."
    };

    this.data.approvalQueue.unshift(newApprovalItem);
    this.data.bordero.status = "Em Homologação";

    this.showToast(
      "📑 Fechamento de Borderô Enviado",
      `${event.name} — Fechamento definitivo submetido à Auditoria e Financeiro Disk com saldo remanescente de R$ ${remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      "info"
    );

    this.notify();
    return newApprovalItem;
  }

  // Cadastro de Nova Conta Bancária PJ Homologada
  addBankAccount({ bankName, accountType, agency, accountNumber, pixKey, isDefault }) {
    const producer = this.getState().activeProducer;
    const newAccount = {
      id: `bnk-${Math.floor(1000 + Math.random() * 9000)}`,
      bankName: bankName,
      accountType: accountType || "Conta Corrente PJ",
      agency: agency,
      accountNumber: accountNumber,
      holderName: producer.name,
      cnpj: producer.cnpj,
      pixKey: pixKey,
      isDefault: !!isDefault,
      status: "Validada & Ativa",
      validatedAt: `${new Date().toLocaleDateString('pt-BR')} via CIP/Bacen`
    };

    if (newAccount.isDefault) {
      producer.bankAccounts.forEach(b => b.isDefault = false);
    }

    producer.bankAccounts.push(newAccount);
    this.showToast("Conta Cadastrada", `${bankName} cadastrado com sucesso para recebimento de repasses.`, "success");
    this.notify();
    return newAccount;
  }

  // ==========================================================================
  // SIMULAÇÕES DO MODO DEMONSTRAÇÃO
  // ==========================================================================
  simulateCardSale(amount = 1000.00) {
    const event = this.data.events.find(e => e.id === "evt-001");
    const producer = this.data.producers.find(p => p.id === "prod-abc");
    const gateway = this.data.gateways[0];

    const mdrPercent = parseFloat(gateway.mdrCredit.replace('%', ''));
    const mdrAmount = amount * (mdrPercent / 100);
    const diskFeePercent = producer.contract.diskFeePercent;
    const diskFeeAmount = amount * (diskFeePercent / 100);
    const netToProducer = amount - diskFeeAmount;

    event.grossSales += amount;
    event.diskFees += diskFeeAmount;
    event.netRevenue += netToProducer;
    event.soldTickets += Math.round(amount / 120);
    event.futureReceivables += netToProducer;
    event.totalBalance += netToProducer;

    producer.totals.grossSales += amount;
    producer.totals.netSales += netToProducer;
    producer.totals.futureReceivables += netToProducer;
    producer.totals.totalBalance += netToProducer;

    const orderId = `PED-${Math.floor(10000 + Math.random() * 90000)}`;
    this.data.ledgerEntries.unshift({
      id: `LEDG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      eventType: "VENDA_CARTAO_CREDITO",
      producerId: producer.id,
      eventId: event.id,
      debitAccount: `Ativo: Recebível Adquirente ${gateway.name} (MDR -R$ ${mdrAmount.toFixed(2)})`,
      creditAccount: `Passivo: Recebível Futuro ${producer.name} (+R$ ${netToProducer.toFixed(2)})`,
      creditAccount2: `Receita: Taxa Disk Retida (+R$ ${diskFeeAmount.toFixed(2)})`,
      amount: amount,
      netProducer: netToProducer,
      feeDisk: diskFeeAmount,
      refOrder: orderId,
      conciliated: true
    });

    this.showToast(
      "💳 Venda no Cartão Processada!",
      `Pedido ${orderId}: R$ ${amount.toFixed(2)} → Cielo MDR (-R$ ${mdrAmount.toFixed(2)}) → Taxa Disk (-R$ ${diskFeeAmount.toFixed(2)}) → Saldo Produtor (+R$ ${netToProducer.toFixed(2)})`,
      "success"
    );

    this.notify();
  }

  simulatePixSale(amount = 350.00) {
    const event = this.data.events.find(e => e.id === "evt-001");
    const producer = this.data.producers.find(p => p.id === "prod-abc");
    const diskFee = amount * 0.10;
    const netProducer = amount - diskFee;

    event.grossSales += amount;
    event.diskFees += diskFee;
    event.netRevenue += netProducer;
    event.availableBalance += netProducer;
    event.totalBalance += netProducer;
    event.soldTickets += 2;

    producer.totals.grossSales += amount;
    producer.totals.availableBalance += netProducer;
    producer.totals.totalBalance += netProducer;

    const orderId = `PED-${Math.floor(10000 + Math.random() * 90000)}`;
    this.showToast(
      "⚡ Venda PIX Compensada!",
      `Pedido ${orderId} (R$ ${amount.toFixed(2)}): Liberado no Saldo Disponível de ${producer.name} (+R$ ${netProducer.toFixed(2)})`,
      "success"
    );

    this.notify();
  }

  simulateChargeback(amount = 450.00) {
    const event = this.data.events.find(e => e.id === "evt-001");
    const producer = this.data.producers.find(p => p.id === "prod-abc");

    event.chargebacks += amount;
    event.chargebackCases += 1;
    event.blockedBalance += amount;
    event.availableBalance = Math.max(0, event.availableBalance - amount);

    producer.totals.blockedBalance += amount;
    producer.totals.availableBalance = Math.max(0, producer.totals.availableBalance - amount);

    this.showToast(
      "⚠️ Chargeback Registrado!",
      `Contestação na Cielo: R$ ${amount.toFixed(2)} retido cautelarmente do saldo de ${producer.name}.`,
      "danger"
    );

    this.notify();
  }

  resetDemoData() {
    this.data = getFreshDatabase();
    this.enrichApprovalQueueWithAuditAndSignatures();
    this.state.selectedProducerId = 'prod-abc';
    this.state.selectedEventId = 'all';
    this.showToast(
      "↻ Demonstração Restaurada",
      "Core Financeiro redefinido para o estado inicial para nova apresentação.",
      "info"
    );
    this.notify();
  }
}

export const financialStore = new CoreFinanceiroStore();
