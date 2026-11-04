"use strict";
/* ======================================================================
   MEDITAÇÃO · timers, meditações guiadas com voz e o jardim que cresce
   Cada dia meditado mantém a sequência acesa; cada minuto vale 1 XP.
   ====================================================================== */
const MEDS={
  resp:{n:"Respiração calma",d:"Respirar no ritmo 4 e 6 para desacelerar.",ic:"wind"},
  corpo:{n:"Atenção ao corpo",d:"Relaxar da cabeça aos pés, parte por parte.",ic:"heart-pulse"},
  paz:{n:"Acalmar a mente",d:"Para dias pesados: acolher o que sente.",ic:"heart"},
  grat:{n:"Gratidão",d:"Lembrar do que é bom. Ótima para a noite.",ic:"sparkles"},
  dia:{n:"Começar o dia",d:"Intenção e foco para a manhã.",ic:"sunrise"},
  sono:{n:"Dormir bem",d:"Na cama, para pegar no sono. Termina sem sino.",ic:"moon-star"},
  sil:{n:"Em silêncio",d:"Só o sino no começo e no fim.",ic:"bell"}};
const AMB=[["musica","Música suave"],["chuva","Chuva suave"],["mar","Mar ao longe"],["nada","Sem som de fundo"]];
const VOZES=[["f","Voz feminina"],["m","Voz masculina"]];
const NIVEIS=[[0,"Semente"],[20,"Broto"],[60,"Muda"],[120,"Folhinhas"],[200,"Planta firme"],[320,"Primeira flor"],[480,"Jardim florido"],[680,"Árvore jovem"],[950,"Árvore frondosa"],[1300,"Bosque"],[1800,"Mestre zen"]];

/* ---------- números do jogo ---------- */
const medSess=()=>all("med").sort((a,b)=>(a.d+(a.h||"")).localeCompare(b.d+(b.h||"")));
const medDias=()=>new Set(medSess().map(s=>s.d));
const medHoje=()=>medDias().has(TODAY());
function medStreak(){const D=medDias();let d=TODAY();if(!D.has(d))d=addDays(d,-1);let n=0;while(D.has(d)){n++;d=addDays(d,-1);}return n;}
function medBest(){const D=[...medDias()].sort();let b=0,c=0,prev=null;D.forEach(d=>{c=prev&&addDays(prev,1)===d?c+1:1;b=Math.max(b,c);prev=d;});return b;}
const medMin=()=>sum(medSess().map(s=>s.min));
const medXP=()=>Math.round(medMin()+5*medSess().filter(s=>s.ok).length);
function nivel(xp){let i=0;NIVEIS.forEach((n,k)=>{if(xp>=n[0])i=k;});const nx=NIVEIS[i+1];return{i,nome:NIVEIS[i][1],xp,prox:nx?nx[1]:null,falta:nx?nx[0]-xp:0,frac:nx?(xp-NIVEIS[i][0])/(nx[0]-NIVEIS[i][0]):1};}
const BADGES=[
  ["first","Primeira semente","1ª meditação","leaf",S=>S.n>=1],
  ["s3","3 dias seguidos","Sequência de 3","flame",S=>S.best>=3],
  ["s7","Uma semana","Sequência de 7","flame",S=>S.best>=7],
  ["s21","21 dias","Hábito formado","flame",S=>S.best>=21],
  ["s30","Mês inteiro","Sequência de 30","trophy",S=>S.best>=30],
  ["m100","100 minutos","Total meditado","hourglass",S=>S.min>=100],
  ["m500","500 minutos","Total meditado","hourglass",S=>S.min>=500],
  ["m1000","1000 minutos","Total meditado","medal",S=>S.min>=1000],
  ["exp","Explorador","Fez as 4 guiadas","star",S=>["resp","corpo","paz","grat"].every(t=>S.tipos.has(t))],
  ["manha","Madrugador","Meditou antes das 9h","sunrise",S=>S.manha],
  ["noite","Coruja serena","Meditou depois das 21h","moon-star",S=>S.noite],
  ["longa","Mergulho fundo","15 min ou mais","waves",S=>S.longa],
  ["dupla","Dose dupla","2 no mesmo dia","sparkles",S=>S.dupla]];
