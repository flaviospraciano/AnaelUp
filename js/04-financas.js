"use strict";
/* ================= GASTOS · o Gasto rápido do Início cai direto aqui ================= */
const CATS=[["Alimentação","#F97316"],["Mercado","#84CC16"],["Transporte","#3B82F6"],["Moradia","#8B5CF6"],["Contas","#06B6D4"],["Saúde","#10B981"],["Educação","#6366F1"],["Lazer","#F59E0B"],["Assinaturas","#A855F7"],["Vestuário","#0EA5E9"],["Cuidados pessoais","#D946EF"],["Doações","#14B8A6"],["Outros","#94A3B8"]];
const PAGS=["Pix","Cartão","Débito","Dinheiro","Boleto","Outro"];
const catCol=c=>(CATS.find(x=>x[0]===c)||CATS[CATS.length-1])[1];
const G_CAT=[["Alimentação",["almoco","jantar","lanche","pizza","restaurante","churrasco","cafe","acai","hamburguer","ifood","sorvete","padaria","comida","marmita","pastel","salgado"]],
  ["Mercado",["supermercado","mercado","feira","atacadao","compras"]],["Transporte",["uber","99","gasolina","combustivel","onibus","passagem","estacionamento","oficina","moto","carro","taxi"]],
  ["Contas",["agua","luz","energia","internet","tim","claro","vivo","oi","telefone","celular","recarga"]],["Moradia",["aluguel","condominio","gas"]],
  ["Saúde",["farmacia","remedio","consulta","exame","dentista","medico","academia","psicologo","terapia"]],["Educação",["curso","livro","apostila","faculdade","concurso","material"]],
  ["Assinaturas",["netflix","spotify","prime","assinatura","youtube","icloud","google one","disney","max"]],["Lazer",["ingresso","cinema","show","parque","festa","viagem","passeio","bar","cerveja","jogo"]],
  ["Vestuário",["bermuda","blusa","camisa","calca","roupa","sapato","tenis","short","cueca","meia"]],["Cuidados pessoais",["perfume","cabelo","barbearia","barba","corte","salao","creme","shampoo"]],["Doações",["oferta","dizimo","doacao"]]];
function gCat(item){const t=" "+normTxt(item)+" ";for(const[c,ks]of G_CAT)if(ks.some(k=>t.includes(" "+k+" ")))return c;return "Outros";}
function lastPag(){const l=all("exp").sort((a,b)=>(b.u||0)-(a.u||0))[0];return l&&l.pag||"Pix";}
function secGasto(){const t=TODAY(),ym=t.slice(0,7),now=new Date();const gm=all("exp").filter(e=>(e.d||"").startsWith(ym));const gH=gm.filter(e=>e.d===t).sort((a,b)=>(b.u||0)-(a.u||0));const pg=lastPag();const orc=+cfg().orc||0,tot=sum(gm.map(e=>e.v));
  return `<div class="sec"><h2>${ic("wallet")} Gasto rápido</h2><button class="lk" data-a="go" data-v="${gv({v:"gastos"})}">${MESES[now.getMonth()]}: ${money(tot)}</button></div>
   <div class="card qg"><div class="qgr"><input id="qgV" inputmode="decimal" placeholder="R$ 0,00" aria-label="Valor" data-enter="qgSave"><input id="qgI" placeholder="Com o quê? Ex.: Almoço" aria-label="Com o quê" data-in="qgCat" data-enter="qgSave"><button class="btn" data-a="qgSave" aria-label="Salvar gasto">${ic("check")}</button></div>
    <div class="seg" data-k="qgP" style="margin-top:10px">${["Pix","Cartão","Débito","Dinheiro"].map(p=>`<button type="button" data-a="seg" data-v="${p}" aria-pressed="${p===pg}">${p}</button>`).join("")}</div>
    <div class="tiny faint" id="qgC" style="margin-top:8px">A categoria é escolhida sozinha pelo nome.</div>
    ${orc?`<div class="bar" style="--c1:${tot>orc?"var(--no)":"var(--brand)"}"><i style="width:${clamp(tot/orc*100,0,100)}%"></i></div><div class="tiny muted" style="margin-top:4px">${tot<=orc?"Restam "+money(orc-tot)+" do orçamento do mês":"Passou "+money(tot-orc)+" do orçamento"}</div>`:""}
    ${gH.length?`<div class="qgl">${gH.slice(0,4).map(e=>`<span>${esc(e.desc)} · <b>${money(e.v)}</b></span>`).join("")}${gH.length>4?`<span>+${gH.length-4}</span>`:""}</div>`:""}</div>`;}
