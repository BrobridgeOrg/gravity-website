---
title: REST Exporter
---

`REST Exporter` 用於接收 GRAVITY 資料節點的資料，並即時以呼叫指定 RESTful API 的方式，將資料推送至目標服務。

---

## 快速安裝

若要安裝 REST Exporter，可以準備一個部署容器的 YMAL 檔案（exporter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-exporter-rest:
     image: "brobridgehub/gravity-exporter-rest:v2.0.0"
     hostname: gravity-exporter-rest
     restart: always
     environment:

       # GRAVITY 的連線資訊
       GRAVITY_EXPORTER_REST_GRAVITY_HOST: 172.17.0.1:4222

       # 設定要訂閱的資料集(my_collection)，以及要呼叫的 RESTful API
       GRAVITY_EXPORTER_REST_SUBSCRIPTION_SETTINGS: |
        {
          "subscriptions": {
            "my_collection": [
              {
                "method": "post",
                "uri": "http://172.17.0.1:8080/example",
                "headers": {}
              }
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

若要設定 REST 資料輸出器（Exporter），可以藉由代入環境變數（Environment Variable）來達成，以下將對輸出器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_EXPORTER_REST_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_EXPORTER_REST_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料節點的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料輸出器連接上資料節點，並註冊成為合法的資料接收端。

參數					| 資料型態	| 預設值				| 說明
---					| ---		| ---					| ---
GRAVITY.HOST				| 字串		|					| 目標 GRAVITY 之完整連線資訊（172.17.0.1:4222）
GRAVITY.DOMAIN				| 字串		| gravity				| 指定目標 GRAVITY 資料節點之 Domain
SUBSCRIBER.SUBSCRIBER_ID		| 字串		| nats_exporter				| 指定資料輸出器在資料節點上的唯一識別 ID
SUBSCRIBER.SUBSCRIBER_NAME		| 字串		| NATS Exporter				| 指定資料輸出器的顯示名稱

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

### 資料訂閱規則設定

GRAVITY 資料節點有多個資料集可供訂閱，透過設定 `GRAVITY_EXPORTER_REST_SUBSCRIPTION_SETTINGS` 環境變數，可以指定要訂閱的資料集名稱。資料輸出器會依據設定，從指定的資料集（Collection）中獲取資料，然後呼叫目標的 RESTful API 。

以下設定格式用於表示資料集和對應 RESTful API 的關係：

```json
{
	"subscriptions": {
		"<資料集 A>": [
			{
				"method": "post",
				"uri": "<uri>",
				"headers": {
					"aa": "bb"
				}
			},
			{
				"method": "post",
				"uri": "<uri>",
				"headers": {
					"cc": "dd"
				}
			}
		],
		"<資料集 B>": [
			{
				"method": "post",
				"uri": "<uri>",
				"headers": {
					"aa": "bb"
				}
			},
			{
				"method": "post",
				"uri": "<uri>",
				"headers": {
					"cc": "dd",
					"ee": "ff"
				}
			}
		]
	}
}
```

每個 RESTful API 可以設定的屬性（Property）說明如下：

來源屬性 					| 資料型態	| 預設值				| 說明
---						| ---		| ---					| ---
method						| 字串		|					| get/post/put/delete
uri						| 字串		|					| URI
headers						| 物件		|					| 設定 HTTP 標頭

{{< hint info >}}
**多 RESTful API 呼叫**

一個資料集的事件可以呼叫多個不同的 RESTful API，滿足一些終端應用程式的需求。
{{< /hint >}}
