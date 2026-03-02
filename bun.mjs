const config = {
		browser: true,
		hostname: "localhost",
		port: 8022,
		startDir: "1",
		protocol: "http",
		cert: "./cert.pem",
		key: "./key.pem"
	};
(async () => {
	const {platform} = process,
		base = `${config.protocol}://${config.hostname}:${config.port}/`,
		cmd = (
			platform === "win32"
			? "powershell -c start"
			: platform === "darwin"
			? "open"
			: "xdg-open"
		);
	Bun.serve({
		async fetch(req) {
			let file,
				path = `.${new URL(req.url).pathname}`;
			if (config.startDir && path === "./")
				return Response.redirect(
					`${base}${Bun.argv[2] || config.startDir}/`
				);
			if (!path.endsWith("/") && !path.includes(".", 3))
				return Response.redirect(
					`${base}${path.slice(2)}/`
				);
			if (path.endsWith("/"))
				path += "index.html";
			file = Bun.file(path);
			if (await file.exists())
				return new Response(file);
			return new Response("404 - File not found.", {status: 404});
		},
		hostname: config.hostname,
		port: config.port,
		...config.protocol === "https" && {
			tls: {
				cert: Bun.file(config.cert),
				key: Bun.file(config.key)
			}
		}
	});
	console.log(`\nListening on ${base}`);
	if (config.browser)
		await Bun.$`${cmd.split(" ")} ${base}`;
})();

