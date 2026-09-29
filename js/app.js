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
import { renderDiskAprovacoes } from './views/disk/aprovacoes.js';
import { renderDiskProdutores } from './views/disk/produtores.js';
import { renderDiskGateways } from './views/disk/gatewaysMdr.js';
import { renderDiskLedger } from './views/disk/ledger.js';
import { renderDiskTesouraria } from './views/disk/tesouraria.js';

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
      'financial-posicao-geral': 'diskDashboard',
      'financial-saldos': 'saldos',
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
      'dashboard-indicators': 'relatorios',
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
    financialStore.showToast("Dados Atualizados", "Sincronização em tempo real com o Core Financeiro concluída", "success");
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
    const notes = document.getElementById('modalPayoutNotes').value;

    const payout = financialStore.requestPayout({ eventId, amount, bankAccountId, notes });
    this.closeModal();

    financialStore.showToast("Repasse Solicitado", `Protocolo ${payout.id} no valor de ${formatCurrency(amount)} enviado para análise`, "success");
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
        case 'diskAprovacoes':
          viewHtml = renderDiskAprovacoes(state, this.currentFilterArg);
          break;
        case 'diskProdutores':
          viewHtml = renderDiskProdutores(state);
          break;
        case 'diskGateways':
          viewHtml = renderDiskGateways(state);
          break;
        case 'diskLedger':
          viewHtml = renderDiskLedger(state);
          break;
        case 'diskTesouraria':
          viewHtml = renderDiskTesouraria(state);
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

    // Role Badge Button
    const badgeBtn = document.getElementById('navbar-role-badge-btn');
    const badgeIcon = document.getElementById('navbar-role-icon');
    const badgeLabel = document.getElementById('navbar-role-label');

    if (badgeLabel && badgeIcon) {
      if (isMaster) {
        badgeIcon.className = 'ph-crown text-warning';
        badgeLabel.innerText = 'Administrador Master';
      } else if (isDisk) {
        badgeIcon.className = 'ph-shield-check text-success';
        badgeLabel.innerText = 'Financeiro Disk';
      } else {
        badgeIcon.className = 'ph-user text-primary';
        badgeLabel.innerText = 'Produtor';
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
  }

  renderPageHeader(state) {
    const domainBadge = document.getElementById('header-domain-badge');
    const eventBadge = document.getElementById('header-event-badge');
    const viewTitle = document.getElementById('active-view-title');
    const viewSubtitle = document.getElementById('active-view-subtitle');

    const isDisk = state.viewMode === 'disk';

    if (domainBadge) {
      domainBadge.innerText = isDisk ? 'FINANCEIRO ENTERPRISE' : 'PORTAL DO PRODUTOR';
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
      'diskDashboard': { title: 'Posição Financeira Geral Disk', subtitle: 'Painel executivo com volume transacionado, obrigações com produtores e liquidez.' },
      'diskAprovacoes': { title: 'Central Unificada de Aprovações', subtitle: 'Workflow transversal &bull; Governança Maker/Checker &bull; Assinaturas sequenciais &bull; SLA.' },
      'diskProdutores': { title: 'Gestão 360 de Produtores', subtitle: 'Contas financeiras, contratos, travas, limites e histórico de todos os produtores.' },
      'diskGateways': { title: 'Gateways, Adquirentes & MDR', subtitle: 'Roteamento inteligente de transações, taxas de adquirência e spread comercial Disk (1,22%).' },
      'diskLedger': { title: 'Ledger Contábil de Partidas Dobradas', subtitle: 'Livro-razão contábil imutável, conciliação e rastreabilidade total de cada centavo.' },
      'diskTesouraria': { title: 'Tesouraria & Fechamento CNAB 240', subtitle: 'Mesa de operações, geração de lotes bancários CNAB 240 e conciliação bancária.' }
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
  // RENDERIZADOR DA SIDEBAR (ACCORDION & CANONICAL SUBMENUS)
  // ==========================================================================
  renderSidebar(state) {
    if (!this.sidebarNav) return;

    const isDisk = state.viewMode === 'disk';
    const pendingCount = state.pendingApprovalsCount || 17;

    // Se estiver no FINANCEIRO DISK (Menu corporativo completo de 10 domínios)
    if (isDisk) {
      this.sidebarNav.innerHTML = `
        <!-- TODOS OS EVENTOS -->
        <li class="nav-item">
          <a class="nav-link ${state.currentView === 'saldos' ? 'active' : ''}" onclick="window.app.navigate('saldos')">
            <i class="ph-calendar"></i>
            <span>Todos os Eventos</span>
          </a>
        </li>

        <!-- PAINEL GERAL -->
        <li class="nav-item nav-item-submenu ${['diskDashboard', 'overview'].includes(state.currentView) ? 'is-open' : ''}">
          <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
            <i class="ph-gauge"></i>
            <span>Painel Geral</span>
            <i class="ph-caret-right nav-arrow"></i>
          </a>
          <ul class="nav-group-sub">
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskDashboard' ? 'active' : ''}" onclick="window.app.navigate('diskDashboard')">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')">Agenda</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('relatorios')">Indicadores</a></li>
          </ul>
        </li>

        <!-- MEUS EVENTOS -->
        <li class="nav-item nav-item-submenu">
          <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
            <i class="ph-calendar"></i>
            <span>Meus Eventos</span>
            <span class="badge rounded-pill ms-auto" style="background: #f38d4f; color: white;">2</span>
            <i class="ph-caret-right nav-arrow"></i>
          </a>
          <ul class="nav-group-sub">
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('saldos')">Todos Eventos</a></li>
            <li class="nav-item"><a class="nav-link" onclick="alert('Assistente de Novo Evento')">Novo Evento</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('vendas')">Lotes &amp; Cupons</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('vendas')">Check-in &amp; Participantes</a></li>
          </ul>
        </li>

        <!-- CONSULTA DE INGRESSOS -->
        <li class="nav-item">
          <a class="nav-link" onclick="window.app.navigate('vendas')">
            <i class="ph-ticket"></i>
            <span>Consulta de Ingressos</span>
          </a>
        </li>

        <!-- MARKETING HUB -->
        <li class="nav-item nav-item-submenu">
          <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
            <i class="ph-megaphone"></i>
            <span>Marketing</span>
            <span class="badge bg-primary rounded-pill ms-auto">Hub</span>
            <i class="ph-caret-right nav-arrow"></i>
          </a>
          <ul class="nav-group-sub">
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('relatorios')">Visão Geral</a></li>
            <li class="nav-item"><a class="nav-link" onclick="alert('Campanhas de Marketing')">Campanhas &amp; WhatsApp</a></li>
            <li class="nav-item"><a class="nav-link" onclick="alert('Carrinho Abandonado')">Carrinho Abandonado</a></li>
          </ul>
        </li>

        <!-- ========================================================================== -->
        <!-- FINANCEIRO ENTERPRISE (Fase 28.15.3 — Arquitetura de 10 Domínios) -->
        <!-- ========================================================================== -->
        <li class="nav-item nav-item-submenu is-open" id="nav-item-financeiro">
          <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')" style="color: #60a5fa !important;">
            <i class="ph-wallet"></i>
            <span class="fw-bold">Financeiro</span>
            <span class="badge bg-success rounded-pill ms-auto">Enterprise</span>
            <i class="ph-caret-right nav-arrow"></i>
          </a>
          <ul class="nav-group-sub">
            
            <!-- Visão Financeira -->
            <li class="nav-item-section-divider"><i class="ph-chart-pie"></i> Visão Financeira</li>

            <!-- 1. VISÃO GERAL -->
            <li class="nav-item-header"><i class="ph-squares-four me-1 text-primary"></i> 1. Visão Geral</li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskDashboard' ? 'active' : ''}" onclick="window.app.navigate('diskDashboard')"><i class="ph-chart-pie-slice me-2"></i> Dashboard Financeiro</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskDashboard')"><i class="ph-chart-line-up me-2 text-primary"></i> Posição Geral</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'saldos' ? 'active' : ''}" onclick="window.app.navigate('saldos')"><i class="ph-currency-circle-dollar me-2 text-success"></i> Saldos</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'taxas' ? 'active' : ''}" onclick="window.app.navigate('taxas')"><i class="ph-percent me-2 text-warning"></i> Taxas e Custos</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'bordero' ? 'active' : ''}" onclick="window.app.navigate('bordero')"><i class="ph-file-lock me-2 text-warning"></i> Fechamento Financeiro</a></li>
            
            <!-- Central de Aprovações com Badge Destacado -->
            <li class="nav-item">
              <a class="nav-link ${state.currentView === 'diskAprovacoes' ? 'active' : ''} d-flex justify-content-between align-items-center" onclick="window.app.navigate('diskAprovacoes')" style="color: #fbbf24 !important; font-weight: 700;">
                <span><i class="ph-scales me-2 text-warning"></i> Aprovações</span>
                <span class="badge rounded-pill bg-danger fs-xxs">${pendingCount}</span>
              </a>
            </li>

            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskAprovacoes')"><i class="ph-files me-2 text-primary"></i> Minhas Solicitações</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('relatorios')"><i class="ph-brain me-2 text-info"></i> Inteligência Financeira</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskDashboard')"><i class="ph-gauge me-2"></i> Indicadores</a></li>

            <!-- Tesouraria & Cadastros -->
            <li class="nav-item-section-divider"><i class="ph-vault"></i> Tesouraria &amp; Cadastros</li>

            <!-- 2. TESOURARIA -->
            <li class="nav-item-header"><i class="ph-vault me-1 text-primary"></i> 2. Tesouraria</li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskTesouraria' ? 'active' : ''}" onclick="window.app.navigate('diskTesouraria')"><i class="ph-bank me-2"></i> Conta Financeira</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('saldos')"><i class="ph-arrows-left-right me-2"></i> Gestão de Saldos</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.openTransferModal()"><i class="ph-arrows-clockwise me-2"></i> Transferência entre Eventos</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskGateways' ? 'active' : ''}" onclick="window.app.navigate('diskGateways')"><i class="ph-cpu me-2 text-primary"></i> Gateways e Adquirentes</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'dadosBancarios' ? 'active' : ''}" onclick="window.app.navigate('dadosBancarios')"><i class="ph-credit-card me-2"></i> Contas Bancárias</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-qr-code me-2"></i> PIX</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-file-code me-2"></i> CNAB 240</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-stack me-2"></i> Pagamentos em Lote</a></li>

            <!-- Operações Financeiras -->
            <li class="nav-item-section-divider"><i class="ph-arrows-clockwise"></i> Operações Financeiras</li>

            <!-- 3. CONTAS -->
            <li class="nav-item-header"><i class="ph-coins me-1 text-primary"></i> 3. Contas</li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('vendas')"><i class="ph-arrow-up-right me-2"></i> Contas a Receber</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-trend-down me-2"></i> Contas a Pagar</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'antecipacoes' ? 'active' : ''}" onclick="window.app.navigate('antecipacoes')"><i class="ph-hand-coins me-2"></i> Antecipações</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'repasses' ? 'active' : ''}" onclick="window.app.navigate('repasses')"><i class="ph-money me-2"></i> Repasses</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-calendar-check me-2"></i> Agenda Financeira</a></li>

            <!-- 4. COMPRAS -->
            <li class="nav-item-header"><i class="ph-shopping-cart me-1 text-primary"></i> 4. Compras (P2P)</li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskAprovacoes')"><i class="ph-check-circle me-2 text-warning"></i> Central de Solicitações</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-file-plus me-2"></i> Pedidos &amp; Cotações</a></li>

            <!-- 5. FORNECEDORES -->
            <li class="nav-item-header"><i class="ph-buildings me-1 text-primary"></i> 5. Fornecedores</li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskProdutores' ? 'active' : ''}" onclick="window.app.navigate('diskProdutores')"><i class="ph-identification-badge me-2"></i> Cadastro de Produtores</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskProdutores')"><i class="ph-arrows-out-card me-2"></i> Visão 360 do Fornecedor</a></li>

            <!-- 6. CONTRATOS -->
            <li class="nav-item-header"><i class="ph-scroll me-1 text-primary"></i> 6. Contratos</li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskGateways')"><i class="ph-file-text me-2"></i> Central de Contratos</a></li>

            <!-- 7. CONTROLADORIA -->
            <li class="nav-item-header"><i class="ph-presentation-chart me-1 text-primary"></i> 7. Controladoria</li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'diskLedger' ? 'active' : ''}" onclick="window.app.navigate('diskLedger')"><i class="ph-book-bookmark me-2"></i> Ledger de Partidas Dobradas</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskLedger')"><i class="ph-presentation me-2"></i> DRE Gerencial</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskDashboard')"><i class="ph-chart-line-up me-2"></i> Fluxo de Caixa</a></li>

            <!-- 8. CONCILIAÇÃO -->
            <li class="nav-item-section-divider"><i class="ph-check-square-offset"></i> Controle &amp; Conciliação</li>
            <li class="nav-item-header"><i class="ph-check-square-offset me-1 text-primary"></i> 8. Conciliação</li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskTesouraria')"><i class="ph-arrows-left-right me-2"></i> Bancária &amp; Retorno</a></li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('diskGateways')"><i class="ph-shield-check me-2"></i> Gateways &amp; MDR</a></li>

            <!-- 9. OPERAÇÃO -->
            <li class="nav-item-header"><i class="ph-gear me-1 text-primary"></i> 9. Operação</li>
            <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('vendas')"><i class="ph-storefront me-2"></i> PDV &amp; Métodos</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'estornos' ? 'active' : ''}" onclick="window.app.navigate('estornos')"><i class="ph-arrow-counter-clockwise me-2"></i> Estornos &amp; Chargebacks</a></li>

            <!-- 10. RELATÓRIOS -->
            <li class="nav-item-header"><i class="ph-file-text me-1 text-primary"></i> 10. Relatórios</li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'extrato' ? 'active' : ''}" onclick="window.app.navigate('extrato')"><i class="ph-receipt me-2"></i> Extrato Financeiro</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'bordero' ? 'active' : ''}" onclick="window.app.navigate('bordero')"><i class="ph-signature me-2"></i> Borderôs</a></li>
            <li class="nav-item"><a class="nav-link ${state.currentView === 'relatorios' ? 'active' : ''}" onclick="window.app.navigate('relatorios')"><i class="ph-chart-bar me-2"></i> Relatório Consolidado</a></li>

          </ul>
        </li>

        <!-- CONTABILIDADE ENTERPRISE -->
        <li class="nav-item">
          <a class="nav-link ${state.currentView === 'diskLedger' ? 'active' : ''}" onclick="window.app.navigate('diskLedger')">
            <i class="ph-book-open"></i>
            <span>Contabilidade</span>
            <span class="badge bg-primary rounded-pill ms-auto">Enterprise</span>
          </a>
        </li>

        <!-- RELATÓRIOS -->
        <li class="nav-item">
          <a class="nav-link ${state.currentView === 'relatorios' ? 'active' : ''}" onclick="window.app.navigate('relatorios')">
            <i class="ph-file-text"></i>
            <span>Relatórios</span>
          </a>
        </li>

        <!-- CONFIGURAÇÕES -->
        <li class="nav-item">
          <a class="nav-link ${state.currentView === 'dadosBancarios' ? 'active' : ''}" onclick="window.app.navigate('dadosBancarios')">
            <i class="ph-gear"></i>
            <span>Configurações</span>
          </a>
        </li>
      `;
      return;
    }

    // ==========================================================================
    // MENU REDUZIDO DO PRODUTOR (8 ITENS CANÔNICOS CONFORME REFERENCE APP)
    // ==========================================================================
    this.sidebarNav.innerHTML = `
      <!-- TODOS OS EVENTOS -->
      <li class="nav-item">
        <a class="nav-link ${state.currentView === 'saldos' ? 'active' : ''}" onclick="window.app.navigate('saldos')">
          <i class="ph-calendar"></i>
          <span>Todos os Eventos</span>
        </a>
      </li>

      <!-- PAINEL GERAL -->
      <li class="nav-item nav-item-submenu ${state.currentView === 'overview' ? 'is-open' : ''}">
        <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
          <i class="ph-gauge"></i>
          <span>Painel Geral</span>
          <i class="ph-caret-right nav-arrow"></i>
        </a>
        <ul class="nav-group-sub">
          <li class="nav-item"><a class="nav-link ${state.currentView === 'overview' ? 'active' : ''}" onclick="window.app.navigate('overview')">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('saldos')">Agenda</a></li>
          <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('relatorios')">Indicadores</a></li>
        </ul>
      </li>

      <!-- MEUS EVENTOS -->
      <li class="nav-item nav-item-submenu">
        <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')">
          <i class="ph-calendar"></i>
          <span>Meus Eventos</span>
          <span class="badge rounded-pill ms-auto" style="background: #f38d4f; color: white;">2</span>
          <i class="ph-caret-right nav-arrow"></i>
        </a>
        <ul class="nav-group-sub">
          <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('saldos')">Festival Curitiba 2026</a></li>
          <li class="nav-item"><a class="nav-link" onclick="window.app.navigate('saldos')">Show Artista A</a></li>
          <li class="nav-item"><a class="nav-link" onclick="alert('Criar Evento')">Novo Evento</a></li>
        </ul>
      </li>

      <!-- CONSULTA DE INGRESSOS -->
      <li class="nav-item">
        <a class="nav-link" onclick="window.app.navigate('vendas')">
          <i class="ph-ticket"></i>
          <span>Consulta de Ingressos</span>
        </a>
      </li>

      <!-- MARKETING HUB -->
      <li class="nav-item">
        <a class="nav-link" onclick="window.app.navigate('relatorios')">
          <i class="ph-megaphone"></i>
          <span>Marketing</span>
          <span class="badge bg-primary rounded-pill ms-auto">Hub</span>
        </a>
      </li>

      <!-- ========================================================================== -->
      <!-- PORTAL DO PRODUTOR: MENU FINANCEIRO REDUZIDO (8 ITENS CANÔNICOS) -->
      <!-- ========================================================================== -->
      <li class="nav-item nav-item-submenu is-open" id="nav-item-financeiro-produtor">
        <a class="nav-link" onclick="this.parentElement.classList.toggle('is-open')" style="color: #60a5fa !important;">
          <i class="ph-wallet"></i>
          <span class="fw-bold">Financeiro</span>
          <span class="badge bg-success rounded-pill ms-auto">Enterprise</span>
          <i class="ph-caret-right nav-arrow"></i>
        </a>
        <ul class="nav-group-sub">
          
          <li class="nav-item-section-divider"><i class="ph-user-circle"></i> Portal do Produtor</li>

          <!-- 1. Visão Financeira -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'overview' ? 'active' : ''}" onclick="window.app.navigate('overview')">
              <i class="ph-chart-pie-slice me-2 text-primary"></i> <span>Visão Financeira</span>
            </a>
          </li>

          <!-- 2. Meus Saldos -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'saldos' ? 'active' : ''}" onclick="window.app.navigate('saldos')">
              <i class="ph-currency-circle-dollar me-2 text-success"></i> <span>Meus Saldos</span>
            </a>
          </li>

          <!-- 3. Solicitar Repasse -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'repasses' ? 'active' : ''}" onclick="window.app.navigate('repasses')">
              <i class="ph-hand-coins me-2 text-warning"></i> <span>Solicitar Repasse</span>
            </a>
          </li>

          <!-- 4. Solicitar Antecipação -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'antecipacoes' ? 'active' : ''}" onclick="window.app.navigate('antecipacoes')">
              <i class="ph-trend-up me-2 text-info"></i> <span>Solicitar Antecipação</span>
            </a>
          </li>

          <!-- 5. Transferir entre Eventos -->
          <li class="nav-item">
            <a class="nav-link" onclick="window.app.openTransferModal()">
              <i class="ph-arrows-clockwise me-2 text-primary"></i> <span>Transferir entre Eventos</span>
            </a>
          </li>

          <!-- 6. Minhas Solicitações -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'repasses' ? 'active' : ''} d-flex justify-content-between align-items-center" onclick="window.app.navigate('repasses')">
              <span><i class="ph-files me-2 text-success"></i> Minhas Solicitações</span>
              ${pendingCount > 0 ? `<span class="badge rounded-pill bg-warning text-dark fs-xxs">${pendingCount}</span>` : ''}
            </a>
          </li>

          <!-- 7. Extrato -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'extrato' ? 'active' : ''}" onclick="window.app.navigate('extrato')">
              <i class="ph-receipt me-2 text-secondary"></i> <span>Extrato</span>
            </a>
          </li>

          <!-- 8. Dados Bancários -->
          <li class="nav-item">
            <a class="nav-link ${state.currentView === 'dadosBancarios' ? 'active' : ''}" onclick="window.app.navigate('dadosBancarios')">
              <i class="ph-credit-card me-2 text-danger"></i> <span>Dados Bancários</span>
            </a>
          </li>

          <!-- Ferramentas Complementares de Auditoria do Produtor -->
          <li class="nav-item-section-divider"><i class="ph-scales"></i> Fechamento &amp; Relatórios</li>
          <li class="nav-item"><a class="nav-link ${state.currentView === 'bordero' ? 'active' : ''}" onclick="window.app.navigate('bordero')"><i class="ph-signature me-2 text-warning"></i> <span>Borderô do Evento</span></a></li>
          <li class="nav-item"><a class="nav-link ${state.currentView === 'taxas' ? 'active' : ''}" onclick="window.app.navigate('taxas')"><i class="ph-percent me-2 text-info"></i> <span>Taxas Contratuais</span></a></li>
          <li class="nav-item"><a class="nav-link ${state.currentView === 'estornos' ? 'active' : ''}" onclick="window.app.navigate('estornos')"><i class="ph-warning-octagon me-2 text-danger"></i> <span>Estornos &amp; Chargebacks</span></a></li>
          <li class="nav-item"><a class="nav-link ${state.currentView === 'relatorios' ? 'active' : ''}" onclick="window.app.navigate('relatorios')"><i class="ph-file-text me-2"></i> <span>Relatórios Financeiros</span></a></li>

        </ul>
      </li>

      <!-- RELATÓRIOS -->
      <li class="nav-item">
        <a class="nav-link ${state.currentView === 'relatorios' ? 'active' : ''}" onclick="window.app.navigate('relatorios')">
          <i class="ph-file-text"></i>
          <span>Relatórios</span>
        </a>
      </li>

      <!-- CONFIGURAÇÕES -->
      <li class="nav-item">
        <a class="nav-link ${state.currentView === 'dadosBancarios' ? 'active' : ''}" onclick="window.app.navigate('dadosBancarios')">
          <i class="ph-gear"></i>
          <span>Configurações</span>
        </a>
      </li>
    `;
  }

  // ==========================================================================
  // BARRA FLUTUANTE DO MODO DEMONSTRAÇÃO
  // ==========================================================================
  renderFloatingDemoBar(state) {
    let bar = document.getElementById('demoFloatingBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'demoFloatingBar';
      bar.className = 'demo-floating-bar';
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <span class="demo-badge-pill">🎮 Modo Demonstração</span>
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

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LimitlessFinancialApp();
});
