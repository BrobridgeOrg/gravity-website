---
title: 技術架構說明
weight: 2
resources:
  - name: architecture
    src: "architecture.png"
    title: "Gravity 整體架構"
---

GRAVITY 是資料庫與資料庫之間溝通的中介層，讓資料庫的資料藉由中介資料節點，可以分流、遷移、複製、快取於不同的系統之中。為了連接和適應各種不同的資料庫系統、應用系統，GRAVITY 被設計得相當輕量，而且具有許多彈性，方便資料管理者、開發人員可以自由部署和設計自己所需的資料系統架構。

## GRAVITY 整體架構

設計上，GRAVITY 主要工作是為資料源建立資料代理節點，然後從資料源接收資料，進行事件保存、分區、快照等工作。讓有需要的應用系統，可以跟資料節點訂閱資料，並將資料落地於指定的資料庫系統、訊息佇列或推送至另一個應用系統。

{{< img name="architecture" size="tiny" lazy=true >}}

GRAVITY 主要由三大元件所組成：

1. 資料源適配器：Adapter
2. 資料節點同步器：Synchronizer
3. 資料傳輸器：Transmitter

### 資料源適配器：Adapter

資料源適配器（Adapter）用於從資料源（Data Source）收集資料，並將資料送入資料節點同步器。

### 資料節點同步器：Synchronizer

資料節點同步器（Synchronizer）會將資料分類保存，並即時生成資料快照（Snapshot）。

### 資料傳輸器：Transmitter

資料傳輸器（Transmitter）會在資料節點上訂閱資料，然後將資料寫入到目標的資料庫、訊息佇列或是應用系統。
