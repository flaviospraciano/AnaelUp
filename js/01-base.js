"use strict";
/* ================= UTILIDADES ================= */
const NOME="Anael";
const $=id=>document.getElementById(id),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad=n=>String(n).padStart(2,"0");
const iso=d=>{d=d||new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
const TODAY=()=>iso(new Date());
const pd=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);};
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return iso(d);};
const diasAte=d=>Math.round((pd(d)-pd(TODAY()))/864e5);
const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MES3=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DSEM=["D","S","T","Q","Q","S","S"],DSEML=["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
const money=v=>(+v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const num=s=>{s=String(s==null?"":s).trim().replace(/[R$\s]/g,"");if(!s)return 0;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=parseFloat(s);return isNaN(n)?0:Math.round(n*100)/100;};
const fdate=s=>s?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"";
const fshort=s=>s?(+s.slice(8,10))+" "+MES3[+s.slice(5,7)-1]:"";
const flong=s=>{if(!s)return"";const d=pd(s),t=TODAY();const lab=s===t?"Hoje":s===addDays(t,-1)?"Ontem":s===addDays(t,1)?"Amanhã":"";const base=DSEML[d.getDay()]+", "+d.getDate()+" de "+MESES[d.getMonth()].toLowerCase();return lab?lab+", "+base:base[0].toUpperCase()+base.slice(1);};
const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const plural=(n,s,p)=>n+" "+(n===1?s:p);
const normTxt=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const mmss=s=>{s=Math.max(0,Math.round(s));return pad(Math.floor(s/60))+":"+pad(s%60);};
function ic(n,c=""){return `<svg class="i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||ICONS.circle}</svg>`;}
const AVA=`<img class="ava" src="au-avatar.jpg" alt="">`;

/* ================= ARMAZENAMENTO (no aparelho) ================= */
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open("anaelup",1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains("docs"))d.createObjectStore("docs",{keyPath:"id"});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
const idbReq=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
let IDB=null;async function idb(){if(!IDB)IDB=await idbOpen();return IDB;}
const DB=new Map();
const all=c=>[...DB.values()].filter(d=>d.c===c);
const getD=id=>DB.get(id);
function save(doc){doc.u=Date.now();DB.set(doc.id,doc);idb().then(d=>idbReq(d.transaction("docs","readwrite").objectStore("docs").put(JSON.parse(JSON.stringify(doc))))).catch(e=>{console.warn(e);toast("triangle-alert","Não foi possível salvar","Verifique o espaço do aparelho.");});}
function removeDoc(id){DB.delete(id);idb().then(d=>idbReq(d.transaction("docs","readwrite").objectStore("docs").delete(id))).catch(()=>{});}
function single(id,def){let d=DB.get(id);if(!d){d=Object.assign({id,c:"single"},JSON.parse(JSON.stringify(def||{})));DB.set(id,d);}return d;}
const cfg=()=>single("cfg",{tema:"auto",orc:0});
async function loadDB(){try{const d=await idb();const docs=await idbReq(d.transaction("docs").objectStore("docs").getAll());docs.forEach(x=>DB.set(x.id,x));}catch(e){console.warn(e);}}

/* ================= AÇÕES (delegação de eventos) ================= */
const ACT={},CH={};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el)return;const f=ACT[el.dataset.a];if(f){e.preventDefault();f(el,e);}});
document.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.shiftKey)return;const el=e.target.closest("[data-enter]");if(el&&el.tagName!=="TEXTAREA"){e.preventDefault();const f=ACT[el.dataset.enter];if(f)f(el,e);}});
document.addEventListener("input",e=>{const el=e.target.closest("[data-in]");if(el&&CH[el.dataset.in])CH[el.dataset.in](el,e);});
ACT.seg=el=>{const g=el.closest(".seg,.tabs");qa("button",g).forEach(b=>b.setAttribute("aria-pressed",b===el?"true":"false"));};
const segVal=(r,k)=>{const b=r.querySelector(`[data-k="${k}"] [aria-pressed="true"]`);return b?b.dataset.v:"";};

