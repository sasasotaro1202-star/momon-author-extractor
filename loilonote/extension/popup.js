const captureButton = document.getElementById("capture");
const exportButton = document.getElementById("export");
const status = document.getElementById("status");

const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");
const saveBlob = async (blob, filename) => {
  const url = URL.createObjectURL(blob);
  try {
    const id = await chrome.downloads.download({ url, filename, saveAs: true });
    return id;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

async function capturePage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://loilonote.app/")) {
    throw new Error("ロイロノートの資料箱または資料ページを開いてください。");
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const visible = (el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" &&
          Number(s.opacity) !== 0 && r.width > 0 && r.height > 0;
      };
      const textOf = (el) => (el?.innerText || el?.getAttribute?.("aria-label") ||
        el?.getAttribute?.("alt") || el?.getAttribute?.("title") || "")
        .replace(/\s+/g, " ").trim();
      const nodes = [...document.querySelectorAll("body *")].filter(visible);
      const links = [...document.querySelectorAll("a[href]")].filter(visible).map(a => ({
        text: textOf(a), href: (() => { const u = new URL(a.href); return u.origin + u.pathname; })()
      })).filter(x => x.href.startsWith(location.origin));
      const controls = nodes.filter(el =>
        el.matches("a,button,[role],[tabindex],[onclick]") ||
        getComputedStyle(el).cursor === "pointer"
      ).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          text: textOf(el),
          ariaLabel: el.getAttribute("aria-label") || "",
          title: el.getAttribute("title") || "",
          href: el instanceof HTMLAnchorElement ? el.href : "",
          className: typeof el.className === "string" ? el.className.slice(0,180) : "",
          dataAttributes: Object.fromEntries([...el.attributes].filter(a => a.name.startsWith("data-")).slice(0,20).map(a => [a.name,a.value.slice(0,160)])),
          outerHTML: el.outerHTML.slice(0,1200),
          bounds: {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}
        };
      }).filter(x => x.text || x.href || x.ariaLabel || x.title).slice(0,2000);
      const images = [...document.querySelectorAll("img")].filter(visible).map(img => ({
        alt: img.alt || "", src: (() => { try { const u = new URL(img.currentSrc || img.src || "", location.href); return u.origin + u.pathname; } catch { return ""; } })(),
        width: img.naturalWidth || 0, height: img.naturalHeight || 0
      }));
      const tables = [...document.querySelectorAll("table")].filter(visible).map(t => textOf(t));
      const canvas = [...document.querySelectorAll("canvas")].filter(visible).map(c => ({
        width:c.width,height:c.height,
        bounds:(()=>{const r=c.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}})()
      }));
      const text = document.body?.innerText || "";
      const privateUse = (text.match(/[\uE000-\uF8FF]/g) || []).length;
      const replacement = (text.match(/\uFFFD/g) || []).length;
      const formulaHints = (text.match(/[=＋－×÷√∫∑≤≥≠]/g) || []).length;
      return {
        schema:"loilonote-local-archive-v4",
        capturedAt:new Date().toISOString(),
        url:location.href,
        title:document.title,
        headings:[...document.querySelectorAll("h1,h2,h3,[role='heading']")].filter(visible).map(textOf).filter(Boolean),
        text, links, controls, images, tables, canvas,
        quality:{
          textLength:text.length,
          privateUseGlyphCount:privateUse,
          replacementCharacterCount:replacement,
          formulaSymbolCount:formulaHints,
          visibleImageCount:images.length,
          canvasCount:canvas.length,
          warnings:[
            ...(privateUse?["私用領域文字が含まれます。数式・特殊文字の文字起こしは不完全の可能性があります。"]:[]),
            ...(replacement?["置換文字が含まれます。原資料との照合が必要です。"]:[]),
            ...(canvas.length?["Canvas表示があります。JSON本文だけでは図・数式を完全保存できない場合があります。"]:[]),
            ...(!text.length?["本文テキストが取得できていません。"]:[])
          ]
        },
        safety:"表示中の可視DOMのみ。URLのクエリ・フラグメントは保存しません。Cookie・認証情報・非表示アプリ状態の取得、クリック、送信、編集、削除、外部通信は行いません。"
      };
    }
  });
  if (!result?.result) throw new Error("ページ内容を読み取れませんでした。");
  return { tab, data: result.result };
}

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  exportButton.disabled = true;
  status.textContent = "表示中ページを読み取り、ローカル保存しています…";
  try {
    const {tab,data} = await capturePage();
    const key = data.url;
    const old = await chrome.storage.local.get("captures");
    const captures = old.captures || {};
    const previous = captures[key];
    const fingerprintInput = JSON.stringify({
      title:data.title,text:data.text,links:data.links,images:data.images,controls:data.controls
    });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprintInput));
    const hash = [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
    const unchanged = previous?.hash === hash;
    const revisions = previous?.revisions || [];
    if (!unchanged) revisions.push({capturedAt:data.capturedAt,hash,data});
    captures[key] = {url:key,title:data.title,hash,lastCapturedAt:data.capturedAt,revisions:revisions.slice(-5)};
    await chrome.storage.local.set({captures});
    const json = JSON.stringify(data,null,2);
    const jsonId = await saveBlob(new Blob([json],{type:"application/json;charset=utf-8"}),
      "LoiLoNote_"+stamp()+".json");
    let screenshotMessage = "画面画像は未保存";
    try {
      const png = await chrome.tabs.captureVisibleTab(tab.windowId,{format:"png"});
      const response = await fetch(png);
      const blob = await response.blob();
      const imageId = await saveBlob(blob,"LoiLoNote_Screen_"+stamp()+".png");
      screenshotMessage = "画面画像ダウンロードID "+imageId;
    } catch (e) {
      screenshotMessage = "画面画像は取得できませんでした（"+(e.message||e)+"）";
    }
    status.textContent =
      (unchanged ? "本文に変更なし（重複保存を抑制）" : "新規・更新データを保存")+
      "\n"+data.title+
      "\n本文 "+data.text.length+"文字 / リンク "+data.links.length+
      "件 / 画像 "+data.images.length+"件 / Canvas "+data.canvas.length+"件"+
      "\n履歴URL数 "+Object.keys(captures).length+
      "\nJSONダウンロードID "+jsonId+
      "\n"+screenshotMessage+
      (data.quality.warnings.length ? "\n注意: "+data.quality.warnings.join(" / ") : "\n抽出上の警告なし（完全性の保証ではありません）");
  } catch (error) {
    status.textContent = "取得失敗: "+(error.message||error);
  } finally {
    captureButton.disabled = false;
    exportButton.disabled = false;
  }
});

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  try {
    const {captures={}} = await chrome.storage.local.get("captures");
    const archive = {
      schema:"loilonote-local-archive-index-v1",
      exportedAt:new Date().toISOString(),
      count:Object.keys(captures).length,
      captures
    };
    const id = await saveBlob(new Blob([JSON.stringify(archive,null,2)],
      {type:"application/json;charset=utf-8"}),"LoiLoNote_Archive_"+stamp()+".json");
    status.textContent = "ローカル保存済み "+archive.count+" URL分をエクスポートしました。ダウンロードID "+id;
  } catch (error) {
    status.textContent = "エクスポート失敗: "+(error.message||error);
  } finally {
    exportButton.disabled = false;
  }
});

const openArchiveButton = document.getElementById("openArchive");
openArchiveButton?.addEventListener("click", () => {
  chrome.tabs.create({url: chrome.runtime.getURL("archive.html")});
});
