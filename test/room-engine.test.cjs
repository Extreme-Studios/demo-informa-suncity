const {test}=require('node:test'),assert=require('node:assert/strict');
const products=require('../products.json'),{priceReference}=require('../catalog-data.js'),engine=require('../room-engine.js');
test('catalog handles bilingual shorthand and single edits without changing ordinary words',()=>{
 assert.equal(
  engine.normalizeCatalogQuery('Cri mja krsi sofs sfa lmari lmpu ksur tble chr'),
  'cari meja kursi sofa sofa lemari lampu kasur table chair',
 );
 assert.equal(engine.normalizeCatalogQuery('soft soga tablw tablle charr couch'), 'soft sofa table table chair couch');
 assert.deepEqual(engine.catalogIntents('sofa bed, meja tamu dan lampu meja').map(item=>item.type),['sofa','coffee table','lighting']);
 assert.deepEqual(engine.catalogIntents('desk chair and couch').map(item=>item.type),['office chair','sofa']);
 assert.deepEqual(engine.catalogIntents('desk and chair').map(item=>item.type),['desk','chair']);
 assert.deepEqual(engine.catalogIntents('table and meja').map(item=>item.type),['table']);
});
test('Build My Room normalises room, size, budget and style input',()=>{
 assert.equal(engine.parseRoom('ruang kerja kecil'),'Ruang Kerja');assert.equal(engine.parseRoom('buat kamar'),'Kamar Tidur');
 assert.deepEqual(engine.parseSize('3 x 4 meter'),{length:3,width:4,area:12,label:'3×4 m'});
 assert.deepEqual(engine.parseSize('panjang 4 meter lebar 3'),{length:4,width:3,area:12,label:'4×3 m'});
 assert.equal(engine.parseSize('ruang saya 12 meter persegi').area,12);assert.equal(engine.parseBudget('budget maksimal 20 juta'),20000000);assert.equal(engine.parseBudget('Rp20.000.000'),20000000);assert.equal(engine.parseBudget('15jt'),15000000);assert.equal(engine.parseStyle('Aku suka modern'),'Modern');
});
test('very small budget never invents a package',()=>{
 const planner=engine.create(products,priceReference),pack=planner.build({room:'Ruang Tamu',budget:100000});
 assert.deepEqual(pack.items,[]);assert.equal(pack.total,0);assert.equal(pack.remaining,100000);
});
test('Build My Room uses only catalog products and never exceeds budget',()=>{
 const planner=engine.create(products,priceReference),pack=planner.build({room:'Ruang Tamu',budget:20000000});
 assert.ok(pack.items.length>=2);assert.ok(pack.total<=20000000);assert.equal(pack.remaining,20000000-pack.total);assert.equal(planner.total(pack.items),pack.total);
 assert.ok(!pack.items.some(item=>/meja rias|meja dapur/i.test(item.name)),'living-room package must not use vanity or kitchen table');
 for(const item of pack.items){assert.ok(products.some(product=>product.sku===item.sku));assert.equal(typeof priceReference[item.sku],'number')}
});
test('room package changes keep the rest of the package and stay in budget',()=>{
 const planner=engine.create(products,priceReference),pack=planner.build({room:'Ruang Tamu',budget:20000000});
 const cheaper=planner.replacement(pack,'sofa','cheaper',20000000);assert.equal(cheaper.ok,true);assert.ok(cheaper.total<pack.total);assert.equal(cheaper.items.length,pack.items.length);
 const upgraded=planner.replacement(pack,'sofa','upgrade',20000000);
 if(upgraded.ok){assert.ok(upgraded.total<=20000000);assert.equal(upgraded.items.length,pack.items.length);assert.ok(upgraded.total>pack.total)}
 const extra=planner.add(pack,'lampu',20000000);if(extra.ok){assert.ok(extra.total<=20000000);assert.equal(extra.remaining,20000000-extra.total)}
});
