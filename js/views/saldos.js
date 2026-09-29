/**
 * Saldos - Gestão de Saldos do Produtor por Evento
 * Arquitetura Central: Produtor -> Múltiplos Eventos -> Saldo Individual Segregado
 */
import { formatCurrency, formatNumber } from '../formatters.js';

export function renderSaldos(state) {
  const producer = state.activeProducer;
  const totals = producer.totals;
  const events = state.data.events.filter(e => e.producerId === producer.id);

  return `
    <!-- Header -->
    <div class="limitless-page-header">
      <div class="breadcrumbs">
        <span>Financeiro</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">Saldos por Evento</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Saldos Financeiros Segregados
          </h1>
          <p class="page-title-desc">Cada evento opera com seu próprio livro-caixa e saldo segregado, permitindo controle individual e repasses sob demanda.</p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-primary" onclick="window.app.openPayoutModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Solicitar Repasse de Saldo
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Hero Card: Saldo Consolidado do Produtor -->
      <div class="card-panel" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border: none; padding: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
          <div>
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 600;">Saldo Consolidado do Produtor</span>
            <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; margin: 4px 0 10px 0; color: #f8fafc;">
              ${formatCurrency(totals.totalBalance)}
            </div>
            <div style="font-size: 0.85rem; color: #cbd5e1; display: flex; gap: 24px; flex-wrap: wrap;">
              <span><strong>Produtor:</strong> ${producer.name}</span>
              <span><strong>CNPJ:</strong> ${producer.cnpj}</span>
              <span><strong>Eventos Ativos:</strong> ${events.length} produções</span>
            </div>
          </div>

          <!-- Mini Stats Grid in Hero -->
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <div style="background: rgba(255,255,255,0.06); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: #34d399; font-weight: 600;">Disponível para Uso</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #34d399; margin-top: 2px;">${formatCurrency(totals.availableBalance)}</div>
              <div style="font-size: 0.7rem; color: #94a3b8;">Livre para transferência</div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: #f59e0b; font-weight: 600;">Reservado</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #f59e0b; margin-top: 2px;">${formatCurrency(totals.reservedBalance || 0)}</div>
              <div style="font-size: 0.7rem; color: #94a3b8;">Retido em solicitações</div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: #fbbf24; font-weight: 600;">A Receber Futuro</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #fbbf24; margin-top: 2px;">${formatCurrency(totals.futureReceivables)}</div>
              <div style="font-size: 0.7rem; color: #94a3b8;">Parcelados a liquidar</div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: #93c5fd; font-weight: 600;">Repasses Pagos</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #93c5fd; margin-top: 2px;">${formatCurrency(totals.transferredAmount)}</div>
              <div style="font-size: 0.7rem; color: #94a3b8;">Já em conta bancária</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Oficial de Saldos por Evento (Benchmark Exato Citado pelo Usuário) -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Detalhamento de Saldos por Evento</h2>
            <p class="card-subtitle">Visão individualizada do fluxo financeiro com reservas segregadas por produção</p>
          </div>
          <div class="filter-controls-group">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">${events.length} produções ativas</span>
          </div>
        </div>

        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Evento / Produção</th>
                  <th>Data & Local</th>
                  <th style="text-align: right;">Saldo Total</th>
                  <th style="text-align: right;">Disponível</th>
                  <th style="text-align: right;">Reservado</th>
                  <th style="text-align: right;">A Receber</th>
                  <th style="text-align: right;">Repasses Pagos</th>
                  <th style="text-align: center;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${events.map(evt => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${evt.name}</div>
                      <div style="font-size: 0.74rem; color: var(--primary); font-weight: 500;">${evt.category}</div>
                    </td>
                    <td>
                      <div style="font-size: 0.82rem; font-weight: 600;">${evt.date}</div>
                      <div style="font-size: 0.73rem; color: var(--text-muted);">${evt.venue}</div>
                    </td>
                    <td style="text-align: right; font-weight: 700; font-size: 0.95rem;">
                      ${formatCurrency(evt.totalBalance)}
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 0.95rem; color: #059669;">
                      ${formatCurrency(evt.availableBalance)}
                    </td>
                    <td style="text-align: right; font-weight: 700; font-size: 0.9rem; color: ${(evt.reservedBalance || 0) > 0 ? '#d97706' : '#94a3b8'};">
                      ${formatCurrency(evt.reservedBalance || 0)}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #d97706;">
                      ${formatCurrency(evt.futureReceivables)}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: var(--text-muted);">
                      ${formatCurrency(evt.payoutsDone)}
                    </td>
                    <td style="text-align: center;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-outline-primary btn-sm" onclick="window.app.openPayoutModal('${evt.id}')" title="Solicitar Repasse">
                          Solicitar Repasse
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('bordero')" title="Ver Borderô">
                          Borderô
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; font-weight: 700; border-top: 2px solid var(--border-color);">
                  <td colspan="2" style="text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.05em;">Total Geral Consolidado</td>
                  <td style="text-align: right; font-size: 1.05rem; font-weight: 800;">${formatCurrency(totals.totalBalance)}</td>
                  <td style="text-align: right; font-size: 1.05rem; font-weight: 800; color: #059669;">${formatCurrency(totals.availableBalance)}</td>
                  <td style="text-align: right; font-size: 1.05rem; font-weight: 800; color: #d97706;">${formatCurrency(totals.reservedBalance || 0)}</td>
                  <td style="text-align: right; font-size: 1.05rem; font-weight: 700; color: #d97706;">${formatCurrency(totals.futureReceivables)}</td>
                  <td style="text-align: right; font-size: 1.05rem; font-weight: 700; color: var(--text-muted);">${formatCurrency(totals.transferredAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Explanatory Architecture Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="card-panel" style="padding: 20px;">
          <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Segregação Patrimonial por Evento
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
            A arquitetura da Disk Ingressos isola cada evento em uma subconta contábil própria. Isso garante que receitas, estornos e taxas de um evento nunca comprometam o saldo ou os repasses de outra produção do mesmo produtor.
          </p>
        </div>

        <div class="card-panel" style="padding: 20px;">
          <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Prazo de Disponibilização (D+0 a D+2)
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
            O saldo disponível reflete vendas já compensadas no sistema bancário. Parcelamentos no cartão de crédito entram na coluna "A Receber" e são liberados conforme as parcelas vencem ou mediante antecipação voluntária.
          </p>
        </div>
      </div>

    </div>
  `;
}
