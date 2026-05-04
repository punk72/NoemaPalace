import type { Book } from '@/entities/book/model/types';
import BookListControls from '@/entities/book/ui/BookListControls';
import BookSearch from '@/entities/book/ui/BookSearch';
import BackupControls, {
	type BackupImportPreview,
} from '@/features/backup/ui/BackupControls';
import {
	type BookCollectionFilter,
	type BookSortBy,
	type BookStatusFilter,
} from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';
import BulkSelectionPanel from './BulkSelectionPanel';
import DuplicateCandidatesPanel from './DuplicateCandidatesPanel';
import ReadingDashboard from './ReadingDashboard';
import ReadingNowPanel from './ReadingNowPanel';
import ReadingPlanPanel from './ReadingPlanPanel';

type DuplicateGroup = Parameters<typeof DuplicateCandidatesPanel>[0]['groups'][number];

type LibraryToolsPanelProps = {
	allFilteredSelected: boolean;
	backupImportPreview: BackupImportPreview | null;
	collectionFilter: BookCollectionFilter;
	confirmingBulkDelete: boolean;
	duplicateGroups: DuplicateGroup[];
	filteredBooks: Book[];
	plannedBooks: Book[];
	readBooksCount: number;
	readingBooks: Book[];
	searchQuery: string;
	selectedCount: number;
	showBackupTools: boolean;
	showDashboard: boolean;
	showDuplicates: boolean;
	showLibraryActions: boolean;
	showListTools: boolean;
	showReadingNow: boolean;
	showReadingPlan: boolean;
	showSelectionTools: boolean;
	sortBy: BookSortBy;
	statusFilter: BookStatusFilter;
	totalOwnedCount: number;
	onBulkDelete: () => void;
	onBulkUpdate: (updates: Partial<Pick<Book, 'collection' | 'status'>>) => void;
	onCancelBulkDelete: () => void;
	onCancelImport: () => void;
	onChangeCollectionFilter: (value: BookCollectionFilter) => void;
	onChangeSearchQuery: (value: string) => void;
	onChangeSortBy: (value: BookSortBy) => void;
	onChangeStatusFilter: (value: BookStatusFilter) => void;
	onClearSelection: () => void;
	onConfirmBulkDelete: () => void;
	onConfirmImport: () => void;
	onExport: () => void;
	onImport: (file: File | null) => void;
	onSelectAll: (books: Book[]) => void;
	onSelectBook: (book: Book) => void;
	onToggleListTools: () => void;
	onToggleSelectionMode: () => void;
};

export default function LibraryToolsPanel({
	allFilteredSelected,
	backupImportPreview,
	collectionFilter,
	confirmingBulkDelete,
	duplicateGroups,
	filteredBooks,
	plannedBooks,
	readBooksCount,
	readingBooks,
	searchQuery,
	selectedCount,
	showBackupTools,
	showDashboard,
	showDuplicates,
	showLibraryActions,
	showListTools,
	showReadingNow,
	showReadingPlan,
	showSelectionTools,
	sortBy,
	statusFilter,
	totalOwnedCount,
	onBulkDelete,
	onBulkUpdate,
	onCancelBulkDelete,
	onCancelImport,
	onChangeCollectionFilter,
	onChangeSearchQuery,
	onChangeSortBy,
	onChangeStatusFilter,
	onClearSelection,
	onConfirmBulkDelete,
	onConfirmImport,
	onExport,
	onImport,
	onSelectAll,
	onSelectBook,
	onToggleListTools,
	onToggleSelectionMode,
}: LibraryToolsPanelProps) {
	const { t } = useI18n();

	return (
		<>
			{showDashboard && (
				<ReadingDashboard
					totalOwnedCount={totalOwnedCount}
					readingCount={readingBooks.length}
					readCount={readBooksCount}
					plannedCount={plannedBooks.length}
				/>
			)}

			{showReadingNow && (
				<ReadingNowPanel
					books={readingBooks}
					onSelectBook={onSelectBook}
				/>
			)}

			{showReadingPlan && (
				<ReadingPlanPanel
					books={plannedBooks}
					onSelectBook={onSelectBook}
				/>
			)}

			{showLibraryActions && (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gap: 8,
						marginBottom: 12,
					}}
				>
					<button
						type="button"
						onClick={onToggleListTools}
						style={{
							minHeight: 42,
							borderRadius: 8,
							border: showListTools
								? '1px solid var(--accent-border)'
								: '1px solid var(--border)',
							background: showListTools ? 'var(--accent-bg)' : 'var(--surface)',
							color: showListTools ? 'var(--accent)' : 'var(--text-h)',
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						{t('toolbar.search')}
					</button>
					<button
						type="button"
						onClick={onToggleSelectionMode}
						style={{
							minHeight: 42,
							borderRadius: 8,
							border: showSelectionTools
								? '1px solid var(--accent-border)'
								: '1px solid var(--border)',
							background: showSelectionTools ? 'var(--accent-bg)' : 'var(--surface)',
							color: showSelectionTools ? 'var(--accent)' : 'var(--text-h)',
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						{t('toolbar.selection')}
					</button>
				</div>
			)}

			{showListTools && (
				<>
					<BookSearch
						query={searchQuery}
						onChangeQuery={onChangeSearchQuery}
					/>

					<BookListControls
						statusFilter={statusFilter}
						collectionFilter={collectionFilter}
						sortBy={sortBy}
						onChangeStatusFilter={onChangeStatusFilter}
						onChangeCollectionFilter={onChangeCollectionFilter}
						onChangeSortBy={onChangeSortBy}
					/>

				</>
			)}

			{showDuplicates && (
				<DuplicateCandidatesPanel
					groups={duplicateGroups}
					onSelectGroup={(group) => onChangeSearchQuery(group.title)}
				/>
			)}

			{showBackupTools && (
				<BackupControls
					importPreview={backupImportPreview}
					onExport={onExport}
					onImport={onImport}
					onCancelImport={onCancelImport}
					onConfirmImport={onConfirmImport}
				/>
			)}

			{showSelectionTools && (
				<div
					style={{
						display: 'grid',
						gap: 8,
						marginBottom: 12,
						padding: 12,
						border: '1px solid var(--border)',
						borderRadius: 8,
						background: 'var(--surface-soft)',
					}}
				>
					<BulkSelectionPanel
						allFilteredSelected={allFilteredSelected}
						confirmingBulkDelete={confirmingBulkDelete}
						filteredBooks={filteredBooks}
						selectedCount={selectedCount}
						onBulkDelete={onBulkDelete}
						onBulkUpdate={onBulkUpdate}
						onCancelDelete={onCancelBulkDelete}
						onConfirmDelete={onConfirmBulkDelete}
						onSelectAll={onSelectAll}
						onClearSelection={onClearSelection}
					/>
				</div>
			)}
		</>
	);
}
