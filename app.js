const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
let events=load('td_events',[]),tasks=load('td_tasks',[]),classes=load('td_classes',[]),students=load('td_students',[]),payments=load('td_payments',[]),groups=load('td_groups',[{id:'default',name:'Particular',percent:60}]),selectedDate=todayISO(),monthDate=new Date(),calendarMode='month';
const save=()=>{localStorage.setItem('td_events',JSON.stringify(events));localStorage.setItem('td_tasks',JSON.stringify(tasks));localStorage.setItem('td_classes',JSON.stringify(classes));localStorage.setItem('td_students',JSON.stringify(students));localStorage.setItem('td_payments',JSON.stringify(payments));localStorage.setItem('td_groups',JSON.stringify(groups))};
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
const toast=m=>{let t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)};
function switchView(v){$$('.view').forEach(x=>x.classList.add('hidden'));$('#view-'+v).classList.remove('hidden');$$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#page-title').textContent=({today:'Hoje',calendar:'Calendário',tasks:'Tarefas',classes:'Turmas',finance:'Financeiro'})[v];render()}
$$('.nav').forEach(b=>b.onclick=()=>switchView(b.dataset.view));$$('[data-goto]').forEach(b=>b.onclick=()=>switchView(b.dataset.goto));
function eventCard(e){return `<div class="event-card"><div class="event-time">${e.start||'--:--'}${e.end?' – '+e.end:''}</div><div class="event-info"><strong>${esc(e.title)}</strong><small>${esc(e.category)}${e.desc?' • '+esc(e.desc):''}</small></div><span class="pill">${esc(e.priority||'Normal')}</span><button class="icon-btn" onclick="editEvent('${e.id}')">···</button></div>`}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function taskHtml(t){return `<div class="task-card"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask('${t.id}')"><span class="${t.done?'done':''}">${esc(t.title)}</span><small>${t.date?fmt(t.date):'Sem prazo'}</small><button class="icon-btn" onclick="removeTask('${t.id}')">×</button></div>`}
function render(){let today=todayISO(),todays=events.filter(e=>e.date===today).sort((a,b)=>a.start.localeCompare(b.start));$('#today-date').textContent=fmt(today);$('#today-chip').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});$('#stat-events').textContent=todays.length;$('#stat-tasks').textContent=tasks.filter(t=>!t.done).length;$('#stat-classes').textContent=classes.length;$('#today-list').innerHTML=todays.length?todays.map(eventCard).join(''):'<div class="empty">Nenhum compromisso para hoje. Aproveite para organizar sua agenda.</div>';let pending=tasks.filter(t=>!t.done).slice(0,5);$('#today-tasks').innerHTML=pending.length?pending.map(taskHtml).join(''):'<div class="empty">Nenhuma tarefa pendente.</div>';$('#all-tasks').innerHTML=tasks.length?tasks.map(taskHtml).join(''):'<div class="empty">Suas tarefas aparecerão aqui.</div>';renderCalendar();renderClasses();renderFinance()}
function renderCalendar(){
 let y=monthDate.getFullYear(),m=monthDate.getMonth(),html='';
 if(calendarMode==='week'){
  const base=new Date(selectedDate+'T12:00:00'),first=new Date(base);first.setDate(base.getDate()-base.getDay());
  const last=new Date(first);last.setDate(first.getDate()+6);
  $('#month-label').textContent=first.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})+' – '+last.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  html=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>'<div class="weekday">'+x+'</div>').join('');
  for(let i=0;i<7;i++){let d=new Date(first);d.setDate(first.getDate()+i);let iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),has=events.some(e=>e.date===iso);html+='<button class="day '+(iso===selectedDate?'selected ':'')+(iso===todayISO()?'today':'')+'" onclick="selectDate(\''+iso+'\')"><b>'+d.getDate()+'</b>'+(has?'<i></i>':'')+'</button>'}
  $('#calendar-grid').style.gridTemplateColumns='repeat(7,minmax(0,1fr))';
 }else{
  $('#month-label').textContent=monthDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  let first=new Date(y,m,1),startDate=new Date(y,m,1-first.getDay());
  html=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>'<div class="weekday">'+x+'</div>').join('');
  for(let i=0;i<42;i++){let d=new Date(startDate);d.setDate(startDate.getDate()+i);let iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),has=events.some(e=>e.date===iso);html+='<button class="day '+(d.getMonth()!==m?'muted-day ':'')+(iso===selectedDate?'selected ':'')+(iso===todayISO()?'today':'')+'" onclick="selectDate(\''+iso+'\')"><b>'+d.getDate()+'</b>'+(has?'<i></i>':'')+'</button>'}
  $('#calendar-grid').style.gridTemplateColumns='';
 }
 $('#calendar-grid').innerHTML=html;$('#selected-label').textContent=fmt(selectedDate);
 let list=events.filter(e=>e.date===selectedDate).sort((a,b)=>a.start.localeCompare(b.start));
 $('#selected-list').innerHTML=list.length?list.map(eventCard).join(''):'<div class="empty">Nenhum compromisso nesta data.</div>';
}
window.selectDate=d=>{selectedDate=d;renderCalendar()};$('#prev-month').onclick=()=>{if(calendarMode==='week'){let d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()-7);selectedDate=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}else monthDate.setMonth(monthDate.getMonth()-1);renderCalendar()};$('#next-month').onclick=()=>{if(calendarMode==='week'){let d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()+7);selectedDate=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}else monthDate.setMonth(monthDate.getMonth()+1);renderCalendar()};$('#month-mode').onclick=()=>{calendarMode='month';renderCalendar()};$('#week-mode').onclick=()=>{calendarMode='week';renderCalendar()};
function openEvent(date=todayISO(),e=null){$('#event-form').reset();$('#event-id').value=e?.id||'';$('#event-title').value=e?.title||'';$('#event-desc').value=e?.desc||'';$('#event-date').value=e?.date||date;$('#event-category').value=e?.category||'Aula';$('#event-start').value=e?.start||'08:00';$('#event-end').value=e?.end||'09:00';$('#event-priority').value=e?.priority||'Normal';$('#event-reminder').value=e?.reminder??'1440';$('#event-modal-title').textContent=e?'Editar compromisso':'Novo compromisso';$('#delete-event').classList.toggle('hidden',!e);$('#event-dialog').showModal()}
window.editEvent=id=>{let e=events.find(x=>x.id===id);if(e)openEvent(e.date,e)};
$('#add-event').onclick=()=>openEvent();$('#add-selected').onclick=()=>openEvent(selectedDate);
$('#delete-event').onclick=()=>{let id=$('#event-id').value;events=events.filter(e=>e.id!==id);save();$('#event-dialog').close();render();toast('Compromisso excluído')};
$('#event-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;if(e.submitter?.id==='delete-event')return;e.preventDefault();let id=$('#event-id').value,old=events.find(x=>x.id===id);let item={id:id||crypto.randomUUID(),title:$('#event-title').value.trim(),desc:$('#event-desc').value.trim(),date:$('#event-date').value,category:$('#event-category').value,start:$('#event-start').value,end:$('#event-end').value,priority:$('#event-priority').value,reminder:$('#event-reminder').value};if(old)events=events.map(x=>x.id===id?item:x);else events.push(item);save();$('#event-dialog').close();render();toast('Compromisso salvo')};
$('#add-task').onclick=()=>{$('#task-form').reset();$('#task-dialog').showModal()};$('#task-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();tasks.push({id:crypto.randomUUID(),title:$('#task-title').value.trim(),date:$('#task-date').value,done:false});save();$('#task-dialog').close();render();toast('Tarefa adicionada')};window.toggleTask=id=>{let t=tasks.find(x=>x.id===id);if(t)t.done=!t.done;save();render()};window.removeTask=id=>{tasks=tasks.filter(t=>t.id!==id);save();render()};

function openClassEditor(c=null){$('#class-form').reset();$('#class-dialog .modal-head h2').textContent=c?'Editar turma':'Nova turma';$('#class-id').value=c?.id||'';$('#class-name').value=c?.name|| (classes.length?'':'Turma 01');$('#class-teacher').value=c?.teacher||'';$('#class-place').value=c?.place||'';$('#class-start').value=c?.start||'19:00';$('#class-end').value=c?.end||'20:00';$('#class-model').value=c?.financeModel||'percent';$('#class-academy-percent').value=c?.academyPercent??60;$('#class-teacher-percent').value=c?.teacherPercent??40;$('#class-academy-rate').value=c?.academyRate??10;[...$('#class-days').options].forEach(o=>o.selected=(c?.days||[]).includes(o.value));$('#class-model').dispatchEvent(new Event('change'));$('#class-dialog').showModal()}
$('#add-class').onclick=()=>openClassEditor();
$('#class-model').onchange=()=>{let fixed=$('#class-model').value==='perLesson';$('#class-percent-fields').classList.toggle('hidden',fixed);$('#class-rate-field').classList.toggle('hidden',!fixed)};
$('#class-academy-percent').oninput=()=>$('#class-teacher-percent').value=100-Number($('#class-academy-percent').value||0);
$('#class-teacher-percent').oninput=()=>$('#class-academy-percent').value=100-Number($('#class-teacher-percent').value||0);
$('#class-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let id=$('#class-id').value,days=[...$('#class-days').selectedOptions].map(x=>x.value),old=classes.find(c=>c.id===id),item={...(old||{}),id:id||crypto.randomUUID(),name:$('#class-name').value.trim(),teacher:$('#class-teacher').value,place:$('#class-place').value,days,start:$('#class-start').value,end:$('#class-end').value,financeModel:$('#class-model').value,academyPercent:Number($('#class-academy-percent').value),teacherPercent:Number($('#class-teacher-percent').value),academyRate:Number($('#class-academy-rate').value)};classes=old?classes.map(c=>c.id===id?item:c):[...classes,item];save();$('#class-dialog').close();render();toast(old?'Turma atualizada':'Turma cadastrada')};window.removeClass=id=>{let c=classes.find(x=>x.id===id);if(!c)return;if(!confirm('Excluir a turma '+c.name+'? Os alunos e pagamentos cadastrados nela também serão excluídos.'))return;classes=classes.filter(c=>c.id!==id);save();render();toast('Turma excluída')};
function renderClasses(){
 const host=$('#class-list');
 host.innerHTML=classes.length?classes.map(c=>{
  const n=(c.students||[]).length;
  return '<article class="class-card"><h3>'+esc(c.name)+'</h3><p>◷ '+esc(c.start)+' – '+esc(c.end)+'</p><p>▣ '+esc((c.days||[]).join(', ')||'Dias não definidos')+'</p><p>Professor: '+esc(c.teacher||'Não informado')+'</p><p>'+n+' aluno(s) cadastrado(s)</p><div class="class-buttons"><button type="button" class="secondary" data-class-action="edit" data-class-id="'+esc(c.id)+'">Editar turma</button><button type="button" class="primary" data-class-action="open" data-class-id="'+esc(c.id)+'">Abrir turma</button><button type="button" class="danger" data-class-action="delete" data-class-id="'+esc(c.id)+'">Excluir</button></div></article>';
 }).join(''):'<div class="empty">Nenhuma turma cadastrada. Crie sua primeira turma.</div>';
 host.onclick=e=>{
  const button=e.target.closest('button[data-class-action]');
  if(!button)return;
  e.preventDefault();
  e.stopPropagation();
  const id=button.dataset.classId, action=button.dataset.classAction;
  if(action==='edit')window.editClass(id);
  else if(action==='open')window.openClassDetail(id);
  else if(action==='delete')window.removeClass(id);
 };
}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

const money=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const currentMonth=()=>$('#finance-month').value||todayISO().slice(0,7);
function groupPercent(s){let g=groups.find(x=>x.id===s.groupId);return Number(g?.percent??60)}
function lessonsFor(s,m){return Math.max(0,Number(s.lessonsByMonth?.[m]||0))}
function academyFor(s,m){return s.type==='particular'?lessonsFor(s,m)*10:paidFor(s.id,m)*groupPercent(s)/100}
window.setPrivateLessons=(id,value)=>{let s=students.find(x=>x.id===id);if(!s)return;s.lessonsByMonth=s.lessonsByMonth||{};s.lessonsByMonth[currentMonth()]=Math.max(0,Math.floor(Number(value)||0));save();renderFinance()};
function paidFor(sid,month){return payments.filter(p=>p.studentId===sid&&p.month===month).reduce((a,p)=>a+Number(p.amount),0)}
function classPaid(c,sid,month){return (c.payments||[]).filter(p=>p.studentId===sid&&p.month===month).reduce((a,p)=>a+Number(p.amount||0),0)}
function classAcademy(c,month){
 if(c.financeModel==='perLesson')return (c.students||[]).reduce((a,s)=>a+Number(s.lessonsByMonth?.[month]||0)*Number(c.academyRate||0),0);
 const received=(c.payments||[]).filter(p=>p.month===month).reduce((a,p)=>a+Number(p.amount||0),0);
 return received*Number(c.academyPercent??60)/100;
}
window.historyClassStudent=(classId,studentId)=>{let c=classes.find(x=>x.id===classId),s=c?.students?.find(x=>x.id===studentId);if(!c||!s)return;let h=(c.payments||[]).filter(p=>p.studentId===studentId).sort((a,b)=>b.date.localeCompare(a.date));alert('Histórico de '+s.name+' — '+c.name+'\\n'+(h.length?h.map(p=>p.date.split('-').reverse().join('/')+' — '+money(p.amount)).join('\\n'):'Nenhum pagamento registrado'))};
window.payClassStudentFromFinance=(classId,studentId)=>{activeClassId=classId;$('#detail-month').value=currentMonth();window.payClassStudent(studentId)};
window.editClassStudentFromFinance=(classId,studentId)=>{activeClassId=classId;$('#detail-month').value=currentMonth();window.editClassStudent(studentId)};
window.setClassLessonsFromFinance=(classId,studentId,value)=>{let c=classes.find(x=>x.id===classId),s=c?.students?.find(x=>x.id===studentId);if(!s)return;s.lessonsByMonth=s.lessonsByMonth||{};s.lessonsByMonth[currentMonth()]=Math.max(0,Math.floor(Number(value)||0));save();renderFinance()};
function renderFinance(){
 if(!$('#finance-month'))return;
 if(!$('#finance-month').value)$('#finance-month').value=todayISO().slice(0,7);
 const m=currentMonth(),classStudents=classes.flatMap(c=>(c.students||[]).map(s=>({student:s,cls:c})));
 const expected=students.reduce((a,s)=>a+Number(s.amount||0),0)+classStudents.reduce((a,x)=>a+Number(x.student.amount||0),0);
 const globalReceived=payments.filter(p=>p.month===m).reduce((a,p)=>a+Number(p.amount||0),0);
 const classReceived=classes.reduce((a,c)=>a+(c.payments||[]).filter(p=>p.month===m).reduce((b,p)=>b+Number(p.amount||0),0),0);
 const received=globalReceived+classReceived;
 const pending=students.reduce((a,s)=>a+Math.max(0,Number(s.amount||0)-paidFor(s.id,m)),0)+classStudents.reduce((a,x)=>a+Math.max(0,Number(x.student.amount||0)-classPaid(x.cls,x.student.id,m)),0);
 $('#fin-expected').textContent=money(expected);$('#fin-received').textContent=money(received);$('#fin-pending').textContent=money(pending);
 const max=Math.max(received,pending,1);
 $('#finance-chart').innerHTML='<div class="chart-row"><span>Recebido</span><div class="bar-track"><i class="bar received" style="width:'+Math.min(100,received/max*100)+'%"></i></div><b>'+money(received)+'</b></div><div class="chart-row"><span>Pendente</span><div class="bar-track"><i class="bar pending" style="width:'+Math.min(100,pending/max*100)+'%"></i></div><b>'+money(pending)+'</b></div>';
 const academy=students.reduce((a,s)=>a+academyFor(s,m),0)+classes.reduce((a,c)=>a+classAcademy(c,m),0),teacher=received-academy;
 $('#fin-academy').textContent=money(academy);$('#fin-teacher').textContent='Professor: '+money(teacher)+' • sobre o recebido';
 $('#finance-groups').innerHTML=groups.map(g=>'<div class="group-row"><strong>'+esc(g.name)+'</strong><span>'+Number(g.percent)+'% para academia</span><button class="secondary" onclick="editGroup(\''+g.id+'\')">Editar</button></div>').join('');
 $('#student-group').innerHTML=groups.map(g=>'<option value="'+esc(g.id)+'">'+esc(g.name)+'</option>').join('');
 const globalRows=students.map(s=>{let paid=paidFor(s.id,m),due=Math.max(0,Number(s.amount)-paid),percent=groupPercent(s);return '<article class="student-row"><div class="student-main"><strong>'+esc(s.name)+'</strong><small>'+(s.type==='particular'?'Aula particular':'Aluno avulso')+' • '+(s.type==='particular'?'Academia: R$ 10,00 por aula':'Academia '+percent+'%')+'</small></div><div class="student-values"><b>'+money(s.amount)+'</b><small class="'+(due>0?'debt':'ok')+'">'+(due>0?'Falta '+money(due):'Pago')+'</small></div><div class="student-actions">'+(s.type==='particular'?'<label class="lessons-field">Aulas no mês<input type="number" min="0" step="1" value="'+lessonsFor(s,m)+'" onchange="setPrivateLessons(\''+s.id+'\',this.value)"></label>':'')+'<button class="primary small" onclick="payStudent(\''+s.id+'\')">＋ Pagamento</button><button class="secondary small" onclick="editStudent(\''+s.id+'\')">Editar</button><button class="icon-btn" onclick="historyStudent(\''+s.id+'\')">↻</button></div></article>'});
 const classRows=classStudents.map(({student:s,cls:c})=>{let paid=classPaid(c,s.id,m),due=Math.max(0,Number(s.amount)-paid),lessons=Number(s.lessonsByMonth?.[m]||0),repasse=c.financeModel==='perLesson'?lessons*Number(c.academyRate||0):Number(c.academyPercent??60);return '<article class="student-row"><div class="student-main"><strong>'+esc(s.name)+'</strong><small>'+esc(c.name)+' • '+(c.financeModel==='perLesson'?'Repasse por aula: '+money(c.academyRate||0):'Academia '+repasse+'%')+'</small></div><div class="student-values"><b>'+money(s.amount)+'</b><small class="'+(due>0?'debt':'ok')+'">'+(due>0?'Falta '+money(due):'Pago')+'</small></div><div class="student-actions">'+(c.financeModel==='perLesson'?'<label class="lessons-field">Aulas no mês<input type="number" min="0" step="1" value="'+lessons+'" onchange="setClassLessonsFromFinance(\''+c.id+'\',\''+s.id+'\',this.value)"></label>':'')+'<button class="primary small" onclick="payClassStudentFromFinance(\''+c.id+'\',\''+s.id+'\')">＋ Pagamento</button><button class="secondary small" onclick="editClassStudentFromFinance(\''+c.id+'\',\''+s.id+'\')">Editar</button><button class="icon-btn" onclick="historyClassStudent(\''+c.id+'\',\''+s.id+'\')">↻</button></div></article>'});
 $('#finance-students').innerHTML=globalRows.concat(classRows).join('')||'<div class="empty">Cadastre seu primeiro aluno para começar o controle financeiro.</div>';
}
$('#finance-month').onchange=renderFinance;
$('#add-student').onclick=()=>{ $('#student-form').reset();$('#student-id').value='';$('#student-modal-title').textContent='Cadastrar aluno';$('#delete-student').classList.add('hidden');$('#student-group').value=groups[0]?.id||'';$('#student-lessons').value=0;$('#student-lessons-field').classList.toggle('hidden',$('#student-type').value!=='particular');$('#student-dialog').showModal() };
$('#student-type').onchange=()=>$('#student-lessons-field').classList.toggle('hidden',$('#student-type').value!=='particular');
$('#student-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let id=$('#student-id').value||crypto.randomUUID(),old=students.find(s=>s.id===id),s={...(old||{}),id,name:$('#student-name').value.trim(),type:$('#student-type').value,groupId:$('#student-group').value,amount:Number($('#student-amount').value),lessonsByMonth:{...(old?.lessonsByMonth||{})}};if(s.type==='particular')s.lessonsByMonth[currentMonth()]=Math.max(0,Math.floor(Number($('#student-lessons').value)||0));students=old?students.map(x=>x.id===id?s:x):[...students,s];save();$('#student-dialog').close();render();toast('Aluno salvo')};
window.editStudent=id=>{let s=students.find(x=>x.id===id);if(!s)return;$('#student-id').value=id;$('#student-name').value=s.name;$('#student-type').value=s.type;$('#student-group').value=s.groupId;$('#student-amount').value=s.amount;$('#student-lessons').value=lessonsFor(s,currentMonth());$('#student-lessons-field').classList.toggle('hidden',s.type!=='particular');$('#student-modal-title').textContent='Editar aluno';$('#delete-student').classList.remove('hidden');$('#student-dialog').showModal()};
$('#delete-student').onclick=()=>{let id=$('#student-id').value;if(!confirm('Excluir este aluno? O histórico de pagamentos também será excluído.'))return;students=students.filter(s=>s.id!==id);payments=payments.filter(p=>p.studentId!==id);save();$('#student-dialog').close();render();toast('Aluno excluído')};
window.payStudent=id=>{let s=students.find(x=>x.id===id);if(!s)return;$('#payment-form').reset();$('#payment-student').value=id;$('#payment-student-name').value=s.name;$('#payment-amount').value=Math.max(0,Number(s.amount)-paidFor(id,currentMonth())).toFixed(2);$('#payment-date').value=todayISO();$('#payment-dialog').showModal()};
$('#payment-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let date=$('#payment-date').value;payments.push({id:crypto.randomUUID(),studentId:$('#payment-student').value,amount:Number($('#payment-amount').value),date,month:date.slice(0,7),note:$('#payment-note').value.trim()});save();$('#payment-dialog').close();render();toast('Pagamento registrado')};
window.historyStudent=id=>{let s=students.find(x=>x.id===id),h=payments.filter(p=>p.studentId===id).sort((a,b)=>b.date.localeCompare(a.date));alert('Histórico de '+s.name+'\\n'+(h.length?h.map(p=>p.date.split('-').reverse().join('/')+' — '+money(p.amount)+(p.note?' ('+p.note+')':'')).join('\\n'):'Nenhum pagamento registrado'))};
$('#add-group').onclick=()=>{$('#group-form').reset();$('#group-percent').value=60;$('#group-form').dataset.edit='';$('#group-dialog').showModal()};
$('#group-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let id=$('#group-form').dataset.edit,name=$('#group-name').value.trim(),percent=Number($('#group-percent').value);if(id)groups=groups.map(g=>g.id===id?{...g,name,percent}:g);else groups.push({id:crypto.randomUUID(),name,percent});save();$('#group-dialog').close();render();toast('Grupo salvo')};
window.editGroup=id=>{let g=groups.find(x=>x.id===id);if(!g)return;$('#group-name').value=g.name;$('#group-percent').value=g.percent;$('#group-form').dataset.edit=id;$('#group-dialog').showModal()};
async function copyShareText(value){
 try{
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);toast('Resumo copiado. Você já pode colar e enviar.');return true;}
 }catch(error){}
 try{
  const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();
  if(ok){toast('Resumo copiado. Você já pode colar e enviar.');return true;}
 }catch(error){}
 alert(value);return false;
}
function financeReportData(month){
 const sections=[];
 const regularStudents=students.filter(s=>s.type!=='particular');
 if(regularStudents.length){
  const rows=regularStudents.map(s=>{
   const paid=paidFor(s.id,month),pct=groupPercent(s),academy=academyFor(s,month);
   return s.name+' — previsto '+money(s.amount)+' | recebido '+money(paid)+' | pendente '+money(Math.max(0,Number(s.amount)-paid))+' | academia '+pct+'% ('+money(academy)+')';
  });
  const subtotal=regularStudents.reduce((sum,s)=>sum+academyFor(s,month),0);
  sections.push({title:'ALUNOS AVULSOS',rows,subtotalLabel:'REPASSE DA ACADEMIA — ALUNOS AVULSOS',subtotal});
 }
 classes.forEach(c=>{
  const roster=c.students||[];
  const rows=roster.map(s=>{
   const lessons=Number(s.lessonsByMonth?.[month]||0);
   if(c.financeModel==='perLesson'){
    const rate=Number(c.academyRate||0),transfer=lessons*rate;
    return s.name+' — previsto XXX | recebido XXX | pendente XXX | '+lessons+' aulas × '+money(rate)+' = repasse '+money(transfer);
   }
   const paid=classPaid(c,s.id,month),academy=paid*Number(c.academyPercent??60)/100;
   return s.name+' — previsto '+money(s.amount)+' | recebido '+money(paid)+' | pendente '+money(Math.max(0,Number(s.amount)-paid))+' | repasse academia '+money(academy);
  });
  sections.push({title:'TURMA: '+c.name.toUpperCase(),rows:rows.length?rows:['Nenhum aluno cadastrado.'],subtotalLabel:'REPASSE DA ACADEMIA — '+c.name.toUpperCase(),subtotal:classAcademy(c,month)});
 });
 const privateStudents=students.filter(s=>s.type==='particular');
 if(privateStudents.length){
  const rows=privateStudents.map(s=>{
   const lessons=lessonsFor(s,month),academy=academyFor(s,month);
   return s.name+' — previsto XXX | recebido XXX | pendente XXX | '+lessons+' aulas × '+money(10)+' = repasse '+money(academy);
  });
  sections.push({title:'AULA INDIVIDUAL',rows,subtotalLabel:'REPASSE DA ACADEMIA — AULA INDIVIDUAL',subtotal:privateStudents.reduce((sum,s)=>sum+academyFor(s,month),0)});
 }
 const total=students.reduce((sum,s)=>sum+academyFor(s,month),0)+classes.reduce((sum,c)=>sum+classAcademy(c,month),0);
 return {sections,total};
}
function buildFinancePdf(month){
 const JsPDF=window.jspdf?.jsPDF||window.jsPDF;
 if(!JsPDF)throw new Error('A biblioteca de PDF ainda não carregou. Verifique sua conexão e tente novamente.');
 const doc=new JsPDF({orientation:'portrait',unit:'mm',format:'a4'});
 const pageW=210,left=16,right=194,contentW=178;
 const {sections,total}=financeReportData(month);
 const monthLabel=new Date(month+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 let y=16;
 const navy=[13,27,46],gold=[208,163,62],ink=[36,48,64],muted=[103,117,136],pale=[244,247,250];
 function topHeader(continued=false){
  doc.setFillColor(...navy);doc.roundedRect(left,y,pageW-32,continued?19:30,3,3,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(continued?12:17);
  doc.text(continued?'TATAMEDESK — RESUMO FINANCEIRO (continuação)':'TATAMEDESK',left+7,y+(continued?12:12));
  if(!continued){doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('RELATÓRIO DE REPASSE DA ACADEMIA',left+7,y+20);doc.setTextColor(238,199,105);doc.setFont('helvetica','bold');doc.text(monthLabel.toUpperCase(),right-7,y+20,{align:'right'});}
  y+=continued?27:38;
 }
 function ensureSpace(height){
  if(y+height>278){doc.addPage();y=14;topHeader(true);}
 }
 function drawSection(section){
  ensureSpace(18);
  doc.setFillColor(...pale);doc.roundedRect(left,y,contentW,10,2,2,'F');
  doc.setTextColor(...navy);doc.setFont('helvetica','bold');doc.setFontSize(10);
  doc.text(section.title,left+4,y+6.7);y+=15;
  section.rows.forEach((row,index)=>{
   const lines=doc.splitTextToSize('• '+row,contentW-10);
   const height=lines.length*4.7+3;
   ensureSpace(height+2);
   doc.setFont('helvetica','normal');doc.setFontSize(8.7);doc.setTextColor(...ink);
   doc.text(lines,left+4,y);
   y+=height;
   if(index<section.rows.length-1){doc.setDrawColor(229,233,238);doc.setLineWidth(.2);doc.line(left+4,y-1,right-4,y-1);}
  });
  ensureSpace(17);
  doc.setDrawColor(...gold);doc.setLineWidth(.45);doc.line(left+4,y,right-4,y);y+=6;
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...navy);
  doc.text(section.subtotalLabel,left+4,y);
  doc.setTextColor(143,103,20);doc.text(money(section.subtotal),right-4,y,{align:'right'});
  y+=12;
 }
 topHeader(false);
 if(!sections.length){doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(...muted);doc.text('Nenhum lançamento financeiro cadastrado para este mês.',left,y);y+=12;}
 sections.forEach(drawSection);
 ensureSpace(27);
 doc.setFillColor(...navy);doc.roundedRect(left,y,contentW,20,3,3,'F');
 doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(10);
 doc.text('TOTAL GERAL DO REPASSE DA ACADEMIA',left+6,y+8);
 doc.setTextColor(238,199,105);doc.setFontSize(14);doc.text(money(total),right-6,y+15,{align:'right'});
 const pages=doc.getNumberOfPages();
 for(let page=1;page<=pages;page++){doc.setPage(page);doc.setDrawColor(220,225,231);doc.setLineWidth(.2);doc.line(left,285,right,285);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...muted);doc.text('TatameDesk • Relatório financeiro',left,290);doc.text('Página '+page+' de '+pages,right,290,{align:'right'});}
 return doc;
}
$('#share-finance').onclick=async()=>{
 const month=currentMonth();
 try{
  const doc=buildFinancePdf(month);
  const blob=doc.output('blob');
  const file=new File([blob],'TatameDesk-Resumo-Financeiro-'+month+'.pdf',{type:'application/pdf'});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
   try{await navigator.share({title:'Resumo financeiro TatameDesk',text:'Resumo do repasse da academia — '+month,files:[file]});return;}
   catch(error){if(error?.name==='AbortError')return;}
  }
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  toast('PDF gerado. Abra o arquivo para compartilhar.');
 }catch(error){console.error(error);alert(error.message||'Não foi possível gerar o PDF. Tente novamente.');}
};

let activeClassId=null;
window.editClass=id=>{let c=classes.find(x=>x.id===id);if(c)openClassEditor(c)};
const detailMonth=()=>$('#detail-month').value||todayISO().slice(0,7);
const classPayments=(c,sid,m)=>((c.payments||[]).filter(p=>p.studentId===sid&&p.month===m).reduce((a,p)=>a+Number(p.amount),0));
const brl=v=>money(v);
window.openClassDetail=id=>{activeClassId=id;let c=classes.find(x=>x.id===id);if(!c)return;$('#detail-class-title').textContent=c.name;$('#detail-month').value=todayISO().slice(0,7);renderClassDetail();$('#class-detail-dialog').showModal()};
$('#close-class-detail').onclick=()=>$('#class-detail-dialog').close();
$('#edit-current-class').onclick=()=>{let c=classes.find(x=>x.id===activeClassId);$('#class-detail-dialog').close();if(c)openClassEditor(c)};
$('#detail-month').onchange=renderClassDetail;
function renderClassDetail(){let c=classes.find(x=>x.id===activeClassId);if(!c)return;c.students=c.students||[];c.payments=c.payments||[];let m=detailMonth(),expected=c.students.reduce((a,s)=>a+Number(s.amount||0),0),received=c.payments.filter(p=>p.month===m).reduce((a,p)=>a+Number(p.amount),0),pending=c.students.reduce((a,s)=>a+Math.max(0,Number(s.amount)-classPayments(c,s.id,m)),0);
$('#detail-expected').textContent=brl(expected);$('#detail-received').textContent=brl(received);$('#detail-pending').textContent=brl(pending);
let academy=0,teacher=0,detailLines=[];
if(c.financeModel==='perLesson'){academy=c.students.reduce((a,s)=>a+Number(s.lessonsByMonth?.[m]||0)*Number(c.academyRate||0),0);teacher=received-academy;$('#detail-share-title').textContent='Repasse por aula realizada';$('#detail-share').textContent='Academia: '+brl(academy)+' ('+brl(c.academyRate)+' × aulas realizadas) • Professor: '+brl(teacher)+'.';}
else{academy=received*Number(c.academyPercent??60)/100;teacher=received-academy;$('#detail-share-title').textContent='Divisão do recebido';$('#detail-share').textContent='Academia '+Number(c.academyPercent??60)+'%: '+brl(academy)+' • Professor '+Number(c.teacherPercent??40)+'%: '+brl(teacher)+'.';}
$('#detail-students').innerHTML=c.students.length?c.students.map(s=>{let paid=classPayments(c,s.id,m),due=Math.max(0,Number(s.amount)-paid),lessons=Number(s.lessonsByMonth?.[m]||0);return '<article class="student-row"><div class="student-main"><strong>'+esc(s.name)+'</strong><small>Mensalidade: '+brl(s.amount)+'</small></div><div class="student-values"><b>'+brl(paid)+' recebido</b><small class="'+(due?'debt':'ok')+'">'+(due?'Falta '+brl(due):'Em dia')+'</small></div><div class="student-actions">'+(c.financeModel==='perLesson'?'<label class="lessons-field">Aulas feitas no mês<input type="number" min="0" step="1" value="'+lessons+'" onchange="setStudentLessons(\''+s.id+'\',this.value)"></label>':'')+'<button class="primary small" onclick="payClassStudent(\''+s.id+'\')">＋ Pagamento</button><button class="secondary small" onclick="editClassStudent(\''+s.id+'\')">Editar</button></div></article>'}).join(''):'<div class="empty">Ainda não há alunos nesta turma. Adicione o primeiro.</div>';
}
$('#add-class-student').onclick=()=>{if(!activeClassId)return;$('#class-student-form').reset();$('#class-student-id').value='';$('#class-student-title').textContent='Adicionar aluno';$('#delete-class-student').classList.add('hidden');$('#class-student-dialog').showModal()};
$('#class-student-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let c=classes.find(x=>x.id===activeClassId);if(!c)return;c.students=c.students||[];let id=$('#class-student-id').value||crypto.randomUUID(),old=c.students.find(s=>s.id===id),s={...(old||{}),id,name:$('#class-student-name').value.trim(),amount:Number($('#class-student-amount').value)};c.students=old?c.students.map(x=>x.id===id?s:x):[...c.students,s];save();$('#class-student-dialog').close();renderClassDetail();renderClasses();renderFinance();renderFinance();toast('Aluno salvo na turma')};
window.editClassStudent=id=>{let c=classes.find(x=>x.id===activeClassId),s=c?.students?.find(x=>x.id===id);if(!s)return;$('#class-student-id').value=id;$('#class-student-name').value=s.name;$('#class-student-amount').value=s.amount;$('#class-student-title').textContent='Editar aluno';$('#delete-class-student').classList.remove('hidden');$('#class-student-dialog').showModal()};
$('#delete-class-student').onclick=()=>{let c=classes.find(x=>x.id===activeClassId),id=$('#class-student-id').value;if(!c)return;if(!confirm('Excluir aluno e seus pagamentos desta turma?'))return;c.students=c.students.filter(s=>s.id!==id);c.payments=(c.payments||[]).filter(p=>p.studentId!==id);save();$('#class-student-dialog').close();renderClassDetail();renderClasses()};
window.payClassStudent=id=>{let c=classes.find(x=>x.id===activeClassId),s=c?.students?.find(x=>x.id===id);if(!s)return;$('#class-payment-form').reset();$('#class-payment-student').value=id;$('#class-payment-name').value=s.name;$('#class-payment-amount').value=Math.max(0,Number(s.amount)-classPayments(c,id,detailMonth())).toFixed(2);$('#class-payment-date').value=todayISO();$('#class-payment-dialog').showModal()};
$('#class-payment-form').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let c=classes.find(x=>x.id===activeClassId),date=$('#class-payment-date').value;if(!c)return;c.payments=c.payments||[];c.payments.push({id:crypto.randomUUID(),studentId:$('#class-payment-student').value,amount:Number($('#class-payment-amount').value),date,month:date.slice(0,7)});save();$('#class-payment-dialog').close();renderClassDetail();renderClasses();renderFinance();toast('Pagamento registrado')};
window.setStudentLessons=(id,value)=>{let c=classes.find(x=>x.id===activeClassId),s=c?.students?.find(x=>x.id===id);if(!s)return;s.lessonsByMonth=s.lessonsByMonth||{};s.lessonsByMonth[detailMonth()]=Math.max(0,Number(value)||0);save();renderClassDetail();renderFinance()};
$('#share-class').onclick=async()=>{
 let c=classes.find(x=>x.id===activeClassId);if(!c)return;
 let m=detailMonth(),received=c.payments.filter(p=>p.month===m).reduce((a,p)=>a+Number(p.amount),0);
 let academy=c.financeModel==='perLesson'?c.students.reduce((a,s)=>a+Number(s.lessonsByMonth?.[m]||0)*Number(c.academyRate||0),0):received*Number(c.academyPercent??60)/100;
 let rows=c.students.map(s=>{
  let lessons=Number(s.lessonsByMonth?.[m]||0);
  if(c.financeModel==='perLesson'){
   let rate=Number(c.academyRate||0),transfer=lessons*rate;
   return s.name+' — previsto XXX | recebido XXX | pendente XXX | '+lessons+' aulas realizadas × '+brl(rate)+' = repasse '+brl(transfer);
  }
  let paid=classPayments(c,s.id,m),due=Math.max(0,Number(s.amount)-paid);
  return s.name+' — mensalidade '+brl(s.amount)+' | recebido '+brl(paid)+' | pendente '+brl(due);
 });
 let msg='TATAMEDESK — '+c.name+' — '+m+'\\n'+rows.join('\\n')+'\\n\\n';
 if(c.financeModel==='perLesson')msg+='Repasse da academia: '+brl(academy);
 else msg+='Previsto: '+brl(c.students.reduce((a,s)=>a+Number(s.amount||0),0))+'\\nRecebido: '+brl(received)+'\\nPendente: '+brl(c.students.reduce((a,s)=>a+Math.max(0,Number(s.amount)-classPayments(c,s.id,m)),0))+'\\nRepasse academia: '+brl(academy)+'\\nProfessor: '+brl(received-academy);
 if(navigator.share){try{await navigator.share({title:'Fechamento '+c.name,text:msg});return;}catch(error){if(error?.name==='AbortError')return;}}
 await copyShareText(msg);
};

// Inicializa somente depois de registrar todos os componentes e eventos.
render();
