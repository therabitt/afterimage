import type { AfterimageSettings, Point } from '../types'
import { getPalette } from './palettes'
type Particle={x:number;y:number;vx:number;vy:number;age:number;lifetime:number;size:number;hue:number;saturation:number;lightness:number}
const BG='#080a10', MAX=2200, REDUCED_MAX=850, SPACING=9
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n))
const rand=(min:number,max:number)=>min+Math.random()*(max-min)
export class ParticleEngine {
 private ctx:CanvasRenderingContext2D
 private observer:ResizeObserver
 private settings:AfterimageSettings
 private reduced:boolean
 private particles:Particle[]=[]
 private width=0; private height=0; private ratio=1
 private raf:number|null=null; private lastTime=0; private lastPoint:Point|null=null
 private carry=0; private pointerId:number|null=null; private idleFrames=0; private destroyed=false
 constructor(private canvas:HTMLCanvasElement,settings:AfterimageSettings,reduced:boolean,private onInteraction:()=>void){
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true}); if(!ctx) throw new Error('Canvas 2D unavailable')
  this.ctx=ctx; this.settings=settings; this.reduced=reduced
  canvas.addEventListener('pointerdown',this.down); canvas.addEventListener('pointermove',this.move)
  canvas.addEventListener('pointerup',this.up); canvas.addEventListener('pointercancel',this.up); canvas.addEventListener('pointerleave',this.leave)
  document.addEventListener('visibilitychange',this.visibility)
  this.observer=new ResizeObserver(()=>this.resize()); this.observer.observe(canvas); this.resize()
 }
 setSettings(s:AfterimageSettings){this.settings=s}
 setReducedMotion(value:boolean){this.reduced=value;if(value){this.particles.length=Math.min(this.particles.length,REDUCED_MAX);for(const p of this.particles){p.vx*=.25;p.vy*=.25}}}
 clear(){this.particles=[];this.lastPoint=null;this.carry=0;this.pointerId=null;this.idleFrames=0;this.stop();this.background()}
 exportPng():Promise<Blob>{return new Promise((resolve,reject)=>{this.canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The browser could not create the PNG.')),'image/png')})}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.stop();this.observer.disconnect();this.canvas.removeEventListener('pointerdown',this.down);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerup',this.up);this.canvas.removeEventListener('pointercancel',this.up);this.canvas.removeEventListener('pointerleave',this.leave);document.removeEventListener('visibilitychange',this.visibility);this.particles=[]}
 private point(e:PointerEvent):Point{const r=this.canvas.getBoundingClientRect();return{x:clamp(e.clientX-r.left,0,this.width),y:clamp(e.clientY-r.top,0,this.height)}}
 private down=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.pointerType!=='mouse'){this.pointerId=e.pointerId;try{this.canvas.setPointerCapture(e.pointerId)}catch{/* canceled */}}const p=this.point(e);this.lastPoint=p;this.carry=0;this.emit(p.x,p.y,0,0,3);this.onInteraction()}
 private move=(e:PointerEvent)=>{if(e.pointerType!=='mouse'&&e.pointerId!==this.pointerId)return;const p=this.point(e);if(!this.lastPoint){this.lastPoint=p;this.emit(p.x,p.y,0,0,1);this.onInteraction();return}const a=this.lastPoint,dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);if(d<.35)return;const step=SPACING/(this.reduced?1.35:1),dirX=dx/d,dirY=dy/d;let travelled=step-this.carry;while(travelled<=d){const t=travelled/d;this.emit(a.x+dx*t,a.y+dy*t,dirX,dirY,this.reduced?1:2);travelled+=step}this.carry=(this.carry+d)%step;this.lastPoint=p;this.onInteraction()}
 private up=(e:PointerEvent)=>{if(this.pointerId!==null&&e.pointerId!==this.pointerId)return;this.pointerId=null;this.lastPoint=null;this.carry=0}
 private leave=(e:PointerEvent)=>{if(e.pointerType==='mouse'){this.lastPoint=null;this.carry=0}}
 private emit(x:number,y:number,dx:number,dy:number,count:number){const palette=getPalette(this.settings.palette);for(let i=0;i<count;i++){if(this.particles.length>=(this.reduced?REDUCED_MAX:MAX))this.particles.shift();const hue=palette.colors[Math.floor(Math.random()*palette.colors.length)]??190;const speed=this.reduced?5:15,spread=this.reduced?8:23,t=rand(0,speed);this.particles.push({x:x+rand(-2.8,2.8),y:y+rand(-2.8,2.8),vx:dx*t+rand(-spread,spread),vy:dy*t+rand(-spread,spread),age:0,lifetime:rand(1.4,this.reduced?2.2:3.1),size:this.settings.particleSize*rand(.48,1.18),hue:hue+rand(-5,5),saturation:rand(72,100),lightness:rand(66,84)})}this.idleFrames=0;this.request()}
 private background(){this.ctx.save();this.ctx.globalCompositeOperation='source-over';this.ctx.fillStyle=BG;this.ctx.fillRect(0,0,this.width,this.height);this.ctx.restore()}
 private resize(){const r=this.canvas.getBoundingClientRect(),w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));if(w===this.width&&h===this.height&&this.canvas.width)return;let snapshot:HTMLCanvasElement|null=null;if(this.canvas.width&&this.canvas.height){snapshot=document.createElement('canvas');snapshot.width=this.canvas.width;snapshot.height=this.canvas.height;snapshot.getContext('2d')?.drawImage(this.canvas,0,0)}const oldW=this.width,oldH=this.height;this.width=w;this.height=h;this.ratio=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(w*this.ratio);this.canvas.height=Math.round(h*this.ratio);this.ctx.setTransform(this.ratio,0,0,this.ratio,0,0);this.background();if(snapshot&&oldW&&oldH){this.ctx.drawImage(snapshot,0,0,snapshot.width,snapshot.height,0,0,w,h);for(const p of this.particles){p.x*=w/oldW;p.y*=h/oldH;p.vx*=w/oldW;p.vy*=h/oldH}}if(this.particles.length)this.request()}
 private request(){if(this.destroyed||document.hidden||this.raf!==null)return;this.raf=requestAnimationFrame(this.frame)}
 private stop(){if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.lastTime=0}
 private visibility=()=>{if(document.hidden)this.stop();else if(this.particles.length)this.request()}
 private frame=(time:number)=>{this.raf=null;if(this.destroyed||document.hidden)return;const dt=this.lastTime?clamp((time-this.lastTime)/1000,0,.05):1/60;this.lastTime=time;const damping=Math.exp(-.58*dt);let write=0;for(let i=0;i<this.particles.length;i++){const p=this.particles[i]!;p.age+=dt;if(p.age>=p.lifetime)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=damping;p.vy*=damping;this.particles[write++]=p}this.particles.length=write;this.ctx.save();this.ctx.globalCompositeOperation='source-over';this.ctx.fillStyle=`rgba(8,10,16,${(1-this.settings.trailPersistence).toFixed(3)})`;this.ctx.fillRect(0,0,this.width,this.height);this.ctx.restore();this.ctx.save();this.ctx.globalCompositeOperation='lighter';for(const p of this.particles){const life=clamp(p.age/p.lifetime,0,1),alpha=clamp(life*8,0,1)*Math.pow(1-life,1.8),radius=Math.max(.55,p.size*(this.reduced?1:.88+Math.sin(life*Math.PI*5)*.12));this.ctx.beginPath();this.ctx.fillStyle=`hsla(${p.hue},${p.saturation}%,${p.lightness}%,${alpha*.12})`;this.ctx.arc(p.x,p.y,radius*3.8,0,Math.PI*2);this.ctx.fill();this.ctx.beginPath();this.ctx.fillStyle=`hsla(${p.hue},${p.saturation}%,${Math.min(96,p.lightness+8)}%,${alpha*.88})`;this.ctx.arc(p.x,p.y,radius,0,Math.PI*2);this.ctx.fill()}this.ctx.restore();if(!this.particles.length){if(++this.idleFrames>=100){this.background();this.lastTime=0;return}}else this.idleFrames=0;this.request()}
}