CH.qgCat=el=>{const c=$("qgC");if(c)c.textContent=el.value.trim()?"Categoria: "+gCat(el.value):"A categoria é escolhida sozinha pelo nome.";};
ACT.qgSave=()=>{const v=num($("qgV").value),desc=$("qgI").value.trim();if(!(v>0))return toast("triangle-alert","Digite o valor","Ex.: 25,90");
  const pag=segVal(document,"qgP")||"Pix";save({id:"exp_"+nid(),c:"exp",v,desc:desc||"Gasto",cat:gCat(desc),pag,d:TODAY()});rr();toast("wallet","Gasto salvo na planilha",money(v)+" · "+gCat(desc));};

VIEWS.gastos=()=>{const y=VIEW.y??new Date().getFullYear(),m=VIEW.m??new Date().getMonth(),orc=+cfg().orc||0;
  const ex=all("exp").filter(e=>e.d&&e.d.startsWith(y+"-"));const bm=Array(12).fill(0);ex.forEach(e=>bm[+e.d.slice(5,7)-1]+=+e.v||0);
  const tot=sum(bm),mx=Math.max(...bm,1),used=bm.filter(v=>v>0).length;const mm=ex.filter(e=>+e.d.slice(5,7)-1===m).sort((a,b)=>b.d.localeCompare(a.d)||(b.u||0)-(a.u||0));const mt=bm[m];
  const bc={};mm.forEach(e=>bc[e.cat||"Outros"]=(bc[e.cat||"Outros"]||0)+(+e.v||0));const cats=Object.entries(bc).sort((a,b)=>b[1]-a[1]);
  let h=topbar("Planilha de gastos","",`<button class="ib" data-a="gCSV" aria-label="Exportar planilha">${ic("download")}</button><button class="ib" data-a="gOrc" aria-label="Orçamento mensal">${ic("target")}</button>`);
  h+=`<div class="calnav"><button class="ib" data-a="gYear" data-d="-1" aria-label="Ano anterior">${ic("chevron-left")}</button><h3>${y}</h3><button class="ib" data-a="gYear" data-d="1" aria-label="Próximo ano">${ic("chevron-right")}</button></div>
  <div class="card"><div class="row"><div class="grow"><div class="small muted">Total no ano</div><div class="big">${money(tot)}</div></div><div style="text-align:right"><div class="small muted">Média por mês</div><b>${money(used?tot/used:0)}</b></div></div>
   <div class="mbars" style="margin-top:14px">${bm.map((v,i)=>`<button data-a="gMonth" data-m="${i}" aria-pressed="${i===m}" aria-label="${MESES[i]}: ${money(v)}"><i style="height:${Math.max(4,v/mx*100)}%"></i><span>${MES3[i]}</span></button>`).join("")}</div></div>
  <div class="card" style="margin-top:10px"><div class="small muted">${MESES[m]} de ${y}</div><div class="big">${money(mt)}</div><div class="small muted">${plural(mm.length,"gasto","gastos")}</div>
   ${orc?`<div class="small" style="margin-top:10px">${mt<=orc?"Restam "+money(orc-mt)+" do orçamento de "+money(orc):"Passou "+money(mt-orc)+" do orçamento de "+money(orc)}</div><div class="bar" style="--c1:${mt>orc?"var(--no)":"var(--brand)"}"><i style="width:${clamp(mt/orc*100,0,100)}%"></i></div>`:`<button class="lk small" style="margin-top:8px" data-a="gOrc">${ic("target")} Definir um orçamento mensal</button>`}</div>`;
  if(cats.length)h+=`<div class="card" style="margin-top:10px"><b>Por categoria</b><div class="cbar">${cats.map(([c,v])=>`<i style="width:${v/mt*100}%;background:${catCol(c)}"></i>`).join("")}</div><div class="leg">${cats.map(([c,v])=>`<div><span class="sw" style="background:${catCol(c)}"></span><span class="ell">${esc(c)}</span><em>${money(v)}</em></div>`).join("")}</div></div>`;
  h+=`<div class="grp">Gastos de ${MESES[m].toLowerCase()}</div>`;
  h+=mm.length?mm.map(e=>`<div class="item"><span class="sw" style="width:10px;height:auto;border-radius:5px;background:${catCol(e.cat)}"></span><button class="ibody" data-a="gEdit" data-id="${e.id}"><div class="row"><b class="grow ell">${esc(e.desc||e.cat||"Gasto")}</b><span class="amt">${money(e.v)}</span></div><div class="meta"><span class="chip">${esc(e.cat||"Outros")}</span>${e.pag?`<span class="chip">${esc(e.pag)}</span>`:""}<span class="chip">${fshort(e.d)}</span></div></button></div>`).join("")
    :empty("wallet","Nenhum gasto em "+MESES[m].toLowerCase(),"Use o Gasto rápido no Início ou o + aqui.");
  return `<div class="app">${h}</div>${fab("gNew","Adicionar gasto")}`;};
