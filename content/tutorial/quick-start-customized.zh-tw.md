---
title: "單元二: 打造第二條管線"
weight: 2
---

本文件作爲 Gravity Quick-Start 的快速部署操作指引，更進一步嘗試修改 docker-compose.yaml 來一個手動部署一條 Gravity 資料管線。


{{< mermaid class="text-center">}}
flowchart LR
	source([MySQL\n資料庫系統]) --> |推送資料更新| gravity{{GRAVITY}}
	gravity((GRAVITY\n數據鏈路節點)) --> |寫入資料| target([PostgreSQL\n資料庫系統])

	class gravity gravity;
	classDef gravity fill:#fff,color:#b00,stroke:#b00,stroke-width:5px;

	class source,target database;
	classDef database fill:#eee,color:#555,stroke:#bbb,stroke-width:2px;
{{< /mermaid >}}

## 環境準備

本實作必須依賴前面介紹過的 [Quick-Start Demo]({{<relref "./quick-start.zh-tw.md">}}) 作爲基礎：

*   若您還沒完成，請先[回去實作]({{<relref "./quick-start.zh-tw.md">}})，但忽略最後的“清理”步驟。
    
*   若您已經完成，並完成了“清理”步驟，請回去重新執行 docker-compose -d up 這個命令。
    
---

## 安裝 Gravity

待系統環境準備好後，可以開始安裝 Gravity 相關的元件。

### Step 0: 建立工作目錄

```shell
mkdir demo2
cd demo2
```

### Step 1: 下載 YAML

```shell
wget https://brobridgeorg.github.io/gravity-examples/deployments/demo2/docker-compose.yaml
```

### Step 2: 下載 YAML Sample

```shell
wget https://brobridgeorg.github.io/gravity-examples/deployments/demo2/docker-compose.yaml.sample
```

### Step 3: 建立 table

爲簡化當前的 demo ，我們只會建立兩個 table：上面是建立在來源資料庫(MySQL)、下面那個則是建立在目標資料庫(PostgreSQL)。　

```shell
# Table's schema
create table products(
  name CHAR(80) primary key,
  category CHAR(80),
  warehouse CHAR(80),
  quantity INT
);

create table inventory(
  name CHAR(80) primary key,
  category CHAR(80),
  warehouse CHAR(80),
  quantity INT
);
```

呼叫我們預先寫好的腳本來建立資料表：　

```shell
# Create Table
docker run brobridgehub/gravity-demo-verify:latest sh ./createTables.sh
```

我們可以從結果看到作爲來源的 MySQL 出現 products 這個資料表：

```shell
Show Current MySQL Database's Tables.
Tables_in_gravity
accounts
products
users
```

同時目標資料庫 PostgreSQL 會出現 inventory 這個資料表：

```shell
Show Current PostgreSQL Database's Tables.
           List of relations
 Schema |   Name    | Type  |  Owner   
--------+-----------+-------+----------
 public | accounts  | table | postgres
 public | inventory | table | postgres
 public | users     | table | postgres
(3 rows)

```

{{< hint info >}}
**訊息**

此步驟是要將測試用的來源與目標資料表建立好，如果已經有現成的來源與目標資料庫可以使用，則可略過此步驟。
{{< /hint >}}

### Step 4 修改資料管線設定

在前面步驟下載的檔案中，有一份名爲 docker-compose.yaml.sample 的檔案，我們可以打開它參考其設定。基本上，我們只需要修改所有 ”\_@@xxxxx@@\_“ 的內容，即可完成設定。

以當下 demo 的例子來看，具體的修改大致如下：

|     |     |     |     |
| --- | --- | --- | --- |
| **設定名稱** | **賦值** | **說明** | **所在行號** |
| _\_@@COLLECTION\_NAME@@\__ | inventoryData | 集合名稱 | 37, 61, 85, 109, 140 |
| _\_@@DEST\_TABLE@@\__ | inventory | 目標資料表 | 141 |
| \_@@EVENT\_CREATE@@\_ | inventoryCreated | 事件建立名稱 | 60, 169 |
| \_@@EVENT\_DEL@@\_ | inventoryDeleted | 事件刪除名稱 | 108, 171 |
| \_@@EVENT\_INIT@@\_ | inventoryInitialized | 事件初始化名稱 | 36, 168 |
| \_@@EVENT\_UPDATE@@\_ | inventoryUpdated | 事件更新名稱 | 84, 170 |
| \_@@FIELD\_NAME\_1@@\_ | category | 表格欄位 | 46, 47, 70, 71, 94, 95 |
| \_@@FIELD\_NAME\_2@@\_ | quantity | 表格欄位 | 50, 51, 74, 75, 98, 99, |
| \_@@FIELD\_NAME\_3@@\_ | warehouse | 表格欄位 | 54, 55, 78, 79, 102, 103 |
| _\_@@PORT@@_\_ | 4223 | db連線port | 12, 131, 153 |
| \_@@PRI\_KEY@@\_ | name | 主鍵名稱 | 39, 42, 43, 63, 66, 67, 87, 90, 91, 111, 114, 115 |
| \_@@SRC\_TABLE@@\_ | products | 來源資料表 | 166 |

示範所需，我們已經爲大家建立好一份 docker-compose.yaml 以供直接使用。以上 sample 是爲了方便大家理解。當然您也可以用 sample 復制爲 docker-compose.yaml 然後自行修改也是可以的。

無論如何，請確定其中的欄位名稱要跟來源及目標資料庫所定義的 schema 要一致。


### Step 3: 部署 Gravity

當 docker-compose.yaml 修改好之後，就可以啓用了管線了：

```shell
docker-compose up -d
```

如果一切順利啟動，沒有任何錯誤，Gravity 會開始監控資料源（MySQL）的資料變化，並將任何變更資料同步一份至目標資料庫（PostgreSQL）。

---

## 驗證 Gravity

如果你想驗證兩個資料庫之間的資料是否有同步，可以試著插入新的紀錄到 MySQL，然後去 PostgreSQL 檢查是否有同步成功。為節省時間，你也可以直接使用我們已經開發好的工具，來驗證 Gravity 管線是否正常：

```shell
docker run -it brobridgehub/gravity-demo-verify:latest sh -c './verify2.sh 10'
```

---

## 停止和清理

如果你想停止 Gravity 並清除範例中所產生的資料，可以直接以命令關閉服務：

```shell
docker-compose down
```

確認容器都關閉後，即可以刪除 `*.yaml`、`*.sql` 和相關目錄。
