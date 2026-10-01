(async()=>{
 const p=new URLSearchParams(location.search), unit=p.get("unit");
 const fail=m=>document.body.innerHTML=`<main style="max-width:760px;margin:70px auto;padding:28px;font-family:system-ui"><div style="border:1px solid #f0c47c;background:#fff8e8;border-radius:18px;padding:24px"><h2>Không tải được Practice Unit</h2><p>${m}</p><a href="../../">← Trang chủ</a></div></main>`;
 if(!unit||!/^[a-z0-9-]+$/i.test(unit)) return fail("URL chưa có Unit hợp lệ.");
 const base=`../../units/${unit}/`;
 const load=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.async=false;s.onload=ok;s.onerror=()=>no(new Error("Không tải được "+src));document.body.appendChild(s)});
 const fix=x=>!x||/^(https?:|data:|\/)/.test(x)?x:(x.startsWith("assets/")?base+x:x);
 try{
   await load(base+"data.js?v="+Date.now());
   const d=window.PRACTICE_DATA;if(!d)throw new Error("Không tìm thấy PRACTICE_DATA.");
   (d.sections||[]).forEach(s=>(s.exercises||[]).forEach(e=>{
     e.audio=fix(e.audio);
     (e.questions||[]).forEach(q=>{q.image=fix(q.image);q.graphic=fix(q.graphic)});
     (e.sets||[]).forEach(t=>{t.image=fix(t.image);t.graphic=fix(t.graphic)});
   }));
   await load("./app.js?v=1");
 }catch(e){console.error(e);fail(e.message)}
})();