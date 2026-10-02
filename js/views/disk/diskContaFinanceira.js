/**
 * Conta Financeira do Produtor — Central de Controle por CNPJ (Pacote 24 - Financeiro Disk)
 * Estrutura: Saldo Consolidado (5 pilares), Detalhamento por Evento, Créditos/Antecipações, Bloqueios e Ledger Imutável.
 * Invariante Contábil: Saldo anterior + créditos − débitos = saldo atual.
 */

import { formatCurrency } from '../../formatters.js';
import { financialStore } from '../../state.js';

export function renderDiskContaFinanceira(state, filterArg = 'conta') {
  const selectedProducerId = state.selectedProducerId && state.selectedProducerId !== 'all'
    ? state.selectedProducerId
    : 'prod-abc';

  const accountData = financialStore.getProducerFinancialAccount(selectedProducerId);
  const producer = accountData.producer;
  const summary = accountData.summary;
  const events = accountData.events;
  const credits = accountData.credits || [];
  const ledger = accountData.ledger || [];

  const producers = state.data.producers || [];

  return `
    <!-- Header Limitless -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6; padding: 22px 28px; border-radius: 8px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="background: #2563eb; color: white; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px;">
              CONTA FINANCEIRA INTERNA · LEDGER CENTRAL
            </span>
            <span style="color: #94a3b8; font-size: 13px;">Vinculada ao CNPJ</span>
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
            ${producer.name}
          </h1>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
            CNPJ: <strong style="color: #60a5fa;">${producer.cnpj || '14.829.301/0001-92'}</strong> · 
            Gestor Comercial: <span style="color: #e2e8f0;">${producer.accountManager || 'Karine Mendes (Disk Ingressos)'}</span> · 
            Classificação: <span style="color: #34d399; font-weight: 700;">${producer.rating || 'Tier A - Premium'}</span>
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <label style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">
              Alternar Produtor (CNPJ):
            </label>
            <select
              style="background: #1e293b; color: white; border: 1px solid #475569; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;"
              onchange="window.app.onSelectProducer(this.value); window.app.navigate('diskContaFinanceira');"
            >
              ${producers.map(p => `
                <option value="${p.id}" ${p.id === selectedProducerId ? 'selected' : ''}>
                  ${p.name} (${p.cnpj || p.id})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Os 5 Blocos do Saldo Consolidado por CNPJ -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px;">
      <!-- Card 1: Saldo Consolidado -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
          Saldo Consolidado
        </span>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 6px 0;">
          ${formatCurrency(summary.consolidatedBalance)}
        </div>
        <small style="color: #64748b; font-size: 11px;">
          Receita líquida total apurada
        </small>
      </div>

      <!-- Card 2: Disponível para Repasse -->
      <div style="background: #f8faff; border: 1px solid #3b82f6; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px;">
          Disponível p/ Repasse
        </span>
        <div style="font-size: 22px; font-weight: 800; color: #1d4ed8; margin: 6px 0;">
          ${formatCurrency(summary.availableForRepasse)}
        </div>
        <small style="color: #2563eb; font-size: 11px;">
          Livre conforme regras e deduções
        </small>
      </div>

      <!-- Card 3: A Liberar (Futuro) -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
          A Liberar (Futuro)
        </span>
        <div style="font-size: 22px; font-weight: 800; color: #d97706; margin: 6px 0;">
          ${formatCurrency(summary.futurePending)}
        </div>
        <small style="color: #b45309; font-size: 11px;">
          Vendas abaixo de 50% ou excedentes
        </small>
      </div>

      <!-- Card 4: Bloqueado / Retido -->
      <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <span style="font-size: 11px; font-weight: 700; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px;">
          Bloqueado / Retido
        </span>
        <div style="font-size: 22px; font-weight: 800; color: #dc2626; margin: 6px 0;">
          ${formatCurrency(summary.blocked + summary.retained)}
        </div>
        <small style="color: #991b1b; font-size: 11px;">
          Trava de risco e garantias cautelares
        </small>
      </div>

      <!-- Card 5: Créditos em Aberto -->
      <div style="background: #faf5ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <span style="font-size: 11px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.5px;">
          Créditos em Aberto
        </span>
        <div style="font-size: 22px; font-weight: 800; color: #7c3aed; margin: 6px 0;">
          ${formatCurrency(summary.outstandingCredits)}
        </div>
        <small style="color: #5b21b6; font-size: 11px;">
          Saldo devedor total em amortização
        </small>
      </div>
    </div>

    <!-- Seção 1: Detalhamento por Evento -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0 0 4px; font-size: 17px; font-weight: 800; color: #0f172a;">
            Saldos e Elegibilidade Individual por Evento
          </h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            O ledger garante a identificação da origem de cada centavo. Nenhum saldo é misturado entre eventos.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            class="btn-primary"
            style="background: #0f172a; color: white; border: 0; padding: 8px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;"
            onclick="window.app.openAccountBlockModal('${selectedProducerId}');"
          >
            🔒 Novo Bloqueio / Retenção
          </button>
          <button
            class="btn-primary"
            style="background: #2563eb; color: white; border: 0; padding: 8px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;"
            onclick="window.app.openGrantCreditModal('${selectedProducerId}');"
          >
            💳 Conceder Crédito / Antecipação
          </button>
        </div>
      </div>

      <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.5px;">
              <th style="padding: 12px 14px;">Evento</th>
              <th style="padding: 12px 14px;">Meta de Vendas</th>
              <th style="padding: 12px 14px;">Vendas Apuradas</th>
              <th style="padding: 12px 14px;">Progresso da Meta</th>
              <th style="padding: 12px 14px;">Bloqueado / Retido</th>
              <th style="padding: 12px 14px;">Dívida de Crédito</th>
              <th style="padding: 12px 14px;">Disponível p/ Repasse</th>
              <th style="padding: 12px 14px;">Status de Liberação</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(ev => {
              const elig = ev.eligibility || {};
              const progress = elig.progressPercent || 0;
              const ruleMet = elig.ruleMet || elig.isExceptional;

              return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;">
                    <strong style="color: #0f172a;">${ev.name}</strong>
                    <br /><small style="color: #64748b;">${ev.id}</small>
                  </td>
                  <td style="padding: 12px 14px;">${formatCurrency(ev.salesTarget || 1000000)}</td>
                  <td style="padding: 12px 14px;"><strong style="color: #0f172a;">${formatCurrency(ev.grossSales || 0)}</strong></td>
                  <td style="padding: 12px 14px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 70px; height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${Math.min(progress, 100)}%; height: 100%; background: ${progress >= 50 ? '#10b981' : '#f59e0b'};"></div>
                      </div>
                      <span style="font-size: 11px; font-weight: 700; color: ${progress >= 50 ? '#059669' : '#b45309'};">${progress.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style="padding: 12px 14px;">
                    <strong style="color: ${Number(ev.blockedBalance || 0) > 0 ? '#dc2626' : '#64748b'};">
                      ${formatCurrency(Number(ev.blockedBalance || 0) + Number(ev.retainedBalance || 0))}
                    </strong>
                  </td>
                  <td style="padding: 12px 14px;">
                    <strong style="color: ${Number(ev.outstandingDebt || 0) > 0 ? '#7c3aed' : '#64748b'};">
                      ${formatCurrency(ev.outstandingDebt || 0)}
                    </strong>
                  </td>
                  <td style="padding: 12px 14px;">
                    <strong style="color: #2563eb; font-size: 14px;">
                      ${formatCurrency(elig.disponivelFinal || 0)}
                    </strong>
                  </td>
                  <td style="padding: 12px 14px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; ${
                      ruleMet ? 'background: #dcfce7; color: #15803d;' : 'background: #fef3c7; color: #b45309;'
                    }">
                      ${ruleMet ? '✓ Habilitado' : 'Bloqueado (< 50%)'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Seção 2: Créditos e Antecipações Contratadas -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0 0 4px; font-size: 17px; font-weight: 800; color: #0f172a;">
            Contratos de Crédito e Antecipações Ativas
          </h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            Capital disponibilizado ao produtor com juros contratados e modelos de amortização programada ou por retenção de bilheteria.
          </p>
        </div>
        <button
          class="btn-primary"
          style="background: #7c3aed; color: white; border: 0; padding: 8px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;"
          onclick="window.app.openGrantCreditModal('${selectedProducerId}');"
        >
          + Novo Contrato de Crédito
        </button>
      </div>

      <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.5px;">
              <th style="padding: 12px 14px;">Protocolo / Data</th>
              <th style="padding: 12px 14px;">Evento Vinculado</th>
              <th style="padding: 12px 14px;">Principal Concedido</th>
              <th style="padding: 12px 14px;">Taxa de Juros</th>
              <th style="padding: 12px 14px;">Total da Dívida</th>
              <th style="padding: 12px 14px;">Saldo Devedor Atual</th>
              <th style="padding: 12px 14px;">Forma de Amortização</th>
              <th style="padding: 12px 14px;">Status</th>
              <th style="padding: 12px 14px;">Ações da Mesa</th>
            </tr>
          </thead>
          <tbody>
            ${credits.length === 0 ? `
              <tr>
                <td colspan="9" style="padding: 24px; text-align: center; color: #64748b;">
                  Nenhum contrato de crédito ativo para este produtor.
                </td>
              </tr>
            ` : credits.map(c => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 14px;">
                  <strong style="color: #0f172a;">${c.protocol}</strong>
                  <br /><small style="color: #64748b;">${new Date(c.grantedAt).toLocaleDateString('pt-BR')}</small>
                </td>
                <td style="padding: 12px 14px;"><strong style="color: #0f172a;">${c.eventName}</strong></td>
                <td style="padding: 12px 14px;">${formatCurrency(c.principal)}</td>
                <td style="padding: 12px 14px;">
                  <span style="background: #ede9fe; color: #6d28d9; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">
                    ${c.interestRate}% a.m.
                  </span>
                </td>
                <td style="padding: 12px 14px;"><strong>${formatCurrency(c.totalDebt)}</strong></td>
                <td style="padding: 12px 14px;">
                  <strong style="color: ${c.outstandingDebt > 0 ? '#dc2626' : '#059669'}; font-size: 14px;">
                    ${formatCurrency(c.outstandingDebt)}
                  </strong>
                </td>
                <td style="padding: 12px 14px;">
                  <span style="font-size: 12px; font-weight: 600; color: #334155;">
                    ${c.amortizationModel === 'PARCELAS_FIXAS' ? `${c.installmentsCount}x de ${formatCurrency(c.installmentValue)}` : ''}
                    ${c.amortizationModel === 'PERCENTUAL_RECEBIVEIS' ? `${c.receivablePercent}% das vendas líquidas` : ''}
                    ${c.amortizationModel === 'FECHAMENTO_EVENTO' ? 'No encerramento do evento' : ''}
                  </span>
                </td>
                <td style="padding: 12px 14px;">
                  <span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; ${
                    c.status === 'ATIVO' ? 'background: #fef3c7; color: #b45309;' : 'background: #dcfce7; color: #15803d;'
                  }">
                    ${c.status}
                  </span>
                </td>
                <td style="padding: 12px 14px;">
                  ${c.status === 'ATIVO' ? `
                    <button
                      style="background: white; border: 1px solid #cbd5e1; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; color: #334155;"
                      onclick="window.app.handleAmortizeCredit('${c.id}');"
                    >
                      Abater Parcela
                    </button>
                  ` : `
                    <span style="color: #059669; font-size: 11px; font-weight: 700;">✓ Quitado</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Seção 3: Travas Cautelares, Bloqueios e Retenções -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0 0 4px; font-size: 17px; font-weight: 800; color: #0f172a;">
            Gestão de Bloqueios e Retenções Administrativas
          </h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            Toda retenção é auditada, vinculada ao evento e exige justificativa formal. Nenhuma edição arbitrária de saldo é permitida.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
        ${events.map(ev => {
          const hasBlock = (Number(ev.blockedBalance || 0) + Number(ev.retainedBalance || 0)) > 0;
          const blockedVal = Number(ev.blockedBalance || 0) + Number(ev.retainedBalance || 0);

          return `
            <div style="border: 1px solid ${hasBlock ? '#fecaca' : '#e2e8f0'}; background: ${hasBlock ? '#fffaf0' : '#f8fafc'}; border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: #0f172a; font-size: 14px;">${ev.name}</strong>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; ${hasBlock ? 'background: #fee2e2; color: #b91c1c;' : 'background: #dcfce7; color: #15803d;'}">
                  ${hasBlock ? 'Bloqueio Ativo' : 'Regular'}
                </span>
              </div>
              <div style="font-size: 20px; font-weight: 800; color: ${hasBlock ? '#dc2626' : '#64748b'}; margin-bottom: 6px;">
                ${formatCurrency(blockedVal)}
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 12px;">
                Disponível no evento: <strong>${formatCurrency(ev.availableBalance || 0)}</strong>
              </p>
              <div style="display: flex; gap: 8px;">
                <button
                  style="flex: 1; background: #fee2e2; border: 1px solid #fca5a5; color: #dc2626; padding: 7px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
                  onclick="window.app.openAccountBlockModal('${selectedProducerId}', '${ev.id}');"
                >
                  + Travar Saldo
                </button>
                ${hasBlock ? `
                  <button
                    style="flex: 1; background: #059669; border: 0; color: white; padding: 7px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
                    onclick="window.app.handleReleaseAccountBalance('${selectedProducerId}', '${ev.id}', ${blockedVal});"
                  >
                    🔓 Liberar Saldo
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
