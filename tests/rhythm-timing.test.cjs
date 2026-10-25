const test=require('node:test'),assert=require('node:assert/strict');
const timing=require('../rhythm-timing.js');
const round=(targets=[0,.5,1,1.5],tolerance=.1)=>({targets,tolerance,taps:[],matched:new Set(),extras:0});

test('every Tap Practice turn has eight listening beats, four preparation beats, and eight playing beats',()=>{
 for(const index of [0,1,2,17]){
  const start=index*20;
  assert.deepEqual(timing.phaseAt(start),{kind:'listen',index,beat:0});
  assert.equal(timing.phaseAt(start+7.999).kind,'listen');
  for(let count=1;count<=4;count++)assert.deepEqual(timing.phaseAt(start+7+count),{kind:'count-in',index,beat:count-1,count});
  assert.deepEqual(timing.phaseAt(start+12),{kind:'play',index,beat:0});
  assert.equal(timing.phaseAt(start+19.999).kind,'play');
  assert.equal(timing.playerStartBeat(index),start+12);
 }
 assert.deepEqual(timing.phaseAt(20),{kind:'listen',index:1,beat:0});
 assert.equal(timing.phaseAt(-3.5).kind,'initial-count');
});

test('Play Along keeps its original sixteen-beat cycle without the extra preparation count',()=>{
 for(const index of [0,1,7]){
  assert.deepEqual(timing.phaseAt(index*16,false),{kind:'listen',index,beat:0});
  assert.deepEqual(timing.phaseAt(index*16+8,false),{kind:'play',index,beat:0});
  assert.equal(timing.playerStartBeat(index,false),index*16+8);
 }
});

test('warm-up taps are unscored and cannot become misses, extras, early hits, or stored input',()=>{
 const r=round();
 for(const time of [-3,-1,-.5,-.221]){
  assert.equal(timing.grade(r,time).warmup,true);assert.equal(r.matched.size,0);assert.equal(r.extras,0);assert.deepEqual(r.taps,[]);
 }
});

test('an opening downbeat gets a small early grace and the boundary repeat cannot double count',()=>{
 const r=round([0,.125,.25,.375]);
 const first=timing.grade(r,-.18);assert.equal(first.hit,true);assert.equal(first.openingGrace,true);
 assert.equal(r.matched.size,1);assert.equal(r.taps.length,1);assert.equal(r.extras,0);
 assert.equal(timing.grade(r,-.01).warmup,true);
 assert.equal(timing.grade(r,.02).warmup,true);assert.equal(r.matched.size,1);assert.equal(r.extras,0);assert.equal(r.taps.length,1);
 assert.equal(timing.grade(r,.125).hit,true);assert.equal(r.matched.size,2,'Fast note two is still independently playable');
 assert.equal(timing.grade(r,.25).hit,true);assert.equal(timing.grade(r,.375).hit,true);
 assert.equal(r.extras,0);assert.equal(r.matched.size,4);
});

test('opening grace never fills a rest or an absent target',()=>{
 for(const targets of [[.5,1,1.5],[]]){
  const r=round(targets);
  for(const time of [-.2,-.01])assert.equal(timing.grade(r,time).warmup,true);
  assert.equal(r.matched.size,0);assert.equal(r.taps.length,0);assert.equal(r.extras,0);
  assert.equal(timing.grade(r,0).hit,false);assert.equal(r.extras,1,'A tap during a written rest after the count is still extra');
 }
});

test('ordinary later-note tolerance and duplicate/extra grading remain unchanged',()=>{
 const r=round([0,.5,1]);
 assert.equal(timing.grade(r,0).hit,true);const later=timing.grade(r,.41);assert.equal(later.hit,true);assert.equal(later.openingGrace,false);assert.equal(timing.grade(r,.41).hit,false);
 assert.equal(timing.grade(r,.7).hit,false);assert.equal(r.extras,2);
 assert.equal(timing.grade(r,.99).hit,true);assert.equal(r.matched.size,3);
});

test('event timestamps use the audio clock and bounded recent-event latency',()=>{
 assert.equal(timing.inputTime(10,900,1000),9.9);
 assert.equal(timing.inputTime(10,1000,1000),10);
 assert.equal(timing.inputTime(10,0,1000),10,'An old event cannot seek back into an earlier phase');
 assert.equal(timing.inputTime(10,1100,1000),10,'A mismatched clock cannot seek into the future');
 assert.equal(timing.inputTime(10,NaN,1000),10);
 assert.equal(timing.inputTime(.05,900,1000),0,'Input time cannot be negative');
});
