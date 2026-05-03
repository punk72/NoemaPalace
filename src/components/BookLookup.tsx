type BookLookupProps = {
	isbn: string;
	loading: boolean;
	onChangeIsbn: (value: string) => void;
	onLookup: () => void;
};

export default function BookLookup({
	isbn,
	loading,
	onChangeIsbn,
	onLookup,
}: BookLookupProps) {
	return (
		<div
			style={{
				display: 'flex',
				gap: 8,
				marginBottom: 16,
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
				placeholder="ISBN 입력"
				inputMode="numeric"
				style={{
					flex: 1,
					minWidth: 0,
					padding: 12,
					borderRadius: 8,
					border: '1px solid #ccc',
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
					border: '1px solid #ccc',
					cursor: loading ? 'not-allowed' : 'pointer',
					opacity: loading ? 0.6 : 1,
				}}
			>
				{loading ? '조회 중...' : '조회'}
			</button>
		</div>
	);
}