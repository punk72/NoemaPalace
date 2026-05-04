import { useEffect, useMemo, useState } from 'react';

import AppShell from '@/shared/ui/AppShell';
import BookDetail from '@/entities/book/ui/BookDetail';
import BookList from '@/entities/book/ui/BookList';
import BookListControls from '@/entities/book/ui/BookListControls';
import BookSearch from '@/entities/book/ui/BookSearch';
import Toast from '@/shared/ui/Toast';
import BackupControls, {
	type BackupImportPreview,
} from '@/features/backup/ui/BackupControls';
import BulkSelectionPanel from '@/features/books/components/BulkSelectionPanel';
import DuplicateCandidatesPanel from '@/features/books/components/DuplicateCandidatesPanel';
import TopPanel from '@/features/books/components/TopPanel';
import { useBookFilters } from '@/features/books/hooks/useBookFilters';
import { useBookLibrary } from '@/features/books/hooks/useBookLibrary';
import { useBookLookup } from '@/features/books/hooks/useBookLookup';
import { useBookSelection } from '@/features/books/hooks/useBookSelection';
import { getDuplicateBookGroups } from '@/features/books/lib/duplicateBooks';
import { useCameraScanner } from '@/features/scanner/hooks/useCameraScanner';
import BottomToolbar, {
	type ToolbarAction,
	type ToolbarMode,
} from '@/features/toolbar/components/BottomToolbar';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { useAppMessages } from '@/shared/messages';
import type { Book } from '@/entities/book/model/types';

function isImportableBook(item: unknown) {
	if (!item || typeof item !== 'object') return false;

	const record = item as Record<string, unknown>;
	return typeof record.isbn13 === 'string' && typeof record.title === 'string';
}

