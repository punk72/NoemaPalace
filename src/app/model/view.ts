import type { TranslationKey } from '@/shared/i18n';

export type AppView = 'home' | 'library' | 'register' | 'notes' | 'manage';

export const APP_VIEWS: AppView[] = [
	'home',
	'library',
	'register',
	'notes',
	'manage',
];

export const APP_VIEW_LABEL_KEYS: Record<AppView, TranslationKey> = {
	home: 'views.home',
	library: 'views.library',
	register: 'views.register',
	notes: 'views.notes',
	manage: 'views.manage',
};

export const DEFAULT_APP_VIEW: AppView = 'home';
