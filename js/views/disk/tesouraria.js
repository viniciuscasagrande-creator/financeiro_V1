/**
 * Tesouraria & Remessa CNAB 240 - Disk Interno
 * Gestão de caixa, transmissão bancária de lotes de pagamento e liquidação
 */
import { formatCurrency } from '../../formatters.js';

export function renderDiskTesouraria(state) {
  const batches = state.data.cnabBatches;

  return `
    <!-- Header -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6;">
      <div class="breadcrumbs" style="color: #94a3b8;">
        <span>Financeiro Disk</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active" style="color: #60a5fa;">Tesouraria & Remessa CNAB</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1 style="color: #f8fafc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path></svg>
            Tesouraria & Pagamentos Bancários (CNAB 240/400)
          </h1>
          <p class="page-title-desc" style="color: #94a3b8;">
            Gestão de contas correntes da Disk Ingressos, liquidação via PIX automático e transmissão de lotes TED/PIX para os bancos.
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Posição de Caixa das Contas Disk -->
      <div class="kpi-grid">
        <div class="kpi-card highlight">
          <div class="kpi-header"><span class="kpi-title">Conta Principal: Banco do Brasil (001)</span></div>
          <div class="kpi-value">${formatCurrency(1240500.00)}</div>
          <div class="kpi-subtext"><span>Ag 1890-X • C/C 55400-1 (Operação Central)</span></div>
        </div>

        <div class="kpi-card success-accent">
          <div class="kpi-header"><span class="kpi-title">Conta Liquidação: Itaú (341)</span></div>
          <div class="kpi-value" style="color: #059669;">${formatCurrency(699500.00)}</div>
          <div class="kpi-subtext"><span>Ag 0910 • C/C 28910-2 (PIX Instantâneo)</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-title">Lotes Programados para Transmissão</span></div>
          <div class="kpi-value" style="color: #2563eb;">${formatCurrency(642890.00)}</div>
          <div class="kpi-subtext"><span>14 repasses em fila CNAB de amanhã</span></div>
        </div>
      </div>

      <!-- Grade de Lotes CNAB 240 -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Lotes de Pagamento CNAB 240 (Remessa / Retorno)</h2>
            <p class="card-subtitle">Arquivos gerados para débito em conta Disk e crédito automático nas contas dos produtores</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="alert('Lote CNAB 240 transmitido com sucesso via VAN Bancária homologada.')">
            Transmitir Lote para Banco do Brasil
          </button>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Lote CNAB</th>
                  <th>Banco Liquidador</th>
                  <th>Conta Origem Disk</th>
                  <th>Data de Liquidação</th>
                  <th>Quantidade de Pagamentos</th>
                  <th style="text-align: right;">Total do Lote</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${batches.map(b => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700;">${b.batchId}</td>
                    <td><strong>${b.bank}</strong></td>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">${b.agencyAccount}</td>
                    <td style="font-weight: 600;">${b.scheduledDate}</td>
                    <td style="font-weight: 700;">${b.count} produtores favorecidos</td>
                    <td style="text-align: right; font-weight: 800; font-size: 0.95rem; color: #1e40af;">
                      ${formatCurrency(b.totalAmount)}
                    </td>
                    <td style="text-align: center;">
                      <span class="badge badge-info">${b.status}</span>
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
