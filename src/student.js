import './styles.css';import {ref,get,set,onValue,serverTimestamp} from 'firebase/database';
import {db,login} from './fb.js';import {TEAMS,OPTC,board,total,esc} from './data.js';
const A=document.getElementById('app');let uid,code=new URLSearchParams(location.search).get('room')||'',name='',team=0,room,picked=-1,msg='';
const R=p=>ref(db,`rooms/${code}${p?'/'+p:''}`);
function join(){A.innerHTML=`<div class="card"><h1>Домино 🎲</h1><input id="c" inputmode="numeric" placeholder="Бөлме коды" value="${esc(code)}"><input id="n" maxlength="24" placeholder="Атың немесе команда атауы" value="${esc(name)}"><h3>Команданы таңда</h3><div class="row">${TEAMS.map(([n,c],i)=>`<button class="btn ${i===team?'on':''}" style="--c:${c}" data-act="team" data-v="${i}">${n}</button>`).join('')}</div><p class="sub">${msg}</p><button class="btn big go" data-act="join">Қосылу</button></div>`}
A.oninput=e=>{if(e.target.id==='c')code=e.target.value.trim();if(e.target.id==='n')name=e.target.value.trim()};
async function enter(fresh){try{if(!(await get(R('status'))).exists()){msg='Бөлме табылмады';return join()}
if(fresh){if(!name){msg='Атыңды жаз';return join()}await set(R(`players/${uid}`),{name,team}).catch(()=>{})}
const p=await get(R(`players/${uid}`));if(!p.exists()){return join()}
localStorage.room=code;onValue(R(),s=>{room=s.val();draw()})}catch(e){msg='Байланыс қатесі'; join()}}
function draw(){if(!room)return;const me=room.players?.[uid]||{name,team},s=room.status,col=TEAMS[me.team||0][1],{ps}=board(room),rank=ps.findIndex(p=>p.id===uid)+1,sc=total(room,uid);let h='';
const hd=`<div class="top" style="background:${col}"><span>${esc(me.name)}</span><span>⭐ ${sc}</span></div>`;
if(s==='lobby')h=`<div class="card"><h2>Күтіңіз…</h2><p class="sub">Мұғалім ойынды бастайды</p></div>`;
else if(s==='question'){const mine=room.answers?.[room.round]?.[uid],done=mine||picked===room.round;
h=`<div class="card"><p class="sub">Сұрақ ${room.round}/${room.total}</p><h1 class="q">${esc(room.q.text)}</h1>${room.q.options.map((o,i)=>`<button class="opt ${mine&&mine.c===i?'sel':''}" style="--c:${OPTC[i]}" data-act="ans" data-v="${i}" ${done?'disabled':''}>${esc(o)}</button>`).join('')}${done?'<p class="sub">✅ Жауап жіберілді</p>':''}</div>`}
else if(s==='reveal'){const a=room.answers?.[room.round]?.[uid],ok=a&&a.c===room.correct;
h=`<div class="card ${ok?'win':'lose'}"><h1>${!a?'Жауап бермедің':ok?'Дұрыс! 🎉':'Қате 😕'}</h1><p>Дұрыс жауап: <b>${esc(room.q.options[room.correct])}</b></p><h2>+${room.results?.[room.round]?.[uid]||0}</h2><p class="sub">Орның: ${rank} / ${ps.length}</p></div>`}
else h=`<div class="card"><h1>🏆 Ойын аяқталды</h1><h2>${sc} ұпай</h2><p>Орның: ${rank} / ${ps.length}</p></div>`;
A.innerHTML=hd+h}
A.onclick=e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act;
if(a==='team'){team=+b.dataset.v;join()}else if(a==='join'){enter(true)}
else if(a==='ans'){if(picked===room.round)return;picked=room.round;draw();set(R(`answers/${room.round}/${uid}`),{c:+b.dataset.v,t:serverTimestamp()}).catch(()=>{})}};
(async()=>{uid=await login();if(localStorage.room){code=localStorage.room;await enter(false);if(room)return;code=new URLSearchParams(location.search).get('room')||''}join()})();
