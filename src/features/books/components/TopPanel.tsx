import type { RefObject } from 'react';

import type { AladinBookItem } from '@/features/books/api/aladin';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import type { CameraDevice } from '@/entities/camera/model/types';
import type {
	BookCollectionFilter,
	BookSortBy,
	BookStatusFilter,
} from '@/shared/constants/book';
import BackupControls from '@/features/backup/ui/BackupControls';
import BookListControls from '@/entities/book/ui/BookListControls';
import BookLookup from '@/features/books/components/BookLookup';
import BookPreview from '@/entities/book/ui/BookPreview';
import BookSearch from '@/entities/book/ui/BookSearch';
import CameraScanner from '@/features/scanner/components/CameraScanner';
import type { ToolbarAction } from '@/features/toolbar/components/BottomToolbar';
import { useI18n, type Locale } from '@/shared/i18n';
import BulkSelectionPanel from './BulkSelectionPanel';
import ScannerInterruptDialog from './ScannerInterruptDialog';

type TopPanelProps = {
	autoSave: boolean;
	book: AladinBookItem | null;
	booksCount: number;
	cameraDevices: CameraDevice[];
	collectionFilter: BookCollectionFilter;
	confirmingBulkDelete: boolean;
	error: string;
	filteredBooks: Book[];
	isbn: string;
	loading: boolean;
	pendingScannerAction: ToolbarAction | null;
	scanError: string;
	scannerActive: boolean;
	scannerBusy: boolean;
	searchQuery: string;
	selectedBookIds: Set<string>;
	selectedCount: number;
	selectedCameraId: string;
	selectionMode: boolean;
	showBackupTools: boolean;
	showListTools: boolean;
	showRegister: boolean;
	sortBy: BookSortBy;
	statusFilter: BookStatusFilter;
	topPanelMaxHeight: string;
	videoRef: RefObject<HTMLVideoElement | null>;
	alreadySaved: boolean;
	onBulkDelete: () => void;
	onBulkUpdate: (updates: Partial<Pick<Book, 'collection' | 'status'>>) => void;
	onCancelBulkDelete: () => void;
	onCancelScannerInterrupt: () => void;
	onChangeAutoSave: (value: boolean) => void;
	onChangeCamera: (deviceId: string) => void;
	onChangeCollectionFilter: (value: BookCollectionFilter) => void;
	onChangeIsbn: (value: string) => void;
	onChangeSearchQuery: (value: string) => void;
	onChangeSortBy: (value: BookSortBy) => void;
	onChangeStatusFilter: (value: BookStatusFilter) => void;
	onClearSelection: () => void;
	onClosePreview: () => void;
	onConfirmBulkDelete: () => void;
	onConfirmScannerInterrupt: () => void;
	onExportBooks: () => void;
	onImportBooks: (file: File | null) => void;
	onLookup: () => void;
	onSaveBook: (options: {
		collection: BookCollection;
		status: BookStatus;
		cover: string;
	}) => void;
	onSelectAll: (books: Book[]) => void;
	onToggleScanner: () => void;
};

export default function TopPanel({
	autoSave,
	book,
	booksCount,
	cameraDevices,
	collectionFilter,
	confirmingBulkDelete,
	error,
	filteredBooks,
	isbn,
	loading,
	pendingScannerAction,
	scanError,
	scannerActive,
	scannerBusy,
	searchQuery,
	selectedBookIds,
	selectedCount,
	selectedCameraId,
	selectionMode,
	showBackupTools,
	showListTools,
	showRegister,
	sortBy,
	statusFilter,
	topPanelMaxHeight,
	videoRef,
	alreadySaved,
	onBulkDelete,
	onBulkUpdate,
	onCancelBulkDelete,
	onCancelScannerInterrupt,
	onChangeAutoSave,
	onChangeCamera,
	onChangeCollectionFilter,
	onChangeIsbn,
	onChangeSearchQuery,
	onChangeSortBy,
	onChangeStatusFilter,
	onClearSelection,
	onClosePreview,
	onConfirmBulkDelete,
	onConfirmScannerInterrupt,
	onExportBooks,
	onImportBooks,
	onLookup,
	onSaveBook,
	onSelectAll,
	onToggleScanner,
}: TopPanelProps) {
	const { locale, setLocale, t } = useI18n();
	const allFilteredSelected =
		filteredBooks.length > 0 &&
		filteredBooks.every((book) => selectedBookIds.has(book.isbn13));

	return (
		<section
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 10,
				minWidth: 0,
				flexShrink: 0,
				paddingBottom: 12,
				borderBottom: '1px solid #e5e5e5',
				background: 'var(--bg)',
				maxHeight: topPanelMaxHeight,
				overflowX: 'hidden',
				overflowY: 'auto',
				overscrollBehavior: 'contain',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 12,
					alignItems: 'center',
					marginBottom: 12,
					minWidth: 0,
				}}
			>
				<div style={{ minWidth: 0, textAlign: 'left' }}>
					<h1 style={{ margin: 0, fontSize: 28 }}>{t('app.brand')}</h1>
					<p style={{ marginTop: 2, color: '#666', fontSize: 14 }}>
						{t('app.subtitle')}
					</p>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						flexShrink: 0,
					}}
				>
					<label
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							color: '#666',
							fontSize: 12,
						}}
					>
						<span>{t('language.label')}</span>
						<select
							value={locale}
							onChange={(event) => setLocale(event.target.value as Locale)}
							style={{
								padding: '4px 6px',
								borderRadius: 6,
								border: '1px solid var(--border)',
								background: 'var(--surface)',
								color: 'var(--text-h)',
							}}
						>
							<option value="ko">{t('language.ko')}</option>
							<option value="en">{t('language.en')}</option>
						</select>
					</label>
					<span style={{ color: '#666', fontSize: 14 }}>
						{filteredBooks.length}/{booksCount}
					</span>
				</div>
			</div>

			{showRegister && (
				<>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
						<input
							type="checkbox"
							checked={autoSave}
							onChange={(event) => onChangeAutoSave(event.target.checked)}
						/>
						{t('lookup.autoSave')}
					</label>
					<BookLookup
						isbn={isbn}
						loading={loading}
						scanning={scannerBusy}
						onChangeIsbn={onChangeIsbn}
						onLookup={onLookup}
						onToggleScanner={onToggleScanner}
					/>
					{pendingScannerAction && (
						<ScannerInterruptDialog
							action={pendingScannerAction}
							onCancel={onCancelScannerInterrupt}
							onConfirm={onConfirmScannerInterrupt}
						/>
					)}
					<CameraScanner
						scanning={scannerActive}
						scanError={scanError}
						cameraDevices={cameraDevices}
						selectedCameraId={selectedCameraId}
						videoRef={videoRef}
						onChangeCamera={onChangeCamera}
					/>

					{error && (
						<p style={{ color: 'crimson', marginBottom: 16 }}>
							{error}
						</p>
					)}

					{book && (
						<BookPreview
							key={book.isbn13}
							book={book}
							alreadySaved={alreadySaved}
							onSaveBook={onSaveBook}
							onClose={onClosePreview}
						/>
					)}
				</>
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

			{showBackupTools && (
				<BackupControls
					onExport={onExportBooks}
					onImport={onImportBooks}
				/>
			)}

			{selectionMode && (
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
		</section>
	);
}
