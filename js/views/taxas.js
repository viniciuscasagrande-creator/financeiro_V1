/**
 * Taxas e Descontos - Visão Exclusiva do Contrato do Produtor
 * NOTA DE ARQUITETURA: O produtor enxerga SOMENTE as condições do contrato comercial dele.
 * Taxas internas de adquirentes (MDR Cielo/Rede), spread e margem Disk NÃO são exibidas aqui.
 */
import { formatCurrency } from '../formatters.js';

export function renderTaxas(state) {
  const fees = state.data.producerFeesContract;
  const contract = state.data.producer.contract;

  return `
    <!-- Header -->
    <div class="limitless-page-header">
      <div class="breadcrumbs">
        <span>Financeiro</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">Taxas e Descontos Contratuais</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Tabela de Taxas Contratuais & Descontos
          </h1>
          <p class="page-title-desc">Transparência total sobre as condições comerciais e taxas de prestação de serviços aplicáveis às suas produções.</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Informative Contract Banner -->
      <div class="info-banner info-banner-blue">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <strong>Contrato Comercial nº ${contract.number}:</strong> As alíquotas abaixo são as únicas que afetam o fechamento financeiro do seu borderô e os repasses dos seus eventos. Nenhuma taxa oculta ou variação de custo de adquirente é repassada ao organizador.
        </div>
      </div>

      <!-- Tabela de Taxas Contratuais do Produtor -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Condições Comerciais Vigentes</h2>
            <p class="card-subtitle">Taxas acordadas entre Disk Ingressos e ${state.data.producer.name}</p>
          </div>
          <span class="badge badge-success">Contrato Ativo & Homologado</span>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Nome do Serviço / Desconto</th>
                  <th>Tipo da Alíquota</th>
                  <th>Valor / Taxa Acordada</th>
                  <th>Responsável pelo Custo</th>
                  <th>Descrição & Aplicação</th>
                </tr>
              </thead>
              <tbody>
                ${fees.map(f => `
                  <tr>
                    <td>
                      <strong style="color: var(--text-main); font-size: 0.9rem;">${f.name}</strong>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.82rem;">${f.type}</td>
                    <td style="font-weight: 700; font-size: 0.95rem; color: var(--primary);">${f.rate}</td>
                    <td>
                      <span class="badge ${f.payer.includes('Comprador') ? 'badge-info' : 'badge-neutral'}">
                        ${f.payer}
                      </span>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.8rem; max-width: 320px;">
                      ${f.description}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumo Acumulado de Deduções nos Eventos -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <div class="card-panel" style="padding: 20px;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Taxa de Serviço Disk Acumulada</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(97000.00)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">10% sobre vendas brutas realizadas</div>
        </div>

        <div class="card-panel" style="padding: 20px;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Processamento e Antifraude</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(28130.00)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Custos de processamento transacional</div>
        </div>

        <div class="card-panel" style="padding: 20px;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Taxas de Antecipação Opcionais</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(2310.00)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Contratadas sob demanda pelo produtor</div>
        </div>
      </div>

    </div>
  `;
}
