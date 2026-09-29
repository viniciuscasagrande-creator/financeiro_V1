/**
 * Configuração Oficial de Menus por Perfil (Limitless Single-Sidebar Architecture)
 * 
 * REGRA ESTRITA:
 * perfil === "PRODUTOR"      -> menuProdutor (11 itens canônicos)
 * perfil === "FINANCEIRO"    -> menuFinanceiroCompleto (23 itens canônicos estruturados)
 * perfil === "ADMINISTRADOR" -> menuAdministradorCompleto (23 itens + permissões master)
 */

export const menuProdutor = [
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: 'ph-chart-pie-slice'
  },
  {
    id: 'saldos',
    label: 'Saldos',
    icon: 'ph-currency-circle-dollar'
  },
  {
    id: 'extrato',
    label: 'Extrato',
    icon: 'ph-receipt'
  },
  {
    id: 'repasses',
    label: 'Repasses',
    icon: 'ph-hand-coins',
    subItems: [
      { id: 'repasses', label: 'Solicitar Repasse', action: 'openPayoutModal' },
      { id: 'repasses', label: 'Minhas Solicitações', filterArg: 'all' }
    ]
  },
  {
    id: 'antecipacoes',
    label: 'Antecipações',
    icon: 'ph-trend-up',
    subItems: [
      { id: 'antecipacoes', label: 'Simular', filterArg: 'simular' },
      { id: 'antecipacoes', label: 'Solicitar Antecipação', filterArg: 'solicitar' },
      { id: 'antecipacoes', label: 'Minhas Solicitações', filterArg: 'historico' }
    ]
  },
  {
    id: 'vendas',
    label: 'Vendas e Recebimentos',
    icon: 'ph-shopping-cart'
  },
  {
    id: 'taxas',
    label: 'Taxas e Descontos',
    icon: 'ph-percent',
    hidden: true
  },
  {
    id: 'estornos',
    label: 'Estornos e Chargebacks',
    icon: 'ph-warning-octagon',
    hidden: true
  },
  {
    id: 'bordero',
    label: 'Borderôs',
    icon: 'ph-signature',
    hidden: true,
    subItems: [
      { id: 'bordero', label: 'Em Aberto', filterArg: 'aberto' },
      { id: 'bordero', label: 'Aguardando Assinatura', filterArg: 'aguardando' },
      { id: 'bordero', label: 'Finalizados', filterArg: 'finalizados' }
    ]
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: 'ph-file-text'
  },
  {
    id: 'dadosBancarios',
    label: 'Dados Bancários',
    icon: 'ph-credit-card'
  }
];

