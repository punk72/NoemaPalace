import {
	BOOK_COLLECTION_FILTERS,
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_SORT_LABEL_KEYS,
	BOOK_SORT_OPTIONS,
	BOOK_STATUS_FILTERS,
	BOOK_STATUS_LABEL_KEYS,
	type BookCollectionFilter,
	type BookSortBy,
	type BookStatusFilter,
} from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';

type Props = {
	statusFilter: BookStatusFilter;
	collectionFilter: BookCollectionFilter;
	sortBy: BookSortBy;
	onChangeStatusFilter: (value: BookStatusFilter) => void;
	onChangeCollectionFilter: (value: BookCollectionFilter) => void;
	onChangeSortBy: (value: BookSortBy) => void;
};

export default function BookListControls({
	statusFilter,
	collectionFilter,
	sortBy,
	onChangeStatusFilter,
	onChangeCollectionFilter,
	onChangeSortBy,
}: Props) {
	const { t } = useI18n();

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
				gap: 8,
				marginBottom: 16,
				width: '100%',
				boxSizing: 'border-box',
			}}
		>
			<label style={{ minWidth: 0, fontSize: 13 }}>
				{t('book.field.statusFilter')}
				<select
					value={statusFilter}
					onChange={(e) =>
						onChangeStatusFilter(e.target.value as BookStatusFilter)
					}
					style={{
						width: '100%',
						padding: 10,
						marginTop: 4,
						borderRadius: 8,
						border: '1px solid #ccc',
						boxSizing: 'border-box',
					}}
				>
					{BOOK_STATUS_FILTERS.map((status) => (
						<option key={status} value={status}>
							{status === '전체' ? t('filters.all') : t(BOOK_STATUS_LABEL_KEYS[status])}
						</option>
					))}
				</select>
			</label>

			<label style={{ minWidth: 0, fontSize: 13 }}>
				{t('book.field.collectionFilter')}
				<select
					value={collectionFilter}
					onChange={(e) =>
						onChangeCollectionFilter(e.target.value as BookCollectionFilter)
					}
					style={{
						width: '100%',
						padding: 10,
						marginTop: 4,
						borderRadius: 8,
						border: '1px solid #ccc',
						boxSizing: 'border-box',
					}}
				>
					{BOOK_COLLECTION_FILTERS.map((collection) => (
						<option key={collection} value={collection}>
							{collection === '전체' ? t('filters.all') : t(BOOK_COLLECTION_LABEL_KEYS[collection])}
						</option>
					))}
				</select>
			</label>

			<label style={{ minWidth: 0, fontSize: 13 }}>
				{t('book.field.sort')}
				<select
					value={sortBy}
					onChange={(e) => onChangeSortBy(e.target.value as BookSortBy)}
					style={{
						width: '100%',
						padding: 10,
						marginTop: 4,
						borderRadius: 8,
						border: '1px solid #ccc',
						boxSizing: 'border-box',
					}}
				>
					{BOOK_SORT_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{t(BOOK_SORT_LABEL_KEYS[option.value])}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
