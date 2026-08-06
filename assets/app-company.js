/* 公司详情页逻辑 */

document.getElementById("topbar").innerHTML = renderTopbar("index.html");
document.getElementById("footer").innerHTML = renderFooter();

const params = new URLSearchParams(location.search);
const code = params.get("code");
let company = COMPANIES_ENRICHED.find(c => c.code === code) || COMPANIES_ENRICHED[0];

function anchorScaleHTML(c) {
  const a = c.anchors;
  const ap = c.computed.anchorPrices;
  const pct = anchorPositionPercent(c.computed.marketCap, a);
  return `
  <div class="anchor-scale">
    <div class="anchor-track">
      <div class="anchor-current" style="left:${pct}%; color:${c.computed.zone.color}">
        ${c.name}<br/>${formatYi(c.computed.marketCap)}
      </div>
    </div>
    <div class="anchor-labels">
      <span>极佳机会<br/>≤${formatYi(a.excellent)}<br/>≤${ap.excellent}元</span>
      <span>安全区<br/>≤${formatYi(a.safe)}<br/>≤${ap.safe}元</span>
      <span>合理区<br/>≤${formatYi(a.reasonable)}<br/>≤${ap.reasonable}元</span>
      <span>乐观区<br/>≤${formatYi(a.optimistic)}<br/>≤${ap.optimistic}元</span>
      <span>泡沫区<br/>&gt;${formatYi(a.bubble)}<br/>&gt;${ap.bubble}元</span>
    </div>
  </div>`;
}

// 五级锚点对应股价一览表（当前生效股价 vs 五个锚点股价）
function anchorPriceTableHTML(c) {
  const ap = c.computed.anchorPrices;
  const rows = [
    ["现价（当前生效股价）", c.computed.effectivePrice, c.computed.zone.color, true],
    ["极佳机会锚对应股价", ap.excellent, "var(--zone-excellent)", false],
    ["安全锚对应股价", ap.safe, "var(--zone-safe)", false],
    ["合理锚对应股价", ap.reasonable, "var(--zone-reasonable)", false],
    ["乐观锚对应股价", ap.optimistic, "var(--zone-optimistic)", false],
    ["泡沫锚对应股价", ap.bubble, "var(--zone-bubble)", false]
  ];
  return `
  <div class="kv-grid">
    ${rows.map(([label, price, color, isCurrent]) => `
      <div class="kv">
        <span>${label}</span>
        <b style="color:${color}">${price != null ? price + " 元" : "—"}${isCurrent ? "" : ""}</b>
      </div>
    `).join("")}
  </div>
  <p class="section-sub" style="margin-top:10px;">
    换算公式：锚点对应股价 = 锚点市值 ÷ 总股本（${c.marketFact.totalShares} 亿股）。与"当前市值"一样，锚点市值本身是研究判断，不是行情数据，这里只是把它换算成同一股本口径下更直观的股价供参考。
  </p>`;
}

// 手动/自动更新股价面板
function priceUpdatePanelHTML(c) {
  const live = c.computed.liveInfo;
  const sourceLabel = { manual: "手动输入", sina: "新浪行情接口", gtimg: "腾讯行情接口" };
  const statusLine = live
    ? `已更新 · 来源：${sourceLabel[live.source] || live.source} · 更新时间：${new Date(live.updatedAt).toLocaleString()}`
    : `当前为示例数据 · 数据日期：${c.marketFact.asOfDate}`;
  return `
  <div class="panel">
    <h3>🔄 更新最新股价</h3>
    <div class="kv-grid" style="margin-bottom:10px;">
      <div class="kv"><span>当前生效股价</span><b>${c.computed.effectivePrice} 元</b></div>
      <div class="kv"><span>对应当前市值</span><b>${formatYi(c.computed.marketCap)}</b></div>
    </div>
    <p class="section-sub" style="margin:0 0 10px;">${statusLine}</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <input class="input" id="manualPriceInput" type="number" step="0.01" min="0" placeholder="输入最新股价（元）" style="max-width:180px; flex:none;" />
      <button class="btn secondary" id="manualPriceBtn">手动更新</button>
      <button class="btn secondary" id="autoFetchBtn">尝试自动获取实时行情</button>
      ${live ? `<button class="btn secondary" id="resetPriceBtn">恢复示例数据</button>` : ""}
    </div>
    <div id="priceUpdateMsg" class="section-sub" style="margin-top:10px; min-height:18px;"></div>
    <div class="source-note" style="margin-top:10px;">
      本站是零后端静态网站，没有自己的服务器去连接行情源。"自动获取"是让你的浏览器直接请求新浪/腾讯的公开行情接口，能否成功取决于你当前设备的网络环境，失败会明确提示、绝不展示假数据。"手动更新"保存在这台设备的这个浏览器本地存储中，仅本机生效，不会跨设备同步，清除浏览器数据会丢失。
    </div>
  </div>`;
}

