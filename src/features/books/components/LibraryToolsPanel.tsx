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
	showListTools: boolean;
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
	showListTools,
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
}: LibraryToolsPanelProps) {
	return (
		<>
			<ReadingDashboard
				totalOwnedCount={totalOwnedCount}
				readingCount={readingBooks.length}
				readCount={readBooksCount}
				plannedCount={plannedBooks.length}
			/>

			<ReadingNowPanel
				books={readingBooks}
				onSelectBook={onSelectBook}
			/>

			<ReadingPlanPanel
				books={plannedBooks}
				onSelectBook={onSelectBook}
			/>

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

					<DuplicateCandidatesPanel
						groups={duplicateGroups}
						onSelectGroup={(group) => onChangeSearchQuery(group.title)}
					/>
				</>
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
