type BookApiProvider = 'aladin' | 'nlk';
type BookApiMode = 'direct' | 'proxy';

const apiMode = (import.meta.env.VITE_BOOK_API_MODE || 'proxy') as BookApiMode;
const proxyBaseUrl = (import.meta.env.VITE_BOOK_PROXY_BASE_URL || '').replace(/\/$/, '');

const providerOrigins: Record<BookApiProvider, string> = {
	aladin: 'https://www.aladin.co.kr',
	nlk: 'https://nl.go.kr',
};

const localProxyPrefixes: Record<BookApiProvider, string> = {
	aladin: '/book_proxy/aladin',
	nlk: '/book_proxy/nlk',
};

export function buildBookApiUrl(
	provider: BookApiProvider,
	path: string,
	params?: Record<string, string>,
) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const baseUrl =
		apiMode === 'direct'
			? providerOrigins[provider]
			: `${proxyBaseUrl}${localProxyPrefixes[provider]}`;
	const url = new URL(`${baseUrl}${normalizedPath}`, window.location.origin);

	Object.entries(params ?? {}).forEach(([key, value]) => {
		url.searchParams.set(key, value);
	});

	return apiMode === 'direct' || proxyBaseUrl
		? url.toString()
		: `${url.pathname}${url.search}`;
}
