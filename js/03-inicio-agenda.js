"use strict";
/* ================= INÍCIO · muda com os 3 turnos ================= */
function greet(){return {manha:"Bom dia",tarde:"Boa tarde",noite:"Boa noite"}[periodo()];}
function periodo(){if(VIEW.per)return VIEW.per;const h=new Date().getHours();return h>=5&&h<12?"manha":h>=12&&h<18?"tarde":"noite";}
const PER={manha:{n:"Manhã",ic:"sunrise",d:"hora de se alinhar e começar com calma"},tarde:{n:"Tarde",ic:"sun",d:"hora de executar, um passo de cada vez"},noite:{n:"Noite",ic:"moon",d:"hora de desacelerar e fechar o dia"}};
ACT.perSel=el=>{VIEW.per=el.dataset.v;rr();};

VIEWS.home=()=>{const per=periodo(),P=PER[per];
  let h=`<div class="hhead">${AVA}<div class="grow"><b style="font-family:var(--disp);font-size:1.15rem">Anael Up!</b><div class="date">${esc(flong(TODAY()))}</div></div>
    <button class="ib" data-a="theme" aria-label="Cores do app">${ic("sparkles")}</button></div>
   <div class="perh per-${per}"><div class="hello">${greet()}, ${NOME}.</div><div class="sub">${ic(P.ic)} ${P.n}: ${P.d}</div>
    <div class="perseg">${Object.entries(PER).map(([k,v])=>`<button data-a="perSel" data-v="${k}" aria-pressed="${k===per}">${ic(v.ic)} ${v.n}</button>`).join("")}</div></div>`;
  h+=secAvisos();
  const S={manha:[secMed,secMantra,()=>secAgenda(false),secGasto,secHab,secEstudoMini,secDiarioMini],
           tarde:[secMed,()=>secAgenda(false),secGasto,secEstudoMini,secHab,secMantra,secDiarioMini],
           noite:[secDiarioNoite,secMed,secHab,secGasto,()=>secAgenda(true),secMantra]}[per];
  h+=S.map(f=>f()).join("");
  return `<div class="app">${h}<div class="foot">Anael Up! · um pouco por dia</div></div>`;};

/* avisos: só quando algo pede ação */
function secAvisos(){const A=[];const t=TODAY();
  const ct=all("conta").filter(c=>c.status!=="paga"&&c.venc&&diasAte(c.venc)<=1);
  ct.slice(0,3).forEach(c=>{const n=diasAte(c.venc);A.push([c.tipo==="receber"?"arrow-down-left":"arrow-up-right",(c.tipo==="receber"?"Receber: ":"Pagar: ")+c.desc+" · "+money(c.valor),n<0?"Vencida":n===0?"Hoje":"Amanhã",n<0?"no":"wait",{v:"contas",tab:c.tipo}]);});
  if(ESTUDO)A.unshift(["timer","Estudando: "+ESTUDO.mat,"Em andamento","honey",{v:"estudos"}]);
  if(!A.length)return"";
  return `<div style="margin-top:12px">${A.map(([i,t,s,k,v])=>`<button class="item" style="width:100%;align-items:center" data-a="go" data-v="${gv(v)}"><span class="mb" style="width:32px;height:32px">${ic(i)}</span><span class="ibody ell"><b class="ell">${esc(t)}</b></span><span class="chip ${k}">${esc(s)}</span></button>`).join("")}</div>`;}

