/**
 * Dados Bancários - Contas Cadastradas para Recebimento de Repasses
 * Validação de titularidade estrita (mesmo CNPJ/CPF do contrato)
 */
import { createStatusBadge } from '../formatters.js';

export function renderDadosBancarios(state) {
  const accounts = state.data.bankAccounts;
  const producer = state.data.producer;

  return `
    <!-- Header -->
    <div class="limitless-page-header">
      <div class="breadcrumbs">
        <span>Financeiro</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">Dados Bancários</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v4"></path><path d="M12 14v4"></path><path d="M16 14v4"></path></svg>
            Contas de Recebimento & Dados Bancários
          </h1>
          <p class="page-title-desc">Gerencie as contas bancárias e chaves PIX homologadas para o recebimento de repasses e antecipações.</p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-primary" onclick="window.app.openAddBankModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Adicionar Nova Conta
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">

      <!-- Informative Security Policy Notice -->
      <div class="info-banner info-banner-blue">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <strong>Política de Segurança e Compliance Bancário:</strong> Por determinação do Banco Central e normas de prevenção à fraude, os repasses são transferidos exclusivamente para contas bancárias vinculadas ao CNPJ titular do contrato (<strong>${producer.cnpj}</strong>). Contas de terceiros não são autorizadas para liquidação.
        </div>
      </div>

      <!-- Grid de Contas Bancárias Cadastradas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        ${accounts.map(acc => `
          <div class="card-panel" style="padding: 24px; border-top: 4px solid ${acc.isDefault ? 'var(--success)' : 'var(--primary)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${acc.bankName}</h3>
                  ${acc.isDefault ? '<span class="badge badge-success">Padrão p/ Repasses</span>' : ''}
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${acc.accountType}</div>
              </div>
              ${createStatusBadge(acc.status)}
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem; background: var(--surface-alt); padding: 14px; border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Agência:</span>
                <strong>${acc.agency}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Conta Corrente:</span>
                <strong>${acc.accountNumber}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Titular:</span>
                <strong>${acc.holderName}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">CNPJ / Documento:</span>
                <strong>${acc.cnpj}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Chave PIX Cadastrada:</span>
                <strong style="color: var(--primary);">${acc.pixKey}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 0.74rem; color: var(--text-muted);">
              <span>Validação: ${acc.validatedAt}</span>
              ${!acc.isDefault ? `
                <button class="btn btn-secondary btn-sm" onclick="window.app.integratedAction('conta-padrao')">
                  Definir como Padrão
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}
