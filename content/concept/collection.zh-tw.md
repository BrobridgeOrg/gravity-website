---
title: 事件資料集
weight: 5
---

GRAVITY 的資料節點會在從資料源收集變更事件之後，由內建的資料處理器對事件進行分類聚合工作，最後以「資料集（Collection）」的形式保存，應用可以自由選擇資料集及進行訂閱，接收並取得所需要的資料。

{{< mermaid class="text-center">}}
flowchart LR
	source([資料源\nData Source]) --> eventA(變更事件)
	source --> eventB(新增事件)
	source --> eventC(修改事件)
	source --> eventD(刪除事件)

	eventA --> gravity((資料處理器\nData Handler))
	eventB --> gravity
	eventC --> gravity
	eventD --> gravity

	subgraph GRAVITY 資料節點
	gravity --> |分類儲存| collectionA
	gravity --> |分類儲存| collectionB
	gravity --> collectionC(更多資料集\n...)
	end

	collectionA(資料集 A\nCollection) --> |訂閱資料| targetA([目標資料庫\nTarget])
	collectionB(資料集 B\nCollection) --> |訂閱資料| targetA

	class gravity gravity;
	classDef gravity fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class eventA,eventB,eventC,eventD event;
	classDef event fill:#666,color:#fff,stroke:#fff,stroke-width:3px;

	class collectionA,collectionB,collectionC collection;
	classDef collection fill:#fffe,color:#B00,stroke:#B00,stroke-width:5px;

	class source,targetA database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

---

## 資料集的組成

當事件被分類到資料集後，會以「事件歷史紀錄（Event History）」和「資料快照（Snapshot）」兩種形式保存下來。

### 事件歷史紀錄（Event History）

即時事件會依照寫入的順序記錄下來，供未來進行調閱使用，例如當有系統需要還原特定時間段的資料，可以利用事件歷史紀錄進行還原回復。在一些意外發生時（如：系統暫停、網路中斷），也可以利用事件歷史紀錄，實現資料續傳等機制。

### 資料快照（Snapshot）

資料快照機制會將各種資料變更事件（新增、修改和刪除等）組合成一個完整的資料儲存下來，呈現整體資料的最新狀態。當外部系統需要重建、新增副本時，可以從資料快照取得最新的完整資料，而不需從第一個歷史事件重新回放來還原最新的資料樣態。得益於資料快照機制，可以節省大量資料系統還原、擴充的時間，也能減少資料節點的大量壓力。


---

## 事件分類機制

資料處理器會依據分類規則可將事件分門歸類在一起，並將多個事件聚合成一份完整的資料集。之後，外部的系統就可以跟資料節點訂閱，選擇指定的資料集來獲取資料。

{{< mermaid class="text-center">}}
flowchart TB

	eventA(事件 A) --> collectionA(資料集 A)
	eventA(事件 A) --> collectionB(資料集 B)

	eventB(事件 B) --> collectionA
	eventB(事件 B) --> collectionB

	eventC(事件 C) --> collectionB
	eventD(事件 D) --> collectionB

	collectionA --> targetA([目標資料庫 A])
	collectionA --> targetB([目標資料庫 B])
	collectionB --> targetB([目標資料庫 B])

	class eventA,eventB,eventC,eventD event;
	classDef event fill:#666,color:#fff,stroke:#fff,stroke-width:3px;

	class collectionA,collectionB collection;
	classDef collection fill:#fffe,color:#B00,stroke:#B00,stroke-width:5px;

	class targetA,targetB database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

{{< hint info >}}
**一個事件可以存放至多個資料集**

一些事件可能同時被多個資料集需要，因此會存放於在多個事件集中。
{{< /hint >}}
