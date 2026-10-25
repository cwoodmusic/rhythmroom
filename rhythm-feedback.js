/* Bounded, non-blocking celebration. Rhythm grading keeps its own audio clock. */
(function(win){
 'use strict';
 win.createRhythmRoomFeedback=function(options={}){
   const doc=options.document||win.document,scope=options.window||win;
   const hud=doc.getElementById('rhythm-streak'),count=doc.getElementById('note-streak'),best=doc.getElementById('note-streak-best');
   const canvas=doc.createElement('canvas');canvas.id='rhythm-confetti';canvas.width=canvas.height=1;canvas.hidden=true;canvas.setAttribute('aria-hidden','true');
   const badge=doc.createElement('div');badge.id='rhythm-perfect';badge.className='rhythm-perfect';badge.hidden=true;badge.setAttribute('aria-hidden','true');
   const heading=doc.createElement('strong'),detail=doc.createElement('span');heading.textContent='PERFECT!';detail.textContent='Every note on time.';badge.append(heading,detail);doc.body.append(canvas,badge);
   const media=scope.matchMedia?.('(prefers-reduced-motion: reduce)'),colors=['#75f8ff','#ff78c8','#ffe58e','#c7a4ff','#9affbe'];
   let frame=null,timer=null,context=null,particles=[],lastTime=0,started=0,width=0,height=0,disposed=false;
   function motionAllowed(){if(media?.matches)return false;try{if(scope.localStorage.getItem('arcadeAnimations')==='off')return false;}catch{}return true;}
   function stopParticles(){if(frame!==null)scope.cancelAnimationFrame(frame);frame=null;particles=[];canvas.hidden=true;canvas.width=canvas.height=1;context=null;}
   function cancel(){if(timer!==null)scope.clearTimeout(timer);timer=null;stopParticles();badge.hidden=true;}
   function draw(time){
     frame=null;if(disposed||doc.hidden||!context){cancel();return;}
     if(!started)started=lastTime=time;
     const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;
     context.clearRect(0,0,width,height);
     const age=(time-started)/1000;
     for(const p of particles){
       p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=480*dt;p.angle+=p.spin*dt;
       context.save();context.translate(p.x,p.y);context.rotate(p.angle);context.globalAlpha=Math.max(0,Math.min(1,(2.05-age)/.65));context.fillStyle=p.color;
       if(p.note){context.font='bold '+Math.round(p.size*2.3)+'px sans-serif';context.textAlign='center';context.fillText(p.note,0,0);}
       else context.fillRect(-p.size/2,-p.size/3,p.size,p.size*.65);
       context.restore();
     }
     if(age<2.05)frame=scope.requestAnimationFrame(draw);else stopParticles();
   }
   function celebrate(){
     cancel();if(disposed||doc.hidden)return false;badge.hidden=false;
     timer=scope.setTimeout(()=>{timer=null;cancel();},2300);
     if(!motionAllowed())return true;
     width=Math.max(1,scope.innerWidth);height=Math.max(1,scope.innerHeight);const scale=Math.min(2,scope.devicePixelRatio||1);
     canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);context=canvas.getContext('2d');
     if(!context)return true;context.setTransform(scale,0,0,scale,0,0);canvas.hidden=false;
     const total=width<600?54:84;
     particles=Array.from({length:total},(_,i)=>({x:width*.5,y:Math.min(height*.42,300),vx:(Math.random()-.5)*Math.min(620,width*1.15),vy:-190-Math.random()*280,angle:Math.random()*6.28,spin:(Math.random()-.5)*9,size:5+Math.random()*6,color:colors[i%colors.length],note:i%8===0?(i%16===0?'♪':'♫'):null}));
     started=lastTime=0;frame=scope.requestAnimationFrame(draw);return true;
   }
   function renderStreak(value){
     if(disposed)return;const current=Math.max(0,Math.floor(value.current||0)),record=Math.max(current,Math.floor(value.best||0));
     if(count.textContent!==String(current))count.textContent=String(current);
     if(best.textContent!==String(record))best.textContent=String(record);
     count.classList.toggle('is-long',String(current).length>4);hud.dataset.tier=current>=100?'century':current>=20?'milestone':'base';
     hud.setAttribute('aria-label','Note streak: '+current+'. Best this visit: '+record+'.');
   }
   const reduce=()=>{if(!motionAllowed())stopParticles();},hidden=()=>{if(doc.hidden)cancel();};
   media?.addEventListener?.('change',reduce);scope.addEventListener('storage',reduce);scope.addEventListener('resize',cancel);scope.addEventListener('pagehide',cancel);doc.addEventListener('visibilitychange',hidden);
   return {renderStreak,celebrate,cancel,destroy(){if(disposed)return;cancel();disposed=true;media?.removeEventListener?.('change',reduce);scope.removeEventListener('storage',reduce);scope.removeEventListener('resize',cancel);scope.removeEventListener('pagehide',cancel);doc.removeEventListener('visibilitychange',hidden);canvas.remove();badge.remove();}};
 };
})(window);
