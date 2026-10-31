const test=require('node:test');
const assert=require('node:assert/strict');
require('../clinical.js');
const {pathway,cases,quiz,quizAdvanced,SRC}=globalThis.OV;
const txt=r=>r.points.concat(r.warnings).join(' ');

test('non-epithelial histology stops the pathway in every setting',()=>{
  for(const setting of ['new','response','relapse'])assert.equal(pathway({setting,tissue:'nonEpi'}).code,'nonEpi');
});

test('new advanced: resectability drives PCS vs NACT',()=>{
  assert.equal(pathway({resect:'likely'}).code,'pcs');
  assert.equal(pathway({resect:'unlikely'}).code,'nact');
  assert.equal(pathway({resect:'highrisk'}).code,'nact');
  assert.equal(pathway({resect:'unknown'}).code,'assess');
  assert.match(txt(pathway({resect:'unlikely'})),/不超過 4 個療程/);
  assert.match(txt(pathway({resect:'unlikely'})),/HIPEC/);
  assert.match(txt(pathway({resect:'highrisk'})),/再次切片/);
});

test('no tissue: NACT blocked until biopsy, PCS may proceed',()=>{
  const r=pathway({tissue:'pending',resect:'unlikely'});
  assert.equal(r.code,'nact-biopsy');assert.equal(r.tone,'stop');
  assert.match(txt(r),/核心針切片/);
  assert.equal(pathway({tissue:'pending',resect:'likely'}).code,'pcs');
});

test('early stage: staging surgery, no PARP maintenance',()=>{
  assert.equal(pathway({stage:'early'}).code,'early');
  assert.match(txt(pathway({stage:'early',tissue:'pending'})),/包膜破裂/);
  const m=pathway({setting:'response',stage:'early',biomarker:'brca',response:'cr'});
  assert.equal(m.code,'early-maint');assert.match(txt(m),/不建議/);
});

test('first-line maintenance needs response and biomarker',()=>{
  assert.equal(pathway({setting:'response',biomarker:'brca'}).code,'no-response');
  assert.equal(pathway({setting:'response',biomarker:'brca',response:'sd'}).code,'no-response');
  assert.equal(pathway({setting:'response',response:'cr'}).code,'test');
});

test('BRCA / HRD+ maintenance and bevacizumab combination',()=>{
  const b=pathway({setting:'response',response:'cr',biomarker:'brca',bev:'no'});
  assert.equal(b.code,'brca');assert.match(txt(b),/組合不適用/);
  const h=pathway({setting:'response',response:'cr',biomarker:'hrd',bev:'yes'});
  assert.equal(h.code,'hrd');assert.match(txt(h),/olaparib＋bevacizumab 維持/);
  assert.match(txt(h),/olaparib 單藥的一線證據限於 BRCA/);
});

test('HRD-negative shows ASCO vs ESMO difference',()=>{
  const r=pathway({setting:'response',response:'cr',biomarker:'negative'});
  assert.equal(r.code,'hrd-neg');
  assert.match(txt(r),/ASCO 2026：非 BRCA 變異、HRD 陰性者不建議/);
  assert.match(txt(r),/rucaparib 2 年或 niraparib 3 年/);
  assert.ok(r.links.some(l=>l===SRC.esmo));
});

test('relapse platinum-eligible: doublets, PARP maintenance restriction, secondary surgery',()=>{
  const r=pathway({setting:'relapse',platinum:'eligible',biomarker:'brca',priorParp:'no'});
  assert.equal(r.code,'plat-sens');
  assert.match(txt(r),/PLD、paclitaxel 或 gemcitabine/);
  assert.match(txt(r),/可提供 PARP 維持/);
  assert.match(txt(pathway({setting:'relapse',platinum:'eligible',biomarker:'brca',priorParp:'yes'})),/已用過 PARP 抑制劑者不再給/);
  assert.match(txt(pathway({setting:'relapse',platinum:'eligible',biomarker:'negative'})),/非 BRCA 變異者不建議/);
  assert.match(txt(pathway({setting:'relapse',platinum:'eligible',secondary:true})),/可討論二次減積/);
});

test('relapse platinum-ineligible: mirvetuximab only with FRα, high-grade, 1–3 lines',()=>{
  assert.equal(pathway({setting:'relapse',platinum:'ineligible',fra:true}).code,'mirv');
  assert.equal(pathway({setting:'relapse',platinum:'ineligible',fra:'on'}).code,'mirv');
  assert.equal(pathway({setting:'relapse',platinum:'ineligible'}).code,'plat-res');
  assert.equal(pathway({setting:'relapse',platinum:'ineligible',fra:true,lines:'4+'}).code,'plat-res');
  assert.equal(pathway({setting:'relapse',platinum:'ineligible',fra:true,tissue:'otherEpi'}).code,'plat-res');
  assert.match(txt(pathway({setting:'relapse',platinum:'ineligible'})),/relacorilant/);
  assert.equal(pathway({setting:'relapse'}).code,'relapse-assess');
});

test('other epithelial histology warns but proceeds',()=>{
  const r=pathway({tissue:'otherEpi',resect:'likely'});
  assert.equal(r.code,'pcs');assert.equal(r.warnings.length,1);
});

test('quiz banks: 10 basic + 10 advanced, valid answers and sources',()=>{
  assert.equal(quiz.length,10);assert.equal(quizAdvanced.length,10);
  for(const x of quiz.concat(quizAdvanced,cases)){
    assert.ok(x.options.length>=3);assert.ok(x.answer>=0&&x.answer<x.options.length);assert.ok(x.explain);
    assert.equal(new Set(x.options).size,x.options.length);
  }
  for(const x of quizAdvanced){assert.equal(x.options.length,4);assert.ok(SRC[x.src],x.q);}
  assert.equal(cases.length,6);
  for(const c of cases)assert.ok(pathway(c.preset).code);
});

test('case presets land on the intended pathway',()=>{
  assert.deepEqual(cases.map(c=>pathway(c.preset).code),['nact-biopsy','pcs','nact','brca','hrd-neg','mirv']);
});
