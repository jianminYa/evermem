const DEFAULT_FILES = {
  search: [
    "./mind_search_results_mind_smoke_cat3build_v2.json.gz",
    "./mind_search_results_mind_smoke_cat3build_v2.json",
  ],
  metrics: [
    "./evaluation_metrics_mind_smoke_cat3build_v2.json.gz",
    "./evaluation_metrics_mind_smoke_cat3build_v2.json",
  ],
  dataset: ["./locomo10.json.gz", "./locomo10.json"],
  buildTrace: [
    "./mind_build_trace_mind_smoke_cat3build_v2.json.gz",
    "./mind_build_trace_mind_smoke_cat3build_v2.json",
  ],
};

const CATEGORY_LABELS = {
  "1": "Category 1",
  "2": "Category 2",
  "3": "Category 3",
  "4": "Category 4",
  "5": "Category 5",
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "fail", label: "失败 / 高风险" },
  { value: "pass", label: "通过" },
  { value: "unscored", label: "无评测" },
];

const SORT_OPTIONS = [
  { value: "risk", label: "风险优先" },
  { value: "llm", label: "LLM Score 升序" },
  { value: "f1", label: "F1 升序" },
  { value: "bleu", label: "BLEU 升序" },
  { value: "time", label: "Response Time 降序" },
  { value: "question", label: "Question A-Z" },
];

SORT_OPTIONS.splice(2, 0, { value: "llm_desc", label: "LLM Score \u964d\u5e8f" });
SORT_OPTIONS.splice(4, 0, { value: "f1_desc", label: "F1 \u964d\u5e8f" });
SORT_OPTIONS.splice(6, 0, { value: "bleu_desc", label: "BLEU \u964d\u5e8f" });
SORT_OPTIONS.splice(7, 0, { value: "time_asc", label: "Response Time \u5347\u5e8f" });
SORT_OPTIONS.splice(9, 0, {
  value: "retrieval_asc",
  label: "Retrieval Time \u5347\u5e8f",
});
SORT_OPTIONS.splice(10, 0, {
  value: "retrieval_desc",
  label: "Retrieval Time \u964d\u5e8f",
});

const BUCKET_LABELS = {
  episode: "Episode Hits",
  eventlog: "Eventlog Hits",
  profile: "Profile Hits",
  rrf: "RRF Fusion",
};

const STOPWORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "this",
  "from",
  "have",
  "has",
  "will",
  "what",
  "when",
  "where",
  "which",
  "would",
  "their",
  "they",
  "them",
  "then",
  "than",
  "just",
  "about",
  "into",
  "after",
  "before",
  "while",
  "your",
  "yours",
  "hers",
  "his",
  "her",
  "him",
  "she",
  "for",
  "are",
  "was",
  "were",
  "been",
  "being",
  "did",
  "does",
  "doing",
  "had",
  "our",
  "out",
  "all",
  "any",
  "can",
  "could",
  "should",
  "likely",
  "like",
  "more",
  "less",
  "most",
  "some",
  "many",
  "much",
  "very",
  "still",
  "also",
  "there",
  "because",
  "through",
  "during",
  "over",
  "under",
  "each",
  "same",
  "make",
  "made",
  "said",
  "says",
  "say",
  "last",
  "next",
  "ago",
  "not",
  "but",
  "he",
  "you",
  "i",
  "we",
  "it",
  "its",
  "a",
  "an",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "am",
  "be",
  "or",
  "if",
  "my",
  "me",
]);

const state = {
  items: [],
  filteredItems: [],
  rawSearch: null,
  rawMetrics: null,
  rawDataset: null,
  rawBuildTrace: null,
  datasetSourceLabel: "",
  buildTraceSourceLabel: "",
  sourceLabel: "",
  importStatus: {
    search: { label: "Search JSON", status: "empty", detail: "未导入" },
    metrics: { label: "Metrics JSON", status: "empty", detail: "未导入" },
    dataset: { label: "Dataset JSON", status: "empty", detail: "未导入" },
    buildTrace: { label: "Build Trace", status: "empty", detail: "未导入" },
  },
  selectedKey: null,
  selectedSpeaker: "a",
  selectedBucket: "all",
  selectedHitId: null,
  drawerOpen: false,
  filters: {
    query: "",
    group: "all",
    category: "all",
    status: "all",
    sort: "risk",
  },
  theme: "light",
};

let dom = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  try {
    dom = {
    loadSampleBtn: document.querySelector("#loadSampleBtn"),
    searchFileInput: document.querySelector("#searchFileInput"),
    metricsFileInput: document.querySelector("#metricsFileInput"),
    datasetFileInput: document.querySelector("#datasetFileInput"),
    buildTraceFileInput: document.querySelector("#buildTraceFileInput"),
    themeToggleBtn: document.querySelector("#themeToggleBtn"),
    openDrawerBtn: document.querySelector("#openDrawerBtn"),
    detailDrawerBtn: document.querySelector("#detailDrawerBtn"),
    closeDrawerBtn: document.querySelector("#closeDrawerBtn"),
    drawerBackdrop: document.querySelector("#drawerBackdrop"),
    rawDrawer: document.querySelector("#rawDrawer"),
    itemJson: document.querySelector("#itemJson"),
    hitJson: document.querySelector("#hitJson"),
    drawerItemHint: document.querySelector("#drawerItemHint"),
    drawerHitHint: document.querySelector("#drawerHitHint"),
    loadStatus: document.querySelector("#loadStatus"),
    importStatusGrid: document.querySelector("#importStatusGrid"),
    heroStats: document.querySelector("#heroStats"),
    overviewPanel: document.querySelector("#overviewPanel"),
    visibleCountBadge: document.querySelector("#visibleCountBadge"),
    questionList: document.querySelector("#questionList"),
    retrievalPane: document.querySelector("#retrievalPane"),
    detailPane: document.querySelector("#detailPane"),
    queryInput: document.querySelector("#queryInput"),
    groupFilter: document.querySelector("#groupFilter"),
    categoryFilter: document.querySelector("#categoryFilter"),
    statusFilter: document.querySelector("#statusFilter"),
    sortFilter: document.querySelector("#sortFilter"),
    resetFiltersBtn: document.querySelector("#resetFiltersBtn"),
    toastRoot: document.querySelector("#toastRoot"),
    };

    bindEvents();
    setupStaticFilters();
    initializeTheme();
    renderApp();

    if (window.location.protocol.startsWith("http")) {
      attemptDefaultLoad(true);
    }
  } catch (error) {
    console.error("Mind RAG explorer init failed:", error);
    const status = document.querySelector("#loadStatus");
    if (status) {
      status.textContent = `前端初始化失败：${error.message}`;
    }
  }
}

function bindEvent(node, eventName, handler) {
  if (!node) {
    return;
  }
  node.addEventListener(eventName, handler);
}

function bindEvents() {
  bindEvent(dom.loadSampleBtn, "click", () => {
    attemptDefaultLoad(false);
  });

  bindEvent(dom.searchFileInput, "change", tryLoadFromFileInputs);
  bindEvent(dom.metricsFileInput, "change", tryLoadFromFileInputs);
  bindEvent(dom.datasetFileInput, "change", tryLoadDatasetFile);
  bindEvent(dom.buildTraceFileInput, "change", tryLoadBuildTraceFile);
  bindEvent(dom.themeToggleBtn, "click", toggleTheme);

  bindEvent(dom.queryInput, "input", (event) => {
    state.filters.query = event.target.value;
    applyFilters();
  });

  bindEvent(dom.groupFilter, "change", (event) => {
    state.filters.group = event.target.value;
    applyFilters();
  });

  bindEvent(dom.categoryFilter, "change", (event) => {
    state.filters.category = event.target.value;
    applyFilters();
  });

  bindEvent(dom.statusFilter, "change", (event) => {
    state.filters.status = event.target.value;
    applyFilters();
  });

  bindEvent(dom.sortFilter, "change", (event) => {
    state.filters.sort = event.target.value;
    applyFilters();
  });

  bindEvent(dom.resetFiltersBtn, "click", () => {
    state.filters = {
      query: "",
      group: "all",
      category: "all",
      status: "all",
      sort: "risk",
    };
    syncFilterInputs();
    applyFilters();
  });

  bindEvent(dom.questionList, "click", (event) => {
    const itemButton = event.target.closest("[data-item-key]");
    if (!itemButton) {
      return;
    }
    state.selectedKey = itemButton.dataset.itemKey;
    state.selectedHitId = null;
    renderApp();
  });

  bindEvent(dom.retrievalPane, "click", (event) => {
    const speakerButton = event.target.closest("[data-speaker]");
    if (speakerButton) {
      state.selectedSpeaker = speakerButton.dataset.speaker;
      state.selectedHitId = null;
      renderApp();
      return;
    }

    const bucketButton = event.target.closest("[data-bucket]");
    if (bucketButton) {
      state.selectedBucket = bucketButton.dataset.bucket;
      state.selectedHitId = null;
      renderApp();
      return;
    }

    const hitCard = event.target.closest("[data-hit-id]");
    if (hitCard) {
      state.selectedHitId = hitCard.dataset.hitId;
      renderApp();
    }
  });

  bindEvent(dom.openDrawerBtn, "click", () => setDrawer(true));
  bindEvent(dom.detailDrawerBtn, "click", () => setDrawer(true));
  bindEvent(dom.closeDrawerBtn, "click", () => setDrawer(false));
  bindEvent(dom.drawerBackdrop, "click", () => setDrawer(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.drawerOpen) {
      setDrawer(false);
    }
  });
}

function setupStaticFilters() {
  populateSelect(dom.statusFilter, STATUS_OPTIONS);
  populateSelect(dom.sortFilter, SORT_OPTIONS);
  populateSelect(dom.groupFilter, [{ value: "all", label: "全部 Group" }]);
  populateSelect(dom.categoryFilter, [{ value: "all", label: "全部 Category" }]);
  syncFilterInputs();
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("localStorage get failed:", error);
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("localStorage set failed:", error);
  }
}

function initializeTheme() {
  const stored = safeStorageGet("mind-rag-theme");
  const preferred =
    stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  applyTheme(preferred);
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = state.theme;
  if (dom.themeToggleBtn) {
    dom.themeToggleBtn.textContent = state.theme === "dark" ? "浅色模式" : "暗黑模式";
  }
}

function toggleTheme() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  safeStorageSet("mind-rag-theme", nextTheme);
}

