importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "block3-v2";

const assets = [
	"./",
	"./block3.ax",
	"./block3.data",
	"./hsp3dish.wasm",
	"./hsp3dishw.js",
	"./index.html",
	"./sw.js",
];

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

self.addEventListener('install', async (event) => {
	console.log('[Service Worker] Install');
	event.waitUntil(
		caches.open(CACHE)
			.then((cache) => {
				console.log('[Service Worker] Caching all: app shell and content');
				cache.addAll(assets);
			})
	);
});

if (workbox.navigationPreload.isSupported()) {
	workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetched resource url:'+event.request.url + ' mode:' + event.request.mode);
	event.respondWith((async () => {
		try {
			const preloadResp = await event.preloadResponse;
			
			if (preloadResp) {
				return preloadResp;
			}

			const networkResp = await fetch(event.request);
			return networkResp;
		} catch (error) {
			const cache = await caches.open(CACHE);
			const cachedResp = await cache.match(event.request);
			return cachedResp;
		}
	})());
});
