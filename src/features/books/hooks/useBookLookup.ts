import { useCallback, useState } from 'react';

import { lookupBookByIsbn } from '@/features/books/api/bookLookup';
import type { BookLookupItem } from '@/features/books/api/types';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { normalizeIsbn } from '@/shared/lib/isbn';
import { playLookupErrorSound, playLookupSuccessSound } from '@/shared/lib/sound';
import {
	useAppMessages,
	type AppMessageKey,
} from '@/shared/messages';
import type { BookInput } from '../services/bookRepository';

type LookupState =
	| { type: 'invalid-isbn' }
	| { type: 'not-found' }
	| { type: 'duplicated-autosave'; book: BookLookupItem }
	| { type: 'duplicated-preview'; book: BookLookupItem }
	| { type: 'new-autosave'; book: BookLookupItem }
	| { type: 'new-preview'; book: BookLookupItem };

type SavePreviewOptions = {
	collection: BookCollection;
	status: BookStatus;
	cover: string;
	ownedCount: number;
};

type UseBookLookupOptions = {
	autoSave: boolean;
	books: Book[];
	onSaveBook: (book: BookInput) => Promise<Book>;
	onToast: (message: string) => void;
};

function createBookInput(
	book: BookLookupItem,
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
		ownedCount: options.ownedCount ?? 1,
		location: {
			bookcase: '',
			shelf: '',
			zone: '',
		},
		readingProgress: {
			currentPage: 0,
			totalPages: 0,
		},
		readingPlan: {
			planned: false,
			priority: 0,
		},
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
	const [book, setBook] = useState<BookLookupItem | null>(null);
	const [errorKey, setErrorKey] = useState<AppMessageKey | null>(null);
	const { formatMessage, notify } = useAppMessages(onToast);
	const error = errorKey ? formatMessage(errorKey) : '';

	const alreadySaved =
		book !== null && books.some((savedBook) => savedBook.isbn13 === book.isbn13);

	const classifyLookupState = useCallback((
		normalizedIsbn: string,
		result: BookLookupItem | null,
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

	const notifyLookup = useCallback((key: AppMessageKey, sound: 'success' | 'error') => {
		notify(key);

		if (sound === 'success') {
			playLookupSuccessSound();
			return;
		}

		playLookupErrorSound();
	}, [notify]);

	const closePreview = useCallback(() => {
		setBook(null);
		setErrorKey(null);
	}, []);

	const lookupFromValue = useCallback(async (rawIsbn: string) => {
		const normalizedIsbn = normalizeIsbn(rawIsbn);

		if (!normalizedIsbn) {
			const state = classifyLookupState(normalizedIsbn, null);
			if (state.type !== 'invalid-isbn') return;

			setErrorKey('messages.lookup.invalidIsbn');
			setBook(null);
			return;
		}

		try {
			setLoading(true);
			setErrorKey(null);
			setBook(null);

			const result = await lookupBookByIsbn(normalizedIsbn);
			const state = classifyLookupState(normalizedIsbn, result);

			if (state.type === 'not-found') {
				setErrorKey('messages.lookup.notFound');
				notifyLookup('messages.lookup.notFound', 'error');
				return;
			}

			if (state.type === 'duplicated-autosave') {
				await onSaveBook(createBookInput(state.book, { ownedCount: 1 }));
				setIsbn('');
				notifyLookup('messages.lookup.duplicatedIncremented', 'success');
				return;
			}

			if (state.type === 'duplicated-preview') {
				setBook(state.book);
				notifyLookup('messages.lookup.duplicatedPreview', 'error');
				return;
			}

			if (state.type === 'new-autosave') {
				try {
					await onSaveBook(createBookInput(state.book));
					setIsbn('');
					notifyLookup('messages.lookup.autoSaveSuccess', 'success');
					return;
				} catch (err) {
					console.error(err);
					setBook(state.book);
					notifyLookup('messages.lookup.autoSaveFailed', 'error');
					return;
				}
			}

			if (state.type === 'new-preview') {
				setBook(state.book);
				notifyLookup('messages.lookup.found', 'success');
			}
		} catch (err) {
			console.error(err);
			setErrorKey('messages.lookup.failed');
			setBook(null);
			notifyLookup('messages.lookup.failed', 'error');
		} finally {
			setLoading(false);
		}
	}, [classifyLookupState, notifyLookup, onSaveBook]);

	const lookup = useCallback(() => {
		return lookupFromValue(isbn);
	}, [isbn, lookupFromValue]);

	const savePreviewBook = useCallback(async (options: SavePreviewOptions) => {
		if (!book) return;

		try {
			await onSaveBook(createBookInput(book, options));
			setBook(null);
			setIsbn('');
			setErrorKey(null);
			notify(alreadySaved ? 'messages.book.countIncreased' : 'messages.book.saved');
		} catch (err) {
			console.error(err);
			notify('messages.book.saveFailed');
			setErrorKey('messages.book.saveFailed');
		}
	}, [alreadySaved, book, notify, onSaveBook]);

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
