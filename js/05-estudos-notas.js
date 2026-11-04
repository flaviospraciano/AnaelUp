"use strict";
/* ================= TIMER DE ESTUDOS ================= */
let ESTUDO=null;try{ESTUDO=JSON.parse(localStorage.getItem("au_estudo")||"null");}catch(e){}
const estSave=()=>{try{ESTUDO?localStorage.setItem("au_estudo",JSON.stringify(ESTUDO)):localStorage.removeItem("au_estudo");}catch(e){}};
const estDecorrido=()=>!ESTUDO?0:((ESTUDO.pausa||Date.now())-ESTUDO.ini-(ESTUDO.pt||0))/1000;
const estRest=()=>ESTUDO?ESTUDO.alvo*60-estDecorrido():0;
const materias=()=>{const s=new Set(all("est").sort((a,b)=>(b.u||0)-(a.u||0)).map(e=>e.mat).filter(Boolean));return [...s].slice(0,8);};
function estSemana(){const t=TODAY(),ini=addDays(t,-((pd(t).getDay()+6)%7));return all("est").filter(e=>e.d>=ini);}
function secEstudoMini(){if(ESTUDO){after(estLoop);return `<div class="sec"><h2>${ic("timer")} Estudando</h2></div><button class="card" style="width:100%;text-align:left;--c1:var(--honey)" data-a="go" data-v="${gv({v:"estudos"})}"><div class="row"><span class="mb">${ic("graduation-cap")}</span><div class="grow"><b>${esc(ESTUDO.mat)}</b><div class="small muted">${ESTUDO.pausa?"Pausado":"Em foco"}</div></div><b class="num" id="estMini" style="font:700 1.5rem var(--disp)">${mmss(estRest())}</b></div></button>`;}
  const hj=sum(all("est").filter(e=>e.d===TODAY()).map(e=>e.min));
  return `<div class="sec"><h2>${ic("graduation-cap")} Estudos</h2><button class="lk" data-a="go" data-v="${gv({v:"estudos"})}">${hj?Math.round(hj)+" min hoje":"Abrir"}</button></div>
   <div class="card row" style="flex-wrap:wrap"><div class="grow small muted">Uma sessão de foco, sem celular por perto.</div><button class="btn sm" data-a="estQuick" data-m="25">25 min</button><button class="btn ghost sm" data-a="estQuick" data-m="50">50 min</button></div>`;}
