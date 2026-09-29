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

// Configuração oficial de menus dinâmicos por perfil
import { menusPorPerfil } from './menuConfig.js';

// Import Views do Financeiro Disk (Backoffice Enterprise)
import { renderDiskDashboard } from './views/disk/dashboard.js';
import { renderDiskAprovacoes } from './views/disk/aprovacoes.js';
import { renderDiskSolicitacoes } from './views/disk/solicitacoes.js';
import { renderDiskProdutores } from './views/disk/produtores.js';
import { renderDiskGateways } from './views/disk/gatewaysMdr.js';
import { renderDiskLedger } from './views/disk/ledger.js';
import { renderDiskTesouraria } from './views/disk/tesouraria.js';
import { renderDiskContasPagar } from './views/disk/diskContasPagar.js';
import { renderDiskContasReceber } from './views/disk/diskContasReceber.js';
import { renderDiskFluxoCaixa } from './views/disk/diskFluxoCaixa.js';
import { renderDiskPix } from './views/disk/diskPix.js';
import { renderDiskCnab } from './views/disk/diskCnab.js';
import { renderDiskAgendaPagamentos } from './views/disk/diskAgendaPagamentos.js';
import { renderDiskPagamentosLote } from './views/disk/diskPagamentosLote.js';
import { renderDiskTransferencias } from './views/disk/diskTransferencias.js';
import { renderDiskConciliacao } from './views/disk/diskConciliacao.js';
import { renderDiskFechamentos } from './views/disk/diskFechamentos.js';
import { renderDiskControladoria } from './views/disk/diskControladoria.js';
import { renderDiskAssinaturasIntegracoes } from './views/disk/diskAssinaturasIntegracoes.js';
import { renderDiskGovernanca } from './views/disk/diskGovernanca.js';
import { renderDiskCentralTrabalho } from './views/disk/diskCentralTrabalho.js';
import { renderDiskFinanceiroAvancado } from './views/disk/diskFinanceiroAvancado.js';
import { renderDiskSaldos } from './views/disk/diskSaldos.js';
import {
  renderDiskEventos,
  renderDiskRepasses,
  renderDiskAntecipacoes,
  renderDiskRecebiveis,
  renderDiskTaxas,
  renderDiskEstornos,
  renderDiskBordero,
  renderDiskRelatorios,
  renderDiskAuditoria,
  renderDiskConfiguracoes,
  renderDiskFornecedores
} from './views/disk/enterpriseViews.js';

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

  setSelectedProducer(producerId) {
    financialStore.setSelectedProducer(producerId);
  }

  selectProducerInDisk(producerId) {
    financialStore.setSelectedProducer(producerId);
  }

  exportCurrentView(format = 'excel') {
    financialStore.showToast("Exportação Iniciada", `Gerando demonstrativo analítico .${format === 'excel' ? 'xlsx' : 'pdf'}...`, "info");
  }

  setSelectedPeriod(period) {
    const labels = {
      'month': 'Mês Atual (Março/2026)',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 90 dias',
      'year': 'Ano de 2026',
      'all': 'Todo o Histórico'
    };
    financialStore.showToast("Filtro Temporal", `Visão consolidada atualizada para: ${labels[period] || period}`, "info");
  }

  navigate(viewName, filterArg = null) {
    this.currentFilterArg = filterArg;

    // View Aliases matching reference app https://financeiropdtnovo.web.app/
    const state = financialStore.getState();
    const isDisk = state.viewMode === 'disk';

    let targetView = viewName;
    const aliasMap = {
      'financial-dashboard': isDisk ? 'diskDashboard' : 'overview',
      'financial-posicao-geral': 'diskDashboard',
      'financial-saldos': isDisk ? 'diskSaldos' : 'saldos',
      'financial-approvals': 'diskAprovacoes',
      'financial-repass': isDisk ? 'diskRepasses' : 'repasses',
      'financial-advance': isDisk ? 'diskAntecipacoes' : 'antecipacoes',
      'financial-statement': isDisk ? 'diskLedger' : 'extrato',
      'financial-gateways-adquirentes': 'diskGateways',
      'financial-accounts': isDisk ? 'diskTesouraria' : 'dadosBancarios',
      'financial-bordero': isDisk ? 'diskBordero' : 'bordero',
      'financial-taxas-custos': isDisk ? 'diskTaxas' : 'taxas',
      'financial-fechamento': isDisk ? 'diskBordero' : 'bordero',
      'financial-balance': isDisk ? 'diskTesouraria' : 'saldos',
      'financial-event-transfers': isDisk ? 'diskTesouraria' : 'saldos',
      'financial-refunds': isDisk ? 'diskEstornos' : 'estornos',
      'financial-analytics': isDisk ? 'diskRelatorios' : 'relatorios',
      'dashboard-main': isDisk ? 'diskDashboard' : 'overview',
      'dashboard-agenda': isDisk ? 'diskRecebiveis' : 'diskTesouraria',
      'dashboard-indicators': isDisk ? 'diskRelatorios' : 'relatorios',
      'events-list': isDisk ? 'diskEventos' : 'saldos',
      'accounting-disk': 'diskLedger',
      'reports-sales': isDisk ? 'diskRelatorios' : 'relatorios',
      'procure-to-pay': isDisk ? 'diskContasPagar' : 'diskTesouraria',
      'fin-my-requests': 'repasses'
    };

    if (aliasMap[viewName]) {
      targetView = aliasMap[viewName];
    }

    if (targetView === 'diskSaldos') {
      if (filterArg === 'evento' || filterArg === 'por-evento') {
        this.diskBalanceTab = 'por-evento';
      } else if (filterArg === 'produtor' || filterArg === 'por-produtor') {
        this.diskBalanceTab = 'por-produtor';
      } else if (filterArg) {
        this.diskBalanceTab = filterArg;
      }
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
    const pending = ops.filter(a => !['Pago', 'Rejeitado', 'Recusado'].includes(a.status));
    const html = `
      <div class="modal-card" style="max-width:780px">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <div>
            <div class="fs-xs text-muted">DOSSIÊ FINANCEIRO DO PRODUTOR</div>
            <h4 class="mb-0 fw-bold">${p.name}</h4>
          </div>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Saldo Total</div>
              <div class="kpi-value">${formatCurrency(p.totals.totalBalance)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Disponível</div>
              <div class="kpi-value text-success">${formatCurrency(p.totals.availableBalance)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Eventos</div>
              <div class="kpi-value">${evts.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Pendências</div>
              <div class="kpi-value ${pending.length > 0 ? 'text-warning' : ''}">${pending.length}</div>
            </div>
          </div>
          <hr class="my-3">
          <div class="row g-2 mb-3">
            <div class="col-md-6"><strong>CNPJ / Documento:</strong> ${p.cnpj}</div>
            <div class="col-md-3"><strong>Rating:</strong> <span class="badge bg-light text-dark border">${p.rating}</span></div>
            <div class="col-md-3"><strong>Status:</strong> <span class="badge bg-success">${p.status}</span></div>
          </div>
          <div class="mb-3">
            <div class="fw-bold fs-sm mb-2">Eventos Vinculados (${evts.length}):</div>
            <div class="d-flex flex-wrap gap-2">
              ${evts.map(e => `<span class="badge bg-light text-dark border p-2">${e.name} &bull; Disp: ${formatCurrency(e.availableBalance)}</span>`).join('')}
            </div>
          </div>
          <div class="d-flex gap-2 flex-wrap mt-4 pt-2 border-top">
            <button class="btn btn-primary" onclick="window.app.closeModal();window.app.selectProducerInDisk('${p.id}');window.app.navigate('diskProdutores')">
              <i class="ph-bank me-1"></i> Abrir Conta Financeira
            </button>
            <button class="btn btn-outline-primary" onclick="window.app.closeModal();window.app.selectProducerInDisk('${p.id}');window.app.navigate('diskAprovacoes')">
              <i class="ph-scales me-1"></i> Ver Aprovações
            </button>
            <button class="btn btn-light ms-auto" onclick="window.app.closeModal()">Fechar</button>
          </div>
        </div>
      </div>`;
    this.showModal(html);
  }

  openModal(html) {
    this.showModal(html);
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
    financialStore.signDocumentAsDisk(requestId);
    this.openApprovalSheet(requestId);
  }

  simulateProducerSign(requestId) {
    financialStore.signDocumentAsProducer(requestId);
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
  // MODAL OFICIAL DE ASSINATURA DIGITAL DO PRODUTOR (ICP-BRASIL)
  // REGRA: O Produtor assina em PRIMEIRO LUGAR. O Financeiro Disk assina por ÚLTIMO.
  // ==========================================================================
  openSignDocumentModal(requestId) {
    const state = financialStore.getState();
    const item = state.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    const producer = state.activeProducer;
    const certNumber = `ICP-BRASIL-A1-${Math.floor(100000 + Math.random() * 900000)}`;
    const hashDoc = `SHA256:${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

    const html = `
      <div class="modal-card" style="max-width: 640px;">
        <div class="modal-header bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <span class="fs-xxs text-uppercase fw-bold opacity-75">PORTAL DE ASSINATURAS DIGITAIS &bull; ICP-BRASIL</span>
            <h5 class="fw-bold mb-0 text-white mt-1">
              <i class="ph-signature me-1"></i> Assinatura Digital do Produtor
            </h5>
          </div>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>

        <div class="modal-body p-4">
          <!-- Document Badge & Overview -->
          <div class="p-3 rounded mb-3" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="badge bg-primary text-white fs-xxs fw-bold">${item.type.toUpperCase()}</span>
                <h5 class="fw-bold text-dark mt-1 mb-0">${item.documentTitle || 'Termo de Liberação Financeira'}</h5>
                <div class="fs-xs text-muted mt-1">Protocolo: <strong>${item.id}</strong> &bull; Documento: <strong>${item.documentId}</strong></div>
              </div>
              <div class="text-end">
                <div class="fs-xxs text-muted text-uppercase fw-bold">Valor da Operação</div>
                <div class="fs-4 fw-bold text-success">${formatCurrency(item.requestedAmount || item.netAmount)}</div>
              </div>
            </div>
          </div>

          <!-- Parties Identification -->
          <div class="row g-2 mb-3 fs-xs">
            <div class="col-sm-6 p-2 rounded bg-light border">
              <div class="text-muted fw-bold fs-xxs text-uppercase">1º Signatário (Produtor Responsável)</div>
              <div class="fw-bold text-dark mt-1">${state.currentUser.name}</div>
              <div class="text-muted">${producer.name} (CNPJ: ${producer.cnpj})</div>
            </div>
            <div class="col-sm-6 p-2 rounded bg-light border">
              <div class="text-muted fw-bold fs-xxs text-uppercase">2º Signatário (Financeiro Disk - Assina por Último)</div>
              <div class="fw-bold text-dark mt-1">Tesouraria Disk Ingressos</div>
              <div class="text-muted">Disk Ingressos S.A. (CNPJ: 14.829.301/0001-92)</div>
            </div>
          </div>

          <!-- Legal & Term Text Preview -->
          <div class="p-3 rounded mb-3 border fs-xs" style="background: #fffbeb; border-color: #fde68a; max-height: 140px; overflow-y: auto;">
            <strong>DECLARAÇÃO FORMAL DE AUTORIZAÇÃO:</strong><br>
            Pelo presente instrumento, o PRODUTOR supra qualificado confirma a veracidade das informações financeiras apuradas na bilheteria do evento <strong>${item.eventName}</strong>, autorizando a transferência do valor líquido de <strong>${formatCurrency(item.requestedAmount || item.netAmount)}</strong> para a conta bancária homologada no contrato: <strong>${item.bankName} (${item.bankAccount})</strong>.<br><br>
            Fica acordado que esta assinatura é vinculante e que a liberação dos recursos ocorrerá imediatamente após a assinatura de encerramento do FINANCEIRO DISK INGRESSOS.
          </div>

          <!-- ICP-Brasil Certificate Simulator -->
          <div class="p-3 rounded mb-3 border bg-white shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="ph-shield-check fs-4 text-success"></i>
              <div>
                <div class="fw-bold fs-xs text-dark">Certificado Digital ICP-Brasil A1 Detectado</div>
                <div class="fs-xxs text-muted">Emissor: Autoridade Certificadora Raiz Brasileira v5</div>
              </div>
            </div>
            <div class="fs-xxs text-muted font-monospace bg-light p-2 rounded border">
              Certificado: ${certNumber}<br>
              Hash do Termo: ${hashDoc}<br>
              IP de Conexão: 177.136.241.10 (Curitiba, PR) &bull; Timestamp D-0
            </div>
          </div>

          <!-- Alert regra central -->
          <div class="alert alert-info py-2 px-3 fs-xs d-flex align-items-center gap-2 mb-0">
            <i class="ph-info fs-5 flex-shrink-0"></i>
            <div>
              <strong>Regra de Governança:</strong> Após você assinar, o documento será enviado à Mesa da Disk para a assinatura final do Financeiro e pagamento imediato via PIX.
            </div>
          </div>

          <div class="modal-footer px-0 pb-0 pt-3 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
            <button type="button" class="btn btn-success fw-bold px-4" onclick="window.app.handleConfirmProducerSign('${item.id}')">
              ✍️ Assinar Digitalmente Agora (ICP-Brasil)
            </button>
          </div>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  handleConfirmProducerSign(requestId) {
    financialStore.signByProducer(requestId);
    this.closeModal();
    this.navigate('repasses');
  }

  // ==========================================================================
  // COMPROVANTE OFICIAL DE PAGAMENTO / LIQUIDAÇÃO BANCÁRIA
  // ==========================================================================
  showPayoutReceipt(requestId) {
    const state = financialStore.getState();
    const item = state.data.approvalQueue.find(a => a.id === requestId);
    if (!item) return;

    const html = `
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header d-flex justify-content-between align-items-center" style="background: #0f172a; color: white;">
          <div>
            <span class="fs-xxs text-uppercase fw-bold text-success" style="letter-spacing: 0.05em;">COMPROVANTE OFICIAL DE TRANSFERÊNCIA &bull; PIX / TED</span>
            <h5 class="fw-bold mb-0 text-white mt-1">Liquidação Financeira #${item.id}</h5>
          </div>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>

        <div class="modal-body p-4 bg-white">
          <div class="text-center pb-3 border-bottom">
            <div class="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-2" style="width: 48px; height: 48px;">
              <i class="ph-check fs-2"></i>
            </div>
            <h4 class="fw-bold text-dark mb-0">${formatCurrency(item.requestedAmount || item.netAmount)}</h4>
            <div class="text-success fw-semibold fs-xs mt-1">Transferência PIX Realizada com Sucesso</div>
            <div class="text-muted fs-xxs">Data/Hora: ${item.paidDate || new Date().toLocaleString('pt-BR')}</div>
          </div>

          <div class="py-3 border-bottom d-flex flex-column gap-2 fs-xs">
            <div class="d-flex justify-content-between">
              <span class="text-muted">Autenticação Bancária (Bacen):</span>
              <strong class="font-monospace text-dark">${item.authCode || 'DISK-PIX-TED-8942189012'}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">Termo Vinculado:</span>
              <strong class="text-primary">${item.documentId || 'DOC-8921'}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">Tipo da Operação:</span>
              <strong>${item.type}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">Evento de Origem:</span>
              <strong>${item.eventName}</strong>
            </div>
          </div>

          <div class="py-3 border-bottom fs-xs">
            <div class="fw-bold text-muted text-uppercase fs-xxs mb-2">Dados da Conta Creditada (Produtor)</div>
            <div class="p-2 rounded bg-light border">
              <div class="fw-bold text-dark">${item.producerName}</div>
              <div class="text-muted">Banco: ${item.bankName} &bull; ${item.bankAccount}</div>
              <div class="text-primary fw-semibold mt-1">Chave PIX: ${item.pixKey || 'Não informada'}</div>
            </div>
          </div>

          <div class="py-3 border-bottom fs-xs">
            <div class="fw-bold text-muted text-uppercase fs-xxs mb-2">Dados da Conta Debitada (Disk Ingressos)</div>
            <div class="p-2 rounded bg-light border">
              <div class="fw-bold text-dark">Disk Ingressos Intermediação de Eventos S.A.</div>
              <div class="text-muted">Banco do Brasil S.A. (001) &bull; Ag 1890-X &bull; C/C 55400-1</div>
              <div class="text-muted">CNPJ: 14.829.301/0001-92</div>
            </div>
          </div>

          <div class="p-2 mt-2 bg-success bg-opacity-10 border border-success rounded text-success fs-xxs text-center">
            🔒 <strong>Conciliação Ledger Concluída:</strong> Partidas dobradas registradas no Livro-Razão Contábil imutável Disk.
          </div>

          <div class="modal-footer px-0 pb-0 pt-3 d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.print()">
              <i class="ph-printer me-1"></i> Imprimir Comprovante
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.app.closeModal()">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  // ==========================================================================
  // SIMULADOR DE ANTECIPAÇÃO DE RECEBÍVEIS
  // ==========================================================================
  onAnticipationRangeChange(val) {
    const numInput = document.getElementById('antNumberInput');
    if (numInput) numInput.value = val;
    this.updateAnticipationSimulation();
  }

  onAnticipationNumberChange(val) {
    const rangeInput = document.getElementById('antRangeInput');
    if (rangeInput) rangeInput.value = val;
    this.updateAnticipationSimulation();
  }

  updateAnticipationSimulation() {
    const state = financialStore.getState();
    const eventSelect = document.getElementById('antEventSelect');
    const rangeInput = document.getElementById('antRangeInput');
    const numInput = document.getElementById('antNumberInput');
    const simGross = document.getElementById('simGross');
    const simDiscount = document.getElementById('simDiscount');
    const simNet = document.getElementById('simNet');

    if (!numInput || !simGross || !simDiscount || !simNet) return;

    const val = parseFloat(numInput.value) || 0;
    const rate = state.data.anticipations?.monthlyRate || 2.0;
    const discount = val * (rate / 100);
    const net = val - discount;

    simGross.innerText = formatCurrency(val);
    simDiscount.innerText = `- ${formatCurrency(discount)}`;
    simNet.innerText = formatCurrency(net);
  }

  submitAnticipation() {
    const eventSelect = document.getElementById('antEventSelect');
    const numInput = document.getElementById('antNumberInput');
    const val = parseFloat(numInput?.value || 50000);
    const eventId = eventSelect?.value === 'all' ? 'evt-001' : (eventSelect?.value || 'evt-001');

    financialStore.requestAnticipation({
      eventId: eventId,
      grossAmount: val,
      amount: val,
      notes: "Solicitação gerada via Simulador Limitless de Antecipação de Cartão."
    });

    this.navigate('antecipacoes');
  }

  // ==========================================================================
  // FORMALIZAÇÃO DO FECHAMENTO DE BORDERÔ COM DUPLA ASSINATURA
  // ==========================================================================
  openSubmitBorderoModal(eventId) {
    const state = financialStore.getState();
    const bordero = state.data.bordero;
    const remaining = bordero.summary.remainingBalance || 511318.50;

    const html = `
      <div class="modal-card" style="max-width: 560px;">
        <div class="modal-header bg-primary text-white">
          <h5 class="fw-bold mb-0 text-white"><i class="ph-signature me-2"></i> Fechamento Oficial do Borderô</h5>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            Submeta o encerramento do evento <strong>${bordero.eventName}</strong> para auditoria contábil e homologação da Disk Ingressos.
          </p>

          <div class="p-3 bg-light rounded border mb-3 fs-xs">
            <div class="d-flex justify-content-between mb-1">
              <span>Arrecadação Bruta Total:</span>
              <strong>${formatCurrency(bordero.summary.grossRevenue)}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Resultado Líquido do Evento:</span>
              <strong class="text-success">${formatCurrency(bordero.summary.netEventBalance)}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Repasses Anteriores Já Pagos:</span>
              <strong class="text-muted">-${formatCurrency(bordero.summary.alreadyTransferred)}</strong>
            </div>
            <hr class="my-1">
            <div class="d-flex justify-content-between fs-sm fw-bold">
              <span>Saldo Remanescente a Liquidar:</span>
              <span class="text-primary">${formatCurrency(remaining)}</span>
            </div>
          </div>

          <div class="alert alert-warning fs-xs py-2 px-3 mb-3">
            🔒 <strong>Regra de Fechamento:</strong> Este fechamento exige dupla assinatura digital vinculante. O Produtor assina em primeiro lugar e a Auditoria Financeira Disk assina por último para encerramento do borderô.
          </div>

          <form onsubmit="window.app.handleBorderoClosureSubmit(event, '${eventId}')">
            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Observações da Produção</label>
              <textarea class="form-control" id="borderoNotes" rows="3" placeholder="Informações de encerramento, conferência de cortesias ou deduções específicas..."></textarea>
            </div>

            <div class="modal-footer px-0 pb-0 pt-2 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                Enviar Fechamento para Homologação Disk
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  handleBorderoClosureSubmit(e, eventId) {
    e.preventDefault();
    const notes = document.getElementById('borderoNotes')?.value;
    financialStore.submitBorderoClosure({ eventId, notes });
    this.closeModal();
    this.navigate('repasses');
  }

  // ==========================================================================
  // GESTÃO DE CONTAS BANCÁRIAS DO PRODUTOR
  // ==========================================================================
  openAddBankModal() {
    const producer = financialStore.getState().activeProducer;
    const html = `
      <div class="modal-card" style="max-width: 520px;">
        <div class="modal-header bg-primary text-white">
          <h5 class="fw-bold mb-0 text-white"><i class="ph-credit-card me-2"></i> Cadastrar Nova Conta Bancária PJ</h5>
          <button class="modal-close-btn text-white border-0 bg-transparent" onclick="window.app.closeModal()">&times;</button>
        </div>
        <div class="modal-body p-4">
          <p class="fs-xs text-muted mb-3">
            Cadastre uma conta corrente PJ homologada vinculada ao CNPJ <strong>${producer.cnpj}</strong>.
          </p>

          <form onsubmit="window.app.handleAddBankSubmit(event)">
            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Instituição Bancária *</label>
              <select class="form-select" id="newBankName" required>
                <option value="Banco do Brasil (001)">Banco do Brasil (001)</option>
                <option value="Itaú Unibanco (341)">Itaú Unibanco (341)</option>
                <option value="Banco Bradesco (237)">Banco Bradesco (237)</option>
                <option value="Santander Brasil (033)">Santander Brasil (033)</option>
                <option value="BTG Pactual (208)">BTG Pactual (208)</option>
                <option value="Nubank PJ (260)">Nubank PJ (260)</option>
                <option value="Banco Inter (077)">Banco Inter (077)</option>
                <option value="C6 Bank (336)">C6 Bank (336)</option>
              </select>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-sm-4">
                <label class="form-label fw-bold fs-xs text-uppercase text-muted">Agência *</label>
                <input type="text" class="form-control" id="newBankAgency" placeholder="Ex: 0432" required>
              </div>
              <div class="col-sm-8">
                <label class="form-label fw-bold fs-xs text-uppercase text-muted">Conta com Dígito *</label>
                <input type="text" class="form-control" id="newBankAccount" placeholder="Ex: 48291-0" required>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-uppercase text-muted">Chave PIX Homologada *</label>
              <input type="text" class="form-control" id="newBankPix" value="${producer.cnpj}" required>
              <div class="form-text fs-xxs text-muted">Chaves homologadas devem coincidir com o CNPJ ou e-mail da produtora.</div>
            </div>

            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="newBankDefault">
              <label class="form-check-label fs-xs text-dark fw-semibold" for="newBankDefault">
                Definir como conta padrão prioritária para repasses
              </label>
            </div>

            <div class="modal-footer px-0 pb-0 pt-2 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Validar &amp; Salvar Conta</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  handleAddBankSubmit(e) {
    e.preventDefault();
    const bankName = document.getElementById('newBankName').value;
    const agency = document.getElementById('newBankAgency').value;
    const accountNumber = document.getElementById('newBankAccount').value;
    const pixKey = document.getElementById('newBankPix').value;
    const isDefault = document.getElementById('newBankDefault').checked;

    financialStore.addBankAccount({ bankName, agency, accountNumber, pixKey, isDefault });
    this.closeModal();
    this.navigate('dadosBancarios');
  }

  // ==========================================================================
  // UTILITÁRIOS DA VISÃO DISK E GLOBAIS
  // ==========================================================================
  openProducerAccount(producerId) {
    financialStore.setSelectedProducer(producerId);
    this.navigate('diskProdutores');
  }

  toggleRole(role) {
    if (role === 'producer') {
      window.switchGlobalRole('PRODUTOR');
    } else {
      window.switchGlobalRole('FINANCEIRO');
    }
  }

  renderDiskAprovacoesView(filterType) {
    this.navigate('diskAprovacoes', filterType);
  }

  searchApprovalQueue(query) {
    const q = (query || '').toLowerCase();
    const rows = document.querySelectorAll('#approvalTable tbody tr');
    rows.forEach(r => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  searchExtrato(query) {
    const q = (query || '').toLowerCase();
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach(r => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  filterExtrato(filterType) {
    financialStore.setStatementFilter(filterType);
  }

  exportCurrentView(format) {
    financialStore.showToast("Exportação Iniciada", `Exportando dados da visão atual em formato .${format.toUpperCase()}`, "info");
  }

  generateReport(reportType) {
    financialStore.showToast("Relatório Gerado", `Relatório financeiro "${reportType}" compilado e pronto para download.`, "success");
  }

  approvePayoutDisk(payoutId) {
    this.openApprovalSheet(payoutId);
  }

  // ==========================================================================
  // MODAIS DE OPERAÇÃO DO PRODUTOR
  // ==========================================================================
  openPayoutModal(defaultEventId = null) {
    const state = financialStore.getState();
    let producer = state.activeProducer;
    let selectedEvent = null;

    if (defaultEventId) {
      selectedEvent = state.data.events.find(e => e.id === defaultEventId);
      if (selectedEvent && (!producer || producer.id === 'all' || producer.id !== selectedEvent.producerId)) {
        producer = state.data.producers.find(p => p.id === selectedEvent.producerId) || producer;
      }
    }

    if (!producer || producer.id === 'all') {
      producer = state.data.producers[0];
    }

    const events = state.data.events.filter(e => e.producerId === producer.id);
    if (!selectedEvent) {
      selectedEvent = events.find(e => e.id === defaultEventId) || events[0] || state.data.events[0];
    }
    const bankAccounts = (producer.bankAccounts && producer.bankAccounts.length > 0) ? producer.bankAccounts : (state.data.producers[0]?.bankAccounts || []);

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
                    ${e.name} (Disponível: ${formatCurrency(e.availableBalance)})
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
    const notes = document.getElementById('modalPayoutNotes')?.value || '';

    const payout = financialStore.requestPayout({ eventId, amount, bankAccountId, notes });
    if (!payout) return;

    this.closeModal();
    this.navigate('repasses');
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
                    ${e.name} (Disponível: ${formatCurrency(e.availableBalance)})
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

    if (!originEvent || originEvent.availableBalance < amount) {
      alert(`Saldo insuficiente no evento de origem (${formatCurrency(originEvent?.availableBalance || 0)}).`);
      return;
    }

    // Executa a transferência no mockData
    originEvent.availableBalance -= amount;
    destEvent.availableBalance += amount;

    // Registra no Ledger de partidas dobradas
    if (state.data.ledgerEntries) {
      state.data.ledgerEntries.unshift({
        id: `LED-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: `Transferência interna entre eventos: ${originEvent.name} ➔ ${destEvent.name} (${reason})`,
        debitAccount: `Passivo Produtor: ${destEvent.name}`,
        creditAccount: `Passivo Produtor: ${originEvent.name}`,
        amount: amount,
        reference: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
        reconciled: true
      });
    }

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
    if (isDisk) {
      switch (state.currentView) {
        case 'diskDashboard':
          viewHtml = renderDiskDashboard(state);
          break;
        case 'diskProdutores':
          viewHtml = renderDiskProdutores(state);
          break;
        case 'diskEventos':
          viewHtml = renderDiskEventos(state, this.currentFilterArg);
          break;
        case 'diskSolicitacoes':
          viewHtml = renderDiskSolicitacoes(state, this.currentFilterArg);
          break;
        case 'diskAprovacoes':
          viewHtml = renderDiskAprovacoes(state, this.currentFilterArg);
          break;
        case 'diskSaldos':
          viewHtml = renderDiskSaldos(state, this.diskBalanceTab || this.currentFilterArg || 'consolidado');
          break;
        case 'diskRepasses':
          viewHtml = renderDiskRepasses(state, this.currentFilterArg);
          break;
        case 'diskAntecipacoes':
          viewHtml = renderDiskAntecipacoes(state, this.currentFilterArg);
          break;
        case 'diskRecebiveis':
          viewHtml = renderDiskRecebiveis(state, this.currentFilterArg);
          break;
        case 'diskTaxas':
          viewHtml = renderDiskTaxas(state, this.currentFilterArg);
          break;
        case 'diskGateways':
          viewHtml = renderDiskGateways(state, this.currentFilterArg);
          break;
        case 'diskEstornos':
          viewHtml = renderDiskEstornos(state, this.currentFilterArg);
          break;
        case 'diskConciliacao':
          viewHtml = renderDiskConciliacao(state, this.currentFilterArg);
          break;
        case 'diskContasPagar':
          viewHtml = renderDiskContasPagar(state, this.currentFilterArg);
          break;
        case 'diskContasReceber':
          viewHtml = renderDiskContasReceber(state, this.currentFilterArg);
          break;
        case 'diskTesouraria':
          viewHtml = renderDiskTesouraria(state);
          break;
        case 'diskPix':
          viewHtml = renderDiskPix(state, this.currentFilterArg);
          break;
        case 'diskCnab':
          viewHtml = renderDiskCnab(state, this.currentFilterArg);
          break;
        case 'diskAgendaPagamentos':
          viewHtml = renderDiskAgendaPagamentos(state, this.currentFilterArg);
          break;
        case 'diskPagamentosLote':
          viewHtml = renderDiskPagamentosLote(state, this.currentFilterArg);
          break;
        case 'diskTransferencias':
          viewHtml = renderDiskTransferencias(state, this.currentFilterArg);
          break;
        case 'diskLedger':
          viewHtml = renderDiskLedger(state);
          break;
        case 'diskBordero':
          viewHtml = renderDiskBordero(state, this.currentFilterArg);
          break;
        case 'diskFechamentos':
          viewHtml = renderDiskFechamentos(state);
          break;
        case 'diskFluxoCaixa':
          viewHtml = renderDiskFluxoCaixa(state, this.currentFilterArg);
          break;
        case 'diskAssinaturas':
        case 'diskIntegracao_assinaturas':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'assinaturas');
          break;
        case 'diskIntegracao_documentos':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'documentos');
          break;
        case 'diskIntegracao_autentique':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'autentique');
          break;
        case 'diskIntegracao_contaazul':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'contaazul');
          break;
        case 'diskIntegracao_sincronizacoes':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'sincronizacoes');
          break;
        case 'diskIntegracao_logs':
          viewHtml = renderDiskAssinaturasIntegracoes(state, 'logs');
          break;
        case 'diskRelatorios':
          viewHtml = renderDiskRelatorios(state, this.currentFilterArg);
          break;
        case 'diskGovernanca':
        case 'diskGovernanca_visao':
        case 'diskGovernanca_visaoGeral':
        case 'diskGov_visaoGeral':
          viewHtml = renderDiskGovernanca(state, 'visaoGeral');
          break;
        case 'diskGovernanca_usuarios':
        case 'diskGov_usuarios':
          viewHtml = renderDiskGovernanca(state, 'usuarios');
          break;
        case 'diskGovernanca_perfis':
        case 'diskGov_perfis':
          viewHtml = renderDiskGovernanca(state, 'perfis');
          break;
        case 'diskGovernanca_alcadas':
        case 'diskGov_alcadas':
          viewHtml = renderDiskGovernanca(state, 'alcadas');
          break;
        case 'diskGovernanca_fluxos':
        case 'diskGov_fluxos':
          viewHtml = renderDiskGovernanca(state, 'fluxos');
          break;
        case 'diskGovernanca_segregacao':
        case 'diskGov_segregacao':
          viewHtml = renderDiskGovernanca(state, 'segregacao');
          break;
        case 'diskGovernanca_sensiveis':
        case 'diskGovernanca_operacoes':
        case 'diskGov_operacoes':
          viewHtml = renderDiskGovernanca(state, 'operacoes');
          break;
        case 'diskGovernanca_bloqueios':
        case 'diskGov_bloqueios':
          viewHtml = renderDiskGovernanca(state, 'bloqueios');
          break;
        case 'diskGovernanca_acessos':
        case 'diskGovernanca_auditoria':
        case 'diskGov_auditoria':
        case 'diskAuditoria':
          viewHtml = renderDiskGovernanca(state, 'auditoria');
          break;
        case 'diskGovernanca_configuracoes':
        case 'diskGov_configuracoes':
        case 'diskConfiguracoes':
          viewHtml = renderDiskGovernanca(state, 'configuracoes');
          break;
        case 'diskFornecedores':
          viewHtml = renderDiskFornecedores(state, this.currentFilterArg);
          break;
        case 'diskControladoria':
        case 'diskControleFinanceiro':
          viewHtml = renderDiskControladoria(state, 'visao');
          break;
        case 'diskCentrosCustos':
          viewHtml = renderDiskControladoria(state, 'centros');
          break;
        case 'diskOrcamentos':
          viewHtml = renderDiskControladoria(state, 'orcamentos');
          break;
        case 'diskDre':
          viewHtml = renderDiskControladoria(state, 'dre');
          break;
        case 'diskRentabilidade':
          viewHtml = renderDiskControladoria(state, 'rentabilidade');
          break;
        case 'diskProjecoes':
          viewHtml = renderDiskControladoria(state, 'projecoes');
          break;
        case 'diskCentralTrabalho':
        case 'diskTrabalho_central':
        case 'diskTrabalho_visaoGeral':
          viewHtml = renderDiskCentralTrabalho(state, 'central');
          break;
        case 'diskTrabalho_alertas':
          viewHtml = renderDiskCentralTrabalho(state, 'alertas');
          break;
        case 'diskTrabalho_sla':
          viewHtml = renderDiskCentralTrabalho(state, 'sla');
          break;
        case 'diskTrabalho_pendencias':
          viewHtml = renderDiskCentralTrabalho(state, 'pendencias');
          break;
        case 'diskTrabalho_agenda':
          viewHtml = renderDiskCentralTrabalho(state, 'agenda');
          break;
        case 'diskTrabalho_notificacoes':
          viewHtml = renderDiskCentralTrabalho(state, 'notificacoes');
          break;
        case 'diskSpread':
          viewHtml = renderDiskFinanceiroAvancado(state, 'spread');
          break;
        case 'diskAdvanced':
          viewHtml = renderDiskFinanceiroAvancado(state, 'advanced');
          break;
        case 'diskDivisaoReceitas':
        case 'diskSplit':
          viewHtml = renderDiskFinanceiroAvancado(state, 'split');
          break;
        case 'diskCentralEstornos':
          viewHtml = renderDiskFinanceiroAvancado(state, 'estornos');
          break;
        default:
          viewHtml = renderDiskDashboard(state);
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

    this.mainContainer.innerHTML = viewHtml;
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
        roleIndicator.innerText = 'PORTAL DO PRODUTOR';
        roleIndicator.className = 'badge bg-primary text-white fw-bold fs-xxs px-2 py-1';
      }
    }

    // Dynamic Search Placeholder by Role
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      if (isDisk || isMaster) {
        searchInput.placeholder = '🔎 Buscar Produtor, CNPJ, Evento, Pedido...';
      } else {
        searchInput.placeholder = 'Pesquisa global (eventos, produtores, pedidos, repasses...)';
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
        prodName.innerText = 'Disk Ingressos (Matriz)';
        prodBadge.innerText = 'Mesa Financeira & Tesouraria';
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
          <button class="btn btn-warning w-100 btn-sm text-black fw-bold d-flex align-items-center justify-content-center gap-1" id="quick-new-event-btn" onclick="alert('Criar Novo Evento: Redirecionando para o Assistente de Configuração de Lotes...')">
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
    const isMaster = state.currentUser.role === 'admin';

    if (domainBadge) {
      domainBadge.innerText = (isDisk || isMaster) ? 'FINANCEIRO DISK' : 'FINANCEIRO DO PRODUTOR';
      domainBadge.className = (isDisk || isMaster) ? 'badge bg-dark text-white fw-bold fs-xxs' : 'badge bg-primary text-white fw-bold fs-xxs';
    }

    if (eventBadge) {
      if (isDisk || isMaster) {
        const isAllProducers = state.selectedProducerId === 'all';
        const isAllEvents = state.selectedEventId === 'all';
        const p = state.data.producers.find(pr => pr.id === state.selectedProducerId);
        const pName = p ? p.name : 'Todos os Produtores';
        const ev = state.data.events.find(e => e.id === state.selectedEventId);
        const eName = ev ? ev.name : 'Todos os Eventos';

        let levelHtml = '';
        if (isAllProducers && isAllEvents) {
          levelHtml = '<span class="badge bg-dark text-white fw-bold fs-xxs px-2 py-1"><i class="ph-bank me-1"></i> NÍVEL 1 &bull; DISK (Todos os Produtores)</span>';
        } else if (!isAllProducers && isAllEvents) {
          levelHtml = `<span class="badge bg-primary text-white fw-bold fs-xxs px-2 py-1"><i class="ph-buildings me-1"></i> NÍVEL 2 &bull; PRODUTOR (${pName})</span>`;
        } else {
          levelHtml = `<span class="badge bg-success text-white fw-bold fs-xxs px-2 py-1"><i class="ph-ticket me-1"></i> NÍVEL 3 &bull; EVENTO (${eName})</span>`;
        }

        eventBadge.innerHTML = `
          ${levelHtml}
          <span class="text-muted fs-xxs mx-1">&bull;</span>
          <span class="fs-xs text-muted">Produtor selecionado: <strong class="text-dark">${isAllProducers ? 'Todos' : pName}</strong></span>
          <span class="text-muted fs-xxs mx-1">&bull;</span>
          <span class="fs-xs text-muted">Evento selecionado: <strong class="text-dark">${isAllEvents ? 'Todos' : eName}</strong></span>
        `;
      } else {
        const currentEvent = state.data.events.find(e => e.id === state.selectedEventId);
        eventBadge.innerHTML = `Produtor: <strong>${state.activeProducer.name}</strong> &bull; Evento: <strong>${currentEvent ? currentEvent.name : 'Festival Curitiba 2026'}</strong>`;
      }
    }

    const titlesMap = {
      // Produtor (11 Itens)
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

      // Financeiro Disk — 15 Domínios Administrativos
      'diskDashboard': { title: 'Dashboard Financeiro', subtitle: 'Painel executivo com volume transacionado, obrigações com produtores e liquidez.' },
      'diskProdutores': { title: 'Produtores & Contas Financeiras', subtitle: 'Gestão cadastral, contas financeiras, contratos, travas e limites de todos os produtores.' },
      'diskEventos': { title: 'Eventos & Posição Financeira', subtitle: 'Posição financeira individual e fechamentos de bilheteria de toda a grade Disk Ingressos.' },
      'diskSolicitacoes': { title: 'Central de Solicitações', subtitle: 'Acompanhamento transversal de repasses, antecipações e fechamentos de borderô de todos os produtores.' },
      'diskAprovacoes': { title: 'Central de Aprovações', subtitle: 'Workflow transversal &bull; Governança Maker/Checker &bull; Assinaturas sequenciais &bull; SLA.' },
      'diskSaldos': { title: 'Saldos por Produtor & por Evento', subtitle: 'Consolidação de saldos disponíveis, a receber, bloqueios e reservas por produtor e evento.' },
      'diskRepasses': { title: 'Repasses & Liquidação Bancária', subtitle: 'Gestão do ciclo de repasses: análise, aprovação, programação e liquidação bancária.' },
      'diskAntecipacoes': { title: 'Antecipações de Recebíveis', subtitle: 'Análise de elegibilidade de risco, simulações, taxas e contratação de antecipações.' },
      'diskRecebiveis': { title: 'Recebíveis & Liquidações', subtitle: 'Previsão de caixa futuro por adquirente, bandeira e método de pagamento (PIX e Cartão).' },
      'diskTaxas': { title: 'Taxas & Regras Comerciais', subtitle: 'Configuração de MDR, spread comercial Disk (1,22%), parcelamento e vigências contratuais.' },
      'diskGateways': { title: 'Gateways & Adquirentes', subtitle: 'Roteamento inteligente de transações, taxas de adquirência e split de pagamentos.' },
      'diskEstornos': { title: 'Estornos & Chargebacks', subtitle: 'Monitoramento de cancelamentos voluntários, contestações de compras e reservas cautelares.' },
      'diskConciliacao': { title: 'Conciliação Contábil & Financeira', subtitle: 'Auditoria Multicamadas: Pedido × Gateway × Adquirente × Ledger × Extrato Bancário.' },
      'diskContasPagar': { title: 'Contas a Pagar', subtitle: 'Gestão de fornecedores, centros de custos, agendamentos de pagamentos e autorizações.' },
      'diskContasReceber': { title: 'Contas a Receber', subtitle: 'Previsões de recebimento, liquidação de borderôs, baixas automáticas e inadimplências.' },
      'diskTesouraria': { title: 'Tesouraria & Contas Bancárias', subtitle: 'Posição consolidada de caixa, contas bancárias, conciliação e gestão de liquidez.' },
      'diskPix': { title: 'PIX e Transferências Instantâneas', subtitle: 'Fila PIX, chaves homologadas, pagamentos instantâneos e retorno bancário.' },
      'diskCnab': { title: 'CNAB 240 / 400 Bancário', subtitle: 'Remessas e retornos bancários, conciliação de arquivos e ocorrências.' },
      'diskAgendaPagamentos': { title: 'Agenda de Pagamentos', subtitle: 'Cronograma diário de liquidações, vencimentos e transferências autorizadas.' },
      'diskPagamentosLote': { title: 'Pagamentos em Lote', subtitle: 'Processamento em massa de obrigações, agrupamento por banco e autorizações.' },
      'diskTransferencias': { title: 'Transferências entre Contas', subtitle: 'Movimentações entre contas bancárias da Disk, TED/DOC e compensações.' },
      'diskLedger': { title: 'Ledger Financeiro', subtitle: 'Livro-razão contábil de partidas dobradas imutável, conciliação e rastreabilidade total de cada centavo.' },
      'diskBordero': { title: 'Borderôs & Fechamentos', subtitle: 'Conferência final de bilheteria, custos, deduções, aprovação e termo de encerramento assinado.' },
      'diskFechamentos': { title: 'Fechamentos, Borderôs & Dossiês Financeiros', subtitle: 'Esteira de fechamento, prestação de contas, assinaturas duplas e dossiê do evento.' },
      'diskFluxoCaixa': { title: 'Fluxo de Caixa Realizado & Projetado', subtitle: 'Entradas e saídas operacionais consolidadas e projeção de liquidez futura.' },
      'diskAssinaturas': { title: 'Assinaturas & Integrações', subtitle: 'Central de Assinaturas (Autentique), Integração ERP (Conta Azul), Sincronizações e Logs.' },
      'diskIntegracao_assinaturas': { title: 'Central de Assinaturas', subtitle: 'Documentos com ordem obrigatória: Produtor primeiro e Financeiro Disk por último.' },
      'diskIntegracao_documentos': { title: 'Documentos para Assinatura', subtitle: 'Modelos de termos de repasse, antecipação, borderôs e contratos autorizados.' },
      'diskIntegracao_autentique': { title: 'Integração Autentique', subtitle: 'Motor externo de assinatura digital ICP-Brasil e gerenciamento de webhooks.' },
      'diskIntegracao_contaazul': { title: 'Integração Conta Azul', subtitle: 'Sincronização controlada com ERP, OAuth 2.0 e mapa de responsabilidade dos dados.' },
      'diskIntegracao_sincronizacoes': { title: 'Central de Sincronizações', subtitle: 'Fila única com idempotência, tentativas e tratamento de divergências.' },
      'diskIntegracao_logs': { title: 'Logs de Integração', subtitle: 'Rastreabilidade técnica de webhooks e sincronizações sem exposição de credenciais.' },
      'diskRelatorios': { title: 'Relatórios Financeiros Consolidados', subtitle: 'Demonstrativos gerenciais de vendas, conciliação, balancetes e exportações oficiais.' },
      'diskGovernanca': { title: 'Governança Financeira', subtitle: 'Visão geral, alçadas, perfis RBAC, segregação de funções e proteção de operações sensíveis.' },
      'diskGovernanca_visao': { title: 'Governança Financeira • Visão Geral', subtitle: 'Painel central de conformidade institucional, matriz de autorização e salvaguardas de processos.' },
      'diskGov_visaoGeral': { title: 'Governança Financeira • Visão Geral', subtitle: 'Painel central de conformidade institucional, matriz de autorização e salvaguardas de processos.' },
      'diskGovernanca_usuarios': { title: 'Usuários Financeiros', subtitle: 'Gestão individual de operadores, perfis atribuídos e limites de autorização financeira.' },
      'diskGov_usuarios': { title: 'Usuários Financeiros', subtitle: 'Gestão individual de operadores, perfis atribuídos e limites de autorização financeira.' },
      'diskGovernanca_perfis': { title: 'Perfis e Permissões (RBAC)', subtitle: 'Definição de privilégios granulares por módulo e nível de atuação operacional.' },
      'diskGov_perfis': { title: 'Perfis e Permissões (RBAC)', subtitle: 'Definição de privilégios granulares por módulo e nível de atuação operacional.' },
      'diskGovernanca_alcadas': { title: 'Alçadas de Aprovação', subtitle: 'Limites monetários parametrizáveis por tipo de operação (Repasses, Antecipações, Lotes e MDR).' },
      'diskGov_alcadas': { title: 'Alçadas de Aprovação', subtitle: 'Limites monetários parametrizáveis por tipo de operação (Repasses, Antecipações, Lotes e MDR).' },
      'diskGovernanca_fluxos': { title: 'Fluxos de Aprovação', subtitle: 'Sequenciamento formal das esteiras de decisão financeira, status e transições.' },
      'diskGov_fluxos': { title: 'Fluxos de Aprovação', subtitle: 'Sequenciamento formal das esteiras de decisão financeira, status e transições.' },
      'diskGovernanca_segregacao': { title: 'Segregação de Funções (SoD)', subtitle: 'Políticas rígidas para impedir acúmulo de etapas conflitantes (Criador, Aprovador, Pagador, Conciliador).' },
      'diskGov_segregacao': { title: 'Segregação de Funções (SoD)', subtitle: 'Políticas rígidas para impedir acúmulo de etapas conflitantes (Criador, Aprovador, Pagador, Conciliador).' },
      'diskGovernanca_sensiveis': { title: 'Operações Sensíveis & Críticas', subtitle: 'Relação de ações sujeitas a salvaguardas adicionais, dupla custódia e log imutável.' },
      'diskGov_operacoes': { title: 'Operações Sensíveis & Críticas', subtitle: 'Relação de ações sujeitas a salvaguardas adicionais, dupla custódia e log imutável.' },
      'diskGovernanca_bloqueios': { title: 'Bloqueios Preventivos & Exceções', subtitle: 'Quarentenas de segurança patrimonial, travas temporárias e delegação de alçadas.' },
      'diskGov_bloqueios': { title: 'Bloqueios Preventivos & Exceções', subtitle: 'Quarentenas de segurança patrimonial, travas temporárias e delegação de alçadas.' },
      'diskGovernanca_acessos': { title: 'Auditoria de Acessos & Log Imutável', subtitle: 'Registro contínuo e à prova de adulteração de todas as operações administrativas e financeiras.' },
      'diskGov_auditoria': { title: 'Auditoria de Acessos & Log Imutável', subtitle: 'Registro contínuo e à prova de adulteração de todas as operações administrativas e financeiras.' },
      'diskGovernanca_configuracoes': { title: 'Configurações de Governança', subtitle: 'Parâmetros operacionais globais de segurança, travas SoD e políticas da Disk Ingressos.' },
      'diskGov_configuracoes': { title: 'Configurações de Governança', subtitle: 'Parâmetros operacionais globais de segurança, travas SoD e políticas da Disk Ingressos.' },
      'diskAuditoria': { title: 'Auditoria & Governança', subtitle: 'Log imutável de operações manuais, aprovações, alterações de taxas e acessos sensíveis.' },
      'diskConfiguracoes': { title: 'Configurações Administrativas', subtitle: 'Políticas de repasse, travas de antecipação, alçadas de aprovação e calendário operacional.' },
      'diskFornecedores': { title: 'Gestão de Fornecedores & Contratos', subtitle: 'Cadastro, contratos, documentos, cotações, pedidos, parcelas e vencimentos.' },
      'diskControladoria': { title: 'Controladoria Financeira', subtitle: 'Centros de custos, orçamentos, DRE gerencial, rentabilidade e projeções da operação.' },
      'diskControleFinanceiro': { title: 'Controladoria Financeira', subtitle: 'Centros de custos, orçamentos, fluxo de caixa, projeções de caixa e DRE gerencial.' },
      'diskCentrosCustos': { title: 'Centros de Custos', subtitle: 'Orçado × Realizado por centro de custo com apuração de desvios operacionais.' },
      'diskOrcamentos': { title: 'Controle Orçamentário', subtitle: 'Acompanhamento de orçamentos previstos, realizados, comprometidos e governança de versões.' },
      'diskDre': { title: 'DRE Gerencial', subtitle: 'Demonstrativo de Resultado do Exercício gerencial da Disk (Receitas, Adquirência, Operação e Margem).' },
      'diskRentabilidade': { title: 'Rentabilidade por Evento & Produtor', subtitle: 'Margem de contribuição, resultado líquido e composição de custos por produção.' },
      'diskProjecoes': { title: 'Projeções de Caixa', subtitle: 'Horizontes de liquidez em 7, 15, 30 e 60 dias (cenários não alteram o Ledger).' },
      'diskCentralTrabalho': { title: 'Central de Trabalho Financeiro', subtitle: 'Painel operacional prioritário, fila de atividades, monitoramento de SLA e alertas do dia.' },
      'diskTrabalho_central': { title: 'Central de Trabalho Financeiro', subtitle: 'Painel operacional prioritário, fila de atividades, monitoramento de SLA e alertas do dia.' },
      'diskTrabalho_visaoGeral': { title: 'Central de Trabalho • Visão Geral', subtitle: 'Painel operacional prioritário, fila de atividades, monitoramento de SLA e alertas do dia.' },
      'diskTrabalho_alertas': { title: 'Alertas Financeiros Críticos', subtitle: 'Notificações ativas de risco, divergências e ações imediatas da mesa financeira.' },
      'diskTrabalho_sla': { title: 'SLA & Prazos Operacionais', subtitle: 'Metas e tempos de resposta de repasses, antecipações e fechamentos de borderô.' },
      'diskTrabalho_pendencias': { title: 'Pendências Financeiras', subtitle: 'Fila consolidada de itens aguardando ação, aprovação, assinatura ou conciliação.' },
      'diskTrabalho_agenda': { title: 'Agenda Operacional', subtitle: 'Compromissos, vencimentos de lotes bancários e cronograma financeiro diário.' },
      'diskTrabalho_notificacoes': { title: 'Notificações Operacionais', subtitle: 'Histórico de eventos, avisos e notificações da mesa financeira.' },
      'diskSpread': { title: 'Spread & Adquirentes', subtitle: 'Análise de receitas, tarifas retidas, custos de adquirentes e rentabilidade líquida do ecossistema de pagamentos.' },
      'diskAdvanced': { title: 'Financeiro Advanced · Previsto × Realizado', subtitle: 'Controle de liquidez, contas a receber, pagamentos agendados e previsão semestral de caixa.' },
      'diskDivisaoReceitas': { title: 'Divisão de Receitas / Split Financeiro', subtitle: 'Partilha automatizada de receitas entre organizador, coprodutor, artista e plataforma.' },
      'diskSplit': { title: 'Divisão de Receitas / Split Financeiro', subtitle: 'Partilha automatizada de receitas entre organizador, coprodutor, artista e plataforma.' },
      'diskCentralEstornos': { title: 'Centro de Controle de Estornos', subtitle: 'Gestão executiva de devoluções, aprovações por alçada, vouchers e risco operacional.' }
    };

    const currentInfo = titlesMap[state.currentView] || { title: 'Módulo Financeiro', subtitle: 'Sistema integrado de gestão financeira Disk Ingressos.' };
    if (viewTitle) viewTitle.innerText = currentInfo.title;
    if (viewSubtitle) viewSubtitle.innerHTML = currentInfo.subtitle;

    // Header Action Toolbar Dinâmica conforme o Perfil
    const toolbar = document.getElementById('header-action-toolbar');
    if (toolbar) {
      if (isDisk || isMaster) {
        let producerOptions = `<option value="all" ${state.selectedProducerId === 'all' ? 'selected' : ''}>Buscar produtor... (Todos) ▼</option>`;
        state.data.producers.forEach(p => {
          producerOptions += `<option value="${p.id}" ${state.selectedProducerId === p.id ? 'selected' : ''}>Produtor: ${p.name}</option>`;
        });

        let availableEvents = state.data.events;
        if (state.selectedProducerId && state.selectedProducerId !== 'all') {
          availableEvents = availableEvents.filter(e => e.producerId === state.selectedProducerId);
        }

        let eventOptions = `<option value="all" ${state.selectedEventId === 'all' ? 'selected' : ''}>Todos os eventos ▼</option>`;
        availableEvents.forEach(e => {
          eventOptions += `<option value="${e.id}" ${state.selectedEventId === e.id ? 'selected' : ''}>${e.name}</option>`;
        });

        const pendingCount = state.pendingApprovalsCount || 17;

        toolbar.innerHTML = `
          <div class="producer-selector-box d-flex align-items-center">
            <select class="form-select form-select-sm fw-semibold shadow-sm" id="globalProducerSelect" style="min-width: 215px;" onchange="window.app && window.app.setSelectedProducer(this.value)">
              ${producerOptions}
            </select>
          </div>
          <div class="event-selector-box d-flex align-items-center">
            <select class="form-select form-select-sm fw-semibold shadow-sm" id="globalEventSelect" style="min-width: 210px;" onchange="window.app && window.app.setSelectedEvent(this.value)">
              ${eventOptions}
            </select>
          </div>
          <div class="period-selector-box d-flex align-items-center">
            <select class="form-select form-select-sm fw-semibold shadow-sm" id="globalPeriodSelect" style="min-width: 165px;" onchange="window.app && window.app.setSelectedPeriod(this.value)">
              <option value="month" selected>Período: Mês Atual ▼</option>
              <option value="30d">Período: Últimos 30 dias ▼</option>
              <option value="90d">Período: Últimos 90 dias ▼</option>
              <option value="year">Período: Ano 2026 ▼</option>
              <option value="all">Período: Todo o Histórico ▼</option>
            </select>
          </div>
          <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm" onclick="window.app && window.app.refreshData()" title="Sincronizar">
            <i class="ph-arrows-counter-clockwise"></i> <span class="d-none d-md-inline">Atualizar</span>
          </button>
          <button class="btn btn-sm btn-warning text-dark fw-bold d-flex align-items-center gap-1 shadow-sm" onclick="window.app && window.app.navigate('diskAprovacoes')">
            <i class="ph-bell fs-5"></i> <span>Central de Aprovações</span>
            <span class="badge rounded-pill bg-danger text-white fs-xxs ms-1">${pendingCount}</span>
          </button>
        `;
      } else {
        const producerEvents = state.data.events.filter(e => e.producerId === state.activeProducer.id);
        let eventOptions = `<option value="all" ${state.selectedEventId === 'all' ? 'selected' : ''}>Todos os Eventos (Consolidado)</option>`;
        producerEvents.forEach(e => {
          eventOptions += `<option value="${e.id}" ${state.selectedEventId === e.id ? 'selected' : ''}>${e.name}</option>`;
        });

        toolbar.innerHTML = `
          <div class="event-selector-box d-flex align-items-center">
            <select class="form-select form-select-sm fw-semibold shadow-sm" id="globalEventSelect" style="min-width: 260px;" onchange="window.app && window.app.setSelectedEvent(this.value)">
              ${eventOptions}
            </select>
          </div>
          <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm" onclick="window.app && window.app.refreshData()">
            <i class="ph-arrows-counter-clockwise"></i> <span>Atualizar</span>
          </button>
          <button class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm" onclick="window.app && window.app.openPayoutModal()">
            <i class="ph-hand-coins"></i> <span>Solicitar Repasse</span>
          </button>
        `;
      }
    }
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

    let profileKey = 'PRODUTOR';
    if (isMaster) {
      profileKey = 'ADMINISTRADOR';
    } else if (isDisk || state.currentUser.role === 'disk') {
      profileKey = 'FINANCEIRO';
    }

    const menuItems = (menusPorPerfil[profileKey] || menusPorPerfil.PRODUTOR).filter(item => !item.hidden);

    this.sidebarNav.innerHTML = menuItems.map(item => {
      const hasSubs = Array.isArray(item.subItems) && item.subItems.length > 0;
      const isParentActive = currentView === item.id;
      const badgeHtml = item.badge === 'pendingCount' 
        ? `<span class="badge rounded-pill bg-danger fs-xxs">${pendingCount}</span>` 
        : '';

      if (hasSubs) {
        const isChildActive = item.subItems.some(sub => sub.id === currentView);
        const isOpen = isParentActive || isChildActive;

        return `
          <li class="nav-item nav-item-submenu ${isOpen ? 'is-open' : ''}">
            <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
              <div class="nav-item-left">
                <i class="${item.icon} nav-item-icon"></i>
                <span class="nav-item-title">${item.label}</span>
              </div>
              <div class="nav-item-right">
                ${badgeHtml}
                <i class="ph-caret-right nav-arrow"></i>
              </div>
            </a>
            <ul class="nav-group-sub">
              ${item.subItems.map(sub => {
                if (sub.action === 'openPayoutModal') {
                  return `
                    <li class="nav-item">
                      <a class="nav-link" onclick="window.app.openPayoutModal()">
                        <i class="ph-plus-circle"></i>
                        <span>${sub.label}</span>
                      </a>
                    </li>
                  `;
                }
                const isSubActive = currentView === sub.id && (!this.currentFilterArg || this.currentFilterArg === sub.filterArg);
                return `
                  <li class="nav-item">
                    <a class="nav-link ${isSubActive ? 'active' : ''}" onclick="window.app.navigate('${sub.id}', '${sub.filterArg || 'all'}')">
                      <i class="ph-caret-right"></i>
                      <span>${sub.label}</span>
                    </a>
                  </li>
                `;
              }).join('')}
            </ul>
          </li>
        `;
      }

      return `
        <li class="nav-item">
          <a class="nav-link ${isParentActive ? 'active' : ''}" onclick="window.app.navigate('${item.id}')">
            <div class="nav-item-left">
              <i class="${item.icon} nav-item-icon"></i>
              <span class="nav-item-title">${item.label}</span>
            </div>
            ${badgeHtml ? `<div class="nav-item-right">${badgeHtml}</div>` : ''}
          </a>
        </li>
      `;
    }).join('');
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

  closeToast() {
    financialStore.closeToast();
  }

  financeAction(action, id = '', data = null) {
    const routes = {
      'nova-regra': 'diskGovernanca_alcadas',
      'editar-alcadas': 'diskGovernanca_alcadas',
      'detalhar-regra': 'diskGovernanca_fluxos',
      'configurar-segregacao': 'diskGovernanca_segregacao',
      'regras-protecao': 'diskGovernanca_sensiveis',
      'tratar-excecoes': 'diskGovernanca_bloqueios',
      'gerenciar-usuarios': 'diskGovernanca_usuarios',
      'ver-alcadas': 'diskGovernanca_alcadas',
      'abrir-aprovacoes': 'diskAprovacoes',
      'ver-auditoria': 'diskGovernanca_acessos',
      'logs-integracao': 'diskIntegracao_logs',
      'central-assinaturas': 'diskIntegracao_assinaturas',
      'novo-repasse': 'repasses',
      'nova-antecipacao': 'antecipacoes',
      'abrir-conciliacao': 'diskConciliacao',
      'ver-recebiveis': 'diskRecebiveis',
      'ver-ledger': 'diskLedger',
      'ver-fechamentos': 'diskFechamentos',
      'ver-dossie': 'diskFechamentos',
      'ver-fluxo-caixa': 'diskFluxoCaixa',
      'ver-pix': 'diskPix',
      'ver-cnab': 'diskCnab',
      'ver-pagamentos-lote': 'diskPagamentosLote',
      'abrir-central-trabalho': 'diskCentralTrabalho'
    };

    const labels = {
      'nova-regra': 'Nova regra de alçada preparada para configuração.',
      'editar-alcadas': 'Matriz de alçadas aberta para edição administrativa.',
      'detalhar-regra': `Regra ${id !== '' ? Number(id) + 1 : ''} aberta com seu fluxo relacionado.`,
      'configurar-segregacao': 'Políticas de Segregação de Funções (SoD) abertas.',
      'regras-protecao': 'Catálogo de Operações Sensíveis aberto para auditoria.',
      'tratar-excecoes': 'Módulo de Quarentena e Exceções carregado.',
      'gerenciar-usuarios': 'Gestão de Usuários Financeiros e Perfis carregada.',
      'ver-alcadas': 'Navegando para Matriz de Alçadas.',
      'abrir-aprovacoes': 'Central de Aprovações aberta.',
      'ver-auditoria': 'Trilha de auditoria carregada.',
      'logs-integracao': 'Logs técnicos de integração carregados.',
      'central-assinaturas': 'Central de Assinaturas digitais carregada.',
      'aprovar-operacao': `Operação ${id || ''} aprovada com sucesso e encaminhada para assinatura/pagamento.`,
      'rejeitar-operacao': `Operação ${id || ''} rejeitada e reserva de saldo liberada.`,
      'assinar-termo': `Documento vinculado à operação ${id || ''} assinado digitalmente via ICP-Brasil.`,
      'executar-pagamento': `Ordem de pagamento ${id || ''} autorizada e enviada para liquidação PIX/CNAB.`,
      'conciliar-movimento': `Lançamento ${id || ''} conciliado com sucesso no Ledger e extrato bancário.`,
      'ajustar-ledger': 'Solicitação de ajuste contábil enviada para validação da Controladoria.',
      'exportar-dados': 'Relatório analítico exportado com sucesso em formato CSV.',
      'atualizar-central': 'Fila da Central de Trabalho atualizada com sucesso.'
    };

    // Ações operacionais que alteram o estado do sistema e refletem em tempo real
    if (action === 'aprovar-operacao' && id) {
      if (typeof financialStore.approveOperationByDisk === 'function') {
        financialStore.approveOperationByDisk(id);
      } else if (typeof financialStore.approveRequest === 'function') {
        financialStore.approveRequest(id, 'Aprovado via Governança/Ações Financeiras');
      }
      financialStore.showToast('Operação Aprovada', labels[action] || `Operação ${id} aprovada.`, 'success');
      this.navigate('diskAprovacoes');
      return;
    }

    if (action === 'rejeitar-operacao' && id) {
      if (typeof financialStore.rejectOperationByDisk === 'function') {
        financialStore.rejectOperationByDisk(id, {
          reasonCategory: 'Política de Risco',
          observation: 'Rejeitado por política de governança e alçadas'
        });
      } else if (typeof financialStore.rejectRequest === 'function') {
        financialStore.rejectRequest(id, 'Rejeitado por política de risco');
      }
      financialStore.showToast('Operação Rejeitada', labels[action] || `Operação ${id} rejeitada.`, 'warning');
      this.navigate('diskAprovacoes');
      return;
    }

    if (action === 'ver-dossie') {
      const state = financialStore.getState();
      if (id && state.data.producers.some(p => p.id === id)) {
        return this.openProducerDossier(id);
      }
      this.navigate('diskFechamentos', 'dossie');
      return;
    }

    if (action === 'assinar-termo') {
      financialStore.showToast('Assinatura Digital', labels[action] || 'Termo assinado.', 'success');
      this.navigate('diskIntegracao_assinaturas');
      return;
    }

    if (action === 'executar-pagamento') {
      financialStore.showToast('Tesouraria', labels[action] || 'Pagamento processado.', 'success');
      this.navigate('diskPix');
      return;
    }

    if (action === 'conciliar-movimento') {
      financialStore.showToast('Conciliação', labels[action] || 'Movimento conciliado.', 'success');
      this.navigate('diskConciliacao');
      return;
    }

    if (action === 'novo-repasse') {
      if (typeof this.openPayoutModal === 'function') {
        this.openPayoutModal();
      } else {
        this.navigate('repasses');
      }
      return;
    }

    financialStore.showToast('Ação Financeira', labels[action] || 'Ação executada e comunicada ao módulo relacionado.', 'info');
    if (routes[action]) {
      this.navigate(routes[action]);
    }
  }

  // ==========================================================================
  // BARRAMENTO FUNCIONAL DE AÇÕES INTEGRADAS (PACOTE 11 / PACOTE 12)
  // Comunicação transversal: Ação → Feedback → Módulo de Destino → Atualização
  // ==========================================================================
  integratedAction(action, options = {}) {
    const opts = typeof options === 'string' || typeof options === 'number' ? { id: String(options) } : (options || {});
    const id = opts.id || opts.protocol || '';

    const actionRoutes = {
      'novo-repasse': { route: 'repasses', msg: 'Formulário de solicitação de repasse iniciado.', type: 'info' },
      'nova-antecipacao': { route: 'antecipacoes', msg: 'Simulador de antecipação de recebíveis aberto.', type: 'info' },
      'abrir-aprovacoes': { route: 'diskAprovacoes', msg: 'Central de Aprovações carregada.', type: 'info' },
      'abrir-solicitacoes': { route: 'diskSolicitacoes', msg: 'Central de Solicitações carregada.', type: 'info' },
      'abrir-assinaturas': { route: 'diskAssinaturas', msg: 'Central de Assinaturas digitais carregada.', type: 'info' },
      'abrir-tesouraria': { route: 'diskTesouraria', msg: 'Módulo de Tesouraria e Contas Bancárias aberto.', type: 'info' },
      'abrir-conciliacao': { route: 'diskConciliacao', msg: 'Central de Conciliação Financeira carregada.', type: 'info' },
      'abrir-ledger': { route: 'diskLedger', msg: 'Livro-Razão Contábil (Ledger) carregado.', type: 'info' },
      'abrir-pix': { route: 'diskPix', msg: 'Módulo de transferências PIX carregado.', type: 'info' },
      'abrir-cnab': { route: 'diskCnab', msg: 'Processamento de Remessas e Retornos CNAB aberto.', type: 'info' },
      'abrir-autentique': { route: 'diskIntegracao_autentique', msg: 'Painel de integração Autentique carregado.', type: 'info' },
      'abrir-contaazul': { route: 'diskIntegracao_contaazul', msg: 'Painel de sincronização Conta Azul carregado.', type: 'info' },
      'abrir-governanca': { route: 'diskGovernanca', msg: 'Painel de Governança e Alçadas carregado.', type: 'info' },
      'abrir-central-trabalho': { route: 'diskCentralTrabalho', msg: 'Central de Trabalho Financeiro aberta.', type: 'info' },
      'aprovar-operacao': { route: 'diskAprovacoes', msg: `Operação ${id} aprovada com sucesso.`, type: 'success' },
      'rejeitar-operacao': { route: 'diskAprovacoes', msg: `Operação ${id} rejeitada formalmente.`, type: 'warning' },
      'assinar-termo': { route: 'diskAssinaturas', msg: `Termo vinculado à operação ${id} assinado.`, type: 'success' },
      'liquidar-operacao': { route: 'diskPix', msg: `Ordem de pagamento ${id} liquidada na Tesouraria.`, type: 'success' },
      'conciliar-operacao': { route: 'diskConciliacao', msg: `Operação ${id} conciliada no Ledger.`, type: 'success' },
      'sincronizar-erp': { route: 'diskIntegracao_sincronizacoes', msg: 'Sincronização com ERP enfileirada.', type: 'info' },
      'gerar-cnab': { route: 'diskCnab', msg: 'Arquivo de remessa CNAB 240 gerado com sucesso.', type: 'success' },
      'definir-conta-padrao': { route: 'dadosBancarios', msg: 'Conta bancária homologada definida como padrão.', type: 'success' },
      'exportar-relatorio': { route: null, msg: 'Relatório financeiro exportado com sucesso.', type: 'success' }
    };

    const targetDef = actionRoutes[action];

    if (action === 'novo-repasse') {
      if (typeof this.openPayoutModal === 'function') {
        this.openPayoutModal();
      } else {
        this.navigate('repasses');
      }
      return;
    }

    if (action === 'aprovar-operacao' && id) {
      if (typeof financialStore.approveOperationByDisk === 'function') {
        financialStore.approveOperationByDisk(id);
      } else if (typeof financialStore.approveRequest === 'function') {
        financialStore.approveRequest(id, opts.note || 'Aprovado via Ação Integrada');
      }
      this.navigate('diskAprovacoes');
      return;
    }

    if (action === 'rejeitar-operacao' && id) {
      if (typeof financialStore.rejectOperationByDisk === 'function') {
        financialStore.rejectOperationByDisk(id, {
          reasonCategory: opts.reasonCategory || 'Divergência Documental / Risco',
          observation: opts.observation || opts.reason || 'Rejeição formal solicitada via fluxo operacional.'
        });
      } else if (typeof financialStore.rejectRequest === 'function') {
        financialStore.rejectRequest(id, opts.reason || 'Rejeição via Ação Integrada');
      }
      this.navigate('diskAprovacoes');
      return;
    }

    if (action === 'assinar-termo' && id) {
      const state = financialStore.getState();
      if (state.currentUser.role === 'producer') {
        financialStore.signByProducer(id);
      } else {
        financialStore.signByDisk(id);
      }
      this.navigate('diskAssinaturas');
      return;
    }

    if (action === 'liquidar-operacao' && id) {
      financialStore.executeFinalTransfer(id);
      this.navigate('diskPix');
      return;
    }

    const message = opts.message || targetDef?.msg || `Ação ${action} processada com sucesso.`;
    const toastType = targetDef?.type || 'info';
    financialStore.showToast('Fluxo Integrado', message, toastType);

    const targetRoute = opts.target || targetDef?.route;
    if (targetRoute) {
      this.navigate(targetRoute, opts.filterArg || 'all');
    }
  }

  // ==========================================================================
  // FUNÇÕES AVANÇADAS DO PACOTE 13 E 14 (SPREAD, ADVANCED, SPLIT, ESTORNOS)
  // ==========================================================================
  p13Action(action, id = '') {
    try {
      if (action === 'nova-taxa' || action === 'editar-taxa' || action === 'duplicar-taxa') {
        return this.openSpreadRuleModal(action, id);
      }
      if (action === 'novo-lancamento') {
        return this.openPayableModal();
      }
      if (action === 'novo-estorno') {
        return this.openRefundModal();
      }
      if (action === 'editar-split') {
        return this.openSplitModal(id);
      }
      if (action === 'liquidar') {
        const row = financialStore.liquidatePayable(id);
        financialStore.showToast('Título Liquidado', `${row.id} · ${row.creditor} foi liquidado e lançado no Ledger.`, 'success');
        return this.navigate('diskAdvanced');
      }

      const routes = {
        'analisar-estorno': 'diskAprovacoes',
        'historico-split': 'diskDivisaoReceitas'
      };
      const map = {
        'simular-spread': ['Simulador de Spread', 'A simulação usa as regras persistidas e não altera o Ledger.'],
        'historico-split': ['Histórico de Splits', 'Histórico operacional preservado no estado do Core Financeiro.'],
        'exportar-estornos': ['Exportação', 'Visão de estornos preparada para exportação analítica.'],
        'analisar-estorno': ['Central de Aprovações', `Estorno ${id || ''} aberto na fila de análise com o mesmo protocolo.`]
      };
      const x = map[action] || ['Ação Financeira', 'Ação registrada no fluxo operacional.'];
      financialStore.showToast(x[0], x[1], 'info');
      if (routes[action]) this.navigate(routes[action]);
    } catch (e) {
      financialStore.showToast('Operação não realizada', e.message, 'danger');
    }
  }

  openSpreadRuleModal(action = 'nova-taxa', id = '') {
    const st = financialStore.getState();
    let r = st.data.spreadRules?.find(x => x.id === id) || { name: '', acquirer: '', chargedRate: '', mdr: '', fixedFee: 0, payer: 'Produtor', term: 'D+30' };
    if (action === 'duplicar-taxa') r = { ...r, id: null, name: `${r.name} (cópia)` };
    this.showModal(`
      <div class="modal-card" style="max-width: 620px;">
        <div class="modal-header">
          <h4 class="mb-0 fw-bold">${action === 'nova-taxa' ? 'Nova' : (action === 'duplicar-taxa' ? 'Duplicar' : 'Editar')} Regra de Spread</h4>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <form class="modal-body p-4" onsubmit="window.app.submitSpreadRule(event, '${action === 'editar-taxa' ? id : ''}')">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-bold">Regra / Meio de Pagamento</label>
              <input name="name" class="form-control" required value="${r.name || ''}" placeholder="Ex: Cartão de Crédito Parcelado (2 a 6x)">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Adquirente</label>
              <input name="acquirer" class="form-control" required value="${r.acquirer || ''}" placeholder="Ex: Cielo, Rede, Stone">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Taxa Cobrada %</label>
              <input name="chargedRate" type="number" step="0.01" class="form-control" required value="${r.chargedRate || ''}">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Custo MDR %</label>
              <input name="mdr" type="number" step="0.01" class="form-control" required value="${r.mdr || ''}">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Tarifa Fixa (R$)</label>
              <input name="fixedFee" type="number" step="0.01" class="form-control" value="${r.fixedFee || 0}">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Quem Absorve</label>
              <select name="payer" class="form-select">
                <option value="Produtor" ${r.payer === 'Produtor' ? 'selected' : ''}>Produtor (Retenção)</option>
                <option value="Comprador" ${r.payer === 'Comprador' ? 'selected' : ''}>Comprador (Conveniência)</option>
                <option value="Compartilhada" ${r.payer === 'Compartilhada' ? 'selected' : ''}>Compartilhada</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Prazo Liquidação</label>
              <input name="term" class="form-control" value="${r.term || 'D+30'}">
            </div>
          </div>
          <div class="modal-footer px-0 pb-0 mt-4">
            <button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Salvar e Publicar</button>
          </div>
        </form>
      </div>
    `);
  }

  submitSpreadRule(ev, id = '') {
    ev.preventDefault();
    try {
      const f = Object.fromEntries(new FormData(ev.target).entries());
      const row = financialStore.saveSpreadRule(f, id || null);
      this.closeModal();
      financialStore.showToast('Regra de Spread Salva', `${row.id} publicada e persistida com spread líquido de +${(row.chargedRate - row.mdr).toFixed(2)}%.`, 'success');
      this.navigate('diskSpread');
    } catch (e) {
      financialStore.showToast('Não foi possível salvar', e.message, 'danger');
    }
  }

  openPayableModal() {
    this.showModal(`
      <div class="modal-card" style="max-width: 560px;">
        <div class="modal-header">
          <h4 class="mb-0 fw-bold">Novo Lançamento Financeiro</h4>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <form class="modal-body p-4" onsubmit="window.app.submitPayable(event)">
          <div class="mb-3">
            <label class="form-label fw-bold">Fornecedor / Credor</label>
            <input name="creditor" class="form-control" required placeholder="Ex: Mega Som & Iluminação">
          </div>
          <div class="row g-3">
            <div class="col-6">
              <label class="form-label fw-bold">Vencimento</label>
              <input name="dueDate" type="date" class="form-control" required>
            </div>
            <div class="col-6">
              <label class="form-label fw-bold">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" class="form-control" required placeholder="0.00">
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label fw-bold">Observação</label>
            <textarea name="notes" class="form-control" placeholder="Descreva a despesa ou centro de custo..."></textarea>
          </div>
          <div class="modal-footer px-0 pb-0 mt-4">
            <button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Salvar Lançamento</button>
          </div>
        </form>
      </div>
    `);
  }

  submitPayable(ev) {
    ev.preventDefault();
    try {
      const f = Object.fromEntries(new FormData(ev.target).entries());
      const r = financialStore.createPayable(f);
      this.closeModal();
      financialStore.showToast('Lançamento Criado', `${r.id} (${r.creditor}) salvo e disponível no Financeiro Advanced.`, 'success');
      this.navigate('diskAdvanced');
    } catch (e) {
      financialStore.showToast('Não foi possível salvar', e.message, 'danger');
    }
  }

  openRefundModal() {
    this.showModal(`
      <div class="modal-card" style="max-width: 620px;">
        <div class="modal-header">
          <h4 class="mb-0 fw-bold">Nova Solicitação de Estorno</h4>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <form class="modal-body p-4" onsubmit="window.app.submitRefund(event)">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold">Pedido Original</label>
              <input name="orderId" class="form-control" required placeholder="Ex: #PED-154231">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Cliente</label>
              <input name="customer" class="form-control" placeholder="Nome do titular da compra">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Evento Vinculado</label>
              <input name="eventName" class="form-control" placeholder="Nome do evento">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" class="form-control" required placeholder="0.00">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Pagamento</label>
              <select name="paymentMethod" class="form-select">
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-bold">Motivo da Devolução</label>
              <textarea name="reason" class="form-control" required placeholder="Justifique o motivo do estorno para conferência de alçada..."></textarea>
            </div>
          </div>
          <div class="modal-footer px-0 pb-0 mt-4">
            <button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Enviar para Aprovação</button>
          </div>
        </form>
      </div>
    `);
  }

  submitRefund(ev) {
    ev.preventDefault();
    try {
      const f = Object.fromEntries(new FormData(ev.target).entries());
      const r = financialStore.createRefundRequest(f);
      this.closeModal();
      financialStore.showToast('Estorno Protocolado', `${r.id} criado com protocolo único e encaminhado à Central de Aprovações.`, 'success');
      this.navigate('diskCentralEstornos');
    } catch (e) {
      financialStore.showToast('Não foi possível criar', e.message, 'danger');
    }
  }

  openSplitModal(id = '') {
    const st = financialStore.getState();
    const r = st.data.splitRules?.find(x => x.id === id) || st.data.splitRules?.find(x => x.status === 'Ativa');
    const b = r?.beneficiaries || [];
    this.showModal(`
      <div class="modal-card" style="max-width: 680px;">
        <div class="modal-header">
          <h4 class="mb-0 fw-bold">Configurar Divisão de Receitas (Split)</h4>
          <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
        </div>
        <form class="modal-body p-4" onsubmit="window.app.submitSplit(event)">
          <div class="mb-3">
            <label class="form-label fw-bold">Nome da Regra</label>
            <input name="name" class="form-control" value="${r?.name || 'Regra padrão do evento'}" required>
            <input type="hidden" name="eventId" value="${st.selectedEventId === 'all' ? 'evt-001' : st.selectedEventId}">
          </div>
          <label class="form-label fw-bold mb-2">Beneficiários e Percentuais (Soma obrigatória: 100%)</label>
          <div class="row g-2">
            ${[0, 1, 2, 3].map(i => `
              <div class="col-8">
                <input name="beneficiary${i}" class="form-control" required value="${b[i]?.name || ''}" placeholder="Nome do Beneficiário ${i + 1}">
              </div>
              <div class="col-4">
                <div class="input-group">
                  <input name="percent${i}" type="number" step="0.01" class="form-control" required value="${b[i]?.percent ?? 0}">
                  <span class="input-group-text">%</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="alert alert-info mt-3 mb-0 fs-xs">
            <i class="ph-info me-1"></i> A publicação desta regra substitui a regra ativa anterior do evento e recalcula os recebíveis com registro imutável no Ledger.
          </div>
          <div class="modal-footer px-0 pb-0 mt-4">
            <button type="button" class="btn btn-light" onclick="window.app.closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Publicar Regra de Split</button>
          </div>
        </form>
      </div>
    `);
  }

  submitSplit(ev) {
    ev.preventDefault();
    try {
      const f = Object.fromEntries(new FormData(ev.target).entries());
      const beneficiaries = [0, 1, 2, 3]
        .filter(i => f[`beneficiary${i}`])
        .map(i => ({ name: f[`beneficiary${i}`], percent: Number(f[`percent${i}`]) }));
      const r = financialStore.saveSplitRule({ eventId: f.eventId, name: f.name, beneficiaries });
      this.closeModal();
      financialStore.showToast('Regra de Divisão Publicada', `${r.id} persistida e ativada para o evento com 100% distribuído.`, 'success');
      this.navigate('diskDivisaoReceitas');
    } catch (e) {
      financialStore.showToast('Regra não publicada', e.message, 'danger');
    }
  }

  p13RecalcSplit(raw) {
    const n = Number(String(raw).replace(/\./g, '').replace(',', '.')) || 0;
    const el = document.getElementById('p13SplitBars');
    if (!el) return;
    const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const st = financialStore.getState();
    const activeRule = (st.data.splitRules || []).find(x => x.status === 'Ativa') || {};
    const rows = (activeRule.beneficiaries && activeRule.beneficiaries.length) ? activeRule.beneficiaries : [
      { name: 'Organizador (Principal)', percent: 70 },
      { name: 'Afiliado / Coprodutor', percent: 10 },
      { name: 'Produtor Artístico', percent: 15 },
      { name: 'Plataforma DiskIngressos', percent: 5 }
    ];
    el.innerHTML = rows.map(x => `
      <div class="p13-bar">
        <div><strong>${x.name}</strong><span>${x.percent}% | ${money(n * x.percent / 100)}</span></div>
        <div class="p13-track"><i style="width:${x.percent}%"></i></div>
      </div>
    `).join('');
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

window.integratedAction = function(action, options) {
  if (window.app && typeof window.app.integratedAction === 'function') {
    return window.app.integratedAction(action, options);
  }
};

window.financeAction = function(action, id, data) {
  if (window.app && typeof window.app.financeAction === 'function') {
    return window.app.financeAction(action, id, data);
  }
};

window.p13Action = function(action, id) {
  if (window.app && typeof window.app.p13Action === 'function') {
    return window.app.p13Action(action, id);
  }
};

window.p13RecalcSplit = function(raw) {
  if (window.app && typeof window.app.p13RecalcSplit === 'function') {
    return window.app.p13RecalcSplit(raw);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new LimitlessFinancialApp();
  });
} else {
  window.app = new LimitlessFinancialApp();
}
