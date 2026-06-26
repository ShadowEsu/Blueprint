/** On Vercel, large GLBs load from jsDelivr (repo root). Local dev uses relative paths. */
(function () {
  const CDN = location.hostname.endsWith(".vercel.app")
    ? "https://cdn.jsdelivr.net/gh/ShadowEsu/Blueprint@main/explorer/"
    : "";
  window.__ASSET_CDN = CDN;
  window.resolveAsset = function (path) {
    const p = String(path || "");
    if (/^https?:\/\//i.test(p)) return p;
    const clean = p.replace(/^\.\//, "");
    return CDN ? CDN + clean : p;
  };
})();
