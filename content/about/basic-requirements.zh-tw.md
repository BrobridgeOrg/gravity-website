---
title: 基本系統需求
weight: 4
---

GRAVITY 設計上走輕量、彈性路線，部署規模可以依據實際需求而定，而針對不同考量，目前標準支援兩種部署的環境：

### 以 Docker 進行部署

* Docker-ce 版本 v1.13.0+
* Docker-compose 版本 v1.10.0+
* 網路連線需求
	* 可以連線至 https://broridgeorg.github.io/
	* 可以連線至 https://hub.docker.com/

### 部署於 Kubernetes 容器調度平台（企業版本專屬）

* Kubernetes v1.16.0+
* Harbor
* 網路連線需求
	* 可以連線至 https://broridgeorg.github.io/
	* 可以連線至 https://hub.docker.com/
