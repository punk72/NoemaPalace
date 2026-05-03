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
				flexWrap: 'wrap',
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
				style={{
					flex: '1 1 240px',
					padding: 12,
					borderRadius: 8,
					border: '1px solid #ccc',
				}}
			/>

			<button
				onClick={onLookup}
				disabled={loading}
				style={{
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