interface Env {
	VIEWS: KVNamespace;
}

// 规范化路径，避免 `/a/` 与 `/a` 被当成两个 key
function normalize(p: string): string {
	if (p === "/") return "/";
	return p.replace(/\/+$/, "") || "/";
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			"access-control-allow-origin": "*",
		},
	});
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	if (request.method === "OPTIONS") {
		return new Response(null, {
			headers: {
				"access-control-allow-origin": "*",
				"access-control-allow-methods": "GET, POST, OPTIONS",
				"access-control-allow-headers": "content-type",
			},
		});
	}

	const url = new URL(request.url);
	const rawPath = url.searchParams.get("path");
	if (!rawPath) {
		return json({ error: "Missing 'path' parameter" }, 400);
	}

	const key = normalize(rawPath);

	if (request.method === "POST") {
		const current = parseInt((await env.VIEWS.get(key)) ?? "0", 10) || 0;
		const next = current + 1;
		await env.VIEWS.put(key, String(next));
		return json({ path: key, views: next });
	}

	// 其余方法（GET 等）只读
	const views = parseInt((await env.VIEWS.get(key)) ?? "0", 10) || 0;
	return json({ path: key, views });
};
