const fileInput=document.getElementById("files");
const searchInput=document.getElementById("search");
const itemsEl=document.getElementById("items");
const countEl=document.getElementById("count");
const detailEl=document.getElementById("detail");
const detailTitle=document.getElementById("detailTitle");
const records=new Map();
let selected="";
function addRecord(raw){
  if(raw?.schema==="loilonote-local-archive-index-v1"&&raw.captures){
    for(const [url,entry] of Object.entries(raw.captures)){
      const revisions=entry.revisions||[];
      if(revisions.length){
        const latest=revisions[revisions.length-1];
        const data=latest.data||latest;
        if(data?.url)records.set(data.url,{data,hash:latest.hash||entry.hash||"",revisions});
      }
    }
    return;
  }
  if((raw?.schema==="loilonote-local-archive-v3"||raw?.schema==="loilonote-local-archive-v4"||raw?.schema==="loilonote-local-archive-v5"||raw?.schema==="loilonote-local-archive-v6"||raw?.schema==="loilonote-local-archive-v7")&&raw.url){
    records.set(raw.url,{data:raw,hash:"",revisions:[]});return;
  }
  if(raw?.data?.url){records.set(raw.data.url,{data:raw.data,hash:raw.hash||"",revisions:raw.revisions||[]});return;}
  throw new Error("対応していないJSON形式です。");
}
function label(data){
  const bits=[data.title||"無題",data.url||""];
  const text=(data.text||"").slice(0,12000);
  return (bits.join(" " )+" "+text).toLowerCase();
}
function render(){
  const q=searchInput.value.trim().toLowerCase();
  const all=[...records.entries()].filter(([url,r])=>!q||label(r.data).includes(q));
  all.sort((a,b)=>(b[1].data.capturedAt||"").localeCompare(a[1].data.capturedAt||""));
  countEl.textContent=all.length+"件 / 登録 "+records.size+"件";
  itemsEl.replaceChildren();
  for(const [url,r] of all){
    const b=document.createElement("button");b.className="item";b.setAttribute("aria-current",url===selected?"true":"false");
    const title=document.createElement("strong");title.textContent=r.data.title||"無題";
    const meta=document.createElement("small");meta.textContent=(r.data.capturedAt||"取得日時不明")+" · 本文 "+(r.data.text||"").length+"文字"+((r.data.quality?.warnings||[]).length?" · 要確認":"");
    b.append(title,meta);b.addEventListener("click",()=>show(url));itemsEl.append(b);
  }
  if(!all.length){const p=document.createElement("p");p.className="muted";p.textContent="該当する資料がありません。JSONを読み込んでください。";itemsEl.append(p);}
}
function show(url){
  selected=url;const r=records.get(url);if(!r)return;const d=r.data;
  detailTitle.textContent=d.title||"無題";
  detailEl.replaceChildren();
  const meta=document.createElement("p");meta.textContent="取得日時: "+(d.capturedAt||"不明")+"\nURL: "+url;
  detailEl.append(meta);
  const warnings=d.quality?.warnings||[];
  if(warnings.length){const w=document.createElement("div");w.className="warning";w.textContent="取得品質の注意: "+warnings.join(" / ");detailEl.append(w);}
  const text=document.createElement("pre");text.style.whiteSpace="pre-wrap";text.style.font="inherit";text.textContent=d.text||"本文テキストなし";detailEl.append(text);
  if((d.links||[]).length){const h=document.createElement("h3");h.textContent="ページ内リンク";detailEl.append(h);
    for(const link of d.links){if(!link.href?.startsWith("https://loilonote.app/"))continue;const a=document.createElement("a");a.href=link.href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=link.text||link.href;detailEl.append(a,document.createElement("br"));}}
  render();
}
fileInput.addEventListener("change",async()=>{
  let ok=0;const errors=[];
  for(const file of fileInput.files||[]){try{addRecord(JSON.parse(await file.text()));ok++;}catch(e){errors.push(file.name+": "+e.message);}}
  render();fileInput.value="";
  if(errors.length)alert("読み込み "+ok+"件\n"+errors.join("\n"));
});
searchInput.addEventListener("input",render);
document.getElementById("export").addEventListener("click",()=>{
  const payload={schema:"loilonote-local-archive-index-v1",exportedAt:new Date().toISOString(),count:records.size,captures:{}};
  for(const [url,r] of records){payload.captures[url]={url,title:r.data.title||"",hash:r.hash,lastCapturedAt:r.data.capturedAt||"",revisions:r.revisions?.length?r.revisions:[{capturedAt:r.data.capturedAt||"",hash:r.hash,data:r.data}]};}
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="LoiLoNote_StudyArchive_"+new Date().toISOString().replace(/[:.]/g,"-")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
});
render();