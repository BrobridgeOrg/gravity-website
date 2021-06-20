---
title: 資料快照機制
weight: 8
resources:
  - name: snapshot
    src: "snapshot.png"
    title: "Gravity 快照機制"
---

GRAVITY 針對所有的事件合併進行資料快照，以保存一份最新的資料內容。當未來下游的系統進行資料還原、副本擴充時，能從快照直接取得最新資料，而無需以巨量歷史事件回放來完成，可大量節省時間。

{{< img name="snapshot" size="medium" lazy=true >}}
