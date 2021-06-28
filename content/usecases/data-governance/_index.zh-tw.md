---
title: 跨部門資料授權管控
---

當一個組織、企業數位化程度越高，所擁有的資料就越多，這些資料散落在不同部門單位各自的資料庫系統之中，若想要跨單位取得這些資料，往往不是這麼容易，除了執行面上需要大量的溝通討論、技術面上各種效能考量和架構規劃問題，政治管理面上讓部門外部的碰觸內部資料，更是有各種風險存在。可以說，跨部門的資料授權管控，在數位轉型的時代裡，是一件極大難題。

---

## 跨組織部門的資料授權管控問題

跨組織部門取資料時，需要經歷很多的決策、技術性議題，通常非常沒有效率，一些常見的問題如下：

1. 跨團隊、部門組織之溝通效率不佳
2. 資料授權和取得方式沒有統一規範
3. 被存取之資料源有龐大系統壓力
4. 無法支撐高併發查詢之需求
5. 資料存取之安全性有巨大潛在風險
6. 跨系統 ETL 和資料整合效率不彰
7. 網路頻寬壓力巨大

---

## 如何採用 GRAVITY 進行改善？

跨部門的資料存取問題，最重要的是如何「保護資料源的資料庫系統」，無論是減少系統壓力還是確保資料安全性。為了解決這個根本問題，GRAVITY 會為每個資料源建立代理節點，利用資料中繼技術的實現，所有外部存取資料的需求，都是對接代理節點，而不會直接碰觸資料庫系統，可以說這樣的做法能在做任何的資料交換任務前，先建立一道防火牆保護資料源的資料庫系統。

此外，引入 GRAVITY 後，除了技術、效能問題外，跨部門資料授權和管控亦可得到落實，具體效益如下：

1. 跨系統、跨部門資料存取不影響資料源效能
2. 具有統一的方法跨部門訂閱和取得資料
3. 資料訂閱權限可以被管控
4. 能跨系統取得最新的即時資料
5. 代理節點的資料中繼技術，能減少網路頻寬使用量
6. 高併發資料查詢需求可以被滿足

{{< hint warning >}}
**GRAVITY 企業版才支援資料授權機制**

若要實現資料節點的訂閱權限、資料授權管理機制，需要使用 GRAVITY 企業版才能實現。

{{< /hint >}}