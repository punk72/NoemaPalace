import { useCallback, useState } from 'react';

import type { AladinBookItem } from '@/features/books/api/aladin';
import { lookupBookByIsbn } from '@/features/books/api/bookLookup';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { normalizeIsbn } from '@/shared/lib/isbn';
import { playLookupErrorSound, playLookupSuccessSound } from '@/shared/lib/sound';
import type { BookInput } from '../services/bookRepository';

type LookupState =
	| { type: 'invalid-isbn' }
	| { type: 'not-found' }
	| { type: 'duplicated-autosave'; book: AladinBookItem }
	| { type: 'duplicated-preview'; book: AladinBookItem }
	| { type: 'new-autosave'; book: AladinBookItem }
	| { type: 'new-preview'; book: AladinBookItem };

type SavePreviewOptions = {
	collection: BookCollection;
	status: BookStatus;
	cover: string;
};

type UseBookLookupOptions = {
	autoSave: boolean;
	books: Book[];
	onSaveBook: (book: BookInput) => Promise<Book>;
	onToast: (message: string) => void;
};

function createBookInput(
	book: AladinBookItem,
	options: Partial<SavePreviewOptions> = {},
): BookInput {
	return {
		id: book.isbn13,
		isbn13: book.isbn13,
		title: book.title,
		author: book.author,
		publisher: book.publisher,
		cover: options.cover ?? book.cover,
		pubDate: book.pubDate,
		collection: options.collection ?? '그외',
		status: options.status ?? '안읽음',
	};
}

export function useBookLookup({
	autoSave,
	books,
	onSaveBook,
	onToast,
}: UseBookLookupOptions) {
	const [isbn, setIsbn] = useState('');
	const [loading, setLoading] = useState(false);
	const [book, setBook] = useState<AladinBookItem | null>(null);
	const [error, setError] = useState('');

	const alreadySaved =
		book !== null && books.some((savedBook) => savedBook.isbn13 === book.isbn13);

	const classifyLookupState = useCallback((
		normalizedIsbn: string,
		result: AladinBookItem | null,
	): LookupState => {
		if (!normalizedIsbn) {
			return { type: 'invalid-isbn' };
		}

		if (!result) {
			return { type: 'not-found' };
		}

		const duplicated = books.some((savedBook) => savedBook.isbn13 === result.isbn13);

		if (duplicated && autoSave) {
			return { type: 'duplicated-autosave', book: result };
		}

		if (duplicated) {
			return { type: 'duplicated-preview', book: result };
		}

		if (autoSave) {
			return { type: 'new-autosave', book: result };
		}

		return { type: 'new-preview', book: result };
	}, [autoSave, books]);

	const notifyLookup = useCallback((message: string, sound: 'success' | 'error') => {
		onToast(message);

		if (sound === 'success') {
			playLookupSuccessSound();
			return;
		}

		playLookupErrorSound();
	}, [onToast]);

	const closePreview = useCallback(() => {
		setBook(null);
		setError('');
	}, []);

	const lookupFromValue = useCallback(async (rawIsbn: string) => {
		const normalizedIsbn = normalizeIsbn(rawIsbn);

		if (!normalizedIsbn) {
			const state = classifyLookupState(normalizedIsbn, null);
			if (state.type !== 'invalid-isbn') return;

			setError('ISBN을 입력해주세요.');
			setBook(null);
			return;
		}

		try {
			setLoading(true);
			setError('');
			setBook(null);

			const result = await lookupBookByIsbn(normalizedIsbn);
			const state = classifyLookupState(normalizedIsbn, result);

			if (state.type === 'not-found') {
				setError('검색 결과가 없습니다.');
				notifyLookup('검색 결과가 없습니다', 'error');
				return;
			}

			if (state.type === 'duplicated-autosave') {
				setIsbn('');
				notifyLookup('이미 등록된 책', 'error');
				return;
			}

			if (state.type === 'duplicated-preview') {
				setBook(state.book);
				notifyLookup('이미 등록된 책입니다', 'error');
				return;
			}

			if (state.type === 'new-autosave') {
				try {
					await onSaveBook(createBookInput(state.book));
					setIsbn('');
					notifyLookup('자동 저장 완료', 'success');
					return;
				} catch (err) {
					console.error(err);
					setBook(state.book);
					notifyLookup('자동 저장 실패', 'error');
					return;
				}
			}

			if (state.type === 'new-preview') {
				setBook(state.book);
				notifyLookup('도서 정보를 찾았습니다', 'success');
			}
		} catch (err) {
			console.error(err);
			setError('조회 중 오류가 발생했습니다.');
			setBook(null);
			notifyLookup('조회 중 오류가 발생했습니다.', 'error');
		} finally {
			setLoading(false);
		}
	}, [classifyLookupState, notifyLookup, onSaveBook]);

	const lookup = useCallback(() => {
		return lookupFromValue(isbn);
	}, [isbn, lookupFromValue]);

	const savePreviewBook = useCallback(async (options: SavePreviewOptions) => {
		if (!book) return;

		if (alreadySaved) {
			setError('이미 내 서재에 등록된 책입니다.');
			return;
		}

		try {
			await onSaveBook(createBookInput(book, options));
			setBook(null);
			setIsbn('');
			setError('');
			onToast('책이 저장되었습니다');
		} catch (err) {
			console.error(err);
			onToast('책 저장 중 오류가 발생했습니다.');
			setError('책 저장 중 오류가 발생했습니다.');
		}
	}, [alreadySaved, book, onSaveBook, onToast]);

	return {
		isbn,
		setIsbn,
		loading,
		book,
		error,
		alreadySaved,
		lookup,
		lookupFromValue,
		savePreviewBook,
		closePreview,
	};
}
