---
title: 客製化打造第一條管線
weight: 2
---

如果你已經閱讀過「快速上手」，應該已經知道 GRAVITY 能透過 Docker 進行快速部署。只不過因為在該文件中並沒有說明設定細節，你可能還不知道如何客製化一條真正有用的資料管線。因此，本文件將延續案例，示範如何打造您的第一條資料管線之外，並會初步針對設定工作進行更多細節說明。

---

## 實作目標

延續快速上手的範例，本文的實作目標仍然是打造一條管線，從 MySQL 即時抄寫所有的變更資料到 PostgreSQL，實現異質資料庫之間的資料抄寫，如下圖所示：

{{< mermaid class="text-center">}}
flowchart LR
	source([MySQL]) --> |推送資料更新| gravity{{GRAVITY}}
	gravity{{GRAVITY}} --> |寫入資料| target([PostgreSQL])

	class gravity gravity;
	classDef gravity fill:#fff,color:#333,stroke:#b00,stroke-width:3px;

	class source,target database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

{{< hint warning >}}
**注意**

這裡假設你已經分別安裝好 MySQL 和 PostgreSQL，如果尚未安裝資料庫系統，請先準備好環境後再繼續進行本文件的指引。
{{< /hint >}}

---

## 環境準備

GRAVITY 使用 NATS 作為核心的訊息交換引擎，再開始一切安裝部署之前，需要先安裝 NATS 元件：

```shell
待補充...
```

正常安裝完成後，NATS 應該會運行在 localhost:4222 之上，接下來我們將會以此位置進行 GRAVITY 的設定。

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
     - GRAVITY_CONTROLLER_GRAVITY_HOST=localhost
     - GRAVITY_CONTROLLER_GRAVITY_PORT=4222
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
       GRAVITY_SYNCHRONIZER_GRAVITY_HOST: localhost
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

### Step 3: 部署資料傳輸器（Transmitter）

{{< tabs "transmitter" >}}
{{< tab "trnsmitter-postgres.yaml" >}}
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

---

## 驗證管線
