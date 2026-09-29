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
    icon: 'ph-percent'
  },
  {
    id: 'estornos',
    label: 'Estornos e Chargebacks',
    icon: 'ph-warning-octagon'
  },
  {
    id: 'bordero',
    label: 'Borderôs',
    icon: 'ph-signature',
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
    label: '1. Dashboard Geral',
    icon: 'ph-chart-pie-slice'
  },
  {
    id: 'diskProdutores',
    label: '2. Produtores',
    icon: 'ph-buildings',
    subItems: [
      { id: 'diskProdutores', label: 'Todos os Produtores', filterArg: 'all' },
      { id: 'diskProdutores', label: 'Conta Financeira', filterArg: 'conta' },
      { id: 'diskProdutores', label: 'Eventos do Produtor', filterArg: 'eventos' },
      { id: 'diskProdutores', label: 'Histórico Financeiro', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskEventos',
    label: '3. Eventos',
    icon: 'ph-calendar-check',
    subItems: [
      { id: 'diskEventos', label: 'Todos os Eventos', filterArg: 'all' },
      { id: 'diskEventos', label: 'Posição Financeira', filterArg: 'posicao' },
      { id: 'diskEventos', label: 'Fechamentos', filterArg: 'fechamentos' }
    ]
  },
  {
    id: 'diskSolicitacoes',
    label: '4. Solicitações',
    icon: 'ph-tray',
    badge: 'pendingCount',
    subItems: [
      { id: 'diskSolicitacoes', label: 'Todas', filterArg: 'all' },
      { id: 'diskSolicitacoes', label: 'Repasses', filterArg: 'Repasse' },
      { id: 'diskSolicitacoes', label: 'Antecipações', filterArg: 'Antecipação' },
      { id: 'diskSolicitacoes', label: 'Borderôs', filterArg: 'Borderô' }
    ]
  },
  {
    id: 'diskAprovacoes',
    label: '5. Central de Aprovações',
    icon: 'ph-scales',
    badge: 'pendingCount',
    subItems: [
      { id: 'diskAprovacoes', label: 'Pendentes', filterArg: 'pendentes' },
      { id: 'diskAprovacoes', label: 'Em Análise', filterArg: 'analise' },
      { id: 'diskAprovacoes', label: 'Aprovadas', filterArg: 'aprovadas' },
      { id: 'diskAprovacoes', label: 'Rejeitadas', filterArg: 'rejeitadas' }
    ]
  },
  {
    id: 'diskSaldos',
    label: '6. Saldos',
    icon: 'ph-currency-circle-dollar',
    subItems: [
      { id: 'diskSaldos', label: 'Consolidado', filterArg: 'consolidado' },
      { id: 'diskSaldos', label: 'Por Produtor', filterArg: 'produtor' },
      { id: 'diskSaldos', label: 'Por Evento', filterArg: 'evento' },
      { id: 'diskSaldos', label: 'Disponível', filterArg: 'disponivel' },
      { id: 'diskSaldos', label: 'A Receber', filterArg: 'receber' },
      { id: 'diskSaldos', label: 'Bloqueado', filterArg: 'bloqueado' },
      { id: 'diskSaldos', label: 'Em Reserva', filterArg: 'reserva' },
      { id: 'diskSaldos', label: 'Valores em Trânsito', filterArg: 'transito' }
    ]
  },
  {
    id: 'diskRepasses',
    label: '7. Repasses',
    icon: 'ph-hand-coins',
    subItems: [
      { id: 'diskRepasses', label: 'Central de Repasses', filterArg: 'all' },
      { id: 'diskRepasses', label: 'Solicitações Recebidas', filterArg: 'recebidas' },
      { id: 'diskRepasses', label: 'Em Análise', filterArg: 'analise' },
      { id: 'diskRepasses', label: 'Aprovados', filterArg: 'aprovados' },
      { id: 'diskRepasses', label: 'Programados', filterArg: 'programados' },
      { id: 'diskRepasses', label: 'Pagos', filterArg: 'pagos' },
      { id: 'diskRepasses', label: 'Rejeitados', filterArg: 'rejeitados' },
      { id: 'diskRepasses', label: 'Agenda de Repasse', filterArg: 'agenda' },
      { id: 'diskRepasses', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskAntecipacoes',
    label: '8. Antecipações',
    icon: 'ph-trend-up',
    subItems: [
      { id: 'diskAntecipacoes', label: 'Central de Antecipações', filterArg: 'all' },
      { id: 'diskAntecipacoes', label: 'Solicitações', filterArg: 'solicitacoes' },
      { id: 'diskAntecipacoes', label: 'Elegibilidade', filterArg: 'elegibilidade' },
      { id: 'diskAntecipacoes', label: 'Simulações', filterArg: 'simulacoes' },
      { id: 'diskAntecipacoes', label: 'Em Análise', filterArg: 'analise' },
      { id: 'diskAntecipacoes', label: 'Aprovadas', filterArg: 'aprovadas' },
      { id: 'diskAntecipacoes', label: 'Programadas', filterArg: 'programadas' },
      { id: 'diskAntecipacoes', label: 'Liquidadas', filterArg: 'liquidadas' },
      { id: 'diskAntecipacoes', label: 'Taxas', filterArg: 'taxas' },
      { id: 'diskAntecipacoes', label: 'Limites', filterArg: 'limites' },
      { id: 'diskAntecipacoes', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskRecebiveis',
    label: '9. Recebíveis',
    icon: 'ph-wallet',
    subItems: [
      { id: 'diskRecebiveis', label: 'Agenda de Recebíveis', filterArg: 'agenda' },
      { id: 'diskRecebiveis', label: 'Por Produtor', filterArg: 'produtor' },
      { id: 'diskRecebiveis', label: 'Por Evento', filterArg: 'evento' },
      { id: 'diskRecebiveis', label: 'Por Adquirente', filterArg: 'adquirente' },
      { id: 'diskRecebiveis', label: 'Cartões', filterArg: 'cartoes' },
      { id: 'diskRecebiveis', label: 'PIX', filterArg: 'pix' },
      { id: 'diskRecebiveis', label: 'A Liquidar', filterArg: 'a_liquidar' },
      { id: 'diskRecebiveis', label: 'Liquidados', filterArg: 'liquidados' },
      { id: 'diskRecebiveis', label: 'Divergências', filterArg: 'divergencias' }
    ]
  },
  {
    id: 'diskTaxas',
    label: '10. Taxas e Regras Comerciais',
    icon: 'ph-percent',
    subItems: [
      { id: 'diskTaxas', label: 'Taxas Disk', filterArg: 'disk' },
      { id: 'diskTaxas', label: 'Taxas do Produtor', filterArg: 'produtor' },
      { id: 'diskTaxas', label: 'Taxas do Cliente', filterArg: 'cliente' },
      { id: 'diskTaxas', label: 'Taxas por Evento', filterArg: 'evento' },
      { id: 'diskTaxas', label: 'Taxas Fixas', filterArg: 'fixas' },
      { id: 'diskTaxas', label: 'Taxas Percentuais', filterArg: 'percentuais' },
      { id: 'diskTaxas', label: 'MDR', filterArg: 'mdr' },
      { id: 'diskTaxas', label: 'Parcelamento', filterArg: 'parcelamento' },
      { id: 'diskTaxas', label: 'Spread', filterArg: 'spread' },
      { id: 'diskTaxas', label: 'Advanced', filterArg: 'advanced' },
      { id: 'diskTaxas', label: 'Vigências', filterArg: 'vigencias' },
      { id: 'diskTaxas', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskGateways',
    label: '11. Gateways e Adquirentes',
    icon: 'ph-cpu',
    subItems: [
      { id: 'diskGateways', label: 'Gateways', filterArg: 'gateways' },
      { id: 'diskGateways', label: 'Adquirentes', filterArg: 'adquirentes' },
      { id: 'diskGateways', label: 'Contas / Estabelecimentos', filterArg: 'contas' },
      { id: 'diskGateways', label: 'Bandeiras', filterArg: 'bandeiras' },
      { id: 'diskGateways', label: 'MDR', filterArg: 'mdr' },
      { id: 'diskGateways', label: 'Parcelamento', filterArg: 'parcelamento' },
      { id: 'diskGateways', label: 'Taxas por Bandeira', filterArg: 'por_bandeira' },
      { id: 'diskGateways', label: 'Taxas por Adquirente', filterArg: 'por_adquirente' },
      { id: 'diskGateways', label: 'Regra Comercial', filterArg: 'regra' },
      { id: 'diskGateways', label: 'Roteamento', filterArg: 'roteamento' },
      { id: 'diskGateways', label: 'Split', filterArg: 'split' }
    ]
  },
  {
    id: 'diskEstornos',
    label: '12. Estornos e Chargebacks',
    icon: 'ph-warning-octagon',
    subItems: [
      { id: 'diskEstornos', label: 'Estornos', filterArg: 'estornos' },
      { id: 'diskEstornos', label: 'Chargebacks', filterArg: 'chargebacks' },
      { id: 'diskEstornos', label: 'Contestações', filterArg: 'contestacoes' },
      { id: 'diskEstornos', label: 'Em Análise', filterArg: 'analise' },
      { id: 'diskEstornos', label: 'Impacto no Saldo', filterArg: 'impacto' },
      { id: 'diskEstornos', label: 'Débitos do Produtor', filterArg: 'debitos' },
      { id: 'diskEstornos', label: 'Reservas', filterArg: 'reservas' },
      { id: 'diskEstornos', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskConciliacao',
    label: '13. Conciliação',
    icon: 'ph-arrows-left-right',
    subItems: [
      { id: 'diskConciliacao', label: 'Dashboard', filterArg: 'dashboard' },
      { id: 'diskConciliacao', label: 'Pedido × Pagamento', filterArg: 'pedido_pagamento' },
      { id: 'diskConciliacao', label: 'Gateway × Pedido', filterArg: 'gateway_pedido' },
      { id: 'diskConciliacao', label: 'Adquirente × Gateway', filterArg: 'adquirente_gateway' },
      { id: 'diskConciliacao', label: 'Adquirente × Ledger', filterArg: 'adquirente_ledger' },
      { id: 'diskConciliacao', label: 'Ledger × Banco', filterArg: 'ledger_banco' },
      { id: 'diskConciliacao', label: 'PIX', filterArg: 'pix' },
      { id: 'diskConciliacao', label: 'Cartões', filterArg: 'cartoes' },
      { id: 'diskConciliacao', label: 'Repasses', filterArg: 'repasses' },
      { id: 'diskConciliacao', label: 'Divergências', filterArg: 'divergencias' },
      { id: 'diskConciliacao', label: 'Ajustes', filterArg: 'ajustes' }
    ]
  },
  {
    id: 'diskContasPagar',
    label: '14. Contas a Pagar',
    icon: 'ph-arrow-fat-line-down',
    subItems: [
      { id: 'diskContasPagar', label: 'Visão Geral', filterArg: 'overview' },
      { id: 'diskContasPagar', label: 'Fornecedores', filterArg: 'fornecedores' },
      { id: 'diskContasPagar', label: 'Lançamentos', filterArg: 'lancamentos' },
      { id: 'diskContasPagar', label: 'Vencimentos', filterArg: 'vencimentos' },
      { id: 'diskContasPagar', label: 'Aprovações', filterArg: 'aprovacoes' },
      { id: 'diskContasPagar', label: 'Pagamentos', filterArg: 'pagamentos' },
      { id: 'diskContasPagar', label: 'Centro de Custos', filterArg: 'centro_custos' }
    ]
  },
  {
    id: 'diskContasReceber',
    label: '15. Contas a Receber',
    icon: 'ph-arrow-fat-line-up',
    subItems: [
      { id: 'diskContasReceber', label: 'Visão Geral', filterArg: 'overview' },
      { id: 'diskContasReceber', label: 'Recebimentos', filterArg: 'recebimentos' },
      { id: 'diskContasReceber', label: 'Previsões', filterArg: 'previsoes' },
      { id: 'diskContasReceber', label: 'Vencimentos', filterArg: 'vencimentos' },
      { id: 'diskContasReceber', label: 'Baixas', filterArg: 'baixas' },
      { id: 'diskContasReceber', label: 'Inadimplências', filterArg: 'inadimplencias' }
    ]
  },
  {
    id: 'diskTesouraria',
    label: '16. Tesouraria',
    icon: 'ph-vault',
    subItems: [
      { id: 'diskTesouraria', label: 'Posição de Caixa', filterArg: 'posicao' },
      { id: 'diskTesouraria', label: 'Contas Bancárias', filterArg: 'contas' },
      { id: 'diskTesouraria', label: 'Movimentações', filterArg: 'movimentacoes' },
      { id: 'diskTesouraria', label: 'Transferências', filterArg: 'transferencias' },
      { id: 'diskTesouraria', label: 'PIX', filterArg: 'pix' },
      { id: 'diskTesouraria', label: 'CNAB', filterArg: 'cnab' },
      { id: 'diskTesouraria', label: 'Fluxo de Caixa', filterArg: 'fluxo' },
      { id: 'diskTesouraria', label: 'Projeção de Caixa', filterArg: 'projecao' },
      { id: 'diskTesouraria', label: 'Fechamento Diário', filterArg: 'fechamento' }
    ]
  },
  {
    id: 'diskLedger',
    label: '17. Ledger Financeiro',
    icon: 'ph-book-bookmark',
    subItems: [
      { id: 'diskLedger', label: 'Visão Geral', filterArg: 'overview' },
      { id: 'diskLedger', label: 'Lançamentos', filterArg: 'lancamentos' },
      { id: 'diskLedger', label: 'Créditos', filterArg: 'creditos' },
      { id: 'diskLedger', label: 'Débitos', filterArg: 'debitos' },
      { id: 'diskLedger', label: 'Contas dos Produtores', filterArg: 'contas_produtores' },
      { id: 'diskLedger', label: 'Contas por Evento', filterArg: 'contas_eventos' },
      { id: 'diskLedger', label: 'Reservas', filterArg: 'reservas' },
      { id: 'diskLedger', label: 'Bloqueios', filterArg: 'bloqueios' },
      { id: 'diskLedger', label: 'Ajustes', filterArg: 'ajustes' },
      { id: 'diskLedger', label: 'Transferências', filterArg: 'transferencias' },
      { id: 'diskLedger', label: 'Auditoria', filterArg: 'auditoria' }
    ]
  },
  {
    id: 'diskBordero',
    label: '18. Borderôs e Fechamentos',
    icon: 'ph-signature',
    subItems: [
      { id: 'diskBordero', label: 'Eventos em Aberto', filterArg: 'aberto' },
      { id: 'diskBordero', label: 'Eventos Encerrados', filterArg: 'encerrados' },
      { id: 'diskBordero', label: 'Borderô Resumido', filterArg: 'resumido' },
      { id: 'diskBordero', label: 'Borderô Completo', filterArg: 'completo' },
      { id: 'diskBordero', label: 'Conferência', filterArg: 'conferencia' },
      { id: 'diskBordero', label: 'Ajustes', filterArg: 'ajustes' },
      { id: 'diskBordero', label: 'Aprovação', filterArg: 'aprovacao' },
      { id: 'diskBordero', label: 'Assinatura', filterArg: 'assinatura' },
      { id: 'diskBordero', label: 'Fechamento', filterArg: 'fechamento' },
      { id: 'diskBordero', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskFluxoCaixa',
    label: '19. Fluxo de Caixa',
    icon: 'ph-chart-line-up',
    subItems: [
      { id: 'diskFluxoCaixa', label: 'Realizado', filterArg: 'realizado' },
      { id: 'diskFluxoCaixa', label: 'Projetado', filterArg: 'projetado' },
      { id: 'diskFluxoCaixa', label: 'Entradas', filterArg: 'entradas' },
      { id: 'diskFluxoCaixa', label: 'Saídas', filterArg: 'saidas' },
      { id: 'diskFluxoCaixa', label: 'Recebíveis Futuros', filterArg: 'recebiveis_futuros' },
      { id: 'diskFluxoCaixa', label: 'Repasses Futuros', filterArg: 'repasses_futuros' },
      { id: 'diskFluxoCaixa', label: 'Projeções', filterArg: 'projecoes' }
    ]
  },
  {
    id: 'diskAssinaturas',
    label: '20. Assinaturas Digitais',
    icon: 'ph-certificate',
    subItems: [
      { id: 'diskAssinaturas', label: 'Aguardando Produtor', filterArg: 'aguardando_produtor' },
      { id: 'diskAssinaturas', label: 'Aguardando Financeiro', filterArg: 'aguardando_financeiro' },
      { id: 'diskAssinaturas', label: 'Assinados', filterArg: 'assinados' },
      { id: 'diskAssinaturas', label: 'Documentos', filterArg: 'documentos' },
      { id: 'diskAssinaturas', label: 'Histórico', filterArg: 'historico' }
    ]
  },
  {
    id: 'diskRelatorios',
    label: '21. Relatórios',
    icon: 'ph-file-text',
    subItems: [
      { id: 'diskRelatorios', label: 'Financeiro Geral', filterArg: 'geral' },
      { id: 'diskRelatorios', label: 'Produtores', filterArg: 'produtores' },
      { id: 'diskRelatorios', label: 'Eventos', filterArg: 'eventos' },
      { id: 'diskRelatorios', label: 'Vendas', filterArg: 'vendas' },
      { id: 'diskRelatorios', label: 'Recebimentos', filterArg: 'recebimentos' },
      { id: 'diskRelatorios', label: 'Saldos', filterArg: 'saldos' },
      { id: 'diskRelatorios', label: 'Repasses', filterArg: 'repasses' },
      { id: 'diskRelatorios', label: 'Antecipações', filterArg: 'antecipacoes' },
      { id: 'diskRelatorios', label: 'Taxas', filterArg: 'taxas' },
      { id: 'diskRelatorios', label: 'Gateways', filterArg: 'gateways' },
      { id: 'diskRelatorios', label: 'MDR', filterArg: 'mdr' },
      { id: 'diskRelatorios', label: 'Conciliação', filterArg: 'conciliacao' },
      { id: 'diskRelatorios', label: 'Estornos', filterArg: 'estornos' },
      { id: 'diskRelatorios', label: 'Chargebacks', filterArg: 'chargebacks' },
      { id: 'diskRelatorios', label: 'Fluxo de Caixa', filterArg: 'fluxo_caixa' },
      { id: 'diskRelatorios', label: 'Borderôs', filterArg: 'borderos' }
    ]
  },
  {
    id: 'diskAuditoria',
    label: '22. Auditoria',
    icon: 'ph-scroll',
    subItems: [
      { id: 'diskAuditoria', label: 'Log Financeiro', filterArg: 'log' },
      { id: 'diskAuditoria', label: 'Alterações de Saldo', filterArg: 'alteracoes_saldo' },
      { id: 'diskAuditoria', label: 'Alterações de Taxas', filterArg: 'alteracoes_taxas' },
      { id: 'diskAuditoria', label: 'Aprovações', filterArg: 'aprovacoes' },
      { id: 'diskAuditoria', label: 'Operações Manuais', filterArg: 'operacoes_manuais' },
      { id: 'diskAuditoria', label: 'Assinaturas', filterArg: 'assinaturas' },
      { id: 'diskAuditoria', label: 'Acessos', filterArg: 'acessos' },
      { id: 'diskAuditoria', label: 'Exportações', filterArg: 'exportacoes' },
      { id: 'diskAuditoria', label: 'Trilha de Auditoria', filterArg: 'trilha' }
    ]
  },
  {
    id: 'diskConfiguracoes',
    label: '23. Configurações',
    icon: 'ph-gear-six',
    subItems: [
      { id: 'diskConfiguracoes', label: 'Regras Financeiras', filterArg: 'regras' },
      { id: 'diskConfiguracoes', label: 'Políticas de Repasse', filterArg: 'politicas_repasse' },
      { id: 'diskConfiguracoes', label: 'Políticas de Antecipação', filterArg: 'politicas_antecipacao' },
      { id: 'diskConfiguracoes', label: 'Calendário Financeiro', filterArg: 'calendario' },
      { id: 'diskConfiguracoes', label: 'Limites', filterArg: 'limites' },
      { id: 'diskConfiguracoes', label: 'Alçadas de Aprovação', filterArg: 'alcadas' },
      { id: 'diskConfiguracoes', label: 'Perfis e Permissões', filterArg: 'perfis' },
      { id: 'diskConfiguracoes', label: 'Integrações', filterArg: 'integracoes' },
      { id: 'diskConfiguracoes', label: 'Parâmetros Gerais', filterArg: 'parametros' }
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
