/**
 * Produtores, Contas Financeiras & Contas Bancárias — Backoffice Disk
 * Gestão de subcontas financeiras do Core e contas bancárias externas homologadas via Bacen/CIP para repasse
 */
import { formatCurrency, formatNumber, createStatusBadge } from '../../formatters.js';
import { renderScrollSpyNav } from '../../components/scrollSpy.js';

// Helpers de mascaramento para proteção de dados sensíveis na listagem
function maskAccount(accNumber) {
  if (!accNumber) return '—';
  const clean = String(accNumber).trim();
  if (clean.length <= 4) return '••••' + clean;
  return '••••' + clean.slice(-5);
}

function maskCnpjCpf(doc) {
  if (!doc) return '—';
  const clean = String(doc).replace(/\D/g, '');
  if (clean.length === 14) {
    return clean.slice(0, 2) + '.•••.•••/' + clean.slice(8, 12) + '-' + clean.slice(12);
  }
  if (clean.length === 11) {
    return clean.slice(0, 3) + '.•••.•••-' + clean.slice(9);
  }
  return doc.slice(0, 2) + '••••' + doc.slice(-2);
}

function maskPix(pix, type = '') {
  if (!pix) return '—';
  const s = String(pix);
  if (s.includes('@')) {
    const parts = s.split('@');
    return '••••@' + parts[1];
  }
  return maskCnpjCpf(s);
}

export function renderDiskProdutores(state, filterArg = 'all') {
  const currentTab = (typeof window !== 'undefined' && window.app?.diskProdutoresTab) || (filterArg === 'contas' ? 'bancarias' : 'dossie');
  const producers = state.data.producers || [];
  const selectedProducerId = state.selectedProducerId;
  const activeProducer = (selectedProducerId && selectedProducerId !== 'all')
    ? (producers.find(p => p.id === selectedProducerId) || producers[0])
    : (state.activeProducer || producers[0]);

  // Coleta todas as contas bancárias de todos os produtores para a listagem consolidada
  const allBankAccounts = [];
  producers.forEach(p => {
    (p.bankAccounts || []).forEach(b => {
      allBankAccounts.push({
        ...b,
        producerId: p.id,
        producerName: p.name,
        producerCnpj: p.cnpj
      });
    });
  });

  const totalBankAccounts = allBankAccounts.length;
  const activeBankAccounts = allBankAccounts.filter(b => ['Ativa', 'Validada & Ativa'].includes(b.status)).length;
  const pendingBankAccounts = allBankAccounts.filter(b => b.status === 'Pendente de validação').length;
  const inactiveBankAccounts = allBankAccounts.filter(b => b.status && b.status.includes('Inativa')).length;

  return `
    <!-- Limitless Page Header -->
    <div class="limitless-page-header" style="background: #0f172a; color: white; border-bottom: 2px solid #3b82f6;">
      <div class="breadcrumbs" style="color: #94a3b8;">
        <span>Financeiro Disk</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active" style="color: #60a5fa;">Produtores & Contas Financeiras</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1 style="color: #f8fafc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            ${currentTab === 'dossie' ? 'Dossiê Financeiro do Produtor' : (currentTab === 'financeiras' ? 'Contas Financeiras Internas' : 'Contas Bancárias de Repasse')}
          </h1>
          <p class="page-title-desc" style="color: #94a3b8;">
            ${currentTab === 'dossie' ? 'Visão administrativa por produtor e evento, com saldo, política de repasse, deduções exclusivas do evento e autorizações excepcionais.' : (currentTab === 'financeiras' ? 'Contas internas do Core, saldos segregados e controles financeiros administrativos.' : 'Cadastro e homologação das contas bancárias externas utilizadas na liquidação dos repasses.')}
          </p>
        </div>
        <div class="header-action-group" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          ${currentTab === 'bancarias' ? `
            <button class="btn btn-primary" onclick="window.app.openAddProducerBankModal('${activeProducer ? activeProducer.id : ''}')" style="background: #2563eb; border-color: #1d4ed8; display: flex; align-items: center; gap: 8px; font-weight: 700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Adicionar Conta Bancária
            </button>` : ''}
        </div>
      </div>
    </div>

    <!-- Navegação de Abas Internas -->
    <div style="background: white; border-bottom: 1px solid #e2e8f0; padding: 0 24px;">
      <div style="display: flex; gap: 24px;">
        <button class="btn" style="border: none; border-bottom: 3px solid ${currentTab === 'dossie' ? '#2563eb' : 'transparent'}; color: ${currentTab === 'dossie' ? '#2563eb' : '#64748b'}; font-weight: 700; border-radius: 0; padding: 14px 4px; background: none;" onclick="window.app.setDiskProdutoresTab('dossie')">
          <i class="ph-folder-user"></i> Dossiê do Produtor (${activeProducer?.name || 'Selecione'})
        </button>
        <button class="btn" style="border: none; border-bottom: 3px solid ${currentTab === 'bancarias' ? '#2563eb' : 'transparent'}; color: ${currentTab === 'bancarias' ? '#2563eb' : '#64748b'}; font-weight: 700; border-radius: 0; padding: 14px 4px; background: none;" onclick="window.app.setDiskProdutoresTab('bancarias')">
          <i class="ph-bank"></i> Contas Bancárias de Repasse (${totalBankAccounts})
          ${pendingBankAccounts > 0 ? `<span class="badge bg-warning text-dark" style="margin-left: 6px;">${pendingBankAccounts} pendente(s)</span>` : ''}
        </button>
        <button class="btn" style="border: none; border-bottom: 3px solid ${currentTab === 'financeiras' ? '#2563eb' : 'transparent'}; color: ${currentTab === 'financeiras' ? '#2563eb' : '#64748b'}; font-weight: 700; border-radius: 0; padding: 14px 4px; background: none;" onclick="window.app.setDiskProdutoresTab('financeiras')">
          <i class="ph-wallet"></i> Contas Financeiras Internas (Core)
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="limitless-content">
      ${currentTab === 'bancarias' ? renderTabContasBancarias(state, allBankAccounts, { totalBankAccounts, activeBankAccounts, pendingBankAccounts, inactiveBankAccounts }) : ''}
      ${currentTab === 'financeiras' ? renderTabContasFinanceiras(state) : ''}
      ${currentTab === 'dossie' ? renderTabDossieProdutor(state, activeProducer) : ''}
    </div>
  `;
}

