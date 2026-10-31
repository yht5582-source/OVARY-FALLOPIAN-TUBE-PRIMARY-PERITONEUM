/* 卵巢癌・輸卵管癌・原發性腹膜癌 教學分流引擎（純函式，瀏覽器與 node 共用）
   依據：ASCO 2025 NACT 指引更新、ASCO Living Guideline 2026.1.0（PARP、復發全身治療）、
   ESMO 2026 Express Update、FIGO 2014 分期。資料核對 2026-10-31。 */
(function(root){
const SRC={
  nact:['ASCO 2025 新輔助化療','https://pmc.ncbi.nlm.nih.gov/articles/PMC11934100/'],
  parp:['ASCO 2026 PARP','https://ascopubs.org/doi/10.1200/JCO-26-02412'],
  relapse:['ASCO 2026 復發治療','https://ascopubs.org/doi/10.1200/JCO-26-01591'],
  esmo:['ESMO 2026 Express Update','https://pmc.ncbi.nlm.nih.gov/articles/PMC12947637/'],
  esgo:['ESGO–ESMO–ESP 共識','https://www.esgo.org/media/2025/08/Pocket-Guidelines_Ovarian-cancer-consensus.pdf'],
  nci:['NCI PDQ','https://www.cancer.gov/types/ovarian/hp/ovarian-epithelial-treatment-pdq'],
  figo:['FIGO 2014','https://pmc.ncbi.nlm.nih.gov/articles/PMC4397237/']
};
const SETTING={new:'新診斷',response:'一線治療後',relapse:'復發／進展'};
const STAGE={early:'疑似／確認 I–II 期',advanced:'III–IV 期'};

/* d: setting new|response|relapse; stage early|advanced; tissue hg|otherEpi|nonEpi|pending;
   resect likely|unlikely|highrisk|unknown; bev yes|no; biomarker brca|hrd|negative|unknown;
   response cr|sd|unknown; platinum eligible|ineligible|unknown; priorParp yes|no;
   lines 1-3|4+; fra (bool); secondary (bool) */
function pathway(d){
  d=Object.assign({setting:'new',stage:'advanced',tissue:'hg',resect:'unknown',bev:'no',biomarker:'unknown',response:'unknown',platinum:'unknown',priorParp:'no',lines:'1-3'},d||{});
  const fra=d.fra===true||d.fra==='on'||d.fra==='yes';
  const secondary=d.secondary===true||d.secondary==='on'||d.secondary==='yes';
  const r={code:'',tone:'go',title:'',points:[],warnings:[],links:[],label:SETTING[d.setting]+(d.setting==='relapse'?'':' · '+STAGE[d.stage])};
  const add=(...k)=>k.forEach(x=>{if(!r.links.includes(SRC[x]))r.links.push(SRC[x]);});

  if(d.tissue==='nonEpi'){
    r.code='nonEpi';r.tone='stop';r.title='先釐清病理亞型，不套用此路徑';
    r.points=['此工具討論侵襲性上皮性癌（卵巢、輸卵管、原發性腹膜）；邊緣性腫瘤、生殖細胞、性索間質腫瘤的分期手術、保留生育與輔助治療完全不同。','送婦癌病理複核並提交多專科會議。'];
    add('nci','esgo');return r;
  }
  if(d.tissue==='otherEpi')r.warnings.push('低惡性度漿液性、亮細胞、黏液性等組織型對化療、PARP 抑制劑與 mirvetuximab 的反應不同；試驗證據主要來自高級別漿液性／類子宮內膜癌，須獨立評估。');

  if(d.setting==='new'){
    if(d.stage==='early'){
      r.code='early';r.title='疑似早期：完整手術分期，依病理風險決定輔助治療';
      r.points=['由婦癌醫師執行完整手術分期：腹膜沖洗、全子宮及雙側附件、大網膜、腹膜多點切片及骨盆／主動脈旁淋巴結評估。','記錄組織型別、級別、包膜狀態與 IC 子期（IC1 術中溢出、IC2 術前破裂或表面腫瘤、IC3 腹水／沖洗陽性）。','低惡性度、嚴格選擇的 IA／IB 可考慮追蹤；高級別或 IC 以上依病理風險討論含鉑輔助化療。','所有上皮性卵巢癌在診斷時都應提供胚系（及腫瘤）基因檢測。'];
      if(d.tissue==='pending')r.warnings.push('早期疑似病灶不宜術前經皮穿刺，以免造成包膜破裂；病理由分期手術取得。');
      add('esgo','nci','nact');return r;
    }
    add('nact');
    const nactPoints=['以含鉑雙藥（carboplatin＋paclitaxel）作新輔助化療。','對化療有反應或穩定者，於不超過 4 個療程後施行間隔減積手術（ICS）。','III 期、體能良好且腎功能足夠者，ICS 時可考慮 HIPEC。','ICS 後繼續化療至共 6 個療程，可選擇加入 bevacizumab；之後提供已核准的維持治療。','若新輔助化療期間進展：再次切片確認診斷，補做未完成的分子檢測，考慮其他化療、臨床試驗或安寧照護。'];
    if(d.resect==='unknown'){
      r.code='assess';r.tone='caution';r.title='先完成可切除性與體能評估';
      r.points=['婦癌醫師評估 CA-125、腹盆腔 CT 及胸部影像，判斷病灶分布與完整減積（無肉眼殘存）的可能性。','評估體能狀態、營養、共病與圍手術期風險。','診斷時即提供胚系與腫瘤 BRCA1/2 檢測；BRCA 陰性時安排經驗證的 HRD 檢測。'];
    }else if(d.resect==='likely'){
      r.code='pcs';r.title='適合手術且高機率完整減積：初次減積手術';
      r.points=['ASCO 2025：適合手術且高度可能完整減積者，建議初次減積手術（PCS）。','術後含鉑雙藥化療共 6 個療程，可加 bevacizumab；同時完成 BRCA／HRD 檢測，規劃一線維持治療。'];
      if(d.tissue==='pending')r.points.push('組織病理可由手術取得；若最終改走新輔助化療，則必須先有侵襲癌的組織學確認。');
    }else{
      r.code='nact';r.title=d.resect==='highrisk'?'圍手術期風險高：新輔助化療':'難以完整減積：新輔助化療';
      r.points=[d.resect==='highrisk'?'ASCO 2025：圍手術期風險高者應接受新輔助化療。':'ASCO 2025：適合手術但不太可能完整減積者，建議新輔助化療。'].concat(nactPoints);
      if(d.tissue==='pending'){r.code='nact-biopsy';r.tone='stop';r.title='新輔助化療前：先取得侵襲癌組織證實';r.points.unshift('開始新輔助化療前必須有侵襲性卵巢癌的組織學確認，優先影像導引核心針切片；僅靠 CA-125、影像或腹水細胞學不足以開始治療。');}
    }
    return r;
  }

  if(d.setting==='response'){
    add('parp');
    if(d.stage==='early'){
      r.code='early-maint';r.tone='caution';r.title='早期疾病：不使用 PARP 維持';
      r.points=['ASCO 2026：早期上皮性卵巢癌不建議 PARP 抑制劑維持治療。','依完整手術分期、組織型別與級別完成輔助治療並安排追蹤；BRCA 陽性者轉介遺傳諮詢與家族檢測。'];
      return r;
    }
    if(d.response!=='cr'){
      r.code='no-response';r.tone='stop';r.title=d.response==='sd'?'未達完全／部分反應：不符合一線維持前提':'先確認一線含鉑治療的反應';
      r.points=['一線 PARP 維持的證據對象是含鉑化療後無疾病證據（NED）、完全或部分反應者。',d.response==='sd'?'穩定或進展者視為持續性疾病，以復發／不適合鉑類的路徑重新討論。':'核對影像、CA-125 趨勢與手術結果，再判斷維持治療。'];
      add('relapse');return r;
    }
    if(d.biomarker==='unknown'){
      r.code='test';r.tone='caution';r.title='先完成 BRCA／HRD 檢測';
      r.points=['所有新診斷進階上皮性卵巢癌都應做胚系基因檢測；BRCA 陰性時以 FDA 核准或前瞻驗證的伴隨診斷做腫瘤 HRD 檢測。','結果決定 PARP 單藥、olaparib＋bevacizumab 或其他維持策略。'];
      return r;
    }
    const bevNote=d.bev==='yes'?'一線已合併 bevacizumab：可選 olaparib＋bevacizumab 維持（olaparib 2 年、bevacizumab 共 15 個月）。':'一線未用 bevacizumab：olaparib＋bevacizumab 組合不適用（PAOLA-1 對象為一線含 bevacizumab 且有反應者）。';
    const safety='監測血球、骨髓增生不良症候群／急性骨髓性白血病與肺部併發症。';
    if(d.biomarker==='brca'){
      r.code='brca';r.title='BRCA1/2 致病變異：一線 PARP 維持';
      r.points=['ASCO 2026：PARP 維持應優先用於第一次臨床緩解；BRCA 變異且對含鉑化療有反應者應提供 PARP 單藥維持（olaparib 2 年，或 niraparib 3 年；ESMO 2026 另列 rucaparib 2 年）。',bevNote,'轉介遺傳諮詢與家族串聯檢測。',safety];
    }else if(d.biomarker==='hrd'){
      r.code='hrd';r.title='BRCA 野生型、HRD 陽性：一線 PARP 維持';
      r.points=['ASCO 2026：HRD 陽性且對含鉑化療有反應者應提供 PARP 單藥維持（niraparib；ESMO 2026 另列 rucaparib）。olaparib 單藥的一線證據限於 BRCA 變異。',bevNote,safety];
    }else{
      r.code='hrd-neg';r.tone='caution';r.title='HRD 陰性：ASCO 與 ESMO 建議不同';
      r.points=['ASCO 2026：非 BRCA 變異、HRD 陰性者不建議 PARP 維持。','ESMO 2026：HRD 陰性者可考慮 bevacizumab 維持（共 15 個月）、rucaparib 2 年或 niraparib 3 年；依病灶分布、化療反應與病人特性選擇。','也可選擇觀察；與病人討論無惡化存活獲益與毒性、整體存活資料仍有限。'];
      add('esmo');
    }
    if(d.biomarker!=='negative')add('esmo');
    return r;
  }

  // 復發／進展
  add('relapse');
  if(d.platinum==='unknown'){
    r.code='relapse-assess';r.tone='caution';r.title='先判斷是否適合再用鉑類';
    r.points=['核對影像或臨床進展、前次含鉑療程的反應與間隔、累積毒性（神經病變、過敏）、PARP 抑制劑暴露與病人目標。','不以單次 CA-125 上升自動啟動新療程；未做過分子檢測者補做 BRCA／HRD 與 FRα。'];
    return r;
  }
  if(d.platinum==='eligible'){
    r.code='plat-sens';r.title='適合鉑類的復發：含鉑雙藥 ± bevacizumab';
    r.points=['ASCO 2026：建議含鉑雙藥 — carboplatin 合併 PLD、paclitaxel 或 gemcitabine；可加入 bevacizumab 並接續 bevacizumab 維持。'];
    if(secondary)r.points.push('完整切除可能性高的鉑類敏感復發：可討論二次減積手術（以 AGO 評分等條件選擇病人）；復發時加做 HIPEC 證據不足。');
    else r.points.push('二次減積只在鉑類敏感且高度可能完整切除時討論；復發 HIPEC 證據不足。');
    if(d.priorParp==='no'&&d.biomarker==='brca')r.points.push('未用過 PARP 抑制劑且 BRCA 變異：對二線以上含鉑化療有反應後，可提供 PARP 維持。');
    else r.points.push('復發 PARP 維持限於「未用過 PARP 抑制劑、BRCA 變異、對含鉑化療有反應」者；'+(d.priorParp==='yes'?'已用過 PARP 抑制劑者不再給。':'非 BRCA 變異者不建議（後線試驗出現可能的整體存活不利）。'));
    r.points.push('PARP 抑制劑不在試驗外作為復發的單藥治療，也不與化療、其他標靶或免疫藥物合併。');
    add('parp');return r;
  }
  r.code='plat-res';r.tone='stop';r.title='鉑類抗性／不適合鉑類：非鉑治療';
  const mirvOK=fra&&d.tissue==='hg'&&d.lines==='1-3';
  if(mirvOK){r.code='mirv';r.points.push('ASCO 2026 強烈建議：高級別疾病且經驗證 FRα 高表現者使用 mirvetuximab soravtansine（ESMO 2026：高級別漿液性、PFI <6 個月、FRα ≥75% 存活腫瘤細胞 2+／3+、既往 1–3 線）。','mirvetuximab 需眼科監測：角膜病變、視力模糊；預防性潤滑眼藥並依分級調整劑量。');}
  else if(fra&&d.lines==='4+')r.warnings.push('ESMO 2026 對 mirvetuximab 的建議限既往 1–3 線全身治療；4 線以上須個別討論或參加試驗。');
  else if(fra&&d.tissue!=='hg')r.warnings.push('mirvetuximab 的建議對象是高級別疾病；其他組織型須個別討論。');
  else r.points.push('尚未證實 FRα 高表現：以經驗證的 IHC（≥75% 腫瘤細胞 2+／3+）檢測，決定是否適用 mirvetuximab。');
  r.points.push('其他選項：PLD 單藥、paclitaxel（每週或每 3 週）、化療合併 bevacizumab、relacorilant＋nab-paclitaxel；gemcitabine 單藥為條件性替代。','評估症狀、腸阻塞風險與照護目標，及早整合臨床試驗與安寧緩和照護。');
  add('esmo');return r;
}

const cases=[
{title:'腹水與雙側附件腫塊',stem:'65 歲，腹脹、大量腹水、雙側附件腫塊與大網膜病灶，CA-125 1,800 U/mL。團隊判斷不易完整減積，計畫新輔助化療。',options:['先做影像導引核心針切片證實侵襲癌','CA-125 已明顯升高，直接開始化療','腹水細胞學陽性就足以開始化療'],answer:0,explain:'ASCO 2025：新輔助化療前必須有侵襲性卵巢癌的組織學確認，核心針切片優先。',preset:{setting:'new',stage:'advanced',tissue:'pending',resect:'unlikely'}},
{title:'可完整減積的 IIIC',stem:'58 歲高級別漿液性癌，ECOG 0，影像病灶局限於骨盆與大網膜，婦癌團隊判斷高機率達到無肉眼殘存。',options:['初次減積手術，術後含鉑雙藥 6 個療程','所有 III 期一律先新輔助化療','先單用 PARP 抑制劑'],answer:0,explain:'適合手術且高度可能完整減積者，ASCO 2025 建議初次減積手術。',preset:{setting:'new',stage:'advanced',tissue:'hg',resect:'likely'}},
{title:'圍手術期風險高',stem:'78 歲 IV 期，心衰竭與低白蛋白，腹膜廣泛病灶；核心針切片證實高級別漿液性癌。',options:['含鉑雙藥新輔助化療，≤4 療程後評估間隔減積','等到 6 個療程後才第一次討論手術','先做初次減積以免延誤'],answer:0,explain:'高圍手術期風險者應接受新輔助化療；有反應或穩定者在不超過 4 個療程後施行間隔減積。',preset:{setting:'new',stage:'advanced',tissue:'hg',resect:'highrisk'}},
{title:'BRCA 變異的第一次緩解',stem:'IIIC 高級別漿液性癌，初次減積後 carboplatin＋paclitaxel 6 個療程達完全反應；胚系 BRCA1 致病變異，一線未用 bevacizumab。',options:['提供一線 PARP 單藥維持','olaparib＋bevacizumab 維持','觀察，等復發再用 PARP'],answer:0,explain:'ASCO 2026：PARP 維持優先用於第一次緩解；未用 bevacizumab 者以 PARP 單藥維持。',preset:{setting:'response',stage:'advanced',tissue:'hg',response:'cr',biomarker:'brca',bev:'no'}},
{title:'HRD 陰性的一線緩解',stem:'IIIC、BRCA 野生型、HRD 陰性，完成化療後部分反應，一線未用 bevacizumab。',options:['說明 ASCO 不建議 PARP 維持、ESMO 列有選項，共同決策','一律給 olaparib 單藥','HRD 陰性代表不需追蹤'],answer:0,explain:'ASCO 2026 不建議此群使用 PARP 維持；ESMO 2026 列 bevacizumab、rucaparib、niraparib 為可行選項，須標明版本與地區。',preset:{setting:'response',stage:'advanced',tissue:'hg',response:'cr',biomarker:'negative',bev:'no'}},
{title:'鉑類抗性、FRα 高表現',stem:'高級別漿液性癌，最後一次含鉑化療後 3 個月進展，既往 2 線治療；FRα IHC 85% 腫瘤細胞 2+／3+。',options:['討論 mirvetuximab，並安排眼科監測','鉑類再挑戰一定有效','CA-125 上升即可直接換藥，不需影像'],answer:0,explain:'ASCO 2026 強烈建議經驗證 FRα 高表現的鉑類抗性高級別疾病使用 mirvetuximab；ESMO 2026 條件為 FRα ≥75% 2+／3+、既往 1–3 線。',preset:{setting:'relapse',tissue:'hg',platinum:'ineligible',fra:true,lines:'1-3'}}
];

const quiz=[
{q:'卵巢、輸卵管與原發性腹膜癌採用何種分期？',options:['共用 FIGO 2014 分期','三者各有獨立分期','只用 CA-125 分期'],answer:0,explain:'FIGO 2014 將三者合併為同一分期系統，並要求記錄組織型別與原發部位。'},
{q:'FIGO III 期的定義包括？',options:['骨盆外腹膜擴散及／或後腹膜淋巴結轉移','腫瘤限於單側卵巢','肝實質轉移'],answer:0,explain:'III 期為細胞學或組織學證實的骨盆外腹膜擴散及／或後腹膜淋巴結轉移；肝實質轉移屬 IVB。'},
{q:'準備新輔助化療前最重要的確診步驟？',options:['組織學確認侵襲癌，優先核心針切片','腹水量足夠即可','CA-125/CEA 比值'],answer:0,explain:'ASCO 2025：新輔助化療前需組織學確認侵襲性卵巢癌。'},
{q:'適合手術且高機率完整減積的進階病人？',options:['初次減積手術','一律新輔助化療','觀察'],answer:0,explain:'ASCO 2025：適合手術且高度可能完整減積者建議初次減積。'},
{q:'新輔助化療有反應或穩定時，間隔減積的時機？',options:['不超過 4 個療程後','完成 6 個療程後','無需手術'],answer:0,explain:'ASCO 2025：對化療有反應或穩定者於 ≤4 療程後施行間隔減積。'},
{q:'初診上皮性卵巢癌的基因檢測？',options:['胚系與腫瘤 BRCA；BRCA 陰性時做 HRD','只驗 HPV','復發後再驗即可'],answer:0,explain:'ASCO 2025／2026：所有病人診斷時都應提供胚系與體細胞檢測，BRCA 陰性加做經驗證的 HRD 檢測。'},
{q:'PARP 抑制劑維持應優先用於何時？',options:['第一次臨床緩解','第三次復發後','與化療同時給予'],answer:0,explain:'ASCO 2026：進階上皮性卵巢癌的 PARP 維持應優先用於第一次臨床緩解。'},
{q:'ASCO 2026 對非 BRCA 變異、HRD 陰性的一線 PARP 維持？',options:['不建議','一律建議','只依 CA-125 決定'],answer:0,explain:'ASCO 2026 不建議；ESMO 2026 仍列 rucaparib、niraparib 為選項，需註明版本。'},
{q:'適合再用鉑類的復發，ASCO 2026 建議？',options:['含鉑雙藥（合併 PLD、paclitaxel 或 gemcitabine）','PARP 抑制劑單藥治療','只做局部放療'],answer:0,explain:'ASCO 2026：鉑類敏感復發提供含鉑雙藥，可加 bevacizumab。PARP 單藥不在試驗外作為復發治療。'},
{q:'鉑類抗性高級別疾病、FRα 經驗證高表現？',options:['mirvetuximab soravtansine','FRα 與治療選擇無關','未檢測 FRα 也可直接給'],answer:0,explain:'ASCO 2026 強烈建議 mirvetuximab，前提是經驗證的 FRα 高表現。'}
];

const quizAdvanced=[
{q:'腫瘤限於單側卵巢，術前已發現包膜破裂，腹水細胞學陰性。FIGO 2014 期別？',options:['IC2','IC1','IC3','IA'],answer:0,explain:'IC1＝手術中溢出；IC2＝術前包膜破裂或卵巢／輸卵管表面有腫瘤；IC3＝腹水或腹膜沖洗液有惡性細胞。',src:'figo'},
{q:'術後病理：腹膜無病灶，僅一顆主動脈旁淋巴結轉移，最大徑 12 mm。FIGO 2014 期別？',options:['IIIA1(ii)','IIIA1(i)','IIIA2','IIIC'],answer:0,explain:'IIIA1 為僅後腹膜淋巴結陽性：轉移 ≤10 mm 為 IIIA1(i)，>10 mm 為 IIIA1(ii)。IIIA2 為骨盆外顯微腹膜侵犯。',src:'figo'},
{q:'大網膜 6 cm 病灶，肝臟包膜表面種植但肝實質無侵犯，胸水細胞學陰性。FIGO 2014 期別？',options:['IIIC','IVB','IVA','IIIB'],answer:0,explain:'骨盆外肉眼腹膜轉移 >2 cm 為 IIIC，包含延伸至肝脾包膜而無實質侵犯；肝脾實質轉移才是 IVB，胸水細胞學陽性為 IVA。',src:'figo'},
{q:'下列何者屬 FIGO 2014 IVB？',options:['腹股溝淋巴結轉移','胸水細胞學陽性','骨盆外顯微腹膜侵犯','後腹膜淋巴結轉移'],answer:0,explain:'IVB 包括實質器官轉移與腹腔外器官轉移（含腹股溝淋巴結與腹腔外淋巴結）；胸水細胞學陽性為 IVA，後腹膜淋巴結屬 IIIA1。',src:'figo'},
{q:'IIIC 高級別漿液性癌，ECOG 1、腎功能正常，新輔助化療 3 個療程後部分反應。關於間隔減積，何者符合 ASCO 2025？',options:['施行間隔減積，可考慮 HIPEC，術後補足共 6 個療程','需完成 6 個療程後才能手術','HIPEC 僅限 IV 期','間隔減積後不再需要化療'],answer:0,explain:'ASCO 2025：反應或穩定者於 ≤4 療程後間隔減積；III 期、體能良好、腎功能足夠者 ICS 時可考慮 HIPEC；術後化療完成共 6 個療程，可加 bevacizumab。',src:'nact'},
{q:'新輔助化療 2 個療程後影像顯示明顯進展，下一步最符合 ASCO 2025？',options:['再次切片確認診斷，補做分子檢測，考慮其他化療／試驗／安寧','照原方案完成 6 個療程','立即行間隔減積','加入 PARP 抑制劑合併化療'],answer:0,explain:'新輔助化療中進展者應再次切片確認診斷，未完成者補做基因與分子檢測；選項為其他化療、臨床試驗及／或安寧照護。',src:'nact'},
{q:'一線 carboplatin＋paclitaxel＋bevacizumab 後部分反應，BRCA 野生型、HRD 陽性。何者最符合 ASCO 2026？',options:['olaparib＋bevacizumab 維持','niraparib＋bevacizumab 維持','olaparib 單藥（BRCA 野生型亦有一線核准）','HRD 陽性不需維持'],answer:0,explain:'ASCO 2026：一線含 bevacizumab 且有反應、BRCA 變異或 HRD 陽性者可給 olaparib＋bevacizumab。PARP 抑制劑不與其他標靶藥合併（olaparib＋bevacizumab 除外）；olaparib 單藥一線證據限 BRCA 變異。',src:'parp'},
{q:'一線化療後完全反應，BRCA 野生型、HRD 陰性，未用 bevacizumab。何者正確描述 2026 指引差異？',options:['ASCO 不建議 PARP 維持；ESMO 列 rucaparib 2 年或 niraparib 3 年為可行選項','兩者都建議所有人用 olaparib','兩者都禁止任何維持治療','ESMO 僅建議 PARP 與化療併用'],answer:0,explain:'ASCO 2026 不建議 HRD 陰性 PARP 維持；ESMO 2026 依 ATHENA-MONO 與 PRIMA，對 HRD 陰性列 bevacizumab 15 個月、rucaparib 2 年或 niraparib 3 年。',src:'esmo'},
{q:'一線曾用 niraparib 維持，3 年後鉑類敏感復發，BRCA 野生型；二線含鉑化療後部分反應。何者符合 ASCO 2026？',options:['不建議再次 PARP 維持；含鉑雙藥時可加 bevacizumab 並接續維持','改用另一種 PARP 抑制劑維持','PARP 抑制劑單藥作為下一線治療','PARP 抑制劑合併免疫治療'],answer:0,explain:'ASCO 2026：復發 PARP 維持主要限於未用過 PARP、BRCA 變異且對二線以上含鉑化療有反應者；後線 PARP 單藥治療可能有整體存活不利，不在試驗外使用。',src:'parp'},
{q:'鉑類敏感首次復發，單一骨盆病灶，前次手術完整切除，ECOG 0，腹水 <500 mL。關於手術，何者符合 ASCO 2026？',options:['可討論二次減積手術；復發時 HIPEC 證據不足','一律建議二次減積加 HIPEC','復發後不可再手術','只在鉑類抗性時考慮手術'],answer:0,explain:'ASCO 2026：證據不足以常規建議二次減積或 HIPEC，但鉑類敏感且高度可能完整切除者可討論二次減積（例如符合 AGO 評分：ECOG 0、腹水 <500 mL、初次手術完整切除）。',src:'relapse'}
];

root.OV={pathway,cases,quiz,quizAdvanced,SRC};
})(typeof globalThis!=='undefined'?globalThis:this);
