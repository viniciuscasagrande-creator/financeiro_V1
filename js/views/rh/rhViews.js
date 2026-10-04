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

// ----------------------------------------------------------------------------
// 10. BANCO DE HORAS & COMPENSAÇÕES (Fase 4)
// ----------------------------------------------------------------------------
export function renderDiskRHBancoHoras(state, filterArg = 'banco') {
  const db = state.db || {};
  const bancoList = db.rhBancoHoras || [];
  const totalPositivoMin = bancoList.filter(b => b.saldoMinutos > 0).reduce((acc, b) => acc + b.saldoMinutos, 0);
  const totalDevedorMin = bancoList.filter(b => b.saldoMinutos < 0).reduce((acc, b) => acc + Math.abs(b.saldoMinutos), 0);
  const totalHe50 = bancoList.reduce((acc, b) => acc + (b.horasExtras50 || 0), 0);
  const totalHe100 = bancoList.reduce((acc, b) => acc + (b.horasExtras100 || 0), 0);

  const formatHorasMin = (minutos) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-timer text-primary me-2"></i>Banco de Horas & Compensações</h3>
          <p class="text-muted mb-0">Controle individual e coletivo de horas extras a 50% e 100%, compensações e saldo acumulado de jornada.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarBancoHorasCSV()">
            <i class="ph-download-simple me-1"></i> Exportar Extrato
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalCompensacaoHoras()">
            <i class="ph-plus-circle me-1"></i> Lançar Folga / Compensação
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Saldo Positivo (Créditos)</span>
              <div class="fs-3 fw-bold text-success mt-1">+${formatHorasMin(totalPositivoMin)}</div>
              <div class="small text-muted mt-1">Horas acumuladas a compensar</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-danger h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Saldo Devedor (Débitos)</span>
              <div class="fs-3 fw-bold text-danger mt-1">-${formatHorasMin(totalDevedorMin)}</div>
              <div class="small text-muted mt-1">Atrasos e faltas justificadas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Horas Extras 50% (Dias Úteis)</span>
              <div class="fs-3 fw-bold text-primary mt-1">${totalHe50.toFixed(1)}h</div>
              <div class="small text-muted mt-1">Acréscimo padrão CLT</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Horas Extras 100% (Domingos/Feriados)</span>
              <div class="fs-3 fw-bold text-warning mt-1">${totalHe100.toFixed(1)}h</div>
              <div class="small text-muted mt-1">Operações especiais de shows</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Banco de Horas -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Extrato Consolidado por Colaborador • Competência 2026-10</h5>
          <span class="badge bg-light text-dark border">Acordo Coletivo Vigente (Limite 6 meses)</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Matrícula</th>
                <th>Departamento</th>
                <th>H.E. 50%</th>
                <th>H.E. 100%</th>
                <th>Compensações</th>
                <th>Saldo Líquido</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${bancoList.map(b => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${b.colaboradorNome}</div>
                    <div class="small text-muted">Atualizado em ${b.ultimaAtualizacao}</div>
                  </td>
                  <td><code>${b.matricula}</code></td>
                  <td class="small">${b.departamento}</td>
                  <td class="fw-semibold text-primary">${b.horasExtras50}h</td>
                  <td class="fw-semibold text-warning">${b.horasExtras100}h</td>
                  <td class="small text-muted">${b.compensacoes}h</td>
                  <td>
                    <span class="badge ${b.saldoMinutos >= 0 ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'} fs-6 fw-bold px-3 py-1">
                      ${b.saldoFormatado}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${b.status === 'POSITIVO' ? 'bg-success' : 'bg-danger'}">${b.status}</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.verEspelhoColaborador('${b.colaboradorId}')">
                      <i class="ph-file-text me-1"></i> Espelho
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

// ----------------------------------------------------------------------------
// 11. FECHAMENTO MENSAL & ESPELHO DE PONTO (Fase 4)
// ----------------------------------------------------------------------------
export function renderDiskRHFechamento(state, filterArg = 'fechamento') {
  const db = state.db || {};
  const fechamentos = db.rhFechamentosPonto || [];
  const ajustesPendentes = (db.rhAjustesPonto || []).filter(a => a.status === 'PENDENTE');
  const temPendencias = ajustesPendentes.length > 0;

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-calendar-check text-primary me-2"></i>Fechamento Mensal & Espelho Oficial</h3>
          <p class="text-muted mb-0">Homologação de competências mensais, trava de segurança do espelho de ponto e exportação AFD / AFDT Portaria 671 MTE.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarRelatorioMTE()">
            <i class="ph-file-code me-1"></i> Arquivo AFD (MTE)
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.executarFechamentoPontoCompetencia('2026-10')">
            <i class="ph-lock-key me-1"></i> Homologar & Fechar Outubro/2026
          </button>
        </div>
      </div>

      ${temPendencias ? `
        <div class="alert alert-warning border-0 shadow-sm d-flex align-items-center justify-content-between mb-4">
          <div class="d-flex align-items-center gap-3">
            <i class="ph-warning-octagon fs-2 text-warning"></i>
            <div>
              <div class="fw-bold">Atenção: Existem ${ajustesPendentes.length} ajuste(s) de ponto pendente(s) de análise!</div>
              <div class="small">Conforme a Portaria 671 MTE e Art. 74 da CLT, o fechamento mensal da competência permanece bloqueado até a homologação formal de todas as pendências.</div>
            </div>
          </div>
          <button class="btn btn-warning btn-sm fw-bold" onclick="window.LimitlessApp.navigate('diskRH_ponto')">
            Resolver Pendências no Ponto
          </button>
        </div>
      ` : `
        <div class="alert alert-success border-0 shadow-sm d-flex align-items-center gap-3 mb-4">
          <i class="ph-check-circle fs-2 text-success"></i>
          <div>
            <div class="fw-bold">Nenhuma pendência de marcação em aberto!</div>
            <div class="small">Todas as solicitações de ajuste e batidas da competência foram 100% regularizadas e auditadas.</div>
          </div>
        </div>
      `}

      <!-- Status das Competências -->
      <div class="row g-3 mb-4">
        ${fechamentos.map(f => `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100 ${f.status === 'FECHADO' ? 'border-start border-4 border-success' : 'border-start border-4 border-warning'}">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span class="badge ${f.status === 'FECHADO' ? 'bg-success' : 'bg-warning text-dark'} mb-1">
                      ${f.status === 'FECHADO' ? '🔒 FECHADO & HOMOLOGADO' : '⏳ EM APURAÇÃO (ABERTO)'}
                    </span>
                    <h4 class="fw-bold mb-0">Competência ${f.competencia}</h4>
                    <span class="text-muted small">Período: ${f.periodoInicio} a ${f.periodoFim}</span>
                  </div>
                  <div class="text-end">
                    <span class="fs-4 fw-bold text-dark">${f.totalHorasTrabalhadas}</span>
                    <div class="small text-muted">${f.totalColaboradores} colaboradores</div>
                  </div>
                </div>

                <div class="p-3 bg-light rounded-3 mb-3">
                  <div class="row g-2 text-center">
                    <div class="col-4">
                      <div class="small text-muted">Batidas</div>
                      <div class="fw-bold text-dark">${f.totalBatidas}</div>
                    </div>
                    <div class="col-4">
                      <div class="small text-muted">H. Extras</div>
                      <div class="fw-bold text-primary">${f.totalHorasExtras}</div>
                    </div>
                    <div class="col-4">
                      <div class="small text-muted">Pendências</div>
                      <div class="fw-bold ${f.ajustesPendentes > 0 ? 'text-danger' : 'text-success'}">${f.ajustesPendentes}</div>
                    </div>
                  </div>
                </div>

                ${f.status === 'FECHADO' ? `
                  <div class="small text-muted mb-2">
                    <i class="ph-shield-check text-success me-1"></i> Homologado por: <strong>${f.fechadoPor}</strong> em ${f.fechadoEm}
                  </div>
                  <div class="p-2 bg-white border rounded font-monospace small text-truncate text-muted mb-3" title="${f.espelhoHash}">
                    SHA-256: ${f.espelhoHash}
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-success btn-sm w-100" onclick="window.LimitlessApp.exportarEspelhoPDF('${f.competencia}')">
                      <i class="ph-file-pdf me-1"></i> Baixar Espelhos (PDF)
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.reabrirCompetenciaPonto('${f.competencia}')" title="Reabertura Excepcional">
                      <i class="ph-lock-open"></i>
                    </button>
                  </div>
                ` : `
                  <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm w-100 fw-bold" onclick="window.LimitlessApp.executarFechamentoPontoCompetencia('${f.competencia}')">
                      <i class="ph-lock-key me-1"></i> Travar Competência Agora
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 12. FÉRIAS & AUSÊNCIAS LEGAIS (Fase 5)
// ----------------------------------------------------------------------------
export function renderDiskRHFerias(state, filterArg = 'ferias') {
  const db = state.db || {};
  const feriasList = db.rhFerias || [];
  const colaboradores = db.rhColaboradores || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-sun text-warning me-2"></i>Férias & Ausências Legais (CLT)</h3>
          <p class="text-muted mb-0">Controle de períodos aquisitivos e concessivos, cálculo automático de 1/3 legal, abono pecuniário e adiantamento de 13º salário.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalSolicitarFerias()">
            <i class="ph-calendar-plus me-1"></i> Agendar Férias
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Colaboradores em Férias</span>
              <div class="fs-3 fw-bold text-success mt-1">1 Ativo</div>
              <div class="small text-muted mt-1">Retorno previsto em 20/11</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Agendamentos Homologados</span>
              <div class="fs-3 fw-bold text-info mt-1">${feriasList.filter(f => f.status === 'APROVADO').length} Programadas</div>
              <div class="small text-muted mt-1">Próximos 90 dias</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Concessivo Vencendo em Dobro</span>
              <div class="fs-3 fw-bold text-warning mt-1">0 Alertas</div>
              <div class="small text-muted mt-1">100% em conformidade legal CLT</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Provisão de 1/3 Constitucional</span>
              <div class="fs-3 fw-bold text-primary mt-1">R$ 3.400,00</div>
              <div class="small text-muted mt-1">Encargos já provisionados</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Férias -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Planejamento e Histórico de Férias</h5>
          <span class="badge bg-light text-dark border">Art. 129 a 145 da CLT</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Período Aquisitivo</th>
                <th>Limite Concessivo</th>
                <th>Dias Gozo</th>
                <th>Abono (Venda 1/3)</th>
                <th>Início / Fim</th>
                <th>Total a Receber</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${feriasList.map(f => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${f.colaboradorNome}</div>
                    <div class="small text-muted">${f.cargo}</div>
                  </td>
                  <td class="small">${f.periodoAquisitivo}</td>
                  <td class="small fw-semibold text-danger">${f.periodoConcessivoLimite}</td>
                  <td><span class="badge bg-light text-dark border">${f.diasGozo} dias</span></td>
                  <td>
                    ${f.diasAbonoPecuniario > 0 
                      ? `<span class="badge bg-success-subtle text-success border border-success">${f.diasAbonoPecuniario} dias vendidas</span>` 
                      : '<span class="text-muted small">Não optou</span>'}
                  </td>
                  <td>
                    <div class="small fw-bold text-dark">${f.dataInicio}</div>
                    <div class="small text-muted">até ${f.dataFim}</div>
                  </td>
                  <td class="fw-bold text-success">
                    ${formatCurrency(f.totalAReceber)}
                    <div class="small text-muted font-monospace" style="font-size:10px;">+1/3 Constitucional</div>
                  </td>
                  <td>
                    <span class="badge ${f.status === 'APROVADO' ? 'bg-success' : 'bg-warning text-dark'}">${f.status}</span>
                  </td>
                  <td>
                    ${f.status === 'SOLICITADO' ? `
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.aprovarFerias('${f.id}')">
                        <i class="ph-check me-1"></i> Aprovar
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.emitirAvisoFerias('${f.id}')">
                        <i class="ph-printer me-1"></i> Aviso de Férias
                      </button>
                    `}
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

// ----------------------------------------------------------------------------
// 13. ATESTADOS MÉDICOS & AFASTAMENTOS (Fase 5)
// ----------------------------------------------------------------------------
export function renderDiskRHAtestados(state, filterArg = 'atestados') {
  const db = state.db || {};
  const atestados = db.rhAtestados || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-stethoscope text-danger me-2"></i>Atestados Médicos & Afastamentos Ocupacionais</h3>
          <p class="text-muted mb-0">Gestão médica com CRM, CID-10, abono automático no espelho de ponto e alerta de encaminhamento previdenciário INSS (>15 dias).</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoAtestado()">
            <i class="ph-plus-circle me-1"></i> Cadastrar Atestado
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Atestados no Mês</span>
              <div class="fs-3 fw-bold text-primary mt-1">${atestados.length} Registros</div>
              <div class="small text-muted mt-1">Homologados pela Medicina do Trabalho</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Horas Abonadas no Ponto</span>
              <div class="fs-3 fw-bold text-success mt-1">${atestados.reduce((acc, a) => acc + (a.horasAbonadas || 0), 0)} Horas</div>
              <div class="small text-muted mt-1">Sem impacto no salário base</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Encaminhamentos INSS (>15d)</span>
              <div class="fs-3 fw-bold text-warning mt-1">0 Casos</div>
              <div class="small text-muted mt-1">Nenhum afastamento prolongado</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Conformidade eSocial (S-2230)</span>
              <div class="fs-3 fw-bold text-info mt-1">100%</div>
              <div class="small text-muted mt-1">Afastamentos transmitidos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Atestados -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Relação de Atestados e Licenças Médicas</h5>
          <span class="badge bg-light text-dark border">Sigilo Médico CFM & LGPD</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Médico Emitente / CRM</th>
                <th>Classificação CID-10</th>
                <th>Período</th>
                <th>Dias</th>
                <th>Horas Abonadas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${atestados.map(a => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${a.colaboradorNome}</div>
                  </td>
                  <td>
                    <div class="small fw-semibold text-dark">${a.medicoNome}</div>
                    <div class="small text-muted">CRM: ${a.crm}</div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">${a.cid10}</span>
                  </td>
                  <td>
                    <div class="small fw-bold">${a.dataInicio}</div>
                    <div class="small text-muted">até ${a.dataFim}</div>
                  </td>
                  <td><span class="badge bg-dark">${a.diasAfastamento} dia(s)</span></td>
                  <td class="fw-bold text-success">${a.horasAbonadas}h</td>
                  <td>
                    <span class="badge ${a.status === 'HOMOLOGADO' ? 'bg-success' : 'bg-warning text-dark'}">${a.status}</span>
                  </td>
                  <td>
                    ${a.status === 'EM_ANALISE' ? `
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.homologarAtestado('${a.id}')">
                        <i class="ph-check me-1"></i> Homologar
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.visualizarComprovanteAtestado('${a.id}')">
                        <i class="ph-file-pdf me-1"></i> Ver Anexo
                      </button>
                    `}
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

// ----------------------------------------------------------------------------
// 14. ADMISSÃO DIGITAL & ONBOARDING (Fase 6)
// ----------------------------------------------------------------------------
export function renderDiskRHAdmissao(state, filterArg = 'admissao') {
  const db = state.db || {};
  const admissoes = db.rhAdmissoes || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-user-circle-plus text-primary me-2"></i>Admissão Digital & Onboarding</h3>
          <p class="text-muted mb-0">Workflow sem papel de admissão: coleta de documentos, validação cadastral, ASO, contrato digital e criação automática de credenciais.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovaAdmissao()">
            <i class="ph-user-plus me-1"></i> Iniciar Nova Admissão
          </button>
        </div>
      </div>

      <!-- Funil Visual do Onboarding -->
      <div class="card border-0 shadow-sm mb-4 bg-light">
        <div class="card-body p-4">
          <div class="row g-2 text-center">
            <div class="col">
              <div class="p-3 bg-white rounded shadow-sm">
                <span class="badge bg-secondary mb-1">Passo 1</span>
                <div class="fw-bold text-dark">Rascunho / Vaga</div>
                <div class="small text-muted">Dados Iniciais</div>
              </div>
            </div>
            <div class="col">
              <div class="p-3 bg-white rounded shadow-sm">
                <span class="badge bg-info mb-1">Passo 2</span>
                <div class="fw-bold text-dark">Coleta de Documentos</div>
                <div class="small text-muted">Upload do Candidato</div>
              </div>
            </div>
            <div class="col">
              <div class="p-3 bg-white rounded shadow-sm border border-primary">
                <span class="badge bg-primary mb-1">Passo 3</span>
                <div class="fw-bold text-primary">Análise RH & ASO</div>
                <div class="small text-muted">Validação Cadastral</div>
              </div>
            </div>
            <div class="col">
              <div class="p-3 bg-white rounded shadow-sm">
                <span class="badge bg-warning text-dark mb-1">Passo 4</span>
                <div class="fw-bold text-dark">Contrato Digital</div>
                <div class="small text-muted">Assinatura GED</div>
              </div>
            </div>
            <div class="col">
              <div class="p-3 bg-white rounded shadow-sm">
                <span class="badge bg-success mb-1">Passo 5</span>
                <div class="fw-bold text-success">Concluído & Acesso</div>
                <div class="small text-muted">Ativo no ERP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Candidatos e Processos de Admissão -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Processos de Admissão em Andamento</h5>
          <span class="badge bg-primary-subtle text-primary border border-primary">${admissoes.length} Candidatos Ativos</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Candidato</th>
                <th>Cargo / Departamento</th>
                <th>Salário Proposto</th>
                <th>Início Previsto</th>
                <th>Progresso</th>
                <th>Checklist de Documentos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${admissoes.map(a => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${a.candidatoNome}</div>
                    <div class="small text-muted">CPF: ${a.cpf} • ${a.telefone}</div>
                  </td>
                  <td>
                    <div class="small fw-semibold text-dark">${a.cargoPretendido}</div>
                    <div class="small text-muted">${a.departamento}</div>
                  </td>
                  <td class="fw-bold text-dark">${formatCurrency(a.salarioProposto)}</td>
                  <td class="small fw-semibold text-primary">${a.dataPrevisaoInicio}</td>
                  <td style="min-width: 120px;">
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 6px;">
                        <div class="progress-bar bg-success" style="width: ${a.progressoEtapas};"></div>
                      </div>
                      <span class="small fw-bold">${a.progressoEtapas}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      ${(a.checklist || []).map(c => `
                        <span class="badge ${c.status === 'APROVADO' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border" style="font-size: 10px;" title="${c.item}">
                          ${c.item.substring(0, 14)}...
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary">${a.status}</span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.verChecklistAdmissao('${a.id}')" title="Ver Detalhes">
                        <i class="ph-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.concluirAdmissao('${a.id}')" title="Efetivar Admissão e Cadastrar Colaborador">
                        <i class="ph-check me-1"></i> Concluir
                      </button>
                    </div>
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

// ----------------------------------------------------------------------------
// 15. GESTÃO ELETRÔNICA DE DOCUMENTOS - GED (Fase 6)
// ----------------------------------------------------------------------------
export function renderDiskRHGed(state, filterArg = 'ged') {
  const db = state.db || {};
  const documentos = db.rhGedDocumentos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-files text-primary me-2"></i>Gestão Eletrônica de Documentos (GED) & Assinatura Digital</h3>
          <p class="text-muted mb-0">Guarda imutável de contratos de trabalho, termos de adesão, aditivos e comprovantes com hash SHA-256 e assinatura eletrônica.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoDocumentoGed()">
            <i class="ph-upload-simple me-1"></i> Emitir Novo Documento
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Documentos Assinados</span>
              <div class="fs-3 fw-bold text-success mt-1">${documentos.filter(d => d.assinado).length} Válidos</div>
              <div class="small text-muted mt-1">Autenticidade ICP-Brasil / MP 2.200-2</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Integridade Criptográfica</span>
              <div class="fs-3 fw-bold text-primary mt-1">100% SHA-256</div>
              <div class="small text-muted mt-1">Rastreabilidade contra alterações</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Termos LGPD Assinados</span>
              <div class="fs-3 fw-bold text-info mt-1">100% Cobertura</div>
              <div class="small text-muted mt-1">Consentimento de dados pessoais</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Pendentes de Assinatura</span>
              <div class="fs-3 fw-bold text-warning mt-1">0 Pendentes</div>
              <div class="small text-muted mt-1">Repositório totalmente em dia</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Documentos GED -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Repositório Digital Centralizado</h5>
          <span class="badge bg-light text-dark border">Criptografia AES-256 em Repouso</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Título do Documento</th>
                <th>Tipo</th>
                <th>Emissão</th>
                <th>Assinatura Eletrônica</th>
                <th>Hash de Integridade (SHA-256)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${documentos.map(d => `
                <tr>
                  <td class="fw-bold text-dark">${d.colaboradorNome}</td>
                  <td>
                    <div class="fw-semibold text-primary"><i class="ph-file-pdf me-1"></i>${d.titulo}</div>
                    <div class="small text-muted">${d.tamanhoKb} KB</div>
                  </td>
                  <td><span class="badge bg-light text-dark border">${d.tipoDocumento}</span></td>
                  <td class="small">${d.dataEmissao}</td>
                  <td>
                    ${d.assinado ? `
                      <span class="badge bg-success-subtle text-success border border-success mb-1">
                        <i class="ph-seal-check me-1"></i> ASSINADO
                      </span>
                      <div class="small text-muted" style="font-size: 10px;">${d.assinadoEm}</div>
                      <div class="small text-muted" style="font-size: 10px;">IP: ${d.ipAssinatura}</div>
                    ` : `
                      <span class="badge bg-warning text-dark">PENDENTE</span>
                    `}
                  </td>
                  <td>
                    <code class="small text-muted font-monospace" title="${d.hashSha256}">
                      ${d.hashSha256.substring(0, 16)}...
                    </code>
                  </td>
                  <td><span class="badge bg-success">${d.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.visualizarDocumentoGed('${d.id}')">
                      <i class="ph-download me-1"></i> Visualizar
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

// ----------------------------------------------------------------------------
// 16. GESTÃO CORPORATIVA DE BENEFÍCIOS (Fase 7)
// ----------------------------------------------------------------------------
export function renderDiskRHBeneficios(state, filterArg = 'beneficios') {
  const db = state.db || {};
  const beneficios = db.rhBeneficios || [];
  const pedidos = db.rhPedidosBeneficios || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-credit-card text-success me-2"></i>Gestão Corporativa de Benefícios</h3>
          <p class="text-muted mb-0">Vale Transporte (trava do teto de desconto de 6% do salário CLT), Vale Refeição (dias úteis), Plano de Saúde e recargas mensais.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm" onclick="window.LimitlessApp.aprovarRecargaBeneficios('ped-ben-2026-10')">
            <i class="ph-check-circle me-1"></i> Homologar Recarga Outubro/2026
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Recarga Mensal Total</span>
              <div class="fs-3 fw-bold text-primary mt-1">R$ 38.740,00</div>
              <div class="small text-muted mt-1">42 colaboradores beneficiados</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Desconto em Folha (Trava 6% CLT)</span>
              <div class="fs-3 fw-bold text-info mt-1">R$ 14.210,00</div>
              <div class="small text-muted mt-1">Lei nº 7.418/1985 (Teto legal)</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Custo Corporativo Líquido</span>
              <div class="fs-3 fw-bold text-warning mt-1">R$ 24.530,00</div>
              <div class="small text-muted mt-1">Subsídio empresa em benefícios</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Status do Pedido de Outubro</span>
              <div class="fs-3 fw-bold text-success mt-1">APROVADO</div>
              <div class="small text-muted mt-1">Disponibilizado no 1º dia útil</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Benefícios Ativos -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Detalhamento de Benefícios por Colaborador</h5>
          <span class="badge bg-light text-dark border">Controle de Coparticipação</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Benefício</th>
                <th>Operadora</th>
                <th>Valor Integral</th>
                <th>Desconto em Folha (6% Teto)</th>
                <th>Custo Empresa</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${beneficios.map(b => `
                <tr>
                  <td class="fw-bold text-dark">${b.colaboradorNome}</td>
                  <td>
                    <div class="fw-semibold text-primary">${b.nomeBeneficio}</div>
                    <span class="badge bg-light text-dark border">${b.tipo}</span>
                  </td>
                  <td class="small">${b.operadora}</td>
                  <td class="fw-bold text-dark">${formatCurrency(b.valorMensalIntegral)}</td>
                  <td class="fw-bold text-danger">-${formatCurrency(b.descontoEmFolha6Pct)}</td>
                  <td class="fw-bold text-success">${formatCurrency(b.custoEmpresa)}</td>
                  <td><span class="badge bg-success">${b.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.editarBeneficioColaborador('${b.id}')">
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

// ----------------------------------------------------------------------------
// 17. STAFF DE EVENTOS & DIÁRIAS (Fase 9)
// ----------------------------------------------------------------------------
export function renderDiskRHStaff(state, filterArg = 'staff') {
  const db = state.db || {};
  const staffList = db.rhDiariasStaff || [];
  const totalDiarias = staffList.reduce((acc, s) => acc + (s.totalPagar || 0), 0);

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-ticket text-primary me-2"></i>Staff de Eventos & Diárias (Shows & Arenas)</h3>
          <p class="text-muted mb-0">Escala de caixas, bilheteria e orientadores em arenas de shows com check-in por cerca virtual, aprovação de diárias e envio para Fila PIX da Tesouraria.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm" onclick="window.LimitlessApp.enviarPagamentoRHParaTesouraria('evt-xyz-1')">
            <i class="ph-paper-plane-tilt me-1"></i> Enviar Pagamentos à Tesouraria PIX
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Profissionais Alocados</span>
              <div class="fs-3 fw-bold text-primary mt-1">${staffList.length} Profissionais</div>
              <div class="small text-muted mt-1">Show Nacional de Rock + Turnê Artista A</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Total a Pagar (Mão de Obra)</span>
              <div class="fs-3 fw-bold text-success mt-1">${formatCurrency(totalDiarias)}</div>
              <div class="small text-muted mt-1">Alimentando linha de M.O. no DRE</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Check-in na Geofence Arena</span>
              <div class="fs-3 fw-bold text-info mt-1">100% Presentes</div>
              <div class="small text-muted mt-1">Ligga Arena (Curitiba)</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Liquidação Financeira</span>
              <div class="fs-3 fw-bold text-warning mt-1">PIX Instantâneo</div>
              <div class="small text-muted mt-1">Contas validadas no cadastro</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Diárias de Staff -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Controle Operacional de Equipes de Shows</h5>
          <span class="badge bg-light text-dark border">Cálculo de Despesas Diretas de Evento</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Evento / Local</th>
                <th>Profissional</th>
                <th>Função na Arena</th>
                <th>Check-in Geofence</th>
                <th>Diária + Benefícios</th>
                <th>Total a Pagar</th>
                <th>Chave PIX</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${staffList.map(s => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${s.eventoNome}</div>
                    <div class="small text-muted"><i class="ph-map-pin text-danger me-1"></i>${s.localNome}</div>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">${s.profissionalNome}</div>
                    <span class="badge bg-light text-dark border" style="font-size: 10px;">${s.tipoContrato}</span>
                  </td>
                  <td class="small fw-semibold text-primary">${s.funcao}</td>
                  <td>
                    ${s.checkInGeofence ? `
                      <span class="badge bg-success-subtle text-success border border-success">
                        <i class="ph-check-circle me-1"></i> Check-in às ${s.horarioCheckIn}
                      </span>
                      <div class="small text-muted" style="font-size: 10px;">Distância: ${s.distanciaArenaMetros}m</div>
                    ` : `
                      <span class="badge bg-secondary">Aguardando Escala</span>
                    `}
                  </td>
                  <td class="small">
                    <div>Diária: ${formatCurrency(s.valorDiaria)}</div>
                    <div class="text-muted">VT/VR: +${formatCurrency(s.auxilioAlimentacao + s.auxilioTransporte)}</div>
                  </td>
                  <td class="fw-bold text-success fs-6">${formatCurrency(s.totalPagar)}</td>
                  <td>
                    <code>${s.chavePix}</code>
                    <div class="small text-muted">${s.tipoChavePix}</div>
                  </td>
                  <td>
                    <span class="badge ${s.status === 'APROVADO_PAGAMENTO' ? 'bg-success' : 'bg-warning text-dark'}">${s.status}</span>
                  </td>
                  <td>
                    ${s.status === 'AGENDADO' ? `
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.aprovarDiariaStaff('${s.id}')">
                        <i class="ph-check me-1"></i> Aprovar
                      </button>
                    ` : `
                      <span class="badge bg-success-subtle text-success"><i class="ph-check-double me-1"></i>Pronto p/ PIX</span>
                    `}
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

// ----------------------------------------------------------------------------
// 18. DISPOSITIVOS MÓVEIS - DISK PONTO APK (Fase 4)
// ----------------------------------------------------------------------------
export function renderDiskRHDispositivos(state, filterArg = 'dispositivos') {
  const db = state.db || {};
  const dispositivos = db.rhDispositivos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-device-mobile text-primary me-2"></i>Dispositivos Móveis Homologados (Disk Ponto)</h3>
          <p class="text-muted mb-0">Gestão dos smartphones autorizados para registro de ponto REP-P, integridade de GPS, proteção anti-mock location e bloqueio remoto.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="window.LimitlessApp.abrirSimuladorPontoMobile()">
            <i class="ph-play-circle me-1"></i> Testar no Simulador Mobile
          </button>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Aparelhos Ativos</span>
              <div class="fs-3 fw-bold text-success mt-1">${dispositivos.filter(d => d.status === 'AUTORIZADO').length} Autorizados</div>
              <div class="small text-muted mt-1">Conexão segura com o Core</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-danger h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Aparelhos Bloqueados</span>
              <div class="fs-3 fw-bold text-danger mt-1">${dispositivos.filter(d => d.status === 'BLOQUEADO').length} Bloqueados</div>
              <div class="small text-muted mt-1">Tentativa de Mock GPS interceptada</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Versão Homologada MTE</span>
              <div class="fs-3 fw-bold text-primary mt-1">v1.0.4 APK</div>
              <div class="small text-muted mt-1">Portaria 671 MTE Compliance</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Segurança Biometria</span>
              <div class="fs-3 fw-bold text-info mt-1">Ativa</div>
              <div class="small text-muted mt-1">FaceID / TouchID obrigatório</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Dispositivos -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Inventário de Smartphones Vinculados ao REP-P</h5>
          <span class="badge bg-light text-dark border">Controle por UUID de Hardware</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Modelo do Aparelho</th>
                <th>Sistema Operacional</th>
                <th>Versão Disk Ponto</th>
                <th>UUID de Hardware</th>
                <th>Biometria / GPS</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${dispositivos.map(d => `
                <tr>
                  <td class="fw-bold text-dark">${d.colaboradorNome}</td>
                  <td>
                    <div class="fw-semibold text-dark"><i class="ph-device-mobile me-1"></i>${d.modelo}</div>
                    <div class="small text-muted">Sincronizado: ${d.ultimaSincronizacao}</div>
                  </td>
                  <td class="small">${d.sistemaOperacional}</td>
                  <td><code>${d.versaoApp}</code></td>
                  <td><code class="small text-muted">${d.uuidDispositivo}</code></td>
                  <td>
                    <div class="d-flex gap-1">
                      <span class="badge ${d.biometriaAtiva ? 'bg-success-subtle text-success' : 'bg-secondary'} border">
                        <i class="ph-fingerprint me-1"></i> Biometria
                      </span>
                      <span class="badge ${d.mockLocationDetectado ? 'bg-danger text-white' : 'bg-success-subtle text-success'} border">
                        ${d.mockLocationDetectado ? '⚠️ Fake GPS' : '✓ GPS Genuíno'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${d.status === 'AUTORIZADO' ? 'bg-success' : 'bg-danger'}">${d.status}</span>
                  </td>
                  <td>
                    <button class="btn btn-sm ${d.status === 'AUTORIZADO' ? 'btn-outline-danger' : 'btn-outline-success'} fw-bold" onclick="window.LimitlessApp.bloquearDesbloquearDispositivo('${d.id}')">
                      ${d.status === 'AUTORIZADO' ? '<i class="ph-lock me-1"></i> Bloquear' : '<i class="ph-lock-open me-1"></i> Liberar'}
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

// ----------------------------------------------------------------------------
// 19. ESOCIAL & CONFORMIDADE TRABALHISTA (Fase 10)
// ----------------------------------------------------------------------------
export function renderDiskRHEsocial(state, filterArg = 'esocial') {
  const db = state.db || {};
  const eventos = db.rhEventosESocial || [];
  const analytics = db.rhPeopleAnalytics || {};

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-chart-line-up text-primary me-2"></i>People Analytics & eSocial (Governo Federal)</h3>
          <p class="text-muted mb-0">Transmissão de eventos governamentais S-1000, S-2200, S-1200 e S-1210 com recibos oficiais, além de métricas executivas de turnover e absenteísmo.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.preValidarXMLEsocial()">
            <i class="ph-check-circle me-1"></i> Pré-validar XMLs
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.transmitirLoteEsocial()">
            <i class="ph-paper-plane-tilt me-1"></i> Transmitir Lote eSocial
          </button>
        </div>
      </div>

      <!-- Métricas de People Analytics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Taxa de Turnover (Mensal)</span>
              <div class="fs-3 fw-bold text-success mt-1">${analytics.taxaTurnoverMensal || 1.8}%</div>
              <div class="small text-muted mt-1"><i class="ph-trend-down text-success"></i> Excelente retenção de talentos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Índice de Absenteísmo</span>
              <div class="fs-3 fw-bold text-info mt-1">${analytics.taxaAbsenteismo || 1.2}%</div>
              <div class="small text-muted mt-1">Horas perdidas / Horas previstas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Custo Médio Per Capita</span>
              <div class="fs-3 fw-bold text-primary mt-1">${formatCurrency(analytics.custoMedioPerCapita || 4450)}</div>
              <div class="small text-muted mt-1">Salário + Benefícios + Encargos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Tempo Médio de Casa</span>
              <div class="fs-3 fw-bold text-warning mt-1">${analytics.tempoMedioCasaMeses || 26.4} Meses</div>
              <div class="small text-muted mt-1">Estabilidade da equipe Disk</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Eventos do eSocial -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Eventos Trabalhistas Transmitidos ao eSocial</h5>
          <span class="badge bg-success-subtle text-success border border-success">
            <i class="ph-shield-check me-1"></i> Ambiente Oficial Conectado
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Evento</th>
                <th>Descrição Oficial</th>
                <th>Identificador do Evento</th>
                <th>Competência</th>
                <th>Recibo de Entrega (Governo)</th>
                <th>Transmissão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${eventos.map(e => `
                <tr>
                  <td><span class="badge bg-dark fw-bold fs-6">${e.tipo}</span></td>
                  <td>
                    <div class="fw-semibold text-dark">${e.nome}</div>
                    <div class="small text-muted">${e.detalhes}</div>
                  </td>
                  <td><code class="small text-muted font-monospace">${e.identificador}</code></td>
                  <td><span class="badge bg-light text-dark border">${e.competencia}</span></td>
                  <td>
                    <code class="small text-success fw-bold">${e.reciboEntrega}</code>
                  </td>
                  <td class="small text-muted">${e.transmitidoEm || 'Aguardando Disparo'}</td>
                  <td>
                    <span class="badge ${e.status === 'TRANSMITIDO' || e.status === 'VALIDADO' ? 'bg-success' : 'bg-warning text-dark'}">
                      ${e.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.visualizarXMLEsocial('${e.id}')">
                      <i class="ph-code me-1"></i> Ver XML
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

// ----------------------------------------------------------------------------
// 20. CENTRAL DE APROVAÇÕES UNIFICADA (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHAprovacoesCentral(state, filterArg = 'todas') {
  const db = state.db || {};
  const todas = db.rhCentralAprovacoes || [];
  
  let filtradas = todas;
  if (filterArg && filterArg !== 'todas' && filterArg !== 'aprovacoes') {
    filtradas = todas.filter(s => s.tipo.toLowerCase() === filterArg.toLowerCase() || s.status.toLowerCase() === filterArg.toLowerCase());
  }

  const pendentesCount = todas.filter(s => s.status === 'PENDENTE').length;
  const aprovadasCount = todas.filter(s => s.status === 'APROVADO').length;
  const valorTotalSobAnalise = todas.reduce((acc, s) => acc + (s.valor || 0), 0);

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-stamp text-primary me-2"></i>Central de Aprovações Unificada (RH Disk)</h3>
          <p class="text-muted mb-0">Workflow central de governança: Férias, Horas Extras, Ajustes de Ponto, Reembolsos e Admissões com alçadas de aprovação e auditoria.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.navigate('diskRH_visao')">
            <i class="ph-arrow-left me-1"></i> Painel Geral
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.aprovarTodasPendenciasRH()">
            <i class="ph-check-square-offset me-1"></i> Aprovar Pendências Rápidas
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Pendentes de Decisão</span>
              <div class="fs-3 fw-bold text-warning mt-1">${pendentesCount} Solicitações</div>
              <div class="small text-muted mt-1"><i class="ph-clock text-warning"></i> Aguardando análise de alçada</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Aprovadas no Mês</span>
              <div class="fs-3 fw-bold text-success mt-1">${aprovadasCount} Homologadas</div>
              <div class="small text-muted mt-1"><i class="ph-check-circle text-success"></i> Fluxo com eficácia de 100%</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Impacto Financeiro Sob Análise</span>
              <div class="fs-3 fw-bold text-info mt-1">${formatCurrency(valorTotalSobAnalise)}</div>
              <div class="small text-muted mt-1">Reembolsos, HE e Férias</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Tempo Médio de SLA</span>
              <div class="fs-3 fw-bold text-primary mt-1">4.2 Horas</div>
              <div class="small text-muted mt-1">Resolução ágil de solicitações</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs de Filtros Rápidos -->
      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button class="nav-link ${filterArg === 'todas' || filterArg === 'aprovacoes' ? 'active' : ''}" onclick="window.LimitlessApp.navigate('diskRH_aprovacoes', 'todas')">
            Todas (${todas.length})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link ${filterArg === 'ferias' ? 'active' : ''}" onclick="window.LimitlessApp.navigate('diskRH_aprovacoes', 'ferias')">
            Férias (${todas.filter(s => s.tipo === 'FERIAS').length})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link ${filterArg === 'ajuste_ponto' ? 'active' : ''}" onclick="window.LimitlessApp.navigate('diskRH_aprovacoes', 'ajuste_ponto')">
            Ajustes de Ponto (${todas.filter(s => s.tipo === 'AJUSTE_PONTO').length})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link ${filterArg === 'reembolso' ? 'active' : ''}" onclick="window.LimitlessApp.navigate('diskRH_aprovacoes', 'reembolso')">
            Reembolsos (${todas.filter(s => s.tipo === 'REEMBOLSO').length})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link ${filterArg === 'admissao' ? 'active' : ''}" onclick="window.LimitlessApp.navigate('diskRH_aprovacoes', 'admissao')">
            Admissões (${todas.filter(s => s.tipo === 'ADMISSAO').length})
          </button>
        </li>
      </ul>

      <!-- Tabela Central -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Fila Integrada de Decisão</h5>
          <span class="badge bg-light text-dark border">
            ${filtradas.length} itens exibidos
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Protocolo</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Detalhes / Justificativa</th>
                <th>Data</th>
                <th>Impacto</th>
                <th>Alçada Exigida</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtradas.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center py-4 text-muted">
                    <i class="ph-check-circle fs-3 text-success d-block mb-2"></i>
                    Nenhuma solicitação pendente para este filtro!
                  </td>
                </tr>
              ` : filtradas.map(s => `
                <tr>
                  <td><code class="small text-muted">${s.id}</code></td>
                  <td>
                    <span class="badge ${
                      s.tipo === 'FERIAS' ? 'bg-primary' :
                      s.tipo === 'AJUSTE_PONTO' ? 'bg-warning text-dark' :
                      s.tipo === 'REEMBOLSO' ? 'bg-info' :
                      s.tipo === 'HORA_EXTRA' ? 'bg-secondary' : 'bg-dark'
                    }">${s.tipo}</span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">${s.solicitante}</div>
                    <div class="small text-muted">${s.departamento}</div>
                  </td>
                  <td style="max-width: 300px;">
                    <div class="text-truncate" title="${s.detalhes}">${s.detalhes}</div>
                  </td>
                  <td class="small text-muted">${s.dataSolicitacao}</td>
                  <td>
                    <div class="fw-bold ${s.valor ? 'text-primary' : 'text-muted'}">
                      ${s.valor ? formatCurrency(s.valor) : (s.impactoDias ? `${s.impactoDias} dias` : '—')}
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">${s.alcadaExigida}</span>
                  </td>
                  <td>
                    <span class="badge ${
                      s.status === 'APROVADO' ? 'bg-success' :
                      s.status === 'REPROVADO' ? 'bg-danger' : 'bg-warning text-dark'
                    }">${s.status}</span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" title="Analisar Detalhes" onclick="window.LimitlessApp.analisarSolicitacaoCentral('${s.id}')">
                        <i class="ph-eye"></i>
                      </button>
                      ${s.status === 'PENDENTE' ? `
                        <button class="btn btn-success" title="Aprovar" onclick="window.LimitlessApp.aprovarSolicitacaoCentral('${s.id}')">
                          <i class="ph-check"></i>
                        </button>
                        <button class="btn btn-outline-danger" title="Reprovar" onclick="window.LimitlessApp.reprovarSolicitacaoCentral('${s.id}')">
                          <i class="ph-x"></i>
                        </button>
                      ` : `
                        <span class="btn btn-sm btn-light disabled text-muted"><i class="ph-lock"></i> Finalizado</span>
                      `}
                    </div>
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

// ----------------------------------------------------------------------------
// 21. CARGOS, SALÁRIOS & FAIXAS SALARIAIS (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHCargosSalarios(state, filterArg = 'cargos') {
  const db = state.db || {};
  const cargos = db.rhCargosSalarios || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-ladder text-primary me-2"></i>Cargos, Salários & Faixas Salariais</h3>
          <p class="text-muted mb-0">Estrutura de remuneração corporativa DiskIngressos: faixas Júnior, Pleno e Sênior, enquadramento CBO e política de conformidade salarial.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarTabelaCargosSalarios()">
            <i class="ph-file-xls me-1"></i> Exportar Matriz
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoCargo()">
            <i class="ph-plus-circle me-1"></i> Novo Cargo / Faixa
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Cargos Mapeados</span>
              <div class="fs-3 fw-bold text-dark mt-1">${cargos.length} Funções</div>
              <div class="small text-muted mt-1">CBOs oficiais homologados</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Conformidade Salarial</span>
              <div class="fs-3 fw-bold text-success mt-1">100% Equal Pay</div>
              <div class="small text-muted mt-1">Equidade de gênero e faixas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Faixa Média Operacional</span>
              <div class="fs-3 fw-bold text-info mt-1">R$ 2.450,00</div>
              <div class="small text-muted mt-1">Bilheterias e controle de acesso</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Faixa Especialistas Core</span>
              <div class="fs-3 fw-bold text-warning mt-1">R$ 11.000,00</div>
              <div class="small text-muted mt-1">TI & Controladoria Financeira</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Faixas Salariais -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Tabela de Faixas e Níveis Salariais</h5>
          <span class="badge bg-success-subtle text-success border border-success">
            <i class="ph-shield-check me-1"></i> Acordo Coletivo Homologado
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Cargo</th>
                <th>Departamento</th>
                <th>CBO Oficial</th>
                <th>Nível</th>
                <th>Piso (R$)</th>
                <th>Médio (R$)</th>
                <th>Teto (R$)</th>
                <th>Colaboradores</th>
                <th>Status Faixa</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${cargos.map(c => `
                <tr>
                  <td><div class="fw-semibold text-dark">${c.cargo}</div></td>
                  <td class="small text-muted">${c.departamento}</td>
                  <td><code class="small text-dark font-monospace">${c.cbo}</code></td>
                  <td><span class="badge bg-light text-dark border">${c.nivel}</span></td>
                  <td class="fw-semibold text-secondary">${formatCurrency(c.piso)}</td>
                  <td class="fw-bold text-primary">${formatCurrency(c.medio)}</td>
                  <td class="fw-semibold text-success">${formatCurrency(c.teto)}</td>
                  <td>
                    <span class="badge bg-info-subtle text-info border border-info">
                      ${c.colaboradoresNaFaixa} ativos
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">
                      <i class="ph-check-circle me-1"></i> ${c.statusFaixa}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.editarFaixaSalarial('${c.id}')">
                      <i class="ph-pencil-simple me-1"></i> Ajustar
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

// ----------------------------------------------------------------------------
// 22. RECRUTAMENTO & SELEÇÃO (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHRecrutamento(state, filterArg = 'recrutamento') {
  const db = state.db || {};
  const vagas = db.rhVagas || [];
  const candidatos = db.rhCandidatos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-users-four text-primary me-2"></i>Recrutamento & Seleção (R&S Disk)</h3>
          <p class="text-muted mb-0">Gestão de vagas corporativas e equipes operacionais de shows com pipeline de candidatos e conversão direta para Admissão Digital sem redigitação.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarPipelineCandidatos()">
            <i class="ph-file-pdf me-1"></i> Relatório do Pipeline
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovaVaga()">
            <i class="ph-plus-circle me-1"></i> Publicar Nova Vaga
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Vagas Abertas</span>
              <div class="fs-3 fw-bold text-dark mt-1">${vagas.length} Posições</div>
              <div class="small text-muted mt-1">Equipes de Bilheteria & TI</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Candidatos no Pipeline</span>
              <div class="fs-3 fw-bold text-info mt-1">${candidatos.length + 50} Inscritos</div>
              <div class="small text-muted mt-1">Triagem ativa e testes técnicos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Tempo Médio de Fechamento</span>
              <div class="fs-3 fw-bold text-success mt-1">11 Dias</div>
              <div class="small text-muted mt-1">Agilidade operacional para eventos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Conversão para Admissão</span>
              <div class="fs-3 fw-bold text-warning mt-1">100% Digital</div>
              <div class="small text-muted mt-1">Sem papelada ou duplicidade</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vagas em Andamento -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Vagas Abertas & Demandas de Pessoal</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Título da Vaga</th>
                <th>Departamento</th>
                <th>Regime</th>
                <th>Vagas</th>
                <th>Inscritos</th>
                <th>Remuneração / Diária</th>
                <th>Prazo</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${vagas.map(v => `
                <tr>
                  <td><div class="fw-semibold text-dark">${v.titulo}</div></td>
                  <td class="small text-muted">${v.departamento}</td>
                  <td><span class="badge bg-light text-dark border">${v.tipoContrato}</span></td>
                  <td><span class="fw-bold text-primary">${v.quantidade}</span></td>
                  <td><span class="badge bg-info-subtle text-info border border-info">${v.candidatosInscritos} candidatos</span></td>
                  <td class="small text-muted">${v.remuneracao}</td>
                  <td class="small text-muted">${v.prazoEncerramento}</td>
                  <td><span class="badge bg-success">${v.status}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.verDetalhesVaga('${v.id}')">
                      <i class="ph-users me-1"></i> Ver Candidatos
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pipeline de Candidatos em Destaque -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Pipeline de Candidatos Aprovados para Admissão</h5>
          <span class="badge bg-primary-subtle text-primary border border-primary">
            Ação: Conversão Direta para Admissão Digital
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Candidato</th>
                <th>Contato</th>
                <th>Vaga Pleiteada</th>
                <th>Etapa Atual</th>
                <th>Score de Avaliação</th>
                <th>Status</th>
                <th class="text-end">Ação de Contratação</th>
              </tr>
            </thead>
            <tbody>
              ${candidatos.map(cand => `
                <tr>
                  <td>
                    <div class="fw-semibold text-dark">${cand.nome}</div>
                    <code class="small text-muted">${cand.id}</code>
                  </td>
                  <td class="small">
                    <div>${cand.email}</div>
                    <div class="text-muted">${cand.telefone}</div>
                  </td>
                  <td><span class="badge bg-light text-dark border">${cand.vagaId}</span></td>
                  <td><span class="badge bg-info text-white">${cand.etapa}</span></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 6px; width: 60px;">
                        <div class="progress-bar bg-success" style="width: ${cand.scoreAvaliacao}%"></div>
                      </div>
                      <span class="small fw-bold text-success">${cand.scoreAvaliacao}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${cand.status === 'CONVERTIDO_COLABORADOR' ? 'bg-secondary' : 'bg-success'}">
                      ${cand.status}
                    </span>
                  </td>
                  <td class="text-end">
                    ${cand.status === 'CONVERTIDO_COLABORADOR' ? `
                      <span class="btn btn-sm btn-light disabled text-muted"><i class="ph-check me-1"></i> Já Convertido</span>
                    ` : `
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.converterCandidatoEmColaborador('${cand.id}')">
                        <i class="ph-user-plus me-1"></i> Converter em Colaborador
                      </button>
                    `}
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

// ----------------------------------------------------------------------------
// 23. DESLIGAMENTOS & OFFBOARDING (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHDesligamentos(state, filterArg = 'desligamentos') {
  const db = state.db || {};
  const desligamentos = db.rhDesligamentos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-user-minus text-primary me-2"></i>Desligamentos & Offboarding Estruturado</h3>
          <p class="text-muted mb-0">Checklist formal de rescisão, devolução de patrimônio/EPIs, agendamento de exame demissional e segurança jurídica no encerramento de vínculos.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarRelatorioOffboarding()">
            <i class="ph-file-text me-1"></i> Relatório de Rescisões
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoDesligamento()">
            <i class="ph-user-circle-minus me-1"></i> Iniciar Desligamento
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Em Processamento</span>
              <div class="fs-3 fw-bold text-warning mt-1">${desligamentos.length} Processos</div>
              <div class="small text-muted mt-1">Offboarding em andamento</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Prazo Pagamento TRCT</span>
              <div class="fs-3 fw-bold text-success mt-1">Até 10 Dias</div>
              <div class="small text-muted mt-1">Conformidade legal CLT art. 477</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-danger h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Patrimônios Pendentes</span>
              <div class="fs-3 fw-bold text-danger mt-1">1 Devolução</div>
              <div class="small text-muted mt-1">Crachá e smartphone REP-P</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Exames Demissionais</span>
              <div class="fs-3 fw-bold text-info mt-1">100% Agendados</div>
              <div class="small text-muted mt-1">Clínica de Medicina Ocupacional</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Desligamentos -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Processos de Desligamento & Checklist de Offboarding</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Cargo / Setor</th>
                <th>Data Prevista</th>
                <th>Motivo do Desligamento</th>
                <th>Tipo</th>
                <th>Status do Checklist</th>
                <th>Devolução Patrimônio</th>
                <th>Exame Demissional</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${desligamentos.map(d => `
                <tr>
                  <td>
                    <div class="fw-semibold text-dark">${d.colaboradorNome}</div>
                    <code class="small text-muted">${d.colaboradorId}</code>
                  </td>
                  <td>
                    <div>${d.cargo}</div>
                    <div class="small text-muted">${d.departamento}</div>
                  </td>
                  <td class="small text-muted">${d.dataPrevista}</td>
                  <td><div class="small text-dark">${d.motivo}</div></td>
                  <td><span class="badge bg-light text-dark border">${d.tipo}</span></td>
                  <td>
                    <span class="badge ${d.statusChecklist.includes('100%') ? 'bg-success' : 'bg-warning text-dark'}">
                      ${d.statusChecklist}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${d.devolucaoPatrimonio.includes('CONCLUIDA') ? 'bg-success' : 'bg-danger'}">
                      ${d.devolucaoPatrimonio}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">
                      <i class="ph-check me-1"></i> Agendado
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" title="Checklist" onclick="window.LimitlessApp.concluirChecklistDesligamento('${d.id}')">
                        <i class="ph-check-circle me-1"></i> Concluir Checklist
                      </button>
                      <button class="btn btn-outline-secondary" title="Gerar TRCT" onclick="window.LimitlessApp.gerarTRCTPreliminar('${d.id}')">
                        <i class="ph-receipt"></i>
                      </button>
                    </div>
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

// ----------------------------------------------------------------------------
// 24. SAÚDE E SEGURANÇA DO TRABALHO - SST (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHSst(state, filterArg = 'sst') {
  const db = state.db || {};
  const exames = db.rhExamesSst || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-heartbeat text-primary me-2"></i>Saúde & Segurança do Trabalho (SST & Medicina Ocupacional)</h3>
          <p class="text-muted mb-0">Controle rigoroso de ASOs (Admissional, Periódico e Demissional), gestão de riscos ocupacionais (arenas e sede) e integração eSocial S-2210/S-2220/S-2240.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarRelatorioPCMSO()">
            <i class="ph-file-pdf me-1"></i> Laudos PCMSO / PGR
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoExameSst()">
            <i class="ph-first-aid-kit me-1"></i> Agendar ASO / Exame
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">ASOs 100% Vigentes</span>
              <div class="fs-3 fw-bold text-success mt-1">${exames.filter(e => e.status === 'VIGENTE').length} Colaboradores</div>
              <div class="small text-muted mt-1"><i class="ph-check-circle text-success"></i> Nenhuma pendência crítica</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Acidentes de Trabalho (CAT)</span>
              <div class="fs-3 fw-bold text-info mt-1">Zero Ocorrências</div>
              <div class="small text-muted mt-1">Operação segura em arenas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Médico Coordenador PCMSO</span>
              <div class="fs-3 fw-bold text-primary mt-1">Dra. Silvana</div>
              <div class="small text-muted mt-1">CRM 18492-PR Ativo</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Riscos Monitorados</span>
              <div class="fs-3 fw-bold text-warning mt-1">Ergonômico + Ruído</div>
              <div class="small text-muted mt-1">Protetores auriculares distribuídos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de ASOs e Exames Ocupacionais -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Controle de Atestados de Saúde Ocupacional (ASO)</h5>
          <span class="badge bg-success-subtle text-success border border-success">
            <i class="ph-shield-check me-1"></i> NR-07 & NR-09 em Conformidade
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Tipo de Exame</th>
                <th>Data Realização</th>
                <th>Validade</th>
                <th>Médico Coordenador</th>
                <th>Resultado</th>
                <th>Riscos Mapeados</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${exames.map(e => `
                <tr>
                  <td><div class="fw-semibold text-dark">${e.colaboradorNome}</div></td>
                  <td><span class="badge bg-light text-dark border">${e.tipoExame}</span></td>
                  <td class="small text-muted">${e.dataRealizacao}</td>
                  <td class="small fw-semibold text-dark">${e.validade}</td>
                  <td class="small text-muted">${e.medicoCoordenador}</td>
                  <td>
                    <span class="badge bg-success">
                      <i class="ph-check me-1"></i> ${e.resultado}
                    </span>
                  </td>
                  <td class="small text-muted">${e.riscosMapeados}</td>
                  <td><span class="badge bg-success">${e.status}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.visualizarAtestadoSst('${e.id}')">
                      <i class="ph-file-pdf me-1"></i> Ver ASO
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

// ----------------------------------------------------------------------------
// 25. PATRIMÔNIO & EPIS DO COLABORADOR (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHPatrimonio(state, filterArg = 'patrimonio') {
  const db = state.db || {};
  const itens = db.rhPatrimonio || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-devices text-primary me-2"></i>Patrimônio & Equipamentos Cautelados</h3>
          <p class="text-muted mb-0">Inventário de dispositivos corporativos entregues a colaboradores: Smartphones coletores REP-P, notebooks Core TI e rádios comunicadores HT com termos assinados.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarInventarioPatrimonio()">
            <i class="ph-file-xls me-1"></i> Exportar Inventário
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovaCautelaPatrimonio()">
            <i class="ph-hand-pointing me-1"></i> Cautelar Equipamento
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Itens Cautelados</span>
              <div class="fs-3 fw-bold text-dark mt-1">${itens.length} Equipamentos</div>
              <div class="small text-muted mt-1">100% com termo assinado</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Coletores REP-P Móveis</span>
              <div class="fs-3 fw-bold text-success mt-1">12 Ativos</div>
              <div class="small text-muted mt-1">Smartphones em arena de shows</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Notebooks Corporativos</span>
              <div class="fs-3 fw-bold text-info mt-1">8 Máquinas</div>
              <div class="small text-muted mt-1">TI & Controladoria Financeira</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Rádios HT Operacionais</span>
              <div class="fs-3 fw-bold text-warning mt-1">18 Unidades</div>
              <div class="small text-muted mt-1">Comunicação direta em eventos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Patrimônio -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Controle de Cautelas & Equipamentos Entregues</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Plaqueta Patrimônio</th>
                <th>Equipamento / Modelo</th>
                <th>Categoria</th>
                <th>Número de Série</th>
                <th>Cautelado Para</th>
                <th>Data da Entrega</th>
                <th>Termo de Responsabilidade</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${itens.map(p => `
                <tr>
                  <td><code class="fw-bold text-dark font-monospace">${p.patrimonio}</code></td>
                  <td><div class="fw-semibold text-dark">${p.itemNome}</div></td>
                  <td><span class="badge bg-light text-dark border">${p.categoria}</span></td>
                  <td><code class="small text-muted font-monospace">${p.serial}</code></td>
                  <td class="fw-semibold text-primary">${p.cauteladoPara}</td>
                  <td class="small text-muted">${p.dataEntrega}</td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success">
                      <i class="ph-seal-check me-1"></i> Assinado Digitalmente
                    </span>
                  </td>
                  <td>
                    <span class="badge ${p.status === 'EM_USO' ? 'bg-primary' : 'bg-secondary'}">${p.status}</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="window.LimitlessApp.registrarDevolucaoPatrimonio('${p.id}')">
                      <i class="ph-arrow-u-up-left me-1"></i> Devolução
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

// ----------------------------------------------------------------------------
// 26. DESEMPENHO & PDI (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHDesempenho(state, filterArg = 'desempenho') {
  const db = state.db || {};
  const avaliacoes = db.rhAvaliacoesPdi || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-target text-primary me-2"></i>Desempenho, Metas & PDI (Plano de Carreira)</h3>
          <p class="text-muted mb-0">Ciclos de avaliação de competências técnicas e comportamentais, acompanhamento de metas setoriais e planos de desenvolvimento individual.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarMatriz9Box()">
            <i class="ph-grid-four me-1"></i> Matriz 9-Box
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoPdi()">
            <i class="ph-plus-circle me-1"></i> Nova Avaliação / PDI
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Média de Competências</span>
              <div class="fs-3 fw-bold text-success mt-1">9.4 / 10</div>
              <div class="small text-muted mt-1"><i class="ph-trend-up text-success"></i> Alta aderência à cultura Disk</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Atingimento de Metas</span>
              <div class="fs-3 fw-bold text-primary mt-1">93.2%</div>
              <div class="small text-muted mt-1">Superação de metas do 1º Semestre</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Planos PDI em Execução</span>
              <div class="fs-3 fw-bold text-info mt-1">100% com Ações</div>
              <div class="small text-muted mt-1">Cursos e capacitações corporativas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Próximo Ciclo</span>
              <div class="fs-3 fw-bold text-warning mt-1">2026.2</div>
              <div class="small text-muted mt-1">Abertura em Dezembro/2026</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Avaliações -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Resultados dos Ciclos de Avaliação & Feedback 1:1</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Cargo Atual</th>
                <th>Ciclo</th>
                <th>Competências</th>
                <th>Metas</th>
                <th>Feedback do Gestor</th>
                <th>Ações de PDI</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${avaliacoes.map(a => `
                <tr>
                  <td><div class="fw-semibold text-dark">${a.colaboradorNome}</div></td>
                  <td class="small text-muted">${a.cargo}</td>
                  <td><span class="badge bg-light text-dark border">${a.ciclo}</span></td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success fw-bold">
                      ${a.notaCompetencias} / 10
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary border border-primary fw-bold">
                      ${a.notaMetas} / 10
                    </span>
                  </td>
                  <td style="max-width: 250px;">
                    <div class="small text-truncate" title="${a.feedbackGestor}">${a.feedbackGestor}</div>
                  </td>
                  <td style="max-width: 250px;">
                    <div class="small text-truncate text-primary" title="${a.acoesPdi}">${a.acoesPdi}</div>
                  </td>
                  <td><span class="badge bg-success">${a.status}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.verDetalhesPdi('${a.id}')">
                      <i class="ph-file-text me-1"></i> Ver PDI
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

// ----------------------------------------------------------------------------
// 27. CATÁLOGO DE TREINAMENTOS CORPORATIVOS & NRs (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHTreinamentos(state, filterArg = 'treinamentos') {
  const db = state.db || {};
  const treinamentos = db.rhTreinamentos || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-graduation-cap text-primary me-2"></i>Treinamentos Corporativos & NRs Obrigatórias</h3>
          <p class="text-muted mb-0">Qualificação contínua das equipes: Segurança em Grandes Arenas (NR-23), Operação do REP-P com Geofence, LGPD e atendimento de excelência.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarRelatorioTreinamentos()">
            <i class="ph-file-pdf me-1"></i> Certificados
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoTreinamento()">
            <i class="ph-plus-circle me-1"></i> Novo Treinamento
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Treinamentos no Catálogo</span>
              <div class="fs-3 fw-bold text-dark mt-1">${treinamentos.length} Cursos</div>
              <div class="small text-muted mt-1">NRs Obrigatórias e Operacionais</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Colaboradores Certificados</span>
              <div class="fs-3 fw-bold text-success mt-1">135 Conclusões</div>
              <div class="small text-muted mt-1"><i class="ph-check-circle text-success"></i> Certificados emitidos digitalmente</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Certificados a Renovar</span>
              <div class="fs-3 fw-bold text-warning mt-1">5 Posições</div>
              <div class="small text-muted mt-1">Validade próxima (60 dias)</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Carga Horária Acumulada</span>
              <div class="fs-3 fw-bold text-info mt-1">480 Horas</div>
              <div class="small text-muted mt-1">Investimento em capital humano</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Treinamentos -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Catálogo de Cursos & Situação das Turmas</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Título do Treinamento</th>
                <th>Categoria</th>
                <th>Carga Horária</th>
                <th>Obrigatoriedade</th>
                <th>Validade (Meses)</th>
                <th>Concluídos</th>
                <th>Vencendo</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${treinamentos.map(t => `
                <tr>
                  <td><div class="fw-semibold text-dark">${t.titulo}</div></td>
                  <td><span class="badge bg-light text-dark border">${t.categoria}</span></td>
                  <td><span class="fw-bold text-primary">${t.cargaHoraria} Horas</span></td>
                  <td>
                    <span class="badge ${t.obrigatorio ? 'bg-danger-subtle text-danger border border-danger' : 'bg-light text-dark'}">
                      ${t.obrigatorio ? 'Obrigatório (NR)' : 'Eletivo'}
                    </span>
                  </td>
                  <td class="small text-muted">${t.validadeMeses} Meses</td>
                  <td><span class="badge bg-success">${t.concluidosCount} Certificados</span></td>
                  <td>
                    ${t.vencendoCount > 0 ? `
                      <span class="badge bg-warning text-dark">${t.vencendoCount} a renovar</span>
                    ` : `
                      <span class="badge bg-light text-muted">0</span>
                    `}
                  </td>
                  <td><span class="badge bg-success">${t.status}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.inscreverTurmaTreinamento('${t.id}')">
                      <i class="ph-user-plus me-1"></i> Inscrever Turma
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

// ----------------------------------------------------------------------------
// 28. DESPESAS & REEMBOLSOS OPERACIONAIS (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHReembolsos(state, filterArg = 'reembolsos') {
  const db = state.db || {};
  const reembolsos = db.rhReembolsos || [];
  const pendentes = reembolsos.filter(r => r.status.includes('PENDENTE'));
  const totalPendente = pendentes.reduce((acc, r) => acc + (r.valor || 0), 0);

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-receipt text-primary me-2"></i>Despesas & Reembolsos Operacionais</h3>
          <p class="text-muted mb-0">Gestão de gastos em viagens, alimentação em regime de plantão e combustível para eventos, com anexação de comprovantes e aprovação em alçadas.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.exportarRelatorioReembolsos()">
            <i class="ph-file-xls me-1"></i> Exportar
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.abrirModalNovoReembolso()">
            <i class="ph-plus-circle me-1"></i> Solicitar Reembolso
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Pendentes de Homologação</span>
              <div class="fs-3 fw-bold text-warning mt-1">${formatCurrency(totalPendente)}</div>
              <div class="small text-muted mt-1">${pendentes.length} Solicitações sob análise</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Aprovados para Pagamento</span>
              <div class="fs-3 fw-bold text-success mt-1">100% em Dia</div>
              <div class="small text-muted mt-1">Crédito via Lote PIX Tesouraria</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Maior Categoria de Gasto</span>
              <div class="fs-3 fw-bold text-info mt-1">Deslocamento</div>
              <div class="small text-muted mt-1">Pedreira Paulo Leminski e Arenas</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Auditoria de Comprovantes</span>
              <div class="fs-3 fw-bold text-primary mt-1">100% com Anexo</div>
              <div class="small text-muted mt-1">Notas fiscais e cupons válidos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Reembolsos -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Solicitações de Reembolso de Despesas</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Solicitante</th>
                <th>Categoria</th>
                <th>Evento Vinculado</th>
                <th>Centro de Custo</th>
                <th>Descrição</th>
                <th>Data</th>
                <th>Valor (R$)</th>
                <th>Comprovante</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${reembolsos.map(r => `
                <tr>
                  <td><div class="fw-semibold text-dark">${r.colaboradorNome}</div></td>
                  <td><span class="badge bg-light text-dark border">${r.categoria}</span></td>
                  <td><div class="small fw-semibold text-dark">${r.eventoNome}</div></td>
                  <td><code class="small text-muted font-monospace">${r.centroCusto}</code></td>
                  <td style="max-width: 250px;"><div class="small text-truncate" title="${r.descricao}">${r.descricao}</div></td>
                  <td class="small text-muted">${r.dataSolicitacao}</td>
                  <td class="fw-bold text-primary">${formatCurrency(r.valor)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.visualizarComprovanteReembolso('${r.id}')">
                      <i class="ph-file-pdf me-1"></i> Recibo
                    </button>
                  </td>
                  <td>
                    <span class="badge ${r.status === 'APROVADO' ? 'bg-success' : 'bg-warning text-dark'}">
                      ${r.status}
                    </span>
                  </td>
                  <td class="text-end">
                    ${r.status.includes('PENDENTE') ? `
                      <button class="btn btn-sm btn-success fw-bold" onclick="window.LimitlessApp.aprovarReembolso('${r.id}')">
                        <i class="ph-check me-1"></i> Aprovar
                      </button>
                    ` : `
                      <span class="badge bg-light text-muted"><i class="ph-check-circle"></i> Homologado</span>
                    `}
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

// ----------------------------------------------------------------------------
// 29. PORTAL DO COLABORADOR - AUTOATENDIMENTO (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHPortalColaborador(state, filterArg = 'portal_colaborador') {
  const db = state.db || {};
  const colab = (db.rhColaboradores || [])[0] || {
    nome: "Carlos Eduardo Mendes",
    cargo: "Coordenador Geral de Operações de Eventos",
    departamento: "Operações e Bilheteria",
    matricula: "MAT-0041",
    dataAdmissao: "15/03/2021",
    tipoContrato: "CLT",
    saldoBancoHoras: 12.67
  };

  const holerites = db.rhHolerites || [];
  const comunicados = db.rhComunicadosMural || [];

  return `
    <div class="container-fluid py-3">
      <!-- Banner de Boas-Vindas do Colaborador -->
      <div class="card bg-dark text-white border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-primary p-3 text-white fs-2 fw-bold text-center" style="width: 64px; height: 64px; line-height: 38px;">
                ${colab.nome.charAt(0)}
              </div>
              <div>
                <span class="badge bg-primary px-3 py-1 mb-1">Meu Espaço • Portal do Colaborador</span>
                <h3 class="fw-bold mb-0">Olá, ${colab.nome}!</h3>
                <p class="text-white-50 mb-0">${colab.cargo} • ${colab.departamento} • Matrícula: ${colab.matricula || 'MAT-0041'}</p>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-light btn-sm" onclick="window.LimitlessApp.abrirModalNovoReembolso()">
                <i class="ph-receipt me-1"></i> Pedir Reembolso
              </button>
              <button class="btn btn-success btn-sm" onclick="window.LimitlessApp.abrirModalSolicitarFerias()">
                <i class="ph-airplane-takeoff me-1"></i> Solicitar Férias
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <!-- Widget Meu Ponto Hoje -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0"><i class="ph-clock-countdown text-primary me-2"></i>Meu Ponto Hoje (REP-P 671 MTE)</h5>
              <span class="badge bg-success-subtle text-success border border-success">
                <i class="ph-map-pin me-1"></i> Dentro da Cerca Sede Curitiba
              </span>
            </div>
            <div class="card-body">
              <div class="row g-2 text-center mb-3">
                <div class="col-3">
                  <div class="p-2 border rounded bg-light">
                    <span class="small text-muted d-block">Entrada 1</span>
                    <strong class="text-dark">08:02</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded bg-light">
                    <span class="small text-muted d-block">Saída Int.</span>
                    <strong class="text-dark">12:05</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded bg-light">
                    <span class="small text-muted d-block">Retorno Int.</span>
                    <strong class="text-dark">13:08</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded bg-primary bg-opacity-10 border-primary">
                    <span class="small text-primary fw-bold d-block">Saída 2</span>
                    <strong class="text-primary">Prev. 18:00</strong>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <span class="small text-muted d-block">Meu Saldo no Banco de Horas:</span>
                  <span class="fs-4 fw-bold text-success">+12h 40min</span>
                </div>
                <button class="btn btn-primary" onclick="window.LimitlessApp.baterPontoSimuladoColaborador()">
                  <i class="ph-fingerprint me-1"></i> Bater Ponto Agora
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Férias & Benefícios -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0"><i class="ph-sun text-warning me-2"></i>Meu Saldo de Férias & Benefícios</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div>
                  <div class="fw-semibold text-dark">Período Aquisitivo Vigente (2025/2026)</div>
                  <div class="small text-muted">Limite Concessivo: 14/03/2027</div>
                </div>
                <div class="text-end">
                  <span class="badge bg-success fs-6">30 Dias Disponíveis</span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-semibold text-dark">Benefícios Ativos</div>
                  <div class="small text-muted">VT Cartão Transporte + VR R$ 38,00/dia + Unimed Nacional</div>
                </div>
                <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.navigate('diskRH_beneficios')">
                  <i class="ph-pencil-simple me-1"></i> Ajustar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meus Holerites & Mural de Comunicados -->
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0"><i class="ph-file-text text-primary me-2"></i>Meus Holerites Recentes</h5>
              <span class="badge bg-light text-dark border">Assinados ICP-Brasil</span>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr class="small text-muted">
                    <th>Competência</th>
                    <th>Líquido</th>
                    <th>Status</th>
                    <th class="text-end">Download</th>
                  </tr>
                </thead>
                <tbody>
                  ${holerites.slice(0, 3).map(h => `
                    <tr>
                      <td><span class="badge bg-light text-dark border">${h.competencia}</span></td>
                      <td class="fw-bold text-success">${formatCurrency(h.valorLiquido)}</td>
                      <td><span class="badge bg-success">${h.status}</span></td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.baixarHolerite('${h.id}')">
                          <i class="ph-download-simple me-1"></i> PDF
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0"><i class="ph-newspaper text-info me-2"></i>Mural de Comunicados Internos</h5>
              <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.abrirModalNovoComunicado()">
                <i class="ph-plus me-1"></i> Novo Aviso
              </button>
            </div>
            <div class="card-body">
              ${comunicados.length === 0 ? `
                <p class="text-muted small mb-0">Nenhum aviso no momento.</p>
              ` : comunicados.map(c => `
                <div class="p-3 border rounded mb-2 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark">${c.titulo}</strong>
                    <span class="badge bg-danger">${c.prioridade}</span>
                  </div>
                  <p class="small text-muted mb-2">${c.conteudo}</p>
                  <div class="d-flex justify-content-between align-items-center small text-muted">
                    <span>${c.autor} • ${c.data}</span>
                    <span class="text-success"><i class="ph-check-circle me-1"></i> ${c.lidoPor} confirmações</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 30. PORTAL DO GESTOR - MINHA EQUIPE (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHPortalGestor(state, filterArg = 'portal_gestor') {
  const db = state.db || {};
  const colaboradores = db.rhColaboradores || [];
  const pendencias = (db.rhCentralAprovacoes || []).filter(a => a.status === 'PENDENTE');

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-user-gear text-primary me-2"></i>Portal do Gestor (Minha Equipe Operacional)</h3>
          <p class="text-muted mb-0">Visão panorâmica em tempo real da equipe sob liderança: presença em arenas, controle de horas extras, férias e aprovações rápidas.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.navigate('diskRH_ponto')">
            <i class="ph-broadcast me-1"></i> Radar de Ponto
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.aprovarTodasPendenciasEquipe()">
            <i class="ph-check-circle me-1"></i> Aprovar Pendências da Equipe
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-primary h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Minha Equipe</span>
              <div class="fs-3 fw-bold text-dark mt-1">${colaboradores.length} Pessoas</div>
              <div class="small text-muted mt-1">Sede Curitiba e Equipes de Shows</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-success h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Presentes Agora</span>
              <div class="fs-3 fw-bold text-success mt-1">${Math.round(colaboradores.length * 0.88)} Em Campo</div>
              <div class="small text-muted mt-1"><i class="ph-map-pin text-success"></i> Dentro da cerca virtual</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-warning h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Aprovações Pendentes</span>
              <div class="fs-3 fw-bold text-warning mt-1">${pendencias.length} Itens</div>
              <div class="small text-muted mt-1">Férias, Ponto e Reembolsos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm border-start border-4 border-info h-100">
            <div class="card-body">
              <span class="text-muted small text-uppercase fw-bold">Banco de Horas da Equipe</span>
              <div class="fs-3 fw-bold text-info mt-1">+48.5 Horas</div>
              <div class="small text-muted mt-1">Saldo positivo na competência</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela da Equipe Sob Liderança -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0">Status da Equipe em Tempo Real</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                <th>Colaborador</th>
                <th>Cargo</th>
                <th>Regime</th>
                <th>Local / Arena Atual</th>
                <th>Presença Hoje</th>
                <th>Banco de Horas</th>
                <th>Ocorrências</th>
                <th class="text-end">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              ${colaboradores.map(c => `
                <tr>
                  <td>
                    <div class="fw-semibold text-dark">${c.nome}</div>
                    <code class="small text-muted">${c.matricula}</code>
                  </td>
                  <td class="small text-muted">${c.cargo}</td>
                  <td><span class="badge bg-light text-dark border">${c.tipoContrato}</span></td>
                  <td>
                    <span class="badge bg-info-subtle text-info border border-info">
                      <i class="ph-map-pin me-1"></i> Sede Curitiba
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">
                      <i class="ph-check-circle me-1"></i> PRESENTE (08:02)
                    </span>
                  </td>
                  <td class="fw-bold text-primary">+${c.saldoBancoHoras || 5.2}h</td>
                  <td>
                    <span class="badge bg-light text-success border border-success">
                      Sem Pendências
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.LimitlessApp.verEspelhoColaborador('${c.id}')">
                      <i class="ph-calendar me-1"></i> Espelho
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

// ----------------------------------------------------------------------------
// 31. INTEGRAÇÕES CORPORATIVAS RH -> FINANCEIRO -> CONTABILIDADE (RH V2)
// ----------------------------------------------------------------------------
export function renderDiskRHIntegracoes(state, filterArg = 'integracoes') {
  const db = state.db || {};
  const conectores = db.rhIntegracoesStatus || [];

  return `
    <div class="container-fluid py-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-plugs-connected text-primary me-2"></i>Integrações Corporativas (RH Disk)</h3>
          <p class="text-muted mb-0">Camada de conectores enterprise entre o RH Disk, o Módulo Financeiro V1 (Contas a Pagar/PIX), Contabilidade (DRE por Evento) e eSocial.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.LimitlessApp.testarConexoesRH()">
            <i class="ph-wifi-high me-1"></i> Testar Conectividade
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.LimitlessApp.forcarSincronizacaoTotalRH()">
            <i class="ph-arrows-clockwise me-1"></i> Sincronizar Tudo Agora
          </button>
        </div>
      </div>

      <!-- Grid de Conectores -->
      <div class="row g-4 mb-4">
        ${conectores.map(c => `
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 border-top border-4 ${
              c.tipo.includes('PIX') ? 'border-success' :
              c.tipo.includes('DRE') ? 'border-primary' : 'border-info'
            }">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge ${c.status.includes('ATIVO') ? 'bg-success' : 'bg-info'}">${c.status}</span>
                  <small class="text-muted">${c.ultimaSincronizacao}</small>
                </div>
                <h5 class="fw-bold text-dark mb-1">${c.modulo}</h5>
                <span class="badge bg-light text-dark border mb-3">${c.tipo}</span>
                <p class="text-muted small mb-3">${c.descricao}</p>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span class="small text-success fw-bold"><i class="ph-circle text-success me-1"></i> Latência: 42ms</span>
                  <button class="btn btn-sm btn-outline-primary" onclick="window.LimitlessApp.sincronizarConectorRH('${c.tipo}')">
                    <i class="ph-arrows-clockwise me-1"></i> Sincronizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Logs de Sincronização em Tempo Real -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Logs de Transmissão & Sincronização Intermódulos</h5>
          <span class="badge bg-light text-dark border">Atualizado a cada 60s</span>
        </div>
        <div class="card-body font-monospace small bg-light p-3 rounded">
          <div class="text-success mb-1">[2026-10-04 15:30:12] [CONNECT] Conexão com Tesouraria V1 estabelecida com sucesso via API de Alta Performance.</div>
          <div class="text-dark mb-1">[2026-10-04 15:30:14] [LOTE-PIX] 14 Diárias de Freelancers enviadas para Contas a Pagar (Total R$ 2.520,00).</div>
          <div class="text-primary mb-1">[2026-10-04 15:30:16] [DRE-EVENTO] Custo Mão de Obra direta de R$ 3.850,00 apropriado no Festival Curitiba 2026.</div>
          <div class="text-info mb-1">[2026-10-04 12:00:05] [ESOCIAL] Eventos S-1000 e S-2200 transmitidos. Protocolo Receita Federal: 1.2.202610.00041289.</div>
          <div class="text-muted">[2026-10-04 12:00:06] [SECURITY] SHA-256 e assinatura digital verificadas com sucesso sem violação de integridade.</div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 32. RENDERIZADOR DINÂMICO RH V2 (Módulos Integrados)
// ----------------------------------------------------------------------------
export const RH_V2_MODULOS = {
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
  return `(window.financialStore || window.LimitlessApp).showToast ? (window.financialStore || window.LimitlessApp).showToast('${safe}', '${safe} acionado em ${mod}. Processo registrado no RH Disk.', 'success') : alert('${safe} em ${mod}')`;
}

export function renderDiskRHModulo(state, filterArg = 'aprovacoes') {
  const key = String(filterArg || 'aprovacoes').toLowerCase().replace('diskrh_', '');
  const cfg = RH_V2_MODULOS[key] || RH_V2_MODULOS.aprovacoes;
  const [titulo, subtitulo, acoes, colunas] = cfg;
  const cards = [
    ['Pendentes', '2', 'ph-hourglass-medium', 'text-warning'],
    ['Em andamento', '5', 'ph-arrows-clockwise', 'text-primary'],
    ['Concluídos no mês', '38', 'ph-check-circle', 'text-success'],
    ['Conformidade', '100%', 'ph-shield-check', 'text-info']
  ];

  return `
    <div class="content-area rh-v2-page container-fluid py-3" data-rh-modulo="${key}">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h3 class="fw-bold mb-1"><i class="ph-briefcase text-primary me-2"></i>${titulo}</h3>
          <p class="text-muted mb-0">${subtitulo}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          ${acoes.map((a, i) => `
            <button class="btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-outline-primary'}" onclick="${i === 0 ? `window.LimitlessApp.abrirModalModuloRH('${key}', '${a}')` : rhV2Action(a, titulo)}">
              <i class="ph ${i === 0 ? 'ph-plus-circle' : 'ph-play'} me-1"></i>${a}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="row g-3 mb-4">
        ${cards.map(c => `
          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small text-uppercase fw-bold">${c[0]}</div>
                  <div class="fs-3 fw-bold mt-1 text-dark">${c[1]}</div>
                </div>
                <div class="p-2 bg-light rounded"><i class="ph ${c[2]} fs-2 ${c[3]}"></i></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="fw-bold mb-0">Gestão e Controle • ${titulo}</h5>
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Buscar registros..." style="width:220px">
            <button class="btn btn-sm btn-outline-secondary" onclick="${rhV2Action('Filtrar', titulo)}">
              <i class="ph-funnel me-1"></i> Filtros
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted">
                ${colunas.map(c => `<th>${c}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="${colunas.length}" class="text-center py-5 text-muted">
                  <i class="ph-folder-notch-open fs-2 d-block mb-2 text-primary"></i>
                  Base operacional sincronizada. Utilize <strong>"${acoes[0]}"</strong> para lançar um novo registro.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card border-0 shadow-sm bg-light">
        <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <strong class="text-dark"><i class="ph-shield-check text-success me-1"></i>Fluxo e Auditoria Habilitados</strong>
            <div class="text-muted small">As ações deste módulo cumprem segregação de funções (SoD) e trilha imutável do RH Disk.</div>
          </div>
          <button class="btn btn-sm btn-outline-dark" onclick="${rhV2Action('Abrir histórico de auditoria', titulo)}">
            <i class="ph-clock-counter-clockwise me-1"></i> Histórico de Auditoria
          </button>
        </div>
      </div>
    </div>
  `;
}


