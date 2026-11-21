const {test}=require('node:test'),assert=require('node:assert/strict');
function memory(){const map=new Map;return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}
function fresh(){global.sessionStorage=memory();delete global.informaOrderDraft;delete global.informaWhatsAppHandoff;delete require.cache[require.resolve('../order-draft.js')];delete require.cache[require.resolve('../whatsapp-handoff.js')];require('../order-draft.js');require('../whatsapp-handoff.js');return {order:global.informaOrderDraft,handoff:global.informaWhatsAppHandoff}}
const cart={items:[{sku:'SKU-01',name:'Sofa & Meja',url:'https://informa.co.id/produk/sofa',image:'x.webp',quantity:2,unitPrice:1500000,subtotal:3000000}]};
function draft(order,delivery='delivery'){return order.finalize({name:'Rina\nTest',whatsApp:'081234567890',delivery,address:delivery==='delivery'?'Jl. Pahlawan No. 1 Sidoarjo':'',note:'Hubungi & konfirmasi'},cart)}
test('WhatsApp handoff formats final snapshot and encodes the entire message',()=>{const {order,handoff}=fresh(),final=draft(order),text=handoff.formatOrderSummary(final),url=handoff.buildWhatsAppHandoffUrl(final,'089677523666');assert.match(text,/RINGKASAN PESANAN — INFORMA SUN CITY/);assert.match(text,/Referensi invoice: INV-SC-/);assert.match(text,/Nama pelanggan: Rina Test/);assert.match(text,/Harga satuan: Rp 1\.500\.000/);assert.match(text,/Subtotal: Rp 3\.000\.000/);assert.match(text,/Referensi asli: https:\/\/informa\.co\.id\/produk\/sofa/);assert.match(text,/TOTAL: Rp 3\.000\.000/);assert.match(url,/^https:\/\/wa\.me\/6289677523666\?text=/);assert.ok(url.includes('%E2%80%94'));assert.ok(url.includes('%26'));assert.equal(decodeURIComponent(url.split('?text=')[1]),text)});
test('pickup handoff omits address and invalid links',()=>{const {order,handoff}=fresh(),final=draft(order,'pickup');const altered={...final,items:[{...final.items[0],productUrl:'not-a-url'}]};const text=handoff.formatOrderSummary(altered);assert.match(text,/Penerimaan: Ambil di toko/);assert.doesNotMatch(text,/Alamat:/);assert.doesNotMatch(text,/Referensi asli:/)});
test('building a native WhatsApp link leaves handoff state unchanged',()=>{
 const {order,handoff}=fresh(),final=draft(order);
 const url=handoff.buildWhatsAppHandoffUrl(final,'6289677523666',{receiptReady:true});
 assert.match(decodeURIComponent(url),/foto bukti pembayaran/);
 assert.equal(order.draft().status,'ready_for_handoff');
 const handed=order.markHandedOff();
 assert.equal(handed.status,'handed_off');
 assert.ok(handed.handedOffAt);
 assert.deepEqual(order.markHandedOff(),handed);
});
test('invalid sales numbers and unavailable drafts produce no link',()=>{
 const {order,handoff}=fresh(),final=draft(order);
 assert.equal(handoff.buildWhatsAppHandoffUrl(final,'',{receiptReady:true}),'');
 assert.equal(handoff.buildWhatsAppHandoffUrl({...final,status:'cancelled'},'6289677523666'),'');
 assert.equal(order.draft().status,'ready_for_handoff');
});
test('additional handoff uses only new snapshot items and previous-order reference',()=>{const {order,handoff}=fresh(),main=draft(order);order.markHandedOff();order.startAdditional();const added=order.finalize({name:'Rina Test',whatsApp:'081234567890',delivery:'pickup'}, {items:[{sku:'NEW-02',name:'Lampu Tambahan',url:'https://informa.co.id/produk/lampu',image:'x',quantity:1,unitPrice:700000}]});const url=handoff.buildWhatsAppHandoffUrl(added,'6289677523666',{receiptReady:true});const text=new URL(url).searchParams.get('text');assert.match(text,/TAMBAHAN PESANAN — INFORMA SUN CITY/);assert.match(text,new RegExp(`Pesanan sebelumnya: ${main.orderCode}`));assert.match(text,/TOTAL: Rp 700\.000/);assert.match(text,/Lampu Tambahan/);assert.doesNotMatch(text,/Sofa & Meja/);assert.equal(order.draft().status,'ready_for_handoff')});

test('copy summary retains the finalized customer name and includes the receipt note only when confirmed',()=>{
 const {order,handoff}=fresh();
 const final=order.finalize({name:'Mr. Dilman',whatsApp:'081234567890',delivery:'pickup'},cart);
 for(const locale of ['en','id']){
  const plain=handoff.formatOrderSummary(final,{locale});
  const options={locale,receiptReady:true};
  const confirmed=handoff.formatOrderSummary(final,options);
  assert.match(plain,/Mr\. Dilman/);
  assert.doesNotMatch(plain,/attach the payment receipt image|melampirkan foto bukti pembayaran/);
  assert.match(confirmed,/attach the payment receipt image|melampirkan foto bukti pembayaran/);
  const url=handoff.buildWhatsAppHandoffUrl(final,'6289677523666',options);
  assert.equal(new URL(url).searchParams.get('text'),confirmed);
 }
 assert.equal(order.draft().status,'ready_for_handoff');
});


test('both invoice locales include the captured name, itemization and receipt instructions',()=>{
 const {order,handoff}=fresh();
 const prefill=order.form('Jefri');
 assert.equal(prefill.name,'Jefri');
 order.saveForm({name:'Jefri Surya'});
 assert.equal(order.form('Jefri').name,'Jefri Surya');
 const invoice=order.finalize({...order.form('Jefri'),whatsApp:'081234567890',delivery:'pickup'},cart);
 assert.match(invoice.orderCode,/^INV-SC-\d{8}-[A-F0-9]{8}$/);
 for(const [locale,name,qty,total,receipt] of [
  ['en',/Customer name: Jefri Surya/,/SKU: SKU-01 · Qty: 2/,/TOTAL: Rp 3,000,000/,/attach the payment receipt image right after/],
  ['id',/Nama pelanggan: Jefri Surya/,/SKU: SKU-01 · Jumlah: 2/,/TOTAL: Rp 3\.000\.000/,/melampirkan foto bukti pembayaran setelah/],
 ]){
  const url=handoff.buildWhatsAppHandoffUrl(invoice,'6289677523666',{locale,receiptReady:true});
  const msg=new URL(url).searchParams.get('text');
  assert.ok(msg.includes(invoice.orderCode));
  for(const pattern of [name,qty,total,receipt])assert.match(msg,pattern);
 }
});