export const menuFinanceiroCompleto = [
  {
    id: 'diskDashboard',
    label: 'VISÃO GERAL',
    icon: 'ph-chart-pie-slice',
    subItems: [
      { id: 'diskDashboard', label: 'Dashboard Financeiro', filterArg: 'dashboard' },
      { id: 'diskDashboard', label: 'Posição Geral', filterArg: 'posicao' },
      { id: 'diskDashboard', label: 'Indicadores', filterArg: 'indicadores' },
      { id: 'diskDashboard', label: 'Inteligência Financeira', filterArg: 'inteligencia' }
    ]
  },
  {
    id: 'diskProdutores',
    label: 'PRODUTORES E EVENTOS',
    icon: 'ph-buildings',
    subItems: [
      { id: 'diskProdutores', label: 'Produtores', filterArg: 'all' },
      { id: 'diskEventos', label: 'Eventos', filterArg: 'all' },
      { id: 'diskProdutores', label: 'Contas Financeiras', filterArg: 'contas' },
      { id: 'diskSaldos', label: 'Saldos por Produtor', filterArg: 'produtor' },
      { id: 'diskSaldos', label: 'Saldos por Evento', filterArg: 'evento' }
    ]
  },
  {
    id: 'diskSolicitacoes',
    label: 'SOLICITAÇÕES E APROVAÇÕES',
    icon: 'ph-scales',
    badge: 'pendingCount',
    subItems: [
      { id: 'diskSolicitacoes', label: 'Central de Solicitações', filterArg: 'all' },
      { id: 'diskAprovacoes', label: 'Central de Aprovações', filterArg: 'pendentes' },
      { id: 'diskRepasses', label: 'Repasses', filterArg: 'all' },
      { id: 'diskAntecipacoes', label: 'Antecipações', filterArg: 'all' },
      { id: 'diskTransferencias', label: 'Transferências entre Eventos', action: 'openTransferModal' },
      { id: 'diskAssinaturas', label: 'Assinaturas Pendentes', filterArg: 'pendentes' }
    ]
  },
  {
    id: 'diskRecebiveis',
    label: 'RECEBÍVEIS E LIQUIDAÇÕES',
    icon: 'ph-wallet',
    subItems: [
      { id: 'diskContasReceber', label: 'Contas a Receber', filterArg: 'overview' },
      { id: 'diskRecebiveis', label: 'Recebíveis', filterArg: 'recebiveis' },
      { id: 'diskRecebiveis', label: 'Agenda de Recebíveis', filterArg: 'agenda' },
      { id: 'diskRecebiveis', label: 'Liquidações', filterArg: 'liquidados' },
      { id: 'diskRecebiveis', label: 'Agenda Financeira', filterArg: 'agenda_financeira' }
    ]
  },
  {
    id: 'diskGateways',
    label: 'GATEWAYS E ADQUIRENTES',
    icon: 'ph-cpu',
    subItems: [
      { id: 'diskGateways', label: 'Gateways', filterArg: 'gateways' },
      { id: 'diskGateways', label: 'Adquirentes', filterArg: 'adquirentes' },
      { id: 'diskGateways', label: 'Bandeiras', filterArg: 'bandeiras' },
      { id: 'diskGateways', label: 'MDR', filterArg: 'mdr' },
      { id: 'diskGateways', label: 'Parcelamento', filterArg: 'parcelamento' },
      { id: 'diskGateways', label: 'Métodos de Pagamento', filterArg: 'metodos' },
      { id: 'diskGateways', label: 'Regras Comerciais', filterArg: 'regra' },
      { id: 'diskGateways', label: 'Pagamentos Customizados', filterArg: 'customizados' }
    ]
  },
  {
    id: 'diskTaxas',
    label: 'TAXAS E REGRAS COMERCIAIS',
    icon: 'ph-percent',
    subItems: [
      { id: 'diskTaxas', label: 'Taxas Disk', filterArg: 'disk' },
      { id: 'diskTaxas', label: 'Taxas do Produtor', filterArg: 'produtor' },
      { id: 'diskTaxas', label: 'Taxas do Cliente', filterArg: 'cliente' },
      { id: 'diskTaxas', label: 'Spread', filterArg: 'spread' },
      { id: 'diskTaxas', label: 'Advanced', filterArg: 'advanced' },
      { id: 'diskTaxas', label: 'Histórico de Regras', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskTesouraria',
    label: 'TESOURARIA',
    icon: 'ph-vault',
    subItems: [
      { id: 'diskTesouraria', label: 'Contas Bancárias', filterArg: 'contas' },
      { id: 'diskPix', label: 'PIX', filterArg: 'pix' },
      { id: 'diskCnab', label: 'CNAB', filterArg: 'cnab' },
      { id: 'diskContasPagar', label: 'Contas a Pagar', filterArg: 'overview' },
      { id: 'diskTesouraria', label: 'Pagamentos', filterArg: 'pagamentos' },
      { id: 'diskPagamentosLote', label: 'Pagamentos em Lote', filterArg: 'lote' },
      { id: 'diskTransferencias', label: 'Transferências', filterArg: 'transferencias' },
      { id: 'diskAgendaPagamentos', label: 'Agenda de Pagamentos', filterArg: 'agenda' }
    ]
  },
  {
    id: 'diskConciliacao',
    label: 'CONCILIAÇÃO',
    icon: 'ph-arrows-left-right',
    subItems: [
      { id: 'diskConciliacao', label: 'Bancária', filterArg: 'bancaria' },
      { id: 'diskConciliacao', label: 'Gateways', filterArg: 'gateways' },
      { id: 'diskConciliacao', label: 'Adquirentes', filterArg: 'adquirentes' },
      { id: 'diskConciliacao', label: 'Repasses', filterArg: 'repasses' },
      { id: 'diskConciliacao', label: 'Recebíveis', filterArg: 'recebiveis' },
      { id: 'diskConciliacao', label: 'Divergências', filterArg: 'divergencias' }
    ]
  },
  {
    id: 'diskEstornos',
    label: 'ESTORNOS E CHARGEBACKS',
    icon: 'ph-warning-octagon',
    subItems: [
      { id: 'diskEstornos', label: 'Estornos', filterArg: 'estornos' },
      { id: 'diskEstornos', label: 'Chargebacks', filterArg: 'chargebacks' },
      { id: 'diskEstornos', label: 'Contestações', filterArg: 'contestacoes' },
      { id: 'diskEstornos', label: 'Impacto no Saldo', filterArg: 'impacto' }
    ]
  },
  {
    id: 'diskFechamentos',
    label: 'FECHAMENTOS E DOSSIÊS',
    icon: 'ph-folder-lock',
    subItems: [
      { id: 'diskFechamentos', label: 'Fechamentos e Dossiês', filterArg: 'fechamentos' },
      { id: 'diskBordero', label: 'Borderôs', filterArg: 'borderos' },
      { id: 'diskFechamentos', label: 'Fechamento por Evento', filterArg: 'evento' },
      { id: 'diskFechamentos', label: 'Dossiê Financeiro', filterArg: 'dossie' },
      { id: 'diskBordero', label: 'Histórico de Fechamentos', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskControladoria',
    label: 'CONTROLADORIA FINANCEIRA',
    icon: 'ph-chart-line-up',
    subItems: [
      { id: 'diskControladoria', label: 'Visão Geral', filterArg: 'visao' },
      { id: 'diskCentrosCustos', label: 'Centros de Custos', filterArg: 'centros' },
      { id: 'diskOrcamentos', label: 'Orçamentos', filterArg: 'orcamentos' },
      { id: 'diskDre', label: 'DRE Gerencial', filterArg: 'dre' },
      { id: 'diskRentabilidade', label: 'Rentabilidade', filterArg: 'rentabilidade' },
      { id: 'diskProjecoes', label: 'Projeções de Caixa', filterArg: 'projecoes' },
      { id: 'diskFluxoCaixa', label: 'Fluxo de Caixa', filterArg: 'fluxo' }
    ]
  },
  {
    id: 'diskFornecedores',
    label: 'FORNECEDORES',
    icon: 'ph-truck',
    subItems: [
      { id: 'diskFornecedores', label: 'Cadastro', filterArg: 'cadastro' },
      { id: 'diskFornecedores', label: 'Contratos', filterArg: 'contratos' },
      { id: 'diskFornecedores', label: 'Documentos', filterArg: 'documentos' },
      { id: 'diskFornecedores', label: 'Cotações', filterArg: 'cotacoes' },
      { id: 'diskFornecedores', label: 'Pedidos', filterArg: 'pedidos' },
      { id: 'diskFornecedores', label: 'Recebimentos', filterArg: 'recebimentos' },
      { id: 'diskFornecedores', label: 'Parcelas', filterArg: 'parcelas' },
      { id: 'diskFornecedores', label: 'Vencimentos', filterArg: 'vencimentos' }
    ]
  },
  {
    id: 'diskLedger',
    label: 'LEDGER FINANCEIRO',
    icon: 'ph-book-bookmark',
    subItems: [
      { id: 'diskLedger', label: 'Movimentações', filterArg: 'movimentacoes' },
      { id: 'diskLedger', label: 'Lançamentos', filterArg: 'lancamentos' },
      { id: 'diskLedger', label: 'Ajustes', filterArg: 'ajustes' },
      { id: 'diskLedger', label: 'Reservas', filterArg: 'reservas' },
      { id: 'diskLedger', label: 'Rastreabilidade', filterArg: 'rastreabilidade' }
    ]
  },
  {
    id: 'diskRelatorios',
    label: 'RELATÓRIOS',
    icon: 'ph-file-text',
    subItems: [
      { id: 'diskRelatorios', label: 'Extrato Financeiro', filterArg: 'extrato' },
      { id: 'diskRelatorios', label: 'Relatórios por Evento', filterArg: 'evento' },
      { id: 'diskRelatorios', label: 'Relatórios por Produtor', filterArg: 'produtor' },
      { id: 'diskRelatorios', label: 'Relatório Consolidado', filterArg: 'consolidado' },
      { id: 'diskRelatorios', label: 'Receitas', filterArg: 'receitas' },
      { id: 'diskRelatorios', label: 'Despesas', filterArg: 'despesas' },
      { id: 'diskRelatorios', label: 'Taxas', filterArg: 'taxas' },
      { id: 'diskRelatorios', label: 'Repasses', filterArg: 'repasses' },
      { id: 'diskRelatorios', label: 'Antecipações', filterArg: 'antecipacoes' }
    ]
  },
  {
    id: 'diskAssinaturas',
    label: 'ASSINATURAS E INTEGRAÇÕES',
    icon: 'ph-seal-check',
    subItems: [
      { id: 'diskIntegracao_assinaturas', label: 'Central de Assinaturas', filterArg: 'assinaturas' },
      { id: 'diskIntegracao_documentos', label: 'Documentos', filterArg: 'documentos' },
      { id: 'diskIntegracao_autentique', label: 'Autentique', filterArg: 'autentique' },
      { id: 'diskIntegracao_contaazul', label: 'Conta Azul', filterArg: 'contaazul' },
      { id: 'diskIntegracao_sincronizacoes', label: 'Sincronizações', filterArg: 'sincronizacoes' },
      { id: 'diskIntegracao_logs', label: 'Logs de Integração', filterArg: 'logs' }
    ]
  },
  {
    id: 'diskAdministracao',
    label: 'ADMINISTRAÇÃO',
    icon: 'ph-gear-six',
    subItems: [
      { id: 'diskConfiguracoes', label: 'Usuários e Permissões', filterArg: 'usuarios' },
      { id: 'diskAuditoria', label: 'Auditoria', filterArg: 'auditoria' },
      { id: 'diskConfiguracoes', label: 'Configurações', filterArg: 'configuracoes' }
    ]
  }
];

export const menuAdministradorCompleto = menuFinanceiroCompleto.map(item => ({
  ...item
}));

export const menusPorPerfil = {
  PRODUTOR: menuProdutor,
  FINANCEIRO: menuFinanceiroCompleto,
  ADMINISTRADOR: menuAdministradorCompleto,
};
