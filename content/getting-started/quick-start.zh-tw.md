---
title: "快速上手"
---

本文件作爲 Gravity Quick-Start 的快速部署操作指引，將說明如何部署一套最簡單的 Gravity 資料複寫（Replication）管線，從 MySQL 即時抄寫所有的變更資料到 PostgreSQL，實現異質資料庫之間的資料抄寫。

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

此範例將利用 Docker 進行部署，如果測試系統上還沒安裝 docker-compose 套件，請先完成安裝：

```shell
# for Ubuntu:
apt-get install -y docker-compose

# for CentOS:
yum install -y docker-compose
```

如果你已經安裝好 `docker-compose`，那就可以正式開始 Gravity 的安裝。

---

## 安裝 Gravity

待系統環境準備好後，可以開始安裝 Gravity 相關的元件。

### Step 1: 下載 YAML

```shell
wget https://brobridgeorg.github.io/gravity-examples/deployments/docker-compose.yaml
```

### Step 2: 下載資料表定義

```shell
wget https://brobridgeorg.github.io/gravity-examples/deployments/createTable.sql
```

### Step 3: 部署 Gravity 和資料庫

使用 Quick Start 所提供的 YAML 進行部署，會同時部署 MySQL、PostgreSQL 和 Gravity，並以 .sql 檔案定義在資料庫系統中建立資料表：

```shell
docker-compose up -d
```

如果一切順利啟動，沒有任何錯誤，Gravity 會開始監控資料源（MySQL）的資料變化，並將任何變更資料同步一份至目標資料庫（PostgreSQL）。

---

## 驗證 Gravity

如果你想驗證兩個資料庫之間的資料是否有同步，可以試著插入新的紀錄到 MySQL，然後去 PostgreSQL 檢查是否有同步成功。為節省時間，你也可以直接使用我們已經開發好的工具，來驗證 Gravity 管線是否正常：

```shell
docker run -it brobridgehub/gravity-demo-verify:latest sh -c './verify.sh 100'
```

---

## 停止和清理

如果你想停止 Gravity 並清除範例中所產生的資料，可以直接以命令關閉服務：

```shell
docker-compose down
```

確認容器都關閉後，即可以刪除 `*.yaml`、`*.sql` 和相關目錄。
