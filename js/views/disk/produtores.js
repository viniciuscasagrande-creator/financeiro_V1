/**
 * Produtores & Conta Financeira do Produtor - Backoffice Disk
 * Visão consolidada de todas as produções de um produtor específico
 */
import { formatCurrency, formatNumber, createStatusBadge } from '../../formatters.js';

export function renderDiskProdutores(state) {
  const producers = state.data.producers;
  const activeProducer = state.activeProducer;
  const producerEvents = state.data.events.filter(e => e.producerId === activeProducer.id);
  const producerApprovals = state.data.approvalQueue.filter(a => a.producerId === activeProducer.id);

  return `
    <!-- Header -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6;">
      <div class="breadcrumbs" style="color: #94a3b8;">
        <span>Financeiro Disk</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active" style="color: #60a5fa;">Produtores & Conta Financeira</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1 style="color: #f8fafc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Conta Financeira do Produtor: ${activeProducer.name}
          </h1>
          <p class="page-title-desc" style="color: #94a3b8;">
            CNPJ: <strong>${activeProducer.cnpj}</strong> • Rating: <strong>${activeProducer.rating}</strong> • Gerente: ${activeProducer.accountManager}
          </p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-secondary btn-sm" onclick="window.app.toggleRole('producer')">
            Visualizar como Produtor (Login Produtor) ⇄
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Seletor Rápido de Produtor no Topo -->
      <div class="card-panel" style="padding: 16px 20px; background: #ffffff; border-left: 4px solid #2563eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Trocar Produtor em Análise:</span>
            <select class="form-control" style="width: 280px; font-weight: 700;" onchange="window.app.selectProducerInDisk(this.value)">
              ${producers.map(p => `
                <option value="${p.id}" ${p.id === activeProducer.id ? 'selected' : ''}>
                  ${p.name} (${p.cnpj})
                </option>
              `).join('')}
            </select>
          </div>
          <div style="display: flex; gap: 10px;">
            <span class="badge badge-success">Status: ${activeProducer.status}</span>
            <span class="badge ${activeProducer.hasBlock ? 'badge-danger' : 'badge-neutral'}">
              ${activeProducer.hasBlock ? 'Possui Bloqueio Cautelar' : 'Sem Bloqueios Ativos'}
            </span>
          </div>
        </div>
      </div>

      <!-- POSIÇÃO CONSOLIDADA DO PRODUTOR (Conforme desenhado na solicitação) -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Posição Financeira Consolidada de ${activeProducer.name}</h2>
            <p class="card-subtitle">Contrato nº ${activeProducer.contract?.number || 'CON-MASTER'} • Taxa Disk: ${activeProducer.contract?.diskFeePercent || 10.0}% • Antecipação: ${activeProducer.contract?.anticipationRateMonthly || 2.5}% a.m.</p>
          </div>
        </div>
        <div class="card-body">
          <div class="kpi-grid">
            <div class="kpi-card highlight">
              <div class="kpi-header"><span class="kpi-title">Saldo Total Acumulado</span></div>
              <div class="kpi-value">${formatCurrency(activeProducer.totals.totalBalance)}</div>
              <div class="kpi-subtext"><span>Passivo da Disk com o produtor</span></div>
            </div>

            <div class="kpi-card success-accent">
              <div class="kpi-header"><span class="kpi-title">Saldo Disponível Imediato</span></div>
              <div class="kpi-value" style="color: #059669;">${formatCurrency(activeProducer.totals.availableBalance)}</div>
              <div class="kpi-subtext"><span>Liberado para transferência</span></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header"><span class="kpi-title">Recebíveis Futuros (Cartão)</span></div>
              <div class="kpi-value" style="color: #2563eb;">${formatCurrency(activeProducer.totals.futureReceivables)}</div>
              <div class="kpi-subtext"><span>Parcelamentos a liquidar</span></div>
            </div>

            <div class="kpi-card warning-accent">
              <div class="kpi-header"><span class="kpi-title">Bloqueado / Reservas</span></div>
              <div class="kpi-value" style="color: #b45309;">${formatCurrency(activeProducer.totals.blockedBalance)}</div>
              <div class="kpi-subtext"><span>Reserva técnica para chargebacks</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- EVENTOS DO PRODUTOR: Cada produção com seu saldo individual -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Eventos & Produções de ${activeProducer.name}</h2>
            <p class="card-subtitle">Segregação patrimonial: cada evento opera sua própria conta e saldo</p>
          </div>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Evento / Produção</th>
                  <th>Data & Local</th>
                  <th style="text-align: right;">Vendas Brutas</th>
                  <th style="text-align: right;">Taxas Disk</th>
                  <th style="text-align: right;">Líquido Apurado</th>
                  <th style="text-align: right;">Saldo Disponível</th>
                  <th style="text-align: right;">A Receber</th>
                  <th style="text-align: right;">Já Repassado</th>
                </tr>
              </thead>
              <tbody>
                ${producerEvents.map(evt => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${evt.name}</div>
                      <div style="font-size: 0.74rem; color: var(--primary); font-weight: 600;">${evt.category}</div>
                    </td>
                    <td>
                      <div style="font-size: 0.82rem; font-weight: 600;">${evt.date}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${evt.venue}</div>
                    </td>
                    <td style="text-align: right; font-weight: 600;">${formatCurrency(evt.grossSales)}</td>
                    <td style="text-align: right; color: #dc2626;">-${formatCurrency(evt.diskFees)}</td>
                    <td style="text-align: right; font-weight: 700; color: #059669;">${formatCurrency(evt.netRevenue)}</td>
                    <td style="text-align: right; font-weight: 800; font-size: 0.95rem; color: #059669;">
                      ${formatCurrency(evt.availableBalance)}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #d97706;">
                      ${formatCurrency(evt.futureReceivables)}
                    </td>
                    <td style="text-align: right; color: var(--text-muted); font-weight: 600;">
                      ${formatCurrency(evt.payoutsDone)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pendências & Solicitações Deste Produtor -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Solicitações Deste Produtor na Central de Aprovações</h2>
            <p class="card-subtitle">Repasses, antecipações e alterações pendentes de ação do operador</p>
          </div>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Evento Origem</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th style="text-align: right;">Valor</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: right;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${producerApprovals.length > 0 ? producerApprovals.map(appr => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700;">${appr.id}</td>
                    <td style="font-weight: 600;">${appr.eventName || 'Cadastro Geral'}</td>
                    <td><strong>${appr.type}</strong></td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${appr.requestDate}</td>
                    <td style="text-align: right; font-weight: 800;">${formatCurrency(appr.requestedAmount || appr.netAmount || 0)}</td>
                    <td style="text-align: center;">${createStatusBadge(appr.status)}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-primary btn-sm" onclick="window.app.openApprovalSheet('${appr.id}')">
                        Abrir Análise →
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
                      Nenhuma solicitação pendente para este produtor no momento.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;
}
