import { createContext } from 'react';

import type { Locale, TranslationKey } from './model';

type TranslationParams = Record<string, string | number>;

export type I18nContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: TranslationKey, params?: TranslationParams) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
