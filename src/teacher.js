import './styles.css';import QRCode from 'qrcode';import {ref,set,update,onValue,serverTimestamp} from 'firebase/database';
import {db,login} from './fb.js';import {BANK,CATS,DIFF,OPTC,board,esc} from './data.js';
const A=document.getElementById('app');let uid,code,room,cat='Барлығы',diff='mid',used=[],t0=0,qr='';
const R=p=>ref(db,`rooms/${code}${p?'/'+p:''}`);
const shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function setup(){A.innerHTML=`<div class="card"><h1>МАТЕМАТИКАЛЫҚ ДОМИНО</h1><p class="sub">Мұғалім панелі</p><h3>Санат</h3><div class="row">${CATS.map(c=>`<button class="btn ${c===cat?'on':''}" data-act="cat" data-v="${c}">${c}</button>`).join('')}</div><h3>Күрделілік</h3><div class="row">${Object.entries(DIFF).map(([k,d])=>`<button class="btn ${k===diff?'on':''}" data-act="diff" data-v="${k}">${d.n} · ${d.sec} сек</button>`).join('')}</div><br><button class="btn big go" data-act="create">Бөлме құру</button><p id="err" class="sub"></p></div>`}
async function create(){try{uid=await login();code=String(Math.floor(1000+Math.random()*9000));
await set(R(),{host:uid,status:'lobby',round:0,total:10,cat,diff});
const url=`${location.origin}/?room=${code}`;qr=await QRCode.toDataURL(url,{width:420,margin:1});
onValue(R(),s=>{room=s.val();if(room)draw()})}catch(e){document.getElementById('err').textContent='Қате: Firebase қосылмады — README тексеріңіз ('+e.code+')'}}
function next(){if(room.round>=room.total)return finish();
const pool=BANK.map((b,i)=>i).filter(i=>(cat==='Барлығы'||BANK[i].c===cat)&&!used.includes(i));if(!pool.length)return finish();
const id=shuf(pool)[0];used.push(id);const b=BANK[id],d=DIFF[diff];t0=Date.now();
update(R(),{status:'question',round:room.round+1,correct:null,q:{id,text:b.q,options:shuf([b.a,...b.w.slice(0,d.opts-1)]),sec:d.sec,startAt:serverTimestamp()}})}
function reveal(){if(!room||room.status!=='question')return;const b=BANK[room.q.id],ci=room.q.options.indexOf(b.a);
const an=(room.answers||{})[room.round]||{},res={};
for(const p in an){const e=Math.max(0,an[p].t-room.q.startAt);res[p]=an[p].c===ci?100+Math.round(50*Math.max(0,1-e/(room.q.sec*1000))):0}
update(R(),{status:'reveal',correct:ci,[`results/${room.round}`]:res})}
const finish=()=>update(R(),{status:'finished'});
function lb(){const{ps,ts}=board(room),m=Math.max(1,...ts.map(t=>t.s));
return `<div class="cols"><div><h3>Командалар</h3>${ts.map(t=>`<div class="bar"><span style="width:${Math.max(8,t.s/m*100)}%;background:${t.c}">${t.n}</span><b>${t.s}</b></div>`).join('')||'<p class="sub">Әзірге команда жоқ</p>'}</div><div><h3>Үздік оқушылар</h3>${ps.slice(0,6).map((p,i)=>`<div class="pl"><i>${i+1}</i>${esc(p.name)}<b>${p.s}</b></div>`).join('')}</div></div>`}
function draw(){const n=Object.keys(room.players||{}).length,s=room.status,url=`${location.origin}/?room=${code}`;let h='';
if(s==='lobby')h=`<div class="card lobby"><div><h1>Қосылыңыздар!</h1><p class="sub">Телефонмен QR-кодты сканерлеңіз немесе сілтемеге өтіп, кодты енгізіңіз</p><div class="code">${code}</div><p class="url">${location.host}</p></div><img src="${qr}" width="420" height="420" alt="QR"></div><div class="card"><h2>Қосылғандар: ${n}</h2><div class="chips">${Object.values(room.players||{}).map(p=>`<span>${esc(p.name)}</span>`).join('')}</div><button class="btn big go" data-act="next" ${n?'':'disabled'}>Ойынды бастау</button></div>`;
else if(s==='question'||s==='reveal'){const q=room.q,an=Object.values((room.answers||{})[room.round]||{}),cnt=q.options.map((_,i)=>an.filter(a=>a.c===i).length);
h=`<div class="top"><span>Сұрақ ${room.round}/${room.total}</span><span>Бөлме: ${code}</span>${s==='question'?`<span class="tm" id="tm">${q.sec}</span>`:''}</div><div class="card"><h1 class="q">${esc(q.text)}</h1><div class="opts">${q.options.map((o,i)=>`<div class="opt ${s==='reveal'?(i===room.correct?'ok':'no'):''}" style="--c:${OPTC[i]}">${esc(o)}${s==='reveal'?`<small>${cnt[i]}</small>`:''}</div>`).join('')}</div><p class="sub">Жауап берді: ${an.length} / ${n}</p>${s==='question'?'<button class="btn big go" data-act="reveal">Жауапты көрсету</button>':lb()+`<button class="btn big go" data-act="next">${room.round>=room.total?'Қорытынды':'Келесі сұрақ'}</button>`}</div>`}
else h=`<div class="card"><h1>🏆 Қорытынды</h1>${lb()}<button class="btn big go" data-act="again">Жаңа раунд</button></div>`;
A.innerHTML=h}
A.onclick=e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act;
if(a==='cat'){cat=b.dataset.v;setup()}else if(a==='diff'){diff=b.dataset.v;setup()}
else if(a==='create'){b.disabled=true;create()}else if(a==='next'){b.disabled=true;next()}else if(a==='reveal'){b.disabled=true;reveal()}
else if(a==='again'){used=[];update(R(),{status:'lobby',round:0,q:null,correct:null,answers:null,results:null})}};
setInterval(()=>{if(room&&room.status==='question'){const l=room.q.sec-(Date.now()-t0)/1000,e=document.getElementById('tm');if(e)e.textContent=Math.max(0,Math.ceil(l));if(l<=0)reveal()}},250);
setup();
