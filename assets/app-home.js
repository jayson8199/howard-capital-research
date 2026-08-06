/* 首页逻辑：搜索 / 行业筛选 / 排序 / 公司卡片 / 估值地图 */

document.getElementById("topbar").innerHTML = renderTopbar("index.html");
document.getElementById("footer").innerHTML = renderFooter();
document.getElementById("industryChips").innerHTML = industryChipsHTML("");

let state = { keyword: "", industry: "", sort: "marketCapDesc", favOnly: false };

function applyFilters() {
  let list = COMPANIES_ENRICHED.filter(c => {
    const kw = state.keyword.trim().toLowerCase();
    const tags = getTagsFor(c.code).join(" ").toLowerCase();
    const matchKw = !kw || c.name.toLowerCase().includes(kw) || c.code.includes(kw) || tags.includes(kw);
    const matchInd = !state.industry || c.industry === state.industry;
    const matchFav = !state.favOnly || isFavorite(c.code);
    return matchKw && matchInd && matchFav;
  });

  const sorters = {
    marketCapDesc: (a, b) => (b.computed.marketCap ?? -Infinity) - (a.computed.marketCap ?? -Infinity),
    marketCapAsc: (a, b) => (a.computed.marketCap ?? Infinity) - (b.computed.marketCap ?? Infinity),
    marginDesc: (a, b) => (b.computed.safetyMargin ?? -Infinity) - (a.computed.safetyMargin ?? -Infinity),
    scoreDesc: (a, b) => b.computed.score - a.computed.score,
    peAsc: (a, b) => (a.marketFact.peTTM ?? Infinity) - (b.marketFact.peTTM ?? Infinity)
  };
  list.sort(sorters[state.sort]);
  return list;
}

function render() {
  const list = applyFilters();

  document.getElementById("companyGrid").innerHTML =
    list.map(companyCardHTML).join("") || `<p class="section-sub">没有匹配的公司。</p>`;

  document.getElementById("valueMap").innerHTML = list.map(c => {
    const pct = anchorPositionPercent(c.computed.marketCap, c.anchors);
    return `
    <div class="valuemap-row">
      <div class="valuemap-name">${c.name}</div>
      <div class="valuemap-track">
        <div class="valuemap-dot" style="left:${pct}%; --zone-color:${c.computed.zone.color}" title="${c.name}：${formatYi(c.computed.marketCap)}"></div>
      </div>
      <div class="valuemap-zone" style="--zone-color:${c.computed.zone.color}">${c.computed.zone.label}</div>
    </div>`;
  }).join("");
}

document.getElementById("searchInput").addEventListener("input", e => {
  state.keyword = e.target.value;
  render();
});
document.getElementById("sortSelect").addEventListener("change", e => {
  state.sort = e.target.value;
  render();
});
document.getElementById("industryChips").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  state.industry = chip.dataset.industry;
  document.querySelectorAll("#industryChips .chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  render();
});

const favToggleChip = document.getElementById("favOnlyChip");
if (favToggleChip) {
  favToggleChip.addEventListener("click", () => {
    state.favOnly = !state.favOnly;
    favToggleChip.classList.toggle("active", state.favOnly);
    render();
  });
}

// 收藏星标点击（阻止跳转到详情页）
document.getElementById("companyGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-fav-toggle]");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const active = toggleFavorite(btn.dataset.favToggle);
  btn.classList.toggle("active", active);
  btn.textContent = active ? "★" : "☆";
  if (state.favOnly) render();
});

render();
