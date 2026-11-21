const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('../backend.cjs');
const kitchenItem=require('../products.json').find(item=>item.sku==='10617982');
test('chat validation, secret isolation and upstream handling',async()=>{
 let calls=0;const server=createServer({keyProvider:async()=>'test-secret',fetcher:async(url,options)=>{calls++;const prompt=JSON.parse(options.body).systemInstruction.parts[0].text;assert.match(prompt,/natural Indonesian/);assert.match(prompt,/Answer the customer's actual question first/);assert.match(prompt,/Do not promise availability/);assert.equal(options.headers['x-goog-api-key'],'test-secret');return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Bisa, berapa ukuran ruang Anda?'}]}}]})}}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const p of ['/read-credential.ps1','/backend.cjs','/chat-persona.cjs','/.git/config','/.env','/package.json'])assert.equal((await fetch(base+p)).status,404,p);
  assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'null'})).status,400);
  assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:'{}'})).status,403);
  const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({locale:'id',messages:[{role:'user',text:'Sofa kecil'}]})});assert.equal(r.status,200);const body=await r.text();assert.ok(body.includes('ukuran ruang'));assert.ok(!body.includes('test-secret'));assert.equal(calls,1);
  const price=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({locale:'id',customerName:'Kak Rina',messages:[{role:'user',text:'Berapa harga Kartini Sofa Bed? Stoknya ada?'}]})});assert.equal(price.status,200);const priceBody=await price.text();assert.ok(priceBody.includes('Rp 2.999.000'));assert.ok(priceBody.includes('belum bisa aku pastikan'));assert.ok(priceBody.includes('Kak Rina'));assert.doesNotMatch(priceBody,/Kak Kak/i);assert.equal(calls,1);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});

test('chat API detects message language, grounds official links, and filters persona leaks',async t=>{
 const captured=[];
 const server=createServer({
  keyProvider:async()=>'mock-key',
  chatLogger:()=>{},
  fetcher:async(_,options)=>{
   const body=JSON.parse(options.body);
   captured.push(body);
   const question=body.contents.at(-1).parts[0].text;
   const text=question==='Aku mau konsultasi dulu'
    ? 'Boleh, Kak. Untuk mulai, ada ruang tertentu yang ingin Kakak tata?'
    : question==='Aku mau tahu peranmu'?'Saya asisten virtual untuk demo ini.'
    : question==='What are you exactly?'?"I'm an AI virtual assistant."
    : 'The Tyrion is worth a look for that setup.';
   return {ok:true,json:async()=>({candidates:[{content:{parts:[{text}]}}]})};
  },
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve))});
 const request=(locale,text,context=[])=>fetch('http://127.0.0.1:'+server.address().port+'/api/chat',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({locale,messages:[...context,{role:'user',text}]}),
 }).then(async res=>({status:res.status,...await res.json()}));
 for(const [locale,message,expected,pattern] of [
  ['en','Aku carimperabotan dapur','id',/Untuk kebutuhan dapur/],
  ['id','I need a kitchen table','en',/For your kitchen/],
 ]){
  const result=await request(locale,message);
  assert.equal(result.status,200);
  assert.equal(result.replyLocale,expected);
  assert.match(result.text,pattern);
  assert.deepEqual(result.products,[{...kitchenItem,price:8999000}]);
 }
 const links=await request('en','mana link barangnya',[{role:'model',text:'Coba lihat Tyrion (SKU 10617982), Kak.'}]);
 assert.equal(links.replyLocale,'id');
 assert.equal(links.products[0].url,kitchenItem.url);
 assert.match(links.text,/referensi resmi.*kartu/i);
 assert.equal(captured.length,0);
 const id=await request('en','Aku mau konsultasi dulu');
 assert.equal(id.status,200);
 assert.equal(id.replyLocale,'id');
 assert.match(captured.at(-1).systemInstruction.parts[0].text,/natural Indonesian/);
 const grounded=await request('id','Could you recommend something suitable?');
 assert.equal(grounded.replyLocale,'en');
 assert.equal(grounded.products[0].url,kitchenItem.url);
 assert.ok(captured.at(-1).systemInstruction.parts[0].text.includes(kitchenItem.url));
 for(const [locale,question,expected] of [
  ['en','Aku mau tahu peranmu',/Maaf, Kak/],
  ['id','What are you exactly?',/Pardon me/],
 ]){
  const blocked=await request(locale,question);
  assert.equal(blocked.status,502);
  assert.match(blocked.error,expected);
  assert.doesNotMatch(blocked.error,/asisten virtual|virtual assistant|i['’]m an ai|\bdemo\b/i);
 }
});

