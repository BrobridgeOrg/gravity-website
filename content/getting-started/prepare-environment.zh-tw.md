---
title: 系統環境準備
weight: 2
---

開始搭建任何 GRAVITY 的資料鏈路之前，需要先建構 NATS 的訊息佇列網路，因此在開始一切安裝部署之前，請先確定您有可用的 NATS 服務供 GRAVITY 使用。如果你的環境裡沒有任何可用的 NATS 服務，可以依照本文件的指引進行安裝。本說明文件將會以 Docker Compose 作為安裝 NATS 的說明和示範，可方便於本機或是虛擬機上進行安裝，如果你是在其他平台上，請參閱 NATS 官方文件的其他安裝方法。

首先準備一個 YAML，選擇使用 NATS 的容器映像檔，並開通對外的 4222 連接埠：

{{< tabs "nats" >}}
{{< tab "nats.yaml" >}}
{{< highlight yaml "linenos=table" >}}

version: '3'

services:
   # Gravity Core Components
   internal-nats-server:
     image: "nats:2.2.6"
     restart: always
     expose:
     - "4222"
     ports:
       - "4222:4222"
{{< /highlight >}}
{{< /tab >}}
{{< /tabs >}}

然後於終端機介面執行下列安裝命令：

```shell
docker-compose -f nats.yaml up -d
```

安裝完成後，NATS 服務會運行在 4222 Port，之後我們就會使用 NATS 的連線資訊來設定 GRAVITY 的各個元件。

{{< hint info >}}
**不知道 NATS 服務的完整連線位址？**

因為容器隔離性的問題，在同一台機器上想要從一個容器裡連線另一個容器內的服務，需要知道 Docker 網路介面的 IP 位置，可以用下列命令取得：

```shell
$ ifconfig docker0 | grep 'inet '
inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
```

在這結果情況下，172.17.0.1 就是 Docker 網路介面的 IP 位置。
{{< /hint >}}

{{< hint warning >}}
**可能的安全考量**

如果你擔心與別人共用 NATS 會有資料安全，可以獨立建一組專用的 NATS 網路供 GRAVITY 使用。
{{< /hint >}}
