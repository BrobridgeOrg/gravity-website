---
title: 舊資料庫系統效能挑戰
---

舊系統之所以難以支撐新應用的發展，是因為應用的資料壓力都集中在資料庫系統之上。而在過去舊系統的設計裡，可能原本就沒有考量到高併發的巨量查詢需求，這導致系統從一開始就不是為此所設計。由於所有的查詢效能表現，都完全仰賴著資料庫系統本身的表現，若又受限於老舊的資料庫技術，很難改善改善併發查詢效率。

如今，當外部應用一個個被建立，存取需求快速增加，造成舊系統將承受來自四面八方的資料查詢壓力，原本有限能力的資料庫系統就崩潰了，或是效能變得極差，連甚至原本自己的業務都無法良好運行。所以，如何高效的隔離並保護舊系統的資料庫，使其不被外部應用存取需求所影響就是關鍵。

不只如此，每當有跨業務系統的資料存取，不同的負責團隊總是架起盾牌，深怕對方在大量取用自家系統資料時，將自己的系統打到崩潰。誰都不願意去擔系統崩潰的責任，於是誰都不好過，最後傷及的是應用的使用者體驗或是業務執行的效率。

關於如何提高舊系統效能，可以參考下列說明：

{{< toc >}}

## 以不改動舊系統前提，擴大資料供給能力

當許多外部應用服務所需的資料，其來源都來自舊系統，有限能力的舊系統資料庫根本無法處理如此大量的查詢、資料交換工作。這代表我們必須要提升舊系統供給資料的能力，才能滿足這些外部應用服務的各種需求。而由於舊系統因為歷史悠久或複雜度高，不只是不易改動既有的系統程式或資料庫系統架構，系統改造成本和風險也極高，因此需要一種非侵入式的方案，在不改動舊系統的前提之下，就能擴大資料供給能力的方式。

在導入 GRAVITY 軟體定義數據中台技術後，可以在既有資料庫系統外形成一個中介保護層，並以外部的資料節點，對舊有資料系統進行快取和副本擴展，讓更多應用可以在不碰觸舊系統的情況下，進行巨量的併發查詢。

---

## 以規範化的資料供應機制，取代人工提取資料

舊系統的資料庫通常經過層層保護，不願意讓外部應用程式直接伸手觸碰。對於該系統的負責團隊來說，外部對資料庫的各式資料需求，是一件痛苦不堪的事。除了需要與外部團隊「溝通」資料介接機制之外，也深怕系統穩定性和安全性受到影響。尤其最沒有效率的是，需要由開發人員去開發各種資料抽取的程式，以提供資料給外部系統。

為解決這問題，GRAVITY 能將資料自動化供應給外部被核可和授權的程式，亦可指定資料供應範圍，限縮外部資料獲取的權限。

---

## 即時供應資料給外部程式

過去為了不要因爬資料造成資料庫系統負擔，資料管理者會以「批次（Batch）」的做法，定期掃描資料庫，並將資料落下存放在特定儲存空間，讓外部系統讀取。此種作法的資料供應效率非常不即時、也沒有效率，若是有許多外部應用程式都需要資料，多次「落檔」處理也會造成資料庫系統的巨大壓力，甚至影響正常業務運行。

採用 GRAVITY 之後，可以監聽資料庫的變更行為，提供最即時的資料輸出，外部應用只需要訂閱資料，即可從舊系統中取得最新、最即時的資料。