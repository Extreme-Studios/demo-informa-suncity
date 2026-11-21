(function(root){
 const key='informa-suncity-active-cart-v1';
 let catalog=new Map(),prices={},items=new Map(),storage,initialized=false;
 function browserStorage(type){
  try{return root[type]}catch{return undefined}
 }
 function emit(){
  if(typeof root.dispatchEvent==='function'&&typeof CustomEvent==='function'){
   root.dispatchEvent(new CustomEvent('informa-cart-change',{detail:api.snapshot()}));
  }
 }
 function persist(){
  try{
   storage?.setItem(key,JSON.stringify([...items.values()].map(row=>({
    sku:row.sku,qty:row.quantity,unitPrice:prices[row.sku],
   }))));
  }catch{}
 }
 function hydrate({migrate=false}={}){
  let raw;
  try{raw=storage?.getItem(key)}catch{return}
  const legacy=migrate&&storage===browserStorage('localStorage')?browserStorage('sessionStorage'):null;
  let migrated=false;
  if(raw==null&&legacy){
   try{raw=legacy.getItem(key);migrated=raw!=null}catch{}
  }
  let saved;
  try{saved=JSON.parse(raw||'[]')}catch{saved=[]}
  items.clear();
  for(const row of Array.isArray(saved)?saved:[]){
   const sku=row?.sku,quantity=Number(row?.qty??row?.quantity);
   if(catalog.has(sku)&&Number.isFinite(prices[sku])&&Number.isSafeInteger(quantity)&&quantity>0){
    items.set(sku,{sku,quantity});
   }
  }
  if(migrated){
   try{
    storage.setItem(key,JSON.stringify([...items.values()].map(({sku,quantity})=>({sku,qty:quantity,unitPrice:prices[sku]}))));
    legacy.removeItem(key);
   }catch{}
  }
 }
 function enrich(row){
  const p=catalog.get(row.sku),unitPrice=prices[row.sku];
  return p&&Number.isFinite(unitPrice)?{...row,name:p.name,image:p.image,url:p.url,unitPrice,subtotal:unitPrice*row.quantity}:null;
 }
 const api={
  init(products,priceReference,customStorage){
   catalog=new Map((products||[]).map(product=>[product.sku,product]));
   prices=priceReference||{};
   storage=customStorage||browserStorage('localStorage');
   initialized=true;
   hydrate({migrate:!customStorage});
   emit();
   return api;
  },
  add(sku,quantity=1){
   if(!catalog.has(sku)||!Number.isFinite(prices[sku]))return null;
   const next=(items.get(sku)?.quantity||0)+Math.max(1,Math.floor(Number(quantity)||1));
   if(!Number.isSafeInteger(next))return null;
   items.set(sku,{sku,quantity:next});persist();emit();return api.get(sku);
  },
  set(sku,quantity){
   if(!items.has(sku))return null;
   quantity=Math.floor(Number(quantity)||0);
   if(!Number.isSafeInteger(quantity))return null;
   if(quantity<1)items.delete(sku);else items.set(sku,{sku,quantity});
   persist();emit();return api.get(sku);
  },
  remove(sku){const done=items.delete(sku);persist();emit();return done},
  clear(){items.clear();persist();emit()},
  reset(){
   items.clear();
   try{storage?.removeItem(key);browserStorage('sessionStorage')?.removeItem(key)}catch{}
   emit();
  },
  get(sku){const row=items.get(sku);return row&&enrich(row)},
  list(){return [...items.values()].map(enrich).filter(Boolean)},
  snapshot(){
   const list=api.list();
   return {items:list,total:list.reduce((sum,item)=>sum+item.subtotal,0),
    quantity:list.reduce((sum,item)=>sum+item.quantity,0),status:'shopping'};
  },
  storageKey:key,
 };
 function refresh(){if(initialized){hydrate();emit()}}
 root.addEventListener?.('pageshow',refresh);
 root.addEventListener?.('storage',event=>{
  if(event.storageArea===storage&&(event.key===key||event.key===null))refresh();
 });
 root.informaCart=api;
})(typeof window!=='undefined'?window:globalThis);
