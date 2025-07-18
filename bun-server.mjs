const config = {
	browser: true,
	hostname: "localhost",
	port: 8022,
	startDir: "1"
};
(async function () {
	const {platform} = process;
	const base = `http://${config.hostname}:${config.port}/`;
	const cmd = (
		platform === "win32"
		? "powershell -c start"
		: platform === "darwin"
		? "open"
		: "xdg-open"
	);
	Bun.serve({
		async fetch(req) {
			let file;
			let path = `.${new URL(req.url).pathname}`;
			if (config.startDir && path === "./") {
				return Response.redirect(
					`${base}${Bun.argv[2] || config.startDir}/`
				);
			}
			if (!path.endsWith("/") && !path.includes(".", 3)) {
				return Response.redirect(
					`${base}${path.slice(2)}/`
				);
			}
			if (path.endsWith("/")) {
				path += "index.html";
			}
			file = Bun.file(path);
			if (await file.exists()) {
				return new Response(file);
			}
			return new Response("404 - File not found.", {status: 404});
		},
		hostname: config.hostname,
		port: config.port
	});
	console.log(`\nListening on ${base}`);
	if (config.browser) {
		await Bun.$`${cmd.split(" ")} ${base}`;
	}
}());

