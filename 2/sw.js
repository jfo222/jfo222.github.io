const id = "#2:2026-02-15";
const shell = [
	"./",
	"./config.js",
	"./font.woff2",
	"./icon.svg"
];
self.addEventListener("install", (e) => e.waitUntil(
	caches.open(id).then(
		(c) => c.addAll(shell)
	)
));
self.addEventListener("activate", (e) => e.waitUntil(
	caches.keys().then(
		(k) => Promise.all(
			k.map((key) => {
				if (key.includes("#2") && key !== id) {
					return caches.delete(key);
				}
			})
		)
	)
));
self.addEventListener("fetch", (e) => e.respondWith(
	caches.match(e.request, {ignoreVary: true}).then(
		(r) => r || fetch(e.request)
	)
));

