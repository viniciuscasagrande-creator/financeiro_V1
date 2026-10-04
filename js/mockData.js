/**
 * Módulo Financeiro Disk Ingressos - Core Financeiro Unificado
 * Base de dados compartilhada entre Portal do Produtor e Backoffice Financeiro Disk
 */

export const initialMockDatabase = {
  financialDocuments: [
    { id: "DOC-FIN-001", producerId: "prod-abc", eventId: "evt-001", eventName: "Festival Curitiba 2026", type: "Repasse", amount: 50000, date: "30/09/2026", reference: "REP-2026-00128", description: "Comprovante de liquidação de repasse", fileName: "comprovante_repasse_00128.pdf", visibleToProducer: true, uploadedBy: "Financeiro Disk" },
    { id: "DOC-FIN-002", producerId: "prod-abc", eventId: "evt-001", eventName: "Festival Curitiba 2026", type: "Pagamento", amount: 12000, date: "01/10/2026", reference: "PAG-ECAD-001", description: "Documento interno de obrigação do evento", fileName: "pagamento_ecad.pdf", visibleToProducer: false, uploadedBy: "Financeiro Disk" }
  ],
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
      governance: { registrationStatus: "Completo", homologationStatus: "Homologação Concluída", lastReview: "03/10/2026" },
      responsibles: [{ name: "Ana Martins", role: "Financeiro", email: "financeiro@produtoraabc.com.br", phone: "(41) 3315-0800" }],
      financialDocuments: [{ id:"fin-doc-abc-1", date:"02/10/2026", type:"Repasse", eventName:"Festival Curitiba 2026", amount:85000, fileName:"comprovante-repasse-85000.pdf", visibleToProducer:true }],
      auditHistory: [{ at:"03/10/2026 10:00", by:"Financeiro Disk", action:"Revisão cadastral e homologação confirmadas" }],
      hasBlock: false,
      blockedAmount: 20000.00,
      companyDetails: {
        stateRegistration: "908.765.432-11",
        municipalRegistration: "7.654.321-0",
        cnae: "90.01-9-01 - Produção de espetáculos teatrais e musicais",
        companySize: "Médio Porte (EPP)",
        taxRegime: "Lucro Real",
        openedAt: "10/05/2015"
      },
      address: {
        street: "Rua Comendador Araújo, 510, Conj. 801",
        neighborhood: "Batel",
        city: "Curitiba",
        state: "PR",
        zipCode: "80420-000"
      },
      legalRepresentatives: [
        {
          name: "João Silva",
          cpf: "223.445.667-89",
          role: "Diretor Geral / Sócio Administrador (60%)",
          email: "joao@produtoraabc.com.br",
          phone: "(41) 98877-6655"
        }
      ],
      financialContacts: [
        {
          name: "Ana Beatriz",
          role: "Gerente Financeira",
          email: "financeiro@produtoraabc.com.br",
          phone: "(41) 3315-0800"
        }
      ],
      contract: {
        number: "DISK-CTR-2025-089",
        diskFeePercent: 10.0,
        processingFeePercent: 2.9,
        anticipationRateMonthly: 2.0,
        settlementDaysRule: "D+2 após evento ou liberação sob demanda",
        retainedReservePercent: 5.0,
        creditLimit: 150000.00
      },
      documents: [
        {
          id: "DOC-SOC-ABC-01",
          type: "Contrato Social",
          name: "Contrato Social Consolidado 2025",
          fileName: "contrato_social_abc.pdf",
          uploadDate: "10/01/2026",
          status: "Válido",
          visibleToProducer: true
        },
        {
          id: "DOC-SOC-ABC-02",
          type: "Cartão CNPJ",
          name: "Comprovante de Inscrição RFB",
          fileName: "cartao_cnpj_abc.pdf",
          uploadDate: "10/01/2026",
          status: "Válido",
          visibleToProducer: true
        },
        {
          id: "DOC-SOC-ABC-03",
          type: "Certidão Negativa",
          name: "CND Municipal Curitiba",
          fileName: "cnd_municipal_curitiba.pdf",
          uploadDate: "05/02/2026",
          status: "Válido",
          visibleToProducer: false
        }
      ],
      auditLog: [
        {
          id: "AUD-ABC-01",
          timestamp: "10/01/2026 14:00",
          user: "Carlos Menezes (Disk Ingressos)",
          action: "Renovação Contratual",
          summary: "Renovação do Contrato Master DISK-CTR-2025-089 para temporada 2026."
        }
      ],
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
      name: "XYZ Produções Artísticas e Eventos Ltda.",
      tradeName: "XYZ Produções",
      cnpj: "12.345.678/0001-90",
      contactEmail: "pagamentos@xyzproducoes.com.br",
      phone: "(11) 3044-9900",
      accountManager: "Mariana Souza (Disk Ingressos)",
      rating: "Tier B - Padrão",
      status: "Ativo",
      riskScore: "Médio Risco (Score 78/100)",
      governance: { registrationStatus: "Completo", homologationStatus: "Homologação Concluída", lastReview: "03/10/2026" },
      responsibles: [{ name: "Paulo Lima", role: "Administrativo Financeiro", email: "pagamentos@xyzproducoes.com.br", phone: "(11) 3044-9900" }],
      financialDocuments: [],
      auditHistory: [],
      hasBlock: false,
      blockedAmount: 10000.00,
      companyDetails: {
        stateRegistration: "109.876.543.210",
        municipalRegistration: "8.765.432-1",
        cnae: "90.01-9-02 - Produção musical e eventos",
        companySize: "Médio Porte (EPP)",
        taxRegime: "Lucro Presumido",
        openedAt: "14/08/2018"
      },
      address: {
        street: "Av. Brigadeiro Faria Lima, 2000, 10º andar",
        neighborhood: "Itaim Bibi",
        city: "São Paulo",
        state: "SP",
        zipCode: "01452-000"
      },
      legalRepresentatives: [
        {
          name: "Roberto Souza",
          cpf: "112.334.556-78",
          role: "Sócio Administrador (80%)",
          email: "roberto@xyzproducoes.com.br",
          phone: "(11) 99876-5432"
        }
      ],
      financialContacts: [
        {
          name: "Carla Pires",
          role: "Coordenadora Financeira",
          email: "carla.pires@xyzproducoes.com.br",
          phone: "(11) 98765-4321"
        }
      ],
      contract: {
        number: "DISK-CTR-2025-112",
        diskFeePercent: 12.0,
        processingFeePercent: 3.1,
        anticipationRateMonthly: 2.4,
        settlementDaysRule: "D+2 após evento",
        retainedReservePercent: 5.0,
        creditLimit: 80000.00
      },
      documents: [
        {
          id: "DOC-SOC-XYZ-01",
          type: "Contrato Social",
          name: "5ª Alteração Contratual Consolidada",
          fileName: "contrato_social_xyz_2025.pdf",
          uploadDate: "15/01/2026",
          status: "Válido",
          visibleToProducer: true
        },
        {
          id: "DOC-SOC-XYZ-02",
          type: "Cartão CNPJ",
          name: "Comprovante de Inscrição RFB",
          fileName: "cartao_cnpj_rfb_2026.pdf",
          uploadDate: "02/02/2026",
          status: "Válido",
          visibleToProducer: true
        },
        {
          id: "DOC-SOC-XYZ-03",
          type: "Certidão Negativa",
          name: "CND Federal / Previdenciária",
          fileName: "cnd_receita_federal_2026.pdf",
          uploadDate: "10/03/2026",
          status: "Válido",
          visibleToProducer: false
        }
      ],
      auditLog: [
        {
          id: "AUD-XYZ-01",
          timestamp: "15/01/2026 10:30",
          user: "Karine Santos (Controladoria Disk)",
          action: "Homologação Cadastral",
          summary: "Homologação do Cadastro Mestre concluída com parecer favorável."
        }
      ],
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
          holderName: "XYZ Produções Artísticas e Eventos Ltda.",
          cnpj: "12.345.678/0001-90",
          pixKey: "12.345.678/0001-90",
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
      governance: { registrationStatus: "Completo", homologationStatus: "Homologação Concluída", lastReview: "03/10/2026" },
      responsibles: [{ name: "Luciana Duarte", role: "Diretora Financeira", email: "adm@premiumshows.com.br", phone: "(48) 3221-5000" }],
      financialDocuments: [],
      auditHistory: [],
      hasBlock: false,
      blockedAmount: 0.00,
      companyDetails: {
        stateRegistration: "258.963.147",
        municipalRegistration: "147.258-9",
        cnae: "90.01-9-02 - Produção musical e eventos",
        companySize: "Grande Porte",
        taxRegime: "Lucro Real",
        openedAt: "12/03/2010"
      },
      address: {
        street: "Rodovia Maurício Sirotsky Sobrinho, 5000",
        neighborhood: "Jurerê Internacional",
        city: "Florianópolis",
        state: "SC",
        zipCode: "88053-700"
      },
      legalRepresentatives: [
        {
          name: "Eduardo Camargo",
          cpf: "334.556.778-90",
          role: "Presidente Executivo",
          email: "eduardo@premiumshows.com.br",
          phone: "(48) 99988-7766"
        }
      ],
      financialContacts: [
        {
          name: "Juliana Mendes",
          role: "Diretora Financeira",
          email: "juliana@premiumshows.com.br",
          phone: "(48) 3221-5000"
        }
      ],
      contract: {
        number: "DISK-CTR-2024-045",
        diskFeePercent: 9.5,
        processingFeePercent: 2.8,
        anticipationRateMonthly: 1.9,
        settlementDaysRule: "D+1 após evento",
        retainedReservePercent: 3.0,
        creditLimit: 300000.00
      },
      documents: [
        {
          id: "DOC-SOC-PREM-01",
          type: "Contrato Social",
          name: "Estatuto Social Consolidado",
          fileName: "estatuto_social_premium.pdf",
          uploadDate: "05/11/2024",
          status: "Válido",
          visibleToProducer: true
        }
      ],
      auditLog: [
        {
          id: "AUD-PREM-01",
          timestamp: "05/11/2024 11:00",
          user: "Carlos Menezes (Disk Ingressos)",
          action: "Homologação Tier A",
          summary: "Classificação Tier A - Premium aprovada pela Controladoria."
        }
      ],
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
  ],

  // --------------------------------------------------------------------------
  // MÓDULO CORPORATIVO DISK INTERNO: RECURSOS HUMANOS (RH DISK) & DISK PONTO
  // --------------------------------------------------------------------------
  rhDepartamentos: [
    { id: "dep-01", nome: "Operações e Bilheteria de Eventos", sigla: "OPE-EVT", centroCusto: "CC-2040", responsavel: "Carlos Eduardo Mendes", colaboradoresCount: 18 },
    { id: "dep-02", nome: "Tecnologia da Informação & Core", sigla: "TI-COR", centroCusto: "CC-3010", responsavel: "Vinicius Master", colaboradoresCount: 12 },
    { id: "dep-03", nome: "Financeiro, Controladoria e Tesouraria", sigla: "FIN-TES", centroCusto: "CC-1020", responsavel: "Maria Valente", colaboradoresCount: 9 },
    { id: "dep-04", nome: "Comercial, Parcerias e Atendimento", sigla: "COM-ATE", centroCusto: "CC-4010", responsavel: "Juliana Rocha", colaboradoresCount: 15 },
    { id: "dep-05", nome: "Gente, Gestão & Recursos Humanos", sigla: "GGR-RH", centroCusto: "CC-1050", responsavel: "Patricia Albuquerque", colaboradoresCount: 5 }
  ],

  rhCargos: [
    { id: "crg-01", titulo: "Coordenador de Bilheteria de Campo", cbo: "1423-05", departamento: "Operações e Bilheteria de Eventos", nivel: "Sênior", salarioBase: 4800.00, tipoContratoDefault: "CLT" },
    { id: "crg-02", titulo: "Supervisor de Atendimento e Acesso", cbo: "1423-20", departamento: "Operações e Bilheteria de Eventos", nivel: "Pleno", salarioBase: 3800.00, tipoContratoDefault: "CLT" },
    { id: "crg-03", titulo: "Operador de Bilheteria / Caixa Freelancer", cbo: "4211-25", departamento: "Operações e Bilheteria de Eventos", nivel: "Operacional", salarioBase: 0.00, valorDiariaDefault: 180.00, tipoContratoDefault: "FREELANCER_EVENTO" },
    { id: "crg-04", titulo: "Analista Financeiro Pleno", cbo: "2525-05", departamento: "Financeiro, Controladoria e Tesouraria", nivel: "Pleno", salarioBase: 4600.00, tipoContratoDefault: "CLT" },
    { id: "crg-05", titulo: "Engenheiro de Software Fullstack", cbo: "2124-05", departamento: "Tecnologia da Informação & Core", nivel: "Sênior", salarioBase: 9500.00, tipoContratoDefault: "CLT" }
  ],

  rhGeofences: [
    {
      id: "geo-sede-disk",
      nome: "Sede DiskIngressos Curitiba",
      tipo: "SEDE",
      latitude: -25.4284,
      longitude: -49.2733,
      raioMetros: 150,
      endereco: "Rua Visconde de Nácar, 1505 - Centro",
      cidade: "Curitiba",
      uf: "PR",
      ativo: true,
      colaboradoresVinculados: 35
    },
    {
      id: "geo-arena-baixada",
      nome: "Arena da Baixada (Ligga Arena)",
      tipo: "ARENA_EVENTO",
      latitude: -25.4484,
      longitude: -49.2770,
      raioMetros: 350,
      endereco: "Rua Buenos Aires, 1260 - Água Verde",
      cidade: "Curitiba",
      uf: "PR",
      ativo: true,
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      colaboradoresVinculados: 24
    },
    {
      id: "geo-pedreira-paulo-leminski",
      nome: "Pedreira Paulo Leminski",
      tipo: "ARENA_EVENTO",
      latitude: -25.3855,
      longitude: -49.2789,
      raioMetros: 400,
      endereco: "Rua João Gava, 970 - Abranches",
      cidade: "Curitiba",
      uf: "PR",
      ativo: true,
      eventoId: "evt-001",
      eventoNome: "Festival Curitiba 2026",
      colaboradoresVinculados: 40
    },
    {
      id: "geo-teatro-positivo",
      nome: "Teatro Positivo Grande Auditório",
      tipo: "ARENA_EVENTO",
      latitude: -25.4503,
      longitude: -49.3601,
      raioMetros: 250,
      endereco: "Rua Prof. Pedro Viriato Parigot de Souza, 5300",
      cidade: "Curitiba",
      uf: "PR",
      ativo: true,
      eventoId: "evt-002",
      eventoNome: "Show Artista A - Turnê Especial",
      colaboradoresVinculados: 12
    }
  ],

  rhColaboradores: [
    {
      id: "colab-001",
      matricula: "DISK-00101",
      nome: "Carlos Eduardo Mendes",
      cpf: "234.567.890-12",
      rg: "8.912.345-1 SSP/PR",
      email: "carlos.mendes@diskingressos.com.br",
      telefone: "(41) 98822-1144",
      fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      cargoId: "crg-01",
      cargoNome: "Coordenador de Bilheteria de Campo",
      departamentoId: "dep-01",
      departamentoNome: "Operações e Bilheteria de Eventos",
      tipoContrato: "CLT",
      status: "ATIVO",
      dataAdmissao: "15/03/2021",
      salario: 4800.00,
      chavePix: "23456789012",
      tipoChavePix: "CPF",
      banco: "033 - Santander",
      agencia: "3210",
      conta: "98765-4",
      geofencePadraoId: "geo-sede-disk",
      jornada: "08:00 às 17:48 (Seg-Sex) - 44h",
      saldoBancoHoras: "+14h 20m"
    },
    {
      id: "colab-002",
      matricula: "DISK-00205",
      nome: "Camila Fernandes Silveira",
      cpf: "456.789.012-34",
      rg: "10.456.789-2 SSP/PR",
      email: "camila.silveira@diskingressos.com.br",
      telefone: "(41) 99755-4433",
      fotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      cargoId: "crg-02",
      cargoNome: "Supervisora de Atendimento e Acesso",
      departamentoId: "dep-01",
      departamentoNome: "Operações e Bilheteria de Eventos",
      tipoContrato: "CLT",
      status: "ATIVO",
      dataAdmissao: "02/08/2022",
      salario: 3800.00,
      chavePix: "camila.silveira@diskingressos.com.br",
      tipoChavePix: "EMAIL",
      banco: "260 - Nu Pagamentos",
      agencia: "0001",
      conta: "1234567-8",
      geofencePadraoId: "geo-sede-disk",
      jornada: "08:00 às 17:48 (Seg-Sex) - 44h",
      saldoBancoHoras: "+06h 45m"
    },
    {
      id: "colab-003",
      matricula: "DISK-00388",
      nome: "Lucas Gabriel Pinheiro",
      cpf: "678.901.234-56",
      rg: "12.789.012-3 SSP/PR",
      email: "lucas.pinheiro.ops@gmail.com",
      telefone: "(41) 99111-2233",
      fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      cargoId: "crg-03",
      cargoNome: "Operador de Bilheteria / Caixa Freelancer",
      departamentoId: "dep-01",
      departamentoNome: "Operações e Bilheteria de Eventos",
      tipoContrato: "FREELANCER_EVENTO",
      status: "ATIVO",
      dataAdmissao: "10/01/2024",
      salario: 0.00,
      valorDiariaEvento: 180.00,
      chavePix: "67890123456",
      tipoChavePix: "CPF",
      banco: "341 - Itaú Unibanco",
      agencia: "0412",
      conta: "55441-2",
      geofencePadraoId: "geo-arena-baixada",
      jornada: "Por Escala de Evento",
      saldoBancoHoras: "0h"
    },
    {
      id: "colab-004",
      matricula: "DISK-00412",
      nome: "Beatriz Nogueira Ramos",
      cpf: "789.012.345-67",
      rg: "11.234.567-4 SSP/PR",
      email: "beatriz.ramos@diskingressos.com.br",
      telefone: "(41) 98444-5566",
      fotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      cargoId: "crg-04",
      cargoNome: "Analista Financeiro Pleno",
      departamentoId: "dep-03",
      departamentoNome: "Financeiro, Controladoria e Tesouraria",
      tipoContrato: "CLT",
      status: "ATIVO",
      dataAdmissao: "04/05/2023",
      salario: 4600.00,
      chavePix: "beatriz.ramos@diskingressos.com.br",
      tipoChavePix: "EMAIL",
      banco: "001 - Banco do Brasil",
      agencia: "1822",
      conta: "33211-9",
      geofencePadraoId: "geo-sede-disk",
      jornada: "08:30 às 18:18 (Seg-Sex) - 44h",
      saldoBancoHoras: "-01h 15m"
    },
    {
      id: "colab-005",
      matricula: "DISK-00520",
      nome: "Rodrigo Almeida Siqueira",
      cpf: "890.123.456-78",
      rg: "9.876.543-8 SSP/PR",
      email: "rodrigo.siqueira.ops@outlook.com",
      telefone: "(41) 99666-7788",
      fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      cargoId: "crg-03",
      cargoNome: "Operador de Bilheteria / Caixa Freelancer",
      departamentoId: "dep-01",
      departamentoNome: "Operações e Bilheteria de Eventos",
      tipoContrato: "FREELANCER_EVENTO",
      status: "ATIVO",
      dataAdmissao: "15/02/2024",
      salario: 0.00,
      valorDiariaEvento: 180.00,
      chavePix: "89012345678",
      tipoChavePix: "CPF",
      banco: "237 - Bradesco",
      agencia: "2104",
      conta: "44120-0",
      geofencePadraoId: "geo-arena-baixada",
      jornada: "Por Escala de Evento",
      saldoBancoHoras: "0h"
    }
  ],

  rhRegistrosPonto: [
    {
      id: "ponto-1001",
      nsr: 1001,
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipo: "ENTRADA",
      dataHoraMarcacao: "2026-10-03T07:58:12.000Z",
      dataHoraFormatada: "03/10/2026 07:58:12",
      latitude: -25.42841,
      longitude: -49.27329,
      precisaoMetros: 8.5,
      geofenceId: "geo-sede-disk",
      geofenceNome: "Sede DiskIngressos Curitiba",
      dentroGeofence: true,
      distanciaGeofence: 4.2,
      modoCaptura: "APP_ONLINE",
      hashIntegridade: "a7f9c2d1e4b8650f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f",
      comprovanteNsr: "MTE671-000001001-A7F9C2D1",
      dispositivoInfo: "Samsung Galaxy A54 (Android 14) - Disk Ponto APK v1.0",
      sincronizado: true
    },
    {
      id: "ponto-1002",
      nsr: 1002,
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipo: "INTERVALO_INICIO",
      dataHoraMarcacao: "2026-10-03T12:02:44.000Z",
      dataHoraFormatada: "03/10/2026 12:02:44",
      latitude: -25.42839,
      longitude: -49.27331,
      precisaoMetros: 9.1,
      geofenceId: "geo-sede-disk",
      geofenceNome: "Sede DiskIngressos Curitiba",
      dentroGeofence: true,
      distanciaGeofence: 6.8,
      modoCaptura: "APP_ONLINE",
      hashIntegridade: "b8e1f3a5c7d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2",
      comprovanteNsr: "MTE671-000001002-B8E1F3A5",
      dispositivoInfo: "Samsung Galaxy A54 (Android 14) - Disk Ponto APK v1.0",
      sincronizado: true
    },
    {
      id: "ponto-1003",
      nsr: 1003,
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipo: "INTERVALO_FIM",
      dataHoraMarcacao: "2026-10-03T13:01:10.000Z",
      dataHoraFormatada: "03/10/2026 13:01:10",
      latitude: -25.42840,
      longitude: -49.27330,
      precisaoMetros: 7.4,
      geofenceId: "geo-sede-disk",
      geofenceNome: "Sede DiskIngressos Curitiba",
      dentroGeofence: true,
      distanciaGeofence: 5.1,
      modoCaptura: "APP_ONLINE",
      hashIntegridade: "c9d2e4f6a8b0c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d3",
      comprovanteNsr: "MTE671-000001003-C9D2E4F6",
      dispositivoInfo: "Samsung Galaxy A54 (Android 14) - Disk Ponto APK v1.0",
      sincronizado: true
    },
    {
      id: "ponto-1004",
      nsr: 1004,
      colaboradorId: "colab-003",
      colaboradorNome: "Lucas Gabriel Pinheiro",
      tipo: "ENTRADA",
      dataHoraMarcacao: "2026-10-03T14:30:00.000Z",
      dataHoraFormatada: "03/10/2026 14:30:00",
      latitude: -25.44845,
      longitude: -49.27698,
      precisaoMetros: 11.2,
      geofenceId: "geo-arena-baixada",
      geofenceNome: "Arena da Baixada (Ligga Arena)",
      dentroGeofence: true,
      distanciaGeofence: 22.4,
      modoCaptura: "APP_ONLINE",
      hashIntegridade: "d0e3f5a7b9c1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e4",
      comprovanteNsr: "MTE671-000001004-D0E3F5A7",
      dispositivoInfo: "Motorola Edge 40 - Disk Ponto APK v1.0",
      sincronizado: true
    }
  ],

  rhAjustesPonto: [
    {
      id: "ajuste-2026-001",
      colaboradorId: "colab-004",
      colaboradorNome: "Beatriz Nogueira Ramos",
      dataPonto: "02/10/2026",
      tipoAjuste: "SAIDA",
      horarioCorreto: "18:18",
      motivo: "ESQUECIMENTO",
      justificativa: "Fiquei em reunião com a gerência financeira até às 18:20 e acabei não registrando a saída no aplicativo móvel.",
      comprovanteUrl: null,
      status: "PENDENTE",
      criadoEm: "03/10/2026 09:15"
    }
  ],

  rhEquipesCustosEvento: [
    {
      id: "custo-mo-001",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      produtorId: "prod-xyz",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      cargoFuncao: "Coordenador Geral de Bilheteria & Catracas",
      tipoContratacao: "CLT",
      valorDiaria: 350.00,
      horasTrabalhadas: 10.0,
      valorHorasExtras: 120.00,
      auxilioAlimentacao: 50.00,
      auxilioTransporte: 40.00,
      valorTotal: 560.00,
      statusPagamento: "AUTORIZADO_RH",
      chavePix: "23456789012",
      tipoChavePix: "CPF",
      banco: "033 - Santander"
    },
    {
      id: "custo-mo-002",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      produtorId: "prod-xyz",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      cargoFuncao: "Supervisora de Catracas e Atendimento VIP",
      tipoContratacao: "CLT",
      valorDiaria: 280.00,
      horasTrabalhadas: 9.5,
      valorHorasExtras: 90.00,
      auxilioAlimentacao: 50.00,
      auxilioTransporte: 40.00,
      valorTotal: 460.00,
      statusPagamento: "AUTORIZADO_RH",
      chavePix: "camila.silveira@diskingressos.com.br",
      tipoChavePix: "EMAIL",
      banco: "260 - Nu Pagamentos"
    },
    {
      id: "custo-mo-003",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      produtorId: "prod-xyz",
      colaboradorId: "colab-003",
      colaboradorNome: "Lucas Gabriel Pinheiro",
      cargoFuncao: "Operador de Caixa e Bilheteria Portão Principal",
      tipoContratacao: "FREELANCER_EVENTO",
      valorDiaria: 180.00,
      horasTrabalhadas: 8.0,
      valorHorasExtras: 0.00,
      auxilioAlimentacao: 40.00,
      auxilioTransporte: 30.00,
      valorTotal: 250.00,
      statusPagamento: "PREVISTO",
      chavePix: "67890123456",
      tipoChavePix: "CPF",
      banco: "341 - Itaú Unibanco"
    },
    {
      id: "custo-mo-004",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      produtorId: "prod-xyz",
      colaboradorId: "colab-005",
      colaboradorNome: "Rodrigo Almeida Siqueira",
      cargoFuncao: "Operador de Caixa e Bilheteria Portão Pista Premium",
      tipoContratacao: "FREELANCER_EVENTO",
      valorDiaria: 180.00,
      horasTrabalhadas: 8.0,
      valorHorasExtras: 0.00,
      auxilioAlimentacao: 40.00,
      auxilioTransporte: 30.00,
      valorTotal: 250.00,
      statusPagamento: "PREVISTO",
      chavePix: "89012345678",
      tipoChavePix: "CPF",
      banco: "237 - Bradesco"
    }
  ],

  rhAuditLogs: [
    {
      id: "log-rh-001",
      at: "03/10/2026 08:00:15",
      by: "Carlos Eduardo Mendes",
      colaboradorAfetado: "Carlos Eduardo Mendes (DISK-00101)",
      acao: "REGISTRO_PONTO",
      entidade: "RegistroPonto",
      detalhes: "Ponto batido via Disk Ponto APK (Entrada às 07:58:12). Validação de geofence Sede Disk: DENTRO (distância 4.2m).",
      ip: "189.112.45.10"
    },
    {
      id: "log-rh-002",
      at: "03/10/2026 09:15:22",
      by: "Beatriz Nogueira Ramos",
      colaboradorAfetado: "Beatriz Nogueira Ramos (DISK-00412)",
      acao: "SOLICITACAO_AJUSTE",
      entidade: "SolicitacaoAjustePonto",
      detalhes: "Solicitação de inclusão de saída em 02/10 às 18:18 por esquecimento.",
      ip: "177.92.10.88"
    },
    {
      id: "log-rh-003",
      at: "03/10/2026 11:30:00",
      by: "Patricia Albuquerque (RH)",
      colaboradorAfetado: "Equipe Show Nacional de Rock Curitiba",
      acao: "ESCALA_EVENTO_CRIADA",
      entidade: "CustoMaoDeObraEvento",
      detalhes: "Alocação de 4 profissionais para a Ligga Arena (Show Nacional de Rock Curitiba). Custo previsto de mão de obra direta: R$ 1.520,00.",
      ip: "10.0.1.15"
    }
  ],

  rhJornadas: [
    {
      id: "jor-padrao-44h",
      nome: "Comercial Padrão 44h (Seg-Sex)",
      tipo: "SEMANAL_44H",
      entrada: "08:00",
      inicioIntervalo: "12:00",
      fimIntervalo: "13:00",
      saida: "17:48",
      toleranciaMinutos: 10,
      cargaMinutos: 480,
      colaboradoresCount: 28
    },
    {
      id: "jor-show-noturno",
      nome: "Operação Arena / Show Noturno",
      tipo: "ESCALA_EVENTO",
      entrada: "14:00",
      inicioIntervalo: "18:00",
      fimIntervalo: "19:00",
      saida: "23:00",
      toleranciaMinutos: 15,
      cargaMinutos: 480,
      colaboradoresCount: 45
    },
    {
      id: "jor-plantao-12x36",
      nome: "Plantão Bilheteria Central 12x36",
      tipo: "ESCALA_12X36",
      entrada: "07:00",
      inicioIntervalo: "12:00",
      fimIntervalo: "13:00",
      saida: "19:00",
      toleranciaMinutos: 10,
      cargaMinutos: 660,
      colaboradoresCount: 6
    }
  ],

  rhEscalas: [
    {
      id: "esc-101",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      jornadaId: "jor-padrao-44h",
      jornadaNome: "Comercial Padrão 44h",
      localId: "geo-sede-disk",
      localNome: "Sede DiskIngressos Curitiba",
      data: "2026-10-04",
      dataFormatada: "04/10/2026",
      horarioPrevisto: "08:00 às 17:48",
      status: "CONFIRMADA",
      eventoNome: "Operação Central Sede"
    },
    {
      id: "esc-102",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      jornadaId: "jor-padrao-44h",
      jornadaNome: "Comercial Padrão 44h",
      localId: "geo-sede-disk",
      localNome: "Sede DiskIngressos Curitiba",
      data: "2026-10-04",
      dataFormatada: "04/10/2026",
      horarioPrevisto: "08:00 às 17:48",
      status: "CONFIRMADA",
      eventoNome: "Operação Central Sede"
    },
    {
      id: "esc-103",
      colaboradorId: "colab-003",
      colaboradorNome: "Lucas Gabriel Pinheiro",
      jornadaId: "jor-show-noturno",
      jornadaNome: "Operação Arena / Show Noturno",
      localId: "geo-arena-baixada",
      localNome: "Arena da Baixada (Ligga Arena)",
      data: "2026-10-04",
      dataFormatada: "04/10/2026",
      horarioPrevisto: "14:00 às 23:00",
      status: "CONFIRMADA",
      eventoNome: "Show Nacional de Rock Curitiba"
    },
    {
      id: "esc-104",
      colaboradorId: "colab-005",
      colaboradorNome: "Rodrigo Almeida Siqueira",
      jornadaId: "jor-show-noturno",
      jornadaNome: "Operação Arena / Show Noturno",
      localId: "geo-arena-baixada",
      localNome: "Arena da Baixada (Ligga Arena)",
      data: "2026-10-04",
      dataFormatada: "04/10/2026",
      horarioPrevisto: "14:00 às 23:00",
      status: "CONFIRMADA",
      eventoNome: "Show Nacional de Rock Curitiba"
    }
  ],

  rhBancoHoras: [
    {
      id: "bh-001",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      matricula: "DISK-00101",
      departamento: "Operações e Bilheteria de Eventos",
      competencia: "2026-10",
      saldoMinutos: 860,
      saldoFormatado: "+14h 20m",
      horasExtras50: 10.5,
      horasExtras100: 3.83,
      compensacoes: 0,
      status: "POSITIVO",
      ultimaAtualizacao: "04/10/2026 12:00"
    },
    {
      id: "bh-002",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      matricula: "DISK-00205",
      departamento: "Operações e Bilheteria de Eventos",
      competencia: "2026-10",
      saldoMinutos: 345,
      saldoFormatado: "+05h 45m",
      horasExtras50: 5.75,
      horasExtras100: 0,
      compensacoes: 0,
      status: "POSITIVO",
      ultimaAtualizacao: "04/10/2026 12:00"
    },
    {
      id: "bh-003",
      colaboradorId: "colab-004",
      colaboradorNome: "Beatriz Nogueira Ramos",
      matricula: "DISK-00412",
      departamento: "Financeiro, Controladoria e Tesouraria",
      competencia: "2026-10",
      saldoMinutos: -120,
      saldoFormatado: "-02h 00m",
      horasExtras50: 0,
      horasExtras100: 0,
      compensacoes: 2.0,
      status: "DEVEDOR",
      ultimaAtualizacao: "04/10/2026 12:00"
    }
  ],

  rhFechamentosPonto: [
    {
      id: "fech-2026-09",
      competencia: "2026-09",
      periodoInicio: "01/09/2026",
      periodoFim: "30/09/2026",
      status: "FECHADO",
      totalColaboradores: 49,
      totalBatidas: 1960,
      totalHorasTrabalhadas: "8.624h",
      totalHorasExtras: "312h",
      ajustesPendentes: 0,
      fechadoEm: "01/10/2026 10:00",
      fechadoPor: "Patricia Albuquerque (RH)",
      espelhoHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      bloqueado: true
    },
    {
      id: "fech-2026-10",
      competencia: "2026-10",
      periodoInicio: "01/10/2026",
      periodoFim: "31/10/2026",
      status: "ABERTO",
      totalColaboradores: 52,
      totalBatidas: 412,
      totalHorasTrabalhadas: "1.820h",
      totalHorasExtras: "62h",
      ajustesPendentes: 1,
      fechadoEm: null,
      fechadoPor: null,
      espelhoHash: null,
      bloqueado: false
    }
  ],

  rhDispositivos: [
    {
      id: "disp-001",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      modelo: "Samsung Galaxy A54",
      sistemaOperacional: "Android 14 (OneUI 6.0)",
      versaoApp: "Disk Ponto APK v1.0.4",
      uuidDispositivo: "d83f-492a-8891-b3847921",
      biometriaAtiva: true,
      gpsAtivo: true,
      mockLocationDetectado: false,
      status: "AUTORIZADO",
      ultimaSincronizacao: "Hoje às 12:02",
      cadastradoEm: "15/05/2026"
    },
    {
      id: "disp-002",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      modelo: "Apple iPhone 13 Pro",
      sistemaOperacional: "iOS 17.5",
      versaoApp: "Disk Ponto PWA / Web",
      uuidDispositivo: "a190-281b-cc91-99827461",
      biometriaAtiva: true,
      gpsAtivo: true,
      mockLocationDetectado: false,
      status: "AUTORIZADO",
      ultimaSincronizacao: "Hoje às 08:05",
      cadastradoEm: "10/06/2026"
    },
    {
      id: "disp-003",
      colaboradorId: "colab-003",
      colaboradorNome: "Lucas Gabriel Pinheiro",
      modelo: "Motorola Edge 40",
      sistemaOperacional: "Android 13",
      versaoApp: "Disk Ponto APK v1.0.4",
      uuidDispositivo: "f441-993a-128a-77461902",
      biometriaAtiva: false,
      gpsAtivo: true,
      mockLocationDetectado: false,
      status: "AUTORIZADO",
      ultimaSincronizacao: "Hoje às 14:30",
      cadastradoEm: "20/07/2026"
    },
    {
      id: "disp-004",
      colaboradorId: "colab-999",
      colaboradorNome: "Aparelho Antigo Substituído",
      modelo: "Xiaomi Redmi Note 10",
      sistemaOperacional: "Android 11",
      versaoApp: "Disk Ponto APK v0.9",
      uuidDispositivo: "bb12-990a-112c-00918273",
      biometriaAtiva: false,
      gpsAtivo: false,
      mockLocationDetectado: true,
      status: "BLOQUEADO",
      ultimaSincronizacao: "28/09/2026",
      cadastradoEm: "10/01/2026"
    }
  ],

  rhFerias: [
    {
      id: "fer-001",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      cargo: "Supervisor de Atendimento e Acesso",
      periodoAquisitivo: "15/06/2024 a 14/06/2025",
      periodoConcessivoLimite: "14/05/2026",
      diasDireito: 30,
      diasGozo: 20,
      diasAbonoPecuniario: 10,
      adiantamentoDecimoTerceiro: true,
      dataInicio: "01/11/2026",
      dataFim: "20/11/2026",
      valorBruto: 5600.00,
      valorTercoConstitucional: 1866.67,
      totalAReceber: 7466.67,
      status: "APROVADO",
      solicitadoEm: "10/09/2026",
      aprovadoPor: "Patricia Albuquerque (RH)"
    },
    {
      id: "fer-002",
      colaboradorId: "colab-004",
      colaboradorNome: "Beatriz Nogueira Ramos",
      cargo: "Analista Financeiro Pleno",
      periodoAquisitivo: "01/02/2025 a 31/01/2026",
      periodoConcessivoLimite: "31/12/2026",
      diasDireito: 30,
      diasGozo: 30,
      diasAbonoPecuniario: 0,
      adiantamentoDecimoTerceiro: false,
      dataInicio: "15/12/2026",
      dataFim: "13/01/2027",
      valorBruto: 4600.00,
      valorTercoConstitucional: 1533.33,
      totalAReceber: 6133.33,
      status: "SOLICITADO",
      solicitadoEm: "28/09/2026",
      aprovadoPor: null
    }
  ],

  rhAtestados: [
    {
      id: "atest-001",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      medicoNome: "Dr. Roberto Guimarães",
      crm: "29845-PR",
      cid10: "J06.9 - Infecção aguda das vias aéreas superiores",
      dataInicio: "18/09/2026",
      dataFim: "19/09/2026",
      diasAfastamento: 2,
      horasAbonadas: 16,
      afastamentoPrevidenciario: false,
      encaminhadoINSS: false,
      status: "HOMOLOGADO",
      documentoUrl: "comprovantes/atestado_carlos_set2026.pdf",
      homologadoPor: "Dra. Silvana (Medicina Ocupacional)",
      homologadoEm: "18/09/2026 14:00"
    },
    {
      id: "atest-002",
      colaboradorId: "colab-004",
      colaboradorNome: "Beatriz Nogueira Ramos",
      medicoNome: "Dra. Carolina Mattos",
      crm: "34112-PR",
      cid10: "M54.5 - Dor lombar baixa (Lumbago)",
      dataInicio: "05/10/2026",
      dataFim: "05/10/2026",
      diasAfastamento: 1,
      horasAbonadas: 8,
      afastamentoPrevidenciario: false,
      encaminhadoINSS: false,
      status: "EM_ANALISE",
      documentoUrl: "comprovantes/atestado_beatriz_out2026.pdf",
      homologadoPor: null,
      homologadoEm: null
    }
  ],

  rhAdmissoes: [
    {
      id: "adm-2026-001",
      candidatoNome: "Mariana Albuquerque Prado",
      cpf: "567.890.123-45",
      email: "mariana.prado@gmail.com",
      telefone: "(41) 98877-6655",
      cargoPretendido: "Analista de Suporte de Bilheteria Jr",
      departamento: "Operações e Bilheteria de Eventos",
      tipoContrato: "CLT",
      salarioProposto: 3200.00,
      dataPrevisaoInicio: "15/10/2026",
      status: "DOCUMENTOS_ENVIADOS",
      progressoEtapas: "80%",
      checklist: [
        { item: "RG e CPF autenticados", status: "APROVADO" },
        { item: "Carteira de Trabalho Digital (CTPS)", status: "APROVADO" },
        { item: "Comprovante de Residência recente", status: "APROVADO" },
        { item: "Exame Médico Admissional (ASO)", status: "APROVADO" },
        { item: "Dados Bancários & Chave PIX", status: "PENDENTE" }
      ],
      responsavelRH: "Patricia Albuquerque (RH)"
    },
    {
      id: "adm-2026-002",
      candidatoNome: "Felipe Zanin de Castro",
      cpf: "678.901.234-56",
      email: "felipe.zanin@yahoo.com.br",
      telefone: "(41) 97766-5544",
      cargoPretendido: "Especialista em Infraestrutura Cloud",
      departamento: "Tecnologia da Informação & Core",
      tipoContrato: "CLT",
      salarioProposto: 11000.00,
      dataPrevisaoInicio: "01/11/2026",
      status: "EM_ANALISE",
      progressoEtapas: "50%",
      checklist: [
        { item: "RG e CPF autenticados", status: "APROVADO" },
        { item: "Carteira de Trabalho Digital (CTPS)", status: "PENDENTE" },
        { item: "Comprovante de Residência recente", status: "APROVADO" },
        { item: "Exame Médico Admissional (ASO)", status: "AGENDADO" },
        { item: "Dados Bancários & Chave PIX", status: "PENDENTE" }
      ],
      responsavelRH: "Vinicius Master (TI / RH)"
    }
  ],

  rhGedDocumentos: [
    {
      id: "doc-ged-001",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipoDocumento: "CONTRATO_TRABALHO",
      titulo: "Contrato Individual de Trabalho CLT - Disk Ingressos",
      dataEmissao: "15/03/2021",
      assinado: true,
      assinadoEm: "15/03/2021 10:14:32",
      ipAssinatura: "189.112.45.10",
      hashSha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      tamanhoKb: 245,
      status: "VALIDO"
    },
    {
      id: "doc-ged-002",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipoDocumento: "ACORDO_BANCO_HORAS",
      titulo: "Acordo Individual de Compensação e Banco de Horas",
      dataEmissao: "02/01/2026",
      assinado: true,
      assinadoEm: "02/01/2026 09:30:15",
      ipAssinatura: "189.112.45.10",
      hashSha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      tamanhoKb: 118,
      status: "VALIDO"
    },
    {
      id: "doc-ged-003",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      tipoDocumento: "TERMO_LGPD_CONFIDENCIALIDADE",
      titulo: "Termo de Confidencialidade, Proteção de Dados e LGPD",
      dataEmissao: "10/01/2026",
      assinado: true,
      assinadoEm: "10/01/2026 14:22:01",
      ipAssinatura: "177.105.12.44",
      hashSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      tamanhoKb: 164,
      status: "VALIDO"
    },
    {
      id: "doc-ged-004",
      colaboradorId: "colab-004",
      colaboradorNome: "Beatriz Nogueira Ramos",
      tipoDocumento: "OPCAO_VALE_TRANSPORTE",
      titulo: "Termo de Opção de Vale Transporte (Lei 7.418/1985)",
      dataEmissao: "01/02/2024",
      assinado: true,
      assinadoEm: "01/02/2024 11:05:00",
      ipAssinatura: "177.92.10.88",
      hashSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      tamanhoKb: 92,
      status: "VALIDO"
    }
  ],

  rhBeneficios: [
    {
      id: "ben-001",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipo: "VALE_TRANSPORTE",
      nomeBeneficio: "Vale Transporte URBS Curitiba",
      operadora: "URBS / Metrocard",
      valorMensalIntegral: 352.00,
      descontoEmFolha6Pct: 288.00,
      custoEmpresa: 64.00,
      status: "ATIVO"
    },
    {
      id: "ben-002",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      tipo: "VALE_REFEICAO",
      nomeBeneficio: "Vale Refeição / Alimentação Flash",
      operadora: "Flash Benefícios Flexíveis",
      valorMensalIntegral: 880.00,
      descontoEmFolha6Pct: 88.00,
      custoEmpresa: 792.00,
      status: "ATIVO"
    },
    {
      id: "ben-003",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      tipo: "PLANO_SAUDE",
      nomeBeneficio: "Plano de Saúde Unimed Curitiba Top Nacional",
      operadora: "Unimed Curitiba",
      valorMensalIntegral: 640.00,
      descontoEmFolha6Pct: 95.00,
      custoEmpresa: 545.00,
      status: "ATIVO"
    }
  ],

  rhPedidosBeneficios: [
    {
      id: "ped-ben-2026-10",
      competencia: "2026-10",
      descricao: "Recarga Mensal de Benefícios (VT + VR + VA)",
      totalBeneficiarios: 42,
      valorTotalRecarga: 38740.00,
      descontoTotalFolha: 14210.00,
      custoLiquidoEmpresa: 24530.00,
      status: "APROVADO",
      solicitadoPor: "Patricia Albuquerque (RH)",
      solicitadoEm: "28/09/2026"
    }
  ],

  rhFolhasPagamento: [
    {
      id: "folha-2026-09",
      competencia: "2026-09",
      periodo: "01/09/2026 a 30/09/2026",
      status: "PAGA",
      dataPagamento: "05/10/2026",
      totalColaboradores: 49,
      totalProventos: 218500.00,
      totalDescontosINSS: 23480.00,
      totalDescontosIRRF: 16120.00,
      totalDescontosBeneficios: 14210.00,
      totalLiquido: 164690.00,
      totalEncargosFGTS: 17480.00,
      lotePixId: "LOTE-PIX-FOLHA-202609",
      arquivoCnab240Gerado: true,
      fechadaEm: "01/10/2026 15:30"
    },
    {
      id: "folha-2026-10",
      competencia: "2026-10",
      periodo: "01/10/2026 a 31/10/2026",
      status: "PREVIA_CALCULADA",
      dataPagamento: "05/11/2026",
      totalColaboradores: 52,
      totalProventos: 231400.00,
      totalDescontosINSS: 25110.00,
      totalDescontosIRRF: 17890.00,
      totalDescontosBeneficios: 15300.00,
      totalLiquido: 173100.00,
      totalEncargosFGTS: 18512.00,
      lotePixId: null,
      arquivoCnab240Gerado: false,
      fechadaEm: null
    }
  ],

  rhHolerites: [
    {
      id: "hol-001-202609",
      colaboradorId: "colab-001",
      colaboradorNome: "Carlos Eduardo Mendes",
      matricula: "DISK-00101",
      cpf: "234.567.890-12",
      cargo: "Coordenador de Bilheteria de Campo",
      departamento: "Operações e Bilheteria de Eventos",
      competencia: "2026-09",
      salarioBase: 4800.00,
      totalProventos: 5240.00,
      totalDescontos: 1124.80,
      salarioLiquido: 4115.20,
      baseCalculoINSS: 5240.00,
      baseCalculoIRRF: 4668.52,
      baseCalculoFGTS: 5240.00,
      fgtsMes: 419.20,
      rubricas: [
        { codigo: "001", descricao: "Salário Base Mensal", referencia: "30 dias", tipo: "PROVENTO", valor: 4800.00 },
        { codigo: "015", descricao: "Horas Extras 50%", referencia: "10:30h", tipo: "PROVENTO", valor: 366.67 },
        { codigo: "020", descricao: "Reflexo DSR s/ Horas Extras", referencia: "4 DSRs", tipo: "PROVENTO", valor: 73.33 },
        { codigo: "101", descricao: "INSS - Tabela Progressiva", referencia: "11.1%", tipo: "DESCONTO", valor: 571.48 },
        { codigo: "102", descricao: "IRRF s/ Salário", referencia: "22.5%", tipo: "DESCONTO", valor: 265.32 },
        { codigo: "201", descricao: "Desconto Vale Transporte (Teto 6%)", referencia: "6.0%", tipo: "DESCONTO", valor: 288.00 }
      ]
    },
    {
      id: "hol-002-202609",
      colaboradorId: "colab-002",
      colaboradorNome: "Camila Fernandes Silveira",
      matricula: "DISK-00205",
      cpf: "456.789.012-34",
      cargo: "Supervisor de Atendimento e Acesso",
      departamento: "Operações e Bilheteria de Eventos",
      competencia: "2026-09",
      salarioBase: 3800.00,
      totalProventos: 4015.00,
      totalDescontos: 752.40,
      salarioLiquido: 3262.60,
      baseCalculoINSS: 4015.00,
      baseCalculoIRRF: 3632.18,
      baseCalculoFGTS: 4015.00,
      fgtsMes: 321.20,
      rubricas: [
        { codigo: "001", descricao: "Salário Base Mensal", referencia: "30 dias", tipo: "PROVENTO", valor: 3800.00 },
        { codigo: "015", descricao: "Horas Extras 50%", referencia: "06:00h", tipo: "PROVENTO", valor: 179.17 },
        { codigo: "020", descricao: "Reflexo DSR s/ Horas Extras", referencia: "4 DSRs", tipo: "PROVENTO", valor: 35.83 },
        { codigo: "101", descricao: "INSS - Tabela Progressiva", referencia: "9.8%", tipo: "DESCONTO", valor: 382.82 },
        { codigo: "102", descricao: "IRRF s/ Salário", referencia: "15.0%", tipo: "DESCONTO", valor: 141.58 },
        { codigo: "202", descricao: "Coparticipação Plano de Saúde", referencia: "Fixo", tipo: "DESCONTO", valor: 228.00 }
      ]
    }
  ],

  rhDiariasStaff: [
    {
      id: "staff-dia-001",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      localNome: "Arena da Baixada (Ligga Arena)",
      data: "04/10/2026",
      colaboradorId: "colab-003",
      profissionalNome: "Lucas Gabriel Pinheiro",
      funcao: "Operador de Bilheteria / Caixa",
      tipoContrato: "FREELANCER_EVENTO",
      checkInGeofence: true,
      horarioCheckIn: "14:28",
      distanciaArenaMetros: 12.4,
      valorDiaria: 180.00,
      auxilioAlimentacao: 40.00,
      auxilioTransporte: 30.00,
      totalPagar: 250.00,
      status: "APROVADO_PAGAMENTO",
      chavePix: "67890123456",
      tipoChavePix: "CPF"
    },
    {
      id: "staff-dia-002",
      eventoId: "evt-xyz-1",
      eventoNome: "Show Nacional de Rock Curitiba",
      localNome: "Arena da Baixada (Ligga Arena)",
      data: "04/10/2026",
      colaboradorId: "colab-005",
      profissionalNome: "Rodrigo Almeida Siqueira",
      funcao: "Operador de Caixa e Bilheteria Portão Pista Premium",
      tipoContrato: "FREELANCER_EVENTO",
      checkInGeofence: true,
      horarioCheckIn: "14:31",
      distanciaArenaMetros: 18.2,
      valorDiaria: 180.00,
      auxilioAlimentacao: 40.00,
      auxilioTransporte: 30.00,
      totalPagar: 250.00,
      status: "APROVADO_PAGAMENTO",
      chavePix: "89012345678",
      tipoChavePix: "CPF"
    },
    {
      id: "staff-dia-003",
      eventoId: "evt-002",
      eventoNome: "Show Artista A - Turnê Especial",
      localNome: "Teatro Positivo Grande Auditório",
      data: "10/10/2026",
      colaboradorId: "colab-006",
      profissionalNome: "Jéssica Vasconcelos",
      funcao: "Coordenador de Acesso & Credenciamento",
      tipoContrato: "FREELANCER_EVENTO",
      checkInGeofence: false,
      horarioCheckIn: "Escala Futura",
      distanciaArenaMetros: 0,
      valorDiaria: 280.00,
      auxilioAlimentacao: 50.00,
      auxilioTransporte: 40.00,
      totalPagar: 370.00,
      status: "AGENDADO",
      chavePix: "jessica.vasc@gmail.com",
      tipoChavePix: "EMAIL"
    }
  ],

  rhEventosESocial: [
    {
      id: "esoc-001",
      tipo: "S-1000",
      nome: "Informações do Empregador / Contribuinte",
      identificador: "ID1078901230001992026100108000000001",
      competencia: "2026-10",
      ambiente: "PRODUCAO_RESTRITA",
      status: "TRANSMITIDO",
      reciboEntrega: "1.2.202610.000000000001234567",
      transmitidoEm: "01/10/2026 08:30:12",
      detalhes: "Cadastro da matriz Disk Ingressos Tecnologia e Entretenimento Ltda."
    },
    {
      id: "esoc-002",
      tipo: "S-2200",
      nome: "Cadastramento Inicial e Admissão de Trabalhador",
      identificador: "ID1078901230001992026100109000000002",
      competencia: "2026-10",
      ambiente: "PRODUCAO_RESTRITA",
      status: "TRANSMITIDO",
      reciboEntrega: "1.2.202610.000000000002345678",
      transmitidoEm: "01/10/2026 09:12:00",
      detalhes: "Admissão de Carlos Eduardo Mendes (Matrícula DISK-00101)."
    },
    {
      id: "esoc-003",
      tipo: "S-1200",
      nome: "Remuneração de Trabalhador vinculado ao RGPS",
      identificador: "ID1078901230001992026100115000000003",
      competencia: "2026-09",
      ambiente: "PRODUCAO_RESTRITA",
      status: "VALIDADO",
      reciboEntrega: "1.2.202610.000000000003456789",
      transmitidoEm: "01/10/2026 15:45:00",
      detalhes: "Folha de Pagamento da competência Setembro/2026 apurada e transmitida."
    },
    {
      id: "esoc-004",
      tipo: "S-1210",
      nome: "Pagamentos de Rendimentos do Trabalho",
      identificador: "ID1078901230001992026100510000000004",
      competencia: "2026-09",
      ambiente: "PRODUCAO_RESTRITA",
      status: "AGENDADO",
      reciboEntrega: "Aguardando Liquidação PIX",
      transmitidoEm: null,
      detalhes: "Pagamento de proventos e diárias com crédito previsto para o 5º dia útil."
    }
  ],

  rhPeopleAnalytics: {
    taxaTurnoverMensal: 1.8,
    taxaAbsenteismo: 1.2,
    headcountAtivo: 52,
    cltCount: 32,
    pjCount: 6,
    freelancersCount: 14,
    custoMedioPerCapita: 4450.00,
    distribuicaoGenero: { masculino: 54, feminino: 46 },
    tempoMedioCasaMeses: 26.4,
    horasTreinamentoColaborador: 14.5
  }
};

// Cópia profunda para permitir reset instantâneo na demo
export const getFreshDatabase = () => JSON.parse(JSON.stringify(initialMockDatabase));
