/*
 * momon:GA private-mylist exporter
 * Run with Safari Shortcuts: "WebページでJavaScriptを実行".
 * It reads only the currently loaded mylist DOM and copies a clean ID list.
 * It does NOT send cookies, page HTML, titles, or private content anywhere.
 */
(function () {
  const ids = [...new Set(
    (document.documentElement.innerHTML.match(/\bmo\d{5,}\b/gi) || [])
      .map(x => x.toLowerCase())
  )];

  const result = [
    `MOMON_ID_EXPORT_V1`,
    `COUNT=${ids.length}`,
    ...ids
  ].join("\n");

  if (typeof completion === "function") {
    completion(result);
  } else {
    navigator.clipboard?.writeText(result);
  }
})();
