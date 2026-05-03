import type { ToolbarAction } from '@/features/toolbar/components/BottomToolbar';
import { useI18n, type TranslationKey } from '@/shared/i18n';

const actionTranslationKeys: Record<ToolbarAction, TranslationKey> = {
	backup: 'toolbar.backup',
	register: 'toolbar.register',
	search: 'toolbar.search',
	selection: 'toolbar.selection',
};

type ScannerInterruptDialogProps = {
	action: ToolbarAction;
	onCancel: () => void;
	onConfirm: () => void;
};

export default function ScannerInterruptDialog({
	action,
	onCancel,
	onConfirm,
}: ScannerInterruptDialogProps) {
	const { t } = useI18n();
	const actionLabel = t(actionTranslationKeys[action]);

	return (
		<div
			role="alertdialog"
			aria-label={t('scanner.interruptTitle')}
			style={{
				display: 'grid',
				gap: 10,
				marginBottom: 12,
				padding: 12,
				border: '1px solid var(--accent-border)',
				borderRadius: 8,
				background: 'var(--accent-bg)',
				textAlign: 'left',
			}}
		>
			<p style={{ color: 'var(--text-h)', fontSize: 14 }}>
				{t('scanner.interruptMessage', { action: actionLabel })}
			</p>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
					gap: 8,
				}}
			>
				<button
					type="button"
					onClick={onConfirm}
					style={{
						padding: '8px 10px',
						borderRadius: 8,
						border: '1px solid var(--accent-border)',
						background: 'var(--surface)',
						color: 'var(--accent)',
						cursor: 'pointer',
					}}
				>
					{t('scanner.stop')}
				</button>
				<button
					type="button"
					onClick={onCancel}
					style={{
						padding: '8px 10px',
						borderRadius: 8,
						border: '1px solid var(--border)',
						background: 'var(--surface)',
						color: 'var(--text-h)',
						cursor: 'pointer',
					}}
				>
					{t('scanner.continue')}
				</button>
			</div>
		</div>
	);
}
