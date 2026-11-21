/* Official product images; visual composition only, never a dimension/stock simulator. */
window.roomPlanner = (() => {
  const ui = window.NayaI18n;
  let products, pending, root, active = null, category = 'Semua', page = 0;
  let placements = [], nextId = 1, initialized = false;
  const perPage = 4;
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const product = sku => products.find(p => p.sku === sku);
  async function load() {
    if (products) return products;
    if (!pending) pending = fetch('/products.json').then(r => {if(!r.ok)throw Error();return r.json()}).then(p => {
      if(p.length !== 30 || new Set(p.map(x=>x.sku)).size !== 30)throw Error();
      products=p;return p;
    }).catch(e=>{pending=null;throw e});
    return pending;
  }
  function add(sku, x = 50, y = 59, size = 29) {
    const existing = placements.find(p=>p.sku===sku);
    if(existing) {active=existing.id;return;}
    const p={id:nextId++,sku,x,y,size};placements.push(p);active=p.id;
  }
  function paintScene() {
    const scene=root.querySelector('.composition');
    scene.innerHTML=placements.map((p,i)=>{
      const item=product(p.sku);
      return `<button class="placed-product ${p.id===active?'selected':''} ${item.cutout?'cutout':'photo'}" data-placement="${p.id}" style="left:${p.x}%;top:${p.y}%;width:${p.size}%;z-index:${i+1}" ${ui.attribute('aria-label','{name}. Geser dengan mouse, sentuhan, atau tombol panah.',{name:item.name})} aria-pressed="${p.id===active}"><img draggable="false" src="${escape(item.cutout||item.image)}" alt="${escape(item.name)}"><span>${escape(item.name.replace(/^Informa /,''))}</span></button>`;
    }).join('') || '<p class="empty-room"><!--naya-copy:Pilih produk di katalog untuk mulai menyusun.-->Pilih produk di katalog untuk mulai menyusun.</p>';
    scene.querySelectorAll('.placed-product').forEach(el=>{
      const p=placements.find(p=>p.id===Number(el.dataset.placement));
      el.onclick=()=>{active=p.id;updateSelection()};
      el.onpointerdown=e=>{
        if(e.button!==0)return;
        active=p.id;updateSelection();el.setPointerCapture(e.pointerId);
        const box=scene.getBoundingClientRect(),start={x:e.clientX,y:e.clientY,px:p.x,py:p.y};
        el.onpointermove=move=>{p.x=clamp(start.px+(move.clientX-start.x)/box.width*100,p.size/2,100-p.size/2);p.y=clamp(start.py+(move.clientY-start.y)/box.height*100,20,80);el.style.left=p.x+'%';el.style.top=p.y+'%'};
        el.onpointerup=el.onpointercancel=()=>{el.onpointermove=null;};
      };
      el.onkeydown=e=>{
        const shift={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];
        if(shift){e.preventDefault();p.x=clamp(p.x+shift[0],p.size/2,100-p.size/2);p.y=clamp(p.y+shift[1],20,80);el.style.left=p.x+'%';el.style.top=p.y+'%'}
      };
    });
    ui.bindText(root.querySelector('.selection-count'),'{count} produk dipilih',{count:placements.length});
    updateSelection();
    bindImageFallbacks(scene);
  }
  function bindImageFallbacks(scope) {
    scope.querySelectorAll('img').forEach(img=>img.onerror=()=>{
      const placed=img.closest('[data-placement]');
      const p=placed&&product(placements.find(p=>p.id===Number(placed.dataset.placement)).sku);
      if(p&&img.getAttribute('src')!==p.image){img.src=p.image;placed.classList.remove('cutout');placed.classList.add('photo');return;}
      img.hidden=true;img.parentElement.classList.add('image-unavailable');img.parentElement.dataset.copyTitle='Foto belum termuat. Buka sumber resmi untuk melihat produk.';img.parentElement.setAttribute('data-copy-data-image-fallback','Foto belum termuat');ui.apply(img.parentElement);
    });
  }
  function updateSelection() {
    root.querySelectorAll('[data-placement]').forEach(el=>{const selected=Number(el.dataset.placement)===active;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected)});
    const p=placements.find(p=>p.id===active), info=root.querySelector('.selected-name');
    if(p){ui.unbindText(info);info.textContent=product(p.sku).name.replace(/^Informa /,'')}else ui.bindText(info,'Pilih produk untuk mengaturnya');
    const scale=root.querySelector('#productScale');scale.disabled=!p;if(p)scale.value=p.size;
    root.querySelectorAll('[data-edit]').forEach(b=>b.disabled=!p);
  }
  function paintCatalog() {
    const list=products.filter(p=>category==='Semua'||p.category===category);
    page=clamp(page,0,Math.max(0,Math.ceil(list.length/perPage)-1));
    root.querySelector('.product-list').innerHTML=list.slice(page*perPage,(page+1)*perPage).map(p=>`<article class="real-product"><button data-add="${p.sku}" ${ui.attribute('aria-label','Tambahkan {name}',{name:p.name})}><img src="${escape(p.image)}" alt="${escape(p.name)}"><span class="product-add">${ui.label(placements.some(x=>x.sku===p.sku)?'✓ Dipilih':'+ Susun ruang')}</span></button><h3>${escape(p.name.replace(/^Informa /,''))}</h3><button class="planner-cart" data-cart="${p.sku}"><!--naya-copy:+ Keranjang-->+ Keranjang</button><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">${ui.label('Lihat Referensi Asli ↗')}</a></article>`).join('');
    ui.bindText(root.querySelector('.catalog-page'),'{current} / {pages} · {count} item',{current:page+1,pages:Math.ceil(list.length/perPage),count:list.length});
    root.querySelector('#productsPrev').disabled=page===0;root.querySelector('#productsNext').disabled=(page+1)*perPage>=list.length;
    root.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{add(b.dataset.add,35+placements.length%4*10,58,28);paintScene();paintCatalog();ui.bindText(root.querySelector('.planner-status'),'{name} dipilih.',{name:product(b.dataset.add).name})});
    root.querySelectorAll('[data-cart]').forEach(b=>b.onclick=()=>{const item=product(b.dataset.cart);window.informaCart?.add(item.sku);ui.bindText(root.querySelector('.planner-status'),'{name} ditambahkan ke keranjang.',{name:item.name})});
    bindImageFallbacks(root.querySelector('.product-list'));
  }
  async function mount(container) {
    root=container;
    root.innerHTML='<p class="notice" role="status"><!--naya-copy:Memuat 30 produk resmi INFORMA…-->Memuat 30 produk resmi INFORMA…</p>';
    try{await load()}catch{if(root.isConnected){root.innerHTML='<p role="alert"><!--naya-copy:Katalog belum dapat dimuat.-->Katalog belum dapat dimuat.</p><button id="retryProducts"><!--naya-copy:Coba lagi-->Coba lagi</button>';root.querySelector('button').onclick=()=>mount(container)}return;}
    if(!container.isConnected||container.dataset.view!=='room')return;
    if(!initialized){add('10475501',76,47,24);add('10088710',42,60,42);add('10242354',55,73,26);initialized=true;}
    root.innerHTML=`<div class="planner-heading"><div><p class="kicker">02 / BUILD MY ROOM</p><h2><!--naya-copy:Ruang Anda. Pilihan INFORMA.-->Ruang Anda. Pilihan INFORMA.</h2></div><span class="selection-count"></span></div><div class="planner-layout"><section class="planner-workspace"><div class="composition" data-copy-aria-label="Bidang susun produk INFORMA" aria-label="Bidang susun produk INFORMA"></div><div class="scene-tools"><label><!--naya-copy:Suasana-->Suasana <select id="roomMood"><option value="warm">Warm neutral</option><option value="sage">Soft sage</option><option value="stone">Cool stone</option></select></label><span><!--naya-copy:Geser produk · sentuh untuk memilih-->Geser produk · sentuh untuk memilih</span></div><div class="product-controls"><p class="selected-name"></p><label><!--naya-copy:Ukuran visual-->Ukuran visual <input id="productScale" type="range" min="12" max="55" step="1"></label><button data-edit="front"><!--naya-copy:Ke depan-->Ke depan</button><button data-edit="remove"><!--naya-copy:Hapus pilihan-->Hapus pilihan</button></div><p class="planner-disclaimer"><!--naya-copy:Foto produk resmi • komposisi 2D, bukan denah berskala. Harga dan stok cabang perlu konfirmasi.-->Foto produk resmi • komposisi 2D, bukan denah berskala. Harga dan stok cabang perlu konfirmasi.</p><button class="panel-action" id="consultRoom"><!--naya-copy:Cek harga & stok pilihan saya ↗-->Cek harga &amp; stok pilihan saya ↗</button><p class="planner-status sr-only" role="status"></p></section><section class="planner-catalog" data-copy-aria-label="30 produk INFORMA" aria-label="30 produk INFORMA"><div class="catalog-title"><b><!--naya-copy:30 produk pilihan-->30 produk pilihan</b><span><!--naya-copy:8 jenis · katalog resmi-->8 jenis · katalog resmi</span></div><label class="category-label"><!--naya-copy:Jenis produk-->Jenis produk<select id="productCategory">${['Semua',...new Set(products.map(p=>p.category))].map(c=>`<option value="${escape(c)}" ${c===category?'selected':''}>${ui.label(c)}</option>`).join('')}</select></label><div class="product-list"></div><div class="catalog-pagination"><button id="productsPrev" data-copy-aria-label="Produk sebelumnya" aria-label="Produk sebelumnya">←</button><span class="catalog-page"></span><button id="productsNext" data-copy-aria-label="Produk berikutnya" aria-label="Produk berikutnya">→</button></div></section></div>`;
    root.querySelector('#productCategory').onchange=e=>{category=e.target.value;page=0;paintCatalog()};
    root.querySelector('#productsPrev').onclick=()=>{page--;paintCatalog()};root.querySelector('#productsNext').onclick=()=>{page++;paintCatalog()};
    root.querySelector('#roomMood').onchange=e=>root.querySelector('.composition').dataset.mood=e.target.value;
    root.querySelector('#productScale').oninput=e=>{const p=placements.find(p=>p.id===active);if(!p)return;p.size=Number(e.target.value);p.x=clamp(p.x,p.size/2,100-p.size/2);const el=root.querySelector(`[data-placement="${p.id}"]`);el.style.width=p.size+'%';el.style.left=p.x+'%'};
    root.querySelector('[data-edit="remove"]').onclick=()=>{placements=placements.filter(p=>p.id!==active);active=placements.at(-1)?.id||null;paintScene();paintCatalog()};
    root.querySelector('[data-edit="front"]').onclick=()=>{const p=placements.find(p=>p.id===active);placements=placements.filter(x=>x!==p);placements.push(p);paintScene()};
    root.querySelector('#consultRoom').onclick=()=>{state.inquiry='Build My Room';open('contact')};
    paintScene();paintCatalog();
  }
  return {mount,summary:()=>placements.map(p=>`${product(p.sku).name} [SKU ${p.sku}]`).join('\n')};
})();
