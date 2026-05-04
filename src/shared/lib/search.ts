export function normalizeSearchText(value: string) {
	return value
		.normalize('NFKC')
		.toLowerCase()
		.replace(/\s+/g, '');
}
