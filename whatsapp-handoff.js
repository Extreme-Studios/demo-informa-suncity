(function(root){
 const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
 const localeFor=value=>value==='en'?'en':'id';
 const rupiah=(value,locale)=>'Rp '+(Number(value)||0).toLocaleString(locale==='en'?'en-US':'id-ID');
 const salesNumber=value=>{let number=clean(value).replace(/[\s()+-]/g,'');if(number.startsWith('0'))number='62'+number.slice(1);return /^62(?:8\d{7,12})$/.test(number)?number:''};
 const validUrl=value=>{try{const url=new URL(value);return /^https?:$/.test(url.protocol)?url.href:''}catch{return ''}};
 function formatOrderSummary(order,{locale='id',receiptReady=false}={}){
  locale=localeFor(locale);
  const labels=locale==='en'?{
   title:'ORDER SUMMARY',additional:'ADDITIONAL ORDER',ref:'Invoice reference',name:'Customer name',
   previous:'Previous order',root:'Original order',phone:'WhatsApp',delivery:'Fulfillment',
   pickup:'Store pickup',ship:'Delivery',address:'Address',note:'Notes',items:'ITEMS',
   qty:'Qty',price:'Unit price',subtotal:'Subtotal',productLink:'Official reference',
   total:'TOTAL',receipt:"I'll attach the payment receipt image right after this message for your review.",
  }:{
   title:'RINGKASAN PESANAN',additional:'TAMBAHAN PESANAN',ref:'Referensi invoice',name:'Nama pelanggan',
   previous:'Pesanan sebelumnya',root:'Pesanan utama',phone:'WhatsApp',delivery:'Penerimaan',
   pickup:'Ambil di toko',ship:'Dikirim',address:'Alamat',note:'Catatan',items:'PRODUK',
   qty:'Jumlah',price:'Harga satuan',subtotal:'Subtotal',productLink:'Referensi asli',
   total:'TOTAL',receipt:'Saya akan melampirkan foto bukti pembayaran setelah pesan ini untuk diperiksa.',
  };
  const lines=[
   (order.orderType==='additional'?labels.additional:labels.title)+' — INFORMA SUN CITY',
   labels.ref+': '+clean(order.orderCode),
  ];
  if(order.orderType==='additional'){
   lines.push(labels.previous+': '+clean(order.parentOrderCode));
   if(order.rootOrderCode&&order.rootOrderCode!==order.parentOrderCode)lines.push(labels.root+': '+clean(order.rootOrderCode));
  }
  lines.push('',labels.name+': '+clean(order.customerName),labels.phone+': '+clean(order.customerWhatsApp),
   labels.delivery+': '+(order.deliveryMethod==='pickup'?labels.pickup:labels.ship));
  if(order.deliveryMethod==='delivery'&&clean(order.address))lines.push(labels.address+': '+clean(order.address));
  if(clean(order.customerNote))lines.push(labels.note+': '+clean(order.customerNote));
  lines.push('',labels.items);
  order.items.forEach((item,index)=>{
   lines.push(`${index+1}. ${clean(item.productName)}`,
    `   SKU: ${clean(item.sku)} · ${labels.qty}: ${Number(item.quantity)||0}`,
    `   ${labels.price}: ${rupiah(item.unitPrice,locale)} · ${labels.subtotal}: ${rupiah(item.itemSubtotal,locale)}`);
   const reference=validUrl(item.productUrl);
   if(reference)lines.push('   '+labels.productLink+': '+reference);
  });
  lines.push('',labels.total+': '+rupiah(order.grandTotal,locale));
  if(receiptReady)lines.push('',labels.receipt);
  return lines.join('\n');
 }
 function buildWhatsAppHandoffUrl(order,number,options={}){
  const target=salesNumber(number);
  if(!target||!order?.items?.length||!['ready_for_handoff','handed_off'].includes(order.status))return '';
  return `https://wa.me/${target}?text=${encodeURIComponent(formatOrderSummary(order,options))}`;
 }
 root.informaWhatsAppHandoff=Object.freeze({formatOrderSummary,buildWhatsAppHandoffUrl,validUrl,salesNumber});
})(typeof window!=='undefined'?window:globalThis);
