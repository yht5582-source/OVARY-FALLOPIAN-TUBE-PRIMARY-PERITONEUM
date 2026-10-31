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

const {nhi,nhiSummary}=globalThis.OV;
const st=(r,drug)=>r.rows.find(x=>x.drug===drug).status;

test('NHI first-line bevacizumab: stage IV after primary surgery only',()=>{
  assert.equal(st(nhi({setting:'first',stage:'iv',surgery:'pcs'}),'Bevacizumab'),'covered');
  assert.equal(st(nhi({setting:'first',stage:'iv',surgery:'nact'}),'Bevacizumab'),'check');
  assert.equal(st(nhi({setting:'first',stage:'iii'}),'Bevacizumab'),'no');
  assert.match(nhi({setting:'first',stage:'iv',biomarker:'brca'}).notes.join(' '),/17 個療程/);
});

test('NHI maintenance: olaparib BRCA only, niraparib BRCA/HRD+, 2 years',()=>{
  const b=nhi({setting:'maint',stage:'iii',response:'yes',biomarker:'brca'});
  assert.equal(st(b,'Olaparib 單藥'),'covered');assert.equal(st(b,'Niraparib 單藥'),'covered');
  const h=nhi({setting:'maint',stage:'iii',response:'yes',biomarker:'hrd'});
  assert.equal(st(h,'Olaparib 單藥'),'no');assert.equal(st(h,'Niraparib 單藥'),'covered');
  assert.match(h.rows.find(x=>x.drug==='Niraparib 單藥').text,/限用 2 年/);
  const n=nhi({setting:'maint',stage:'iii',response:'yes',biomarker:'negative'});
  assert.ok(['Olaparib 單藥','Niraparib 單藥','Olaparib＋bevacizumab'].every(k=>st(n,k)==='no'));
  assert.equal(st(nhi({setting:'maint',stage:'early',response:'yes',biomarker:'brca'}),'Olaparib 單藥'),'no');
  assert.equal(st(nhi({setting:'maint',stage:'iv',response:'no',biomarker:'brca'}),'Niraparib 單藥'),'no');
  assert.equal(st(nhi({setting:'maint',biomarker:'unknown'}),'Niraparib 單藥'),'check');
});

test('NHI olaparib+bevacizumab needs first-line bevacizumab and HRD',()=>{
  assert.equal(st(nhi({setting:'maint',bev:'yes',biomarker:'hrd'}),'Olaparib＋bevacizumab'),'covered');
  assert.equal(st(nhi({setting:'maint',bev:'no',biomarker:'hrd'}),'Olaparib＋bevacizumab'),'no');
  assert.equal(st(nhi({setting:'maint',bev:'yes',biomarker:'negative'}),'Olaparib＋bevacizumab'),'no');
});

test('NHI recurrence: bevacizumab only 6–12 months and no prior first-line bev',()=>{
  assert.equal(st(nhi({setting:'recur',pfi:'6to12',priorBev:'no'}),'Bevacizumab'),'covered');
  assert.equal(st(nhi({setting:'recur',pfi:'6to12',priorBev:'yes'}),'Bevacizumab'),'no');
  assert.equal(st(nhi({setting:'recur',pfi:'lt6'}),'Bevacizumab'),'no');
  assert.equal(st(nhi({setting:'recur',pfi:'gt12'}),'Bevacizumab'),'no');
  const r=nhi({setting:'recur',pfi:'lt6'});
  assert.equal(st(r,'PLD（Lipo-Dox、Caelyx）'),'covered');assert.equal(st(r,'Topotecan 注射劑'),'covered');
  assert.equal(st(r,'Mirvetuximab soravtansine'),'none');assert.equal(st(r,'PARP 抑制劑維持'),'no');
});

test('every pathway code with a Taiwan summary resolves; others empty',()=>{
  for(const c of ['pcs','nact','nact-biopsy','assess','brca','hrd','hrd-neg','early-maint','plat-sens','plat-res','mirv'])assert.match(nhiSummary(c),/^健保第九節（115.9.22）：/);
  assert.equal(nhiSummary('nonEpi'),'');
});
