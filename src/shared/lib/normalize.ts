export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const asString = (value: unknown) =>
	typeof value === 'string' ? value : '';

export const asTimestamp = (value: unknown, fallback: number) =>
	typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const asPositiveInteger = (value: unknown, fallback = 1) => {
	const numberValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number(value)
				: NaN;

	if (!Number.isFinite(numberValue)) return fallback;

	return Math.max(1, Math.floor(numberValue));
};

export const asNonNegativeInteger = (value: unknown, fallback = 0) => {
	const numberValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number(value)
				: NaN;

	if (!Number.isFinite(numberValue)) return fallback;

	return Math.max(0, Math.floor(numberValue));
};
