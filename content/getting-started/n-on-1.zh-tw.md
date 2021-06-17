---
title: 多對一管線
weight: 5
---

多對一管線用於收集多個資料源的資料，然後進行聚合、關聯處理。實務上，多對一管線被用於實現合併複寫（Merge Replication）以跨資料庫系統的資料關聯，或是用於改善瞬間巨量寫入時的場景，將分流寫入的資料匯整到指定的落地資料庫。

{{< mermaid class="text-center">}}
flowchart LR
	sourceA([源頭資料庫 A]) --> |推送資料更新| adapterA(資料源適配器 A\nAdapter)
	sourceB([源頭資料庫 B]) --> |推送資料更新| adapterB(資料源適配器 B\nAdapter)

	subgraph GRAVITY
	adapterA --> gravity{{GRAVITY\n資料節點}}
	adapterB --> gravity{{GRAVITY\n資料節點}}
	gravity{{GRAVITY\n資料節點}} --> transmitterA(資料傳輸器\nTransmitter)
	end

	transmitterA(資料傳輸器\nTransmitter) --> |寫入資料| targetA([目標資料庫])

	class gravity gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapterA,adapterB adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitterA transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class sourceA,sourceB,targetA database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}