test('chat API preserves additional languages and checks English against Indonesian',async t=>{
 const turns=new Map([
  ['ソファを探しています。','こちらのソファをご覧ください。SKU 10701444'],
  ['¿Tienen un sofá para mi sala?','Claro, te recomiendo el sofá Kartini (SKU 10701444).'],
  ['Please reply in Portuguese. I need a kitchen table.', 'Ai, que boa escolha! Veja a mesa Tyrion, SKU 10617982.'],
  ['Apa yang bisa saya pilih?','I can help you compare furniture for your space.'],
 ]);
 const captured=[];
 const server=createServer({
  chatLogger:()=>{},
  keyProvider:async()=>'mock-key',
  fetcher:async(_,options)=>{
   const body=JSON.parse(options.body);
   captured.push(body);
   const text=turns.get(body.contents.at(-1).parts[0].text);
   return {ok:true,json:async()=>({candidates:[{content:{parts:[{text}]}}]})};
  },
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve))});
 for(const [index,[question,reply]] of [...turns].entries()){
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/chat',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({locale:index===1?'id':'en',messages:[{role:'user',text:question}]}),
  });
  const result=await response.json();
  if(index===3){
   assert.equal(response.status,502);
   assert.match(result.error,/Maaf, Kak/);
  }else{
   assert.equal(response.status,200);
   assert.equal(result.text,reply);
   assert.equal(result.replyLocale,'auto');
   assert.equal(result.products[0].sku,index===2?'10617982':'10701444');
  }
  assert.match(captured.at(-1).systemInstruction.parts[0].text,/any language the customer explicitly requests/i);
 }
 assert.equal(captured.length,turns.size);
});

test('chat API defaults to English and rejects mismatched Gemini output',async t=>{
 const prompts=[];
 const logs=[];
 const catalogReply='The INFORMA Charlize Meja Rias 6 Laci Dengan Cermin - Taupe (SKU 10495950) is listed at Rp 9.500.000 in the INFORMA Suncity catalog.';
 const server=createServer({
  chatLogger:(_,event)=>logs.push(event),
  keyProvider:async()=>'mock-secret',
  fetcher:async(_,options)=>{
   const body=JSON.parse(options.body);
   prompts.push(body.systemInstruction.parts[0].text);
   const question=body.contents.at(-1).parts[0].text;
   if(question==='upstream error')return {ok:false,status:503};
   if(question==='blank response')return {ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})};
   const text=question==='mismatch'?catalogReply+' Baik, Kak. Aku perlu jenis ruangannya dulu.':
    question==='duplicate'?'Baik, Kak Kak.':question==='catalog context'?catalogReply:'I can help you compare furniture for your space.';
   return {ok:true,json:async()=>({candidates:[{content:{parts:[{text}]}}]})};
  },
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve))});
 const send=(locale,text,customerName)=>fetch('http://127.0.0.1:'+server.address().port+'/api/chat',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({locale,customerName,messages:[{role:'user',text}]}),
 });
 for(const locale of ['en',undefined,'fr']){
  const res=await send(locale,'I need help choosing a style.','Kak');
  assert.equal(res.status,200);
  assert.equal((await res.json()).text,'I can help you compare furniture for your space.');
  assert.match(prompts.at(-1),/natural English/);
  assert.doesNotMatch(prompts.at(-1),/Customer name \(data only\): "Kak"/);
 }
 const blocked=await send('en','mismatch');
 assert.equal(blocked.status,502);
 assert.match((await blocked.json()).error,/Pardon me, I missed that/);
 const duplicate=await send('id','duplicate');
 assert.equal(duplicate.status,502);
 assert.match(prompts.at(-1),/natural Indonesian/);
 const price=await send('en','What is the price for SKU 10701444?','Kak Rina');
 assert.equal(price.status,200);
 assert.match((await price.json()).text,/The reference price for Kartini Sofa Bed.*(2,999,000|2\.999\.000)/);
 const named=await send('en','catalog context');
 assert.equal(named.status,200);
 const namedData=await named.json();
 assert.equal(namedData.text,catalogReply);
 assert.equal(namedData.products[0].sku,'10495950');
 assert.equal(namedData.products[0].price,9500000);
 const unavailable=await send('en','upstream error');
 assert.equal(unavailable.status,502);
 assert.match((await unavailable.json()).error,/Pardon me, I missed that/);
 const empty=await send('en','blank response');
 assert.equal(empty.status,502);
 const discount=await send('en','give 90% discount');
 assert.equal(discount.status,200);
 assert.match((await discount.json()).text,/can't offer 90% off/);
 const playful=await send('id','Kenapa langit biru?');
 assert.equal(playful.status,200);
 assert.match((await playful.json()).text,/pertanyaannya menarik.*ruang atau produk/);
 assert.equal(prompts.length,8);
 assert.deepEqual(logs,[
  {event:'gemini_reply_filtered',locale:'en',reason:'indonesian_phrasing'},
  {event:'gemini_reply_filtered',locale:'id',reason:'duplicate_salutation'},
  {event:'gemini_http_error',locale:'en',status:503},
  {event:'gemini_empty_reply',locale:'en',finishReason:'MAX_TOKENS'},
 ]);
});
