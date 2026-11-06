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
      const safeLocalUrl = (raw) => {
        try {
          const u = new URL(raw, location.href);
          if (u.origin !== location.origin || !["https:","http:"].includes(u.protocol)) return "";
          return u.origin + u.pathname;
        } catch { return ""; }
      };
      const safePageUrl = location.origin + location.pathname;
      const nodes = [...document.querySelectorAll("body *")].filter(visible);
      const links = [...document.querySelectorAll("a[href]")].filter(visible).map(a => ({
        text: textOf(a), href: safeLocalUrl(a.href)
      })).filter(x => x.href);
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
          href: el instanceof HTMLAnchorElement ? safeLocalUrl(el.href) : "",
          className: typeof el.className === "string" ? el.className.slice(0,180) : "",
          dataAttributes: Object.fromEntries([...el.attributes].filter(a => a.name.startsWith("data-")).slice(0,20).map(a => [a.name,a.value.slice(0,160)])),
          outerHTML: (() => { const clone = el.cloneNode(false); for (const a of [...clone.attributes]) if (["href","src","srcset"].includes(a.name.toLowerCase())) clone.removeAttribute(a.name); return clone.outerHTML.slice(0,1200); })(),
          bounds: {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}
        };
      }).filter(x => x.text || x.href || x.ariaLabel || x.title).slice(0,2000);
      const images = [...document.querySelectorAll("img")].filter(visible).map(img => ({
        alt: img.alt || "", src: safeLocalUrl(img.currentSrc || img.src || ""),
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
        schema:"loilonote-local-archive-v5",
        capturedAt:new Date().toISOString(),
        url:safePageUrl,
        urlSanitization:"same-origin origin+pathname only; query and fragment removed",
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
        safety:"表示中の可視DOMのみ。同一オリジンのURLはorigin+pathnameのみ保存し、クエリ・フラグメントと外部URLは保存しません。Cookie・認証情報・非表示アプリ状態の取得、クリック、送信、編集、削除、外部通信は行いません。"
      };
    }
  });
  if (!result?.result) throw new Error("ページ内容を読み取れませんでした。");
  return { tab, data: result.result };
}


async function scanFolderTree() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://loilonote.app/") || !tab.url.includes("/material-box/")) {
    throw new Error("LoiLoNoteの資料箱ページを開いてください。");
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
      const visible = el => {
        const s=getComputedStyle(el), r=el.getBoundingClientRect();
        return s.display!=="none" && s.visibility!=="hidden" && Number(s.opacity)!==0 && r.width>0 && r.height>0;
      };
      const clean = s => (s||"").replace(/\s+/g," ").trim();
      const pageKey = () => location.origin+location.pathname;
      const folderRows = () => {
        const imgs=[...document.querySelectorAll('img[src*="MaterialFolder"]')].filter(visible);
        const out=[], seen=new Set();
        for(const img of imgs){
          let node=img, chosen=null;
          for(let depth=0;depth<9 && node;depth++,node=node.parentElement){
            const style=getComputedStyle(node);
            const clickable=node.matches("a,button,[role='button'],[onclick]") || style.cursor==="pointer";
            if(clickable && node.querySelectorAll('img[src*="MaterialFolder"]').length===1){
              const label=clean(node.innerText||node.getAttribute("aria-label")||"");
              if(label.length>=2 && label.length<=180){chosen=node;break;}
            }
          }
          if(!chosen || seen.has(chosen)) continue;
          seen.add(chosen);
          out.push({node:chosen,label:clean(chosen.innerText||chosen.getAttribute("aria-label")||"").slice(0,180)});
        }
        return out;
      };
      const waitForPath = async (oldPath, timeout=9000) => {
        const end=Date.now()+timeout;
        while(Date.now()<end){if(pageKey()!==oldPath){await sleep(500);return true;}await sleep(100);}
        return false;
      };
      const visited=new Set(), pages=[], warnings=[];
      const maxPages=150, maxDepth=16;
      let stopped=false;
      async function visit(depth, ancestry){
        const key=pageKey();
        if(visited.has(key)) return;
        if(visited.size>=maxPages){warnings.push("安全上限150ページに到達しました。");stopped=true;return;}
        if(depth>maxDepth){warnings.push("深さ上限16に到達しました。");return;}
        visited.add(key);
        await sleep(450);
        const rows=folderRows();
        const text=document.body?.innerText||"";
        pages.push({
          url:key,title:document.title,text,
          depth,ancestry,
          folders:rows.map((r,i)=>({label:r.label,index:i})),
          capturedAt:new Date().toISOString()
        });
        for(let i=0;i<rows.length;i++){
          if(stopped) return;
          const current=folderRows();
          const target=current[i];
          if(!target) continue;
          const parent=pageKey(), label=target.label;
          target.node.click();
          if(!await waitForPath(parent)){
            warnings.push("フォルダ「"+label+"」の画面遷移をURLで確認できず、安全のため巡回を停止しました。");
            stopped=true;return;
          }
          await visit(depth+1,[...ancestry,label]);
          if(stopped) return;
          history.back();
          const backEnd=Date.now()+9000;
          while(Date.now()<backEnd && pageKey()!==parent) await sleep(100);
          if(pageKey()!==parent){
            warnings.push("親フォルダへ安全に戻れませんでした。「"+label+"」以降を停止しました。");
            stopped=true;return;
          }
          await sleep(350);
        }
      }
      await visit(0,[]);
      return {
        schema:"loilonote-folder-map-v1",
        startedAt:pages[0]?.capturedAt||new Date().toISOString(),
        finishedAt:new Date().toISOString(),
        startUrl:pages[0]?.url||pageKey(),
        pageCount:pages.length,
        complete:!stopped && warnings.length===0,
        pages,warnings,
        limitations:["フォルダ一覧ページの本文・フォルダ名のみ取得します。個々の教材本文・画像・添付ファイルは取得しません。","URLが変化しないフォルダ遷移は安全のため巡回しません。","ログイン切れ・予期しない画面・上限到達時は未完了として停止します。"]
      };
    }
  });
  if(!result?.result) throw new Error("フォルダ巡回結果を取得できませんでした。");
  return {tab,data:result.result};
}

