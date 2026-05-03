import { useEffect, useState } from 'react';

import AppShell from '@/shared/ui/AppShell';
import BookDetail from '@/entities/book/ui/BookDetail';
import BookList from '@/entities/book/ui/BookList';
import Toast from '@/shared/ui/Toast';
import TopPanel from '@/features/books/components/TopPanel';
import { useBookFilters } from '@/features/books/hooks/useBookFilters';
import { useBookLibrary } from '@/features/books/hooks/useBookLibrary';
import { useBookLookup } from '@/features/books/hooks/useBookLookup';
import { useBookSelection } from '@/features/books/hooks/useBookSelection';
import { useCameraScanner } from '@/features/scanner/hooks/useCameraScanner';
import BottomToolbar, {
	type ToolbarAction,
	type ToolbarMode,
} from '@/features/toolbar/components/BottomToolbar';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import type { Book } from '@/entities/book/model/types';

export default function App() {
	const [toast, setToast] = useState('');
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);
	const [showListTools, setShowListTools] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [showBackupTools, setShowBackupTools] = useState(false);
	const [pendingScannerAction, setPendingScannerAction] =
		useState<ToolbarAction | null>(null);
	const [toolbarMode, setToolbarMode] = useLocalStorageState<ToolbarMode>(
		STORAGE_KEYS.toolbarMode,
		'compact',
	);
	const [autoSave, setAutoSave] = useLocalStorageState<boolean>(
		STORAGE_KEYS.autoSave,
		false,
	);

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
	const lookup = useBookLookup({
		autoSave,
		books,
		onSaveBook: saveLibraryBook,
		onToast: setToast,
	});

	const handleUpdateBook = async (book: Book) => {
		await updateLibraryBook(book);
		setToast('책 정보가 수정되었습니다');
	};

	const handleDeleteBook = async (isbn13: string) => {
		try {
			await removeLibraryBook(isbn13);
			setSelectedBook(null);

			if (window.history.state?.view === 'detail') {
				window.history.replaceState(null, '', window.location.href);
			}

			setToast('삭제되었습니다');
		} catch (err) {
			console.error('책 삭제 실패:', err);
			setToast('삭제 중 오류가 발생했습니다');
		}
	};

	const handleBulkDelete = async () => {
		const ids = Array.from(selection.selectedBookIds);
		if (!ids.length) return;

		try {
			await removeLibraryBooks(ids);
			selection.clearSelection();
			setToast(`${ids.length}권을 삭제했습니다`);
		} catch (err) {
			console.error('일괄 삭제 실패:', err);
			setToast('일괄 삭제 중 오류가 발생했습니다');
		}
	};

	const handleBulkUpdate = async (updates: Partial<Pick<Book, 'collection' | 'status'>>) => {
		if (!selection.selectedBookIds.size) return;

		const selectedBooks = books.filter((book) =>
			selection.selectedBookIds.has(book.isbn13)
		);

		try {
			await updateLibraryBooks(selectedBooks, updates);
			setToast(`${selectedBooks.length}권을 수정했습니다`);
		} catch (err) {
			console.error('일괄 수정 실패:', err);
			setToast('일괄 수정 중 오류가 발생했습니다');
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
				setToast('책 목록 로드 실패');
				console.error('책 목록 로드 실패:', err);
			}
		};

		void init();
	}, [loadBooks]);

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
			setToast('ISBN 스캔 완료');

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
		if (scannerBusy) {
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
			setToast('내보내기 완료');
		} catch (err) {
			console.error(err);
			setToast('내보내기 중 오류가 발생했습니다.');
		}
	};

	const handleImportBooks = async (file: File | null) => {
		if (!file) return;

		try {
			const text = await file.text();
			const importedBooks = JSON.parse(text) as unknown[];

			if (!Array.isArray(importedBooks)) {
				setToast('올바른 백업 파일이 아닙니다.');
				return;
			}

			await importBooks(importedBooks);
			setToast('가져오기 완료');
		} catch (err) {
			console.error(err);
			setToast('가져오기 중 오류가 발생했습니다.');
		}
	};

	const topPanelMaxHeight = lookup.book ? '78svh' : '55svh';

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
					collectionFilter={collectionFilter}
					confirmingBulkDelete={selection.confirmingBulkDelete}
					error={lookup.error}
					filteredBooks={filteredBooks}
					isbn={lookup.isbn}
					loading={lookup.loading}
					pendingScannerAction={pendingScannerAction}
					scanError={scanError}
					scannerActive={scannerActive}
					scannerBusy={scannerBusy}
					searchQuery={searchQuery}
					selectedBookIds={selection.selectedBookIds}
					selectedCount={selection.selectedCount}
					selectedCameraId={selectedCameraId}
					selectionMode={selection.selectionMode}
					showBackupTools={showBackupTools}
					showListTools={showListTools}
					showRegister={showRegister}
					sortBy={sortBy}
					statusFilter={statusFilter}
					topPanelMaxHeight={topPanelMaxHeight}
					videoRef={videoRef}
					alreadySaved={lookup.alreadySaved}
					onBulkDelete={handleBulkDelete}
					onBulkUpdate={handleBulkUpdate}
					onCancelBulkDelete={() => selection.setConfirmingBulkDelete(false)}
					onCancelScannerInterrupt={handleCancelScannerInterrupt}
					onChangeAutoSave={setAutoSave}
					onChangeCamera={setSelectedCameraId}
					onChangeCollectionFilter={setCollectionFilter}
					onChangeIsbn={lookup.setIsbn}
					onChangeSearchQuery={setSearchQuery}
					onChangeSortBy={setSortBy}
					onChangeStatusFilter={setStatusFilter}
					onClearSelection={selection.clearSelection}
					onClosePreview={lookup.closePreview}
					onConfirmBulkDelete={() => selection.setConfirmingBulkDelete(true)}
					onConfirmScannerInterrupt={handleConfirmScannerInterrupt}
					onExportBooks={handleExportBooks}
					onImportBooks={handleImportBooks}
					onLookup={lookup.lookup}
					onSaveBook={lookup.savePreviewBook}
					onSelectAll={selection.selectBooks}
					onToggleScanner={toggleScanner}
				/>

				<section
					style={{
						flex: 1,
						minHeight: 0,
						minWidth: 0,
						overflowY: 'auto',
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
					/>
				</section>
			</AppShell>
		</>
	);
}