function medStats(){const L=medSess();const porDia={};L.forEach(s=>porDia[s.d]=(porDia[s.d]||0)+1);
  return{n:L.length,best:medBest(),min:medMin(),tipos:new Set(L.map(s=>s.tipo)),manha:L.some(s=>+(s.h||"12").slice(0,2)<9),noite:L.some(s=>+(s.h||"12").slice(0,2)>=21),longa:L.some(s=>s.ok&&s.alvo>=15),dupla:Object.values(porDia).some(n=>n>=2)};}
const badgesOn=()=>{const S=medStats();return BADGES.filter(b=>b[4](S)).map(b=>b[0]);};

/* ---------- o jardim (SVG que cresce com o nível) ---------- */
function gardenSVG(st,cls=""){st=clamp(st,0,10);const h=16+st*7.2,top=100-h;let g="";
  g+=`<ellipse cx="60" cy="104" rx="46" ry="9" fill="#9DBE8C" opacity=".55"/><ellipse cx="60" cy="103" rx="30" ry="6" fill="#7FA36F" opacity=".6"/>`;
  if(st===0)return `<svg viewBox="0 0 120 120" class="${cls}" role="img" aria-label="Semente">${g}<ellipse cx="60" cy="99" rx="7" ry="5" fill="#9C6B3F"/><path d="M60 95c0-6 3-9 7-10" stroke="#5C9E5B" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="84.5" rx="4" ry="2.3" fill="#7BB37A" transform="rotate(-25 68 84.5)"/></svg>`;
  g+=`<path d="M60 101 C ${58-st*.4} ${100-h*.4}, ${62+st*.3} ${100-h*.7}, 60 ${top}" stroke="#4E8A5A" stroke-width="${2.6+st*.45}" fill="none" stroke-linecap="round"/>`;
  const nl=Math.min(st+1,7);for(let i=1;i<=nl;i++){const y=100-h*(i/(nl+1.2)),s=i%2?1:-1,len=9+st*.9;
    g+=`<ellipse cx="${60+s*len*.62}" cy="${y-2}" rx="${len*.62}" ry="${2.6+st*.25}" fill="${i%2?"#6FAE6A":"#5C9E5B"}" transform="rotate(${s*-28} ${60+s*len*.62} ${y-2})"/>`;}
  if(st>=7){const C=[[0,0,22],[-16,6,15],[16,6,15],[-9,-12,14],[10,-12,14]];g+=C.map(([dx,dy,r],k)=>`<circle cx="${60+dx}" cy="${top+6+dy}" r="${r*(.8+st*.03)}" fill="${["#5E9E73","#7BB37A","#6FAE6A","#4E8A5A","#86BC80"][k]}" opacity=".9"/>`).join("");}
  if(st>=5){const nf=Math.min(st-4,6);const P=[[0,-4],[-14,8],[14,8],[-8,-14],[9,-15],[0,12]];for(let k=0;k<nf;k++){const[dx,dy]=P[k];const cx=60+dx*(st>=7?1:.6),cy=top+(st>=7?6+dy:4+dy*.5);
    g+=[0,72,144,216,288].map(a=>`<ellipse cx="${cx}" cy="${cy-3.2}" rx="2.3" ry="3.6" fill="${k%2?"#E8A0AE":"#F2C26B"}" transform="rotate(${a} ${cx} ${cy})"/>`).join("")+`<circle cx="${cx}" cy="${cy}" r="1.9" fill="#B7791F"/>`;}}
  else if(st>=3)g+=`<ellipse cx="60" cy="${top-1}" rx="3.4" ry="5" fill="#E2A64A"/>`;
  if(st>=10)g=`<circle cx="60" cy="55" r="52" fill="#F2C26B" opacity=".18"/>`+g;
  return `<svg viewBox="0 0 120 120" class="${cls}" role="img" aria-label="Jardim no nível ${st}">${g}</svg>`;}

