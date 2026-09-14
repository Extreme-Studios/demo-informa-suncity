# INFORMA Sun City — internal concept

Mobile-first single-screen microsite. Run `npm ci`, then `npm start` and open http://localhost:4173. Three.js renders lifestyle scene transitions; GSAP coordinates the opening and panels. Official lifestyle photos are bundled in assets. Floating foreground crops are 2.5D, not rotatable furniture models.

Personal Shopper opens the Gemini chatbot. Room planner and category explorer remain concept panels. Consultation summary can be copied. Set WHATSAPP_NUMBER in app.js only after branch approval. No live stock integration.

The local backend reads the existing Windows generic credential through read-credential.ps1, keeping the key in server memory only. Cloud hosting must use a server-side GEMINI_API_KEY secret; it cannot access this computer's Credential Manager. GEMINI_MODEL defaults to gemini-2.5-flash. This server binds localhost and rejects remote Host/Origin values; it is deliberately local-only until hosting/authentication and usage controls are configured. Do not publish the API unauthenticated. npm test checks validation, origin rejection, and isolation of server/credential files.

Lifestyle and product assets: https://informa.co.id/shop-the-look (2026-09-14), Local Furniture Collection, Serene Bedroom, Modern Comfort Family Room. Official current anniversary logo downloaded from the same page. Tagline source: https://informa.co.id/csr-events/informa-anniversary-15. These are central-brand visuals, not Suncity branch photographs.

Official image source: https://informa.co.id/room-of-inspiration/living_room (reviewed 2026-09-14). Four category images referenced from its CDN; rights retained by owners. They are not Suncity branch photographs. No invented product names, prices or availability. Assets require external network access; fonts have local fallbacks.

This is an unofficial internal demonstration. Domain and live hosting have not been configured. Source can be managed in a private GitHub repository. GitHub Pages commercial-use restrictions must be reviewed before hosting this sales-oriented demo there; storing source on GitHub is separate from hosting.
## Build My Room: 30 produk resmi

Identitas: INFORMA Sun City Mall Sidoarjo. Alamat: Lantai 1 Mall Sun City, Jl. Pahlawan No. 01, RW 6, Sidokumpul, Sidoarjo, Jawa Timur 61213. Sumber: https://informa.co.id/store-locations/list-maps?page=7 (14 September 2026).

products.json memuat 30 SKU unik, 8 kategori, tautan produk dan URL gambar sumber. Foto lokal di assets; 5 cutout transparan resmi. Sumber: https://informa.co.id/shop-the-look dan https://www.ruparupa.com/c/shop-the-look/cozy-living-room.html. Hak foto/merek tetap milik pemiliknya; demo internal tidak menyatakan izin publikasi komersial.

Planner: filter, pagination, tambah/hapus, geser pointer/touch/keyboard, ukuran visual, susunan depan-belakang, ringkasan nama/SKU. Pilihan selama halaman aktif. Komposisi 2D, bukan denah berskala. Tanpa harga/stok cabang. Nomor WhatsApp belum dikonfigurasi; pesan dapat disalin.

Verifikasi: npm test (katalog, semua aset, PNG, chat dan secret); browser desktop dan 390x844 (gambar termuat, tambah/hapus, ukuran, tombol panah, ringkasan). Modal dapat digulir di layar kecil; pembuka satu layar.