/* ================= AGENDA (mantida como no Moving Up) ================= */
const EVC=[["trab","Trabalho","#3B82F6"],["estudo","Estudos","#8B5CF6"],["pess","Pessoal","#EC4899"],["saude","Saúde","#10B981"],["treino","Treino","#F97316"],["fe","Fé","#0E9F8E"]];
const evCol=k=>(EVC.find(x=>x[0]===k)||EVC[2])[2];
const evNome=k=>(EVC.find(x=>x[0]===k)||EVC[2])[1];
function secAgenda(amanha){const t=amanha?addDays(TODAY(),1):TODAY();const ev=all("ev").filter(e=>e.d===t).sort((a,b)=>(a.h||"").localeCompare(b.h||""));
  let h=`<div class="sec"><h2>${ic("calendar-days")} ${amanha?"Amanhã":"Agenda de hoje"}</h2><button class="lk" data-a="tab" data-v="${gv({v:"cal"})}">Abrir agenda</button></div>`;
  h+=ev.length?ev.map(evCard).join(""):`<div class="note">${ic("calendar")} ${amanha?"Nada marcado para amanhã.":"Nada marcado para hoje."} <button class="lk" data-a="evNew" style="margin-left:auto">${ic("plus")} Marcar</button></div>`;return h;}
function evCard(e){return `<div class="item" style="border-left:5px solid ${evCol(e.cat)}"><button class="ibody" data-a="evEdit" data-id="${e.id}"><b>${esc(e.t)}</b><div class="meta">${e.h?`<span class="chip">${ic("clock")} ${esc(e.h)}</span>`:""}<span class="chip" style="color:${evCol(e.cat)}">${esc(evNome(e.cat))}</span>${e.local?`<span class="chip">${ic("map-pin")} ${esc(e.local)}</span>`:""}</div>${e.nota?`<p class="small muted" style="margin:6px 0 0">${esc(e.nota)}</p>`:""}</button></div>`;}
VIEWS.cal=()=>{const n=new Date(),y=VIEW.y??n.getFullYear(),m=VIEW.m??n.getMonth(),t=TODAY(),sel=VIEW.sel||t,flt=VIEW.flt||"";
  let h=tabTop("Agenda",`<button class="ib" data-a="calToday" aria-label="Ir para hoje">${ic("sun-medium")}</button>`);
  h+=`<div class="tabs"><button data-a="calFlt" data-v="" aria-pressed="${!flt}">Tudo</button>${EVC.map(c=>`<button data-a="calFlt" data-v="${c[0]}" aria-pressed="${flt===c[0]}"><span class="sw" style="display:inline-block;background:${c[2]};margin-right:6px"></span>${c[1]}</button>`).join("")}</div>`;
  const D=medDias();
  h+=calNav(y,m,"calNav")+monthGrid(y,m,(d,nn)=>{const evs=all("ev").filter(e=>e.d===d&&(!flt||e.cat===flt));const ct=flt?[]:all("conta").filter(c=>c.status!=="paga"&&c.venc===d);const nc=evs.length+ct.length;
    const bc=evs.length?evCol(evs[0].cat):ct.length?(ct[0].tipo==="receber"?"#2F7D4F":"#B42318"):"";const dots=[];if(!flt&&D.has(d))dots.push("#B7791F");
    return `<button class="day ${nc?"busy":""} ${d===sel?"sel":""} ${d===t?"td":""}" ${nc?`style="--bc:${bc}"`:""} data-a="calSel" data-d="${d}" aria-label="${nn}, ${nc} compromissos">${nn}${nc>1?`<span class="nc">${nc}</span>`:""}<span class="dots">${dots.map(c=>`<i style="background:${c}"></i>`).join("")}</span></button>`;});
  h+=`<div class="tiny faint" style="margin-top:8px">${ic("circle")} Pontinho dourado: dia em que você meditou.</div>`;
  const evs=all("ev").filter(e=>e.d===sel&&(!flt||e.cat===flt)).sort((a,b)=>(a.h||"").localeCompare(b.h||""));const ct=flt?[]:all("conta").filter(c=>c.status!=="paga"&&c.venc===sel);
  const gs=sum(all("exp").filter(e=>e.d===sel).map(e=>e.v));
  h+=`<div class="sec"><h2>${esc(flong(sel))}</h2></div>`;
  h+=evs.map(evCard).join("");
  h+=ct.map(c=>`<div class="item" style="border-left:5px solid ${c.tipo==="receber"?"var(--ok)":"var(--no)"}"><button class="ibody" data-a="go" data-v="${gv({v:"contas",tab:c.tipo})}"><div class="row"><b class="grow ell">${c.tipo==="receber"?"A receber":"A pagar"}: ${esc(c.desc)}</b><span class="amt">${money(c.valor)}</span></div></button></div>`).join("");
  if(!flt&&gs)h+=`<div class="note">${ic("wallet")} Gastos do dia: <b>${money(gs)}</b></div>`;
  if(!evs.length&&!ct.length)h+=`<div class="note">Nada marcado neste dia. Toque no + para adicionar um compromisso.</div>`;
  return `<div class="app">${h}</div>${fab("evNew","Novo compromisso")}`;};
