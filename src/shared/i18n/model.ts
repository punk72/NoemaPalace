import en from './locales/en.json';
import ko from './locales/ko.json';

export const locales = {
	ko,
	en,
} as const;

export type Locale = keyof typeof locales;
export type TranslationSchema = typeof ko;

export const DEFAULT_LOCALE: Locale = 'ko';
export const LOCALE_STORAGE_KEY = 'locale';

type LeafPaths<T, Prefix extends string = ''> = {
	[K in keyof T & string]: T[K] extends string
		? `${Prefix}${K}`
		: T[K] extends Record<string, unknown>
			? LeafPaths<T[K], `${Prefix}${K}.`>
			: never;
}[keyof T & string];

export type TranslationKey = LeafPaths<TranslationSchema>;

export function isLocale(value: string | null): value is Locale {
	return value === 'ko' || value === 'en';
}
