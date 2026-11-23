(()=>{
const KEY='alges_profile_v1', $=s=>document.querySelector(s);
let p={};try{p=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
const save=()=>localStorage.setItem(KEY,JSON.stringify(p));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=()=>((p.name||'AL').trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'AL');
const avatar=()=>p.photo?'<img src="'+p.photo+'" alt="Foto">':esc(initials());
const hash=async(pin,salt)=>{let d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
let locked=false,last=Date.now();
function inject(){
 const b=document.querySelector('.brand');
 if(b)b.innerHTML='<button class="profile-avatar" id="profile-trigger" type="button" aria-label="Abrir perfil">'+avatar()+'</button><div class="brand-copy"><strong>ALGES</strong><small>Aula e Gestão</small></div>';
 const h=document.createElement('div');h.id='alges-profile-ui';
 h.innerHTML=[
 '<div class="profile-menu hidden" id="profile-menu"><div class="profile-menu-head"><strong id="profile-menu-name">Meu perfil</strong><small id="profile-menu-email"></small></div><button id="profile-settings" type="button">Perfil e segurança</button><button id="profile-lock" type="button">Sair e bloquear</button></div>',
 '<dialog id="profile-dialog"><form method="dialog" id="profile-form"><div class="modal-head"><div><p class="eyebrow">CONTA PESSOAL</p><h2>Meu perfil</h2></div><button class="icon-btn close" value="cancel">×</button></div>',
 '<div class="profile-edit-avatar"><div class="profile-avatar profile-avatar-large" id="profile-preview">'+avatar()+'</div><label class="secondary profile-photo-label">Adicionar / trocar foto<input id="profile-photo" type="file" accept="image/*" hidden></label><button type="button" class="text-btn" id="profile-remove-photo">Remover foto</button></div>',
 '<label>Nome<input id="profile-name" maxlength="70" placeholder="Seu nome"></label><label>E-mail<input id="profile-email" type="email" maxlength="120" placeholder="seuemail@exemplo.com"></label><label>Telefone / WhatsApp<input id="profile-phone" type="tel" maxlength="25" placeholder="(00) 00000-0000"></label>',
 '<div class="profile-security"><h3>Bloqueio por PIN</h3><p class="hint">Bloqueio básico de privacidade. Não criptografa os dados salvos no aparelho.</p><label>Novo PIN (4 a 8 números)<input id="profile-pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" placeholder="••••" autocomplete="new-password"></label><label>Confirmar PIN<input id="profile-pin-confirm" type="password" inputmode="numeric" maxlength="8" placeholder="Repita o PIN"></label><p class="profile-pin-status" id="profile-pin-status"></p>',
 '<label>Quando bloquear?<select id="profile-lock-mode"><option value="never">Nunca bloquear automaticamente</option><option value="always">Toda vez que abrir o aplicativo</option><option value="5">Após 5 minutos sem usar</option><option value="15">Após 15 minutos sem usar</option><option value="30">Após 30 minutos sem usar</option><option value="60">Após 1 hora sem usar</option></select></label><button type="button" class="text-btn profile-remove-pin" id="profile-disable-pin">Desativar PIN</button></div>',
 '<div class="modal-actions"><span class="spacer"></span><button class="secondary" value="cancel">Cancelar</button><button class="primary" value="default">Salvar alterações</button></div></form></dialog>',
 '<div class="profile-lock-screen hidden" id="profile-lock-screen"><div class="profile-lock-card"><div class="profile-avatar profile-avatar-lock" id="lock-avatar">'+avatar()+'</div><p class="eyebrow">ALGES • AULA E GESTÃO</p><h2>Aplicativo bloqueado</h2><p class="muted" id="lock-user-name"></p><form id="unlock-form"><label>Digite seu PIN<input id="unlock-pin" type="password" inputmode="numeric" maxlength="8" required></label><p class="profile-error" id="unlock-error"></p><button class="primary" type="submit">Desbloquear</button></form><small>Esqueceu o PIN? A recuperação segura ainda não está disponível. Não desinstale nem limpe os dados do navegador.</small></div></div>',
 '<dialog id="profile-welcome"><div class="modal-head"><div><p class="eyebrow">BEM-VINDO</p><h2>Bem-vindo ao ALGES!</h2></div></div><p>Como deseja acessar seu aplicativo?</p><p class="muted">Configure um PIN agora ou continue sem proteção. Você poderá configurar depois no perfil.</p><div class="profile-welcome-actions"><button class="secondary" id="welcome-no-pin">Continuar sem PIN</button><button class="primary" id="welcome-pin">Configurar PIN</button></div></dialog>'
 ].join('');
 document.body.appendChild(h);
}
function update(){['profile-trigger','profile-preview','lock-avatar'].forEach(id=>{let x=$('#'+id);if(x)x.innerHTML=avatar()});$('#profile-menu-name').textContent=p.name||'Meu perfil';$('#profile-menu-email').textContent=p.email||'Configurar e-mail';$('#lock-user-name').textContent=p.name||''}
function lock(){if(!p.pinHash||p.lockMode==='never'||locked)return;locked=true;$('#profile-lock-screen').classList.remove('hidden');$('#unlock-pin').value='';$('#unlock-error').textContent='';setTimeout(()=>$('#unlock-pin').focus(),100)}
function settings(){p=JSON.parse(localStorage.getItem(KEY)||'{}');$('#profile-name').value=p.name||'';$('#profile-email').value=p.email||'';$('#profile-phone').value=p.phone||'';$('#profile-pin').value='';$('#profile-pin-confirm').value='';$('#profile-lock-mode').value=p.lockMode||'never';$('#profile-pin-status').textContent=p.pinHash?'PIN configurado. Digite outro apenas para alterá-lo.':'Nenhum PIN configurado.';$('#profile-dialog').showModal();$('#profile-menu').classList.add('hidden')}
async function start(){
 inject();update();
 $('#profile-trigger').onclick=()=>$('#profile-menu').classList.toggle('hidden');
 document.addEventListener('click',e=>{if(!e.target.closest('#profile-menu')&&!e.target.closest('#profile-trigger'))$('#profile-menu').classList.add('hidden')});
 $('#profile-settings').onclick=settings;
 $('#profile-lock').onclick=()=>{if(!p.pinHash){alert('Configure um PIN primeiro.');settings()}else lock();$('#profile-menu').classList.add('hidden')};
 $('#profile-photo').onchange=e=>{let f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024){alert('A foto deve ter até 2 MB.');return}let r=new FileReader();r.onload=()=>{p.photo=r.result;$('#profile-preview').innerHTML=avatar()};r.readAsDataURL(f)};
 $('#profile-remove-photo').onclick=()=>{p.photo='';$('#profile-preview').innerHTML=avatar()};
 $('#profile-disable-pin').onclick=()=>{if(confirm('Desativar o PIN?')){p.pinHash='';p.pinSalt='';p.lockMode='never';$('#profile-lock-mode').value='never';$('#profile-pin-status').textContent='PIN desativado.'}};
 $('#profile-form').onsubmit=async e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let pin=$('#profile-pin').value,cp=$('#profile-pin-confirm').value,mode=$('#profile-lock-mode').value;if(pin||cp){if(!/^\d{4,8}$/.test(pin)){alert('O PIN deve ter de 4 a 8 números.');return}if(pin!==cp){alert('Os PINs não coincidem.');return}p.pinSalt=crypto.randomUUID();p.pinHash=await hash(pin,p.pinSalt)}if(mode!=='never'&&!p.pinHash){alert('Configure um PIN antes de ativar o bloqueio.');return}p.name=$('#profile-name').value.trim();p.email=$('#profile-email').value.trim();p.phone=$('#profile-phone').value.trim();p.lockMode=mode;save();update();$('#profile-dialog').close();if(window.toast)toast('Perfil salvo')};
 $('#unlock-form').onsubmit=async e=>{e.preventDefault();if(await hash($('#unlock-pin').value,p.pinSalt)===p.pinHash){locked=false;$('#profile-lock-screen').classList.add('hidden');last=Date.now()}else{$('#unlock-error').textContent='PIN incorreto. Tente novamente.';$('#unlock-pin').value=''}};
 $('#welcome-no-pin').onclick=()=>{$('#profile-welcome').close();p.welcomeDone=true;save()};
 $('#welcome-pin').onclick=()=>{$('#profile-welcome').close();settings()};
 ['pointerdown','keydown','touchstart','click'].forEach(ev=>document.addEventListener(ev,()=>{if(!locked)last=Date.now()},{passive:true}));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&p.pinHash&&p.lockMode==='always')lock()});
 window.addEventListener('pageshow',()=>{p=JSON.parse(localStorage.getItem(KEY)||'{}');if(p.pinHash&&p.lockMode==='always')lock()});
 setInterval(()=>{p=JSON.parse(localStorage.getItem(KEY)||'{}');let n=Number(p.lockMode);if(p.pinHash&&n>0&&Date.now()-last>=n*60000)lock()},15000);
 if(!p.welcomeDone&&!p.pinHash)$('#profile-welcome').showModal();else if(p.pinHash&&p.lockMode==='always')lock();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();