ACT.calSel=el=>{VIEW.sel=el.dataset.d;rr();};ACT.calFlt=el=>{VIEW.flt=el.dataset.v;rr();};
ACT.calNav=el=>{let y=VIEW.y??new Date().getFullYear(),m=(VIEW.m??new Date().getMonth())+ +el.dataset.d;if(m<0){m=11;y--;}if(m>11){m=0;y++;}VIEW.y=y;VIEW.m=m;rr();};
ACT.calToday=()=>{const n=new Date();VIEW.y=n.getFullYear();VIEW.m=n.getMonth();VIEW.sel=TODAY();rr();};
const EVF=[{k:"t",l:"Compromisso",auto:1,ph:"Ex.: Consulta no dentista"},{k:"cat",l:"Tipo",type:"select",opts:EVC.map(c=>[c[0],c[1]]),def:"pess"},{k:"d",l:"Dia",type:"date"},{k:"h",l:"Hora (opcional)",type:"time"},{k:"local",l:"Local",ph:"Ex.: Centro"},
  {k:"al",l:"Avisar antes (com o app aberto)",type:"select",opts:[["","Não avisar"],["0","Na hora"],["30","30 min antes"],["60","1 h antes"],["1440","1 dia antes"]],def:""},{k:"nota",l:"Anotações",type:"textarea"}];
function evForm(e){sheet(`<h2>${e?"Editar compromisso":"Novo compromisso"}</h2>${EVF.map(f=>fieldHTML(f,e?e[f.k]:(f.k==="d"?(VIEW.sel||TODAY()):null))).join("")}
  <div class="btns"><button class="btn full" id="eS">${e?"Salvar":"Adicionar à agenda"}</button><button class="btn ghost full" id="eG">${ic("calendar")} Também pôr no Google Agenda</button>${e?`<button class="btn danger full" id="eX">Apagar</button>`:""}</div>`,s=>{
  s.querySelector("#eS").onclick=()=>{const o=readFields(EVF,s);if(!o.t)return toast("triangle-alert","Dê um nome ao compromisso","");o.d=o.d||TODAY();const d=e||{id:"ev_"+nid(),c:"ev"};Object.assign(d,o);d.fired=0;save(d);VIEW.sel=d.d;closeSheet();rr();toast("calendar-days","Compromisso salvo",flong(d.d));};
  s.querySelector("#eG").onclick=()=>{const o=readFields(EVF,s);window.open(gcalURL(o.t||"Compromisso",o.d||TODAY(),o.h||"09:00",o.local,o.nota),"_blank","noopener");};
  const x=s.querySelector("#eX");if(x)x.onclick=()=>{removeDoc(e.id);closeSheet();rr();};});}
ACT.evNew=()=>evForm(null);ACT.evEdit=el=>evForm(getD(el.dataset.id));
/* aviso dos compromissos enquanto o app está aberto */
function tickAvisos(){const now=Date.now();all("ev").forEach(e=>{if(e.al===""||e.al==null||e.fired)return;const[hh,mm]=(e.h||"09:00").split(":").map(Number);const d=pd(e.d);d.setHours(hh,mm);const when=d.getTime()-(+e.al)*60000;
  if(now>=when&&now-when<6*3600e3){e.fired=1;save(e);notify("Compromisso: "+e.t,(e.h?e.h+" · ":"")+flong(e.d));toast("bell",e.t,e.h||"");}});}