function validateSearchJson(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, detail: "文件不是按 group 分组的 search 结果对象" };
  }
  const groups = Object.values(value).filter(Array.isArray);
  if (!groups.length) {
    return { ok: false, detail: "没有找到任何 group 数组" };
  }
  const sample = groups.flat().find((item) => item && typeof item === "object");
  if (!sample) {
    return { ok: false, detail: "group 数组为空" };
  }
  if (typeof sample.question !== "string") {
    return { ok: false, detail: "缺少 question 字段，像是导错了文件" };
  }
  if (!("speaker_a" in sample) && !("speaker_a_episode_hits" in sample) && !("speaker_a_rrf_hits" in sample)) {
    return { ok: false, detail: "缺少 search 命中字段，不是 mind_search_results 文件" };
  }
  return { ok: true, detail: `${groups.flat().length} 条 search 记录` };
}

function validateMetricsJson(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, detail: "文件不是按 group 分组的 metrics 对象" };
  }
  const groups = Object.values(value).filter(Array.isArray);
  if (!groups.length) {
    return { ok: false, detail: "没有找到任何 group 数组" };
  }
  const sample = groups.flat().find((item) => item && typeof item === "object");
  if (!sample) {
    return { ok: false, detail: "group 数组为空" };
  }
  if (typeof sample.question !== "string" || !("llm_score" in sample)) {
    return { ok: false, detail: "缺少 question/llm_score，不是 evaluation_metrics 文件" };
  }
  return { ok: true, detail: `${groups.flat().length} 条 metrics 记录` };
}

function validateDatasetJson(value) {
  if (!Array.isArray(value)) {
    return { ok: false, detail: "dataset 应为数组" };
  }
  const sample = value.find((item) => item && typeof item === "object");
  if (!sample || !sample.conversation || !Array.isArray(sample.qa)) {
    return { ok: false, detail: "缺少 conversation/qa，不是 locomo dataset" };
  }
  return { ok: true, detail: `${value.length} 条对话样本` };
}

function validateBuildTraceJson(value) {
  if (Array.isArray(value)) {
    return { ok: true, detail: `${value.length} 条 cell trace` };
  }
  if (!value || typeof value !== "object") {
    return { ok: false, detail: "build trace 应为对象或数组" };
  }
  if (!Array.isArray(value.cells)) {
    return { ok: false, detail: "缺少 cells 数组，不是 mind_build_trace 文件" };
  }
  return { ok: true, detail: `${value.cells.length} 条 cell trace` };
}

function setImportStatus(key, status, detail) {
  if (!state.importStatus[key]) {
    return;
  }
  state.importStatus[key] = {
    ...state.importStatus[key],
    status,
    detail,
  };
}

async function tryLoadFromFileInputs() {
  const searchFile = dom.searchFileInput.files?.[0];
  const metricsFile = dom.metricsFileInput.files?.[0];
  const buildTraceFile = dom.buildTraceFileInput.files?.[0];

  if (!searchFile || !metricsFile) {
    const missing = [];
    if (!searchFile) {
      missing.push("Search JSON");
    }
    if (!metricsFile) {
      missing.push("Metrics JSON");
    }
    showToast(`还缺 ${missing.join(" + ")}。`, "info");
    return;
  }

  try {
    const [searchRaw, metricsRaw, buildTraceRaw] = await Promise.all([
      readFileAsJson(searchFile),
      readFileAsJson(metricsFile),
      buildTraceFile ? readFileAsJson(buildTraceFile) : Promise.resolve(undefined),
    ]);
    const searchCheck = validateSearchJson(searchRaw);
    const metricsCheck = validateMetricsJson(metricsRaw);
    if (!searchCheck.ok) {
      setImportStatus("search", "error", `${searchFile.name}: ${searchCheck.detail}`);
      renderApp();
      showToast(`Search JSON 导入失败：${searchCheck.detail}`, "error");
      return;
    }
    if (!metricsCheck.ok) {
      setImportStatus("metrics", "error", `${metricsFile.name}: ${metricsCheck.detail}`);
      renderApp();
      showToast(`Metrics JSON 导入失败：${metricsCheck.detail}`, "error");
      return;
    }
    if (buildTraceRaw !== undefined) {
      const traceCheck = validateBuildTraceJson(buildTraceRaw);
      if (!traceCheck.ok) {
        setImportStatus("buildTrace", "error", `${buildTraceFile.name}: ${traceCheck.detail}`);
        renderApp();
        showToast(`Build trace 导入失败：${traceCheck.detail}`, "error");
        return;
      }
      setImportStatus("buildTrace", "success", `${buildTraceFile.name} · ${traceCheck.detail}`);
    }
    loadData(
      searchRaw,
      metricsRaw,
      `${searchFile.name} + ${metricsFile.name}`,
      undefined,
      undefined,
      buildTraceRaw,
      buildTraceFile?.name,
    );
    setImportStatus("search", "success", `${searchFile.name} · ${searchCheck.detail}`);
    setImportStatus("metrics", "success", `${metricsFile.name} · ${metricsCheck.detail}`);
    showToast("已载入本地 JSON。", "success");
  } catch (error) {
    showToast(`文件解析失败：${error.message}`, "error");
  }
}

async function tryLoadDatasetFile() {
  const datasetFile = dom.datasetFileInput.files?.[0];
  if (!datasetFile) {
    return;
  }

  try {
    const datasetRaw = await readFileAsJson(datasetFile);
    const datasetCheck = validateDatasetJson(datasetRaw);
    if (!datasetCheck.ok) {
      setImportStatus("dataset", "error", `${datasetFile.name}: ${datasetCheck.detail}`);
      renderApp();
      showToast(`Dataset 导入失败：${datasetCheck.detail}`, "error");
      return;
    }
    setDataset(datasetRaw, datasetFile.name);
    setImportStatus("dataset", "success", `${datasetFile.name} · ${datasetCheck.detail}`);
    showToast("Dataset JSON loaded.", "success");
  } catch (error) {
    showToast(`Dataset parse failed: ${error.message}`, "error");
  }
}

async function tryLoadBuildTraceFile() {
  const buildTraceFile = dom.buildTraceFileInput.files?.[0];
  if (!buildTraceFile) {
    return;
  }

  try {
    const buildTraceRaw = await readFileAsJson(buildTraceFile);
    const traceCheck = validateBuildTraceJson(buildTraceRaw);
    if (!traceCheck.ok) {
      setImportStatus("buildTrace", "error", `${buildTraceFile.name}: ${traceCheck.detail}`);
      renderApp();
      showToast(`Build trace 导入失败：${traceCheck.detail}`, "error");
      return;
    }
    setBuildTrace(buildTraceRaw, buildTraceFile.name);
    setImportStatus("buildTrace", "success", `${buildTraceFile.name} · ${traceCheck.detail}`);
    showToast("Build trace JSON loaded.", "success");
  } catch (error) {
    showToast(`Build trace parse failed: ${error.message}`, "error");
  }
}

async function attemptDefaultLoad(silent) {
  if (!window.location.protocol.startsWith("http")) {
    if (dom.loadStatus) {
      dom.loadStatus.textContent =
        "仓库样例需要通过本地静态服务访问。请先运行 python -m http.server 4173，再打开 http://localhost:4173/web_ui/index.html。";
    }
    if (!silent) {
      showToast("默认样例读取依赖 http 服务，直接打开 HTML 无法读取仓库文件。", "error");
    }
    return;
  }

  try {
    const [searchSource, metricsSource, datasetSource, buildTraceSource] = await Promise.all([
      fetchFirstAvailableJson(DEFAULT_FILES.search),
      fetchFirstAvailableJson(DEFAULT_FILES.metrics),
      fetchFirstAvailableJson(DEFAULT_FILES.dataset, { optional: true }),
      fetchFirstAvailableJson(DEFAULT_FILES.buildTrace, { optional: true }),
    ]);
    const searchRaw = searchSource.raw;
    const metricsRaw = metricsSource.raw;
    const datasetRaw = datasetSource.raw;
    const buildTraceRaw = buildTraceSource.raw;
    DEFAULT_FILES.search = searchSource.path;
    DEFAULT_FILES.metrics = metricsSource.path;
    if (datasetSource.path) {
      DEFAULT_FILES.dataset = datasetSource.path;
    }
    if (buildTraceSource.path) {
      DEFAULT_FILES.buildTrace = buildTraceSource.path;
    }
    const searchCheck = validateSearchJson(searchRaw);
    const metricsCheck = validateMetricsJson(metricsRaw);
    if (!searchCheck.ok || !metricsCheck.ok) {
      throw new Error(!searchCheck.ok ? searchCheck.detail : metricsCheck.detail);
    }
    setImportStatus("search", "success", `${DEFAULT_FILES.search} · ${searchCheck.detail}`);
    setImportStatus("metrics", "success", `${DEFAULT_FILES.metrics} · ${metricsCheck.detail}`);
    if (datasetRaw !== undefined) {
      const datasetCheck = validateDatasetJson(datasetRaw);
      if (datasetCheck.ok) {
        setImportStatus("dataset", "success", `${DEFAULT_FILES.dataset} · ${datasetCheck.detail}`);
      }
    }
    if (buildTraceRaw !== undefined) {
      const traceCheck = validateBuildTraceJson(buildTraceRaw);
      if (traceCheck.ok) {
        setImportStatus("buildTrace", "success", `${DEFAULT_FILES.buildTrace} · ${traceCheck.detail}`);
      }
    }

    loadData(
      searchRaw,
      metricsRaw,
      "仓库默认样例",
      datasetRaw,
      datasetRaw ? DEFAULT_FILES.dataset : undefined,
      buildTraceRaw,
      buildTraceRaw ? DEFAULT_FILES.buildTrace : undefined,
    );
    if (!silent) {
      showToast("已加载仓库默认样例。", "success");
    }
  } catch (error) {
    if (!silent) {
      showToast(
        "默认样例读取失败。建议从仓库根目录启动静态服务，或直接手动上传两份 JSON。",
        "error",
      );
    }
  }
}

function loadData(
  searchRaw,
  metricsRaw,
  sourceLabel,
  datasetRaw = undefined,
  datasetSourceLabel = undefined,
  buildTraceRaw = undefined,
  buildTraceSourceLabel = undefined,
) {
  const items = mergeDatasets(searchRaw, metricsRaw);

  state.rawSearch = searchRaw;
  state.rawMetrics = metricsRaw;
  if (datasetRaw !== undefined) {
    setDataset(datasetRaw, datasetSourceLabel ?? state.datasetSourceLabel, false);
  }
  if (buildTraceRaw !== undefined) {
    setBuildTrace(buildTraceRaw, buildTraceSourceLabel ?? state.buildTraceSourceLabel, false);
  }
  state.items = items;
  state.sourceLabel = sourceLabel;
  state.selectedSpeaker = "a";
  state.selectedBucket = "all";
  state.selectedHitId = null;

  populateDynamicFilters(items);
  applyFilters();
}