function tickerFor(c) {
  return (c.code.startsWith("6") ? "sh" : "sz") + c.code;
}

function fetchViaScriptTag(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    let done = false;
    const finish = (fn, arg) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      s.remove();
      fn(arg);
    };
    const timer = setTimeout(() => finish(reject, new Error("请求超时（6秒无响应）")), timeoutMs || 6000);
    s.onload = () => finish(resolve, null);
    s.onerror = () => finish(reject, new Error("请求失败（可能被网络环境拦截）"));
    s.src = url;
    document.head.appendChild(s);
  });
}

async function tryFetchLiveQuote(c) {
  const ticker = tickerFor(c);
  const errors = [];
  try {
    await fetchViaScriptTag(`https://hq.sinajs.cn/list=${ticker}&_r=${Date.now()}`, 6000);
    const raw = window[`hq_str_${ticker}`];
    if (raw) {
      const price = parseFloat(raw.split(",")[3]);
      if (price > 0) return { price, source: "sina" };
    }
    errors.push("新浪接口无有效数据");
  } catch (e) {
    errors.push(`新浪接口：${e.message}`);
  }
  try {
    await fetchViaScriptTag(`https://qt.gtimg.cn/q=${ticker}&_r=${Date.now()}`, 6000);
    const raw = window[`v_${ticker}`];
    if (raw) {
      const price = parseFloat(raw.split("~")[3]);
      if (price > 0) return { price, source: "gtimg" };
    }
    errors.push("腾讯接口无有效数据");
  } catch (e) {
    errors.push(`腾讯接口：${e.message}`);
  }
  throw new Error(`自动获取失败：${errors.join("；")}。这通常说明当前网络环境无法访问新浪/腾讯的行情接口（例如境外/云端网络），可改用下方"手动更新股价"。`);
}

function timelineHTML(c) {
  return `<div class="timeline">
    ${c.timeline.map(t => `
      <div class="timeline-item">
        <div class="timeline-year">${t.year}</div>
        <div class="timeline-dot"></div>
        <div class="timeline-event">${t.event}</div>
      </div>
    `).join("")}
  </div>`;
}

function scoreRowsHTML(c) {
  return c.scores.map(s => `
    <div class="score-row">
      <div class="score-name">${s.name}</div>
      <div class="score-bar-bg"><div class="score-bar-fill" style="width:${(s.score/s.maxScore)*100}%"></div></div>
      <div class="score-val">${s.score}/${s.maxScore}</div>
    </div>
    <div class="score-reason">${s.reason}</div>
  `).join("");
}