/* ================= HÁBITOS ================= */
function streakH(h){let d=TODAY();const D=h.dias||{};if(!D[d])d=addDays(d,-1);let n=0;while(D[d]){n++;d=addDays(d,-1);}return n;}
function secHab(){const t=TODAY();const H=all("hab").sort((a,b)=>(a.o||0)-(b.o||0));
  if(!H.length)return `<div class="sec"><h2>${ic("list-checks")} Hábitos de hoje</h2></div><button class="note" style="width:100%;text-align:left" data-a="tab" data-v="${gv({v:"habitos"})}">${ic("plus")} Crie seus primeiros hábitos: água, leitura, dormir cedo…</button>`;
  const hd=H.filter(z=>z.dias&&z.dias[t]).length;
  return `<div class="sec"><h2>${ic("list-checks")} Hábitos de hoje</h2><button class="lk" data-a="tab" data-v="${gv({v:"habitos"})}">${hd}/${H.length}</button></div><div class="hchips">${H.slice(0,8).map(z=>{const on=!!(z.dias&&z.dias[t]);return `<button class="hchip" data-a="habT" data-id="${z.id}" data-d="${t}"><span class="ck ${on?"on":""}">${ic("check")}</span><span class="grow ${on?"strike":""}">${esc(z.nome)}</span></button>`;}).join("")}</div>`;}
VIEWS.habitos=()=>{const H=all("hab").sort((a,b)=>(a.o||0)-(b.o||0)),t=TODAY();const days=[...Array(7)].map((_,i)=>addDays(t,i-6));
  let h=tabTop("Hábitos");
  const feitos=H.filter(z=>z.dias&&z.dias[t]).length;
  if(H.length)h+=`<div class="card"><div class="row"><div class="grow"><div class="small muted">Hoje</div><div class="big">${feitos} de ${H.length}</div></div><span class="mb" style="width:52px;height:52px">${ic(feitos===H.length?"party-popper":"list-checks")}</span></div><div class="bar"><i style="width:${H.length?feitos/H.length*100:0}%"></i></div></div>`;
  if(!H.length)h+=empty("list-checks","Crie seus hábitos","Marque todo dia e veja a sequência crescer.")+`<div class="grp">Sugestões rápidas</div><div class="wrap">${["Beber 2 L de água","Ler 10 páginas","Dormir antes das 23h","Alongar 10 min","Caminhar 20 min","Sem redes ao acordar","Escrever no diário"].map(s=>`<button class="chip" style="padding:8px 12px" data-a="habSug" data-n="${esc(s)}">${ic("plus")} ${esc(s)}</button>`).join("")}</div>`;
  else h+=`<div class="sec"><h2>Últimos 7 dias</h2></div><div class="card"><div class="row"><div class="grow"></div><div class="hdays">${days.map(d=>`<div class="hd ${d===t?"td":""}">${DSEM[pd(d).getDay()]}<br>${+d.slice(8)}</div>`).join("")}</div></div>
    ${H.map(x=>{const s=streakH(x);return `<div class="hrow"><button class="hn" data-a="habEdit" data-id="${x.id}">${esc(x.nome)}<small>${s>1?`${ic("flame")} ${s} dias seguidos`:`${Object.keys(x.dias||{}).length} checks no total`}</small></button><div class="hdays">${days.map(d=>{const on=!!(x.dias&&x.dias[d]);return `<button class="hc ${on?"on":""}" data-a="habT" data-id="${x.id}" data-d="${d}" aria-label="${esc(x.nome)} em ${fdate(d)}">${ic("check")}</button>`;}).join("")}</div></div>`;}).join("")}</div>`;
  return `<div class="app">${h}</div>${fab("habNew","Novo hábito")}`;};