function weekDots(){const t=TODAY(),D=medDias();const dow=pd(t).getDay();const ini=addDays(t,-((dow+6)%7));
  return `<div class="week" aria-label="Meditações desta semana">${[...Array(7)].map((_,i)=>{const d=addDays(ini,i);return `<div>${DSEM[pd(d).getDay()]}<i class="${D.has(d)?"on":""} ${d===t?"td":""}">${D.has(d)?ic("check"):""}</i></div>`;}).join("")}</div>`;}
function medMsg(){const s=medStreak(),hj=medHoje(),N=nivel(medXP());
  if(hj)return N.prox?`Meditação de hoje feita. Faltam ${N.falta} XP para ${N.prox}.`:"Meditação de hoje feita. Seu jardim está completo.";
  if(s>0)return `Sua sequência de ${plural(s,"dia","dias")} está esperando. Medite hoje para manter a chama acesa.`;
  if(medSess().length)return "Recomece hoje. Bastam 5 minutos para a planta voltar a crescer.";
  return "A primeira semente está pronta. Que tal 5 minutos agora?";}

/* ---------- cartão do Início ---------- */
function secMed(){const c=cfg(),alvo=c.medMin||10,tipo=c.medTipo||"resp",s=medStreak(),hj=medHoje(),N=nivel(medXP());
  return `<div class="medc ${hj?"done":""}" style="margin-top:14px"><div class="row" style="align-items:flex-start">
    <div class="grow"><div class="ttl">${hj?"Você meditou hoje":"Meditar hoje"}</div><div class="small muted" style="margin-top:4px">${esc(medMsg())}</div>
    <div class="row" style="margin-top:8px;gap:12px"><span class="streak">${ic("flame")} ${s}</span><span class="chip honey">${esc(N.nome)}</span></div></div>
    <button class="gard" data-a="tab" data-v="${gv({v:"med"})}" aria-label="Ver jardim">${gardenSVG(N.i)}</button></div>
    ${weekDots()}
    <div class="tbtns">${[5,10,15].map(m=>`<button class="tbtn" data-a="medGo" data-m="${m}"><b>${m}</b><span>minutos</span></button>`).join("")}</div>
    <div class="row" style="margin-top:10px"><span class="small muted grow">${ic(MEDS[tipo].ic)} ${esc(MEDS[tipo].n)}</span><button class="lk" data-a="tab" data-v="${gv({v:"med"})}">Trocar meditação</button></div></div>`;}
ACT.medGo=el=>{const c=cfg();c.medMin=+el.dataset.m;save(c);medStart(c.medTipo||"resp",+el.dataset.m);};

