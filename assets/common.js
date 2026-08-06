/* 公共渲染组件：导航栏、公司卡片、页脚 */

function renderTopbar(active) {
  const links = [
    ["decision.html", "决策中心"],
    ["workspace.html", "决策工作台"],
    ["industry.html", "产业地图"],
    ["index.html", "公司研究"],
    ["compare.html", "对比"],
    ["calculators.html", "估值中心"],
    ["global.html", "全球地图"],
    ["rankings.html", "排行榜"]
  ];
  const linkHtml = links.map(([href, label]) =>
    `<a href="${href}" class="${active === href ? "active" : ""}">${label}</a>`
  ).join("");
  return `
  <div class="topbar">
    <div class="topbar-inner">
      <a href="decision.html" class="brand"><span class="dot"></span>Howard Capital Research
        <small>HCR · Decision / Industry / Research / Valuation</small>
      </a>
      <nav class="nav-links">${linkHtml}</nav>
      <div class="topbar-meta">数据更新时间：${DATA_AS_OF}<br/>示例数据 · 可在公司页手动/尝试自动更新股价</div>
    </div>
  </div>`;
}

function renderFooter() {
  return `<div class="footer">
    Howard Capital Research · V4.2（股价接入东方财富行情，Netlify云函数自动定时刷新） ·
    本站信息仅供研究参考，不构成任何投资建议。<br/>
    ${DATA_SOURCE_NOTE}
  </div>`;
}

function zoneStyleAttr(zone) {
  return `style="--zone-color:${zone.color}"`;
}

function companyCardHTML(c) {
  const { marketCap, zone, safetyMargin, score, maxScore, effectivePrice, anchorPrices, priceIsLive } = c.computed;
  const fav = isFavorite(c.code);
  return `
  <a class="card" href="company.html?code=${c.code}" ${zoneStyleAttr(zone)}>
    <button class="fav-star ${fav ? "active" : ""}" data-fav-toggle="${c.code}" style="position:absolute; right:12px; top:12px;" title="收藏/取消收藏">${fav ? "★" : "☆"}</button>
    <div class="card-top">
      <div>
        <div class="card-name">${c.name}</div>
        <div class="card-code">${c.code} · ${c.industry}</div>
      </div>
      <span class="badge" ${zoneStyleAttr(zone)}>${zone.label}</span>
    </div>
    <div class="card-industry">${c.mainBusiness}</div>
    <div class="card-metrics">
      <div><span>当前市值</span><b>${formatYi(marketCap)}</b></div>
      <div><span>PE(TTM)</span><b>${c.marketFact.peTTM ?? "—"}</b></div>
      <div><span>合理锚</span><b>${formatYi(c.anchors.reasonable)}</b></div>
      <div><span>安全边际</span><b>${formatPct(safetyMargin)}</b></div>
      <div><span>现价${priceIsLive ? "（已更新）" : ""}</span><b>${effectivePrice} 元</b></div>
      <div><span>合理锚股价</span><b>${anchorPrices.reasonable} 元</b></div>
    </div>
    <div class="card-score"><span>综合评分</span><b>${score} / ${maxScore}</b></div>
  </a>`;
}

// 把当前市值映射到 0~100 的可视化位置（跨五级锚点分段线性插值）
function anchorPositionPercent(marketCap, a) {
  if (marketCap == null) return 50;
  const points = [
    [a.excellent * 0.5, 5],
    [a.excellent, 15],
    [a.safe, 35],
    [a.reasonable, 55],
    [a.optimistic, 75],
    [a.bubble, 90],
    [a.bubble * 1.3, 97]
  ];
  if (marketCap <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (marketCap <= points[i][0]) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const t = (marketCap - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return points[points.length - 1][1];
}

// 计算「距离进入更优（更便宜）区间还需要下跌多少百分比」，null 代表已处于最佳区间
function distanceToBetterZone(c) {
  const zoneKey = c.computed.zone.key;
  const mc = c.computed.marketCap;
  const a = c.anchors;
  const targetMap = {
    bubble: a.optimistic,
    optimistic: a.reasonable,
    reasonable: a.safe,
    safe: a.excellent
  };
  if (zoneKey === "excellent" || zoneKey === "unknown" || mc == null) return null;
  const target = targetMap[zoneKey];
  return (mc - target) / mc;
}

/* ---------------- 本地存储：收藏 / 标签（跨页面共用） ---------------- */

const LS_FAVORITES = "hcr_favorites_v1";
const LS_TAGS = "hcr_tags_v1";

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("读取本地存储失败：", key, e);
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("写入本地存储失败：", key, e);
  }
}

function getFavorites() {
  return lsGet(LS_FAVORITES, []);
}
function isFavorite(code) {
  return getFavorites().includes(code);
}
function toggleFavorite(code) {
  const favs = getFavorites();
  const idx = favs.indexOf(code);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(code);
  lsSet(LS_FAVORITES, favs);
  return favs.includes(code);
}

function getAllTags() {
  return lsGet(LS_TAGS, {});
}
function getTagsFor(code) {
  return getAllTags()[code] || [];
}
function addTag(code, tag) {
  tag = tag.trim();
  if (!tag) return;
  const all = getAllTags();
  if (!all[code]) all[code] = [];
  if (!all[code].includes(tag)) all[code].push(tag);
  lsSet(LS_TAGS, all);
}
function removeTag(code, tag) {
  const all = getAllTags();
  if (all[code]) all[code] = all[code].filter(t => t !== tag);
  lsSet(LS_TAGS, all);
}

function industryChipsHTML(selected) {
  const all = ["全部", ...INDUSTRIES];
  return all.map(ind => {
    const isActive = (ind === "全部" && !selected) || ind === selected;
    return `<span class="chip ${isActive ? "active" : ""}" data-industry="${ind === "全部" ? "" : ind}">${ind}</span>`;
  }).join("");
}
