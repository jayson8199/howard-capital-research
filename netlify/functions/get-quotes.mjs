import { getStore } from "@netlify/blobs";

/* ============================================================
 * 按需云函数：get-quotes
 * ------------------------------------------------------------
 * 前端（assets/live-refresh.js）每次打开页面时会请求这个函数，
 * 读出 refresh-quotes 定时函数上一次写入的行情快照并原样返回。
 * 这个函数本身不去请求东方财富，只是读一下 Netlify Blobs 里
 * 已经存好的数据，所以响应很快。
 * ============================================================ */

export default async () => {
  try {
    const store = getStore("hcr-data");
    const data = await store.get("latest-prices", { type: "json" });

    if (!data) {
      return new Response(
        JSON.stringify({ ok: false, message: "尚无快照，等待首次定时任务执行（工作日15:30北京时间）" }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-store"
          }
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, ...data }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e && e.message ? e.message : e) }),
      { status: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }
    );
  }
};
