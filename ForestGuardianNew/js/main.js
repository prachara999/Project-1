/**
 * UI controller: listens for user events and connects the separate game/API modules.
 * AI-assisted starter project: study and modify before presenting as your own work.
 */
import {api,setToken} from './api.js';
import {ForestGame} from './game.js';
const $=id=>document.getElementById(id);
const screens=['authScreen','menuScreen','gameScreen','challengeScreen'];
let player=null,mode='register',avatar='fox',game;
function screen(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));window.scrollTo(0,0);}
function errorMessage(e){return e instanceof Error?e.message:String(e);}
function account(){ $('account').innerHTML='';if(!player)return;const name=document.createElement('span');name.textContent=`🌿 ${player.username}`;const logout=document.createElement('button');logout.className='secondary';logout.textContent='Sign out';logout.onclick=async()=>{try{await api('auth.php?action=logout',{});player=null;setToken('');screen('authScreen');account();}catch(e){alert(errorMessage(e));}};$('account').append(name,logout);}
async function refresh(){const data=await api('auth.php?action=me');if(!data.loggedIn){player=null;account();screen('authScreen');return;}player=data.player;setToken(data.csrf);account();menu();}
function menu(){screen('menuScreen');$('welcome').textContent=`Welcome back, ${player.username}! The forest needs you.`;$('bestScore').textContent=player.bestScore;$('levelStatus').textContent=`Highest unlocked level: ${player.levelUnlocked}`;$('level2Btn').textContent=player.levelUnlocked>=2?'Enter Elderwood':'🔒 Locked';$('level2Btn').disabled=player.levelUnlocked<2;$('history').replaceChildren();for(const h of [...player.history].reverse().slice(0,5)){const row=document.createElement('div');row.textContent=`Level ${h.level} · ${h.score} points · ${h.completed?'Success':'Try again'}`;$('history').append(row);}if(!player.history.length)$('history').textContent='No adventures yet. Begin your first forest mission!';}
function updateHud(s){$('score').textContent=s.score;$('seedCount').textContent=`${s.seeds} / ${s.target}`;$('lives').textContent=s.lives;$('time').textContent=s.time;}
async function finish(s){
  $('overlayTitle').textContent=s.success?'🌿 Forest restored!':'🌲 Mission ended';
  $('overlayMessage').textContent=`You gathered ${s.seeds} forest seeds and earned ${s.score} points. ${s.success&&s.level===1?'Next: solve the live Fish Game API puzzle to unlock Level 2.':''}`;
  $('overlayAction').textContent=s.success&&s.level===1?'Solve API challenge':'Try again';
  $('overlayAction').onclick=()=>{if(s.success&&s.level===1){screen('challengeScreen');loadChallenge();}else startLevel(s.level);};
  $('gameOverlay').classList.remove('hidden');
  try{const result=await api('score.php',{level:s.level,score:s.score,fish:s.seeds,completed:s.success});player=result.player;}catch(e){$('overlayMessage').textContent+=` Could not save result: ${errorMessage(e)}`;}
}
function startLevel(level){if(level>player.levelUnlocked){alert('Complete Level 1 and the API challenge first.');return;}screen('gameScreen');$('gameOverlay').classList.add('hidden');$('zoneName').textContent=level===1?'🌳 WHISPERING WOODS':'🌙 ELDERWOOD';game.start(level,player.avatar);}
async function loadChallenge(){screen('challengeScreen');$('apiStatus').textContent='Connecting to the live Fish Game API…';$('challengeImage').classList.add('hidden');$('checkBtn').disabled=true;$('challengeFeedback').textContent='';$('fishAnswer').value='';$('chestAnswer').value='';try{const result=await api('fish-api.php');$('challengeImage').onload=()=>{$('apiStatus').textContent='Count the fish and treasure chests in the image.';$('checkBtn').disabled=false;};$('challengeImage').onerror=()=>{$('apiStatus').textContent='Image could not load. Try another challenge.';};$('challengeImage').src=result.image;$('challengeImage').classList.remove('hidden');}catch(e){$('apiStatus').textContent=errorMessage(e);}}
async function init(){
  game=new ForestGame($('gameCanvas'),updateHud,finish);
  document.querySelectorAll('.avatar').forEach(b=>b.addEventListener('click',()=>{avatar=b.dataset.avatar;document.querySelectorAll('.avatar').forEach(a=>a.classList.toggle('selected',a===b));}));
  $('toggleAuth').onclick=()=>{mode=mode==='register'?'login':'register';$('authTitle').textContent=mode==='register'?'Create your guardian':'Welcome back, guardian';$('authSubmit').textContent=mode==='register'?'Create account':'Sign in';$('toggleAuth').textContent=mode==='register'?'Already have an account? Sign in':'New guardian? Create an account';$('authError').textContent='';};
  $('authForm').onsubmit=async e=>{e.preventDefault();$('authError').textContent='';$('authSubmit').disabled=true;try{const result=await api(`auth.php?action=${mode}`,{username:$('username').value.trim(),password:$('password').value,avatar});player=result.player;setToken(result.csrf);account();menu();}catch(err){$('authError').textContent=errorMessage(err);}finally{$('authSubmit').disabled=false;}};
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.start)));
  $('quitBtn').onclick=()=>{game.stop();menu();};$('overlayMenu').onclick=()=>menu();
  $('challengeMenu').onclick=()=>{refresh().catch(e=>alert(errorMessage(e)));};$('retryApi').onclick=loadChallenge;
  $('challengeForm').onsubmit=async e=>{e.preventDefault();$('checkBtn').disabled=true;try{const result=await api('fish-api.php?action=answer',{fish:Number($('fishAnswer').value),chest:Number($('chestAnswer').value)});$('challengeFeedback').textContent=result.message;if(result.correct){$('apiStatus').textContent='🌱 Correct! The Elderwood is awakening…';player.levelUnlocked=Math.max(player.levelUnlocked,2);await new Promise(resolve=>setTimeout(resolve,1200));startLevel(2);}else{$('checkBtn').disabled=false;}}catch(err){$('challengeFeedback').textContent=errorMessage(err);$('checkBtn').disabled=false;}};
  const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  window.addEventListener('keydown',e=>{if($('gameScreen').classList.contains('hidden'))return;if(keyMap[e.key]){e.preventDefault();game.setDirection(keyMap[e.key],true);}if(e.key.toLowerCase()==='p'&&!e.repeat)game.pause();});
  window.addEventListener('keyup',e=>{if(keyMap[e.key])game.setDirection(keyMap[e.key],false);});
  window.addEventListener('blur',()=>{for(const d of ['up','down','left','right'])game.setDirection(d,false);});
  document.querySelectorAll('[data-dir]').forEach(b=>{const dir=b.dataset.dir;b.addEventListener('pointerdown',e=>{e.preventDefault();game.setDirection(dir,true);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>game.setDirection(dir,false));});
  try{await refresh();}catch(e){$('authError').textContent=errorMessage(e);}
}
init();
