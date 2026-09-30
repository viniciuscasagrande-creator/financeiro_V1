import assert from 'node:assert/strict';
import { CoreFinanceiroStore } from '../js/state.js';

const fresh = () => { const s=new CoreFinanceiroStore(); s.data=s.data; return s; };
let ok=0;
function test(name, fn){ try{ fn(); console.log('✓',name); ok++; } catch(e){ console.error('✗',name,'\n ',e.message); process.exitCode=1; } }
function throws(fn, pattern){ assert.throws(fn, pattern); }

test('transferível desconta reservado + retido + bloqueado',()=>{
 const s=fresh();
 const e={financialBalance:200000,reservedBalance:50000,retainedBalance:30000,blockedBalance:10000};
 assert.equal(s.getTransferableAmount(e),110000);
});

test('checklist só é válido com todas as validações verdadeiras',()=>{
 const s=fresh();
 assert.equal(s.isChecklistValid({balanceSufficient:true,bankDataValidated:true,eventRegular:true,noActiveBlocks:true,limitPermitted:true}),true);
 assert.equal(s.isChecklistValid({balanceSufficient:true,bankDataValidated:false,eventRegular:true,noActiveBlocks:true,limitPermitted:true}),false);
});

test('aprovação fora do estado correto é bloqueada',()=>{
 const s=fresh(); s.login('disk');
 const item=s.data.approvalQueue[0]; item.status='Pago';
 throws(()=>s.approveOperationByDisk(item.id),/não pode ser aprovada/);
});

test('Disk não assina antes do Produtor',()=>{
 const s=fresh(); s.login('disk');
 const item=s.data.approvalQueue[0]; item.status='Aguardando assinatura do Financeiro'; item.signatures.producer.signed=false;
 throws(()=>s.signByDisk(item.id),/último signatário/);
});

test('liquidação duplicada é bloqueada',()=>{
 const s=fresh(); s.login('admin');
 const item=s.data.approvalQueue[0]; item.status='Pago'; item.paidDate='30/09/2026';
 throws(()=>s.executeFinalTransfer(item.id),/duplicada/);
});

test('quem aprovou não pode liquidar a mesma operação',()=>{
 const s=fresh(); s.login('disk');
 const item=s.data.approvalQueue[0];
 item.status='Documento assinado'; item.paidDate=null; item.liquidationId=null;
 item.signatures.producer.signed=true; item.signatures.disk.signed=true; item.approvedByUserId=s.state.currentUser.id;
 throws(()=>s.executeFinalTransfer(item.id),/quem aprova não pode liquidar/);
});

console.log(`\n${ok} teste(s) aprovados.`);
