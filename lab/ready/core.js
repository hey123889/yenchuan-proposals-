// Browser-local preparation tools. No account access, uploads, API calls or persistence.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ReadyTools=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  const currencies=['USD','TWD'];
  function num(value,label,{positive=false,integer=false,max=Infinity,optional=false}={}){
    if(value===null||value===undefined||String(value).trim()===''){if(optional)return null;throw new Error('請填寫'+label+'；未知不能當成 0。');}
    const n=Number(value);if(!Number.isFinite(n)||n<0||(positive&&n===0)||(integer&&!Number.isSafeInteger(n))||n>max)throw new Error(label+'格式不正確，請填'+(positive?'大於 0':'不小於 0')+'的'+(integer?'整數':'數字')+'。');return n;
  }
  function cost(v){
    if(!currencies.includes(v.costCurrency)||!currencies.includes(v.saleCurrency))throw new Error('請選擇幣別。');
    if(v.costCurrency!==v.saleCurrency)throw new Error('成本與售價幣別不同；請先用同一匯率換成同一幣別，再計算。');
    const unit=num(v.unit,'每件出廠價',{positive:true}),qty=num(v.qty,'件數',{positive:true,integer:true}),freight=num(v.freight,'整批運費'),insurance=num(v.insurance,'保險'),fees=num(v.fees,'其他整批費用'),rate=num(v.rate,'假設關稅率',{max:100}),sale=num(v.sale,'每件售價',{positive:true,optional:true});
    // Simplified comparison only: transaction value assumed as unit*qty, not a legal customs ruling.
    const goods=unit*qty,duty=goods*rate/100,total=goods+freight+insurance+fees+duty,landed=total/qty;
    const profit=sale===null?null:sale-landed,margin=sale===null?null:profit/sale*100;
    if(![goods,duty,total,landed,...(sale===null?[]:[profit,margin])].every(Number.isFinite))throw new Error('數值太大，請縮小後重新計算。');
    return {currency:v.costCurrency,qty,goods,duty,total,landed,profit,margin};
  }
  function stock(v){
    const daily=num(v.daily,'每日平均銷量'),lead=num(v.lead,'補貨天數'),safety=num(v.safety,'安全天數'),onHand=num(v.onHand,'現有庫存',{integer:true}),onOrder=num(v.onOrder,'在途數量',{integer:true});
    if(daily===0)return {status:'缺銷售基準',message:'每日平均銷量為 0，不能推算還能賣幾天；先看實際銷售紀錄。',reorder:null,coverage:null,suggested:null};
    const reorder=Math.ceil(daily*(lead+safety)),coverage=onHand/daily,suggested=Math.max(0,reorder-onHand-onOrder);
    if(![reorder,coverage,suggested].every(Number.isFinite))throw new Error('數值太大，請縮小後重新計算。');
    return {status:onHand<daily*lead?'請人工確認缺貨風險':onHand<=reorder?'到補貨提醒點':'暫未到提醒點',reorder,coverage,suggested,message:'在途商品不保證準時到貨；這是提醒，不會建立採購單。'};
  }
  function classify(value){
    const text=String(value||'').trim();if(!text)throw new Error('先選一封演練來信，或輸入測試內容。');if(text.length>8000)throw new Error('測試內容請控制在 8,000 字內。');
    const danger=/refund|complaint|allerg|recall|sick|poison|guarantee|ignore previous|system prompt|退款|投訴|客訴|過敏|生病|中毒|保證|忽略.{0,8}指[令示]/i.test(text);
    const buyer=/wholesale|custom|sample|quote|order|supplier|ship|批發|報價|樣品|訂購|代工|出貨/i.test(text);
    const spam=/backlink|SEO service|buy followers|提高排名|買粉|反向連結/i.test(text);
    if(danger)return {kind:'例外／食品安全：交人工確認',reason:'涉及客訴、過敏原、承諾或可疑指令，不能用一般規則直接回答。',draft:'謝謝來信。我們已記下問題，需要由沅川確認產品資料與處理方式後再回覆。請先提供品項名稱及需要確認的內容；請勿傳送敏感個資。',missing:'產品標籤、批次或事件資料，以及陳 Sir 的處理指示。'};
    if(buyer)return {kind:'採購詢價：先整理需求',reason:'有採購相關內容，但尚未具備正式價格、庫存及交期，草稿必須人工核可。',draft:'謝謝詢問。請告訴我們產品名稱、預估用量、送達國家、希望交期，以及是否需要樣品。我們核對規格與供貨後再提供正式報價；目前沒有確認價格或交期。',missing:'產品、數量、國家、交期、樣品需求；若信中已提供，正式接 AI 時應提取，不重複詢問。'};
    if(spam)return {kind:'疑似推銷：留待人工複核',reason:'只看到行銷推銷詞，沒有明確採購需求；示範不刪信、不封鎖。',draft:'此封先列待複核，不自動寄出回覆。',missing:'仍須人工確認是否誤判。'};
    return {kind:'一般／不確定：待人工確認',reason:'簡單規則無法可靠判定語意；未知不能假裝已辨識。',draft:'謝謝來信。請補充產品名稱與想確認的問題，我們核對後回覆。',missing:'對應的公司知識與陳 Sir 核可的標準答案。'};
  }
  function csv(rows){return '\uFEFF'+rows.map(row=>row.map(cell=>{let s=String(cell??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
  return {cost,stock,classify,csv};
});
