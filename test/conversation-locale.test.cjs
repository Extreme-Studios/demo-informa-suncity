const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const i18n = require('../i18n.js');
const catalog = require('../products.json');

const source = fs.readFileSync(path.join(__dirname,'../experience.js'),'utf8');
const chatSource = source.slice(source.indexOf('const chat=document.querySelector'));
const leak = /\b(?:kak|ruang tamu|kamar tidur|ruang makan|ruang kerja|aku perlu)\b/i;

class TestElement {
  constructor() {
    this.children = [];
    this.textContent = '';
    this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener() {}
  setAttribute() {}
  focus() {}
  querySelectorAll(selector) {
    if(selector==='.workspace-agent-response p'){
      return this.children.filter(node=>node.className==='workspace-agent-response').map(node=>node.children[1]);
    }
    return [];
  }
}

function chat(initialLocale='en', answer=async()=>{throw new Error('offline');}) {
  let locale = initialLocale;
  const events = new Map(), windowEvents = new Map(), elements = new Map(), payloads = [], session = new Map();
  const element = selector => {
    if(!elements.has(selector))elements.set(selector,new TestElement());
    return elements.get(selector);
  };
  const ui = {
    ...i18n,
    get locale(){return locale;},
    format(value,lang=locale){return i18n.format(value,lang);},
    text(key,values){return i18n.text(key,values,locale);},
    bindText(node,key,values){node.textContent=i18n.text(key,values,locale);},
  };
  const context = vm.createContext({
    ui,
    window:{
      NayaRoomEngine:require('../room-engine.js'),
      INFORMA_CATALOG:require('../catalog-data.js'),
      informaCart:{init(){},snapshot(){return {items:[],quantity:0,total:0};}},
      informaOrderDraft:{draft(){return null;}},
      addEventListener(type, callback){windowEvents.set(type,callback);},
      dispatchEvent(event){windowEvents.get(event.type)?.(event);},
    },
    document:{
      querySelector:element,
      createElement:()=>new TestElement(),
      addEventListener:(type,fn)=>events.set(type,fn),
    },
    setTimeout:()=>0,
    clearTimeout(){},
    requestAnimationFrame:()=>0,
    CustomEvent,
    sessionStorage:{
      getItem:key=>session.get(key)??null,
      setItem:(key,value)=>session.set(key,value),
      removeItem:key=>session.delete(key),
    },
    AbortSignal,
    fetch:async(url,options)=>{
      if(url==='/products.json')return {ok:true,json:async()=>catalog};
      payloads.push(JSON.parse(options.body));
      return answer();
    },
  });
  vm.runInContext(chatSource,context,{filename:'experience.js'});
  const run = script => vm.runInContext(script,context);
  return {
    run,payloads,element,session,
    choose(index){
      const actions=element('#chatQuickActions');
      return actions.onclick({target:{closest:()=>actions.children[index]}});
    },
    chooseIntent(intent){
      return element('#chatQuickActions').onclick({target:{closest:()=>({dataset:{intent}})}});
    },
    changeLocale(value){locale=value;events.get('naya:localechange')();},
    surfaces(){
      const sidebar=element('#agentResponse').textContent;
      const main=element('#chatLog').querySelectorAll('.workspace-agent-response p').at(-1)?.textContent;
      assert.equal(main,sidebar,'both surfaces must display the same reply');
      return main;
    },
  };
}

async function shoppingSession(locale,savedItems=[]){
  const agent=chat(locale);
  agent.run(String.raw`
    let entered=false;
    const setAgentSpatial=()=>{};
    const cartKey='informa-suncity-active-cart-v1';
    window.localStorage=(()=>{
      const data=new Map();
      return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
    })();
    window.sessionStorage=sessionStorage;
    window.crypto={randomUUID:()=> 'abcd1234-ab12-ab12-ab12-abcd1234abcd'};
    cartContent.querySelector=document.querySelector;
    splashForm.querySelector=document.querySelector;
    cartDialog.close=()=>{cartDialog.open=false};
    greetingSplash.hidden=true;
  `);
  if(savedItems.length){
    agent.run('window.localStorage.setItem(cartKey,JSON.stringify('+JSON.stringify(savedItems)+'))');
  }
  for(const file of ['cart-store.js','order-draft.js']){
    agent.run(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
  }
  await agent.run('catalogPromise');
  return agent;
}

test('saved cart notice stays hidden when the page loads empty and does not count freshly added items',async()=>{
  const agent=await shoppingSession('en');
  assert.equal(agent.element('#savedCartNotice').hidden,true);
  agent.run('window.informaCart.add("10701444")');
  assert.equal(agent.element('#savedCartNotice').hidden,true);
});

test('Start New Order clears the saved cart and invoice draft and hides the notice',async()=>{
  const agent=await shoppingSession('id',[{sku:'10701444',qty:2}]);
  assert.equal(agent.element('#savedCartNotice').hidden,false);
  assert.equal(agent.element('#savedCartCount').textContent,'Ada 2 produk tersimpan');
  agent.run(String.raw`
    const details={name:'Rina',whatsApp:'081234567891',delivery:'pickup'};
    window.informaOrderDraft.saveForm(details);
    window.informaOrderDraft.finalize(details,window.informaCart.snapshot());
  `);
  assert.ok(agent.run('window.informaOrderDraft.draft().orderCode'));
  agent.element('#startNewOrder').onclick();
  assert.equal(agent.run('window.localStorage.getItem(cartKey)'),null);
  assert.equal(agent.run('window.informaOrderDraft.draft()'),null);
  assert.equal(agent.run('Object.keys(window.informaOrderDraft.form()).length'),0);
  assert.equal(agent.element('#savedCartNotice').hidden,true);
  assert.equal(agent.element('#nayaGreetingSplash').hidden,false);
});

test('Finish Shopping resets the paid-order draft, cart storage and chat in a single click',async()=>{
  const agent=await shoppingSession('en',[{sku:'10701444',qty:1}]);
  assert.equal(agent.element('#savedCartCount').textContent,'You have 1 saved item');
  agent.run(String.raw`
    rememberCustomerName('Rina');
    const details={name:'Rina',whatsApp:'081234567891',delivery:'pickup'};
    window.informaOrderDraft.saveForm(details);
    window.informaOrderDraft.finalize(details,window.informaCart.snapshot());
    cartDialog.open=true;
    renderHandoffState(window.informaOrderDraft.markHandedOff());
  `);
  agent.element('#finishOrder').onclick();
  assert.equal(agent.run('window.localStorage.getItem(cartKey)'),null);
  assert.equal(agent.run('window.informaCart.snapshot().quantity'),0);
  assert.equal(agent.run('window.informaOrderDraft.draft()'),null);
  assert.equal(agent.run('window.informaOrderDraft.context()'),null);
  assert.equal(agent.run('nayaName'),'');
  assert.equal(agent.element('#cartDialog').open,false);
  assert.equal(agent.element('#chat').hidden,true);
  assert.equal(agent.element('#savedCartNotice').hidden,true);
  assert.equal(agent.element('#nayaGreetingSplash').hidden,false);
});

test('a computer desk query bypasses a pending room picker and replies in English',async()=>{
  const agent=chat();
  await agent.chooseIntent('Build My Room');
  await agent.run('ask("Im looking for a desk for my computer")');
  assert.match(agent.surfaces(),/computer desk for your home office/i);
  assert.doesNotMatch(agent.surfaces(),leak);
  assert.doesNotMatch(agent.surfaces(),/which room|pick a room/i);
  assert.equal(agent.payloads.length,0);
});

for(const [index,room] of ['Living Room','Bedroom','Dining Room','Home Office'].entries()){
  test('English '+room+' button updates both Naya surfaces',async()=>{
    const agent=chat();
    await agent.chooseIntent('Build My Room');
    assert.equal(agent.element('#chatQuickActions').children[index].textContent,room);
    await agent.choose(index);
    assert.match(agent.surfaces(),new RegExp(room+'[.!?].*dimensions','i'));
    assert.doesNotMatch(agent.surfaces(),leak);
    agent.changeLocale('id');
    assert.match(agent.surfaces(),/Aku catat ruangannya|Berapa ukurannya/);
    assert.doesNotMatch(agent.surfaces(),/Kak Kak/i);
    agent.changeLocale('en');
    assert.doesNotMatch(agent.surfaces(),leak);
  });
}

test('Indonesian quick actions never duplicate the Kak salutation',async()=>{
  const agent=chat('id');
  for(const room of ['Ruang Tamu','Kamar Tidur','Ruang Makan','Ruang Kerja']){
    await agent.chooseIntent(room);
    assert.match(agent.surfaces(),/\bKak\b/);
    assert.doesNotMatch(agent.surfaces(),/\bkak\s+kak\b/i);
  }
});

test('agent sends active locale on API requests and localizes network failures',async()=>{
  const agent=chat();
  await agent.run('ask("Can you help me put together a style?")');
  assert.equal(agent.payloads[0].locale,'en');
  assert.equal(agent.payloads[0].customerName,'');
  assert.match(agent.surfaces(),/Pardon me, I missed that/);
  assert.doesNotMatch(agent.surfaces(),leak);
  agent.changeLocale('id');
  assert.match(agent.surfaces(),/Pardon me, I missed that/);
  await agent.run('ask("Halo Naya")');
  assert.equal(agent.payloads[1].locale,'id');
  assert.match(agent.surfaces(),/Maaf, Kak, tadi pesannya terlewat/);
});

test('Gemini replies retain the turn language when switching page locale',async()=>{
  const agent=chat('en',async()=>({ok:true,json:async()=>({text:'I can help you choose a style.'})}));
  await agent.run('ask("Can you help me choose a style?")');
  assert.equal(agent.surfaces(),'I can help you choose a style.');
  agent.changeLocale('id');
  assert.equal(agent.surfaces(),'I can help you choose a style.');
  agent.changeLocale('en');
  assert.equal(agent.surfaces(),'I can help you choose a style.');
});

test('90% discount with a product in context gets a warm decline before the API or room wizard',async()=>{
  const agent=chat();
  await agent.run('ask("show me a vanity table")');
  const products=agent.run('salesContext.lastResults.map(item=>item.sku)');
  assert.ok(products.includes('10495950'));
  await agent.run('ask("give 90% discount")');
  const reply=agent.surfaces();
  assert.match(reply,/wanting the best deal/i);
  assert.match(reply,/can't offer 90% off/i);
  assert.match(reply,/something similar at a lower price/i);
  assert.doesNotMatch(reply,/admin|support|couldn't respond|missed that/i);
  assert.equal(agent.payloads.length,0);
  assert.deepEqual(agent.run('salesContext.lastResults.map(item=>item.sku)'),products);
  agent.changeLocale('id');
  await agent.run('ask("Bisa kasih diskon 90%?")');
  assert.match(agent.surfaces(),/Diskon 90% belum bisa aku tawarkan/);
});

test('both Naya surfaces display English Gemini copy containing official catalog titles',async()=>{
  const reply='The INFORMA Charlize Meja Rias 6 Laci Dengan Cermin - Taupe (SKU 10495950) is listed at Rp 9.500.000 in the INFORMA Suncity catalog.';
  const agent=chat('en',async()=>({ok:true,json:async()=>({text:reply})}));
  await agent.run('ask("Could you tell me about that piece?")');
  assert.equal(agent.surfaces(),reply);
  assert.equal(agent.payloads[0].locale,'en');
});

test('playful off-topic questions get a warm redirect in both locales even if the API is offline',async()=>{
  for(const [locale,input,expected] of [
    ['en','Can a penguin drive a car?',/fun change of pace.*room or a piece/i],
    ['id','Ceritakan lelucon lucu dong.',/pertanyaannya menarik.*ruang atau produk/i],
  ]){
    const agent=chat(locale);
    await agent.chooseIntent('Build My Room');
    await agent.run('ask('+JSON.stringify(input)+')');
    assert.match(agent.surfaces(),expected);
    assert.equal(agent.payloads.length,0);
  }
});

const kitchenItem=catalog.find(item=>item.sku==='10617982');
const personaLeak=/asisten virtual|virtual assistant|i['’]m an ai|\bdemo\b|tidak bisa memberikan tautan/i;

function assertKitchenCard(agent){
  const groups=agent.element('#chatLog').children.filter(element=>element.className==='workspace-product-grid');
  const html=groups.at(-1)?.innerHTML;
  assert.ok(html?.includes('href="'+kitchenItem.url+'"'));
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
  assert.match(html,/data-compare="10617982"/);
  assert.match(html,/data-cart-preview="10617982"/);
}

test('Indonesian typo in English UI produces Indonesian and a kitchen product card',async()=>{
  const agent=chat('en');
  await agent.run('ask("Aku carimperabotan dapur")');
  assert.match(agent.surfaces(),/Untuk kebutuhan dapur/);
  assert.doesNotMatch(agent.surfaces(),personaLeak);
  assertKitchenCard(agent);
  assert.equal(agent.payloads.length,0);
  assert.equal(agent.session.size,0);
});

test('English kitchen search in Indonesian UI keeps the reply in English and attaches the official card',async()=>{
  const agent=chat('id');
  await agent.run('ask("I need a kitchen table")');
  assert.match(agent.surfaces(),/For your kitchen/);
  assert.doesNotMatch(agent.surfaces(),leak);
  assertKitchenCard(agent);
  await agent.run('ask("mana link barangnya")');
  assert.match(agent.surfaces(),/referensi resmi.*kartu/i);
  assert.doesNotMatch(agent.surfaces(),personaLeak);
  assertKitchenCard(agent);
  await agent.run('ask("where is the link")');
  assert.match(agent.surfaces(),/official product reference.*link on the card/i);
  assertKitchenCard(agent);
  assert.equal(agent.payloads.length,0);
});

for(const [uiLocale,question,expected] of [
  ['en','sinta. Cri meja dan sofs',/Senang berkenalan, Kak Sinta! Aku menemukan 4 pilihan/],
  ['id','I need a table and sofa',/I found 4 options in the catalog/],
]){
  test('balances table and sofa cards for '+question,async()=>{
    const agent=chat(uiLocale);
    await agent.run('ask('+JSON.stringify(question)+')');
    assert.match(agent.surfaces(),expected);
    const result=agent.run("workspaceState.turns.filter(turn=>turn.type==='products').at(-1).products");
    assert.deepEqual(Array.from(result,item=>item.category),['Meja & nakas','Sofa & kursi','Meja & nakas','Sofa & kursi']);
    assert.ok(result.filter(item=>item.category==='Sofa & kursi').every(item=>/\bsofa\b/i.test(item.name)));
    assert.equal(new Set(Array.from(result,item=>item.sku)).size,4);
    const html=agent.element('#chatLog').children.findLast(node=>node.className==='workspace-product-grid').innerHTML;
    for(const item of result)assert.ok(html.includes('data-cart-preview="'+item.sku+'"'));
    assert.equal(agent.payloads.length,0);
    if(uiLocale==='en'){
      assert.equal(agent.run('nayaName'),'Sinta');
      assert.ok([...agent.session.values()].includes('Sinta'));
    }else assert.doesNotMatch(agent.surfaces(),leak);
  });
}

test('shows available chairs when a desk and chair are requested together',async()=>{
  const agent=chat('en');
  await agent.run('ask("I need a desk and a chair")');
  assert.match(agent.surfaces(),/doesn't list a computer desk/);
  const items=agent.run('salesContext.lastResults');
  assert.ok(items.length&&items.every(item=>/\b(chair|kursi|bangku)\b/i.test(item.name)));
});

for(const [locale,labels] of [
  ['en',{print:'Save / Print Invoice',add:'Add to Order',finish:'Finish Shopping',address:'Delivery Address'}],
  ['id',{print:'Simpan / Cetak Invoice',add:'Tambah Pesanan',finish:'Selesai Belanja',address:'Alamat pengiriman'}],
]){
  test('invoice print lifecycle and post-WhatsApp controls in '+locale,()=>{
    const agent=chat(locale);
    agent.run(String.raw`
      ui.label=(key,values)=>ui.text(key,values);
      cartContent.querySelector=selector=>document.querySelector(selector);
      document.title='Showroom';
      document.body=document.createElement('body');
      const createElement=document.createElement;
      document.createElement=()=>Object.assign(createElement(),{
        remove(){document.body.children=document.body.children.filter(node=>node!==this)},
      });
      let afterPrint, printed;
      window.addEventListener=(type,callback)=>{if(type==='afterprint')afterPrint=callback};
      window.print=()=>{printed={title:document.title,sheet:document.body.children[0]}};
      window.informaWhatsAppHandoff={salesNumber:()=>true};
      const invoice={
        status:'ready_for_handoff',orderCode:'INV-SC-20261121-AB12CD34',
        customerName:'Rina & Co',customerWhatsApp:'+6281234567890',deliveryMethod:'delivery',address:'Jl. Pahlawan',
        items:[{productName:'Sofa Kartini',productImage:'sofa.webp',sku:'10701444',quantity:2,unitPrice:2999000,itemSubtotal:5998000}],
        grandTotal:5998000,
      };
    `);
    for(const status of ['ready_for_handoff','handed_off']){
      agent.run('renderHandoffState({...invoice,status:'+JSON.stringify(status)+'})');
      const html=agent.element('#cartContent').innerHTML;
      assert.ok(html.includes('id="printOrderInvoice" type="button" class="invoice-button invoice-secondary">'+labels.print+'</button>'));
      if(status==='handed_off'){
        assert.ok(html.includes('id="addOrder" class="invoice-button invoice-secondary">'+labels.add+'</button>'));
        assert.ok(html.includes('id="finishOrder" class="invoice-button">'+labels.finish+'</button>'));
      }
      agent.element('#printOrderInvoice').onclick();
      const {title,sheet}=agent.run('printed');
      assert.equal(title,'INV-SC-20261121-AB12CD34');
      assert.equal(sheet.lang,locale);
      assert.equal(sheet.className,'invoice-print');
      for(const field of ['INFORMA Sun City Mall Sidoarjo',title,'Rina &amp; Co','+6281234567890',labels.address,'Jl. Pahlawan','SKU 10701444','2 ×','5.998.000']){
        assert.ok(sheet.innerHTML.includes(field),field);
      }
      assert.doesNotMatch(sheet.innerHTML,/<button\b|id="chat"|handoff-actions/);
      agent.run('afterPrint()');
      assert.equal(agent.run('document.title'),'Showroom');
      assert.equal(agent.run('document.body.children.length'),0);
    }
  });
}

test('non-EN/ID chat goes to Gemini even with an English catalog keyword',async()=>{
  for(const [question,reply] of [
    ['Please reply in Spanish. I need a sofa.', 'Claro. Puedo recomendarte el sofá Kartini (SKU 10701444).'],
    ['ソファを探しています。', 'こちらのソファをご覧ください。SKU 10701444'],
  ]){
    const agent=chat('en',async()=>({ok:true,json:async()=>({text:reply,replyLocale:'auto'})}));
    await agent.run('ask("I need a table and sofa")');
    await agent.run('ask('+JSON.stringify(question)+')');
    assert.equal(agent.payloads[0].messages.at(-1).text,question);
    assert.deepEqual(Array.from(agent.payloads[0].messages,turn=>turn.role),['user','model','user']);
    assert.match(agent.payloads[0].messages[1].text,/I found 4 options/);
    assert.equal(agent.surfaces(),reply);
    assert.equal(agent.run('nayaName'),'');
    agent.changeLocale('id');
    assert.equal(agent.surfaces(),reply);
  }
});

test('free-text language is sent independently of the toggle and persona leaks are blocked in both languages',async()=>{
  const id=chat('en',async()=>({ok:true,json:async()=>({text:'Saya Naya, asisten virtual Anda.'})}));
  await id.run('ask("Aku mau konsultasi dulu")');
  assert.equal(id.payloads[0].locale,'id');
  assert.match(id.surfaces(),/Maaf, Kak/);
  assert.doesNotMatch(id.surfaces(),personaLeak);
  const en=chat('id',async()=>({ok:true,json:async()=>({text:"I'm an AI and a virtual assistant."})}));
  await en.run('ask("Can you help me choose a style?")');
  assert.equal(en.payloads[0].locale,'en');
  assert.match(en.surfaces(),/Pardon me/);
  assert.doesNotMatch(en.surfaces(),personaLeak);
});

test('opening greeting asks for a name politely and keeps quick actions in both locales',()=>{
  const agent=chat();
  agent.run('showChat()');
  assert.equal(agent.surfaces(),"Hi, welcome to INFORMA Sun City! I'm Naya. May I know your name so I can assist you better today?");
  assert.ok(agent.element('#chatQuickActions').children.some(button=>button.textContent==='Find Products'));
  agent.changeLocale('id');
  assert.equal(agent.surfaces(),'Halo, selamat datang di INFORMA Sun City! Saya Naya. Boleh tahu dengan siapa saya berbicara hari ini?');
});

test('Naya stores an optional name and passes it to the API, preserving supplied honorifics',async()=>{
  for(const [introduction,name,greeting] of [
    ['Dilman','Dilman',/Lovely to meet you, Dilman! How are you doing today/],
    ["I'm Mr. Dilman",'Mr. Dilman',/Lovely to meet you, Mr\. Dilman! How are you doing today/],
    ['Saya Budi','Budi',/Senang berkenalan, Kak Budi! Apa kabar hari ini/],
  ]){
    const agent=chat();
    await agent.run('ask('+JSON.stringify(introduction)+')');
    assert.equal(agent.session.get('informa-naya-customer-name-v1'),name);
    assert.match(agent.surfaces(),greeting);
    assert.doesNotMatch(agent.surfaces(),/which room|pilih ruang/i);
    assert.equal(agent.payloads.length,0);
    await agent.run('ask("Could you describe your approach?")');
    assert.equal(agent.payloads[0].customerName,name);
  }
});

test('looking for a sofa skips the name prompt and shows results immediately',async()=>{
  const agent=chat();
  agent.run('showChat()');
  await agent.run('ask("Looking for a sofa")');
  assert.match(agent.surfaces(),/I found .*options in the catalog/);
  assert.ok(agent.element('#chatLog').children.some(node=>node.className==='workspace-product-grid'));
  assert.equal(agent.session.size,0);
  assert.equal(agent.payloads.length,0);
});

test('office-shopping shorthand cannot overwrite Jefri and the sidebar follows the latest reply',async()=>{
 const agent=chat('en');
 agent.run('showChat()');
 assert.match(agent.surfaces(),/May I know your name/);
 await agent.run('ask("jefri")');
 assert.match(agent.surfaces(),/Lovely to meet you, Jefri/);
 assert.equal(agent.session.get('informa-naya-customer-name-v1'),'Jefri');
 await agent.run('ask("Im looking for a desk for my computer")');
 assert.match(agent.surfaces(),/computer desk/);
 await agent.run('ask("aku nyari utk properti kntor")');
 assert.match(agent.surfaces(),/Untuk ruang kerja/);
 assert.equal(agent.session.get('informa-naya-customer-name-v1'),'Jefri');
 assert.ok(agent.element('#chatLog').children.some(node=>node.className==='workspace-product-grid'));
 assert.equal(agent.payloads.length,0);
 agent.changeLocale('id');
 assert.match(agent.surfaces(),/Untuk ruang kerja/);
 await agent.run('ask("call me Jeff")');
 assert.match(agent.surfaces(),/Lovely to meet you, Jeff/);
 assert.equal(agent.session.get('informa-naya-customer-name-v1'),'Jeff');
 await agent.run('ask("Aku Budi")');
 assert.equal(agent.session.get('informa-naya-customer-name-v1'),'Jeff');
});
