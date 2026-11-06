const button = document.getElementById("capture");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
  button.disabled = true;
  status.textContent = "ページを読み取っています…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.startsWith("https://loilonote.app/")) {
      throw new Error("ロイロノートのページを開いてから実行してください。");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const visible = (el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 && rect.height > 0;
        };
        const links = [...document.querySelectorAll("a[href]")]
          .filter(visible)
          .map((a) => ({
            text: (a.innerText || a.getAttribute("aria-label") || "").trim(),
            href: a.href
          }))
          .filter((x) => x.text || x.href)
          .filter((x) => x.href.startsWith(location.origin));

        const controls = [...document.querySelectorAll(
          "button,[role='button'],[role='link'],[data-testid]"
        )]
          .filter(visible)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute("role") || "",
            label: (el.innerText || el.getAttribute("aria-label") || "").trim()
          }))
          .filter((x) => x.label)
          .slice(0, 500);

        return {
          schema: "loilonote-visible-page-v1",
          capturedAt: new Date().toISOString(),
          url: location.href,
          title: document.title,
          text: document.body?.innerText || "",
          links,
          controls,
          note: "Visible DOM text and same-origin visible links only. No cookies, credentials, hidden app state, or network requests."
        };
      }
    });

    const data = results?.[0]?.result;
    if (!data) throw new Error("ページ内容を取得できませんでした。");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);
    const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
    await chrome.downloads.download({
      url: objectUrl,
      filename: "loilonote-capture-" + safeDate + ".json",
      saveAs: true
    });
    status.textContent = "取得しました。テキスト " + data.text.length.toLocaleString() +
      " 文字 / リンク " + data.links.length + " 件";
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    status.textContent = "エラー: " + (error.message || error);
  } finally {
    button.disabled = false;
  }
});
