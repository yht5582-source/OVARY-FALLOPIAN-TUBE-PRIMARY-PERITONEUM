const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const form=$('#decision'),result=$('#result');
let lastText='';

function readForm(){const d=Object.fromEntries(new FormData(form));d.fra=!!d.fra;d.secondary=!!d.secondary;d.priorParp=d.priorParp||'no';d.lines=d.lines||'1-3';return d;}
function setValue(k,v){
  const el=form.elements[k];if(!el)return;
  if(el instanceof RadioNodeList)el.value=v;else el.checked=v===true||v==='yes'||v===el.value&&v!=='on';
}
function applyPreset(p){
  form.reset();
  Object.entries(p).forEach(([k,v])=>setValue(k,v));
  renderPath();
  $('#pathway').scrollIntoView({behavior:'smooth'});
}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>applyPreset(JSON.parse(b.dataset.preset))));

const HINT={new:'先確認病理與可切除性；早期病灶以完整手術分期與病理風險討論。',response:'一線維持的前提：進階期、含鉑化療後 NED／完全或部分反應，以及 BRCA／HRD 結果。',relapse:'先判斷再用鉑類是否合適，再核對 PARP 暴露、BRCA 與 FRα。'};
function syncFields(d){
  const s=d.setting,adv=d.stage==='advanced';
  $('#stage-field').hidden=s==='relapse';
  $('#pending-opt').hidden=s!=='new';
  if(s!=='new'&&d.tissue==='pending'){form.elements.tissue.value='hg';d.tissue='hg';}
  $('#resect-field').hidden=!(s==='new'&&adv);
  $('#response-field').hidden=$('#bev-field').hidden=!(s==='response'&&adv);
  $('#biomarker-field').hidden=!((s==='response'&&adv)||(s==='relapse'&&d.platinum==='eligible'));
  $('#platinum-field').hidden=s!=='relapse';
  $('#relapse-extra').hidden=s!=='relapse'||d.platinum==='unknown';
  form.elements.priorParp.closest('label').hidden=$('#secondary-opt').hidden=d.platinum!=='eligible';
  $('#fra-opt').hidden=$('#lines-opt').hidden=d.platinum!=='ineligible';
  $('#form-hint').textContent=HINT[s];
}
// 隱藏欄位的值不可影響結果
function visibleData(d){
  const hide=id=>$(id).hidden;
  if(hide('#resect-field'))d.resect='unknown';
  if(hide('#response-field')){d.response='unknown';d.bev='no';}
  if(hide('#biomarker-field'))d.biomarker='unknown';
  if(hide('#secondary-opt'))d.secondary=false;
  if(form.elements.priorParp.closest('label').hidden)d.priorParp='no';
  if(hide('#fra-opt')){d.fra=false;d.lines='1-3';}
  return d;
}
const TONE={go:'tone-go',caution:'tone-caution',stop:'tone-stop'};
function renderPath(){
  const d=readForm();syncFields(d);
  const r=OV.pathway(visibleData(d));
  result.className='result '+TONE[r.tone];
  const tw=OV.nhiSummary(r.code);
  lastText=[`【卵巢癌教學決策】${r.label}`,r.title,...r.points.map(x=>'・'+x),...r.warnings.map(w=>'⚠ '+w),...(tw?['台灣規範：'+tw]:[]),'國際規範：'+r.links.map(l=>l[0]).join('、'),'（教學用途，非個別醫療建議）'].join('\n');
  result.innerHTML=`<p class="eyebrow">TUMOR BOARD PATHWAY · ${esc(r.label)}</p><h3>${esc(r.title)}</h3><ul>${r.points.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${r.warnings.map(w=>`<p class="warn">⚠ ${esc(w)}</p>`).join('')}${tw?`<p class="tw"><b>台灣規範</b>　${esc(tw)} <a href="#nhi">逐條檢核 →</a></p>`:''}<p class="result-sources"><b class="intl">國際規範</b>　${r.links.map(([l,u])=>`<a target="_blank" rel="noopener" href="${u}">${esc(l)} ↗</a>`).join(' · ')}</p><p class="small">教學提示；以完整病歷及婦癌多專科團隊決策為準。</p>`;
}
form.addEventListener('change',renderPath);
form.addEventListener('submit',e=>{e.preventDefault();renderPath();});
form.addEventListener('reset',()=>setTimeout(renderPath));
$('#copy-result').addEventListener('click',async e=>{
  const b=e.currentTarget;
  try{await navigator.clipboard.writeText(lastText);b.textContent='已複製 ✓';}catch{b.textContent='無法複製';}
  setTimeout(()=>b.textContent='複製摘要',1600);
});

