---
title: NATS Adapter
---

`NATS Adapter` 用於從 NATS Cluster 接收即時的事件資料，並將資料輸入進 GRAVITY 資料節點儲存。

---

## 快速安裝

若要安裝 NATS Adapter，可以準備一個部署容器的 YMAL 檔案（adapter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-adapter-nats:
     image: "brobridgehub/gravity-adapter-nats:v3.0.0"
     hostname: gravity-adapter-nats
     restart: always
     environment:

       # GRAVIRT 的連線資訊
       GRAVITY_ADAPTER_NATS_GRAVITY_HOST: 172.17.0.1
       GRAVITY_ADAPTER_NATS_GRAVITY_PORT: 4222

       # 資料源設定
       GRAVITY_ADAPTER_NATS_SOURCE_SETTINGS: |  
        {
          "sources": {
            "nats_server": {
              "host": "172.17.0.1",
              "port": 32803,
              "channel": "example.my_topic",
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

若要設定 NATS 資料源適配器（Adapter），可以藉由代入環境變數（Environment Variable）來達成，以下將對適配器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_ADAPTER_NATS_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_ADAPTER_NATS_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料節點的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料源適配器連接上資料節點，並註冊成為合法的資料輸入源。

參數						| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
GRAVITY.HOST				| 字串		|						| 目標 GRAVITY 之主機位置
GRAVITY.PORT				| 整數		|						| 目標 GRAVITY 主機之埠號
GRAVITY.DOMAIN				| 字串		| gravity				| 指定目標 GRAVITY 資料節點之 Domain
ADAPTER.ADAPTER_ID			| 字串		| nats_adapter			| 指定資料源適配器在資料節點上的唯一識別 ID
ADAPTER.ADAPTER_NAME		| 字串		| NATS Adapter			| 指定資料源適配器的顯示名稱

---

### 資料來源設定

資料源適配器可以指定多個訂閱的來源，透過設定 `GRAVITY_ADAPTER_NATS_SOURCE_SETTINGS` 環境變數，可以指定要訂閱的來源主機 和 topic。資料源適配器會依據設定，從指定的來源獲取資料，然後輸入到 GRAVITY 資料節點。

以下設定格式用於設定多個資料源連線和訂閱資訊：

```json
{
	"sources": {
		"<來源名稱 A>": {
			"host": "<來源主機名城稱",
			"port": 32803,
			"channel": "example.topic_a"
		},
		"<來源名稱 B>": {
			"host": "<來源主機名稱>",
			"port": 32803,
			"channel": "example.topic_b"
		},
	}
}
```

每個 NATS 來源可以設定的屬性（Property）說明如下：

來源屬性 					| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
host						| 字串		|						| 來源之主機位置
port						| 整數		|						| 來源主機之埠號
channel						| 字串		|						| 指定訂閱的 topic 或 channel
