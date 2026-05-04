import { useEffect, useMemo, useState } from 'react';

import AppShell from '@/shared/ui/AppShell';
import BookDetail from '@/entities/book/ui/BookDetail';
import BookList from '@/entities/book/ui/BookList';
import Toast from '@/shared/ui/Toast';
import {
	DEFAULT_APP_VIEW,
	type AppView,
} from '@/app/model/view';
import type { BackupImportPreview } from '@/features/backup/ui/BackupControls';
import LibraryToolsPanel from '@/features/books/components/LibraryToolsPanel';
import TopPanel from '@/features/books/components/TopPanel';
import { useBookFilters } from '@/features/books/hooks/useBookFilters';
import { useBookLibrary } from '@/features/books/hooks/useBookLibrary';
import { useBookLookup } from '@/features/books/hooks/useBookLookup';
import { useBookSelection } from '@/features/books/hooks/useBookSelection';
import { getDuplicateBookGroups } from '@/features/books/lib/duplicateBooks';
import { useBookNotes } from '@/features/notes/hooks/useBookNotes';
import { useCameraScanner } from '@/features/scanner/hooks/useCameraScanner';
import AppTabBar from '@/features/navigation/components/AppTabBar';
import { useApplyTheme } from '@/features/settings/hooks/useApplyTheme';
import type { AppTheme } from '@/features/settings/model/theme';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { useI18n } from '@/shared/i18n';
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
	const [backupImportPreview, setBackupImportPreview] =
		useState<BackupImportPreview | null>(null);
	const [activeView, setActiveView] = useLocalStorageState<AppView>(
		STORAGE_KEYS.activeView,
		DEFAULT_APP_VIEW,
	);
	const [autoSave, setAutoSave] = useLocalStorageState<boolean>(
		STORAGE_KEYS.autoSave,
		false,
	);
	const [theme, setTheme] = useLocalStorageState<AppTheme>(
		STORAGE_KEYS.theme,
		'system',
	);
	useApplyTheme(theme);
	const { notify } = useAppMessages(setToast);
	const { t } = useI18n();
	const {
		notes: selectedBookNotes,
		save: saveSelectedBookNote,
	} = useBookNotes(selectedBook?.isbn13 ?? null);

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
	const totalOwnedCount = useMemo(
		() => books.reduce((total, book) => total + book.ownedCount, 0),
		[books],
	);
	const filteredOwnedCount = useMemo(
		() => filteredBooks.reduce((total, book) => total + book.ownedCount, 0),
		[filteredBooks],
	);
	const readingBooks = useMemo(
		() => books.filter((book) => book.status === '읽는중'),
		[books],
	);
	const plannedBooks = useMemo(
		() =>
			books
				.filter((book) => book.readingPlan?.planned)
				.sort((a, b) =>
					(a.readingPlan?.priority ?? 0) - (b.readingPlan?.priority ?? 0)
				),
		[books],
	);
	const readBooksCount = useMemo(
		() => books.filter((book) => book.status === '읽음').length,
		[books],
	);
	const lookup = useBookLookup({
		autoSave,
		books,
		onSaveBook: saveLibraryBook,
		onToast: setToast,
	});

	const handleUpdateBook = async (book: Book) => {
		const updatedBook = await updateLibraryBook(book);
		setSelectedBook(updatedBook);
		notify('messages.book.updated');
	};

	const handleDeleteBook = async (isbn13: string, count?: number) => {
		try {
			const result = await removeLibraryBook(isbn13, count);

			if (result.deleted) {
				setSelectedBook(null);

				if (window.history.state?.view === 'detail') {
					window.history.replaceState(null, '', window.location.href);
				}

				notify('messages.book.deleted');
				return;
			}

			setSelectedBook(result.book);
			notify('messages.book.countDecreased', { count: result.book.ownedCount });
		} catch (err) {
			console.error('책 삭제 실패:', err);
			notify('messages.book.deleteFailed');
		}
	};

	const handleManualSaveBook = async (book: Parameters<typeof saveLibraryBook>[0]) => {
		try {
			await saveLibraryBook(book);
			notify('messages.book.saved');
		} catch (err) {
			console.error('수동 등록 실패:', err);
			notify('messages.book.saveFailed');
			throw err;
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

	const handleChangeView = (view: AppView) => {
		if (view !== 'register' && scannerBusy) {
			stopScanner();
		}

		if (view !== 'library') {
			selection.clearSelection();
		}

		setActiveView(view);
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
	const showRegister = activeView === 'register';
	const showHomeTools = activeView === 'home';
	const showLibraryTools = activeView === 'library';
	const showManageTools = activeView === 'manage';
	const allFilteredSelected =
		filteredBooks.length > 0 &&
		filteredBooks.every((book) => selection.selectedBookIds.has(book.isbn13));
	const libraryTools = (
		<LibraryToolsPanel
			allFilteredSelected={allFilteredSelected}
			backupImportPreview={backupImportPreview}
			collectionFilter={collectionFilter}
			confirmingBulkDelete={selection.confirmingBulkDelete}
			duplicateGroups={duplicateGroups}
			filteredBooks={filteredBooks}
			plannedBooks={plannedBooks}
			readBooksCount={readBooksCount}
			readingBooks={readingBooks}
			searchQuery={searchQuery}
			selectedCount={selection.selectedCount}
			showBackupTools={showManageTools}
			showDashboard={showHomeTools}
			showDuplicates={(showLibraryTools && showListTools) || showManageTools}
			showLibraryActions={showLibraryTools}
			showListTools={showLibraryTools && showListTools}
			showReadingNow={showHomeTools}
			showReadingPlan={showHomeTools}
			showSelectionTools={showLibraryTools && selection.selectionMode}
			sortBy={sortBy}
			statusFilter={statusFilter}
			totalOwnedCount={totalOwnedCount}
			onBulkDelete={handleBulkDelete}
			onBulkUpdate={handleBulkUpdate}
			onCancelBulkDelete={() => selection.setConfirmingBulkDelete(false)}
			onCancelImport={handleCancelImportBooks}
			onChangeCollectionFilter={setCollectionFilter}
			onChangeSearchQuery={setSearchQuery}
			onChangeSortBy={setSortBy}
			onChangeStatusFilter={setStatusFilter}
			onClearSelection={selection.clearSelection}
			onConfirmBulkDelete={() => selection.setConfirmingBulkDelete(true)}
			onConfirmImport={handleConfirmImportBooks}
			onExport={handleExportBooks}
			onImport={handleImportBooks}
			onSelectAll={selection.selectBooks}
			onSelectBook={setSelectedBook}
			onToggleListTools={() => setShowListTools((prev) => !prev)}
			onToggleSelectionMode={selection.toggleSelectionMode}
		/>
	);

	const mainContent = (() => {
		if (activeView === 'register') {
			return null;
		}

		if (activeView === 'notes') {
			return (
				<section
					style={{
						display: 'grid',
						gap: 8,
						padding: 16,
						border: '1px solid var(--border)',
						borderRadius: 8,
						background: 'var(--surface-soft)',
					}}
				>
					<h2>{t('views.notes')}</h2>
					<p style={{ color: 'var(--text)' }}>
						{t('notes.listPlaceholder')}
					</p>
				</section>
			);
		}

		if (activeView === 'home' || activeView === 'manage') {
			return libraryTools;
		}

		return (
			<BookList
				books={filteredBooks}
				query={searchQuery}
				totalCount={totalOwnedCount}
				visibleCount={filteredOwnedCount}
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
		);
	})();

	if (selectedBook) {
		return (
			<>
				<Toast message={toast} onClose={() => setToast('')} />
				<BookDetail
					key={`${selectedBook.isbn13}-${selectedBook.updatedAt}`}
					book={selectedBook}
					notes={selectedBookNotes}
					onBack={handleBackFromDetail}
					onUpdate={handleUpdateBook}
					onDelete={handleDeleteBook}
					onSaveNote={async (note) => {
						await saveSelectedBookNote(note);
						notify('messages.notes.saved');
					}}
				/>
			</>
		);
	}

	return (
		<>
			<Toast message={toast} onClose={() => setToast('')} />
			<AppShell
				toolbar={
					<AppTabBar
						activeView={activeView}
						onChangeView={handleChangeView}
					/>
				}
			>
				<TopPanel
					autoSave={autoSave}
					book={lookup.book}
					booksCount={totalOwnedCount}
					cameraDevices={cameraDevices}
					error={lookup.error}
					filteredBooksCount={filteredOwnedCount}
					isbn={lookup.isbn}
					loading={lookup.loading}
					pendingScannerAction={null}
					scanError={scanError}
					scannerActive={scannerActive}
					scannerBusy={scannerBusy}
					selectedCameraId={selectedCameraId}
					showRegister={showRegister}
					theme={theme}
					topPanelMaxHeight={topPanelMaxHeight}
					videoRef={videoRef}
					alreadySaved={lookup.alreadySaved}
					onCancelScannerInterrupt={stopScanner}
					onChangeAutoSave={setAutoSave}
					onChangeCamera={setSelectedCameraId}
					onChangeIsbn={lookup.setIsbn}
					onChangeTheme={setTheme}
					onClosePreview={lookup.closePreview}
					onConfirmScannerInterrupt={stopScanner}
					onLookup={lookup.lookup}
					onManualSaveBook={handleManualSaveBook}
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
					{mainContent}
				</section>
			</AppShell>
		</>
	);
}
