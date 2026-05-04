import { useI18n } from '@/shared/i18n';

type BookLookupProps = {
	error: string;
	isbn: string;
	loading: boolean;
	scanning: boolean;
	onChangeIsbn: (value: string) => void;
	onLookup: () => void;
	onToggleScanner: () => void;
};

export default function BookLookup({
	error,
	isbn,
	loading,
	scanning,
	onChangeIsbn,
	onLookup,
	onToggleScanner,
}: BookLookupProps) {
	const { t } = useI18n();

	return (
		<div style={{ marginBottom: 16 }}>
			<div
				style={{
					display: 'flex',
					gap: 8,
					width: '100%',
					boxSizing: 'border-box',
				}}
			>
				<input
					type="text"
					value={isbn}
					onChange={(e) => onChangeIsbn(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !loading) {
							onLookup();
						}
					}}
					placeholder={t('lookup.isbnPlaceholder')}
					inputMode="numeric"
					aria-invalid={Boolean(error)}
					aria-describedby={error ? 'lookup-error' : undefined}
					style={{
						flex: 1,
						minWidth: 0,
						padding: 12,
						borderRadius: 8,
						border: error
							? '1px solid crimson'
							: '1px solid var(--border)',
						background: 'var(--surface)',
						color: 'var(--text-h)',
						boxSizing: 'border-box',
					}}
				/>

				<button
					type="button"
					onClick={onLookup}
					disabled={loading}
					style={{
						flexShrink: 0,
						padding: '12px 16px',
						borderRadius: 8,
						border: '1px solid var(--border)',
						background: 'var(--surface)',
						color: 'var(--text-h)',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1,
					}}
				>
					{loading ? t('lookup.loading') : t('lookup.lookup')}
				</button>

				<button
					type="button"
					onClick={onToggleScanner}
					aria-label={scanning ? t('lookup.scanStop') : t('lookup.scanStart')}
					title={scanning ? t('lookup.scanStop') : t('lookup.scanStart')}
					style={{
						flexShrink: 0,
						width: 44,
						minWidth: 44,
						padding: 0,
						borderRadius: 8,
						border: scanning
							? '1px solid var(--accent-border)'
							: '1px solid var(--border)',
						background: scanning ? 'var(--accent-bg)' : 'var(--surface)',
						color: scanning ? 'var(--accent)' : 'var(--text-h)',
						cursor: 'pointer',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<svg
						viewBox="0 0 24 24"
						aria-hidden="true"
						style={{
							width: 22,
							height: 22,
							fill: 'none',
							stroke: 'currentColor',
							strokeLinecap: 'round',
							strokeLinejoin: 'round',
							strokeWidth: 1.8,
						}}
					>
						<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
						{scanning ? (
							<path d="M9 10h6v6H9z" />
						) : (
							<>
								<circle cx="12" cy="12.5" r="3" />
								<path d="M7 9h.01" />
							</>
						)}
					</svg>
				</button>
			</div>

			{error && (
				<p
					id="lookup-error"
					role="status"
					style={{ color: 'crimson', margin: '8px 0 0', fontSize: 13 }}
				>
					{error}
				</p>
			)}
		</div>
	);
}
