export const normalizeIsbn = (value: string) => {
	return value.replace(/[^0-9Xx]/g, '');
};