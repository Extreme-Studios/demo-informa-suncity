const {test}=require('node:test'),assert=require('node:assert/strict');
function memory(){const map=new Map;return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}
function fresh(){global.sessionStorage=memory();delete global.informaOrderDraft;delete require.cache[require.resolve('../order-draft.js')];require('../order-draft.js');return global.informaOrderDraft}
const cart={items:[{sku:'10701444',name:'Informa Kartini Sofa Bed Fabric Batik - Krem',url:'https://example.test/p',image:'x.webp',quantity:2,unitPrice:2999000,subtotal:1}]};
test('editing an invoice replaces only the pending draft and preserves details and order history',()=>{
 const order=fresh();
 const input={name:'Rina',whatsApp:'081234567890',delivery:'delivery',address:'Jl. Pahlawan No. 1 Sidoarjo',note:'Hubungi sore'};
 const main=order.finalize(input,cart);
 order.markHandedOff();
 assert.equal(order.reopen(main.orderCode),false);
 const context=order.startAdditional();
 order.saveForm(input);
 const first=order.finalize(order.form(),cart);
 assert.equal(order.reopen(main.orderCode),false);
 assert.equal(order.reopen(first.orderCode),true);
 assert.equal(order.draft(),null);
 assert.deepEqual(order.form(),input);
 assert.deepEqual(order.context(),context);
 assert.ok(order.finalize(order.form(),{items:[]}).error);
 const revised=order.finalize(order.form(),{items:[{...cart.items[0],quantity:1}]});
 assert.notEqual(revised.orderCode,first.orderCode);
 assert.equal(revised.parentOrderCode,main.orderCode);
 assert.equal(revised.grandTotal,2999000);
 assert.equal(revised.customerNote,input.note);
});
test('checkout normalizes Indonesian WhatsApp and creates immutable idempotent draft',()=>{const order=fresh(),input={name:'Rina',whatsApp:'081234567890',delivery:'delivery',address:'Jl. Pahlawan No. 1 Sidoarjo',note:'Hubungi sore'};const first=order.finalize(input,cart),second=order.finalize(input,cart);assert.match(first.orderCode,/^INV-SC-\d{8}-[A-F0-9]{8}$/);assert.equal(first.customerWhatsApp,'+6281234567890');assert.equal(first.grandTotal,5998000);assert.equal(first.status,'ready_for_handoff');assert.equal(second.orderCode,first.orderCode);assert.equal(Object.isFrozen(first),true)});
test('checkout rejects invalid WhatsApp and delivery address omission',()=>{const order=fresh();assert.ok(order.finalize({name:'Rina',whatsApp:'123',delivery:'pickup'},cart).error);assert.ok(order.finalize({name:'Rina',whatsApp:'081234567890',delivery:'delivery',address:''},cart).error);assert.equal(order.finalize({name:'Rina',whatsApp:'+628123456789',delivery:'pickup'},cart).deliveryMethod,'pickup')});
test('additional orders preserve customer prefill and root relationship without reusing old items',()=>{const order=fresh(),input={name:'Rina',whatsApp:'081234567890',delivery:'delivery',address:'Jl. Pahlawan No. 1 Sidoarjo',note:'Pintu samping'};const main=order.finalize(input,cart);order.markHandedOff();const relation=order.startAdditional();assert.equal(relation.rootOrderCode,main.orderCode);assert.equal(relation.parentOrderCode,main.orderCode);assert.equal(order.draft(),null);assert.deepEqual(order.form(),{name:'Rina',whatsApp:'+6281234567890',delivery:'delivery',address:'Jl. Pahlawan No. 1 Sidoarjo',note:''});const addedCart={items:[{...cart.items[0],sku:'NEW-01',name:'Lampu Tambahan',quantity:1,unitPrice:500000}]};const additional=order.finalize(order.form(),addedCart);assert.equal(additional.orderType,'additional');assert.equal(additional.parentOrderCode,main.orderCode);assert.equal(additional.rootOrderCode,main.orderCode);assert.notEqual(additional.orderCode,main.orderCode);assert.equal(additional.items.length,1);assert.equal(additional.items[0].sku,'NEW-01')});
test('repeated additional order keeps first order as root and latest order as parent',()=>{const order=fresh(),main=order.finalize({name:'Rina',whatsApp:'081234567890',delivery:'pickup'},cart);order.markHandedOff();order.startAdditional();const firstAdd=order.finalize(order.form(),{items:[{...cart.items[0],sku:'ADD-01',name:'Lampu',quantity:1,unitPrice:100000}]});order.markHandedOff();order.startAdditional();const secondAdd=order.finalize(order.form(),{items:[{...cart.items[0],sku:'ADD-02',name:'Karpet',quantity:1,unitPrice:200000}]});assert.equal(firstAdd.rootOrderCode,main.orderCode);assert.equal(secondAdd.rootOrderCode,main.orderCode);assert.equal(secondAdd.parentOrderCode,firstAdd.orderCode);assert.notEqual(secondAdd.orderCode,firstAdd.orderCode)});
test('session reset removes active draft, customer prefill, and relationship context idempotently',()=>{const order=fresh(),main=order.finalize({name:'Rina',whatsApp:'081234567890',delivery:'pickup'},cart);order.markHandedOff();order.startAdditional();assert.ok(order.context());order.resetSession();order.resetSession();assert.equal(order.draft(),null);assert.deepEqual(order.form(),{});assert.equal(order.context(),null);assert.equal(global.sessionStorage.getItem(order.storageKeys.key),null);assert.equal(global.sessionStorage.getItem(order.storageKeys.dataKey),null);assert.equal(global.sessionStorage.getItem(order.storageKeys.contextKey),null);assert.ok(main.orderCode)});
