/**
 * Game engine: only gameplay rules and canvas drawing are here.
 * UI and server code are separate (high cohesion and low coupling).
 * Event handlers in main.js call start(), pause() and setDirection().
 */
const W=960,H=540;
const rand=(min,max)=>Math.random()*(max-min)+min;
export class ForestGame{
  constructor(canvas,onUpdate,onFinish){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onUpdate=onUpdate;this.onFinish=onFinish;this.keys=new Set();this.frame=this.frame.bind(this);this.running=false;this.raf=0;}
  start(level,avatar='fox'){
    this.stop();this.level=level;this.target=level===1?12:18;this.duration=level===1?65:55;this.time=this.duration;this.elapsed=0;this.score=0;this.collected=0;this.lives=3;this.paused=false;this.running=true;this.player={x:100,y:270,r:23,avatar};this.seeds=[];this.thorns=[];this.spawnTimer=0;this.thornTimer=0;this.invulnerable=0;this.last=0;this.keys.clear();this.onUpdate(this.snapshot());this.raf=requestAnimationFrame(this.frame);
  }
  snapshot(){return {level:this.level,score:this.score,seeds:this.collected,target:this.target,lives:this.lives,time:Math.ceil(this.time),paused:this.paused};}
  stop(){this.running=false;cancelAnimationFrame(this.raf);this.keys.clear();}
  setDirection(direction,pressed){if(pressed)this.keys.add(direction);else this.keys.delete(direction);}
  pause(){if(this.running){this.paused=!this.paused;this.onUpdate(this.snapshot());}}
  spawnSeed(){this.seeds.push({x:W+30,y:rand(60,H-60),r:15,v:rand(90,145)+(this.level-1)*35,wave:rand(0,6)});}
  spawnThorn(){this.thorns.push({x:W+55,y:rand(65,H-65),r:27,v:rand(165,215)+(this.level-1)*65,wave:rand(0,6)});}
  collision(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r-5;}
  finish(success){this.stop();this.onFinish({...this.snapshot(),success});}
  frame(timestamp){
    if(!this.running)return;
    const dt=this.last?Math.min((timestamp-this.last)/1000,.05):0;this.last=timestamp;
    if(!this.paused){this.update(dt);}
    this.draw();if(this.running)this.raf=requestAnimationFrame(this.frame);
  }
  update(dt){
    this.elapsed+=dt;
    this.time=Math.max(0,this.time-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
    let dx=(this.keys.has('right')?1:0)-(this.keys.has('left')?1:0),dy=(this.keys.has('down')?1:0)-(this.keys.has('up')?1:0);
    const mag=Math.hypot(dx,dy)||1;this.player.x=Math.max(24,Math.min(W-24,this.player.x+dx/mag*320*dt));this.player.y=Math.max(25,Math.min(H-25,this.player.y+dy/mag*320*dt));
    this.spawnTimer+=dt;this.thornTimer+=dt;
    if(this.spawnTimer>.85){this.spawnTimer=0;this.spawnSeed();}
    if(this.thornTimer>(this.level===1?3.0:1.85)){this.thornTimer=0;this.spawnThorn();}
    for(const seed of this.seeds){seed.x-=seed.v*dt;seed.wave+=dt*3;seed.y+=Math.sin(seed.wave)*.35;}
    for(const thorn of this.thorns){thorn.x-=thorn.v*dt;thorn.wave+=dt*2;thorn.y+=Math.sin(thorn.wave)*.6;}
    // Iterate backwards so removing collected seeds does not skip an element.
    for(let i=this.seeds.length-1;i>=0;i--){if(this.collision(this.player,this.seeds[i])){this.seeds.splice(i,1);this.collected++;this.score+=10;}}
    for(let i=this.thorns.length-1;i>=0;i--){if(this.invulnerable===0&&this.collision(this.player,this.thorns[i])){this.thorns.splice(i,1);this.lives--;this.invulnerable=1.5;}}
    this.seeds=this.seeds.filter(seed=>seed.x>-35);this.thorns=this.thorns.filter(thorn=>thorn.x>-75);
    this.onUpdate(this.snapshot());
    if(this.collected>=this.target)this.finish(true);else if(this.lives<=0||this.time<=0)this.finish(false);
  }
  drawSeed(x,y,r){const c=this.ctx;c.save();c.translate(x,y);c.rotate(-.65);c.shadowColor='#d7ff70';c.shadowBlur=15;c.fillStyle='#d5f269';c.beginPath();c.ellipse(0,0,r*.7,r*1.15,0,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#6b9b42';c.lineWidth=2;c.beginPath();c.moveTo(0,r*.8);c.lineTo(0,-r*.7);c.moveTo(0,0);c.lineTo(r*.4,-r*.35);c.stroke();c.restore();}
  drawThorn(x,y,r){const c=this.ctx;c.save();c.translate(x,y);c.rotate(Math.sin(performance.now()/400+x)*.08);c.lineCap='round';c.strokeStyle='#5e382d';c.lineWidth=9;c.beginPath();c.moveTo(-r,5);c.quadraticCurveTo(0,-7,r,4);c.stroke();for(const side of [-1,1])for(let i=0;i<3;i++){const px=side*(i*13-6);c.fillStyle='#b35a45';c.beginPath();c.moveTo(px,-2);c.lineTo(px+side*7,-r*.82);c.lineTo(px+side*11,2);c.fill();}c.fillStyle='#a73f43';c.beginPath();c.arc(-6,-r*.35,4,0,Math.PI*2);c.arc(8,-r*.4,4,0,Math.PI*2);c.fill();c.restore();}
  drawGuardian(x,y,r,avatar='fox'){const c=this.ctx;const palette={fox:['#e98b45','#f5c27b'],deer:['#a96843','#edc58b'],owl:['#b68a55','#f0d7a2'],bear:['#73513b','#c99a68']};const [fur,muzzle]=palette[avatar]||palette.fox;c.save();c.translate(x,y);c.fillStyle=fur;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.beginPath();if(avatar==='owl'){c.moveTo(-r*.8,-r*.3);c.lineTo(-r*.95,-r*1.15);c.lineTo(-r*.25,-r*.75);c.moveTo(r*.8,-r*.3);c.lineTo(r*.95,-r*1.15);c.lineTo(r*.25,-r*.75);}else{c.moveTo(-r*.75,-r*.35);c.lineTo(-r*.55,-r*1.15);c.lineTo(-r*.05,-r*.55);c.moveTo(r*.75,-r*.35);c.lineTo(r*.55,-r*1.15);c.lineTo(r*.05,-r*.55);}c.fill();c.fillStyle=muzzle;c.beginPath();c.ellipse(0,r*.28,r*.55,r*.38,0,0,Math.PI*2);c.fill();c.fillStyle='#2d241d';c.beginPath();c.arc(-r*.32,-r*.1,r*.09,0,Math.PI*2);c.arc(r*.32,-r*.1,r*.09,0,Math.PI*2);c.fill();c.beginPath();c.arc(0,r*.18,r*.07,0,Math.PI*2);c.fill();c.restore();}
  draw(){const c=this.ctx,t=performance.now()/1000;
    const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,this.level===1?'#91c982':'#476f56');bg.addColorStop(1,this.level===1?'#376944':'#183d32');c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.fillStyle='#f6d982';c.beginPath();c.arc(805,95,43,0,Math.PI*2);c.fill();
    for(let layer=0;layer<3;layer++){c.fillStyle=['#7fb878','#548b60','#376b4a'][layer];c.beginPath();c.moveTo(0,H-120+layer*32);for(let x=0;x<=W;x+=80)c.lineTo(x,H-150+layer*32+Math.sin(x*.012+layer)*28);c.lineTo(W,H);c.lineTo(0,H);c.fill();}
    // Fireflies drift through the forest behind gameplay objects.
    for(let i=0;i<24;i++){let x=(i*173+t*(8+i%4*5))%W,y=(i*97+t*(i%3+1)*4)%H;c.fillStyle='#f5f19a99';c.beginPath();c.arc(x,y,2+i%3,0,Math.PI*2);c.fill();}
    c.fillStyle='#4b392b';c.fillRect(0,H-27,W,27);
    for(let i=0;i<18;i++){let x=i*59+10;c.strokeStyle=i%2?'#7ea94d':'#9bc96a';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x,H-25);c.lineTo(x-8,H-45-i%3*10);c.moveTo(x,H-25);c.lineTo(x+11,H-50-i%4*8);c.stroke();}
    const treeCount=this.level===1?7:Math.min(20,7+Math.floor(this.elapsed/3));
    for(let i=0;i<treeCount;i++){const spacing=W/treeCount,x=i*spacing+15;c.fillStyle='#684a36';c.fillRect(x,H-215,18,190);c.fillStyle=i%2?'#356b43':'#427d4d';const scale=Math.min(1,spacing/110);for(const [dx,dy,r] of [[0,-210,42],[-24,-183,34],[26,-179,36]]){c.beginPath();c.arc(x+dx*scale+9,dy+H,r*scale,0,Math.PI*2);c.fill();}}
    for(const seed of this.seeds)this.drawSeed(seed.x,seed.y,seed.r);
    for(const thorn of this.thorns)this.drawThorn(thorn.x,thorn.y,thorn.r);
    if(this.invulnerable===0||Math.floor(t*9)%2===0)this.drawGuardian(this.player.x,this.player.y,this.player.r,this.player.avatar);
    if(this.paused){c.fillStyle='#02172eb9';c.fillRect(0,0,W,H);c.fillStyle='white';c.textAlign='center';c.font='bold 46px system-ui';c.fillText('PAUSED',W/2,H/2);c.font='22px system-ui';c.fillText('Press P to continue',W/2,H/2+40);}
  }
}