ACT.habT=el=>{const x=getD(el.dataset.id),d=el.dataset.d;x.dias=x.dias||{};if(x.dias[d])delete x.dias[d];else{x.dias[d]=1;const s=streakH(x);toast("check",x.nome,s>1?s+" dias seguidos":"Feito!");}save(x);rr();};
ACT.habSug=el=>{save({id:"hab_"+nid(),c:"hab",nome:el.dataset.n,o:Date.now(),dias:{}});rr();};
const HF=[{k:"nome",l:"Hábito",auto:1,ph:"Ex.: Beber 2 L de água"}];
function habForm(x){sheet(`<h2>${x?"Editar hábito":"Novo hábito"}</h2>${HF.map(f=>fieldHTML(f,x?x[f.k]:null)).join("")}${x?`<div class="note" style="margin-top:12px">${Object.keys(x.dias||{}).length} checks no total · sequência atual de ${streakH(x)} dias</div>`:""}
  <div class="btns"><button class="btn full" id="hS">${x?"Salvar":"Criar hábito"}</button>${x?`<button class="btn danger full" id="hX">Apagar hábito</button>`:""}</div>`,s=>{
  s.querySelector("#hS").onclick=()=>{const o=readFields(HF,s);if(!o.nome)return toast("triangle-alert","Dê um nome ao hábito","");const d=x||{id:"hab_"+nid(),c:"hab",o:Date.now(),dias:{}};Object.assign(d,o);save(d);closeSheet();rr();};
  const xx=s.querySelector("#hX");if(xx)xx.onclick=()=>confirmSheet("Apagar este hábito?","O histórico dele também sai.","Apagar",()=>{removeDoc(x.id);rr();});});}
ACT.habNew=()=>habForm(null);ACT.habEdit=el=>habForm(getD(el.dataset.id));

/* ================= MANTRAS DE MANIFESTAÇÃO ================= */
const MANTRAS=[
 ["Paz interior",["Eu respiro e escolho a calma.","Eu estou em paz comigo e com o meu caminho.","Nada de fora tira a paz que existe dentro de mim.","Eu solto o que não posso controlar.","Cada respiração me traz de volta para o presente."]],
 ["Amor-próprio",["Eu me trato com a mesma gentileza que ofereço aos outros.","Eu sou suficiente do jeito que sou.","Eu mereço coisas boas, e me permito recebê-las.","Eu me orgulho de cada pequeno passo que dou.","Eu sou a minha melhor companhia."]],
 ["Prosperidade",["O dinheiro chega até mim de forma leve, constante e honesta.","Eu cuido bem dos meus recursos, e eles se multiplicam.","Novas oportunidades se abrem para mim todos os dias.","Eu mereço ganhar bem pelo valor que entrego.","Eu tomo decisões financeiras com clareza e calma."]],
 ["Abundância",["Há mais do que suficiente para mim e para quem eu amo.","A gratidão multiplica o que chega até mim.","Eu atraio pessoas e caminhos que me fazem crescer.","A vida trabalha a meu favor.","Portas se abrem para mim no tempo certo."]],
 ["Saúde",["Meu corpo é forte e se renova a cada dia.","Eu escolho o que me nutre: comida, descanso e boas companhias.","Minha mente está clara e meu corpo está leve.","Eu cuido de mim com carinho e disciplina.","Cada noite de sono me devolve energia."]],
 ["Coragem",["Eu sou capaz de fazer coisas difíceis.","O medo pode vir junto, mas quem decide sou eu.","Cada desafio me deixa mais forte.","Eu confio em mim para começar, mesmo sem saber tudo.","Eu dou o próximo passo, um de cada vez."]]];
