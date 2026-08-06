/* 决策工作台：观察池 + Thesis Tracker + 决策日志
 * 全部数据存放在浏览器 localStorage，不联网、不上传，
 * 换设备/清缓存会丢失，页面里已经提示用户。 */

document.getElementById("topbar").innerHTML = renderTopbar("workspace.html");
document.getElementById("footer").innerHTML = renderFooter();

const LS_WATCHLIST = "hcr_watchlist_v1";
const LS_THESIS = "hcr_thesis_status_v1";
const LS_LOG = "hcr_decision_log_v1";
const LS_NOTES = "hcr_notebook_v1";

function getLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("读取本地存储失败：", key, e);
    return fallback;
  }
}
function setLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("写入本地存储失败：", key, e);
  }
}

function companyByCode(code) {
  return COMPANIES_ENRICHED.find(c => c.code === code);
}

/* ---------------- 观察池 ---------------- */

const watchSelect = document.getElementById("watchSelect");
COMPANIES_ENRICHED.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
  watchSelect.appendChild(opt);
});

function renderWatchlist() {
  const list = getLS(LS_WATCHLIST, []);
  const box = document.getElementById("watchList");
  if (!list.length) {
    box.innerHTML = `<p class="section-sub">观察池是空的，从上面选一家公司加进来。</p>`;
    return;
  }
  box.innerHTML = list.map(code => {
    const c = companyByCode(code);
    if (!c) return "";
    const dist = distanceToBetterZone(c);
    return `
    <div class="ws-watch-row">
      <div>
        <a href="company.html?code=${c.code}"><b>${c.name}</b></a>
        <span style="color:${c.computed.zone.color}; margin-left:8px;">${c.computed.zone.label}</span>
        <span style="color:var(--text-faint); margin-left:8px; font-size:12px;">
          ${dist == null ? "已处于最佳区间" : "还需下跌 " + formatPct(dist) + " 进入更优区间"}
        </span>
      </div>
      <button class="btn secondary" data-remove="${c.code}">移出</button>
    </div>`;
  }).join("");
}

document.getElementById("watchAddBtn").addEventListener("click", () => {
  const code = watchSelect.value;
  if (!code) return;
  const list = getLS(LS_WATCHLIST, []);
  if (!list.includes(code)) list.push(code);
  setLS(LS_WATCHLIST, list);
  renderWatchlist();
});
document.getElementById("watchList").addEventListener("click", e => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  const list = getLS(LS_WATCHLIST, []).filter(c => c !== btn.dataset.remove);
  setLS(LS_WATCHLIST, list);
  renderWatchlist();
});

renderWatchlist();

/* ---------------- 研究笔记 Notebook ---------------- */

const noteSelect = document.getElementById("noteSelect");
const noteText = document.getElementById("noteText");
const noteSavedHint = document.getElementById("noteSavedHint");
COMPANIES_ENRICHED.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
  noteSelect.appendChild(opt);
});

function loadNoteIntoBox() {
  const notes = getLS(LS_NOTES, {});
  noteText.value = notes[noteSelect.value] || "";
  noteSavedHint.textContent = "";
}
noteSelect.addEventListener("change", loadNoteIntoBox);
loadNoteIntoBox();

document.getElementById("noteSaveBtn").addEventListener("click", () => {
  const notes = getLS(LS_NOTES, {});
  notes[noteSelect.value] = noteText.value;
  setLS(LS_NOTES, notes);
  noteSavedHint.textContent = "已保存 ✓";
  renderNoteList();
});

function renderNoteList() {
  const notes = getLS(LS_NOTES, {});
  const entries = Object.entries(notes).filter(([, text]) => text && text.trim());
  const box = document.getElementById("noteList");
  if (!entries.length) {
    box.innerHTML = `<p class="section-sub">还没有写任何笔记。</p>`;
    return;
  }
  box.innerHTML = entries.map(([code, text]) => {
    const c = companyByCode(code);
    return `
    <div class="ws-watch-row" style="align-items:flex-start;">
      <div>
        <a href="company.html?code=${code}"><b>${c ? c.name : code}</b></a>
        <p class="section-sub" style="margin:4px 0 0; white-space:pre-wrap;">${text}</p>
      </div>
    </div>`;
  }).join("");
}
renderNoteList();

/* ---------------- Thesis Tracker ---------------- */

const STATUS_LABELS = {
  pending: "待验证",
  confirmed: "已成立",
  strengthened: "正在加强",
  weakened: "正在削弱"
};

