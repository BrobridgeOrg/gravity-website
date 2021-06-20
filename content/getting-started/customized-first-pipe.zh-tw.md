---
title: 客製化打造第一條管線
weight: 3
---

如果你已經閱讀過「[快速上手]({{< ref "quick-start.zh-tw.md" >}})」，應該已經知道 GRAVITY 能透過 Docker 進行快速部署。只不過因為在該文件中並沒有說明設定細節，你可能還不知道如何客製化一條真正有用的資料管線。因此，本文件將延續案例，示範如何打造您的第一條資料管線之外，並會初步針對設定工作進行更多細節說明。

---

## 實作目標

延續快速上手的範例，本文的實作目標仍然是打造一條管線，從 MySQL 即時抄寫所有的變更資料到 PostgreSQL，實現異質資料庫之間的資料抄寫，如下圖所示：

{{< mermaid class="text-center">}}
flowchart LR
	source([MySQL\n資料庫系統]) --> |推送資料更新| gravity{{GRAVITY}}
	gravity((GRAVITY\n數據鏈路節點)) --> |寫入資料| target([PostgreSQL\n資料庫系統])

	class gravity gravity;
	classDef gravity fill:#fff,color:#b00,stroke:#b00,stroke-width:5px;

	class source,target database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

---

## 實作架構

{{< mermaid class="text-center">}}
flowchart LR
	source([MySQL]) --> |推送資料更新| adapter(資料源適配器\nAdapter)

	subgraph GRAVITY
	adapter(資料源適配器\nAdapter) --> gravity{{GRAVITY\n資料節點}}
	gravity{{GRAVITY\n資料節點}} --> transmitter(資料傳輸器\nTransmitter)
	end

	transmitter(資料傳輸器\nTransmitter) --> |寫入資料| target([PostgreSQL])

	class gravity gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapter adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitter transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class source,target database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

依圖所示，此範例中實作上會由三個部分所組成，形成完整的數據鏈路：

* **MySQL 資料源適配器（Adapter）**

  資料源適配器（Adapter）用於從 MySQL 資料庫系統收集資料變更事件，並將資料送入資料節點。

* **資料節點（Data Node）**

  資料節點會將資料分類壓縮保存，並即時生成資料快照（Snapshot） ，然後等待接受資料傳輸器前來訂閱資料。

* **PostgreSQL 資料傳輸器（Transmitter）**

  資料傳輸器（Transmitter）會在資料節點上訂閱資料，然後將資料寫入到目標的 PostgreSQL 資料庫。

---

{{< hint warning >}}
**請特別檢查您的環境已經準備好**

這裡假設你已經分別安裝好 MySQL 和 PostgreSQL，如果尚未安裝資料庫系統，請先準備好環境後再繼續進行本文件的指引。此外，在開始建構任何管線和資料鏈路之前，你也應該已經確保自己依照「[系統環境準備]({{< ref "prepare-environment.zh-tw.md" >}})」的指引，安裝好相關的基礎環境和設定。
{{< /hint >}}


---

## 安裝設定與部署

### Step 1: 部署 GRAVITY 資料節點

GRAVITY 的資料節點由控制器（Controller）和同步器（Synchronizer）兩個核心元件所組成，我們分別各準備一個 YAML 為其做設定和部署：