function renderCompany(c) {
  const mf = c.marketFact;
  const a = c.anchors;
  const marketCap = c.computed.marketCap;
  const diffNote = (mf.reportedMarketCap != null && Math.abs(mf.reportedMarketCap - marketCap) > Math.max(1, marketCap * 0.005))
    ? `<div class="formula-step">与数据源展示市值（${formatYi(mf.reportedMarketCap)}）存在差异：因四舍五入、股本变动或数据时点不同，以现场计算值为准。</div>`
    : "";

  const tags = getTagsFor(c.code);
  const fav = isFavorite(c.code);

  document.getElementById("companyRoot").innerHTML = `
    <div class="breadcrumb"><a href="index.html">首页</a> / ${c.name}</div>

    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
      <h1 class="section-title" style="margin:0;">${c.name}</h1>
      <button class="fav-star ${fav ? "active" : ""}" id="favBtn" title="收藏/取消收藏" style="font-size:22px;">${fav ? "★" : "☆"}</button>
    </div>

    <div class="panel" style="padding:14px 18px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12.5px; color:var(--text-faint);">标签：</span>
        <div class="taglist" id="tagList">
          ${tags.map(t => `<span class="tag" style="border-color:var(--accent-2); color:var(--accent-2);">${t} <a href="#" data-remove-tag="${t}" style="color:var(--danger); margin-left:4px;">×</a></span>`).join("")}
        </div>
        <input class="input tag-input" id="tagInput" placeholder="输入标签后回车，如：AI / 国产替代 / 高景气" style="max-width:280px; padding:6px 10px; font-size:12.5px;" />
      </div>
    </div>

    <div class="detail-grid">
      <div>
        <div class="panel" style="border-color:var(--accent-2)">
          <h3>📝 研究笔记（一句话定位）</h3>
          <p style="font-size:16px; font-weight:600; margin:0 0 14px;">${c.research.oneLiner}</p>
          <div class="formula-step" style="margin-bottom:4px;"><b style="color:var(--text)">为什么不是更高估值？</b></div>
          <p class="section-sub" style="margin-top:0;">${c.research.whyNotHigher}</p>
          <div class="formula-step" style="margin-bottom:4px;"><b style="color:var(--text)">什么情况下应该考虑卖出？</b></div>
          <p class="section-sub" style="margin-top:0;">${c.research.sellTriggers}</p>
        </div>

        <div class="panel">
          <h3>🏷️ 基本信息</h3>
          <div class="kv-grid">
            <div class="kv"><span>股票代码</span><b>${c.code}</b></div>
            <div class="kv"><span>行业</span><b>${c.industry}</b></div>
            <div class="kv"><span>交易所</span><b>${c.exchange}</b></div>
            <div class="kv"><span>股份类别</span><b>${c.shareClass}</b></div>
            <div class="kv"><span>全球对标</span><b>${c.globalBenchmark}</b></div>
            <div class="kv"><span>国产替代率</span><b>${c.domesticReplacementRate || "—"}</b></div>
            <div class="kv"><span>国家战略等级</span><b>${c.nationalStrategyLevel || "—"}</b></div>
            <div class="kv"><span>估值口径</span><b>${c.valuationType}</b></div>
          </div>
          <p class="section-sub" style="margin-top:12px;">${c.mainBusiness}</p>
        </div>

        <div class="panel">
          <h3>📊 当前数据（市场事实）</h3>
          <div class="formula-box">
            ${mf.price} 元 × ${mf.totalShares} 亿股 = ${formatYi(marketCap)}
          </div>
          ${diffNote}
          <div class="kv-grid" style="margin-top:14px;">
            <div class="kv"><span>最新股价</span><b>${mf.price} 元</b></div>
            <div class="kv"><span>总股本</span><b>${mf.totalShares} 亿股</b></div>
            <div class="kv"><span>流通股本</span><b>${mf.floatShares ?? "—"} 亿股</b></div>
            <div class="kv"><span>当前市值（计算）</span><b>${formatYi(marketCap)}</b></div>
            <div class="kv"><span>PE(TTM)</span><b>${mf.peTTM ?? "—"}</b></div>
            <div class="kv"><span>PB</span><b>${mf.pb ?? "—"}</b></div>
          </div>
          <div class="source-note">
            市值计算方式：${mf.marketCapMethod} · 数据日期：${mf.asOfDate} · 数据来源：${mf.sourceName}
            ${mf.sourceNote ? "· " + mf.sourceNote : ""}
          </div>
        </div>

        ${priceUpdatePanelHTML(c)}

        <div class="panel">
          <h3>🎯 估值锚（研究判断，非行情数据）</h3>
          ${anchorScaleHTML(c)}
          <div class="kv-grid" style="margin-top:22px;">
            <div class="kv"><span>当前所在区间（系统自动判断）</span><b style="color:${c.computed.zone.color}">${c.computed.zone.label}</b></div>
            <div class="kv"><span>安全边际 (合理锚-当前市值)/合理锚</span><b>${formatPct(c.computed.safetyMargin)}</b></div>
          </div>
        </div>

        <div class="panel">
          <h3>💰 锚点对应股价一览</h3>
          ${anchorPriceTableHTML(c)}
        </div>

        <div class="panel">
          <h3>🧮 锚定依据拆解</h3>
          <div class="formula-step">第一步：未来利润预测</div>
          <div class="formula-box">${a.forecastProfitYear} 年预测净利润 ≈ ${a.forecastNetProfit} 亿元</div>
          <div class="formula-step">第二步：给予合理 PE 区间</div>
          <div class="formula-box">合理 PE：${a.reasonablePELow} ~ ${a.reasonablePEHigh} 倍</div>
          <div class="formula-step">第三步：基准合理市值 = 预测净利润 × 合理PE（取中值区间）</div>
          <div class="formula-box">${a.forecastNetProfit} 亿元 × ~${Math.round((a.reasonablePELow+a.reasonablePEHigh)/2)} 倍 ≈ ${formatYi(a.baseFairValue)}</div>
          <div class="formula-step">第四步：稀缺性 / 行业周期调整系数</div>
          <div class="formula-box">${formatYi(a.baseFairValue)} × ${a.adjustmentFactor} ≈ ${formatYi(a.adjustedFairValue)}（= 合理锚）</div>
          <p class="section-sub" style="margin-top:10px;">${a.anchorExplanation}</p>
        </div>

        <div class="panel">
          <h3>🕒 产业时间轴</h3>
          <p class="section-sub">根据公开信息与讨论内容整理的示意时间轴，未来事件标注"计划/预期/推进中"，不是确定性承诺，具体请以公司公告为准。</p>
          ${timelineHTML(c)}
        </div>
      </div>

      <div>
        <div class="panel">
          <h3>⭐ 投资评分（自动求和：${c.computed.score} / ${c.computed.maxScore}）</h3>
          ${scoreRowsHTML(c)}
        </div>

        <div class="panel">
          <h3>🚀 核心催化剂</h3>
          <div class="taglist">
            ${c.catalysts.map(x => `<span class="tag catalyst">${x}</span>`).join("")}
          </div>
        </div>

        <div class="panel">
          <h3>⚠️ 核心风险</h3>
          <div class="taglist">
            ${c.risks.map(x => `<span class="tag risk">${x}</span>`).join("")}
          </div>
        </div>

        <div class="panel">
          <h3>🔗 相关工具</h3>
          <p class="section-sub">用当前公司的数据直接试算：</p>
          <a class="btn secondary" href="calculators.html?code=${c.code}&mode=marketcap">打开市值计算器</a>
          <br/><br/>
          <a class="btn secondary" href="calculators.html?code=${c.code}&mode=valuation">打开估值计算器</a>
          <br/><br/>
          <a class="btn secondary" href="compare.html?codes=${c.code}">加入对比</a>
          <br/><br/>
          <a class="btn secondary" href="workspace.html">去决策工作台记录笔记/决策</a>
        </div>
      </div>
    </div>
  `;
}

