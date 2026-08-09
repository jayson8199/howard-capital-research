/* ============================================================
 * 实时行情自动叠加层
 * ------------------------------------------------------------
 * 页面加载时向本站自己的 Netlify 云函数 /.netlify/functions/get-quotes
 * 要一份最新行情快照。这份快照由另一个部署在 Netlify 上的定时云函数
 * （netlify/functions/refresh-quotes.mjs）在 Netlify 自己的服务器上
 * 按计划（工作日每天收盘后）去请求东方财富公开行情接口生成，全程不
 * 依赖本地电脑、不依赖任何人工操作——这样即使没人管这个网站，数据
 * 也会自动保持新鲜。
 *
 * 如果这个云函数还没跑过、或者暂时请求失败，本脚本会静默放弃，页面
 * 就照常显示打包时写死在 data.js 里的价格，不会报错也不会卡住。
 * ============================================================ */
(function () {
  var RELOAD_FLAG = "hcr_live_refresh_reloaded_v1";

 function safeGetLivePrice(code) {
   try {
     return typeof getLivePrice === "function" ? getLivePrice(code) : null;
   } catch (e) {
     return null;
   }
 }

 fetch("/.netlify/functions/get-quotes", { cache: "no-store" })
  .then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  })
  .then(function (payload) {
    if (!payload || !payload.ok || !payload.prices) return;
    var changed = false;

        try {
          var metaEl = document.getElementById("topbarMeta");
          if (metaEl && payload.updatedAt) {
            var d = new Date(payload.updatedAt);
            var stamp = d.toLocaleString("zh-CN", { hour12: false });
            metaEl.innerHTML = "行情最后自动刷新：" + stamp + "（东方财富，工作日收盘后自动更新）";
          }
        } catch (e) {}

        Object.keys(payload.prices).forEach(function (code) {
          var p = payload.prices[code];
          if (!p || !p.price) return;
          var existing = safeGetLivePrice(code);
          if (existing && existing.source === "manual") return;
          if (existing && existing.source === "eastmoney-auto" && existing.price === p.price) return;

                                            if (typeof setLivePrice === "function") {
                                              setLivePrice(code, p.price, "eastmoney-auto");
                                              changed = true;
                                            }
        });

        if (changed) {
          var already = false;
          try { already = sessionStorage.getItem(RELOAD_FLAG) === "1"; } catch (e) {}
          if (!already) {
            try { sessionStorage.setItem(RELOAD_FLAG, "1"); } catch (e) {}
            location.reload();
          } else if (typeof refreshEnrichedData === "function") {
            refreshEnrichedData();
          }
        }
  })
  .catch(function () {
  });
})();