/* ---------- tela Meditar ---------- */
VIEWS.med=()=>{const c=cfg(),alvo=c.medMin||10,tipo=c.medTipo||"resp",amb=c.medAmb||"musica",voz=c.medVoz||"f",N=nivel(medXP()),S=medStats(),on=badgesOn();
  let h=tabTop("Meditar",`<span class="streak" style="font-size:1.05rem">${ic("flame")} ${medStreak()}</span>`);
  h+=`<div class="card"><div class="garden">${gardenSVG(N.i)}<div class="grow"><div class="small muted">Nível ${N.i+1} de ${NIVEIS.length}</div><div class="lvl">${esc(N.nome)}</div>
    <div class="bar" style="--c1:var(--honey)"><i style="width:${N.frac*100}%"></i></div><div class="tiny muted" style="margin-top:5px">${N.xp} XP${N.prox?` · faltam ${N.falta} para ${esc(N.prox)}`:""}</div>
    <div class="tiny faint" style="margin-top:6px">1 minuto meditado = 1 XP. Sessão completa = +5.</div></div></div>${weekDots()}</div>`;
  h+=`<div class="sec"><h2>Quanto tempo?</h2></div><div class="tbtns" style="margin-top:0;grid-template-columns:repeat(4,1fr)">${[5,10,15].map(m=>`<button class="tbtn" data-a="medMin" data-m="${m}" aria-pressed="${alvo===m}"><b>${m}</b><span>min</span></button>`).join("")}
    <button class="tbtn" data-a="medOutro" aria-pressed="${![5,10,15].includes(alvo)}"><b>${![5,10,15].includes(alvo)?alvo:"+"}</b><span>${![5,10,15].includes(alvo)?"min":"outro"}</span></button></div>`;
  h+=`<div class="sec"><h2>Qual meditação?</h2></div><div class="types">${Object.entries(MEDS).map(([k,m])=>`<button class="type" data-a="medTipo" data-v="${k}" aria-pressed="${k===tipo}"><span class="mb">${ic(m.ic)}</span><span class="grow"><b>${esc(m.n)}</b><span class="small muted">${esc(m.d)}</span></span>${k!=="sil"?`<span class="chip">${ic("volume-2")} voz</span>`:""}</button>`).join("")}</div>`;
  h+=`<div class="sec"><h2>Voz que guia</h2></div><div class="seg">${VOZES.map(([k,l])=>`<button data-a="medVoz" data-v="${k}" aria-pressed="${k===voz}">${esc(l)}</button>`).join("")}</div>`;
  h+=`<div class="sec"><h2>Som de fundo</h2></div><div class="seg">${AMB.map(([k,l])=>`<button data-a="medAmb" data-v="${k}" aria-pressed="${k===amb}">${esc(l)}</button>`).join("")}</div>`;
  h+=`<button class="btn honey full" style="margin-top:18px;min-height:56px;font-size:1.05rem" data-a="medStartSel">${ic("play")} Começar ${alvo} min · ${esc(MEDS[tipo].n)}</button>
    <div class="tiny faint" style="text-align:center;margin-top:8px">Use fones se puder. A voz guia você; pode fechar os olhos.</div>`;
  h+=`<div class="sec"><h2>Conquistas</h2><span class="small muted">${on.length}/${BADGES.length}</span></div><div class="badges">${BADGES.map(b=>`<div class="bdg ${on.includes(b[0])?"":"off"}"><span class="mb">${ic(b[3])}</span><b>${esc(b[1])}</b>${esc(b[2])}</div>`).join("")}</div>`;
  const[y,m]=[VIEW.y??new Date().getFullYear(),VIEW.m??new Date().getMonth()],D=medDias();
  h+=`<div class="sec"><h2>Calendário</h2></div><div class="card">${calNav(y,m,"medNav")}${monthGrid(y,m,(d,n)=>`<div class="day ${D.has(d)?"med":""} ${d===TODAY()?"td":""}">${n}</div>`)}
    <div class="row small muted" style="margin-top:12px;justify-content:space-around;text-align:center"><div><b class="big" style="font-size:1.4rem;display:block;color:var(--ink)">${S.n}</b>sessões</div><div><b class="big" style="font-size:1.4rem;display:block;color:var(--ink)">${Math.round(S.min)}</b>minutos</div><div><b class="big" style="font-size:1.4rem;display:block;color:var(--ink)">${S.best}</b>melhor sequência</div></div></div>`;
  return `<div class="app">${h}</div>`;};
ACT.medNav=el=>{let y=VIEW.y??new Date().getFullYear(),m=(VIEW.m??new Date().getMonth())+ +el.dataset.d;if(m<0){m=11;y--;}if(m>11){m=0;y++;}VIEW.y=y;VIEW.m=m;rr();};
ACT.medMin=el=>{const c=cfg();c.medMin=+el.dataset.m;save(c);rr();};
ACT.medTipo=el=>{const c=cfg();c.medTipo=el.dataset.v;save(c);rr();};
ACT.medVoz=el=>{const c=cfg();c.medVoz=el.dataset.v;save(c);rr();};
ACT.medAmb=el=>{const c=cfg();c.medAmb=el.dataset.v;save(c);rr();};
ACT.medOutro=()=>sheet(`<h2>Outro tempo</h2><label class="fld"><span>Minutos (de 1 a 60)</span><input id="mo" type="number" inputmode="numeric" min="1" max="60" value="${cfg().medMin||20}" autofocus></label><div class="btns"><button class="btn full" id="moS">Usar este tempo</button></div>`,s=>{
  s.querySelector("#moS").onclick=()=>{const v=clamp(Math.round(+s.querySelector("#mo").value||10),1,60);const c=cfg();c.medMin=v;save(c);closeSheet();rr();};});