const scanButton = document.getElementById("scanFolders");
scanButton?.addEventListener("click", async () => {
  scanButton.disabled=true;captureButton.disabled=true;exportButton.disabled=true;
  status.textContent="フォルダ構成を巡回しています。最大150ページ・深さ16、フォルダ以外はクリックしません…";
  try{
    const {data}=await scanFolderTree();
    const id=await saveBlob(new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"}),
      "LoiLoNote_FolderMap_"+stamp()+".json");
    status.textContent=(data.complete?"フォルダ巡回完了":"【未完了】フォルダ巡回を停止")+
      "\n巡回ページ "+data.pageCount+"件 / ダウンロードID "+id+
      (data.warnings.length?"\n警告: "+data.warnings.join(" / "):"")+
      "\n注意: 教材本文・画像・添付ファイルの取得はまだ含みません。";
  }catch(error){status.textContent="フォルダ巡回失敗: "+(error.message||error);}
  finally{scanButton.disabled=false;captureButton.disabled=false;exportButton.disabled=false;}
});

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  exportButton.disabled = true;
  status.textContent = "表示中ページを読み取り、ローカル保存しています…";
  try {
    const {tab,data} = await capturePage();
    const key = data.url;
    if (!key || !key.startsWith("https://loilonote.app/")) throw new Error("安全な資料URLを確定できませんでした。");
    const old = await chrome.storage.local.get("captures");
    const captures = old.captures || {};
    const previous = captures[key];
    const fingerprintInput = JSON.stringify({
      title:data.title,text:data.text,headings:data.headings,links:data.links,
      images:data.images,tables:data.tables,canvas:data.canvas,controls:data.controls,
      quality:data.quality
    });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprintInput));
    const hash = [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
    const unchanged = previous?.hash === hash;
    const revisions = previous?.revisions || [];
    if (!unchanged) revisions.push({capturedAt:data.capturedAt,hash,data});
    captures[key] = {url:key,title:data.title,hash,lastCapturedAt:data.capturedAt,revisions:revisions.slice(-5)};
    let localSaved = true;
    let localSaveError = "";
    try {
      await chrome.storage.local.set({captures});
    } catch (storageError) {
      localSaved = false;
      localSaveError = storageError?.message || String(storageError);
    }
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
      (unchanged ? "本文・構造に変更なし（履歴追加を抑制）" : "新規・更新データをJSON出力")+ 
      (localSaved ? "\nChromeローカル履歴: 保存済み" : "\n【重大】Chromeローカル履歴: 保存失敗（"+localSaveError+"）。JSONファイルを別途保管してください。")+
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
