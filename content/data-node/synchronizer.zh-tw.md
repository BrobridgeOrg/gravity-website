---
title: Synchronizer 同步器
---

`Synchronizer` 是資料節點中用於處理事件、分類資料並進行資料集（Collection）管理的關鍵元件，讓輸入 GRAVITY 節點的資料可以依據規則被適當處理和儲存，並讓外部資料接收端前來訂閱。

---

## 快速部署

部署 `Synchronizer` 的方法非常簡單，先準備一個容器部署 YAML 檔案（synchronizer.yaml），內容如下：

{{< highlight yaml"linenos=table" >}}
version: '3'

services:
  gravity-synchronizer:
     image: "brobridgehub/gravity-synchronizer:v4.0.0"
     restart: always
     hostname: gravity-synchronizer
     environment:

       # GRAVITY 連線資訊
       GRAVITY_SYNCHRONIZER_GRAVITY_HOST: 172.17.0.1
       GRAVITY_SYNCHRONIZER_GRAVITY_PORT: 4222

       # 事件處理規則設定
       GRAVITY_SYNCHRONIZER_RULES_SETTINGS: |
         {
          "rules": [
            {
              "event": "recordCreated",
              "collection": "records",
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

在準備好 YAML 之後，就可以開始以下列命令進行部署：

```shell
docker-compose -f synchronizer.yaml up -d
```

---

## 組態參數設定

若要設定 Synchronizer ，可以藉由代入環境變數（Environment Variable）來達成，以下將對支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_SYNCHRONIZER_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_SYNCHRONIZER_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料網路的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料源適配器連接上資料節點，並註冊成為合法的資料輸入源。

參數						| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
GRAVITY.HOST				| 字串		|						| 目標 GRAVITY 之主機位置
GRAVITY.PORT				| 整數		|						| 目標 GRAVITY 主機之埠號
GRAVITY.DOMAIN				| 字串		| gravity				| 指定資料節點服務的 Domain

---

### 事件處理規則設定

藉由設定 `GRAVITY_SYNCHRONIZER_RULES_SETTINGS` 環境變數定義資料處理規則，可以讓不同事件有不同的處理方式，規則的設定格式為 `JSON`，如下所示：

```json
{
  "rules": [
	{
	  "event": "<事件名稱>",
	  "collection": "<目標資料集>",
	  "method": "<事件處理方法>",
	  "primaryKey": "<主鍵欄位>",
	  "mapping": [
		{
		  "source": "<資料源欄位名稱>",
		  "target": "<對應的資料欄位名稱>"
		}
	  ]
	}
  ]
}
```

Synchronizer 會依據規則檢查事件名稱，有被列入規則的事件才會被接收和處理，否則將被忽略和丟棄。此外，同一個事件可以有多種處理方式，並分別寫入到不同的資料集之中。

被接受並進行處理的事件，會按照 `method` 屬性所定義的方法並以 `primaryKey` 主鍵欄位的資料唯一值，對 `collection` 所指定的資料集做新增、修改或刪除的動作，最後並生成資料快照。

這裏是每個事件處理規則可以設定的屬性（Property）說明：

規則屬性 					| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
event						| 字串		|						| 事件名稱
collection					| 字串		|						| 要寫入的資料集
method						| 字串		|						| 資料處理方法（insert、update 和 delete）。
primaryKey					| 字串		|						| 資料主鍵的欄位名稱
mapping						| 陣列		|						| 欄位對應設定

欄位對應可以讓事件的資料經過對應轉換後，再存入資料集之中，其屬性欄位說明如下：

屬性	 					| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
source						| 字串		|						| 原始欄位名稱
target						| 字串		|						| 目標欄位名稱