function setDataset(datasetRaw, sourceLabel = "", rerender = true) {
  state.rawDataset = Array.isArray(datasetRaw) ? datasetRaw : null;
  state.datasetSourceLabel = state.rawDataset ? sourceLabel || "dataset" : "";
  if (rerender) {
    renderApp();
  }
}

function setBuildTrace(buildTraceRaw, sourceLabel = "", rerender = true) {
  const normalized =
    Array.isArray(buildTraceRaw)
      ? { cells: buildTraceRaw, profiles: [] }
      : buildTraceRaw && typeof buildTraceRaw === "object"
        ? {
            ...buildTraceRaw,
            cells: safeArray(buildTraceRaw.cells),
            profiles: safeArray(buildTraceRaw.profiles),
          }
        : null;
  state.rawBuildTrace = normalized;
  state.buildTraceSourceLabel = normalized ? sourceLabel || "build trace" : "";
  if (rerender) {
    renderApp();
  }
}

function mergeDatasets(searchRaw, metricsRaw) {
  const searchMap = new Map();
  const metricMap = new Map();

  for (const [group, groupItems] of Object.entries(searchRaw || {})) {
    for (const item of safeArray(groupItems)) {
      const key = buildItemKey(group, item.question, item.category);
      searchMap.set(key, {
        group: String(group),
        raw: item,
      });
    }
  }

  for (const [group, groupItems] of Object.entries(metricsRaw || {})) {
    for (const item of safeArray(groupItems)) {
      const key = buildItemKey(group, item.question, item.category);
      metricMap.set(key, {
        group: String(group),
        raw: item,
      });
    }
  }

  const allKeys = new Set([...searchMap.keys(), ...metricMap.keys()]);
  const merged = [];

  for (const key of allKeys) {
    const searchEntry = searchMap.get(key);
    const metricEntry = metricMap.get(key);
    const base = searchEntry?.raw || metricEntry?.raw || {};

    const category = String(base.category ?? "");
    const question = base.question ?? "";
    const answer = metricEntry?.raw?.answer ?? searchEntry?.raw?.answer ?? "";
    const response = metricEntry?.raw?.response ?? searchEntry?.raw?.response ?? "";
    const llmScore = toNumber(metricEntry?.raw?.llm_score);
    const f1Score = toNumber(metricEntry?.raw?.f1_score);
    const bleuScore = toNumber(metricEntry?.raw?.bleu_score);
    const responseTime = toNumber(searchEntry?.raw?.response_time);
    const retrievalTimeMs = toNumber(searchEntry?.raw?.retrieval_time_ms);

    merged.push({
      key,
      group: searchEntry?.group ?? metricEntry?.group ?? "0",
      category,
      question,
      answer,
      response,
      llmScore,
      f1Score,
      bleuScore,
      responseTime,
      hasMetrics: metricEntry != null,
      status:
        metricEntry == null ? "unscored" : llmScore >= 1 ? "pass" : "fail",
      speakerA: searchEntry?.raw?.speaker_a ?? "",
      speakerB: searchEntry?.raw?.speaker_b ?? "",
      sampleId: searchEntry?.raw?.sample_id ?? "",
      groundTruthEvidenceRefs: safeArray(searchEntry?.raw?.ground_truth_evidence_refs),
      llmRefer: searchEntry?.raw?.llm_refer ?? null,
      retrievalMode: searchEntry?.raw?.retrieval_mode ?? "default",
      retrievalQueries: safeArray(searchEntry?.raw?.retrieval_queries),
      answerMode: searchEntry?.raw?.answer_mode ?? "",
      targetSpeakerMode: searchEntry?.raw?.target_speaker_mode ?? "both",
      retrievalTimeMs,
      speakerARetrievalDebug: searchEntry?.raw?.speaker_a_retrieval_debug ?? null,
      speakerBRetrievalDebug: searchEntry?.raw?.speaker_b_retrieval_debug ?? null,
      searchRaw: searchEntry?.raw ?? null,
      metricsRaw: metricEntry?.raw ?? null,
      searchText: buildSearchBlob({
        question,
        answer,
        response,
        speakerA: searchEntry?.raw?.speaker_a ?? "",
        speakerB: searchEntry?.raw?.speaker_b ?? "",
      }),
    });
  }

  return merged.sort(compareItemsByRisk);
}

function applyFilters() {
  let items = [...state.items];
  const query = normalizeLoose(state.filters.query);

  if (query) {
    items = items.filter((item) => normalizeLoose(item.searchText).includes(query));
  }

  if (state.filters.group !== "all") {
    items = items.filter((item) => item.group === state.filters.group);
  }

  if (state.filters.category !== "all") {
    items = items.filter((item) => item.category === state.filters.category);
  }

  if (state.filters.status !== "all") {
    items = items.filter((item) => item.status === state.filters.status);
  }

  items.sort(getSorter(state.filters.sort));
  state.filteredItems = items;

  if (!items.length) {
    state.selectedKey = null;
    state.selectedHitId = null;
  } else if (!items.some((item) => item.key === state.selectedKey)) {
    state.selectedKey = items[0].key;
    state.selectedHitId = null;
  }

  ensureSelectedHit();
  renderApp();
}

function ensureSelectedHit() {
  const item = getCurrentItem();
  if (!item) {
    state.selectedHitId = null;
    return;
  }

  const allVisibleHits = getVisibleSections(item).flatMap((section) => section.hits);
  if (!allVisibleHits.length) {
    state.selectedHitId = null;
    return;
  }

  if (state.selectedHitId && allVisibleHits.some((hit) => hit.id === state.selectedHitId)) {
    return;
  }

  const candidate = [...allVisibleHits].sort(
    (left, right) =>
      right.supportScore - left.supportScore ||
      toNumber(right.score, 0) - toNumber(left.score, 0),
  )[0];

  state.selectedHitId = candidate?.id ?? null;
}

function renderApp() {
  renderHero();
  renderImportStatuses();
  renderOverview();
  renderQuestionList();
  renderRetrievalPane();
  renderDetailPane();
  renderDrawer();
}

function renderImportStatuses() {
  if (!dom.importStatusGrid) {
    return;
  }
  dom.importStatusGrid.innerHTML = Object.values(state.importStatus)
    .map(
      (entry) => `
        <article class="import-status-card ${escapeHtml(entry.status)}">
          <span>${escapeHtml(entry.label)}</span>
          <strong>${escapeHtml(importStatusLabel(entry.status))}</strong>
          <b>${escapeHtml(entry.detail || "--")}</b>
        </article>
      `,
    )
    .join("");
}

function importStatusLabel(status) {
  if (status === "success") {
    return "已导入";
  }
  if (status === "pending") {
    return "等待中";
  }
  if (status === "error") {
    return "错误";
  }
  return "未导入";
}

function renderHero() {
  if (!state.items.length) {
    dom.loadStatus.textContent =
      "尚未加载数据。可直接读取仓库样例，或手动选择两份 JSON。";
    dom.heroStats.innerHTML = "";
    return;
  }

  const stats = summarizeItems(state.items);
  const datasetNote = state.rawDataset
    ? ` · dataset ${state.datasetSourceLabel || "loaded"}`
    : " · dataset not loaded";
  const buildTraceNote = state.rawBuildTrace
    ? ` · build trace ${state.buildTraceSourceLabel || "loaded"}`
    : " · build trace not loaded";
  dom.loadStatus.textContent = `${state.sourceLabel} · ${stats.total} 条记录，评测覆盖 ${stats.withMetrics} 条，未评测 ${stats.unscored} 条。${datasetNote}${buildTraceNote}`;
  dom.heroStats.innerHTML = [
    renderMiniStat("总条目", stats.total),
    renderMiniStat("失败", stats.failCount),
    renderMiniStat("通过率", formatRatio(stats.passRate)),
    renderMiniStat("平均耗时", formatSeconds(stats.avgResponseTime)),
  ].join("");
}

function renderOverview() {
  if (!state.items.length) {
    dom.overviewPanel.innerHTML = `
      <div class="panel-title-row">
        <div>
          <p class="section-kicker">Overview</p>
          <h2>当前视图</h2>
        </div>
      </div>
      <div class="empty-state">加载数据后，这里会显示筛选后的概览统计。</div>
    `;
    return;
  }

  const summary = summarizeItems(state.filteredItems);
  const categoryHtml = Object.entries(summary.categoryCounts)
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(
      ([category, count]) =>
        `<span class="badge neutral">${escapeHtml(
          CATEGORY_LABELS[category] || `Category ${category}`,
        )} · ${count}</span>`,
    )
    .join("");

  dom.overviewPanel.innerHTML = `
    <div class="panel-title-row">
      <div>
        <p class="section-kicker">Overview</p>
        <h2>当前视图</h2>
      </div>
      <span class="badge neutral">${summary.total} 条</span>
    </div>

    <div class="overview-grid">
      <article class="overview-card">
        <span>Visible</span>
        <strong>${summary.total}</strong>
        <b>当前筛选命中</b>
      </article>
      <article class="overview-card">
        <span>Coverage</span>
        <strong>${summary.withMetrics}</strong>
        <b>带评测样本</b>
      </article>
      <article class="overview-card">
        <span>Fail Count</span>
        <strong>${summary.failCount}</strong>
        <b>LLM Score = 0</b>
      </article>
      <article class="overview-card">
        <span>Avg F1</span>
        <strong>${formatMetric(summary.avgF1)}</strong>
        <b>筛选内均值</b>
      </article>
    </div>

    <div class="overview-footer">
      <div class="chip-row">
        ${categoryHtml || `<span class="badge neutral">暂无分类数据</span>`}
      </div>
    </div>
  `;
}

