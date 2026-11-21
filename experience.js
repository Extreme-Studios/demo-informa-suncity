import * as THREE from '/vendor/three.module.js';
const ui = window.NayaI18n;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const animate=(target,props)=>window.gsap?gsap.to(target,{...props,duration:reduced.matches?0:props.duration}):(Object.assign(target,props),props.onComplete?.());
const canvas=document.querySelector('#sceneCanvas');
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))}catch{canvas.hidden=true}
const loader=new THREE.TextureLoader();
const images=['assets/living.jpeg','assets/bedroom.jpeg','assets/family.jpeg'];
const uniforms={a:{value:null},b:{value:null},progress:{value:0},aspect:{value:innerWidth/innerHeight},imageAspectA:{value:632/384},imageAspectB:{value:632/384},pointer:{value:new THREE.Vector2()},zoom:{value:1},time:{value:0}};
const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform sampler2D a,b;uniform float progress,aspect,imageAspectA,imageAspectB,zoom,time;uniform vec2 pointer;vec2 cover(vec2 uv,float ar){vec2 s=vec2(min(aspect/ar,1.),min(ar/aspect,1.));return (uv-.5)*s/zoom+.5+pointer*.008;}void main(){float p=progress;float boundary=p*1.7-.35;float mask=1.-smoothstep(boundary-.16,boundary+.16,vUv.x+sin(vUv.y*4.)*.055);vec2 uv=vUv;uv.x+=sin(p*3.14159)*.08*(1.-vUv.x);vec4 ca=texture2D(a,cover(uv,imageAspectA));vec4 cb=texture2D(b,cover(vUv+vec2((1.-p)*.07,0.),imageAspectB));gl_FragColor=mix(ca,cb,mask);}`});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
// Reusable spatial ambience layer for the sales-agent opening. HTML stays readable above it.
const agentSpatialLayer=new THREE.Group();agentSpatialLayer.visible=false;agentSpatialLayer.position.set(-.2,.02,.08);
const ringMaterial=new THREE.LineBasicMaterial({color:0xf0cb8d,transparent:true,opacity:.5});
const coolRingMaterial=new THREE.LineBasicMaterial({color:0xbde8e7,transparent:true,opacity:.28});
const ellipseGeometry=(radiusX,radiusY)=>new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0,0,radiusX,radiusY,0,Math.PI*2,false,64).getPoints(64));
const ringA=new THREE.LineLoop(ellipseGeometry(.24,.17),ringMaterial);
const ringB=new THREE.LineLoop(ellipseGeometry(.34,.16),coolRingMaterial);ringB.rotation.z=.55;
const glassPlane=new THREE.Mesh(new THREE.PlaneGeometry(.62,.28),new THREE.MeshBasicMaterial({color:0xc9ebe7,transparent:true,opacity:.075,depthWrite:false}));glassPlane.position.set(.13,-.23,-.02);glassPlane.rotation.z=-.18;
agentSpatialLayer.add(ringA,ringB,glassPlane);scene.add(agentSpatialLayer);
function setAgentSpatial(active){agentSpatialLayer.visible=Boolean(active)&&!reduced.matches}
let textures=[],current=0,changing=false,entered=false,pointer={x:0,y:0};
const layerRoot=document.querySelector('#floatLayers');
const products=[{name:'Kartini Sofa Bed',file:'kartini.webp',slug:'informa-kartini-sofa-bed-fabric-batik-krem.html',points:[[.46,.425],[.925,.403],[.955,.59],[.926,.8],[.84,.835],[.46,.73]]},{name:'Morie Meja Tamu',file:'morie.webp',slug:'informa-morie-meja-tamu-sliding-door-putih-cokelat-warnut.html',points:[[.188,.59],[.403,.552],[.602,.611],[.587,.853],[.53,.928],[.222,.85]]},{name:'Bean Bag AIN-P',file:'beanbag.webp',slug:'bean-bag-90x105-cm-maroon.html',points:[[.128,.389],[.194,.39],[.247,.55],[.224,.73],[.183,.809],[.026,.771],[.045,.558]]}];
function buildLayers(){layerRoot.replaceChildren();products.forEach((p,i)=>{const el=document.createElement('div');el.className='float-piece';el.style.backgroundImage='url(assets/living.jpeg)';el.dataset.product=i;layerRoot.append(el);el.addEventListener('pointerenter',()=>{if(!entered&&!reduced.matches){animate(el,{y:-19,x:4,duration:.55,ease:'power3.out'});animate('.scene-wash',{opacity:.55,duration:.4})}});el.addEventListener('pointerleave',()=>{animate(el,{x:0,y:0,duration:.75,ease:'elastic.out(1,.6)'});animate('.scene-wash',{opacity:1,duration:.4})});el.addEventListener('click',()=>{if(!entered){animate(el,{y:-22,duration:.25,onComplete:()=>animate(el,{y:0,duration:.7})})}})});positionLayers()}
function positionLayers(){const w=innerWidth,h=innerHeight,s=Math.max(w/632,h/384),left=(w-632*s)/2,top=(h-384*s)/2;[...layerRoot.children].forEach((el,i)=>{el.style.clipPath=`polygon(${products[i].points.map(([x,y])=>`${left+x*632*s}px ${top+y*384*s}px`).join(',')})`})}
function resize(){renderer?.setSize(innerWidth,innerHeight);uniforms.aspect.value=innerWidth/innerHeight;positionLayers()}
addEventListener('resize',resize);resize();
Promise.all(images.map(src=>loader.loadAsync(src))).then(t=>{textures=t;uniforms.a.value=t[0];uniforms.b.value=t[0];uniforms.imageAspectA.value=t[0].image.width/t[0].image.height;uniforms.imageAspectB.value=uniforms.imageAspectA.value;buildLayers()}).catch(()=>{canvas.hidden=true;document.querySelector('#immersive').style.backgroundImage='url(assets/living.jpeg)'})
addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=-(e.clientY/innerHeight-.5)*2});
let last=0;function frame(t){requestAnimationFrame(frame);if(document.hidden||!renderer||!textures.length||t-last<24)return;last=t;uniforms.pointer.value.lerp(new THREE.Vector2(reduced.matches?0:pointer.x,reduced.matches?0:pointer.y),.055);uniforms.time.value=t*.001;if(agentSpatialLayer.visible){agentSpatialLayer.rotation.z=t*.00006;agentSpatialLayer.position.x=-.2+pointer.x*.035;agentSpatialLayer.position.y=.02+pointer.y*.025;ringB.rotation.z=.55+Math.sin(t*.0004)*.18}renderer.render(scene,camera)}requestAnimationFrame(frame);
function changeScene(index){if(!textures.length||changing||index===current)return;changing=true;uniforms.b.value=textures[index];uniforms.imageAspectB.value=textures[index].image.width/textures[index].image.height;animate(uniforms.progress,{value:1,duration:1.1,ease:'power2.inOut',onComplete:()=>{current=index;uniforms.a.value=textures[index];uniforms.imageAspectA.value=uniforms.imageAspectB.value;uniforms.progress.value=0;changing=false}})}
document.querySelector('#enterExperience').onclick=()=>{if(entered)return;entered=true;layerRoot.style.display='none';const opening=document.querySelector('#opening');opening.inert=true;document.body.classList.remove('at-opening');animate(uniforms.zoom,{value:1.12,duration:1.35,ease:'power3.inOut'});animate(opening,{clipPath:'inset(0 100% 0 0)',x:-50,duration:1.05,ease:'power3.inOut',onComplete:()=>{opening.hidden=true;if(chat.hidden&&greetingSplash.hidden)document.querySelector('.back-opening').focus()}});if(window.gsap){gsap.from('.experience header',{y:-25,opacity:0,duration:.8,delay:.5});gsap.from('.experience .hero',{x:60,opacity:0,duration:1,delay:.35});gsap.from('.portals button',{y:50,opacity:0,duration:.8,stagger:.12,delay:.7})}};
document.querySelector('.back-opening').onclick=()=>{entered=false;changeScene(0);const opening=document.querySelector('#opening');opening.hidden=false;opening.inert=false;opening.style.display='flex';document.body.classList.add('at-opening');animate(opening,{clipPath:'inset(0 0% 0 0)',x:0,duration:.8});animate(uniforms.zoom,{value:1,duration:1,onComplete:()=>layerRoot.style.display='block'});document.querySelector('#enterExperience').focus()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b){const view=b.dataset.open;document.body.classList.add('portal-focus');changeScene(view==='room'?1:view==='explore'?2:0);if(window.gsap)gsap.fromTo('#panel',{clipPath:'inset(0 0 0 100%)',x:30},{clipPath:'inset(0 0 0 0%)',x:0,duration:reduced.matches?0:.65,ease:'power3.inOut'})}});
document.querySelector('#panel').addEventListener('close',()=>{document.body.classList.remove('portal-focus');changeScene(0)});
const chat=document.querySelector('#chat'),log=document.querySelector('#chatLog'),input=document.querySelector('#chatInput'),send=document.querySelector('#chatSend');
const agentResponse=document.querySelector('#agentResponse'),workspaceActions=document.querySelector('#chatQuickActions'),chatModeToggle=document.querySelector('#chatModeToggle');
const greetingSplash=document.querySelector('#nayaGreetingSplash'),greetingStart=document.querySelector('#nayaGreetingStart'),splashDialogue=document.querySelector('#nayaSplashDialogue'),splashForm=document.querySelector('#nayaSplashForm'),splashInput=document.querySelector('#nayaSplashInput');
const savedCartNotice=document.querySelector('#savedCartNotice'),savedCartCount=document.querySelector('#savedCartCount');
let savedCartOnWelcome=false;
const agentSoundToggle=document.querySelector('#agentSoundToggle');
const agentConfig=Object.freeze({name:'Naya',role:'Sales Assistant',avatar:'assets/naya-sales-assistant-cartoon.png',greeting:['Hai Kak, selamat datang di INFORMA Suncity.','Ada yang bisa kami bantu, Kak?']});
const themeConfig=Object.freeze({sceneType:'premium-interior-spatial',accent:'#d7ad73',soundProfile:'soft-glass'});
const salesUiConfig=Object.freeze({cartName:'Keranjang Naya',handoffLabel:'Lanjut ke Sales',closingCopy:'Baik Kak. Terima kasih sudah mengunjungi INFORMA Suncity Sidoarjo. Kalau nanti ingin lanjut atau butuh rekomendasi lain, Naya siap membantu.'});
const customerNameKey='informa-naya-customer-name-v1';
function loadCustomerName(){
 try{return sessionStorage.getItem(customerNameKey)||''}catch{return ''}
}
let history=[],splashHistory=[],sending=false,splashSending=false,nayaName=loadCustomerName(),nayaOpened=false,autoGreetTimer=0;
let awaitingName=!nayaName,chatSession=0;
function rememberCustomerName(name){
 nayaName=name;
 try{
  if(name)sessionStorage.setItem(customerNameKey,name);
  else sessionStorage.removeItem(customerNameKey);
 }catch{}
}
const workspaceState={view:'idle',comparison:[],lastIntent:'',lastRequest:'',turns:[],mode:'interactive'};
const nayaAutoGreetKey='informa-suncity-naya-auto-greet-v1';
const hasAutoGreeted=()=>{try{return sessionStorage.getItem(nayaAutoGreetKey)==='true'}catch{return false}};
const markAutoGreeted=()=>{try{sessionStorage.setItem(nayaAutoGreetKey,'true')}catch{}};
let agentAudioContext,agentSoundMuted=false;
function playAgentSound(type='message'){if(agentSoundMuted)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;agentAudioContext||=new Audio();if(agentAudioContext.state==='suspended')agentAudioContext.resume().catch(()=>{});const now=agentAudioContext.currentTime,oscillator=agentAudioContext.createOscillator(),gain=agentAudioContext.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(type==='greeting'?660:520,now);oscillator.frequency.exponentialRampToValueAtTime(type==='greeting'?880:680,now+.07);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.025,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.13);oscillator.connect(gain).connect(agentAudioContext.destination);oscillator.start(now);oscillator.stop(now+.14)}catch{}}
function updateAgentSoundToggle(){agentSoundToggle.setAttribute('aria-pressed',String(!agentSoundMuted));agentSoundToggle.setAttribute('aria-label',ui.text(agentSoundMuted?'Nyalakan suara Naya':'Matikan suara Naya'));agentSoundToggle.textContent=agentSoundMuted?'◌':'◉'}
const nayaOpening='Halo, selamat datang di INFORMA Sun City! Saya Naya. Boleh tahu dengan siapa saya berbicara hari ini?';
function shortResponse(text){return String(text).replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).slice(0,3).join(' ').slice(0,290)}
const initialAgentReply=ui.message('Saya siap bantu carikan pilihan yang cocok, Kak.');
const localReply = value => typeof value==='string' ? ui.message(value) : value;
const replyNodes=new WeakMap();
function replyText(reply){
 const value=reply?.reply!==undefined
  ? reply.reply
  : ui.format(reply,reply?.locale||ui.locale);
 return shortResponse(value);
}
function syncAgentResponse(){
 const latest=workspaceState.turns.findLast(turn=>turn.type==='response');
 agentResponse.textContent=replyText(latest?.text||initialAgentReply);
}
function setQuickActions(actions){workspaceActions.replaceChildren(...actions.map(action=>{const button=document.createElement('button');button.type='button';button.dataset.intent=action.intent;ui.bindText(button,action.label);return button}))}
function workspaceHeading(kicker,title,copy){const heading=document.createElement('header');heading.className='workspace-heading';heading.innerHTML=`<p>${ui.label(kicker)}</p><h2>${ui.label(title)}</h2>${copy?`<span>${copy}</span>`:''}`;return heading}
function scrollWorkspaceToLatest(){requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight})}
function showWorkspace(view,...nodes){workspaceState.view=view;if(workspaceState.turns.length&&view!=='idle'){renderConversationHistory(false);log.append(...nodes)}else log.replaceChildren(...nodes);log.scrollTop=view==='idle'?0:log.scrollHeight;log.classList.add('workspace-shift')}
function customerRequestBlock(text){const card=document.createElement('article');card.className='workspace-customer-request';const label=document.createElement('small');ui.bindText(label,'Kebutuhan Kak');const body=document.createElement('p');if(typeof text==='string'&&text)body.textContent=text;else if(text)ui.bindText(body,text.key,text.values);else ui.bindText(body,'Pilihkan produk yang sesuai untuk saya.');card.append(label,body);return card}
function agentResponseBlock(text){const block=document.createElement('section');block.className='workspace-agent-response';const label=document.createElement('small');label.textContent='Naya · Sales Assistant';const body=document.createElement('p');body.textContent=replyText(text);replyNodes.set(body,text);block.append(label,body);return block}
function historyNodes(){return workspaceState.turns.flatMap(turn=>{if(turn.type==='request')return [customerRequestBlock(turn.text)];if(turn.type==='response')return [agentResponseBlock(turn.text)];if(turn.type==='products'){const heading=workspaceHeading('REKOMENDASI INFORMA',turn.label,ui.label('{count} pilihan dari katalog',{count:turn.products.length}));return [heading,createProductGrid(turn.products,turn.label)]}return []})}
function renderConversationHistory(scroll=true){syncAgentResponse();if(!workspaceState.turns.length)return;workspaceState.view='conversation';log.replaceChildren(...historyNodes());if(scroll)scrollWorkspaceToLatest()}
function addConversationTurn(turn){workspaceState.turns.push(turn);if(workspaceState.turns.length>30)workspaceState.turns.splice(0,workspaceState.turns.length-30);renderConversationHistory()}
function recordCustomerRequest(message){workspaceState.lastRequest=message;addConversationTurn({type:'request',text:message})}
function renderWorkspaceIdle(){setQuickActions([{label:'Cari Produk',intent:'Cari Produk'},{label:'Build My Room',intent:'Build My Room'},{label:'Bantu Saya Memilih',intent:'Bantu Saya Memilih'}]);showWorkspace('idle',workspaceHeading('CONVERSATIONAL SALES WORKSPACE','Mulai dari kebutuhan Kak.',ui.label('Cari produk, susun ruang, atau minta Naya memilihkan.')),Object.assign(document.createElement('div'),{className:'workspace-idle-actions',innerHTML:'<button data-intent="Cari Produk"><!--naya-copy:Cari Produk-->Cari Produk</button><button data-intent="Build My Room">Build My Room</button><button data-intent="Bantu Saya Memilih"><!--naya-copy:Bantu Saya Memilih-->Bantu Saya Memilih</button>'}));log.querySelectorAll('[data-intent]').forEach(button=>button.onclick=()=>handleIntent(button.dataset.intent))}
function updateChatMode(){const minimal=workspaceState.mode==='minimal';chat.classList.toggle('is-minimal',minimal);chatModeToggle.textContent=minimal?'⇱':'⇲';chatModeToggle.title=ui.text(minimal?'Perluas':'Minimalkan');chatModeToggle.setAttribute('aria-label',ui.text(minimal?'Perluas workspace':'Minimalkan workspace'))}
function showChat({focus=true,greet=true}={}){
 chat.hidden=false;document.querySelector('#chatLauncher').hidden=true;
 if(workspaceState.turns.length)renderConversationHistory(false);
 else if(workspaceState.view==='idle'||!log.children.length)renderWorkspaceIdle();
 if(greet&&!nayaOpened){
  nayaOpened=true;
  bubble(nayaName?'Saya siap bantu carikan pilihan yang cocok, Kak.':nayaOpening,'model');
 }
 updateChatMode();
 if(focus)input.focus();
}
function dismissGreetingSplash(next){if(greetingSplash.hidden)return;const session=chatSession;setAgentSpatial(false);greetingSplash.classList.add('is-leaving');setTimeout(()=>{if(session!==chatSession)return;greetingSplash.hidden=true;greetingSplash.classList.remove('is-leaving');next?.()},280)}
function continueFromGreeting(){playAgentSound('message');dismissGreetingSplash(()=>{document.querySelector('#enterExperience').click();setTimeout(()=>showChat({focus:true,greet:true}),520)})}
function showGreetingSplash(){markAutoGreeted();if(!greetingSplash.hidden){setAgentSpatial(true);return}greetingSplash.hidden=false;setAgentSpatial(true);setTimeout(()=>playAgentSound('greeting'),650);setTimeout(()=>playAgentSound('message'),1000)}
function scheduleAutoGreet(resumingCart=false){
 if((hasAutoGreeted()&&!resumingCart)||autoGreetTimer)return;
 autoGreetTimer=setTimeout(()=>{
  autoGreetTimer=0;
  if((hasAutoGreeted()&&!savedCartOnWelcome)||!chat.hidden||cartDialog.open)return;
  showGreetingSplash();
 },450);
}
document.addEventListener('naya:localechange',()=>{
 updateAgentSoundToggle();updateChatMode();
 syncAgentResponse();
 if(cartDialog.open)syncInvoiceWhatsAppLink();
 log.querySelectorAll('.workspace-agent-response p').forEach(node=>{
  const reply=replyNodes.get(node);
  if(reply)node.textContent=replyText(reply);
 });
});
scheduleAutoGreet();
function splashMessage(text,role='naya'){const item=document.createElement('p');item.className=`naya-splash-message ${role}`;item.textContent=text;splashDialogue.append(item);splashDialogue.scrollTop=splashDialogue.scrollHeight;return item}
async function askSplash(text){if(splashSending||!text.trim())return;const message=text.trim();splashSending=true;splashInput.value='';splashInput.disabled=true;const submit=splashForm.querySelector('button');submit.disabled=true;dismissGreetingSplash(()=>{document.querySelector('#enterExperience').click();setTimeout(()=>{showChat({focus:false,greet:false});ask(message);splashSending=false},360)})}
splashForm.onsubmit=event=>{event.preventDefault();askSplash(splashInput.value)};
greetingStart.onclick=()=>continueFromGreeting();
document.querySelector('#nayaOpeningActions').onclick=event=>{
 const button=event.target.closest('[data-opening-intent]');
 if(!button||splashSending)return;
 splashSending=true;
 awaitingName=false;
 dismissGreetingSplash(()=>{
  document.querySelector('#enterExperience').click();
  showChat({focus:true,greet:false});
  splashSending=false;
  handleIntent(button.dataset.openingIntent);
 });
};
agentSoundToggle.onclick=()=>{agentSoundMuted=!agentSoundMuted;updateAgentSoundToggle();if(!agentSoundMuted)playAgentSound('message')};updateAgentSoundToggle();
greetingSplash.addEventListener('pointermove',event=>{if(greetingSplash.hidden)return;const bounds=greetingSplash.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width-.5,y=(event.clientY-bounds.top)/bounds.height-.5;greetingSplash.style.setProperty('--naya-px',(x*5).toFixed(2));greetingSplash.style.setProperty('--naya-py',(y*5).toFixed(2))});
document.querySelector('#chatLauncher').onclick=()=>{workspaceState.mode='minimal';showChat()};
document.querySelector('#chatClose').onclick=()=>{chat.hidden=true;document.querySelector('#chatLauncher').hidden=false;document.querySelector('#chatLauncher').focus()};
chatModeToggle.onclick=()=>{workspaceState.mode=workspaceState.mode==='interactive'?'minimal':'interactive';updateChatMode()};
document.addEventListener('click',e=>{if(e.target.closest('[data-open="shopper"]')){document.querySelector('#panel').close();showChat()}});
function bubble(text,role,locale){if(role!=='user'){const value=localReply(text);const response=locale?{...value,locale}:value;addConversationTurn({type:'response',text:response});playAgentSound('message')}return null}
function cardPrice(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value)}
const catalogPrice=window.INFORMA_CATALOG?.priceReference||{};
const catalogPromise=fetch('/products.json').then(r=>r.ok?r.json():Promise.reject(new Error('Katalog tidak tersedia')));
catalogPromise.then(products=>{
 const store=window.informaCart;
 store.init(products,catalogPrice);
 const cart=store.snapshot();
 savedCartOnWelcome=cart.items.length>0;
 syncSavedCartNotice(cart);
 if(savedCartOnWelcome&&!entered)scheduleAutoGreet(true);
});
const salesContext={budgetMax:null,budgetMin:null,productRequests:[],lastResults:[],roomStep:false};
let cartClearPending=false;
const roomFlow={active:false,stage:'',room:'',size:null,budget:null,style:'',priority:'',pack:null};
const normalise=value=>String(value||'').toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi,' ').trim();
const productColors=['putih','krem','beige','cokelat','hitam','merah','maroon','abu abu','hijau','pink','gold','orange','taupe'];
const categoryRules=[
 [/\b(ruang tamu|living room)\b/,'Sofa & kursi'],
 [/\b(sofa|kursi|chair|bangku|bean bag|dudukan)\b/,'Sofa & kursi'],[/\b(karpet|seprai|sprei|tekstil|bedding)\b/,'Karpet & tekstil'],
 [/\b(meja|nakas|dapur|rias)\b/,'Meja & nakas'],[/\b(lemari|rak|kabinet|penyimpanan|laci)\b/,'Penyimpanan'],
 [/\b(lampu|pencahayaan)\b/,'Lampu'],[/\b(tanaman)\b/,'Tanaman'],[/\b(dekorasi|kotak tisu|perhiasan|remote)\b/,'Dekorasi'],[/\b(cermin|dinding|lukisan)\b/,'Dinding & cermin']
];
function productColor(product){const name=normalise(product.name);return productColors.find(color=>name.includes(color))||''}
function productDimension(product){const match=product.name.match(/\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?\s*cm/i);return match?match[0].replace(/\s+/g,' '):''}
function extractBudget(text){const lower=normalise(text);const match=lower.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?/);if(!match)return null;let value=Number(match[1].replace(',','.'));if(!Number.isFinite(value))return null;if(['juta','jt'].includes(match[2]))value*=1000000;else if(['ribu','rb'].includes(match[2]))value*=1000;else if(value<1000)return null;return Math.round(value)}
function requestedCategory(text){return categoryRules.find(([rule])=>rule.test(normalise(text)))?.[1]||''}
function requestedColor(text){const lower=normalise(text);return productColors.find(color=>lower.includes(color))||''}
function productMatchesKeyword(product,text){const words=normalise(text).split(' ').filter(word=>word.length>3&&!['cari','yang','lebih','dengan','untuk','bawah','budget','harga','murah','mahal','warna','ukuran','ada','kak'].includes(word));const haystack=normalise(`${product.name} ${product.category}`);return words.some(word=>haystack.includes(word))}
const isProductRequest=(text,request)=>Boolean(request)||/\b(cari|ada|pilihan|produk|kulkas|minimalis|minimalist|murah|mahal|terang|kecil|besar|warna|budget|cheaper|higher priced|smaller|color)\b/i.test(text);
function addToCart(product,quantity=1){const item=window.informaCart.add(product.sku,quantity);return item?.quantity||0}
function cartText(detail=false){
 const cart=window.informaCart.snapshot();
 if(!cart.items.length)return ui.message('Keranjang Kakak masih kosong. Mau aku bantu carikan produk atau susun kebutuhan ruangan?');
 const items=detail?'\n\n'+cart.items.map(item=>`${item.name} · ${item.quantity} × ${cardPrice(item.unitPrice)} = ${cardPrice(item.subtotal)}`).join('\n'):'';
 return ui.message('Ada {count} produk di keranjang dengan total {total}.{items}',{count:cart.quantity,total:cardPrice(cart.total),items});
}
function createProductGrid(products,label='Rekomendasi produk INFORMA'){
 const grid=document.createElement('section');grid.className='workspace-product-grid';grid.setAttribute('aria-label',ui.text(label));grid.setAttribute('data-copy-aria-label',label);
 grid.innerHTML=products.map(product=>{const price=catalogPrice[product.sku];const priceLabel=price==null?ui.label('Harga referensi belum tersedia'):cardPrice(price);const productLink=product.url?`<a href="${product.url}" target="_blank" rel="noopener noreferrer">${ui.label('Lihat Referensi Asli ↗')}</a>`:'';return `<article class="workspace-product-card"><img loading="lazy" src="${product.image}" alt="${product.name}"><div><h3>${product.name.replace(/^Informa /,'')}</h3><p class="card-price">${priceLabel}</p><p class="card-sku">SKU ${product.sku}</p><div class="workspace-card-actions">${productLink}<button type="button" data-compare="${product.sku}"><!--naya-copy:Bandingkan-->Bandingkan</button><button type="button" data-cart-preview="${product.sku}"><!--naya-copy:Tambah-->Tambah</button></div></div></article>`}).join('');
 grid.querySelectorAll('[data-cart-preview]').forEach(button=>button.onclick=()=>{const product=products.find(item=>item.sku===button.dataset.cartPreview);const count=addToCart(product);ui.bindText(button,'✓ Ditambahkan ke Keranjang Naya');button.classList.add('added');if(window.informaCart.snapshot().quantity>=2){bubble(ui.message("Saat ini ada {count} produk di Keranjang Naya. Mau lanjut belanja atau proses pesanannya, Kak?", {count: window.informaCart.snapshot().quantity}),'model');setQuickActions([{label:'Lanjut Belanja',intent:'Cari produk lain'},{label:'Proses Pesanan',intent:'Proses Pesanan'}])}else bubble(ui.message("{name} sudah aku masukkan ke Keranjang Naya, Kak.", {name: product.name.replace(/^Informa /,'')}),'model')});
 grid.querySelectorAll('[data-detail]').forEach(button=>button.onclick=()=>renderProductDetail(products.find(item=>item.sku===button.dataset.detail)));
 grid.querySelectorAll('[data-compare]').forEach(button=>button.onclick=()=>{const product=products.find(item=>item.sku===button.dataset.compare);workspaceState.comparison=workspaceState.comparison.some(item=>item.sku===product.sku)?workspaceState.comparison.filter(item=>item.sku!==product.sku):[...workspaceState.comparison,product].slice(-2);if(workspaceState.comparison.length===2)renderComparison(workspaceState.comparison);else{ui.bindText(button,'Pilih 1 lagi');bubble('Pilih satu produk lagi untuk dibandingkan, Kak.','model')}});
 return grid;
}
function appendProductCards(products,label='Rekomendasi produk INFORMA'){
 if(!products.length)return;
 salesContext.lastResults=products;
 addConversationTurn({type:'products',products:[...products],label});setQuickActions([{label:'Lebih Murah',intent:'Lebih Murah'},{label:'Pilihan Lain',intent:'Cari produk lain'},{label:'Bandingkan',intent:'Bandingkan produk pertama dan kedua'},{label:'Tambah Pertama',intent:'Tambah yang pertama'}]);
}
function renderProductDetail(product){if(!product)return;const price=catalogPrice[product.sku];const detail=document.createElement('section');detail.className='workspace-detail';detail.innerHTML=`<img src="${product.image}" alt="${product.name}"><div><p><!--naya-copy:DETAIL PRODUK-->DETAIL PRODUK</p><h2>${product.name.replace(/^Informa /,'')}</h2><b>${price==null?ui.label('Harga referensi belum tersedia'):cardPrice(price)}</b><small>SKU ${product.sku}</small><div>${product.url?`<a href="${product.url}" target="_blank" rel="noopener noreferrer">${ui.label('Lihat Referensi Asli ↗')}</a>`:''}<button data-detail-add="${product.sku}"><!--naya-copy:Tambah ke Keranjang Naya-->Tambah ke Keranjang Naya</button></div></div>`;detail.querySelector('[data-detail-add]').onclick=()=>{addToCart(product);bubble(ui.message("{name} sudah masuk ke Keranjang Naya, Kak.", {name: product.name.replace(/^Informa /,'')}),'model')};showWorkspace('productDetail',detail);setQuickActions([{label:'Kembali ke Pilihan',intent:'Cari produk lain'},{label:'Tambah Produk',intent:`Tambah ${product.name.replace(/^Informa /,'')}`}]);}
function renderComparison(products,say=bubble){const section=document.createElement('section');section.className='workspace-comparison';section.innerHTML=`<header><p>COMPARISON</p><h2><!--naya-copy:Bandingkan pilihan-->Bandingkan pilihan</h2></header>${products.map(product=>`<article><img src="${product.image}" alt="${product.name}"><div><b>${product.name.replace(/^Informa /,'')}</b><span>${catalogPrice[product.sku]==null?ui.label('Harga referensi belum tersedia'):cardPrice(catalogPrice[product.sku])}</span><small>SKU ${product.sku}</small><button data-compare-add="${product.sku}"><!--naya-copy:Tambah-->Tambah</button></div></article>`).join('')}`;section.querySelectorAll('[data-compare-add]').forEach(button=>button.onclick=()=>{const product=products.find(item=>item.sku===button.dataset.compareAdd);addToCart(product);bubble(ui.message("{name} ditambahkan ke keranjang.", {name: product.name.replace(/^Informa /,'')}),'model');showWorkspace('comparison',section)});say('Ini perbandingan dua pilihan Kak.','model');showWorkspace('comparison',section);setQuickActions([{label:'Tambah Pertama',intent:'Tambah yang pertama'},{label:'Tambah Kedua',intent:'Tambah yang kedua'},{label:'Pilihan Lain',intent:'Cari produk lain'}]);}
function unavailable(say=bubble){
 say('Aku belum menemukan produk itu dalam katalog. Aku bisa bantu bandingkan alternatif berdasarkan fungsi, ukuran, atau budget.','model');
}
function priceFor(product){return catalogPrice[product.sku]}
function balancedProducts(groups,limit){
 const results=[],seen=new Set();
 while(results.length<limit&&groups.some(group=>group.length)){
  for(const group of groups){
   while(group.length&&seen.has(group[0].sku))group.shift();
   const product=group.shift();
   if(!product)continue;
   results.push(product);
   seen.add(product.sku);
   if(results.length===limit)return results;
  }
 }
 return results;
}
function filterProducts(products,lower,requests){
 const category=requestedCategory(lower),color=requestedColor(lower),budget=extractBudget(lower);
 if(budget&&( /\b(di bawah|maks(?:imal)?|budget|anggaran|kurang dari)\b/.test(lower)||!salesContext.budgetMax))salesContext.budgetMax=budget;
 if(requests.length){
  salesContext.productRequests=requests.map(request=>({
   category:request.category||(!request.type?category:''),
   match:request.match,
  }));
 }else if(category){
  salesContext.productRequests=[{category}];
 }
 let results=[...products];
 if(color)results=results.filter(product=>productColor(product)===color);
 if(/\b(lebih terang|warna terang)\b/.test(lower)){const brighter=new Set(['putih','krem','beige','pink','gold']);const previousColors=new Set(salesContext.lastResults.map(productColor));results=results.filter(product=>brighter.has(productColor(product))&&!previousColors.has(productColor(product)));}
 const asksSpecific=/\b(kulkas|meja makan|tempat tidur)\b/.test(lower);
 if(asksSpecific)results=results.filter(product=>productMatchesKeyword(product,lower));
 if(salesContext.budgetMax!=null)results=results.filter(product=>priceFor(product)!=null&&priceFor(product)<=salesContext.budgetMax);
 if(/\b(lebih murah|cheaper|lower price)\b/.test(lower)&&salesContext.lastResults.length){const ceiling=Math.min(...salesContext.lastResults.map(priceFor).filter(Number.isFinite));results=results.filter(product=>priceFor(product)!=null&&priceFor(product)<ceiling)}
 if(/\b(lebih mahal|higher priced)\b/.test(lower)&&salesContext.lastResults.length){const floor=Math.max(...salesContext.lastResults.map(priceFor).filter(Number.isFinite));results=results.filter(product=>priceFor(product)!=null&&priceFor(product)>floor)}
 if(/\b(lebih kecil|ukuran kecil|smaller)\b/.test(lower)){const dimensions=salesContext.lastResults.map(productDimension).filter(Boolean);if(dimensions.length)results=results.filter(product=>productDimension(product));else return {results:[],reason:'dimension'};}
 results.sort((a,b)=>(priceFor(a)??Infinity)-(priceFor(b)??Infinity));
 const groups=salesContext.productRequests.map(request=>results.filter(product=>
  (!request.category||product.category===request.category)&&(!request.match||request.match.test(normalise(product.name)))
 ));
 return {results:groups.length>1?balancedProducts(groups,4):(groups[0]??results).slice(0,4)};
}
function roomLabel(translate=ui.text){return `${translate(roomFlow.room)}${roomFlow.size?` · ${roomFlow.size.label}`:''}`}
function renderRoomPackage(note=''){
 const pack=roomFlow.pack;if(!pack)return;
 salesContext.lastResults=pack.items;
 const section=document.createElement('section');section.className='room-package';section.setAttribute('aria-label',ui.text('Hasil Build My Room'));section.setAttribute('data-copy-aria-label','Hasil Build My Room');
 section.innerHTML=`<div class="room-package-head"><p class="kicker">BUILD MY ROOM</p><b>${roomLabel(ui.label)}</b><span>${roomFlow.style?`Style: ${roomFlow.style} · `:''}Budget: ${cardPrice(roomFlow.budget)}</span></div><div class="room-package-total"><span><!--naya-copy:Total Produk-->Total Produk</span><b>${cardPrice(pack.total)}</b><span>${ui.label('Sisa budget:')} ${cardPrice(pack.remaining)}</span></div>${note?`<p class="room-package-note">${ui.label(note)}</p>`:''}<div class="room-package-actions"><button type="button" data-room-action="replace"><!--naya-copy:Ganti Produk-->Ganti Produk</button><button type="button" data-room-action="save"><!--naya-copy:Lebih Hemat-->Lebih Hemat</button><button type="button" data-room-action="upgrade"><!--naya-copy:Upgrade Pilihan-->Upgrade Pilihan</button><button type="button" data-room-action="add"><!--naya-copy:Tambah Produk-->Tambah Produk</button><button type="button" class="room-add-all" data-room-action="all"><!--naya-copy:Tambahkan Semua ke Keranjang-->Tambahkan Semua ke Keranjang</button></div>`;
 section.querySelectorAll('[data-room-action]').forEach(button=>button.onclick=()=>roomAction(button.dataset.roomAction));showWorkspace('recommendation',section,createProductGrid(pack.items,'Produk Build My Room'));setQuickActions([{label:'Ganti Produk',intent:'Ganti sofa'},{label:'Lebih Hemat',intent:'Lebih Hemat'},{label:'Upgrade',intent:'Upgrade'},{label:'Tambah Semua',intent:'Tambahkan semua ke keranjang'}]);
}
function makeRoomPackage(products,reason='',say=bubble){
 const engine=window.NayaRoomEngine.create(products,catalogPrice);roomFlow.pack=engine.build(roomFlow);if(!roomFlow.pack.items.length){say(ui.message("Dengan budget {budget}, belum ada paket {room} yang cocok. Kita bisa menaikkan budget atau mulai dari satu produk utama, Kak.", {budget:cardPrice(roomFlow.budget),room:ui.message(roomFlow.room)}),'model');return}
 const priorityNote=roomFlow.priority?ui.message('Aku prioritaskan kebutuhan ini: {priority}.',{priority:roomFlow.priority}):ui.message('Aku prioritaskan kebutuhan utama ruangan dulu, lalu item pendukung selama masih masuk budget.');
 say(ui.message('Paket {room} siap. Budget {budget}. {priority} {style} {reason}',{
  room:ui.message(roomFlow.room),budget:cardPrice(roomFlow.budget),priority:priorityNote,
  style:roomFlow.style?ui.message('Preferensi gaya sudah aku catat.'):'',reason:reason?ui.message(reason):'',
 }),'model');renderRoomPackage(roomFlow.size?'Dari data ukuran yang tercantum pada produk tertentu, penempatan final tetap perlu dicek kembali ya, Kak.':'Ukuran produk tidak selalu tercantum pada katalog; penempatan final tetap perlu dicek kembali ya, Kak.');
}
function roomAction(action,say=bubble){
 const packs=roomFlow.pack;if(!packs)return;
 if(action==='all'){const signature=packs.items.map(product=>product.sku).join(',');if(roomFlow.addedSignature===signature){say('Paket Build My Room ini sudah ada di keranjang, Kak.','model');return}let added=0;for(const product of packs.items){addToCart(product);added++}roomFlow.addedSignature=signature;say(ui.message("{count} produk Build My Room sudah masuk keranjang, Kak.", {count:added}),'model');return}
 if(action==='save'){roomReplacement('sofa','cheaper',say);return}
 if(action==='upgrade'){roomReplacement('sofa','upgrade',say);return}
 if(action==='replace'){say('Mau ganti produk yang mana, Kak? Contoh: “ganti sofanya”, “mejanya kurang suka”, atau “cari lampu yang lebih murah”.','model');return}
 if(action==='add'){say('Mau tambah apa, Kak? Misalnya lampu, dekorasi, atau satu kursi lagi. Aku cek dulu supaya totalnya tetap masuk budget.','model')}
}
async function roomReplacement(key,mode,say=bubble){const products=await catalogPromise,engine=window.NayaRoomEngine.create(products,catalogPrice);const result=engine.replacement(roomFlow.pack,key,mode,roomFlow.budget);if(!result.ok){say(result.reason==='over-budget'?ui.message("Upgrade {item} ini akan melewati budget {budget}, Kak. Paketnya tetap sama.", {item:ui.message(key),budget:cardPrice(roomFlow.budget)}):ui.message("Belum ada pilihan {mode} untuk {item} tanpa mengubah isi paket lain.", {mode:ui.message(mode==='cheaper'?'lebih hemat':'upgrade'),item:ui.message(key)}), 'model');return}roomFlow.pack={...roomFlow.pack,...result};say(ui.message("{newItem} menggantikan {oldItem}. Total baru {total}, sisa budget {left}.", {newItem:result.to.name,oldItem:result.from.name,total:cardPrice(result.total),left:cardPrice(result.remaining)}),'model');renderRoomPackage('Perubahan hanya diterapkan pada produk yang diminta; produk lain tetap dipertahankan.');}
async function roomSwap(key,say=bubble){const products=await catalogPromise,engine=window.NayaRoomEngine.create(products,catalogPrice);let result=engine.replacement(roomFlow.pack,key,'upgrade',roomFlow.budget);if(!result.ok)result=engine.replacement(roomFlow.pack,key,'cheaper',roomFlow.budget);if(!result.ok){say(ui.message("Belum ada alternatif {item} lain dalam budget tanpa menduplikasi produk paket, Kak.", {item:ui.message(key)}),'model');return}roomFlow.pack={...roomFlow.pack,...result};say(ui.message("{newItem} menggantikan {oldItem}. Total baru {total}, sisa budget {left}.", {newItem:result.to.name,oldItem:result.from.name,total:cardPrice(result.total),left:cardPrice(result.remaining)}),'model');renderRoomPackage('Perubahan hanya diterapkan pada produk yang diminta; produk lain tetap dipertahankan.');}
async function roomAdd(key,say=bubble){const products=await catalogPromise,engine=window.NayaRoomEngine.create(products,catalogPrice);const result=engine.add(roomFlow.pack,key,roomFlow.budget);if(!result.ok){say(ui.message("Belum ada tambahan {item} yang masuk budget, Kak. Paketnya tetap sama.", {item:ui.message(key)}),'model');return}roomFlow.pack={...roomFlow.pack,...result};say(ui.message("{name} ditambahkan. Total baru {total}, sisa budget {left}.", {name:result.added.name,total:cardPrice(result.total),left:cardPrice(result.remaining)}),'model');renderRoomPackage('Produk tambahan dipilih dari katalog lokal dan totalnya tetap tidak melewati budget.');}
function beginRoomFlow(say=bubble){roomFlow.active=true;roomFlow.stage='room';salesContext.roomStep=true;say('Kita mulai dari ruangannya dulu, Kak.');const guide=document.createElement('section');guide.className='workspace-room-guide';guide.innerHTML='<p>BUILD MY ROOM</p><h2><!--naya-copy:Ruang mana yang ingin ditata?-->Ruang mana yang ingin ditata?</h2><div><button data-room="Ruang Tamu"><!--naya-copy:Ruang Tamu-->Ruang Tamu</button><button data-room="Kamar Tidur"><!--naya-copy:Kamar Tidur-->Kamar Tidur</button><button data-room="Ruang Makan"><!--naya-copy:Ruang Makan-->Ruang Makan</button><button data-room="Ruang Kerja"><!--naya-copy:Ruang Kerja-->Ruang Kerja</button></div><small><!--naya-copy:Setelah itu Naya akan minta ukuran, budget, dan preference.-->Setelah itu Naya akan minta ukuran, budget, dan preference.</small>';guide.querySelectorAll('[data-room]').forEach(button=>button.onclick=()=>ask(button.dataset.room,{action:true}));showWorkspace('buildMyRoom',guide);setQuickActions([{label:'Ruang Tamu',intent:'Ruang Tamu'},{label:'Kamar Tidur',intent:'Kamar Tidur'},{label:'Ruang Makan',intent:'Ruang Makan'},{label:'Ruang Kerja',intent:'Ruang Kerja'}])}
async function handleRoomFlow(message,products,say=bubble){
 const lower=normalise(message),engine=window.NayaRoomEngine;
 if(!roomFlow.active)return false;
 if(/\b(stok|stock|ready|tersedia|availability)\b/.test(lower)){say('Stok cabang belum bisa aku pastikan, Kak. Aku bisa bantu bandingkan pilihan yang ada di katalog.','model');return true}
 if(roomFlow.pack){
   const newBudget=engine.parseBudget(message);if(newBudget&&/\b(budget|naik|jadi|juta|jt|rp)\b/.test(lower)){roomFlow.budget=newBudget;makeRoomPackage(products,'Budget diperbarui; konteks ruangan, ukuran, dan preference tetap aku pakai.',say);return true}
   const size=engine.parseSize(message);if(size){roomFlow.size=size;makeRoomPackage(products,'Ukuran ruangan diperbarui; paket aku optimalkan lagi tanpa menghapus konteksnya.',say);return true}
   if(/\blebih hemat\b/.test(lower)){await roomReplacement('sofa','cheaper',say);return true}
   if(/\bupgrade\b/.test(lower)){await roomReplacement('sofa','upgrade',say);return true}
   const replace=lower.match(/\b(ganti|kurang suka|cari)\s+(sofa|meja|lampu|dekorasi)(?:nya)?\b/);if(replace){if(/\blebih murah\b/.test(lower))await roomReplacement(replace[2],'cheaper',say);else await roomSwap(replace[2],say);return true}
   const add=lower.match(/\btambah(?:kan)?\s+(?:satu\s+)?(lampu|dekorasi|kursi)/);if(add){await roomAdd(add[1],say);return true}
   if(/\btambahkan semua ke keranjang\b/.test(lower)){roomAction('all',say);return true}
 }
 if(roomFlow.stage==='room'){const room=engine.parseRoom(message);if(!room){say('Aku perlu jenis ruangannya dulu, Kak: Ruang Tamu, Kamar Tidur, Ruang Makan, atau Ruang Kerja.','model');return true}roomFlow.room=room;roomFlow.stage='size';say(ui.message("Aku catat ruangannya: {room}. Berapa ukurannya? Contoh: 3 × 4 m atau 12 meter persegi.", {room:ui.message(room)}),'model');return true}
 if(roomFlow.stage==='size'){const size=engine.parseSize(message);if(!size){say('Ukuran ruangannya belum terbaca, Kak. Coba tulis seperti 3x4, panjang 4 meter lebar 3, atau 12 meter persegi.','model');return true}roomFlow.size=size;roomFlow.stage='budget';say(ui.message("Ukuran {size} aku catat. Berapa budget maksimalnya, Kak?", {size:size.label}),'model');return true}
 if(roomFlow.stage==='budget'){const budget=engine.parseBudget(message);if(!budget){say('Budgetnya belum terbaca, Kak. Bisa tulis misalnya 20 juta, 15jt, atau Rp20.000.000.','model');return true}roomFlow.budget=budget;roomFlow.stage='style';say(ui.message("Budget batasnya {budget}. Kak lebih suka gaya Minimalis, Modern, Japandi, Scandinavian, Classic, atau Luxury?", {budget:cardPrice(budget)}),`model`);return true}
 if(roomFlow.stage==='style'){const style=engine.parseStyle(message);roomFlow.style=style||message.trim().slice(0,40);roomFlow.stage='priority';say(ui.message("Gaya {style} aku catat. Apa prioritas untuk ruang ini, Kak? Misalnya tempat duduk, penyimpanan, atau ruang yang terasa lega.", {style:ui.message(roomFlow.style)}),`model`);return true}
 if(roomFlow.stage==='priority'){roomFlow.priority=message.trim().slice(0,100);roomFlow.stage='result';makeRoomPackage(products,'',say);return true}
 return false;
}
async function handleSalesLogic(message,replyLocale,customerGreeting=''){
 const session=chatSession;
 const say=(text,role='model')=>{
  if(session!==chatSession)return;
  const reply=customerGreeting?ui.message('Senang berkenalan, {name}! {reply}',{name:customerGreeting,reply:localReply(text)}):text;
  customerGreeting='';
  bubble(reply,role,replyLocale);
 };
 const engine=window.NayaRoomEngine;
 const concierge=engine.conciergeIntent(message);
 if(concierge){
  say(ui.conciergeMessage(concierge),'model');
  return true;
 }
 const lower=normalise(engine.normalizeCatalogQuery(message)),products=await catalogPromise;
 if(session!==chatSession)return true;
 const requests=engine.catalogIntents(message);
 const [direct]=requests;
 if(engine.isProductLinkRequest(message)){
  const matched=engine.mentionedProducts(message,products);
  const refs=(matched.length?matched:salesContext.lastResults).filter(item=>item.url);
  say(refs.length?'Ini referensi resmi produknya, Kak. Buka tautan di kartu di bawah ini.':'Sebutkan nama produk atau SKU-nya, Kak. Aku bantu tampilkan tautan resminya.');
  appendProductCards(refs);
  return true;
 }
 if(/^(?:siapa (?:kamu|anda|naya)|who (?:are you|is naya)|are you (?:an ai|a bot|human)|apakah kamu (?:ai|bot|manusia))$/.test(lower)){
  say('Aku Naya, Sales Assistant di INFORMA Sun City Mall Sidoarjo. Ada yang bisa aku bantu pilihkan, Kak?');
  return true;
 }
 if(/\b(tidak jadi|nggak jadi|batal|nanti saja|selesai belanja|tidak lanjut|finish shopping|maybe later|never mind)\b/.test(lower)){say(salesUiConfig.closingCopy,'model');return true}
 const finalDraft=window.informaOrderDraft.draft();if(['ready_for_handoff','handed_off'].includes(finalDraft?.status)&&/\b(ganti|ubah|hapus|tambah)\b/.test(lower)){say(ui.message("Draft {code} sudah final. Untuk mengubahnya, batalkan draft, edit keranjang, lalu konfirmasi ulang.", {code:finalDraft.orderCode}),'model');return true}if(['ready_for_handoff','handed_off'].includes(finalDraft?.status)&&/\b(pesanan saya|pesanan|order)\b/.test(lower)){say(ui.message("Pesanan {code} {status}. Total {total} untuk {count} produk. Batalkan draft sebelum mengubah keranjang.", {status:ui.message(finalDraft.status==='handed_off'?'sudah diteruskan ke sales':'siap diteruskan'),code:finalDraft.orderCode,count:finalDraft.items.length,total:cardPrice(finalDraft.grandTotal)}),'model');return true}
 if(/\b(checkout|check out|prepare order|jadi beli|lanjut pesanan|pesan sekarang|proses pesanan)\b/.test(lower)){if(!window.informaCart.snapshot().items.length){say('Keranjang Naya Kak masih kosong. Pilih produknya dulu ya, nanti aku bantu lanjut sampai pesanan siap diproses.','model');return true}say('Baik Kak, sebelum aku teruskan ke tim sales, boleh isi data pengiriman dulu ya.','model');cartDialog.showModal();checkoutView();return true}
 if(cartClearPending){if(/^(ya|iya|hapus|konfirmasi|yes|confirm)$/i.test(lower)){window.informaCart.clear();cartClearPending=false;say('Keranjang sudah dikosongkan. Naya tetap siap bantu lanjut pilih produk, Kak.','model');return true}cartClearPending=false}
 if(/\b(keranjang.*(apa saja|isi|detail)|apa saja.*(pilih|keranjang))\b/.test(lower)){say(cartText(true),'model');return true}
 if(/\b(kosongkan keranjang|hapus semuanya|clear cart|clear my cart)\b/.test(lower)){if(!window.informaCart.snapshot().items.length){say('Keranjang Kakak memang masih kosong.','model');return true}cartClearPending=true;say('Yakin ingin mengosongkan seluruh keranjang? Balas “ya” untuk konfirmasi. Ini tidak menghapus percakapan atau data Naya.','model');return true}
 if(/\bhapus (sofa|meja|lampu|karpet)\b/.test(lower)){const keyword=lower.match(/\bhapus (sofa|meja|lampu|karpet)\b/)[1],matches=window.informaCart.list().filter(item=>normalise(item.name).includes(keyword));if(matches.length!==1){say(matches.length?'Ada beberapa pilihan yang cocok. Sebutkan nama produknya supaya tidak salah hapus, ya Kak.':'Produk itu belum ada di keranjang, Kak.','model');return true}window.informaCart.remove(matches[0].sku);say(ui.message("{name} dihapus dari keranjang. {summary}", {name:matches[0].name,summary:cartText()}),'model');return true}
 const desk=requests.find(request=>request.type==='desk');
 const deskUnavailable=desk&&!products.some(product=>desk.match.test(normalise(product.name)));
 if(deskUnavailable&&requests.length===1){
  say('Katalog belum memuat meja komputer untuk ruang kerja. Mau lihat pilihan penyimpanan atau pencahayaan untuk melengkapi ruangnya?','model');
  return true;
 }
 // A concrete product request takes precedence over the wizard's pending question.
 const allowRoomFlow=requests.length<2&&(!['kitchen','office furniture'].includes(direct?.type)||/^ruang kerja$|^home office$/.test(lower))&&(!direct || !direct.type || roomFlow.pack || !/\b(cari|looking|need|want|butuh|ingin|show|find|desk|computer|meja kerja|meja komputer)\b/.test(lower));
 if(roomFlow.active&&allowRoomFlow&&await handleRoomFlow(message,products,say))return true;
 const addMatch=lower.match(/\btambah(?:kan)?\s+(yang\s+)?(pertama|kedua|ketiga|keempat|\d+)\b/);
 if(addMatch){const positions={pertama:0,kedua:1,ketiga:2,keempat:3};const index=positions[addMatch[2]]??Number(addMatch[2])-1;const product=salesContext.lastResults[index];if(!product){say('Pilihan itu belum ada di rekomendasi terakhir, Kak. Aku bisa carikan produknya dulu.','model');return true}const count=addToCart(product);say(ui.message("{name} sudah masuk keranjang, Kak. Jumlahnya {count}.", {name:product.name,count}),'model');return true}
 if(/\b(stok|stock|ready|tersedia|availability)\b/.test(lower)&&!/\b(price|harga|cost)\b/.test(lower)){say('Aku belum bisa memastikan stok cabang, Kak. Sebutkan produknya dan aku bantu cek detail di katalog.','model');return true}
 if(/\b(bandingkan|perbandingkan)\b/.test(lower)){const found=[...lower.matchAll(/\b(pertama|kedua|ketiga|keempat|\d+)\b/g)].map(match=>({pertama:0,kedua:1,ketiga:2,keempat:3}[match[1]]??Number(match[1])-1)).filter(index=>salesContext.lastResults[index]);const picks=[...new Set(found)].map(index=>salesContext.lastResults[index]);if(picks.length<2){say('Pilih dua produk dari rekomendasi terakhir untuk dibandingkan, Kak.','model');return true}renderComparison(picks,say);return true}
 if(/\b(build my room)\b/i.test(message)){beginRoomFlow(say);return true}
 const budgetOnly=extractBudget(lower)&&/\b(budget|anggaran)\b/.test(lower)&&!requestedCategory(lower)&&!direct;
 if(budgetOnly){salesContext.budgetMax=extractBudget(lower);say(ui.message("Aku catat budget {budget}. Kak mencari sofa, meja, kursi, atau penyimpanan?", {budget:cardPrice(salesContext.budgetMax)}),'model');return true}
 // Named pricing is answered against the authoritative SKU snapshot on the API.
 if(/\b(price|pricing|how much|cost|harga|berapa harganya)\b/.test(lower))return false;
 if(!isProductRequest(message,direct))return false;
 if(/\b(minimalis|minimalist)\b/.test(lower)){say('Gaya minimalis belum tercantum sebagai atribut pada data produk di web ini, Kak. Aku bisa tetap carikan berdasarkan kategori, warna, atau budget yang Kak mau.','model');return true}
 const {results}=filterProducts(products,lower,requests);
 if(!results.length){if(/\b(lebih murah|lebih mahal|cheaper|lower price|higher priced)\b/.test(lower))say(ui.message("Belum ada pilihan {range} dari rekomendasi terakhir, Kak. Aku bisa cek kategori lain.", {range:ui.message(/murah|cheaper|lower price/.test(lower)?'yang lebih murah':'yang lebih mahal')}),'model');else if(/\b(lebih kecil|ukuran kecil|smaller)\b/.test(lower))say('Ukuran yang cukup untuk membandingkan pilihan lebih kecil belum tercantum pada rekomendasi terakhir, Kak. Aku tidak mau menebak ukurannya.','model');else unavailable(say);return true}
 salesContext.lastResults=results;
 const reply=ui.message('Aku menemukan {count} pilihan di katalog. Ini hasilnya:',{count:results.length});
 if(deskUnavailable)say('Katalog belum memuat meja komputer. Ini pilihan lain yang sesuai dengan permintaan Kak.');
 else if(requests.length===1&&direct?.type==='kitchen')say('Untuk kebutuhan dapur, ini pilihan yang bisa Kakak lihat.');
 else if(direct?.type==='office furniture')say('Untuk ruang kerja, ini beberapa pilihan yang bisa Kakak lihat.');
 else say(reply);
 appendProductCards(results);
 return true;
}
function saveLocalTurn(message,locale=ui.locale){
 const response=workspaceState.turns.findLast(turn=>turn.type==='response');
 const replies=response?[{role:'model',text:replyText(response.text)}]:[];
 history=[...history,{role:'user',text:ui.format(message,locale)},...replies].slice(-14);
}
const intentReplies=Object.freeze({
 'Ruang Tamu':'Aku catat ruang tamu. Kak lebih mengutamakan sofa, meja tamu, atau penyimpanan?',
 'Kamar Tidur':'Untuk kamar tidur, Kak ingin mulai dari tempat tidur, nakas, atau pencahayaan?',
 'Ruang Makan':'Untuk ruang makan, Kak sedang cari meja, kursi, atau keduanya?',
 'Ruang Kerja':'Aku bantu arahkan pilihan untuk ruang kerja. Kak membutuhkan penyimpanan atau furnitur utama dulu?',
 'Cari Produk':'Aku bisa carikan dari 30 produk di katalog. Kak sedang mencari jenis barang tertentu atau sudah punya budget?',
 'Lihat Katalog':'Katalog produk siap dibuka. Kak juga bisa sebutkan kategori atau budget supaya aku carikan yang relevan.',
});
async function handleIntent(intent){
 if(sending)return;
 awaitingName=false;
 if(roomFlow.active&&roomFlow.stage==='room'&&window.NayaRoomEngine.parseRoom(intent))return ask(intent,{action:true});
 if(intent==='Build My Room'){
  await handleSalesLogic(intent);
  saveLocalTurn(intent);
  return;
 }
 if(/^(Lebih Murah|Bandingkan produk pertama dan kedua|Tambah yang pertama|Tambah yang kedua|Tambahkan semua ke keranjang|Ganti sofa|Upgrade|Proses Pesanan)$/i.test(intent))return ask(intent,{action:true});
 if(intent==='Lihat Katalog')document.querySelector('[data-open="room"]')?.click();
 const key=intent==='Bantu Saya Memilih'?'Ceritakan ruang, budget, atau produk yang sedang Kak cari.':
  intent==='Cari produk lain'?'Siap, Kak. Sebutkan produk, warna, atau budget yang ingin dicari.':
  intentReplies[intent]||'Kak ingin mencari kebutuhan apa?';
 recordCustomerRequest(ui.message(intent));
 const response=ui.message(key);
 bubble(response,'model');
 history=[...history,{role:'user',text:ui.text(intent)},{role:'model',text:ui.format(response)}].slice(-14);
 input.focus();
}
async function ask(text,{action=false}={}){
 if(sending||!text.trim())return;
 const message=text.trim(),session=chatSession;
 const engine=window.NayaRoomEngine;
 let language=action?ui.locale:ui.detectChatLanguage(message,ui.locale);
 let locale=language==='auto'?ui.locale:language;
 const visibleMessage=action?ui.message(message):message;
 input.value='';sending=true;send.disabled=true;
 recordCustomerRequest(visibleMessage);
 log.setAttribute('aria-busy','true');
 try{
  const {name,query}=action||language==='auto'?{}:engine.introductionWithQuery(message,{allowBare:awaitingName&&!nayaName,hasName:Boolean(nayaName)});
  awaitingName=false;
  let searchMessage=message,customerGreeting='';
  if(name&&!engine.mentionedProducts(name,await catalogPromise.catch(()=>[])).length){
   if(session!==chatSession)return;
   rememberCustomerName(name);
   const titled=/^(?:Mr\.?|Mrs\.?|Ms\.?|Mx\.?|Dr\.?|Kak|Pak|Bu|Bapak|Ibu)\s/i.test(name);
   const salutation=titled?name:ui.message('Kak {name}',{name});
   if(!query){
    bubble(ui.message('Senang berkenalan, {name}! Apa kabar hari ini? Ada kebutuhan ruangan atau furnitur yang bisa saya bantu carikan?',{name:salutation}),'model',locale);
    saveLocalTurn(visibleMessage,locale);
    return;
   }
   searchMessage=query;
   customerGreeting=salutation;
   language=ui.detectChatLanguage(query,locale);
   if(language!=='auto')locale=language;
  }
  const handled=language!=='auto'&&await handleSalesLogic(searchMessage,action?undefined:locale,customerGreeting);
  if(session!==chatSession)return;
  if(handled){
   saveLocalTurn(visibleMessage,locale);
   return;
  }
  const request=[...history,{role:'user',text:ui.format(visibleMessage,locale)}].slice(-15);
  const res=await fetch('/api/chat',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({messages:request,customerName:nayaName,locale,productSkus:salesContext.lastResults.map(item=>item.sku)}),
   signal:AbortSignal.timeout(40000),
  });
  const data=await res.json();
  if(session!==chatSession)return;
  if(!res.ok||typeof data.text!=='string')throw new Error('CHAT_UNAVAILABLE');
  const catalog=await catalogPromise;
  const replyLocale=['en','id','auto'].includes(data.replyLocale)?data.replyLocale:language;
  if(!ui.acceptsReply(data.text,replyLocale,catalog))throw new Error('CHAT_LANGUAGE_MISMATCH');
  bubble({reply:data.text,locale:replyLocale},'model');
  const mentioned=window.NayaRoomEngine.mentionedProducts(data.text,catalog);
  const skus=new Set(Array.isArray(data.products)?data.products.map(item=>item?.sku):[]);
  appendProductCards([...new Set([...catalog.filter(item=>skus.has(item.sku)),...mentioned])]);
  history=[...request,{role:'model',text:data.text}].slice(-14);
 }catch{
  if(session===chatSession)bubble(ui.conciergeMessage(window.NayaRoomEngine.conciergeIntent(message)),'model',action?undefined:locale);
 }finally{
  if(session===chatSession){sending=false;send.disabled=false;log.setAttribute('aria-busy','false');input.focus()}
 }
}
document.querySelector('#chatForm').onsubmit=e=>{e.preventDefault();ask(input.value)};
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input.value)}});
workspaceActions.onclick=event=>{
 const button=event.target.closest('button[data-intent]');
 if(button)return handleIntent(button.dataset.intent);
};
const cartDialog=document.querySelector('#cartDialog'),cartContent=document.querySelector('#cartContent'),cartCount=document.querySelector('#cartCount');
function syncSavedCartNotice(cart){
 if(!cart.items.length)savedCartOnWelcome=false;
 savedCartNotice.hidden=!savedCartOnWelcome;
 if(!savedCartOnWelcome)return;
 const key=cart.quantity===1?'Ada 1 produk tersimpan':'Ada {count} produk tersimpan';
 ui.bindText(savedCartCount,key,{count:cart.quantity});
}
function returnToNaya(){
 cartDialog.close();
 if(greetingSplash.hidden)showChat();
 else dismissGreetingSplash(()=>{
  document.querySelector('#enterExperience').click();
  showChat();
 });
}
function renderCartItems(cart){
 const section=cartContent.querySelector('#cartItems');
 const form=cartContent.querySelector('#checkoutForm');
 const oldButtons=[...section.querySelectorAll('button')];
 const focusIndex=oldButtons.indexOf(document.activeElement);
 form.hidden=!cart.items.length;
 section.innerHTML=cart.items.length?`
  <header class="naya-cart-intro">
   <h3 id="cartItemsTitle">${ui.label('Daftar Barang')}</h3>
   <button id="clearCart" type="button">${ui.label('Kosongkan')}</button>
  </header>
  <div class="cart-lines">${cart.items.map(item=>`
   <article class="cart-line">
    <img src="${invoiceEscape(item.image)}" alt="">
    <div class="cart-line-details">
     <b>${invoiceEscape(item.name)}</b>
     <small>SKU ${invoiceEscape(item.sku)} · ${ui.label('Harga satuan')} ${cardPrice(item.unitPrice)}</small>
     <div class="cart-quantity" role="group" aria-label="${invoiceEscape(item.name)}">
      <button type="button" data-cart-minus="${invoiceEscape(item.sku)}" ${ui.attribute('aria-label','Kurangi')}>−</button>
      <span>${item.quantity}</span>
      <button type="button" data-cart-plus="${invoiceEscape(item.sku)}" ${ui.attribute('aria-label','Tambah jumlah')}>+</button>
      <button type="button" data-cart-remove="${invoiceEscape(item.sku)}">${ui.label('Hapus')}</button>
     </div>
     <strong>${cardPrice(item.subtotal)}</strong>
    </div>
   </article>`).join('')}</div>
  <div class="cart-total" aria-live="polite"><span>${ui.label('Total Keranjang Naya')}</span><b>${cardPrice(cart.total)}</b></div>
  <div class="cart-edit-actions">
   <button id="addMoreItems" type="button" class="cart-browse">${ui.label('+ Tambah Barang Lagi')}</button>
  </div>`:`
  <div class="cart-empty">
   <h3 id="cartItemsTitle">${ui.label('Keranjang Naya masih kosong')}</h3>
   <p>${ui.label('Naya siap bantu carikan produk atau menyusun kebutuhan ruangan.')}</p>
   <button id="browseCartProducts" type="button" class="cart-browse">${ui.label('Cari Barang dengan Naya')}</button>
  </div>`;
 if(focusIndex>=0){
  const buttons=section.querySelectorAll('button');
  buttons[Math.min(focusIndex,buttons.length-1)].focus({preventScroll:true});
 }
}
function checkoutView(){
 const order=window.informaOrderDraft;
 const draft=order.draft();
 if(['ready_for_handoff','handed_off'].includes(draft?.status))return renderHandoffState(draft);
 const saved=order.form(nayaName);
 cartContent.innerHTML=`
  <section id="cartItems" aria-labelledby="cartItemsTitle"></section>
  <form id="checkoutForm" class="checkout-form">
   <h3>${ui.label('Data untuk tim sales')}</h3>
   <p class="checkout-guidance">${ui.label('Sebelum Naya teruskan, isi data pengiriman Kakak dulu ya.')}</p>
   <label>${ui.label('Nama')}<input name="name" required value="${invoiceEscape(saved.name)}"></label>
   <label>${ui.label('Nomor WhatsApp')}<input name="whatsApp" inputmode="tel" required value="${invoiceEscape(saved.whatsApp)}" placeholder="081234567890"></label>
   <fieldset>
    <legend>${ui.label('Penerimaan')}</legend>
    <label><input type="radio" name="delivery" value="delivery" ${(saved.delivery||'delivery')==='delivery'?'checked':''}> ${ui.label('Dikirim')}</label>
    <label><input type="radio" name="delivery" value="pickup" ${saved.delivery==='pickup'?'checked':''}> ${ui.label('Ambil di Store')}</label>
   </fieldset>
   <label id="addressField">${ui.label('Alamat pengiriman')}<textarea name="address">${invoiceEscape(saved.address)}</textarea></label>
   <label>${ui.label('Catatan')} <small>${ui.label('(opsional)')}</small><textarea name="note">${invoiceEscape(saved.note)}</textarea></label>
   <p class="checkout-error" role="alert"></p>
   <button type="submit">${ui.label('Lanjutkan')}</button>
  </form>`;
 const cart=window.informaCart;
 const section=cartContent.querySelector('#cartItems');
 const form=cartContent.querySelector('#checkoutForm');
 const address=form.querySelector('#addressField');
 const syncDelivery=()=>{address.hidden=form.elements.delivery.value==='pickup'};
 const saveDetails=()=>{
  const data=Object.fromEntries(new FormData(form));
  order.saveForm(data);
  return data;
 };
 section.onclick=event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const {cartMinus,cartPlus,cartRemove}=button.dataset;
  if(cartPlus)cart.add(cartPlus);
  else if(cartMinus){
   const item=cart.get(cartMinus);
   if(item)cart.set(cartMinus,item.quantity-1);
  }else if(cartRemove)cart.remove(cartRemove);
  else if(button.id==='addMoreItems'||button.id==='browseCartProducts'){
   if(!form.hidden)saveDetails();
   returnToNaya();
  }else if(button.id==='clearCart'){
   cart.reset();
  }
 };
 syncDelivery();
 form.oninput=()=>{
  syncDelivery();
  saveDetails();
 };
 form.onsubmit=event=>{
  event.preventDefault();
  const data=saveDetails();
  const check=order.validate(data,cart.snapshot());
  if(check.error){
   ui.bindText(form.querySelector('.checkout-error'),check.error);
   return;
  }
  bubble('Siap Kak. Ini ringkasan pesanan sebelum aku teruskan ke tim sales.','model');
  reviewCheckout(data);
 };
 renderCartItems(cart.snapshot());
 cartDialog.scrollTop=0;
}
const invoiceEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
})[char]);
function invoiceDetails(invoice){
 const pickup=invoice.deliveryMethod==='pickup';
 const items=invoice.items.map(item=>`<article class="review-product">
  <img src="${invoiceEscape(item.productImage)}" alt="">
  <span><strong>${invoiceEscape(item.productName)}</strong><small>SKU ${invoiceEscape(item.sku)}</small><small>${item.quantity} × ${cardPrice(item.unitPrice)}</small></span>
  <b>${cardPrice(item.itemSubtotal)}</b>
 </article>`).join('');
 return `<dl class="invoice-details">
  ${invoice.orderCode?`<div><dt>${ui.label('Referensi invoice')}</dt><dd>${invoiceEscape(invoice.orderCode)}</dd></div>`:''}
  <div><dt>${ui.label('Nama pelanggan')}</dt><dd>${invoiceEscape(invoice.customerName)}</dd></div>
  <div><dt>${ui.label('Nomor WhatsApp')}</dt><dd>${invoiceEscape(invoice.customerWhatsApp)}</dd></div>
  <div><dt>${ui.label('Penerimaan')}</dt><dd>${ui.label(pickup?'Ambil di Store':'Dikirim')}</dd></div>
  ${pickup?'':`<div><dt>${ui.label('Alamat pengiriman')}</dt><dd>${invoiceEscape(invoice.address)}</dd></div>`}
 </dl>
 <div class="invoice-items">${items}</div>
 <div class="invoice-total"><strong>${ui.label('Total pesanan')}</strong><b>${cardPrice(invoice.grandTotal)}</b></div>`;
}
function printInvoice(draft){
 const sheet=document.createElement('article');
 sheet.className='invoice-print';
 sheet.lang=ui.locale;
 sheet.innerHTML=`
  <div class="invoice-print-heading">
   <p>INFORMA Sun City Mall Sidoarjo</p>
   <h1>${ui.label('Invoice / Ringkasan Pesanan')}</h1>
  </div>
  ${invoiceDetails(draft)}
  <small>${ui.label('Stok dan harga final akan dikonfirmasi oleh tim sales.')}</small>`;
 const originalTitle=document.title;
 const restore=()=>{
  document.title=originalTitle;
  sheet.remove();
 };
 document.body.append(sheet);
 document.title=draft.orderCode;
 window.addEventListener('afterprint',restore,{once:true});
 try{
  window.print();
 }catch(error){
  window.removeEventListener('afterprint',restore);
  restore();
  throw error;
 }
}
function reviewCheckout(data){
 const cart=window.informaCart.snapshot();
 const preview={
  customerName:data.name,customerWhatsApp:window.informaOrderDraft.normalizeWhatsApp(data.whatsApp),
  deliveryMethod:data.delivery,address:data.address,grandTotal:cart.total,
  items:cart.items.map(item=>({productName:item.name,productImage:item.image,sku:item.sku,
   quantity:item.quantity,unitPrice:item.unitPrice,itemSubtotal:item.subtotal})),
 };
 cartContent.innerHTML=`<section class="order-review">
  <h3>${ui.label('Pesanan sebelum diteruskan')}</h3>
  ${invoiceDetails(preview)}
  <small class="review-disclaimer">${ui.label('Stok dan harga final akan dikonfirmasi oleh tim sales.')}</small>
  <button id="editCheckout">${ui.label('Edit')}</button>
  <button id="confirmOrder">${ui.label('Konfirmasi Pesanan')}</button>
  <p class="checkout-error" role="alert"></p>
 </section>`;
 cartDialog.scrollTop=0;
 cartContent.querySelector('#editCheckout').onclick=()=>checkoutView();
 cartContent.querySelector('#confirmOrder').onclick=event=>{
  event.currentTarget.disabled=true;
  const draft=window.informaOrderDraft.finalize(data,window.informaCart.snapshot());
  if(draft.error){
   ui.bindText(cartContent.querySelector('.checkout-error'),draft.error);
   event.currentTarget.disabled=false;
   return;
  }
  renderHandoffState(draft);
  bubble(ui.message('Ringkasan pesanan {code} siap diteruskan untuk konfirmasi stok, harga final, pembayaran, dan pengiriman.',{code:draft.orderCode}),'model');
 };
}
function startFreshShopping(){
 chatSession++;
 if(cartDialog.open)cartDialog.close();
 cartContent.replaceChildren();
 window.informaOrderDraft.resetSession();
 window.informaCart.reset();
 clearTimeout(autoGreetTimer);
 autoGreetTimer=0;
 history=[];
 rememberCustomerName('');
 awaitingName=true;
 nayaOpened=false;
 sending=false;
 splashSending=false;
 cartClearPending=false;
 Object.assign(workspaceState,{view:'idle',comparison:[],lastIntent:'',lastRequest:'',turns:[],mode:'interactive'});
 Object.assign(salesContext,{budgetMax:null,budgetMin:null,productRequests:[],lastResults:[],roomStep:false});
 Object.assign(roomFlow,{active:false,stage:'',room:'',size:null,budget:null,style:'',priority:'',pack:null,addedSignature:''});
 log.replaceChildren();
 log.setAttribute('aria-busy','false');
 syncAgentResponse();
 document.querySelector('#chatQuickActions').hidden=true;
 input.value='';
 input.placeholder=ui.text('Ceritakan kebutuhan Kak…');
 send.disabled=false;
 splashInput.value='';
 splashInput.disabled=false;
 splashForm.querySelector('button').disabled=false;
 updateChatMode();
 chat.hidden=true;
 document.querySelector('#chatLauncher').hidden=false;
 if(entered)document.querySelector('.back-opening').click();
 greetingSplash.classList.remove('is-leaving');
 showGreetingSplash();
 splashInput.focus();
}
 function startAdditionalShopping(){const context=window.informaOrderDraft.startAdditional();if(context.error){bubble(context.error,'model');return}window.informaCart.reset();cartDialog.close();showChat();document.querySelector('#chatQuickActions').hidden=false;bubble(ui.message("Aku bantu buat tambahan pesanan, Kak. Pilihan berikutnya dicatat terpisah dari pesanan sebelumnya."),'model');input.focus()}
function syncInvoiceWhatsAppLink(){
 const link=cartContent.querySelector('#handoffSales');
 if(!link)return;
 const receipt=cartContent.querySelector('#receiptReady');
 const url=receipt.checked?window.informaWhatsAppHandoff.buildWhatsAppHandoffUrl(
  window.informaOrderDraft.draft(),window.INFORMA_SALES_CONFIG?.SALES_WHATSAPP_NUMBER,
  {locale:ui.locale,receiptReady:true},
 ):'';
 link.setAttribute('aria-disabled',String(!url));
 if(url)link.href=url;
 else link.removeAttribute('href');
}
function renderHandoffState(draft){
 const handed=draft.status==='handed_off';
 cartContent.innerHTML=`<section class="order-review invoice-summary">
  <h3>${ui.label('Invoice / Ringkasan Pesanan')}</h3>
  ${invoiceDetails(draft)}
  <small class="review-disclaimer">${ui.label('Untuk konfirmasi, kirim pesan yang sudah disiapkan lalu lampirkan tangkapan layar bukti pembayaran langsung di WhatsApp.')}</small>
  <div class="handoff-actions">${handed
   ? `<p>${ui.label('WhatsApp sudah dibuka, Kak. Lampirkan bukti pembayaran lalu tekan Kirim agar tim bisa memeriksanya.')}</p>
      <button type="button" id="addOrder" class="invoice-button invoice-secondary">${ui.label('Tambah Pesanan')}</button>
      <button type="button" id="finishOrder" class="invoice-button">${ui.label('Selesai Belanja')}</button>`
   : `<label class="receipt-confirmation"><input id="receiptReady" type="checkbox"> ${ui.label('Saya sudah membayar dan siap melampirkan bukti pembayaran.')}</label>
      <a id="handoffSales" class="invoice-button" role="link" target="_blank" rel="noopener noreferrer" aria-disabled="true">${ui.label('Buka WhatsApp untuk Konfirmasi Pembayaran')}</a>
      <p class="checkout-error" role="alert"></p>`
  }</div>
  <button id="copyOrderSummary" type="button" class="invoice-button invoice-secondary">${ui.label('Salin Ringkasan Pesanan')}</button>
  <button id="printOrderInvoice" type="button" class="invoice-button invoice-secondary">${ui.label('Simpan / Cetak Invoice')}</button>
  <p class="invoice-copy-status" role="status"></p>
  ${handed?'':`<button id="editInvoiceCart" type="button" class="invoice-button invoice-secondary">${ui.label('Ubah Pesanan')}</button>`}
 </section>`;
 cartDialog.scrollTop=0;
 cartContent.querySelector('#printOrderInvoice').onclick=()=>printInvoice(draft);
 const receipt=cartContent.querySelector('#receiptReady');
 const copyStatus=cartContent.querySelector('.invoice-copy-status');
 cartContent.querySelector('#copyOrderSummary').onclick=async()=>{
  const summary=window.informaWhatsAppHandoff.formatOrderSummary(draft,{
   locale:ui.locale,receiptReady:handed||receipt?.checked,
  });
  try{
   await navigator.clipboard.writeText(summary);
   ui.bindText(copyStatus,'Ringkasan pesanan disalin.');
  }catch{
   ui.bindText(copyStatus,'Ringkasan pesanan belum bisa disalin. Izinkan akses clipboard lalu coba lagi.');
  }
 };
 if(handed){
  cartContent.querySelector('#addOrder').onclick=startAdditionalShopping;
  cartContent.querySelector('#finishOrder').onclick=startFreshShopping;
  return;
 }
 const link=cartContent.querySelector('#handoffSales');
 cartContent.querySelector('#editInvoiceCart').onclick=()=>{
  if(window.informaOrderDraft.reopen(draft.orderCode))checkoutView();
 };
 const error=cartContent.querySelector('.checkout-error');
 if(!window.informaWhatsAppHandoff.salesNumber(window.INFORMA_SALES_CONFIG?.SALES_WHATSAPP_NUMBER)){
  ui.bindText(error,'Nomor WhatsApp sales demo belum dikonfigurasi.');
 }
 receipt.onchange=syncInvoiceWhatsAppLink;
 link.onclick=event=>{
  if(!receipt.checked||!link.hasAttribute('href')){
   event.preventDefault();
   return;
  }
  // Let the browser follow the anchor before replacing the invoice actions.
  setTimeout(()=>{
   if(!link.isConnected||window.informaOrderDraft.draft()?.orderCode!==draft.orderCode)return;
   const handedOff=window.informaOrderDraft.markHandedOff();
   if(handedOff.error){ui.bindText(error,handedOff.error);return}
   renderHandoffState(handedOff);
   bubble('WhatsApp sudah dibuka, Kak. Lampirkan bukti pembayaran lalu tekan Kirim agar tim bisa memeriksanya.','model');
  },0);
 };
}
document.querySelector('#cartLauncher').onclick=()=>{
 checkoutView();
 cartDialog.showModal();
};
document.querySelector('#cartClose').onclick=()=>cartDialog.close();
document.querySelector('#openSavedCart').onclick=()=>document.querySelector('#cartLauncher').click();
document.querySelector('#startNewOrder').onclick=startFreshShopping;
window.addEventListener('informa-cart-change',()=>{
 const cart=window.informaCart.snapshot();
 cartCount.textContent=cart.quantity;
 syncSavedCartNotice(cart);
 if(cartDialog.open&&cartContent.querySelector('#cartItems'))renderCartItems(cart);
});
