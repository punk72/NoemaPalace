type BookSearchProps = {
	query: string;
	onChangeQuery: (value: string) => void;
};

export default function BookSearch({
	query,
	onChangeQuery,
}: BookSearchProps) {
	return (
		<div style={{ marginBottom: 16 }}>
			<input
				type="search"
				value={query}
				onChange={(e) => onChangeQuery(e.target.value)}
				placeholder="내 서재 검색: 제목, 저자, 출판사, ISBN"
				style={{
					width: '100%',
					padding: 12,
					borderRadius: 8,
					border: '1px solid #ccc',
				}}
			/>
		</div>
	);
}