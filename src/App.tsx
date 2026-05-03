import { useEffect, useState } from 'react';


import { saveBook, getAllBooks, updateBook, deleteBook } from './services/storage';
import type { Book } from './types/book';
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


export default function App() {
	const [isbn, setIsbn] = useState('');
	const [loading, setLoading] = useState(false);
	const [book, setBook] = useState<AladinBookItem | null>(null);
	const [books, setBooks] = useState<Book[]>([]);
	const [error, setError] = useState('');
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);

	const handleUpdateBook = async (book: Book) => {
		await updateBook(book);
		await loadBooks();
	};

	const handleDeleteBook = async (isbn13: string) => {
		await deleteBook(isbn13);
		await loadBooks();
		setSelectedBook(null);
	};

	const loadBooks = async () => {
		try {
			const list = await getAllBooks();
			const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
			setBooks(sorted);
		} catch (err) {
			console.error('책 목록 로드 실패:', err);
		}
	};

	useEffect(() => {
		loadBooks();
	}, []);

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
				return;
			}

			setBook(result);
		} catch (err) {
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

	const handleSaveBook = async () => {
		if (!book) return;

		if (alreadySaved) {
			setError('이미 내 서재에 등록된 책입니다.');
			return;
		}

		try {
			const now = Date.now();

			const newBook: Book = {
				id: book.isbn13,
				isbn13: book.isbn13,
				title: book.title,
				author: book.author,
				publisher: book.publisher,
				cover: book.cover || '',
				pubDate: book.pubDate,
				collection: '그외',
				status: '미읽',
				createdAt: now,
				updatedAt: now,
			};

			await saveBook(newBook);
			await loadBooks();
			setBook(null);
			setIsbn('');
			setError('');
		} catch (err) {
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

			const a = document.createElement('a');
			a.href = url;
			a.download = `noema-palace-books-${new Date().toISOString().slice(0, 10)}.json`;
			a.click();

			URL.revokeObjectURL(url);
		} catch (err) {
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
		} catch (err) {
			console.error(err);
			setError('가져오기 중 오류가 발생했습니다.');
		}
	};
	return (
			selectedBook ? (
				<BookDetail
					book={selectedBook}
					onBack={() => setSelectedBook(null)}
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
					}}
				>
					<h1 style={{ marginBottom: 8 }}>NoemaPalace</h1>
					<p style={{ marginTop: 0, color: '#666' }}>
						ISBN 기반 개인 서재 관리 앱
					</p>

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
							book={book}
							alreadySaved={alreadySaved}
							onSaveBook={handleSaveBook}
						/>
					)}
					<BackupControls
						onExport={handleExportBooks}
						onImport={handleImportBooks}
					/>

					<BookList
						books={books}
						onSelectBook={setSelectedBook}
					/>
				</div>
			)
	);
}