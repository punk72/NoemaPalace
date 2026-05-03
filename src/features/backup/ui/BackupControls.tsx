import { useI18n } from '@/shared/i18n';

type BackupControlsProps = {
	onExport: () => void;
	onImport: (file: File | null) => void;
};

export default function BackupControls({
	onExport,
	onImport,
}: BackupControlsProps) {
	const { t } = useI18n();

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
				gap: 8,
				marginBottom: 16,
				width: '100%',
			}}
		>
			<button
				type="button"
				onClick={onExport}
				style={{
					padding: '10px 14px',
					borderRadius: 8,
					border: '1px solid var(--border)',
					background: 'var(--surface)',
					color: 'var(--text-h)',
					cursor: 'pointer',
					width: '100%',
				}}
			>
				{t('backup.export')}
			</button>

			<label
				style={{
					padding: '10px 14px',
					borderRadius: 8,
					border: '1px solid var(--border)',
					background: 'var(--surface)',
					color: 'var(--text-h)',
					cursor: 'pointer',
					display: 'block',
					width: '100%',
					textAlign: 'center',
				}}
			>
				{t('backup.import')}
				<input
					type="file"
					accept="application/json"
					onChange={(e) => {
						onImport(e.target.files?.[0] ?? null);
						e.currentTarget.value = '';
					}}
					style={{ display: 'none' }}
				/>
			</label>
		</div>
	);
}