ACT.medStartSel=()=>{const c=cfg();medStart(c.medTipo||"resp",c.medMin||10);};

/* ---------- calendário mensal genérico ---------- */
function calNav(y,m,a){return `<div class="calnav"><button class="ib" data-a="${a}" data-d="-1" aria-label="Mês anterior">${ic("chevron-left")}</button><h3>${MESES[m]} ${y}</h3><button class="ib" data-a="${a}" data-d="1" aria-label="Próximo mês">${ic("chevron-right")}</button></div>`;}
function monthGrid(y,m,cell){const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();let h=`<div class="mgrid">${DSEM.map(d=>`<div class="dh">${d}</div>`).join("")}`;
  for(let i=0;i<first;i++)h+=`<div class="day blank"></div>`;for(let d=1;d<=n;d++)h+=cell(y+"-"+pad(m+1)+"-"+pad(d),d);return h+"</div>";}

/* ======================================================================
   MOTOR DE ÁUDIO · tudo é agendado no relógio do áudio ao começar,
   então a sessão continua tocando mesmo com a tela apagada.
   ====================================================================== */
let MANIF=null;const BUF={};var PL=null;
async function medManifest(){if(!MANIF)MANIF=await (await fetch("assets/med/manifest.json")).json();return MANIF;}
function medPlano(tipo,T,voz){const M=MANIF[voz][tipo],P=voz+"_"+tipo+"_",ev=[];let t=7;
  let intro=M.intro.slice(),fim=M.fim.slice();
  const dur=a=>sum(a.map(c=>c.d+c.p));
  if(dur(intro)+dur(fim)+20>T){intro=intro.slice(0,Math.max(1,Math.floor(intro.length/2)));fim=fim.slice(-1);}
  if(dur(intro)+dur(fim)+12>T){intro=intro.slice(0,1);}
  intro.forEach(c=>{ev.push({at:t,c:P+c.id,txt:c.t});t+=c.d+c.p;});
  const fimIni=T-3-dur(fim);const w0=t+25,w1=fimIni-20;
  if(M.meio.length&&w1>w0){const span=w1-w0;
    if(M.ordem){const n=Math.min(M.meio.length,Math.max(1,Math.floor(span/38)+1));for(let k=0;k<n;k++){const c=M.meio[Math.floor(k*M.meio.length/n)];ev.push({at:w0+(n===1?span/2:k*span/(n-1)),c:P+c.id,txt:c.t});}}
    else{const n=Math.max(1,Math.floor(span/75));const pool=M.meio.slice().sort(()=>Math.random()-.5);for(let k=0;k<n;k++){const c=pool[k%pool.length];ev.push({at:w0+(n===1?span/2:k*span/(n-1)),c:P+c.id,txt:c.t});}}}
  let tf=Math.max(fimIni,t+4);fim.forEach(c=>{ev.push({at:tf,c:P+c.id,txt:c.t});tf+=c.d+c.p;});
  return ev;}
function noiseBuf(ctx,brown){const n=ctx.sampleRate*4,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}
  const f=2000;for(let i=0;i<f;i++){const k=i/f;d[i]=d[i]*k+d[n-f+i]*(1-k);}return b;}
function ambiente(ctx,dest,tipo,musica){const g=ctx.createGain();g.connect(dest);const src=ctx.createBufferSource();src.loop=true;
  if(tipo==="musica"&&musica){src.buffer=musica;src.connect(g);g.gain.value=.55;src.start();return g;}
  if(tipo==="chuva"){src.buffer=noiseBuf(ctx,false);const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1400;const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=300;src.connect(hp).connect(lp).connect(g);g.gain.value=.05;}
  else if(tipo==="mar"){src.buffer=noiseBuf(ctx,true);const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=650;src.connect(lp).connect(g);g.gain.value=.16;
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.085;lg.gain.value=.1;lfo.connect(lg).connect(g.gain);lfo.start();}
  else{src.buffer=noiseBuf(ctx,false);src.connect(g);g.gain.value=.0006;} /* quase mudo: mantém o áudio vivo com a tela apagada */
  src.start();return g;}
