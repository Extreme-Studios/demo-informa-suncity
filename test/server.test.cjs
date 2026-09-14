const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('../backend.cjs');
test('chat validation, secret isolation and upstream handling',async()=>{
 let calls=0;const server=createServer({keyProvider:async()=>'test-secret',fetcher:async(url,options)=>{calls++;assert.equal(options.headers['x-goog-api-key'],'test-secret');return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Bisa, berapa ukuran ruang Anda?'}]}}]})}}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const p of ['/read-credential.ps1','/backend.cjs','/.git/config','/.env','/package.json'])assert.equal((await fetch(base+p)).status,404,p);
  assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'null'})).status,400);
  assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:'{}'})).status,403);
  const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',text:'Sofa kecil'}]})});assert.equal(r.status,200);const body=await r.text();assert.ok(body.includes('ukuran ruang'));assert.ok(!body.includes('test-secret'));assert.equal(calls,1);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});
