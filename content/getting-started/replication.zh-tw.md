---
title: 實現資料多副本抄寫
weight: 4
---

本文件將說明如何定義一條管線，利用 GRAVITY 實現做一對多副本抄寫機制。如果你有實現讀寫分離、提升併發查詢量的需求，可以利用本文件所說的方法來快速打造出來。

## 實作目標

本文將會打造一條管線，從一個資料源 MySQL 將資料讀出，然後抄寫至多個個副本資料庫，如下圖所示：

{{< mermaid class="text-center">}}
flowchart LR
	source([MySQL\n資料庫系統]) --> |推送資料更新| gravity{{GRAVITY}}
	gravity((GRAVITY\n數據鏈路節點)) --> |寫入| targetA([MySQL 資料庫\n副本 1])
	gravity((GRAVITY\n數據鏈路節點)) --> |寫入| targetB([MySQL 資料庫\n副本 2])
	gravity((GRAVITY\n數據鏈路節點)) --> |寫入| targetC([MySQL 資料庫\n副本 3])

	class gravity gravity;
	classDef gravity fill:#fff,color:#b00,stroke:#b00,stroke-width:5px;

	class source,targetA,targetB,targetC database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

---

## 實作架構

實現抄寫多個副本的方法，主要藉由建立多個「資料傳輸器（Transmitter）」，從 GRAVITY 資料節點中把資料取出，然後寫到不同的目標資料庫，完整架構如下：

{{< mermaid class="text-center">}}
flowchart LR

	subgraph GRAVITY
	gravity{{GRAVITY\n資料節點}} --> transmitterA
	gravity --> transmitterB
	gravity --> transmitterC
	end

	transmitterA(資料傳輸器 1\nTransmitter) --> |寫入資料| targetA([MySQL])
	transmitterB(資料傳輸器 2\nTransmitter) --> |寫入資料| targetB([MySQL])
	transmitterC(資料傳輸器 3\nTransmitter) --> |寫入資料| targetC([MySQL])

	class gravity gravity;
	classDef gravity fill:#b00,color:#fff,stroke:#800,stroke-width:3px;

	class adapter adapter;
	classDef adapter fill:#555,color:#fff,stroke:#fff,stroke-width:3px;

	class transmitterA,transmitterB,transmitterC transmitter;
	classDef transmitter fill:#222,color:#fff,stroke:#fff,stroke-width:3px;

	class targetA,targetB,targetC database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

---

{{< hint warning >}}
**部署前的假設前提**

這裡假設你已經知道如何設定「資料源適配器」從資料源取得資料，並分別安裝好三座 MySQL 副本資料庫（Port 分別為 5432、5433 和 5434）。若你還不知如何從資料源取得資料，可參考「[客製化打造第一條管線]({{< ref "customized-first-pipe.zh-tw.md" >}})」文件說明。
{{< /hint >}}

---

## 安裝設定與部署

在此範例中，我們將會部署三個資料傳輸器（Transmitter），以分別寫入三個不同的目標資料庫。

{{< tabs "transmitter" >}}
{{< tab "transmitter-mysql-replica-1.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-transmitter-mysql:
     image: "brobridgehub/gravity-transmitter-mysql:v3.0.0"
     hostname: gravity-transmitter-mysql
     restart: always
     environment:

       # NATS 的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_GRAVITY_HOST: 172.17.0.1:4222

       # 目標資料庫的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_HOST: 172.17.0.1
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PORT: 5432
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_USERNAME: mysql
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PASSWORD: 1qaz@WSX
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_DBNAME: gravity

       # 設定要訂閱的資料集(accountData)，以及要寫入的資料表(accounts)
       GRAVITY_TRANSMITTER_MYSQL_SUBSCRIPTION_SETTINGS: |  
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

{{< tab "transmitter-mysql-replica-2.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-transmitter-mysql:
     image: "brobridgehub/gravity-transmitter-mysql:v3.0.0"
     hostname: gravity-transmitter-mysql
     restart: always
     environment:

       # NATS 的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_GRAVITY_HOST: 172.17.0.1:4222

       # 目標資料庫的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_HOST: 172.17.0.1
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PORT: 5433
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_USERNAME: mysql
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PASSWORD: 1qaz@WSX
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_DBNAME: gravity

       # 設定要訂閱的資料集(accountData)，以及要寫入的資料表(accounts)
       GRAVITY_TRANSMITTER_MYSQL_SUBSCRIPTION_SETTINGS: |  
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

{{< tab "transmitter-mysql-replica-3.yaml" >}}
{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-transmitter-mysql:
     image: "brobridgehub/gravity-transmitter-mysql:v3.0.0"
     hostname: gravity-transmitter-mysql
     restart: always
     environment:

       # NATS 的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_GRAVITY_HOST: 172.17.0.1:4222

       # 目標資料庫的連線資訊
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_HOST: 172.17.0.1
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PORT: 5434
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_USERNAME: mysql
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_PASSWORD: 1qaz@WSX
       GRAVITY_TRANSMITTER_MYSQL_DATABASE_DBNAME: gravity

       # 設定要訂閱的資料集(accountData)，以及要寫入的資料表(accounts)
       GRAVITY_TRANSMITTER_MYSQL_SUBSCRIPTION_SETTINGS: |  
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

> 資料傳輸器會從資料節點訂閱所需要的資料集（collection），然後將資料集的資料寫入到指定的資料庫系統（以這範例來說是 MySQL），我們需要設定目標資料庫的連線資訊，讓傳輸器可以順利連接資料庫。在此範例中，每個資料傳輸器將各自連到各自的 MySQL 進行資料抄寫。
>
> 由於我們需要指定訂閱的資料集，需要額外設定 `GRAVITY_TRANSMITTER_MYSQL_SUBSCRIPTION_SETTINGS` 讓傳輸器知道被訂閱的資料集名稱，以及將要寫入的資料表。在上面範例中，我們將訂閱資料節點上的 `accountData` 資料集，並將接受到的寫入到 MySQL 的 `accounts` 資料表。由於三個資料傳輸器的設定都完全一樣，因此會得到三份完全相同的副本資料。

設定好後，進行三個傳輸器的部署部署：

```shell
docker-compose -f transmitter-mysql-replica-1.yaml up -d
docker-compose -f transmitter-mysql-replica-2.yaml up -d
docker-compose -f transmitter-mysql-replica-3.yaml up -d
```

---

## 部署完成後的結果

若將元件設定好並部署完成，資料就會依據我們的設計，將資料節點上的 `accountData` 資料集內容，抄寫至另外三座 MySQL 的 `accounts` 資料表。之後，只要資料源（Data Source）有任何更新進入到資料集（Collection），就會即時同步到三座 MySQL 目標副本資料庫。
