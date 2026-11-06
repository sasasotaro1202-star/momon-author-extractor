const button = document.getElementById("capture");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
  button.disabled = true;
  status.textContent = "ページを読み取っています…";
  let objectUrl = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.startsWith("https://loilonote.app/")) {
      throw new Error("ロイロノートのページを開いてから実行してください。");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const isVisible = (el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 && rect.height > 0;
        };
        const clean = (value) => (value || "").replace(/\\s+/g, " ").trim();
        const visible = [...document.querySelectorAll("body *")].filter(isVisible);

        const links = [...document.querySelectorAll("a[href]")]
          .filter(isVisible)
          .map((a) => ({
            text: clean(a.innerText || a.getAttribute("aria-label") || a.title),
            href: a.href
          }))
          .filter((x) => x.href.startsWith(location.origin));

        // LoiLoNoteの授業カード等は、a/button以外の要素がクリック対象の場合がある。
        // クリックや画面遷移は行わず、可視要素の属性だけを調査する。
        const interactive = visible
          .filter((el) =>
            el.matches("a,button,[role],[tabindex],[onclick]") ||
            getComputedStyle(el).cursor === "pointer"
          )
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              role: el.getAttribute("role") || "",
              text: clean(el.innerText || el.getAttribute("aria-label") || el.title),
              ariaLabel: el.getAttribute("aria-label") || "",
              title: el.title || "",
              href: el instanceof HTMLAnchorElement ? el.href : "",
              tabIndex: el.getAttribute("tabindex"),
              className: typeof el.className === "string" ? el.className.slice(0, 240) : "",
              bounds: {
                x: Math.round(rect.x), y: Math.round(rect.y),
                width: Math.round(rect.width), height: Math.round(rect.height)
              }
            };
          })
          .filter((x) => x.text || x.href || x.ariaLabel || x.title)
          .slice(0, 1500);

        const headings = [...document.querySelectorAll("h1,h2,h3,[role='heading']")]
          .filter(isVisible)
          .map((el) => clean(el.innerText || el.getAttribute("aria-label")))
          .filter(Boolean);

        return {
          schema: "loilonote-visible-page-v2",
          capturedAt: new Date().toISOString(),
          url: location.href,
          title: document.title,
          headings,
          text: document.body?.innerText || "",
          links,
          interactive,
          note: "可視DOM情報のみ。画面操作、Cookie・認証情報・非表示アプリ状態の取得、外部送信は行いません。"
        };
      }
    });

    const data = results?.[0]?.result;
    if (!data) throw new Error("ページ内容を取得できませんでした。");

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadId = await chrome.downloads.download({
      url: objectUrl,
      filename: "loilonote-capture-" + safeDate + ".json",
      saveAs: true
    });

    status.textContent =
      "取得処理を開始しました。\n" +
      "本文 " + data.text.length.toLocaleString() + " 文字 / " +
      "リンク " + data.links.length + " 件 / " +
      "操作候補 " + data.interactive.length + " 件\n" +
      "ダウンロードID: " + downloadId;
    // ダウンロード完了イベントで解放する。popupが閉じても即時revokeしない。
    const listener = (delta) => {
      if (delta.id === downloadId && delta.state?.current === "complete") {
        chrome.downloads.onChanged.removeListener(listener);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } else if (delta.id === downloadId && delta.error) {
        chrome.downloads.onChanged.removeListener(listener);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    };
    chrome.downloads.onChanged.addListener(listener);
  } catch (error) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    status.textContent = "エラー: " + (error.message || error);
  } finally {
    button.disabled = false;
  }
});