// 台灣健保給付檢核
const nhiForm=$('#nhi-form');
const ST={covered:'條文明列',check:'需確認',no:'未給付',none:'無條文'};
function renderNhi(){
  const d=Object.fromEntries(new FormData(nhiForm));
  const s=d.setting;
  $('#n-surgery').hidden=s!=='first'||d.stage!=='iv';
  $('#n-response').hidden=$('#n-bev').hidden=s!=='maint';
  $('#n-stage').hidden=s==='recur';
  $('#n-bio').hidden=s==='recur';
  $('#n-pfi').hidden=$('#n-priorbev').hidden=s!=='recur';
  const r=OV.nhi(d);
  $('#nhi-result').innerHTML=r.rows.map(x=>`<div class="nhi-row st-${x.status}"><b>${esc(x.drug)}<span class="badge">${ST[x.status]}</span></b><span class="clause">${x.clause==='—'?'第九節無條文':'條文 '+esc(x.clause)}</span><p>${esc(x.text)}</p></div>`).join('');
  $('#nhi-notes').innerHTML=r.notes.map(n=>`<p>${esc(n)}</p>`).join('');
}
nhiForm.addEventListener('change',renderNhi);
renderNhi();

// 目前段落的導覽高亮
const navLinks=[...document.querySelectorAll('nav a')];
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+en.target.id));}),{rootMargin:'-45% 0px -50% 0px'});
navLinks.forEach(a=>{const s=document.querySelector(a.hash);if(s)io.observe(s);});

function shuffle(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function renderSet(items,target,kind){
  const box=$(target),isCase=kind==='病例';
  let answered=0,correct=0;
  const score=isCase?null:$('#quiz-score');
  const updateScore=()=>{
    if(!score)return;
    score.textContent=answered===items.length?`完成！得分 ${correct} / ${items.length}`:answered?`得分 ${correct} / ${answered}（共 ${items.length} 題）`:`共 ${items.length} 題，首次作答計分`;
    $('#quiz-bar').style.width=(answered/items.length*100)+'%';
  };
  box.innerHTML=items.map((x,i)=>{
    const order=shuffle(x.options.length);
    const tag=x.src?'<span class="lv">高階</span>':'';
    return `<article class="${isCase?'case':'quiz-item'}"><small>${kind} ${String(i+1).padStart(2,'0')}${tag}</small><h3>${esc(isCase?x.title:x.q)}</h3>${isCase?`<p>${esc(x.stem)}</p>`:''}<div class="options">${order.map((k,j)=>`<button class="choice" type="button" data-k="${k}">${String.fromCharCode(65+j)}　${esc(x.options[k])}</button>`).join('')}</div><div class="feedback" hidden aria-live="polite"></div></article>`;
  }).join('');
  box.querySelectorAll('article').forEach((card,i)=>{
    const x=items[i];let done=false;
    card.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
      const ok=Number(btn.dataset.k)===x.answer;
      if(!done){done=true;answered++;if(ok)correct++;updateScore();}
      card.querySelectorAll('.choice').forEach(b=>{b.classList.toggle('right',Number(b.dataset.k)===x.answer);b.classList.toggle('wrong',b===btn&&!ok);});
      const fb=card.querySelector('.feedback');fb.hidden=false;fb.className='feedback '+(ok?'ok':'no');
      const src=x.src&&OV.SRC[x.src];
      fb.innerHTML=`<b>${ok?'答對了':'正解：'+esc(x.options[x.answer])}</b>　${esc(x.explain)}${src?` <a href="${src[1]}" target="_blank" rel="noopener">${esc(src[0])} ↗</a>`:''}${isCase&&x.preset?` <button type="button" class="ghost mini">帶入互動決策 →</button>`:''}`;
      const go=fb.querySelector('.mini');if(go)go.addEventListener('click',()=>applyPreset(x.preset));
    }));
  });
  updateScore();
}

