/**
 * Controlador Principal do Portal Financeiro Disk Ingressos (ERP / CRM)
 * Padrão Limitless Oficial: Referência visual e estrutural de https://financeiropdtnovo.web.app/
 * 
 * Regras Obrigatórias e Invariantes:
 * 1. Single Core, Duas Visões Especializadas: Produtor vs. Financeiro Disk (Backoffice).
 * 2. Fluxo Oficial e Assinaturas Sequenciais: Solicitação → Análise → Decisão → Assinaturas Digitais → Liberação.
 *    REGRA ESTRITA: O Financeiro Disk é SEMPRE O ÚLTIMO SIGNATÁRIO. O sistema bloqueia a assinatura do Financeiro até que o Produtor assine primeiro.
 * 3. Rejeição Formal: Motivo categorizado, observação obrigatória, notificação imediata ao produtor e devolução automática dos recursos retidos.
 * 4. Trilha de Auditoria Imutável para cada operação.
 * 5. Isolamento Estrito: Produtor só acessa seus próprios eventos e contas.
 */

import { financialStore } from './state.js';
import { formatCurrency, formatNumber, createStatusBadge } from './formatters.js';

// Import Views do Produtor
import { renderOverview } from './views/overview.js';
import { renderSaldos } from './views/saldos.js';
import { renderExtrato } from './views/extrato.js';
import { renderRepasses } from './views/repasses.js';
import { renderAntecipacoes } from './views/antecipacoes.js';
import { renderVendas } from './views/vendas.js';
import { renderTaxas } from './views/taxas.js';
import { renderEstornos } from './views/estornos.js';
import { renderBordero } from './views/bordero.js';
import { renderRelatorios } from './views/relatorios.js';
import { renderDadosBancarios } from './views/dadosBancarios.js';

// Import Views do Financeiro Disk (Backoffice Enterprise)
import { renderDiskDashboard } from './views/disk/dashboard.js';
import { renderDiskPosicaoGeral, renderDiskIndicadores, renderDiskInteligencia } from './views/disk/diskVisaoGeral.js';
import { renderDiskSaldos } from './views/disk/diskSaldos.js';
import { renderDiskAprovacoes } from './views/disk/aprovacoes.js';
import { renderDiskSolicitacoes } from './views/disk/solicitacoes.js';
import { renderDiskProdutores } from './views/disk/produtores.js';
import { renderDiskGateways, renderGatewayTab } from './views/disk/gatewaysMdr.js';
import { renderDiskLedger } from './views/disk/ledger.js';
import { renderDiskTesouraria } from './views/disk/tesouraria.js';
import { renderDiskContasPagar } from './views/disk/diskContasPagar.js';
import { renderDiskContasReceber } from './views/disk/diskContasReceber.js';
import { renderDiskFluxoCaixa } from './views/disk/diskFluxoCaixa.js';
import { renderDiskPix } from './views/disk/diskPix.js';
import { renderDiskCnab } from './views/disk/diskCnab.js';
import { renderDiskPagamentosLote } from './views/disk/diskPagamentosLote.js';
import { renderDiskTransferencias } from './views/disk/diskTransferencias.js';
import { renderDiskAgendaPagamentos } from './views/disk/diskAgendaPagamentos.js';
import { renderDiskConciliacao } from './views/disk/diskConciliacao.js';
import { renderDiskFechamentos } from './views/disk/diskFechamentos.js';
import { renderDiskControladoria } from './views/disk/diskControladoria.js';
import { renderDiskAssinaturasIntegracoes } from './views/disk/diskAssinaturasIntegracoes.js';
import { renderDiskGovernanca } from './views/disk/diskGovernanca.js';
import { renderDiskCentralTrabalho } from './views/disk/diskCentralTrabalho.js';
import { renderDiskFinanceiroAvancado } from './views/disk/diskFinanceiroAvancado.js';

class LimitlessFinancialApp {
  constructor() {
    this.mainContainer = document.getElementById('view-container');
    this.sidebarNav = document.getElementById('main-sidebar-nav');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContent = document.getElementById('modal-dynamic-content');

    // Subscribe to state changes
    financialStore.subscribe((state) => {
      this.render(state);
    });

    // Initial render
    this.render(financialStore.getState());
    this.setupGlobalListeners();
  }

  setupGlobalListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // Close modal when clicking outside modal card
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    const evtSelect = document.getElementById('globalEventSelect');
    if (evtSelect) {
      evtSelect.addEventListener('change', (e) => {
        this.setSelectedEvent(e.target.value);
      });
    }
  }

  setSelectedEvent(eventId) {
    financialStore.setSelectedEvent(eventId);
    const evtBadge = document.getElementById('header-event-badge');
    if (evtBadge) {
      const state = financialStore.getState();
      const evt = state.data.events.find(e => e.id === eventId);
      evtBadge.innerText = evt ? evt.name : 'Todos os Eventos (Consolidado)';
    }
  }

  selectProducerInDisk(producerId) {
    financialStore.setSelectedProducer(producerId);
  }

  navigate(viewName, filterArg = null) {
    this.currentFilterArg = filterArg;

    // View Aliases matching reference app https://financeiropdtnovo.web.app/
    const state = financialStore.getState();
    const isDisk = state.viewMode === 'disk';

    let targetView = viewName;
    const aliasMap = {
      'financial-dashboard': isDisk ? 'diskDashboard' : 'overview',
      'financial-posicao-geral': 'diskPosicaoGeral',
      'financial-saldos': isDisk ? 'diskSaldos' : 'saldos',
      'financial-approvals': 'diskAprovacoes',
      'financial-repass': isDisk ? 'diskAprovacoes' : 'repasses',
      'financial-advance': 'antecipacoes',
      'financial-statement': 'extrato',
      'financial-gateways-adquirentes': 'diskGateways',
      'financial-accounts': 'dadosBancarios',
      'financial-bordero': 'bordero',
      'financial-taxas-custos': 'taxas',
      'financial-fechamento': 'bordero',
      'financial-balance': 'diskTesouraria',
      'financial-event-transfers': 'saldos',
      'financial-refunds': 'estornos',
      'financial-analytics': 'relatorios',
      'dashboard-main': isDisk ? 'diskDashboard' : 'overview',
      'dashboard-agenda': 'diskTesouraria',
      'dashboard-indicators': 'diskIndicadores',
      'events-list': 'saldos',
      'accounting-disk': 'diskLedger',
      'reports-sales': 'relatorios',
      'procure-to-pay': 'diskTesouraria',
      'fin-my-requests': 'repasses'
    };

    if (aliasMap[viewName]) {
      targetView = aliasMap[viewName];
    }

    financialStore.setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('appSidebar');
    if (sidebar && sidebar.classList.contains('sidebar-mobile-expanded')) {
      sidebar.classList.remove('sidebar-mobile-expanded');
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-mobile-expanded');
    }
  }

  setDiskBalanceTab(tab) {
    this.diskBalanceTab = tab;
    financialStore.setView('diskSaldos');
  }

  openProducerDossier(producerId) {
    const state = financialStore.getState();
    const p = state.data.producers.find(x => x.id === producerId);
    if (!p) return financialStore.showToast('Dossiê', 'Produtor não encontrado.', 'danger');
    const evts = state.data.events.filter(e => e.producerId === producerId);
    const ops = state.data.approvalQueue.filter(a => a.producerId === producerId);
    const pending = ops.filter(a => !['Pago','Rejeitado','Recusado'].includes(a.status));
    const html = `<div class="modal-card" style="max-width:780px"><div class="modal-header d-flex justify-content-between align-items-center"><div><div class="fs-xs text-muted">DOSSIÊ FINANCEIRO DO PRODUTOR</div><h4 class="mb-0">${p.name}</h4></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><div class="modal-body"><div class="kpi-grid"><div class="kpi-card"><div class="kpi-title">Saldo Total</div><div class="kpi-value">${formatCurrency(p.totals.totalBalance)}</div></div><div class="kpi-card"><div class="kpi-title">Disponível</div><div class="kpi-value">${formatCurrency(p.totals.availableBalance)}</div></div><div class="kpi-card"><div class="kpi-title">Eventos</div><div class="kpi-value">${evts.length}</div></div><div class="kpi-card"><div class="kpi-title">Pendências</div><div class="kpi-value">${pending.length}</div></div></div><hr><p><strong>CNPJ:</strong> ${p.cnpj}</p><p><strong>Rating:</strong> ${p.rating} &bull; <strong>Status:</strong> ${p.status}</p><div class="d-flex gap-2 flex-wrap mt-3"><button class="btn btn-primary" onclick="window.app.closeModal();window.app.selectProducerInDisk('${p.id}');window.app.navigate('diskProdutores')">Abrir Conta Financeira</button><button class="btn btn-outline-primary" onclick="window.app.closeModal();window.app.selectProducerInDisk('${p.id}');window.app.navigate('diskAprovacoes')">Ver Aprovações</button></div></div></div>`;
    this.openModal(html);
  }

  handleGlobalSearch(query) {
    if (!query) return;
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach(r => {
      const text = r.innerText.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  }

  changeLanguage(lang) {
    const labels = {
      'pt': 'Português (BR)',
      'en': 'English',
      'es': 'Español'
    };
    const el = document.getElementById('current-language-text');
    if (el) el.innerText = labels[lang] || 'Português (BR)';
    financialStore.showToast("Idioma Alterado", `Interface configurada para ${labels[lang] || lang}`, "info");
  }

  clearNotifications(event) {
    if (event) event.preventDefault();
    const badge = document.getElementById('notification-badge');
    const countBadge = document.getElementById('notification-count-badge');
    const list = document.getElementById('notification-list-container');
    if (badge) badge.style.display = 'none';
    if (countBadge) countBadge.innerText = '0 Novas';
    if (list) {
      list.innerHTML = `
        <div class="p-3 text-center text-muted fs-xs">
          <i class="ph-check-circle fs-3 text-success d-block mb-1"></i>
          Todas as notificações foram marcadas como lidas.
        </div>
      `;
    }
    financialStore.showToast("Notificações", "Todas as notificações foram limpas", "success");
  }

  refreshData() {
    financialStore.showToast("Dados Atualizados", "Valores recalculados a partir do estado persistido desta homologação.", "success");
    this.render(financialStore.getState());
  }

  // ==========================================================================
  // FICHA COMPLETA DE ANÁLISE NA CENTRAL DE APROVAÇÕES (SOLICITAÇÃO #REP-00291)
  // Fluxo Oficial: Solicitação → Análise → Decisão → Assinaturas Sequenciais → Liberação
  // ==========================================================================
  openApprovalSheet(approvalId) {
    const state = financialStore.getState();
    const item = state.data.approvalQueue.find(a => a.id === approvalId);
    if (!item) return;

    const audit = item.auditPosition || {
      grossSales: 500000,
      netRevenue: 450000,
      availableBefore: 200000,
      requested: item.requestedAmount,
      availableAfter: 120000
    };

    const isRejected = item.status === 'Rejeitado';
    const isApproved = item.approvedBy != null;
    const prodSigned = item.signatures?.producer.signed;
    const diskSigned = item.signatures?.disk.signed;
    const isPaid = item.status === 'Pago';

    const html = `
      <div class="modal-card" style="max-width: 740px;">
        <div class="modal-header d-flex justify-content-between align-items-center" style="background: #16191f; color: white; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div>
            <span class="fs-xxs text-uppercase fw-bold text-primary" style="letter-spacing: 0.05em;">ANÁLISE DE SOLICITAÇÃO &bull; CENTRAL UNIFICADA DE APROVAÇÕES</span>
            <h4 class="fw-bold mb-0 text-white mt-1">
              SOLICITAÇÃO DE ${item.type.toUpperCase()} #${item.id}
            </h4>
          </div>
          <button class="modal-close-btn btn btn-sm btn-icon text-white-50 border-0" onclick="window.app.closeModal()">&times;</button>
        </div>

        <div class="modal-body p-4">
          
          <!-- Identificação Produtor & Evento -->
          <div class="row g-3 p-3 rounded mb-3" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <div class="col-sm-6">
              <div class="fs-xxs text-uppercase text-muted fw-bold">Produtor Solicitante</div>
              <div class="fs-base fw-bold text-dark mt-1">${item.producerName}</div>
              <div class="fs-xs text-primary fw-semibold">CNPJ Homologado na Plataforma Disk</div>
            </div>
            <div class="col-sm-6">
              <div class="fs-xxs text-uppercase text-muted fw-bold">Evento Vinculado</div>
              <div class="fs-base fw-bold text-primary mt-1">${item.eventName || 'Conta Geral'}</div>
              <div class="fs-xs text-muted">Solicitado em: ${item.requestDate}</div>
            </div>
          </div>

          <!-- Se estiver rejeitado, exibe bloco formal de rejeição -->
          ${isRejected ? `
            <div class="p-3 rounded mb-3" style="background: #fef2f2; border: 2px solid #ef4444;">
              <div class="fs-xs fw-bold text-uppercase text-danger d-flex align-items-center gap-1">
                <i class="ph-warning-octagon"></i> SOLICITAÇÃO REJEITADA PELO FINANCEIRO DISK
              </div>
              <div class="mt-2 fs-sm text-danger">
                <strong>Motivo Formal:</strong> ${item.rejection?.reasonCategory}
              </div>
              <div class="mt-1 fs-sm text-dark bg-white p-2 rounded border border-danger border-opacity-25">
                <strong>Justificativa:</strong> ${item.rejection?.observation}
              </div>
              <div class="mt-2 fs-xxs text-muted">
                Rejeitado por <strong>${item.rejection?.rejectedBy}</strong> em ${item.rejection?.rejectedAt} &bull; Recursos retidos devolvidos ao saldo disponível.
              </div>
            </div>
          ` : ''}

          <!-- POSIÇÃO FINANCEIRA DO EVENTO -->
          <div class="mb-4">
            <div class="fs-xs fw-bold text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
              <i class="ph-chart-pie-slice text-primary"></i> POSIÇÃO FINANCEIRA DO EVENTO
            </div>
            <div class="card shadow-sm border overflow-hidden">
              <div class="d-flex justify-content-between p-2 px-3 border-bottom fs-sm">
                <span class="text-muted">Vendas brutas apuradas:</span>
                <strong>${formatCurrency(audit.grossSales)}</strong>
              </div>
              <div class="d-flex justify-content-between p-2 px-3 border-bottom fs-sm">
                <span class="text-muted">Líquido acumulado do evento:</span>
                <strong>${formatCurrency(audit.netRevenue)}</strong>
              </div>
              <div class="d-flex justify-content-between p-2 px-3 border-bottom fs-sm" style="background: #f0fdf4;">
                <span class="fw-bold text-success">Saldo disponível no momento:</span>
                <strong class="text-success fs-base">${formatCurrency(audit.availableBefore)}</strong>
              </div>
              <div class="d-flex justify-content-between p-3 border-bottom fs-sm" style="background: #eff6ff;">
                <span class="fw-bold text-primary">Valor solicitado de liberação:</span>
                <strong class="text-primary fs-5">${formatCurrency(item.requestedAmount || item.netAmount)}</strong>
              </div>
              <div class="d-flex justify-content-between p-2 px-3 fs-sm">
                <span class="text-muted">Saldo residual após repasse:</span>
                <strong class="text-success fw-bold">${formatCurrency(audit.availableAfter)}</strong>
              </div>
            </div>
          </div>

          <!-- CHECKLIST DE CONFORMIDADE -->
          <div class="mb-4">
            <div class="fs-xs fw-bold text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
              <i class="ph-shield-check text-success"></i> CHECKLIST DE CONFORMIDADE &amp; RISCO
            </div>
            <div class="p-3 rounded border" style="background: #f8fafc;">
              <div class="row g-2 fs-xs">
                <div class="col-sm-6 text-success fw-bold"><i class="ph-check-circle me-1"></i> Saldo suficiente apurado</div>
                <div class="col-sm-6 text-success fw-bold"><i class="ph-check-circle me-1"></i> Dados bancários validados (Bacen/CIP)</div>
                <div class="col-sm-6 text-success fw-bold"><i class="ph-check-circle me-1"></i> Evento regular com borderô</div>
                <div class="col-sm-6 text-success fw-bold"><i class="ph-check-circle me-1"></i> Sem bloqueio no contrato</div>
                <div class="col-sm-6 text-success fw-bold"><i class="ph-check-circle me-1"></i> Limite de repasse permitido</div>
                <div class="col-sm-6 text-warning fw-bold"><i class="ph-warning me-1"></i> ${item.checklist?.chargebackWarning || '2 chargebacks em acompanhamento'}</div>
              </div>
            </div>
          </div>

          <!-- ESTEIRA OFICIAL DE ASSINATURAS SEQUENCIAIS -->
          <div class="mb-3">
            <div class="fs-xs fw-bold text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
              <i class="ph-signature text-warning"></i> ESTEIRA FORMAL DE ASSINATURAS DIGITAIS (TERMO #${item.documentId})
            </div>
            <div class="card p-3 shadow-sm border d-flex flex-column gap-3">
              
              <!-- 1. Decisão Operacional da Disk -->
              <div class="d-flex justify-content-between align-items-center fs-sm">
                <div>
                  <strong>1. Decisão Operacional Disk:</strong>
                  <div class="fs-xs text-muted">
                    ${isApproved ? `✓ Aprovado por ${item.approvedBy} em ${item.approvedAt}` : (isRejected ? '✕ Rejeitado formalmente' : '● Aguardando análise da Tesouraria')}
                  </div>
                </div>
                <span class="badge ${isApproved ? 'bg-success' : (isRejected ? 'bg-danger' : 'bg-warning')}">
                  ${isApproved ? 'Aprovado' : (isRejected ? 'Rejeitado' : 'Pendente')}
                </span>
              </div>

              <hr class="my-1 border-secondary border-opacity-10">

              <!-- 2. Assinatura do Produtor (PRIMEIRO) -->
              <div class="d-flex justify-content-between align-items-center fs-sm">
                <div>
                  <strong>2. Assinatura Digital do Produtor:</strong>
                  <div class="fs-xs text-muted">
                    ${prodSigned ? `✓ Assinado por ${item.signatures.producer.signedBy} em ${item.signatures.producer.signedAt}` : '○ Aguardando assinatura digital do Produtor no Portal'}
                  </div>
                </div>
                <div>
                  ${prodSigned ? `
                    <span class="badge bg-success"><i class="ph-check"></i> Assinado (ICP-Brasil)</span>
                  ` : `
                    <span class="badge bg-warning text-dark"><i class="ph-clock"></i> Aguardando Produtor</span>
                  `}
                </div>
              </div>

              <hr class="my-1 border-secondary border-opacity-10">

              <!-- 3. Assinatura do Financeiro Disk (SEMPRE POR ÚLTIMO) -->
              <div class="d-flex justify-content-between align-items-center fs-sm">
                <div>
                  <strong>3. Assinatura Digital Disk (SEMPRE POR ÚLTIMO):</strong>
                  <div class="fs-xs text-muted">
                    ${diskSigned ? `✓ Assinado por ${item.signatures.disk.signedBy} em ${item.signatures.disk.signedAt}` : (!prodSigned ? '🔒 Bloqueado: O Financeiro Disk assina após o Produtor' : '○ Liberado para assinatura final da Disk')}
                  </div>
                </div>
                <div>
                  ${diskSigned ? `
                    <span class="badge bg-success"><i class="ph-check"></i> Assinado por Último</span>
                  ` : (!prodSigned ? `
                    <span class="badge bg-secondary opacity-75"><i class="ph-lock"></i> Bloqueado</span>
                  ` : `
                    <span class="badge bg-primary"><i class="ph-pencil"></i> Liberado p/ Assinatura</span>
                  `)}
                </div>
              </div>

              <hr class="my-1 border-secondary border-opacity-10">

              <!-- 4. Liberação e Liquidação Financeira -->
              <div class="d-flex justify-content-between align-items-center fs-sm">
                <div>
                  <strong>4. Liberação &amp; Liquidação Bancária:</strong>
                  <div class="fs-xs text-muted">
                    ${isPaid ? `✓ Transferido via PIX em ${item.paidDate} (Aut: ${item.authCode})` : (diskSigned ? 'Documento formalizado → Pronto para transferência bancária' : 'Aguardando formalização')}
                  </div>
                </div>
                <span class="badge ${isPaid ? 'bg-success' : (diskSigned ? 'bg-info text-dark' : 'bg-light text-muted')}">
                  ${isPaid ? 'Pago' : (diskSigned ? 'Liberado p/ Pagamento' : 'Aguardando')}
                </span>
              </div>

            </div>
          </div>

          <!-- BOTOES DE AÇÃO OPERACIONAL BASEADOS NO ESTADO ATUAL -->
          <div class="modal-footer px-0 pb-0 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="d-flex gap-2">
              ${!isApproved && !isRejected ? `
                <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onclick="window.app.openRejectModal('${item.id}')">
                  <i class="ph-x-circle"></i> <span>Rejeitar Solicitação</span>
                </button>
              ` : ''}
              <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onclick="window.app.openAuditTrailModal('${item.id}')">
                <i class="ph-scroll"></i> <span>Ver Trilha de Auditoria</span>
              </button>
            </div>

            <div class="d-flex gap-2 align-items-center" id="actionDecisionGroup">
              ${!isApproved && !isRejected ? `
                <button class="btn btn-primary d-flex align-items-center gap-1" onclick="window.app.handleApproveByDisk('${item.id}')">
                  <i class="ph-check"></i> <span>Aprovar &amp; Gerar Termo</span>
                </button>
              ` : ''}

              ${isApproved && !prodSigned ? `
                <button class="btn btn-secondary text-muted" onclick="alert('O Financeiro Disk é sempre o último signatário. O documento deve ser assinado primeiro pelo Produtor no login dele.')" style="cursor: not-allowed; opacity: 0.85;">
                  <i class="ph-lock"></i> Assinatura Disk Bloqueada (Aguardando Produtor)
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="window.app.simulateProducerSign('${item.id}')" title="Simula a assinatura do produtor para acelerar a apresentação">
                  ⚡ Simular Assinatura do Produtor
                </button>
              ` : ''}

              ${isApproved && prodSigned && !diskSigned ? `
                <button class="btn btn-primary d-flex align-items-center gap-1" onclick="window.app.handleSignByDisk('${item.id}')">
                  <i class="ph-signature"></i> <span>Assinar Documento Agora (Financeiro Disk)</span>
                </button>
              ` : ''}

              ${diskSigned && !isPaid ? `
                <button class="btn btn-success d-flex align-items-center gap-1" onclick="window.app.handleFinalPayment('${item.id}')">
                  <i class="ph-money"></i> <span>Executar Pagamento / Transferência (PIX)</span>
                </button>
              ` : ''}

              ${isPaid ? `
                <button class="btn btn-primary d-flex align-items-center gap-1" onclick="window.switchGlobalRole('PRODUTOR'); window.app.navigate('repasses'); window.app.closeModal();">
                  <i class="ph-user"></i> <span>Ver no Login do Produtor (Pago) &rarr;</span>
                </button>
              ` : ''}
            </div>
          </div>

        </div>
      </div>
    `;

    this.showModal(html);
  }

  handleApproveByDisk(requestId) {
    financialStore.approveOperationByDisk(requestId);
    this.openApprovalSheet(requestId);
  }

  handleSignByDisk(requestId) {
    financialStore.signByDisk(requestId);
    this.openApprovalSheet(requestId);
  }

  simulateProducerSign(requestId) {
    financialStore.signByProducer(requestId);
    this.openApprovalSheet(requestId);
  }

  handleFinalPayment(requestId) {
    financialStore.executeFinalTransfer(requestId);
    this.openApprovalSheet(requestId);
  }

  // ==========================================================================
  // REJEIÇÃO FORMAL COM DEVOLUÇÃO IMEDIATA DOS RECURSOS
  // ==========================================================================
  openRejectModal(requestId) {
    const html = `
      <div class="modal-card" style="max-width: 520px;">
        <div class="modal-header bg-danger text-white">
          <h5 class="fw-bold mb-0 text-white"><i class="ph-warning-octagon me-1"></i> REJEITAR SOLICITAÇÃO #${requestId}</h5>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <form onsubmit="window.app.handleConfirmRejectSubmit(event, '${requestId}')">
            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Motivo da Rejeição *</label>
              <select class="form-select" id="rejectReasonCategory" required>
                <option value="Inconsistência de valores">Inconsistência de valores</option>
                <option value="Divergência bancária">Divergência bancária</option>
                <option value="Documentação pendente">Documentação pendente</option>
                <option value="Saldo insuficiente">Saldo insuficiente</option>
                <option value="Bloqueio financeiro">Bloqueio financeiro ativo no contrato</option>
                <option value="Divergência no borderô">Divergência no borderô de vendas</option>
                <option value="Outros">Outros motivos contratuais</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Observação &amp; Justificativa Detalhada *</label>
              <textarea class="form-control" id="rejectObservation" rows="4" placeholder="Descreva os detalhes da inconsistência para que o Produtor possa ajustar..." required style="resize: vertical;"></textarea>
            </div>

            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="notifyProducerCheck" checked>
              <label class="form-check-label fs-xs text-dark fw-semibold" for="notifyProducerCheck">
                Notificar o Produtor imediatamente por e-mail e painel
              </label>
            </div>

            <div class="modal-footer px-0 pb-0 pt-2 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-danger">
                Confirmar Rejeição Formal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    this.showModal(html);
  }

  handleConfirmRejectSubmit(e, requestId) {
    e.preventDefault();
    const reasonCategory = document.getElementById('rejectReasonCategory').value;
    const observation = document.getElementById('rejectObservation').value;

    financialStore.rejectOperationByDisk(requestId, { reasonCategory, observation });
    this.openApprovalSheet(requestId);
  }

  showRejectionDetails(requestId) {
    const state = financialStore.getState();
    const item = state.data.approvalQueue.find(a => a.id === requestId);
    if (!item || !item.rejection) return;

    const html = `
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header bg-danger bg-opacity-10 border-bottom border-danger">
          <h5 class="fw-bold mb-0 text-danger"><i class="ph-warning-octagon me-1"></i> Motivo da Rejeição: ${item.id}</h5>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <div class="d-flex flex-column gap-3 fs-sm">
            <div>
              <span class="fs-xxs text-uppercase text-muted fw-bold">Categoria:</span>
              <div class="fw-bold text-danger fs-base mt-1">${item.rejection.reasonCategory}</div>
            </div>
            <div>
              <span class="fs-xxs text-uppercase text-muted fw-bold">Justificativa Formal da Disk:</span>
              <div class="p-3 bg-light rounded border mt-1 fs-sm">
                ${item.rejection.observation}
              </div>
            </div>
            <div class="d-flex justify-content-between fs-xs text-muted border-top pt-2">
              <span>Rejeitado por: <strong>${item.rejection.rejectedBy}</strong></span>
              <span>Data/Hora: <strong>${item.rejection.rejectedAt}</strong></span>
            </div>
          </div>
          <div class="modal-footer px-0 pb-0 pt-3 d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="window.app.closeModal()">Fechar</button>
            <button class="btn btn-primary" onclick="window.app.closeModal(); window.app.openPayoutModal();">
              Nova Solicitação Ajustada
            </button>
          </div>
        </div>
      </div>
    `;
    this.showModal(html);
  }

  // ==========================================================================
  // TRILHA DE AUDITORIA IMUTÁVEL
  // ==========================================================================
  openAuditTrailModal(requestId) {
    const state = financialStore.getState();
    const item = state.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    const html = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0"><i class="ph-scroll text-primary me-2"></i> Trilha de Auditoria: ${item.id}</h5>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            Registro cronológico e imutável de todas as ações de operadores e sistemas na operação:
          </p>
          <div class="d-flex flex-column gap-3 border-start border-primary border-2 ps-3 ms-2">
            ${(item.auditTrail || []).map(a => `
              <div class="position-relative">
                <div class="position-absolute rounded-circle bg-primary" style="width: 10px; height: 10px; left: -22px; top: 4px;"></div>
                <div class="d-flex justify-content-between fs-xs">
                  <strong class="text-dark">${a.action}</strong>
                  <span class="text-muted">${a.timestamp}</span>
                </div>
                <div class="fs-xs text-primary fw-semibold">${a.actor}</div>
                ${a.details ? `<div class="fs-xs text-muted mt-1 bg-light p-1 rounded">${a.details}</div>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="modal-footer px-0 pb-0 pt-3 mt-3 d-flex justify-content-end">
            <button class="btn btn-primary" onclick="window.app.closeModal()">Fechar</button>
          </div>
        </div>
      </div>
    `;
    this.showModal(html);
  }

  // ==========================================================================
  // MODAIS DE OPERAÇÃO DO PRODUTOR
  // ==========================================================================
  openPayoutModal(defaultEventId = null) {
    const state = financialStore.getState();
    const producer = state.activeProducer;
    const events = state.data.events.filter(e => e.producerId === producer.id);
    const bankAccounts = producer.bankAccounts;
    const selectedEvent = events.find(e => e.id === defaultEventId) || events[0] || state.data.events[0];

    const html = `
      <div class="modal-card" style="max-width: 540px;">
        <div class="modal-header bg-success text-white">
          <h5 class="fw-bold mb-0 text-white"><i class="ph-hand-coins me-2"></i> Solicitar Repasse Financeiro</h5>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            Transfira seu saldo disponível para a conta bancária homologada de <strong>${producer.name}</strong>.
          </p>

          <form id="payoutForm" onsubmit="window.app.handlePayoutSubmit(event)">
            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Origem do Saldo (Evento)</label>
              <select class="form-select" id="modalPayoutEvent" onchange="window.app.onPayoutEventSelect(this.value)">
                ${events.map(e => `
                  <option value="${e.id}" ${e.id === selectedEvent.id ? 'selected' : ''}>
                    ${e.name} (Transferível: ${formatCurrency(financialStore.getTransferableAmount(e))})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Valor a Transferir (R$)</label>
              <input type="number" class="form-control" id="modalPayoutAmount" min="100" max="${selectedEvent.availableBalance}" value="${Math.min(80000, selectedEvent.availableBalance)}" required step="0.01">
              <div class="form-text fs-xs text-muted">Máximo disponível neste evento: <strong id="modalMaxAvailable" class="text-success">${formatCurrency(selectedEvent.availableBalance)}</strong></div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Conta Bancária de Destino</label>
              <select class="form-select" id="modalPayoutBank">
                ${bankAccounts.map(b => `
                  <option value="${b.id}">
                    ${b.bankName} - Ag: ${b.agency} Conta: ${b.accountNumber} (${b.isDefault ? 'Principal' : 'Secundária'})
                  </option>
                `).join('')}
              </select>
              <div class="form-text fs-xs text-muted">Mesmo titular: ${producer.cnpj}</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Observações Internas (Opcional)</label>
              <input type="text" class="form-control" id="modalPayoutNotes" placeholder="Ex: Pagamento de cachê artístico / fornecedor de som">
            </div>

            <div class="modal-footer px-0 pb-0 pt-2 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-success">Confirmar e Enviar para Análise</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  onPayoutEventSelect(eventId) {
    const state = financialStore.getState();
    const event = state.data.events.find(e => e.id === eventId);
    if (event) {
      document.getElementById('modalPayoutAmount').max = event.availableBalance;
      document.getElementById('modalPayoutAmount').value = Math.min(80000, event.availableBalance);
      document.getElementById('modalMaxAvailable').innerText = formatCurrency(event.availableBalance);
    }
  }

  handlePayoutSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById('modalPayoutEvent').value;
    const amount = document.getElementById('modalPayoutAmount').value;
    const bankAccountId = document.getElementById('modalPayoutBank').value;
    const notes = document.getElementById('modalPayoutNotes').value;

    const payout = financialStore.requestPayout({ eventId, amount, bankAccountId, notes });
    this.closeModal();

    financialStore.showToast("Repasse Solicitado", `Protocolo ${payout.id} no valor de ${formatCurrency(amount)} enviado para análise`, "success");
    this.navigate('repasses');
  }

  updateAnticipationSimulation() {
    const state = financialStore.getState();
    const producer = state.activeProducer;
    const eventId = document.getElementById('antEventSelect')?.value;
    const event = state.data.events.find(e => e.id === eventId) || state.activeEvent;
    const input = document.getElementById('antAmount');
    const amount = Number(input?.value || 50000);
    const rate = Number(producer.contract?.anticipationRateMonthly || state.data.anticipations.monthlyRate || 0);
    const fee = amount * rate / 100;
    const net = amount - fee;
    const gross = document.getElementById('simGross'); const disc = document.getElementById('simDiscount'); const netEl = document.getElementById('simNet');
    if (input && event) input.max = event.futureReceivables;
    if (gross) gross.textContent = formatCurrency(amount);
    if (disc) disc.textContent = `- ${formatCurrency(fee)}`;
    if (netEl) netEl.textContent = formatCurrency(net);
  }

  submitAnticipation() {
    try {
      const eventId = document.getElementById('antEventSelect')?.value;
      const amount = Number(document.getElementById('antAmount')?.value || 0);
      const item = financialStore.requestAnticipation({ eventId, amount, notes: 'Antecipação solicitada pelo ambiente do Produtor' });
      financialStore.showToast('Antecipação solicitada', `${item.id} enviado para análise do Financeiro Disk. Recebíveis reservados até a decisão.`, 'success');
      this.navigate('antecipacoes');
    } catch (err) { alert(err.message); }
  }

  // Modal de Transferência entre Eventos (Gestão de Saldos do Produtor)
  openTransferModal() {
    const state = financialStore.getState();
    const producer = state.activeProducer;
    const events = state.data.events.filter(e => e.producerId === producer.id);

    if (events.length < 2) {
      alert("A transferência entre eventos requer pelo menos 2 eventos ativos.");
      return;
    }

    const html = `
      <div class="modal-card" style="max-width: 540px;">
        <div class="modal-header bg-primary text-white">
          <h5 class="fw-bold mb-0 text-white"><i class="ph-arrows-clockwise me-2"></i> Transferência de Saldo entre Eventos</h5>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            Realoque saldo disponível entre eventos de <strong>${producer.name}</strong> para equilibrar fluxo de caixa.
          </p>

          <form onsubmit="window.app.handleTransferSubmit(event)">
            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Evento de Origem (Debitar)</label>
              <select class="form-select" id="transferOriginEvent" required>
                ${events.map((e, idx) => `
                  <option value="${e.id}" ${idx === 0 ? 'selected' : ''}>
                    ${e.name} (Transferível: ${formatCurrency(financialStore.getTransferableAmount(e))})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Evento de Destino (Creditar)</label>
              <select class="form-select" id="transferDestEvent" required>
                ${events.map((e, idx) => `
                  <option value="${e.id}" ${idx === 1 ? 'selected' : ''}>
                    ${e.name} (Saldo Atual: ${formatCurrency(e.availableBalance)})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Valor a Transferir (R$)</label>
              <input type="number" class="form-control" id="transferAmount" min="10" value="25000" required step="0.01">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Justificativa Operacional</label>
              <input type="text" class="form-control" id="transferReason" placeholder="Ex: Aporte emergencial de verba de marketing" required>
            </div>

            <div class="modal-footer px-0 pb-0 pt-2 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar Transferência</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  handleTransferSubmit(e) {
    e.preventDefault();
    const originId = document.getElementById('transferOriginEvent').value;
    const destId = document.getElementById('transferDestEvent').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const reason = document.getElementById('transferReason').value;

    if (originId === destId) {
      alert("Selecione eventos diferentes para origem e destino.");
      return;
    }

    const state = financialStore.getState();
    const originEvent = state.data.events.find(ev => ev.id === originId);
    const destEvent = state.data.events.find(ev => ev.id === destId);

    if (!originEvent || !destEvent || !Number.isFinite(amount) || amount <= 0) {
      alert('Informe eventos válidos e um valor positivo.');
      return;
    }
    const transferable = financialStore.getTransferableAmount(originEvent);
    if (amount > transferable) {
      const r = financialStore.getEventRestrictions(originEvent);
      alert(`Transferência bloqueada. Transferível: ${formatCurrency(transferable)} (base ${formatCurrency(originEvent.financialBalance ?? originEvent.availableBalance)} − reservado ${formatCurrency(r.reserved)} − retido ${formatCurrency(r.retained)} − bloqueado ${formatCurrency(r.blocked)}).`);
      return;
    }

    const reference = `TRF-${Date.now()}`;
    if (state.data.ledgerEntries?.some(x => x.reference === reference || x.refOrder === reference)) {
      alert('Transferência duplicada bloqueada.');
      return;
    }

    // A transferência interna movimenta apenas saldo livre entre eventos do mesmo produtor.
    originEvent.availableBalance -= amount;
    destEvent.availableBalance += amount;

    // Uma única partida balanceada representa a transferência; não duplicamos débito/crédito em duas linhas idênticas.
    if (state.data.ledgerEntries) {
      state.data.ledgerEntries.unshift({
        id: `LED-${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        eventType: 'TRANSFERENCIA_ENTRE_EVENTOS',
        description: `Transferência interna entre eventos: ${originEvent.name} ➔ ${destEvent.name} (${reason})`,
        debitAccount: `Passivo Produtor: ${originEvent.name}`,
        creditAccount: `Passivo Produtor: ${destEvent.name}`,
        amount,
        producerId: originEvent.producerId,
        eventId: originEvent.id,
        destinationEventId: destEvent.id,
        reference,
        reconciled: true,
        internalTransfer: true
      });
    }
    financialStore.recordAudit?.('TRANSFERENCIA_ENTRE_EVENTOS', `${reference}: ${originEvent.name} → ${destEvent.name} · ${formatCurrency(amount)}`);

    this.closeModal();
    financialStore.showToast(
      "Transferência Concluída",
      `${formatCurrency(amount)} transferido de ${originEvent.name} para ${destEvent.name}`,
      "success"
    );
    this.navigate('saldos');
  }

  // ==========================================================================
  // TELA DE AUTENTICAÇÃO / LOGIN ÚNICO COM ISOLAMENTO DE PRODUTOR
  // ==========================================================================
  openLoginModal() {
    const html = `
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header" style="background: #16191f; color: white;">
          <div>
            <span class="fs-xxs text-uppercase fw-bold text-primary">AUTENTICAÇÃO CENTRAL &bull; SINGLE SIGN-ON</span>
            <h5 class="fw-bold mb-0 text-white mt-1">Acesso ao Core Financeiro Disk</h5>
          </div>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            O perfil selecionado determina permissões de visualização e regras de isolamento:
          </p>

          <div class="d-flex flex-column gap-2 mb-3">
            <button class="btn btn-outline-primary p-3 d-flex align-items-center text-start gap-3" onclick="window.switchGlobalRole('PRODUTOR'); window.app.closeModal();">
              <i class="ph-user fs-2 text-primary"></i>
              <div>
                <div class="fw-bold text-dark fs-sm">Entrar como Produtora ABC Ltda.</div>
                <div class="fs-xxs text-muted">João Silva (Diretor) &bull; Festival Curitiba 2026</div>
              </div>
            </button>

            <button class="btn btn-outline-success p-3 d-flex align-items-center text-start gap-3" onclick="financialStore.login('producer', 'prod-xyz'); window.app.closeModal();">
              <i class="ph-buildings fs-2 text-success"></i>
              <div>
                <div class="fw-bold text-dark fs-sm">Entrar como Eventos XYZ Live</div>
                <div class="fs-xxs text-muted">Mariana Souza &bull; Turnês e Festivais SP</div>
              </div>
            </button>

            <button class="btn btn-outline-warning p-3 d-flex align-items-center text-start gap-3" onclick="window.switchGlobalRole('FINANCEIRO'); window.app.closeModal();">
              <i class="ph-shield-check fs-2 text-warning"></i>
              <div>
                <div class="fw-bold text-dark fs-sm">Entrar como Financeiro Disk (Backoffice)</div>
                <div class="fs-xxs text-muted">Mesa de Aprovações &bull; Tesouraria &bull; Ledger</div>
              </div>
            </button>

            <button class="btn btn-outline-dark p-3 d-flex align-items-center text-start gap-3" onclick="window.switchGlobalRole('ADMINISTRADOR'); window.app.closeModal();">
              <i class="ph-crown fs-2 text-danger"></i>
              <div>
                <div class="fw-bold text-dark fs-sm">Entrar como Administrador Master</div>
                <div class="fs-xxs text-muted">Vinicius Casagrande &bull; Acesso Transversal Irrestrito</div>
              </div>
            </button>
          </div>

          <div class="p-2 bg-light rounded text-muted fs-xxs border">
            🔒 <strong>Governança Estrita:</strong> Produtores acessam exclusivamente seus próprios eventos e saldos. O Financeiro Disk é sempre o último signatário nas liberações bancárias.
          </div>
        </div>
      </div>
    `;
    this.showModal(html);
  }

  showModal(html) {
    this.modalContent.innerHTML = html;
    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    this.modalOverlay.classList.remove('active');
    this.modalContent.innerHTML = '';
  }

  // ==========================================================================
  // SIMULAÇÕES DO MODO DEMONSTRAÇÃO
  // ==========================================================================
  simulateCardSale() {
    financialStore.simulateCardSale(1000.00);
  }

  simulatePixSale() {
    financialStore.simulatePixSale(350.00);
  }

  simulateChargeback() {
    financialStore.simulateChargeback(450.00);
  }

  resetDemo() {
    if (confirm("Deseja restaurar todos os dados simulados para o estado original da demonstração?")) {
      financialStore.resetDemoData();
    }
  }

  // ==========================================================================
  // RENDERIZADOR CENTRAL LIMITLESS (NAVBAR, SIDEBAR E VIEWPORT)
  // ==========================================================================
  render(state) {
    const isDisk = state.viewMode === 'disk';
    const isMaster = state.currentUser.role === 'admin';

    // 1. Sincroniza Navbar Topo: Perfil & Badge
    this.renderTopNavbar(state);

    // 2. Sincroniza Sidebar Navigation (Accordion)
    this.renderSidebar(state);

    // 3. Sincroniza Page Header
    this.renderPageHeader(state);

    // 4. Popula Notificações
    this.populateNotifications(state);

    // 5. Renderiza a Barra Flutuante de Simulação e Toasts
    this.renderFloatingDemoBar(state);
    this.renderToast(state);

    // 6. Renderiza a Tela Selecionada no Viewport
    let viewHtml = '';
    try {
    if (isDisk) {
      switch (state.currentView) {
        case 'diskDashboard':
          viewHtml = renderDiskDashboard(state);
          break;
        case 'diskPosicaoGeral': viewHtml = renderDiskPosicaoGeral(state); break;
        case 'diskIndicadores': viewHtml = renderDiskIndicadores(state); break;
        case 'diskInteligencia': viewHtml = renderDiskInteligencia(state); break;
        case 'diskAprovacoes':
          viewHtml = renderDiskAprovacoes(state, this.currentFilterArg);
          break;
        case 'diskSolicitacoes':
          viewHtml = renderDiskSolicitacoes(state);
          break;
        case 'diskProdutores':
          viewHtml = renderDiskProdutores(state);
          break;
        case 'diskSaldos':
          viewHtml = renderDiskSaldos(state, this.diskBalanceTab || 'consolidado');
          break;
        case 'diskGateways':
          viewHtml = renderDiskGateways(state);
          break;
        case 'diskSpread': viewHtml = renderDiskFinanceiroAvancado(state, 'spread'); break;
        case 'diskAdvanced': viewHtml = renderDiskFinanceiroAvancado(state, 'advanced'); break;
        case 'diskDivisaoReceitas': viewHtml = renderDiskFinanceiroAvancado(state, 'split'); break;
        case 'diskCentralEstornos': viewHtml = renderDiskFinanceiroAvancado(state, 'estornos'); break;
        case 'diskLedger':
          viewHtml = renderDiskLedger(state);
          break;
        case 'diskTesouraria':
          viewHtml = renderDiskTesouraria(state);
          break;
        case 'diskContasPagar': viewHtml = renderDiskContasPagar(state); break;
        case 'diskContasReceber': viewHtml = renderDiskContasReceber(state); break;
        case 'diskFluxoCaixa': viewHtml = renderDiskFluxoCaixa(state); break;
        case 'diskPix': viewHtml = renderDiskPix(state); break;
        case 'diskCnab': viewHtml = renderDiskCnab(state); break;
        case 'diskPagamentosLote': viewHtml = renderDiskPagamentosLote(state); break;
        case 'diskTransferencias': viewHtml = renderDiskTransferencias(state); break;
        case 'diskAgendaPagamentos': viewHtml = renderDiskAgendaPagamentos(state); break;
        case 'diskConciliacao': viewHtml = renderDiskConciliacao(state); break;
        case 'diskFechamentos': viewHtml = renderDiskFechamentos(state); break;
        case 'diskControladoria': viewHtml = renderDiskControladoria(state, 'visao'); break;
        case 'diskCentrosCustos': viewHtml = renderDiskControladoria(state, 'centros'); break;
        case 'diskOrcamentos': viewHtml = renderDiskControladoria(state, 'orcamentos'); break;
        case 'diskDre': viewHtml = renderDiskControladoria(state, 'dre'); break;
        case 'diskRentabilidade': viewHtml = renderDiskControladoria(state, 'rentabilidade'); break;
        case 'diskProjecoes': viewHtml = renderDiskControladoria(state, 'projecoes'); break;
        case 'diskAssinaturas': viewHtml = renderDiskAssinaturasIntegracoes(state, 'assinaturas'); break;
        case 'diskIntegracao_assinaturas': viewHtml = renderDiskAssinaturasIntegracoes(state, 'assinaturas'); break;
        case 'diskIntegracao_documentos': viewHtml = renderDiskAssinaturasIntegracoes(state, 'documentos'); break;
        case 'diskIntegracao_autentique': viewHtml = renderDiskAssinaturasIntegracoes(state, 'autentique'); break;
        case 'diskIntegracao_contaazul': viewHtml = renderDiskAssinaturasIntegracoes(state, 'contaazul'); break;
        case 'diskIntegracao_sincronizacoes': viewHtml = renderDiskAssinaturasIntegracoes(state, 'sincronizacoes'); break;
        case 'diskIntegracao_logs': viewHtml = renderDiskAssinaturasIntegracoes(state, 'logs'); break;
        case 'diskGovernanca': viewHtml = renderDiskGovernanca(state, 'visao'); break;
        case 'diskGovernanca_visao': viewHtml = renderDiskGovernanca(state, 'visao'); break;
        case 'diskGovernanca_usuarios': viewHtml = renderDiskGovernanca(state, 'usuarios'); break;
        case 'diskGovernanca_perfis': viewHtml = renderDiskGovernanca(state, 'perfis'); break;
        case 'diskGovernanca_alcadas': viewHtml = renderDiskGovernanca(state, 'alcadas'); break;
        case 'diskGovernanca_fluxos': viewHtml = renderDiskGovernanca(state, 'fluxos'); break;
        case 'diskGovernanca_segregacao': viewHtml = renderDiskGovernanca(state, 'segregacao'); break;
        case 'diskGovernanca_sensiveis': viewHtml = renderDiskGovernanca(state, 'sensiveis'); break;
        case 'diskGovernanca_bloqueios': viewHtml = renderDiskGovernanca(state, 'bloqueios'); break;
        case 'diskGovernanca_acessos': viewHtml = renderDiskGovernanca(state, 'acessos'); break;
        case 'diskTrabalho': viewHtml = renderDiskCentralTrabalho(state, 'central'); break;
        case 'diskTrabalho_central': viewHtml = renderDiskCentralTrabalho(state, 'central'); break;
        case 'diskTrabalho_alertas': viewHtml = renderDiskCentralTrabalho(state, 'alertas'); break;
        case 'diskTrabalho_sla': viewHtml = renderDiskCentralTrabalho(state, 'sla'); break;
        case 'diskTrabalho_pendencias': viewHtml = renderDiskCentralTrabalho(state, 'pendencias'); break;
        case 'diskTrabalho_agenda': viewHtml = renderDiskCentralTrabalho(state, 'agenda'); break;
        case 'diskTrabalho_notificacoes': viewHtml = renderDiskCentralTrabalho(state, 'notificacoes'); break;
        // Telas compartilhadas: no ambiente Disk mantêm contexto administrativo,
        // sem transformar o usuário Financeiro em Produtor.
        case 'saldos':
          viewHtml = renderSaldos(state);
          break;
        case 'repasses':
          viewHtml = renderRepasses(state);
          break;
        case 'antecipacoes':
          viewHtml = renderAntecipacoes(state);
          break;
        case 'extrato':
          viewHtml = renderExtrato(state);
          break;
        case 'taxas':
          // Financeiro Disk administra taxas e regras comerciais; não reutiliza a visão contratual do Produtor.
          viewHtml = renderDiskFinanceiroAvancado(state, 'spread');
          break;
        case 'estornos':
          viewHtml = renderEstornos(state);
          break;
        case 'bordero':
          viewHtml = renderBordero(state);
          break;
        case 'relatorios':
          viewHtml = renderRelatorios(state);
          break;
        case 'dadosBancarios':
          viewHtml = renderDadosBancarios(state);
          break;
        default:
          viewHtml = this.renderDiskModulePlaceholder(state.currentView);
      }
    } else {
      switch (state.currentView) {
        case 'overview':
          viewHtml = renderOverview(state);
          break;
        case 'saldos':
          viewHtml = renderSaldos(state);
          break;
        case 'extrato':
          viewHtml = renderExtrato(state);
          break;
        case 'repasses':
          viewHtml = renderRepasses(state);
          break;
        case 'antecipacoes':
          viewHtml = renderAntecipacoes(state);
          break;
        case 'vendas':
          viewHtml = renderVendas(state);
          break;
        case 'taxas':
          viewHtml = renderTaxas(state);
          break;
        case 'estornos':
          viewHtml = renderEstornos(state);
          break;
        case 'bordero':
          viewHtml = renderBordero(state);
          break;
        case 'relatorios':
          viewHtml = renderRelatorios(state);
          break;
        case 'dadosBancarios':
          viewHtml = renderDadosBancarios(state);
          break;
        default:
          viewHtml = renderOverview(state);
      }
    }

    } catch (error) {
      console.error('[Disk Financeiro] Falha ao renderizar a tela:', state.currentView, error);
      viewHtml = `
        <div class="limitless-content">
          <div class="card-panel" style="margin-top:16px;">
            <div class="card-body" style="padding:24px;">
              <h3 style="margin:0 0 8px;">Não foi possível carregar esta tela</h3>
              <p class="text-muted" style="margin-bottom:16px;">A navegação continua disponível. Recarregue os dados da demonstração para restaurar o estado desta tela.</p>
              <button class="btn btn-primary" onclick="window.app.resetDemo()">Restaurar dados da demonstração</button>
            </div>
          </div>
        </div>`;
    }

    if (this.mainContainer) this.mainContainer.innerHTML = viewHtml;
  }

  renderDiskModulePlaceholder(viewName) {
    const catalogo = {
      'diskEventos': ['Eventos', 'Visão administrativa de todos os eventos e suas posições financeiras.', 'ph-calendar-check'],
      'diskSolicitacoes': ['Central de Solicitações', 'Solicitações de produtores reunidas em uma única esteira operacional.', 'ph-files'],
      'diskRecebiveis': ['Recebíveis e Liquidações', 'Agenda de recebíveis, liquidações e valores previstos por produtor e evento.', 'ph-arrow-up-right'],
      'diskContasPagar': ['Contas a Pagar', 'Obrigações financeiras da Disk, vencimentos, aprovações e pagamentos.', 'ph-trend-down'],
      'diskContasReceber': ['Contas a Receber', 'Títulos e valores a receber com acompanhamento de vencimentos e baixas.', 'ph-trend-up'],
      'diskConciliacao': ['Conciliação', 'Conciliação bancária, gateways, adquirentes, recebíveis e repasses.', 'ph-arrows-left-right'],
      'diskFluxoCaixa': ['Fluxo de Caixa', 'Entradas, saídas, projeções e disponibilidade financeira consolidada.', 'ph-presentation-chart'],
      'diskAssinaturas': ['Central de Assinaturas', 'Autentique • Produtor assina primeiro • Financeiro Disk assina por último.', 'ph-signature'],
      'diskIntegracao_documentos': ['Documentos', 'Modelos e documentos vinculados às operações financeiras.', 'ph-files'],
      'diskIntegracao_autentique': ['Autentique', 'Conexão, webhooks, documentos e status de assinatura.', 'ph-seal-check'],
      'diskIntegracao_contaazul': ['Conta Azul', 'OAuth 2.0, mapeamentos e sincronização ERP controlada.', 'ph-arrows-clockwise'],
      'diskIntegracao_sincronizacoes': ['Sincronizações', 'Fila de integrações, divergências, erros e reprocessamentos.', 'ph-git-merge'],
      'diskIntegracao_logs': ['Logs de Integração', 'Rastreabilidade técnica de Autentique e Conta Azul.', 'ph-terminal-window'],
      'diskFornecedores': ['Fornecedores', 'Cadastro, contratos, documentos, cotações, pedidos e vencimentos.', 'ph-buildings'],
      'diskControladoria': ['Controladoria', 'Centros de custos, orçamentos, projeções e DRE gerencial.', 'ph-chart-line-up'],
      'diskAuditoria': ['Auditoria', 'Trilha de operações, decisões, aprovações, alterações e responsáveis.', 'ph-scroll'],
      'diskConfiguracoes': ['Configurações', 'Parâmetros administrativos e integrações do ambiente Financeiro Disk.', 'ph-gear']
    };
    const [titulo, descricao, icone] = catalogo[viewName] || ['Financeiro Disk', 'Área administrativa do Módulo Financeiro V1.', 'ph-bank'];
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="rounded d-flex align-items-center justify-content-center bg-primary-subtle text-primary" style="width:48px;height:48px;">
              <i class="${icone} fs-3"></i>
            </div>
            <div>
              <div class="text-uppercase text-muted fs-xxs fw-bold">FINANCEIRO DISK</div>
              <h4 class="fw-bold mb-0">${titulo}</h4>
            </div>
          </div>
          <p class="text-muted mb-3">${descricao}</p>
          <div class="alert alert-primary border-0 mb-0 fs-xs">
            Estrutura incluída no pacote de reorganização do Financeiro Disk. Esta área permanece separada do ambiente do Produtor e será conectada ao Core Financeiro sem duplicar regras ou dados.
          </div>
        </div>
      </div>`;
  }

  renderTopNavbar(state) {
    const isDisk = state.viewMode === 'disk';
    const isMaster = state.currentUser.role === 'admin';

    // Role Indicator Badge in Header
    const roleIndicator = document.getElementById('navbar-role-indicator');
    if (roleIndicator) {
      if (isMaster) {
        roleIndicator.innerText = 'ADMINISTRADOR MASTER';
        roleIndicator.className = 'badge bg-warning text-dark fw-bold fs-xxs px-2 py-1';
      } else if (isDisk) {
        roleIndicator.innerText = 'FINANCEIRO DISK';
        roleIndicator.className = 'badge bg-success text-white fw-bold fs-xxs px-2 py-1';
      } else {
        roleIndicator.innerText = 'FINANCEIRO DO PRODUTOR';
        roleIndicator.className = 'badge bg-primary text-white fw-bold fs-xxs px-2 py-1';
      }
    }

    // Avatar Circle & Email
    const avatarCircle = document.getElementById('user-avatar-circle');
    const displayEmail = document.getElementById('user-display-email');
    const dropdownName = document.getElementById('user-dropdown-name');
    const dropdownRole = document.getElementById('user-dropdown-role');

    if (avatarCircle && displayEmail) {
      if (isMaster) {
        avatarCircle.innerText = 'VI';
        avatarCircle.style.background = '#e11d48';
        displayEmail.innerText = state.currentUser.email;
        if (dropdownName) dropdownName.innerText = state.currentUser.name;
        if (dropdownRole) dropdownRole.innerText = 'Administrador Master (Geral)';
      } else if (isDisk) {
        avatarCircle.innerText = 'MV';
        avatarCircle.style.background = '#10b981';
        displayEmail.innerText = state.currentUser.email;
        if (dropdownName) dropdownName.innerText = state.currentUser.name;
        if (dropdownRole) dropdownRole.innerText = 'Mesa de Aprovações & Tesouraria';
      } else {
        avatarCircle.innerText = state.activeProducer.id === 'prod-xyz' ? 'XYZ' : 'ABC';
        avatarCircle.style.background = '#2563eb';
        displayEmail.innerText = state.currentUser.email;
        if (dropdownName) dropdownName.innerText = state.currentUser.name;
        if (dropdownRole) dropdownRole.innerText = `${state.activeProducer.name} (${state.currentUser.title})`;
      }
    }

    // Producer Context Card in Sidebar
    const prodAvatar = document.getElementById('sidebar-producer-avatar');
    const prodName = document.getElementById('sidebar-producer-name');
    const prodBadge = document.getElementById('sidebar-producer-badge');

    if (prodAvatar && prodName && prodBadge) {
      if (isMaster) {
        prodAvatar.innerText = 'ADM';
        prodAvatar.style.background = '#e11d48';
        prodName.innerText = 'Disk Ingressos (Master)';
        prodBadge.innerText = 'Governança & Risco Total';
      } else if (isDisk) {
        prodAvatar.innerText = 'DI';
        prodAvatar.style.background = '#10b981';
        prodName.innerText = 'FINANCEIRO DISK';
        prodBadge.innerText = 'Visão administrativa geral';
      } else {
        prodAvatar.innerText = state.activeProducer.id === 'prod-xyz' ? 'XYZ' : 'ABC';
        prodAvatar.style.background = '#2563eb';
        prodName.innerText = state.activeProducer.name;
        prodBadge.innerText = state.activeProducer.rating || 'Produtor Homologado';
      }
    }

    // Sidebar Quick Action Buttons (conforme o perfil ativo)
    const quickActions = document.getElementById('sidebar-quick-actions');
    if (quickActions) {
      if (isDisk || isMaster) {
        quickActions.innerHTML = `
          <button class="btn btn-warning w-100 btn-sm text-dark fw-bold d-flex align-items-center justify-content-center gap-1" onclick="window.app.navigate('diskAprovacoes')">
            <i class="ph-scales"></i> <span>Mesa de Aprovações</span>
          </button>
          <button class="btn btn-success w-100 btn-sm fw-bold d-flex align-items-center justify-content-center gap-1" onclick="window.app.navigate('diskTesouraria')">
            <i class="ph-vault"></i> <span>Lote CNAB 240</span>
          </button>
        `;
      } else {
        quickActions.innerHTML = `
          <button class="btn btn-warning w-100 btn-sm text-black fw-bold d-flex align-items-center justify-content-center gap-1" id="quick-new-event-btn" onclick="window.app.integratedAction('novo-evento')">
            <i class="ph-calendar-plus"></i> <span>Criar Evento</span>
          </button>
          <button class="btn btn-success w-100 btn-sm fw-bold d-flex align-items-center justify-content-center gap-1" id="quick-repasse-btn" onclick="window.app.openPayoutModal()">
            <i class="ph-hand-coins"></i> <span>Solicitar Repasse</span>
          </button>
        `;
      }
    }
  }

  renderPageHeader(state) {
    const domainBadge = document.getElementById('header-domain-badge');
    const eventBadge = document.getElementById('header-event-badge');
    const viewTitle = document.getElementById('active-view-title');
    const viewSubtitle = document.getElementById('active-view-subtitle');

    const isDisk = state.viewMode === 'disk';

    if (domainBadge) {
      domainBadge.innerText = isDisk ? 'FINANCEIRO DISK' : 'FINANCEIRO DO PRODUTOR';
      domainBadge.className = isDisk ? 'badge bg-warning-subtle text-warning fw-bold fs-xxs' : 'badge bg-primary-subtle text-primary fw-bold fs-xxs';
    }

    const currentEvent = state.data.events.find(e => e.id === state.selectedEventId);
    if (eventBadge) {
      eventBadge.innerText = currentEvent ? currentEvent.name : 'Todos os Eventos (Consolidado)';
    }

    const titlesMap = {
      'overview': { title: 'Visão Geral Financeira', subtitle: 'Resumo executivo consolidado das vendas, saldos disponíveis, repasses e retenções.' },
      'saldos': { title: 'Saldos Consolidados & por Evento', subtitle: 'Saldo disponível, valores a liberar e detalhamento por evento &bull; Fonte da verdade do Ledger.' },
      'extrato': { title: 'Extrato Financeiro Completo', subtitle: 'Livro-caixa unificado de vendas, liquidações, taxas, estornos e transferências.' },
      'repasses': { title: 'Gestão de Repasses Financeiros', subtitle: 'Solicitações de repasse, esteira de assinaturas digitais e comprovantes bancários.' },
      'antecipacoes': { title: 'Antecipação de Recebíveis', subtitle: 'Simulação e contratação de antecipação com taxas contratuais transparentes.' },
      'vendas': { title: 'Vendas & Recebimentos', subtitle: 'Acompanhamento do volume de vendas brutas, canais de pagamento e prazos de liquidação.' },
      'taxas': { title: 'Taxas & Custos Operacionais', subtitle: 'Demonstrativo detalhado de taxas Disk, processamento gateway, parcelamento e retenções.' },
      'estornos': { title: 'Estornos & Chargebacks', subtitle: 'Gestão de cancelamentos voluntários, disputas de contestação de compras e reservas cautelares.' },
      'bordero': { title: 'Borderô & Fechamento de Eventos', subtitle: 'Conferência final de bilheteria, custos, deduções e termo de encerramento assinado.' },
      'relatorios': { title: 'Relatórios Financeiros', subtitle: 'Demonstrativos gerenciais, curva de vendas e exportação oficial em PDF e Excel.' },
      'dadosBancarios': { title: 'Dados Bancários & Chaves PIX', subtitle: 'Contas bancárias PJ homologadas para recebimento dos repasses automáticos.' },
      'diskDashboard': { title: 'Dashboard Financeiro', subtitle: 'Central executiva e operacional: posição, pendências e ações prioritárias.' },
      'diskPosicaoGeral': { title: 'Posição Geral', subtitle: 'Fotografia consolidada de disponibilidades, recebíveis, obrigações, reservas e posição líquida.' },
      'diskIndicadores': { title: 'Indicadores', subtitle: 'KPIs de desempenho financeiro com origem rastreável e contexto Produtor × Evento.' },
      'diskInteligencia': { title: 'Inteligência Financeira', subtitle: 'Anomalias, prioridades e leituras acionáveis a partir dos dados financeiros existentes.' },
      'diskAprovacoes': { title: 'Central Unificada de Aprovações', subtitle: 'Workflow transversal &bull; Governança Maker/Checker &bull; Assinaturas sequenciais &bull; SLA.' },
      'diskProdutores': { title: 'Produtores', subtitle: 'Contas financeiras, contratos, travas, limites e histórico de todos os produtores.' },
      'diskSpread': { title: 'Spread & Adquirentes', subtitle: 'Receitas, custos MDR, spread líquido e rentabilidade do ecossistema de pagamentos.' },
      'diskAdvanced': { title: 'Financeiro Advanced', subtitle: 'Fluxo previsto x realizado e planejamento de liquidez.' },
      'diskDivisaoReceitas': { title: 'Divisão de Receitas', subtitle: 'Split financeiro automatizado com rastreabilidade por venda e beneficiário.' },
      'diskCentralEstornos': { title: 'Central de Estornos', subtitle: 'Devoluções, aprovações, chargebacks, conciliação e reversões.' },
      'diskGateways': { title: 'Gateways, Adquirentes & MDR', subtitle: 'Roteamento inteligente de transações, taxas de adquirência e spread comercial Disk (1,22%).' },
      'diskLedger': { title: 'Ledger Financeiro', subtitle: 'Movimentações financeiras imutáveis, conciliação e rastreabilidade de cada operação.' },
      'diskTesouraria': { title: 'Tesouraria', subtitle: 'Contas bancárias, PIX, CNAB, pagamentos, lotes e movimentações da Disk.' },
      'diskPix': { title: 'PIX', subtitle: 'Pagamentos instantâneos, chaves homologadas e retorno bancário.' },
      'diskCnab': { title: 'CNAB', subtitle: 'Remessas e retornos bancários CNAB 240/400.' },
      'diskPagamentosLote': { title: 'Pagamentos em Lote', subtitle: 'Preparação, aprovação e execução de lotes de pagamentos.' },
      'diskTransferencias': { title: 'Transferências', subtitle: 'Movimentações autorizadas entre contas financeiras da Disk.' },
      'diskAgendaPagamentos': { title: 'Agenda de Pagamentos', subtitle: 'Calendário de vencimentos, repasses e obrigações.' },
      'diskEventos': { title: 'Eventos', subtitle: 'Visão financeira administrativa de todos os eventos.' },
      'diskSolicitacoes': { title: 'Central de Solicitações', subtitle: 'Solicitações recebidas de todos os produtores.' },
      'diskRecebiveis': { title: 'Recebíveis e Liquidações', subtitle: 'Agenda de recebíveis e liquidações por produtor e evento.' },
      'diskContasPagar': { title: 'Contas a Pagar', subtitle: 'Obrigações, vencimentos e pagamentos da operação Disk.' },
      'diskContasReceber': { title: 'Contas a Receber', subtitle: 'Títulos, vencimentos e baixas da operação Disk.' },
      'diskConciliacao': { title: 'Conciliação', subtitle: 'Bancos, gateways, adquirentes, recebíveis e repasses.' },
      'diskFluxoCaixa': { title: 'Fluxo de Caixa', subtitle: 'Fluxo realizado e projetado da operação financeira.' },
      'diskAssinaturas': { title: 'Assinaturas Digitais', subtitle: 'Esteira de assinaturas com a Disk sempre como último signatário.' },
      'diskFornecedores': { title: 'Fornecedores', subtitle: 'Cadastro, contratos, documentos, cotações, pedidos e vencimentos.' },
      'diskControladoria': { title: 'Controladoria Financeira', subtitle: 'Visão consolidada de orçamento, custos, resultado e projeções.' },
      'diskCentrosCustos': { title: 'Centros de Custos', subtitle: 'Custos por área, produtor e evento com análise de desvios.' },
      'diskOrcamentos': { title: 'Orçamentos', subtitle: 'Planejamento, realizado, comprometido e revisões orçamentárias.' },
      'diskDre': { title: 'DRE Gerencial', subtitle: 'Resultado gerencial da operação Financeiro Disk.' },
      'diskRentabilidade': { title: 'Rentabilidade', subtitle: 'Margem e resultado por evento e produtor.' },
      'diskProjecoes': { title: 'Projeções', subtitle: 'Cenários e projeções financeiras sem alterar saldos reais.' },
      'diskAuditoria': { title: 'Auditoria', subtitle: 'Trilha completa das operações e decisões financeiras.' },
      'diskConfiguracoes': { title: 'Configurações', subtitle: 'Parâmetros administrativos do Financeiro Disk.' }
    };

    const currentInfo = titlesMap[state.currentView] || { title: 'Módulo Financeiro', subtitle: 'Sistema integrado de gestão financeira Disk Ingressos.' };
    if (viewTitle) viewTitle.innerText = currentInfo.title;
    if (viewSubtitle) viewSubtitle.innerHTML = currentInfo.subtitle;
  }

  populateNotifications(state) {
    const list = document.getElementById('notification-list-container');
    const badge = document.getElementById('notification-badge');
    const countBadge = document.getElementById('notification-count-badge');

    const pendingQueue = state.data.approvalQueue.filter(a => a.status !== 'Pago');

    if (badge && countBadge) {
      badge.innerText = `${pendingQueue.length}`;
      countBadge.innerText = `${pendingQueue.length} Pendentes`;
      badge.style.display = pendingQueue.length > 0 ? '' : 'none';
    }

    if (list) {
      if (pendingQueue.length === 0) {
        list.innerHTML = `<div class="p-3 text-center text-muted fs-xs">Sem notificações pendentes</div>`;
      } else {
        list.innerHTML = pendingQueue.map(item => `
          <div class="p-2 px-3 border-bottom d-flex align-items-center justify-content-between hover-bg" style="cursor: pointer;" onclick="window.app.openApprovalSheet('${item.id}')">
            <div>
              <div class="fw-bold fs-xs text-dark">${item.type} #${item.id}</div>
              <div class="fs-xxs text-muted">${item.eventName} &bull; ${formatCurrency(item.requestedAmount)}</div>
            </div>
            <span class="badge ${item.status === 'Rejeitado' ? 'bg-danger' : 'bg-warning text-dark'} fs-xxs">
              ${item.status}
            </span>
          </div>
        `).join('');
      }
    }
  }

  // ==========================================================================
  // RENDERIZADOR DA SIDEBAR (ACCORDION & CANONICAL SUBMENUS POR PERFIL)
  // REGRA: Nunca renderizar menus duplicados. Uma única sidebar muda seus itens por perfil.
  // ==========================================================================
  renderSidebar(state) {
    if (!this.sidebarNav) return;

    const isDisk = state.viewMode === 'disk';
    const isMaster = state.currentUser.role === 'admin';
    const pendingCount = state.pendingApprovalsCount || 17;
    const currentView = state.currentView;

    const active = (view) => currentView === view ? 'active' : '';

    if (isDisk || isMaster) {
      // MENU FINANCEIRO DISK — AMBIENTE ADMINISTRATIVO GERAL
      // O Financeiro Disk permanece Financeiro Disk mesmo quando filtra um produtor/evento.
      this.sidebarNav.innerHTML = `
        <li class="nav-item-section-divider"><i class="ph-bank"></i> FINANCEIRO DISK</li>
        <li class="nav-item-section-divider"><i class="ph-chart-line"></i> Visão Geral</li>
        <li class="nav-item"><a class="nav-link ${active('diskDashboard')}" onclick="window.app.navigate('diskDashboard')"><i class="ph-chart-pie-slice fs-5"></i><span>Dashboard Financeiro</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskPosicaoGeral')}" onclick="window.app.navigate('diskPosicaoGeral')"><i class="ph-wallet fs-5"></i><span>Posição Geral</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskIndicadores')}" onclick="window.app.navigate('diskIndicadores')"><i class="ph-gauge fs-5"></i><span>Indicadores</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskInteligencia')}" onclick="window.app.navigate('diskInteligencia')"><i class="ph-brain fs-5"></i><span>Inteligência Financeira</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-buildings"></i> Produtores e Eventos</li>
        <li class="nav-item"><a class="nav-link ${active('diskProdutores')}" onclick="window.app.navigate('diskProdutores')"><i class="ph-users fs-5"></i><span>Produtores</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskEventos')}" onclick="window.app.navigate('diskEventos')"><i class="ph-calendar-check fs-5"></i><span>Eventos</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskSaldos')}" onclick="window.app.navigate('diskSaldos')"><i class="ph-currency-circle-dollar fs-5"></i><span>Saldos</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-scales"></i> Solicitações e Aprovações</li>
        <li class="nav-item"><a class="nav-link ${active('diskSolicitacoes')}" onclick="window.app.navigate('diskSolicitacoes')"><i class="ph-files fs-5"></i><span>Central de Solicitações</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskAprovacoes')} d-flex align-items-center" onclick="window.app.navigate('diskAprovacoes')"><i class="ph-scales fs-5 text-warning"></i><span>Central de Aprovações</span><span class="badge rounded-pill bg-danger fs-xxs ms-auto">${pendingCount}</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('repasses')}" onclick="window.app.navigate('repasses')"><i class="ph-hand-coins fs-5"></i><span>Repasses</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('antecipacoes')}" onclick="window.app.navigate('antecipacoes')"><i class="ph-trend-up fs-5"></i><span>Antecipações</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskAssinaturas')}" onclick="window.app.navigate('diskAssinaturas')"><i class="ph-signature fs-5"></i><span>Central de Assinaturas</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-arrow-up-right"></i> Recebíveis e Liquidações</li>
        <li class="nav-item"><a class="nav-link ${active('diskRecebiveis')}" onclick="window.app.navigate('diskRecebiveis')"><i class="ph-calendar-dots fs-5"></i><span>Recebíveis e Liquidações</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskContasReceber')}" onclick="window.app.navigate('diskContasReceber')"><i class="ph-arrow-up-right fs-5"></i><span>Contas a Receber</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-credit-card"></i> Processamento e Regras</li>
        <li class="nav-item"><a class="nav-link ${active('diskGateways')}" onclick="window.app.navigate('diskGateways')"><i class="ph-cpu fs-5"></i><span>Gateways e Adquirentes</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskSpread')}" onclick="window.app.navigate('diskSpread')"><i class="ph-percent fs-5"></i><span>Spread & Adquirentes</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskDivisaoReceitas')}" onclick="window.app.navigate('diskDivisaoReceitas')"><i class="ph-arrows-split fs-5"></i><span>Divisão de Receitas</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('taxas')}" onclick="window.app.navigate('taxas')"><i class="ph-percent fs-5"></i><span>Taxas e Regras Comerciais</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskCentralEstornos')}" onclick="window.app.navigate('diskCentralEstornos')"><i class="ph-arrow-counter-clockwise fs-5"></i><span>Central de Estornos</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-vault"></i> Tesouraria</li>
        <li class="nav-item"><a class="nav-link ${active('diskTesouraria')}" onclick="window.app.navigate('diskTesouraria')"><i class="ph-vault fs-5"></i><span>Tesouraria</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskPix')}" onclick="window.app.navigate('diskPix')"><i class="ph-qr-code fs-5"></i><span>PIX</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskCnab')}" onclick="window.app.navigate('diskCnab')"><i class="ph-file-arrow-up fs-5"></i><span>CNAB</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskPagamentosLote')}" onclick="window.app.navigate('diskPagamentosLote')"><i class="ph-stack fs-5"></i><span>Pagamentos em Lote</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskTransferencias')}" onclick="window.app.navigate('diskTransferencias')"><i class="ph-arrows-left-right fs-5"></i><span>Transferências</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskAgendaPagamentos')}" onclick="window.app.navigate('diskAgendaPagamentos')"><i class="ph-calendar-check fs-5"></i><span>Agenda de Pagamentos</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('dadosBancarios')}" onclick="window.app.navigate('dadosBancarios')"><i class="ph-bank fs-5"></i><span>Contas Bancárias</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskContasPagar')}" onclick="window.app.navigate('diskContasPagar')"><i class="ph-trend-down fs-5"></i><span>Contas a Pagar</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskFluxoCaixa')}" onclick="window.app.navigate('diskFluxoCaixa')"><i class="ph-presentation-chart fs-5"></i><span>Fluxo de Caixa</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskAdvanced')}" onclick="window.app.navigate('diskAdvanced')"><i class="ph-trend-up fs-5"></i><span>Financeiro Advanced</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-arrows-left-right"></i> Controle e Conciliação</li>
        <li class="nav-item"><a class="nav-link ${active('diskConciliacao')}" onclick="window.app.navigate('diskConciliacao')"><i class="ph-arrows-left-right fs-5"></i><span>Conciliação</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskLedger')}" onclick="window.app.navigate('diskLedger')"><i class="ph-book-bookmark fs-5"></i><span>Ledger Financeiro</span></a></li>
        <li class="nav-item-section-divider"><i class="ph-seal-check"></i> Fechamento e Prestação de Contas</li>
        <li class="nav-item"><a class="nav-link ${active('diskFechamentos')}" onclick="window.app.navigate('diskFechamentos')"><i class="ph-folder-lock fs-5"></i><span>Fechamentos e Dossiês</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('bordero')}" onclick="window.app.navigate('bordero')"><i class="ph-file-text fs-5"></i><span>Borderôs</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-buildings"></i> Gestão e Controladoria</li>
        <li class="nav-item"><a class="nav-link ${active('diskFornecedores')}" onclick="window.app.navigate('diskFornecedores')"><i class="ph-buildings fs-5"></i><span>Fornecedores</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskControladoria')}" onclick="window.app.navigate('diskControladoria')"><i class="ph-chart-line-up fs-5"></i><span>Controladoria</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskCentrosCustos')}" onclick="window.app.navigate('diskCentrosCustos')"><i class="ph-tree-structure fs-5"></i><span>Centros de Custos</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskOrcamentos')}" onclick="window.app.navigate('diskOrcamentos')"><i class="ph-calculator fs-5"></i><span>Orçamentos</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskDre')}" onclick="window.app.navigate('diskDre')"><i class="ph-table fs-5"></i><span>DRE Gerencial</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskRentabilidade')}" onclick="window.app.navigate('diskRentabilidade')"><i class="ph-chart-bar fs-5"></i><span>Rentabilidade</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskProjecoes')}" onclick="window.app.navigate('diskProjecoes')"><i class="ph-chart-line fs-5"></i><span>Projeções</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-plugs-connected"></i> Assinaturas e Integrações</li>
        <li class="nav-item"><a class="nav-link ${active('diskIntegracao_documentos')}" onclick="window.app.navigate('diskIntegracao_documentos')"><i class="ph-files fs-5"></i><span>Documentos</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskIntegracao_autentique')}" onclick="window.app.navigate('diskIntegracao_autentique')"><i class="ph-seal-check fs-5"></i><span>Autentique</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskIntegracao_contaazul')}" onclick="window.app.navigate('diskIntegracao_contaazul')"><i class="ph-arrows-clockwise fs-5"></i><span>Conta Azul</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskIntegracao_sincronizacoes')}" onclick="window.app.navigate('diskIntegracao_sincronizacoes')"><i class="ph-git-merge fs-5"></i><span>Sincronizações</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskIntegracao_logs')}" onclick="window.app.navigate('diskIntegracao_logs')"><i class="ph-terminal-window fs-5"></i><span>Logs de Integração</span></a></li>



        <li class="nav-item-section-divider"><i class="ph-bell-ringing"></i> Operação Diária</li>
        <li class="nav-item"><a class="nav-link ${active('diskTrabalho')}" onclick="window.app.navigate('diskTrabalho')"><i class="ph-kanban fs-5"></i><span>Central de Trabalho</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskTrabalho_alertas')}" onclick="window.app.navigate('diskTrabalho_alertas')"><i class="ph-bell fs-5"></i><span>Alertas</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskTrabalho_sla')}" onclick="window.app.navigate('diskTrabalho_sla')"><i class="ph-timer fs-5"></i><span>SLA Financeiro</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskTrabalho_pendencias')}" onclick="window.app.navigate('diskTrabalho_pendencias')"><i class="ph-list-checks fs-5"></i><span>Pendências</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskTrabalho_agenda')}" onclick="window.app.navigate('diskTrabalho_agenda')"><i class="ph-calendar-dots fs-5"></i><span>Agenda Operacional</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-shield-check"></i> Governança Financeira</li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca')}" onclick="window.app.navigate('diskGovernanca')"><i class="ph-shield-check fs-5"></i><span>Visão Geral</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_usuarios')}" onclick="window.app.navigate('diskGovernanca_usuarios')"><i class="ph-users-three fs-5"></i><span>Usuários Financeiros</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_perfis')}" onclick="window.app.navigate('diskGovernanca_perfis')"><i class="ph-key fs-5"></i><span>Perfis e Permissões</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_alcadas')}" onclick="window.app.navigate('diskGovernanca_alcadas')"><i class="ph-stairs fs-5"></i><span>Alçadas de Aprovação</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_fluxos')}" onclick="window.app.navigate('diskGovernanca_fluxos')"><i class="ph-flow-arrow fs-5"></i><span>Fluxos de Aprovação</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_segregacao')}" onclick="window.app.navigate('diskGovernanca_segregacao')"><i class="ph-user-switch fs-5"></i><span>Segregação de Funções</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_sensiveis')}" onclick="window.app.navigate('diskGovernanca_sensiveis')"><i class="ph-lock-key fs-5"></i><span>Operações Sensíveis</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_bloqueios')}" onclick="window.app.navigate('diskGovernanca_bloqueios')"><i class="ph-warning fs-5"></i><span>Bloqueios e Exceções</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskGovernanca_acessos')}" onclick="window.app.navigate('diskGovernanca_acessos')"><i class="ph-fingerprint fs-5"></i><span>Auditoria de Acessos</span></a></li>

        <li class="nav-item-section-divider"><i class="ph-file-text"></i> Informação e Administração</li>
        <li class="nav-item"><a class="nav-link ${active('extrato')}" onclick="window.app.navigate('extrato')"><i class="ph-receipt fs-5"></i><span>Extrato Financeiro</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('relatorios')}" onclick="window.app.navigate('relatorios')"><i class="ph-file-text fs-5"></i><span>Relatórios</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskAuditoria')}" onclick="window.app.navigate('diskAuditoria')"><i class="ph-scroll fs-5"></i><span>Auditoria</span></a></li>
        <li class="nav-item"><a class="nav-link ${active('diskConfiguracoes')}" onclick="window.app.navigate('diskConfiguracoes')"><i class="ph-gear fs-5"></i><span>Configurações</span></a></li>
      `;
      return;
    }

    // MENU OFICIAL DO PRODUTOR (CANÔNICO DE 11 ITENS, SEM MENUS FLUTUANTES)
    this.sidebarNav.innerHTML = `
      <li class="nav-item">
        <a class="nav-link ${active('overview')}" onclick="window.app.navigate('overview')">
          <i class="ph-chart-pie-slice fs-5"></i>
          <span>Visão Geral</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('saldos')}" onclick="window.app.navigate('saldos')">
          <i class="ph-currency-circle-dollar fs-5"></i>
          <span>Saldos</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('extrato')}" onclick="window.app.navigate('extrato')">
          <i class="ph-receipt fs-5"></i>
          <span>Extrato Financeiro</span>
        </a>
      </li>

      <!-- REPASSES -->
      <li class="nav-item nav-item-submenu ${['repasses'].includes(currentView) ? 'is-open' : ''}">
        <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
          <i class="ph-hand-coins fs-5"></i>
          <span>Repasses</span>
          <i class="ph-caret-right nav-arrow ms-auto"></i>
        </a>
        <ul class="nav-group-sub">
          <li class="nav-item">
            <a class="nav-link" onclick="window.app.openPayoutModal()">
              <i class="ph-plus-circle me-1"></i> Solicitar Repasse
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${active('repasses')}" onclick="window.app.navigate('repasses')">
              <i class="ph-clock-countdown me-1"></i> Minhas Solicitações
            </a>
          </li>
        </ul>
      </li>

      <!-- ANTECIPAÇÕES -->
      <li class="nav-item nav-item-submenu ${['antecipacoes'].includes(currentView) ? 'is-open' : ''}">
        <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
          <i class="ph-trend-up fs-5"></i>
          <span>Antecipações</span>
          <i class="ph-caret-right nav-arrow ms-auto"></i>
        </a>
        <ul class="nav-group-sub">
          <li class="nav-item">
            <a class="nav-link ${active('antecipacoes')}" onclick="window.app.navigate('antecipacoes')">
              <i class="ph-calculator me-1"></i> Simular Antecipação
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" onclick="window.app.navigate('antecipacoes')">
              <i class="ph-files me-1"></i> Minhas Solicitações
            </a>
          </li>
        </ul>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('vendas')}" onclick="window.app.navigate('vendas')">
          <i class="ph-shopping-cart fs-5"></i>
          <span>Vendas &amp; Recebimentos</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('taxas')}" onclick="window.app.navigate('taxas')">
          <i class="ph-percent fs-5"></i>
          <span>Taxas &amp; Descontos</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('estornos')}" onclick="window.app.navigate('estornos')">
          <i class="ph-warning-octagon fs-5"></i>
          <span>Estornos &amp; Chargebacks</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('bordero')}" onclick="window.app.navigate('bordero')">
          <i class="ph-signature fs-5"></i>
          <span>Borderôs</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('relatorios')}" onclick="window.app.navigate('relatorios')">
          <i class="ph-file-text fs-5"></i>
          <span>Relatórios</span>
        </a>
      </li>

      <li class="nav-item">
        <a class="nav-link ${active('dadosBancarios')}" onclick="window.app.navigate('dadosBancarios')">
          <i class="ph-credit-card fs-5"></i>
          <span>Dados Bancários &amp; PIX</span>
        </a>
      </li>
    `;
  }

  // ==========================================================================
  // BARRA FLUTUANTE DO MODO DEMONSTRAÇÃO (ISOLADA DA NAVEGAÇÃO OFICIAL)
  // ==========================================================================
  renderFloatingDemoBar(state) {
    let bar = document.getElementById('demoFloatingBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'demoFloatingBar';
      bar.className = 'demo-floating-bar';
      document.body.appendChild(bar);
    }

    const isDisk = state.viewMode === 'disk';
    const isMaster = state.currentUser.role === 'admin';
    const isProducer = !isDisk && !isMaster;

    bar.innerHTML = `
      <span class="demo-badge-pill">🎮 Modo Demonstração</span>

      <div class="d-flex align-items-center gap-1 ms-1 me-2">
        <button class="demo-role-btn ${isProducer ? 'active-produtor' : ''}" onclick="window.switchGlobalRole('PRODUTOR')" title="Alternar para perfil Produtor">
          <i class="ph-user"></i> <span>Produtor</span>
        </button>
        <button class="demo-role-btn ${isDisk && !isMaster ? 'active-disk' : ''}" onclick="window.switchGlobalRole('FINANCEIRO')" title="Alternar para Mesa Financeira Disk (Backoffice)">
          <i class="ph-shield-check"></i> <span>Financeiro Disk</span>
        </button>
        <button class="demo-role-btn ${isMaster ? 'active-admin' : ''}" onclick="window.switchGlobalRole('ADMINISTRADOR')" title="Alternar para Administrador Master (Acesso Total)">
          <i class="ph-crown"></i> <span>Admin Master</span>
        </button>
      </div>

      <span style="width: 1px; height: 22px; background: rgba(255,255,255,0.2); margin: 0 4px;"></span>

      <button class="demo-action-btn" onclick="window.app.simulateCardSale()" title="Simula venda de R$ 1.000 no cartão via Cielo">
        + Venda Cartão (R$ 1.000)
      </button>
      <button class="demo-action-btn" onclick="window.app.simulatePixSale()" title="Simula venda de R$ 350 via PIX (liberação D+0)">
        + Venda PIX (R$ 350)
      </button>
      <button class="demo-action-btn" onclick="window.app.simulateChargeback()" title="Simula contestação com retenção cautelar">
        + Chargeback (R$ 450)
      </button>
      <button class="demo-action-btn reset" onclick="window.app.resetDemo()" title="Restaura os dados originais">
        ↻ Reset Demo
      </button>
    `;
  }

  renderToast(state) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    if (!state.activeToast) {
      container.innerHTML = '';
      return;
    }

    const t = state.activeToast;
    const badgeClass = t.type === 'danger' ? 'toast-danger' : (t.type === 'warning' ? 'toast-warning' : 'toast-success');

    container.innerHTML = `
      <div class="limitless-toast ${badgeClass}">
        <div>
          <div class="toast-title">${t.title}</div>
          <div class="toast-message">${t.message}</div>
        </div>
        <button class="toast-close" onclick="window.app.closeToast()">&times;</button>
      </div>
    `;
  }

  integratedAction(action, options = {}) {
    const registry = {
      'novo-evento': { route: 'diskEventos', title: 'Eventos', message: 'Assistente de novo evento aberto no contexto Financeiro Disk.' },
      'nova-adquirente': { route: 'diskGateways', title: 'Gateways e Adquirentes', message: 'Cadastro de adquirente iniciado. A configuração será compartilhada com MDR e Conciliação.' },
      'gerenciar-adquirente': { route: 'diskGateways', title: 'Gateways e Adquirentes', message: 'Adquirente selecionada para gerenciamento de MDR, bandeiras e liquidações.' },
      'transmitir-cnab': { route: 'diskCnab', title: 'CNAB', message: 'Lote encaminhado para a esteira CNAB. O retorno será refletido em Tesouraria, Conciliação e Ledger.' },
      'gerar-cnab': { route: 'diskCnab', title: 'CNAB', message: 'Remessa CNAB preparada e registrada na agenda operacional.' },
      'conta-padrao': { route: 'dadosBancarios', title: 'Contas Bancárias', message: 'Conta marcada como padrão no contexto atual e comunicada à Tesouraria.' },
      'aplicar-relatorio': { route: 'relatorios', title: 'Relatórios', message: 'Filtros aplicados. O relatório respeita o contexto Produtor → Evento selecionado.' },
      'abrir-aprovacoes': { route: 'diskAprovacoes', title: 'Central de Aprovações', message: 'Fila de aprovações aberta com o mesmo contexto operacional.' },
      'abrir-assinaturas': { route: 'diskAssinaturas', title: 'Central de Assinaturas', message: 'Documentos e assinaturas vinculados à operação carregados.' },
      'abrir-tesouraria': { route: 'diskTesouraria', title: 'Tesouraria', message: 'Operação encaminhada para a Tesouraria.' },
      'abrir-conciliacao': { route: 'diskConciliacao', title: 'Conciliação', message: 'Conciliação aberta preservando o protocolo financeiro.' },
      'abrir-ledger': { route: 'diskLedger', title: 'Ledger Financeiro', message: 'Rastreabilidade financeira da operação aberta.' },
      'abrir-contaazul': { route: 'diskIntegracao_contaazul', title: 'Conta Azul', message: 'Central de sincronização Conta Azul aberta.' },
      'abrir-autentique': { route: 'diskIntegracao_autentique', title: 'Autentique', message: 'Central Autentique aberta para documentos e assinaturas.' }
    };
    const cfg = registry[action];
    if (!cfg) {
      financialStore.showToast('Ação não mapeada', 'Esta ação ainda não possui destino operacional configurado.', 'warning');
      return;
    }
    financialStore.showToast(cfg.title, cfg.message, 'info', { action, ...options });
    if (cfg.route) this.navigate(cfg.route, options.filter || null);
  }

  p18Tab(tab, btn) {
    const box=document.getElementById('p18-tab-content'); if(!box) return;
    box.innerHTML=renderGatewayTab(financialStore,tab);
    if(btn){ btn.parentElement.querySelectorAll('button').forEach(b=>b.className='btn btn-light btn-sm'); btn.className='btn btn-primary btn-sm'; }
  }

  p18Action(action,id='') {
    try {
      if(action==='novo' || action==='editar') return this.openGatewayModal(id);
      if(action==='testar'){ const r=financialStore.testGatewayConnection(id); financialStore.showToast(r.ready?'Credenciais cadastradas':'Integração pendente',r.ready?'Os dados mínimos estão cadastrados. O teste real com o provedor depende do backend/endpoint homologado.':'Complete as credenciais antes do teste.','warning'); return this.render(); }
      if(action==='status'){ const r=financialStore.toggleGateway(id); financialStore.showToast('Situação atualizada',`${r.name}: ${r.enabled?'Ativo':'Inativo'}.`,'success'); return this.render(); }
      if(action==='logs'){ this.p18Tab('logs'); return; }
      if(action.startsWith('configurar-')) return this.openGatewaySectionModal(id,action.replace('configurar-',''));
    } catch(e){ financialStore.showToast('Não foi possível concluir',e.message,'danger'); }
  }

  openGatewayModal(id='') {
    const g=(financialStore.data.gatewayConfigs||[]).find(x=>x.id===id)||{};
    this.showModal(`<div class="modal-card" style="max-width:760px"><div class="modal-header"><div><h4 class="mb-0">${id?'Editar Gateway':'Novo Gateway'}</h4><div class="text-muted fs-sm">Cadastro operacional. Credenciais sensíveis permanecem mascaradas.</div></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitGateway(event,'${id}')"><div class="row g-3"><div class="col-md-8"><label class="form-label">Nome</label><input class="form-control" name="name" required value="${g.name||''}"></div><div class="col-md-4"><label class="form-label">Ambiente</label><select class="form-select" name="environment"><option ${g.environment==='Produção'?'selected':''}>Produção</option><option ${g.environment==='Sandbox'?'selected':''}>Sandbox</option></select></div><div class="col-md-6"><label class="form-label">Merchant ID</label><input class="form-control" name="merchantId" value="${g.merchantId||''}"></div><div class="col-md-6"><label class="form-label">Client ID</label><input class="form-control" name="clientId" value="${g.clientId||''}"></div><div class="col-12"><label class="form-label">Secret / Token</label><input class="form-control" type="password" name="secret" placeholder="Deixe em branco para manter o atual"><div class="form-text">No ambiente real este valor deve ser enviado ao backend/secret manager, nunca persistido em texto aberto no React.</div></div></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Salvar configuração</button></div></form></div>`);
  }
  submitGateway(e,id=''){ e.preventDefault(); const f=new FormData(e.target); const secret=String(f.get('secret')||''); const r=financialStore.saveGatewayConfig({name:f.get('name'),environment:f.get('environment'),merchantId:f.get('merchantId'),clientId:f.get('clientId'),secretConfigured:secret?true:undefined},id||null); this.closeModal(); financialStore.showToast('Gateway salvo',`${r.name} atualizado com sucesso na configuração local.`,'success'); this.render(); }

  openGatewaySectionModal(id,key){ const g=financialStore.data.gatewayConfigs.find(x=>x.id===id); if(!g)return; const titles={cred:'Credenciais',cards:'Bandeiras e Cartões',pix:'PIX',boleto:'Boletos',installments:'Parcelamento',antifraud:'Antifraude',webhooks:'Webhooks'}; const current=g[key]||{}; let fields=''; if(key==='cards') fields=`<label class="form-label">Bandeiras aceitas (separadas por vírgula)</label><input class="form-control" name="cards" value="${(g.cards||[]).join(', ')}">`; else fields=`<label class="form-label">Ativo</label><select class="form-select mb-3" name="enabled"><option value="true" ${current.enabled?'selected':''}>Sim</option><option value="false" ${!current.enabled?'selected':''}>Não</option></select><label class="form-label">Configuração / observação</label><input class="form-control" name="note" value="${current.note||''}" placeholder="Parâmetro operacional">`; this.showModal(`<div class="modal-card" style="max-width:620px"><div class="modal-header"><h4 class="mb-0">${titles[key]||key} · ${g.name}</h4><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitGatewaySection(event,'${id}','${key}')">${fields}<div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Salvar</button></div></form></div>`); }
  submitGatewaySection(e,id,key){ e.preventDefault(); const f=new FormData(e.target); if(key==='cards'){ const g=financialStore.data.gatewayConfigs.find(x=>x.id===id); g.cards=String(f.get('cards')||'').split(',').map(x=>x.trim()).filter(Boolean); g.updatedAt=new Date().toLocaleString('pt-BR'); g.logs.unshift({at:g.updatedAt,action:'Bandeiras atualizadas',actor:financialStore.state.currentUser.name}); financialStore.notify(); } else financialStore.updateGatewaySection(id,key,{enabled:f.get('enabled')==='true',note:f.get('note')||''}); this.closeModal(); financialStore.showToast('Configuração salva','A alteração foi persistida e está disponível para os módulos relacionados.','success'); this.render(); }

  financeAction(action, id = '') {
    const routes = {
      'nova-regra': 'diskGovernanca_alcadas',
      'editar-alcadas': 'diskGovernanca_alcadas',
      'detalhar-regra': 'diskGovernanca_fluxos',
      'atualizar-central': 'diskTrabalho'
    };
    const labels = {
      'nova-regra': 'Nova regra preparada para configuração',
      'editar-alcadas': 'Matriz de alçadas aberta para edição',
      'detalhar-regra': `Regra ${id !== '' ? Number(id)+1 : ''} aberta com seu fluxo relacionado`,
      'atualizar-central': 'Central de Trabalho atualizada e filas sincronizadas'
    };
    financialStore.showToast('Ação Financeira', labels[action] || 'Ação executada e comunicada ao módulo relacionado.', 'info');
    if (routes[action]) this.navigate(routes[action]);
  }

  p13Action(action, id = '') {
    try {
      if (action === 'nova-taxa' || action === 'editar-taxa' || action === 'duplicar-taxa') return this.openSpreadRuleModal(action, id);
      if (action === 'status-taxa') { const r=financialStore.setSpreadRuleStatus(id); financialStore.showToast('Situação atualizada',`${r.name}: ${r.status}.`,'success'); return; }
      if (action === 'historico-taxa') return this.openSpreadHistory(id);
      if (action === 'excluir-taxa') { try { const r=financialStore.deleteSpreadRule(id); financialStore.showToast('Regra excluída',`${r.name} removida por não possuir histórico de uso/versão.`,'success'); } catch(e){ financialStore.showToast('Regra preservada',e.message,'warning'); } return; }
      if (action === 'novo-lancamento') return this.openPayableModal();
      if (action === 'novo-estorno') return this.openRefundModal();
      if (action === 'editar-split') return this.openSplitModal(id);
      if (action === 'liquidar') {
        const row = financialStore.liquidatePayable(id);
        financialStore.showToast('Título liquidado', `${row.id} · ${row.creditor} foi liquidado e enviado ao Ledger.`, 'success');
        return this.navigate('diskFinanceiroAdvanced');
      }
      const routes={'analisar-estorno':'diskAprovacoes'};
      const map={
        'simular-spread':['Simulador de Spread','A simulação usa as regras persistidas e não altera o Ledger.'],
        'historico-split':['Histórico de Splits','Histórico operacional preservado no estado do Core Financeiro.'],
        'exportar-estornos':['Exportação','Visão de estornos preparada para exportação.'],
        'analisar-estorno':['Central de Aprovações','Estorno aberto na fila de análise com o mesmo protocolo.']
      };
      const x=map[action]||['Ação Financeira','Ação registrada no fluxo operacional.'];
      financialStore.showToast(x[0], x[1], 'info', {action,id});
      if(routes[action]) this.navigate(routes[action]);
    } catch (e) { financialStore.showToast('Operação não realizada', e.message, 'danger'); }
  }

  openSpreadRuleModal(action='nova-taxa', id='') {
    const st=financialStore.getState();
    let r=st.data.spreadRules?.find(x=>x.id===id) || {name:'',acquirer:'',paymentMethod:'Cartão de Crédito',brand:'Visa/Mastercard',installments:'1x',chargedRate:'',mdr:'',fixedFee:0,payer:'Produtor',term:'D+30',scopeType:'Geral Disk',scopeId:'all',validFrom:'2026-09-30',validTo:''};
    if(action==='duplicar-taxa') r={...r,id:null,name:`${r.name} (cópia)`,version:1,history:[]};
    const producers=(st.data.producers||[]).map(p=>`<option value="${p.id}" ${r.scopeId===p.id?'selected':''}>${p.name}</option>`).join('');
    const events=(st.data.events||[]).map(e=>`<option value="${e.id}" ${r.scopeId===e.id?'selected':''}>${e.name}</option>`).join('');
    const scopeOptions=`<option value="all">Todos</option>${producers}${events}`;
    const acquirerOptions=(st.data.gatewayConfigs||[]).filter(g=>g.enabled).map(g=>`<option value="${g.name}" ${r.acquirer===g.name?'selected':''}>${g.name} · ${g.environment}</option>`).join('');
    this.showModal(`<div class="modal-card" style="max-width:820px"><div class="modal-header"><div><h4 class="mb-0">${action==='nova-taxa'?'Nova Taxa / Regra Comercial':action==='duplicar-taxa'?'Duplicar Taxa':'Editar Taxa · nova versão'}</h4><div class="text-muted fs-sm mt-1">MDR é custo interno Disk; taxa cobrada é a regra comercial aplicada ao checkout/financeiro.</div></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitSpreadRule(event,'${action==='editar-taxa'?id:''}')"><div class="row g-3">
      <div class="col-12"><label class="form-label">Nome da regra *</label><input name="name" class="form-control" required value="${r.name||''}"></div>
      <div class="col-md-4"><label class="form-label">Adquirente / Gateway *</label><select name="acquirer" class="form-select" required><option value="">Selecione</option>${acquirerOptions}</select><div class="form-text">Origem: Central de Gateways e Adquirentes.</div></div>
      <div class="col-md-4"><label class="form-label">Meio de pagamento *</label><select name="paymentMethod" class="form-select"><option ${r.paymentMethod==='Cartão de Crédito'?'selected':''}>Cartão de Crédito</option><option ${r.paymentMethod==='Cartão de Débito'?'selected':''}>Cartão de Débito</option><option ${r.paymentMethod==='PIX'?'selected':''}>PIX</option><option ${r.paymentMethod==='Boleto'?'selected':''}>Boleto</option></select></div>
      <div class="col-md-4"><label class="form-label">Bandeira</label><input name="brand" class="form-control" value="${r.brand||''}" placeholder="Visa, Mastercard, Elo..."></div>
      <div class="col-md-3"><label class="form-label">Parcelamento</label><input name="installments" class="form-control" value="${r.installments||''}" placeholder="1x, 2 a 6x..."></div>
      <div class="col-md-3"><label class="form-label">MDR pago pela Disk % *</label><input name="mdr" type="number" step="0.01" min="0" class="form-control" required value="${r.mdr}"></div>
      <div class="col-md-3"><label class="form-label">Taxa cobrada % *</label><input name="chargedRate" type="number" step="0.01" min="0" class="form-control" required value="${r.chargedRate}"></div>
      <div class="col-md-3"><label class="form-label">Tarifa fixa R$</label><input name="fixedFee" type="number" step="0.01" min="0" class="form-control" value="${r.fixedFee||0}"></div>
      <div class="col-md-4"><label class="form-label">Quem absorve a taxa</label><select name="payer" class="form-select"><option ${r.payer==='Produtor'?'selected':''}>Produtor</option><option ${r.payer==='Comprador'?'selected':''}>Comprador</option><option ${r.payer==='Compartilhada'?'selected':''}>Compartilhada</option><option ${r.payer==='Disk'?'selected':''}>Disk</option></select></div>
      <div class="col-md-4"><label class="form-label">Prazo de liquidação</label><input name="term" class="form-control" value="${r.term||'D+30'}"></div>
      <div class="col-md-4"><label class="form-label">Abrangência</label><select name="scopeType" class="form-select" onchange="document.getElementById('spreadScopeId').disabled=this.value==='Geral Disk'"><option ${r.scopeType==='Geral Disk'?'selected':''}>Geral Disk</option><option ${r.scopeType==='Produtor'?'selected':''}>Produtor</option><option ${r.scopeType==='Evento'?'selected':''}>Evento</option></select></div>
      <div class="col-md-6"><label class="form-label">Produtor / Evento vinculado</label><select id="spreadScopeId" name="scopeId" class="form-select" ${r.scopeType==='Geral Disk'?'disabled':''}>${scopeOptions}</select><div class="form-text">Prioridade: Evento → Produtor → Geral Disk.</div></div>
      <div class="col-md-3"><label class="form-label">Início da vigência</label><input name="validFrom" type="date" class="form-control" value="${r.validFrom||''}"></div>
      <div class="col-md-3"><label class="form-label">Fim da vigência</label><input name="validTo" type="date" class="form-control" value="${r.validTo||''}"></div>
      <div class="col-12"><div class="info-banner info-banner-blue mb-0"><i class="ph-info"></i><div><strong>Spread calculado automaticamente:</strong> Taxa cobrada − MDR. Ao editar uma regra já existente, a versão anterior permanece no histórico de auditoria.</div></div></div>
    </div><div class="modal-footer px-0 pb-0 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary"><i class="ph-floppy-disk"></i> Salvar e publicar</button></div></form></div>`);
  }
  submitSpreadRule(ev,id='') { ev.preventDefault(); try { const f=Object.fromEntries(new FormData(ev.target).entries()); if(!f.scopeId) f.scopeId='all'; const row=financialStore.saveSpreadRule(f,id||null); this.closeModal(); financialStore.showToast('Taxa publicada',`${row.id} · v${row.version} · Spread líquido ${(row.chargedRate-row.mdr).toFixed(2)}% · ${row.scopeType}.`,'success'); } catch(e){financialStore.showToast('Não foi possível salvar',e.message,'danger');} }

  openSpreadHistory(id='') {
    const st=financialStore.getState(); const r=st.data.spreadRules?.find(x=>x.id===id); if(!r) return;
    const versions=[{version:r.version||1,changedAt:r.updatedAt||r.createdAt||'Atual',changedBy:'Versão vigente',snapshot:r},...(r.history||[])];
    this.showModal(`<div class="modal-card" style="max-width:760px"><div class="modal-header"><div><h4 class="mb-0">Histórico da Taxa</h4><div class="text-muted fs-sm">${r.id} · ${r.name}</div></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><div class="modal-body p-4"><div class="table-responsive"><table class="limitless-table"><thead><tr><th>Versão</th><th>Alteração</th><th>Taxa</th><th>MDR</th><th>Spread</th><th>Abrangência</th></tr></thead><tbody>${versions.map(v=>{const x=v.snapshot||{};return `<tr><td><strong>v${v.version}</strong></td><td>${v.changedAt||'—'}<div class="text-muted fs-xs">${v.changedBy||'—'}</div></td><td>${Number(x.chargedRate||0).toFixed(2)}%</td><td>${Number(x.mdr||0).toFixed(2)}%</td><td><strong class="text-success">+${(Number(x.chargedRate||0)-Number(x.mdr||0)).toFixed(2)}%</strong></td><td>${x.scopeType||'Geral Disk'}<div class="text-muted fs-xs">${x.scopeId||'all'}</div></td></tr>`}).join('')}</tbody></table></div></div><div class="modal-footer"><button class="btn btn-light" onclick="window.app.closeModal()">Fechar</button></div></div>`);
  }

  openPayableModal(){this.showModal(`<div class="modal-card" style="max-width:560px"><div class="modal-header"><h4 class="mb-0">Novo Lançamento Financeiro</h4><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitPayable(event)"><label class="form-label">Fornecedor / Credor</label><input name="creditor" class="form-control mb-3" required><div class="row g-3"><div class="col-6"><label class="form-label">Vencimento</label><input name="dueDate" type="date" class="form-control" required></div><div class="col-6"><label class="form-label">Valor</label><input name="amount" type="number" step="0.01" class="form-control" required></div></div><label class="form-label mt-3">Observação</label><textarea name="notes" class="form-control"></textarea><div class="modal-footer px-0 pb-0 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Salvar lançamento</button></div></form></div>`)}
  submitPayable(ev){ev.preventDefault();try{const f=Object.fromEntries(new FormData(ev.target).entries());const r=financialStore.createPayable(f);this.closeModal();financialStore.showToast('Lançamento criado',`${r.id} salvo e disponível no Financeiro Advanced.`,'success');}catch(e){financialStore.showToast('Não foi possível salvar',e.message,'danger')}}

  openRefundModal(){this.showModal(`<div class="modal-card" style="max-width:620px"><div class="modal-header"><h4 class="mb-0">Nova Solicitação de Estorno</h4><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitRefund(event)"><div class="row g-3"><div class="col-md-6"><label class="form-label">Pedido</label><input name="orderId" class="form-control" required></div><div class="col-md-6"><label class="form-label">Cliente</label><input name="customer" class="form-control"></div><div class="col-md-6"><label class="form-label">Evento</label><input name="eventName" class="form-control"></div><div class="col-md-3"><label class="form-label">Valor</label><input name="amount" type="number" step="0.01" class="form-control" required></div><div class="col-md-3"><label class="form-label">Pagamento</label><select name="paymentMethod" class="form-select"><option>PIX</option><option>Cartão</option><option>Boleto</option></select></div><div class="col-12"><label class="form-label">Motivo</label><textarea name="reason" class="form-control" required></textarea></div></div><div class="modal-footer px-0 pb-0 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Enviar para aprovação</button></div></form></div>`)}
  submitRefund(ev){ev.preventDefault();try{const f=Object.fromEntries(new FormData(ev.target).entries());const r=financialStore.createRefundRequest(f);this.closeModal();financialStore.showToast('Estorno protocolado',`${r.id} criado e enviado à Central de Aprovações.`,'success');}catch(e){financialStore.showToast('Não foi possível criar',e.message,'danger')}}

  openSplitModal(id=''){const st=financialStore.getState();const r=st.data.splitRules?.find(x=>x.id===id)||st.data.splitRules?.find(x=>x.status==='Ativa');const b=r?.beneficiaries||[];this.showModal(`<div class="modal-card" style="max-width:680px"><div class="modal-header"><h4 class="mb-0">Configurar Divisão de Receitas</h4><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.submitSplit(event)"><label class="form-label">Nome da regra</label><input name="name" class="form-control mb-3" value="${r?.name||'Regra padrão do evento'}"><input type="hidden" name="eventId" value="${st.selectedEventId==='all'?'evt-001':st.selectedEventId}"><div class="row g-2">${[0,1,2,3].map((i)=>`<div class="col-8"><input name="beneficiary${i}" class="form-control" required value="${b[i]?.name||''}" placeholder="Beneficiário"></div><div class="col-4"><div class="input-group"><input name="percent${i}" type="number" step="0.01" class="form-control" required value="${b[i]?.percent??0}"><span class="input-group-text">%</span></div></div>`).join('')}</div><div class="alert alert-info mt-3 mb-0">A publicação substitui a regra ativa do evento e exige soma exata de 100%.</div><div class="modal-footer px-0 pb-0 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Publicar regra</button></div></form></div>`)}
  submitSplit(ev){ev.preventDefault();try{const f=Object.fromEntries(new FormData(ev.target).entries());const beneficiaries=[0,1,2,3].filter(i=>f[`beneficiary${i}`]).map(i=>({name:f[`beneficiary${i}`],percent:Number(f[`percent${i}`])}));const r=financialStore.saveSplitRule({eventId:f.eventId,name:f.name,beneficiaries});this.closeModal();financialStore.showToast('Regra de divisão publicada',`${r.id} persistida e vinculada ao evento.`,'success');}catch(e){financialStore.showToast('Regra não publicada',e.message,'danger')}}

  p19FilterFees(){
    const vals=['p19Scope','p19Acq','p19Method','p19Status'].map(id=>document.getElementById(id)?.value||'');
    document.querySelectorAll('#p19FeeTable tbody tr').forEach(tr=>{const d=tr.dataset; tr.style.display=(!vals[0]||d.scope===vals[0])&&(!vals[1]||d.acq===vals[1])&&(!vals[2]||d.method===vals[2])&&(!vals[3]||d.status===vals[3])?'':'none';});
  }
  p19SimulateRule(id=''){
    const st=financialStore.getState(); const r=st.data.spreadRules?.find(x=>x.id===id)||st.data.spreadRules?.find(x=>x.status==='Ativa'); if(!r)return;
    const amount=1000, rate=Number(r.chargedRate||0), mdr=Number(r.mdr||0), fixed=Number(r.fixedFee||0), revenue=amount*rate/100, cost=amount*mdr/100+fixed, spread=revenue-cost;
    const br=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    this.showModal(`<div class="modal-card" style="max-width:650px"><div class="modal-header"><div><h4 class="mb-0">Simulação da Regra</h4><div class="text-muted fs-sm">${r.id} · ${r.scopeType} · v${r.version||1}</div></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><div class="modal-body p-4"><div class="row g-3"><div class="col-6"><strong>Venda simulada</strong><div>${br(amount)}</div></div><div class="col-6"><strong>Regra encontrada</strong><div>${r.name}</div></div><div class="col-6">Taxa cobrada<div class="fw-bold">${rate.toFixed(2)}% · ${br(revenue)}</div></div><div class="col-6">MDR + tarifa<div class="fw-bold">${mdr.toFixed(2)}% + ${br(fixed)}</div></div><div class="col-6">Quem paga<div class="fw-bold">${r.payer||'—'}</div></div><div class="col-6">Spread estimado<div class="fw-bold text-success">${br(spread)}</div></div></div><div class="info-banner info-banner-blue mt-3 mb-0"><i class="ph-info"></i><div>Venda deve guardar o ID e a versão desta regra para estornos, Ledger e auditoria histórica.</div></div></div></div>`);
  }
  p19PrepareCnab(){financialStore.showToast('Arquivo preparado para homologação','Sem integração bancária/VAN homologada, o sistema prepara o CNAB mas não declara transmissão ao banco.','info');}
  p19BatchDetail(id){const st=financialStore.getState();const b=st.data.cnabBatches?.find(x=>x.batchId===id);if(!b)return;this.showModal(`<div class="modal-card" style="max-width:650px"><div class="modal-header"><h4 class="mb-0">Lote ${b.batchId}</h4><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><div class="modal-body p-4"><p><strong>Banco:</strong> ${b.bank}</p><p><strong>Conta origem:</strong> ${b.agencyAccount}</p><p><strong>Pagamentos:</strong> ${b.count}</p><p><strong>Total:</strong> ${Number(b.totalAmount).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p><p><strong>Status:</strong> ${b.status}</p><div class="alert alert-info mb-0">A liquidação somente deve ser confirmada pelo retorno bancário ou API homologada.</div></div></div>`)}
  p19ConcFilter(status=''){document.querySelectorAll('#p19ConcTable tbody tr').forEach(tr=>tr.style.display=!status||tr.dataset.status===status?'':'none')}
  p19ConcLayer(layer){document.querySelectorAll('#p19ConcTable tbody tr').forEach(tr=>tr.style.display=tr.dataset.layer===layer?'':'none')}
  p19ConcDetail(id){financialStore.showToast('Conciliação',`Item ${id}: correspondência consultada sem alterar os valores de origem.`,'info')}
  p19Investigate(id){this.showModal(`<div class="modal-card" style="max-width:680px"><div class="modal-header"><div><h4 class="mb-0">Investigar Divergência</h4><div class="text-muted fs-sm">${id} · valores originais serão preservados</div></div><button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button></div><form class="modal-body p-4" onsubmit="window.app.p19Resolve(event,'${id}')"><label class="form-label">Causa</label><select name="cause" class="form-select mb-3" required><option value="">Selecione</option><option>Tarifa bancária</option><option>MDR divergente</option><option>Liquidação parcial</option><option>Pagamento rejeitado</option><option>Data diferente</option><option>Duplicidade</option><option>Chargeback</option><option>Erro cadastral</option><option>Outro</option></select><label class="form-label">Responsável</label><input name="owner" class="form-control mb-3" required><label class="form-label">Ação corretiva</label><select name="action" class="form-select mb-3" required><option value="">Selecione</option><option>Reprocessar</option><option>Corrigir cadastro</option><option>Registrar tarifa</option><option>Reabrir pagamento</option><option>Ajuste autorizado</option><option>Encerrar com justificativa</option></select><label class="form-label">Evidência / observação</label><textarea name="evidence" class="form-control" required></textarea><div class="modal-footer px-0 pb-0 mt-4"><button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button><button class="btn btn-primary">Registrar tratamento</button></div></form></div>`)}
  p19Resolve(ev,id){ev.preventDefault();try{const f=Object.fromEntries(new FormData(ev.target).entries());financialStore.saveReconciliationResolution(id,f);this.closeModal();financialStore.showToast('Divergência tratada','Causa, responsável, evidência e ação corretiva foram registrados.','success')}catch(e){financialStore.showToast('Não foi possível concluir',e.message,'danger')}}

  p13RecalcSplit(raw) {
    const n = Number(String(raw).replace(/\./g,'').replace(',','.')) || 0;
    const el = document.getElementById('p13SplitBars');
    if (!el) return;
    const money = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const rows=[['Organizador (Principal)',70],['Afiliado / Coprodutor',10],['Produtor Artístico',15],['Plataforma DiskIngressos',5]];
    el.innerHTML=rows.map(x=>`<div class="p13-bar"><div><strong>${x[0]}</strong><span>${x[1]}% | ${money(n*x[1]/100)}</span></div><div class="p13-track"><i style="width:${x[1]}%"></i></div></div>`).join('');
  }

  closeToast() {
    financialStore.closeToast();
  }
}

// ============================================================================
// FUNÇÃO GLOBAL DE ALTERNÂNCIA DE PERFIL (CONFORME LINK DE REFERÊNCIA)
// ============================================================================
window.switchGlobalRole = function(role) {
  if (role === 'FINANCEIRO') {
    financialStore.login('disk');
    window.app.navigate('diskDashboard');
  } else if (role === 'PRODUTOR') {
    financialStore.login('producer', 'prod-abc');
    window.app.navigate('overview');
  } else if (role === 'ADMINISTRADOR') {
    financialStore.login('admin');
    window.app.navigate('diskDashboard');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new LimitlessFinancialApp();
  });
} else {
  window.app = new LimitlessFinancialApp();
}
