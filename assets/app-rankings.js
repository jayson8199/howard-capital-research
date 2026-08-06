/* 排行榜逻辑：所有榜单都是对 COMPANIES_ENRICHED 的纯前端排序，不写死结果 */

document.getElementById("topbar").innerHTML = renderTopbar("rankings.html");
document.getElementById("footer").innerHTML = renderFooter();

function starCount(str) {
  if (!str) return 0;
  return (str.match(/★/g) || []).length;
}

function tableHTML(rows, cols) {
  return `
  <table class="data-table">
    <thead><tr><th>#</th>${cols.map(c => `<th>${c.title}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((c, i) => `
        <tr>
          <td><span class="rank-medal">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span></td>
          ${cols.map(col => `<td class="${col.num ? "num" : ""}">${col.render(c)}</td>`).join("")}
        </tr>`).join("")}
    </tbody>
  </table>`;
}

function nameCol() {
  return { title: "公司", render: c => `<a href="company.html?code=${c.code}">${c.name}</a> <span style="color:var(--text-faint)">${c.code}</span>` };
}

const boards = [
  {
    title: "① 安全边际最大 Top 10",
    desc: "安全边际 = (合理锚 - 当前市值) / 合理锚，数值越大代表当前价格相对研究模型的合理估值越有折扣。",
    rows: () => [...COMPANIES_ENRICHED].sort((a, b) => (b.computed.safetyMargin ?? -Infinity) - (a.computed.safetyMargin ?? -Infinity)).slice(0, 10),
    cols: [nameCol(), { title: "当前市值", num: true, render: c => formatYi(c.computed.marketCap) }, { title: "合理锚", num: true, render: c => formatYi(c.anchors.reasonable) }, { title: "安全边际", num: true, render: c => formatPct(c.computed.safetyMargin) }]
  },
  {
    title: "② 估值提升空间最大 Top 10（合理锚 / 当前市值）",
    desc: "用「合理锚 ÷ 当前市值」衡量研究模型隐含的估值修复/成长空间，替代真实盈利增速指标（示例数据暂无历史利润基期，无法计算真实CAGR）。",
    rows: () => [...COMPANIES_ENRICHED].sort((a, b) => (b.anchors.reasonable / (b.computed.marketCap||1)) - (a.anchors.reasonable / (a.computed.marketCap||1))).slice(0, 10),
    cols: [nameCol(), { title: "当前市值", num: true, render: c => formatYi(c.computed.marketCap) }, { title: "合理锚", num: true, render: c => formatYi(c.anchors.reasonable) }, { title: "空间倍数", num: true, render: c => (c.anchors.reasonable / (c.computed.marketCap||1)).toFixed(2) + "x" }]
  },
  {
    title: "③ PE(TTM) 最低 Top 10",
    desc: "PE 越低不代表越便宜，需结合成长性与行业属性一并判断，仅作参考。",
    rows: () => [...COMPANIES_ENRICHED].filter(c => c.marketFact.peTTM != null).sort((a, b) => a.marketFact.peTTM - b.marketFact.peTTM).slice(0, 10),
    cols: [nameCol(), { title: "PE(TTM)", num: true, render: c => c.marketFact.peTTM }, { title: "PB", num: true, render: c => c.marketFact.pb ?? "—" }, { title: "当前区间", render: c => `<span style="color:${c.computed.zone.color}">${c.computed.zone.label}</span>` }]
  },
  {
    title: "④ 市值最大 Top 10",
    desc: "按当前计算市值（股价 × 总股本）排序。",
    rows: () => [...COMPANIES_ENRICHED].sort((a, b) => (b.computed.marketCap ?? -Infinity) - (a.computed.marketCap ?? -Infinity)).slice(0, 10),
    cols: [nameCol(), { title: "当前市值", num: true, render: c => formatYi(c.computed.marketCap) }, { title: "行业", render: c => c.industry }]
  },
  {
    title: "⑤ 综合评分最高 Top 10",
    desc: "评分 = 行业空间 + 竞争壁垒 + 成长性 + 估值 + 技术趋势（各占20分，满分100分，自动求和）。",
    rows: () => [...COMPANIES_ENRICHED].sort((a, b) => b.computed.score - a.computed.score).slice(0, 10),
    cols: [nameCol(), { title: "综合评分", num: true, render: c => `${c.computed.score} / ${c.computed.maxScore}` }, { title: "当前区间", render: c => `<span style="color:${c.computed.zone.color}">${c.computed.zone.label}</span>` }]
  },
  {
    title: "⑥ 国产替代程度最高 Top 10",
    desc: "按国产替代率标注的星级（★数量）排序。",
    rows: () => [...COMPANIES_ENRICHED].sort((a, b) => starCount(b.domesticReplacementRate) - starCount(a.domesticReplacementRate)).slice(0, 10),
    cols: [nameCol(), { title: "国产替代率", render: c => c.domesticReplacementRate || "—" }, { title: "国家战略等级", render: c => c.nationalStrategyLevel || "—" }]
  }
];

document.getElementById("rankRoot").innerHTML = boards.map(b => `
  <div class="panel">
    <h3>${b.title}</h3>
    <p class="section-sub">${b.desc}</p>
    ${tableHTML(b.rows(), b.cols)}
  </div>
`).join("");
