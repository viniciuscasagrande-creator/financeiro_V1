/**
 * Módulo Financeiro Disk Ingressos - Core Financeiro Unificado
 * Base de dados compartilhada entre Portal do Produtor e Backoffice Financeiro Disk
 */

export const initialMockDatabase = {
  // Lista de Produtores Homologados na Plataforma Disk
  producers: [
    {
      id: "prod-abc",
      name: "Produtora ABC Ltda.",
      tradeName: "ABC Produções & Eventos",
      cnpj: "14.829.301/0001-92",
      contactEmail: "financeiro@produtoraabc.com.br",
      phone: "(41) 3315-0800",
      accountManager: "Carlos Menezes (Disk Ingressos)",
      rating: "Tier A - Premium",
      status: "Ativo",
      riskScore: "Baixo Risco (Score 94/100)",
      hasBlock: false,
      blockedAmount: 20000.00,
      contract: {
        number: "DISK-CTR-2025-089",
        diskFeePercent: 10.0,
        processingFeePercent: 2.9,
        anticipationRateMonthly: 2.0,
        settlementDaysRule: "D+2 após evento ou liberação sob demanda"
      },
      // Números alinhados com a simulação do Festival Curitiba 2026
      totals: {
        grossSales: 890000.00,
        netSales: 801000.00,
        totalBalance: 785000.00,
        availableBalance: 310000.00,     // Saldo disponível geral
        futureReceivables: 245000.00,    // A receber futuro
        transferredAmount: 920000.00,    // Já repassado historicamente
        blockedBalance: 25000.00,        // Bloqueado / reservas
        refundsAndChargebacks: 15000.00  // Estornos
      },
      bankAccounts: [
        {
          id: "bnk-001",
          bankName: "Itaú Unibanco (341)",
          accountType: "Conta Corrente PJ",
          agency: "0432",
          accountNumber: "48291-0",
          holderName: "Produtora ABC Ltda.",
          cnpj: "14.829.301/0001-92",
          pixKey: "14.829.301/0001-92 (CNPJ)",
          isDefault: true,
          status: "Validada & Ativa",
          validatedAt: "15/01/2025 via Bacen/CIP"
        },
        {
          id: "bnk-002",
          bankName: "Banco Bradesco (237)",
          accountType: "Conta Corrente PJ",
          agency: "1120",
          accountNumber: "19283-9",
          holderName: "Produtora ABC Ltda.",
          cnpj: "14.829.301/0001-92",
          pixKey: "financeiro@produtoraabc.com.br",
          isDefault: false,
          status: "Validada & Ativa",
          validatedAt: "20/03/2025"
        }
      ]
    },
    {
      id: "prod-xyz",
      name: "Eventos XYZ Produções Artísticas",
      tradeName: "XYZ Live",
      cnpj: "22.418.990/0001-44",
      contactEmail: "pagamentos@xyzlive.com.br",
      phone: "(11) 3044-9900",
      accountManager: "Mariana Souza (Disk Ingressos)",
      rating: "Tier B - Padrão",
      status: "Ativo",
      riskScore: "Médio Risco (Score 78/100)",
      hasBlock: false,
      blockedAmount: 10000.00,
      contract: {
        number: "DISK-CTR-2025-112",
        diskFeePercent: 12.0,
        processingFeePercent: 3.1,
        anticipationRateMonthly: 2.4,
        settlementDaysRule: "D+2 após evento"
      },
      totals: {
        grossSales: 350000.00,
        netSales: 308000.00,
        totalBalance: 215000.00,
        availableBalance: 95000.00,
        futureReceivables: 110000.00,
        transferredAmount: 240000.00,
        blockedBalance: 10000.00,
        refundsAndChargebacks: 8000.00
      },
      bankAccounts: [
        {
          id: "bnk-xyz-1",
          bankName: "Santander Brasil (033)",
          accountType: "Conta Corrente PJ",
          agency: "2234",
          accountNumber: "77812-4",
          holderName: "Eventos XYZ Produções Artísticas",
          cnpj: "22.418.990/0001-44",
          pixKey: "22.418.990/0001-44",
          isDefault: true,
          status: "Validada & Ativa",
          validatedAt: "10/02/2025"
        }
      ]
    },
    {
      id: "prod-premium",
      name: "Grupo Premium Entretenimento",
      tradeName: "Premium Shows",
      cnpj: "08.992.114/0001-08",
      contactEmail: "adm@premiumshows.com.br",
      phone: "(48) 3221-5000",
      accountManager: "Carlos Menezes (Disk Ingressos)",
      rating: "Tier A - Premium",
      status: "Ativo",
      riskScore: "Baixo Risco (Score 96/100)",
      hasBlock: false,
      blockedAmount: 0.00,
      contract: {
        number: "DISK-CTR-2024-045",
        diskFeePercent: 9.5,
        processingFeePercent: 2.8,
        anticipationRateMonthly: 1.9,
        settlementDaysRule: "D+1 após evento"
      },
      totals: {
        grossSales: 1200000.00,
        netSales: 1086000.00,
        totalBalance: 580000.00,
        availableBalance: 420000.00,
        futureReceivables: 160000.00,
        transferredAmount: 1800000.00,
        blockedBalance: 0.00,
        refundsAndChargebacks: 14000.00
      },
      bankAccounts: [
        {
          id: "bnk-prem-1",
          bankName: "Banco do Brasil (001)",
          accountType: "Conta Corrente PJ",
          agency: "1890",
          accountNumber: "34991-8",
          holderName: "Grupo Premium Entretenimento",
          cnpj: "08.992.114/0001-08",
          pixKey: "adm@premiumshows.com.br",
          isDefault: true,
          status: "Validada & Ativa",
          validatedAt: "05/11/2024"
        }
      ]
    }
  ],

  // Eventos de Todos os Produtores (com o Festival Curitiba configurado exatamente conforme o exemplo do usuário)
  events: [
    {
      id: "evt-001",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      name: "Festival Curitiba 2026",
      category: "Festival de Música",
      date: "14/11/2026",
      venue: "Pedreira Paulo Leminski - Curitiba/PR",
      status: "Vendas Abertas",
      capacity: 5000,
      soldTickets: 4250,
      salesTarget: 1000000.00,
      // Estrutura de fechamento exata citada na especificação do usuário:
      // Vendas brutas: R$ 500.000 | Cancelamentos: R$ 10.000 | Taxas: R$ 35.000 | Estornos/Chargebacks: R$ 5.000 -> Líquido R$ 450.000
      // Repassado: R$ 150.000 | A receber: R$ 80.000 | Bloqueado: R$ 20.000 -> Saldo Disponível: R$ 200.000,00
      // Regra Transferível: Saldo (200k) - Reservado (50k) - Retido (30k) - Bloqueado (10k) = R$ 110.000,00
      grossSales: 500000.00,
      cancellations: 10000.00,
      diskFees: 35000.00,
      chargebacks: 5000.00,
      netRevenue: 450000.00,
      payoutsDone: 0.00,
      payoutsDoneUnderPolicy: 0.00,
      payoutBlockedBalance: 0.00,
      payoutReservedBalance: 0.00,
      payoutRetainedBalance: 0.00,
      futureReceivables: 80000.00,
      financialBalance: 200000.00,
      availableBalance: 200000.00, // Disponível inicial R$ 200.000,00!
      reservedBalance: 50000.00,
      retainedBalance: 30000.00,
      blockedBalance: 10000.00,
      totalBalance: 300000.00,     // Disponível (200k) + A receber (80k) + Bloqueado (20k)
      chargebackCases: 2,
      bannerColor: "#2563eb"
    },
    {
      id: "evt-002",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      name: "Show Artista A - Turnê Especial",
      category: "Show Nacional",
      date: "05/10/2026",
      venue: "Teatro Guaíra - Curitiba/PR",
      status: "Últimos Ingressos",
      capacity: 3000,
      soldTickets: 2800,
      salesTarget: 600000.00,
      grossSales: 250000.00,
      cancellations: 5000.00,
      diskFees: 20000.00,
      chargebacks: 2000.00,
      netRevenue: 223000.00,
      payoutsDone: 140000.00,
      futureReceivables: 30000.00,
      financialBalance: 80000.00,
      availableBalance: 80000.00,
      reservedBalance: 0.00,
      retainedBalance: 15000.00,
      blockedBalance: 5000.00,
      totalBalance: 115000.00,
      chargebackCases: 0,
      bannerColor: "#7c3aed"
    },
    {
      id: "evt-003",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      name: "Evento Corporativo Tech Summit 2026",
      category: "Congresso & Tech",
      date: "22/10/2026",
      venue: "Viasoft Experience - Curitiba/PR",
      status: "Vendas Abertas",
      capacity: 1000,
      soldTickets: 850,
      salesTarget: 200000.00,
      grossSales: 140000.00,
      cancellations: 2000.00,
      diskFees: 12000.00,
      chargebacks: 1000.00,
      netRevenue: 125000.00,
      payoutsDone: 60000.00,
      futureReceivables: 20000.00,
      blockedBalance: 0.00,
      availableBalance: 50000.00,
      totalBalance: 70000.00,
      chargebackCases: 0,
      bannerColor: "#059669"
    },
    {
      id: "evt-inverno",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      name: "Festival de Inverno 2026",
      category: "Festival Musical",
      date: "12/11/2026",
      venue: "Pedreira Paulo Leminski - Curitiba/PR",
      status: "Vendas Abertas",
      capacity: 8000,
      soldTickets: 4160,
      salesTarget: 1000000.00,
      grossSales: 520000.00,
      cancellations: 10000.00,
      diskFees: 36000.00,
      chargebacks: 4000.00,
      netRevenue: 470000.00,
      payoutsDone: 40000.00,
      futureReceivables: 60000.00,
      financialBalance: 420000.00,
      availableBalance: 420000.00,
      reservedBalance: 0.00,
      retainedBalance: 0.00,
      blockedBalance: 10000.00,
      totalBalance: 490000.00,
      chargebackCases: 0,
      bannerColor: "#0284c7"
    },
    {
      id: "evt-xyz-1",
      producerId: "prod-xyz",
      producerName: "Eventos XYZ Produções Artísticas",
      name: "Show Nacional de Rock Curitiba",
      category: "Show",
      date: "18/10/2026",
      venue: "Live Curitiba",
      status: "Vendas Abertas",
      capacity: 4000,
      soldTickets: 2100,
      salesTarget: 700000.00,
      grossSales: 350000.00,
      cancellations: 8000.00,
      diskFees: 34000.00,
      chargebacks: 8000.00,
      netRevenue: 300000.00,
      payoutsDone: 240000.00,
      futureReceivables: 110000.00,
      blockedBalance: 10000.00,
      availableBalance: 95000.00,
      totalBalance: 215000.00,
      chargebackCases: 1,
      bannerColor: "#f59e0b"
    },
    {
      id: "evt-prem-1",
      producerId: "prod-premium",
      producerName: "Grupo Premium Entretenimento",
      name: "Festival de Verão Floripa 2026",
      category: "Festival",
      date: "28/12/2026",
      venue: "P12 Jurerê Internacional",
      status: "Vendas Abertas",
      capacity: 8000,
      soldTickets: 6100,
      salesTarget: 1500000.00,
      grossSales: 1200000.00,
      cancellations: 12000.00,
      diskFees: 102000.00,
      chargebacks: 14000.00,
      netRevenue: 1072000.00,
      payoutsDone: 1800000.00,
      futureReceivables: 160000.00,
      blockedBalance: 0.00,
      availableBalance: 420000.00,
      totalBalance: 580000.00,
      chargebackCases: 3,
      bannerColor: "#ec4899"
    }
  ],

  // CENTRAL DE APROVAÇÕES UNIFICADA (Fila Operacional Única)
  approvalQueue: [
    {
      id: "REP-00291",
      type: "Repasse",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      requestedAmount: 80000.00,
      requestDate: "29/09/2026 09:15",
      status: "Pendente", // Pendente -> Em Análise -> Aprovado -> Programado -> Pago / Recusado
      stepIndex: 1,
      bankName: "Itaú Unibanco (341)",
      bankAccount: "Ag 0432 • C/C 48291-0",
      pixKey: "14.829.301/0001-92 (CNPJ)",
      checklist: {
        balanceSufficient: true,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: true,
        limitPermitted: true,
        chargebackWarning: "2 chargebacks em acompanhamento (R$ 5.000)"
      },
      auditPosition: {
        grossSales: 500000.00,
        netRevenue: 450000.00,
        availableBefore: 200000.00,
        requested: 80000.00,
        availableAfter: 120000.00
      },
      notes: "Solicitação padrão para pagamento de fornecedores de sonorização e riders técnicos."
    },
    {
      id: "REP-00290",
      type: "Repasse",
      producerId: "prod-xyz",
      producerName: "Eventos XYZ Produções Artísticas",
      eventId: "evt-xyz-1",
      eventName: "Show Nacional de Rock Curitiba",
      requestedAmount: 35000.00,
      requestDate: "29/09/2026 08:30",
      status: "Pendente",
      stepIndex: 1,
      bankName: "Santander Brasil (033)",
      bankAccount: "Ag 2234 • C/C 77812-4",
      pixKey: "22.418.990/0001-44",
      checklist: {
        balanceSufficient: true,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: true,
        limitPermitted: true,
        chargebackWarning: "Nenhuma pendência crítica"
      },
      auditPosition: {
        grossSales: 350000.00,
        netRevenue: 300000.00,
        availableBefore: 95000.00,
        requested: 35000.00,
        availableAfter: 60000.00
      },
      notes: "Adiantamento de despesas de bilheteria e segurança."
    },
    {
      id: "REP-00289",
      type: "Repasse",
      producerId: "prod-premium",
      producerName: "Grupo Premium Entretenimento",
      eventId: "evt-prem-1",
      eventName: "Festival de Verão Floripa 2026",
      requestedAmount: 92000.00,
      requestDate: "28/09/2026 17:40",
      status: "Em Análise",
      stepIndex: 2,
      bankName: "Banco do Brasil (001)",
      bankAccount: "Ag 1890 • C/C 34991-8",
      pixKey: "adm@premiumshows.com.br",
      checklist: {
        balanceSufficient: true,
        bankDataValidated: true,
        eventRegular: true,
        noActiveBlocks: true,
        limitPermitted: true,
        chargebackWarning: "3 contestações sendo defendidas"
      },
      auditPosition: {
        grossSales: 1200000.00,
        netRevenue: 1072000.00,
        availableBefore: 420000.00,
        requested: 92000.00,
        availableAfter: 328000.00
      },
      notes: "Parcela contratual do artista headliner."
    },
    {
      id: "ANT-00105",
      type: "Antecipação",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      requestedAmount: 50000.00,
      ratePercent: 2.0,
      discountFee: 1000.00,
      netAmount: 49000.00,
      requestDate: "29/09/2026 09:20",
      status: "Pendente",
      bankName: "Itaú Unibanco (341)",
      bankAccount: "Ag 0432 • C/C 48291-0",
      notes: "Antecipação de parcelas de cartão com vencimento em novembro/2026."
    },
    {
      id: "BNK-00012",
      type: "Alteração Bancária",
      producerId: "prod-xyz",
      producerName: "Eventos XYZ Produções Artísticas",
      requestDate: "28/09/2026 15:20",
      status: "Pendente",
      bankName: "Nubank (260)",
      bankAccount: "Ag 0001 • C/C 99120-1",
      pixKey: "financeiro@xyzlive.com.br",
      notes: "Cadastro de conta secundária para liquidação PIX."
    },
    {
      id: "CHG-00042",
      type: "Chargeback",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      requestedAmount: 450.00,
      requestDate: "24/09/2026 11:00",
      status: "Em Disputa",
      notes: "Contestação de compra não reconhecida (Cartão Visa Elo Final 8912). Defesa enviada à Cielo."
    }
  ],

  // LEDGER CONTÁBIL CENTRAL (Partidas Dobradas e Auditoria)
  ledgerEntries: [
    {
      id: "LEDG-89104",
      timestamp: "29/09/2026 09:10",
      eventType: "VENDA_INGRESSO_PIX",
      producerId: "prod-abc",
      eventId: "evt-001",
      debitAccount: "Ativo: Conta Transitória Liquidação PIX Disk",
      creditAccount: "Passivo: Saldo Disponível Produtora ABC",
      creditAccount2: "Receita: Taxa Serviço Disk (10%)",
      amount: 1000.00,
      netProducer: 900.00,
      feeDisk: 100.00,
      refOrder: "PED-98301",
      conciliated: true
    },
    {
      id: "LEDG-89103",
      timestamp: "28/09/2026 14:00",
      eventType: "REPASSE_PROGRAMADO",
      producerId: "prod-abc",
      eventId: "evt-001",
      debitAccount: "Passivo: Saldo Disponível Produtora ABC",
      creditAccount: "Passivo: Obrigações com Produtores a Pagar (CNAB)",
      amount: 80000.00,
      netProducer: 80000.00,
      feeDisk: 0.00,
      refOrder: "REP-00291",
      conciliated: true
    }
  ],

  // GATEWAYS & ADQUIRENTES (MDR interno, taxas reais da Disk, volume)
  gateways: [
    {
      id: "gw-cielo",
      name: "Cielo eCommerce 3.0",
      mdrCredit: "1.68%",
      mdrDebit: "0.85%",
      mdrPix: "0.45%",
      spreadDisk: "1.22%",
      volumeShare: 42,
      totalVolumeProcessed: 1450000.00,
      status: "Operacional (99.98% SLA)"
    },
    {
      id: "gw-rede",
      name: "Rede Itaú Link",
      mdrCredit: "1.72%",
      mdrDebit: "0.89%",
      mdrPix: "0.40%",
      spreadDisk: "1.18%",
      volumeShare: 33,
      totalVolumeProcessed: 1120000.00,
      status: "Operacional (99.95% SLA)"
    },
    {
      id: "gw-stone",
      name: "Stone Pagamentos",
      mdrCredit: "1.55%",
      mdrDebit: "0.80%",
      mdrPix: "0.38%",
      spreadDisk: "1.35%",
      volumeShare: 15,
      totalVolumeProcessed: 520000.00,
      status: "Operacional (99.99% SLA)"
    },
    {
      id: "gw-pagbank",
      name: "PagBank / PagSeguro",
      mdrCredit: "1.85%",
      mdrDebit: "0.95%",
      mdrPix: "0.48%",
      spreadDisk: "1.05%",
      volumeShare: 10,
      totalVolumeProcessed: 340000.00,
      status: "Backup / Failover"
    }
  ],

  // CONCILIAÇÃO BANCÁRIA E ADQUIRENTES
  reconciliation: {
    ordersVsGateway: { matched: 12450, divergent: 0, accuracy: "100.0%" },
    gatewayVsLedger: { matched: 12450, divergent: 0, accuracy: "100.0%" },
    ledgerVsBank: { matched: 12448, divergent: 2, accuracy: "99.98%", divergentAmount: 180.00 }
  },

  // REMESSA BANCÁRIA CNAB 240 (Tesouraria Disk)
  cnabBatches: [
    {
      batchId: "CNAB-240-20260929-01",
      bank: "Banco do Brasil S.A. (001)",
      agencyAccount: "Ag 1890-X • C/C 55400-1",
      scheduledDate: "30/09/2026",
      count: 14,
      totalAmount: 642890.00,
      status: "Pronto para Transmissão VAN Bancária"
    }
  ],

  // MEIOS DE PAGAMENTO E DISTRIBUIÇÃO DE VENDAS
  paymentBreakdown: {
    byMethod: [
      { method: "PIX (Instantâneo)", share: 48, amount: 427200.00, transactions: 3410, avgTicket: 125.28, color: "#10b981", settlement: "D+0 / Instantâneo" },
      { method: "Cartão de Crédito à Vista", share: 26, amount: 231400.00, transactions: 1720, avgTicket: 134.53, color: "#3b82f6", settlement: "D+30" },
      { method: "Cartão Parcelado (2x a 12x)", share: 20, amount: 178000.00, transactions: 980, avgTicket: 181.63, color: "#8b5cf6", settlement: "Conforme Parcelas / Antecipável" },
      { method: "Boleto Bancário Registrado", share: 6, amount: 53400.00, transactions: 390, avgTicket: 136.92, color: "#f59e0b", settlement: "D+1 Compensação" }
    ],
    byChannel: [
      { channel: "Portal Web Desktop / Mobile", share: 65, amount: 578500.00 },
      { channel: "Aplicativo DiskIngressos (iOS/Android)", share: 25, amount: 222500.00 },
      { channel: "PDVs Físicos e Bilheterias Parceiras", share: 10, amount: 89000.00 }
    ]
  },

  // ANTECIPAÇÃO DE RECEBÍVEIS
  anticipations: {
    eligibleAmount: 245000.00,
    monthlyRate: 2.0,
    history: [
      { id: "ANT-00105", requestDate: "27/09/2026", eventName: "Festival Curitiba 2026", grossRequested: 50000.00, netReleased: 49000.00, feeDeducted: 1000.00, status: "Aguardando análise", effectiveDate: "29/09/2026" },
      { id: "ANT-00102", requestDate: "15/08/2026", eventName: "Festival Curitiba 2026", grossRequested: 80000.00, netReleased: 78400.00, feeDeducted: 1600.00, status: "Pago", effectiveDate: "15/08/2026" }
    ]
  },

  // CONDIÇÕES CONTRATUAIS DE TAXAS DO PRODUTOR
  producerFeesContract: [
    { name: "Taxa de Conveniência Disk", type: "Percentual por Ingresso", rate: "10,00%", payer: "Comprador (Cliente)", description: "Cobrada do consumidor final na compra online dos ingressos. Não deduzida da cota do produtor." },
    { name: "Taxa de Administração Bilheteria", type: "Percentual Bruto", rate: "10,00%", payer: "Produtor (Contratual)", description: "Taxa contratual acordada para operação, plataforma, tecnologia de controle de acesso e conciliação." },
    { name: "Processamento Adquirência e Antifraude", type: "Percentual Transacional", rate: "2,90%", payer: "Produtor (Contratual)", description: "Cobre MDR transacional unificado de bandeiras Visa, Mastercard, Elo e verificação antifraude de ponta." },
    { name: "Taxa de Antecipação de Recebíveis", type: "Percentual ao Mês", rate: "2,00% a.m.", payer: "Produtor (Opcional)", description: "Aplicável exclusivamente quando houver contratação voluntária de adiantamento de cartão de crédito." }
  ],

  // ESTORNOS, CANCELAMENTOS E CHARGEBACKS
  chargebacksAndRefunds: [
    { id: "DSP-00041", orderId: "ORD-99120", eventName: "Festival Curitiba 2026", buyer: "Lucas Mendes", date: "28/09/2026", type: "Chargeback (Contestação)", reason: "Alegação de transação não reconhecida junto ao banco emissor.", impact: "- R$ 450,00", status: "Em Disputa" },
    { id: "CAN-00038", orderId: "ORD-98441", eventName: "Festival Curitiba 2026", buyer: "Juliana Ferreira", date: "25/09/2026", type: "Cancelamento CDC (7 dias)", reason: "Direito de arrependimento formal exercido dentro do prazo legal do CDC.", impact: "- R$ 380,00", status: "Estornado" },
    { id: "CAN-00032", orderId: "ORD-97100", eventName: "Show Nacional Rock", buyer: "Roberto Alves", date: "18/09/2026", type: "Estorno Voluntário", reason: "Duplicidade de compra reportada pelo cliente e autorizada pela produção.", impact: "- R$ 260,00", status: "Estornado" }
  ],

  // BORDERÔ OFICIAL DE FECHAMENTO
  bordero: {
    eventId: "evt-001",
    eventName: "Festival Curitiba 2026",
    venue: "Pedreira Paulo Leminski - Curitiba/PR",
    closureDate: "29/09/2026 (Prévia Contábil Parcial)",
    lots: [
      { sector: "Pista Premium", lot: "1º Lote", price: 240.00, soldQty: 1800, compQty: 50, grossTotal: 432000.00 },
      { sector: "Pista Comum", lot: "1º Lote", price: 120.00, soldQty: 2400, compQty: 80, grossTotal: 288000.00 },
      { sector: "Camarote Open Bar", lot: "1º Lote", price: 450.00, soldQty: 350, compQty: 20, grossTotal: 157500.00 },
      { sector: "Área VIP", lot: "1º Lote", price: 320.00, soldQty: 300, compQty: 15, grossTotal: 96000.00 }
    ],
    summary: {
      totalSoldTickets: 4850,
      totalComps: 165,
      grossRevenue: 973500.00,
      diskFeePercent: 10.0,
      deductions: {
        diskServiceFee: 97350.00,
        processingFee: 28231.50,
        refundsSubtotal: 15400.00,
        otherDeductions: 1200.00
      },
      netEventBalance: 831318.50,
      alreadyTransferred: 320000.00,
      remainingBalance: 511318.50
    }
  },

  // LANÇAMENTOS DO EXTRATO / LIVRO-CAIXA
  statementEntries: [
    {
      id: "EXT-00491",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      date: "29/09/2026 09:15",
      type: "Venda PIX (Lote Aprovado)",
      orderRef: "ORD-99840 a ORD-99852",
      paymentMethod: "PIX",
      grossAmount: 14800.00,
      deductions: 1480.00,
      netAmount: 13320.00,
      balanceAfter: 310000.00,
      status: "Liquidado"
    },
    {
      id: "EXT-00490",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      date: "28/09/2026 18:30",
      type: "Venda Cartão de Crédito",
      orderRef: "ORD-99710 a ORD-99732",
      paymentMethod: "Cartão de Crédito",
      grossAmount: 28500.00,
      deductions: 3676.50,
      netAmount: 24823.50,
      balanceAfter: 296680.00,
      status: "A Liquidar (D+30)"
    },
    {
      id: "EXT-00489",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      date: "26/09/2026 14:00",
      type: "Repasse Bancário Programado",
      orderRef: "REP-00288",
      paymentMethod: "TED / PIX PJ",
      grossAmount: -80000.00,
      deductions: 0.00,
      netAmount: -80000.00,
      balanceAfter: 271856.50,
      status: "Pago"
    },
    {
      id: "EXT-00488",
      eventId: "evt-001",
      eventName: "Festival Curitiba 2026",
      date: "25/09/2026 11:20",
      type: "Estorno CDC (Cancelamento)",
      orderRef: "ORD-98441",
      paymentMethod: "Cartão de Crédito",
      grossAmount: -380.00,
      deductions: 0.00,
      netAmount: -380.00,
      balanceAfter: 351856.50,
      status: "Estornado"
    },
    {
      id: "EXT-00487",
      eventId: "evt-002",
      eventName: "Show Artista A (Teatro)",
      date: "24/09/2026 16:45",
      type: "Venda Bilheteria PDV",
      orderRef: "PDV-001-CUR",
      paymentMethod: "Cartão de Débito",
      grossAmount: 9400.00,
      deductions: 940.00,
      netAmount: 8460.00,
      balanceAfter: 352236.50,
      status: "Liquidado"
    }
  ],

  // Política Oficial de Repasse Disk (Parametrização Dinâmica & Precedência: Geral Disk → Produtor → Evento)
  payoutPolicies: {
    global: {
      minSalesPercent: 50,
      releasePercent: 20,
      considerRefunds: true,
      considerChargebacks: true,
      considerMdr: true,
      requireValidatedBank: true,
      requireDiskApproval: true,
      requireDigitalSignature: true,
      allowAdministrativeException: true,
      updatedAt: "2026-09-30 10:00:00",
      updatedBy: "Diretoria Financeira Disk"
    },
    byProducer: {},
    byEvent: {}
  },

  // Registro de Autorizações Excepcionais (A Trava Humana da Mesa Financeira Disk)
  exceptionalAuthorizations: [
    {
      id: "AUT-2026-00088",
      protocol: "AUT-2026-00088",
      eventId: "evt-002",
      eventName: "Show Artista A - Turnê Especial",
      producerId: "prod-abc",
      producerName: "Produtora ABC Ltda.",
      amount: 45000.00,
      reason: "Adiantamento emergencial de cachê artístico acordado em comitê comercial Disk.",
      authorizedBy: "Karine Mendes (Financeiro Disk)",
      createdAt: "2026-09-28T14:30:00.000Z",
      createdDate: "28/09/2026 14:30",
      status: "ATIVA",
      consumed: false,
      payoutId: null
    }
  ]
};

// Cópia profunda para permitir reset instantâneo na demo
export const getFreshDatabase = () => JSON.parse(JSON.stringify(initialMockDatabase));
