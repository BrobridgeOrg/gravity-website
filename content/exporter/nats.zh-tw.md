---
title: NATS Exporter
---

`NATS Exporter` 用於接收 GRAVITY 資料節點的資料，並即時推送至 NATS 訊息佇列系統。

---

## 快速安裝

若要安裝 NATS Exporter，可以準備一個部署容器的 YMAL 檔案（exporter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-exporter-nats:
     image: "brobridgehub/gravity-exporter-nats:v3.0.0"
     hostname: gravity-exporter-nats
     restart: always
     environment:

       # GRAVITY 的連線資訊
       GRAVITY_EXPORTER_NATS_GRAVITY_HOST: 172.17.0.1:4222

       # 目標 NATS 主機的連線資訊
       GRAVITY_EXPORTER_NATS_NATS_HOST: 172.17.0.1:32803

       # 設定要訂閱的資料集(my_collection)，以及要寫入的 Topic (my_topic)
       GRAVITY_EXPORTER_NATS_SUBSCRIPTION_SETTINGS: |  
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

若要設定 NATS 資料輸出器（Exporter），可以藉由代入環境變數（Environment Variable）來達成，以下將對輸出器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_EXPORTER_NATS_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_EXPORTER_NATS_GRAVITY_HOST。
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

### 目標 NATS 連線資訊

這裡是所有關於 NATS 的參數，用於讓資料輸出器連接上目標 NATS 主機。

參數				| 資料型態	| 預設值	| 說明
---				| ---		| ---		| ---
NATS.HOST			| 字串		|		| 目標 NATS 完整連線資訊（172.17.0.1:32803）

---

### 資料訂閱規則設定

GRAVITY 資料節點有多個資料集可供訂閱，透過設定 `GRAVITY_EXPORTER_NATS_SUBSCRIPTION_SETTINGS` 環境變數，可以指定要訂閱的資料集名稱。資料輸出器會依據設定，從指定的資料集（Collection）中獲取資料，然後寫入到目標 NATS 的 Topic。

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