function renderQuestionList() {
  const items = state.filteredItems;
  dom.visibleCountBadge.textContent = `${items.length} 条`;

  if (!items.length) {
    dom.questionList.classList.add("empty-state");
    dom.questionList.innerHTML = "当前筛选没有结果。";
    return;
  }

  dom.questionList.classList.remove("empty-state");
  dom.questionList.innerHTML = items
    .map((item, index) => {
      const selectedClass = item.key === state.selectedKey ? "selected" : "";
      const metricBadge =
        item.status === "unscored"
          ? `<span class="badge unscored">无评测</span>`
          : `<span class="badge ${item.status}">${item.status === "pass" ? "通过" : "失败"}</span>`;

      return `
        <button class="question-item ${selectedClass}" type="button" data-item-key="${escapeHtml(
          item.key,
        )}">
          <div class="question-title-row">
            <span class="status-dot ${item.status}"></span>
            <div>
              <div class="question-title">${index + 1}. ${escapeHtml(item.question)}</div>
            </div>
          </div>

          <div class="question-meta">
            <span class="badge neutral">G${escapeHtml(item.group)}</span>
            <span class="badge neutral">${escapeHtml(
              CATEGORY_LABELS[item.category] || `Category ${item.category}`,
            )}</span>
            ${metricBadge}
          </div>

          <div class="question-submeta">
            <span>${escapeHtml(displaySpeakerLabel(item.speakerA, "-"))} ↔ ${escapeHtml(displaySpeakerLabel(item.speakerB, "-"))}</span>
            <span>LLM ${formatMetric(item.llmScore)} · F1 ${formatMetric(
              item.f1Score,
            )}</span>
          </div>

          <div class="question-submeta">
            <span>BLEU ${formatMetric(item.bleuScore)}</span>
            <span>Retrieval ${formatMilliseconds(item.retrievalTimeMs)} · Response ${formatSeconds(item.responseTime)}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderRetrievalPane() {
  const item = getCurrentItem();
  if (!item) {
    dom.retrievalPane.className = "pane-body empty-state";
    dom.retrievalPane.innerHTML = "选择左侧问题后，在这里查看检索详情。";
    return;
  }

  const sections = getVisibleSections(item);
  const allHits = sections.flatMap((section) => section.hits);
  const sourceCards = renderSourceCards(allHits);
  const bestSupport = getBestSupportHit(allHits);

  dom.retrievalPane.className = "pane-body";
  dom.retrievalPane.innerHTML = `
    <div class="retrieval-stack">
      <section class="retrieval-toolbar">
        <div>
          <div class="section-kicker">Current Question</div>
          <h3 class="detail-question">${escapeHtml(item.question)}</h3>
        </div>
      </section>

      <section class="retrieval-toolbar">
        <div>
          <div class="section-kicker">Speaker</div>
          <div class="segmented">
            ${renderSpeakerButtons(item)}
          </div>
        </div>
        <div>
          <div class="section-kicker">Bucket</div>
          <div class="segmented">
            ${renderBucketButtons()}
          </div>
        </div>
      </section>

      <section class="mini-stats">
        ${renderMiniStat("当前命中", allHits.length)}
        ${renderMiniStat(
          "最佳支持",
          bestSupport ? `#${bestSupport.rankInSection} · ${formatPercent(bestSupport.supportScore)}` : "--",
        )}
        ${renderMiniStat("检索基准", getSupportBasisLabel(item))}
        ${renderMiniStat("当前 speaker", state.selectedSpeaker === "a" ? displaySpeakerLabel(item.speakerA, "Speaker A") : displaySpeakerLabel(item.speakerB, "Speaker B"))}
      </section>

      <section class="source-grid">
        ${sourceCards}
      </section>

      ${sections.map((section) => renderRetrievalSection(section, item)).join("")}
    </div>
  `;
}

function renderDetailPane() {
  const item = getCurrentItem();
  if (!item) {
    dom.detailPane.className = "pane-body empty-state";
    dom.detailPane.innerHTML = "选择左侧问题后，在这里查看回答和评估。";
    return;
  }

  const selectedHit = getSelectedHit(item);
  const groundTruthEvidence = getGroundTruthEvidence(item);
  const hitTerms = selectedHit
    ? getSharedTerms(
        `${selectedHit.title || ""} ${selectedHit.summary || ""} ${selectedHit.text || ""}`,
        `${item.answer || ""} ${item.response || ""} ${item.question || ""}`,
        16,
      )
    : [];

  dom.detailPane.className = "pane-body";
  dom.detailPane.innerHTML = `
    <div class="detail-stack">
      <section class="chip-row">
        <span class="badge neutral">G${escapeHtml(item.group)}</span>
        <span class="badge neutral">${escapeHtml(
          CATEGORY_LABELS[item.category] || `Category ${item.category}`,
        )}</span>
        <span class="badge ${item.status}">
          ${item.status === "pass" ? "通过" : item.status === "fail" ? "失败" : "无评测"}
        </span>
        <span class="badge neutral">${escapeHtml(displaySpeakerLabel(item.speakerA, "-"))} ↔ ${escapeHtml(
          displaySpeakerLabel(item.speakerB, "-"),
        )}</span>
      </section>

      <section>
        <div class="section-kicker">Question</div>
        <h3 class="detail-question">${escapeHtml(item.question)}</h3>
      </section>

      <section class="metric-grid">
        ${renderMetricCard("LLM Score", item.llmScore, item.status)}
        ${renderMetricCard("F1", item.f1Score, item.status === "unscored" ? "unscored" : "neutral")}
        ${renderMetricCard("BLEU", item.bleuScore, item.status === "unscored" ? "unscored" : "neutral")}
        ${renderMetricCard("Retrieval Time", formatMilliseconds(item.retrievalTimeMs), "neutral")}
        ${renderMetricCard("Response Time", formatSeconds(item.responseTime), "neutral")}
      </section>

      <section class="text-block">
        <div class="text-block-head">
          <strong>参考答案</strong>
          <span>${item.answer ? "Ground Truth" : "无参考答案"}</span>
        </div>
        <div class="rich-text">${item.answer ? highlightTermsHtml(item.answer, hitTerms) : "该条目没有参考答案。"}</div>
      </section>

      <section class="text-block">
        <div class="text-block-head">
          <strong>模型回答</strong>
          <span>Generated Response</span>
        </div>
        <div class="rich-text">${item.response ? highlightTermsHtml(item.response, hitTerms) : "该条目没有模型回答。"}</div>
      </section>

      <section class="selected-hit-block">
        <div class="selected-hit-head">
          <strong>ground_truth_evidence</strong>
          <span>${groundTruthEvidence.length} refs</span>
        </div>
        ${renderGroundTruthEvidence(groundTruthEvidence, item)}
      </section>

      <section class="diff-block">
        <div class="text-block-head">
          <strong>词级 Diff</strong>
          <span>类似 Git 风格的增删视图</span>
        </div>
        <div class="diff-stream">${renderDiffHtml(item.answer || "", item.response || "")}</div>
      </section>

      <section class="selected-hit-block">
        <div class="selected-hit-head">
          <strong>llm_refer</strong>
          <span>hidden debug field</span>
        </div>
        ${renderLlmRefer(item)}
      </section>

      <section class="selected-hit-block">
        <div class="selected-hit-head">
          <strong>retrieval_debug</strong>
          <span>timings & query plan</span>
        </div>
        ${renderRetrievalDebug(item)}
      </section>

      <section class="selected-hit-block">
        ${
          selectedHit
            ? renderSelectedHit(selectedHit, item)
            : `
              <div class="selected-hit-head">
                <strong>当前命中</strong>
                <span>点击中间任意命中卡片查看元数据</span>
              </div>
              <div class="footnote">当前筛选下没有命中可选。</div>
            `
        }
      </section>
    </div>
  `;
}

function renderDrawer() {
  const item = getCurrentItem();
  const selectedHit = item ? getSelectedHit(item) : null;
  const groundTruthEvidence = item ? getGroundTruthEvidence(item) : [];

  dom.itemJson.textContent = item
    ? JSON.stringify(
        {
          group: item.group,
          sample_id: item.sampleId,
          category: item.category,
          status: item.status,
          question: item.question,
          answer: item.answer,
          response: item.response,
          llm_refer: item.llmRefer,
          ground_truth_evidence: groundTruthEvidence,
          retrieval_mode: item.retrievalMode,
          retrieval_queries: item.retrievalQueries,
          answer_mode: item.answerMode,
          target_speaker_mode: item.targetSpeakerMode,
          retrieval_time_ms: item.retrievalTimeMs,
          speaker_a_retrieval_debug: item.speakerARetrievalDebug,
          speaker_b_retrieval_debug: item.speakerBRetrievalDebug,
          dataset_source: state.datasetSourceLabel,
          build_trace_source: state.buildTraceSourceLabel,
          build_trace_matches: selectedHit ? findBuildTraceMatchesByMemcell(item, selectedHit.memcell_id) : [],
          metrics: item.metricsRaw,
          search: item.searchRaw,
        },
        null,
        2,
      )
    : "暂无数据";

  dom.hitJson.textContent = selectedHit ? JSON.stringify(selectedHit.raw, null, 2) : "暂无数据";
  dom.drawerItemHint.textContent = item ? `${item.group}/${item.category}` : "未选中";
  dom.drawerHitHint.textContent = selectedHit
    ? `${selectedHit.bucket} · ${selectedHit.source}`
    : "未选中";

  dom.rawDrawer.classList.toggle("hidden", !state.drawerOpen);
  dom.drawerBackdrop.classList.toggle("hidden", !state.drawerOpen);
  dom.rawDrawer.setAttribute("aria-hidden", String(!state.drawerOpen));
}

function displaySpeakerLabel(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) {
    return fallback;
  }
  if (raw === "speaker_a" || raw === "speaker_b") {
    return fallback;
  }
  return raw.replace(/_\d+$/, "") || fallback;
}

function renderSpeakerButtons(item) {
  return [
    {
      key: "a",
      label: displaySpeakerLabel(item.speakerA, "Speaker A"),
    },
    {
      key: "b",
      label: displaySpeakerLabel(item.speakerB, "Speaker B"),
    },
  ]
    .map(
      (speaker) => `
        <button
          class="segment-button ${state.selectedSpeaker === speaker.key ? "active" : ""}"
          type="button"
          data-speaker="${speaker.key}"
        >
          ${escapeHtml(speaker.label)}
        </button>
      `,
    )
    .join("");
}

function renderBucketButtons() {
  return [
    { value: "all", label: "全部" },
    { value: "episode", label: "Episode" },
    { value: "eventlog", label: "Eventlog" },
    { value: "profile", label: "Profile" },
    { value: "rrf", label: "RRF" },
  ]
    .map(
      (bucket) => `
        <button
          class="segment-button ${state.selectedBucket === bucket.value ? "active" : ""}"
          type="button"
          data-bucket="${bucket.value}"
        >
          ${escapeHtml(bucket.label)}
        </button>
      `,
    )
    .join("");
}

function renderRetrievalSection(section, item) {
  const badges = [
    `<span class="badge neutral">${section.hits.length} 条</span>`,
    ...Object.entries(section.sourceCounts).map(
      ([source, count]) =>
        `<span class="badge source-${escapeHtml(source)}">${escapeHtml(source)} · ${count}</span>`,
    ),
  ];

  if (section.bestSupport) {
    badges.push(
      `<span class="badge neutral">最佳支持 #${section.bestSupport.rankInSection} · ${formatPercent(
        section.bestSupport.supportScore,
      )}</span>`,
    );
  }

  const hitCards = section.hits.length
    ? section.hits.map((hit) => renderHitCard(hit, item)).join("")
    : `<div class="footnote">该桶当前没有命中。</div>`;

  return `
    <section class="retrieval-section">
      <div class="retrieval-section-head">
        <div class="section-kicker">${escapeHtml(BUCKET_LABELS[section.bucket])}</div>
        <h3 class="retrieval-title">${escapeHtml(BUCKET_LABELS[section.bucket])}</h3>
        <div class="section-badges">${badges.join("")}</div>
      </div>
      <div class="hit-list">${hitCards}</div>
    </section>
  `;
}

function renderHitCard(hit, item) {
  const referenceTerms = getReferenceTerms(item);
  const evidenceCount = safeArray(hit.metadata?.evidence).length;
  const metadataCategory = hit.metadata?.category
    ? `<span class="badge neutral">${escapeHtml(hit.metadata.category)}</span>`
    : "";
  const supportClass =
    hit.supportScore >= 0.45 ? "high" : hit.supportScore <= 0.1 ? "low" : "";

  return `
    <article class="hit-card ${state.selectedHitId === hit.id ? "selected" : ""}" data-hit-id="${escapeHtml(
      hit.id,
    )}">
      <div class="hit-card-head">
        <div class="chip-row">
          <span class="badge source-${escapeHtml(hit.source)}">${escapeHtml(hit.source)}</span>
          <span class="badge neutral">${escapeHtml(hit.record_type)}</span>
          <span class="badge neutral">Score ${formatHitScore(hit.score)}</span>
          ${metadataCategory}
        </div>
        <div class="support-pill ${supportClass}">
          支持 ${formatPercent(hit.supportScore)}
        </div>
      </div>

      <h4 class="hit-title">${escapeHtml(hit.title || "(No title)")}</h4>

      <div class="meta-stack">
        <div class="meta-line">
          <span>${escapeHtml(hit.fact_date || "-")}</span>
          <span>${escapeHtml(hit.doc_id || "-")}</span>
        </div>
        <div class="meta-line">
          <span>${escapeHtml(hit.user_id || "-")}</span>
          <span>#${hit.rankInSection} in ${escapeHtml(BUCKET_LABELS[hit.bucket])}</span>
        </div>
      </div>

      <div class="hit-text">${highlightTermsHtml(createExcerpt(hit.text || hit.summary || "", referenceTerms), referenceTerms)}</div>

      ${
        hit.summary
          ? `
            <details class="details-block">
              <summary>展开摘要与元数据</summary>
              <div class="rich-text">${highlightTermsHtml(hit.summary, referenceTerms)}</div>
              ${
                evidenceCount
                  ? `<pre>${escapeHtml(
                      JSON.stringify(
                        {
                          evidence: hit.metadata.evidence,
                          fact_json: hit.metadata.fact_json ?? null,
                        },
                        null,
                        2,
                      ),
                    )}</pre>`
                  : hit.metadata && Object.keys(hit.metadata).length
                    ? `<pre>${escapeHtml(JSON.stringify(hit.metadata, null, 2))}</pre>`
                    : ""
              }
            </details>
          `
          : ""
      }
    </article>
  `;
}

function renderSelectedHit(hit, item) {
  const sharedTerms = getSharedTerms(
    `${hit.title || ""} ${hit.summary || ""} ${hit.text || ""}`,
    `${item.question || ""} ${item.answer || ""} ${item.response || ""}`,
    12,
  );
  const traceMatches = findBuildTraceMatchesByMemcell(item, hit.memcell_id);

  return `
    <div class="selected-hit-head">
      <strong>当前命中</strong>
      <span>${escapeHtml(BUCKET_LABELS[hit.bucket])} · ${escapeHtml(hit.source)}</span>
    </div>

    <div class="chip-row">
      <span class="badge source-${escapeHtml(hit.source)}">${escapeHtml(hit.source)}</span>
      <span class="badge neutral">${escapeHtml(hit.record_type)}</span>
      <span class="badge neutral">Score ${formatHitScore(hit.score)}</span>
      <span class="badge neutral">支持 ${formatPercent(hit.supportScore)}</span>
      <span class="badge neutral">${escapeHtml(hit.fact_date || "-")}</span>
    </div>

    <div class="rich-text">${highlightTermsHtml(hit.text || hit.summary || "(empty)", sharedTerms)}</div>

    ${
      hit.metadata && Object.keys(hit.metadata).length
        ? `
          <details class="details-block" open>
            <summary>元数据</summary>
            <pre>${escapeHtml(JSON.stringify(hit.metadata, null, 2))}</pre>
          </details>
        `
        : ""
    }
    ${renderBuildTraceMatches(traceMatches, "Matched build cell")}
  `;
}

function renderGroundTruthEvidence(evidenceItems, item) {
  if (!state.rawDataset) {
    return `<div class="footnote">Dataset not loaded. Import locomo10.json or locomo10.json.gz to resolve evidence text.</div>`;
  }

  if (!evidenceItems.length) {
    return `<div class="footnote">No ground-truth evidence was found for this question.</div>`;
  }

  return `
    <div class="evidence-list">
      ${evidenceItems
        .map(
          (entry) => `
            <article class="evidence-card">
              <div class="selected-hit-head">
                <strong>${escapeHtml(entry.ref)}</strong>
                <span>${escapeHtml(entry.sessionLabel)}</span>
              </div>
              <div class="chip-row">
                <span class="badge neutral">${escapeHtml(entry.speaker || "unknown")}</span>
                <span class="badge neutral">${escapeHtml(entry.diaId || entry.ref)}</span>
                <span class="badge neutral">${escapeHtml(item.sampleId || entry.sampleId || item.group)}</span>
              </div>
              <div class="rich-text">${escapeHtml(entry.text || "(missing conversation text)")}</div>
              ${renderBuildTraceMatches(findBuildTraceMatchesForEvidence(entry), "Cell extraction trace")}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRetrievalDebug(item) {
  const blocks = [
    { label: displaySpeakerLabel(item.speakerA, "Speaker A"), value: item.speakerARetrievalDebug },
    { label: displaySpeakerLabel(item.speakerB, "Speaker B"), value: item.speakerBRetrievalDebug },
  ].filter((entry) => entry.value);

  if (!blocks.length && !item.retrievalQueries?.length) {
    return `<div class="footnote">No retrieval debug information was recorded for this result.</div>`;
  }

  return `
    <div class="evidence-list">
      ${
        item.retrievalQueries?.length
          ? `
            <article class="evidence-card">
              <div class="selected-hit-head">
                <strong>Queries</strong>
                <span>${escapeHtml(item.targetSpeakerMode || "both")}</span>
              </div>
              <div class="chip-row">
                ${item.retrievalQueries
                  .map((query) => `<span class="badge neutral">${escapeHtml(query)}</span>`)
                  .join("")}
              </div>
            </article>
          `
          : ""
      }
      ${blocks
        .map(
          (entry) => `
            <details class="details-block">
              <summary>${escapeHtml(entry.label)} retrieval trace</summary>
              <pre>${escapeHtml(JSON.stringify(entry.value, null, 2))}</pre>
            </details>
          `,
        )
        .join("")}
    </div>
  `;
}

function getBuildTraceCells() {
  return safeArray(state.rawBuildTrace?.cells);
}

function getBuildTraceProfiles() {
  return safeArray(state.rawBuildTrace?.profiles);
}

function findBuildTraceMatchesForEvidence(entry) {
  if (!state.rawBuildTrace) {
    return [];
  }

  const refText = String(entry?.ref || "").trim();
  const entryText = normalizeWhitespace(entry?.text || "");
  return getBuildTraceCells().filter((cell) => {
    const sameSample =
      !entry.sampleId || !cell.sample_id || String(cell.sample_id) === String(entry.sampleId);
    const sameSession = !entry.sessionKey || String(cell.session_key || "") === String(entry.sessionKey);
    const hasDiaId = safeArray(cell.turns).some((turn) => String(turn?.dia_id || "") === refText);
    const hasText =
      entryText &&
      safeArray(cell.turns).some((turn) => normalizeWhitespace(turn?.text || "").includes(entryText));
    return sameSample && sameSession && (hasDiaId || hasText);
  });
}

function findBuildTraceMatchesByMemcell(item, memcellId) {
  if (!state.rawBuildTrace || !memcellId) {
    return [];
  }

  return getBuildTraceCells().filter((cell) => {
    const sameSample =
      !item.sampleId || !cell.sample_id || String(cell.sample_id) === String(item.sampleId);
    return sameSample && String(cell.memcell_id || "") === String(memcellId);
  });
}

function renderBuildTraceMatches(matches, summaryLabel) {
  if (!state.rawBuildTrace) {
    return `<div class="footnote">Build trace not loaded. Import a mind_build_trace*.json file to inspect extraction.</div>`;
  }

  const traceItems = safeArray(matches);
  if (!traceItems.length) {
    return `<div class="footnote">No matched build-trace cell was found for this evidence.</div>`;
  }

  return `
    <details class="details-block">
      <summary>${escapeHtml(summaryLabel)} (${traceItems.length})</summary>
      <div class="evidence-list">
        ${traceItems.map((entry) => renderBuildTraceEntry(entry)).join("")}
      </div>
    </details>
  `;
}

function renderBuildTraceEntry(entry) {
  const eventlogs = safeArray(entry.eventlogs);
  const episode = entry.episode;
  const relatedProfiles = getBuildTraceProfiles().filter((profile) =>
    safeArray(profile.support_memcell_ids).includes(entry.memcell_id),
  );

  return `
    <article class="evidence-card">
      <div class="selected-hit-head">
        <strong>${escapeHtml(entry.memcell_id || "memcell")}</strong>
        <span>${escapeHtml(entry.target_user_id || "-")}</span>
      </div>
      <div class="chip-row">
        <span class="badge neutral">${escapeHtml(entry.session_key || "-")}</span>
        <span class="badge neutral">chunk ${escapeHtml(String(entry.chunk_idx ?? "-"))}</span>
        <span class="badge neutral">${escapeHtml(entry.session_date || "-")}</span>
      </div>
      <div class="rich-text">${escapeHtml(entry.cell_text || "(missing cell text)")}</div>
      ${
        episode
          ? `
            <details class="details-block">
              <summary>Episode extraction</summary>
              <pre>${escapeHtml(JSON.stringify(episode, null, 2))}</pre>
            </details>
          `
          : `<div class="footnote">No episode extraction recorded for this target user.</div>`
      }
      ${
        eventlogs.length
          ? `
            <details class="details-block">
              <summary>Eventlog extraction (${eventlogs.length})</summary>
              <pre>${escapeHtml(JSON.stringify(eventlogs, null, 2))}</pre>
            </details>
          `
          : `<div class="footnote">No eventlog extraction recorded for this target user.</div>`
      }
      ${
        relatedProfiles.length
          ? `
            <details class="details-block">
              <summary>Related profile memory (${relatedProfiles.length})</summary>
              <pre>${escapeHtml(JSON.stringify(relatedProfiles, null, 2))}</pre>
            </details>
          `
          : ""
      }
    </article>
  `;
}

function renderLlmRefer(item) {
  const refer = item.llmRefer;
  if (!refer) {
    return `<div class="footnote">This result file does not include llm_refer yet. Re-run search after the prompt update to populate it.</div>`;
  }

  const resolvedRefs = safeArray(refer.resolved_refs);
  return `
    <details class="details-block">
      <summary>Show hidden refer</summary>
      <div class="evidence-list">
        ${
          refer.support_note
            ? `<article class="evidence-card"><div class="rich-text">${escapeHtml(refer.support_note)}</div></article>`
            : ""
        }
        ${
          resolvedRefs.length
            ? resolvedRefs
                .map(
                  (ref) => `
                    <article class="evidence-card">
                      <div class="selected-hit-head">
                        <strong>${escapeHtml(ref.ref_id || "-")}</strong>
                        <span>${escapeHtml(ref.speaker || "-")}</span>
                      </div>
                      <div class="chip-row">
                        <span class="badge neutral">${escapeHtml(ref.doc_id || "-")}</span>
                        <span class="badge neutral">${escapeHtml(ref.record_type || "-")}</span>
                        <span class="badge neutral">${escapeHtml(ref.fact_date || "-")}</span>
                      </div>
                      <div class="footnote">${escapeHtml(ref.title || "(no title)")}</div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="footnote">No resolved references were recorded for this answer.</div>`
        }
      </div>
    </details>
  `;
}

function getGroundTruthEvidence(item) {
  const datasetEntry = getDatasetEntry(item);
  if (!datasetEntry) {
    return [];
  }

  const refs = item.groundTruthEvidenceRefs.length
    ? item.groundTruthEvidenceRefs
    : safeArray(findDatasetQa(item)?.evidence);

  return refs.map((ref) => resolveGroundTruthEvidenceRef(datasetEntry, ref, item)).filter(Boolean);
}

function getDatasetEntry(item) {
  if (!Array.isArray(state.rawDataset)) {
    return null;
  }

  if (item.sampleId) {
    const matched = state.rawDataset.find(
      (entry) => String(entry?.sample_id || "") === String(item.sampleId),
    );
    if (matched) {
      return matched;
    }
  }

  const index = Number(item.group);
  if (!Number.isInteger(index)) {
    return null;
  }
  return state.rawDataset[index] ?? null;
}

function findDatasetQa(item) {
  const datasetEntry = getDatasetEntry(item);
  if (!datasetEntry) {
    return null;
  }

  const questions = safeArray(datasetEntry.qa);
  const normalizedAnswer = normalizeLoose(String(item.answer ?? ""));

  return (
    questions.find(
      (qa) =>
        String(qa.question || "") === item.question &&
        String(qa.category ?? "") === item.category &&
        normalizeLoose(String(qa.answer ?? "")) === normalizedAnswer,
    ) ||
    questions.find(
      (qa) =>
        String(qa.question || "") === item.question &&
        String(qa.category ?? "") === item.category,
    ) ||
    null
  );
}

function resolveGroundTruthEvidenceRef(datasetEntry, ref, item) {
  const refText = String(ref || "").trim();
  if (!refText) {
    return null;
  }

  const match = /^D(\d+):(\d+)$/i.exec(refText);
  const sessionNumber = match ? Number(match[1]) : null;
  const sessionKey = sessionNumber ? `session_${sessionNumber}` : "";
  const sessionDateTimeKey = sessionNumber ? `${sessionKey}_date_time` : "";
  const conversation = datasetEntry.conversation || {};
  const messages = safeArray(conversation[sessionKey]);
  const message = messages.find((entry) => String(entry?.dia_id || "") === refText) || null;

  return {
    ref: refText,
    sampleId: item.sampleId || datasetEntry.sample_id || "",
    sessionKey,
    sessionLabel: sessionDateTimeKey && conversation[sessionDateTimeKey]
      ? `${sessionKey} · ${conversation[sessionDateTimeKey]}`
      : sessionKey || "unknown session",
    diaId: message?.dia_id || refText,
    speaker: message?.speaker || "",
    text: message?.text || "",
  };
}

function renderMetricCard(label, value, tone) {
  const displayValue =
    typeof value === "number" ? formatMetric(value) : value == null ? "--" : value;
  return `
    <article class="metric-card ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(displayValue)}</strong>
    </article>
  `;
}

function renderMiniStat(label, value) {
  return `
    <article class="mini-stat">
      <span>${escapeHtml(label)}</span>
      <b>${escapeHtml(String(value ?? "--"))}</b>
    </article>
  `;
}

function renderSourceCards(hits) {
  const sourceSummary = summarizeSources(hits);
  if (!hits.length) {
    return `
      <article class="source-card">
        <span>Sources</span>
        <b>0</b>
      </article>
    `;
  }

  return ["redis", "qdrant", "rrf"]
    .map((source) => {
      const entry = sourceSummary[source] || { count: 0, maxScore: null };
      return `
        <article class="source-card">
          <span>${escapeHtml(source)}</span>
          <b>${entry.count}</b>
          <div class="footnote">max ${formatHitScore(entry.maxScore)}</div>
        </article>
      `;
    })
    .join("");
}

function getVisibleSections(item) {
  const speakerPrefix = state.selectedSpeaker === "a" ? "speaker_a" : "speaker_b";
  const searchRaw = item.searchRaw || {};
  const referenceText = getSupportReference(item);

  const buckets = [
    {
      bucket: "episode",
      hits: safeArray(searchRaw[`${speakerPrefix}_episode_hits`]),
    },
    {
      bucket: "eventlog",
      hits: safeArray(searchRaw[`${speakerPrefix}_eventlog_hits`]),
    },
    {
      bucket: "profile",
      hits: safeArray(searchRaw[`${speakerPrefix}_profile_hits`]),
    },
    {
      bucket: "rrf",
      hits: safeArray(searchRaw[`${speakerPrefix}_rrf_hits`]),
    },
  ];

  const filteredBuckets =
    state.selectedBucket === "all"
      ? buckets
      : buckets.filter((entry) => entry.bucket === state.selectedBucket);

  return filteredBuckets.map((entry) => {
    const hits = entry.hits.map((hit, index) => {
      const composite = {
        id: `${state.selectedSpeaker}:${entry.bucket}:${index}:${hit.doc_id || "na"}`,
        bucket: entry.bucket,
        rankInSection: index + 1,
        supportScore: computeSupportScore(hit, referenceText),
        raw: hit,
        ...hit,
      };
      return composite;
    });

    const sourceCounts = hits.reduce((accumulator, hit) => {
      accumulator[hit.source] = (accumulator[hit.source] || 0) + 1;
      return accumulator;
    }, {});

    return {
      bucket: entry.bucket,
      hits,
      sourceCounts,
      bestSupport: getBestSupportHit(hits),
    };
  });
}

function getBestSupportHit(hits) {
  if (!hits.length) {
    return null;
  }

  return [...hits].sort(
    (left, right) =>
      right.supportScore - left.supportScore ||
      toNumber(right.score, 0) - toNumber(left.score, 0),
  )[0];
}

function getSelectedHit(item) {
  const sections = getVisibleSections(item);
  const allHits = sections.flatMap((section) => section.hits);
  return allHits.find((hit) => hit.id === state.selectedHitId) || null;
}

function getCurrentItem() {
  return state.filteredItems.find((item) => item.key === state.selectedKey) || null;
}

function summarizeItems(items) {
  const summary = {
    total: items.length,
    withMetrics: 0,
    unscored: 0,
    failCount: 0,
    passCount: 0,
    passRate: 0,
    avgF1: null,
    avgResponseTime: null,
    categoryCounts: {},
  };

  const f1Values = [];
  const responseTimes = [];

  for (const item of items) {
    summary.categoryCounts[item.category] = (summary.categoryCounts[item.category] || 0) + 1;

    if (item.hasMetrics) {
      summary.withMetrics += 1;
      if (item.status === "pass") {
        summary.passCount += 1;
      }
      if (item.status === "fail") {
        summary.failCount += 1;
      }
      if (typeof item.f1Score === "number") {
        f1Values.push(item.f1Score);
      }
    } else {
      summary.unscored += 1;
    }

    if (typeof item.responseTime === "number") {
      responseTimes.push(item.responseTime);
    }
  }

  summary.passRate = summary.withMetrics ? summary.passCount / summary.withMetrics : 0;
  summary.avgF1 = f1Values.length ? average(f1Values) : null;
  summary.avgResponseTime = responseTimes.length ? average(responseTimes) : null;
  return summary;
}

function summarizeSources(hits) {
  return hits.reduce((accumulator, hit) => {
    const current = accumulator[hit.source] || { count: 0, maxScore: null };
    current.count += 1;
    if (typeof hit.score === "number") {
      current.maxScore =
        current.maxScore == null ? hit.score : Math.max(current.maxScore, hit.score);
    }
    accumulator[hit.source] = current;
    return accumulator;
  }, {});
}

function populateDynamicFilters(items) {
  const groups = [...new Set(items.map((item) => item.group))].sort(
    (left, right) => Number(left) - Number(right),
  );
  const categories = [...new Set(items.map((item) => item.category))].sort(
    (left, right) => Number(left) - Number(right),
  );

  populateSelect(dom.groupFilter, [
    { value: "all", label: "全部 Group" },
    ...groups.map((group) => ({ value: group, label: `Group ${group}` })),
  ]);

  populateSelect(dom.categoryFilter, [
    { value: "all", label: "全部 Category" },
    ...categories.map((category) => ({
      value: category,
      label: CATEGORY_LABELS[category] || `Category ${category}`,
    })),
  ]);

  syncFilterInputs();
}

function syncFilterInputs() {
  dom.queryInput.value = state.filters.query;
  dom.groupFilter.value = state.filters.group;
  dom.categoryFilter.value = state.filters.category;
  dom.statusFilter.value = state.filters.status;
  dom.sortFilter.value = state.filters.sort;
}

function populateSelect(select, options) {
  select.innerHTML = options
    .map(
      (option) =>
        `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`,
    )
    .join("");
}

function setDrawer(open) {
  state.drawerOpen = open;
  renderDrawer();
}

function getSorter(sortMode) {
  switch (sortMode) {
    case "llm":
      return (left, right) =>
        compareNullableAsc(left.llmScore, right.llmScore) ||
        compareItemsByRisk(left, right);
    case "f1":
      return (left, right) =>
        compareNullableAsc(left.f1Score, right.f1Score) ||
        compareItemsByRisk(left, right);
    case "bleu":
      return (left, right) =>
        compareNullableAsc(left.bleuScore, right.bleuScore) ||
        compareItemsByRisk(left, right);
    case "time":
      return (left, right) =>
        compareNullableDesc(left.responseTime, right.responseTime) ||
        compareItemsByRisk(left, right);
    case "question":
      return (left, right) => left.question.localeCompare(right.question);
    case "risk":
    default:
      return compareItemsByRisk;
  }
}

function compareItemsByRisk(left, right) {
  return (
    statusPriority(left.status) - statusPriority(right.status) ||
    compareNullableAsc(left.llmScore, right.llmScore) ||
    compareNullableAsc(left.f1Score, right.f1Score) ||
    compareNullableDesc(left.responseTime, right.responseTime) ||
    left.question.localeCompare(right.question)
  );
}

function statusPriority(status) {
  if (status === "fail") {
    return 0;
  }
  if (status === "unscored") {
    return 1;
  }
  return 2;
}

function getSupportReference(item) {
  return item.answer || item.response || item.question || "";
}

function getSupportBasisLabel(item) {
  if (item.answer) {
    return "参考答案";
  }
  if (item.response) {
    return "模型回答";
  }
  return "问题文本";
}

function getReferenceTerms(item) {
  return extractTerms(
    `${item.question || ""} ${item.answer || ""} ${item.response || ""}`,
    18,
  );
}

function computeSupportScore(hit, referenceText) {
  const referenceTerms = extractTerms(referenceText, 18);
  if (!referenceTerms.length) {
    return 0;
  }
  const text = `${hit.title || ""} ${hit.summary || ""} ${hit.text || ""}`;
  const hitTerms = new Set(extractTerms(text, 160));
  let matched = 0;
  for (const term of referenceTerms) {
    if (hitTerms.has(term)) {
      matched += 1;
    }
  }
  return matched / referenceTerms.length;
}

function renderDiffHtml(answer, response) {
  const ops = diffTokens(answer, response);
  return ops
    .map(
      (op) => `<span class="diff-token ${escapeHtml(op.type)}">${escapeHtml(op.value)}</span>`,
    )
    .join("");
}

function diffTokens(leftText, rightText) {
  const left = tokenizeDiff(leftText);
  const right = tokenizeDiff(rightText);
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      matrix[i][j] =
        left[i] === right[j]
          ? matrix[i + 1][j + 1] + 1
          : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      ops.push({ type: "equal", value: left[i] });
      i += 1;
      j += 1;
    } else if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      ops.push({ type: "remove", value: left[i] });
      i += 1;
    } else {
      ops.push({ type: "add", value: right[j] });
      j += 1;
    }
  }

  while (i < left.length) {
    ops.push({ type: "remove", value: left[i] });
    i += 1;
  }

  while (j < right.length) {
    ops.push({ type: "add", value: right[j] });
    j += 1;
  }

  return mergeDiffOps(ops);
}

function mergeDiffOps(ops) {
  const merged = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.value += op.value;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

function tokenizeDiff(text) {
  return String(text || "").match(/\S+|\s+/g) || [];
}

function highlightTermsHtml(text, terms) {
  const source = String(text ?? "");
  const uniqueTerms = [...new Set(safeArray(terms).filter(Boolean))]
    .sort((left, right) => right.length - left.length)
    .slice(0, 20);

  if (!uniqueTerms.length) {
    return escapeHtml(source);
  }

  const pattern = new RegExp(`(${uniqueTerms.map(escapeRegExp).join("|")})`, "gi");
  return source
    .split(pattern)
    .map((part) => {
      const match = uniqueTerms.find((term) => term.toLowerCase() === part.toLowerCase());
      return match ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part);
    })
    .join("");
}

function createExcerpt(text, terms) {
  const compact = normalizeWhitespace(text);
  if (!compact) {
    return "";
  }

  if (compact.length <= 360) {
    return compact;
  }

  const lower = compact.toLowerCase();
  let anchor = -1;
  for (const term of terms) {
    anchor = lower.indexOf(term.toLowerCase());
    if (anchor !== -1) {
      break;
    }
  }

  if (anchor === -1) {
    return `${compact.slice(0, 360).trimEnd()}...`;
  }

  const start = Math.max(0, anchor - 120);
  const end = Math.min(compact.length, start + 360);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < compact.length ? "..." : "";
  return `${prefix}${compact.slice(start, end).trim()}${suffix}`;
}

function getSharedTerms(leftText, rightText, limit) {
  const leftTerms = new Set(extractTerms(leftText, 120));
  const shared = extractTerms(rightText, 120).filter((term) => leftTerms.has(term));
  return [...new Set(shared)].slice(0, limit);
}

function extractTerms(text, limit) {
  const matches = String(text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  const unique = [];
  const seen = new Set();

  for (const token of matches) {
    if (seen.has(token)) {
      continue;
    }
    if (STOPWORDS.has(token)) {
      continue;
    }
    if (token.length < 3 && !/^\d{4}$/.test(token)) {
      continue;
    }
    seen.add(token);
    unique.push(token);
    if (unique.length >= limit) {
      break;
    }
  }
  return unique;
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function normalizeLoose(text) {
  return normalizeWhitespace(text).toLowerCase();
}

function buildSearchBlob(values) {
  return [values.question, values.answer, values.response, values.speakerA, values.speakerB]
    .filter(Boolean)
    .join(" ");
}

function buildItemKey(group, question, category) {
  return `${String(group)}::${String(category)}::${String(question)}`;
}

function formatMetric(value) {
  return typeof value === "number" ? value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") : "--";
}

function formatHitScore(value) {
  if (typeof value !== "number") {
    return "--";
  }
  return Math.abs(value) >= 1 ? value.toFixed(2) : value.toFixed(4);
}

function formatPercent(value) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function formatRatio(value) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "--";
}

function formatSeconds(value) {
  return typeof value === "number" ? `${value.toFixed(2)}s` : "--";
}

function formatMilliseconds(value) {
  return typeof value === "number" ? `${value.toFixed(0)} ms` : "--";
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function compareNullableAsc(left, right) {
  const leftMissing = typeof left !== "number";
  const rightMissing = typeof right !== "number";

  if (leftMissing && rightMissing) {
    return 0;
  }
  if (leftMissing) {
    return 1;
  }
  if (rightMissing) {
    return -1;
  }
  return left - right;
}

function compareNullableDesc(left, right) {
  const leftMissing = typeof left !== "number";
  const rightMissing = typeof right !== "number";

  if (leftMissing && rightMissing) {
    return 0;
  }
  if (leftMissing) {
    return 1;
  }
  if (rightMissing) {
    return -1;
  }
  return right - left;
}

function toNumber(value, fallback = null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.httpStatus = response.status;
    throw error;
  }
  return readJsonFromBlob(await response.blob(), path);
}

function readFileAsJson(file) {
  return readJsonFromBlob(file, file.name);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("无法读取文件"));
    reader.readAsText(file, "utf-8");
  });
}

async function fetchFirstAvailableJson(paths, { optional = false } = {}) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  let lastError = null;

  for (const path of candidates) {
    try {
      return { raw: await fetchJson(path), path };
    } catch (error) {
      lastError = error;
      if (error?.httpStatus === 404) {
        continue;
      }
      throw error;
    }
  }

  if (optional) {
    return { raw: undefined, path: undefined };
  }

  throw lastError || new Error(`No default data file was found: ${candidates.join(", ")}`);
}

async function readJsonFromBlob(blob, sourceLabel = "JSON") {
  const text = await readTextFromBlob(blob, sourceLabel);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${sourceLabel} parse failed: ${error.message}`);
  }
}