/* ================= NAVEGAÇÃO ================= */
let VIEW={v:"home"};const STACK=[];
const gv=o=>esc(JSON.stringify(o));
function go(v){STACK.push(VIEW);VIEW=v;render();scrollTo(0,0);}
function tab(v){STACK.length=0;VIEW=v;render();scrollTo(0,0);}
function back(){VIEW=STACK.pop()||{v:"home"};render();}
ACT.go=el=>go(JSON.parse(el.dataset.v));ACT.tab=el=>tab(JSON.parse(el.dataset.v));ACT.back=()=>back();
let SAINDO=false;
window.addEventListener("popstate",()=>{if(SAINDO)return;history.pushState(null,"");
  if(window.PL&&!PL.fim){ACT.plStop();return;}
  if(!$("sheet").classList.contains("hidden")){if($("sheet").dataset.sair){closeSheet();return;}closeSheet();return;}
  if(STACK.length){back();return;}
  if(VIEW.v!=="home"){tab({v:"home"});return;}
  sheet(`<h2>Deseja sair?</h2><p class="muted">Tem certeza que quer fechar o Anael Up!?</p><div class="btns"><button class="btn danger full" id="sairY">Sair</button><button class="btn full" data-a="close">Ficar no app</button></div>`,s=>{
    $("sheet").dataset.sair="1";s.querySelector("#sairY").onclick=()=>{SAINDO=true;closeSheet();history.go(-(history.length-1));setTimeout(()=>{try{window.close();}catch(e){}},250);};});});
