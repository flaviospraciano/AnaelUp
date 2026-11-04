"use strict";
/* ================= NUVEM (Firebase) · login com Google e sincronização ================= */
const FBV="10.12.2";let FB=null,UID=null,NUVEM="off";
function carregar(src){return new Promise((r,j)=>{const s=document.createElement("script");s.src=src;s.onload=r;s.onerror=j;document.head.appendChild(s);});}
async function fbIniciar(){if(FB)return FB;const b=`https://www.gstatic.com/firebasejs/${FBV}/`;
  await carregar(b+"firebase-app-compat.js");await carregar(b+"firebase-auth-compat.js");await carregar(b+"firebase-firestore-compat.js");
  firebase.initializeApp(window.AU_FIREBASE);FB={auth:firebase.auth(),db:firebase.firestore()};return FB;}
const col=()=>FB.db.collection("users/"+UID+"/docs");
const limpo=d=>JSON.parse(JSON.stringify(d));
const _save=save,_remove=removeDoc;
save=function(doc){_save(doc);if(UID)col().doc(doc.id).set(limpo(doc)).catch(e=>console.warn(e));};
removeDoc=function(id){_remove(id);if(UID)col().doc(id).delete().catch(()=>{});};
async function sincronizar(){NUVEM="sync";rr();try{const snap=await col().get();const nuvem=new Map();snap.forEach(x=>nuvem.set(x.id,x.data()));
  const lote=[];nuvem.forEach((d,id)=>{const l=DB.get(id);if(!l||(d.u||0)>(l.u||0)){DB.set(id,d);idb().then(db=>idbReq(db.transaction("docs","readwrite").objectStore("docs").put(d)));}});
  DB.forEach((d,id)=>{const n=nuvem.get(id);if(!n||(d.u||0)>(n.u||0))lote.push(d);});
  for(let i=0;i<lote.length;i+=400){const b=FB.db.batch();lote.slice(i,i+400).forEach(d=>b.set(col().doc(d.id),limpo(d)));await b.commit();}
  NUVEM="on";applyTheme();rr();}catch(e){console.warn(e);NUVEM="erro";rr();}}
async function nuvemBoot(){try{localStorage.getItem("au_nuvem")==="1"&&await fbIniciar();}catch(e){return;}if(!FB)return;
  try{await FB.auth.getRedirectResult();}catch(e){}
  FB.auth.onAuthStateChanged(u=>{UID=u?u.uid:null;if(u)sincronizar();else{NUVEM="off";rr();}});}
ACT.nuvemEntrar=async()=>{try{localStorage.setItem("au_nuvem","1");await fbIniciar();const p=new firebase.auth.GoogleAuthProvider();
  try{await FB.auth.signInWithPopup(p);}catch(e){if(/popup|operation-not-supported/.test(e.code||""))return FB.auth.signInWithRedirect(p);throw e;}
  if(!UID)FB.auth.onAuthStateChanged(u=>{UID=u?u.uid:null;if(u)sincronizar();});toast("cloud-upload","Conectado","Seus dados agora ficam salvos na nuvem.");}
  catch(e){console.warn(e);toast("triangle-alert","Não deu para entrar",String(e.code||e.message||e));}};
ACT.nuvemSair=()=>confirmSheet("Sair da conta?","Os dados continuam neste celular, mas param de ir para a nuvem.","Sair",async()=>{await FB.auth.signOut();localStorage.removeItem("au_nuvem");UID=null;NUVEM="off";rr();});
function secNuvem(){const u=FB&&FB.auth.currentUser;
  const st={on:"Sincronizado ✓",sync:"Sincronizando…",erro:"Erro ao sincronizar. Toque para tentar de novo.",off:"Desligado"}[NUVEM];
  return `<div class="sec"><h2>Salvar na nuvem</h2></div><div class="card"><p class="small muted" style="margin-top:0">Entre com a conta Google para guardar tudo na nuvem. Se trocar de celular, é só entrar de novo que os dados voltam.</p>
   ${u?`<div class="small" style="margin-bottom:10px"><b>${esc(u.email||"")}</b><br>${st}</div><div class="btns h" style="margin-top:0"><button class="btn ghost" data-a="nuvemSync">${ic("refresh-cw")} Sincronizar</button><button class="btn danger" data-a="nuvemSair">Sair</button></div>`
     :`<button class="btn full" data-a="nuvemEntrar">${ic("cloud-upload")} Entrar com Google</button>`}</div>`;}
ACT.nuvemSync=()=>sincronizar();
const _aj=VIEWS.ajustes;VIEWS.ajustes=()=>_aj().replace('<div class="sec"><h2>Tema</h2>',secNuvem()+'<div class="sec"><h2>Tema</h2>');
nuvemBoot();
