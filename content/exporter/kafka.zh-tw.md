---
title: Kafka Exporter
---

`Kafka Exporter` 用於接收 GRAVITY 資料節點的資料，並即時推送至 Kafka 訊息佇列系統。

---

## 快速安裝

若要安裝 Kafka Exporter，可以準備一個部署容器的 YAML 檔案（exporter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-exporter-kafka:
     image: "brobridgehub/gravity-exporter-kafka:v2.0.0"
     hostname: gravity-exporter-kafka
     restart: always
     environment:

       # GRAVITY 的連線資訊
       GRAVITY_EXPORTER_KAFKA_GRAVITY_HOST: 172.17.0.1:4222

       # 目標 Kafka 主機的連線資訊
       GRAVITY_EXPORTER_KAFKA_KAFKA_HOSTS: 172.17.0.1:9092,172.17.0.1:9093,172.17.0.1:9094

       # 設定要訂閱的資料集(my_collection)，以及要寫入的 Topic (my_topic)
       GRAVITY_EXPORTER_KAFKA_SUBSCRIPTION_SETTINGS: |
        {
          "subscriptions": {
            "my_collection": [
              "my_topic"
            ]
          }
        }
{{< /highlight >}}

然後執行以下命令：

```shell
docker-compose -f exporter.yaml up -d
```

---

## 組態參數設定

若要設定 Kafka 資料輸出器（Exporter），可以藉由代入環境變數（Environment Variable）來達成，以下將對輸出器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_EXPORTER_KAFKA_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_EXPORTER_KAFKA_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料節點的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料輸出器連接上資料節點，並註冊成為合法的資料接收端。

參數						| 資料型態	| 預設值				| 說明
---						| ---		| ---					| ---
GRAVITY.HOST					| 字串		|					| 目標 GRAVITY 之完整連線資訊（172.17.0.1:4222）
GRAVITY.DOMAIN					| 字串		| gravity				| 指定目標 GRAVITY 資料節點之 Domain
SUBSCRIBER.SUBSCRIBER_ID			| 字串		| kafka_exporter			| 指定資料輸出器在資料節點上的唯一識別 ID
SUBSCRIBER.SUBSCRIBER_NAME			| 字串		| Kafka Exporter			| 指定資料輸出器的顯示名稱

---

### 目標 Kafka 連線資訊

這裡是所有關於 Kafka 的參數，用於讓資料輸出器連接上目標 Kaka 主機。

參數				| 資料型態	| 預設值	| 說明
---				| ---		| ---		| ---
KAFKA.HOSTS			| 字串		|		| 目標 Kafka Cluster 完整連線資訊（以逗號隔開，如：172.17.0.1:9092,172.17.0.1:9093,172.17.0.1:9094）

---

### 進階設定

這裡是所有關於資料輸出器的進階設定。

參數					| 資料型態		| 預設值		| 說明
---					| ---			| ---			| ---
SUBSCRIBER.VERBOSE			| 布林職		| false			| 是否顯示完整除錯訊息
SUBSCRIBER.PIPELINE_START		| 整數			| 0			| 指定接收範圍的起始管線，不得大於最終管線的數值。通常資料節點會將資料做分區處理，分為多個管線進行推送，我們可以指定要接收特定範圍的管線資料，實現資料分片（Sharding）或部分資料處理的需求。
SUBSCRIBER.PIPELINE_END			| 整數			| -1			| 指定接受範圍的最終管線，若設定 -1 為起始管線之後的所有管線。
INITIAL_LOAD.ENABLED			| 布林職		| true			| 是否啟用初始載入機制
INITIAL_LOAD.OMITTED_COUNT		| 整數			| 100000		| 指定與資料節點落差筆數。當因為系統異常、網路異常而導致資料落差過大時，會以初始化載入機制（Initial Load）重新輸出。

---

### 資料訂閱規則設定

GRAVITY 資料節點有多個資料集可供訂閱，透過設定 `GRAVITY_EXPORTER_KAFKA_SUBSCRIPTION_SETTINGS` 環境變數，可以指定要訂閱的資料集名稱。資料輸出器會依據設定，從指定的資料集（Collection）中獲取資料，然後寫入到目標 Kafka 的 Topic。

以下設定格式用於表示資料集和對應 Topic 的關係：

```json
{
	"subscriptions": {
		"<資料集 A>": [
			"<Topic A>",
			"<Topic B>"
		],
		"<資料集 B>": [
			"<Topic C>",
			"<Topic D>"
		]
	}
}
```

{{< hint info >}}
**多 Topic 發送**

一個資料集的事件可以發送到多個不同的 Topic，滿足一些終端應用程式的需求。
{{< /hint >}}