ACT.estQuick=el=>{go({v:"estudos"});ACT.estIni(el);};
VIEWS.estudos=()=>{const S=estSemana(),hj=all("est").filter(e=>e.d===TODAY());const pm={};S.forEach(e=>pm[e.mat]=(pm[e.mat]||0)+e.min);
  let h=topbar("Timer de estudos");
  if(ESTUDO){after(estLoop);h+=`<div class="card" style="text-align:center;--c1:var(--honey)"><div class="small muted">${ESTUDO.pausa?"Pausado":"Foco em"}</div><b style="font-size:1.15rem">${esc(ESTUDO.mat)}</b>
    <div class="timer" id="estT">${mmss(estRest())}</div><div class="bar"><i id="estB" style="width:${clamp(estDecorrido()/(ESTUDO.alvo*60)*100,0,100)}%"></i></div>
    <div class="btns h"><button class="btn ghost" data-a="estPausa">${ic(ESTUDO.pausa?"play":"pause")} ${ESTUDO.pausa?"Continuar":"Pausar"}</button><button class="btn" data-a="estFim">${ic("check")} Concluir</button></div>
    <button class="lk small" style="margin-top:12px" data-a="estCancel">Descartar sessão</button></div>`;}
  else{const ms=materias();h+=`<div class="card"><label class="fld" style="margin-top:0"><span>O que vai estudar?</span><input id="estM" placeholder="Ex.: Português" value="${esc(VIEW.mat||ms[0]||"")}" list="estL"></label><datalist id="estL">${ms.map(m=>`<option value="${esc(m)}">`).join("")}</datalist>
    ${ms.length?`<div class="wrap" style="margin-top:8px">${ms.map(m=>`<button class="chip" data-a="estMat" data-v="${esc(m)}">${esc(m)}</button>`).join("")}</div>`:""}
    <div class="tbtns">${[25,50,90].map(m=>`<button class="tbtn" data-a="estIni" data-m="${m}"><b>${m}</b><span>minutos</span></button>`).join("")}</div>
    <button class="lk small" style="margin-top:10px" data-a="estOutro">${ic("clock")} Outro tempo</button></div>`;}
  h+=`<div class="sec"><h2>Esta semana</h2><span class="small muted">${Math.round(sum(S.map(e=>e.min)))} min</span></div>`;
  const ents=Object.entries(pm).sort((a,b)=>b[1]-a[1]),mx=Math.max(1,...ents.map(x=>x[1]));
  h+=ents.length?`<div class="card">${ents.map(([m,v])=>`<div style="margin-bottom:10px"><div class="row small"><b class="grow">${esc(m)}</b><span class="num">${Math.floor(v/60)?Math.floor(v/60)+" h ":""}${Math.round(v%60)} min</span></div><div class="bar"><i style="width:${v/mx*100}%"></i></div></div>`).join("")}</div>`:`<div class="note">${ic("info")} Ainda sem sessões nesta semana. Comece com 25 minutos.</div>`;
  if(hj.length)h+=`<div class="grp">Hoje</div>`+hj.sort((a,b)=>(b.u||0)-(a.u||0)).map(e=>`<div class="item"><span class="mb">${ic("graduation-cap")}</span><div class="ibody"><b>${esc(e.mat)}</b><span class="small muted">${Math.round(e.min)} min · ${esc(e.h||"")}</span></div><button class="ib" data-a="estDel" data-id="${e.id}" aria-label="Apagar">${ic("trash-2")}</button></div>`).join("");
  return `<div class="app">${h}</div>`;};
ACT.estMat=el=>{const i=$("estM");if(i)i.value=el.dataset.v;};
ACT.estIni=el=>{const i=$("estM");const mat=(i&&i.value.trim())||VIEW.mat||materias()[0]||"Estudos";ESTUDO={mat,alvo:+el.dataset.m,ini:Date.now(),pt:0,pausa:0};estSave();bellNow(.2);
  try{if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();}catch(e){}rr();};
ACT.estOutro=()=>sheet(`<h2>Outro tempo</h2><label class="fld"><span>Minutos</span><input id="eo" type="number" inputmode="numeric" value="40" autofocus></label><div class="btns"><button class="btn full" id="eoS">Começar</button></div>`,s=>{s.querySelector("#eoS").onclick=()=>{const m=clamp(Math.round(+s.querySelector("#eo").value||25),1,240);VIEW.mat=($("estM")||{}).value;closeSheet();ACT.estIni({dataset:{m}});};});
ACT.estPausa=()=>{if(!ESTUDO)return;if(ESTUDO.pausa){ESTUDO.pt+=Date.now()-ESTUDO.pausa;ESTUDO.pausa=0;}else ESTUDO.pausa=Date.now();estSave();rr();};
ACT.estCancel=()=>confirmSheet("Descartar esta sessão?","O tempo não será salvo.","Descartar",()=>{ESTUDO=null;estSave();rr();});
ACT.estFim=()=>estConcluir(false);
ACT.estDel=el=>{removeDoc(el.dataset.id);rr();};
function estConcluir(auto){if(!ESTUDO)return;const min=Math.min(ESTUDO.alvo,estDecorrido()/60);const now=new Date();const mat=ESTUDO.mat;
  if(min>=1)save({id:"est_"+nid(),c:"est",mat,min:Math.round(min*10)/10,d:TODAY(),h:pad(now.getHours())+":"+pad(now.getMinutes())});ESTUDO=null;estSave();
  if(auto){bellNow(.5);notify("Sessão de estudo concluída",mat+" · "+Math.round(min)+" min. Hora de uma pausa.");}
  rr();if(min>=1)toast("graduation-cap","Sessão salva",mat+" · "+Math.round(min)+" min");}
