---
title: Debezium Adapter
---

`Debezium Adapter` 可以利用第三方 Debezium 工具來接收資料庫的資料變更事件。由於 Debezium 會將資料庫變更事件推送到 Kafka，此資料源適配器會從 Kafka 接收事件，並解析 Debezium 的事件格式。

---

## 快速安裝

若要安裝 Debezium Adapter，可以準備一個部署容器的 YAML 檔案（adapter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-adapter-debezium:
     image: "brobridgehub/gravity-adapter-debezium:v3.0.0"
     hostname: gravity-adapter-debezium
     restart: always
     environment:

       # GRAVIRT 的連線資訊
       GRAVITY_ADAPTER_DEBEZIUM_GRAVITY_HOST: 172.17.0.1
       GRAVITY_ADAPTER_DEBEZIUM_GRAVITY_PORT: 4222

       # 資料源設定
       GRAVITY_ADAPTER_DEBEZIUM_SOURCE_SETTINGS: |  
       {
         "sources": {
           "debezium_source": {
             "host": "192.168.1.221:31563",
             "configs": {
               "connector.class": "io.debezium.connector.oracle.OracleConnector",
               "tasks.max": "1",
               "database.hostname": "192.168.1.111",
               "database.port": "1521",
               "database.dbname": "orcl",
               "database.user": "brobridge",
               "database.password": "123456",
               "database.server.name" : "oracle_002",
               "database.out.server.name" : "dbzxout",
               "database.history.kafka.bootstrap.servers" : "192.168.1.221:30444",
               "database.history.kafka.topic": "oracle_002.public.records",
               "database.schema": "GRAVITY",
               "database.connection.adapter": "logminer",
               "database.tablename.case.insensitive": "true",
               "database.oracle.version": "11"
             },
             "kafka.hosts": "192.168.1.221:30444",
             "tables": {
               "records": {
                 "events": {
                   "snapshot": "recordInitialzed",
                   "create": "recordCreated",
                   "update": "recordUpdated",
                   "delete": "recordDeleted"
                 }
               }
             }
           }
         }
       }
{{< /highlight >}}

然後執行以下命令：

```shell
docker-compose -f adapter.yaml up -d
```

---

## 組態參數設定

若要設定 Debezium 資料源適配器（Adapter），可以藉由代入環境變數（Environment Variable）來達成，以下將對適配器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_ADAPTER_DEBEZIUM_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_ADAPTER_DEBEZIUM_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料節點的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料源適配器連接上資料節點，並註冊成為合法的資料輸入源。

參數						| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
GRAVITY.HOST				| 字串		|						| 目標 GRAVITY 之主機位置
GRAVITY.PORT				| 整數		|						| 目標 GRAVITY 主機之埠號
GRAVITY.DOMAIN				| 字串		| gravity				| 指定目標 GRAVITY 資料節點之 Domain
ADAPTER.ADAPTER_ID			| 字串		| debezium_adapter		| 指定資料源適配器在資料節點上的唯一識別 ID
ADAPTER.ADAPTER_NAME		| 字串		| Debezium Adapter		| 指定資料源適配器的顯示名稱

---

### 資料來源設定

資料源適配器可以指定多個資料來源，透過設定 `GRAVITY_ADAPTER_DEBEZIUM_SOURCE_SETTINGS` 環境變數，可以指定要連接的 Debezium 來源，資料源適配器會依據設定，從指定的來源獲取資料，然後輸入到 GRAVITY 資料節點。

以下設定格式用於設定多個資料源連線資訊：

```json
{
 "sources": {
   "<來源名稱>": {
     "host": "<Debezium 來源主機完整連線位置>",
     "configs": {
       ...
     },
     "kafka.hosts": "<Kafka 主機位置>",
     "tables": {
       "<來源表格名稱>": {
         "events": {
           "snapshot": "<初始化載入事件>",
           "create": "<建立事件>",
           "update": "<更新事件>",
           "delete": "<刪除事件>"
         }
       }
     }
   }
 }
}
```

設定一組 Debezium 來源需要的屬性（Property）如下：

來源屬性 					| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
host						| 字串		|						| 來源之主機完整位置（例：127.0.0.1:31563）
configs						| 物件		|						| Debezium 支援相關參數設定
kafka.hosts					| 字串		|						| Kafka 的連線資訊
tables						| 物件		|						| 指定要接收的資料表清單

來源資料表的設定屬性如下：

屬性 					| 資料型態	| 預設值				| 說明
---						| ---		| ---					| ---
events.snapshot			| 字串		|						| 自定義初始化載入事件的名稱
events.create			| 字串		|						| 自定義建立事件的名稱
events.update			| 字串		|						| 自定義變更事件的名稱
events.delete			| 字串		|						| 自定義刪除事件的名稱
