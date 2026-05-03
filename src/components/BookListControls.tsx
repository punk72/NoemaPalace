import type { BookStatus } from '../types/book';

type SortBy = 'latest' | 'title' | 'author';

type Props = {
	statusFilter: '전체' | BookStatus;
	sortBy: SortBy;
	onChangeStatusFilter: (value: '전체' | BookStatus) => void;
	onChangeSortBy: (value: SortBy) => void;
};

export default function BookListControls({
	statusFilter,
	sortBy,
	onChangeStatusFilter,
	onChangeSortBy,
}: Props) {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: 8,
				marginBottom: 16,
			}}
		>
			<label>
				상태 필터
				<select
					value={statusFilter}
					onChange={(e) =>
						onChangeStatusFilter(e.target.value as '전체' | BookStatus)
					}
					style={{
						width: '100%',
						padding: 10,
						marginTop: 4,
						borderRadius: 8,
						border: '1px solid #ccc',
					}}
				>
					<option value="전체">전체</option>
					<option value="안읽음">안읽음</option>
					<option value="읽는중">읽는중</option>
					<option value="읽음">읽음</option>
					<option value="대여중">대여중</option>
				</select>
			</label>

			<label>
				정렬
				<select
					value={sortBy}
					onChange={(e) => onChangeSortBy(e.target.value as SortBy)}
					style={{
						width: '100%',
						padding: 10,
						marginTop: 4,
						borderRadius: 8,
						border: '1px solid #ccc',
					}}
				>
					<option value="latest">최신 등록순</option>
					<option value="title">제목순</option>
					<option value="author">저자순</option>
				</select>
			</label>
		</div>
	);
}