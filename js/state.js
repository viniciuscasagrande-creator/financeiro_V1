/**
 * Core Financeiro Unificado - Gerenciador de Estado Reativo
 * Padrão de Arquitetura Limitless: Trilha de Auditoria, Fluxo Formal de Assinaturas e Autenticação
 */
import { getFreshDatabase } from './mockData.js';

export class CoreFinanceiroStore {
  constructor() {
    this.storageKey = 'disk-financeiro-v1-p21-2';
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
          name: "Maria Valente",
          role: "disk",
          email: "maria.valente@diskingressos.com.br",
          title: "Mesa de Operações & Tesouraria",
          producerId: null
        };
        this.state.viewMode = 'disk';
        this.state.currentView = 'diskDashboard';
        this.state.selectedProducerId = 'all';
        this.state.selectedEventId = 'all';
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

  loadPersistedData() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
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
      { id:'SPR-001', name:'Cartão Crédito 2 a 6x', acquirer:'Cielo', paymentMethod:'Cartão de Crédito', brand:'Visa/Mastercard', installments:'2 a 6x', chargedRate:8.00, mdr:2.80, fixedFee:0.80, payer:'Comprador', term:'D+30', scopeType:'Geral Disk', scopeId:'all', validFrom:'2026-09-01', validTo:'', status:'Ativa', version:1, history:[] },
      { id:'SPR-002', name:'Cartão Crédito à Vista', acquirer:'Rede', paymentMethod:'Cartão de Crédito', brand:'Visa/Mastercard', installments:'1x', chargedRate:4.80, mdr:2.00, fixedFee:0.50, payer:'Produtor', term:'D+14', scopeType:'Geral Disk', scopeId:'all', validFrom:'2026-09-01', validTo:'', status:'Ativa', version:1, history:[] },
      { id:'SPR-003', name:'PIX Instantâneo', acquirer:'EfiPix', paymentMethod:'PIX', brand:'—', installments:'À vista', chargedRate:1.50, mdr:0.40, fixedFee:0, payer:'Produtor', term:'D+0', scopeType:'Geral Disk', scopeId:'all', validFrom:'2026-09-01', validTo:'', status:'Ativa', version:1, history:[] }
    ];
    this.data.gatewayConfigs = this.data.gatewayConfigs || (this.data.gateways || []).map((g,i)=>({
      id:g.id, name:g.name, providerType:'Adquirente / Gateway', environment:i===3?'Sandbox':'Produção', enabled:!g.status.includes('Backup'), connectionStatus:i===3?'Não configurado':'Configuração local',
      merchantId:i===0?'••••8421':'••••'+String(5100+i), clientId:'••••••••'+String(2100+i), secretConfigured:i!==3,
      cards:['Visa','Mastercard','Elo'], pix:{enabled:i!==3, keyType:'CNPJ', term:i===0?'D+0':'D+1'}, boleto:{enabled:i<2, bank:i===0?'Banco do Brasil':'Itaú', wallet:i===0?'17':'109'},
      installments:{max:12, interestFrom:7}, antifraud:{enabled:true, provider:i%2===0?'ClearSale':'Konduto'}, webhooks:{enabled:i!==3, urlConfigured:i!==3},
      updatedAt:'30/09/2026 09:30', logs:[]
    }));
    this.data.splitRules = this.data.splitRules || [{ id:'SPL-001', eventId:'evt-001', name:'Regra padrão do evento', status:'Ativa', beneficiaries:[
      {name:'Organizador (Principal)',percent:70},{name:'Afiliado / Coprodutor',percent:10},{name:'Produtor Artístico',percent:15},{name:'Plataforma DiskIngressos',percent:5}
    ], updatedAt:new Date().toLocaleString('pt-BR') }];
    this.data.payables = this.data.payables || [
      {id:'PAG-001', creditor:'Mega Som & Iluminação', dueDate:'19/07/2026', amount:14500, status:'Pendente'},
      {id:'PAG-002', creditor:'Segurança Forte Ltda', dueDate:'12/07/2026', amount:9800, status:'Pendente'},
      {id:'PAG-003', creditor:'Agência Tráfego Ads', dueDate:'05/07/2026', amount:7600, status:'Pendente'}
    ];
    this.data.refundRequests = this.data.refundRequests || [];
    this.data.approvalQueue = (this.data.approvalQueue || []).map(item => ({
      ...item,
      protocol: item.protocol || item.id,
      workflowId: item.workflowId || `WF-${item.id}`,
      updatedAt: item.updatedAt || item.requestDate || new Date().toLocaleString('pt-BR')
    }));
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
    const activeProd = this.data.producers.find(p => p.id === this.state.selectedProducerId) || this.data.producers[0];
    return {
      ...this.state,
      data: {
        ...this.data,
        producer: activeProd,
        bankAccounts: activeProd.bankAccounts || [],
        consolidatedTotals: activeProd.totals || {
          grossSales: 890000.00,
          netSales: 801000.00,
          totalBalance: 785000.00,
          availableBalance: 310000.00,
          futureReceivables: 245000.00,
          transferredAmount: 920000.00,
          blockedBalance: 25000.00,
          refundsAndChargebacks: 15000.00
        }
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
    if (this.state.currentUser.role !== 'producer') throw new Error('Somente o Produtor pode criar esta solicitação neste fluxo.');
    if (!event || event.producerId !== producer.id) throw new Error('Evento inválido para este produtor.');
    if (!numericAmount || numericAmount <= 0) throw new Error('Informe um valor válido para o repasse.');
    if (numericAmount > event.availableBalance) throw new Error('Saldo disponível insuficiente para este repasse.');
    if (!bank) throw new Error('Cadastre ou selecione uma conta bancária válida.');

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
        bankDataValidated: !!bank && bank.status !== 'PENDENTE' && bank.status !== 'INATIVA',
        eventRegular: ['Vendas Abertas', 'Últimos Ingressos', 'Ativo', 'Em andamento'].includes(event.status),
        noActiveBlocks: !producer.hasBlock && Number(event.blockedBalance || 0) === 0,
        limitPermitted: numericAmount <= this.getTransferableAmount(event),
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
      notes: notes || "Solicitado pelo Produtor via Portal",
      createdByUserId: this.state.currentUser.id
    };

    // Insere no topo da Fila
    this.data.approvalQueue.unshift(newApprovalItem);

    // Reserva operacional: o valor deixa de ficar livre, mas ainda não foi pago.
    event.reservedBalance = (event.reservedBalance || 0) + numericAmount;
    newApprovalItem.reservation = { type: "SALDO_DISPONIVEL", amount: numericAmount, status: "Reservado" };
    event.availableBalance = Math.max(0, event.availableBalance - numericAmount);
    producer.totals.availableBalance = Math.max(0, producer.totals.availableBalance - numericAmount);

    this.showToast(
      "🔔 Nova Solicitação Enviada",
      `${producer.name} · ${event.name} — R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado para análise da Disk.`,
      "warning"
    );

    this.recordOperationEvent(newApprovalItem, 'Solicitação enviada', 'Saldo reservado e encaminhado ao Financeiro Disk', 'Ambiente Produtor');
    this.notify();
    return newApprovalItem;
  }

  // 1B. Produtor solicita Antecipação de Recebíveis
  requestAnticipation({ eventId, amount, notes }) {
    const producer = this.getState().activeProducer;
    const event = this.data.events.find(e => e.id === eventId && e.producerId === producer.id);
    if (!event) throw new Error("Evento inválido para este produtor.");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || numericAmount > event.futureReceivables) {
      throw new Error("Valor de antecipação superior aos recebíveis futuros disponíveis.");
    }
    const rate = Number(producer.contract?.anticipationRateMonthly || this.data.anticipations.monthlyRate || 0);
    const fee = numericAmount * (rate / 100);
    const net = numericAmount - fee;
    const bank = producer.bankAccounts.find(b => b.isDefault) || producer.bankAccounts[0];
    const now = new Date();
    const id = `ANT-${Math.floor(10000 + Math.random() * 90000)}`;
    const item = {
      id, protocol: id, workflowId: `WF-${id}`, type: "Antecipação", producerId: producer.id, producerName: producer.name,
      eventId: event.id, eventName: event.name, requestedAmount: numericAmount, netAmount: net,
      anticipationFee: fee, anticipationRate: rate,
      requestDate: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,
      status: "Aguardando análise", stepIndex: 1,
      documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      documentTitle: "Contrato de Antecipação de Recebíveis",
      bankName: bank?.bankName || "Conta principal", bankAccount: bank ? `${bank.agency} • ${bank.accountNumber}` : "—", pixKey: bank?.pixKey || "—",
      checklist: { balanceSufficient: numericAmount <= event.futureReceivables, bankDataValidated: !!bank && bank.status !== 'PENDENTE' && bank.status !== 'INATIVA', eventRegular: ['Vendas Abertas','Últimos Ingressos','Ativo','Em andamento'].includes(event.status), noActiveBlocks: !producer.hasBlock && Number(event.blockedBalance || 0) === 0, limitPermitted: numericAmount <= event.futureReceivables, chargebackWarning: event.chargebackCases > 0 ? `${event.chargebackCases} chargeback(s) sob monitoramento` : 'Sem pendências' },
      auditPosition: { grossSales: event.grossSales, netRevenue: event.netRevenue, availableBefore: event.futureReceivables, requested: numericAmount, availableAfter: event.futureReceivables - numericAmount },
      signatures: { producer: { signed:false,signedBy:null,signedAt:null,ip:null,certAuth:null }, disk: { signed:false,signedBy:null,signedAt:null,ip:null,certAuth:null,lockedUntilProducerSigns:true } },
      reservation: { type: "RECEBIVEL_FUTURO", amount: numericAmount, status: "Reservado" },
      auditTrail: [
        { timestamp: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), actor: `${this.state.currentUser.name} (Produtor)`, action: "Criou solicitação de antecipação", details: `Bruto R$ ${numericAmount.toLocaleString('pt-BR',{minimumFractionDigits:2})} · Líquido R$ ${net.toLocaleString('pt-BR',{minimumFractionDigits:2})}` },
        { timestamp: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), actor: "Sistema Disk", action: "Reservou recebíveis futuros", details: `R$ ${numericAmount.toLocaleString('pt-BR',{minimumFractionDigits:2})}` }
      ], rejection:null, notes: notes || "Solicitado pelo Produtor via Portal", createdByUserId: this.state.currentUser.id
    };
    this.data.approvalQueue.unshift(item);
    event.futureReceivables -= numericAmount;
    event.reservedReceivables = (event.reservedReceivables || 0) + numericAmount;
    producer.totals.futureReceivables = Math.max(0, producer.totals.futureReceivables - numericAmount);
    producer.totals.reservedReceivables = (producer.totals.reservedReceivables || 0) + numericAmount;
    this.data.anticipations.history.unshift({ id, requestDate: now.toLocaleDateString('pt-BR'), eventName:event.name, grossRequested:numericAmount, netReleased:net, feeDeducted:fee, status:"Aguardando análise", effectiveDate:"—" });
    this.recordOperationEvent(item, 'Antecipação enviada', 'Recebíveis reservados e encaminhados ao Financeiro Disk', 'Ambiente Produtor');
    this.notify();
    return item;
  }

  // 2. Financeiro Disk: Aprova a Operação (Gera Documento e Aguarda Assinatura do Produtor)
  approveOperationByDisk(requestId) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Aprovação permitida somente ao Financeiro Disk.');
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error('Solicitação não encontrada.');
    if (!['Aguardando análise', 'Em análise'].includes(item.status)) {
      throw new Error(`Operação ${item.id} não pode ser aprovada no status ${item.status}.`);
    }
    this.assertSegregation(item, 'APROVAR');
    if (!this.isChecklistValid(item.checklist)) {
      throw new Error('Aprovação bloqueada: checklist financeiro possui validações pendentes.');
    }

    const operator = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.status = "Aguardando assinatura do Produtor";
    item.stepIndex = 3;
    item.approvedBy = operator;
    item.approvedByUserId = this.state.currentUser.id;
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

  // 3. Financeiro Disk: Rejeita a Operação Formalmente (com motivo obrigatório e registro no histórico)
  rejectOperationByDisk(requestId, { reasonCategory, observation }) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Rejeição permitida somente ao Financeiro Disk.');
    if (!reasonCategory || !observation?.trim()) throw new Error('Informe motivo e observação para rejeitar.');
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error('Solicitação não encontrada.');
    if (!['Aguardando análise', 'Em análise'].includes(item.status)) {
      throw new Error(`Operação ${item.id} não pode ser rejeitada no status ${item.status}.`);
    }
    this.assertSegregation(item, 'REJEITAR');

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
      event.reservedBalance = Math.max(0, (event.reservedBalance || 0) - item.requestedAmount);
    } else if (event && item.type === "Antecipação") {
      event.futureReceivables += item.requestedAmount;
      event.reservedReceivables = Math.max(0, (event.reservedReceivables || 0) - item.requestedAmount);
    }
    const producer = this.data.producers.find(p => p.id === item.producerId);
    if (producer && item.type === "Repasse") {
      producer.totals.availableBalance += item.requestedAmount;
      producer.totals.reservedBalance = Math.max(0, (producer.totals.reservedBalance || 0) - item.requestedAmount);
    } else if (producer && item.type === "Antecipação") {
      producer.totals.futureReceivables += item.requestedAmount;
      producer.totals.reservedReceivables = Math.max(0, (producer.totals.reservedReceivables || 0) - item.requestedAmount);
    }

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: `${operator} (Financeiro Disk)`, action: "Rejeitou a solicitação", details: `Motivo: ${reasonCategory} — Obs: ${observation}` }
    );

    this.recordOperationEvent(item, 'Operação rejeitada', `${reasonCategory}: ${observation}`, 'Central de Aprovações');

    this.showToast(
      "✕ Solicitação Rejeitada",
      `A solicitação ${item.id} foi rejeitada (${reasonCategory}). O produtor foi notificado e o saldo foi restabelecido.`,
      "danger"
    );

    this.notify();
  }

  // 4. Produtor Assina Digitalmente em Primeiro Lugar
  signByProducer(requestId) {
    if (this.state.currentUser.role !== 'producer') throw new Error('A assinatura do Produtor deve ocorrer no ambiente do Produtor.');
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    if (item.signatures.producer.signed) throw new Error('Documento já assinado pelo Produtor.');
    if (item.status !== "Aguardando assinatura do Produtor" && item.status !== "Aprovado") {
      throw new Error(`Documento indisponível para assinatura do Produtor no status ${item.status}.`);
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

  // 5. Financeiro Disk Assina (SEMPRE POR ÚLTIMO) e Formaliza
  signByDisk(requestId) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Assinatura final permitida somente ao Financeiro Disk.');
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    // TRAVA OBRIGATÓRIA DO SISTEMA: O Financeiro NUNCA assina antes do Produtor
    if (!item.signatures.producer.signed) {
      throw new Error("BLOQUEIO DE SEGURANÇA: O Financeiro Disk é sempre o último signatário.");
    }
    if (item.signatures.disk.signed) throw new Error('Documento já assinado pelo Financeiro Disk.');
    if (item.status !== 'Aguardando assinatura do Financeiro') throw new Error(`Status inválido para assinatura final: ${item.status}.`);
    this.assertSegregation(item, 'ASSINAR_DISK');

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

  // 6. Liberação Financeira / Transferência (PIX / TED / CNAB) → Ledger → Conciliação → Concluído / Pago
  executeFinalTransfer(requestId) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Liquidação permitida somente ao Financeiro Disk.');
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error('Solicitação não encontrada.');
    if (item.status === 'Pago' || item.paidDate || item.liquidationId) {
      throw new Error(`Liquidação duplicada bloqueada para ${item.id}.`);
    }
    if (!item.signatures.disk.signed || !item.signatures.producer.signed || item.status !== 'Documento assinado') {
      throw new Error("BLOQUEIO: a liquidação exige aprovação e ambas as assinaturas concluídas.");
    }
    this.assertSegregation(item, 'LIQUIDAR');

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.status = "Pago";
    item.stepIndex = 5;
    item.paidDate = `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`;
    item.authCode = `DEMO-${Date.now()}`;
    item.liquidationId = `LIQ-${item.id}`;

    const event = this.data.events.find(e => e.id === item.eventId);
    if (event) {
      event.payoutsDone += (item.netAmount || item.requestedAmount);
      if (item.type === "Repasse") event.reservedBalance = Math.max(0, (event.reservedBalance || 0) - item.requestedAmount);
      if (item.type === "Antecipação") event.reservedReceivables = Math.max(0, (event.reservedReceivables || 0) - item.requestedAmount);
    }
    const producer = this.data.producers.find(p => p.id === item.producerId);
    if (producer) {
      producer.totals.transferredAmount += (item.netAmount || item.requestedAmount);
      if (item.type === "Repasse") producer.totals.reservedBalance = Math.max(0, (producer.totals.reservedBalance || 0) - item.requestedAmount);
      if (item.type === "Antecipação") producer.totals.reservedReceivables = Math.max(0, (producer.totals.reservedReceivables || 0) - item.requestedAmount);
    }

    // Registra débito oficial no Ledger em partidas dobradas
    const ledgerId = `LEDG-${Math.floor(10000 + Math.random() * 90000)}`;
    this.data.ledgerEntries.unshift({
      id: ledgerId,
      timestamp: `${new Date().toLocaleDateString('pt-BR')} ${nowTime}`,
      eventType: "REPASSE_LIQUIDADO_PAGO",
      producerId: item.producerId,
      eventId: item.eventId,
      debitAccount: `Passivo: Saldo Produtor ${item.producerName}`,
      creditAccount: `Ativo: Conta Corrente Banco do Brasil (001) Disk`,
      amount: item.requestedAmount || item.netAmount,
      netProducer: item.requestedAmount || item.netAmount,
      feeDisk: 0.00,
      refOrder: item.id,
      conciliated: false,
      simulation: true
    });

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: "Tesouraria Disk", action: "Liquidação registrada em modo demonstração", details: `Referência interna: ${item.authCode}` },
      { timestamp: `${nowTime}`, actor: "Motor Financeiro", action: `Ledger atualizado (${ledgerId})`, details: "Lançamento pendente de conciliação bancária real" },
      { timestamp: `${nowTime}`, actor: "Conciliação Bancária", action: "Aguardando retorno bancário/API homologada", details: "Não conciliado automaticamente na demonstração" }
    );

    this.recordOperationEvent(item, 'Liquidação registrada; conciliação pendente', `Ledger ${ledgerId} · ${item.authCode}`, 'Tesouraria / Conciliação');

    this.showToast(
      "Liquidação registrada em modo demonstração",
      `${item.id}: lançamento financeiro registrado. A confirmação bancária real permanece pendente.`,
      "success"
    );

    this.notify();
  }


  getEventRestrictions(event) {
    return {
      reserved: Number(event?.reservedBalance || 0),
      retained: Number(event?.retainedBalance || 0),
      blocked: Number(event?.blockedBalance || 0)
    };
  }

  getTransferableAmount(event) {
    const base = Number(event?.financialBalance ?? event?.availableBalance ?? 0);
    const { reserved, retained, blocked } = this.getEventRestrictions(event);
    return Math.max(0, base - reserved - retained - blocked);
  }

  isChecklistValid(checklist = {}) {
    return checklist.balanceSufficient === true && checklist.bankDataValidated === true &&
      checklist.eventRegular === true && checklist.noActiveBlocks === true && checklist.limitPermitted === true;
  }

  assertSegregation(item, action) {
    const userId = this.state.currentUser.id;
    if (!userId) throw new Error('Usuário autenticado inválido.');
    if (item.createdByUserId && item.createdByUserId === userId && ['APROVAR','REJEITAR'].includes(action)) {
      throw new Error('Segregação de funções: o criador da operação não pode decidir a própria operação.');
    }
    if (item.approvedByUserId && item.approvedByUserId === userId && action === 'LIQUIDAR') {
      throw new Error('Segregação de funções: quem aprova não pode liquidar a mesma operação.');
    }
  }


  saveGatewayConfig(payload, id = null) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Ação restrita ao Financeiro Disk.');
    if (!payload.name?.trim()) throw new Error('Informe o nome do gateway/adquirente.');
    const now=new Date().toLocaleString('pt-BR');
    let row=id ? this.data.gatewayConfigs.find(x=>x.id===id) : null;
    if(row){ Object.assign(row,payload,{updatedAt:now}); }
    else { row={id:`gw-${Date.now()}`,providerType:'Gateway / Adquirente',environment:'Sandbox',enabled:false,connectionStatus:'Não configurado',cards:[],pix:{enabled:false},boleto:{enabled:false},installments:{max:12,interestFrom:7},antifraud:{enabled:false},webhooks:{enabled:false},logs:[],...payload,updatedAt:now}; this.data.gatewayConfigs.unshift(row); }
    row.logs=row.logs||[]; row.logs.unshift({at:now,action:id?'Configuração atualizada':'Gateway cadastrado',actor:this.state.currentUser.name});
    this.notify(); return row;
  }

  toggleGateway(id){
    const row=this.data.gatewayConfigs.find(x=>x.id===id); if(!row) throw new Error('Gateway não encontrado.');
    row.enabled=!row.enabled; row.updatedAt=new Date().toLocaleString('pt-BR');
    row.logs=row.logs||[]; row.logs.unshift({at:row.updatedAt,action:row.enabled?'Ativado':'Inativado',actor:this.state.currentUser.name}); this.notify(); return row;
  }

  updateGatewaySection(id, section, data){
    const row=this.data.gatewayConfigs.find(x=>x.id===id); if(!row) throw new Error('Gateway não encontrado.');
    row[section]={...(row[section]||{}),...data}; row.updatedAt=new Date().toLocaleString('pt-BR');
    row.logs=row.logs||[]; row.logs.unshift({at:row.updatedAt,action:`${section} atualizado`,actor:this.state.currentUser.name}); this.notify(); return row;
  }

  testGatewayConnection(id){
    const row=this.data.gatewayConfigs.find(x=>x.id===id); if(!row) throw new Error('Gateway não encontrado.');
    const now=new Date().toLocaleString('pt-BR');
    const ready=!!row.secretConfigured && !!row.clientId && !!row.merchantId;
    row.connectionStatus=ready?'Credenciais cadastradas — teste real depende do backend':'Não configurado';
    row.logs=row.logs||[]; row.logs.unshift({at:now,action:'Teste solicitado',actor:this.state.currentUser.name,result:row.connectionStatus}); this.notify(); return {row,ready};
  }

  saveSpreadRule(payload, id = null) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Somente o Financeiro Disk pode alterar regras de taxas e spread.');
    const chargedRate=Number(payload.chargedRate), mdr=Number(payload.mdr), fixedFee=Number(payload.fixedFee||0);
    if (!payload.name?.trim() || !payload.acquirer?.trim()) throw new Error('Informe a regra e a adquirente.');
    if (!Number.isFinite(chargedRate) || !Number.isFinite(mdr) || chargedRate < 0 || mdr < 0 || chargedRate < mdr) throw new Error('A taxa cobrada deve ser maior ou igual ao MDR.');
    if (!payload.paymentMethod) throw new Error('Informe o meio de pagamento.');
    if (!payload.scopeType) payload.scopeType='Geral Disk';
    const now=new Date().toLocaleString('pt-BR');
    let row=id ? this.data.spreadRules.find(x=>x.id===id) : null;
    if (row) {
      row.history=row.history||[];
      row.history.unshift({version:row.version||1, snapshot:{...row,history:undefined}, changedAt:now, changedBy:this.state.currentUser.name});
      Object.assign(row,payload,{chargedRate,mdr,fixedFee,version:(row.version||1)+1,updatedAt:now});
    } else {
      row={id:`SPR-${Date.now()}`, ...payload, chargedRate,mdr,fixedFee,status:'Ativa',version:1,history:[],createdAt:now,updatedAt:now};
      this.data.spreadRules.unshift(row);
    }
    this.data.operationEvents.unshift({id:`EVT-${Date.now()}`,protocol:row.id,module:'Taxas e Regras Comerciais',action:id?'Nova versão de taxa publicada':'Regra de taxa criada',details:`${row.name} · ${row.acquirer} · ${row.scopeType} · Spread ${(chargedRate-mdr).toFixed(2)}%`,actor:this.state.currentUser.name,timestamp:now});
    this.notify(); return row;
  }

  setSpreadRuleStatus(id) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Ação restrita ao Financeiro Disk.');
    const row=this.data.spreadRules.find(x=>x.id===id); if(!row) throw new Error('Regra não encontrada.');
    row.status=row.status==='Ativa'?'Inativa':'Ativa'; row.updatedAt=new Date().toLocaleString('pt-BR');
    this.data.operationEvents.unshift({id:`EVT-${Date.now()}`,protocol:row.id,module:'Taxas e Regras Comerciais',action:`Regra ${row.status.toLowerCase()}`,details:row.name,actor:this.state.currentUser.name,timestamp:row.updatedAt});
    this.notify(); return row;
  }

  deleteSpreadRule(id) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Ação restrita ao Financeiro Disk.');
    const row=this.data.spreadRules.find(x=>x.id===id); if(!row) throw new Error('Regra não encontrada.');
    if ((row.version||1)>1 || (row.history||[]).length) throw new Error('Esta regra possui histórico e não pode ser excluída. Inative-a para preservar a auditoria.');
    this.data.spreadRules=this.data.spreadRules.filter(x=>x.id!==id); this.notify(); return row;
  }

  saveReconciliationResolution(id, payload) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Ação restrita ao Financeiro Disk.');
    if (!this.data.reconciliationItems) this.data.reconciliationItems = [
      {id:'CON-001',camada:'Adquirentes',origem:'Adquirente → Recebível',ref:'LIQ-20260929-0182',produtor:'Produtora ABC',evento:'Festival de Verão',esperado:184520,realizado:184520,status:'Conciliado'},
      {id:'CON-002',camada:'Gateways',origem:'Gateway → Adquirente',ref:'GTW-20260929-7710',produtor:'Produtora XYZ',evento:'Arena Music',esperado:96340.5,realizado:96340.5,status:'Conciliado'},
      {id:'CON-003',camada:'PIX/CNAB',origem:'Banco → PIX',ref:'PIX-20260929-4412',produtor:'Produtora ABC',evento:'Festival de Verão',esperado:48200,realizado:48150,status:'Divergência'},
      {id:'CON-004',camada:'Repasses',origem:'Repasse → Banco',ref:'REP-000128',produtor:'Produtora ABC',evento:'Festival de Verão',esperado:50000,realizado:50000,status:'Em análise'}
    ];
    const row=this.data.reconciliationItems.find(x=>x.id===id); if(!row) throw new Error('Item de conciliação não encontrado.');
    if(!payload.cause || !payload.owner || !payload.action || !payload.evidence) throw new Error('Informe causa, responsável, ação corretiva e evidência/observação.');
    row.status='Resolvida'; row.resolution={...payload,resolvedAt:new Date().toLocaleString('pt-BR'),resolvedBy:this.state.currentUser.name};
    this.data.operationEvents.unshift({id:`EVT-${Date.now()}`,protocol:row.ref,module:'Conciliação',action:'Divergência tratada',details:`${payload.cause} · ${payload.action}. Valores originais preservados.`,actor:this.state.currentUser.name,timestamp:row.resolution.resolvedAt});
    this.notify(); return row;
  }

  saveSplitRule({eventId,name,beneficiaries}) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Somente o Financeiro Disk pode publicar regras de divisão.');
    const total=beneficiaries.reduce((a,b)=>a+Number(b.percent||0),0);
    if (Math.abs(total-100)>0.001) throw new Error('A soma dos percentuais deve ser exatamente 100%.');
    const old=this.data.splitRules.find(x=>x.eventId===eventId && x.status==='Ativa'); if(old) old.status='Substituída';
    const row={id:`SPL-${Date.now()}`,eventId,name:name||'Regra de divisão',beneficiaries,status:'Ativa',updatedAt:new Date().toLocaleString('pt-BR')};
    this.data.splitRules.unshift(row);
    this.data.operationEvents.unshift({id:`EVT-${Date.now()}`,protocol:row.id,module:'Divisão de Receitas',action:'Regra de split publicada',details:`Evento ${eventId} · 100% distribuído`,actor:this.state.currentUser.name,timestamp:row.updatedAt});
    this.notify(); return row;
  }

  createPayable({creditor,dueDate,amount,notes=''}) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Somente o Financeiro Disk pode criar lançamentos financeiros.');
    const n=Number(amount); if(!creditor?.trim()||!dueDate||!n||n<=0) throw new Error('Preencha credor, vencimento e valor válido.');
    const row={id:`PAG-${Date.now()}`,creditor,dueDate,amount:n,notes,status:'Pendente',createdAt:new Date().toLocaleString('pt-BR')};
    this.data.payables.unshift(row); this.notify(); return row;
  }

  createRefundRequest({orderId,customer,eventName,amount,paymentMethod,reason}) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Somente o Financeiro Disk pode registrar estorno administrativo.');
    const n=Number(amount); if(!orderId?.trim()||!n||n<=0||!reason?.trim()) throw new Error('Informe pedido, valor e motivo.');
    const id=`EST-${Date.now()}`;
    const row={id,protocol:id,workflowId:`WF-${id}`,type:'Estorno',producerId:this.state.selectedProducerId,eventId:this.state.selectedEventId==='all'?null:this.state.selectedEventId,producerName:this.getState().activeProducer?.name||'—',eventName:eventName||'Evento não informado',customer:customer||'—',requestedAmount:n,paymentMethod:paymentMethod||'Não informado',reason,status:'Aguardando análise',requestDate:new Date().toLocaleString('pt-BR'),signatures:{producer:{signed:false},disk:{signed:false,lockedUntilProducerSigns:true}},auditTrail:[],rejection:null};
    this.data.refundRequests.unshift(row); this.data.approvalQueue.unshift(row);
    this.recordOperationEvent(row,'Solicitação de estorno criada',`${orderId} · R$ ${n.toLocaleString('pt-BR',{minimumFractionDigits:2})}`,'Central de Estornos');
    this.notify(); return row;
  }

  liquidatePayable(id) {
    if (!['disk','admin'].includes(this.state.currentUser.role)) throw new Error('Liquidação permitida somente ao Financeiro Disk.');
    const row=this.data.payables.find(x=>x.id===id); if(!row) throw new Error('Título não encontrado.');
    if(row.status==='Pago') throw new Error('Título já liquidado.');
    row.status='Pago'; row.paidAt=new Date().toLocaleString('pt-BR'); row.authCode=`PIX-${Date.now()}`;
    this.data.ledgerEntries.unshift({id:`LEDG-${Date.now()}`,timestamp:row.paidAt,eventType:'CONTA_PAGAR_LIQUIDADA',producerId:null,eventId:null,debitAccount:`Despesa: ${row.creditor}`,creditAccount:'Ativo: Conta Bancária Disk',amount:row.amount,refOrder:row.id,conciliated:false});
    this.notify(); return row;
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
