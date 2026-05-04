import type { ReactNode } from 'react';

import {
	APP_VIEW_LABEL_KEYS,
	APP_VIEWS,
	type AppView,
} from '@/app/model/view';
import { useI18n } from '@/shared/i18n';

type AppTabBarProps = {
	activeView: AppView;
	onChangeView: (view: AppView) => void;
};

function HomeIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="m4 11 8-7 8 7" />
			<path d="M6.5 10.5V20h11v-9.5" />
			<path d="M10 20v-5h4v5" />
		</svg>
	);
}

function LibraryIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 4h4v16H5z" />
			<path d="M10 4h4v16h-4z" />
			<path d="m16 5 3 14" />
		</svg>
	);
}

function RegisterIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22z" />
			<path d="M12 10v6" />
			<path d="M9 13h6" />
		</svg>
	);
}

function NotesIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M6 3h9l3 3v15H6z" />
			<path d="M14 3v4h4" />
			<path d="M9 12h6" />
			<path d="M9 16h4" />
		</svg>
	);
}

function ManageIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 3v3" />
			<path d="M12 18v3" />
			<path d="M4.8 7.2 7 9.4" />
			<path d="m17 14.6 2.2 2.2" />
			<circle cx="12" cy="12" r="4" />
		</svg>
	);
}

const VIEW_ICONS: Record<AppView, ReactNode> = {
	home: <HomeIcon />,
	library: <LibraryIcon />,
	register: <RegisterIcon />,
	notes: <NotesIcon />,
	manage: <ManageIcon />,
};

export default function AppTabBar({
	activeView,
	onChangeView,
}: AppTabBarProps) {
	const { t } = useI18n();

	return (
		<nav
			aria-label={t('app.toolbarLabel')}
			className="app-toolbar"
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${APP_VIEWS.length}, minmax(0, 1fr))`,
				gap: 6,
				flexShrink: 0,
				padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
				borderTop: '1px solid var(--border)',
				background: 'var(--bg)',
			}}
		>
			{APP_VIEWS.map((view) => {
				const active = activeView === view;
				const label = t(APP_VIEW_LABEL_KEYS[view]);

				return (
					<button
						key={view}
						type="button"
						aria-pressed={active}
						aria-label={label}
						title={label}
						onClick={() => onChangeView(view)}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 1,
							minWidth: 0,
							minHeight: 42,
							padding: 4,
							borderRadius: 8,
							border: active
								? '1px solid var(--accent-border)'
								: '1px solid transparent',
							background: active ? 'var(--accent-bg)' : 'transparent',
							color: active ? 'var(--accent)' : 'var(--text)',
							cursor: 'pointer',
						}}
					>
						<span
							style={{
								width: 22,
								height: 22,
								display: 'inline-flex',
							}}
						>
							{VIEW_ICONS[view]}
						</span>
						<span style={{ fontSize: 10, lineHeight: 1 }}>
							{label}
						</span>
					</button>
				);
			})}
		</nav>
	);
}