renderCompany(company);

function setPriceMsg(text, isError) {
  const el = document.getElementById("priceUpdateMsg");
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? "var(--danger)" : "var(--accent-2)";
}

// 收藏 / 标签 / 股价更新 交互（事件委托在 companyRoot 上，renderCompany 重绘也不受影响）
document.getElementById("companyRoot").addEventListener("click", async e => {
  const favBtn = e.target.closest("#favBtn");
  if (favBtn) {
    const active = toggleFavorite(company.code);
    favBtn.classList.toggle("active", active);
    favBtn.textContent = active ? "★" : "☆";
    return;
  }
  const removeLink = e.target.closest("[data-remove-tag]");
  if (removeLink) {
    e.preventDefault();
    removeTag(company.code, removeLink.dataset.removeTag);
    renderCompany(company);
    return;
  }

  const manualBtn = e.target.closest("#manualPriceBtn");
  if (manualBtn) {
    const input = document.getElementById("manualPriceInput");
    const val = parseFloat(input.value);
    if (!val || val <= 0) {
      setPriceMsg("请输入一个大于0的股价数字。", true);
      return;
    }
    setLivePrice(company.code, val, "manual");
    refreshEnrichedData();
    company = COMPANIES_ENRICHED.find(x => x.code === code) || company;
    renderCompany(company);
    setPriceMsg(`已手动更新股价为 ${val} 元，市值与区间已重新计算。`, false);
    return;
  }

  const resetBtn = e.target.closest("#resetPriceBtn");
  if (resetBtn) {
    clearLivePrice(company.code);
    refreshEnrichedData();
    company = COMPANIES_ENRICHED.find(x => x.code === code) || company;
    renderCompany(company);
    setPriceMsg("已恢复为示例数据。", false);
    return;
  }

  const autoBtn = e.target.closest("#autoFetchBtn");
  if (autoBtn) {
    autoBtn.disabled = true;
    autoBtn.textContent = "获取中…";
    setPriceMsg("正在尝试连接新浪/腾讯行情接口……", false);
    try {
      const result = await tryFetchLiveQuote(company);
      setLivePrice(company.code, result.price, result.source);
      refreshEnrichedData();
      company = COMPANIES_ENRICHED.find(x => x.code === code) || company;
      renderCompany(company);
      setPriceMsg(`自动获取成功：${result.price} 元（来源：${result.source === "sina" ? "新浪" : "腾讯"}）。`, false);
    } catch (err) {
      setPriceMsg(err.message, true);
    }
    return;
  }
});

document.getElementById("companyRoot").addEventListener("keydown", e => {
  if (e.target && e.target.id === "manualPriceInput" && e.key === "Enter") {
    e.preventDefault();
    document.getElementById("manualPriceBtn").click();
  }
});

document.getElementById("companyRoot").addEventListener("keydown", e => {
  if (e.target && e.target.id === "tagInput" && e.key === "Enter") {
    e.preventDefault();
    addTag(company.code, e.target.value);
    renderCompany(company);
  }
});