/**
 * ABA 1: Contas Bancárias de Repasse (Dados Bancários Externos)
 */
function renderTabContasBancarias(state, bankAccounts, counts) {
  const producers = state.data.producers || [];
  const selectedProducerId = state.selectedProducerId;
  const filterProducer = window.app?.filterBankProducer || (selectedProducerId !== 'all' ? selectedProducerId : 'all');
  const filterStatus = window.app?.filterBankStatus || 'all';

  let filtered = bankAccounts;
  if (filterProducer !== 'all') {
    filtered = filtered.filter(b => b.producerId === filterProducer);
  }
  if (filterStatus !== 'all') {
    if (filterStatus === 'ativa') {
      filtered = filtered.filter(b => ['Ativa', 'Validada & Ativa'].includes(b.status));
    } else if (filterStatus === 'pendente') {
      filtered = filtered.filter(b => b.status === 'Pendente de validação');
    } else if (filterStatus === 'inativa') {
      filtered = filtered.filter(b => b.status && b.status.includes('Inativa'));
    }
  }

  return `
    <!-- KPIs das Contas Bancárias -->
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-header"><span class="kpi-title">Total de Contas Bancárias</span></div>
        <div class="kpi-value">${counts.totalBankAccounts}</div>
        <div class="kpi-subtext"><span>Vinculadas aos produtores homologados</span></div>
      </div>

      <div class="kpi-card success-accent">
        <div class="kpi-header"><span class="kpi-title">Contas Ativas (Validadas)</span></div>
        <div class="kpi-value" style="color: #059669;">${counts.activeBankAccounts}</div>
        <div class="kpi-subtext"><span>Aptas para recebimento de repasses</span></div>
      </div>

      <div class="kpi-card warning-accent" style="${counts.pendingBankAccounts > 0 ? 'border: 2px solid #f59e0b; background: #fffdf5;' : ''}">
        <div class="kpi-header"><span class="kpi-title">Pendentes de Validação</span></div>
        <div class="kpi-value" style="color: #d97706;">${counts.pendingBankAccounts}</div>
        <div class="kpi-subtext"><span>Aguardando homologação Bacen/CIP</span></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span class="kpi-title">Contas Inativas / Histórico</span></div>
        <div class="kpi-value" style="color: #64748b;">${counts.inactiveBankAccounts}</div>
        <div class="kpi-subtext"><span>Preservadas para auditoria de repasses passados</span></div>
      </div>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="card-panel" style="padding: 14px 20px; background: white; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Filtrar por Produtor:</span>
          <select class="form-control" style="width: 250px; font-weight: 600;" onchange="window.app.setBankFilterProducer(this.value)">
            <option value="all" ${filterProducer === 'all' ? 'selected' : ''}>Todos os Produtores</option>
            ${producers.map(p => `
              <option value="${p.id}" ${filterProducer === p.id ? 'selected' : ''}>${p.name}</option>
            `).join('')}
          </select>

          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-left: 8px;">Situação:</span>
          <select class="form-control" style="width: 200px; font-weight: 600;" onchange="window.app.setBankFilterStatus(this.value)">
            <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Todas as Situações</option>
            <option value="ativa" ${filterStatus === 'ativa' ? 'selected' : ''}>🟢 Ativa</option>
            <option value="pendente" ${filterStatus === 'pendente' ? 'selected' : ''}>🟡 Pendente de Validação</option>
            <option value="inativa" ${filterStatus === 'inativa' ? 'selected' : ''}>⚪ Inativa (Substituída)</option>
          </select>
        </div>

        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Exibindo <strong>${filtered.length}</strong> conta(s) bancária(s) • <em>Dados sensíveis mascarados na listagem</em>
        </div>
      </div>
    </div>

    <!-- Tabela Oficial de Contas Bancárias de Repasse -->
    <div class="card-panel">
      <div class="card-header-bar">
        <div class="card-title-group">
          <h2>Contas Bancárias de Produtores Cadastradas</h2>
          <p class="card-subtitle">Contas bancárias externas para onde os recursos são repassados via PIX ou TED/CNAB</p>
        </div>
        <button class="btn btn-outline-primary btn-sm" onclick="window.app.openAddProducerBankModal('${filterProducer !== 'all' ? filterProducer : ''}')">
          + Cadastrar Nova Conta
        </button>
      </div>
      <div class="card-body card-body-no-padding">
        <div class="table-responsive">
          <table class="limitless-table">
            <thead>
              <tr>
                <th>Produtor</th>
                <th>Banco</th>
                <th>Agência / Conta</th>
                <th>Chave PIX</th>
                <th>Vinculação</th>
                <th>Finalidade</th>
                <th>Comprovação</th>
                <th style="text-align: center;">Situação</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(b => {
                const isPending = b.status === 'Pendente de validação';
                const isActive = ['Ativa', 'Validada & Ativa'].includes(b.status);
                const isInactive = b.status && b.status.includes('Inativa');
                const docName = b.documents && b.documents.length > 0 ? b.documents[0].name : 'comprovante.pdf';

                return `
                  <tr style="${isPending ? 'background: #fffdf5;' : ''}">
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${b.producerName}</div>
                      <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">${maskCnpjCpf(b.producerCnpj)}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 4px;">
                        ${b.bankName}
                        ${b.isDefault ? `<span class="badge bg-primary text-white" style="font-size: 0.65rem; padding: 2px 5px;" title="Conta bancária padrão para repasses">★ Principal</span>` : ''}
                      </div>
                      <div style="font-size: 0.72rem; color: #64748b;">${b.accountType || 'Conta Corrente PJ'} · v${b.version || 1}</div>
                    </td>
                    <td>
                      <div style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: #1e293b;">
                        Ag: ${b.agency} / C: ${maskAccount(b.accountNumber)}
                      </div>
                      <div style="font-size: 0.72rem; color: #64748b;">${b.holderName || b.producerName}</div>
                    </td>
                    <td>
                      <div style="font-family: monospace; font-size: 0.82rem; color: #2563eb; font-weight: 600;">
                        ${maskPix(b.pixKey, b.pixType)}
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                        <span style="font-size: 0.7rem; color: #94a3b8;">${b.pixType || 'Chave cadastrada'}</span>
                        ${b.pixKey ? `<button class="btn btn-outline-primary btn-xs" style="font-size: 0.62rem; padding: 0 4px; height: 18px; line-height: 16px;" onclick="window.app.testBankPixKey('${b.pixKey}', '${b.pixType || 'CNPJ'}', '${b.producerName}')" title="Testar chave no DICT/Bacen"><i class="ph-shield-check"></i> DICT</button>` : ''}
                      </div>
                    </td>
                    <td>
                      ${b.bindingType === 'evento' && b.eventName
                        ? `<span class="badge badge-info" style="font-size: 0.72rem;" title="Vinculada exclusivamente ao evento ${b.eventName}">Evento: ${b.eventName}</span>`
                        : `<span class="badge badge-neutral" style="font-size: 0.72rem;">Geral (Todos)</span>`
                      }
                    </td>
                    <td>
                      <span class="badge badge-neutral" style="font-size: 0.72rem;">${b.purpose || 'Repasse'}</span>
                    </td>
                    <td>
                      <button class="btn btn-outline-secondary btn-xs" style="font-size: 0.72rem; padding: 2px 6px;" onclick="window.app.openViewBankDetails('${b.producerId}', '${b.id}')" title="Ver documento anexado">
                        <i class="ph-file-pdf"></i> ${docName.slice(0, 16)}...
                      </button>
                    </td>
                    <td style="text-align: center;">
                      ${isActive
                        ? `<span class="badge badge-success" style="font-weight: 700; padding: 4px 8px;">🟢 Ativa</span>`
                        : (isPending
                          ? `<span class="badge badge-warning" style="font-weight: 700; padding: 4px 8px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a;">🟡 Pendente</span>`
                          : `<span class="badge badge-neutral" style="padding: 4px 8px;">⚪ Inativa</span>`)
                      }
                      <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">
                        ${b.validatedAt ? b.validatedAt.slice(0, 10) : (b.createdAt ? b.createdAt.slice(0, 10) : 'Cadastrada')}
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                        ${isPending ? `
                          <button class="btn btn-success btn-xs" style="font-weight: 700;" onclick="window.app.openValidateBankModal('${b.producerId}', '${b.id}')" title="Homologar conta via Bacen/CIP">
                            <i class="ph-shield-check"></i> Validar
                          </button>
                        ` : ''}
                        ${isActive ? `
                          ${!b.isDefault ? `
                            <button class="btn btn-outline-secondary btn-xs" onclick="window.app.setDefaultBank('${b.producerId}', '${b.id}')" title="Definir como conta padrão de repasses">
                              <i class="ph-star"></i> Principal
                            </button>
                          ` : ''}
                          <button class="btn btn-outline-warning btn-xs" style="font-weight: 600;" onclick="window.app.openChangeBankModal('${b.producerId}', '${b.id}')" title="Solicitar alteração controlada (cria v${(b.version||1)+1})">
                            <i class="ph-pencil"></i> Alterar
                          </button>
                          <button class="btn btn-outline-danger btn-xs" onclick="window.app.toggleBankStatus('${b.producerId}', '${b.id}')" title="Inativar conta para novos repasses">
                            <i class="ph-prohibit"></i> Inativar
                          </button>
                        ` : ''}
                        ${isInactive ? `
                          <button class="btn btn-outline-success btn-xs" onclick="window.app.toggleBankStatus('${b.producerId}', '${b.id}')" title="Reativar conta bancária">
                            <i class="ph-arrow-counter-clockwise"></i> Reativar
                          </button>
                        ` : ''}
                        <button class="btn btn-outline-primary btn-xs" onclick="window.app.openViewBankDetails('${b.producerId}', '${b.id}')" title="Ver dossiê e dados completos">
                          <i class="ph-eye"></i> Ver
                        </button>
                        <button class="btn btn-light btn-xs" onclick="window.app.goToProducerDossier('${b.producerId}')" title="Ir para Dossiê do Produtor">
                          <i class="ph-folder-user"></i>
                        </button>
                        <button class="btn btn-light btn-xs text-danger" onclick="window.app.deleteBank('${b.producerId}', '${b.id}')" title="Excluir conta (bloqueado se houver histórico)">
                          <i class="ph-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    Nenhuma conta bancária encontrada com os filtros selecionados.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * ABA 2: Contas Financeiras Internas (Core)
 * Diferenciação conceitual: Conta Financeira (Core) vs Conta Bancária de Repasse
 */
function renderTabContasFinanceiras(state) {
  const events = state.data.events || [];
  const producers = state.data.producers || [];

  return `
    <div class="card-panel" style="background: #f8fafc; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
      <div style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
        Entendendo a Arquitetura Financeira Disk Ingressos:
      </div>
      <div style="font-size: 0.85rem; color: #475569; line-height: 1.5;">
        <strong>Conta Financeira Interna (Core):</strong> Subconta contábil que apura e custodia os saldos do Produtor/Evento dentro do Ledger (Disponível, Reservado, Recebíveis).<br>
        <strong>Conta Bancária de Repasse:</strong> Destino bancário externo homologado via Bacen/CIP para liquidação financeira via PIX ou TED/CNAB. Se não houver conta bancária ativa homologada, qualquer tentativa de repasse permanece formalmente bloqueada.
      </div>
    </div>

    <div class="card-panel">
      <div class="card-header-bar">
        <div class="card-title-group">
          <h2>Posição das Contas Financeiras & Contas de Repasse Vinculadas</h2>
          <p class="card-subtitle">Verificação automática de elegibilidade para liberação de repasses por produção</p>
        </div>
      </div>
      <div class="card-body card-body-no-padding">
        <div class="table-responsive">
          <table class="limitless-table">
            <thead>
              <tr>
                <th>Evento / Produção</th>
                <th>Produtor Titular</th>
                <th style="text-align: right;">Saldo Disponível</th>
                <th style="text-align: right;">Reservado</th>
                <th style="text-align: right;">Recebíveis Futuros</th>
                <th>Conta Bancária de Repasse</th>
                <th style="text-align: center;">Elegibilidade</th>
                <th style="text-align: right;">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(evt => {
                const prod = producers.find(p => p.id === evt.producerId) || {};
                const bankAccounts = prod.bankAccounts || [];
                // Procura conta específica do evento ou conta geral ativa
                const eventBank = bankAccounts.find(b => b.bindingType === 'evento' && b.eventId === evt.id && ['Ativa', 'Validada & Ativa'].includes(b.status));
                const generalBank = bankAccounts.find(b => (!b.bindingType || b.bindingType === 'geral') && ['Ativa', 'Validada & Ativa'].includes(b.status));
                const activeBank = eventBank || generalBank;

                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${evt.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${evt.category} • ${evt.date}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; font-size: 0.85rem;">${evt.producerName || prod.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${maskCnpjCpf(prod.cnpj)}</div>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: #059669; font-size: 0.95rem;">
                      ${formatCurrency(evt.availableBalance)}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #b45309;">
                      ${formatCurrency(evt.blockedBalance || 0)}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #2563eb;">
                      ${formatCurrency(evt.futureReceivables || 0)}
                    </td>
                    <td>
                      ${activeBank ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="color: #059669; font-weight: 700;">✓</span>
                          <div>
                            <div style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">${activeBank.bankName}</div>
                            <div style="font-size: 0.72rem; color: #64748b; font-family: monospace;">Ag: ${activeBank.agency} / C: ${maskAccount(activeBank.accountNumber)}</div>
                          </div>
                        </div>
                      ` : `
                        <div style="color: #dc2626; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                          <span>⚠️ Sem conta bancária validada</span>
                        </div>
                      `}
                    </td>
                    <td style="text-align: center;">
                      ${activeBank ? `
                        <span class="badge badge-success">Repasse Liberado</span>
                      ` : `
                        <span class="badge badge-danger">Repasse Bloqueado</span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      ${activeBank ? `
                        <button class="btn btn-outline-primary btn-xs" onclick="window.app.openViewBankDetails('${prod.id}', '${activeBank.id}')">
                          Ver Conta
                        </button>
                      ` : `
                        <button class="btn btn-warning btn-xs" style="font-weight: 700;" onclick="window.app.openAddProducerBankModal('${prod.id}', '${evt.id}')">
                          + Cadastrar Conta
                        </button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * ABA 3: Dossiê do Produtor Selecionado
 */
function renderTabDossieProdutor(state, activeProducer) {
  const producers = state.data.producers || [];
  const producerEvents = (state.data.events || []).filter(e => e.producerId === activeProducer.id);
  const calculateEligibility = (typeof window !== 'undefined' && window.financialStore?.calculatePayoutEligibility) 
    || (state.calculatePayoutEligibility ? state.calculatePayoutEligibility.bind(state) : null)
    || (() => null);
  const eventEligibility = Object.fromEntries(producerEvents.map(e => [e.id, calculateEligibility(e.id)]));
  const producerApprovals = (state.data.approvalQueue || []).filter(a => a.producerId === activeProducer.id);
  const bankAccounts = activeProducer.bankAccounts || [];

  const dossieSpyItems = [
    { id: 'sec-dossie-resumo', label: 'Produtor & Contrato', icon: 'ph-buildings' },
    { id: 'sec-dossie-posicao', label: 'Posição Consolidada', icon: 'ph-wallet' },
    { id: 'sec-dossie-eventos', label: 'Eventos & Produções', icon: 'ph-calendar', badge: producerEvents.length },
    { id: 'sec-dossie-solicitacoes', label: 'Aprovações Pendentes', icon: 'ph-scales', badge: producerApprovals.length },
    { id: 'sec-dossie-contas', label: 'Contas Homologadas', icon: 'ph-bank', badge: bankAccounts.length }
  ];

  return `
    <!-- Barra de Navegação Interna Sticky ScrollSpy do Dossiê -->
    ${renderScrollSpyNav(dossieSpyItems, 'sec-dossie-resumo', { navId: 'dossie-scrollspy-nav' })}

    <!-- SEÇÃO 1: Identificação & Governança do Produtor -->
    <section id="sec-dossie-resumo" class="scrollspy-section mb-4" data-scrollspy-section>
      <div class="card-panel" style="padding: 16px 20px; background: #ffffff; border-left: 4px solid #2563eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Produtor em Análise:</span>
            <select class="form-control" style="width: 320px; font-weight: 700;" onchange="window.app.selectProducerInDisk(this.value)">
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
    </section>

    <!-- SEÇÃO 2: POSIÇÃO CONSOLIDADA DO PRODUTOR -->
    <section id="sec-dossie-posicao" class="scrollspy-section mb-4" data-scrollspy-section>
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
    </section>

    <!-- SEÇÃO 3: EVENTOS DO PRODUTOR -->
    <section id="sec-dossie-eventos" class="scrollspy-section mb-4" data-scrollspy-section>
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
                <th style="text-align: right;">Saldo do Evento</th>
                <th style="text-align: right;">Limite da Política</th>
                <th style="text-align: right;">Deduções do Evento</th>
                <th style="text-align: right;">Elegível p/ Repasse</th>
                <th style="text-align: right;">Ação Financeiro Disk</th>
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
                    <div style="font-size:.68rem;color:var(--text-muted);">Conta exclusiva do evento</div>
                  </td>
                  <td style="text-align: right; font-weight: 700;">
                    ${formatCurrency(eventEligibility[evt.id]?.limiteBruto || 0)}
                    <div style="font-size:.68rem;color:var(--text-muted);">${eventEligibility[evt.id]?.releasePercent || 20}% das vendas elegíveis</div>
                  </td>
                  <td style="text-align: right; font-weight: 700; color:#b45309;">
                    -${formatCurrency(eventEligibility[evt.id]?.totalDeductions || 0)}
                    <div style="font-size:.68rem;color:var(--text-muted);">Somente deste evento</div>
                    <div style="font-size:.65rem;color:#94a3b8;">Repasses ${formatCurrency(eventEligibility[evt.id]?.previousPayouts || 0)} • Retido ${formatCurrency(eventEligibility[evt.id]?.retainedBalance || 0)} • Bloqueado ${formatCurrency(eventEligibility[evt.id]?.blockedBalance || 0)}</div>
                  </td>
                  <td style="text-align: right; font-weight: 800; color:${(eventEligibility[evt.id]?.disponivelFinal || 0) > 0 ? '#059669' : '#dc2626'};">
                    ${formatCurrency(eventEligibility[evt.id]?.disponivelFinal || 0)}
                    <div style="font-size:.68rem;color:var(--text-muted);">${eventEligibility[evt.id]?.status || 'BLOQUEADO'}</div>
                  </td>
                  <td style="text-align:right;">
                    <button class="btn btn-outline-primary btn-sm" onclick="window.app.openExceptionalPayoutAuthorization('${evt.id}')">
                      Autorizar exceção
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </section>

    <!-- SEÇÃO 4: Pendências & Solicitações Deste Produtor -->
    <section id="sec-dossie-solicitacoes" class="scrollspy-section mb-4" data-scrollspy-section>
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
    </section>

    <!-- SEÇÃO 5: Contas Bancárias de Repasse Cadastradas -->
    <section id="sec-dossie-contas" class="scrollspy-section mb-4" data-scrollspy-section>
    <div class="card-panel">
      <div class="card-header-bar">
        <div class="card-title-group">
          <h2>Contas Bancárias de Repasse Homologadas</h2>
          <p class="card-subtitle">Contas externas vinculadas a ${activeProducer.name} para liquidação via CIP/Bacen</p>
        </div>
        <button class="btn btn-outline-primary btn-sm" onclick="window.app.openAddProducerBankModal('${activeProducer.id}')">
          <i class="ph-plus me-1"></i> + Adicionar Conta Bancária
        </button>
      </div>
      <div class="card-body card-body-no-padding">
        <div class="table-responsive">
          <table class="limitless-table">
            <thead>
              <tr>
                <th>Banco</th>
                <th>Agência / Conta</th>
                <th>PIX</th>
                <th>Titularidade</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${bankAccounts.length > 0 ? bankAccounts.map(b => `
                <tr>
                  <td>
                    <div class="fw-bold text-dark">${b.bankName}</div>
                    <div class="fs-xxs text-muted">Cód: ${b.bankCode || '—'}</div>
                  </td>
                  <td>
                    <div>Ag: ${b.agency} · CC: ${b.accountNumber}</div>
                    ${b.isDefault ? '<span class="badge badge-primary fs-xxs">Conta Principal de Repasse</span>' : ''}
                  </td>
                  <td>
                    ${b.pixKey ? `<span class="badge badge-info fs-xxs">${b.pixKeyType || 'PIX'}: ${b.pixKey}</span>` : '<span class="text-muted fs-xxs">Não cadastrado</span>'}
                  </td>
                  <td>
                    <div class="fs-xs fw-semibold">${b.holderName || activeProducer.name}</div>
                    <div class="fs-xxs text-muted">${b.holderDocument || activeProducer.cnpj}</div>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${b.status === 'Ativa' || b.status === 'Validada & Ativa' ? 'badge-success' : (b.status === 'Pendente' ? 'badge-warning' : 'badge-neutral')}">
                      ${b.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="d-flex gap-1 justify-content-end">
                      <button class="btn btn-light btn-xs" onclick="window.app.openViewBankModal('${activeProducer.id}', '${b.id}')" title="Ver detalhes">
                        <i class="ph-eye"></i>
                      </button>
                      ${b.status === 'Pendente' ? `
                        <button class="btn btn-success btn-xs" onclick="window.app.validateBank('${activeProducer.id}', '${b.id}')" title="Validar conta">
                          <i class="ph-check"></i> Validar
                        </button>
                      ` : ''}
                      ${!b.isDefault && (b.status === 'Ativa' || b.status === 'Validada & Ativa') ? `
                        <button class="btn btn-primary btn-xs" onclick="window.app.setDefaultBank('${activeProducer.id}', '${b.id}')" title="Definir Principal">
                          <i class="ph-star"></i> Principal
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
                    Nenhuma conta bancária externa cadastrada para este produtor.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </section>
  `;
}
