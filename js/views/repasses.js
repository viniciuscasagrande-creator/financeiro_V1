/**
 * Repasses - Fluxo de Transferência e Pipeline de Pagamentos do Produtor
 * Pipeline Oficial: Rascunho → Enviado → Aguardando análise → Aprovado → Assinatura Produtor → Assinatura Financeiro → Pago
 */
import { formatCurrency, createStatusBadge } from '../formatters.js';

export function renderRepasses(state) {
  const producer = state.activeProducer;
  const payouts = state.data.approvalQueue.filter(a => a.type === 'Repasse' && a.producerId === producer.id);
  const availableBalance = producer.totals.availableBalance;
  const transferredAmount = producer.totals.transferredAmount;
  const scheduledAmount = payouts.filter(p => p.status === 'Programado' || p.status === 'Aprovado' || p.status === 'Documento assinado').reduce((acc, p) => acc + (p.requestedAmount || 0), 0);

  // Repasse ativo em destaque para exibir na esteira
  const activePayout = payouts.find(p => p.status.includes('análise') || p.status.includes('assinatura') || p.status === 'Aprovado' || p.status === 'Programado') || payouts[0];

  // Identifica se há documento aguardando assinatura do produtor
  const needsProducerSignature = payouts.find(p => p.status === 'Aguardando assinatura do Produtor');

  return `
    <!-- Header -->
    <div class="limitless-page-header">
      <div class="breadcrumbs">
        <span>Financeiro</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">Repasses</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 19V5"></path><polyline points="5 12 12 5 19 12"></polyline></svg>
            Gestão e Solicitação de Repasses
          </h1>
          <p class="page-title-desc">Fluxo oficial: Solicitação → Análise Disk → Assinatura Digital Sequencial → Liberação Financeira.</p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-primary" onclick="window.app.openPayoutModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Solicitar Repasse Agora
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Alerta Crítico: Documento Aguardando Assinatura do Produtor -->
      ${needsProducerSignature ? `
        <div class="info-banner info-banner-green" style="border-width: 2px; box-shadow: var(--shadow-md);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <div style="flex: 1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <strong style="font-size: 0.95rem;">Ação Necessária: Assinatura Digital do Produtor Pendente</strong>
              <div style="font-size: 0.8rem; margin-top: 2px;">
                O repasse <strong>${needsProducerSignature.id}</strong> (R$ ${(needsProducerSignature.requestedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) foi aprovado pela Disk e aguarda sua assinatura para que o Financeiro Disk assine por último e libere a transferência bancária.
              </div>
            </div>
            <button class="btn btn-success" onclick="window.app.openSignDocumentModal('${needsProducerSignature.id}')">
              ✍️ Assinar Documento Agora
            </button>
          </div>
        </div>
      ` : ''}

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card success-accent">
          <div class="kpi-header"><span class="kpi-title">Saldo Elegível para Repasse</span></div>
          <div class="kpi-value" style="color: #059669;">${formatCurrency(availableBalance)}</div>
          <div class="kpi-subtext"><span>Disponível para nova solicitação</span></div>
        </div>
        <div class="kpi-card highlight">
          <div class="kpi-header"><span class="kpi-title">Repasses Programados</span></div>
          <div class="kpi-value" style="color: #2563eb;">${formatCurrency(scheduledAmount)}</div>
          <div class="kpi-subtext"><span>Aguardando assinaturas ou lote CNAB</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Total Já Transferido</span></div>
          <div class="kpi-value">${formatCurrency(transferredAmount)}</div>
          <div class="kpi-subtext"><span>Repasses creditados em conta</span></div>
        </div>
      </div>

      <!-- Pipeline de Acompanhamento do Repasse Ativo (Limitless Workflow Stepper) -->
      ${activePayout ? `
        <div class="card-panel">
          <div class="card-header-bar">
            <div class="card-title-group">
              <h2>Acompanhamento Operacional: ${activePayout.id}</h2>
              <p class="card-subtitle">${activePayout.eventName} • Valor solicitado: <strong>${formatCurrency(activePayout.requestedAmount || activePayout.amount)}</strong></p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${createStatusBadge(activePayout.status)}
              <button class="btn btn-secondary btn-sm" onclick="window.app.openAuditTrailModal('${activePayout.id}')">
                📜 Ver Trilha de Auditoria
              </button>
            </div>
          </div>
          <div class="card-body">
            
            <!-- Régua de Status Oficial -->
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
              <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 12px;">
                Fluxo de Formalização & Assinaturas Sequenciais
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.82rem;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: #10b981; font-weight: 700;">✓ 1. Solicitação Enviada</span>
                </div>
                <span>→</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 700; color: ${activePayout.status.includes('análise') ? '#f59e0b' : '#10b981'};">
                    ${activePayout.status.includes('análise') ? '● 2. Em Análise Disk' : '✓ 2. Análise Aprovada'}
                  </span>
                </div>
                <span>→</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 700; color: ${activePayout.signatures?.producer.signed ? '#10b981' : (activePayout.status.includes('Produtor') ? '#2563eb' : '#94a3b8')};">
                    ${activePayout.signatures?.producer.signed ? '✓ 3. Produtor Assinou' : '○ 3. Assinatura Produtor'}
                  </span>
                </div>
                <span>→</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 700; color: ${activePayout.signatures?.disk.signed ? '#10b981' : (activePayout.status.includes('Financeiro') ? '#2563eb' : '#94a3b8')};">
                    ${activePayout.signatures?.disk.signed ? '✓ 4. Disk Assinou (Último)' : '🔒 4. Assinatura Disk (Último)'}
                  </span>
                </div>
                <span>→</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 700; color: ${activePayout.status === 'Pago' ? '#10b981' : '#94a3b8'};">
                    ${activePayout.status === 'Pago' ? '✓ 5. Liquidado / Pago' : '○ 5. Pagamento'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Dados Bancários e Ação de Assinatura -->
            <div style="background: var(--surface-alt); padding: 14px 18px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.82rem;">
              <div>
                <strong>Conta de Destino:</strong> ${activePayout.bankName} (${activePayout.bankAccount}) • PIX: ${activePayout.pixKey}
              </div>
              <div style="display: flex; gap: 8px;">
                ${activePayout.status === 'Aguardando assinatura do Produtor' ? `
                  <button class="btn btn-success btn-sm" onclick="window.app.openSignDocumentModal('${activePayout.id}')">
                    ✍️ Assinar Documento Digitalmente
                  </button>
                ` : ''}
                ${activePayout.status === 'Pago' ? `
                  <button class="btn btn-secondary btn-sm" onclick="window.app.showPayoutReceipt('${activePayout.id}')">
                    Comprovante Bancário
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        </div>
      ` : ''}

      <!-- Tabela com Histórico Completo de Repasses -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Histórico de Repasses Solicitados</h2>
            <p class="card-subtitle">Relação completa de pedidos de repasse, contas bancárias e status de liquidação</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.app.exportCurrentView('csv')">Exportar Lista</button>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Evento Origem</th>
                  <th>Data Solicitação</th>
                  <th>Previsão / Pago em</th>
                  <th>Conta Bancária de Destino</th>
                  <th style="text-align: right;">Valor Solicitado</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${payouts.map(p => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700; color: var(--text-main);">${p.id}</td>
                    <td style="font-weight: 600;">${p.eventName}</td>
                    <td style="color: var(--text-muted); font-size: 0.82rem;">${p.requestDate}</td>
                    <td style="font-weight: 600; font-size: 0.82rem;">${p.paidDate ? p.paidDate : (p.scheduledDate || 'Em análise')}</td>
                    <td>
                      <div style="font-size: 0.82rem; font-weight: 600;">${p.bankName}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${p.bankAccount}</div>
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 0.95rem; color: var(--text-main);">
                      ${formatCurrency(p.requestedAmount || p.amount)}
                    </td>
                    <td style="text-align: center;">
                      ${createStatusBadge(p.status)}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        ${p.status === 'Aguardando assinatura do Produtor' ? `
                          <button class="btn btn-success btn-sm" onclick="window.app.openSignDocumentModal('${p.id}')">
                            ✍️ Assinar
                          </button>
                        ` : ''}

                        ${p.status === 'Rejeitado' ? `
                          <button class="btn btn-sm btn-secondary" style="color: #dc2626; border-color: #fca5a5;" onclick="window.app.showRejectionDetails('${p.id}')">
                            ⚠️ Ver Motivo
                          </button>
                        ` : ''}

                        ${p.status === 'Pago' ? `
                          <button class="btn btn-secondary btn-sm" onclick="window.app.showPayoutReceipt('${p.id}')">
                            Comprovante
                          </button>
                        ` : ''}

                        <button class="btn btn-secondary btn-sm" onclick="window.app.openAuditTrailModal('${p.id}')" title="Trilha de Auditoria">
                          📜 Trilha
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

    </div>
  `;
}
