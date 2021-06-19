---
title: 資料欄位對應
weight: 6
---

從資料源收集回來的事件，可以依據應用的需求進行欄位的對應轉換，然後存放到資料集（Collection）之中。利用資料欄位對應機制，可以將不同來源或格式的事件，轉成同樣的格式存放或資料聚合。若是有需要抽取事件中的特定少數欄位資料，也可利用此機制來實現。

{{< mermaid class="text-center">}}
flowchart LR


	subgraph 事件欄位
	field_a_name(name)
	field_a_phone(phone)
	field_a_address(address)
	end

	subgraph 對應轉換後
	field_b_fullname(fullname)
	field_b_addr(addr)
	end

	field_a_name(name) --> field_b_fullname(fullname)
	field_a_phone(phone)
	field_a_address(address) --> field_b_addr(addr)

	field_b_fullname --> collectionA(資料集)
	field_b_addr --> collectionA

	class field_a_name,field_a_phone,field_a_address field_a;
	classDef field_a fill:#333,color:#fff,stroke:#fff,stroke-width:3px;

	class field_b_fullname,field_b_addr field_b;
	classDef field_b fill:#666,color:#fff,stroke:#fff,stroke-width:3px;

	class collectionA collection;
	classDef collection fill:#fffe,color:#B00,stroke:#B00,stroke-width:5px;

	class targetA,targetB database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}
