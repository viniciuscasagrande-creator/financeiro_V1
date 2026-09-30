export function renderDiskGovernanca(state, section = 'visao') {
  const tabs = [
    ['visao','Visão Geral'],['usuarios','Usuários Financeiros'],['perfis','Perfis e Permissões'],
    ['alcadas','Alçadas de Aprovação'],['fluxos','Fluxos de Aprovação'],['segregacao','Segregação de Funções'],
    ['sensiveis','Operações Sensíveis'],['bloqueios','Bloqueios e Exceções'],['acessos','Auditoria de Acessos']
  ];
  const active = tabs.find(t=>t[0]===section)?.[1] || 'Visão Geral';
  const rows = [
    ['Repasse','Até R$ 50 mil','Analista + Coordenador','Ativa'],
    ['Repasse','R$ 50 mil a R$ 250 mil','Gerente Financeiro','Ativa'],
    ['Repasse','Acima de R$ 250 mil','Diretoria Financeira','Ativa'],
    ['Antecipação','Acima de R$ 100 mil','Gerente + Diretoria','Ativa'],
    ['Alteração de MDR','Qualquer valor','Administrador autorizado','Restrita'],
    ['Ajuste de Ledger','Qualquer valor','Dupla aprovação','Restrita']
  ];
  return `
  <div class="container-fluid py-3">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <div><div class="text-uppercase text-muted fs-xxs fw-bold">FINANCEIRO DISK</div><h3 class="mb-0">Governança Financeira</h3><div class="text-muted">${active} · alçadas, permissões, segregação e segurança operacional.</div></div>
      <div class="d-flex gap-2"><button class="btn btn-outline-primary" onclick="window.app.navigate('diskAuditoria')"><i class="ph-scroll me-1"></i>Auditoria</button><button class="btn btn-primary" onclick="window.app.financeAction('nova-regra')"><i class="ph-plus me-1"></i>Nova regra</button></div>
    </div>
    <div class="card mb-3"><div class="card-body py-2 d-flex flex-wrap gap-2">${tabs.map(t=>`<button class="btn btn-sm ${section===t[0]?'btn-primary':'btn-outline-secondary'}" onclick="window.app.navigate('diskGovernanca_${t[0]}')">${t[1]}</button>`).join('')}</div></div>
    <div class="row g-3 mb-3">
      <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Usuários financeiros</div><div class="fs-3 fw-bold">18</div><button class="btn btn-link p-0" onclick="window.app.navigate('diskGovernanca_usuarios')">Gerenciar usuários →</button></div></div></div>
      <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Regras de alçada</div><div class="fs-3 fw-bold">12</div><button class="btn btn-link p-0" onclick="window.app.navigate('diskGovernanca_alcadas')">Ver alçadas →</button></div></div></div>
      <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Aprovações pendentes</div><div class="fs-3 fw-bold">${state.pendingApprovalsCount || 0}</div><button class="btn btn-link p-0" onclick="window.app.navigate('diskAprovacoes')">Abrir aprovações →</button></div></div></div>
      <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Exceções abertas</div><div class="fs-3 fw-bold">3</div><button class="btn btn-link p-0" onclick="window.app.navigate('diskGovernanca_bloqueios')">Tratar exceções →</button></div></div></div>
    </div>
    <div class="card mb-3"><div class="card-header d-flex justify-content-between align-items-center"><strong>Matriz de Alçadas</strong><button class="btn btn-sm btn-outline-primary" onclick="window.app.financeAction('editar-alcadas')">Editar matriz</button></div><div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>Operação</th><th>Faixa</th><th>Aprovação exigida</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="badge ${r[3]==='Ativa'?'bg-success':'bg-warning text-dark'}">${r[3]}</span></td><td><button class="btn btn-sm btn-outline-secondary" onclick="window.app.financeAction('detalhar-regra','${i}')">Detalhes</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="row g-3">
      <div class="col-lg-6"><div class="card h-100"><div class="card-header"><strong>Segregação de Funções</strong></div><div class="card-body"><div class="d-flex flex-wrap gap-2 align-items-center"><span class="badge bg-light text-dark p-2">Criador</span><i class="ph-arrow-right"></i><span class="badge bg-light text-dark p-2">Analisador</span><i class="ph-arrow-right"></i><span class="badge bg-light text-dark p-2">Aprovador</span><i class="ph-arrow-right"></i><span class="badge bg-light text-dark p-2">Assinante</span><i class="ph-arrow-right"></i><span class="badge bg-light text-dark p-2">Executor</span><i class="ph-arrow-right"></i><span class="badge bg-light text-dark p-2">Conciliador</span></div><p class="text-muted small mt-3 mb-2">O mesmo usuário pode ser impedido de executar etapas incompatíveis conforme a política.</p><button class="btn btn-sm btn-outline-primary" onclick="window.app.navigate('diskGovernanca_segregacao')">Configurar segregação</button></div></div></div>
      <div class="col-lg-6"><div class="card h-100"><div class="card-header"><strong>Operações Sensíveis</strong></div><div class="card-body"><div class="small">Dados bancários · MDR · antecipações · assinatura Disk · pagamentos · ajustes de Ledger · reabertura de fechamento · integrações.</div><div class="mt-3 d-flex gap-2"><button class="btn btn-sm btn-outline-danger" onclick="window.app.navigate('diskGovernanca_sensiveis')">Regras de proteção</button><button class="btn btn-sm btn-outline-secondary" onclick="window.app.navigate('diskIntegracao_logs')">Logs de integração</button></div></div></div></div>
    </div>
  </div>`;
}
