/** Local paths on disk; jsDelivr CDN in production (keeps deploy under 100MB). */
function useAssetCdn() {
  if (typeof location === "undefined") return false;
  if (location.protocol === "file:") return false;
  const host = location.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;
  return true;
}

export function assetUrl(path) {
  const p = String(path || "");
  if (/^https?:\/\//i.test(p)) return p;
  if (useAssetCdn()) {
    const clean = p.replace(/^\.\//, "");
    return `https://cdn.jsdelivr.net/gh/ShadowEsu/Blueprint@main/${clean}?v=finalproduct1`;
  }
  return p;
}
