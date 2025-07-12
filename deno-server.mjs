const config = {
	browser: true,
	hostname: "localhost",
	port: 8022,
	startDir: "1"
};
const mime = {
	css: "text/css",
	html: "text/html",
	js: "text/javascript",
	json: "application/json",
	mjs: "text/javascript",
	svg: "image/svg+xml",
	woff2: "font/woff2"
};
(function () {
	const {os} = Deno.build;
	const base = `http://${config.hostname}:${config.port}/`;
	let cmd = (
		os === "windows"
		? "powershell -c start"
		: os === "darwin"
		? "open"
		: "xdg-open"
	);
	cmd = [...cmd.split(" "), base];
	function ext(path) {
		return (
			path.includes(".", 3)
			? path.split(".").pop()
			: ""
		);
	}
	Deno.serve({
		hostname: config.hostname,
		onListen() {
			console.log(`\nListening on ${base}`);
			if (config.browser) {
				new Deno.Command(cmd.shift(), {args: cmd}).spawn();
			}
		},
		port: config.port
	}, async function (req) {
		let path = `.${new URL(req.url).pathname}`;
		if (config.startDir && path === "./") {
			return Response.redirect(
				`${base}${Deno.args[0] || config.startDir}/`
			);
		}
		if (!path.endsWith("/") && !ext(path)) {
			return Response.redirect(
				`${base}${path.slice(2)}/`
			);
		}
		if (path.endsWith("/")) {
			path += "index.html";
		}
		try {
			const file = await Deno.open(path, {read: true});
			return new Response(file.readable, {
				headers: {
					"Content-Type": mime[ext(path)] || "text/plain"
				}
			});
		} catch {
			return new Response("404 - File not found.", {status: 404});
		}
	});
}());

