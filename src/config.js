/** Local paths on disk; jsDelivr CDN on Vercel (keeps deploy under 100MB). */
export function assetUrl(path) {
  const p = String(path || "");
  if (/^https?:\/\//i.test(p)) return p;
  if (typeof location !== "undefined" && location.hostname.endsWith(".vercel.app")) {
    const clean = p.replace(/^\.\//, "");
    return `https://cdn.jsdelivr.net/gh/ShadowEsu/Blueprint@main/${clean}?v=finalproduct1`;
  }
  return p;
}