ACT.gYear=el=>{VIEW.y=(VIEW.y??new Date().getFullYear())+ +el.dataset.d;rr();};ACT.gMonth=el=>{VIEW.m=+el.dataset.m;rr();};
ACT.gNew=()=>gForm(null);ACT.gEdit=el=>gForm(getD(el.dataset.id));
function gForm(e){const y=VIEW.y??new Date().getFullYear(),m=VIEW.m??new Date().getMonth();const t=TODAY();const defD=t.startsWith(y+"-"+pad(m+1))?t:y+"-"+pad(m+1)+"-01";
  sheet(`<h2>${e?"Editar gasto":"Novo gasto"}</h2><label class="fld"><span>Valor (R$)</span><input id="gv" inputmode="decimal" placeholder="0,00" value="${e?String(e.v).replace(".",","):""}" autofocus style="font:700 1.5rem var(--disp)"></label>
   <label class="fld"><span>Com o que gastei</span><input id="gd" value="${esc(e?e.desc:"")}" placeholder="Ex.: Almoço"></label>
   <div class="fld"><span>Categoria</span><div class="seg" data-k="cat">${CATS.map(([c,col])=>`<button type="button" data-a="seg" data-v="${c}" aria-pressed="${(e?e.cat:"Alimentação")===c}"><span class="sw" style="display:inline-block;background:${col};margin-right:5px"></span>${c}</button>`).join("")}</div></div>
   <div class="fld"><span>Forma de pagamento</span><div class="seg" data-k="pag">${PAGS.map(p=>`<button type="button" data-a="seg" data-v="${p}" aria-pressed="${(e?e.pag:"Pix")===p}">${p}</button>`).join("")}</div></div>
   <label class="fld"><span>Data</span><input id="gdt" type="date" value="${e?e.d:defD}"></label>
   <div class="btns"><button class="btn full" id="gS">${e?"Salvar alterações":"Adicionar gasto"}</button>${e?`<button class="btn danger full" id="gX">Apagar gasto</button>`:""}</div>`,s=>{
   s.querySelector("#gS").onclick=()=>{const v=num(s.querySelector("#gv").value);if(!(v>0))return toast("triangle-alert","Digite o valor","Ex.: 35,90");const d=s.querySelector("#gdt").value||defD;
     const o=e||{id:"exp_"+nid(),c:"exp"};Object.assign(o,{v,desc:s.querySelector("#gd").value.trim(),cat:segVal(s,"cat")||"Outros",pag:segVal(s,"pag")||"",d});save(o);VIEW.y=+d.slice(0,4);VIEW.m=+d.slice(5,7)-1;closeSheet();rr();toast("wallet","Gasto salvo",money(v));};
   const x=s.querySelector("#gX");if(x)x.onclick=()=>{removeDoc(e.id);closeSheet();rr();};});}
