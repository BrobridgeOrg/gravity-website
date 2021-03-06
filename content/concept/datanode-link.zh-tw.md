---
title: 資料節點對連鏈路
weight: 4
---

資料節點對連鏈路，可以從另一個資料節點訂閱資料，然後等待進一步處理，通常用於跨組織資料授權管理、跨雲資料整合場景。對於資料系統來說，善用資料節點的對連鏈路進行架構設計，可以構成極具彈性的資料供應架構。

{{< mermaid class="text-center">}}
flowchart LR
	source([源頭資料庫]) --> |推送資料更新| adapter(資料源適配器\nAdapter)

	subgraph GRAVITY A
	adapter(資料源適配器\nAdapter) --> gravityA{{GRAVITY\n資料節點 A}}
	end

	gravityA{{GRAVITY\n資料節點 A}} == Link ==> gravityB{{GRAVITY\n資料節點 B}}

	subgraph GRAVITY B
	gravityB{{GRAVITY\n資料節點 B}} --> transmitterA(資料傳輸器\nTransmitter)
	end

	transmitterA(資料傳輸器\nTransmitter) --> |寫入資料| targetA([目標資料庫])

	class gravityA,gravityB gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapter adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitterA transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class source,targetA database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

---

## 多節點對連

藉由資料節點的對連，可把多個管線相互對接，形成更龐大的資料鏈路，把資料供應到更多地方。組合運用 GRAVITY 的各種機制（如：複寫、快取、分片和聚合等），打造一個可以動態彈性擴展的資料系統，即可用軟體定義的方式，自由改造資料系統架構，不再受到既有資料庫系統能力、硬體規模、距離或區域所限制。

{{< mermaid class="text-center">}}
flowchart LR
	sourceA([源頭資料庫 A]) --> |推送資料更新| adapterA(資料源適配器\nAdapter)

	subgraph 資料代理
	adapterA(資料源適配器\nAdapter) --> gravityA{{GRAVITY\n資料節點 A}}
	end

	sourceB([源頭資料庫 B]) --> |推送資料更新| adapterB(資料源適配器\nAdapter)
	sourceC([源頭資料庫 C]) --> |推送資料更新| adapterB(資料源適配器\nAdapter)

	subgraph 資料聚合
	adapterB(資料源適配器\nAdapter) --> gravityD{{GRAVITY\n資料節點 D}}
	end

	gravityA{{GRAVITY\n資料節點 A}} ==> gravityB{{GRAVITY\n資料節點 B}}
	gravityA{{GRAVITY\n資料節點 A}} ==> gravityC{{GRAVITY\n資料節點 C}}
	gravityD{{GRAVITY\n資料節點 D}} == 授權訂閱 ==> gravityC{{GRAVITY\n資料節點 C}}

	subgraph 資料複寫同步
	gravityB{{GRAVITY\n資料節點 B}} --> transmitterA(資料傳輸器\nTransmitter)
	end

	subgraph 資料分片
	gravityC{{GRAVITY\n資料節點 C}} --> transmitterB(資料傳輸器\nTransmitter)
	gravityC{{GRAVITY\n資料節點 C}} --> transmitterC(資料傳輸器\nTransmitter)
	end

	transmitterA(資料傳輸器\nTransmitter) --> |寫入資料| targetA([副本資料庫])
	transmitterB(資料傳輸器\nTransmitter) --> |寫入分片 A| targetB([分片資料庫 A])
	transmitterC(資料傳輸器\nTransmitter) --> |寫入分片 B| gravityE{{GRAVITY\n資料節點 E}}

	subgraph 資料再分片
	gravityE{{GRAVITY\n資料節點 E}} -.-> more((更多分片\nB1, B2, B3...))
	end

	class gravityA,gravityB,gravityC,gravityD,gravityE gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapterA,adapterB adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitterA,transmitterB,transmitterC transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class sourceA,sourceB,sourceC,targetA,targetB,targetC database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;

	class more others;
	classDef others fill:#555,color:#fff;
{{< /mermaid >}}

{{< hint info >}}
**可以預見的資料節點管理議題**

資料節點有如各系統對外資料存取的代理人，我們可以從資料節點上來輕易實現資料授權、訂閱管控等機制，決定資料供應的流向。隨著資料節點和管線越多，便形成一個巨大的資料鏈路系統，這時就需要引入數據網格（Data Mesh）的概念與技術進行管控。
{{< /hint >}}
