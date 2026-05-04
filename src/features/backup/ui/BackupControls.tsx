import { useI18n } from '@/shared/i18n';

export type BackupImportPreview = {
	fileName: string;
	totalCount: number;
	newCount: number;
	overwriteCount: number;
	invalidCount: number;
	items: unknown[];
};

type BackupControlsProps = {
	importPreview: BackupImportPreview | null;
	onExport: () => void;
	onImport: (file: File | null) => void;
	onCancelImport: () => void;
	onConfirmImport: () => void;
};

export default function BackupControls({
	importPreview,
	onExport,
	onImport,
	onCancelImport,
	onConfirmImport,
}: BackupControlsProps) {
	const { t } = useI18n();

	return (
		<div style={{ display: 'grid', gap: 10, marginBottom: 16, width: '100%' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
					gap: 8,
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

			{importPreview && (
				<div
					style={{
						display: 'grid',
						gap: 10,
						padding: 12,
						border: '1px solid var(--border)',
						borderRadius: 8,
						background: 'var(--surface-soft)',
					}}
				>
					<div style={{ minWidth: 0 }}>
						<strong style={{ display: 'block', marginBottom: 4 }}>
							{t('backup.previewTitle')}
						</strong>
						<p
							style={{
								margin: 0,
								color: 'var(--text)',
								fontSize: 13,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{importPreview.fileName}
						</p>
					</div>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
							gap: 6,
							fontSize: 12,
							textAlign: 'center',
						}}
					>
						<span>{t('backup.previewTotal', { count: importPreview.totalCount })}</span>
						<span>{t('backup.previewNew', { count: importPreview.newCount })}</span>
						<span>{t('backup.previewOverwrite', { count: importPreview.overwriteCount })}</span>
						<span>{t('backup.previewInvalid', { count: importPreview.invalidCount })}</span>
					</div>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
							gap: 8,
						}}
					>
						<button
							type="button"
							onClick={onConfirmImport}
							style={{
								padding: '10px 14px',
								borderRadius: 8,
								border: '1px solid var(--accent-border)',
								background: 'var(--accent-bg)',
								color: 'var(--accent)',
								fontWeight: 700,
							}}
						>
							{t('backup.confirmImport')}
						</button>
						<button
							type="button"
							onClick={onCancelImport}
							style={{
								padding: '10px 14px',
								borderRadius: 8,
								border: '1px solid var(--border)',
								background: 'var(--surface)',
								color: 'var(--text-h)',
							}}
						>
							{t('backup.cancelImport')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
