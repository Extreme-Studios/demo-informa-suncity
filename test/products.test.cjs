const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const products=require('../products.json'),{createServer}=require('../backend.cjs');
test('30 unique real products, mixed categories, local images, no price/stock claims',()=>{
 assert.equal(products.length,30);assert.equal(new Set(products.map(p=>p.sku)).size,30);assert.equal(new Set(products.map(p=>p.category)).size,8);
 for(const p of products){assert.ok(p.name.startsWith('Informa '));assert.ok(p.url.startsWith('https://www.ruparupa.com/informastore/p/'));assert.ok(!('price' in p));assert.ok(!('stock' in p));for(const asset of [p.image,p.cutout].filter(Boolean))assert.ok(fs.statSync(path.join(__dirname,'..',asset)).size>100);}
});
test('serves every product asset without crashing, including PNG cutouts',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+server.address().port;for(const asset of [...products.flatMap(p=>[p.image,p.cutout]).filter(Boolean),'products.json','planner.js','planner.css']){const r=await fetch(base+'/'+asset);assert.equal(r.status,200,asset);assert.ok(r.headers.get('content-type'));await r.arrayBuffer();}}finally{await new Promise(r=>server.close(r));}
});
