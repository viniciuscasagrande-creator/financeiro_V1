const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function renderDiskGovernanca(state, section = 'visaoGeral') {
  const tabs = [
    ['visaoGeral', 'Visão Geral', 'ph-gauge'],
    ['usuarios', 'Usuários Financeiros', 'ph-users'],
    ['perfis', 'Perfis e Permissões', 'ph-shield-check'],
    ['alcadas', 'Alçadas de Aprovação', 'ph-scales'],
    ['fluxos', 'Fluxos de Aprovação', 'ph-git-fork'],
    ['segregacao', 'Segregação de Funções', 'ph-hand-palm'],
    ['operacoes', 'Operações Sensíveis', 'ph-warning-octagon'],
    ['bloqueios', 'Bloqueios e Exceções', 'ph-lock-key'],
    ['auditoria', 'Auditoria de Acessos', 'ph-clock-counter-clockwise'],
    ['configuracoes', 'Configurações', 'ph-sliders-horizontal']
  ];

  const tabbar = `
    <div class="d-flex flex-wrap gap-2 mb-4">
      ${tabs.map(([id, label, icon]) => `
        <button class="btn ${section === id ? 'btn-primary' : 'btn-light'}" 
                onclick="window.app.navigate('diskGov_${id}')">
          <i class="${icon} me-1"></i>${label}
        </button>
      `).join('')}
    </div>
  `;

  return `
    <div class="content-wrapper">
      <div class="content-inner">
        <div class="content px-0">
          ${tabbar}
          ${body(section, state)}
        </div>
      </div>
    </div>
  `;
}

function body(section, state) {
  switch (section) {
    case 'usuarios': return usuarios();
    case 'perfis': return perfis();
    case 'alcadas': return alcadas();
    case 'fluxos': return fluxos();
    case 'segregacao': return segregacao();
    case 'operacoes': return operacoes();
    case 'bloqueios': return bloqueios();
    case 'auditoria': return auditoria();
    case 'configuracoes': return configuracoes();
    case 'visaoGeral':
    default:
      return visaoGeral();
  }
}