ACT.gOrc=()=>{const c=cfg();sheet(`<h2>Orçamento mensal</h2><p class="muted small">Quanto pretende gastar por mês. O app mostra quanto ainda resta, aqui e no Gasto rápido.</p><label class="fld"><span>Valor por mês (R$)</span><input id="ov" inputmode="decimal" value="${c.orc?String(c.orc).replace(".",","):""}" placeholder="Ex.: 2000"></label><div class="btns"><button class="btn full" id="oS">Salvar orçamento</button></div>`,s=>{
  s.querySelector("#oS").onclick=()=>{c.orc=num(s.querySelector("#ov").value);save(c);closeSheet();rr();};});};
ACT.gCSV=()=>{const y=VIEW.y??new Date().getFullYear();const L=all("exp").filter(e=>(e.d||"").startsWith(y+"-")).sort((a,b)=>a.d.localeCompare(b.d));
  const q=s=>'"'+String(s||"").replace(/"/g,'""')+'"';const csv="\ufeffData;Descrição;Categoria;Pagamento;Valor\n"+L.map(e=>[fdate(e.d),q(e.desc),q(e.cat),q(e.pag),String(e.v).replace(".",",")].join(";")).join("\n");
  baixar(new Blob([csv],{type:"text/csv"}),"gastos-"+y+".csv");};
function baixar(blob,nome){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}

/* ================= CONTAS A PAGAR E A RECEBER ================= */
function vencTxt(c){if(c.status==="paga")return (c.tipo==="receber"?"Recebida":"Paga")+(c.pagoEm?" em "+fdate(c.pagoEm):"");const n=diasAte(c.venc);
  return n<0?`Vencida há ${plural(-n,"dia","dias")}`:n===0?"Vence hoje":n===1?"Vence amanhã":`Vence em ${n} dias · ${fshort(c.venc)}`;}
VIEWS.contas=()=>{const tb=VIEW.tab||"pagar";const L=all("conta").filter(c=>c.tipo===tb);const ab=L.filter(c=>c.status!=="paga").sort((a,b)=>(a.venc||"").localeCompare(b.venc||""));const pg=L.filter(c=>c.status==="paga").sort((a,b)=>(b.pagoEm||"").localeCompare(a.pagoEm||"")).slice(0,15);
  const ym=TODAY().slice(0,7);const mes=L.filter(c=>(c.venc||"").startsWith(ym));const totAb=sum(ab.map(c=>c.valor)),venc=ab.filter(c=>diasAte(c.venc)<0);
  let h=topbar("Contas");
  h+=`<div class="tabs"><button data-a="ctTab" data-v="pagar" aria-pressed="${tb==="pagar"}">A pagar</button><button data-a="ctTab" data-v="receber" aria-pressed="${tb==="receber"}">A receber</button></div>`;
  h+=`<div class="card"><div class="row"><div class="grow"><div class="small muted">${tb==="pagar"?"Em aberto para pagar":"Em aberto para receber"}</div><div class="big" style="color:${tb==="pagar"?"var(--no)":"var(--ok)"}">${money(totAb)}</div><div class="small muted">${plural(ab.length,"conta","contas")}${venc.length?` · <b style="color:var(--no)">${venc.length} vencida${venc.length>1?"s":""}</b>`:""}</div></div><span class="mb" style="width:52px;height:52px">${ic(tb==="pagar"?"arrow-up-right":"arrow-down-left")}</span></div>
   <div class="small muted" style="margin-top:8px">Neste mês: ${money(sum(mes.map(c=>c.valor)))} · ${tb==="pagar"?"pagas":"recebidas"} ${money(sum(mes.filter(c=>c.status==="paga").map(c=>c.valor)))}</div></div>`;
  h+=`<div class="grp">Em aberto</div>`+(ab.length?ab.map(ctCard).join(""):empty("circle-check","Tudo em dia",tb==="pagar"?"Nenhuma conta para pagar.":"Nada para receber agora."));
  if(pg.length)h+=`<div class="grp">${tb==="pagar"?"Pagas":"Recebidas"} recentemente</div>`+pg.map(ctCard).join("");
  return `<div class="app">${h}</div>${fab("ctNew","Nova conta")}`;};
function ctCard(c){const n=c.status==="paga"?null:diasAte(c.venc);const k=c.status==="paga"?"ok":n<0?"no":n<=3?"wait":"";
  return `<div class="item"><button class="ck ${c.status==="paga"?"on":""}" data-a="ctPay" data-id="${c.id}" aria-label="${c.tipo==="receber"?"Marcar como recebida":"Marcar como paga"}">${ic("check")}</button><button class="ibody" data-a="ctEdit" data-id="${c.id}"><div class="row"><b class="grow ell ${c.status==="paga"?"strike":""}">${esc(c.desc)}</b><span class="amt">${money(c.valor)}</span></div><div class="meta"><span class="chip ${k}">${esc(vencTxt(c))}</span>${c.rep?`<span class="chip">${ic("repeat")} mensal</span>`:""}${c.quem?`<span class="chip">${esc(c.quem)}</span>`:""}</div></button></div>`;}
ACT.ctTab=el=>{VIEW.tab=el.dataset.v;rr();};
ACT.ctPay=el=>{const c=getD(el.dataset.id);if(c.status==="paga"){c.status="aberta";c.pagoEm="";save(c);rr();return;}
  c.status="paga";c.pagoEm=TODAY();save(c);
  if(c.rep&&!c.next){const d=pd(c.venc);d.setMonth(d.getMonth()+1);const n={...c,id:"conta_"+nid(),venc:iso(d),status:"aberta",pagoEm:""};c.next=n.id;save(c);save(n);}
  if(c.tipo==="pagar"&&c.gasto)save({id:"exp_"+nid(),c:"exp",v:c.valor,desc:c.desc,cat:c.cat||"Contas",pag:"Pix",d:TODAY()});
  rr();toast("circle-check",c.tipo==="receber"?"Recebida!":"Paga!",c.desc+" · "+money(c.valor));};
const CTF=t=>[{k:"desc",l:t==="receber"?"O que vou receber":"O que vou pagar",auto:1,ph:t==="receber"?"Ex.: Freela do site":"Ex.: Conta de luz"},{k:"valor",l:"Valor (R$)",type:"money"},{k:"venc",l:"Vencimento",type:"date"},{k:"quem",l:t==="receber"?"De quem":"Para quem (opcional)"},
  {k:"rep",l:"Repete todo mês?",type:"select",opts:[["","Não"],["1","Sim, mensal"]],def:""},...(t==="pagar"?[{k:"gasto",l:"Ao pagar, lançar na planilha de gastos?",type:"select",opts:[["1","Sim"],["","Não"]],def:"1"}]:[]),{k:"nota",l:"Anotações",type:"textarea"}];
function ctForm(c){const t=c?c.tipo:(VIEW.tab||"pagar");const F=CTF(t);
  sheet(`<h2>${c?"Editar conta":t==="receber"?"Nova conta a receber":"Nova conta a pagar"}</h2>${F.map(f=>fieldHTML(f,c?c[f.k]:(f.k==="venc"?TODAY():null))).join("")}
   <div class="btns"><button class="btn full" id="cS">${c?"Salvar":"Adicionar conta"}</button>${c?`<button class="btn danger full" id="cX">Apagar</button>`:""}</div>`,s=>{
   s.querySelector("#cS").onclick=()=>{const o=readFields(F,s);if(!o.desc)return toast("triangle-alert","Descreva a conta","");if(!(o.valor>0))return toast("triangle-alert","Digite o valor","");o.venc=o.venc||TODAY();
     const d=c||{id:"conta_"+nid(),c:"conta",tipo:t,status:"aberta"};Object.assign(d,o);save(d);closeSheet();rr();};
   const x=s.querySelector("#cX");if(x)x.onclick=()=>{removeDoc(c.id);closeSheet();rr();};});}
ACT.ctNew=()=>ctForm(null);ACT.ctEdit=el=>ctForm(getD(el.dataset.id));
function tickContas(){const t=TODAY();all("conta").forEach(c=>{if(c.status==="paga"||c.nt===t)return;const n=diasAte(c.venc);if(n===0||(n===1&&c.tipo==="pagar")){c.nt=t;save(c);notify(c.tipo==="receber"?"Para receber hoje: "+c.desc:(n===0?"Conta vence hoje: ":"Conta vence amanhã: ")+c.desc,money(c.valor));}});}
