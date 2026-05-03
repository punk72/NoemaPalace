export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const asString = (value: unknown) =>
	typeof value === 'string' ? value : '';

export const asTimestamp = (value: unknown, fallback: number) =>
	typeof value === 'number' && Number.isFinite(value) ? value : fallback;
