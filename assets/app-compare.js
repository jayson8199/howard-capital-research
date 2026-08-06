/* 公司对比逻辑：选 2~3 家公司并排比较 */

document.getElementById("topbar").innerHTML = renderTopbar("compare.html");
document.getElementById("footer").innerHTML = renderFooter();

const selA = document.getElementById("cmpA");
const selB = document.getElementById("cmpB");
const selC = document.getElementById("cmpC");

const params = new URLSearchParams(location.search);
const presetCodes = (params.get("codes") || "").split(",").filter(Boolean);

[selA, selB].forEach((sel, i) => {
  COMPANIES_ENRICHED.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
    sel.appendChild(opt);
  });
  if (presetCodes[i]) sel.value = presetCodes[i];
  else sel.selectedIndex = i;
});
COMPANIES_ENRICHED.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
  selC.appendChild(opt);
});
if (presetCodes[2]) selC.value = presetCodes[2];

function companyByCode(code) {
  return COMPANIES_ENRICHED.find(c => c.code === code);
}

function starCount(str) {
  if (!str) return 0;
  return (str.match(/★/g) || []).length;
}

const ROWS = [
  { label: "行业", render: c => c.industry },
  { label: "全球对标", render: c => c.globalBenchmark },
  { label: "一句话定位", render: c => c.research.oneLiner },
  { label: "当前市值", render: c => formatYi(c.computed.marketCap) },
  { label: "现价（元）", render: c => `${c.computed.effectivePrice}${c.computed.priceIsLive ? " · 已更新" : ""}` },
  { label: "PE (TTM)", render: c => c.marketFact.peTTM ?? "—" },
  { label: "PB", render: c => c.marketFact.pb ?? "—" },
  { label: "合理锚", render: c => formatYi(c.anchors.reasonable) },
  { label: "合理锚对应股价（元）", render: c => c.computed.anchorPrices.reasonable },
  { label: "安全边际", render: c => formatPct(c.computed.safetyMargin) },
  { label: "当前区间", render: c => `<span style="color:${c.computed.zone.color}">${c.computed.zone.label}</span>` },
  { label: "综合评分", render: c => `${c.computed.score} / ${c.computed.maxScore}` },
  { label: "国产替代率", render: c => c.domesticReplacementRate || "—" },
  { label: "核心逻辑条数", render: c => `${c.thesis.length} 条` },
  { label: "核心风险数", render: c => `${c.risks.length} 条` }
];

function render() {
  const codes = [selA.value, selB.value, selC.value].filter(Boolean);
  const companies = codes.map(companyByCode).filter(Boolean);
  if (companies.length < 2) {
    document.getElementById("compareTable").innerHTML = `<tr><td>请至少选择两家公司</td></tr>`;
    return;
  }
  const table = document.getElementById("compareTable");
  table.innerHTML = `
    <thead>
      <tr>
        <th class="row-label"></th>
        ${companies.map(c => `<th><a href="company.html?code=${c.code}" style="color:${c.computed.zone.color}">${c.name}</a></th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${ROWS.map(row => `
        <tr>
          <th class="row-label">${row.label}</th>
          ${companies.map(c => `<td>${row.render(c)}</td>`).join("")}
        </tr>
      `).join("")}
    </tbody>
  `;
}

[selA, selB, selC].forEach(sel => sel.addEventListener("change", render));
render();
