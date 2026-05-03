import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { BOOK_COLLECTIONS, BOOK_STATUSES } from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';

type BulkSelectionPanelProps = {
	allFilteredSelected: boolean;
	confirmingBulkDelete: boolean;
	filteredBooks: Book[];
	selectedCount: number;
	onBulkDelete: () => void;
	onBulkUpdate: (updates: Partial<Pick<Book, 'collection' | 'status'>>) => void;
	onCancelDelete: () => void;
	onConfirmDelete: () => void;
	onSelectAll: (books: Book[]) => void;
	onClearSelection: () => void;
};

export default function BulkSelectionPanel({
	allFilteredSelected,
	confirmingBulkDelete,
	filteredBooks,
	selectedCount,
	onBulkDelete,
	onBulkUpdate,
	onCancelDelete,
	onConfirmDelete,
	onSelectAll,
	onClearSelection,
}: BulkSelectionPanelProps) {
	const { t } = useI18n();

	if (selectedCount === 0) {
		return (
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
				<button
					type="button"
					onClick={() => onSelectAll(filteredBooks)}
					disabled={filteredBooks.length === 0}
					style={{
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: filteredBooks.length === 0 ? 'not-allowed' : 'pointer',
					}}
				>
					{t('selection.selectAll')}
				</button>
				<span style={{ color: '#666', fontSize: 14 }}>
					{t('selection.selectedCount', { count: 0 })}
				</span>
			</div>
		);
	}

	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
				<button
					type="button"
					onClick={() => {
						if (allFilteredSelected) {
							onClearSelection();
						} else {
							onSelectAll(filteredBooks);
						}
					}}
					disabled={filteredBooks.length === 0}
					style={{
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: filteredBooks.length === 0 ? 'not-allowed' : 'pointer',
					}}
				>
					{allFilteredSelected ? t('selection.clearAll') : t('selection.selectAll')}
				</button>
				<span style={{ color: '#666', fontSize: 14 }}>
					{t('selection.selectedCount', { count: selectedCount })}
				</span>
				<button
					type="button"
					onClick={onConfirmDelete}
					style={{
						marginLeft: 'auto',
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #f0b8b8',
						color: 'crimson',
						cursor: 'pointer',
					}}
				>
					{t('selection.deleteSelected')}
				</button>
			</div>

			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				<label style={{ flex: '1 1 140px', minWidth: 0 }}>
					{t('selection.changeCollection')}
					<select
						defaultValue=""
						onChange={(event) => {
							const collection = event.target.value as BookCollection;
							if (!collection) return;
							onBulkUpdate({ collection });
							event.currentTarget.value = '';
						}}
						style={{
							width: '100%',
							padding: 8,
							marginTop: 4,
							borderRadius: 8,
							border: '1px solid #ccc',
							boxSizing: 'border-box',
						}}
					>
						<option value="" disabled>{t('selection.choose')}</option>
						{BOOK_COLLECTIONS.map((collection) => (
							<option key={collection} value={collection}>
								{collection}
							</option>
						))}
					</select>
				</label>

				<label style={{ flex: '1 1 140px', minWidth: 0 }}>
					{t('selection.changeStatus')}
					<select
						defaultValue=""
						onChange={(event) => {
							const status = event.target.value as BookStatus;
							if (!status) return;
							onBulkUpdate({ status });
							event.currentTarget.value = '';
						}}
						style={{
							width: '100%',
							padding: 8,
							marginTop: 4,
							borderRadius: 8,
							border: '1px solid #ccc',
							boxSizing: 'border-box',
						}}
					>
						<option value="" disabled>{t('selection.choose')}</option>
						{BOOK_STATUSES.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</label>
			</div>

			{confirmingBulkDelete && (
				<div
					style={{
						padding: 12,
						border: '1px solid #f0b8b8',
						borderRadius: 8,
						background: '#fff5f5',
					}}
				>
					<p style={{ marginBottom: 10, color: '#9f1239' }}>
						{t('selection.deleteConfirm', { count: selectedCount })}
					</p>
					<div style={{ display: 'flex', gap: 8 }}>
						<button type="button" onClick={onBulkDelete} style={{ color: 'crimson' }}>
							{t('selection.confirmDelete')}
						</button>
						<button type="button" onClick={onCancelDelete}>
							{t('selection.cancel')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