export default function App() {
	const [toast, setToast] = useState('');
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);
	const [showListTools, setShowListTools] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [showBackupTools, setShowBackupTools] = useState(false);
	const [pendingScannerAction, setPendingScannerAction] =
		useState<ToolbarAction | null>(null);
	const [backupImportPreview, setBackupImportPreview] =
		useState<BackupImportPreview | null>(null);
	const [toolbarMode, setToolbarMode] = useLocalStorageState<ToolbarMode>(
		STORAGE_KEYS.toolbarMode,
		'compact',
	);
	const [autoSave, setAutoSave] = useLocalStorageState<boolean>(
		STORAGE_KEYS.autoSave,
		false,
	);
	const { notify } = useAppMessages(setToast);

	const {
		books,
		reload: loadBooks,
		save: saveLibraryBook,
		update: updateLibraryBook,
		remove: removeLibraryBook,
		removeMany: removeLibraryBooks,
		updateMany: updateLibraryBooks,
		exportAll: exportBooks,
		importMany: importBooks,
	} = useBookLibrary();

	const {
		searchQuery,
		setSearchQuery,
		statusFilter,
		setStatusFilter,
		collectionFilter,
		setCollectionFilter,
		sortBy,
		setSortBy,
		filteredBooks,
		isFiltered,
	} = useBookFilters(books);

	const selection = useBookSelection();
	const duplicateGroups = useMemo(() => getDuplicateBookGroups(books), [books]);
	const lookup = useBookLookup({
		autoSave,
		books,
		onSaveBook: saveLibraryBook,
		onToast: setToast,
	});

	const handleUpdateBook = async (book: Book) => {
		await updateLibraryBook(book);
		notify('messages.book.updated');
	};

	const handleDeleteBook = async (isbn13: string) => {
		try {
			await removeLibraryBook(isbn13);
			setSelectedBook(null);

			if (window.history.state?.view === 'detail') {
				window.history.replaceState(null, '', window.location.href);
			}

			notify('messages.book.deleted');
		} catch (err) {
			console.error('책 삭제 실패:', err);
			notify('messages.book.deleteFailed');
		}
	};

	const handleBulkDelete = async () => {
		const ids = Array.from(selection.selectedBookIds);
		if (!ids.length) return;

		try {
			await removeLibraryBooks(ids);
			selection.clearSelection();
			notify('messages.book.bulkDeleted', { count: ids.length });
		} catch (err) {
			console.error('일괄 삭제 실패:', err);
			notify('messages.book.bulkDeleteFailed');
		}
	};

	const handleBulkUpdate = async (updates: Partial<Pick<Book, 'collection' | 'status'>>) => {
		if (!selection.selectedBookIds.size) return;

		const selectedBooks = books.filter((book) =>
			selection.selectedBookIds.has(book.isbn13)
		);

		try {
			await updateLibraryBooks(selectedBooks, updates);
			notify('messages.book.bulkUpdated', { count: selectedBooks.length });
		} catch (err) {
			console.error('일괄 수정 실패:', err);
			notify('messages.book.bulkUpdateFailed');
		}
	};

	const handleBackFromDetail = () => {
		window.history.back();
	};

	useEffect(() => {
		const init = async () => {
			try {
				await loadBooks();
			} catch (err) {
				notify('messages.book.loadFailed');
				console.error('책 목록 로드 실패:', err);
			}
		};

		void init();
	}, [loadBooks, notify]);

	useEffect(() => {
		if (!selectedBook) return;

		const state = window.history.state;
		if (state?.view === 'detail' && state?.isbn13 === selectedBook.isbn13) {
			return;
		}

		window.history.pushState(
			{ view: 'detail', isbn13: selectedBook.isbn13 },
			'',
		);
	}, [selectedBook]);

	useEffect(() => {
		const handlePopState = (event: PopStateEvent) => {
			const state = event.state;

			if (state?.view === 'detail' && state?.isbn13) {
				const found = books.find((book) => book.isbn13 === state.isbn13);
				setSelectedBook(found ?? null);
				return;
			}

			setSelectedBook(null);
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, [books]);

	const {
		scannerActive,
		scannerBusy,
		scanError,
		cameraDevices,
		selectedCameraId,
		videoRef,
		setSelectedCameraId,
		stopScanner,
		interruptScanner,
		resumeScanner,
		toggleScanner,
	} = useCameraScanner({
		onScan: (text) => {
			lookup.setIsbn(text);
			notify('messages.scanner.scanComplete');

			if ('vibrate' in navigator) {
				navigator.vibrate(120);
			}

			setTimeout(() => {
				void lookup.lookupFromValue(text);
			}, 100);
		},
	});

	const applyToolbarAction = (action: ToolbarAction) => {
		if (action === 'register') {
			setShowRegister((prev) => !prev);
			return;
		}

		if (action === 'search') {
			setShowListTools((prev) => !prev);
			return;
		}

		if (action === 'selection') {
			selection.toggleSelectionMode();
			return;
		}

		setShowBackupTools((prev) => !prev);
	};

	const handleToolbarAction = (action: ToolbarAction) => {
		if (scannerBusy && action === 'register') {
			setPendingScannerAction(action);
			interruptScanner();
			return;
		}

		applyToolbarAction(action);
	};

	const handleConfirmScannerInterrupt = () => {
		if (!pendingScannerAction) return;

		stopScanner();
		applyToolbarAction(pendingScannerAction);
		setPendingScannerAction(null);
	};

	const handleCancelScannerInterrupt = () => {
		setPendingScannerAction(null);
		resumeScanner();
	};

	const handleExportBooks = async () => {
		try {
			const list = await exportBooks();
			const json = JSON.stringify(list, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const timestamp = new Date()
				.toISOString()
				.replace(/[:.]/g, '-')
				.slice(0, 19);

			const link = document.createElement('a');
			link.href = url;
			link.download = `noema-palace-books-${timestamp}.json`;
			link.click();

			URL.revokeObjectURL(url);
			notify('messages.backup.exported');
		} catch (err) {
			console.error(err);
			notify('messages.backup.exportFailed');
		}
	};

	const handleImportBooks = async (file: File | null) => {
		if (!file) return;

		try {
			const text = await file.text();
			const importedBooks = JSON.parse(text) as unknown[];

			if (!Array.isArray(importedBooks)) {
				notify('messages.backup.invalidFile');
				return;
			}

			const existingIds = new Set(books.map((book) => book.isbn13));
			const validBooks = importedBooks.filter(isImportableBook);
			const overwriteCount = validBooks.filter((item) =>
				existingIds.has((item as Record<string, unknown>).isbn13 as string)
			).length;

			setBackupImportPreview({
				fileName: file.name,
				totalCount: importedBooks.length,
				newCount: validBooks.length - overwriteCount,
				overwriteCount,
				invalidCount: importedBooks.length - validBooks.length,
				items: importedBooks,
			});
		} catch (err) {
			console.error(err);
			notify('messages.backup.importFailed');
		}
	};

	const handleCancelImportBooks = () => {
		setBackupImportPreview(null);
	};

	const handleConfirmImportBooks = async () => {
		if (!backupImportPreview) return;

		try {
			await importBooks(backupImportPreview.items);
			notify('messages.backup.imported', {
				count: backupImportPreview.newCount + backupImportPreview.overwriteCount,
			});
			setBackupImportPreview(null);
		} catch (err) {
			console.error(err);
			notify('messages.backup.importFailed');
		}
	};

	const topPanelMaxHeight = lookup.book ? '78svh' : '55svh';
	const allFilteredSelected =
		filteredBooks.length > 0 &&
		filteredBooks.every((book) => selection.selectedBookIds.has(book.isbn13));
	const libraryTools = (
		<>
			{showListTools && (
				<>
					<BookSearch
						query={searchQuery}
						onChangeQuery={setSearchQuery}
					/>

					<BookListControls
						statusFilter={statusFilter}
						collectionFilter={collectionFilter}
						sortBy={sortBy}
						onChangeStatusFilter={setStatusFilter}
						onChangeCollectionFilter={setCollectionFilter}
						onChangeSortBy={setSortBy}
					/>

					<DuplicateCandidatesPanel
						groups={duplicateGroups}
						onSelectGroup={(group) => setSearchQuery(group.title)}
					/>
				</>
			)}

			{showBackupTools && (
				<BackupControls
					importPreview={backupImportPreview}
					onExport={handleExportBooks}
					onImport={handleImportBooks}
					onCancelImport={handleCancelImportBooks}
					onConfirmImport={handleConfirmImportBooks}
				/>
			)}

			{selection.selectionMode && (
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
						confirmingBulkDelete={selection.confirmingBulkDelete}
						filteredBooks={filteredBooks}
						selectedCount={selection.selectedCount}
						onBulkDelete={handleBulkDelete}
						onBulkUpdate={handleBulkUpdate}
						onCancelDelete={() => selection.setConfirmingBulkDelete(false)}
						onConfirmDelete={() => selection.setConfirmingBulkDelete(true)}
						onSelectAll={selection.selectBooks}
						onClearSelection={selection.clearSelection}
					/>
				</div>
			)}
		</>
	);

	if (selectedBook) {
		return (
			<>
				<Toast message={toast} onClose={() => setToast('')} />
				<BookDetail
					book={selectedBook}
					onBack={handleBackFromDetail}
					onUpdate={handleUpdateBook}
					onDelete={handleDeleteBook}
				/>
			</>
		);
	}

	return (
		<>
			<Toast message={toast} onClose={() => setToast('')} />
			<AppShell
				toolbar={
					<BottomToolbar
						mode={toolbarMode}
						activeActions={{
							backup: showBackupTools,
							register: showRegister,
							search: showListTools,
							selection: selection.selectionMode,
						}}
						onAction={handleToolbarAction}
						onToggleMode={() =>
							setToolbarMode((prev) => (prev === 'compact' ? 'full' : 'compact'))
						}
					/>
				}
			>
				<TopPanel
					autoSave={autoSave}
					book={lookup.book}
					booksCount={books.length}
					cameraDevices={cameraDevices}
					error={lookup.error}
					filteredBooks={filteredBooks}
					isbn={lookup.isbn}
					loading={lookup.loading}
					pendingScannerAction={pendingScannerAction}
					scanError={scanError}
					scannerActive={scannerActive}
					scannerBusy={scannerBusy}
					selectedCameraId={selectedCameraId}
					showRegister={showRegister}
					topPanelMaxHeight={topPanelMaxHeight}
					videoRef={videoRef}
					alreadySaved={lookup.alreadySaved}
					onCancelScannerInterrupt={handleCancelScannerInterrupt}
					onChangeAutoSave={setAutoSave}
					onChangeCamera={setSelectedCameraId}
					onChangeIsbn={lookup.setIsbn}
					onClosePreview={lookup.closePreview}
					onConfirmScannerInterrupt={handleConfirmScannerInterrupt}
					onLookup={lookup.lookup}
					onSaveBook={lookup.savePreviewBook}
					onToggleScanner={toggleScanner}
				/>

				<section
					style={{
						flex: 1,
						minHeight: 0,
						minWidth: 0,
						overflowY: 'hidden',
						paddingTop: 16,
						paddingBottom: 24,
					}}
				>
					<BookList
						books={filteredBooks}
						query={searchQuery}
						totalCount={books.length}
						isFiltered={isFiltered}
						onSelectBook={
							selection.selectionMode
								? selection.toggleBookSelection
								: setSelectedBook
						}
						onLongPressBook={selection.startSelectionFromBook}
						selectedBook={selectedBook}
						selectionMode={selection.selectionMode}
						selectedBookIds={selection.selectedBookIds}
						activeSelectionId={selection.lastSelectionTargetId}
						tools={libraryTools}
					/>
				</section>
			</AppShell>
		</>
	);
}
