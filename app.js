const $=s=>document.querySelector(s);
const cases=[['腹水與骨盆腫塊','65 歲腹脹、腹水、雙側附件腫塊與大網膜病灶；考慮先做新輔助化療。',['先取得核心針活檢證實侵襲癌','只靠 CA-125 上升即開始化療','不需胸部及腹盆腔評估'],'ASCO 建議在新輔助化療前取得組織診斷，核心活檢優先。'],['可完整減積的 IIIC','58 歲高級別漿液性癌，體能良好；婦癌團隊判斷可達無肉眼殘存。',['討論初次完整減積手術再接鉑類化療','所有 III 期一律先新輔助化療','先單用 PARP 抑制劑'],'手術適合且高機率完整減積時，ASCO 建議初次減積手術。'],['不適合初次手術','72 歲 IV 期，腹膜廣泛病灶，手術風險高；核心活檢證實上皮性癌。',['鉑類加紫杉醇新輔助化療，回應後評估間隔減積','不需病理即開始治療','等到六個療程後才第一次討論手術'],'符合條件可選新輔助化療；有反應或穩定時通常在不超過四個療程後評估間隔減積。'],['BRCA 變異的初次緩解','III 期高級別漿液性癌，鉑類化療後部分反應，胚系 BRCA1 致病變異。',['評估一線 PARP 維持治療','不需檢視血球及毒性','一律再做手術'],'ASCO 2026 建議一線 BRCA 變異且對鉑類有反應者提供 PARP 維持選項，需核對藥物適應症及毒性。'],['HRD 陰性的一線緩解','III 期、BRCA 野生型且 HRD 陰性，完成化療後緩解。',['核對 ASCO 2026 與當地核准，討論非 PARP 選項與觀察','一律給 olaparib 單藥','因 HRD 陰性取消追蹤'],'ASCO 2026 不建議此群常規 PARP 維持；ESMO 部分選項不同，須標明版本與地區。'],['鉑類不適合的復發','高級別漿液性癌，鉑類後短期進展，腫瘤 FRα 高表現。',['討論非鉑治療，檢視 mirvetuximab 適應性與毒性','保證再給鉑類會有效','只按 CA-125 上升直接治療'],'ASCO／ESMO 2026 支持適合條件下的 FRα 導向治療；仍需考量先前療程、症狀與所在地可近性。']];
const quiz=[['卵巢、輸卵管及原發性腹膜癌採用何種分期關係？',['共用 FIGO 分期','各有完全獨立分期','只用 CA-125 分期'],'三者使用共同 FIGO 系統。'],['FIGO III 期可由何種病灶構成？',['骨盆外腹膜擴散或後腹膜淋巴結','只限單側卵巢','只有遠端肺實質轉移'],'III 期包含骨盆外腹膜及／或後腹膜淋巴結侵犯。'],['準備新輔助化療前最重要的確診步驟？',['組織學確認，優先核心活檢','只看腹水','只看 CA-125'],'ASCO 建議治療前確立侵襲癌組織診斷。'],['適合手術且可高度期待無肉眼殘存？',['考慮初次減積手術','所有人都必須新輔助化療','僅觀察'],'以完整減積可行性及圍手術期風險選擇。'],['新輔助化療有反應時，間隔減積通常？',['在不超過四個療程後評估','無論如何要等十個療程','不再需要手術評估'],'ASCO 建議合適病人在 ≤4 療程後間隔減積。'],['初診進階上皮性癌的分子檢測？',['胚系與腫瘤 BRCA，BRCA 陰性時評估 HRD','只驗 HPV','不需檢測'],'BRCA／HRD 有助於維持治療決策與遺傳諮詢。'],['一線 BRCA 變異且對鉑類有反應？',['評估 PARP 維持選項','只用於原發性腹膜癌','一律排除維持治療'],'ASCO 2026 建議優先於初次緩解使用 PARP 維持。'],['ASCO 2026 對 HRD 陰性、非 BRCA 變異的 PARP 維持？',['不建議常規使用','一律必須使用','只依 CA-125 決定'],'此點與部分 ESMO 選項不同，需核對指引版本。'],['復發適合再用鉑類時？',['考慮鉑類合併方案','只用局部放療','所有病人直接重複 PARP'],'復發治療依再用鉑類的可能性、既往治療及病人狀態。'],['高 FRα、鉑類不適合的復發情境？',['評估 mirvetuximab 適用條件','FRα 與治療無關','未經驗證就直接給藥'],'須有驗證的 FRα 高表現並符合既往治療條件。']];
const source={asconact:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11934100/',ascoparp:'https://ascopubs.org/doi/10.1200/JCO-26-02412',ascorelapse:'https://ascopubs.org/doi/10.1200/JCO-26-01591',nci:'https://www.cancer.gov/types/ovarian/hp/ovarian-epithelial-treatment-pdq'};
function render(items,target,label){
  const isCase=label==='CASE';
  $(target).innerHTML=items.map((item,i)=>{
    const choices=isCase?item[2]:item[1];
    const order=i%3===0?[1,0,2]:i%3===1?[2,1,0]:[0,2,1];
    return `<article class="${isCase?'case':'quiz-item'}"><small>${label} ${String(i+1).padStart(2,'0')}</small><h3>${item[0]}</h3>${isCase?`<p>${item[1]}</p>`:''}<div class="options">${order.map((answer,j)=>`<button type="button" class="choice" data-answer="${answer}">${'ABC'[j]} · ${choices[answer]}</button>`).join('')}</div><div class="feedback" role="status" hidden></div></article>`;
  }).join('');
  $(target).querySelectorAll('article').forEach((article,i)=>article.querySelectorAll('.choice').forEach(button=>button.addEventListener('click',()=>{
    if(!article.querySelector('.feedback').hidden)return;
    const correct=button.dataset.answer==='0';
    article.querySelectorAll('.choice').forEach(b=>{b.disabled=true;b.classList.toggle('correct',b.dataset.answer==='0');b.classList.toggle('incorrect',b===button&&!correct);});
    const explanation=isCase?items[i][3]:items[i][2];
    const panel=article.querySelector('.feedback');panel.hidden=false;panel.textContent=(correct?'答對了。':'再核對：正解為「'+(isCase?items[i][2][0]:items[i][1][0])+'」。')+explanation;
  })));
}
render(cases,'#case-list','CASE');render(quiz,'#quiz-list','QUESTION');
$('#reset').addEventListener('click',()=>{render(quiz,'#quiz-list','QUESTION');$('#quiz').scrollIntoView()});
const form=$('#decision');
function syncForm(){
  const setting=form.elements.setting.value,early=form.elements.stage.value==='early';
  $('#stage-field').hidden=setting==='relapse';
  form.elements.stage.querySelector('[value="recurrent"]').hidden=true;
  if(form.elements.stage.value==='recurrent')form.elements.stage.value='advanced';
  $('#resect-field').hidden=setting!=='new'||early;
  $('#biomarker-field').hidden=setting==='new';
  $('#platinum-field').hidden=setting==='new';
  $('#fra-field').hidden=setting!=='relapse';
  $('#platinum-field').firstChild.textContent=setting==='relapse'?'復發後鉑類再治療適用性':'一線鉑類治療反應';
  if(setting==='response'&& !['response','unknown'].includes(form.elements.platinum.value))form.elements.platinum.value='unknown';
  if(setting==='relapse'&& !['eligible','ineligible','unknown'].includes(form.elements.platinum.value))form.elements.platinum.value='unknown';
  [...form.elements.platinum.options].forEach(option=>option.hidden=setting==='response'?['eligible','ineligible'].includes(option.value):setting==='relapse'?option.value==='response':false);
  $('#form-hint').textContent=setting==='new'?'先確認病理與可切除性；早期病灶以完整手術分期與病理風險討論。':setting==='response'?'先確認期別；進階癌症的一線維持需有對鉑類的完全或部分反應及分子檢測。':'復發治療先判斷再次用鉑類是否合適及既往治療。';
}
form.elements.setting.addEventListener('change',syncForm);
form.elements.stage.addEventListener('change',syncForm);
syncForm();
function showResult(title,points,links){
  $('#result').innerHTML=`<p class="eyebrow">TUMOR BOARD PATHWAY</p><h3>${title}</h3><ul>${points.map(p=>`<li>${p}</li>`).join('')}</ul><p>此為教學提示；以完整病歷及婦癌團隊決策為準。</p><p class="result-sources">對照：${links.map(([label,url])=>`<a target="_blank" rel="noopener" href="${url}">${label} ↗</a>`).join(' · ')}</p>`;
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(form));
  let title='',points=[],links=[];
  if(d.tissue==='other'){
    title='先釐清病理亞型';points=['此工具主要討論侵襲性上皮性癌；邊緣性、非上皮性與特殊組織型需要不同治療路徑。','送婦癌病理複核與多專科會議。'];links=[['NCI',source.nci]];
  }else if(d.tissue==='pending'){
    title='先取得組織病理';points=['不能僅憑 CA-125 或影像直接進入此治療分支。','若計畫新輔助化療，ASCO 要求侵襲癌的組織學確認，優先核心針活檢。'];links=[['ASCO 新輔助化療',source.asconact]];
  }else if(d.setting==='new'&&d.stage==='early'){
    title='疑似早期：完整手術分期與病理風險';points=['由婦癌團隊評估手術分期、組織型別、級別、手術溢出、包膜與腹水／沖洗細胞學。','少數嚴格選擇的低風險 IA／IB 可考慮觀察；其他情境依病理風險評估輔助鉑類化療。'];links=[['NCI',source.nci]];
  }else if(d.setting==='new'){
    links=[['ASCO 新輔助化療',source.asconact]];
    if(d.resect==='unknown'){title='先完成可切除性評估';points=['由婦癌團隊評估影像、病灶分布、體能與共病，預估無肉眼殘存的可能性。','提供胚系與腫瘤 BRCA 檢測；BRCA 陰性時規劃 HRD 檢測。'];}
    else if(d.resect==='likely'){title='可望完整減積：討論初次手術';points=['若手術風險可接受且高機率無肉眼殘存，ASCO 建議初次減積，再接鉑類加紫杉醇化療。','安排 BRCA／HRD 檢測，供一線維持治療討論。'];}
    else{title='初次手術不利：考慮新輔助化療';points=['核心活檢證實侵襲性癌後，考慮鉑類加紫杉醇新輔助化療。','反應或穩定者於不超過四個療程後評估間隔減積；若進展，重新確認診斷及策略。'];}
  }else if(d.setting==='response'){
    links=[['ASCO PARP 2026',source.ascoparp]];
    if(d.stage==='early'){title='早期疾病：不套用進階癌症 PARP 維持';points=['ASCO 2026 不建議早期上皮性卵巢癌使用 PARP 維持。','依完整手術分期、病理型別與風險規劃輔助治療及追蹤。'];}
    else if(d.platinum!=='response'){title='先確認一線治療反應';points=['PARP 維持的教學路徑以前線含鉑治療達完全或部分反應為前提。','核對影像、BRCA／HRD、既往 bevacizumab、血球與器官功能。'];}
    else if(d.biomarker==='brca'){title='BRCA 變異：優先評估一線 PARP 維持';points=['ASCO 2026 建議鉑類反應後的一線 PARP 維持；依既往 bevacizumab、適應症及毒性選擇。','提供遺傳諮詢並監測血球、罕見 MDS／AML 與肺部不良反應。'];}
    else if(d.biomarker==='hrd'){title='HRD 陽性：討論一線維持';points=['ASCO 2026 支持經驗證 HRD 陽性且鉑類有反應者的一線 PARP 單藥；符合條件時可討論 olaparib 合併 bevacizumab。','確認當地核准與給付。'];}
    else if(d.biomarker==='negative'){title='HRD 陰性：標示指引差異';points=['ASCO 2026 不建議非 BRCA 變異、HRD 陰性者常規 PARP 維持。','ESMO 2026 有不同的一線選項；依既往 bevacizumab、疾病與個人風險共同討論觀察或其他策略。'];links.push(['ESMO 2026','https://pmc.ncbi.nlm.nih.gov/articles/PMC12947637/']);}
    else{title='先完成分子檢測';points=['提供胚系與腫瘤 BRCA 檢測；BRCA 陰性時以經驗證方法評估 HRD。','維持治療需連同反應及既往 bevacizumab 核對。'];}
  }else{
    links=[['ASCO 復發 2026',source.ascorelapse]];
    if(d.platinum==='unknown'){title='先評估鉑類再治療適用性';points=['核對影像或臨床進展、病理、前次鉑類及 PARP 暴露、治療間隔、毒性與病人目標。','不以單次 CA-125 上升自動啟動新療程。'];}
    else if(d.platinum==='eligible'){title='復發且適合鉑類：評估合併方案';points=['依既往治療與耐受性，討論 carboplatin 合併 paclitaxel、PLD 或 gemcitabine；適合者可討論 bevacizumab。','復發 PARP 維持依 ASCO 2026 限縮，須確認 PARP 未使用且 BRCA 變異等條件。'];links.push(['ASCO PARP 2026',source.ascoparp]);}
    else{title='復發且鉑類不適合：評估非鉑治療';points=['確認病情與症狀，討論非鉑化療、臨床試驗與支持照護。',d.fra?'若為高級別漿液性癌、FRα 經驗證高表現且符合既往療程，可討論 mirvetuximab 及眼部毒性監測。':'視病理與條件檢視 FRα 等標記；不以 CA-125 單一數值自動決定治療。'];}
  }
  showResult(title,points,links);
});
