import { useCallback } from 'react';

import { useI18n, type TranslationKey } from '@/shared/i18n';

type MessageParams = Record<string, string | number>;
export type AppMessageKey = Extract<TranslationKey, `messages.${string}`>;

export function useAppMessages(onMessage?: (message: string) => void) {
	const { t } = useI18n();

	const formatMessage = useCallback((
		key: AppMessageKey,
		params?: MessageParams,
	) => {
		return t(key, params);
	}, [t]);

	const notify = useCallback((
		key: AppMessageKey,
		params?: MessageParams,
	) => {
		onMessage?.(formatMessage(key, params));
	}, [formatMessage, onMessage]);

	return {
		formatMessage,
		notify,
	};
}