async function readTextFromBlob(blob, sourceLabel = "file") {
  const normalizedBlob = (await isGzipBlob(blob))
    ? await decompressGzipBlob(blob, sourceLabel)
    : blob;
  return normalizedBlob.text();
}

async function isGzipBlob(blob) {
  const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  return header.length >= 2 && header[0] === 0x1f && header[1] === 0x8b;
}

async function decompressGzipBlob(blob, sourceLabel = "gzip file") {
  if (typeof DecompressionStream !== "function") {
    throw new Error(
      `Current browser does not support gzip decompression, cannot load ${sourceLabel}`,
    );
  }

  const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).blob();
}

function showToast(message, tone) {
  if (!dom.toastRoot) {
    return;
  }
  const toast = document.createElement("div");
  toast.className = `toast ${tone || "info"}`;
  toast.textContent = message;
  dom.toastRoot.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

async function tryLoadFromFileInputs() {
  const searchFile = dom.searchFileInput.files?.[0];
  const metricsFile = dom.metricsFileInput.files?.[0];
  const buildTraceFile = dom.buildTraceFileInput.files?.[0];

  if (!searchFile || !metricsFile) {
    if (searchFile) {
      setImportStatus("search", "pending", `${searchFile.name} · 已选择，等待 Metrics JSON`);
    } else {
      setImportStatus("search", "empty", "未导入");
    }
    if (metricsFile) {
      setImportStatus("metrics", "pending", `${metricsFile.name} · 已选择，等待 Search JSON`);
    } else {
      setImportStatus("metrics", "empty", "未导入");
    }
    renderApp();
    showToast("请继续补齐 Search JSON 和 Metrics JSON。", "info");
    return;
  }

  try {
    const [searchRaw, metricsRaw, buildTraceRaw] = await Promise.all([
      readFileAsJson(searchFile),
      readFileAsJson(metricsFile),
      buildTraceFile ? readFileAsJson(buildTraceFile) : Promise.resolve(undefined),
    ]);

    const searchCheck = validateSearchJson(searchRaw);
    const metricsCheck = validateMetricsJson(metricsRaw);
    if (!searchCheck.ok) {
      setImportStatus("search", "error", `${searchFile.name}: ${searchCheck.detail}`);
      renderApp();
      showToast(`Search JSON import failed: ${searchCheck.detail}`, "error");
      return;
    }
    if (!metricsCheck.ok) {
      setImportStatus("metrics", "error", `${metricsFile.name}: ${metricsCheck.detail}`);
      renderApp();
      showToast(`Metrics JSON import failed: ${metricsCheck.detail}`, "error");
      return;
    }

    if (buildTraceRaw !== undefined) {
      const traceCheck = validateBuildTraceJson(buildTraceRaw);
      if (!traceCheck.ok) {
        setImportStatus("buildTrace", "error", `${buildTraceFile.name}: ${traceCheck.detail}`);
        renderApp();
        showToast(`Build trace import failed: ${traceCheck.detail}`, "error");
        return;
      }
      setImportStatus("buildTrace", "success", `${buildTraceFile.name} · ${traceCheck.detail}`);
    }

    loadData(
      searchRaw,
      metricsRaw,
      `${searchFile.name} + ${metricsFile.name}`,
      undefined,
      undefined,
      buildTraceRaw,
      buildTraceFile?.name,
    );
    setImportStatus("search", "success", `${searchFile.name} · ${searchCheck.detail}`);
    setImportStatus("metrics", "success", `${metricsFile.name} · ${metricsCheck.detail}`);
    renderApp();
    showToast("Local JSON files loaded.", "success");
  } catch (error) {
    renderApp();
    showToast(`File parse failed: ${error.message}`, "error");
  }
}

async function tryLoadDatasetFile() {
  const datasetFile = dom.datasetFileInput.files?.[0];
  if (!datasetFile) {
    return;
  }

  try {
    const datasetRaw = await readFileAsJson(datasetFile);
    const datasetCheck = validateDatasetJson(datasetRaw);
    if (!datasetCheck.ok) {
      setImportStatus("dataset", "error", `${datasetFile.name}: ${datasetCheck.detail}`);
      renderApp();
      showToast(`Dataset import failed: ${datasetCheck.detail}`, "error");
      return;
    }
    setDataset(datasetRaw, datasetFile.name);
    setImportStatus("dataset", "success", `${datasetFile.name} · ${datasetCheck.detail}`);
    renderApp();
    showToast("Dataset JSON loaded.", "success");
  } catch (error) {
    renderApp();
    showToast(`Dataset parse failed: ${error.message}`, "error");
  }
}

async function tryLoadBuildTraceFile() {
  const buildTraceFile = dom.buildTraceFileInput.files?.[0];
  if (!buildTraceFile) {
    return;
  }

  try {
    const buildTraceRaw = await readFileAsJson(buildTraceFile);
    const traceCheck = validateBuildTraceJson(buildTraceRaw);
    if (!traceCheck.ok) {
      setImportStatus("buildTrace", "error", `${buildTraceFile.name}: ${traceCheck.detail}`);
      renderApp();
      showToast(`Build trace import failed: ${traceCheck.detail}`, "error");
      return;
    }
    setBuildTrace(buildTraceRaw, buildTraceFile.name);
    setImportStatus("buildTrace", "success", `${buildTraceFile.name} · ${traceCheck.detail}`);
    renderApp();
    showToast("Build trace JSON loaded.", "success");
  } catch (error) {
    renderApp();
    showToast(`Build trace parse failed: ${error.message}`, "error");
  }
}

function renderOverview() {
  if (!state.items.length) {
    dom.overviewPanel.innerHTML = `
      <div class="panel-title-row">
        <div>
          <p class="section-kicker">Overview</p>
          <h2>\u5f53\u524d\u89c6\u56fe</h2>
        </div>
      </div>
      <div class="empty-state">\u52a0\u8f7d\u6570\u636e\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u7b5b\u9009\u540e\u7684\u6982\u89c8\u7edf\u8ba1\u3002</div>
    `;
    return;
  }

  const summary = summarizeItems(state.filteredItems);
  const categoryHtml = Object.entries(summary.categoryCounts)
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(
      ([category, count]) =>
        `<span class="badge neutral">${escapeHtml(
          CATEGORY_LABELS[category] || `Category ${category}`,
        )} \u00b7 ${count}</span>`,
    )
    .join("");

  dom.overviewPanel.innerHTML = `
    <div class="panel-title-row">
      <div>
        <p class="section-kicker">Overview</p>
        <h2>\u5f53\u524d\u89c6\u56fe</h2>
      </div>
      <span class="badge neutral">${summary.total} \u6761</span>
    </div>

    <div class="overview-grid">
      <article class="overview-card">
        <span>Visible</span>
        <strong>${summary.total}</strong>
        <b>\u5f53\u524d\u7b5b\u9009\u547d\u4e2d</b>
      </article>
      <article class="overview-card">
        <span>Coverage</span>
        <strong>${summary.withMetrics}</strong>
        <b>\u5e26\u8bc4\u6d4b\u6837\u672c</b>
      </article>
      <article class="overview-card">
        <span>Fail Count</span>
        <strong>${summary.failCount}</strong>
        <b>LLM Score = 0</b>
      </article>
      <article class="overview-card">
        <span>Avg Metrics</span>
        <div class="overview-metric-list">
          <div class="overview-metric-row">
            <label>F1</label>
            <strong>${formatMetric(summary.avgF1)}</strong>
          </div>
          <div class="overview-metric-row">
            <label>BLEU</label>
            <strong>${formatMetric(summary.avgBleu)}</strong>
          </div>
          <div class="overview-metric-row">
            <label>LLM Score</label>
            <strong>${formatMetric(summary.avgLlm)}</strong>
          </div>
        </div>
      </article>
      <article class="overview-card overview-card-wide">
        <span>Avg Time</span>
        <div class="overview-metric-list">
          <div class="overview-metric-row">
            <label>Retrieval</label>
            <strong>${formatMilliseconds(summary.avgRetrievalTimeMs)}</strong>
          </div>
          <div class="overview-metric-row">
            <label>Response</label>
            <strong>${formatSeconds(summary.avgResponseTime)}</strong>
          </div>
        </div>
      </article>
    </div>

    <div class="overview-footer">
      <div class="chip-row">
        ${categoryHtml || `<span class="badge neutral">\u6682\u65e0\u5206\u7c7b\u6570\u636e</span>`}
      </div>
    </div>
  `;
}

function summarizeItems(items) {
  const summary = {
    total: items.length,
    withMetrics: 0,
    unscored: 0,
    failCount: 0,
    passCount: 0,
    passRate: 0,
    avgF1: null,
    avgBleu: null,
    avgLlm: null,
    avgRetrievalTimeMs: null,
    avgResponseTime: null,
    categoryCounts: {},
  };

  const f1Values = [];
  const bleuValues = [];
  const llmValues = [];
  const retrievalTimes = [];
  const responseTimes = [];

  for (const item of items) {
    summary.categoryCounts[item.category] = (summary.categoryCounts[item.category] || 0) + 1;

    if (item.hasMetrics) {
      summary.withMetrics += 1;
      if (item.status === "pass") {
        summary.passCount += 1;
      }
      if (item.status === "fail") {
        summary.failCount += 1;
      }
      if (typeof item.llmScore === "number") {
        llmValues.push(item.llmScore);
      }
      if (typeof item.f1Score === "number") {
        f1Values.push(item.f1Score);
      }
      if (typeof item.bleuScore === "number") {
        bleuValues.push(item.bleuScore);
      }
    } else {
      summary.unscored += 1;
    }

    if (typeof item.responseTime === "number") {
      responseTimes.push(item.responseTime);
    }
    if (typeof item.retrievalTimeMs === "number") {
      retrievalTimes.push(item.retrievalTimeMs);
    }
  }

  summary.passRate = summary.withMetrics ? summary.passCount / summary.withMetrics : 0;
  summary.avgF1 = f1Values.length ? average(f1Values) : null;
  summary.avgBleu = bleuValues.length ? average(bleuValues) : null;
  summary.avgLlm = llmValues.length ? average(llmValues) : null;
  summary.avgRetrievalTimeMs = retrievalTimes.length ? average(retrievalTimes) : null;
  summary.avgResponseTime = responseTimes.length ? average(responseTimes) : null;
  return summary;
}

function getSorter(sortMode) {
  switch (sortMode) {
    case "llm":
      return (left, right) =>
        compareNullableAsc(left.llmScore, right.llmScore) ||
        compareItemsByRisk(left, right);
    case "llm_desc":
      return (left, right) =>
        compareNullableDesc(left.llmScore, right.llmScore) ||
        compareItemsByRisk(left, right);
    case "f1":
      return (left, right) =>
        compareNullableAsc(left.f1Score, right.f1Score) ||
        compareItemsByRisk(left, right);
    case "f1_desc":
      return (left, right) =>
        compareNullableDesc(left.f1Score, right.f1Score) ||
        compareItemsByRisk(left, right);
    case "bleu":
      return (left, right) =>
        compareNullableAsc(left.bleuScore, right.bleuScore) ||
        compareItemsByRisk(left, right);
    case "bleu_desc":
      return (left, right) =>
        compareNullableDesc(left.bleuScore, right.bleuScore) ||
        compareItemsByRisk(left, right);
    case "time_asc":
      return (left, right) =>
        compareNullableAsc(left.responseTime, right.responseTime) ||
        compareItemsByRisk(left, right);
    case "time":
      return (left, right) =>
        compareNullableDesc(left.responseTime, right.responseTime) ||
        compareItemsByRisk(left, right);
    case "retrieval_asc":
      return (left, right) =>
        compareNullableAsc(left.retrievalTimeMs, right.retrievalTimeMs) ||
        compareItemsByRisk(left, right);
    case "retrieval_desc":
      return (left, right) =>
        compareNullableDesc(left.retrievalTimeMs, right.retrievalTimeMs) ||
        compareItemsByRisk(left, right);
    case "question":
      return (left, right) => left.question.localeCompare(right.question);
    case "risk":
    default:
      return compareItemsByRisk;
  }
}
