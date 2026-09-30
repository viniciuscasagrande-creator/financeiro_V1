/**
 * Repasses - Fluxo de Transferência e Pipeline de Pagamentos do Produtor
 * Pipeline Oficial: Solicitação → Recebido Disk → Em Análise → Aprovação → Assinatura Produtor → Assinatura Disk → Programação → Pagamento & Conciliação
 */
import { formatCurrency, createStatusBadge } from '../formatters.js';

export function renderRepasses(state) {
  const producer = state.activeProducer;
  const payouts = state.data.approvalQueue.filter(a => a.type === 'Repasse' && a.producerId === producer.id);
  const availableBalance = producer.totals?.availableBalance || 400000.00;
  const transferredAmount = producer.totals?.transferredAmount || 920000.00;
  const scheduledAmount = payouts.filter(p => ['Programado', 'Aprovado', 'Documento formalizado'].includes(p.status)).reduce((acc, p) => acc + (p.requestedAmount || p.amount || 0), 0);

  // Repasse em destaque para a régua (prioriza REP-2026-00128 ou o primeiro ativo)
  const activePayout = payouts.find(p => p.id === 'REP-2026-00128') ||
                       payouts.find(p => p.status.includes('análise') || p.status.includes('assinatura') || p.status === 'Aprovado' || p.status === 'Programado') ||
                       payouts[0];

  // Documento aguardando assinatura do produtor
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
            Gestão e Acompanhamento de Repasses
          </h1>
          <p class="page-title-desc">Rastreamento ponta a ponta: Solicitação → Análise de Risco → Formalização Digital → Liquidação Bancária.</p>
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

      <!-- Alerta Crítico: Assinatura Pendente do Produtor -->
      ${needsProducerSignature ? `
        <div class="info-banner info-banner-green" style="border-width: 2px; box-shadow: var(--shadow-md);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <div style="flex: 1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <strong style="font-size: 0.95rem;">Ação Necessária: Assinatura Digital do Produtor Pendente</strong>
              <div style="font-size: 0.8rem; margin-top: 2px;">
                O repasse <strong>${needsProducerSignature.id}</strong> (R$ ${(needsProducerSignature.requestedAmount || needsProducerSignature.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) foi aprovado pela Disk e aguarda sua assinatura para que o Financeiro Disk assine por último e libere a transferência bancária.
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
          <div class="kpi-header"><span class="kpi-title">Saldo Livre p/ Repasse</span></div>
          <div class="kpi-value" style="color: #059669;">${formatCurrency(availableBalance)}</div>
          <div class="kpi-subtext"><span>Disponível para nova solicitação</span></div>
        </div>
        <div class="kpi-card warning-accent">
          <div class="kpi-header"><span class="kpi-title">Saldo Reservado</span></div>
          <div class="kpi-value" style="color: #d97706;">${formatCurrency(producer.totals?.reservedBalance || 80000.00)}</div>
          <div class="kpi-subtext"><span>Retido em solicitações ativas</span></div>
        </div>
        <div class="kpi-card highlight">
          <div class="kpi-header"><span class="kpi-title">Repasses Programados</span></div>
          <div class="kpi-value" style="color: #2563eb;">${formatCurrency(scheduledAmount || 50000.00)}</div>
          <div class="kpi-subtext"><span>Aguardando assinaturas ou lote CNAB</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Total Já Transferido</span></div>
          <div class="kpi-value">${formatCurrency(transferredAmount)}</div>
          <div class="kpi-subtext"><span>Repasses creditados em conta</span></div>
        </div>
      </div>

      <!-- Pipeline de Acompanhamento do Repasse Ativo (Timeline Oficial de 8 Etapas) -->
      ${activePayout ? `
        <div class="card-panel">
          <div class="card-header-bar">
            <div class="card-title-group">
              <h2>Rastreamento em Tempo Real: ${activePayout.id}</h2>
              <p class="card-subtitle">${activePayout.eventName} • Valor solicitado: <strong>${formatCurrency(activePayout.requestedAmount || activePayout.amount)}</strong></p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${createStatusBadge(activePayout.status)}
              <button class="btn btn-outline-primary btn-sm" onclick="window.app.openRepasseTimelineModal('${activePayout.id}')">
                🔍 Ver Timeline Detalhada
              </button>
            </div>
          </div>
          <div class="card-body">
            
            <!-- Linha de Etapas Completa (Timeline com 8 fases estritas) -->
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; margin-bottom: 16px;">
              <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 16px;">
                Fluxo de Liberação & Trilha de Auditoria do Repasse
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; font-size: 0.78rem;">
                
                <!-- 1. Solicitado pelo Produtor -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid #10b981 !important;">
                  <div class="text-success fw-bold">✓ 1. Solicitado</div>
                  <div class="fs-xxs text-muted mt-1">Produtor</div>
                  <div class="fs-xxs text-dark fw-bold">${activePayout.requestDate ? activePayout.requestDate.split(' ')[0] : '30/09'} 09:32</div>
                </div>

                <!-- 2. Recebido pelo Financeiro Disk -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid #10b981 !important;">
                  <div class="text-success fw-bold">✓ 2. Recebido</div>
                  <div class="fs-xxs text-muted mt-1">Financeiro Disk</div>
                  <div class="fs-xxs text-dark fw-bold">30/09 09:32</div>
                </div>

                <!-- 3. Em Análise -->
                <div class="p-2 border rounded ${activePayout.status.includes('análise') ? 'bg-amber-50' : 'bg-white'}" style="border-left: 3px solid ${activePayout.status.includes('análise') ? '#f59e0b' : '#10b981'} !important;">
                  <div class="fw-bold" style="color: ${activePayout.status.includes('análise') ? '#d97706' : '#10b981'};">
                    ${activePayout.status.includes('análise') ? '● 3. Em Análise' : '✓ 3. Analisado'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Resp: Karine</div>
                  <div class="fs-xxs text-dark fw-bold">${activePayout.status.includes('análise') ? 'Em andamento' : '30/09 10:15'}</div>
                </div>

                <!-- 4. Aprovação -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid ${['Aprovado', 'Documento formalizado', 'Programado', 'Pago'].includes(activePayout.status) ? '#10b981' : '#cbd5e1'} !important;">
                  <div class="fw-bold" style="color: ${['Aprovado', 'Documento formalizado', 'Programado', 'Pago'].includes(activePayout.status) ? '#10b981' : '#94a3b8'};">
                    ${['Aprovado', 'Documento formalizado', 'Programado', 'Pago'].includes(activePayout.status) ? '✓ 4. Aprovado' : '○ 4. Aprovação'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Alçada Disk</div>
                  <div class="fs-xxs text-muted">${['Aprovado', 'Documento formalizado', 'Programado', 'Pago'].includes(activePayout.status) ? 'Concluída' : 'Pendente'}</div>
                </div>

                <!-- 5. Assinatura do Produtor -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid ${activePayout.signatures?.producer?.signed ? '#10b981' : (activePayout.status.includes('Produtor') ? '#2563eb' : '#cbd5e1')} !important;">
                  <div class="fw-bold" style="color: ${activePayout.signatures?.producer?.signed ? '#10b981' : (activePayout.status.includes('Produtor') ? '#2563eb' : '#94a3b8')};">
                    ${activePayout.signatures?.producer?.signed ? '✓ 5. Assinado' : '○ 5. Assinatura'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Produtor</div>
                  <div class="fs-xxs text-muted">${activePayout.signatures?.producer?.signed ? 'Concluída' : 'Aguardando'}</div>
                </div>

                <!-- 6. Assinatura Financeiro Disk -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid ${activePayout.signatures?.disk?.signed ? '#10b981' : '#cbd5e1'} !important;">
                  <div class="fw-bold" style="color: ${activePayout.signatures?.disk?.signed ? '#10b981' : '#94a3b8'};">
                    ${activePayout.signatures?.disk?.signed ? '✓ 6. Assinado' : '○ 6. Assinatura'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Disk (Final)</div>
                  <div class="fs-xxs text-muted">${activePayout.signatures?.disk?.signed ? 'Concluída' : 'Trava ativa'}</div>
                </div>

                <!-- 7. Programação Tesouraria -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid ${['Programado', 'Pago'].includes(activePayout.status) ? '#10b981' : '#cbd5e1'} !important;">
                  <div class="fw-bold" style="color: ${['Programado', 'Pago'].includes(activePayout.status) ? '#10b981' : '#94a3b8'};">
                    ${['Programado', 'Pago'].includes(activePayout.status) ? '✓ 7. Programado' : '○ 7. Lote CNAB'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Tesouraria</div>
                  <div class="fs-xxs text-muted">${['Programado', 'Pago'].includes(activePayout.status) ? 'Em lote' : 'Fila'}</div>
                </div>

                <!-- 8. Pagamento & Conciliação -->
                <div class="p-2 border rounded bg-white" style="border-left: 3px solid ${activePayout.status === 'Pago' ? '#10b981' : '#cbd5e1'} !important;">
                  <div class="fw-bold" style="color: ${activePayout.status === 'Pago' ? '#10b981' : '#94a3b8'};">
                    ${activePayout.status === 'Pago' ? '✓ 8. Liquidado' : '○ 8. Pagamento'}
                  </div>
                  <div class="fs-xxs text-muted mt-1">Banco / Conciliação</div>
                  <div class="fs-xxs text-muted">${activePayout.status === 'Pago' ? 'Liquidado' : 'Retorno'}</div>
                </div>

              </div>
            </div>

            <!-- Dados Bancários e Ações -->
            <div style="background: var(--surface-alt); padding: 14px 18px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.82rem;">
              <div>
                <strong>Conta de Recebimento Homologada:</strong> ${activePayout.bankName} (${activePayout.bankAccount}) • Chave PIX: ${activePayout.pixKey}
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline-secondary btn-sm" onclick="window.app.openRepasseTimelineModal('${activePayout.id}')">
                  Ver Trilha Completa
                </button>
                ${activePayout.status === 'Aguardando assinatura do Produtor' ? `
                  <button class="btn btn-success btn-sm" onclick="window.app.openSignDocumentModal('${activePayout.id}')">
                    ✍️ Assinar Documento Digitalmente
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
            <p class="card-subtitle">Relação completa de pedidos com rastreamento da esteira operacional e comprovantes</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.app.exportCurrentView('csv')">Exportar Lista</button>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Código / Protocolo</th>
                  <th>Evento Origem</th>
                  <th>Data Solicitação</th>
                  <th>Fase Atual / Responsável</th>
                  <th>Conta Bancária</th>
                  <th style="text-align: right;">Valor Solicitado</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: right;">Ações de Rastreamento</th>
                </tr>
              </thead>
              <tbody>
                ${payouts.map(p => `
                  <tr>
                    <td>
                      <code style="font-weight: 700; color: var(--text-main);">${p.id}</code>
                    </td>
                    <td style="font-weight: 600;">${p.eventName}</td>
                    <td style="color: var(--text-muted); font-size: 0.82rem;">${p.requestDate}</td>
                    <td>
                      <div style="font-size: 0.82rem; font-weight: 600;">
                        ${p.status.includes('análise') ? '● Em análise (Karine - Financeiro)' : (p.status.includes('assinatura') ? '● Em fase de assinaturas digitais' : (p.status === 'Pago' ? '✓ Liquidado na conta' : p.status))}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">
                        ${p.status === 'Pago' ? 'Baixa contábil conciliada' : 'Acompanhamento em tempo real'}
                      </div>
                    </td>
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
                        <button class="btn btn-outline-primary btn-xs" onclick="window.app.openRepasseTimelineModal('${p.id}')" title="Ver Timeline e Etapas">
                          Timeline
                        </button>
                        ${p.status === 'Aguardando assinatura do Produtor' ? `
                          <button class="btn btn-success btn-xs" onclick="window.app.openSignDocumentModal('${p.id}')">
                            Assinar
                          </button>
                        ` : ''}
                        ${p.status === 'Pago' ? `
                          <button class="btn btn-secondary btn-xs" onclick="window.app.showPayoutReceipt('${p.id}')">
                            Comprovante
                          </button>
                        ` : ''}
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
