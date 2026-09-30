/**
 * Core Financeiro Unificado - Gerenciador de Estado Reativo
 * Padrão de Arquitetura Limitless: Trilha de Auditoria, Fluxo Formal de Assinaturas e Autenticação
 */
import { getFreshDatabase } from './mockData.js';

class CoreFinanceiroStore {
  constructor() {
    this.storageKey = 'disk-financeiro-v1-p12';
    this.data = this.loadPersistedData() || getFreshDatabase();
    if (!this.data.__p12Enriched) {
      this.enrichApprovalQueueWithAuditAndSignatures();
      this.data.__p12Enriched = true;
    }
    this.ensureOperationModel();

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
          name: "Karine",
          role: "disk",
          email: "karine@diskingressos.com.br",
          title: "Administradora do Financeiro",
          producerId: null
        };
        this.state.viewMode = 'disk';
        this.state.currentView = 'diskDashboard';
        this.state.selectedProducerId = 'all';
        this.state.selectedEventId = 'all';
      } else if (r === 'admin') {
        this.state.currentUser = {
          id: "usr-admin-01",
          name: "Karine",
          role: "admin",
          email: "karine@diskingressos.com.br",
          title: "Administradora do Financeiro",
          producerId: null
        };
        this.state.viewMode = 'disk';
        this.state.currentView = 'diskDashboard';
        this.state.selectedProducerId = 'all';
        this.state.selectedEventId = 'all';
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
            signedBy: isPaid ? "Karine (Adm do Financeiro)" : null,
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
        reservation: item.reservation || {
          type: item.type === 'Antecipação' ? 'RECEBIVEL_FUTURO' : 'SALDO_DISPONIVEL',
          amount: item.requestedAmount || item.netAmount || 0,
          status: isPaid ? 'Encerrada' : (item.status === 'Rejeitado' ? 'Liberada / Cancelada' : 'Reservado')
        },
        rejection: null
      };
    });
  }

  loadPersistedData() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.approvalQueue)) {
        parsed.approvalQueue.forEach(a => {
          if (a.signatures?.disk?.signedBy && a.signatures.disk.signedBy.includes('Maria Valente')) {
            a.signatures.disk.signedBy = a.signatures.disk.signedBy.replace('Maria Valente', 'Karine');
          }
        });
      }
      return parsed;
    } catch (_) { return null; }
  }

  persist() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (_) {}
  }

  ensureOperationModel() {
    this.data.operationEvents = this.data.operationEvents || [];
    this.data.spreadRules = this.data.spreadRules || [
      { id: 'SPR-001', name: 'Cartão de Crédito Parcelado (2 a 6x)', acquirer: 'Cielo', paymentMethod: 'Cartão de Crédito', brand: 'Visa/Mastercard', installments: '2 a 6x', chargedRate: 8.00, mdr: 2.80, fixedFee: 0.80, payer: 'Comprador (Conveniência)', term: 'D+30', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-002', name: 'Cartão de Crédito à Vista (1x)', acquirer: 'Rede', paymentMethod: 'Cartão de Crédito', brand: 'Visa/Mastercard', installments: '1x', chargedRate: 4.80, mdr: 2.00, fixedFee: 0.50, payer: 'Produtor (Retenção)', term: 'D+14', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-003', name: 'Cartão de Crédito Parcelado (7 a 12x Premium)', acquirer: 'Stone', paymentMethod: 'Cartão de Crédito', brand: 'Visa/Mastercard', installments: '7 a 12x', chargedRate: 9.90, mdr: 3.40, fixedFee: 1.00, payer: 'Comprador (Conveniência)', term: 'D+30', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-004', name: 'PIX Instantâneo EFI / Safra', acquirer: 'EfiPix', paymentMethod: 'PIX', brand: 'Todas', installments: 'À vista', chargedRate: 1.50, mdr: 0.40, fixedFee: 0.00, payer: 'Produtor (Retenção)', term: 'D+0', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-005', name: 'Cartão de Débito Balcão PDV & Online', acquirer: 'PagBank', paymentMethod: 'Cartão de Débito', brand: 'Elo/Visa/Master', installments: 'À vista', chargedRate: 3.90, mdr: 1.10, fixedFee: 0.30, payer: 'Produtor (Retenção)', term: 'D+1', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-006', name: 'Boleto Bancário Registrado', acquirer: 'Rede', paymentMethod: 'Boleto', brand: 'Todas', installments: 'À vista', chargedRate: 4.30, mdr: 1.20, fixedFee: 2.50, payer: 'Produtor (Retenção)', term: 'D+2', scopeType: 'Geral Disk', scopeId: 'all', validFrom: '2026-01-01', validTo: '', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-007', name: 'Condição Especial VIP - Produtora ABC', acquirer: 'Cielo', paymentMethod: 'Cartão de Crédito', brand: 'Visa/Mastercard', installments: '2 a 6x', chargedRate: 6.90, mdr: 2.80, fixedFee: 0.50, payer: 'Produtor', term: 'D+14', scopeType: 'Produtor', scopeId: 'prod-abc', validFrom: '2026-03-01', validTo: '2026-12-31', status: 'Ativa', version: 1, history: [] },
      { id: 'SPR-008', name: 'Taxa Promocional - Festival de Verão Curitiba', acquirer: 'Rede', paymentMethod: 'Cartão de Crédito', brand: 'Visa/Mastercard', installments: '1x', chargedRate: 3.90, mdr: 2.00, fixedFee: 0.00, payer: 'Produtor', term: 'D+7', scopeType: 'Evento', scopeId: 'evt-001', validFrom: '2026-06-01', validTo: '2026-08-31', status: 'Ativa', version: 1, history: [] }
    ];

    // Normalização defensiva para regras já existentes em memória/persistência
    this.data.spreadRules.forEach(r => {
      if (!r.scopeType) r.scopeType = 'Geral Disk';
      if (!r.scopeId) r.scopeId = 'all';
      if (!r.paymentMethod) r.paymentMethod = 'Cartão de Crédito';
      if (!r.version) r.version = 1;
      if (!r.history) r.history = [];
    });
    this.data.splitRules = this.data.splitRules || [{
      id: 'SPL-001',
      eventId: 'evt-001',
      name: 'Regra padrão do evento',
      status: 'Ativa',
      beneficiaries: [
        { name: 'Organizador (Principal)', percent: 70 },
        { name: 'Afiliado / Coprodutor', percent: 10 },
        { name: 'Produtor Artístico', percent: 15 },
        { name: 'Plataforma DiskIngressos', percent: 5 }
      ],
      updatedAt: new Date().toLocaleString('pt-BR')
    }];
    this.data.payables = this.data.payables || [
      { id: 'PAG-001', creditor: 'Mega Som & Iluminação', dueDate: '19/07/2026', amount: 14500, status: 'Pendente' },
      { id: 'PAG-002', creditor: 'Segurança Forte Ltda', dueDate: '12/07/2026', amount: 9800, status: 'Pendente' },
      { id: 'PAG-003', creditor: 'Agência Tráfego Ads', dueDate: '05/07/2026', amount: 7600, status: 'Pendente' }
    ];
    this.data.refundRequests = this.data.refundRequests || [];
    this.data.approvalQueue = (this.data.approvalQueue || []).map(item => ({
      ...item,
      protocol: item.protocol || item.id,
      workflowId: item.workflowId || `WF-${item.id}`,
      updatedAt: item.updatedAt || item.requestDate || new Date().toLocaleString('pt-BR')
    }));

    if (this.data.producers) {
      this.data.producers.forEach(p => {
        if (!p.bankAccounts) p.bankAccounts = [];
        p.bankAccounts.forEach(b => {
          if (!b.status) b.status = 'Ativa';
          if (!b.bindingType) b.bindingType = 'geral';
          if (!b.documents || !b.documents.length) {
            b.documents = [{
              id: `doc-${b.id}`,
              name: 'comprovante_titularidade.pdf',
              type: 'Comprovante bancário',
              uploadedAt: b.validatedAt || '15/01/2025'
            }];
          }
          if (!b.version) b.version = 1;
        });
      });
      const xyz = this.data.producers.find(p => p.id === 'prod-xyz');
      if (xyz && !xyz.bankAccounts.some(b => b.status === 'Pendente de validação')) {
        xyz.bankAccounts.push({
          id: 'bnk-xyz-2',
          bankName: 'Santander Brasil (033)',
          accountType: 'Conta Corrente PJ',
          agency: '4321',
          accountNumber: '9872-1',
          digit: '1',
          holderName: 'Eventos XYZ Produções Artísticas',
          cnpj: '22.418.990/0001-44',
          pixKey: '22.418.990/0001-44',
          pixType: 'CNPJ',
          purpose: 'Repasse',
          bindingType: 'evento',
          eventId: 'evt-002',
          eventName: 'Show Internacional Rock Tour',
          isDefault: false,
          status: 'Pendente de validação',
          createdAt: '28/09/2026 11:20',
          documents: [
            { id: 'doc-bnk-xyz-2', name: 'comprovante_bancario_santander.pdf', type: 'Comprovante bancário', uploadedAt: '28/09/2026' }
          ]
        });
      }
    }
  }

  recordOperationEvent(item, action, details = '', module = 'Core Financeiro') {
    if (!item) return;
    const event = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      workflowId: item.workflowId || `WF-${item.id}`,
      protocol: item.protocol || item.id,
      producerId: item.producerId,
      eventId: item.eventId,
      module,
      action,
      details,
      actor: this.state?.currentUser?.name || 'Sistema Disk',
      timestamp: new Date().toLocaleString('pt-BR')
    };
    item.updatedAt = event.timestamp;
    this.data.operationEvents.unshift(event);
    item.auditTrail = item.auditTrail || [];
    item.auditTrail.push({ timestamp: event.timestamp, actor: event.actor, action, details });
    this.persist();
  }

  findOperation(protocol) {
    return this.data.approvalQueue.find(i => i.id === protocol || i.protocol === protocol || i.workflowId === protocol);
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
        reservedBalance: acc.reservedBalance + (p.totals?.reservedBalance || 0),
        reservedReceivables: acc.reservedReceivables + (p.totals?.reservedReceivables || 0),
        futureReceivables: acc.futureReceivables + (p.totals?.futureReceivables || 0),
        transferredAmount: acc.transferredAmount + (p.totals?.transferredAmount || 0),
        blockedBalance: acc.blockedBalance + (p.totals?.blockedBalance || 0),
        refundsAndChargebacks: acc.refundsAndChargebacks + (p.totals?.refundsAndChargebacks || 0),
      }), { grossSales: 0, netSales: 0, totalBalance: 0, availableBalance: 0, reservedBalance: 0, reservedReceivables: 0, futureReceivables: 0, transferredAmount: 0, blockedBalance: 0, refundsAndChargebacks: 0 });

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
        reservedBalance: 0.00,
        reservedReceivables: 0.00,
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
    this.persist();
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
        name: "Karine",
        role: "admin",
        email: "karine@diskingressos.com.br",
        title: "Administradora do Financeiro",
        producerId: null
      };
      this.state.viewMode = 'disk';
      this.state.currentView = 'diskDashboard';
      this.state.selectedProducerId = 'all';
      this.state.selectedEventId = 'all';
    } else {
      this.state.currentUser = {
        id: "usr-disk-01",
        name: "Karine",
        role: "disk",
        email: "karine@diskingressos.com.br",
        title: "Administradora do Financeiro",
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

    if (this.state.currentUser.role !== 'producer') {
      alert("Somente o Produtor pode criar esta solicitação no Portal do Produtor.");
      return null;
    }
    if (!event || event.producerId !== producer.id) {
      alert("Evento inválido para este produtor.");
      return null;
    }
    if (!numericAmount || numericAmount <= 0) {
      alert("Informe um valor válido para o repasse.");
      return null;
    }
    if (numericAmount > event.availableBalance) {
      alert(`Saldo insuficiente: O valor solicitado (${numericAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) excede o saldo disponível de ${event.name} (${event.availableBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
      return null;
    }
    if (!bank || !['Ativa', 'Validada & Ativa'].includes(bank.status)) {
      alert("Pagamento bloqueado — Produtor sem conta bancária validada.");
      return null;
    }

    const payoutId = `REP-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    const newApprovalItem = {
      id: payoutId,
      protocol: payoutId,
      workflowId: `WF-${payoutId}`,
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

    // Reserva operacional: o valor deixa de ficar livre para novas solicitações
    event.reservedBalance = (event.reservedBalance || 0) + numericAmount;
    newApprovalItem.reservation = { type: "SALDO_DISPONIVEL", amount: numericAmount, status: "Reservado" };
    event.availableBalance = Math.max(0, event.availableBalance - numericAmount);
    producer.totals.availableBalance = Math.max(0, producer.totals.availableBalance - numericAmount);
    producer.totals.reservedBalance = (producer.totals.reservedBalance || 0) + numericAmount;

    this.showToast(
      "🔔 Nova Solicitação Enviada",
      `${producer.name} · ${event.name} — R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado para análise da Disk (Saldo Reservado).`,
      "warning"
    );

    this.recordOperationEvent(newApprovalItem, 'Solicitação enviada', 'Saldo reservado e encaminhado ao Financeiro Disk', 'Ambiente Produtor');
    this.notify();
    return newApprovalItem;
  }

  // 2. Financeiro Disk: Aprova a Operação (Gera Documento e Aguarda Assinatura do Produtor)
  approveOperationByDisk(requestId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      alert("Aprovação permitida somente ao Financeiro Disk.");
      return;
    }
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

    this.recordOperationEvent(item, 'Operação aprovada', 'Documento liberado para assinatura do Produtor', 'Central de Aprovações');

    this.showToast(
      "✓ Solicitação Aprovada pelo Financeiro",
      `Documento ${item.documentId} gerado. Aguardando assinatura digital do Produtor para posterior liberação da Disk.`,
      "info"
    );

    this.notify();
  }

  // 3. Financeiro Disk: Rejeita a Operação Formalmente (com motivo obrigatório e devolução automática da reserva)
  rejectOperationByDisk(requestId, { reasonCategory, observation }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      alert("Rejeição permitida somente ao Financeiro Disk.");
      return;
    }
    if (!reasonCategory || !observation?.trim()) {
      alert("Informe o motivo e a observação para rejeitar a operação.");
      return;
    }
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

    if (item.reservation) {
      item.reservation.status = "Liberada / Cancelada";
    }

    // Estorna saldo ou recebíveis de volta ao disponível e cancela a reserva operacional
    const event = this.data.events.find(e => e.id === item.eventId);
    const producer = this.data.producers.find(p => p.id === item.producerId);

    if (item.type === "Repasse") {
      if (event) {
        event.availableBalance += item.requestedAmount;
        event.reservedBalance = Math.max(0, (event.reservedBalance || 0) - item.requestedAmount);
      }
      if (producer) {
        producer.totals.availableBalance += item.requestedAmount;
        producer.totals.reservedBalance = Math.max(0, (producer.totals.reservedBalance || 0) - item.requestedAmount);
      }
    } else if (item.type === "Antecipação") {
      if (event) {
        event.futureReceivables += item.requestedAmount;
        event.reservedReceivables = Math.max(0, (event.reservedReceivables || 0) - item.requestedAmount);
      }
      if (producer) {
        producer.totals.futureReceivables += item.requestedAmount;
        producer.totals.reservedReceivables = Math.max(0, (producer.totals.reservedReceivables || 0) - item.requestedAmount);
      }
      if (this.data.anticipations?.history) {
        const hist = this.data.anticipations.history.find(h => h.id === item.id);
        if (hist) hist.status = "Rejeitado";
      }
    }

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${operator} (Financeiro Disk)`, action: "Rejeitou a solicitação", details: `Motivo: ${reasonCategory} — Obs: ${observation} (Reserva estornada com sucesso)` }
    );

    this.recordOperationEvent(item, 'Operação rejeitada', `${reasonCategory}: ${observation}`, 'Central de Aprovações');

    this.showToast(
      "✕ Solicitação Rejeitada",
      `A solicitação ${item.id} foi rejeitada (${reasonCategory}). O produtor foi notificado e o saldo reservado foi restabelecido.`,
      "danger"
    );

    this.notify();
  }

  // 4. Produtor Assina Digitalmente em Primeiro Lugar
  signByProducer(requestId) {
    if (this.state.currentUser.role !== 'producer') {
      alert("A assinatura do Produtor deve ocorrer no ambiente do Produtor.");
      return;
    }
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

    this.recordOperationEvent(item, 'Assinatura do Produtor concluída', `Documento ${item.documentId}`, 'Assinaturas');

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
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      alert("Assinatura final permitida somente ao Financeiro Disk.");
      return;
    }
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

    this.recordOperationEvent(item, 'Assinatura final da Disk concluída', `Documento ${item.documentId}`, 'Assinaturas');

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
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      alert("Liquidação permitida somente ao Financeiro Disk.");
      return;
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    if (!item.signatures.disk.signed || !item.signatures.producer.signed) {
      alert("BLOQUEIO: Transferências só podem ser executadas após a formalização completa de ambas as assinaturas.");
      return;
    }

    const prodCheck = this.data.producers.find(p => p.id === item.producerId);
    const activeBank = prodCheck?.bankAccounts?.find(b => ['Ativa', 'Validada & Ativa'].includes(b.status));
    if (!activeBank) {
      alert("Pagamento bloqueado — Produtor sem conta bancária validada.");
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

    if (item.reservation) {
      item.reservation.status = "Encerrada / Liquidada";
    }

    if (event) {
      event.payoutsDone += finalAmount;
      if (item.type === "Repasse") {
        event.reservedBalance = Math.max(0, (event.reservedBalance || 0) - (item.requestedAmount || finalAmount));
      } else if (item.type === "Antecipação") {
        event.reservedReceivables = Math.max(0, (event.reservedReceivables || 0) - (item.requestedAmount || finalAmount));
      }
    }
    if (producer) {
      producer.totals.transferredAmount += finalAmount;
      if (item.type === "Repasse") {
        producer.totals.reservedBalance = Math.max(0, (producer.totals.reservedBalance || 0) - (item.requestedAmount || finalAmount));
      } else if (item.type === "Antecipação") {
        producer.totals.reservedReceivables = Math.max(0, (producer.totals.reservedReceivables || 0) - (item.requestedAmount || finalAmount));
      }
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

    this.recordOperationEvent(
      item,
      'Pagamento liquidado e conciliado',
      `Autenticação bancária: ${item.authCode} | Ledger: ${ledgerId} | Valor: R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Tesouraria / Conciliação'
    );

    this.showToast(
      "💰 Transferência Executada & Conciliada",
      `${item.id}: R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} creditado na conta de ${item.producerName}.`,
      "success"
    );

    this.notify();
  }

  // Solicitação de Antecipação de Recebíveis com Deságio Contratual e Reserva de Recebíveis
  requestAnticipation({ eventId, grossAmount, amount, notes }) {
    const producer = this.getState().activeProducer;
    const event = this.data.events.find(e => e.id === eventId) || this.data.events.find(e => e.producerId === producer.id) || this.data.events[0];
    const numericAmount = parseFloat(grossAmount || amount || 0);
    const monthlyRate = producer.contract?.anticipationRateMonthly || this.data.anticipations?.monthlyRate || 2.0;
    const discountFee = numericAmount * (monthlyRate / 100);
    const netAmount = numericAmount - discountFee;
    const bank = producer.bankAccounts[0] || { bankName: "Itaú Unibanco (341)", agency: "0432", accountNumber: "48291-0", pixKey: "14.829.301/0001-92" };

    const antId = `ANT-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    const newApprovalItem = {
      id: antId,
      protocol: antId,
      workflowId: `WF-${antId}`,
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
      reservation: { type: "RECEBIVEL_FUTURO", amount: numericAmount, status: "Reservado" },
      auditTrail: [
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Simulou e solicitou antecipação de recebíveis", details: `Bruto: R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Taxa (${monthlyRate}%): -R$ ${discountFee.toFixed(2)} | Líquido: R$ ${netAmount.toFixed(2)}` },
        { timestamp: `${nowTime}`, actor: `${this.state.currentUser.name} (Produtor)`, action: "Enviou para a mesa de crédito do Financeiro Disk", details: "Status: Aguardando análise (Recebíveis Reservados)" },
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

    // Reserva operacional dos recebíveis futuros
    event.futureReceivables = Math.max(0, event.futureReceivables - numericAmount);
    event.reservedReceivables = (event.reservedReceivables || 0) + numericAmount;
    producer.totals.futureReceivables = Math.max(0, producer.totals.futureReceivables - numericAmount);
    producer.totals.reservedReceivables = (producer.totals.reservedReceivables || 0) + numericAmount;
    if (this.data.anticipations.eligibleAmount) {
      this.data.anticipations.eligibleAmount = Math.max(0, this.data.anticipations.eligibleAmount - numericAmount);
    }

    this.showToast(
      "⚡ Solicitação de Antecipação Enviada",
      `${producer.name} · ${event.name} — R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Líquido: R$ ${netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) encaminhado para aprovação da Disk (Recebíveis Reservados).`,
      "warning"
    );

    this.recordOperationEvent(newApprovalItem, 'Antecipação solicitada', `Bruto R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com reserva de recebíveis futuros`, 'Antecipações');
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
      protocol: borderoId,
      workflowId: `WF-${borderoId}`,
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

    this.recordOperationEvent(newApprovalItem, 'Fechamento de borderô submetido', `Arrecadação R$ ${bordero.summary.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Saldo R$ ${remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Borderôs');
    this.notify();
    return newApprovalItem;
  }

  // Cadastro de Nova Conta Bancária PJ Homologada (Portal do Produtor)
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
  // CONTAS FINANCEIRAS & BANCÁRIAS — FINANCEIRO DISK (PACOTE 17 / FLUXO COMPLETO)
  // ==========================================================================

  // 1. Financeiro Disk cadastra conta bancária informada pelo produtor (Status inicial: Pendente de validação)
  addDiskProducerBankAccount({
    producerId,
    eventId,
    bindingType,
    holderName,
    cnpj,
    bankName,
    accountType,
    agency,
    accountNumber,
    digit,
    pixKey,
    pixType,
    purpose,
    documentType,
    documentName
  }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode cadastrar contas bancárias de produtores.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    if (!bankName || !agency || !accountNumber || !holderName || !cnpj) {
      throw new Error('Preencha os campos obrigatórios (Produtor, Titular, CPF/CNPJ, Banco, Agência e Conta).');
    }

    const fullAccNumber = digit ? `${accountNumber}-${digit}` : accountNumber;
    const newId = `bnk-${Date.now()}`;
    const event = eventId && eventId !== 'all' ? this.data.events.find(e => e.id === eventId) : null;

    const newAccount = {
      id: newId,
      bankName,
      accountType: accountType || 'Conta Corrente PJ',
      agency,
      accountNumber: fullAccNumber,
      digit: digit || '',
      holderName,
      cnpj,
      pixKey: pixKey || '',
      pixType: pixType || 'CNPJ',
      purpose: purpose || 'Ambos',
      bindingType: bindingType || 'geral',
      eventId: bindingType === 'evento' ? eventId : null,
      eventName: bindingType === 'evento' ? (event?.name || 'Evento específico') : 'Geral (Todos os Eventos)',
      isDefault: false,
      status: 'Pendente de validação',
      createdAt: new Date().toLocaleString('pt-BR'),
      createdBy: this.state.currentUser.name,
      version: 1,
      documents: documentName ? [{
        id: `doc-${Date.now()}`,
        name: documentName,
        type: documentType || 'Comprovante bancário',
        uploadedAt: new Date().toLocaleDateString('pt-BR')
      }] : [{
        id: `doc-${Date.now()}`,
        name: 'comprovante_bancario_anexado.pdf',
        type: 'Comprovante bancário',
        uploadedAt: new Date().toLocaleDateString('pt-BR')
      }]
    };

    if (!producer.bankAccounts) producer.bankAccounts = [];
    producer.bankAccounts.unshift(newAccount);

    this.recordOperationEvent(
      { id: newId, protocol: newId, workflowId: `WF-${newId}`, producerId: producer.id, eventId: newAccount.eventId },
      'Conta bancária cadastrada (Pendente de validação)',
      `${bankName} Ag. ${agency} / Conta ${fullAccNumber} · ${holderName} (${newAccount.eventName})`,
      'Contas Financeiras'
    );

    this.showToast('Conta Cadastrada', `Conta bancária cadastrada para ${producer.name}. Status: Pendente de validação.`, 'warning');
    this.persist();
    this.notify();
    return newAccount;
  }

  // 2. Homologação/Validação formal da conta bancária pela mesa do Financeiro Disk (Bacen / CIP)
  validateProducerBankAccount({ producerId, accountId, approve = true, rejectionReason = '' }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode homologar contas bancárias.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');

    const operator = this.state.currentUser.name;
    const now = new Date().toLocaleString('pt-BR');

    if (approve) {
      account.status = 'Ativa';
      account.validatedAt = `${now} via Bacen/CIP (${operator})`;
      account.validatedBy = operator;

      // Se esta conta substitui uma versão anterior:
      if (account.replacesAccountId) {
        const oldAcc = producer.bankAccounts.find(b => b.id === account.replacesAccountId);
        if (oldAcc) {
          oldAcc.status = 'Inativa (Substituída)';
          oldAcc.replacedAt = now;
          oldAcc.replacedByAccountId = account.id;
        }
      }

      this.recordOperationEvent(
        { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
        'Conta bancária homologada & ativada',
        `${account.bankName} Ag. ${account.agency} · Homologada por ${operator} via Bacen/CIP`,
        'Contas Financeiras'
      );
      this.showToast('Conta Homologada', `Conta bancária do produtor ${producer.name} ativada com sucesso.`, 'success');
    } else {
      if (!rejectionReason?.trim()) {
        throw new Error('Informe o motivo da recusa na validação da conta bancária.');
      }
      account.status = 'Rejeitada';
      account.rejectionReason = rejectionReason;
      account.rejectedAt = now;
      account.rejectedBy = operator;

      this.recordOperationEvent(
        { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
        'Validação de conta bancária recusada',
        `Motivo: ${rejectionReason}`,
        'Contas Financeiras'
      );
      this.showToast('Validação Recusada', `Conta rejeitada: ${rejectionReason}`, 'error');
    }

    this.persist();
    this.notify();
    return account;
  }

  // 3. Alteração Controlada de Conta Bancária Ativa (Preserva histórico e gera nova versão pendente)
  requestBankAccountChange({ producerId, accountId, newBankData }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode solicitar alteração de contas.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const oldAccount = producer.bankAccounts?.find(b => b.id === accountId);
    if (!oldAccount) throw new Error('Conta de origem não encontrada.');

    const newId = `bnk-${Date.now()}`;
    const version = (oldAccount.version || 1) + 1;
    const fullAccNumber = newBankData.digit ? `${newBankData.accountNumber}-${newBankData.digit}` : newBankData.accountNumber;

    const newAccount = {
      id: newId,
      replacesAccountId: oldAccount.id,
      version: version,
      bankName: newBankData.bankName || oldAccount.bankName,
      accountType: newBankData.accountType || oldAccount.accountType,
      agency: newBankData.agency || oldAccount.agency,
      accountNumber: fullAccNumber || oldAccount.accountNumber,
      digit: newBankData.digit || '',
      holderName: newBankData.holderName || oldAccount.holderName,
      cnpj: newBankData.cnpj || oldAccount.cnpj,
      pixKey: newBankData.pixKey || '',
      pixType: newBankData.pixType || 'CNPJ',
      purpose: newBankData.purpose || oldAccount.purpose || 'Repasse',
      bindingType: newBankData.bindingType || oldAccount.bindingType || 'geral',
      eventId: newBankData.eventId !== undefined ? newBankData.eventId : oldAccount.eventId,
      eventName: newBankData.eventName || oldAccount.eventName || 'Geral',
      isDefault: false,
      status: 'Pendente de validação',
      createdAt: new Date().toLocaleString('pt-BR'),
      createdBy: this.state.currentUser.name,
      documents: newBankData.documentName ? [{
        id: `doc-${Date.now()}`,
        name: newBankData.documentName,
        type: newBankData.documentType || 'Comprovante bancário',
        uploadedAt: new Date().toLocaleDateString('pt-BR')
      }] : [{
        id: `doc-${Date.now()}`,
        name: 'novo_comprovante_bancario.pdf',
        type: 'Comprovante bancário',
        uploadedAt: new Date().toLocaleDateString('pt-BR')
      }]
    };

    producer.bankAccounts.unshift(newAccount);

    this.recordOperationEvent(
      { id: newId, protocol: newId, workflowId: `WF-${newId}`, producerId: producer.id, eventId: newAccount.eventId },
      `Alteração de conta bancária solicitada (v${version})`,
      `Substituição da conta ${oldAccount.bankName} Ag. ${oldAccount.agency}. Nova versão pendente de validação.`,
      'Contas Financeiras'
    );

    this.showToast('Alteração Solicitada', `Nova versão da conta gerada (v${version}). Aguardando validação para ativação.`, 'info');
    this.persist();
    this.notify();
    return newAccount;
  }

  // 4. Definir Conta Bancária Principal de Repasse do Produtor
  setProducerDefaultBankAccount(producerId, accountId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode definir a conta principal de repasse.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');
    if (!['Ativa', 'Validada & Ativa'].includes(account.status)) {
      throw new Error('Apenas contas bancárias ativas e homologadas podem ser definidas como principal.');
    }

    producer.bankAccounts.forEach(b => {
      b.isDefault = (b.id === accountId);
    });

    this.recordOperationEvent(
      { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
      'Conta bancária definida como principal de repasse',
      `${account.bankName} Ag. ${account.agency} / C. ${account.accountNumber} · Produtor ${producer.name}`,
      'Contas Financeiras'
    );
    this.showToast('Conta Principal Definida', `${account.bankName} é agora a conta padrão de repasses para ${producer.name}.`, 'success');
    this.persist();
    this.notify();
    return account;
  }

  // 5. Inativar / Reativar Conta Bancária (Bloqueia novos pagamentos sem apagar histórico)
  toggleProducerBankAccountStatus(producerId, accountId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode alterar a situação de contas bancárias.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');

    const operator = this.state.currentUser.name;
    const now = new Date().toLocaleString('pt-BR');

    if (['Ativa', 'Validada & Ativa'].includes(account.status)) {
      account.status = 'Inativa';
      account.inactivatedAt = now;
      account.inactivatedBy = operator;
      if (account.isDefault) account.isDefault = false;
      this.recordOperationEvent(
        { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
        'Conta bancária inativada',
        `Conta ${account.bankName} Ag. ${account.agency} inativada para novos pagamentos por ${operator}.`,
        'Contas Financeiras'
      );
      this.showToast('Conta Inativada', `Conta inativada para novos repasses. O histórico operacional permanece preservado.`, 'warning');
    } else {
      account.status = 'Ativa';
      account.reactivatedAt = now;
      account.reactivatedBy = operator;
      this.recordOperationEvent(
        { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
        'Conta bancária reativada',
        `Conta ${account.bankName} Ag. ${account.agency} reativada por ${operator}.`,
        'Contas Financeiras'
      );
      this.showToast('Conta Reativada', `Conta reativada com sucesso e apta para novos repasses.`, 'success');
    }

    this.persist();
    this.notify();
    return account;
  }

  // 6. Exclusão de Conta Bancária com Trava de Auditoria
  deleteProducerBankAccount(producerId, accountId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode excluir contas bancárias.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');

    // Trava mandatória: se possui histórico ou vinculações financeiras, exclusão é estritamente proibida
    const hasHistory = (account.version && account.version > 1) || account.replacesAccountId;
    const replacesOther = (producer.bankAccounts || []).some(b => b.replacesAccountId === account.id);
    const hasTransfers = (this.data.approvalQueue || []).some(a =>
      a.producerId === producerId && (
        (a.bankAccount && a.bankAccount.includes(account.agency)) ||
        (a.destinationAccount && a.destinationAccount.includes(account.agency)) ||
        ['Liquidado e Transferido', 'Concluído / Pago', 'Documento formalizado'].includes(a.status)
      )
    );

    if (hasHistory || replacesOther || hasTransfers) {
      throw new Error('Esta conta bancária possui histórico operacional e vinculações a repasses. Por governança e auditoria BACEN, ela não pode ser excluída. Utilize a opção "Inativar" para bloqueá-la preservando o rastro de auditoria contábil.');
    }

    producer.bankAccounts = producer.bankAccounts.filter(b => b.id !== accountId);
    this.recordOperationEvent(
      { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
      'Conta bancária excluída (Sem histórico)',
      `Conta ${account.bankName} removida do cadastro de ${producer.name}.`,
      'Contas Financeiras'
    );
    this.showToast('Conta Excluída', `Conta bancária removida com sucesso.`, 'info');
    this.persist();
    this.notify();
    return account;
  }

  // 7. Testar Chave PIX cadastrada (Consulta cadastral no DICT / BACEN via CIP)
  testPixKey(pixKey, pixType = 'CNPJ') {
    if (!pixKey || !pixKey.trim()) {
      throw new Error('Informe a chave PIX para consulta cadastral.');
    }
    const now = new Date().toLocaleString('pt-BR');
    const cleanKey = pixKey.trim();
    return {
      success: true,
      pixKey: cleanKey,
      pixType: pixType,
      participantBacen: 'DIRETÓRIO DICT / BACEN - CIP Homologado',
      statusDict: 'Ativa e Vinculada',
      accountHolder: 'Conferência Cadastral Positiva',
      queriedAt: now,
      message: `Consulta cadastral ao DICT/Bacen realizada com sucesso para a chave ${cleanKey}. Chave ativa e homologada para liquidação instantânea via SPI.`
    };
  }

  // 8. Anexar Documento Comprobatório ao Dossiê da Conta
  attachBankDocument(producerId, accountId, doc) {
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');

    account.documents = account.documents || [];
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: doc.name || 'documento_anexo.pdf',
      type: doc.type || 'Comprovante bancário',
      uploadedAt: new Date().toLocaleDateString('pt-BR'),
      uploadedBy: this.state.currentUser.name
    };
    account.documents.push(newDoc);

    this.recordOperationEvent(
      { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
      'Documento comprobatório anexado à conta',
      `${newDoc.name} (${newDoc.type})`,
      'Contas Financeiras'
    );
    this.showToast('Documento Anexado', `${newDoc.name} anexado ao dossiê da conta bancária.`, 'success');
    this.persist();
    this.notify();
    return newDoc;
  }

  // 9. Alterar Vinculação da Conta (Geral vs Evento Específico)
  updateBankBinding(producerId, accountId, bindingType, eventId = null) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode alterar vinculações de contas.');
    }
    const producer = this.data.producers.find(p => p.id === producerId);
    if (!producer) throw new Error('Produtor não encontrado.');
    const account = producer.bankAccounts?.find(b => b.id === accountId);
    if (!account) throw new Error('Conta bancária não encontrada.');

    const event = eventId && eventId !== 'all' ? this.data.events.find(e => e.id === eventId) : null;
    account.bindingType = bindingType || 'geral';
    account.eventId = bindingType === 'evento' ? eventId : null;
    account.eventName = bindingType === 'evento' ? (event?.name || 'Evento específico') : 'Geral (Todos os Eventos)';

    this.recordOperationEvent(
      { id: account.id, protocol: account.id, workflowId: `WF-${account.id}`, producerId: producer.id, eventId: account.eventId },
      'Vinculação de conta bancária atualizada',
      `${account.bankName} Ag. ${account.agency} vinculada a: ${account.eventName}`,
      'Contas Financeiras'
    );
    this.showToast('Vinculação Atualizada', `Conta vinculada com sucesso a: ${account.eventName}`, 'success');
    this.persist();
    this.notify();
    return account;
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

  // ==========================================================================
  // OPERAÇÕES DO PACOTE 14 (SPREAD, SPLIT, CONTAS A PAGAR, ESTORNOS)
  // ==========================================================================
  saveSpreadRule(payload, id = null) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode alterar regras de taxas.');
    }
    const chargedRate = Number(payload.chargedRate);
    const mdr = Number(payload.mdr);
    const fixedFee = Number(payload.fixedFee || 0);
    if (!payload.name?.trim() || !payload.acquirer?.trim()) {
      throw new Error('Informe regra e adquirente.');
    }
    if (chargedRate < 0 || mdr < 0 || chargedRate < mdr) {
      throw new Error('A taxa cobrada deve ser maior ou igual ao MDR pago pela Disk.');
    }
    if (!payload.paymentMethod) payload.paymentMethod = 'Cartão de Crédito';
    if (!payload.scopeType) payload.scopeType = 'Geral Disk';
    if (!payload.scopeId) payload.scopeId = 'all';

    const now = new Date().toLocaleString('pt-BR');
    let row = id ? this.data.spreadRules.find(x => x.id === id) : null;
    if (row) {
      row.history = row.history || [];
      row.history.unshift({
        version: row.version || 1,
        snapshot: { ...row, history: undefined },
        changedAt: now,
        changedBy: this.state.currentUser.name
      });
      Object.assign(row, payload, {
        chargedRate,
        mdr,
        fixedFee,
        version: (row.version || 1) + 1,
        updatedAt: now
      });
    } else {
      row = {
        id: `SPR-${Date.now()}`,
        ...payload,
        chargedRate,
        mdr,
        fixedFee,
        status: 'Ativa',
        version: 1,
        history: [],
        createdAt: now,
        updatedAt: now
      };
      this.data.spreadRules.unshift(row);
    }
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      id ? `Nova versão de taxa publicada (v${row.version})` : 'Regra de taxa criada',
      `${row.name} · ${row.acquirer} · ${row.scopeType} · Spread +${(chargedRate - mdr).toFixed(2)}%`,
      'Taxas e Regras Comerciais'
    );
    this.persist();
    this.notify();
    return row;
  }

  setSpreadRuleStatus(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = this.data.spreadRules.find(x => x.id === id);
    if (!row) throw new Error('Regra não encontrada.');
    row.status = row.status === 'Ativa' ? 'Inativa' : 'Ativa';
    row.updatedAt = new Date().toLocaleString('pt-BR');
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      `Regra de taxa ${row.status.toLowerCase()}`,
      `${row.name} (${row.acquirer})`,
      'Taxas e Regras Comerciais'
    );
    this.persist();
    this.notify();
    return row;
  }

  deleteSpreadRule(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = this.data.spreadRules.find(x => x.id === id);
    if (!row) throw new Error('Regra não encontrada.');
    if ((row.version || 1) > 1 || (row.history || []).length > 0) {
      throw new Error('Esta regra possui versões/histórico e não pode ser excluída. Inative-a para preservar a auditoria contábil e contratual.');
    }
    this.data.spreadRules = this.data.spreadRules.filter(x => x.id !== id);
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      'Regra de taxa excluída',
      `${row.name} (${row.id})`,
      'Taxas e Regras Comerciais'
    );
    this.persist();
    this.notify();
    return row;
  }

  // Resolução de Taxas Comerciais segundo a Hierarquia: Evento → Produtor → Geral Disk
  resolveCommercialFeeRule({ eventId = null, producerId = null, paymentMethod = 'Cartão de Crédito', installments = '1x' }) {
    const rules = (this.data.spreadRules || []).filter(r => r.status === 'Ativa');
    
    // 1. Prioridade Máxima: Regra específica do Evento
    if (eventId) {
      const eventRule = rules.find(r => r.scopeType === 'Evento' && r.scopeId === eventId && (r.paymentMethod === paymentMethod || !r.paymentMethod));
      if (eventRule) return { rule: eventRule, resolvedScope: 'Evento', priority: 1 };
    }

    // 2. Prioridade Secundária: Regra negociada do Produtor
    if (producerId) {
      const prodRule = rules.find(r => r.scopeType === 'Produtor' && r.scopeId === producerId && (r.paymentMethod === paymentMethod || !r.paymentMethod));
      if (prodRule) return { rule: prodRule, resolvedScope: 'Produtor', priority: 2 };
    }

    // 3. Regra Padrão Geral Disk
    const generalRule = rules.find(r => (!r.scopeType || r.scopeType === 'Geral Disk') && (r.paymentMethod === paymentMethod || !r.paymentMethod));
    if (generalRule) return { rule: generalRule, resolvedScope: 'Geral Disk', priority: 3 };

    return { rule: rules[0] || null, resolvedScope: 'Padrão Geral', priority: 4 };
  }

  saveSplitRule({ eventId, name, beneficiaries }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode publicar regras de divisão.');
    }
    const total = beneficiaries.reduce((a, b) => a + Number(b.percent || 0), 0);
    if (Math.abs(total - 100) > 0.001) {
      throw new Error('A soma dos percentuais deve ser exatamente 100%.');
    }
    const old = this.data.splitRules.find(x => x.eventId === eventId && x.status === 'Ativa');
    if (old) old.status = 'Substituída';
    const row = {
      id: `SPL-${Date.now()}`,
      eventId,
      name: name || 'Regra de divisão',
      beneficiaries,
      status: 'Ativa',
      updatedAt: new Date().toLocaleString('pt-BR')
    };
    this.data.splitRules.unshift(row);
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      'Regra de split publicada',
      `Evento ${eventId} · 100% distribuído`,
      'Divisão de Receitas'
    );
    this.notify();
    return row;
  }

  createPayable({ creditor, dueDate, amount, notes = '' }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode criar lançamentos financeiros.');
    }
    const n = Number(amount);
    if (!creditor?.trim() || !dueDate || !n || n <= 0) {
      throw new Error('Preencha credor, vencimento e valor válido.');
    }
    const row = {
      id: `PAG-${Date.now()}`,
      creditor,
      dueDate,
      amount: n,
      notes,
      status: 'Pendente',
      createdAt: new Date().toLocaleString('pt-BR')
    };
    this.data.payables.unshift(row);
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      'Conta a pagar cadastrada',
      `${creditor} · R$ ${n.toFixed(2)} vencimento em ${dueDate}`,
      'Contas a Pagar / Advanced'
    );
    this.notify();
    return row;
  }

  createRefundRequest({ orderId, customer, eventName, amount, paymentMethod, reason }) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Somente o Financeiro Disk pode registrar estorno administrativo.');
    }
    const n = Number(amount);
    if (!orderId?.trim() || !n || n <= 0 || !reason?.trim()) {
      throw new Error('Informe pedido, valor e motivo.');
    }
    const id = `EST-${Date.now()}`;
    const row = {
      id,
      protocol: id,
      workflowId: `WF-${id}`,
      type: 'Estorno',
      producerId: this.state.selectedProducerId,
      eventId: this.state.selectedEventId === 'all' ? null : this.state.selectedEventId,
      producerName: this.getState().activeProducer?.name || '—',
      eventName: eventName || 'Evento não informado',
      customer: customer || '—',
      requestedAmount: n,
      paymentMethod: paymentMethod || 'Não informado',
      reason,
      status: 'Aguardando análise',
      requestDate: new Date().toLocaleString('pt-BR'),
      signatures: { producer: { signed: false }, disk: { signed: false, lockedUntilProducerSigns: true } },
      auditTrail: [],
      rejection: null
    };
    this.data.refundRequests.unshift(row);
    this.data.approvalQueue.unshift(row);
    this.recordOperationEvent(
      row,
      'Solicitação de estorno criada',
      `${orderId} · R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Central de Estornos'
    );
    this.notify();
    return row;
  }

  liquidatePayable(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Liquidação permitida somente ao Financeiro Disk.');
    }
    const row = this.data.payables.find(x => x.id === id);
    if (!row) throw new Error('Título não encontrado.');
    if (row.status === 'Pago') throw new Error('Título já liquidado.');
    row.status = 'Pago';
    row.paidAt = new Date().toLocaleString('pt-BR');
    row.authCode = `PIX-${Date.now()}`;
    this.data.ledgerEntries.unshift({
      id: `LEDG-${Date.now()}`,
      timestamp: row.paidAt,
      eventType: 'CONTA_PAGAR_LIQUIDADA',
      producerId: null,
      eventId: null,
      debitAccount: `Despesa: ${row.creditor}`,
      creditAccount: 'Ativo: Conta Bancária Disk',
      amount: row.amount,
      refOrder: row.id,
      conciliated: false
    });
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      'Conta a pagar liquidada no caixa',
      `Pago R$ ${row.amount.toFixed(2)} via ${row.authCode}`,
      'Tesouraria / Advanced'
    );
    this.notify();
    return row;
  }

  resetDemoData() {
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(this.storageKey); } catch (_) {}
    this.data = getFreshDatabase();
    this.enrichApprovalQueueWithAuditAndSignatures();
    this.data.__p12Enriched = true;
    this.ensureOperationModel();
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
