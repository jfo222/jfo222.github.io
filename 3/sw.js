const id = "#3:26-3-2";
async function install() {
	skipWaiting();
	const cache = await caches.open(id);
	await cache.addAll(["./", "./config.js"]);
}
async function activate() {
	const keys = await caches.keys();
	await Promise.all(
		keys.map(k => k.startsWith("#3") && k !== id && caches.delete(k))
	);
	await clients.claim();
}
async function fetchFile(req) {
	const url = new URL(req.url);
	if (url.pathname.endsWith("icon.svg")) {
		const icon = url.searchParams.get("data").split(",")[1];
		return new Response(icon, {
			headers: {"Content-Type": "image/svg+xml"}
		});
	}
	return await caches.match(req, {ignoreVary: true}) || fetch(req);
}
addEventListener("install", (e) => e.waitUntil(install()));
addEventListener("activate", (e) => e.waitUntil(activate()));
addEventListener("fetch", (e) => e.respondWith(fetchFile(e.request)));

