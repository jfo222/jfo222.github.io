const id = "#2:2025";
const shell = [
    "./",
    "./config.json",
    "./font.woff2",
    "./icon.svg",
    "./lang/en.json",
    "./lang/zh.json",
    "./manifest.json",
    "./script.mjs",
    "./style.css"
];
self.addEventListener("install", (e) => e.waitUntil(
    caches.open(id).then(
        (c) => c.addAll(shell)
    )
));
self.addEventListener("activate", (e) => e.waitUntil(
    caches.keys().then(
        (k) => Promise.all(
            k.map(function (key) {
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

