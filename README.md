# INFORMA Sun City — internal concept

Mobile-first single-screen microsite. Run `npm ci`, then `npm start` and open http://localhost:4173. Three.js renders lifestyle scene transitions; GSAP coordinates the opening and panels. Official lifestyle photos are bundled in assets. Floating foreground crops are 2.5D, not rotatable furniture models.

Personal Shopper opens the Gemini chatbot. Room planner and category explorer remain concept panels. Consultation summary can be copied. Set WHATSAPP_NUMBER in app.js only after branch approval. No live stock integration.

The local backend reads the existing Windows generic credential through read-credential.ps1, keeping the key in server memory only. Cloud hosting must use a server-side GEMINI_API_KEY secret; it cannot access this computer's Credential Manager. GEMINI_MODEL defaults to gemini-2.5-flash. This server binds localhost and rejects remote Host/Origin values; it is deliberately local-only until hosting/authentication and usage controls are configured. Do not publish the API unauthenticated. npm test checks validation, origin rejection, and isolation of server/credential files.

Lifestyle and product assets: https://informa.co.id/shop-the-look (2026-09-14), Local Furniture Collection, Serene Bedroom, Modern Comfort Family Room. Official current anniversary logo downloaded from the same page. Tagline source: https://informa.co.id/csr-events/informa-anniversary-15. These are central-brand visuals, not Suncity branch photographs.

Official image source: https://informa.co.id/room-of-inspiration/living_room (reviewed 2026-09-14). Four category images referenced from its CDN; rights retained by owners. They are not Suncity branch photographs. No invented product names, prices or availability. Assets require external network access; fonts have local fallbacks.

This is an unofficial internal demonstration. Domain and live hosting have not been configured. Source can be managed in a private GitHub repository. GitHub Pages commercial-use restrictions must be reviewed before hosting this sales-oriented demo there; storing source on GitHub is separate from hosting.