let EST_INT=null;function estLoop(){clearInterval(EST_INT);EST_INT=setInterval(()=>{if(!ESTUDO){clearInterval(EST_INT);return;}const r=estRest();
  const t=$("estT"),b=$("estB"),m=$("estMini");if(t)t.textContent=mmss(r);if(m)m.textContent=mmss(r);if(b)b.style.width=clamp(estDecorrido()/(ESTUDO.alvo*60)*100,0,100)+"%";if(r<=0)estConcluir(true);},500);}

/* ================= ANOTAÇÕES E DIÁRIO ================= */
const HUMOR=[[1,"😣","Difícil"],[2,"😕","Pesado"],[3,"😐","Ok"],[4,"🙂","Bom"],[5,"😄","Ótimo"]];
const PROMPTS=["O que está pesando agora? Pode escrever do jeito que vier.","O que você diria a um amigo que está passando pelo que você está passando?","Do que você precisa hoje, de verdade?","O que aconteceu hoje que você quer tirar do peito?","Qual foi a melhor parte do seu dia, mesmo pequena?","Pelo que você é grato hoje?","O que você aprendeu sobre você nesta semana?","O que pode esperar até amanhã?"];
const promptDia=()=>PROMPTS[(Math.floor(pd(TODAY())/864e5)+(VIEW.pOff||0))%PROMPTS.length];
const diarioDias=()=>new Set(all("nota").filter(n=>n.tipo==="diario").map(n=>n.d));
function diarioSeq(){const D=diarioDias();let d=TODAY();if(!D.has(d))d=addDays(d,-1);let n=0;while(D.has(d)){n++;d=addDays(d,-1);}return n;}
function secDiarioNoite(){const hj=all("nota").filter(n=>n.tipo==="diario"&&n.d===TODAY());
  if(hj.length){const u=hj.sort((a,b)=>(b.u||0)-(a.u||0))[0];const H=HUMOR.find(x=>x[0]===u.humor);return `<div class="journal" style="margin-top:14px"><div class="ttl">Você já escreveu hoje ${H?H[1]:""}</div><p class="small muted" style="margin:6px 0 10px">Escrever é cuidar de si. Quer acrescentar algo?</p><button class="btn ghost sm" data-a="diarioNovo">${ic("notebook-pen")} Escrever mais</button></div>`;}
  return `<div class="journal" style="margin-top:14px"><div class="ttl">Como foi o seu dia, ${NOME}?</div><div class="moods">${HUMOR.map(([v,e,l])=>`<button data-a="diarioHumor" data-v="${v}">${e}<span>${l}</span></button>`).join("")}</div>
   <p class="tiny muted" style="margin:10px 0 0">Toque em como se sente e escreva duas linhas. Nos dias difíceis, escrever ajuda a tirar o peso do peito.</p></div>`;}
function secDiarioMini(){const s=diarioSeq();return `<div class="sec"><h2>${ic("notebook-pen")} Diário</h2>${s>1?`<span class="chip honey">${ic("flame")} ${s} dias</span>`:""}</div>
  <button class="journal" style="width:100%;text-align:left;display:block" data-a="diarioNovo"><div class="prompt" style="margin-top:0">“${esc(promptDia())}”</div><span class="lk">${ic("pencil")} Escrever agora</span></button>`;}
