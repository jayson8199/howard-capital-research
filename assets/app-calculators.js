/* 计算器逻辑：市值计算器 + 估值计算器 */

document.getElementById("topbar").innerHTML = renderTopbar("calculators.html");
document.getElementById("footer").innerHTML = renderFooter();

const params = new URLSearchParams(location.search);
const presetCode = params.get("code");
const presetMode = params.get("mode");

const explainerSelect = document.getElementById("explainerSelect");
const explainerBox = document.getElementById("explainerBox");
COMPANIES_ENRICHED.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
  explainerSelect.appendChild(opt);
});
explainerSelect.addEventListener("change", () => {
  const c = COMPANIES_ENRICHED.find(x => x.code === explainerSelect.value);
  if (!c) { explainerBox.innerHTML = ""; return; }
  const a = c.anchors;
  explainerBox.innerHTML = `
    <div class="formula-step">第一步：未来利润预测</div>
    <div class="formula-box">${a.forecastProfitYear} 年预测净利润 ≈ ${a.forecastNetProfit} 亿元</div>
    <div class="formula-step">第二步：给予合理 PE 区间</div>
    <div class="formula-box">合理 PE：${a.reasonablePELow} ~ ${a.reasonablePEHigh} 倍</div>
    <div class="formula-step">第三步：基准合理市值 = 预测净利润 × 合理PE（取中值）</div>
    <div class="formula-box">${a.forecastNetProfit} 亿元 × ~${Math.round((a.reasonablePELow+a.reasonablePEHigh)/2)} 倍 ≈ ${formatYi(a.baseFairValue)}</div>
    <div class="formula-step">第四步：稀缺性 / 行业周期调整系数</div>
    <div class="formula-box">${formatYi(a.baseFairValue)} × ${a.adjustmentFactor} ≈ ${formatYi(a.adjustedFairValue)}（= 合理锚）</div>
    <p class="section-sub">${a.anchorExplanation}</p>
    <div class="kv-grid">
      <div class="kv"><span>当前市值</span><b>${formatYi(c.computed.marketCap)}</b></div>
      <div class="kv"><span>当前所在区间</span><b style="color:${c.computed.zone.color}">${c.computed.zone.label}</b></div>
      <div class="kv"><span>安全边际</span><b>${formatPct(c.computed.safetyMargin)}</b></div>
    </div>
    <a class="btn secondary" href="company.html?code=${c.code}" style="margin-top:12px; display:inline-block;">查看完整公司研究页 →</a>
  `;
});

const mcSelect = document.getElementById("mcCompanySelect");
const vcSelect = document.getElementById("vcCompanySelect");
COMPANIES_ENRICHED.forEach(c => {
  const opt1 = document.createElement("option");
  opt1.value = c.code; opt1.textContent = `${c.name}（${c.code}）`;
  mcSelect.appendChild(opt1);
  const opt2 = document.createElement("option");
  opt2.value = c.code; opt2.textContent = `${c.name}（${c.code}）`;
  vcSelect.appendChild(opt2);
});

const mcPrice = document.getElementById("mcPrice");
const mcShares = document.getElementById("mcShares");
const mcResult = document.getElementById("mcResult");

function updateMarketCap() {
  const p = parseFloat(mcPrice.value);
  const s = parseFloat(mcShares.value);
  if (isNaN(p) || isNaN(s)) { mcResult.textContent = "—"; return; }
  mcResult.textContent = `${formatYi(p * s)}（${p} 元 × ${s} 亿股）`;
}
mcPrice.addEventListener("input", updateMarketCap);
mcShares.addEventListener("input", updateMarketCap);
mcSelect.addEventListener("change", () => {
  const c = COMPANIES_ENRICHED.find(x => x.code === mcSelect.value);
  if (c) {
    mcPrice.value = c.marketFact.price;
    mcShares.value = c.marketFact.totalShares;
  } else {
    mcPrice.value = ""; mcShares.value = "";
  }
  updateMarketCap();
});

const vcProfit = document.getElementById("vcProfit");
const vcPE = document.getElementById("vcPE");
const vcFactor = document.getElementById("vcFactor");
const vcBase = document.getElementById("vcBase");
const vcFinal = document.getElementById("vcFinal");

function updateValuation() {
  const profit = parseFloat(vcProfit.value);
  const pe = parseFloat(vcPE.value);
  const factor = parseFloat(vcFactor.value) || 1.0;
  if (isNaN(profit) || isNaN(pe)) { vcBase.textContent = "—"; vcFinal.textContent = "—"; return; }
  const base = profit * pe;
  vcBase.textContent = `${formatYi(base)}（${profit} 亿元 × ${pe} 倍）`;
  vcFinal.textContent = `${formatYi(base * factor)}（× 调整系数 ${factor}）`;
}
vcProfit.addEventListener("input", updateValuation);
vcPE.addEventListener("input", updateValuation);
vcFactor.addEventListener("input", updateValuation);
vcSelect.addEventListener("change", () => {
  const c = COMPANIES_ENRICHED.find(x => x.code === vcSelect.value);
  if (c) {
    vcProfit.value = c.anchors.forecastNetProfit;
    vcPE.value = Math.round((c.anchors.reasonablePELow + c.anchors.reasonablePEHigh) / 2);
    vcFactor.value = c.anchors.adjustmentFactor;
  } else {
    vcProfit.value = ""; vcPE.value = ""; vcFactor.value = 1.0;
  }
  updateValuation();
});

// 支持从公司详情页跳转时自动带入
if (presetCode) {
  if (presetMode === "valuation") {
    vcSelect.value = presetCode;
    vcSelect.dispatchEvent(new Event("change"));
  } else {
    mcSelect.value = presetCode;
    mcSelect.dispatchEvent(new Event("change"));
  }
}