// 心智圖：分支預設收合，連線依實際位置繪製
function mapBranch(b,side,i){
  const leaf=x=>{const src=x.src&&OV.SRC[x.src];return `<li><b>${esc(x.k)}</b>　${esc(x.x)}${src?` <cite><a href="${src[1]}" target="_blank" rel="noopener">${esc(src[0])}</a></cite>`:''}${x.tw?' <span class="mm-tw">台灣健保</span>':''}${x.p?` <button type="button" class="mm-go" data-go='${esc(JSON.stringify(x.p))}'>帶入</button>`:''}</li>`;};
  return `<div class="mm-branch ${side}"><button type="button" class="mm-head" aria-expanded="false" aria-controls="mm-${side}${i}"><span class="mm-t">${esc(b.t)}</span><span class="mm-s">${esc(b.s)}</span></button><ul class="mm-leaves" id="mm-${side}${i}" hidden>${b.l.map(leaf).join('')}</ul></div>`;
}
function drawMap(){
  const w=$('#mm'),svg=$('#mm-links');
  if(getComputedStyle(svg).display==='none')return;
  const W=w.getBoundingClientRect(),C=$('#mm-center').getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${W.width} ${W.height}`);
  svg.innerHTML=[...w.querySelectorAll('.mm-branch')].map(b=>{
    const dx=b.classList.contains('dx'),r=b.querySelector('.mm-head').getBoundingClientRect();
    const x1=(dx?C.left:C.right)-W.left,y1=C.top+C.height/2-W.top,x2=(dx?r.right:r.left)-W.left,y2=r.top+r.height/2-W.top,mx=(x1+x2)/2;
    return `<path class="${dx?'dx':'tx'}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
  }).join('');
}
function setBranch(h,open){h.setAttribute('aria-expanded',open);document.getElementById(h.getAttribute('aria-controls')).hidden=!open;}
$('#mm-dx').innerHTML='<h3 class="mm-col dx">診斷與評估</h3>'+OV.mindMap.dx.map((b,i)=>mapBranch(b,'dx',i)).join('');
$('#mm-tx').innerHTML='<h3 class="mm-col tx">治療</h3>'+OV.mindMap.tx.map((b,i)=>mapBranch(b,'tx',i)).join('');
$('#mm').addEventListener('click',e=>{
  const go=e.target.closest('.mm-go');if(go){applyPreset(JSON.parse(go.dataset.go));return;}
  const h=e.target.closest('.mm-head');if(h){setBranch(h,h.getAttribute('aria-expanded')!=='true');drawMap();}
});
const mmAll=open=>{document.querySelectorAll('#mm .mm-head').forEach(h=>setBranch(h,open));drawMap();};
$('#mm-open').addEventListener('click',()=>mmAll(true));
$('#mm-close').addEventListener('click',()=>mmAll(false));
if(window.ResizeObserver)new ResizeObserver(drawMap).observe($('#mm'));else addEventListener('resize',drawMap);
drawMap();

renderPath();
renderSet(OV.cases,'#case-list','病例');
const quizSet=()=>{const m=document.querySelector('input[name="quiz-mode"]:checked').value;return m==='advanced'?OV.quizAdvanced:m==='all'?OV.quiz.concat(OV.quizAdvanced):OV.quiz;};
const renderQuiz=()=>renderSet(quizSet(),'#quiz-list','考題');
renderQuiz();
document.querySelectorAll('input[name="quiz-mode"]').forEach(r=>r.addEventListener('change',renderQuiz));
$('#reset-quiz').addEventListener('click',()=>{renderQuiz();$('#quiz').scrollIntoView({behavior:'smooth'});});