ACT.diarioHumor=el=>diarioForm(null,+el.dataset.v);ACT.diarioNovo=()=>diarioForm(null,0);
function diarioForm(n,humor){const hv=n?n.humor:humor;
  sheet(`<h2>${n?"Editar registro":"Diário"}</h2><p class="small muted">${esc(flong(n?n.d:TODAY()))} · só fica no seu celular.</p>
   <div class="moods" data-k="hum">${HUMOR.map(([v,e,l])=>`<button type="button" data-a="dHum" data-v="${v}" aria-pressed="${v===hv}">${e}<span>${l}</span></button>`).join("")}</div>
   <div id="dApoio">${apoio(hv)}</div>
   <div class="prompt">“${esc(n&&n.prompt||promptDia())}”</div>
   <label class="fld" style="margin-top:4px"><span class="hidden">Texto</span><textarea id="dT" class="tall" placeholder="Escreva sem filtro. Ninguém mais vai ler." autofocus>${esc(n?n.txt:"")}</textarea></label>
   <div class="btns"><button class="btn full" id="dS">${ic("check")} Guardar</button>${n?`<button class="btn danger full" id="dX">Apagar</button>`:""}</div>`,s=>{
   s.querySelector("#dS").onclick=()=>{const txt=s.querySelector("#dT").value.trim();const hm=+(s.querySelector('[data-k="hum"] [aria-pressed="true"]')||{dataset:{v:0}}).dataset.v;if(!txt&&!hm)return toast("feather","Escreva algo","Uma linha já vale.");
     const d=n||{id:"nota_"+nid(),c:"nota",tipo:"diario",d:TODAY(),prompt:promptDia()};Object.assign(d,{txt,humor:hm});save(d);closeSheet();rr();
     const s2=diarioSeq();toast("notebook-pen","Guardado",hm&&hm<=2?"Obrigado por se abrir. Respire fundo.":s2>1?s2+" dias seguidos escrevendo":"Escrever faz bem.");};
   const x=s.querySelector("#dX");if(x)x.onclick=()=>confirmSheet("Apagar este registro?","Não dá para desfazer.","Apagar",()=>{removeDoc(n.id);rr();});});}
function apoio(h){if(!h||h>2)return"";return `<div class="note" style="margin-top:10px;border-style:solid">${ic("heart")}<div>Dias assim passam, e você não precisa carregar tudo sozinho. Escreva o que vier. Depois, se quiser, faça a meditação <b>Acalmar a mente</b>. <button class="lk" data-a="medPaz">Fazer agora (5 min)</button><div class="tiny" style="margin-top:6px">Se o peso estiver grande demais, fale com alguém de confiança ou ligue para o CVV no 188, a qualquer hora e de graça.</div></div></div>`;}
ACT.dHum=el=>{ACT.seg(el);const a=$("dApoio");if(a)a.innerHTML=apoio(+el.dataset.v);};
ACT.medPaz=()=>{closeSheet();const c=cfg();c.medTipo="paz";save(c);medStart("paz",5);};
VIEWS.notas=()=>{const tb=VIEW.tab||"diario";const L=all("nota").filter(n=>(n.tipo||"nota")===tb).sort((a,b)=>(b.d||"").localeCompare(a.d||"")||(b.u||0)-(a.u||0));
  let h=topbar("Anotações");
  h+=`<div class="tabs"><button data-a="ntTab" data-v="diario" aria-pressed="${tb==="diario"}">Diário</button><button data-a="ntTab" data-v="nota" aria-pressed="${tb==="nota"}">Notas</button></div>`;
  if(tb==="diario"){const s=diarioSeq(),D=diarioDias();const ult=[...Array(14)].map((_,i)=>addDays(TODAY(),i-13));
    h+=`<div class="journal"><div class="row"><div class="grow"><div class="ttl">Escrever faz bem</div><div class="small muted">${s?`${ic("flame")} ${plural(s,"dia seguido","dias seguidos")}`:"Comece hoje: duas linhas bastam."}</div></div><button class="btn sm" data-a="diarioNovo">${ic("pencil")} Escrever</button></div>
      <div class="row" style="gap:4px;margin-top:12px">${ult.map(d=>`<i title="${fdate(d)}" style="flex:1;height:8px;border-radius:4px;background:${D.has(d)?"var(--brand)":"var(--sf3)"}"></i>`).join("")}</div><div class="tiny faint" style="margin-top:4px">Últimos 14 dias</div>
      <div class="prompt">“${esc(promptDia())}”</div><button class="lk small" data-a="pNext">${ic("refresh-cw")} Outra pergunta</button></div>`;
    h+=L.length?`<div class="grp">Registros</div>`+L.map(n=>{const H=HUMOR.find(x=>x[0]===n.humor);return `<button class="item entry" style="width:100%;text-align:left;display:block" data-a="ntEdit" data-id="${n.id}"><div class="row"><b class="grow">${esc(flong(n.d))}</b>${H?`<span title="${H[2]}">${H[1]}</span>`:""}</div><p class="small muted">${esc((n.txt||"").slice(0,220))}${(n.txt||"").length>220?"…":""}</p></button>`;}).join(""):"";}
  else h+=L.length?L.map(n=>`<button class="item entry" style="width:100%;text-align:left;display:block" data-a="ntEdit" data-id="${n.id}"><b>${esc(n.t||"Sem título")}</b><p class="small muted">${esc((n.txt||"").slice(0,160))}${(n.txt||"").length>160?"…":""}</p><span class="tiny faint">${esc(fshort(n.d))}</span></button>`).join(""):empty("notebook-pen","Nenhuma nota ainda","Ideias, listas, lembretes: toque no + para anotar.");
  return `<div class="app">${h}</div>${fab(tb==="diario"?"diarioNovo":"ntNew",tb==="diario"?"Escrever no diário":"Nova nota")}`;};
