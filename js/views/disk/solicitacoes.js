import { formatCurrency, createStatusBadge } from '../../formatters.js';
export function renderDiskSolicitacoes(state) {
  const items = state.data.approvalQueue;
  const pending = items.filter(i => !['Pago','Rejeitado'].includes(i.status));
  const reserved = pending.reduce((a,i)=>a+(i.requestedAmount||0),0);
  return `<div class="limitless-content">
    <div class="card-panel"><div class="card-header-bar"><div class="card-title-group"><h2>Central de Solicitações</h2><p class="card-subtitle">Entrada única das solicitações originadas no ambiente do Produtor. Aqui o Financeiro Disk acompanha antes da decisão.</p></div></div>
    <div class="card-body"><div class="row g-3"><div class="col-md-4"><div class="p-3 border rounded"><small>Pendentes no fluxo</small><div class="fs-3 fw-bold">${pending.length}</div></div></div><div class="col-md-4"><div class="p-3 border rounded"><small>Valor reservado</small><div class="fs-3 fw-bold">${formatCurrency(reserved)}</div></div></div><div class="col-md-4"><div class="p-3 border rounded"><small>Origem</small><div class="fs-5 fw-bold">Ambiente Produtor</div></div></div></div></div></div>
    <div class="card-panel"><div class="card-body card-body-no-padding"><div class="table-responsive"><table class="limitless-table"><thead><tr><th>Protocolo</th><th>Produtor / Evento</th><th>Operação</th><th>Solicitado em</th><th style="text-align:right">Valor</th><th>Reserva</th><th>Status</th><th></th></tr></thead><tbody>
    ${items.map(i=>`<tr><td><strong>${i.id}</strong></td><td><strong>${i.producerName}</strong><br><small>${i.eventName||'—'}</small></td><td>${i.type}</td><td>${i.requestDate||'—'}</td><td style="text-align:right"><strong>${formatCurrency(i.requestedAmount||i.netAmount||0)}</strong></td><td>${i.reservation?.status||(['Pago','Rejeitado'].includes(i.status)?'Encerrada':'—')}</td><td>${createStatusBadge(i.status)}</td><td style="text-align:right"><button class="btn btn-sm btn-primary" onclick="window.app.navigate('diskAprovacoes'); setTimeout(()=>window.app.openApprovalSheet('${i.id}'),50)">Analisar</button></td></tr>`).join('')}
    </tbody></table></div></div></div></div>`;
}
