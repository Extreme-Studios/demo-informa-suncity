const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const products=require('../products.json'),{createServer}=require('../backend.cjs');
test('all five showroom categories render official images and working inquiry controls',()=>{
 const vm=require('node:vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../showroom.js'),'utf8'),ctx);
 assert.deepEqual(Object.keys(ctx.window.showroomCollections),['Living','Dining','Bedroom','Workspace','Decor']);
 for(const [zone,c] of Object.entries(ctx.window.showroomCollections)){
  assert.equal(c.products.length,3);const html=ctx.window.renderShowroom(zone);
  assert.ok(html.includes('showroom-hero'));assert.equal((html.match(/data-inquiry=/g)||[]).length,3);
  assert.ok(html.includes('bukan foto cabang'));assert.ok(html.includes('aria-pressed="true"'));
  for(const p of c.products)assert.ok(products.some(x=>x.sku===p.sku&&x.image===p.image));
  for(const img of html.matchAll(/src="([^"]+)"/g))assert.ok(fs.statSync(path.join(__dirname,'..',img[1])).size>100);
 }
});
test('30 unique real products, mixed categories, local images, no price/stock claims',()=>{
 assert.equal(products.length,30);assert.equal(new Set(products.map(p=>p.sku)).size,30);assert.equal(new Set(products.map(p=>p.category)).size,8);
 for(const p of products){assert.ok(p.name.startsWith('Informa '));assert.ok(p.url.startsWith('https://www.ruparupa.com/informastore/p/'));assert.ok(!('price' in p));assert.ok(!('stock' in p));for(const asset of [p.image,p.cutout].filter(Boolean))assert.ok(fs.statSync(path.join(__dirname,'..',asset)).size>100);}
});
test('serves every product asset without crashing, including PNG cutouts',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+server.address().port;for(const asset of [...products.flatMap(p=>[p.image,p.cutout]).filter(Boolean),'products.json','planner.js','planner.css']){const r=await fetch(base+'/'+asset);assert.equal(r.status,200,asset);assert.ok(r.headers.get('content-type'));await r.arrayBuffer();}}finally{await new Promise(r=>server.close(r));}
});
