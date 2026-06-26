/** Asset base: local files in dev, jsDelivr from GitHub on Vercel (keeps deploy under 100MB). */
const CDN_REPO = "ShadowEsu/Blueprint@main";

export function useCdnAssets() {
  if (new URLSearchParams(location.search).get("cdn") === "0") return false;
  return location.hostname.endsWith(".vercel.app");
}

export function assetUrl(path) {
  const clean = String(path).replace(/^\.\//, "");
  if (useCdnAssets()) {
    return `https://cdn.jsdelivr.net/gh/${CDN_REPO}/${clean}`;
  }
  return path.startsWith("./") ? path : `./${clean}`;
}
