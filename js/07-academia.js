"use strict";
/* ================= ACADEMIA · calendário com foto de cada treino ================= */
const TREINOS=["Peito","Costas","Pernas","Ombros","Bíceps","Tríceps","Abdômen","Glúteos","Cardio","Corrida","Funcional","Alongamento"];
NAVOF.academia="mods";
const treinosDia=d=>all("treino").filter(t=>t.d===d).sort((a,b)=>(a.u||0)-(b.u||0));
const diasTreino=()=>new Set(all("treino").map(t=>t.d));
function treinoSeq(){const D=diasTreino();let d=TODAY();if(!D.has(d))d=addDays(d,-1);let n=0;while(D.has(d)){n++;d=addDays(d,-1);}return n;}
ACT.segm=el=>{el.setAttribute("aria-pressed",el.getAttribute("aria-pressed")==="true"?"false":"true");};

function fotoComprimida(file){return new Promise((res,rej)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const M=900;let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,M/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
  const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);let q=.78,out=c.toDataURL("image/jpeg",q);while(out.length>380000&&q>.4){q-=.08;out=c.toDataURL("image/jpeg",q);}res(out);};img.onerror=rej;img.src=url;});}

function secTreino(){const hj=treinosDia(TODAY());const s=treinoSeq();
  if(hj.length){const t=hj[hj.length-1];return `<div class="sec"><h2>${ic("trophy")} Treino de hoje</h2>${s>1?`<span class="chip honey">${ic("flame")} ${s} dias</span>`:""}</div>
    <button class="card row" style="width:100%;text-align:left" data-a="go" data-v="${gv({v:"academia"})}">${t.foto?`<img src="${t.foto}" alt="" style="width:56px;height:56px;border-radius:12px;object-fit:cover">`:`<span class="mb">${ic("check")}</span>`}<span class="grow"><b>Treino feito!</b><span class="small muted" style="display:block">${esc((t.tipos||[]).join(", ")||"Treino")}${t.min?` · ${t.min} min`:""}</span></span></button>`;}
  return `<div class="sec"><h2>${ic("trophy")} Academia</h2>${s?`<span class="chip honey">${ic("flame")} ${s} dias</span>`:""}</div>
   <div class="card row"><span class="grow small muted">Treinou hoje? Registre com uma foto e veja seu mês se encher.</span><button class="btn sm" data-a="trNovo">${ic("plus")} Registrar</button></div>`;}

