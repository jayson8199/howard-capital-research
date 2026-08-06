/* 产业地图逻辑：渲染 INDUSTRY_TREE 树状结构，叶子节点关联真实公司数据 */

document.getElementById("topbar").innerHTML = renderTopbar("industry.html");
document.getElementById("footer").innerHTML = renderFooter();

function companyByCode(code) {
  return COMPANIES_ENRICHED.find(c => c.code === code);
}

function companyChipHTML(code) {
  const c = companyByCode(code);
  if (!c) return "";
  return `
  <a class="tree-company" href="company.html?code=${c.code}" style="--zone-color:${c.computed.zone.color}">
    <span class="name">${c.name}</span>
    <span class="meta">${formatYi(c.computed.marketCap)} · ${c.computed.zone.label}</span>
  </a>`;
}

document.getElementById("industryTree").innerHTML = INDUSTRY_TREE.map(group => `
  <div class="tree-group">
    <div class="tree-group-title">🌐 ${group.name}<span class="line"></span></div>
    ${group.children.map(sub => `
      <div class="tree-sub">
        <div class="tree-sub-title">
          ${sub.name}
          <span class="peers">全球对标：${sub.globalPeers.join("、")}</span>
        </div>
        <div class="tree-companies">
          ${sub.codes.map(companyChipHTML).join("")}
        </div>
      </div>
    `).join("")}
  </div>
`).join("");
