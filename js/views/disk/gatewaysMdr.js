/**
 * Gateways e Adquirentes - Disk Interno
 * Gestão de contratos de captura, MDR real por bandeira, spread e roteamento inteligente
 * (INFORMAÇÃO TOTALMENTE RESTRITA - NUNCA EXPOSTA AO PRODUTOR)
 */
import { formatCurrency } from '../../formatters.js';

export function renderDiskGateways(state) {
  const gateways = state.data.gateways;

  return `
    <!-- Header -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6;">
      <div class="breadcrumbs" style="color: #94a3b8;">
        <span>Financeiro Disk</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active" style="color: #60a5fa;">Gateways, Adquirentes & MDR</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1 style="color: #f8fafc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Gateways, Adquirentes & Gestão de MDR
          </h1>
          <p class="page-title-desc" style="color: #94a3b8;">
            Configuração de adquirentes, taxas de interchange, split de pagamentos e roteamento de menor custo.
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Informative Security Warning -->
      <div class="info-banner info-banner-amber">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <div>
          <strong>Ambiente de Alta Sensibilidade Comercial:</strong> As taxas MDR contratadas pela Disk com Cielo, Rede e Stone geram um spread médio de <strong>1,22%</strong> sobre o faturamento total da plataforma. Estes valores são mantidos estritamente na camada interna da Disk.
        </div>
      </div>

      <!-- Tabela de Adquirentes -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Adquirentes & Roteamento Efetivo</h2>
            <p class="card-subtitle">Taxas de MDR negociadas pela Disk e distribuição percentual do volume</p>
          </div>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Adquirente / Gateway</th>
                  <th>MDR Crédito à Vista</th>
                  <th>MDR Débito</th>
                  <th>MDR PIX</th>
                  <th>Spread Disk Médio</th>
                  <th>Share de Volume</th>
                  <th style="text-align: right;">Volume Processado</th>
                  <th>Status Operacional</th>
                </tr>
              </thead>
              <tbody>
                ${gateways.map(g => `
                  <tr>
                    <td>
                      <strong style="color: var(--text-main); font-size: 0.9rem;">${g.name}</strong>
                    </td>
                    <td style="font-weight: 700; color: #1e293b;">${g.mdrCredit}</td>
                    <td style="font-weight: 600; color: var(--text-muted);">${g.mdrDebit}</td>
                    <td style="font-weight: 700; color: #059669;">${g.mdrPix}</td>
                    <td style="font-weight: 700; color: #2563eb;">+${g.spreadDisk}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; width: 30px;">${g.volumeShare}%</span>
                        <div style="width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${g.volumeShare}%; height: 100%; background: #2563eb;"></div>
                        </div>
                      </div>
                    </td>
                    <td style="text-align: right; font-weight: 700;">${formatCurrency(g.totalVolumeProcessed)}</td>
                    <td>
                      <span class="badge ${g.status.includes('Backup') ? 'badge-warning' : 'badge-success'}">${g.status}</span>
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