function renderThesisList() {
  const statusMap = getLS(LS_THESIS, {});
  document.getElementById("thesisList").innerHTML = COMPANIES_ENRICHED.map(c => {
    const statuses = statusMap[c.code] || c.thesis.map(() => "pending");
    return `
    <details class="thesis-card">
      <summary>
        <span>${c.name}　<span style="color:var(--text-faint); font-weight:400; font-size:12px;">${c.code}</span></span>
        <span style="color:${c.computed.zone.color}; font-size:12.5px;">${c.computed.zone.label}</span>
      </summary>
      ${c.thesis.map((t, i) => `
        <div class="thesis-item">
          <span class="txt">${t}</span>
          <select data-code="${c.code}" data-idx="${i}" class="status-${statuses[i]}">
            ${Object.entries(STATUS_LABELS).map(([k, label]) =>
              `<option value="${k}" ${statuses[i] === k ? "selected" : ""}>${label}</option>`
            ).join("")}
          </select>
        </div>
      `).join("")}
    </details>`;
  }).join("");
}

document.getElementById("thesisList").addEventListener("change", e => {
  const sel = e.target.closest("select[data-code]");
  if (!sel) return;
  const statusMap = getLS(LS_THESIS, {});
  const code = sel.dataset.code;
  const idx = parseInt(sel.dataset.idx, 10);
  const c = companyByCode(code);
  if (!statusMap[code]) statusMap[code] = c.thesis.map(() => "pending");
  statusMap[code][idx] = sel.value;
  setLS(LS_THESIS, statusMap);
  sel.className = "status-" + sel.value;
});

renderThesisList();

/* ---------------- 决策日志 ---------------- */

const logCompanySelect = document.getElementById("logCompany");
COMPANIES_ENRICHED.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code; opt.textContent = `${c.name}（${c.code}）`;
  logCompanySelect.appendChild(opt);
});
document.getElementById("logDate").value = new Date().toISOString().slice(0, 10);

function renderLog() {
  const log = getLS(LS_LOG, []);
  const withVerdict = log.filter(e => e.verdict === "correct" || e.verdict === "wrong");
  const correct = log.filter(e => e.verdict === "correct").length;
  const accuracy = withVerdict.length ? (correct / withVerdict.length) : null;

  document.getElementById("logStats").innerHTML = `
    <div class="stat-box"><b>${log.length}</b><span>累计决策次数</span></div>
    <div class="stat-box"><b>${withVerdict.length}</b><span>已复盘次数</span></div>
    <div class="stat-box"><b>${accuracy == null ? "—" : formatPct(accuracy)}</b><span>复盘正确率（不是收益率）</span></div>
  `;

  const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("logList").innerHTML = sorted.length ? `
    <table class="data-table">
      <thead><tr><th>日期</th><th>公司</th><th>操作</th><th>信心</th><th>原因</th><th>复盘结果</th><th></th></tr></thead>
      <tbody>
        ${sorted.map(e => {
          const c = companyByCode(e.code);
          return `<tr>
            <td>${e.date}</td>
            <td>${c ? `<a href="company.html?code=${c.code}">${c.name}</a>` : e.code}</td>
            <td>${e.action}</td>
            <td>${"★".repeat(e.confidence)}${"☆".repeat(5 - e.confidence)}</td>
            <td>${e.reason || "—"}</td>
            <td>
              <select data-verdict="${e.id}">
                <option value="pending" ${e.verdict === "pending" ? "selected" : ""}>待复盘</option>
                <option value="correct" ${e.verdict === "correct" ? "selected" : ""}>✅ 正确</option>
                <option value="wrong" ${e.verdict === "wrong" ? "selected" : ""}>❌ 错误</option>
              </select>
            </td>
            <td><button class="btn secondary" data-del="${e.id}">删除</button></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  ` : `<p class="section-sub">还没有记录任何决策。</p>`;
}

document.getElementById("logAddBtn").addEventListener("click", () => {
  const date = document.getElementById("logDate").value || new Date().toISOString().slice(0, 10);
  const code = logCompanySelect.value;
  const action = document.getElementById("logAction").value;
  const confidence = parseInt(document.getElementById("logConfidence").value, 10);
  const reason = document.getElementById("logReason").value.trim();
  if (!code) return;
  const log = getLS(LS_LOG, []);
  log.push({ id: Date.now().toString(36), date, code, action, confidence, reason, verdict: "pending" });
  setLS(LS_LOG, log);
  document.getElementById("logReason").value = "";
  renderLog();
});

document.getElementById("logList").addEventListener("change", e => {
  const sel = e.target.closest("select[data-verdict]");
  if (!sel) return;
  const log = getLS(LS_LOG, []);
  const entry = log.find(x => x.id === sel.dataset.verdict);
  if (entry) entry.verdict = sel.value;
  setLS(LS_LOG, log);
  renderLog();
});

document.getElementById("logList").addEventListener("click", e => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  const log = getLS(LS_LOG, []).filter(x => x.id !== btn.dataset.del);
  setLS(LS_LOG, log);
  renderLog();
});

renderLog();