function kpi(title, value, sub, icon, bgClass = 'bg-primary') {
  return `
    <div class="col-sm-6 col-xl-3 mb-3">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="rounded p-3 me-3 text-white ${bgClass} bg-opacity-10 text-primary">
              <i class="${icon} fs-2 text-primary"></i>
            </div>
            <div>
              <div class="text-muted fs-sm text-uppercase fw-semibold">${title}</div>
              <div class="fs-3 fw-bold text-dark">${value}</div>
              <div class="text-muted fs-xs">${sub}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   1. VISÃO GERAL
   ========================================================================== */
function visaoGeral() {
  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Governança, Alçadas & Segurança Operacional</h4>
      <div class="text-muted">Painel central de conformidade institucional, matriz de autorização e salvaguardas de processos.</div>
    </div>

    <div class="row">
      ${kpi('Usuários Ativos', '14', 'em 6 perfis funcionais', 'ph-users')}
      ${kpi('Faixas de Alçada', '3 Faixas', 'A: R$ 50k | B: R$ 250k | C: CFO', 'ph-scales')}
      ${kpi('SoD Bloqueios', '18 Preventivos', 'tentativas de autoaprovação contidas', 'ph-shield-warning')}
      ${kpi('Operações Críticas', '42 Realizadas', 'com dupla autorização ou 2FA', 'ph-key')}
    </div>

    <div class="row mt-2">
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold"><i class="ph-shield-check text-primary me-2"></i>Status da Cadeia de Custódia Financeira</h6>
            <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">Em Conformidade SoD</span>
          </div>
          <div class="card-body">
            <p class="text-muted fs-sm">A arquitetura de governança garante que nenhuma operação relevante (repasse, antecipação, alteração de taxas ou pagamento) transite sem segregação estrita entre criador, aprovador, signatário e executor bancário.</p>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="p-3 rounded border bg-light">
                  <div class="fw-semibold text-dark mb-1">Repasses & Antecipações</div>
                  <div class="fs-xs text-muted">Aprovação escalonada por alçada (A, B e C). Nenhum analista aprova a própria solicitação.</div>
                  <span class="badge bg-primary mt-2">100% Protegido</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 rounded border bg-light">
                  <div class="fw-semibold text-dark mb-1">Assinaturas Disk</div>
                  <div class="fs-xs text-muted">Autentique ICP-Brasil acionado somente após formalização preliminar do Produtor.</div>
                  <span class="badge bg-info mt-2">Ordem Garantida</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 rounded border bg-light">
                  <div class="fw-semibold text-dark mb-1">Tesouraria & Conciliação</div>
                  <div class="fs-xs text-muted">Executores de remessas CNAB e PIX impedidos de conciliar as contas correlatas.</div>
                  <span class="badge bg-success mt-2">SoD Estrito</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-clock-counter-clockwise text-primary me-2"></i>Últimos Eventos de Governança</h6>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 fs-sm">
              <thead class="table-light">
                <tr>
                  <th>Data/Hora</th>
                  <th>Operador</th>
                  <th>Operação</th>
                  <th>Alçada Aplicada</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>29/09 15:42</td>
                  <td><strong>Mariana Fontes</strong> (Gerência)</td>
                  <td>Aprovação Repasse REP-00281 (${money(180000)})</td>
                  <td><span class="badge bg-warning text-dark">Alçada B (Até R$ 250k)</span></td>
                  <td><span class="badge bg-success">Aprovado</span></td>
                </tr>
                <tr>
                  <td>29/09 15:15</td>
                  <td><strong>Carlos Silva</strong> (Analista)</td>
                  <td>Tentativa de autoaprovação de Repasse REP-00282</td>
                  <td><span class="badge bg-danger">Bloqueio SoD</span></td>
                  <td><span class="badge bg-danger">Impedido pelo Sistema</span></td>
                </tr>
                <tr>
                  <td>29/09 14:30</td>
                  <td><strong>Beatriz Mendes</strong> (Diretoria)</td>
                  <td>Aprovação Antecipação ANT-00042 (${money(95000)})</td>
                  <td><span class="badge bg-primary">Alçada B (Gerência/Dir.)</span></td>
                  <td><span class="badge bg-success">Aprovado</span></td>
                </tr>
                <tr>
                  <td>29/09 13:05</td>
                  <td><strong>Fernando Diniz</strong> (Tesouraria)</td>
                  <td>Tentativa de alteração de Chave PIX Produtor ABC</td>
                  <td><span class="badge bg-dark">Restrito Cadastral</span></td>
                  <td><span class="badge bg-danger">Acesso Negado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-lightning text-primary me-2"></i>Ações Rápidas de Segurança</h6>
          </div>
          <div class="card-body d-flex flex-column gap-2">
            <button class="btn btn-outline-primary text-start" onclick="window.app.navigate('diskGov_alcadas')">
              <i class="ph-scales me-2"></i>Ajustar Matriz de Alçadas
            </button>
            <button class="btn btn-outline-secondary text-start" onclick="window.app.navigate('diskGov_usuarios')">
              <i class="ph-user-plus me-2"></i>Revisar Permissões de Usuários
            </button>
            <button class="btn btn-outline-warning text-start" onclick="window.app.navigate('diskGov_bloqueios')">
              <i class="ph-lock-key me-2"></i>Gerenciar Quarentenas & Bloqueios
            </button>
            <button class="btn btn-outline-danger text-start" onclick="window.app.navigate('diskGov_operacoes')">
              <i class="ph-warning-octagon me-2"></i>Ver Log de Operações Críticas
            </button>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-info text-primary me-2"></i>Princípio Inflexível</h6>
          </div>
          <div class="card-body">
            <div class="alert alert-primary mb-0 fs-xs">
              <strong>Delegação Segura:</strong> Nenhuma alteração cadastral bancária, tabela de MDR ou reabertura de borderô é permitida de forma unilateral. Toda exceção exige registro formal de justificativa e log assinado.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   2. USUÁRIOS FINANCEIROS
   ========================================================================== */
function usuarios() {
  return `
    <div class="mb-3 d-flex align-items-center justify-content-between">
      <div>
        <h4 class="mb-1 fw-bold text-dark">Usuários do Financeiro Disk</h4>
        <div class="text-muted">Gestão individual de operadores, perfis atribuídos e limites de autorização financeira.</div>
      </div>
      <button class="btn btn-primary" onclick="window.app.showToast('Fluxo de cadastro de novo operador financeiro preparado.', 'info')">
        <i class="ph-user-plus me-1"></i>Adicionar Usuário
      </button>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil Funcional</th>
              <th>Alçada Máxima</th>
              <th>2FA</th>
              <th>Status</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;">BM</div>
                  <div>
                    <div class="fw-bold">Beatriz Mendes</div>
                    <div class="text-muted fs-xs">Diretoria Financeira / CFO</div>
                  </div>
                </div>
              </td>
              <td>beatriz.mendes@diskingressos.com.br</td>
              <td><span class="badge bg-dark">DIRETOR_CFO</span></td>
              <td><span class="badge bg-danger">Alçada C (Ilimitada)</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Beatriz Mendes.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-info text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;">RA</div>
                  <div>
                    <div class="fw-bold">Roberto Albuquerque</div>
                    <div class="text-muted fs-xs">Gerente Financeiro Geral</div>
                  </div>
                </div>
              </td>
              <td>roberto.a@diskingressos.com.br</td>
              <td><span class="badge bg-primary">GERENTE_FINANCEIRO</span></td>
              <td><span class="badge bg-warning text-dark">Alçada B (Até R$ 250k)</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Roberto Albuquerque.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;">MF</div>
                  <div>
                    <div class="fw-bold">Mariana Fontes</div>
                    <div class="text-muted fs-xs">Coordenadora de Repasses e Liquidação</div>
                  </div>
                </div>
              </td>
              <td>mariana.fontes@diskingressos.com.br</td>
              <td><span class="badge bg-info">COORDENADOR_FINANCEIRO</span></td>
              <td><span class="badge bg-info">Alçada A (Até R$ 50k)</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Mariana Fontes.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;">CS</div>
                  <div>
                    <div class="fw-bold">Carlos Silva</div>
                    <div class="text-muted fs-xs">Analista Financeiro Pleno</div>
                  </div>
                </div>
              </td>
              <td>carlos.silva@diskingressos.com.br</td>
              <td><span class="badge bg-secondary">ANALISTA_FINANCEIRO</span></td>
              <td><span class="badge bg-light text-dark border">Sem Alçada de Aprovação</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Carlos Silva.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;">FD</div>
                  <div>
                    <div class="fw-bold">Fernando Diniz</div>
                    <div class="text-muted fs-xs">Operador de Tesouraria / PIX / CNAB</div>
                  </div>
                </div>
              </td>
              <td>fernando.diniz@diskingressos.com.br</td>
              <td><span class="badge bg-warning text-dark">TESOURARIA_OPERACIONAL</span></td>
              <td><span class="badge bg-light text-dark border">Execução Bancária (Até R$ 100k)</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Fernando Diniz.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-purple text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width:36px;height:36px;background:#8b5cf6;">AT</div>
                  <div>
                    <div class="fw-bold">Amanda Toledo</div>
                    <div class="text-muted fs-xs">Auditora & Controladora Interna</div>
                  </div>
                </div>
              </td>
              <td>amanda.toledo@diskingressos.com.br</td>
              <td><span class="badge" style="background:#8b5cf6;">CONTROLADORIA_AUDITORIA</span></td>
              <td><span class="badge bg-light text-dark border">Ajuste Ledger sob Alçada</span></td>
              <td><span class="badge bg-success"><i class="ph-check me-1"></i>Ativo</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-light" onclick="window.app.showToast('Visualização de credenciais de Amanda Toledo.','info')"><i class="ph-pencil"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   3. PERFIS E PERMISSÕES (RBAC)
   ========================================================================== */
function perfis() {
  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Perfis de Acesso & Matriz RBAC</h4>
      <div class="text-muted">Definição de privilégios granulares por módulo e nível de atuação.</div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3 border-bottom">
        <h6 class="mb-0 fw-bold"><i class="ph-table text-primary me-2"></i>Matriz de Privilégios por Perfil Funcional</h6>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0 text-center fs-sm">
          <thead class="table-light">
            <tr>
              <th class="text-start" style="width:240px;">Módulo / Função</th>
              <th>Analista Financeiro</th>
              <th>Coordenador</th>
              <th>Gerente Financeiro</th>
              <th>Diretoria / CFO</th>
              <th>Tesouraria</th>
              <th>Controladoria</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-start fw-semibold">Visualizar Saldos e Extratos</td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Criar Solicitação de Repasse</td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Aprovar Repasses & Antecipações</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><span class="badge bg-info">Até R$ 50k</span></td>
              <td><span class="badge bg-warning text-dark">Até R$ 250k</span></td>
              <td><span class="badge bg-success">Ilimitado</span></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Assinatura Digital (Autentique)</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Executar PIX / Remessas CNAB</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><span class="badge bg-secondary">Supervisão</span></td>
              <td><span class="badge bg-secondary">Dupla Chave</span></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Conciliação Bancária & Gateway</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5" title="Bloqueio SoD"></i></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Editar Taxas MDR & Regras Comerciais</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><span class="badge bg-warning text-dark">Até ±0.5%</span></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
            </tr>
            <tr>
              <td class="text-start fw-semibold">Ajustes Manuais no Ledger</td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><span class="badge bg-secondary">Aprovador</span></td>
              <td><i class="ph-check-circle-fill text-success fs-5"></i></td>
              <td><i class="ph-x-circle-fill text-danger fs-5"></i></td>
              <td><span class="badge bg-primary">Propositor</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   4. ALÇADAS DE APROVAÇÃO
   ========================================================================== */
function alcadas() {
  return `
    <div class="mb-3 d-flex align-items-center justify-content-between">
      <div>
        <h4 class="mb-1 fw-bold text-dark">Matriz Dinâmica de Alçadas</h4>
        <div class="text-muted">Limites parametrizáveis por tipo de operação financeira e autoridade aprovadora.</div>
      </div>
      <button class="btn btn-primary" onclick="window.app.showToast('Parâmetros de alçadas abertos para edição administrativa.', 'info')">
        <i class="ph-sliders-horizontal me-1"></i>Editar Limites
      </button>
    </div>

    <div class="row">
      <!-- Repasses -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold"><i class="ph-hand-coins text-primary me-2"></i>Alçadas de Repasse Operacional</h6>
            <span class="badge bg-primary">Configuração Vigente</span>
          </div>
          <div class="card-body">
            <div class="p-3 mb-2 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada A: Até ${money(50000)}</div>
                <div class="text-muted fs-xs">Aprovação por: Coordenador Financeiro ou Analista Sênior</div>
              </div>
              <span class="badge bg-info">1 Aprovador</span>
            </div>
            <div class="p-3 mb-2 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada B: De ${money(50000.01)} a ${money(250000)}</div>
                <div class="text-muted fs-xs">Aprovação por: Gerente Financeiro</div>
              </div>
              <span class="badge bg-warning text-dark">Gerência</span>
            </div>
            <div class="p-3 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada C: Acima de ${money(250000)}</div>
                <div class="text-muted fs-xs">Aprovação por: Diretoria Financeira / CFO</div>
              </div>
              <span class="badge bg-danger">Diretoria / CFO</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Antecipações -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold"><i class="ph-trend-up text-primary me-2"></i>Alçadas de Antecipação de Recebíveis</h6>
            <span class="badge bg-info">Score de Risco</span>
          </div>
          <div class="card-body">
            <div class="p-3 mb-2 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada A: Até ${money(30000)}</div>
                <div class="text-muted fs-xs">Margem de retenção mínima de 30% e histórico sem contestação.</div>
              </div>
              <span class="badge bg-info">Coord. Crédito</span>
            </div>
            <div class="p-3 mb-2 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada B: De ${money(30000.01)} a ${money(150000)}</div>
                <div class="text-muted fs-xs">Exige parecer financeiro e validação de recebíveis futuros.</div>
              </div>
              <span class="badge bg-warning text-dark">Gerência</span>
            </div>
            <div class="p-3 rounded border bg-light d-flex align-items-center justify-content-between">
              <div>
                <div class="fw-bold text-dark">Alçada C: Acima de ${money(150000)}</div>
                <div class="text-muted fs-xs">Requer deliberação de Comitê de Risco & Diretoria.</div>
              </div>
              <span class="badge bg-danger">Comitê + Diretoria</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagamentos em Lote -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-bank text-primary me-2"></i>Pagamentos & Lotes (PIX / CNAB)</h6>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush fs-sm">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>Até ${money(100000)}:</strong> Liberação direta por Operador de Tesouraria
                </div>
                <span class="badge bg-success">1 Assinatura</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>De ${money(100000.01)} a ${money(500000)}:</strong> Tesouraria + Coordenação
                </div>
                <span class="badge bg-warning text-dark">Dupla Validação</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>Acima de ${money(500000)}:</strong> Gerente Financeiro + Diretoria Executiva
                </div>
                <span class="badge bg-danger">Dupla Chave Externa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Outras Alçadas Especiais -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-sliders text-primary me-2"></i>Alçadas de Exceções & Negociações</h6>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush fs-sm">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>Desconto / Ajuste em MDR (até 0.50%):</strong> Gerente Comercial/Financeiro
                </div>
                <span class="badge bg-secondary">Justificativa</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>Desconto MDR &gt; 0.50% ou Isenção:</strong> Exclusivo Diretoria Financeira
                </div>
                <span class="badge bg-danger">Diretoria</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <strong>Ajuste Manual de Ledger (qualquer valor):</strong> Parecer Controladoria + Gerência
                </div>
                <span class="badge bg-dark">Controladoria</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   5. FLUXOS DE APROVAÇÃO
   ========================================================================== */
function fluxos() {
  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Fluxos de Aprovação Operacionais</h4>
      <div class="text-muted">Sequenciamento formal das esteiras de decisão financeira da Disk Ingressos.</div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3 border-bottom">
        <h6 class="mb-0 fw-bold"><i class="ph-git-fork text-primary me-2"></i>Esteira de Repasse Operacional</h6>
      </div>
      <div class="card-body">
        <div class="row text-center g-2 fs-xs">
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-secondary mb-1">1. Solicitação</div>
              <div class="fw-bold">Produtor / Analista</div>
              <div class="text-muted">Criação do pedido</div>
            </div>
          </div>
          <div class="col-auto d-flex align-items-center"><i class="ph-arrow-right text-muted"></i></div>
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-info mb-1">2. Análise Técnica</div>
              <div class="fw-bold">Sistema / Analista</div>
              <div class="text-muted">Verificação de saldo</div>
            </div>
          </div>
          <div class="col-auto d-flex align-items-center"><i class="ph-arrow-right text-muted"></i></div>
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-warning text-dark mb-1">3. Aprovação</div>
              <div class="fw-bold">Alçada A / B / C</div>
              <div class="text-muted">Autorização formal</div>
            </div>
          </div>
          <div class="col-auto d-flex align-items-center"><i class="ph-arrow-right text-muted"></i></div>
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-primary mb-1">4. Assinatura</div>
              <div class="fw-bold">Autentique</div>
              <div class="text-muted">Produtor 1º, Disk 2º</div>
            </div>
          </div>
          <div class="col-auto d-flex align-items-center"><i class="ph-arrow-right text-muted"></i></div>
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-success mb-1">5. Pagamento</div>
              <div class="fw-bold">Tesouraria</div>
              <div class="text-muted">PIX / Remessa CNAB</div>
            </div>
          </div>
          <div class="col-auto d-flex align-items-center"><i class="ph-arrow-right text-muted"></i></div>
          <div class="col">
            <div class="p-2 border rounded bg-light">
              <div class="badge bg-dark mb-1">6. Ledger</div>
              <div class="fw-bold">Conciliação</div>
              <div class="text-muted">Liquidação definitiva</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-header bg-white py-3 border-bottom">
        <h6 class="mb-0 fw-bold"><i class="ph-clock-countdown text-primary me-2"></i>Prazos e Transições Automáticas de Status</h6>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 fs-sm">
          <thead class="table-light">
            <tr>
              <th>Status Atual</th>
              <th>Condição de Disparo</th>
              <th>Próximo Status</th>
              <th>SLA Máximo</th>
              <th>Ação se Expirar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge bg-secondary">SOLICITADO</span></td>
              <td>Checagem de saldo e retenções aprovada</td>
              <td><span class="badge bg-info">EM_ANALISE</span></td>
              <td>4 horas úteis</td>
              <td>Alerta de atraso para coordenação</td>
            </tr>
            <tr>
              <td><span class="badge bg-info">EM_ANALISE</span></td>
              <td>Aprovação pela alçada correspondente</td>
              <td><span class="badge bg-warning text-dark">AGUARDANDO_ASSINATURA</span></td>
              <td>8 horas úteis</td>
              <td>Escalonamento para alçada superior</td>
            </tr>
            <tr>
              <td><span class="badge bg-warning text-dark">AGUARDANDO_ASSINATURA</span></td>
              <td>Produtor assinou no Autentique</td>
              <td><span class="badge bg-primary">LIBERADO_ASSINATURA_DISK</span></td>
              <td>48 horas</td>
              <td>Notificação de cobrança ao produtor</td>
            </tr>
            <tr>
              <td><span class="badge bg-primary">LIBERADO_ASSINATURA_DISK</span></td>
              <td>Financeiro Disk assinou no Autentique</td>
              <td><span class="badge bg-success">PRONTO_PAGAMENTO</span></td>
              <td>2 horas úteis</td>
              <td>Alerta crítico na fila de assinaturas</td>
            </tr>
            <tr>
              <td><span class="badge bg-success">PRONTO_PAGAMENTO</span></td>
              <td>Disparo de lote PIX ou remessa gerada</td>
              <td><span class="badge bg-dark">LIQUIDADO</span></td>
              <td>Até as 17:00</td>
              <td>Inclusão no lote da manhã seguinte</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   6. SEGREGAÇÃO DE FUNÇÕES (SoD)
   ========================================================================== */
function segregacao() {
  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Segregação de Funções (SoD - Segregation of Duties)</h4>
      <div class="text-muted">Políticas rígidas para impedir acúmulo de etapas conflitantes pelo mesmo operador.</div>
    </div>

    <div class="alert alert-warning border-warning d-flex align-items-center">
      <i class="ph-shield-warning fs-3 me-3 text-warning"></i>
      <div>
        <strong>Princípio SoD:</strong> O sistema bloqueia proativamente que o criador de uma operação seja seu próprio aprovador, que o aprovador assine contratos pela Disk ou que o executor do pagamento participe da conciliação bancária correlata.
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3 border-bottom">
        <h6 class="mb-0 fw-bold"><i class="ph-hand-palm text-primary me-2"></i>Matriz de Incompatibilidade de Funções</h6>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 fs-sm">
          <thead class="table-light">
            <tr>
              <th>Função Originadora</th>
              <th>Função Conflitante</th>
              <th>Risco Operacional</th>
              <th>Política de Bloqueio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>CRIADOR</strong> (Solicitante de Repasse)</td>
              <td><strong>APROVADOR</strong> da mesma operação</td>
              <td>Desvio de recursos / Autoliberação indevida</td>
              <td><span class="badge bg-danger">Bloqueio Rígido (Hard Stop)</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
            </tr>
            <tr>
              <td><strong>APROVADOR</strong> do Repasse</td>
              <td><strong>ASSINANTE</strong> do Termo pela Disk</td>
              <td>Concentração excessiva de poderes decisórios</td>
              <td><span class="badge bg-danger">Bloqueio Rígido (Hard Stop)</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
            </tr>
            <tr>
              <td><strong>EXECUTOR DE PAGAMENTO</strong> (Tesouraria)</td>
              <td><strong>CONCILIADOR</strong> Bancário</td>
              <td>Ocultação de desvios e pagamentos fantasmas</td>
              <td><span class="badge bg-danger">Bloqueio Rígido (Hard Stop)</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
            </tr>
            <tr>
              <td><strong>OPERADOR DE TESOURARIA</strong></td>
              <td><strong>GESTOR CADASTRO BANCÁRIO</strong> (PIX)</td>
              <td>Desvio de destino de transferências</td>
              <td><span class="badge bg-danger">Bloqueio Rígido (Hard Stop)</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
            </tr>
            <tr>
              <td><strong>ANALISTA COMERCIAL</strong></td>
              <td><strong>APROVADOR DE ANTECIPAÇÃO</strong></td>
              <td>Conflito de interesse sobre metas comerciais</td>
              <td><span class="badge bg-warning text-dark">Exceção sob Alçada C</span></td>
              <td><span class="badge bg-success">Ativo</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   7. OPERAÇÕES SENSÍVEIS
   ========================================================================== */
function operacoes() {
  const lista = [
    { id: 1, nome: 'Alteração de Dados Bancários de Produtor (PIX/Conta)', risco: 'Crítico', auth: 'Dupla Validação + Quarentena 48h', alcada: 'Gerência Financeira' },
    { id: 2, nome: 'Alteração de Taxas MDR das Adquirentes', risco: 'Alto', auth: 'Justificativa Contratual', alcada: 'Diretoria Executiva' },
    { id: 3, nome: 'Alteração de Taxa Comercial de Produtor/Cliente', risco: 'Alto', auth: 'Termo Aditivo Vinculado', alcada: 'Gerência Comercial / Dir.' },
    { id: 4, nome: 'Aprovação de Solicitação de Antecipação', risco: 'Crítico', auth: 'Score de Risco + Parecer Crédito', alcada: 'Alçada A/B/C' },
    { id: 5, nome: 'Assinatura Digital pela Disk (Autentique)', risco: 'Alto', auth: 'Token ICP-Brasil / Certificado', alcada: 'Gerência / Diretoria' },
    { id: 6, nome: 'Execução de Lote PIX / Remessa CNAB', risco: 'Crítico', auth: '2FA + Verificação Hash Lote', alcada: 'Tesouraria + Coordenação' },
    { id: 7, nome: 'Cancelamento de Pagamento já Autorizado', risco: 'Alto', auth: 'Justificativa Obrigatória', alcada: 'Gerência Financeira' },
    { id: 8, nome: 'Ajuste Manual no Ledger Financeiro', risco: 'Crítico', auth: 'Parecer Controladoria + Estorno Duplo', alcada: 'Controladoria + Gerência' },
    { id: 9, nome: 'Reabertura de Fechamento ou Borderô Concluído', risco: 'Crítico', auth: 'Ata de Reabertura Assinada', alcada: 'Diretoria Financeira' },
    { id: 10, nome: 'Resolução de Divergência de Conciliação com Saldo', risco: 'Alto', auth: 'Comprovante Bancário Anexo', alcada: 'Coord. Conciliação' },
    { id: 11, nome: 'Alteração de Credenciais / Webhook Autentique', risco: 'Crítico', auth: 'Mestre / Acesso Backend', alcada: 'Administrador / CTO' },
    { id: 12, nome: 'Alteração de Mapeamento / Token Conta Azul', risco: 'Crítico', auth: 'Mestre / Acesso Backend', alcada: 'Administrador / CTO' }
  ];

  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Catálogo de Operações Sensíveis & Críticas</h4>
      <div class="text-muted">Relação de ações sujeitas a salvaguardas adicionais, dupla custódia e trilha auditável permanente.</div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 fs-sm">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Operação Sensível</th>
              <th>Nível de Risco</th>
              <th>Requisitos de Segurança</th>
              <th>Alçada Mínima</th>
              <th class="text-center">Log Imutável</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(item => `
              <tr>
                <td class="text-muted">${item.id}</td>
                <td class="fw-semibold text-dark">${item.nome}</td>
                <td>
                  <span class="badge ${item.risco === 'Crítico' ? 'bg-danger' : 'bg-warning text-dark'}">
                    ${item.risco}
                  </span>
                </td>
                <td>${item.auth}</td>
                <td><span class="badge bg-light text-dark border">${item.alcada}</span></td>
                <td class="text-center"><i class="ph-shield-check text-success fs-5"></i></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   8. BLOQUEIOS E EXCEÇÕES
   ========================================================================== */
function bloqueios() {
  return `
    <div class="mb-3 d-flex align-items-center justify-content-between">
      <div>
        <h4 class="mb-1 fw-bold text-dark">Bloqueios Preventivos, Quarentenas & Exceções</h4>
        <div class="text-muted">Salvaguardas automáticas e delegações temporárias de autoridade.</div>
      </div>
      <button class="btn btn-primary" onclick="window.app.showToast('Módulo de concessão de alçada temporária preparado.', 'info')">
        <i class="ph-lock-key-open me-1"></i>Conceder Alçada Temporária
      </button>
    </div>

    <div class="row">
      <div class="col-lg-7 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-shield-warning text-warning me-2"></i>Contas em Quarentena Preventiva</h6>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 fs-sm">
              <thead class="table-light">
                <tr>
                  <th>Produtor / Evento</th>
                  <th>Motivo do Bloqueio</th>
                  <th>Início</th>
                  <th>Desbloqueio Previsto</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Produtora XYZ Ltda.</strong></td>
                  <td>Alteração de Chave PIX (Regra 48h)</td>
                  <td>28/09 11:30</td>
                  <td>30/09 11:30</td>
                  <td><button class="btn btn-sm btn-outline-primary" onclick="window.app.showToast('Quarentena mantida por segurança patrimonial.', 'warning')">Liberar Manual</button></td>
                </tr>
                <tr>
                  <td><strong>Festival Eletrônico 2026</strong></td>
                  <td>Pico anômalo de chargeback (&gt; 1.5%)</td>
                  <td>29/09 09:10</td>
                  <td>Sob Análise</td>
                  <td><button class="btn btn-sm btn-outline-danger" onclick="window.app.showToast('Encaminhado ao Comitê de Risco.', 'info')">Ver Dossiê</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-5 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-users-three text-primary me-2"></i>Delegações Temporárias Ativas</h6>
          </div>
          <div class="card-body">
            <div class="p-3 border rounded bg-light mb-3">
              <div class="d-flex justify-content-between">
                <strong>Roberto Albuquerque → Mariana Fontes</strong>
                <span class="badge bg-success">Ativa</span>
              </div>
              <div class="text-muted fs-xs mt-1">Alçada B delegada devido a férias regulares do Gerente Geral.</div>
              <div class="fs-xs text-dark mt-2"><strong>Expira em:</strong> 05/10/2026 às 18:00 (Revogação automática)</div>
            </div>
            <div class="alert alert-secondary fs-xs mb-0">
              Todas as aprovações emitidas durante o período de delegação registram no log: <em>"Aprovado por Mariana Fontes sob delegação de Roberto Albuquerque"</em>.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   9. AUDITORIA DE ACESSOS & LOGS
   ========================================================================== */
function auditoria() {
  const logsData = [
    { hora: '29/09 15:42:10', usuario: 'mariana.fontes', acao: 'APROVACAO_ALCADA_B', alvo: 'REP-00281', ip: '192.168.1.104', res: 'SUCESSO' },
    { hora: '29/09 15:15:22', usuario: 'carlos.silva', acao: 'TENTATIVA_AUTOAPROVACAO', alvo: 'REP-00282', ip: '192.168.1.118', res: 'BLOQUEADO_SOD' },
    { hora: '29/09 14:30:05', usuario: 'beatriz.mendes', acao: 'APROVACAO_ANTECIPACAO', alvo: 'ANT-00042', ip: '192.168.1.201', res: 'SUCESSO' },
    { hora: '29/09 13:05:44', usuario: 'fernando.diniz', acao: 'TENTATIVA_EDICAO_PIX', alvo: 'PROD-00012', ip: '192.168.1.155', res: 'ACESSO_NEGADO' },
    { hora: '29/09 11:20:19', usuario: 'roberto.a', acao: 'REAJUSTE_TAXA_COMERCIAL', alvo: 'TAX-00491', ip: '192.168.1.102', res: 'SUCESSO' },
    { hora: '29/09 10:04:12', usuario: 'amanda.toledo', acao: 'AJUSTE_LEDGER_CONTABIL', alvo: 'LED-00912', ip: '192.168.1.140', res: 'SUCESSO' }
  ];

  return `
    <div class="mb-3 d-flex align-items-center justify-content-between">
      <div>
        <h4 class="mb-1 fw-bold text-dark">Auditoria de Acessos & Log Imutável</h4>
        <div class="text-muted">Registro contínuo e à prova de adulteração de todas as operações administrativas e financeiras.</div>
      </div>
      <button class="btn btn-outline-secondary" onclick="window.app.showToast('Exportação de trilha de auditoria em CSV gerada.', 'info')">
        <i class="ph-file-arrow-down me-1"></i>Exportar Trilha (CSV)
      </button>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover font-monospace align-middle mb-0 fs-xs">
          <thead class="table-light font-sans-serif">
            <tr>
              <th>Timestamp</th>
              <th>Usuário</th>
              <th>Evento / Ação</th>
              <th>Alvo / Registro</th>
              <th>Endereço IP</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${logsData.map(l => `
              <tr>
                <td>${l.hora}</td>
                <td class="fw-bold">${l.usuario}</td>
                <td><span class="badge bg-light text-dark border">${l.acao}</span></td>
                <td>${l.alvo}</td>
                <td>${l.ip}</td>
                <td>
                  <span class="badge ${l.res === 'SUCESSO' ? 'bg-success' : 'bg-danger'}">
                    ${l.res}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   10. CONFIGURAÇÕES DE GOVERNANÇA
   ========================================================================== */
function configuracoes() {
  return `
    <div class="mb-3">
      <h4 class="mb-1 fw-bold text-dark">Configurações Gerais de Governança</h4>
      <div class="text-muted">Parâmetros operacionais globais de segurança e políticas da Disk Ingressos.</div>
    </div>

    <div class="row">
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-toggle-right text-primary me-2"></i>Travas Operacionais & SoD</h6>
          </div>
          <div class="card-body">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chkSod" checked>
              <label class="form-check-label fw-semibold" for="chkSod">Impedir autoaprovação (SoD Rígido)</label>
              <div class="text-muted fs-xs">Bloqueia qualquer tentativa de aprovar operações criadas pelo mesmo usuário.</div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chkQuarentena" checked>
              <label class="form-check-label fw-semibold" for="chkQuarentena">Quarentena de 48h para novas chaves PIX</label>
              <div class="text-muted fs-xs">Retém temporariamente repasses caso os dados bancários tenham sido alterados há menos de 48h.</div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chkDuplaChave" checked>
              <label class="form-check-label fw-semibold" for="chkDuplaChave">Exigir Dupla Chave para lotes acima de ${money(500000)}</label>
              <div class="text-muted fs-xs">Requer autorização conjunta de dois usuários com alçada superior.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="mb-0 fw-bold"><i class="ph-bell-ringing text-primary me-2"></i>Alertas & Notificações de Compliance</h6>
          </div>
          <div class="card-body">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chkAlertaDir" checked>
              <label class="form-check-label fw-semibold" for="chkAlertaDir">Notificar Diretoria em operações acima de ${money(250000)}</label>
              <div class="text-muted fs-xs">Envio imediato de alerta de compliance por e-mail e push notification.</div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chkAlertaTentativa" checked>
              <label class="form-check-label fw-semibold" for="chkAlertaTentativa">Notificar Auditoria sobre violações de SoD</label>
              <div class="text-muted fs-xs">Dispara evento de alta severidade quando uma regra de segregação for forçada.</div>
            </div>
            <div class="mt-4">
              <button class="btn btn-primary" onclick="window.app.showToast('Configurações de governança salvas com sucesso.', 'success')">
                <i class="ph-floppy-disk me-1"></i>Salvar Parâmetros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
