(function (root) {
  'use strict';

  const storageKey = 'informa-language';
  const pairs = [
    ["Untuk ruang kerja, ini beberapa pilihan yang bisa Kakak lihat.", "Here are a few options for your home office."],
    ["Invoice / Ringkasan Pesanan", "Invoice / Order Summary"],
    ["Referensi invoice", "Invoice reference"],
    ["Nama pelanggan", "Customer name"],
    ["Total pesanan", "Order total"],
    ["Untuk konfirmasi, kirim pesan yang sudah disiapkan lalu lampirkan tangkapan layar bukti pembayaran langsung di WhatsApp.", "To confirm your order, send the prefilled message and then attach a screenshot of your payment receipt directly in WhatsApp."],
    ["Saya sudah membayar dan siap melampirkan bukti pembayaran.", "I've paid and have the receipt ready to attach."],
    ["Buka WhatsApp untuk Konfirmasi Pembayaran", "Open WhatsApp to Confirm Payment"],
    ["Salin Ringkasan Pesanan", "Copy Order Summary"],
    ["Simpan / Cetak Invoice", "Save / Print Invoice"],
    ["Ringkasan pesanan disalin.", "Order summary copied."],
    ["Ringkasan pesanan belum bisa disalin. Izinkan akses clipboard lalu coba lagi.", "Could not copy the order summary. Allow clipboard access and try again."],
    ["Setelah pembayaran selesai, buka WhatsApp untuk melampirkan bukti pembayaran dan mengirim ringkasan pesanan.", "After payment, open WhatsApp to attach your receipt and send the order summary."],
    ["Tim sales akan meninjau bukti pembayaran yang Kakak kirim melalui WhatsApp.", "The sales team will review the receipt you send through WhatsApp."],
    ["Konfirmasi dulu bahwa pembayaran sudah selesai dan bukti siap dilampirkan.", "Please confirm you've paid and have the receipt ready to attach."],
    ["WhatsApp sudah dibuka, Kak. Lampirkan bukti pembayaran lalu tekan Kirim agar tim bisa memeriksanya.", "WhatsApp is open. Attach your receipt and tap Send so the team can review it."],
    ["Halo, selamat datang di INFORMA Sun City! Saya Naya.", "Hi, welcome to INFORMA Sun City! I'm Naya."],
    ["Boleh tahu dengan siapa saya berbicara hari ini?", "May I know your name so I can assist you better today?"],
    ["Halo, selamat datang di INFORMA Sun City! Saya Naya. Boleh tahu dengan siapa saya berbicara hari ini?", "Hi, welcome to INFORMA Sun City! I'm Naya. May I know your name so I can assist you better today?"],
    ["Senang berkenalan, {name}! Apa kabar hari ini? Ada kebutuhan ruangan atau furnitur yang bisa saya bantu carikan?", "Lovely to meet you, {name}! How are you doing today? What can I help you find for your space?"],
    ["Senang berkenalan, {name}! {reply}", "Lovely to meet you, {name}! {reply}"],
    ["Kak {name}", "{name}"],
    ["Nama atau kebutuhan furnitur Anda…", "Your name or what you're looking for…"],
    ["Aku Naya, Sales Assistant di INFORMA Sun City Mall Sidoarjo. Ada yang bisa aku bantu pilihkan, Kak?", "I'm Naya, the Sales Assistant for INFORMA Sun City Mall Sidoarjo. What can I help you find today?"],
    ["Ini referensi resmi produknya, Kak. Buka tautan di kartu di bawah ini.", "Here's the official product reference. Use the link on the card below."],
    ["Sebutkan nama produk atau SKU-nya, Kak. Aku bantu tampilkan tautan resminya.", "Which piece did you have in mind? Share its name or SKU and I'll pull up the official link."],
    ["Untuk kebutuhan dapur, ini pilihan yang bisa Kakak lihat.", "For your kitchen, here's an option worth a look."],
    ["Lihat Referensi Asli ↗", "View Official Reference ↗"],
    ["Pesanan final belum tersedia.", "There is no finalized order yet."],
    ["Pesanan belum siap diteruskan ke sales.", "The order is not ready for the sales handoff."],
    ["Pesanan belum berhasil diteruskan ke sales.", "The sales handoff could not be completed."],
    ["Host tidak diizinkan.", "Host is not allowed."],
    ["URL tidak valid.", "Invalid URL."],
    ["Gunakan POST.", "Use POST."],
    ["Origin tidak diizinkan.", "Origin is not allowed."],
    ["Gunakan JSON.", "Use JSON."],
    ["Terlalu banyak permintaan. Tunggu sebentar.", "Too many requests. Please try again shortly."],
    ["Pesan terlalu panjang.", "The message is too long."],
    ["Pesan tidak terbaca.", "The message could not be read."],
    ["JSON tidak valid.", "Invalid JSON."],
    ["Format atau panjang pesan tidak valid.", "The message format or length is invalid."],
    ["Sebentar ya, Kak. Obrolannya sedang ramai. Kalau sudah siap, sebutkan produk yang Kakak suka dan kita lanjut dari sana.", "One moment, please. It's a little busy right now. When you're ready, tell me which piece caught your eye and we'll pick up from there."],
    ["Maaf, Kak, tadi pesannya terlewat. Bisa ulangi atau sebutkan produk yang Kakak suka? Aku bantu dari sana.", "Pardon me, I missed that for a moment. Could you share it again, or tell me which piece caught your eye? I'd be happy to help from there."],
    ["Boleh sebutkan nama produknya{greeting}? Aku bisa cek harga referensi katalog.", "Which product are you looking at{greeting}? I can check its reference price in the catalog."],
    ["{name} belum punya harga referensi di katalog{greeting}.", "The catalog doesn't list a reference price for {name}{greeting}."],
    ["Harga referensi untuk {name} adalah {amount}{greeting}.", "The reference price for {name} is {amount}{greeting}."],
    ["Stok cabang belum bisa aku pastikan dari katalog ini.", "I can't confirm branch stock from this catalog."],
    ["Kita mulai dari ruangannya dulu, Kak.", "Let's start with the room you'd like to furnish."],
    ["Aku perlu jenis ruangannya dulu, Kak: Ruang Tamu, Kamar Tidur, Ruang Makan, atau Ruang Kerja.", "Which room are you planning: a living room, bedroom, dining room, or home office?"],
    ["Ukuran ruangannya belum terbaca, Kak. Coba tulis seperti 3x4, panjang 4 meter lebar 3, atau 12 meter persegi.", "Could you share the room dimensions? For example, 3 × 4 m or 12 square meters."],
    ["Budgetnya belum terbaca, Kak. Bisa tulis misalnya 20 juta, 15jt, atau Rp20.000.000.", "What budget would you like to stay within? For example, IDR 20 million."],
    ["Stok cabang belum bisa aku pastikan, Kak. Aku bisa bantu bandingkan pilihan yang ada di katalog.", "I can't confirm current branch stock. I can still help you compare items in the catalog."],
    ["Aku belum bisa memastikan stok cabang, Kak. Sebutkan produknya dan aku bantu cek detail di katalog.", "I can't confirm current branch stock. Tell me which piece you like and I'll look up its catalog details."],
    ["Aku paham ingin dapat harga terbaik, Kak! Diskon {percent}% belum bisa aku tawarkan. Aku bisa bantu cari pilihan serupa yang lebih terjangkau. Kisaran budget Kakak berapa?", "I understand wanting the best deal! I can't offer {percent}% off, but I'd be happy to find something similar at a lower price. What budget would feel right for you?"],
    ["Aku paham, Kak. Belum ada potongan harga yang bisa aku pastikan, tapi aku bisa bantu bandingkan pilihan yang lebih terjangkau. Kisaran budget Kakak berapa?", "I understand wanting a good deal. I can't confirm a discount here, but I'd love to help you compare more affordable pieces. What budget did you have in mind?"],
    ["Wah, pertanyaannya menarik, Kak. Kalau mau kembali lihat-lihat furnitur, aku siap bantu. Ada ruang atau produk yang sedang Kakak incar?", "That's a fun change of pace! If you'd like to browse a little more, I'd be happy to help. Is there a room or a piece you have in mind?"],
    ["Naya belum tersedia.", "Naya is temporarily unavailable."],
    ["Balasan ini ada dalam bahasa lain. Ganti bahasa untuk membacanya.", "This reply was written in another language. Switch back to read it."],
    ["Pilih satu produk lagi untuk dibandingkan, Kak.", "Pick one more item and I'll compare them side by side."],
    ["Ini perbandingan dua pilihan Kak.", "Here's how the two options compare."],
    ["Baik Kak. Terima kasih sudah mengunjungi INFORMA Suncity Sidoarjo. Kalau nanti ingin lanjut atau butuh rekomendasi lain, Naya siap membantu.", "Of course. Thanks for visiting INFORMA Suncity Sidoarjo. I'm here if you'd like to pick up where we left off."],
    ["Keranjang Kakak masih kosong. Mau aku bantu carikan produk atau susun kebutuhan ruangan?", "Your cart is empty. Would you like help finding a piece or planning a room?"],
    ["Keranjang Naya Kak masih kosong. Pilih produknya dulu ya, nanti aku bantu lanjut sampai pesanan siap diproses.", "Your cart is empty. Choose an item first and I can help prepare your order."],
    ["Baik Kak, sebelum aku teruskan ke tim sales, boleh isi data pengiriman dulu ya.", "Please enter your delivery details so I can prepare the order summary."],
    ["Keranjang sudah dikosongkan. Naya tetap siap bantu lanjut pilih produk, Kak.", "Your cart is clear. I can help you find other options whenever you're ready."],
    ["Keranjang Kakak memang masih kosong.", "Your cart is already empty."],
    ["Yakin ingin mengosongkan seluruh keranjang? Balas “ya” untuk konfirmasi. Ini tidak menghapus percakapan atau data Naya.", "Clear all items from your cart? Reply “yes” to confirm. Your conversation and saved details will stay."],
    ["Ada beberapa pilihan yang cocok. Sebutkan nama produknya supaya tidak salah hapus, ya Kak.", "Several items match. Which product name should I remove?"],
    ["Produk itu belum ada di keranjang, Kak.", "That item isn't in your cart."],
    ["Pilihan itu belum ada di rekomendasi terakhir, Kak. Aku bisa carikan produknya dulu.", "That option isn't in the last set of recommendations. I can look for it first."],
    ["Pilih dua produk dari rekomendasi terakhir untuk dibandingkan, Kak.", "Choose two items from the latest recommendations and I'll compare them."],
    ["Gaya minimalis belum tercantum sebagai atribut pada data produk di web ini, Kak. Aku bisa tetap carikan berdasarkan kategori, warna, atau budget yang Kak mau.", "The catalog doesn't tag items by minimalist style. I can narrow them down by product type, color, or budget."],
    ["Ukuran yang cukup untuk membandingkan pilihan lebih kecil belum tercantum pada rekomendasi terakhir, Kak. Aku tidak mau menebak ukurannya.", "The latest options don't list enough dimensions for me to tell which is smaller."],
    ["Paket Build My Room ini sudah ada di keranjang, Kak.", "This Build My Room package is already in your cart."],
    ["Mau ganti produk yang mana, Kak? Contoh: “ganti sofanya”, “mejanya kurang suka”, atau “cari lampu yang lebih murah”.", "Which piece would you like to change? You can say “replace the sofa” or “find a cheaper lamp.”"],
    ["Mau tambah apa, Kak? Misalnya lampu, dekorasi, atau satu kursi lagi. Aku cek dulu supaya totalnya tetap masuk budget.", "What would you like to add? I can check whether a lamp, some décor, or another chair fits your budget."],
    ["Budget diperbarui; konteks ruangan, ukuran, dan preference tetap aku pakai.", "I've updated your budget and kept the room size and preferences we discussed."],
    ["Ukuran ruangan diperbarui; paket aku optimalkan lagi tanpa menghapus konteksnya.", "I've updated your room size and will use it to refine the package."],
    ["Dari data ukuran yang tercantum pada produk tertentu, penempatan final tetap perlu dicek kembali ya, Kak.", "Some items list dimensions. Please measure the space to confirm the final layout."],
    ["Ukuran produk tidak selalu tercantum pada katalog; penempatan final tetap perlu dicek kembali ya, Kak.", "Some items lack dimensions in the catalog, so please check their fit before ordering."],
    ["Perubahan hanya diterapkan pada produk yang diminta; produk lain tetap dipertahankan.", "Only the selected item was replaced."],
    ["Produk tambahan dipilih dari katalog lokal dan totalnya tetap tidak melewati budget.", "The added item is from the catalog and the total stays within your budget."],
    ["Siap Kak. Ini ringkasan pesanan sebelum aku teruskan ke tim sales.", "Here's your order summary. Take a moment to review it before continuing."],
    ["Pesanan Kak sudah aku teruskan ke tim sales INFORMA Suncity. Tim kami akan membantu konfirmasi stok, harga final, pembayaran, dan pengiriman melalui WhatsApp. Terima kasih sudah berbelanja bersama INFORMA Suncity Sidoarjo.", "Your order summary is ready in WhatsApp. The INFORMA Suncity sales team can confirm stock, final pricing, payment, and delivery once you send it."],
    ["Ceritakan ruang, budget, atau produk yang sedang Kak cari.", "Tell me about your room, budget, or the piece you're looking for."],
    ["Siap, Kak. Sebutkan produk, warna, atau budget yang ingin dicari.", "Sure. What product, color, or budget would you like me to look for?"],
    ["Baik, Kak.", "Got it."],
    ["Baik, Kak {name}.", "Got it, {name}."],
    ["Aku catat ruang tamu. Kak lebih mengutamakan sofa, meja tamu, atau penyimpanan?", "For your living room, would you like to start with a sofa, a coffee table, or storage?"],
    ["Untuk kamar tidur, Kak ingin mulai dari tempat tidur, nakas, atau pencahayaan?", "For your bedroom, would you like to start with a bed, a nightstand, or lighting?"],
    ["Untuk ruang makan, Kak sedang cari meja, kursi, atau keduanya?", "For your dining room, are you looking for a table, chairs, or both?"],
    ["Aku bantu arahkan pilihan untuk ruang kerja. Kak membutuhkan penyimpanan atau furnitur utama dulu?", "Let's set up your home office. Are you looking for a desk, a chair, or storage?"],
    ["Aku bisa carikan dari 30 produk di katalog. Kak sedang mencari jenis barang tertentu atau sudah punya budget?", "I can search the 30 products in the catalog. What kind of piece or budget do you have in mind?"],
    ["Katalog produk siap dibuka. Kak juga bisa sebutkan kategori atau budget supaya aku carikan yang relevan.", "The catalog is ready to browse. Tell me your product type or budget and I'll narrow it down."],
    ["Kak ingin mencari kebutuhan apa?", "What can I help you find?"],
    ["Aku belum menemukan produk itu dalam katalog. Aku bisa bantu bandingkan alternatif berdasarkan fungsi, ukuran, atau budget.", "I couldn't find that item in the catalog. I can help compare alternatives by function, size, or budget."],
    ["Katalog belum memuat meja komputer untuk ruang kerja. Mau lihat pilihan penyimpanan atau pencahayaan untuk melengkapi ruangnya?", "The catalog doesn't list a computer desk for your home office. Would you like to see storage or lighting options for the space?"],
    ["Katalog belum memuat meja komputer. Ini pilihan lain yang sesuai dengan permintaan Kak.", "The catalog doesn't list a computer desk. Here are the other items you asked for."],
    ["yang lebih murah", "at a lower price"],
    ["yang lebih mahal", "at a higher price"],
    ["lebih hemat", "more affordable"],
    ["upgrade", "upgraded"],
    ["siap diteruskan", "ready for handoff"],
    ["sudah diteruskan ke sales", "prepared for the sales team"],
    ["meja", "table"],
    ["lampu", "lamp"],
    ["dekorasi", "décor"],
    ["kursi", "chair"],
    ["Minimalis", "Minimalist"],
    ["putih", "white"],
    ["krem", "cream"],
    ["cokelat", "brown"],
    ["hitam", "black"],
    ["merah", "red"],
    ["abu abu", "gray"],
    ["hijau", "green"],
    ["Pertama", "First"],
    ["Kedua", "Second"],
    ["{name} sudah aku masukkan ke Keranjang Naya, Kak.", "I added {name} to your cart."],
    ["Saat ini ada {count} produk di Keranjang Naya. Mau lanjut belanja atau proses pesanannya, Kak?", "There are {count} items in your cart. Would you like to keep shopping or prepare your order?"],
    ["{name} sudah masuk ke Keranjang Naya, Kak.", "{name} is now in your cart."],
    ["Dengan budget {budget}, belum ada paket {room} yang cocok. Kita bisa menaikkan budget atau mulai dari satu produk utama, Kak.", "I couldn’t find a {room} package within {budget}. We can start with one main piece or revisit the budget."],
    ["Aku prioritaskan kebutuhan ini: {priority}.", "I prioritized what you asked for: {priority}."],
    ["{count} produk Build My Room sudah masuk keranjang, Kak.", "I added {count} items from Build My Room to your cart."],
    ["Upgrade {item} ini akan melewati budget {budget}, Kak. Paketnya tetap sama.", "Upgrading the {item} would exceed {budget}. I kept your package as it was."],
    ["Belum ada pilihan {mode} untuk {item} tanpa mengubah isi paket lain.", "I couldn’t find a {mode} {item} without changing the rest of your package."],
    ["{newItem} menggantikan {oldItem}. Total baru {total}, sisa budget {left}.", "{newItem} replaces {oldItem}. Your new total is {total}, with {left} left in your budget."],
    ["Belum ada alternatif {item} lain dalam budget tanpa menduplikasi produk paket, Kak.", "I couldn’t find another {item} within your budget that isn’t already in the package."],
    ["Belum ada tambahan {item} yang masuk budget, Kak. Paketnya tetap sama.", "I couldn’t fit another {item} within your budget. Your package stays as it was."],
    ["{name} ditambahkan. Total baru {total}, sisa budget {left}.", "I added {name}. Your new total is {total}, with {left} left in your budget."],
    ["Aku catat ruangannya: {room}. Berapa ukurannya? Contoh: 3 × 4 m atau 12 meter persegi.", "Got it, {room}. What are the approximate dimensions? For example, 3 × 4 m or 12 square meters."],
    ["Ukuran {size} aku catat. Berapa budget maksimalnya, Kak?", "I’ve noted {size}. What’s your maximum budget?"],
    ["Budget batasnya {budget}. Kak lebih suka gaya Minimalis, Modern, Japandi, Scandinavian, Classic, atau Luxury?", "Your budget is {budget}. Which style do you prefer: minimalist, modern, Japandi, Scandinavian, classic, or luxury?"],
    ["Gaya {style} aku catat. Apa prioritas untuk ruang ini, Kak? Misalnya tempat duduk, penyimpanan, atau ruang yang terasa lega.", "I’ve noted your {style} preference. What matters most for this room: more seating, storage, or leaving it feeling open?"],
    ["Draft {code} sudah final. Untuk mengubahnya, batalkan draft, edit keranjang, lalu konfirmasi ulang.", "Draft {code} is finalized. To make a change, cancel the draft, edit your cart, and confirm again."],
    ["Pesanan {code} {status}. Total {total} untuk {count} produk. Batalkan draft sebelum mengubah keranjang.", "Order {code} is {status}. The total is {total} for {count} items. Cancel the draft before editing the cart."],
    ["{name} dihapus dari keranjang. {summary}", "I removed {name} from your cart. {summary}"],
    ["{name} sudah masuk keranjang, Kak. Jumlahnya {count}.", "I added {name} to your cart. The quantity is now {count}."],
    ["Aku catat budget {budget}. Kak mencari sofa, meja, kursi, atau penyimpanan?", "I’ve noted your {budget} budget. Are you looking for a sofa, table, chair, or storage?"],
    ["Belum ada pilihan {range} dari rekomendasi terakhir, Kak. Aku bisa cek kategori lain.", "There’s nothing {range} in the same selection. I can check another category if you’d like."],
    ["Ringkasan pesanan {code} siap diteruskan untuk konfirmasi stok, harga final, pembayaran, dan pengiriman.", "Order {code} is ready to share for stock, final pricing, payment, and delivery confirmation."],
    ["Aku bantu buat tambahan pesanan, Kak. Pilihan berikutnya dicatat terpisah dari pesanan sebelumnya.", "I’ll help you prepare an additional order. Your next selections will be tracked separately from the previous order."],
    ["Ada {count} produk di keranjang dengan total {total}.{items}", "Your cart contains {count} items totaling {total}.{items}"],
    ["Aku menemukan {count} pilihan di katalog. Ini hasilnya:", "I found {count} options in the catalog. Here they are:"],
    ["Aku prioritaskan kebutuhan utama ruangan dulu, lalu item pendukung selama masih masuk budget.", "I started with the essentials and added pieces that fit the remaining budget."],
    ["Paket {room} siap. Budget {budget}. {priority} {style} {reason}", "Your {room} package is ready. Budget: {budget}. {priority} {style} {reason}"],
    ["Preferensi gaya sudah aku catat.", "I’ve kept your style preference in mind."],
    ["Cari produk lain", "Show other products"],
    ["Bandingkan produk pertama dan kedua", "Compare the first and second products"],
    ["Tambah yang pertama", "Add the first product"],
    ["Tambah yang kedua", "Add the second product"],
    ["Tambahkan semua ke keranjang", "Add everything to the cart"],
    ["Ganti sofa", "Replace the sofa"],
    ["Lihat Katalog", "View Catalog"],
    ["INTERNAL DEMO ONLY", "UNOFFICIAL CONCEPT DEMO"],
    ["— Unofficial Concept for Evaluation", "— Interactive AI Retail Showcase (Simulated pricing & branch stock)"],
    ["MICROSITE CABANG · KONSEP INTERNAL", "BRANCH MICROSITE · INTERNAL CONCEPT"],
    ["SELAMAT DATANG", "WELCOME"],
    ["Inspirasi untuk rumah Anda.", "Inspiration for your home."],
    ["Mulai percakapan dengan tim INFORMA Sun City Mall Sidoarjo.", "Start a conversation with the INFORMA Sun City Mall Sidoarjo team."],
    ["JELAJAHI INFORMA SUN CITY MALL SIDOARJO", "EXPLORE INFORMA SUN CITY MALL SIDOARJO"],
    ["Lantai 1 Mall Sun City · Jl. Pahlawan No. 01", "Mall Sun City, Level 1 · Jl. Pahlawan No. 01"],
    ["Sidokumpul, Sidoarjo, Jawa Timur 61213", "Sidokumpul, Sidoarjo, East Java 61213"],
    ["Sidoarjo, Jawa Timur", "Sidoarjo, East Java"],
    ["Sidoarjo, Jawa Timur 61213", "Sidoarjo, East Java 61213"],
    ["Kenali pilihan.", "Explore the collection."],
    ["Temui kami.", "Visit us."],
    ["Pilih inspirasi ruang Anda, lalu konsultasikan", "Find inspiration for your space, then check"],
    ["harga dan ketersediaannya dengan tim INFORMA Sun City Mall Sidoarjo.", "pricing and availability with the INFORMA Sun City Mall Sidoarjo team."],
    ["Cek Harga & Stok Produk", "Check Prices & Availability"],
    ["Demo internal · harga referensi dan status stok simulasi", "Internal demo · reference prices and simulated availability"],
    ["Hangat. Dekat. Terasa seperti rumah.", "Warm. Welcoming. Like home."],
    ["Visual inspirasi INFORMA • bukan foto cabang", "INFORMA inspiration imagery · not a branch photo"],
    ["Temukan yang cocok untuk Anda.", "Find what suits your space."],
    ["Mulai dari ruang impian Anda.", "Start with the room you imagine."],
    ["Kenali pilihan sebelum berkunjung.", "Explore your options before visiting."],
    ["Lantai 1 · Jl. Pahlawan No. 01, Sidokumpul", "Level 1 · Jl. Pahlawan No. 01, Sidokumpul"],
    ["Sumber visual ↗", "Image sources ↗"],
    ["Keranjang Naya", "Naya’s Cart"],
    ["Tanya Naya", "Ask Naya"],
    ["Hai Kak, selamat datang di INFORMA Suncity.", "Hi there, welcome to INFORMA Suncity."],
    ["Ada yang bisa kami bantu, Kak?", "How can I help you today?"],
    ["Pesan untuk Naya", "Message for Naya"],
    ["Jelajahi INFORMA", "Explore INFORMA"],
    ["Saya siap bantu carikan pilihan yang cocok, Kak.", "I’m here to help you find the right fit."],
    ["Siap membantu", "Ready to help"],
    ["Cari Produk", "Find Products"],
    ["Bantu Saya Memilih", "Help Me Choose"],
    ["Harga referensi demo · stok cabang dikonfirmasi oleh sales.", "Demo reference prices · branch stock is confirmed by the sales team."],
    ["Pembuka INFORMA Sun City Mall Sidoarjo", "Welcome to INFORMA Sun City Mall Sidoarjo"],
    ["Inspirasi ruang tamu dari INFORMA", "Living room inspiration from INFORMA"],
    ["Kembali ke pembuka", "Back to the opening screen"],
    ["Jelajahi pengalaman", "Explore the experience"],
    ["Tutup panel", "Close panel"],
    ["Buka Keranjang Naya", "Open Naya’s Cart"],
    ["Tutup Keranjang Naya", "Close Naya’s Cart"],
    ["Buka Naya Sales Assistant", "Open Naya, Sales Assistant"],
    ["Sapaan Naya", "Naya’s welcome"],
    ["Nyalakan suara Naya", "Turn on Naya’s sound"],
    ["Matikan suara Naya", "Mute Naya’s sound"],
    ["Tulis kebutuhan Kak di sini…", "Tell me what you’re looking for…"],
    ["Kirim pesan", "Send message"],
    ["Minimalkan workspace", "Minimize workspace"],
    ["Minimalkan", "Minimize"],
    ["Perluas workspace", "Expand workspace"],
    ["Perluas", "Expand"],
    ["Tutup workspace", "Close workspace"],
    ["Workspace rekomendasi", "Recommendation workspace"],
    ["Pilihan cepat Naya", "Naya’s quick actions"],
    ["Ceritakan kebutuhan Kak…", "Tell me what you’re looking for…"],
    ["Kirim kebutuhan ke Naya", "Send your message to Naya"],
    ["Bahasa", "Language"],
    ["Kebutuhan Kak", "Your request"],
    ["Pilihkan produk yang sesuai untuk saya.", "Help me find the right products."],
    ["REKOMENDASI INFORMA", "INFORMA RECOMMENDATIONS"],
    ["Rekomendasi produk INFORMA", "INFORMA product recommendations"],
    ["Mulai dari kebutuhan Kak.", "Let’s start with what you need."],
    ["Cari produk, susun ruang, atau minta Naya memilihkan.", "Find products, plan a room, or ask Naya for suggestions."],
    ["Hai Kak, aku Naya. Ceritakan kebutuhan furnitur atau ruangannya, ya. Aku bantu carikan pilihan yang cocok.", "Hi, I’m Naya. Tell me what furniture you need or which room you’re working on. I’ll help you find options that fit."],
    ["Naya sedang menyiapkan pilihan…", "Naya is looking for options…"],
    ["Lihat Produk", "View Product"],
    ["Bandingkan", "Compare"],
    ["Tambah", "Add"],
    ["DETAIL PRODUK", "PRODUCT DETAILS"],
    ["Lihat Produk ↗", "View Product ↗"],
    ["Tambah ke Keranjang Naya", "Add to Naya’s Cart"],
    ["Bandingkan pilihan", "Compare options"],
    ["Total Produk", "Product total"],
    ["Ganti Produk", "Replace Product"],
    ["Lebih Hemat", "More Affordable"],
    ["Upgrade Pilihan", "Upgrade Options"],
    ["Tambah Produk", "Add Products"],
    ["Tambahkan Semua ke Keranjang", "Add All to Cart"],
    ["Ruang mana yang ingin ditata?", "Which room are you planning?"],
    ["Ruang Tamu", "Living Room"],
    ["Kamar Tidur", "Bedroom"],
    ["Ruang Makan", "Dining Room"],
    ["Ruang Kerja", "Home Office"],
    ["Setelah itu Naya akan minta ukuran, budget, dan preference.", "Next, Naya will ask about your room size, budget, and preferences."],
    ["Keranjang Naya masih kosong", "Naya’s Cart is empty"],
    ["Naya siap bantu carikan produk atau menyusun kebutuhan ruangan.", "Naya can help you find products or plan a room."],
    ["Sudah dipilih bersama Naya", "Your selections with Naya"],
    ["Daftar Barang", "Order Items"],
    ["Harga satuan", "Unit price"],
    ["Tambah jumlah", "Increase quantity"],
    ["+ Tambah Barang Lagi", "+ Add More Items"],
    ["Cari Barang dengan Naya", "Browse Products with Naya"],
    ["Ubah Pesanan", "Edit Cart & Details"],
    ["Hapus", "Remove"],
    ["Total Keranjang Naya", "Naya’s Cart total"],
    ["Proses Pesanan", "Prepare Order"],
    ["Kosongkan Keranjang", "Clear Cart"],
    ["Kosongkan", "Clear All"],
    ["Ada 1 produk tersimpan", "You have 1 saved item"],
    ["Ada {count} produk tersimpan", "You have {count} saved items"],
    ["Lihat Keranjang", "Open Cart"],
    ["Mulai Pesanan Baru", "Start New Order"],
    ["NAYA MENYIAPKAN PESANAN", "NAYA IS PREPARING YOUR ORDER"],
    ["Pesanan Siap Diteruskan", "Order Ready for Handoff"],
    ["Pesanan Sudah Diteruskan ke Sales", "Sales Handoff Started"],
    ["Order:", "Order:"],
    ["Tim sales INFORMA Suncity akan mengonfirmasi stok, harga final, pembayaran, dan pengiriman.", "The INFORMA Suncity sales team will confirm stock, final pricing, payment, and delivery."],
    ["Lanjut ke Sales", "Continue to Sales"],
    ["Data untuk tim sales", "Details for the sales team"],
    ["Sebelum Naya teruskan, isi data pengiriman Kakak dulu ya.", "Please enter your delivery details before Naya prepares the handoff."],
    ["Nama", "Name"],
    ["Nomor WhatsApp", "WhatsApp Number"],
    ["Penerimaan", "Order fulfillment"],
    ["Dikirim", "Delivery"],
    ["Ambil di Store", "Store Pickup"],
    ["Alamat pengiriman", "Delivery Address"],
    ["Catatan", "Notes"],
    ["(opsional)", "(optional)"],
    ["Lanjutkan", "Continue"],
    ["RINGKASAN DARI NAYA", "NAYA’S ORDER SUMMARY"],
    ["Pesanan sebelum diteruskan", "Review your order"],
    ["Stok dan harga final akan dikonfirmasi oleh tim sales.", "The sales team will confirm stock and final pricing."],
    ["Konfirmasi Pesanan", "Confirm Order"],
    ["Selesai belanja?", "Finish shopping?"],
    ["Pesanan yang sudah diteruskan ke sales tetap aman.", "Orders handed off to the sales team are unaffected."],
    ["Setelah sesi ditutup, keranjang dan data sementara di Naya akan dibersihkan.", "Finishing this session clears your cart and temporary details."],
    ["Ya, Selesai Belanja", "Yes, Finish Shopping"],
    ["Kembali", "Back"],
    ["Terima kasih sudah berbelanja bersama INFORMA Suncity Sidoarjo. ✨", "Thank you for shopping with INFORMA Suncity Sidoarjo. ✨"],
    ["Pesanan Kakak sudah diteruskan ke tim sales untuk proses selanjutnya.", "Your order is ready for the sales team to review."],
    ["Tim kami akan membantu konfirmasi stok, harga final, metode pembayaran, serta pengiriman melalui WhatsApp.", "Our team will help confirm stock, final pricing, payment, and delivery on WhatsApp."],
    ["Sampai jumpa, dan semoga pilihan Kakak membuat rumah semakin nyaman. 🏡", "See you next time. We hope your choices make your home feel even more welcoming. 🏡"],
    ["Tutup", "Close"],
    ["Tambah Pesanan", "Add to Order"],
    ["Selesai Belanja", "Finish Shopping"],
    ["Kurangi", "Decrease quantity"],
    ["Harga referensi belum tersedia", "Reference price unavailable"],
    ["✓ Ditambahkan ke Keranjang Naya", "✓ Added to Naya’s Cart"],
    ["Pilih 1 lagi", "Select one more"],
    ["Lebih Murah", "Lower Price"],
    ["Pilihan Lain", "Other Options"],
    ["Tambah Pertama", "Add First Item"],
    ["Tambah Kedua", "Add Second Item"],
    ["Kembali ke Pilihan", "Back to Options"],
    ["Tambah Semua", "Add All"],
    ["Lanjut Belanja", "Keep Shopping"],
    ["Hasil Build My Room", "Build My Room results"],
    ["Produk Build My Room", "Build My Room products"],
    ["Kosongkan seluruh Keranjang Naya? Percakapan Naya tetap tersimpan.", "Clear all items from Naya’s Cart? Your conversation will be kept."],
    ["Nomor WhatsApp sales demo belum dikonfigurasi.", "The demo sales WhatsApp number has not been configured."],
    ["Pesanan ini belum siap diteruskan ke sales.", "This order is not ready for the sales handoff."],
    ["Keranjang masih kosong.", "Your cart is empty."],
    ["Nama belum diisi.", "Please enter your name."],
    ["Nomor WhatsApp-nya belum terbaca dengan benar, Kak. Bisa dicek lagi ya.", "Please check your WhatsApp number."],
    ["Pilih metode penerimaan pesanan.", "Please choose delivery or store pickup."],
    ["Alamat pengiriman belum cukup lengkap, Kak.", "Please enter a more complete delivery address."],
    ["Tambahan pesanan sudah diteruskan ke sales ya, Kak. Tim sales akan membantu menentukan apakah dapat digabung dengan pesanan sebelumnya.", "The sales team can help determine whether this additional order can be combined with the previous one."],
    ["Tim sales akan membantu konfirmasi stok, harga final, pembayaran, dan pengiriman melalui WhatsApp.", "The sales team can confirm stock, final pricing, payment, and delivery on WhatsApp."],
    ["Tinjau draft pesanan ini, lalu buka WhatsApp untuk meneruskannya ke sales. Pesan tidak terkirim sebelum Kakak menekan Kirim di WhatsApp.", "Review your draft, then open WhatsApp to contact sales. The message is sent when you tap Send in WhatsApp."],
    ["Tambahan dari", "Additional order for"],
    ["Tanyakan koleksi ↗", "Ask About This Collection ↗"],
    ["Menyiapkan 30 produk pilihan…", "Loading 30 curated products…"],
    ["Lihat produk resmi ↗", "View Official Product ↗"],
    ["Untuk versi produksi, status ini diganti koneksi stok INFORMA Sun City Mall Sidoarjo.", "Live branch stock would require an inventory connection to INFORMA Sun City Mall Sidoarjo."],
    ["Coba lagi", "Try Again"],
    ["Lihat arah pilihan saya ↗", "See My Options ↗"],
    ["Lantai 1 Mall Sun City, Jl. Pahlawan No. 01, RW 6, Sidokumpul, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur 61213. Jam operasional dan kontak sales perlu konfirmasi.", "Mall Sun City, Level 1, Jl. Pahlawan No. 01, RW 6, Sidokumpul, Sidoarjo, East Java 61213. Please confirm opening hours and sales contact details."],
    ["Alamat pada situs resmi INFORMA ↗", "Address on the Official INFORMA Site ↗"],
    ["Siapkan pertanyaan kunjungan ↗", "Prepare a Visit Inquiry ↗"],
    ["INFORMA — Ruang Tamu ↗", "INFORMA — Living Room ↗"],
    ["Kurasi: Sofa, Kursi, Meja, Lemari & Rak. Tidak ada klaim harga, stok cabang, atau promosi. Hak merek dan foto tetap pada pemiliknya. Build My Room menggunakan 30 foto produk asli dari INFORMA Shop the Look dan Ruparupa. Komposisi 2D bukan denah berskala. Tiap item memiliki tautan sumber resmi.", "Curated collections include sofas, chairs, tables, cabinets, and shelving. This demo does not claim branch prices, stock, or promotions. Brand and photo rights belong to their owners. Build My Room uses 30 official product photos from INFORMA Shop the Look and Ruparupa. The 2D composition is not a scaled floor plan. Each item links to its official source."],
    ["Bawa pilihan saya ke konsultasi ↗", "Bring My Selections to a Consultation ↗"],
    ["HARGA & STOK / SUN CITY", "PRICES & AVAILABILITY / SUN CITY"],
    ["Cek pilihan Anda.", "Check your selections."],
    ["Harga referensi produk resmi INFORMA. Status stok di bawah adalah simulasi untuk demo internal, bukan stok live cabang.", "Reference prices are for official INFORMA products. Availability shown here is simulated for this internal demo."],
    ["Harga referensi dari katalog resmi INFORMA, diperiksa 16 September 2026. Status stok ditampilkan sebagai simulasi demo internal.", "Reference prices are from the official INFORMA catalog, checked September 16, 2026. Availability is simulated for this demo."],
    ["Tersedia", "Available"],
    ["Belum tersedia", "Unavailable"],
    ["Perlu dicek", "Check required"],
    ["status demo", "demo status"],
    ["Data belum dapat dimuat.", "We couldn’t load the data."],
    ["Silakan coba lagi.", "Please try again."],
    ["Biar kami mengenal ruang Anda.", "Tell us about your space."],
    ["Pilih kebutuhan Anda untuk menyusun bahan konsultasi.", "Choose what matters to you to prepare for a consultation."],
    ["01 — Ruang yang ingin Anda lengkapi", "01 — Room to furnish"],
    ["02 — Gaya yang Anda suka", "02 — Your preferred style"],
    ["03 — Yang paling penting", "03 — Your top priority"],
    ["Ruang tamu", "Living room"],
    ["Kamar tidur", "Bedroom"],
    ["Ruang makan", "Dining room"],
    ["Ruang kerja", "Home office"],
    ["Minimalis hangat", "Warm minimalism"],
    ["Kenyamanan", "Comfort"],
    ["Penyimpanan", "Storage"],
    ["Tampilan", "Appearance"],
    ["Temukan inspirasi untuk setiap ruang.", "Find inspiration for every room."],
    ["Foto dan produk resmi INFORMA untuk bahan konsultasi dengan cabang. Bukan denah atau bukti stok showroom.", "Official INFORMA photos and products for branch consultations. Showroom layout and stock are not shown here."],
    ["Sampai bertemu di INFORMA Sun City Mall Sidoarjo.", "Visit us at INFORMA Sun City Mall Sidoarjo."],
    ["Microsite konsep untuk membantu Anda memulai konsultasi dengan cabang.", "This concept microsite helps you start a consultation with the branch."],
    ["Inspirasi dengan sumber yang jelas.", "Where the inspiration comes from."],
    ["Foto kategori di demo berasal dari halaman resmi INFORMA. Foto tersebut tidak dinyatakan sebagai foto showroom INFORMA Sun City Mall Sidoarjo.", "Category photos in this demo come from official INFORMA pages. They are not photos of the INFORMA Sun City Mall Sidoarjo showroom."],
    ["Pilihan Anda:", "Your selections:"],
    ["Berikut inspirasi kategori ruang tamu resmi INFORMA untuk bahan konsultasi.", "Here are official INFORMA living room collections to inspire your consultation."],
    ["Untuk ruang ini, siapkan konsultasi khusus dengan tim INFORMA Sun City Mall Sidoarjo. Galeri berikut hanya referensi kategori ruang tamu INFORMA, bukan rekomendasi produk untuk ruang pilihan Anda.", "For a room like this, prepare a dedicated consultation with the branch team. The gallery shows INFORMA living room references for inspiration."],
    ["Tanyakan koleksi", "Ask about the collection"],
    ["Kursi", "Chairs"],
    ["Meja", "Tables"],
    ["Lemari & rak", "Cabinets & shelving"],
    ["Pilih produk di katalog untuk mulai menyusun.", "Pick a product from the catalog to start planning."],
    ["+ Keranjang", "+ Cart"],
    ["Memuat 30 produk resmi INFORMA…", "Loading 30 official INFORMA products…"],
    ["Katalog belum dapat dimuat.", "We couldn’t load the catalog."],
    ["Ruang Anda. Pilihan INFORMA.", "Your space. INFORMA choices."],
    ["Suasana", "Mood"],
    ["Geser produk · sentuh untuk memilih", "Drag to move · tap to select"],
    ["Ukuran visual", "Visual size"],
    ["Ke depan", "Bring Forward"],
    ["Hapus pilihan", "Remove Selection"],
    ["Foto produk resmi • komposisi 2D, bukan denah berskala. Harga dan stok cabang perlu konfirmasi.", "Official product photos · 2D composition, not to scale. Confirm price and stock with the branch."],
    ["Cek harga & stok pilihan saya ↗", "Check My Selections ↗"],
    ["Jenis produk", "Product category"],
    ["Bidang susun produk INFORMA", "INFORMA product arrangement area"],
    ["30 produk INFORMA", "30 INFORMA products"],
    ["Produk sebelumnya", "Previous products"],
    ["Produk berikutnya", "Next products"],
    ["30 produk pilihan", "30 curated products"],
    ["8 jenis · katalog resmi", "8 categories · official catalog"],
    ["Foto belum termuat", "Image unavailable"],
    ["Foto belum termuat. Buka sumber resmi untuk melihat produk.", "Image unavailable. Open the official source to view the product."],
    ["Pilih produk untuk mengaturnya", "Select a product to adjust it"],
    ["✓ Dipilih", "✓ Selected"],
    ["+ Susun ruang", "+ Place in room"],
    ["Semua", "All"],
    ["Sofa & kursi", "Sofas & chairs"],
    ["Meja & nakas", "Tables & nightstands"],
    ["Dekorasi", "Décor"],
    ["Dinding & cermin", "Wall décor & mirrors"],
    ["Karpet & tekstil", "Rugs & textiles"],
    ["Lampu", "Lighting"],
    ["Tanaman", "Plants"],
    ["Visual resmi INFORMA · bukan foto cabang", "Official INFORMA imagery · not a branch photo"],
    ["Cek harga & stok ↗", "Check Price & Availability ↗"],
    ["Kategori showroom", "Showroom categories"],
    ["Pilihan penyimpanan untuk area kerja. Kurasi demo ini belum memuat meja dan kursi kerja.", "Storage options for workspaces. This demo’s curated selection does not include desks or office chairs."],
    ["Pilihan dari katalog resmi untuk bahan konsultasi. Harga dan stok cabang perlu dikonfirmasi.", "Selections from the official catalog to help with your consultation. Confirm branch prices and stock with the sales team."],
    ["{count} produk", "{count} products"],
    ["1 produk", "1 product"],
    ["{count} produk dipilih", "{count} products selected"],
    ["1 produk dipilih", "1 product selected"],
    ["{count} pilihan dari katalog", "{count} options from the catalog"],
    ["1 pilihan dari katalog", "1 option from the catalog"],
    ["Tambahkan {name}", "Add {name}"],
    ["{name}. Geser dengan mouse, sentuhan, atau tombol panah.", "{name}. Move with a mouse, touch, or arrow keys."],
    ["Inspirasi {name} dari INFORMA", "{name} inspiration from INFORMA"],
    ["{name} dipilih.", "{name} selected."],
    ["{name} ditambahkan ke keranjang.", "{name} added to the cart."],
    ["{current} / {pages} · {count} item", "{current} / {pages} · {count} items"],
    ["Sisa budget:", "Remaining budget:"],
    ["Produk rekomendasi", "Recommended products"],
  ];
  const dictionaries = Object.freeze({
    en: Object.freeze(Object.fromEntries(pairs)),
    id: Object.freeze(Object.fromEntries(pairs.map(([key]) => [key, key]))),
  });
  const isLocale = value => value === 'en' || value === 'id';
  function detectChatLanguage(message, fallbackLocale = 'en') {
    const input = String(message ?? '').normalize('NFKC').toLowerCase();
    const requested = input.match(/\b(?:(?:answer|reply|respond|write|continue|chat|speak)(?: to me)? in|(?:jawab|balas|lanjut(?:kan)?|bicara)(?: dalam| pakai| dengan| menggunakan)|(?:responde|contesta|habla) en)\s+(?:bahasa\s+)?([\p{L}-]+)/u)?.[1]
      ?? input.match(/(?:^|[.!?]\s+)(?:please\s+)?(?:use|gunakan|pakai|speak)\s+(?:bahasa\s+)?([\p{L}-]+)/u)?.[1]
      ?? input.match(/^(?:in\s+)?(english|indonesian|inggris|indonesia|japanese|spanish|french|german|jepang|spanyol|español)(?:,?\s+please)?[.!?]?$/u)?.[1];
    if (requested && !/^(?:more|detail|short|one|full|bullet|the|a|an|to|with|about|ini|itu|singkat)$/.test(requested)) {
      if (/^(?:english|inggris)$/.test(requested)) return 'en';
      if (/^(?:indonesian|indonesia|bahasa indonesia)$/.test(requested)) return 'id';
      return 'auto';
    }
    if (/(?!\p{Script=Latin})\p{L}/u.test(input) ||
      /^(?:hola|bonjour|bonsoir|salut|ciao|gracias|merci|danke)[!,.\s]*$/u.test(input)) return 'auto';
    const words = input.replace(/[’']/g,'').match(/[\p{L}]+/gu) || [];
    const terms = words.join(' ')
      .replace(/\bcarim?(?=(?:perabot|furnitur|meja|kursi|sofa))/g,'cari ')
      .replace(/\b(yg|brp|cri?|dsk|plz|utk|kntor)\b/g,word=>({yg:'yang',brp:'berapa',cr:'cari',cri:'cari',dsk:'desk',plz:'please',utk:'untuk',kntor:'kantor'})[word]);
    // Shared words such as sofa, budget, promo and link carry no language signal on their own.
    const id = terms.match(/\b(?:aku|saya|kak(?:ak)?|anda|mau|butuh|cari|nyari|tolong|boleh|ada|barang(?:nya)?|produknya|tautan|mana|berapa|harga|murah|diskon|perabot(?:an)?|furnitur|dapur|meja|kursi|ruang(?:an)?|kamar|gimana|bagaimana|kenapa|terima kasih|halo|ini|itu|ingin|tampilkan|dong|tersedia|yang|untuk|bisa|tidak|iya|dan|kecil|lemari|lampu|kasur)\b/g)?.length || 0;
    const en = terms.match(/\b(?:i|im|id like|ive|you|your|need|want|looking|find|show|please|would|can|could|where|which|what|why|how|much|price|cheaper|discount|furniture|kitchen|table|desk|chair|room|bedroom|office|official|hello|hi|thanks|yes|the|is|for|and|good morning|good evening)\b/g)?.length || 0;
    const idScore = id + 2 * (terms.match(/\b(?:aku|saya|kak(?:ak)?|nyari|tolong|barang(?:nya)?|tautan|berapa|gimana)\b/g)?.length || 0);
    const enScore = en + 2 * (terms.match(/\b(?:i|im|id like|ive|call me|my name is|where|which|what|please)\b/g)?.length || 0);
    if (idScore > enScore) return 'id';
    if (enScore > idScore) return 'en';
    // Codes, model names and brief replies can use the interface language as a hint.
    if (words.length<3) return isLocale(fallbackLocale) ? fallbackLocale : 'en';
    return 'auto';
  }
  function detectMessageLocale(message, fallbackLocale = 'en') {
    const language = detectChatLanguage(message, fallbackLocale);
    return isLocale(language) ? language : isLocale(fallbackLocale) ? fallbackLocale : 'en';
  }
  function resolveLocale(search = '', storage) {
    const requested = new URLSearchParams(search).get('lang');
    if (isLocale(requested)) return requested;
    try {
      const saved = storage?.getItem(storageKey);
      if (isLocale(saved)) return saved;
    } catch {}
    return 'en';
  }

  const doc = root?.document;
  let storage;
  try { storage = root?.localStorage; } catch {}
  let locale = resolveLocale(root?.location?.search, storage);
  const message = (key, values = {}) => ({ key, values });
  const format = (value, language = locale) =>
    typeof value === 'object' && value !== null
      ? text(value.key, value.values, language)
      : String(value ?? '');
  const text = (key, values = {}, language = locale) => {
    const singular = values.count === 1 ? key.replace('{count}', '1') : key;
    const dictionary = dictionaries[language] || dictionaries.en;
    return (dictionary[singular] ?? dictionary[key] ?? key)
      .replace(/\{(\w+)\}/g, (match, name) =>
        Object.hasOwn(values, name) ? format(values[name], language) : match);
  };
  const replyRetry = 'Maaf, Kak, tadi pesannya terlewat. Bisa ulangi atau sebutkan produk yang Kakak suka? Aku bantu dari sana.';
  const replyBusy = 'Sebentar ya, Kak. Obrolannya sedang ramai. Kalau sudah siap, sebutkan produk yang Kakak suka dan kita lanjut dari sana.';
  const normalizeWords = value => value.normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const indonesianPhrasing = /\b(?:kak(?:ak)?|ruang (?:tamu|kerja|makan)|kamar tidur|(?:aku|saya|kami) (?:perlu|bisa|akan|paham|mau|tidak|belum|punya)|(?:anda|kamu) (?:bisa|ingin|mau)|(?:tidak|belum|masih) (?:tersedia|bisa|ada)|(?:harga|stok) (?:produk|referensi|terbaru|cabang)|(?:produk|pilihan) (?:ini|itu|tersebut)|terima kasih|selamat datang|silakan|nggak|apakah|sebutkan)\b/;
  const catalogPhrases = new WeakMap();
  const personaLeak = /\b(?:asisten virtual|virtual (?:sales )?assistant|virtual retail concierge|artificial intelligence assistant|kecerdasan buatan|ai|chatbot|bot|demo)\b/;
  const personaClaim = /\b(?:asisten virtual|virtual (?:sales )?assistant|(?:i am|i m|saya|aku)(?: an?| adalah)? (?:ai|bot|chatbot))\b/;
  const englishPhrasing = /\b(?:i (?:can|could|have|found|would)|how can i|you (?:can|could|might|are)|we (?:have|can)|let me (?:help|know|show))\b/;

  function replyIssue(value, language, catalog) {
    if (typeof value !== 'string' || !value.trim()) return 'empty_reply';
    let prose = ' ' + normalizeWords(value) + ' ';
    if (Array.isArray(catalog)) {
      if (!catalogPhrases.has(catalog)) {
        const names = catalog.flatMap(({ name }) => typeof name === 'string'
          ? [name, name.replace(/^informa\s+/i, '')] : []);
        catalogPhrases.set(catalog, [...new Set(names.map(normalizeWords).filter(Boolean))]
          .sort((a,b) => b.length-a.length));
      }
      for (const name of catalogPhrases.get(catalog)) {
        prose = prose.replaceAll(' ' + name + ' ', ' ');
      }
    }
    const replyLanguage = detectChatLanguage(prose,language);
    if (language==='auto'||replyLanguage==='auto') {
      // A word such as "ai" can be ordinary prose in another language.
      return personaClaim.test(prose)?'persona_leak':null;
    }
    if (personaLeak.test(prose)) return 'persona_leak';
    if (language === 'en' && indonesianPhrasing.test(prose)) return 'indonesian_phrasing';
    if (language === 'id' && replyLanguage === 'en' && englishPhrasing.test(prose) && !indonesianPhrasing.test(prose)) return 'english_phrasing';
    return /\bkak\s+kak\b/.test(prose) ? 'duplicate_salutation' : null;
  }
  const acceptsReply = (...args) => replyIssue(...args) === null;

  function conciergeMessage(intent) {
    if (intent?.type === 'off-topic') {
      return message('Wah, pertanyaannya menarik, Kak. Kalau mau kembali lihat-lihat furnitur, aku siap bantu. Ada ruang atau produk yang sedang Kakak incar?');
    }
    if (intent?.type !== 'discount') return message(replyRetry);
    if (intent.percent != null) {
      return message('Aku paham ingin dapat harga terbaik, Kak! Diskon {percent}% belum bisa aku tawarkan. Aku bisa bantu cari pilihan serupa yang lebih terjangkau. Kisaran budget Kakak berapa?', { percent: intent.percent });
    }
    return message('Aku paham, Kak. Belum ada potongan harga yang bisa aku pastikan, tapi aku bisa bantu bandingkan pilihan yang lebih terjangkau. Kisaran budget Kakak berapa?');
  }
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const encode = value => encodeURIComponent(value).replace(/'/g, '%27').replace(/-/g, '%2D');
  const marker = (key, values) => '@' + encode(JSON.stringify([key, values]));
  function decode(value) {
    if (!value.startsWith('@')) return [value];
    try {
      const decoded = JSON.parse(decodeURIComponent(value.slice(1)));
      if (Array.isArray(decoded) && typeof decoded[0] === 'string') return decoded;
    } catch {}
    return [value];
  }
  const label = (key, values = {}) =>
    '<!--naya-copy:' + marker(key, values) + '-->' + escape(text(key, values)) + '<!--/naya-copy-->';
  const attribute = (name, key, values = {}) =>
    'data-copy-' + name + '="' + marker(key, values) + '" ' + name + '="' + escape(text(key, values)) + '"';
  const attrs = ['aria-label', 'placeholder', 'title', 'alt', 'data-image-fallback'];
  const bindings = new WeakMap();

  function bindText(element, key, values = {}) {
    if (!element) return;
    const value = text(key, values);
    if (element.textContent !== value) element.textContent = value;
    bindings.set(element, [key, values]);
    element.setAttribute('data-copy-bound', '');
  }

  function unbindText(element) {
    bindings.delete(element);
    element.removeAttribute('data-copy-bound');
  }

  function apply(node) {
    if (node.nodeType === 8) {
      if (!node.data.startsWith('naya-copy:')) return;
      const [key, values] = decode(node.data.slice(10));
      const value = text(key, values);
      const sibling = node.nextSibling;
      if (sibling?.nodeType === 3) {
        const current = sibling.nodeValue;
        const replacement = current.match(/^\s*/)[0] + value + current.match(/\s*$/)[0];
        if (current !== replacement) sibling.nodeValue = replacement;
      }
      return;
    }
    if (node.nodeType === 1) {
      const binding = bindings.get(node);
      if (binding) bindText(node, ...binding);
      applyAttributes(node);
    }
    if (![1, 9, 11].includes(node.nodeType)) return;
    const walker = doc.createTreeWalker(node, 128);
    while (walker.nextNode()) apply(walker.currentNode);
    for (const child of node.querySelectorAll(
      [...attrs.map(name => '[data-copy-' + name + ']'), '[data-copy-bound]'].join(',')
    )) {
      const binding = bindings.get(child);
      if (binding) bindText(child, ...binding);
      applyAttributes(child);
    }
  }

  function applyAttributes(element) {
    for (const name of attrs) {
      const encoded = element.getAttribute('data-copy-' + name);
      if (encoded !== null) element.setAttribute(name, text(...decode(encoded)));
    }
  }

  function sync() {
    doc.documentElement.lang = locale;
    apply(doc);
    doc.querySelectorAll('button[data-locale]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.locale === locale))
    );
  }

  function selectLocale(next) {
    if (!isLocale(next)) return;
    locale = next;
    try { storage?.setItem(storageKey, next); } catch {}
    const url = new URL(root.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next);
      root.history.replaceState(root.history.state, '', url);
    }
    sync();
    doc.dispatchEvent(new CustomEvent('naya:localechange', { detail: locale }));
  }

  const api = Object.freeze({
    dictionaries, resolveLocale, detectMessageLocale, detectChatLanguage, get locale() { return locale; },
    text, message, format, acceptsReply, replyIssue, replyRetry, replyBusy, conciergeMessage,
    label, attribute, bindText, unbindText, apply,
  });
  if (typeof module !== 'undefined') module.exports = api;
  if (!doc) return;
  root.NayaI18n = api;
  doc.documentElement.lang = locale;

  doc.addEventListener('DOMContentLoaded', () => {
    const headerToggle = doc.querySelector('.locale-toggle');
    for (const header of doc.querySelectorAll('#panel .panel-head, #cartDialog .cart-head')) {
      header.insertBefore(headerToggle.cloneNode(true), header.lastElementChild);
    }
    doc.addEventListener('click', event => {
      const button = event.target.closest('button[data-locale]');
      if (button) selectLocale(button.dataset.locale);
    });
    sync();

    // Translate new UI fragments while leaving customer messages and model output alone.
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) apply(node);
          if (node.nodeType === 8) apply(node);
        }
      }
    });
    observer.observe(doc.body, { childList: true, subtree: true });
  });
})(typeof window === 'undefined' ? null : window);
