const config = {
		browser: true,
		hostname: "localhost",
		port: 8022,
		startDir: "1",
		protocol: "http",
		cert: "./cert.pem",
		key: "./key.pem"
	},
	type = {
		html: "text/html",
		js: "text/javascript"
	};
(() => {
	const {os} = Deno.build,
		base = `${config.protocol}://${config.hostname}:${config.port}/`;
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
		onListen() {
			console.log(`\nListening on ${base}`);
			if (config.browser)
				new Deno.Command(cmd.shift(), {args: cmd}).spawn();
		},
		hostname: config.hostname,
		port: config.port,
		...config.protocol === "https" && {
			cert: Deno.readTextFileSync(config.cert),
			key: Deno.readTextFileSync(config.key)
		}
	}, async (req) => {
		let file,
			path = `.${new URL(req.url).pathname}`;
		if (config.startDir && path === "./")
			return Response.redirect(
				`${base}${Deno.args[0] || config.startDir}/`
			);
		if (!path.endsWith("/") && !ext(path))
			return Response.redirect(
				`${base}${path.slice(2)}/`
			);
		if (path.endsWith("/"))
			path += "index.html";
		try {
			file = await Deno.readFile(path);
			return new Response(file, {
				headers: {"Content-Type": type[ext(path)] || "text/plain"}
			});
		} catch {
			return new Response("404 - File not found.", {status: 404});
		}
	});
})();

