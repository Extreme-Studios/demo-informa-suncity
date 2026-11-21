(function(root){
  const clean=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const money=value=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
  const roomRules=[[/\b(ruang tamu|living)\b/,'Ruang Tamu'],[/\b(kamar tidur|buat kamar|bedroom)\b/,'Kamar Tidur'],[/\b(ruang makan|dining)\b/,'Ruang Makan'],[/\b(ruang kerja|workspace|home office|office|work|kantor)\b/,'Ruang Kerja']];
  const styles=['Minimalis','Modern','Japandi','Scandinavian','Classic','Luxury'];
  const roomGroups={
    'Ruang Tamu':[{key:'seating',label:'seating',match:/\b(sofa|kursi|bangku|bean bag)\b/},{key:'surface',label:'meja',match:/\b(meja|nakas)\b/,exclude:/\b(rias|dapur)\b/},{key:'storage',label:'penyimpanan',match:/\b(lemari|rak|kabinet|penyimpanan|laci)\b/},{key:'accent',label:'aksen',match:/\b(lampu|karpet|dekorasi|tanaman|lukisan|cermin)\b/}],
    'Kamar Tidur':[{key:'surface',label:'nakas atau meja',match:/\b(nakas|meja rias)\b/},{key:'storage',label:'penyimpanan',match:/\b(lemari|rak|kabinet|penyimpanan|laci)\b/},{key:'light',label:'lampu',match:/\blampu\b/},{key:'textile',label:'tekstil',match:/\b(seprai|karpet)\b/}],
    'Ruang Makan':[{key:'seating',label:'kursi',match:/\b(kursi|bangku)\b/},{key:'surface',label:'meja',match:/\bmeja\b/,exclude:/\brias\b/},{key:'storage',label:'penyimpanan',match:/\b(lemari|rak|kabinet|penyimpanan|laci)\b/},{key:'accent',label:'aksen',match:/\b(lampu|dekorasi|tanaman|karpet)\b/}],
    'Ruang Kerja':[{key:'surface',label:'meja',match:/\bmeja\b/,exclude:/\brias\b/},{key:'storage',label:'penyimpanan',match:/\b(lemari|rak|kabinet|penyimpanan|laci)\b/},{key:'light',label:'lampu',match:/\blampu\b/},{key:'accent',label:'aksen',match:/\b(dekorasi|tanaman|karpet|cermin|lukisan)\b/}]
  };
  // Keep catalog matchers separate from display labels and from customer text.
  const catalogRules=[
    { type:'kitchen', category:'Meja & nakas', query:/\b(kitchen (?:tables?|furniture|cabinets?|islands?)|(?:table|furniture) for (?:the |my )?kitchen|kitchen|dapur)\b/, match:/\b(meja dapur|kitchen table|kitchen island)\b/ },
    { type:'desk', room:'Ruang Kerja', query:/\b(desks?|computers?|work tables?|meja komputer|meja kerja)\b/, match:/\b(desk|meja komputer|meja kerja)\b/ },
    { type:'office chair', room:'Ruang Kerja', category:'Sofa & kursi', query:/\b(office chairs?|desk chairs?|kursi kerja|kursi kantor)\b/, match:/\b(office chair|desk chair|kursi kerja|kursi kantor)\b/ },
    { type:'sofa', room:'Ruang Tamu', category:'Sofa & kursi', query:/\b(sofas?(?: beds?)?|couch(?:es)?|settees?)\b/, match:/\b(sofa|couch)\b/ },
    { type:'nightstand', room:'Kamar Tidur', category:'Meja & nakas', query:/\b(nightstands?|bedside tables?|nakas)\b/, match:/\b(nakas|nightstand|bedside)\b/ },
    { type:'bed', room:'Kamar Tidur', query:/\b(beds?|mattress(?:es)?|tempat tidur|kasur)\b/, match:/\b(mattress|tempat tidur|kasur|bed frame)\b/ },
    { type:'coffee table', room:'Ruang Tamu', category:'Meja & nakas', query:/\b(coffee tables?|meja tamu)\b/, match:/\b(coffee table|meja tamu)\b/ },
    { type:'dining table', room:'Ruang Makan', category:'Meja & nakas', query:/\b(dining tables?|meja makan)\b/, match:/\b(dining table|meja makan)\b/ },
    { type:'dining chair', room:'Ruang Makan', category:'Sofa & kursi', query:/\b(dining chairs?|kursi makan)\b/, match:/\b(dining chair|kursi makan)\b/ },
    { type:'chair', room:'Ruang Kerja', category:'Sofa & kursi', query:/\b(chairs?|kursi|bangku)\b/, match:/\b(chair|kursi|bangku)\b/ },
    { type:'table', room:'Ruang Makan', category:'Meja & nakas', query:/\b(tables?|meja)\b/, match:/\b(table|meja)\b/ },
    { type:'storage', category:'Penyimpanan', query:/\b(storage|cabinets?|shelf|shelves|shelving|drawers?|lemari|rak|laci|kabinet|penyimpanan)\b/ },
    { type:'lighting', category:'Lampu', query:/\b(lights?|lighting|(?:table )?lamps?|lampu(?: meja)?|pencahayaan)\b/ },
    { type:'textiles', category:'Karpet & tekstil', query:/\b(rugs?|carpets?|bedding|karpet|seprai|sprei|tekstil)\b/ },
    { type:'wall decor', category:'Dinding & cermin', query:/\b(mirrors?|wall art|paintings?|cermin|dinding|lukisan)\b/ },
    { type:'plants', category:'Tanaman', query:/\b(plants?|tanaman)\b/ },
    { type:'decor', category:'Dekorasi', query:/\b(decor|decorations?|dekorasi)\b/ },
  ];
  const catalogShorthand=new Map(Object.entries({
    mja:'meja',krsi:'kursi',sofs:'sofa',sfa:'sofa',lmari:'lemari',lmpu:'lampu',ksur:'kasur',
    cri:'cari',cr:'cari',tble:'table',chr:'chair',dsk:'desk',kntor:'kantor',utk:'untuk',
  }));
  const furnitureWords=['meja','kursi','sofa','lemari','lampu','kasur','karpet','nakas','kabinet','cermin',
    'table','chair','desk','couch','settee','mattress','nightstand','cabinet','shelf','lamp','carpet','mirror'];
  const furnitureWordSet=new Set(furnitureWords);
  // These ordinary words are also one edit away from a furniture term.
  const literalWords=new Set(['able','cable','stable','tale','soft','soda','cough','touch','pouch','desi','disk','camp','damp','lamb','limp']);
  function oneEditApart(word,target){
    if(Math.abs(word.length-target.length)>1)return false;
    const [shorter,longer]=word.length<=target.length?[word,target]:[target,word];
    let index=0;
    while(index<shorter.length&&shorter[index]===longer[index])index++;
    return shorter.length===longer.length
      ? shorter.slice(index+1)===longer.slice(index+1)
      : shorter.slice(index)===longer.slice(index+1);
  }
  function normalizeCatalogQuery(text,{fuzzy=true}={}){
    return String(text??'').normalize('NFKC').toLowerCase().replace(/\p{L}+/gu,word=>{
      if(catalogShorthand.has(word))return catalogShorthand.get(word);
      if(!fuzzy||!/^[a-z]{4,}$/.test(word)||furnitureWordSet.has(word)||literalWords.has(word))return word;
      const matches=furnitureWords.filter(target=>oneEditApart(word,target));
      return matches.length===1?matches[0]:word;
    });
  }
  function catalogIntents(text,options){
    const query=clean(normalizeCatalogQuery(text,options));
    const explicitRoom=roomRules.find(([pattern])=>pattern.test(query))?.[1];
    const hits=catalogRules.flatMap(rule=>[...query.matchAll(new RegExp(rule.query,'g'))]
      .map(match=>({rule,start:match.index,end:match.index+match[0].length})));
    hits.sort((a,b)=>a.start-b.start||b.end-a.end);
    const items=new Map();
    let end=0;
    for(const hit of hits){
      if(hit.start<end)continue;
      end=hit.end;
      const {rule}=hit;
      if(!items.has(rule.type))items.set(rule.type,{...rule,room:explicitRoom||rule.room});
    }
    if(items.size)return [...items.values()];
    if(explicitRoom==='Ruang Kerja')return [{
      type:'office furniture',room:explicitRoom,match:/\b(rak buku|lemari|kabinet|lampu meja)\b/,
    }];
    return explicitRoom?[{room:explicitRoom}]:[];
  }
  const catalogIntent=text=>catalogIntents(text)[0]??null;
  function parseRoom(text){return catalogIntent(text)?.room||''}
  function isProductLinkRequest(text){
    const query=clean(text).replace(/\b(link|tautan|url)nya\b/g,'$1');
    return /\b(?:mana|where|share|send|give|show|minta|kirim|kasih|tampilkan|bagi)\b.*\b(?:link|tautan|url|referensi)\b/.test(query)
      || /^(?:link|tautan|url)(?: (?:barang(?:nya)?|produk(?:nya)?|official|asli|please|dong|nya))*$/.test(query)
      || /\b(?:link|tautan|url)\b.*\b(?:mana|where)\b/.test(query);
  }
  function mentionedProducts(text,products){
    const query=' '+clean(text)+' ';
    const contains=(needle)=>query.includes(' '+clean(needle)+' ');
    const exact=products.filter(product=>contains(product.sku)||contains(product.name)||contains(product.name.replace(/^informa\s+/i,'')));
    // The catalog's model name is an alias only when it identifies a single item.
    const models=new Map();
    for(const product of products){
      const model=clean(product.name).replace(/^informa\s+/,'').split(' ')[0];
      if(!/^[a-z]{4,}$/.test(model)||['meja','sofa','kursi','lemari','lampu','karpet','rak','tanaman','dekorasi','tempat','kotak','bean','hiasan','set','bantal','bunga','miniatur','cermin','lukisan'].includes(model))continue;
      models.set(model,models.has(model)?null:product);
    }
    const short=[...models].filter(([model,product])=>product&&contains(model)).map(([,product])=>product);
    return [...new Set([...exact,...short])];
  }
  function kitchenProducts(text,products){
    const intent=catalogIntent(text);
    return intent?.type==='kitchen'?products.filter(product=>intent.match.test(clean(product.name))):[];
  }
  function customerIntroduction(text,{allowBare=false,hasName=false}={}){
    const value=String(text??'').trim().replace(/\s+/g,' ').replace(/[.!]+$/,'');
    const explicit=value.match(/^(?:my name is|call me|nama saya|nama aku)\s+(.+)$/i)
      || (!hasName&&value.match(/^(?:i am|i['’]m|im|nama|saya|aku)\s+(.+)$/i));
    const name=(explicit?.[1]||(allowBare?value:'')).trim();
    const titled=/^(?:Mr\.?|Mrs\.?|Ms\.?|Mx\.?|Dr\.?|Kak|Pak|Bu|Bapak|Ibu)\s+/i;
    const core=name.replace(titled,'');
    if(!name||name.length>40||!/^\p{L}[\p{L}\p{M}'’.-]*(?: \p{L}[\p{L}\p{M}'’-]*){0,3}$/u.test(name))return '';
    if(!explicit&&core.split(' ').length>2)return '';
    if(/\b(?:nyari|cari|cr|carim?perabot\w*|butuh|suka|mau|ingin|beli|pesan|properti|kntor|kantor|meja|kursi|sofa|lihat|looking|need|shop|want|buy|desk|office|browsing|interested|here|fine|good|well|great|happy|ready|sorry|thanks|hello|hi|hey|halo|hai|ok|okay|yes|no|iya|ya|nggak|later|help|bantu|price|harga|brp|stock|stok|discount|diskon|compare|build|cart|checkout|link|tautan|can|could|how|what|berapa|mana|why|where|plz|please|dsk|yg|utk)\b/i.test(core))return '';
    if(catalogIntents(core,{fuzzy:false}).length||conciergeIntent(core))return '';
    return name.replace(/(^|[\s'’-])(\p{Ll})/gu,(_,before,letter)=>before+letter.toUpperCase());
  }
  function conciergeIntent(text){
    const query=String(text||'').normalize('NFKC').toLowerCase();
    const discount=/\b(?:discounts?|diskon|potongan harga|promo(?:si|tions?)?|price match|bargain|nego(?:tiate|siasi)?)\b/.test(query)
      || /\d+(?:[.,]\d+)?\s*%\s*(?:off|discount|diskon)\b/.test(query);
    if(discount){
      const raw=query.match(/(?:^|[^\d.,-])(\d{1,3}(?:[.,]\d+)?)\s*(?:%|percent\b|persen\b)/)?.[1];
      const percent=raw==null?null:Number(raw.replace(',','.'));
      return {type:'discount',percent:percent>0&&percent<=100?percent:null};
    }
    const offTopic=/\b(?:tell (?:me |us )?(?:a |some )?(?:joke|riddle)s?|ceritakan (?:lelucon|joke)|tebak tebakan|weather forecast|weather today|prakiraan cuaca|cuaca hari ini|can penguins? (?:drive|fly)|can a penguin (?:drive|fly)|why is the sky blue|kenapa langit biru|what is the meaning of life|apa arti kehidupan|sports scores?|skor (?:bola|pertandingan))\b/;
    if(offTopic.test(clean(query)))return {type:'off-topic'};
    return null;
  }
  function parseStyle(text){const value=clean(text);return styles.find(style=>value.includes(style.toLowerCase())||(style==='Minimalis'&&value.includes('minimalist')))||''}
  function parseBudget(text){const value=clean(String(text).replace(/\.(?=\d{3}(?:\.|$))/g,'')),match=value.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(million|juta|jt|thousand|ribu|rb|k)?/);if(!match)return null;let number=Number(match[1].replace(',','.'));if(!Number.isFinite(number))return null;if(['million','juta','jt'].includes(match[2]))number*=1e6;else if(['thousand','ribu','rb','k'].includes(match[2]))number*=1e3;else if(number<1000)return null;return Math.round(number)}
  function parseSize(text){const value=clean(text);let pair=value.match(/(\d+(?:[.,]\d+)?)\s*(?:x|by|kali)\s*(\d+(?:[.,]\d+)?)/);if(pair){const length=Number(pair[1].replace(',','.')),width=Number(pair[2].replace(',','.'));return length>0&&width>0?{length,width,area:length*width,label:`${length}×${width} m`}:null}const labeled=value.match(/panjang\s*(\d+(?:[.,]\d+)?).*lebar\s*(\d+(?:[.,]\d+)?)/);if(labeled){const length=Number(labeled[1].replace(',','.')),width=Number(labeled[2].replace(',','.'));return {length,width,area:length*width,label:`${length}×${width} m`}}const area=value.match(/(\d+(?:[.,]\d+)?)\s*(?:meter persegi|square meters?|m2)/);if(area){const square=Number(area[1].replace(',','.'));return square>0?{length:null,width:null,area:square,label:`${square} m²`}:null}return null}
  function create(products,prices){
    const priceOf=product=>prices[product.sku];
    const named=product=>clean(product.name);
    const matchesGroup=(product,group)=>group.match.test(named(product))&&!(group.exclude&&group.exclude.test(named(product)));
    const candidates=(group,used,room)=>products.filter(product=>!used.has(product.sku)&&Number.isFinite(priceOf(product))&&matchesGroup(product,group)&&!(room==='Ruang Tamu'&&/\b(rias|dapur)\b/.test(named(product)))).sort((a,b)=>priceOf(b)-priceOf(a));
    const total=items=>items.reduce((sum,product)=>sum+priceOf(product),0);
    function build(spec){const groups=roomGroups[spec.room]||[];const used=new Set(),filled=new Set(),items=[];let remaining=spec.budget,hasPrimary=false;
      for(const [index,group] of groups.entries()){const picked=candidates(group,used,spec.room).find(product=>priceOf(product)<=remaining);if(picked){items.push(picked);used.add(picked.sku);filled.add(group.key);remaining-=priceOf(picked);if(index===0)hasPrimary=true}}
      if(!hasPrimary)return {items:[],total:0,remaining:spec.budget,groups};
      // Fill remaining budget with a single useful existing item at a time, without duplicates.
      const all=products.filter(product=>!used.has(product.sku)&&Number.isFinite(priceOf(product))&&groups.some(group=>(!filled.has(group.key)||group.key==='accent')&&matchesGroup(product,group))&&!(spec.room==='Ruang Tamu'&&/\b(rias|dapur)\b/.test(named(product)))&&priceOf(product)<=remaining).sort((a,b)=>priceOf(b)-priceOf(a));
      for(const product of all){if(priceOf(product)<=remaining){items.push(product);used.add(product.sku);remaining-=priceOf(product)}}
      return {items,total:total(items),remaining:spec.budget-total(items),groups};
    }
    function replacement(pack,key,mode,budget){const index=pack.items.findIndex(product=>new RegExp(key==='sofa'?'\\bsofa\\b':key==='lampu'?'\\blampu\\b':key==='meja'?'\\bmeja\\b':key==='dekorasi'?'\\b(dekorasi|tanaman|lukisan|cermin|karpet)\\b':`\\b${key}\\b`).test(named(product)));if(index<0)return {ok:false,reason:'missing'};const current=pack.items[index],currentPrice=priceOf(current),used=new Set(pack.items.map(product=>product.sku));used.delete(current.sku);const base=pack.total-currentPrice;let alternatives=products.filter(product=>!used.has(product.sku)&&Number.isFinite(priceOf(product))&&new RegExp(key==='sofa'?'\\bsofa\\b':key==='lampu'?'\\blampu\\b':key==='meja'?'\\bmeja\\b':key==='dekorasi'?'\\b(dekorasi|tanaman|lukisan|cermin|karpet)\\b':`\\b${key}\\b`).test(named(product)));
      alternatives=alternatives.filter(product=>mode==='cheaper'?priceOf(product)<currentPrice:priceOf(product)>currentPrice).sort((a,b)=>mode==='cheaper'?priceOf(a)-priceOf(b):priceOf(a)-priceOf(b));const next=alternatives.find(product=>base+priceOf(product)<=budget);if(!next)return {ok:false,reason:mode==='upgrade'?'over-budget':'none'};const items=[...pack.items];items[index]=next;return {ok:true,items,total:total(items),remaining:budget-total(items),from:current,to:next};}
    function add(pack,key,budget){const used=new Set(pack.items.map(product=>product.sku));const regex=key==='lampu'?/\blampu\b/:key==='dekorasi'?/\b(dekorasi|tanaman|lukisan|cermin|karpet)\b/:key==='kursi'?/\b(kursi|bangku)\b/:new RegExp(`\\b${key}\\b`);const product=products.filter(item=>!used.has(item.sku)&&Number.isFinite(priceOf(item))&&regex.test(named(item))&&pack.total+priceOf(item)<=budget).sort((a,b)=>priceOf(b)-priceOf(a))[0];if(!product)return {ok:false};const items=[...pack.items,product];return {ok:true,items,total:total(items),remaining:budget-total(items),added:product};}
    return {build,replacement,add,priceOf,total};
  }
  function introductionWithQuery(text,options){
    const value=String(text??'').trim();
    for(const match of value.matchAll(/[.,;]\s+|\r?\n/g)){
      const introduction=value.slice(0,match.index).trim();
      if(/\b(?:Mr|Mrs|Ms|Mx|Dr)$/i.test(introduction))continue;
      const name=customerIntroduction(introduction,options);
      const query=value.slice(match.index+match[0].length).trim();
      if(name&&catalogIntents(query).some(item=>item.type))return {name,query};
    }
    return {name:customerIntroduction(value,options),query:''};
  }
  const api={parseRoom,catalogIntent,catalogIntents,normalizeCatalogQuery,conciergeIntent,isProductLinkRequest,mentionedProducts,kitchenProducts,customerIntroduction,introductionWithQuery,parseStyle,parseBudget,parseSize,create,money,styles};
  if(typeof module!=='undefined')module.exports=api;root.NayaRoomEngine=api;
})(typeof window!=='undefined'?window:globalThis);
