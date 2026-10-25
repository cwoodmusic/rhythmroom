/* One audio-clock timeline for listening, preparation, and the player's turn. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RhythmRoomTiming=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const LISTEN_BEATS=8,COUNT_BEATS=4,PLAY_BEATS=8,ROUND_BEATS=20,FOLLOW_BEATS=16,OPENING_GRACE=.22;
 function phaseAt(beat,tapMode=true){
  if(beat<0)return {kind:'initial-count',index:0,beat:beat+COUNT_BEATS,count:Math.max(1,Math.min(4,Math.floor(beat+4)+1))};
  if(!tapMode){const index=Math.floor(beat/FOLLOW_BEATS),local=beat-index*FOLLOW_BEATS;return local<LISTEN_BEATS?{kind:'listen',index,beat:local}:{kind:'play',index,beat:local-LISTEN_BEATS};}
  const index=Math.floor(beat/ROUND_BEATS),local=beat-index*ROUND_BEATS;
  if(local<LISTEN_BEATS)return {kind:'listen',index,beat:local};
  if(local<LISTEN_BEATS+COUNT_BEATS)return {kind:'count-in',index,beat:local-LISTEN_BEATS,count:Math.floor(local-LISTEN_BEATS)+1};
  return {kind:'play',index,beat:local-LISTEN_BEATS-COUNT_BEATS};
 }
 const playerStartBeat=(index,tapMode=true)=>index*(tapMode?ROUND_BEATS:FOLLOW_BEATS)+LISTEN_BEATS+(tapMode?COUNT_BEATS:0);
 function inputTime(audioNow,eventStamp,performanceNow){
  const age=(performanceNow-eventStamp)/1000;
  return Number.isFinite(age)&&age>=0&&age<=.25?Math.max(0,audioNow-age):audioNow;
 }
 function grade(round,elapsed){
  const opening=round.targets[0]===0,first=round.taps.find(t=>t.hit&&t.target===0);
  // Preparation taps are free. Only a tap close to the first downbeat can
  // match it early; an opening rest remains silent and is never a target.
  if(elapsed<0&&(!opening||elapsed< -OPENING_GRACE||round.matched.has(0)))return {hit:false,warmup:true,error:null};
  // A warm-up tap can already have matched beat one. Its immediate repeat
  // at the handoff must not become an accidental extra tap or claim note two.
  const repeatWindow=Math.min(.06,(round.targets[1]??1)*.45);
  if(first&&first.elapsed<0&&elapsed>=0&&elapsed<=repeatWindow)return {hit:false,warmup:true,error:null};
  let nearest=-1,error=Infinity;
  round.targets.forEach((target,i)=>{const diff=elapsed-target;if(!round.matched.has(i)&&Math.abs(diff)<Math.abs(error)){nearest=i;error=diff;}});
  const tolerance=nearest===0&&opening?Math.max(round.tolerance,OPENING_GRACE):round.tolerance;
  const hit=nearest>=0&&Math.abs(error)<=tolerance,openingGrace=hit&&nearest===0&&opening&&Math.abs(error)>.07;
  const value={elapsed,error:Number.isFinite(error)?error:null,hit,target:nearest,openingGrace};
  (round.taps??=[]).push(value);if(hit)round.matched.add(nearest);else round.extras++;
  return {hit,error,openingGrace};
 }
 return Object.freeze({LISTEN_BEATS,COUNT_BEATS,PLAY_BEATS,ROUND_BEATS,FOLLOW_BEATS,OPENING_GRACE,phaseAt,playerStartBeat,inputTime,grade});
});
