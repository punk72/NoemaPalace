import { useEffect, useState } from 'react';


import { saveBook, getAllBooks, updateBook, deleteBook } from './services/storage';
import type { Book, BookCollection, BookStatus } from './types/book';
import { normalizeIsbn } from './utils/isbn';

import type { AladinBookItem } from './services/aladin';
import { lookupBookByIsbn } from './services/bookLookup';
import { useCameraScanner } from './hooks/useCameraScanner';

import BookList from './components/BookList';
import BookPreview from './components/BookPreview';
import BookLookup from './components/BookLookup';
import CameraScanner from './components/CameraScanner';
import BookDetail from './components/BookDetail';
import BackupControls from './components/BackupControls';
import BookSearch from './components/BookSearch';
import Toast from './components/Toast';
import BookListControls from './components/BookListControls';
import { imageUrlToBase64, resizeImage } from './utils/image';

export default function App() {
	const [isbn, setIsbn] = useState('');
	const [loading, setLoading] = useState(false);
	const [book, setBook] = useState<AladinBookItem | null>(null);
	const [books, setBooks] = useState<Book[]>([]);
	const [error, setError] = useState('');
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [toast, setToast] = useState('');
	const [showListTools, setShowListTools] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const [autoSave, setAutoSave] = useState(
		localStorage.getItem('autoSave') === 'true'
	);

	const [statusFilter, setStatusFilter] = useState<'전체' | BookStatus>(
		(localStorage.getItem('statusFilter') as '전체' | BookStatus) || '전체'
	);

	const [sortBy, setSortBy] = useState<'latest' | 'title' | 'author'>(
		(localStorage.getItem('sortBy') as 'latest' | 'title' | 'author') || 'latest'
	);

	const handleUpdateBook = async (book: Book) => {
		await updateBook(book);
		await loadBooks();
		setToast('책 정보가 수정되었습니다');
	};

	const handleDeleteBook = async (isbn13: string) => {
		await deleteBook(isbn13);
		await loadBooks();
		setSelectedBook(null);
		setToast('삭제되었습니다');
	};

	const handleBackFromDetail = () => {
		window.history.back();
	};

	const loadBooks = async () => {
		try {
			const list = await getAllBooks();
			const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
			setBooks(sorted);
		} catch (err) {
			setToast('책 목록 로드 실패');
			console.error('책 목록 로드 실패:', err);
		}
	};

	function isBookLike(obj: unknown): obj is Partial<Book> {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'isbn13' in obj
		);
	}

	const prepareCoverForSave = async (coverUrl: string) => {

		let cover = coverUrl || '';
		if (cover.startsWith('http')) {
			try {
				const base64 = await imageUrlToBase64(cover);
				cover = await resizeImage(base64);
			} catch (err) {
				console.warn('이미지 변환 실패, 원본 URL 유지', err);
			}
		}
		return cover;

	};

	const MIGRATION_KEY = 'noema_migrated_v2';

	const migrateBooks = async () => {
		if (localStorage.getItem(MIGRATION_KEY)) return;
		const list = (await getAllBooks()) as unknown[];

		for (const raw of list) {
			if (!isBookLike(raw)) continue;

			const validStatus: BookStatus[] = ['안읽음', '읽는중', '읽음', '대여중'];
			const validCollection: BookCollection[] = ['만화', '소설', '학습', '그외'];

			const rawStatus = typeof raw.status === 'string' ? raw.status : '';
			const rawCollection = typeof raw.collection === 'string' ? raw.collection : '';

			const status: BookStatus =
				validStatus.includes(rawStatus as BookStatus)
					? (rawStatus as BookStatus)
					: '안읽음';

			const collection: BookCollection =
				validCollection.includes(rawCollection as BookCollection)
					? (rawCollection as BookCollection)
					: '그외';
			
			const cover = await prepareCoverForSave(raw.cover || '');

			const migratedBook: Book = {
				id: raw.id ?? raw.isbn13 ?? crypto.randomUUID(),
				isbn13: raw.isbn13 ?? '',
				title: raw.title ?? '',
				author: raw.author ?? '',
				publisher: raw.publisher ?? '',
				cover,
				pubDate: raw.pubDate ?? '',
				collection,
				status,
				createdAt: raw.createdAt ?? Date.now(),
				updatedAt: Date.now(),
			};

			await updateBook(migratedBook);
		}
		localStorage.setItem(MIGRATION_KEY, 'true');
	};

	useEffect(() => {
		const init = async () => {
			await migrateBooks();
			await loadBooks();
		};
		void init();
	}, []);

	useEffect(() => {
		localStorage.setItem('autoSave', String(autoSave));
	}, [autoSave]);

	useEffect(() => {
		localStorage.setItem('statusFilter', statusFilter);
	}, [statusFilter]);

	useEffect(() => {
		localStorage.setItem('sortBy', sortBy);
	}, [sortBy]);

	useEffect(() => {
		if (!selectedBook) return;

		const state = window.history.state;

		if (
			state?.view === 'detail' &&
			state?.isbn13 === selectedBook.isbn13
		) {
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
				const found = books.find((b) => b.isbn13 === state.isbn13);
				setSelectedBook(found ?? null);
			} else {
				setSelectedBook(null);
			}
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, [books]);

	const handleLookupFromValue = async (rawIsbn: string) => {
		const trimmed = normalizeIsbn(rawIsbn);

		if (!trimmed) {
			setError('ISBN을 입력해주세요.');
			setBook(null);
			return;
		}
		
		try {
			setLoading(true);
			setError('');
			setBook(null);

			const result = await lookupBookByIsbn(trimmed);

			if (!result) {
				setError('검색 결과가 없습니다.');
				setToast('검색 결과가 없습니다');
				return;
			}

			if (books.some((b) => b.isbn13 === result.isbn13)) {
				setToast('이미 등록된 책');
				setBook(null);
				setIsbn('');
				return;
			}

			if (autoSave) {
				try {
					const now = Date.now();
								
					const cover = await prepareCoverForSave(result.cover || '');
					const newBook: Book = {
						id: result.isbn13,
						isbn13: result.isbn13,
						title: result.title,
						author: result.author,
						publisher: result.publisher,
						cover,
						pubDate: result.pubDate,
						collection: '그외',
						status: '안읽음',
						createdAt: now,
						updatedAt: now,
					};
					await saveBook(newBook);
					await loadBooks();
					setToast('자동 저장 완료');
					setBook(null);
					setIsbn('');
					return;
				} catch (err) {
					console.error(err);
					setToast('자동 저장 실패');
					setBook(result);
					return;
				}
			}
			setBook(result);
			setToast('도서 정보를 찾았습니다');
		} catch (err) {
			setToast('조회 중 오류가 발생했습니다.');
			console.error(err);
			setError('조회 중 오류가 발생했습니다.');
			setBook(null);
		} finally {
			setLoading(false);
		}
	};

	const {
		scanning,
		scanError,
		cameraDevices,
		selectedCameraId,
		videoRef,
		setSelectedCameraId,
		startScanner,
		stopScanner,
	} = useCameraScanner({

		onScan: (text) => {
			setIsbn(text);
			setToast('ISBN 스캔 완료');

			if ('vibrate' in navigator) {
				navigator.vibrate(120);
			}

			setTimeout(() => {
				handleLookupFromValue(text);
			}, 100);
		},

	});

	const handleLookup = async () => {
		await handleLookupFromValue(isbn);
	};

	const alreadySaved =
		book !== null && books.some((b) => b.isbn13 === book.isbn13);

	const handleSaveBook = async (options: { 
		collection: BookCollection; 
		status: BookStatus;
		cover: string;
	}) => {
		if (!book) return;

		if (alreadySaved) {
			setError('이미 내 서재에 등록된 책입니다.');
			return;
		}

		try {
			const now = Date.now();

			const cover = await prepareCoverForSave(options.cover || '');

			const newBook: Book = {
				id: book.isbn13,
				isbn13: book.isbn13,
				title: book.title,
				author: book.author,
				publisher: book.publisher,
				cover,
				pubDate: book.pubDate,
				collection: options.collection,
				status: options.status,
				createdAt: now,
				updatedAt: now,
			};

			await saveBook(newBook);
			await loadBooks();
			setBook(null);
			setIsbn('');
			setError('');
			setToast('책이 저장되었습니다');
		} catch (err) {
			setToast('책 저장 중 오류가 발생했습니다.');
			console.error(err);
			setError('책 저장 중 오류가 발생했습니다.');
		}
	};

	const handleExportBooks = async () => {
		try {
			const list = await getAllBooks();
			const json = JSON.stringify(list, null, 2);

			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const now = new Date();
			const timestamp = now
				.toISOString()
				.replace(/[:.]/g, '-')
				.slice(0, 19);

			const a = document.createElement('a');
			a.href = url;
			a.download = `noema-palace-books-${timestamp}.json`;
			a.click();

			URL.revokeObjectURL(url);
			setToast('내보내기 완료');
		} catch (err) {
			setToast('내보내기 중 오류가 발생했습니다.');
			console.error(err);
			setError('내보내기 중 오류가 발생했습니다.');
		}
	};

	const handleImportBooks = async (file: File | null) => {
		if (!file) return;

		try {
			const text = await file.text();
			const importedBooks = JSON.parse(text) as Book[];

			if (!Array.isArray(importedBooks)) {
				setError('올바른 백업 파일이 아닙니다.');
				return;
			}

			for (const importedBook of importedBooks) {
				if (!importedBook.isbn13 || !importedBook.title) continue;

				await saveBook({
					...importedBook,
					updatedAt: Date.now(),
				});
			}

			await loadBooks();
			setError('');
			setToast('가져오기 완료');
		} catch (err) {
			console.error(err);
			setToast('가져오기 중 오류가 발생했습니다.');
			setError('가져오기 중 오류가 발생했습니다.');
		}
	};

	const filteredBooks = books
		.filter((book) => {
			if (statusFilter !== '전체' && book.status !== statusFilter) {
				return false;
			}

			const query = searchQuery.trim().toLowerCase();
			if (!query) return true;

			return (
				book.title?.toLowerCase().includes(query) ||
				book.author?.toLowerCase().includes(query) ||
				book.publisher?.toLowerCase().includes(query) ||
				book.isbn13?.toLowerCase().includes(query)
			);
		})
		.sort((a, b) => {
			if (sortBy === 'title') {
				return a.title.localeCompare(b.title, 'ko');
			}

			if (sortBy === 'author') {
				return a.author.localeCompare(b.author, 'ko');
			}

			return b.createdAt - a.createdAt;
		});

	const isFiltered = 
		searchQuery.trim() !== '' ||
		statusFilter !== '전체';

	return (
		<>
			<Toast message={toast} onClose={() => setToast('')} />
			{
				selectedBook ? (
					<BookDetail
						book={selectedBook}
						onBack={handleBackFromDetail}
						onUpdate={handleUpdateBook}
						onDelete={handleDeleteBook}
					/>
				) : (
					<div
						style={{
							maxWidth: 720,
							margin: '0 auto',
							padding: 24,
							fontFamily: 'system-ui, sans-serif',
							overflowX: 'hidden',
						}}
					>
						<h1 style={{ marginBottom: 8 }}>NoemaPalace</h1>
						<p style={{ marginTop: 0, color: '#666' }}>
							ISBN 기반 개인 서재 관리 앱
						</p>
						<button
							type="button"
							onClick={() => setShowRegister((prev) => !prev)}
							style={{
								marginBottom: 16,
								padding: '8px 12px',
								borderRadius: 8,
								border: '1px solid #ccc',
								cursor: 'pointer',
							}}

						>
							{showRegister ? '책 등록 접기' : '책 등록 펼치기'}
						</button>
						{showRegister && (
							<>
								<label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
									<input
										type="checkbox"
										checked={autoSave}
										onChange={(e) => setAutoSave(e.target.checked)}
									/>
									자동 저장 (스캔 시)
								</label>
								<BookLookup
									isbn={isbn}
									loading={loading}
									onChangeIsbn={setIsbn}
									onLookup={handleLookup}
								/>
								<CameraScanner
									scanning={scanning}
									scanError={scanError}
									cameraDevices={cameraDevices}
									selectedCameraId={selectedCameraId}
									videoRef={videoRef}
									onChangeCamera={setSelectedCameraId}
									onStartScanner={startScanner}
									onStopScanner={stopScanner}
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
										onSaveBook={handleSaveBook}
										onClose={() => {
											setBook(null);
											setError('');
										}}
									/>
								)}
							</>
						)}

						<button
							type="button"
							onClick={() => setShowListTools((prev) => !prev)}
							style={{
								marginBottom: 12,
								padding: '8px 12px',
								borderRadius: 8,
								border: '1px solid #ccc',
								cursor: 'pointer',
							}}
						>
							{showListTools ? '검색/필터 접기' : '검색/필터 펼치기'}
						</button>

						{showListTools && (
							<>
								<BookSearch
									query={searchQuery}
									onChangeQuery={setSearchQuery}
								/>

								<BookListControls
									statusFilter={statusFilter}
									sortBy={sortBy}
									onChangeStatusFilter={setStatusFilter}
									onChangeSortBy={setSortBy}
								/>
							</>
						)}
						
						<BookList
							books={filteredBooks}
							query={searchQuery}
							totalCount={books.length}
							isFiltered={isFiltered}
							onSelectBook={setSelectedBook}
						/>
						<BackupControls
							onExport={handleExportBooks}
							onImport={handleImportBooks}
						/>
					</div>
				)
			}
		</>
	);
}