ACT.ntTab=el=>{VIEW.tab=el.dataset.v;rr();};ACT.pNext=()=>{VIEW.pOff=(VIEW.pOff||0)+1;rr();};
ACT.ntEdit=el=>{const n=getD(el.dataset.id);n.tipo==="diario"?diarioForm(n):notaForm(n);};
ACT.ntNew=()=>notaForm(null);
function notaForm(n){sheet(`<h2>${n?"Editar nota":"Nova nota"}</h2><label class="fld"><span>Título</span><input id="nT" value="${esc(n?n.t:"")}" placeholder="Ex.: Ideias para o fim de semana" autofocus></label><label class="fld"><span>Texto</span><textarea id="nX" class="tall">${esc(n?n.txt:"")}</textarea></label>
  <div class="btns"><button class="btn full" id="nS">Salvar nota</button>${n?`<button class="btn danger full" id="nD">Apagar</button>`:""}</div>`,s=>{
  s.querySelector("#nS").onclick=()=>{const t=s.querySelector("#nT").value.trim(),x=s.querySelector("#nX").value.trim();if(!t&&!x)return;const d=n||{id:"nota_"+nid(),c:"nota",tipo:"nota",d:TODAY()};Object.assign(d,{t,txt:x});save(d);closeSheet();rr();};
  const dd=s.querySelector("#nD");if(dd)dd.onclick=()=>{removeDoc(n.id);closeSheet();rr();};});}

/* ================= MÓDULOS ================= */
VIEWS.mods=()=>{const ym=TODAY().slice(0,7);const gm=sum(all("exp").filter(e=>(e.d||"").startsWith(ym)).map(e=>e.v));const ab=all("conta").filter(c=>c.status!=="paga");const est=Math.round(sum(estSemana().map(e=>e.min)));
  const T=[["estudos","graduation-cap","Timer de estudos",est?est+" min nesta semana":"Foco com cronômetro","#6D4AE0"],["gastos","wallet","Planilha de gastos",MESES[new Date().getMonth()]+": "+money(gm),"#E8701E"],["contas","receipt","Contas a pagar e a receber",ab.length?plural(ab.length,"conta em aberto","contas em aberto"):"Tudo em dia","#0F7A63"],["notas","notebook-pen","Anotações e diário",diarioSeq()?diarioSeq()+" dias escrevendo":"Escreva e desabafe","#9A3242"],["mantras","sparkles","Mantras","Manifestação diária","#D4890F"],["ajustes","settings","Ajustes e backup","Tema, cópia de segurança","#0A4A3F"]];
  return `<div class="app">${tabTop("Módulos")}<div class="mgrid2">${T.map(([v,i,n,d,c])=>`<button class="tile" style="--c1:${c}" data-a="go" data-v="${gv({v})}"><span class="mb">${ic(i)}</span><span><b style="display:block">${esc(n)}</b><span class="small">${esc(d)}</span></span></button>`).join("")}</div></div>`;};