async function medStart(tipo,min){if(PL)return;const T=Math.round(min*60);
  const ctx=new (window.AudioContext||window.webkitAudioContext)();
  PL={tipo,min,T,ctx,ev:[],ini:0,fim:false,cap:""};medPlayerUI(true);
  try{await medManifest();const voz=cfg().medVoz||"f",ambT=cfg().medAmb||"musica";const ev=medPlano(tipo,T,voz);PL.ev=ev;const suave=MANIF[voz][tipo].suave;
    if(ambT==="musica"&&!BUF.__mus){const ab=await (await fetch("assets/amb/musica.mp3")).arrayBuffer();BUF.__mus=await new Promise((r,j)=>ctx.decodeAudioData(ab,r,j));}
    const need=[...new Set(ev.map(e=>e.c))];
    await Promise.all(need.map(async k=>{if(!BUF[k]){const ab=await (await fetch("voz-"+k[0]+"/"+k+".mp3")).arrayBuffer();BUF[k]=await new Promise((r,j)=>ctx.decodeAudioData(ab,r,j));}}));
    if(!PL||PL.ctx!==ctx)return;
    await ctx.resume();const t0=ctx.currentTime+.4;PL.ini=t0;
    const master=ctx.createGain();master.connect(ctx.destination);
    const amb=ambiente(ctx,master,ambT,BUF.__mus);const g0=amb.gain.value;amb.gain.setValueAtTime(0.0001,t0);amb.gain.linearRampToValueAtTime(g0,t0+6);amb.gain.setValueAtTime(g0,t0+T-(suave?20:3));amb.gain.linearRampToValueAtTime(0.00001,t0+T+4);
    const vg=ctx.createGain();vg.gain.value=1;vg.connect(master);
    bellAt(ctx,master,t0+.3,suave?.18:.32);
    ev.forEach(e=>{const s=ctx.createBufferSource();s.buffer=BUF[e.c];s.connect(vg);s.start(t0+e.at);});
    if(!suave){bellAt(ctx,master,t0+T,.4);bellAt(ctx,master,t0+T+3.2,.25);}
    const end=ctx.createConstantSource?ctx.createConstantSource():ctx.createOscillator();const eg=ctx.createGain();eg.gain.value=0;end.connect(eg).connect(ctx.destination);end.start(t0);end.stop(t0+T+5);end.onended=()=>medFim(true);
    if("mediaSession" in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:MEDS[tipo].n+" · "+min+" min",artist:"Anael Up!",artwork:[{src:"au-icon-512.png",sizes:"512x512",type:"image/png"}]});
      navigator.mediaSession.setActionHandler("pause",()=>ACT.plPause());navigator.mediaSession.setActionHandler("play",()=>ACT.plPause());}
    try{if(navigator.wakeLock)PL.wl=await navigator.wakeLock.request("screen");}catch(e){}
    PL.tick=setInterval(medTick,250);medTick();
  }catch(e){console.warn(e);medPlayerUI(false);try{ctx.close();}catch(x){}PL=null;toast("triangle-alert","Não consegui carregar o áudio","Abra o app com internet uma vez para baixar as meditações.");}}
function medEl(){return PL?Math.max(0,PL.ctx.currentTime-PL.ini):0;}
function medTick(){if(!PL||!PL.ini)return;const el=medEl(),T=PL.T;const t=$("plT"),r=$("plR"),cp=$("plCap");
  if(t)t.textContent=mmss(T-el);if(r)r.style.strokeDashoffset=String(691*(1-clamp(el/T,0,1)));
  const cur=PL.ev.filter(e=>e.at<=el).pop();const txt=cur&&el-cur.at<(BUF[cur.c]?BUF[cur.c].duration+3:8)?cur.txt:"";if(cp&&cp.dataset.t!==txt){cp.dataset.t=txt;cp.textContent=txt;}
  if(el>=T+4.5)medFim(true);}
