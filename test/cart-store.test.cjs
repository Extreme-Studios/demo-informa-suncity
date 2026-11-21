const {test}=require('node:test'),assert=require('node:assert/strict');
const products=require('../products.json'),{priceReference}=require('../catalog-data.js');
function fresh(storage){delete global.informaCart;delete require.cache[require.resolve('../cart-store.js')];require('../cart-store.js');return global.informaCart.init(products,priceReference,storage)}
function memory(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),dump:()=>Object.fromEntries(data)}}
test('cart uses SKU, quantity and deterministic totals',()=>{const cart=fresh(memory()),sku='10701444',price=priceReference[sku];cart.add(sku);cart.add(sku);assert.equal(cart.list().length,1);assert.equal(cart.get(sku).quantity,2);assert.equal(cart.get(sku).subtotal,price*2);cart.set(sku,1);assert.equal(cart.snapshot().total,price);cart.remove(sku);assert.equal(cart.snapshot().quantity,0)});
test('editing one row updates persisted quantities and leaves unrelated rows intact',()=>{
 const storage=memory(),cart=fresh(storage);
 const [sofa,lamp]=['10701444','10464185'];
 cart.add(sofa);
 cart.add(lamp,2);
 cart.add(sofa);
 assert.equal(cart.snapshot().total,2*(priceReference[sofa]+priceReference[lamp]));
 cart.set(sofa,1);
 assert.equal(fresh(storage).snapshot().total,priceReference[sofa]+2*priceReference[lamp]);
 cart.remove(sofa);
 assert.deepEqual(fresh(storage).snapshot().items.map(({sku,quantity})=>({sku,quantity})),[{sku:lamp,quantity:2}]);
 cart.remove(lamp);
 assert.deepEqual(JSON.parse(storage.getItem(cart.storageKey)),[]);
});
test('cart persists and rehydrates only valid catalog SKUs at catalog price',()=>{const storage=memory({'informa-suncity-active-cart-v1':JSON.stringify([{sku:'10701444',quantity:2},{sku:'invalid',quantity:9}])});const cart=fresh(storage);assert.equal(cart.list().length,1);assert.equal(cart.get('10701444').unitPrice,priceReference['10701444']);assert.equal(cart.get('10701444').quantity,2);cart.clear();assert.equal(cart.snapshot().items.length,0)});
test('cart full-session reset removes persisted cart state',()=>{const storage=memory(),cart=fresh(storage);cart.add('10701444',2);cart.reset();assert.equal(cart.snapshot().quantity,0);assert.equal(storage.getItem(cart.storageKey),null);assert.equal(fresh(storage).snapshot().quantity,0)});

test('browser cart uses localStorage across locale switches, reload and pageshow',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../cart-store.js'),'utf8');
 const localStorage=memory(),sessionStorage=memory();
 function browser(locale){
  const events={};
  const window={localStorage,sessionStorage,NayaI18n:{locale},addEventListener:(name,callback)=>events[name]=callback};
  vm.runInNewContext(source,{window});
  return {cart:window.informaCart.init(products,priceReference),events,window};
 }
 const en=browser('en'),sku='10701444';
 en.cart.add(sku,2);
 assert.deepEqual(JSON.parse(localStorage.getItem(en.cart.storageKey)),[{sku,qty:2,unitPrice:priceReference[sku]}]);
 en.window.NayaI18n.locale='id';
 assert.equal(en.cart.snapshot().quantity,2);
 const id=browser('id');
 assert.equal(id.cart.get(sku).quantity,2);
 id.cart.add(sku);
 en.events.pageshow({persisted:true});
 assert.equal(en.cart.snapshot().quantity,3);
 assert.equal(en.cart.snapshot().total,priceReference[sku]*3);
 assert.equal(sessionStorage.getItem(en.cart.storageKey),null);
});