function mantraCats(){const M=single("mantras",{own:[],decl:{}});const own=(M.own||[]).filter(Boolean);return own.length?MANTRAS.concat([["Meus",own]]):MANTRAS;}
function mantraDia(cat){const C=mantraCats(),k=Math.floor(pd(TODAY())/864e5);const c=C.find(x=>x[0]===cat)||C[k%C.length];return[c[0],c[1][(k+(VIEW.mOff||0))%c[1].length]];}
function secMantra(){const M=single("mantras",{own:[],decl:{}});const[cat,txt]=mantraDia(VIEW.mCat);const n=(M.decl||{})[TODAY()]||0;
  return `<div class="sec"><h2>${ic("sparkles")} Mantra do dia</h2>${n?`<span class="chip honey">${n}x hoje</span>`:""}</div>
   <div class="mantra"><div class="tabs" style="padding-bottom:2px">${mantraCats().map(([k])=>`<button data-a="mCat" data-c="${esc(k)}" aria-pressed="${k===cat}">${esc(k)}</button>`).join("")}</div><p>“${esc(txt)}”</p>
   <div class="row"><button class="btn sm" data-a="mDecl">${ic("sparkles")} Declarar agora</button><button class="btn ghost sm" data-a="mNext">${ic("refresh-cw")} Outro</button><button class="lk small" style="margin-left:auto" data-a="go" data-v="${gv({v:"mantras"})}">Todos</button></div></div>`;}
ACT.mCat=el=>{VIEW.mCat=el.dataset.c;VIEW.mOff=0;rr();};ACT.mNext=()=>{VIEW.mOff=(VIEW.mOff||0)+1;rr();};
ACT.mDecl=()=>{const M=single("mantras",{own:[],decl:{}});M.decl=M.decl||{};M.decl[TODAY()]=(M.decl[TODAY()]||0)+1;save(M);rr();toast("sparkles","Declarado","Repita em voz alta, sentindo cada palavra.");};
VIEWS.mantras=()=>{const M=single("mantras",{own:[],decl:{}});const tot=sum(Object.values(M.decl||{}));const dias=Object.keys(M.decl||{}).length;
  let h=topbar("Mantras",`<button class="ib" data-a="mAdd" aria-label="Novo mantra">${ic("plus")}</button>`);
  h+=`<div class="card"><div class="row"><div class="grow"><div class="small muted">Declarações</div><div class="big">${tot}</div><div class="small muted">em ${plural(dias,"dia","dias")}</div></div><span class="mb" style="width:52px;height:52px">${ic("sparkles")}</span></div></div>
   <div class="note" style="margin-top:12px">${ic("info")} Leia em voz alta, devagar, e sinta como se já fosse verdade. Toque num mantra para declarar.</div>`;
  mantraCats().forEach(([c,L])=>{h+=`<div class="grp">${esc(c)}</div>`+L.map((t,i)=>`<div class="item"><button class="ibody" data-a="mDecl1" data-t="${esc(t)}"><span style="font-family:var(--disp);font-size:1.02rem">“${esc(t)}”</span></button>${c==="Meus"?`<button class="ib" data-a="mDel" data-i="${i}" aria-label="Apagar">${ic("trash-2")}</button>`:""}</div>`).join("");});
  return `<div class="app">${h}</div>`;};
ACT.mDecl1=el=>{ACT.mDecl();};
ACT.mAdd=()=>sheet(`<h2>Novo mantra</h2><label class="fld"><span>Escreva no presente, como se já fosse real</span><textarea id="mt" placeholder="Ex.: Eu vivo com leveza e propósito."></textarea></label><div class="btns"><button class="btn full" id="mS">Salvar mantra</button></div>`,s=>{
  s.querySelector("#mS").onclick=()=>{const v=s.querySelector("#mt").value.trim();if(!v)return;const M=single("mantras",{own:[],decl:{}});M.own=(M.own||[]).concat(v);save(M);closeSheet();rr();};});
ACT.mDel=el=>{const M=single("mantras",{own:[],decl:{}});M.own.splice(+el.dataset.i,1);save(M);rr();};
