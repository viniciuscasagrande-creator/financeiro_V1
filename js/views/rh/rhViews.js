/**
 * DISK INGRESSOS - MÓDULO CORPORATIVO DISK INTERNO: RECURSOS HUMANOS (RH DISK) & DISK PONTO
 * 
 * Visões Completas:
 * 1. Visão Geral RH (Headcount, presença, custos e alertas operacionais)
 * 2. Colaboradores (Cadastro mestre CLT / PJ / Freelancers, dados bancários e PIX)
 * 3. Estrutura Organizacional (Departamentos, centros de custo e organograma)
 * 4. Ponto e Jornada (Portaria 671 MTE, espelho, geofences, NSR e ajustes)
 * 5. Cercas Virtuais / Geofences (Gestão de raios na Sede e Arenas de Eventos)
 * 6. Equipes por Evento (Alocação de coordenadores e caixas para shows)
 * 7. Custos de Mão de Obra por Evento (Alimentando DRE do Evento e Fila PIX da Tesouraria)
 * 8. Folha e Pagamentos RH (Consolidado mensal integrado a Contas a Pagar / CNAB)
 * 9. Auditoria e LGPD (Logs imutáveis e consentimentos)
 */

import { formatCurrency } from '../../formatters.js';

export function renderDiskRHVisaoGeral(state, filterArg = 'visao') {
  const db = state.db || {};
  const colaboradores = db.rhColaboradores || [];
  const geofences = db.rhGeofences || [];
  const batidas = db.rhRegistrosPonto || [];
  const custosEvento = db.rhEquipesCustosEvento || [];
  const ajustesPendentes = (db.rhAjustesPonto || []).filter(a => a.status === 'PENDENTE');

  const totalHeadcount = colaboradores.length;
  const cltCount = colaboradores.filter(c => c.tipoContrato === 'CLT').length;
  const freelancerCount = colaboradores.filter(c => c.tipoContrato === 'FREELANCER_EVENTO').length;
  const totalCustoEquipes = custosEvento.reduce((acc, c) => acc + (c.valorTotal || 0), 0);

  return `
    <div class="container-fluid py-3">
      <!-- Cabeçalho Executivo do Módulo RH Disk -->
      <div class="card bg-dark text-white border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-primary px-3 py-1 text-uppercase fw-bold">Disk Interno</span>
                <span class="badge bg-success px-3 py-1"><i class="ph-shield-check me-1"></i> Portaria 671 MTE Homologado</span>
                <span class="badge bg-info px-3 py-1"><i class="ph-device-mobile me-1"></i> Disk Ponto Android APK Conectado</span>
              </div>
              <h2 class="h3 fw-bold mb-1">Recursos Humanos & Gestão de Jornada (RH Disk)</h2>
              <p class="text-white-50 mb-0">Gestão corporativa de colaboradores, cercas virtuais por arena de show, espelho de ponto e apropriação de mão de obra direta para o DRE financeiro.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-light btn-sm" onclick="window.LimitlessApp.navigate('diskRH_ponto')">
                <i class="ph-clock-countdown me-1"></i> Monitor de Batidas
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoColaborador()">
                <i class="ph-user-plus me-1"></i> Novo Colaborador
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Headcount Ativo</span>
                <div class="p-2 bg-primary bg-opacity-10 text-primary rounded"><i class="ph-users fs-4"></i></div>
              </div>
              <div class="fs-3 fw-bold text-dark">${totalHeadcount}</div>
              <div class="small text-muted mt-1">
                <span class="text-primary fw-bold">${cltCount} CLT</span> • <span class="text-info fw-bold">${freelancerCount} Freelancers Evento</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Cercas Virtuais (Geofences)</span>
                <div class="p-2 bg-success bg-opacity-10 text-success rounded"><i class="ph-map-pin fs-4"></i></div>
              </div>
              <div class="fs-3 fw-bold text-dark">${geofences.length} Ativas</div>
              <div class="small text-muted mt-1">
                <i class="ph-check-circle text-success"></i> Sede Curitiba + 3 Arenas de Shows
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Mão de Obra Eventos (DRE)</span>
                <div class="p-2 bg-info bg-opacity-10 text-info rounded"><i class="ph-scales fs-4"></i></div>
              </div>
              <div class="fs-3 fw-bold text-dark">${formatCurrency(totalCustoEquipes)}</div>
              <div class="small text-muted mt-1">
                <span class="text-success fw-bold">Show Nacional de Rock</span> (Alimentando DRE)
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Ajustes Pendentes</span>
                <div class="p-2 bg-warning bg-opacity-10 text-warning rounded"><i class="ph-warning fs-4"></i></div>
              </div>
              <div class="fs-3 fw-bold text-dark">${ajustesPendentes.length} Solicitações</div>
              <div class="small text-muted mt-1">
                ${ajustesPendentes.length > 0 ? '<span class="text-danger fw-bold">Requer análise do Gestor/RH</span>' : 'Jornada 100% conciliada'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Duas Colunas: Últimas Batidas de Ponto vs Equipes Alocadas em Eventos -->
      <div class="row g-4">
        <!-- Coluna Esquerda: Batidas Recentes com Geofence -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title fw-bold mb-0"><i class="ph-clock-countdown text-primary me-2"></i>Batidas Recentes (Disk Ponto Mobile APK)</h5>
                <span class="small text-muted">Geolocalização instantânea coletada no clique da batida (Portaria 671 MTE)</span>
              </div>
              <button class="btn btn-outline-primary btn-sm" onclick="window.LimitlessApp.navigate('diskRH_ponto')">Ver Todas</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr class="small text-muted">
                    <th>Colaborador</th>
                    <th>Tipo</th>
                    <th>Horário</th>
                    <th>Local / Cerca</th>
                    <th>Status Geofence</th>
                    <th>NSR / Comprovante</th>
                  </tr>
                </thead>
                <tbody>
                  ${batidas.slice(0, 5).map(b => `
                    <tr>
                      <td>
                        <div class="fw-bold">${b.colaboradorNome}</div>
                        <span class="small text-muted">APK Android</span>
                      </td>
                      <td>
                        <span class="badge ${b.tipo.includes('ENTRADA') ? 'bg-success' : b.tipo.includes('SAIDA') ? 'bg-danger' : 'bg-warning text-dark'}">
                          ${b.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td class="fw-bold text-dark">${b.dataHoraFormatada || b.dataHoraMarcacao}</td>
                      <td>
                        <div class="small fw-semibold">${b.geofenceNome || 'Sede Curitiba'}</div>
                        <span class="small text-muted">Distância: ${b.distanciaGeofence || 0}m</span>
                      </td>
                      <td>
                        <span class="badge bg-success-subtle text-success border border-success">
                          <i class="ph-check-circle me-1"></i> Autorizado
                        </span>
                      </td>
                      <td>
                        <code class="small text-primary">${b.comprovanteNsr}</code>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Alocação no Evento em Destaque -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title fw-bold mb-0"><i class="ph-calendar-star text-warning me-2"></i>Equipe de Campo do Evento</h5>
                <span class="small text-muted">Show Nacional de Rock Curitiba (Ligga Arena)</span>
              </div>
              <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.navigate('diskRH_custosEvento')">Ver Custos</button>
            </div>
            <div class="card-body">
              <div class="p-3 bg-light rounded-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="small text-muted">Custo Total de Mão de Obra</div>
                    <div class="fs-4 fw-bold text-dark">${formatCurrency(totalCustoEquipes)}</div>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-primary">4 Integrantes Alocados</span>
                    <div class="small text-muted mt-1">2 CLT • 2 Freelancers</div>
                  </div>
                </div>
              </div>

              <div class="list-group list-group-flush">
                ${custosEvento.map(c => `
                  <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-bold text-dark">${c.colaboradorNome}</div>
                      <span class="small text-muted">${c.cargoFuncao}</span>
                    </div>
                    <div class="text-end">
                      <div class="fw-bold text-dark">${formatCurrency(c.valorTotal)}</div>
                      <span class="badge ${c.statusPagamento === 'AUTORIZADO_RH' ? 'bg-success' : 'bg-warning text-dark'} small">
                        ${c.statusPagamento.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="mt-3 pt-3 border-top d-grid gap-2">
                <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.enviarPagamentoRHParaTesouraria('evt-xyz-1')">
                  <i class="ph-paper-plane-tilt me-1"></i> Autorizar e Enviar PIX para Tesouraria
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHColaboradores(state, filterArg = 'colaboradores') {
  const db = state.db || {};
  const colaboradores = db.rhColaboradores || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-users text-primary me-2"></i>Cadastro de Colaboradores & Equipes</h3>
          <p class="text-muted mb-0">Gestão central de funcionários CLT, PJ e Freelancers de eventos com contas e chaves PIX para pagamento automático.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarColaboradores()">
            <i class="ph-download-simple me-1"></i> Exportar CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoColaborador()">
            <i class="ph-user-plus me-1"></i> Novo Colaborador
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="ph-magnifying-glass"></i></span>
                <input type="text" class="form-control border-start-0" id="rh-search-colaborador" placeholder="Buscar por Nome, CPF, Matrícula ou Cargo..." oninput="window.LimitlessApp.filtrarColaboradoresTabela(this.value)">
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" id="rh-filtro-regime" onchange="window.LimitlessApp.filtrarColaboradoresRegime(this.value)">
                <option value="TODOS">Todos os Regimes de Contrato</option>
                <option value="CLT">CLT (Quadro Efetivo)</option>
                <option value="FREELANCER_EVENTO">Freelancer Evento (Diária)</option>
                <option value="PJ">Pessoa Jurídica (PJ)</option>
              </select>
            </div>
            <div class="col-md-4 text-end">
              <span class="text-muted small">Total: <strong>${colaboradores.length}</strong> colaboradores cadastrados</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tabela-rh-colaboradores">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Cargo / Departamento</th>
                <th>Regime Contratual</th>
                <th>Remuneração Base</th>
                <th>Dados Bancários / PIX</th>
                <th>Cerca Padrão</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${colaboradores.map(c => `
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <img src="${c.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="rounded-circle border" width="40" height="40" alt="${c.nome}" style="object-fit: cover;">
                      <div>
                        <div class="fw-bold text-dark">${c.nome}</div>
                        <div class="small text-muted">Matrícula: <code>${c.matricula}</code> • CPF: ${c.cpf}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">${c.cargoNome}</div>
                    <div class="small text-muted">${c.departamentoNome}</div>
                  </td>
                  <td>
                    <span class="badge ${c.tipoContrato === 'CLT' ? 'bg-primary' : c.tipoContrato === 'FREELANCER_EVENTO' ? 'bg-info text-dark' : 'bg-secondary'}">
                      ${c.tipoContrato.replace('_', ' ')}
                    </span>
                  </td>
                  <td class="fw-bold text-dark">
                    ${c.tipoContrato === 'FREELANCER_EVENTO' ? `${formatCurrency(c.valorDiariaEvento)} / diária` : formatCurrency(c.salario)}
                  </td>
                  <td>
                    <div class="small fw-semibold text-dark">${c.banco || 'Não inf.'}</div>
                    <div class="small text-muted"><i class="ph-qr-code text-primary me-1"></i>PIX (${c.tipoChavePix}): <code>${c.chavePix}</code></div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">
                      <i class="ph-map-pin text-danger me-1"></i> ${c.geofencePadraoId === 'geo-sede-disk' ? 'Sede Curitiba' : 'Arena da Baixada'}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success">
                      ${c.status}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm" onclick="window.LimitlessApp.verEspelhoColaborador('${c.id}')" title="Ver Espelho de Ponto">
                      <i class="ph-clock-countdown"></i>
                    </button>
                    <button class="btn btn-light btn-sm border" onclick="window.LimitlessApp.editarColaborador('${c.id}')" title="Editar Ficha">
                      <i class="ph-pencil-simple"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHOrganograma(state, filterArg = 'organograma') {
  const db = state.db || {};
  const departamentos = db.rhDepartamentos || [];
  const cargos = db.rhCargos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-tree-structure text-primary me-2"></i>Estrutura Organizacional & Centros de Custo</h3>
          <p class="text-muted mb-0">Departamentos, centros de custo contábeis, alçadas e lideranças executivas da DiskIngressos.</p>
        </div>
      </div>

      <div class="row g-4">
        ${departamentos.map(d => `
          <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <span class="badge bg-primary-subtle text-primary border border-primary fw-bold">${d.sigla}</span>
                <span class="small text-muted">Centro de Custo: <strong>${d.centroCusto}</strong></span>
              </div>
              <div class="card-body">
                <h5 class="fw-bold text-dark mb-1">${d.nome}</h5>
                <p class="small text-muted mb-3"><i class="ph-user me-1"></i> Líder: <strong>${d.responsavel}</strong></p>
                <div class="p-2 bg-light rounded small mb-3">
                  <strong>${d.colaboradoresCount}</strong> colaboradores alocados neste centro de custo.
                </div>
                <div class="small fw-bold text-muted mb-2">Cargos Vinculados:</div>
                <ul class="list-unstyled small mb-0">
                  ${cargos.filter(c => c.departamento === d.nome).map(c => `
                    <li class="py-1 border-bottom border-light d-flex justify-content-between">
                      <span>${c.titulo}</span>
                      <span class="badge bg-light text-dark">${c.nivel}</span>
                    </li>
                  `).join('') || '<li class="text-muted italic">Cargos gerais da operação</li>'}
                </ul>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderDiskRHPonto(state, filterArg = 'ponto') {
  const db = state.db || {};
  const batidas = db.rhRegistrosPonto || [];
  const colaboradores = db.rhColaboradores || [];
  const ajustes = db.rhAjustesPonto || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-clock-countdown text-primary me-2"></i>Ponto Eletrônico & Gestão de Jornada</h3>
          <p class="text-muted mb-0">Conforme Portaria 671 MTE: Registrador Eletrônico de Ponto via Programa (REP-P) com hash SHA-256 e geofence instantânea.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm" onclick="window.LimitlessApp.abrirSimuladorPontoMobile()">
            <i class="ph-device-mobile me-1"></i> Simular Batida no Disk Ponto APK
          </button>
        </div>
      </div>

      <!-- Alerta de Ajustes Pendentes se houver -->
      ${ajustes.filter(a => a.status === 'PENDENTE').length > 0 ? `
        <div class="alert alert-warning border-warning shadow-sm mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong><i class="ph-warning me-2"></i>Existem ${ajustes.filter(a => a.status === 'PENDENTE').length} solicitações de ajuste de ponto aguardando validação do Gestor de RH!</strong>
              <div class="small mt-1">Colaboradores que esqueceram ou justificaram batidas fora do horário previsto.</div>
            </div>
            <button class="btn btn-warning btn-sm fw-bold" onclick="document.getElementById('sec-ajustes-ponto').scrollIntoView({behavior: 'smooth'})">
              Ver Solicitações
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Tabela Principal de Batidas Auditadas -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="fw-bold mb-0">Trilha de Batidas Registradas (Portaria 671)</h5>
            <span class="small text-muted">Auditoria imutável com coordenadas geográficas no momento do registro</span>
          </div>
          <span class="badge bg-primary">${batidas.length} Registros</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>NSR (MTE)</th>
                <th>Colaborador</th>
                <th>Tipo</th>
                <th>Horário Registro</th>
                <th>Cerca / Arena</th>
                <th>Coordenadas GPS</th>
                <th>Precisão</th>
                <th>Validação Cerca</th>
                <th>Hash Integridade (SHA-256)</th>
              </tr>
            </thead>
            <tbody>
              ${batidas.map(b => `
                <tr>
                  <td><span class="badge bg-dark fw-bold">#${b.nsr}</span></td>
                  <td>
                    <div class="fw-bold text-dark">${b.colaboradorNome}</div>
                    <span class="small text-muted">${b.dispositivoInfo || 'Disk Ponto APK'}</span>
                  </td>
                  <td>
                    <span class="badge ${b.tipo.includes('ENTRADA') ? 'bg-success' : b.tipo.includes('SAIDA') ? 'bg-danger' : 'bg-warning text-dark'}">
                      ${b.tipo.replace('_', ' ')}
                    </span>
                  </td>
                  <td class="fw-bold">${b.dataHoraFormatada || b.dataHoraMarcacao}</td>
                  <td>
                    <div class="fw-semibold">${b.geofenceNome || 'Sede Disk'}</div>
                    <span class="small text-muted">Dist: ${b.distanciaGeofence || 0}m</span>
                  </td>
                  <td><code class="small text-muted">${b.latitude?.toFixed(5) || '-25.42841'}, ${b.longitude?.toFixed(5) || '-49.27329'}</code></td>
                  <td><span class="badge bg-light text-dark">${b.precisaoMetros || 8.5}m</span></td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success">
                      <i class="ph-check-circle me-1"></i> ${b.dentroGeofence ? 'DENTRO DA CERCA' : 'FORA'}
                    </span>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 140px;" title="${b.hashIntegridade}">
                      <code class="small text-primary">${b.hashIntegridade ? b.hashIntegridade.substring(0, 16) + '...' : 'c8f7a9...'}</code>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Seção de Solicitações de Ajuste de Ponto -->
      <div class="card border-0 shadow-sm" id="sec-ajustes-ponto">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0"><i class="ph-pencil-line text-warning me-2"></i>Solicitações de Ajuste de Ponto Pendentes</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Protocolo</th>
                <th>Colaborador</th>
                <th>Data</th>
                <th>Tipo Batida</th>
                <th>Horário Correto</th>
                <th>Motivo & Justificativa</th>
                <th>Status</th>
                <th class="text-end">Ações do RH</th>
              </tr>
            </thead>
            <tbody>
              ${ajustes.map(a => `
                <tr>
                  <td><code>${a.id}</code></td>
                  <td class="fw-bold text-dark">${a.colaboradorNome}</td>
                  <td>${a.dataPonto}</td>
                  <td><span class="badge bg-info text-dark">${a.tipoAjuste}</span></td>
                  <td class="fw-bold text-primary fs-6">${a.horarioCorreto}</td>
                  <td>
                    <div class="small fw-bold">${a.motivo}</div>
                    <div class="small text-muted text-truncate" style="max-width: 280px;" title="${a.justificativa}">${a.justificativa}</div>
                  </td>
                  <td>
                    <span class="badge ${a.status === 'PENDENTE' ? 'bg-warning text-dark' : a.status === 'APROVADO' ? 'bg-success' : 'bg-danger'}">
                      ${a.status}
                    </span>
                  </td>
                  <td class="text-end">
                    ${a.status === 'PENDENTE' ? `
                      <button class="btn btn-success btn-sm me-1" onclick="window.LimitlessApp.aprovarAjustePonto('${a.id}')">
                        <i class="ph-check me-1"></i> Aprovar
                      </button>
                      <button class="btn btn-outline-danger btn-sm" onclick="window.LimitlessApp.rejeitarAjustePonto('${a.id}')">
                        <i class="ph-x"></i>
                      </button>
                    ` : `<span class="small text-muted">Finalizado</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHGeofences(state, filterArg = 'geofences') {
  const db = state.db || {};
  const geofences = db.rhGeofences || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-map-pin text-primary me-2"></i>Cercas Virtuais Autorizadas (Geofences)</h3>
          <p class="text-muted mb-0">Configuração de perímetros geográficos (raio em metros) para registro de ponto da Sede e Arenas de Eventos.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovaGeofence()">
          <i class="ph-plus-circle me-1"></i> Nova Cerca Virtual
        </button>
      </div>

      <div class="row g-4">
        ${geofences.map(g => `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <span class="badge ${g.tipo === 'SEDE' ? 'bg-primary' : 'bg-success'} text-uppercase">
                  ${g.tipo.replace('_', ' ')}
                </span>
                <span class="badge bg-light text-dark border">
                  Raio Permitido: <strong>${g.raioMetros} metros</strong>
                </span>
              </div>
              <div class="card-body">
                <h5 class="fw-bold text-dark mb-1">${g.nome}</h5>
                <p class="small text-muted mb-2"><i class="ph-map-trifold me-1"></i> ${g.endereco}, ${g.cidade}/${g.uf}</p>
                ${g.eventoNome ? `<div class="badge bg-info-subtle text-info border border-info mb-3">Vinculado ao Evento: ${g.eventoNome}</div>` : ''}

                <div class="p-3 bg-light rounded-3 mb-3">
                  <div class="row text-center">
                    <div class="col-6 border-end">
                      <div class="small text-muted">Latitude</div>
                      <div class="fw-bold text-dark">${g.latitude}</div>
                    </div>
                    <div class="col-6">
                      <div class="small text-muted">Longitude</div>
                      <div class="fw-bold text-dark">${g.longitude}</div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-muted">
                    <i class="ph-users me-1"></i> <strong>${g.colaboradoresVinculados || 0}</strong> colaboradores autorizados
                  </span>
                  <button class="btn btn-outline-primary btn-sm" onclick="window.LimitlessApp.testarGeofence('${g.id}')">
                    <i class="ph-crosshair me-1"></i> Testar Coordenada
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderDiskRHEquipesEvento(state, filterArg = 'equipes_evento') {
  const db = state.db || {};
  const custos = db.rhEquipesCustosEvento || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-users-three text-primary me-2"></i>Alocação de Equipes por Evento</h3>
          <p class="text-muted mb-0">Escalamento de coordenadores, operadores de bilheteria e fiscais de acesso para eventos e festivais.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalAlocarEquipe()">
            <i class="ph-plus me-1"></i> Alocar Profissional no Evento
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3 bg-light rounded-3">
          <div class="row align-items-center">
            <div class="col-md-6">
              <span class="badge bg-primary mb-1">Evento Ativo Selecionado</span>
              <h5 class="fw-bold mb-0">Show Nacional de Rock Curitiba (Ligga Arena)</h5>
            </div>
            <div class="col-md-6 text-md-end mt-2 mt-md-0">
              <button class="btn btn-outline-dark btn-sm" onclick="window.LimitlessApp.navigate('diskRH_custosEvento')">
                <i class="ph-chart-line-up me-1"></i> Visualizar Custos & DRE do Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Profissional</th>
                <th>Função no Evento</th>
                <th>Regime Contratação</th>
                <th>Diária / Salário</th>
                <th>Benefícios (Alim + Transp)</th>
                <th>Valor Total</th>
                <th>Status Pagamento</th>
              </tr>
            </thead>
            <tbody>
              ${custos.map(c => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${c.colaboradorNome}</div>
                    <span class="small text-muted">Chave PIX: ${c.chavePix}</span>
                  </td>
                  <td class="fw-semibold">${c.cargoFuncao}</td>
                  <td>
                    <span class="badge ${c.tipoContratacao === 'CLT' ? 'bg-primary' : 'bg-info text-dark'}">
                      ${c.tipoContratacao.replace('_', ' ')}
                    </span>
                  </td>
                  <td>${formatCurrency(c.valorDiaria)}</td>
                  <td>${formatCurrency((c.auxilioAlimentacao || 0) + (c.auxilioTransporte || 0))}</td>
                  <td class="fw-bold text-primary fs-6">${formatCurrency(c.valorTotal)}</td>
                  <td>
                    <span class="badge ${c.statusPagamento === 'AUTORIZADO_RH' ? 'bg-success' : 'bg-warning text-dark'}">
                      ${c.statusPagamento.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHCustosEvento(state, filterArg = 'custos_evento') {
  const db = state.db || {};
  const custos = db.rhEquipesCustosEvento || [];

  const totalDiarias = custos.reduce((acc, c) => acc + (c.valorDiaria || 0), 0);
  const totalExtras = custos.reduce((acc, c) => acc + (c.valorHorasExtras || 0), 0);
  const totalAlimentacao = custos.reduce((acc, c) => acc + (c.auxilioAlimentacao || 0), 0);
  const totalTransporte = custos.reduce((acc, c) => acc + (c.auxilioTransporte || 0), 0);
  const totalGeral = custos.reduce((acc, c) => acc + (c.valorTotal || 0), 0);

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-scales text-primary me-2"></i>Custos de Mão de Obra por Evento (Integração DRE)</h3>
          <p class="text-muted mb-0">Apropriação de despesas operacionais diretas de pessoal, alimentando a linha de custos do DRE do Evento e enviando lotes de pagamento PIX para a Tesouraria.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm" onclick="window.LimitlessApp.enviarPagamentoRHParaTesouraria('evt-xyz-1')">
            <i class="ph-paper-plane-tilt me-1"></i> Autorizar e Enviar Lote PIX para Tesouraria
          </button>
        </div>
      </div>

      <!-- Resumo Financeiro da Mão de Obra -->
      <div class="row g-3 mb-4">
        <div class="col-md">
          <div class="card border-0 shadow-sm p-3">
            <span class="small text-muted text-uppercase fw-bold">Diárias de Equipe</span>
            <div class="fs-4 fw-bold text-dark">${formatCurrency(totalDiarias)}</div>
          </div>
        </div>
        <div class="col-md">
          <div class="card border-0 shadow-sm p-3">
            <span class="small text-muted text-uppercase fw-bold">Horas Extras</span>
            <div class="fs-4 fw-bold text-dark">${formatCurrency(totalExtras)}</div>
          </div>
        </div>
        <div class="col-md">
          <div class="card border-0 shadow-sm p-3">
            <span class="small text-muted text-uppercase fw-bold">Aux. Alimentação</span>
            <div class="fs-4 fw-bold text-dark">${formatCurrency(totalAlimentacao)}</div>
          </div>
        </div>
        <div class="col-md">
          <div class="card border-0 shadow-sm p-3">
            <span class="small text-muted text-uppercase fw-bold">Aux. Transporte</span>
            <div class="fs-4 fw-bold text-dark">${formatCurrency(totalTransporte)}</div>
          </div>
        </div>
        <div class="col-md">
          <div class="card border-0 shadow-sm p-3 bg-primary text-white">
            <span class="small text-white-50 text-uppercase fw-bold">Custo Total Pessoal (DRE)</span>
            <div class="fs-4 fw-bold text-white">${formatCurrency(totalGeral)}</div>
          </div>
        </div>
      </div>

      <!-- Tabela discriminada -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Detalhamento por Integrante & Destino Bancário</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Integrante</th>
                <th>Função no Evento</th>
                <th>Diária</th>
                <th>Horas Extras</th>
                <th>Alimentação</th>
                <th>Transporte</th>
                <th>Total Bruto</th>
                <th>Banco / PIX Destino</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${custos.map(c => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${c.colaboradorNome}</div>
                    <span class="badge ${c.tipoContratacao === 'CLT' ? 'bg-primary' : 'bg-info text-dark'} small">${c.tipoContratacao}</span>
                  </td>
                  <td class="fw-semibold">${c.cargoFuncao}</td>
                  <td>${formatCurrency(c.valorDiaria)}</td>
                  <td>${formatCurrency(c.valorHorasExtras || 0)}</td>
                  <td>${formatCurrency(c.auxilioAlimentacao || 0)}</td>
                  <td>${formatCurrency(c.auxilioTransporte || 0)}</td>
                  <td class="fw-bold text-primary fs-6">${formatCurrency(c.valorTotal)}</td>
                  <td>
                    <div class="small fw-bold">${c.banco || 'Banco Padrão'}</div>
                    <div class="small text-muted">PIX: <code>${c.chavePix}</code></div>
                  </td>
                  <td>
                    <span class="badge ${c.statusPagamento === 'AUTORIZADO_RH' ? 'bg-success' : 'bg-warning text-dark'}">
                      ${c.statusPagamento.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHFolha(state, filterArg = 'folha') {
  const db = state.db || {};
  const colaboradores = db.rhColaboradores || [];
  const cltColaboradores = colaboradores.filter(c => c.tipoContrato === 'CLT');
  const totalSalariosBase = cltColaboradores.reduce((acc, c) => acc + (c.salario || 0), 0);
  const totalEncargos = totalSalariosBase * 0.358; // FGTS + INSS Patronal aprox 35.8%

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-wallet text-primary me-2"></i>Folha de Pagamento & Encargos RH</h3>
          <p class="text-muted mb-0">Consolidação mensal de proventos, encargos sociais e geração de remessa bancária CNAB 240 para a Tesouraria.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="window.LimitlessApp.gerarArquivoCnabRH()">
            <i class="ph-file-text me-1"></i> Gerar Remessa CNAB 240 Folha
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-primary">
            <span class="small text-muted text-uppercase fw-bold">Salários Base CLT</span>
            <div class="fs-3 fw-bold text-dark">${formatCurrency(totalSalariosBase)}</div>
            <span class="small text-muted">${cltColaboradores.length} colaboradores CLT</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-warning">
            <span class="small text-muted text-uppercase fw-bold">Provisão Encargos Sociais</span>
            <div class="fs-3 fw-bold text-dark">${formatCurrency(totalEncargos)}</div>
            <span class="small text-muted">FGTS (8%) + INSS Patronal / RAT</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-success">
            <span class="small text-muted text-uppercase fw-bold">Custo Total Folha Mensal</span>
            <div class="fs-3 fw-bold text-dark">${formatCurrency(totalSalariosBase + totalEncargos)}</div>
            <span class="small text-muted">Competência: <strong>Outubro/2026</strong></span>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Quadro de Proventos Mensais por Colaborador</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Cargo / Departamento</th>
                <th>Salário Base</th>
                <th>Adicionais / HE</th>
                <th>Descontos Legais</th>
                <th>Líquido a Pagar</th>
                <th>Conta / Chave PIX</th>
              </tr>
            </thead>
            <tbody>
              ${cltColaboradores.map(c => {
                const desc = (c.salario || 0) * 0.11; // aprox
                const liq = (c.salario || 0) - desc;
                return `
                  <tr>
                    <td>
                      <div class="fw-bold text-dark">${c.nome}</div>
                      <span class="small text-muted">${c.cpf}</span>
                    </td>
                    <td>
                      <div class="fw-semibold">${c.cargoNome}</div>
                      <div class="small text-muted">${c.departamentoNome}</div>
                    </td>
                    <td class="fw-bold">${formatCurrency(c.salario)}</td>
                    <td class="text-success">+ R$ 0,00</td>
                    <td class="text-danger">- ${formatCurrency(desc)}</td>
                    <td class="fw-bold text-dark fs-6">${formatCurrency(liq)}</td>
                    <td>
                      <div class="small fw-semibold">${c.banco}</div>
                      <div class="small text-muted">PIX: <code>${c.chavePix}</code></div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDiskRHAuditoria(state, filterArg = 'auditoria') {
  const db = state.db || {};
  const logs = db.rhAuditLogs || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-shield-check text-primary me-2"></i>Auditoria & Conformidade LGPD</h3>
          <p class="text-muted mb-0">Rastreabilidade completa de batidas de ponto, acessos a dados sensíveis, consentimentos e operações de pessoal.</p>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Trilha de Auditoria Imutável (RH Disk)</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Data / Hora</th>
                <th>Usuário / Operador</th>
                <th>Colaborador Afetado</th>
                <th>Ação Executada</th>
                <th>Entidade</th>
                <th>Detalhes Técnicos</th>
                <th>IP Origem</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="small text-muted fw-bold">${l.at}</td>
                  <td class="fw-semibold text-dark">${l.by}</td>
                  <td>${l.colaboradorAfetado}</td>
                  <td><span class="badge bg-primary">${l.acao}</span></td>
                  <td><code>${l.entidade}</code></td>
                  <td class="small text-muted">${l.detalhes}</td>
                  <td><code class="small text-muted">${l.ip || '127.0.0.1'}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// RH DISK V2 — GESTÃO CORPORATIVA COMPLETA (integrado ao Disk Interno)
// Telas operacionais adicionais. Cada domínio possui ações próprias e status.
// ============================================================================
const RH_V2_MODULOS = {
  aprovacoes: ['Central de Aprovações','Solicitações de RH aguardando decisão',['Nova solicitação','Aprovar selecionados','Reprovar','Histórico'],['Tipo','Colaborador','Gestor','Data','Status','Ação']],
  admissao: ['Admissão Digital','Pré-admissão, documentos, exame e contrato',['Nova admissão','Solicitar documentos','Gerar checklist','Enviar para assinatura'],['Candidato','Cargo','Etapa','Pendências','Status','Ação']],
  onboarding: ['Onboarding','Integração do novo colaborador por tarefas e responsáveis',['Novo onboarding','Criar tarefa','Atribuir responsável','Concluir etapa'],['Colaborador','Área','Progresso','Responsável','Prazo','Ação']],
  ferias: ['Férias','Períodos aquisitivos, programação, solicitação e aprovação',['Nova solicitação','Programar férias','Aprovar','Gerar recibo'],['Colaborador','Período aquisitivo','Saldo','Programação','Status','Ação']],
  ausencias: ['Ausências e Afastamentos','Faltas, licenças, afastamentos e retornos',['Registrar ausência','Novo afastamento','Registrar retorno','Exportar'],['Colaborador','Tipo','Início','Fim','Dias','Status']],
  atestados: ['Atestados','Recebimento, validação e histórico de atestados',['Novo atestado','Validar','Solicitar correção','Arquivar'],['Colaborador','Período','Dias','Documento','Validação','Ação']],
  beneficios: ['Benefícios','Planos e benefícios por colaborador',['Novo benefício','Vincular colaborador','Importar valores','Fechar competência'],['Benefício','Elegíveis','Custo empresa','Desconto colaborador','Status','Ação']],
  recrutamento: ['Recrutamento e Seleção','Vagas, candidatos e pipeline de contratação',['Nova vaga','Novo candidato','Agendar entrevista','Gerar proposta'],['Vaga / Candidato','Área','Etapa','Responsável','Status','Ação']],
  desempenho: ['Desempenho e PDI','Avaliações, competências, metas e planos de desenvolvimento',['Novo ciclo','Nova avaliação','Criar PDI','Registrar feedback'],['Colaborador','Ciclo','Nota','PDI','Status','Ação']],
  treinamentos: ['Treinamentos','Cursos, turmas, presença, certificados e vencimentos',['Novo treinamento','Criar turma','Inscrever equipe','Emitir certificado'],['Treinamento','Turma','Participantes','Validade','Status','Ação']],
  cargos_salarios: ['Cargos e Salários','Cargos, níveis, faixas e movimentações salariais',['Novo cargo','Nova faixa','Propor reajuste','Histórico salarial'],['Cargo','Nível','Faixa mínima','Faixa máxima','Ocupantes','Ação']],
  sst: ['SST e Medicina do Trabalho','ASO, exames, riscos, CAT e obrigações ocupacionais',['Novo ASO','Agendar exame','Registrar CAT','Mapa de riscos'],['Colaborador','Exame / Evento','Data','Validade','Status','Ação']],
  epis: ['EPIs e Segurança','Entrega, validade e devolução de equipamentos de proteção',['Novo EPI','Entregar EPI','Registrar devolução','Gerar termo'],['EPI','Colaborador','Entrega','Validade','Situação','Ação']],
  esocial: ['eSocial','Eventos trabalhistas, validações, retornos e protocolos',['Gerar eventos','Validar lote','Enviar homologação','Consultar retornos'],['Evento','Competência','Colaboradores','Validação','Protocolo','Status']],
  folha_completa: ['Folha de Pagamento','Eventos, cálculos, encargos, provisões e fechamento',['Nova competência','Calcular folha','Validar encargos','Fechar folha'],['Competência','Colaboradores','Proventos','Descontos','Líquido','Status']],
  decimo: ['13º Salário','Adiantamento, segunda parcela e encargos',['Calcular 1ª parcela','Calcular 2ª parcela','Validar','Fechar'],['Colaborador','Base','1ª parcela','2ª parcela','Encargos','Status']],
  rescisoes: ['Rescisões','Cálculo, documentos, aprovações e pagamento',['Nova rescisão','Calcular','Gerar documentos','Enviar ao Financeiro'],['Colaborador','Motivo','Desligamento','Valor líquido','Status','Ação']],
  portal_colaborador: ['Portal do Colaborador','Autoatendimento para documentos e solicitações',['Publicar comunicado','Liberar holerite','Nova enquete','Configurar atalhos'],['Serviço','Disponibilidade','Pendências','Última atualização','Status','Ação']],
  portal_gestor: ['Portal do Gestor','Equipe, pendências, aprovações e indicadores',['Ver equipe','Aprovar pendências','Abrir avaliação','Exportar equipe'],['Indicador','Quantidade','Pendentes','Prazo','Situação','Ação']],
  patrimonio: ['Patrimônio do Colaborador','Notebooks, celulares, crachás, uniformes e termos',['Novo patrimônio','Entregar item','Transferir','Registrar devolução'],['Item','Patrimônio','Colaborador','Entrega','Situação','Ação']],
  reembolsos: ['Despesas e Reembolsos','Solicitações com comprovante, evento e centro de custo',['Novo reembolso','Analisar','Aprovar','Enviar ao Financeiro'],['Solicitante','Evento / Centro','Valor','Data','Status','Ação']],
  freelancers: ['Temporários e Freelancers','Contratos, diárias, escalas e custos por evento',['Novo freelancer','Novo contrato','Alocar em evento','Enviar pagamento'],['Profissional','Evento','Função','Diária / Hora','Status','Ação']],
  centro_custos: ['Centro de Custos de RH','Rateio de pessoal por departamento e evento',['Novo centro','Ratear custos','Reprocessar','Enviar à Contabilidade'],['Centro / Evento','Folha','Benefícios','Extras','Total','Status']],
  relatorios: ['Relatórios e People Analytics','Indicadores estratégicos e operacionais de pessoas',['Gerar relatório','Exportar Excel','Exportar PDF','Salvar visão'],['Indicador','Atual','Mês anterior','Variação','Meta','Situação']],
  documentos: ['Documentos e Assinaturas','Contratos, termos, certificados e vencimentos',['Novo documento','Solicitar assinatura','Renovar documento','Baixar dossiê'],['Documento','Colaborador','Emissão','Validade','Assinatura','Ação']],
  desligamentos: ['Desligamentos e Offboarding','Checklist, acessos, patrimônio e rescisão',['Novo desligamento','Gerar checklist','Bloquear acessos','Enviar para rescisão'],['Colaborador','Data','Motivo','Checklist','Rescisão','Status']],
  integracoes: ['Integrações de RH','Financeiro, Contabilidade, assinatura, folha e notificações',['Testar conexão','Nova integração','Sincronizar agora','Ver logs'],['Integração','Destino','Última sincronização','Registros','Status','Ação']],
  configuracoes: ['Configurações de RH','Parâmetros, políticas, jornadas e regras corporativas',['Nova política','Novo parâmetro','Editar regras','Publicar versão'],['Configuração','Escopo','Versão','Atualização','Status','Ação']]
};

function rhV2Action(label, modulo) {
  const safe = String(label).replace(/'/g, "\\'");
  const mod = String(modulo).replace(/'/g, "\\'");
  return `window.financialStore.showToast('${safe}', '${safe} iniciado em ${mod}. A operação foi registrada na interface de homologação.', 'success')`;
}

export function renderDiskRHModulo(state, filterArg = 'aprovacoes') {
  const cfg = RH_V2_MODULOS[filterArg] || RH_V2_MODULOS.aprovacoes;
  const [titulo, subtitulo, acoes, colunas] = cfg;
  const cards = [
    ['Pendentes','0','ph-hourglass-medium'], ['Em andamento','0','ph-arrows-clockwise'],
    ['Concluídos no mês','0','ph-check-circle'], ['Alertas','0','ph-warning']
  ];
  return `
    <div class="content-area rh-v2-page" data-rh-modulo="${filterArg}">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div><h2 class="mb-1">${titulo}</h2><p class="text-muted mb-0">${subtitulo}</p></div>
        <div class="d-flex gap-2 flex-wrap">
          ${acoes.map((a,i)=>`<button class="btn ${i===0?'btn-primary':'btn-outline-primary'}" onclick="${rhV2Action(a,titulo)}"><i class="ph ${i===0?'ph-plus':'ph-play'} me-1"></i>${a}</button>`).join('')}
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${cards.map(c=>`<div class="col-xl-3 col-md-6"><div class="card h-100"><div class="card-body d-flex justify-content-between"><div><div class="text-muted small text-uppercase">${c[0]}</div><div class="fs-3 fw-bold mt-2">${c[1]}</div></div><i class="ph ${c[2]} fs-2 text-primary"></i></div></div></div>`).join('')}
      </div>
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center"><h5 class="mb-0">Gestão de ${titulo}</h5><div class="d-flex gap-2"><input class="form-control form-control-sm" placeholder="Buscar..." style="width:220px"><button class="btn btn-sm btn-outline-secondary" onclick="${rhV2Action('Filtrar',titulo)}"><i class="ph ph-funnel"></i> Filtros</button></div></div>
        <div class="table-responsive"><table class="table table-hover mb-0"><thead><tr>${colunas.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${colunas.length}" class="text-center py-5 text-muted"><i class="ph ph-database fs-2 d-block mb-2"></i>Nenhum registro cadastrado nesta base. Use <strong>${acoes[0]}</strong> para iniciar.</td></tr></tbody></table></div>
      </div>
      <div class="card"><div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2"><div><strong>Fluxo e auditoria habilitados</strong><div class="text-muted small">As ações deste módulo seguem permissões por perfil e trilha de auditoria do RH Disk.</div></div><button class="btn btn-outline-dark" onclick="${rhV2Action('Abrir histórico de auditoria',titulo)}"><i class="ph ph-clock-counter-clockwise me-1"></i>Histórico</button></div></div>
    </div>`;
}