VIEWS.academia=()=>{const n=new Date(),y=VIEW.y??n.getFullYear(),m=VIEW.m??n.getMonth(),ym=y+"-"+pad(m+1),t=TODAY();
  const L=all("treino");const mes=L.filter(x=>x.d.startsWith(ym));const dm=new Set(mes.map(x=>x.d));const ano=new Set(L.filter(x=>x.d.startsWith(y+"-")).map(x=>x.d));
  let h=topbar("Academia");
  h+=`<div class="card"><div class="row" style="justify-content:space-around;text-align:center">
    <div><b class="big" style="display:block">${dm.size}</b><span class="small muted">dias em ${MESES[m].toLowerCase()}</span></div>
    <div><b class="big" style="display:block;color:var(--honey)">${treinoSeq()}</b><span class="small muted">dias seguidos</span></div>
    <div><b class="big" style="display:block">${ano.size}</b><span class="small muted">dias em ${y}</span></div></div></div>`;
  h+=`<div class="card" style="margin-top:10px">${calNav(y,m,"trNav")}${monthGrid(y,m,(d,nn)=>{const ts=treinosDia(d);const f=ts.find(x=>x.foto);
    if(!ts.length)return `<button class="day ${d===t?"td":""}" data-a="trDia" data-d="${d}" aria-label="Dia ${nn}">${nn}</button>`;
    return `<button class="day" data-a="trDia" data-d="${d}" aria-label="Dia ${nn}: ${ts.length} treino" style="${f?`background:url('${f.foto}') center/cover;color:#fff;text-shadow:0 1px 3px #000;border:2px solid var(--honey)`:"background:var(--honey);color:#fff;border-color:transparent"}">${nn}${ts.length>1?`<span class="nc" style="color:#fff">${ts.length}</span>`:""}</button>`;})}
    <div class="tiny faint" style="margin-top:8px">Toque num dia para ver o treino ou registrar.</div></div>`;
  const rec=L.slice().sort((a,b)=>b.d.localeCompare(a.d)||(b.u||0)-(a.u||0)).slice(0,8);
  h+=`<div class="sec"><h2>Últimos treinos</h2></div>`;
  h+=rec.length?rec.map(trCard).join(""):empty("trophy","Nenhum treino ainda","Toque no + depois do treino e tire uma foto.");
  return `<div class="app">${h}</div>${fab("trNovo","Registrar treino")}`;};
function trCard(x){return `<button class="item" style="width:100%;text-align:left" data-a="trEdit" data-id="${x.id}">${x.foto?`<img src="${x.foto}" alt="" style="width:64px;height:64px;border-radius:12px;object-fit:cover;flex:none">`:`<span class="mb">${ic("trophy")}</span>`}
  <span class="ibody"><b>${esc((x.tipos||[]).join(", ")||"Treino")}</b><span class="meta"><span class="chip">${esc(fshort(x.d))}</span>${x.min?`<span class="chip">${ic("clock")} ${x.min} min</span>`:""}</span>${x.nota?`<span class="small muted ell" style="display:block;margin-top:4px">${esc(x.nota)}</span>`:""}</span></button>`;}
ACT.trNav=el=>{let y=VIEW.y??new Date().getFullYear(),m=(VIEW.m??new Date().getMonth())+ +el.dataset.d;if(m<0){m=11;y--;}if(m>11){m=0;y++;}VIEW.y=y;VIEW.m=m;rr();};
ACT.trDia=el=>{const d=el.dataset.d,ts=treinosDia(d);if(!ts.length)return trForm(null,d);
  sheet(`<h2>${esc(flong(d))}</h2>${ts.map(x=>`${x.foto?`<img src="${x.foto}" alt="Foto do treino" style="width:100%;border-radius:16px;margin:10px 0">`:""}<div class="row"><b class="grow">${esc((x.tipos||[]).join(", ")||"Treino")}</b>${x.min?`<span class="chip">${x.min} min</span>`:""}<button class="lk" data-a="trEdit" data-id="${x.id}">${ic("pencil")} Editar</button></div>${x.nota?`<p class="small muted" style="white-space:pre-wrap">${esc(x.nota)}</p>`:""}`).join(`<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`)}
   <div class="btns"><button class="btn ghost full" data-a="trNovoDia" data-d="${d}">${ic("plus")} Outro treino neste dia</button></div>`);};
ACT.trNovoDia=el=>trForm(null,el.dataset.d);
ACT.trNovo=()=>trForm(null,TODAY());
ACT.trEdit=el=>trForm(getD(el.dataset.id));
function trForm(x,dia){let foto=x?x.foto:"";const sel=new Set(x?x.tipos||[]:[]);
  sheet(`<h2>${x?"Editar treino":"Registrar treino"}</h2>
   <div id="trF" style="margin-top:10px">${foto?`<img src="${foto}" alt="" style="width:100%;border-radius:16px">`:`<div class="note" style="justify-content:center;padding:26px">${ic("download")} Sem foto ainda</div>`}</div>
   <div class="btns h" style="margin-top:10px"><label class="btn ghost">${ic("camera")} Tirar foto<input type="file" accept="image/*" capture="environment" id="trCam" hidden></label><label class="btn ghost">${ic("image")} Galeria<input type="file" accept="image/*" id="trGal" hidden></label></div>
   ${foto?`<button class="lk small" id="trSemFoto" style="margin-top:8px">Remover foto</button>`:""}
   <div class="fld"><span>O que treinou?</span><div class="seg">${TREINOS.map(t=>`<button type="button" data-a="segm" data-v="${t}" aria-pressed="${sel.has(t)}">${t}</button>`).join("")}</div></div>
   <label class="fld"><span>Duração (min)</span><input id="trMin" type="number" inputmode="numeric" value="${x&&x.min?x.min:""}" placeholder="Ex.: 60"></label>
   <label class="fld"><span>Dia</span><input id="trD" type="date" value="${x?x.d:dia||TODAY()}"></label>
   <label class="fld"><span>Exercícios e anotações</span><textarea id="trN" placeholder="Ex.: Supino 4x10 com 30 kg">${esc(x?x.nota:"")}</textarea></label>
   <div class="btns"><button class="btn full" id="trS">${ic("check")} Salvar treino</button>${x?`<button class="btn danger full" id="trX">Apagar</button>`:""}</div>`,s=>{
   const onF=async inp=>{const f=inp.files&&inp.files[0];if(!f)return;try{foto=await fotoComprimida(f);s.querySelector("#trF").innerHTML=`<img src="${foto}" alt="" style="width:100%;border-radius:16px">`;}catch(e){toast("triangle-alert","Não consegui abrir a foto","Tente outra imagem.");}};
   s.querySelector("#trCam").onchange=e=>onF(e.target);s.querySelector("#trGal").onchange=e=>onF(e.target);
   const sf=s.querySelector("#trSemFoto");if(sf)sf.onclick=()=>{foto="";s.querySelector("#trF").innerHTML=`<div class="note" style="justify-content:center;padding:26px">Sem foto</div>`;sf.remove();};
   s.querySelector("#trS").onclick=()=>{const tipos=qa('.seg [aria-pressed="true"]',s).map(b=>b.dataset.v);const d=s.querySelector("#trD").value||TODAY();
     const o=x||{id:"treino_"+nid(),c:"treino"};Object.assign(o,{d,foto,tipos,min:Math.round(+s.querySelector("#trMin").value||0),nota:s.querySelector("#trN").value.trim()});save(o);
     VIEW.y=+d.slice(0,4);VIEW.m=+d.slice(5,7)-1;closeSheet();rr();const q=treinoSeq();toast("trophy","Treino registrado!",q>1?q+" dias seguidos. Bora!":"Mandou bem, "+NOME+".");};
   const xx=s.querySelector("#trX");if(xx)xx.onclick=()=>confirmSheet("Apagar este treino?","A foto também sai.","Apagar",()=>{removeDoc(x.id);rr();});});}

/* liga a academia ao Início e aos Módulos */
(function(){const H=VIEWS.home;VIEWS.home=()=>{const per=periodo();let h=H();if(per==="noite")return h;const alvo=`<div class="sec"><h2>${ic("wallet")} Gasto rápido</h2>`;return h.includes(alvo)?h.replace(alvo,secTreino()+alvo):h;};
  const M=VIEWS.mods;VIEWS.mods=()=>{const n=diasTreino();const ym=TODAY().slice(0,7);const dm=[...n].filter(d=>d.startsWith(ym)).length;
    const tile=`<button class="tile" style="--c1:#E2551B" data-a="go" data-v="${gv({v:"academia"})}"><span class="mb">${ic("trophy")}</span><span><b style="display:block">Academia</b><span class="small">${dm?dm+" dias treinados no mês":"Treinos com foto"}</span></span></button>`;
    return M().replace('<div class="mgrid2">','<div class="mgrid2">'+tile);};})();
