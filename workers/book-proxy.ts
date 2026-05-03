export interface Env {
	ALLOWED_ORIGIN?: string;
}

const providerOrigins: Record<string, string> = {
	aladin: 'https://www.aladin.co.kr',
	nlk: 'https://nl.go.kr',
};

function corsHeaders(request: Request, env: Env) {
	const requestOrigin = request.headers.get('Origin') || '';
	const allowedOrigin = env.ALLOWED_ORIGIN || requestOrigin || '*';

	return {
		'Access-Control-Allow-Origin': allowedOrigin,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		Vary: 'Origin',
	};
}

export default {
	async fetch(request: Request, env: Env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders(request, env),
			});
		}

		if (request.method !== 'GET') {
			return new Response('Method Not Allowed', {
				status: 405,
				headers: corsHeaders(request, env),
			});
		}

		const incomingUrl = new URL(request.url);
		const [, provider, ...pathParts] = incomingUrl.pathname.split('/');
		const targetOrigin = providerOrigins[provider];

		if (!targetOrigin || pathParts.length === 0) {
			return new Response('Unknown provider', {
				status: 404,
				headers: corsHeaders(request, env),
			});
		}

		const targetUrl = new URL(`/${pathParts.join('/')}`, targetOrigin);
		targetUrl.search = incomingUrl.search;

		const upstream = await fetch(targetUrl.toString(), {
			headers: {
				Accept: request.headers.get('Accept') || '*/*',
				'User-Agent': 'NoemaPalaceBookProxy/1.0',
			},
		});

		const response = new Response(upstream.body, upstream);
		Object.entries(corsHeaders(request, env)).forEach(([key, value]) => {
			response.headers.set(key, value);
		});

		return response;
	},
};
