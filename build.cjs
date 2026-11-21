const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'dist');fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','i18n.js','style.css','app.js','experience.js','experience.css','branch.css','planner.js','planner.css','products.json','catalog-data.js','cart-store.js','order-draft.js','sales-config.js','whatsapp-handoff.js','room-engine.js','showroom.js','showroom.css'])fs.copyFileSync(path.join(__dirname,file),path.join(out,file));
fs.cpSync(path.join(__dirname,'assets'),path.join(out,'assets'),{recursive:true});
fs.mkdirSync(path.join(out,'vendor'),{recursive:true});
for(const [src,dst] of [['three/build/three.module.js','three.module.js'],['three/build/three.core.js','three.core.js'],['gsap/dist/gsap.min.js','gsap.min.js']])fs.copyFileSync(path.join(__dirname,'node_modules',src),path.join(out,'vendor',dst));
console.log('Static build ready; no server code or credentials in dist.');