{{< tabs "gravity" >}}
{{< tab "controller.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-controller:
     image: "brobridgehub/gravity-controller:v2.0.0"
     hostname: gravity-controller
     restart: always

     # 將 NATS 的連線位置設定在此
     environment:
       GRAVITY_CONTROLLER_GRAVITY_HOST: 172.17.0.1
       GRAVITY_CONTROLLER_GRAVITY_PORT: 4222
{{< /highlight >}}
{{< /tab >}}
{{< tab "synchronizer.yaml" >}}
{{< highlight yaml"linenos=table" >}}
version: '3'

services:
  gravity-synchronizer:
     image: "brobridgehub/gravity-synchronizer:v4.0.0"
     restart: always
     hostname: gravity-synchronizer
     environment:
       GRAVITY_SYNCHRONIZER_GRAVITY_HOST: 172.17.0.1
       GRAVITY_SYNCHRONIZER_GRAVITY_PORT: 4222
       GRAVITY_SYNCHRONIZER_RULES_SETTINGS: |
         {
          "rules": [
            {
              "event": "accountInitialized",
              "collection": "accountData",
              "method": "insert",
              "primaryKey": "id",
              "mapping": [
                {
                  "source": "id",
                  "target": "id"
                },
                {
                  "source": "name",
                  "target": "name"
                }
              ]
            },
            {
              "event": "accountCreated",
              "collection": "accountData",
              "method": "insert",
              "primaryKey": "id",
              "mapping": [
                {
                  "source": "id",
                  "target": "id"
                },
                {
                  "source": "name",
                  "target": "name"
                }
              ]
            }
          ]
         }
{{< /highlight >}}
{{< /tab >}}
{{< /tabs >}}

#### 同步器設定說明

> 同步器的規則設定參數 `GRAVITY_SYNCHRONIZER_RULES_SETTINGS` 需要一個 JSON 格式，其中可以於 `rules` 陣列內定義多組規則，決定收集的資料該如何處理和保存。
>
> 在這範例中定義了兩種規則，讓資料節點只會接受兩種事件 `accountInitialized` 和 `accountCreated`，用於在第一次同步時接受資料源既有資料，以及資料源即時的新資料（當資料源插入資料時）接收。而設定中的 `collection` 是在資料節點的資料集（Collection），我們可以決定要將事件放到指定資料集進行保存，若是多個事件都被指定放入同一個資料集，該資料集就會聚合多個事件的資料。
>
> 然後我們定義了資料欄位的對應表 `mapping`，描述來源資料的欄位 `source`，如何對應到資料集中新的欄位 `target`，在範例中，我們保持了欄位的定義不變，實現完全的資料對超機制。
>
> 最後，為資料決定能唯一識別資料的主鍵（Primary Key），資料節點會依據主鍵進行資料更新、聚合關聯和快照。

在準備好 YAML 之後，就可以開始使用 Docker Compose 進行部署：

```shell
docker-compose -f controller.yaml up -d
docker-compose -f synchronizer.yaml up -d
```

---

### Step 2: 部署資料源適配器（Adapter）

{{< tabs "adapter" >}}
{{< tab "adapter-mysql.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-adapter-mysql:
     image: "brobridgehub/gravity-adapter-mysql:v2.0.0"
     restart: always
     hostname: gravity-adapter-mysql
     environment:

       # NATS 的連線資訊
       GRAVITY_ADAPTER_MYSQL_GRAVITY_HOST: 172.17.0.1
       GRAVITY_ADAPTER_MYSQL_GRAVITY_PORT: 4222

       # 設定資料源的連線資訊，以及監聽指定資料表(users) 的新資料事件
       GRAVITY_ADAPTER_MYSQL_SOURCE_SETTINGS: |
        {
          "sources": {
            "mysql_example": {
              "disabled": false,
              "host": "172.17.0.1",
              "port": 3306,
              "username": "root",
              "password": "1qaz@WSXROOT",
              "dbname": "gravity",
              "initialLoad": true,
              "tables": {
                "users": {
                  "events": {
                    "snapshot": "accountInitialized",
                    "create": "accountCreated"
                  }
                }
              }
            }
          }
        }
{{< /highlight >}}
{{< /tab >}}
{{< /tabs >}}

#### 資料源設定說明

> 在 YAML 檔中代入 `GRAVITY_ADAPTER_MYSQL_SOURCE_SETTINGS` 環境變數可以設定資料源的連線資訊，讓適配器（Adapter）可以去連接資料庫系統以取的事件和資料，由於在這例子中選擇的是 MySQL 的適配器，因此填入的是 MySQL 資料庫的連線資訊。
>
> 此環境變數的內容是 JSON 格式，其中可以在 `sources` 欄位裡設定多組來源，除了要指定連線資訊之外，也需要填入 `tables` 選擇需要監聽的資料表（Table）以及需要處理的事件（Event）。
>
> 上面例子中的設定代表著下列意義：
>
> * 監聽 `users` 資料表。
> * 啟用 `initialLoad` 和監聽 `snapshot` 事件，在第一次啟動時載入完整的既有資料。
> * 監聽 `create` 事件，即時接收被插入（Insert）的資料事件。
>
> 此外，在監聽事件時，需要設定進入到資料節點的事件名稱，事件名稱則對應同步器的事件處理規則設定（`accountInitialized` 和 `accountCreated`）。

進行部署：

```shell
docker-compose -f adapter-mysql.yaml up -d
```

---

### Step 3: 部署資料傳輸器（Transmitter）

{{< tabs "transmitter" >}}
{{< tab "transmitter-postgres.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-transmitter-postgres:
     image: "brobridgehub/gravity-transmitter-postgres:v3.0.0"
     hostname: gravity-transmitter-postgres
     restart: always
     environment:

       # NATS 的連線資訊
       GRAVITY_TRANSMITTER_POSTGRES_GRAVITY_HOST: 172.17.0.1:4222

       # 目標資料庫的連線資訊
       GRAVITY_TRANSMITTER_POSTGRES_DATABASE_HOST: 172.17.0.1
       GRAVITY_TRANSMITTER_POSTGRES_DATABASE_PORT: 5432
       GRAVITY_TRANSMITTER_POSTGRES_DATABASE_USERNAME: postgres
       GRAVITY_TRANSMITTER_POSTGRES_DATABASE_PASSWORD: 1qaz@WSX
       GRAVITY_TRANSMITTER_POSTGRES_DATABASE_DBNAME: gravity

       # 設定要訂閱的資料集(accountData)，以及要寫入的資料表(accounts)
       GRAVITY_TRANSMITTER_POSTGRES_SUBSCRIPTION_SETTINGS: |  
        {
          "subscriptions": {
            "accountData": [
              "accounts"
            ]
          }
        }
     depends_on:
{{< /highlight >}}
{{< /tab >}}
{{< /tabs >}}

#### 目標資料庫設定

> 資料傳輸器會從資料節點訂閱所需要的資料集（collection），然後將資料集的資料寫入到指定的資料庫系統（以這範例來說是 PostgreSQL），我們需要設定目標資料庫的連線資訊，讓傳輸器可以順利連接資料庫。
>
> 由於我們需要指定訂閱的資料集，需要額外設定 `GRAVITY_TRANSMITTER_POSTGRES_SUBSCRIPTION_SETTINGS` 讓傳輸器知道被訂閱的資料集名稱，以及將要寫入的資料表。在上面範例中，我們將訂閱資料節點上的 `accountData` 資料集，並將接受到的寫入到 PostgreSQL 的 `accounts` 資料表。

進行部署：

```shell
docker-compose -f transmitter-postgres.yaml up -d
```

---

## 部署完成及更多客製化

若將元件設定好並部署完成，資料就會依據我們的設計，從 MySQL 的 `users` 資料表抄寫至 PostgreSQL 的 `accounts` 資料表。由於我們只有監聽「新增事件」，所以只有資料新增、插入時的資料，沒有任何事後進行變更（Update）或刪除（Delete）的資料更新。若有更新或刪除的資料同步需求，則再補上事件監聽和事件處理規則即可。

{{< hint warning >}}
**關於適配器和傳輸器的設定參數**

不同的適配器（Adapter）和傳輸器（Transmitter）依據功能和對接系統不同，可能有著截然不同的行為和設定，若有需要知道更多細節，請參考每個元件的專屬說明文件。
{{< /hint >}}