function medPlayerUI(on){let d=$("player");if(!on){if(d)d.remove();document.body.style.overflow="";return;}
  if(!d){d=document.createElement("div");d.id="player";d.className="player";document.body.appendChild(d);}document.body.style.overflow="hidden";
  d.innerHTML=`<div><div class="small" style="opacity:.75">${esc(MEDS[PL.tipo].n)} · ${PL.min} min</div><div style="font:700 1.25rem var(--disp);margin-top:4px">Feche os olhos, ${NOME}.</div></div>
   <div class="ring"><div class="orb"></div><svg viewBox="0 0 240 240"><circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/><circle id="plR" cx="120" cy="120" r="110" fill="none" stroke="#E2A64A" stroke-width="6" stroke-linecap="round" stroke-dasharray="691" stroke-dashoffset="691"/></svg><div class="t" id="plT">${mmss(PL.T)}</div></div>
   <div class="cap" id="plCap" aria-live="polite">Preparando a meditação…</div>
   <div class="pb"><button data-a="plStop" aria-label="Encerrar">${ic("square")}</button><button class="main" id="plP" data-a="plPause" aria-label="Pausar">${ic("pause")}</button><button data-a="plVol" aria-label="Som de fundo">${ic("volume-2")}</button></div>`;}
ACT.plPause=async()=>{if(!PL||!PL.ini)return;const b=$("plP");if(PL.ctx.state==="running"){await PL.ctx.suspend();if(b){b.innerHTML=ic("play");b.setAttribute("aria-label","Continuar");}}else{await PL.ctx.resume();if(b){b.innerHTML=ic("pause");b.setAttribute("aria-label","Pausar");}}};
ACT.plVol=()=>toast("volume-2","Volume","Use os botões de volume do celular.");
ACT.plStop=()=>{if(!PL)return;const el=medEl();if(el<60){medFim(false);return;}
  confirmSheet("Encerrar agora?",`Você já meditou ${Math.floor(el/60)} min. Isso conta para o seu dia.`,"Encerrar e salvar",()=>medFim(false));$("sheet").style.zIndex=90;};
function medFim(completo){if(!PL||PL.fim)return;PL.fim=true;const el=Math.min(medEl(),PL.T),P=PL;clearInterval(P.tick);try{P.wl&&P.wl.release();}catch(e){}
  setTimeout(()=>{try{P.ctx.close();}catch(e){}},completo?400:50);PL=null;medPlayerUI(false);$("sheet").style.zIndex="";
  if(el<60){toast("info","Sessão curta não salva","Medite pelo menos 1 minuto para contar.");return;}
  const antes={xp:medXP(),b:badgesOn(),hoje:medHoje()};const now=new Date();
  save({id:"med_"+nid(),c:"med",d:TODAY(),h:pad(now.getHours())+":"+pad(now.getMinutes()),min:Math.round(el/6)/10,alvo:P.min,tipo:P.tipo,ok:completo||el>=P.T-5});
  const xp=medXP(),Na=nivel(antes.xp),N=nivel(xp),nb=badgesOn().filter(b=>!antes.b.includes(b)),s=medStreak();
  render();
  sheet(`<div class="celeb">${gardenSVG(N.i,"gard")}<div class="xp">+${xp-antes.xp} XP</div>
    <h2 style="padding:0;margin-top:4px">${N.i>Na.i?`Subiu de nível: ${esc(N.nome)}!`:completo?`Muito bem, ${NOME}.`:"Valeu a pausa."}</h2>
    <p class="muted">${!antes.hoje?`<span class="streak">${ic("flame")} ${plural(s,"dia seguido","dias seguidos")}</span><br>`:""}${N.prox?`Faltam ${N.falta} XP para ${esc(N.prox)}.`:"Seu jardim está completo."}</p>
    ${nb.length?`<div class="grp" style="margin-top:6px">Nova conquista</div><div class="badges" style="justify-content:center">${BADGES.filter(b=>nb.includes(b[0])).map(b=>`<div class="bdg"><span class="mb">${ic(b[3])}</span><b>${esc(b[1])}</b>${esc(b[2])}</div>`).join("")}</div>`:""}
    <div class="btns"><button class="btn full" data-a="close">Continuar</button>${P.tipo==="paz"?`<button class="btn ghost full" data-a="diarioNovo">${ic("notebook-pen")} Escrever no diário</button>`:""}</div></div>`);
  if(nb.length||N.i>Na.i)bellNow(.25);}
