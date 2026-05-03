import {
	useCallback,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

import { I18nContext } from './context';
import {
	DEFAULT_LOCALE,
	LOCALE_STORAGE_KEY,
	isLocale,
	locales,
	type Locale,
	type TranslationKey,
} from './model';

type TranslationParams = Record<string, string | number>;

function readStoredLocale() {
	const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
	return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

function resolveTranslation(locale: Locale, key: TranslationKey) {
	const value = key.split('.').reduce<unknown>((current, segment) => {
		if (typeof current !== 'object' || current === null) return undefined;
		return (current as Record<string, unknown>)[segment];
	}, locales[locale]);

	return typeof value === 'string' ? value : key;
}

function interpolate(message: string, params: TranslationParams = {}) {
	return Object.entries(params).reduce(
		(result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
		message,
	);
}

type I18nProviderProps = {
	children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
	const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

	const setLocale = useCallback((nextLocale: Locale) => {
		localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
		setLocaleState(nextLocale);
	}, []);

	const t = useCallback((key: TranslationKey, params?: TranslationParams) => {
		return interpolate(resolveTranslation(locale, key), params);
	}, [locale]);

	const value = useMemo(() => ({
		locale,
		setLocale,
		t,
	}), [locale, setLocale, t]);

	return (
		<I18nContext.Provider value={value}>
			{children}
		</I18nContext.Provider>
	);
}
