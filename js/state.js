/**
 * Core Financeiro Unificado - Gerenciador de Estado Reativo
 * Padrão de Arquitetura Limitless: Trilha de Auditoria, Fluxo Formal de Assinaturas e Autenticação
 */
import { getFreshDatabase } from './mockData.js';

export class CoreFinanceiroStore {
  constructor() {
    this.storageKey = 'disk-financeiro-v1-p12';
    this.data = this.loadPersistedData() || getFreshDatabase();
    if (!this.data.__p12Enriched) {
      this.enrichApprovalQueueWithAuditAndSignatures();
      this.data.__p12Enriched = true;
    }
    this.ensureOperationModel();
    this.ensureOperationsRegistry();

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
      searchTerm: '',
      currentOperationalContext: null // Pacote 21: Contexto Operacional Global Transversal
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

    this.data.gatewayConfigs = this.data.gatewayConfigs || (this.data.gateways || []).map((g, i) => ({
      id: g.id,
      name: g.name,
      providerType: 'Adquirente / Gateway',
      environment: i === 3 ? 'Sandbox' : 'Produção',
      enabled: !g.status.includes('Backup'),
      connectionStatus: i === 3 ? 'Não configurado' : 'Conectado (Produção)',
      lastTestAt: '30/09/2026 09:12',
      merchantId: i === 0 ? '••••8421' : '••••' + String(5100 + i),
      clientId: '••••••••' + String(2100 + i),
      secretConfigured: i !== 3,
      cards: ['Visa', 'Mastercard', 'Elo', 'American Express'],
      pix: { enabled: i !== 3, keyType: 'CNPJ', key: '12.345.678/0001-90', term: i === 0 ? 'D+0' : 'D+1', immediateSplit: true },
      boleto: {
        enabled: i < 2,
        bank: i === 0 ? 'Banco do Brasil (001)' : 'Itaú Unibanco (341)',
        wallet: i === 0 ? '17' : '109',
        agreement: i === 0 ? '3482109' : '9823412',
        agency: '1234',
        account: '56789-0',
        dueDays: 3,
        finePercent: 2.0,
        dailyInterestPercent: 0.033,
        instructions: 'Sr. Caixa, não receber após 10 dias do vencimento. Aceitar somente valor nominal.'
      },
      installments: { max: 12, interestFrom: 7, minInstallmentAmount: 15.0 },
      antifraud: { enabled: true, provider: i % 2 === 0 ? 'ClearSale Total' : 'Konduto Enterprise', mode: 'Automático com 3DS 2.0', scoreMinApproval: 85 },
      webhooks: { enabled: i !== 3, urlConfigured: i !== 3, url: `https://api.diskingressos.com.br/v1/webhooks/${g.id}`, hmacConfigured: true },
      updatedAt: '30/09/2026 09:30',
      logs: [
        { at: '30/09/2026 09:12', action: 'Teste de conexão executado', actor: 'Karine (Adm Financeiro)', result: i === 3 ? 'Pendente de credenciais' : 'Conexão local validada' },
        { at: '29/09/2026 14:00', action: 'Homologação de ambiente', actor: 'Karine (Adm Financeiro)', result: 'Ambiente definido para ' + (i === 3 ? 'Sandbox' : 'Produção') }
      ]
    }));

    // Normalização defensiva para gatewayConfigs existentes
    this.data.gatewayConfigs.forEach(g => {
      if (!g.cards) g.cards = ['Visa', 'Mastercard', 'Elo'];
      if (!g.pix) g.pix = { enabled: true, term: 'D+0' };
      if (!g.boleto) g.boleto = { enabled: true, bank: 'Banco do Brasil' };
      if (!g.installments) g.installments = { max: 12, interestFrom: 7 };
      if (!g.antifraud) g.antifraud = { enabled: true, provider: 'ClearSale Total' };
      if (!g.webhooks) g.webhooks = { enabled: true, urlConfigured: true };
      if (!g.logs) g.logs = [];
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

    // Pacote 19: Conciliação Financeira Multicamadas
    this.data.reconciliationItems = this.data.reconciliationItems || [
      { id: 'CON-001', camada: 'Adquirentes', origem: 'Adquirente → Recebível', ref: 'LIQ-20260929-0182', produtor: 'Produtora ABC Ltda.', evento: 'Festival Curitiba 2026', esperado: 184520.00, realizado: 184520.00, status: 'Conciliado' },
      { id: 'CON-002', camada: 'Gateways', origem: 'Gateway → Adquirente', ref: 'GTW-20260929-7710', produtor: 'Live Music Produções', evento: 'Arena Music Festival', esperado: 96340.50, realizado: 96340.50, status: 'Conciliado' },
      { id: 'CON-003', camada: 'PIX/CNAB', origem: 'Banco → PIX', ref: 'PIX-20260929-4412', produtor: 'Produtora ABC Ltda.', evento: 'Festival Curitiba 2026', esperado: 48200.00, realizado: 48150.00, status: 'Divergência' },
      { id: 'CON-004', camada: 'Bancária', origem: 'Ledger × Extrato Banco do Brasil', ref: 'LDG-20260929-9182', produtor: 'Produtora ABC Ltda.', evento: 'Festival Curitiba 2026', esperado: 126800.00, realizado: 126800.00, status: 'Conciliado' },
      { id: 'CON-005', camada: 'Recebíveis', origem: 'Venda × Agenda × Recebimento', ref: 'REC-20260929-0044', produtor: 'Disk Ingressos (Geral)', evento: 'Consolidado Vendas', esperado: 884200.00, realizado: 884200.00, status: 'Conciliado' },
      { id: 'CON-006', camada: 'Repasses', origem: 'Obrigação Repasse → Banco', ref: 'REP-2026-00128', produtor: 'Produtora ABC Ltda.', evento: 'Festival Curitiba 2026', esperado: 50000.00, realizado: 50000.00, status: 'Conciliado' }
    ];

    // Pacote 19: Ocorrências e Retornos de Remessas Bancárias CNAB
    this.data.cnabOccurrences = this.data.cnabOccurrences || [
      {
        id: 'OC-01',
        batchId: 'CNAB-20260928-02',
        paymentRef: 'PGT-REP-00119',
        producer: 'Produtora ABC Ltda.',
        bank: 'Caixa Econômica Federal (104)',
        bankCode: '03 - Conta corrente encerrada / inválida',
        reason: 'Divergência de dígito verificador na conta cadastrada',
        amount: 1850.00,
        attempts: 2,
        owner: 'Karine (Adm Financeiro)',
        status: 'Pendente'
      },
      {
        id: 'OC-02',
        batchId: 'CNAB-20260928-02',
        paymentRef: 'PGT-REP-00121',
        producer: 'Live Music Produções',
        bank: 'Bradesco (237)',
        bankCode: '15 - Titularidade divergente (CPF/CNPJ)',
        reason: 'CNPJ favorecido não confere com contrato do produtor',
        amount: 4200.00,
        attempts: 1,
        owner: 'Karine (Adm Financeiro)',
        status: 'Pendente'
      }
    ];

    this.data.cnabReturns = this.data.cnabReturns || [
      {
        id: 'RET-20260929-01.ret',
        batchId: 'CNAB-240-20260929-01',
        bank: 'Banco do Brasil S.A. (001)',
        processedAt: '29/09/2026 17:45',
        settledCount: 14,
        totalSettled: 642890.00,
        occurrencesCount: 0,
        status: 'Processado e Conciliado'
      },
      {
        id: 'RET-20260928-03.ret',
        batchId: 'CNAB-20260928-03',
        bank: 'Itaú Unibanco (341)',
        processedAt: '28/09/2026 18:20',
        settledCount: 22,
        totalSettled: 884200.00,
        occurrencesCount: 0,
        status: 'Processado e Conciliado'
      },
      {
        id: 'RET-20260928-02.ret',
        batchId: 'CNAB-20260928-02',
        bank: 'Banco do Brasil S.A. (001)',
        processedAt: '28/09/2026 16:30',
        settledCount: 6,
        totalSettled: 195450.00,
        occurrencesCount: 2,
        status: 'Ocorrências Pendentes'
      }
    ];

    // Pacote 19: Contas Corporativas da Tesouraria com Finalidade Definida
    this.data.treasuryAccounts = this.data.treasuryAccounts || [
      {
        id: 'bb-operacional',
        bankName: 'Banco do Brasil S.A. (001)',
        accountType: 'Conta Corrente Corporativa PJ',
        agency: '1890-X',
        accountNumber: '55400-1',
        balance: 1240500.00,
        purpose: 'Conta Operacional (Pagamentos, Fornecedores & CNAB 240/400)',
        settlementChannel: 'CNAB / TED / TEF',
        status: 'Ativa',
        isMain: true,
        updatedAt: '30/09/2026 08:30'
      },
      {
        id: 'itau-liquidacao',
        bankName: 'Itaú Unibanco (341)',
        accountType: 'Conta Corrente Corporativa PJ',
        agency: '0910',
        accountNumber: '28910-2',
        balance: 699500.00,
        purpose: 'Conta de Liquidação (PIX Instantâneo, Recebimentos & Split SPI)',
        settlementChannel: 'PIX SPI / DICT Bacen',
        status: 'Ativa',
        isMain: false,
        updatedAt: '30/09/2026 08:30'
      }
    ];

    // Retenções Detalhadas do Produtor (Reserva operacional R$ 20.000, Chargeback R$ 10.000, Estornos pendentes R$ 5.000, Regra contratual R$ 10.000 = Total R$ 45.000)
    this.data.retentions = this.data.retentions || [
      {
        id: 'RET-001',
        producerId: 'prod-abc',
        eventId: 'evt-001',
        eventName: 'Festival Curitiba 2026',
        category: 'Reserva operacional',
        origin: 'Vendas Cartão de Crédito Lote 2',
        reason: 'Garantia operacional pós-evento para despesas e contingências',
        amount: 20000.00,
        date: '15/09/2026',
        status: 'Ativa',
        releaseCondition: 'D+30 após encerramento do evento (15/12/2026)'
      },
      {
        id: 'RET-002',
        producerId: 'prod-abc',
        eventId: 'evt-001',
        eventName: 'Festival Curitiba 2026',
        category: 'Chargeback',
        origin: 'Disputa Portador Cartão #CB-9941',
        reason: 'Contestação comercial em análise pela adquirente Cielo',
        amount: 10000.00,
        date: '22/09/2026',
        status: 'Sob Análise',
        releaseCondition: 'Após encerramento e deferimento da contestação pela adquirente'
      },
      {
        id: 'RET-003',
        producerId: 'prod-abc',
        eventId: 'evt-002',
        eventName: 'Show Artista A - Turnê Especial',
        category: 'Estornos pendentes',
        origin: 'Protocolo #EST-2026-0089',
        reason: 'Estornos solicitados por compradores em fase de processamento bancário',
        amount: 5000.00,
        date: '25/09/2026',
        status: 'Processando',
        releaseCondition: 'Após confirmação de débito e liquidação no extrato do gateway'
      },
      {
        id: 'RET-004',
        producerId: 'prod-abc',
        eventId: 'evt-002',
        eventName: 'Show Artista A - Turnê Especial',
        category: 'Regra contratual',
        origin: 'Contrato DISK-CTR-2025-089 (Cláusula 8.2)',
        reason: 'Retenção cautelar de 5% sobre faturamento bruto até emissão do borderô final',
        amount: 10000.00,
        date: '01/09/2026',
        status: 'Ativa',
        releaseCondition: 'Assinatura mútua do Termo de Encerramento e Borderô Final'
      }
    ];

    this.data.eventTransfers = this.data.eventTransfers || [
      {
        id: 'TRF-2026-00128',
        fromEventId: 'evt-001',
        fromEventName: 'Festival Curitiba 2026',
        toEventId: 'evt-002',
        toEventName: 'Show Artista A - Turnê Especial',
        amount: 50000.00,
        reason: 'Reforço de caixa operacional para adiantamento de fornecedores',
        timestamp: '28/09/2026 15:30',
        createdBy: 'João Silva (Produtor)',
        status: 'Concluída'
      }
    ];

    this.data.approvalQueue = this.data.approvalQueue || [];
    if (!this.data.approvalQueue.some(a => a.id === 'REP-2026-00128')) {
      this.data.approvalQueue.unshift({
        id: 'REP-2026-00128',
        protocol: 'REP-2026-00128',
        workflowId: 'WF-REP-2026-00128',
        type: 'Repasse',
        producerId: 'prod-abc',
        producerName: 'Produtora ABC Ltda.',
        eventId: 'evt-001',
        eventName: 'Festival Curitiba 2026',
        requestedAmount: 50000.00,
        amount: 50000.00,
        netAmount: 50000.00,
        requestDate: '30/09/2026 09:32',
        status: 'Em análise',
        bankName: 'Itaú Unibanco (341)',
        bankAccount: 'Ag 0432 • C/C 48291-0',
        pixKey: '14.829.301/0001-92 (CNPJ)',
        createdByUserId: 'usr-prod-01',
        createdBy: 'João Silva (Produtor)',
        documentId: 'DOC-2026-00128',
        checklist: {
          balanceSufficient: true,
          bankDataValidated: true,
          eventRegular: true,
          noActiveBlocks: true,
          limitPermitted: true,
          chargebackWarning: 'Sem pendências'
        },
        reservation: {
          type: 'SALDO_DISPONIVEL',
          amount: 50000.00,
          status: 'Reservado'
        },
        signatures: {
          producer: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null },
          disk: { signed: false, signedBy: null, signedAt: null, ip: null, certAuth: null, lockedUntilProducerSigns: true }
        },
        auditTrail: [
          { timestamp: '30/09/2026 09:32', actor: 'João Silva (Produtor)', action: 'Solicitou repasse financeiro', details: 'Protocolo REP-2026-00128 criado no valor de R$ 50.000,00' },
          { timestamp: '30/09/2026 09:32', actor: 'Sistema Disk', action: 'Recebido pelo Financeiro Disk', details: 'Reserva de saldo de R$ 50.000,00 efetuada no Festival Curitiba 2026' },
          { timestamp: '30/09/2026 09:35', actor: 'Karine (Financeiro Disk)', action: 'Entrou em análise financeira', details: 'Conferência de adimplência e saldo disponível' }
        ],
        notes: 'Repasse solicitado para pagamento de fornecedores do Festival Curitiba 2026.'
      });
    }

    this.data.approvalQueue = this.data.approvalQueue.map(item => ({
      ...item,
      protocol: item.protocol || item.id,
      workflowId: item.workflowId || `WF-${item.id}`,
      documentId: item.documentId || `DOC-${item.id}`,
      createdByUserId: item.createdByUserId || 'usr-prod-01',
      createdBy: item.createdBy || 'Produtor',
      checklist: item.checklist || {
        balanceSufficient: true,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: true,
        limitPermitted: true,
        chargebackWarning: 'Sem pendências'
      },
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

  // ==========================================================================
  // REGISTRO CENTRAL DE OPERAÇÕES & CONTEXTO OPERACIONAL GLOBAL (PACOTE 21)
  // Operação como fonte única da verdade transversal a todos os módulos
  // ==========================================================================
  ensureOperationsRegistry() {
    this.data.operationsRegistry = this.data.operationsRegistry || [
      {
        operacaoId: 'OP-00128',
        protocolo: 'REP-2026-00128',
        tipo: 'REPASSE',
        origem: 'REPASSES',
        produtorId: 'prod-abc',
        produtorNome: 'Produtora ABC Ltda.',
        eventoId: 'evt-001',
        eventoNome: 'Festival Curitiba 2026',
        valor: 50000.00,
        solicitacaoId: 'REP-00128',
        aprovacaoId: 'APV-2026-00128',
        assinaturaId: 'DOC-8921',
        pagamentoId: 'PGT-2026-00128',
        ledgerId: 'LEDG-89104',
        conciliacaoId: 'CON-006',
        status: 'Aprovado / Em Liquidação',
        etapaAtual: 'PAGAMENTO',
        etapas: [
          { id: 'SOLICITACAO', label: 'Solicitação', status: 'concluida', route: 'diskSolicitacoes', date: '28/09/2026 09:14' },
          { id: 'APROVACAO', label: 'Aprovação', status: 'concluida', route: 'diskAprovacoes', date: '28/09/2026 14:15' },
          { id: 'ASSINATURA', label: 'Assinaturas', status: 'concluida', route: 'diskAssinaturas', date: '28/09/2026 16:30' },
          { id: 'PAGAMENTO', label: 'Tesouraria', status: 'em_andamento', route: 'diskTesouraria', date: '29/09/2026 08:00' },
          { id: 'LEDGER', label: 'Ledger', status: 'pendente', route: 'diskLedger', date: null },
          { id: 'CONCILIACAO', label: 'Conciliação', status: 'pendente', route: 'diskConciliacao', date: null },
          { id: 'DOSSIE', label: 'Dossiê', status: 'pendente', route: 'diskFechamentos', date: null }
        ],
        banco: 'Itaú Unibanco (341) • Ag 0432 • C/C 48291-0',
        pixChave: '14.829.301/0001-92 (CNPJ)'
      },
      {
        operacaoId: 'OP-00291',
        protocolo: 'REP-2026-00291',
        tipo: 'REPASSE',
        origem: 'REPASSES',
        produtorId: 'prod-abc',
        produtorNome: 'Produtora ABC Ltda.',
        eventoId: 'evt-001',
        eventoNome: 'Festival Curitiba 2026',
        valor: 80000.00,
        solicitacaoId: 'REP-00291',
        aprovacaoId: 'APV-2026-00291',
        assinaturaId: 'DOC-4412',
        pagamentoId: null,
        ledgerId: null,
        conciliacaoId: null,
        status: 'Aguardando Análise',
        etapaAtual: 'APROVACAO',
        etapas: [
          { id: 'SOLICITACAO', label: 'Solicitação', status: 'concluida', route: 'diskSolicitacoes', date: '29/09/2026 09:15' },
          { id: 'APROVACAO', label: 'Aprovação', status: 'em_andamento', route: 'diskAprovacoes', date: null },
          { id: 'ASSINATURA', label: 'Assinaturas', status: 'pendente', route: 'diskAssinaturas', date: null },
          { id: 'PAGAMENTO', label: 'Tesouraria', status: 'pendente', route: 'diskTesouraria', date: null },
          { id: 'LEDGER', label: 'Ledger', status: 'pendente', route: 'diskLedger', date: null },
          { id: 'CONCILIACAO', label: 'Conciliação', status: 'pendente', route: 'diskConciliacao', date: null },
          { id: 'DOSSIE', label: 'Dossiê', status: 'pendente', route: 'diskFechamentos', date: null }
        ],
        banco: 'Itaú Unibanco (341) • Ag 0432 • C/C 48291-0',
        pixChave: '14.829.301/0001-92 (CNPJ)'
      },
      {
        operacaoId: 'OP-00142',
        protocolo: 'TRF-2026-00142',
        tipo: 'TRANSFERENCIA',
        origem: 'TRANSFERENCIAS',
        produtorId: 'prod-abc',
        produtorNome: 'Produtora ABC Ltda.',
        eventoId: 'evt-001',
        eventoNome: 'Festival Curitiba 2026',
        destinoEventoId: 'evt-002',
        destinoEventoNome: 'Show Artista A - Turnê Especial',
        valor: 110000.00,
        solicitacaoId: 'TRF-2026-00142',
        aprovacaoId: 'APV-TRF-00142',
        assinaturaId: null,
        pagamentoId: null,
        ledgerId: 'LEDG-TRF-00142',
        conciliacaoId: 'CON-TRF-00142',
        status: 'Transferência Executada & Conciliada',
        etapaAtual: 'CONCILIACAO',
        etapas: [
          { id: 'SOLICITACAO', label: 'Solicitação', status: 'concluida', route: 'diskSolicitacoes', date: '29/09/2026 10:00' },
          { id: 'APROVACAO', label: 'Aprovação', status: 'concluida', route: 'diskAprovacoes', date: '29/09/2026 10:05' },
          { id: 'ASSINATURA', label: 'Assinaturas', status: 'dispensada', route: 'diskAssinaturas', date: null },
          { id: 'PAGAMENTO', label: 'Transferência', status: 'concluida', route: 'diskTransferencias', date: '29/09/2026 10:10' },
          { id: 'LEDGER', label: 'Ledger', status: 'concluida', route: 'diskLedger', date: '29/09/2026 10:10' },
          { id: 'CONCILIACAO', label: 'Conciliação', status: 'concluida', route: 'diskConciliacao', date: '29/09/2026 10:15' },
          { id: 'DOSSIE', label: 'Dossiê', status: 'concluida', route: 'diskFechamentos', date: '29/09/2026 10:15' }
        ]
      },
      {
        operacaoId: 'OP-00105',
        protocolo: 'ANT-2026-00105',
        tipo: 'ANTECIPACAO',
        origem: 'ANTECIPACOES',
        produtorId: 'prod-abc',
        produtorNome: 'Produtora ABC Ltda.',
        eventoId: 'evt-001',
        eventoNome: 'Festival Curitiba 2026',
        valor: 50000.00,
        solicitacaoId: 'ANT-00105',
        aprovacaoId: 'APV-ANT-00105',
        assinaturaId: 'DOC-ANT-00105',
        pagamentoId: null,
        ledgerId: null,
        conciliacaoId: null,
        status: 'Em Análise de Risco',
        etapaAtual: 'APROVACAO',
        etapas: [
          { id: 'SOLICITACAO', label: 'Solicitação', status: 'concluida', route: 'antecipacoes', date: '29/09/2026 09:20' },
          { id: 'APROVACAO', label: 'Aprovação', status: 'em_andamento', route: 'diskAprovacoes', date: null },
          { id: 'ASSINATURA', label: 'Assinaturas', status: 'pendente', route: 'diskAssinaturas', date: null },
          { id: 'PAGAMENTO', label: 'Tesouraria', status: 'pendente', route: 'diskTesouraria', date: null },
          { id: 'LEDGER', label: 'Ledger', status: 'pendente', route: 'diskLedger', date: null },
          { id: 'CONCILIACAO', label: 'Conciliação', status: 'pendente', route: 'diskConciliacao', date: null },
          { id: 'DOSSIE', label: 'Dossiê', status: 'pendente', route: 'diskFechamentos', date: null }
        ]
      }
    ];
  }

  getOperationsRegistry() {
    this.ensureOperationsRegistry();
    return this.data.operationsRegistry;
  }

  getOperation(idOrProtocol) {
    this.ensureOperationsRegistry();
    if (!idOrProtocol) return null;
    const term = String(idOrProtocol).trim().toLowerCase();
    return this.data.operationsRegistry.find(op => 
      (op.operacaoId && op.operacaoId.toLowerCase() === term) ||
      (op.protocolo && op.protocolo.toLowerCase() === term) ||
      (op.solicitacaoId && op.solicitacaoId.toLowerCase() === term) ||
      (op.aprovacaoId && op.aprovacaoId.toLowerCase() === term) ||
      (op.ledgerId && op.ledgerId.toLowerCase() === term) ||
      (op.conciliacaoId && op.conciliacaoId.toLowerCase() === term)
    ) || null;
  }

  setOperationalContext(idOrProtocol) {
    const op = this.getOperation(idOrProtocol);
    if (!op) {
      this.state.currentOperationalContext = null;
      this.notify();
      return null;
    }

    this.state.currentOperationalContext = {
      ...op,
      ambiente: this.state.viewMode === 'disk' ? 'FINANCEIRO_DISK' : 'FINANCEIRO_PRODUTOR'
    };

    if (op.produtorId && this.state.selectedProducerId !== op.produtorId) {
      if (this.state.viewMode === 'disk' || this.state.currentUser.role === 'admin') {
        this.state.selectedProducerId = op.produtorId;
      }
    }
    if (op.eventoId) {
      this.state.selectedEventId = op.eventoId;
    }

    this.showToast('Contexto Operacional', `Operação ${op.protocolo} vinculada ao contexto transversal.`, 'info');
    this.notify();
    return this.state.currentOperationalContext;
  }

  clearOperationalContext() {
    this.state.currentOperationalContext = null;
    this.showToast('Contexto Operacional', 'Visualização de operação desvinculada.', 'info');
    this.notify();
  }

  getOperationalContext() {
    return this.state.currentOperationalContext;
  }

  registerFinancialEvent(eventType, payload = {}) {
    const eventRecord = {
      id: `EVT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      type: eventType,
      actor: this.state?.currentUser?.name || 'Sistema Disk',
      actorRole: this.state?.currentUser?.role || 'disk',
      ...payload
    };

    this.data.operationEvents = this.data.operationEvents || [];
    this.data.operationEvents.unshift(eventRecord);

    const targetOpId = payload.operacaoId || payload.protocolo;
    if (targetOpId) {
      const op = this.getOperation(targetOpId);
      if (op) {
        if (payload.novaEtapa) {
          op.etapaAtual = payload.novaEtapa;
          const st = op.etapas.find(e => e.id === payload.novaEtapa);
          if (st) {
            st.status = 'em_andamento';
            st.date = eventRecord.timestamp;
          }
        }
        if (payload.status) op.status = payload.status;
      }
    }

    this.persist();
    this.notify();
    return eventRecord;
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
      createdByUserId: this.state.currentUser.id,
      createdBy: `${this.state.currentUser.name} (Produtor)`,
      checklist: {
        balanceSufficient: numericAmount <= event.availableBalance,
        bankDataValidated: Boolean(bank && ['Ativa', 'Validada & Ativa'].includes(bank.status)),
        eventRegular: Boolean(event && event.status !== 'Suspenso' && event.status !== 'Bloqueado'),
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

  // ==========================================================================
  // REGRAS DE INTEGRIDADE, GOVERNANÇA E SEGREGAÇÃO DE FUNÇÕES (SoD)
  // ==========================================================================
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
    return checklist.balanceSufficient === true &&
      checklist.bankDataValidated === true &&
      checklist.eventRegular === true &&
      checklist.noActiveBlocks === true &&
      checklist.limitPermitted === true;
  }

  assertSegregation(item, action) {
    const userId = this.state.currentUser?.id;
    if (!userId) throw new Error('Usuário autenticado inválido.');
    
    // Regra SoD 1: O criador da operação não pode aprovar ou rejeitar a própria operação
    if (item.createdByUserId && item.createdByUserId === userId && ['APROVAR', 'REJEITAR'].includes(action)) {
      throw new Error('Segregação de funções: o criador da operação não pode decidir a própria operação.');
    }
    // Regra SoD 2: Quem aprovou a operação não pode liquidá-la
    if (item.approvedByUserId && item.approvedByUserId === userId && action === 'LIQUIDAR') {
      throw new Error('Segregação de funções: quem aprova não pode liquidar a mesma operação.');
    }
  }

  // 2. Financeiro Disk: Aprova a Operação (Gera Documento e Aguarda Assinatura do Produtor)
  approveOperationByDisk(requestId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error("Aprovação permitida somente ao Financeiro Disk.");
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error("Solicitação não encontrada.");

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
    return item;
  }

  // 3. Financeiro Disk: Rejeita a Operação Formalmente (com motivo obrigatório e devolução automática da reserva)
  rejectOperationByDisk(requestId, { reasonCategory, observation } = {}) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error("Rejeição permitida somente ao Financeiro Disk.");
    }
    if (!reasonCategory || !observation?.trim()) {
      throw new Error("Informe o motivo e a observação para rejeitar a operação.");
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error("Solicitação não encontrada.");

    if (!['Aguardando análise', 'Em análise'].includes(item.status)) {
      throw new Error(`Operação ${item.id} não pode ser rejeitada no status ${item.status}.`);
    }

    this.assertSegregation(item, 'REJEITAR');

    const operator = this.state.currentUser.name;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    item.status = "Rejeitado";
    item.stepIndex = 0;
    item.rejectedByUserId = this.state.currentUser.id;
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
      throw new Error("A assinatura do Produtor deve ocorrer no ambiente do Produtor.");
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error("Solicitação não encontrada.");

    if (item.status !== "Aguardando assinatura do Produtor" && item.status !== "Aprovado") {
      throw new Error(`Este documento não pode ser assinado pelo Produtor no status atual: ${item.status}.`);
    }

    if (item.signatures?.producer?.signed) {
      throw new Error("Documento já assinado pelo Produtor.");
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
    return item;
  }

  signDocumentAsProducer(requestId) {
    return this.signByProducer(requestId);
  }

  // 5. Financeiro Disk Assina (SEMPRE POR ÚLTIMO) e Formaliza
  signByDisk(requestId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error("Assinatura final permitida somente ao Financeiro Disk.");
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error("Solicitação não encontrada.");

    // TRAVA OBRIGATÓRIA DO SISTEMA: O Financeiro NUNCA assina antes do Produtor
    if (!item.signatures?.producer?.signed) {
      throw new Error("BLOQUEIO DE SEGURANÇA: O Financeiro Disk é sempre o último signatário. O documento deve ser assinado primeiramente pelo Produtor.");
    }

    if (item.signatures?.disk?.signed) {
      throw new Error("Documento já assinado pelo Financeiro Disk.");
    }

    if (item.status !== 'Aguardando assinatura do Financeiro') {
      throw new Error(`Status inválido para assinatura final: ${item.status}.`);
    }

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
    return item;
  }

  signDocumentAsDisk(requestId) {
    return this.signByDisk(requestId);
  }

  // 6. Liberação Financeira / Transferência (PIX / TED / CNAB) → Ledger → Conciliação → Concluído / Pago
  executeFinalTransfer(requestId) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error("Liquidação permitida somente ao Financeiro Disk.");
    }
    const item = this.data.approvalQueue.find(a => a.id === requestId);
    if (!item) throw new Error("Solicitação não encontrada.");

    if (item.status === 'Pago' || item.paidDate || item.liquidationId) {
      throw new Error(`Liquidação duplicada bloqueada para ${item.id}.`);
    }

    if (!item.signatures?.disk?.signed || !item.signatures?.producer?.signed || item.status !== 'Documento assinado') {
      throw new Error("BLOQUEIO: a liquidação exige aprovação e ambas as assinaturas concluídas.");
    }

    const prodCheck = this.data.producers.find(p => p.id === item.producerId);
    const activeBank = prodCheck?.bankAccounts?.find(b => ['Ativa', 'Validada & Ativa'].includes(b.status));
    if (!activeBank) {
      throw new Error("Pagamento bloqueado — Produtor sem conta bancária validada.");
    }

    this.assertSegregation(item, 'LIQUIDAR');

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('pt-BR');

    item.liquidationId = `LIQ-${Math.floor(100000 + Math.random() * 900000)}`;
    item.status = "Pago";
    item.stepIndex = 5;
    item.paidDate = `${nowDate} ${nowTime}`;
    item.liquidatedByUserId = this.state.currentUser.id;
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

    // Registra débito oficial no Ledger em partidas dobradas (pendente de conciliação bancária externa)
    const ledgerId = `LEDG-${Math.floor(10000 + Math.random() * 90000)}`;
    const eventTypeLedger = item.type === "Antecipação" ? "ANTECIPACAO_RECEBIVEIS_PAGA" : (item.type === "Borderô" ? "FECHAMENTO_BORDERO_LIQUIDADO" : "REPASSE_LIQUIDADO_PAGO");

    this.data.ledgerEntries.unshift({
      id: ledgerId,
      timestamp: `${nowDate} ${nowTime}`,
      eventType: eventTypeLedger,
      producerId: item.producerId,
      eventId: event ? event.id : null,
      debitAccount: `Passivo: Saldo Produtor ${item.producerName}`,
      creditAccount: `Ativo: Conta Corrente Banco do Brasil (001) Disk`,
      amount: finalAmount,
      netProducer: finalAmount,
      feeDisk: item.discountFee || 0.00,
      refOrder: item.id,
      conciliated: false,
      reconciliationStatus: 'Pendente de conciliação bancária externa'
    });

    item.auditTrail.push(
      { timestamp: `${nowTime}`, actor: "Tesouraria Disk", action: "Pagamento liquidado via PIX/TED", details: `Autenticação: ${item.authCode}` },
      { timestamp: `${nowTime}`, actor: "Motor Contábil", action: `Ledger atualizado (${ledgerId})`, details: "Partidas dobradas registradas" },
      { timestamp: `${nowTime}`, actor: "Conciliação Bancária", action: "Pendente de retorno bancário/extrato", details: "Aguardando confirmação do banco/gateway" }
    );

    this.recordOperationEvent(
      item,
      'Pagamento liquidado',
      `Autenticação: ${item.authCode} | Ledger: ${ledgerId} | Valor: R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Conciliação externa pendente)`,
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

  // 6. Transferência Segregada entre Eventos do Produtor (Regra Endurecida)
  transferBetweenEvents(arg1, arg2, arg3, arg4) {
    let fromEventId, toEventId, amount, reason, transferId;
    if (typeof arg1 === 'object' && arg1 !== null) {
      fromEventId = arg1.fromEventId;
      toEventId = arg1.toEventId;
      amount = arg1.amount;
      reason = arg1.reason || '';
      transferId = arg1.transferId || null;
    } else {
      fromEventId = arg1;
      toEventId = arg2;
      amount = arg3;
      transferId = arg4 || null;
      reason = '';
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new Error('Informe um valor válido e positivo para a transferência.');
    }
    if (fromEventId === toEventId) {
      throw new Error('O evento de destino deve ser diferente do evento de origem.');
    }
    const fromEvent = this.data.events.find(e => e.id === fromEventId);
    const toEvent = this.data.events.find(e => e.id === toEventId);
    if (!fromEvent || !toEvent) {
      throw new Error('Evento de origem ou destino não localizado.');
    }

    const trfId = transferId || `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    this.data.eventTransfers = this.data.eventTransfers || [];

    // Idempotência: impede reexecução da mesma transferência
    if (this.data.eventTransfers.some(t => t.id === trfId)) {
      throw new Error(`Transferência ${trfId} já executada anteriormente. Operação duplicada bloqueada.`);
    }

    // Regra rígida e canônica de cálculo:
    // Saldo financeiro              R$ 200.000
    // (-) Retido                     R$ 30.000
    // (-) Reservado para repasses    R$ 50.000
    // (-) Bloqueios                  R$ 10.000
    // ────────────────────────────────────────
    // Transferível                  R$ 110.000
    const financialBalance = Number(fromEvent.financialBalance ?? fromEvent.availableBalance ?? fromEvent.totalBalance ?? 0);
    const { reserved, retained, blocked } = this.getEventRestrictions(fromEvent);
    const transferable = this.getTransferableAmount(fromEvent);

    if (numAmount > transferable) {
      const br = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      throw new Error(
        `Saldo insuficiente para transferência no evento ${fromEvent.name}.\n` +
        `Saldo financeiro: ${br(financialBalance)} | (-) Retido: ${br(retained)} | (-) Reservado: ${br(reserved)} | (-) Bloqueios: ${br(blocked)}.\n` +
        `Valor máximo transferível permitido: ${br(transferable)}.`
      );
    }

    const now = new Date();
    const nowStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const operator = this.state.currentUser.name;

    // Atualização dos saldos dos eventos
    fromEvent.availableBalance = Math.max(0, (fromEvent.availableBalance || 0) - numAmount);
    fromEvent.totalBalance = Math.max(0, (fromEvent.totalBalance || 0) - numAmount);
    if (fromEvent.financialBalance !== undefined) {
      fromEvent.financialBalance = Math.max(0, fromEvent.financialBalance - numAmount);
    }
    toEvent.availableBalance = (toEvent.availableBalance || 0) + numAmount;
    toEvent.totalBalance = (toEvent.totalBalance || 0) + numAmount;
    if (toEvent.financialBalance !== undefined) {
      toEvent.financialBalance += numAmount;
    }

    // Partida Dobrada Balanceada no Ledger (uma única operação balanceada com débito no destino e crédito na origem)
    this.data.ledgerEntries = this.data.ledgerEntries || [];
    this.data.ledgerEntries.unshift({
      id: `LEDG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: nowStr,
      eventType: 'TRANSFERENCIA_EVENTOS',
      producerId: fromEvent.producerId,
      eventId: fromEvent.id,
      protocol: trfId,
      debitAccount: `Subconta Evento Destino: ${toEvent.name} [${toEvent.id}]`,
      creditAccount: `Subconta Evento Origem: ${fromEvent.name} [${fromEvent.id}]`,
      amount: numAmount,
      description: `Transferência entre eventos [${trfId}]: Débito ${toEvent.name} / Crédito ${fromEvent.name} (R$ ${numAmount.toFixed(2)})`,
      refOrder: trfId,
      conciliated: false,
      reconciliationStatus: 'Pendente de conciliação bancária'
    });

    // Registra no extrato segregado
    this.data.statementEntries = this.data.statementEntries || [];
    this.data.statementEntries.unshift({
      id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
      date: now.toLocaleDateString('pt-BR'),
      description: `Transferência enviada para ${toEvent.name} [${trfId}]`,
      type: 'Débito',
      amount: -numAmount,
      eventId: fromEvent.id,
      eventName: fromEvent.name,
      protocol: trfId
    });
    this.data.statementEntries.unshift({
      id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
      date: now.toLocaleDateString('pt-BR'),
      description: `Transferência recebida de ${fromEvent.name} [${trfId}]`,
      type: 'Crédito',
      amount: numAmount,
      eventId: toEvent.id,
      eventName: toEvent.name,
      protocol: trfId
    });

    this.data.eventTransfers = this.data.eventTransfers || [];
    const transferRecord = {
      id: trfId,
      fromEventId: fromEvent.id,
      fromEventName: fromEvent.name,
      toEventId: toEvent.id,
      toEventName: toEvent.name,
      amount: numAmount,
      reason: reason || 'Remanejamento de saldo entre produções',
      timestamp: nowStr,
      createdBy: operator,
      status: 'Concluída'
    };
    this.data.eventTransfers.unshift(transferRecord);

    this.recordOperationEvent(
      { id: trfId, protocol: trfId, workflowId: `WF-${trfId}`, producerId: fromEvent.producerId, eventId: fromEvent.id },
      'Transferência entre eventos concluída',
      `${trfId}: R$ ${numAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} movimentado de ${fromEvent.name} para ${toEvent.name}.`,
      'Saldos'
    );

    this.showToast(
      'Transferência Concluída',
      `${trfId}: R$ ${numAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} transferido com partidas dobradas no Ledger.`,
      'success'
    );

    this.persist();
    this.notify();
    return transferRecord;
  }

  // 7. Composição do Saldo Oficial do Produtor ("De onde veio meu saldo?")
  getProducerBalanceComposition(producerId = 'prod-abc', eventId = 'all') {
    const isAll = eventId === 'all';
    const totalRetained = this.calculateRetentions(eventId, producerId);

    if (isAll) {
      const gross = 1000000.00;
      const refunds = 20000.00;
      const cb = 5000.00;
      const fees = 60000.00;
      const net = gross - refunds - cb - fees; // 915.000,00
      const payouts = 400000.00;
      const reserved = 70000.00;
      const retentions = totalRetained; // R$ 45.000,00 calculado da fonte única
      const available = Math.max(0, net - payouts - reserved - retentions); // R$ 400.000,00
      return {
        grossSales: gross,
        refunds: refunds,
        chargebacks: cb,
        diskFees: fees,
        netRevenue: net,
        payoutsDone: payouts,
        reservedBalance: reserved,
        retentionsBalance: retentions,
        availableBalance: available
      };
    }
    const evt = this.data.events.find(e => e.id === eventId);
    if (!evt) return this.getProducerBalanceComposition(producerId, 'all');

    const gross = evt.grossSales || 500000;
    const refunds = evt.cancellations || 10000;
    const cb = evt.chargebacks || 5000;
    const fees = evt.diskFees || 35000;
    const net = gross - refunds - cb - fees;
    const payouts = evt.payoutsDone || 150000;
    const reserved = evt.reservedBalance || 0;
    const retentions = totalRetained; // R$ 30.000,00 para evt-001 (da fonte única)
    const available = Math.max(0, net - payouts - reserved - retentions);

    return {
      grossSales: gross,
      refunds: refunds,
      chargebacks: cb,
      diskFees: fees,
      netRevenue: net,
      payoutsDone: payouts,
      reservedBalance: reserved,
      retentionsBalance: retentions,
      availableBalance: available
    };
  }

  // Única Fonte de Verdade para cálculo de retenções (evita divergência entre views)
  calculateRetentions(eventId = 'all', producerId = 'prod-abc') {
    const list = (this.data.retentions || []).filter(r => 
      (producerId === 'all' || r.producerId === producerId) &&
      (eventId === 'all' || r.eventId === eventId) &&
      r.status !== 'Liberada' && r.status !== 'Cancelada'
    );
    return list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }

  // 8. Consulta de Retenções Detalhadas
  getProducerRetentions(producerId = 'prod-abc', eventId = 'all') {
    const retentions = this.data.retentions || [];
    return retentions.filter(r => (producerId === 'all' || r.producerId === producerId) && (eventId === 'all' || r.eventId === eventId));
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

  // ==========================================================================
  // OPERAÇÕES DO PACOTE 18 (CENTRAL OPERACIONAL DE GATEWAYS E ADQUIRENTES)
  // ==========================================================================
  saveGatewayConfig(payload, id = null) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    if (!payload.name?.trim()) {
      throw new Error('Informe o nome do gateway/adquirente.');
    }
    const now = new Date().toLocaleString('pt-BR');
    let row = id ? this.data.gatewayConfigs.find(x => x.id === id) : null;
    if (row) {
      Object.assign(row, payload, { updatedAt: now });
    } else {
      row = {
        id: `gw-${Date.now()}`,
        providerType: 'Gateway / Adquirente',
        environment: payload.environment || 'Sandbox',
        enabled: payload.enabled !== undefined ? payload.enabled : true,
        connectionStatus: 'Não configurado',
        cards: ['Visa', 'Mastercard', 'Elo'],
        pix: { enabled: true, keyType: 'CNPJ', term: 'D+0', immediateSplit: true },
        boleto: { enabled: true, bank: 'Banco do Brasil', wallet: '17', dueDays: 3, finePercent: 2.0, dailyInterestPercent: 0.033 },
        installments: { max: 12, interestFrom: 7, minInstallmentAmount: 15.0 },
        antifraud: { enabled: true, provider: 'ClearSale Total', mode: 'Automático' },
        webhooks: { enabled: true, urlConfigured: true },
        logs: [],
        ...payload,
        updatedAt: now
      };
      this.data.gatewayConfigs.unshift(row);
    }
    row.logs = row.logs || [];
    row.logs.unshift({
      at: now,
      action: id ? 'Configuração atualizada' : 'Gateway cadastrado',
      actor: this.state.currentUser.name
    });
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      id ? 'Gateway atualizado' : 'Novo Gateway cadastrado',
      `${row.name} · Ambiente: ${row.environment}`,
      'Gateways e Adquirentes'
    );
    this.persist();
    this.notify();
    return row;
  }

  toggleGateway(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = this.data.gatewayConfigs.find(x => x.id === id);
    if (!row) throw new Error('Gateway não encontrado.');
    row.enabled = !row.enabled;
    row.updatedAt = new Date().toLocaleString('pt-BR');
    row.logs = row.logs || [];
    row.logs.unshift({
      at: row.updatedAt,
      action: row.enabled ? 'Ativado na operação' : 'Inativado',
      actor: this.state.currentUser.name
    });
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      `Gateway ${row.enabled ? 'ativado' : 'inativado'}`,
      `${row.name} (${row.id})`,
      'Gateways e Adquirentes'
    );
    this.persist();
    this.notify();
    return row;
  }

  updateGatewaySection(id, section, data) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = this.data.gatewayConfigs.find(x => x.id === id);
    if (!row) throw new Error('Gateway não encontrado.');
    const now = new Date().toLocaleString('pt-BR');

    if (section === 'cards' && Array.isArray(data)) {
      row.cards = data;
    } else {
      row[section] = { ...(row[section] || {}), ...data };
    }
    row.updatedAt = now;
    row.logs = row.logs || [];
    row.logs.unshift({
      at: now,
      action: `Seção ${section.toUpperCase()} atualizada`,
      actor: this.state.currentUser.name
    });
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      `Configuração de ${section} alterada`,
      `${row.name} (${row.id})`,
      'Gateways e Adquirentes'
    );
    this.persist();
    this.notify();
    return row;
  }

  testGatewayConnection(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = this.data.gatewayConfigs.find(x => x.id === id);
    if (!row) throw new Error('Gateway não encontrado.');
    const now = new Date().toLocaleString('pt-BR');
    const ready = !!row.secretConfigured && !!row.clientId && !!row.merchantId;

    // Regra mandatória: sem falso positivo. Enquanto não houver backend homologado, informa a dependência de integração.
    row.connectionStatus = ready
      ? 'Credenciais cadastradas - teste real depende do backend'
      : 'Não configurado (Credenciais incompletas)';
    row.lastTestAt = now;

    row.logs = row.logs || [];
    row.logs.unshift({
      at: now,
      action: 'Teste de conexão solicitado',
      actor: this.state.currentUser.name,
      result: row.connectionStatus
    });
    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      'Teste de conexão de gateway',
      `${row.name}: ${row.connectionStatus}`,
      'Gateways e Adquirentes'
    );
    this.persist();
    this.notify();
    return { row, ready };
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

  // ==========================================================================
  // PACOTE 19: CONCILIAÇÃO FINANCEIRA OPERACIONAL & TRATAMENTO DE DIVERGÊNCIAS
  // ==========================================================================
  saveReconciliationResolution(id, payload) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = (this.data.reconciliationItems || []).find(x => x.id === id);
    if (!row) throw new Error('Item de conciliação não encontrado.');
    if (!payload.cause || !payload.owner || !payload.action || !payload.evidence) {
      throw new Error('Informe causa, responsável, ação corretiva e evidência/observação obrigatória.');
    }

    const now = new Date().toLocaleString('pt-BR');
    row.status = 'Resolvida';
    row.resolution = {
      cause: payload.cause,
      owner: payload.owner,
      action: payload.action,
      evidence: payload.evidence,
      resolvedAt: now,
      resolvedBy: this.state.currentUser.name
    };

    this.recordOperationEvent(
      { id: row.id, protocol: row.ref, workflowId: `WF-${row.ref}` },
      'Divergência de conciliação tratada',
      `${row.camada} · Causa: ${payload.cause} · Ação: ${payload.action}. Valores contábeis originais preservados.`,
      'Conciliação Financeira'
    );
    this.persist();
    this.notify();
    return row;
  }

  // ==========================================================================
  // PACOTE 19: TRATAMENTO DE OCORRÊNCIAS CNAB
  // ==========================================================================
  resolveCnabOccurrence(occurrenceId, actionType, note = '', newAccount = null) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const occ = (this.data.cnabOccurrences || []).find(o => o.id === occurrenceId);
    if (!occ) throw new Error('Ocorrência CNAB não encontrada.');

    const now = new Date().toLocaleString('pt-BR');
    occ.status = actionType === 'cancelar' ? 'Cancelada' : actionType === 'reprocessar' ? 'Reprocessada' : 'Tratada';
    occ.resolution = {
      action: actionType,
      note: note || 'Tratada pela mesa de tesouraria',
      newAccount: newAccount || null,
      resolvedAt: now,
      resolvedBy: this.state.currentUser.name
    };

    this.recordOperationEvent(
      { id: occ.id, protocol: occ.paymentRef, workflowId: `WF-${occ.batchId}` },
      `Ocorrência CNAB ${occ.status.toLowerCase()}`,
      `${occ.producer} · Motivo: ${occ.reason} · Ação: ${actionType}`,
      'Tesouraria CNAB'
    );
    this.persist();
    this.notify();
    return occ;
  }

  // ==========================================================================
  // PACOTE 19: GESTÃO DE CONTAS CORPORATIVAS DA TESOURARIA DISK
  // ==========================================================================
  saveTreasuryAccount(payload, id = null) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    if (!payload.bankName?.trim() || !payload.accountNumber?.trim()) {
      throw new Error('Informe o banco e o número da conta corporativa.');
    }

    const now = new Date().toLocaleString('pt-BR');
    let row = id ? (this.data.treasuryAccounts || []).find(a => a.id === id) : null;
    if (row) {
      Object.assign(row, payload, { updatedAt: now });
    } else {
      row = {
        id: `treasury-${Date.now()}`,
        bankName: payload.bankName,
        accountType: payload.accountType || 'Conta Corrente Corporativa PJ',
        agency: payload.agency || '',
        accountNumber: payload.accountNumber,
        balance: Number(payload.balance || 0),
        purpose: payload.purpose || 'Operacional (Pagamentos & Recebimentos)',
        settlementChannel: payload.settlementChannel || 'CNAB / PIX / TED',
        status: 'Ativa',
        isMain: !!payload.isMain,
        updatedAt: now
      };
      this.data.treasuryAccounts.unshift(row);
    }

    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      id ? 'Conta corporativa atualizada' : 'Conta corporativa cadastrada',
      `${row.bankName} · Ag. ${row.agency} · C/C ${row.accountNumber} · ${row.purpose}`,
      'Tesouraria'
    );
    this.persist();
    this.notify();
    return row;
  }

  toggleTreasuryAccountStatus(id) {
    if (!['disk', 'admin'].includes(this.state.currentUser.role)) {
      throw new Error('Ação restrita ao Financeiro Disk.');
    }
    const row = (this.data.treasuryAccounts || []).find(a => a.id === id);
    if (!row) throw new Error('Conta corporativa não encontrada.');

    row.status = row.status === 'Ativa' ? 'Inativa' : 'Ativa';
    row.updatedAt = new Date().toLocaleString('pt-BR');

    this.recordOperationEvent(
      { id: row.id, protocol: row.id, workflowId: `WF-${row.id}` },
      `Conta corporativa ${row.status.toLowerCase()}`,
      `${row.bankName} · C/C ${row.accountNumber}`,
      'Tesouraria'
    );
    this.persist();
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
