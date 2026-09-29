/**
 * Pacote 3 — Gateways, Adquirentes, Bandeiras, MDR, Parcelamento, Regras Comerciais e Conciliação
 * Camada Restrita do Financeiro Disk (Backoffice & Mesa Operacional)
 * 
 * Regra Arquitetural:
 * MDR e custos negociados com adquirentes pertencem exclusivamente ao Financeiro Disk.
 * O Produtor tem acesso apenas às taxas comerciais contratadas, nunca ao custo de interchange interno da Disk.
 */
import { formatCurrency, formatPercent } from '../../formatters.js';

export const bandeirasMatriz = [
  { id: 'visa', nome: 'Visa', debito: '0,82%', credito1x: '1,62%', parc2a6: '1,89%', parc7a12: '2,18%', produtor: '2,95%', cliente: 'Configurável (Tabela Própria)', margemMedia: '+1,33%' },
  { id: 'mastercard', nome: 'Mastercard', debito: '0,84%', credito1x: '1,65%', parc2a6: '1,92%', parc7a12: '2,22%', produtor: '2,95%', cliente: 'Configurável (Tabela Própria)', margemMedia: '+1,30%' },
  { id: 'elo', nome: 'Elo', debito: '0,91%', credito1x: '1,74%', parc2a6: '2,02%', parc7a12: '2,31%', produtor: '3,10%', cliente: 'Configurável (Tabela Própria)', margemMedia: '+1,36%' },
  { id: 'amex', nome: 'American Express', debito: '—', credito1x: '2,10%', parc2a6: '2,42%', parc7a12: '2,78%', produtor: '3,45%', cliente: 'Configurável (Tabela Própria)', margemMedia: '+1,35%' },
  { id: 'pix', nome: 'PIX (Banco Central)', debito: '0,49%', credito1x: '—', parc2a6: '—', parc7a12: '—', produtor: '1,20%', cliente: 'Sem acréscimo', margemMedia: '+0,71%' }
];

