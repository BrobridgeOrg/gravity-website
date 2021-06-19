---
title: 一對多管線
weight: 2
---

一對多管線能從單一資料源接收資料，然後將資料同時傳輸到多個接收端。實務上，一對多管線能實現的資料庫多重複寫（Replication）機制，生成多份資料副本，藉由副本數量的擴展來增加資料庫的併發查詢能力。此外，也可以利用一對多管線實現資料分片（Sharding）機制。

{{< mermaid class="text-center">}}
flowchart LR
	source([源頭資料庫]) --> |推送資料更新| adapter(資料源適配器\nAdapter)

	subgraph GRAVITY
	adapter(資料源適配器\nAdapter) --> gravity{{GRAVITY\n資料節點}}
	gravity{{GRAVITY\n資料節點}} --> transmitterA(資料傳輸器\nTransmitter)
	gravity{{GRAVITY\n資料節點}} --> transmitterB(資料傳輸器\nTransmitter)
	end

	transmitterA(資料傳輸器 A\nTransmitter) --> |寫入副本資料| targetA([目標資料庫 A])
	transmitterB(資料傳輸器 B\nTransmitter) --> |寫入副本資料| targetB([目標資料庫 B])

	class gravity gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapter adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitterA,transmitterB transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class source,targetA,targetB database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}


