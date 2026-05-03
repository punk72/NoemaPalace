import type { ReactNode } from 'react';
import { useI18n } from '@/shared/i18n';

export type ToolbarAction = 'register' | 'search' | 'selection' | 'backup';
export type ToolbarMode = 'compact' | 'full';

type ToolbarItem = {
	action?: ToolbarAction;
	active: boolean;
	icon: ReactNode;
	label: string;
	onClick?: () => void;
};

type BottomToolbarProps = {
	mode: ToolbarMode;
	activeActions: Record<ToolbarAction, boolean>;
	onAction: (action: ToolbarAction) => void;
	onToggleMode: () => void;
};

function BookPlusIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22z" />
			<path d="M5 4.5A2.5 2.5 0 0 1 7.5 7H19" />
			<path d="M12 10v6" />
			<path d="M9 13h6" />
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="11" cy="11" r="6.5" />
			<path d="m16 16 4 4" />
			<path d="M8.5 11h5" />
		</svg>
	);
}

function SelectionIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M9 6h11" />
			<path d="M9 12h11" />
			<path d="M9 18h11" />
			<path d="m3.5 6 1 1 2-2" />
			<path d="m3.5 12 1 1 2-2" />
			<path d="m3.5 18 1 1 2-2" />
		</svg>
	);
}

function BackupIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 20h14" />
			<path d="M7 16h10a2 2 0 0 0 2-2.2 4 4 0 0 0-5.6-3.6A5 5 0 0 0 4 12.5 3.5 3.5 0 0 0 7 16Z" />
			<path d="M12 6v8" />
			<path d="m9 11 3 3 3-3" />
		</svg>
	);
}

function ToolbarModeIcon({ mode }: { mode: ToolbarMode }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			{mode === 'compact' ? (
				<>
					<path d="M4 7h16" />
					<path d="M4 12h16" />
					<path d="M4 17h16" />
				</>
			) : (
				<>
					<path d="M8 6h12" />
					<path d="M8 12h12" />
					<path d="M8 18h12" />
					<path d="M4 6h.01" />
					<path d="M4 12h.01" />
					<path d="M4 18h.01" />
				</>
			)}
		</svg>
	);
}

export default function BottomToolbar({
	mode,
	activeActions,
	onAction,
	onToggleMode,
}: BottomToolbarProps) {
	const { t } = useI18n();
	const compact = mode === 'compact';
	const items: ToolbarItem[] = [
		{
			action: 'register',
			active: activeActions.register,
			label: t('toolbar.register'),
			icon: <BookPlusIcon />,
		},
		{
			action: 'search',
			active: activeActions.search,
			label: t('toolbar.search'),
			icon: <SearchIcon />,
		},
		{
			action: 'selection',
			active: activeActions.selection,
			label: t('toolbar.selection'),
			icon: <SelectionIcon />,
		},
		{
			action: 'backup',
			active: activeActions.backup,
			label: t('toolbar.backup'),
			icon: <BackupIcon />,
		},
		{
			active: false,
			label: compact ? t('toolbar.expand') : t('toolbar.compact'),
			icon: <ToolbarModeIcon mode={mode} />,
			onClick: onToggleMode,
		},
	];

	return (
		<nav
			aria-label={t('app.toolbarLabel')}
			className="app-toolbar"
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
				gap: 6,
				flexShrink: 0,
				padding: compact
					? '6px 0 calc(6px + env(safe-area-inset-bottom))'
					: '8px 0 calc(8px + env(safe-area-inset-bottom))',
				borderTop: '1px solid var(--border)',
				background: 'var(--bg)',
			}}
		>
			{items.map((item) => (
				<button
					key={item.label}
					type="button"
					aria-pressed={item.active}
					aria-label={item.label}
					title={item.label}
					onClick={item.onClick ?? (() => item.action && onAction(item.action))}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: compact ? 0 : 2,
						minWidth: 0,
						minHeight: compact ? 38 : 44,
						padding: compact ? 4 : '4px 2px',
						borderRadius: 8,
						border: item.active
							? '1px solid var(--accent-border)'
							: '1px solid transparent',
						background: item.active ? 'var(--accent-bg)' : 'transparent',
						color: item.active ? 'var(--accent)' : 'var(--text)',
						cursor: 'pointer',
					}}
				>
					<span
						style={{
							width: compact ? 24 : 22,
							height: compact ? 24 : 22,
							display: 'inline-flex',
						}}
					>
						{item.icon}
					</span>
					{!compact && (
						<span style={{ fontSize: 10, lineHeight: 1 }}>
							{item.label}
						</span>
					)}
				</button>
			))}
		</nav>
	);
}
