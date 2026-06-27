/** On Vercel, large GLBs load from jsDelivr (repo root). Local dev uses relative paths. */
(function () {
  const CDN = location.hostname.endsWith(".vercel.app")
    ? "https://cdn.jsdelivr.net/gh/ShadowEsu/Blueprint@main/explorer/"
    : "";
  const CDN_V = "gt3parts2";
  window.__ASSET_CDN = CDN;
  window.resolveAsset = function (path) {
    const p = String(path || "");
    if (/^https?:\/\//i.test(p)) return p;
    const clean = p.replace(/^\.\//, "");
    if (!CDN) return p;
    const url = CDN + clean;
    return url + (url.includes("?") ? "&" : "?") + "v=" + CDN_V;
  };
})();