document.addEventListener("gesturestart",e=>e.preventDefault());document.addEventListener("gesturechange",e=>e.preventDefault());
document.addEventListener("touchmove",e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
document.addEventListener("wheel",e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
let LASTTAP=0;document.addEventListener("touchend",e=>{const n=Date.now();if(n-LASTTAP<300&&!e.target.closest("input,textarea,select,button,[data-a]"))e.preventDefault();LASTTAP=n;},{passive:false});

/* ================= RENDER ================= */
const VIEWS={};let AFTER=[];
const after=f=>AFTER.push(f);
function render(){const f=VIEWS[VIEW.v]||VIEWS.home;AFTER=[];$("view").innerHTML=f();renderNav();AFTER.forEach(x=>{try{x();}catch(e){console.warn(e);}});}
const rr=()=>{const y=scrollY;render();scrollTo(0,y);};
function topbar(t,icon,extra=""){return `<header class="top"><button class="ib" data-a="back" aria-label="Voltar">${ic("chevron-left")}</button><h1>${esc(t)}</h1>${extra}</header>`;}
function tabTop(t,extra=""){return `<header class="top"><h1>${esc(t)}</h1>${extra}</header>`;}
function empty(icon,t,d){return `<div class="empty"><span class="mb">${ic(icon)}</span><b>${esc(t)}</b>${esc(d)}</div>`;}
const fab=(a,l)=>`<button class="fab" data-a="${a}" aria-label="${esc(l)}">${ic("plus")}</button>`;
const NAV=[["home","house","Início"],["med","flame","Meditar"],["cal","calendar-days","Agenda"],["habitos","list-checks","Hábitos"],["mods","layout-grid","Módulos"]];
const NAVOF={home:"home",med:"med",cal:"cal",habitos:"habitos",mods:"mods",gastos:"mods",contas:"mods",estudos:"mods",notas:"mods",mantras:"mods",ajustes:"mods"};
function renderNav(){const cur=NAVOF[VIEW.v]||"home";const pend=!medHoje();
  $("navIn").innerHTML=NAV.map(([k,i,l])=>`<button data-a="tab" data-v="${gv({v:k})}" ${k===cur?'aria-current="page"':""} class="${k==="med"?"med":""}">${ic(i)}${k==="med"&&pend?'<span class="pip" aria-label="meditação de hoje pendente"></span>':""}${l}</button>`).join("");}

/* ================= FOLHA E AVISOS ================= */
function sheet(html,bind){const s=$("sheet");s.innerHTML=`<div class="in" role="dialog" aria-modal="true" style="position:relative"><button class="ib x" data-a="close" aria-label="Fechar">${ic("x")}</button>${html}</div>`;s.classList.remove("hidden");document.body.style.overflow="hidden";
  s.onclick=e=>{if(e.target===s)closeSheet();};if(bind)bind(s.querySelector(".in"));const f=s.querySelector("[autofocus]");if(f)setTimeout(()=>f.focus(),60);}
function closeSheet(){const s=$("sheet");delete s.dataset.sair;s.classList.add("hidden");s.innerHTML="";document.body.style.overflow="";}
ACT.close=()=>closeSheet();
function toast(icon,t,d){const el=document.createElement("div");el.className="toast";el.innerHTML=`${ic(icon)}<div><b>${esc(t)}</b>${d?`<small>${esc(d)}</small>`:""}</div>`;$("toasts").appendChild(el);setTimeout(()=>el.remove(),3200);}
function confirmSheet(t,d,lab,fn){sheet(`<h2>${esc(t)}</h2><p class="muted">${esc(d)}</p><div class="btns"><button class="btn danger full" id="cY">${esc(lab)}</button><button class="btn ghost full" data-a="close">Cancelar</button></div>`,s=>{s.querySelector("#cY").onclick=()=>{closeSheet();fn();};});}

/* ================= FORMULÁRIOS ================= */
function fieldHTML(f,v){const val=v==null?(f.def??""):v;const id="f_"+f.k;
  if(f.type==="select")return `<label class="fld"><span>${esc(f.l)}</span><select id="${id}">${f.opts.map(([k,l])=>`<option value="${esc(k)}" ${String(k)===String(val)?"selected":""}>${esc(l)}</option>`).join("")}</select></label>`;
  if(f.type==="textarea")return `<label class="fld"><span>${esc(f.l)}</span><textarea id="${id}" placeholder="${esc(f.ph||"")}" class="${f.tall?"tall":""}">${esc(val)}</textarea></label>`;
  return `<label class="fld"><span>${esc(f.l)}</span><input id="${id}" type="${f.type||"text"}" ${f.type==="money"?'inputmode="decimal"':""} value="${esc(f.type==="money"&&val!==""?String(val).replace(".",","):val)}" placeholder="${esc(f.ph||"")}" ${f.auto?"autofocus":""}></label>`;}
function readFields(F,s){const o={};F.forEach(f=>{const el=s.querySelector("#f_"+f.k);if(!el)return;let v=el.value;if(f.type==="money"||f.type==="number")v=num(v);else if(typeof v==="string")v=v.trim();o[f.k]=v;});return o;}

/* ================= AVISOS DO NAVEGADOR ================= */
function notify(t,b){try{if("Notification" in window&&Notification.permission==="granted"){navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification(t,{body:b,icon:"au-icon-192.png",badge:"au-icon-192.png"})).catch(()=>new Notification(t,{body:b})):new Notification(t,{body:b});}}catch(e){}}
function gcalURL(t,d,h,local,nota){const s=d.replace(/-/g,"")+"T"+(h||"09:00").replace(":","")+"00";const e=new Date(pd(d).getTime());const[hh,mm]=(h||"09:00").split(":").map(Number);e.setHours(hh+1,mm);const en=iso(e).replace(/-/g,"")+"T"+pad(e.getHours())+pad(e.getMinutes())+"00";
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(t)+"&dates="+s+"/"+en+"&details="+encodeURIComponent(nota||"")+"&location="+encodeURIComponent(local||"");}

/* ================= TEMA ================= */
function applyTheme(){const t=cfg().tema||"auto";document.documentElement.dataset.theme=t;}
function isDark(){const t=cfg().tema;return t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);}
ACT.theme=()=>{const c=cfg();c.tema=isDark()?"light":"dark";save(c);applyTheme();rr();};

/* ================= SINOS (gerados, sem arquivo) ================= */
let ACX=null;function actx(){if(!ACX)ACX=new (window.AudioContext||window.webkitAudioContext)();if(ACX.state==="suspended")ACX.resume();return ACX;}
function bellAt(ctx,dest,when,vol=0.5){const parts=[[1,1,7],[2.76,.45,4.5],[5.4,.22,3],[8.9,.1,2]];const f0=220;
  parts.forEach(([r,g,dec])=>{const o=ctx.createOscillator(),gn=ctx.createGain();o.type="sine";o.frequency.value=f0*r;gn.gain.setValueAtTime(0.0001,when);gn.gain.exponentialRampToValueAtTime(vol*g,when+0.02);gn.gain.exponentialRampToValueAtTime(0.0001,when+dec);o.connect(gn).connect(dest);o.start(when);o.stop(when+dec+.1);});}
function bellNow(v=.45){try{const c=actx();bellAt(c,c.destination,c.currentTime+.05,v);}catch(e){}if(navigator.vibrate)navigator.vibrate([200,100,200]);}