export function renderDiskGateways(state, currentFilter = 'all') {
  const gateways = state.data.gateways || [];
  const totalVolume = gateways.reduce((s, g) => s + (g.totalVolumeProcessed || 0), 0);
  const activeGateways = gateways.filter(g => !g.status.includes('Backup')).length;

  return `
    <!-- Header Corporativo Limitless -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6;">
      <div class="breadcrumbs" style="color: #94a3b8;">
        <span>Financeiro Disk</span>
        <span class="breadcrumb-separator">/</span>
        <span>Adquirência & Operação</span>
        <span class="breadcrumb-separator">/</span>
        <span style="color: #60a5fa; font-weight: 600;">Gateways, Adquirentes & MDR (Pacote 3)</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1 style="color: #f8fafc; display: flex; align-items: center; gap: 8px;">
            <i class="ph-credit-card text-primary"></i>
            Gateways, Adquirentes, Bandeiras & MDR
          </h1>
          <p class="page-title-desc" style="color: #94a3b8;">
            Gestão interna de adquirentes, matriz de interchange MDR, parcelamento, motor de regra comercial, spread e liquidações.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-light btn-sm d-flex align-items-center gap-1" onclick="window.app.navigate('diskConciliacao')">
            <i class="ph-arrows-left-right"></i> Conciliação
          </button>
          <button class="btn btn-primary btn-sm d-flex align-items-center gap-1" onclick="alert('Cadastro de Adquirente/Gateway homologado via API Disk.')">
            <i class="ph-plus-circle"></i> Nova Adquirente
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Alerta Estrito de Sensibilidade e Governança Comercial -->
      <div class="info-banner info-banner-amber d-flex align-items-center gap-3 mb-4" style="border-left-width: 4px; box-shadow: var(--shadow-sm);">
        <i class="ph-shield-warning fs-3 text-warning flex-shrink-0"></i>
        <div style="flex: 1;">
          <strong class="d-block text-warning-emphasis fs-sm mb-1">
            Informação Estritamente Interna &bull; Mesa Financeira Disk
          </strong>
          <span class="fs-xs" style="color: #78350f;">
            Os custos de interchange (MDR) negociados diretamente com as adquirentes (Cielo, Rede, Stone), bem como as margens de spread apuradas, são dados internos restritos. O Portal do Produtor visualiza unicamente a taxa comercial parametrizada para seus eventos, sem qualquer visibilidade das margens brutas da adquirente.
          </span>
        </div>
      </div>

      <!-- KPIs Operacionais do Pacote 3 -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card-panel h-100">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fs-xs fw-semibold text-uppercase">Adquirentes Ativas</div>
                  <div class="fs-3 fw-bold mt-1 text-primary">${activeGateways} <span class="fs-xs fw-normal text-muted">/ ${gateways.length} cadastradas</span></div>
                  <div class="text-success fs-xxs mt-1 fw-bold"><i class="ph-check-circle"></i> Roteamento Ativo & Failover</div>
                </div>
                <div class="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                  <i class="ph-buildings fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card-panel h-100">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fs-xs fw-semibold text-uppercase">Volume Processado</div>
                  <div class="fs-3 fw-bold mt-1 text-dark">${formatCurrency(totalVolume)}</div>
                  <div class="text-muted fs-xxs mt-1">Transações capturadas no período</div>
                </div>
                <div class="p-2 bg-success bg-opacity-10 text-success rounded-3">
                  <i class="ph-chart-line-up fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card-panel h-100">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fs-xs fw-semibold text-uppercase">Spread Médio Disk</div>
                  <div class="fs-3 fw-bold mt-1" style="color: #2563eb;">+1,22%</div>
                  <div class="text-muted fs-xxs mt-1">Margem bruta sobre faturamento</div>
                </div>
                <div class="p-2 bg-info bg-opacity-10 text-info rounded-3">
                  <i class="ph-percent fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card-panel h-100">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fs-xs fw-semibold text-uppercase">Conciliação Adquirente</div>
                  <div class="fs-3 fw-bold mt-1 text-success">100%</div>
                  <div class="text-success fs-xxs mt-1 fw-bold"><i class="ph-shield-check"></i> 0 Divergências em Aberto</div>
                </div>
                <div class="p-2 bg-success bg-opacity-10 text-success rounded-3">
                  <i class="ph-check-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 1: ADQUIRENTES, GATEWAYS & ROTEAMENTO -->
      <div class="card-panel mb-4" id="section-gateways">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>1. Adquirentes, Gateways & Roteamento Efetivo</h2>
            <p class="card-subtitle">Contratos de captura, taxas negociadas pela Disk, share de roteamento e contingência.</p>
          </div>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Adquirente / Gateway</th>
                  <th>MDR Crédito 1x</th>
                  <th>MDR Débito</th>
                  <th>MDR PIX</th>
                  <th>Spread Disk Médio</th>
                  <th>Share de Volume</th>
                  <th class="text-end">Volume Processado</th>
                  <th>Status Operacional</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${gateways.map(g => `
                  <tr>
                    <td>
                      <div class="fw-bold text-main fs-sm">${g.name}</div>
                      <div class="text-muted fs-xxs">ID: ${g.id} &bull; Protocolo Antifraude Ativo</div>
                    </td>
                    <td class="fw-bold text-dark">${g.mdrCredit}</td>
                    <td class="fw-semibold text-muted">${g.mdrDebit}</td>
                    <td class="fw-bold text-success">${g.mdrPix}</td>
                    <td><strong class="text-primary">+${g.spreadDisk}</strong></td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold fs-xs" style="width: 32px;">${g.volumeShare}%</span>
                        <div class="flex-grow-1" style="width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${g.volumeShare}%; height: 100%; background: #2563eb;"></div>
                        </div>
                      </div>
                    </td>
                    <td class="text-end fw-bold fs-sm">${formatCurrency(g.totalVolumeProcessed)}</td>
                    <td>
                      <span class="badge ${g.status.includes('Backup') ? 'badge-warning' : 'badge-success'}">
                        ${g.status}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-light fs-xs" onclick="alert('Gerenciamento da adquirente ${g.name} (Chaves de API, Webhooks e Limites de Antifraude).')">
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: MATRIZ DE BANDEIRAS, MDR & PARCELAMENTO -->
      <div class="card-panel mb-4" id="section-bandeiras">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>2. Bandeiras, MDR & Parcelamento (Custo Disk vs Taxa Comercial)</h2>
            <p class="card-subtitle">Visão segregada do custo de adquirência contratado pela Disk versus taxa comercial faturada.</p>
          </div>
          <span class="badge badge-info align-self-center">Matriz Oficial de MDR</span>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Bandeira</th>
                  <th>MDR Débito</th>
                  <th>MDR Crédito 1x</th>
                  <th>MDR 2x a 6x</th>
                  <th>MDR 7x a 12x</th>
                  <th>Taxa Comercial Produtor</th>
                  <th>Regra Cliente Final</th>
                  <th class="text-center">Spread Apurado</th>
                </tr>
              </thead>
              <tbody>
                ${bandeirasMatriz.map(b => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <i class="ph-credit-card text-primary fs-5"></i>
                        <strong class="text-main">${b.nome}</strong>
                      </div>
                    </td>
                    <td>${b.debito}</td>
                    <td class="fw-semibold">${b.credito1x}</td>
                    <td>${b.parc2a6}</td>
                    <td>${b.parc7a12}</td>
                    <td><strong class="text-primary">${b.produtor}</strong></td>
                    <td class="text-muted fs-xs">${b.cliente}</td>
                    <td class="text-center">
                      <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold">
                        ${b.margemMedia}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="p-3 border-top bg-light bg-opacity-50 text-muted fs-xs">
            <strong>Regra de Governança Contábil:</strong> O MDR da adquirente é o custo operacional direto da Disk. A taxa comercial é a receita cobrada do Produtor ou repassada ao Cliente. A diferença líquida é contabilizada automaticamente na conta de <em>Spread de Adquirência (Receita Operacional Própria)</em> no Ledger, sem jamais sobrescrever ou expor o custo original.
          </div>
        </div>
      </div>

      <!-- SEÇÃO 3: MOTOR DE REGRAS COMERCIAIS & ABSORÇÃO DE TAXAS -->
      <div class="card-panel mb-4" id="section-regras">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>3. Motor de Regras Comerciais & Modalidades de Absorção</h2>
            <p class="card-subtitle">Configurações parametrizáveis por contrato de produtor, evento e checkout.</p>
          </div>
        </div>
        <div class="card-body p-3">
          <div class="row g-3">
            <div class="col-12 col-md-6 col-xl-3">
              <div class="p-3 border rounded-3 h-100 bg-white" style="border-top: 3px solid #2563eb !important;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong class="text-main fs-sm">Produtor Absorve</strong>
                  <span class="badge badge-info">PRODUTOR</span>
                </div>
                <p class="text-muted fs-xs mb-2">
                  A taxa comercial de processamento é deduzida diretamente da posição financeira e borderô do Produtor. O cliente paga o valor facial do ingresso.
                </p>
                <div class="text-primary fs-xxs fw-bold">&bull; Padrão em Eventos Corporativos e Teatros</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-xl-3">
              <div class="p-3 border rounded-3 h-100 bg-white" style="border-top: 3px solid #10b981 !important;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong class="text-main fs-sm">Cliente Absorve</strong>
                  <span class="badge badge-success">CLIENTE</span>
                </div>
                <p class="text-muted fs-xs mb-2">
                  A taxa de processamento/conveniência é somada ao checkout final do comprador. O produtor recebe o valor bruto do ingresso deduzido apenas de retenções acordadas.
                </p>
                <div class="text-success fs-xxs fw-bold">&bull; Padrão em Festivais e Shows de Grande Porte</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-xl-3">
              <div class="p-3 border rounded-3 h-100 bg-white" style="border-top: 3px solid #8b5cf6 !important;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong class="text-main fs-sm">Compartilhada</strong>
                  <span class="badge bg-purple text-white" style="background: #8b5cf6;">MISTA</span>
                </div>
                <p class="text-muted fs-xs mb-2">
                  Divisão inteligente: o Produtor absorve a taxa de débito e crédito 1x (à vista), enquanto os custos de juros do parcelamento (2x a 12x) são suportados pelo comprador.
                </p>
                <div class="text-purple fs-xxs fw-bold" style="color: #7c3aed;">&bull; Equilíbrio de Conversão e Custo</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-xl-3">
              <div class="p-3 border rounded-3 h-100 bg-white" style="border-top: 3px solid #f59e0b !important;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong class="text-main fs-sm">Regra Customizada</strong>
                  <span class="badge badge-warning">ESPECIAL</span>
                </div>
                <p class="text-muted fs-xs mb-2">
                  Condições especiais tabeladas por canal de venda (PDV físico vs Web), por lote de ingressos ou por contrato comercial específico de produtor VIP homologado.
                </p>
                <div class="text-warning fs-xxs fw-bold" style="color: #b45309;">&bull; Requer Homologação da Diretoria</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 4: SIMULADOR INTERATIVO DE TAXA, SPREAD & LEDGER (PACOTE 3) -->
      <div class="card-panel mb-4" id="section-simulador">
        <div class="card-header-bar" style="background: #f8fafc;">
          <div class="card-title-group">
            <h2>4. Simulador Financeiro de Taxa, Margem & Lançamento Contábil</h2>
            <p class="card-subtitle">Teste instantâneo de apuração da cadeia: Adquirente &rarr; MDR &rarr; Regra Comercial &rarr; Spread Disk &rarr; Ledger.</p>
          </div>
          <span class="badge bg-primary">Motor Operacional em Tempo Real</span>
        </div>
        <div class="card-body p-3">
          <div class="row g-3">
            <div class="col-12 col-lg-5">
              <div class="p-3 bg-light rounded-3 border">
                <h5 class="fs-sm fw-bold text-main mb-3"><i class="ph-calculator me-1"></i> Parâmetros da Transação</h5>
                
                <div class="mb-3">
                  <label class="form-label fs-xs fw-bold text-muted">Valor da Venda (R$)</label>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">R$</span>
                    <input type="number" class="form-control fw-bold" id="sim-input-valor" value="250.00" step="10" min="10" oninput="window.calcCommercialSimulator()">
                  </div>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fs-xs fw-bold text-muted">Bandeira</label>
                    <select class="form-select form-select-sm" id="sim-select-bandeira" onchange="window.calcCommercialSimulator()">
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="elo">Elo</option>
                      <option value="amex">American Express</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label fs-xs fw-bold text-muted">Parcelamento</label>
                    <select class="form-select form-select-sm" id="sim-select-parcelas" onchange="window.calcCommercialSimulator()">
                      <option value="1">1x (Crédito à Vista)</option>
                      <option value="debito">Débito</option>
                      <option value="3">3x (2x a 6x)</option>
                      <option value="6">6x (2x a 6x)</option>
                      <option value="10">10x (7x a 12x)</option>
                      <option value="12">12x (7x a 12x)</option>
                    </select>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="form-label fs-xs fw-bold text-muted">Modalidade de Absorção</label>
                  <select class="form-select form-select-sm" id="sim-select-regra" onchange="window.calcCommercialSimulator()">
                    <option value="PRODUTOR">Produtor Absorve a Taxa</option>
                    <option value="CLIENTE">Cliente Absorve a Taxa</option>
                    <option value="MISTA">Compartilhada (Produtor à vista / Cliente juros)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-7">
              <div class="p-3 rounded-3 border h-100 bg-white" id="sim-results-box">
                <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                  <span class="fs-xs text-uppercase fw-bold text-muted">Decomposição Financeira da Operação</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle fs-xxs">Cadeia Fechada</span>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-4">
                    <div class="p-2 border rounded text-center bg-light">
                      <div class="fs-xxs text-muted text-uppercase fw-semibold">Custo Adquirente (MDR)</div>
                      <div class="fs-5 fw-bold text-danger mt-1" id="sim-mdr-valor">-R$ 4,05</div>
                      <div class="fs-xxs text-muted" id="sim-mdr-percent">(1,62% Cielo)</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 border rounded text-center bg-light">
                      <div class="fs-xxs text-muted text-uppercase fw-semibold">Taxa Cobrada Produtor</div>
                      <div class="fs-5 fw-bold text-primary mt-1" id="sim-comercial-valor">-R$ 7,38</div>
                      <div class="fs-xxs text-muted" id="sim-comercial-percent">(2,95% Comercial)</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 border rounded text-center bg-success-subtle border-success-subtle">
                      <div class="fs-xxs text-success text-uppercase fw-bold">Spread Disk Apurado</div>
                      <div class="fs-5 fw-bold text-success mt-1" id="sim-spread-valor">+R$ 3,33</div>
                      <div class="fs-xxs text-success" id="sim-spread-percent">(+1,33% Margem)</div>
                    </div>
                  </div>
                </div>

                <div class="p-2 border rounded bg-light mb-2 fs-xs">
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Valor Total da Compra:</span>
                    <strong class="text-dark" id="sim-valor-total">R$ 250,00</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Líquido a Creditar na Conta do Produtor:</span>
                    <strong class="text-success" id="sim-liquido-produtor">R$ 242,62</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">Partida Contábil Automática (Ledger):</span>
                    <span class="badge bg-secondary fs-xxs">D: Recebível Cielo • C: Saldo Produtor • C: Receita Spread Disk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 5: CADEIA DE LIQUIDAÇÕES & CONCILIAÇÃO -->
      <div class="card-panel mb-4" id="section-liquidacoes">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>5. Cadeia de Liquidações & Conciliação em D+X</h2>
            <p class="card-subtitle">Fluxo contínuo desde a captura no checkout até a liquidação bancária e fechamento no Ledger.</p>
          </div>
        </div>
        <div class="card-body p-3">
          <div class="row g-2 mb-3">
            <div class="col">
              <div class="border rounded p-2 text-center h-100 bg-white">
                <span class="badge rounded-pill bg-primary fs-xxs mb-1">Passo 1</span>
                <div class="fw-bold fs-xs text-dark">Transação</div>
                <div class="text-muted fs-xxs">Captura & Antifraude</div>
              </div>
            </div>
            <div class="col">
              <div class="border rounded p-2 text-center h-100 bg-white">
                <span class="badge rounded-pill bg-primary fs-xxs mb-1">Passo 2</span>
                <div class="fw-bold fs-xs text-dark">Recebível</div>
                <div class="text-muted fs-xxs">Agenda D+1 / D+30</div>
              </div>
            </div>
            <div class="col">
              <div class="border rounded p-2 text-center h-100 bg-white">
                <span class="badge rounded-pill bg-primary fs-xxs mb-1">Passo 3</span>
                <div class="fw-bold fs-xs text-dark">Liquidação</div>
                <div class="text-muted fs-xxs">Corte da Adquirente</div>
              </div>
            </div>
            <div class="col">
              <div class="border rounded p-2 text-center h-100 bg-white">
                <span class="badge rounded-pill bg-primary fs-xxs mb-1">Passo 4</span>
                <div class="fw-bold fs-xs text-dark">Banco</div>
                <div class="text-muted fs-xxs">Crédito em Conta Disk</div>
              </div>
            </div>
            <div class="col">
              <div class="border rounded p-2 text-center h-100 bg-white">
                <span class="badge rounded-pill bg-success fs-xxs mb-1">Passo 5</span>
                <div class="fw-bold fs-xs text-success">Ledger & Conciliação</div>
                <div class="text-muted fs-xxs">Partidas Dobradas 100%</div>
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 pt-2 border-top flex-wrap">
            <button class="btn btn-primary btn-sm d-flex align-items-center gap-1" onclick="window.app.navigate('diskConciliacao')">
              <i class="ph-arrows-left-right"></i> Abrir Conciliação Bancária
            </button>
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onclick="window.app.navigate('diskRecebiveis')">
              <i class="ph-calendar-dots"></i> Ver Agenda de Recebíveis
            </button>
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onclick="window.app.navigate('diskLedger')">
              <i class="ph-book-bookmark"></i> Ver Ledger Contábil
            </button>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 6: DIRETRIZES DE GOVERNANÇA & AUDITORIA DO PACOTE 3 -->
      <div class="card-panel mb-4" id="section-governanca">
        <div class="card-header-bar" style="background: #f8fafc;">
          <div class="card-title-group">
            <h2>6. Diretrizes Obrigatórias de Governança & Auditoria (Pacote 3)</h2>
            <p class="card-subtitle">Regras de compliance exigidas antes do go-live com as APIs adquirentes.</p>
          </div>
        </div>
        <div class="card-body p-3">
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Confidencialidade de MDR:</strong> Custos contratados de interchange nunca podem ser vazados no payload de APIs consumidas pelo frontend do Produtor.
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Imutabilidade de Custos Originais:</strong> Regras comerciais customizadas ou descontos de produtor nunca sobrescrevem o registro do custo real MDR.
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Trilha de Auditoria em Alterações de Taxas:</strong> Qualquer mudança de tabela de taxa exige justificativa, usuário responsável e vigência temporal.
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Conciliação em 3 Pontas:</strong> Cada liquidação da adquirente precisa fechar simultaneamente com o recebível agendado, o extrato bancário e o Ledger contábil.
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Rastreabilidade de Estornos e Chargebacks:</strong> Toda contestação preserva o vínculo contábil com a transação original e recalcula os spreads de forma auditável.
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex gap-2 align-items-start p-2 border rounded bg-white">
                <i class="ph-check-circle text-success fs-5 flex-shrink-0 mt-1"></i>
                <div class="fs-xs">
                  <strong>Substituição de Mock por Webhooks Reais:</strong> Os dados de simulação serão conectados aos webhooks de captura da Cielo/Rede/Stone na homologação de produção.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// Inicializador do Simulador Interativo Global
if (typeof window !== 'undefined') {
  window.calcCommercialSimulator = function() {
    const valInput = document.getElementById('sim-input-valor');
    const bandSelect = document.getElementById('sim-select-bandeira');
    const parcSelect = document.getElementById('sim-select-parcelas');
    const regraSelect = document.getElementById('sim-select-regra');

    if (!valInput || !bandSelect || !parcSelect || !regraSelect) return;

    const valor = parseFloat(valInput.value) || 250.00;
    const bandId = bandSelect.value;
    const parc = parcSelect.value;
    const regra = regraSelect.value;

    const b = bandeirasMatriz.find(item => item.id === bandId) || bandeirasMatriz[0];

    let mdrRate = 1.62;
    if (parc === 'debito') {
      mdrRate = parseFloat(b.debito.replace(',', '.').replace('%', '')) || 0.82;
    } else if (parc === '1') {
      mdrRate = parseFloat(b.credito1x.replace(',', '.').replace('%', '')) || 1.62;
    } else if (['3', '6'].includes(parc)) {
      mdrRate = parseFloat(b.parc2a6.replace(',', '.').replace('%', '')) || 1.89;
    } else {
      mdrRate = parseFloat(b.parc7a12.replace(',', '.').replace('%', '')) || 2.18;
    }

    let comRate = parseFloat(b.produtor.replace(',', '.').replace('%', '')) || 2.95;
    if (parc === 'debito') comRate = 1.50;
    if (['10', '12'].includes(parc)) comRate = 3.80;

    const mdrVal = valor * (mdrRate / 100);
    let comVal = valor * (comRate / 100);
    let spreadVal = comVal - mdrVal;
    let liquidoProd = valor - comVal;

    if (regra === 'CLIENTE') {
      comVal = 0;
      liquidoProd = valor;
      spreadVal = (valor * 0.05) - mdrVal; // Exemplo conveniência
    }

    const mdrValEl = document.getElementById('sim-mdr-valor');
    const mdrPctEl = document.getElementById('sim-mdr-percent');
    const comValEl = document.getElementById('sim-comercial-valor');
    const comPctEl = document.getElementById('sim-comercial-percent');
    const spValEl = document.getElementById('sim-spread-valor');
    const spPctEl = document.getElementById('sim-spread-percent');
    const vTotEl = document.getElementById('sim-valor-total');
    const vLiqEl = document.getElementById('sim-liquido-produtor');

    if (mdrValEl) mdrValEl.innerText = `-R$ ${mdrVal.toFixed(2).replace('.', ',')}`;
    if (mdrPctEl) mdrPctEl.innerText = `(${mdrRate.toFixed(2).replace('.', ',')}% Adquirente)`;
    if (comValEl) comValEl.innerText = `-R$ ${comVal.toFixed(2).replace('.', ',')}`;
    if (comPctEl) comPctEl.innerText = `(${comRate.toFixed(2).replace('.', ',')}% Comercial)`;
    if (spValEl) spValEl.innerText = `+R$ ${Math.max(0, spreadVal).toFixed(2).replace('.', ',')}`;
    if (spPctEl) spPctEl.innerText = `(+${((spreadVal / valor) * 100).toFixed(2).replace('.', ',')}% Margem)`;
    if (vTotEl) vTotEl.innerText = `R$ ${valor.toFixed(2).replace('.', ',')}`;
    if (vLiqEl) vLiqEl.innerText = `R$ ${liquidoProd.toFixed(2).replace('.', ',')}`;
  };
}
