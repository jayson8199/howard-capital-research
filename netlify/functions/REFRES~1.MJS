import { getStore } from "@netlify/blobs";

/* ============================================================
 * 定时云函数：refresh-quotes
 * ------------------------------------------------------------
 * 运行在 Netlify 自己的服务器上（不是用户电脑，也不是 Claude 的沙盒），
 * 按下面 config.schedule 里的 cron 表达式自动触发，不需要任何人手动
 * 点一下。每次运行：
 *   1. 依次请求东方财富的公开行情接口（push2.eastmoney.com），
 *      拿到18家公司的最新收盘/最新价；
 *   2. 把结果连同时间戳写进 Netlify Blobs（一个跟这个 site 绑定的
 *      持久化小型存储），存成一份 JSON 快照；
 *   3. 前端页面（assets/live-refresh.js）打开时会来问这个快照要不要
 *      更新一下价格。
 *
 * 单只股票请求失败不会影响其它股票，也不会让整次运行报错——失败的
 * 会记录在 errors 里，前端和下次运行都能看到。
 * ============================================================ */

const SECIDS = {
  "688825": "1.688825",
  "688981": "1.688981",
  "002371": "0.002371",
  "688012": "1.688012",
  "688041": "1.688041",
  "688256": "1.688256",
  "300308": "0.300308",
  "300502": "0.300502",
  "601138": "1.601138",
  "300750": "0.300750",
  "688120": "1.688120",
  "300567": "0.300567",
  "688072": "1.688072",
  "300394": "0.300394",
  "002028": "0.002028",
  "600406": "1.600406",
  "603259": "1.603259",
  "688019": "1.688019"
};

async function fetchOne(code, secid) {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f57,f58,f60,f86`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HowardCapitalResearchBot/1.0)" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const d = json && json.data;
  if (!d || typeof d.f43 !== "number" || d.f43 <= 0) {
    throw new Error("接口返回空数据（可能停牌或代码不存在）");
  }
  return {
    price: Math.round(d.f43) / 100,
    prevClose: typeof d.f60 === "number" ? Math.round(d.f60) / 100 : null,
    name: d.f58 || null,
    asOf: typeof d.f86 === "number" ? new Date(d.f86 * 1000).toISOString() : null
  };
}

export default async () => {
  const prices = {};
  const errors = [];

  for (const [code, secid] of Object.entries(SECIDS)) {
    try {
      prices[code] = await fetchOne(code, secid);
    } catch (e) {
      errors.push(`${code}: ${e && e.message ? e.message : String(e)}`);
    }
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    source: "eastmoney-push2",
    prices,
    errors
  };

  try {
    const store = getStore("hcr-data");
    await store.setJSON("latest-prices", payload);
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, stage: "write-blob", error: String(e && e.message ? e.message : e) }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, updated: Object.keys(prices).length, errors }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};

export const config = {
  // UTC 时间，07:30 UTC = 北京时间 15:30（A股收盘后），工作日运行
  schedule: "30 7 * * 1-5"
};
