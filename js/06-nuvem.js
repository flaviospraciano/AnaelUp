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
async function nuvemBoot(){try{localStorage.getItem("au_nuvem")==="1"&&await fbIniciar();}catch(e){return;}if(!FB)return;FB._ouvindo=1;
  FB.auth.onAuthStateChanged(u=>{UID=u?u.uid:null;if(u)sincronizar();else{NUVEM="off";rr();}});}
function erroAuth(e){const c=(e&&e.code)||"";return {"auth/invalid-email":"Email inválido.","auth/missing-password":"Digite a senha.","auth/weak-password":"A senha precisa ter pelo menos 6 caracteres.","auth/email-already-in-use":"Já existe uma conta com esse email. Use Entrar.","auth/invalid-credential":"Email ou senha incorretos.","auth/wrong-password":"Senha incorreta.","auth/user-not-found":"Não existe conta com esse email. Toque em Criar conta.","auth/too-many-requests":"Muitas tentativas. Espere alguns minutos.","auth/network-request-failed":"Sem internet.","auth/operation-not-allowed":"Login por email e senha não está ativado no Firebase."}[c]||("Erro: "+(c||e.message||e));}
async function nuvemAuth(modo){const em=($("nvE")||{}).value||"",se=($("nvS")||{}).value||"";
  try{localStorage.setItem("au_nuvem","1");await fbIniciar();
    if(!FB._ouvindo){FB._ouvindo=1;FB.auth.onAuthStateChanged(u=>{UID=u?u.uid:null;if(u)sincronizar();else{NUVEM="off";rr();}});}
    if(modo==="criar")await FB.auth.createUserWithEmailAndPassword(em.trim(),se);else await FB.auth.signInWithEmailAndPassword(em.trim(),se);
    toast("cloud-upload","Conectado","Seus dados agora ficam salvos na nuvem.");}
  catch(e){console.warn(e);toast("triangle-alert","Não deu certo",erroAuth(e));}}
ACT.nuvemEntrar=()=>nuvemAuth("entrar");ACT.nuvemCriar=()=>nuvemAuth("criar");
ACT.nuvemReset=async()=>{const em=(($("nvE")||{}).value||"").trim();if(!em)return toast("info","Digite seu email","Depois toque em Esqueci a senha.");
  try{await fbIniciar();await FB.auth.sendPasswordResetEmail(em);toast("bell","Email enviado","Abra o email para criar uma nova senha.");}catch(e){toast("triangle-alert","Não deu certo",erroAuth(e));}};
ACT.nuvemSair=()=>confirmSheet("Sair da conta?","Os dados continuam neste celular, mas param de ir para a nuvem.","Sair",async()=>{await FB.auth.signOut();localStorage.removeItem("au_nuvem");UID=null;NUVEM="off";rr();});
function secNuvem(){const u=FB&&FB.auth.currentUser;
  const st={on:"Sincronizado ✓",sync:"Sincronizando…",erro:"Erro ao sincronizar. Toque para tentar de novo.",off:"Desligado"}[NUVEM];
  return `<div class="sec"><h2>Salvar na nuvem</h2></div><div class="card"><p class="small muted" style="margin-top:0">Entre com email e senha para guardar tudo na nuvem. Se trocar de celular, é só entrar de novo que os dados voltam.</p>
   ${u?`<div class="small" style="margin-bottom:10px"><b>${esc(u.email||"")}</b><br>${st}</div><div class="btns h" style="margin-top:0"><button class="btn ghost" data-a="nuvemSync">${ic("refresh-cw")} Sincronizar</button><button class="btn danger" data-a="nuvemSair">Sair</button></div>`
     :`<label class="fld" style="margin-top:0"><span>Email</span><input id="nvE" type="email" autocomplete="email" placeholder="seu@email.com"></label>
      <label class="fld"><span>Senha</span><input id="nvS" type="password" autocomplete="current-password" placeholder="Mínimo de 6 caracteres"></label>
      <div class="btns h"><button class="btn" data-a="nuvemEntrar">${ic("cloud-upload")} Entrar</button><button class="btn ghost" data-a="nuvemCriar">Criar conta</button></div>
      <button class="lk small" style="margin-top:10px" data-a="nuvemReset">Esqueci a senha</button>`}</div>`;}
ACT.nuvemSync=()=>sincronizar();
const _aj=VIEWS.ajustes;VIEWS.ajustes=()=>_aj().replace('<div class="sec"><h2>Tema</h2>',secNuvem()+'<div class="sec"><h2>Tema</h2>');
nuvemBoot();
