function money(v){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v); }
function badge(status){ const cls=status==='Conciliado'?'success':status==='Divergência'?'danger':status==='Em análise'?'warning':'info'; return `<span class="badge badge-${cls}">${status}</span>`; }

export function renderDiskConciliacao(state){
  const itens = [
    {origem:'Adquirente → Recebível', ref:'LIQ-20260929-0182', produtor:'Produtora ABC', evento:'Festival de Verão', esperado:184520.00, realizado:184520.00, status:'Conciliado'},
    {origem:'Gateway → Adquirente', ref:'GTW-20260929-7710', produtor:'Produtora XYZ', evento:'Arena Music', esperado:96340.50, realizado:96340.50, status:'Conciliado'},
    {origem:'Banco → PIX', ref:'PIX-20260929-4412', produtor:'Produtora ABC', evento:'Festival de Verão', esperado:48200.00, realizado:48150.00, status:'Divergência'},
    {origem:'CNAB → Banco', ref:'CNAB-20260928-03', produtor:'Vários', evento:'Vários', esperado:884200.00, realizado:884200.00, status:'Conciliado'},
    {origem:'Repasse → Banco', ref:'REP-000128', produtor:'Produtora ABC', evento:'Festival de Verão', esperado:50000.00, realizado:50000.00, status:'Em análise'},
    {origem:'Ledger → Tesouraria', ref:'LDG-20260929-9182', produtor:'Produtora XYZ', evento:'Arena Music', esperado:126800.00, realizado:126800.00, status:'Conciliado'}
  ];
  const divergencias = itens.filter(i=>i.status==='Divergência');
  const conciliados = itens.filter(i=>i.status==='Conciliado');
  const diferenca = itens.reduce((s,i)=>s+(i.realizado-i.esperado),0);
  const total = itens.reduce((s,i)=>s+i.esperado,0);
  return `
  <div class="limitless-content">
    <div class="kpi-grid">
      <div class="kpi-card highlight"><div class="kpi-header"><span class="kpi-title">Volume analisado</span></div><div class="kpi-value">${money(total)}</div><div class="kpi-subtext"><span>Conciliação multiorigem</span></div></div>
      <div class="kpi-card success-accent"><div class="kpi-header"><span class="kpi-title">Conciliados</span></div><div class="kpi-value">${conciliados.length}</div><div class="kpi-subtext"><span>Correspondência confirmada</span></div></div>
      <div class="kpi-card"><div class="kpi-header"><span class="kpi-title">Divergências</span></div><div class="kpi-value">${divergencias.length}</div><div class="kpi-subtext"><span>Exigem tratamento</span></div></div>
      <div class="kpi-card"><div class="kpi-header"><span class="kpi-title">Diferença líquida</span></div><div class="kpi-value">${money(diferenca)}</div><div class="kpi-subtext"><span>Não gera ajuste automático</span></div></div>
    </div>

    <div class="card-panel mb-3">
      <div class="card-header-bar"><div class="card-title-group"><h2>Central de Conciliação Financeira</h2><p class="card-subtitle">Banco × PIX/CNAB × Gateway × Adquirente × Recebível × Repasse × Ledger</p></div></div>
      <div class="card-body">
        <div class="row g-2">
          ${['Bancária','PIX e CNAB','Gateways','Adquirentes','Recebíveis','Repasses','Ledger'].map((x,idx)=>`<div class="col-6 col-md"><div class="border rounded p-2 h-100"><div class="fs-xxs text-muted">${idx+1}. CAMADA</div><div class="fw-bold fs-xs">${x}</div><div class="mt-1">${idx===1?'<span class="badge badge-warning">1 divergência</span>':'<span class="badge badge-success">Normal</span>'}</div></div></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card-panel mb-3">
      <div class="card-header-bar"><div class="card-title-group"><h2>Itens de Conciliação</h2><p class="card-subtitle">Cada diferença permanece aberta até investigação, justificativa e correção da causa.</p></div></div>
      <div class="card-body card-body-no-padding"><div class="table-responsive"><table class="limitless-table"><thead><tr><th>Origem</th><th>Referência</th><th>Produtor / Evento</th><th>Esperado</th><th>Realizado</th><th>Diferença</th><th>Situação</th></tr></thead><tbody>
        ${itens.map(i=>`<tr><td class="fw-semibold">${i.origem}</td><td>${i.ref}</td><td>${i.produtor}<div class="fs-xxs text-muted">${i.evento}</div></td><td>${money(i.esperado)}</td><td>${money(i.realizado)}</td><td class="${i.realizado!==i.esperado?'text-danger fw-bold':''}">${money(i.realizado-i.esperado)}</td><td>${badge(i.status)}</td></tr>`).join('')}
      </tbody></table></div></div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7"><div class="card-panel h-100"><div class="card-header-bar"><div class="card-title-group"><h2>Tratamento de Divergências</h2><p class="card-subtitle">A diferença nunca é zerada silenciosamente.</p></div></div><div class="card-body">
        ${['Identificar origem e referência','Comparar valor esperado × realizado','Classificar motivo da divergência','Anexar evidência/comprovante','Definir responsável e ação corretiva','Reprocessar ou lançar ajuste autorizado','Registrar resultado no Ledger e Auditoria'].map((x,i)=>`<div class="d-flex gap-2 align-items-start mb-2"><span class="badge bg-primary-subtle text-primary">${i+1}</span><div class="fs-xs">${x}</div></div>`).join('')}
      </div></div></div>
      <div class="col-lg-5"><div class="card-panel h-100"><div class="card-header-bar"><div class="card-title-group"><h2>Regras de Segurança</h2><p class="card-subtitle">Financeiro Disk</p></div></div><div class="card-body">
        ${['Não criar ajuste automático para fechar diferença','Preservar transação e lançamento originais','Ajustes exigem justificativa e auditoria','Conciliação deve ser idempotente','Reprocessamento não pode duplicar Ledger','Produtor não acessa custo interno/MDR Disk'].map(x=>`<div class="d-flex gap-2 mb-2 fs-xs"><i class="ph-check-circle text-success fs-5"></i><span>${x}</span></div>`).join('')}
      </div></div></div>
    </div>
  </div>`;
}
