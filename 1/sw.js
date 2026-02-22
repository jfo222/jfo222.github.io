const id = "#1:26-02-25";
const files = [
	"./",
	"./config.js",
	"./icon.svg"
];
self.addEventListener("install", (e) => e.waitUntil(
	caches.open(id).then(
		(c) => c.addAll(files)
	)
));
self.addEventListener("activate", (e) => e.waitUntil(
	caches.keys().then(
		(k) => Promise.all(
			k.map((key) => {
				if (key.includes("#1") && key !== id) {
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

