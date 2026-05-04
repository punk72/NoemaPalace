import { useEffect } from 'react';

import type { AppTheme } from '@/features/settings/model/theme';

export function useApplyTheme(theme: AppTheme) {
	useEffect(() => {
		const root = document.documentElement;

		if (theme === 'system') {
			delete root.dataset.theme;
			return;
		}

		root.dataset.theme = theme;
	}, [theme]);
}
