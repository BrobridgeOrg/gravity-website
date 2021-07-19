---
title: Oracle
---

`Oracle Adapter` 用於接受 Oracle  的資料，會利用 CDC 監聽 Oracle 資料庫的變更事件，進行即時的資料收集。

---

目前 GRAVITY 支援兩種方式連接 Oracle：

1. Debezium
2. Oracle Adapter 企業版（Enterprise Edition）

{{< hint info >}}
本文將針對 `Oracle Adapter 企業版（Enterprise Edition）` 進行說明，如需使用 Debezium 連接 Oracle 請參考 [Debezium Adapter]({{<relref "../other/debezium.zh-tw.md">}})
{{< /hint >}}

--- 

## 快速安裝

若要安裝 Oracle Adapter，可以準備一個部署容器的 YAML 檔案（adapter.yaml）包括所有的相關設定，如下：

{{< highlight yaml "linenos=table" >}}
version: '3'

services:
   gravity-adapter-oracle:
     image: "brobridgehub/gravity-adapter-oracle:v3.0.0"
     hostname: gravity-adapter-oracle
     restart: always
     environment:

       # GRAVIRT 的連線資訊
       GRAVITY_ADAPTER_ORACLE_GRAVITY_HOST: 172.17.0.1
       GRAVITY_ADAPTER_ORACLE_GRAVITY_PORT: 4222

       # 資料源設定
       GRAVITY_ADAPTER_ORACLE_SOURCE_SETTINGS: |  
        {
	  "sources": {
            "oracle_example": {
              "disabled": false,
              "host": "172.17.0.1",
              "port": 1521,
              "username": "logminer",
              "password": "logminer",
              "dbname": "gravity",
              "initialLoad": true,
              "tables": {
                "users":{
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

若要設定 Oracle 資料源適配器（Adapter），可以藉由代入環境變數（Environment Variable）來達成，以下將對適配器所支援的組態參數進行詳細說明。

{{< hint warning >}}
**本文件的參數方法**

為了讓參數更容易被描述和說明，本文件將以簡化的方式表示各個參數，實際上所有所有環境變數皆以以下方式呈現：

> GRAVITY_ADAPTER_ORACLE_ + <參數名稱>

而參數名稱因為分類，所有的字元「 . 」在環境變數上都將替換成字元「 _ 」表示，例如當我們說參數為 GRAVITY.HOST 時，實際的環境變數為 GRAVITY_ADAPTER_ORACLE_GRAVITY_HOST。
{{< /hint >}}

---

### GRAVITY 資料節點的連線資訊和參數

這裡是所有關於 GRAVITY 的相關參數，用於讓資料源適配器連接上資料節點，並註冊成為合法的資料輸入源。

參數						| 資料型態	| 預設值				| 說明
---							| ---		| ---					| ---
GRAVITY.HOST				| 字串		|						| 目標 GRAVITY 之主機位置
GRAVITY.PORT				| 整數		|						| 目標 GRAVITY 主機之埠號
GRAVITY.DOMAIN				| 字串		| gravity				| 指定目標 GRAVITY 資料節點之 Domain
ADAPTER.ADAPTER_ID			| 字串		| oracle_adapter			| 指定資料源適配器在資料節點上的唯一識別 ID
ADAPTER.ADAPTER_NAME		| 字串		| Oracle Adapter			| 指定資料源適配器的顯示名稱

---

### 資料來源設定

資料源適配器可以指定多個資料庫的來源，透過設定 `GRAVITY_ADAPTER_ORACLE_SOURCE_SETTINGS` 環境變數，可以指定要訂閱的來源資料庫 和 資料表。資料源適配器會依據設定，從指定的來源獲取資料，然後輸入到 GRAVITY 資料節點。

以下設定格式用於設定多個資料源連線和訂閱資訊：

```json
{
	"sources": {
		"<來源名稱>": {
			"disabled": <是否停用此設定>,
			"host": "<來源資料庫主機位置>",
			"port": <來源資料庫埠號>,
			"username": "<來源資料庫連線帳號>",
			"password": "<來源資料庫連線密碼>",
			"dbname": "<來源資料庫名稱>",
			"initialLoad": <使否執行初始化載入>,
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

每個 Oracle 來源可以設定的屬性（Property）說明如下：

來源屬性 					| 資料型態	| 預設值					| 說明
---						| ---		| ---						| ---
disabled					| 布林值	|						| 是否停用此設定
host						| 字串		|						| 來源之主機位置
port						| 整數		|						| 來源主機之埠號
username					| 字串		|						| 來源資料庫連線帳號
password					| 字串		|						| 來源資料庫連線密碼
dbname						| 字串		|						| 來源資料庫名稱
initialLoad					| 布林值	|						| 使否執行初始化載入
tables						| 物件		|						| 指定要接收的資料表清單

來源資料表的設定屬性如下：

屬性 						| 資料型態	| 預設值					| 說明
---						| ---		| ---						| ---
events.snapshot					| 字串		|						| 自定義初始化載入事件的名稱
events.create					| 字串		|						| 自定義建立事件的名稱
events.update					| 字串		|						| 自定義變更事件的名稱
events.delete					| 字串		|						| 自定義刪除事件的名稱

---

### 開啟 Oracle CDC（logminer）

使用`Oracle Adapter` 接受 Oracle 的資料，必須開啟 CDC 監聽 Oracle 資料庫的變更事件，進行即時的資料收集，開啟 CDC 的方式如下：

開啟 archive mode

```
shutdown immediate;
startup mount;
alter database archivelog;
alter database open;
archive log list;
```

開啟最小系統log
```
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
```

建立logminer帳號並給與權限（Oracle Adapter 使用）
```
CREATE TABLESPACE LOGMINER_TBS DATAFILE '/u01/app/oracle/oradata/XE/logminer_tbs.dbf' SIZE 25M REUSE AUTOEXTEND ON MAXSIZE UNLIMITED;
CREATE USER logminer IDENTIFIED BY logminer DEFAULT TABLESPACE LOGMINER_TBS QUOTA UNLIMITED ON LOGMINER_TBS;
GRANT CREATE SESSION TO logminer;
GRANT SELECT ON V_$DATABASE TO logminer;
GRANT FLASHBACK ANY TABLE TO logminer;
GRANT SELECT ANY TABLE TO logminer;
GRANT SELECT_CATALOG_ROLE TO logminer;
GRANT EXECUTE_CATALOG_ROLE TO logminer;
GRANT SELECT ANY TRANSACTION TO logminer;
GRANT SELECT ANY DICTIONARY TO logminer;
GRANT CREATE TABLE TO logminer;
GRANT ALTER ANY TABLE TO logminer;
GRANT LOCK ANY TABLE TO logminer;
```


