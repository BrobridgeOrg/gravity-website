---
title: 解決批次處理效率和效能衝擊
---

批次作業在傳統的資料處理上是很常見的手法，通常這類型的作業需要對資料庫作大量的查詢，對資料源的壓力非常大，因此不太可能在正常營業時間執行，而必須安排在夜間或是周末等離峰時段才能執行，以免影響正常的業務查詢。

---

## 傳統批次處理所遭遇的問題

越多應用需要執行批次作業，對資料源負擔就越大（包括協助輸出資料的人）。因爲批次處理都會伴隨著瞬間高系統負載，如果還有多個批次作業任務同時執行，對於資料庫的衝擊就更加嚴重了，很容易導致資料源處於超載的窘境。

這情形會導致其他即時查詢回應延遲而導致服務無法正常運作，往往需要提早公告某些服務於批次處理的時段被迫暫停。這當然會讓用戶體驗產生負面影響、損及企業形象或是造成某些程度的營業損失(對於 24x7 的服務來說尤爲嚴重)。

---

## GRAVITY 帶來的好處

得助於 GRAVITY 的快取功能，所有之前查詢過的資料已經存在於數據中臺，利用快照能力同時把最新的資料推送到消費端應用程式的專屬資料庫，因此傳統透過批次作業所供給的資料消費對象在任何時候都已經取得所需資料，而不需要再另行安排批次行程了。

對於源資料庫來說，透過 CDC 技術只需拋出變更事件與變更資料就好，所以不會再有其他資料請求。因此，過往因爲應付批次作業而受到影響的其他服務都可如常運行而不干擾，當然也就消彌了因批次作業影響產生的各種負面效應。

---

## 採用 GRAVITY 之後的作業變更

企業在導入 GRAVITY 之後，相較於傳統的批次作業行爲，將會得到如下這些改良：

* 資料交換不再需要寫多次程式或提供 API。
* 資料平均發送處理，不會有一瞬間的效能衝擊。
* 只讀取資料源一次，即可更新到多個目地端資料庫，實現多重發佈、重複發佈。
* 快取（Cache）機制支撐，可以同時供應多個應用，而不會衝擊資料源。
* 資料源不再需要為了應用端，而花費人力、時間準備資料，同時也大幅度地降低溝通成本。