/* ================= AJUSTES E BACKUP ================= */
VIEWS.ajustes=()=>{const c=cfg();const ub=c.ultBackup;
  let h=topbar("Ajustes");
  h+=`<div class="card row">${AVA}<div class="grow"><b style="font-family:var(--disp);font-size:1.1rem">Anael Up!</b><div class="small muted">Seus dados ficam guardados neste aparelho.</div></div></div>`;
  h+=`<div class="sec"><h2>Tema</h2></div>${palHTML()}`;
  h+=`<div class="sec"><h2>Cópia de segurança</h2></div><div class="card"><p class="small muted" style="margin-top:0">Se trocar ou formatar o celular, os dados vão junto só se você tiver um backup. Guarde o arquivo no Google Drive ou no WhatsApp.</p>
    <div class="small" style="margin-bottom:10px">${ub?"Último backup: "+fdate(ub):"<b style='color:var(--no)'>Você ainda não fez nenhum backup.</b>"}</div>
    <div class="btns h" style="margin-top:0"><button class="btn" data-a="bkExp">${ic("download")} Salvar backup</button><button class="btn ghost" data-a="bkImp">${ic("cloud-upload")} Restaurar</button></div></div>`;
  h+=`<div class="sec"><h2>Avisos</h2></div><div class="card"><p class="small muted" style="margin-top:0">O app avisa de compromissos, contas e do fim do estudo enquanto estiver aberto ou em segundo plano.</p><button class="btn ghost" data-a="notifOn">${ic("bell")} ${("Notification" in window&&Notification.permission==="granted")?"Avisos ligados":"Permitir avisos"}</button></div>`;
  h+=`<div class="sec"><h2>Instalar no celular</h2></div><div class="note">${ic("info")}<div><b>Android:</b> no Chrome, menu ⋮ → Instalar app.<br><b>iPhone:</b> no Safari, Compartilhar → Adicionar à Tela de Início.</div></div>`;
  return `<div class="app">${h}</div>`;};
ACT.cfgTema=el=>{const c=cfg();c.tema=el.dataset.v;save(c);applyTheme();rr();};
ACT.notifOn=async()=>{try{await Notification.requestPermission();}catch(e){}rr();};
ACT.bkExp=()=>{const docs=[...DB.values()];baixar(new Blob([JSON.stringify({app:"anael-up",v:1,em:new Date().toISOString(),docs})],{type:"application/json"}),"anael-up-backup-"+TODAY()+".json");const c=cfg();c.ultBackup=TODAY();save(c);rr();toast("download","Backup salvo","Guarde o arquivo num lugar seguro.");};
ACT.bkImp=()=>{const i=document.createElement("input");i.type="file";i.accept=".json,application/json";i.onchange=async()=>{try{const o=JSON.parse(await i.files[0].text());if(!o||!Array.isArray(o.docs))throw 0;
  confirmSheet("Restaurar este backup?",`${o.docs.length} registros de ${o.em?fdate(o.em.slice(0,10)):"data desconhecida"}. Os dados atuais com o mesmo registro serão substituídos.`,"Restaurar",()=>{o.docs.forEach(d=>d&&d.id&&save(d));applyTheme();render();toast("circle-check","Backup restaurado",o.docs.length+" registros");});}
  catch(e){toast("triangle-alert","Arquivo inválido","Escolha um backup do Anael Up!");}};i.click();};
function lembreteBackup(){const c=cfg();const n=DB.size;if(n<15)return;const ub=c.ultBackup;if(ub&&diasAte(ub)>-30)return;if(c.bkAviso===TODAY())return;c.bkAviso=TODAY();save(c);
  setTimeout(()=>toast("download","Hora de um backup","Ajustes → Salvar backup. Leva 5 segundos."),2500);}

/* ================= INICIAR ================= */
async function boot(){await loadDB();applyTheme();cfg();
  $("splash").classList.add("hidden");$("main").classList.remove("hidden");$("nav").classList.remove("hidden");
  history.pushState(null,"");history.pushState(null,"");render();if(ESTUDO)estLoop();
  setInterval(()=>{tickAvisos();tickContas();},30000);setTimeout(()=>{tickAvisos();tickContas();},3000);lembreteBackup();
  let dia=TODAY();document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!PL){if(TODAY()!==dia){dia=TODAY();VIEW.per=null;}if(!$("sheet").classList.contains("hidden"))return;rr();}});}
boot();
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
