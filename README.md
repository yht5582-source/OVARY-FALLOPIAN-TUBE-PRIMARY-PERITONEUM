# 卵巢癌・輸卵管癌・原發性腹膜癌｜臨床教學

繁體中文互動教學網站，涵蓋 FIGO 分期、侵襲性上皮性癌的診斷與手術決策、BRCA／HRD、一線維持及復發治療，並提供六個示範病例、基礎 10 題與高階 10 題附解析考題。

網站：https://yht5582-source.github.io/OVARY-FALLOPIAN-TUBE-PRIMARY-PERITONEUM/

本頁僅供醫療人員教學，不自動診斷或開立個別治療。病理、影像、手術風險、藥物適應症、當地核准及給付，均需由婦癌多專科團隊核對。不同指引對 HRD 陰性的一線 PARP 維持選項存在差異，請注意版本。

## 原始資料

- [ASCO／SGO 2025 新輔助化療指引](https://pmc.ncbi.nlm.nih.gov/articles/PMC11934100/)
- [ASCO 2026 PARP 抑制劑 Living Guideline](https://ascopubs.org/doi/10.1200/JCO-26-02412)
- [ASCO 2026 復發全身治療 Living Guideline](https://ascopubs.org/doi/10.1200/JCO-26-01591)
- [ESGO–ESMO–ESP 卵巢癌共識](https://www.esgo.org/media/2025/08/Pocket-Guidelines_Ovarian-cancer-consensus.pdf)
- [ESMO 2026 Express Update](https://pmc.ncbi.nlm.nih.gov/articles/PMC12947637/)
- [NCI PDQ：卵巢／輸卵管／腹膜癌](https://www.cancer.gov/types/ovarian/hp/ovarian-epithelial-treatment-pdq)
- [FIGO 共用分期原始文獻](https://pmc.ncbi.nlm.nih.gov/articles/PMC4397237/)

## 檔案

- `index.html`、`style.css`、`app.js`：頁面與互動（一般 script，可直接以 file:// 開啟）
- `clinical.js`：教學分流引擎 `OV.pathway()`、病例與題庫
- 測試：`node --test tests/clinical.test.cjs`

## v2.0（2026-10-31）

- 決策分流依 ASCO 2025 NACT、ASCO 2026 PARP／復發 Living Guideline、ESMO 2026 Express Update 重寫：尚無病理時 PCS 可進行、NACT 須先切片；ICS ≤4 療程、HIPEC、NACT 中進展；一線維持需 NED／CR／PR，olaparib＋bevacizumab 只在一線用過 bevacizumab；HRD 陰性 ASCO／ESMO 並列；復發 PARP 維持限制、二次減積、mirvetuximab 條件（高級別、FRα ≥75% 2+／3+、既往 1–3 線）。
- 修正：考題正解位置原為固定循環（B、C、A…）→ 改為隨機；`<option hidden>` 在 iOS Safari 無效 → 改為晶片按鈕並依階段顯示欄位；隱藏欄位的值不再影響結果；結果即時更新；FIGO IC2 補上「表面腫瘤」。
- 新增高階 10 題（FIGO 子期、HIPEC、NACT 進展、PARP 組合與復發限制、二次減積），計分與進度條，病例可帶入互動決策，快速情境、FIGO 子期階梯、深色模式、複製摘要。

## v2.1（2026-10-31）

- 新增「台灣健保給付檢核」：逐條比對《全民健康保險藥品給付規定》第九節 抗癌瘤藥物（115.9.22 更新）— 9.2 carboplatin、9.4 gemcitabine、9.5.1 paclitaxel、9.14 PLD、9.16.1 topotecan、9.37.3 bevacizumab、9.85.1 olaparib／niraparib；rucaparib、mirvetuximab 無條文。
- 互動決策結果分列「國際規範」與「台灣規範」。

資料核對：2026-10-31。
