# Mind RAG Explorer

一个零依赖的静态前端，用来查看这类结果文件：

- `mind_search_results_*.json` / `mind_search_results_*.json.gz`
- `evaluation_metrics_*.json` / `evaluation_metrics_*.json.gz`

## 用法

方式 1：直接从仓库根目录起一个静态服务

```powershell
cd D:\2026\march\mem0\mem0_local
python -m http.server 4173
```

然后打开：

```text
http://localhost:4173/web_ui/index.html
```

这种方式可以直接点页面里的“加载仓库样例”。

方式 2：直接打开 `web_ui/index.html`

- 这种方式下，默认样例按钮通常读不到父目录文件。
- 但仍然可以通过页面上的两个文件按钮手动导入 JSON。

## 页面能力

- 左侧：搜索、Group / Category / 状态筛选、风险排序、问题列表
- 中间：`speaker_a / speaker_b` 切换，查看 `episode / eventlog / rrf` 命中
- 右侧：`LLM / F1 / BLEU / response_time`、参考答案 vs 模型回答、词级 diff
- 右侧补充：从 `locomo10.json` 或 `locomo10.json.gz` 解析 `ground_truth_evidence`
- 调试区：折叠查看 `llm_refer`，用于分析模型引用了哪些记忆
- 右上抽屉：当前条目和当前命中的原始 JSON

## 说明

- `mind_search_results` 比 `evaluation_metrics` 多出的 `category = 5` 条目会保留展示，并标成“无评测”。
- 如果页面是通过本地静态服务打开，会自动尝试从当前目录加载默认数据文件；也可以手动导入 `.json` 或 `.json.gz`。
- 命中卡片里的“支持 xx%”是基于当前问题文本与参考答案/模型回答的关键词重合度做的启发式估计，用来帮助快速定位可能相关的证据，不是严格评测指标。
