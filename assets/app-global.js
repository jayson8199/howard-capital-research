/* 全球科技地图逻辑：美国/台湾/韩国 → 中国 层级展示 + 点击高亮联动 */

document.getElementById("topbar").innerHTML = renderTopbar("global.html");
document.getElementById("footer").innerHTML = renderFooter();

function companyByCode(code) {
  return COMPANIES_ENRICHED.find(c => c.code === code);
}

// 渲染左侧美国/台湾/韩国三栏
document.getElementById("gmapCountries").innerHTML = GLOBAL_MAP.upstream.map(country => `
  <div class="gmap-country">
    <h4>🌐 ${country.country}</h4>
    ${country.companies.map(co => `
      <div class="gmap-chip" data-codes="${co.relatedCodes.join(",")}">
        <span>${co.name}</span>
        <span class="seg">${co.segment}</span>
      </div>
    `).join("")}
  </div>
`).join("");

// 渲染中国公司卡片
document.getElementById("gmapChina").innerHTML = GLOBAL_MAP.china.map(code => {
  const c = companyByCode(code);
  if (!c) return "";
  return `
  <a class="gmap-china-card" id="cn-${c.code}" href="company.html?code=${c.code}" style="--zone-color:${c.computed.zone.color}">
    <div class="name">${c.name}</div>
    <div class="meta">${c.code} · ${c.industry}</div>
    <div class="meta">${formatYi(c.computed.marketCap)} · <span style="color:${c.computed.zone.color}">${c.computed.zone.label}</span></div>
  </a>`;
}).join("");

// 点击海外公司 → 高亮对应中国标的
document.getElementById("gmapCountries").addEventListener("click", e => {
  const chip = e.target.closest(".gmap-chip");
  if (!chip) return;
  document.querySelectorAll(".gmap-china-card").forEach(el => el.classList.remove("highlight"));
  const codes = chip.dataset.codes.split(",").filter(Boolean);
  let firstEl = null;
  codes.forEach(code => {
    const el = document.getElementById("cn-" + code);
    if (el) {
      el.classList.add("highlight");
      if (!firstEl) firstEl = el;
    }
  });
  if (firstEl) firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
});
