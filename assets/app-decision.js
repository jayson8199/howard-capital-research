/* 决策中心逻辑：全部基于当前静态数据实时计算，不编造历史变化 */

document.getElementById("topbar").innerHTML = renderTopbar("decision.html");
document.getElementById("footer").innerHTML = renderFooter();

// distanceToBetterZone() 已提升到 common.js（决策中心与决策工作台共用）

function miniCardHTML(c, extraLine) {
  return `
  <div class="valuemap-row" style="grid-template-columns: 160px 1fr 220px;">
    <div class="valuemap-name"><a href="company.html?code=${c.code}">${c.name}</a></div>
    <div class="valuemap-track">
      <div class="valuemap-dot" style="left:${anchorPositionPercent(c.computed.marketCap, c.anchors)}%; --zone-color:${c.computed.zone.color}"></div>
    </div>
    <div class="valuemap-zone" style="--zone-color:${c.computed.zone.color}">${extraLine}</div>
  </div>`;
}

// ① 最接近进入更优区间
const closest = COMPANIES_ENRICHED
  .map(c => ({ c, dist: distanceToBetterZone(c) }))
  .filter(x => x.dist != null)
  .sort((a, b) => a.dist - b.dist)
  .slice(0, 6);

document.getElementById("closestZone").innerHTML = closest.length
  ? closest.map(x => miniCardHTML(x.c, `还需下跌 ${formatPct(x.dist)} 进入更优区间`)).join("")
  : `<p class="section-sub">所有公司都已经处于极佳机会区间。</p>`;

// ② 已在安全区/极佳机会
const goodZone = COMPANIES_ENRICHED
  .filter(c => ["excellent", "safe"].includes(c.computed.zone.key))
  .sort((a, b) => (b.computed.safetyMargin ?? -Infinity) - (a.computed.safetyMargin ?? -Infinity));

document.getElementById("goodZone").innerHTML = goodZone.length
  ? goodZone.map(c => miniCardHTML(c, `安全边际 ${formatPct(c.computed.safetyMargin)}`)).join("")
  : `<p class="section-sub">当前没有公司处于安全区或极佳机会区间。</p>`;

// ③ 偏贵/泡沫区
const riskZone = COMPANIES_ENRICHED
  .filter(c => ["optimistic", "bubble"].includes(c.computed.zone.key))
  .sort((a, b) => (a.computed.safetyMargin ?? Infinity) - (b.computed.safetyMargin ?? Infinity));

document.getElementById("riskZone").innerHTML = riskZone.length
  ? riskZone.map(c => miniCardHTML(c, `安全边际 ${formatPct(c.computed.safetyMargin)}`)).join("")
  : `<p class="section-sub">当前没有公司处于乐观区或泡沫区。</p>`;

// ④ 各公司最薄弱评分项
document.getElementById("weakScores").innerHTML = `
  <table class="data-table">
    <thead><tr><th>公司</th><th>最薄弱维度</th><th>得分</th><th>说明</th></tr></thead>
    <tbody>
      ${COMPANIES_ENRICHED.map(c => {
        const weakest = [...c.scores].sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))[0];
        return `<tr>
          <td><a href="company.html?code=${c.code}">${c.name}</a></td>
          <td>${weakest.name}</td>
          <td class="num">${weakest.score}/${weakest.maxScore}</td>
          <td>${weakest.reason}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
`;
