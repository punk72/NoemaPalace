import { openDB } from 'idb';
import type { Book } from '@/entities/book/model/types';
import type { BookNote } from '@/entities/note/model/types';

const DB_NAME = 'noema-palace';
const BOOK_STORE_NAME = 'books';
const NOTE_STORE_NAME = 'notes';

const dbPromise = openDB(DB_NAME, 2, {
	upgrade(db) {
		if (!db.objectStoreNames.contains(BOOK_STORE_NAME)) {
			db.createObjectStore(BOOK_STORE_NAME, { keyPath: 'isbn13' });
		}

		if (!db.objectStoreNames.contains(NOTE_STORE_NAME)) {
			const noteStore = db.createObjectStore(NOTE_STORE_NAME, { keyPath: 'id' });
			noteStore.createIndex('bookId', 'bookId');
		}
	},
});

export async function saveBook(book: Book) {
	const db = await dbPromise;
	await db.put(BOOK_STORE_NAME, book);
}

export async function saveBooks(books: Book[]) {
	const db = await dbPromise;
	const tx = db.transaction(BOOK_STORE_NAME, 'readwrite');

	await Promise.all(books.map((book) => tx.store.put(book)));
	await tx.done;
}

export async function getAllBooks(): Promise<Book[]> {
	const db = await dbPromise;
	return db.getAll(BOOK_STORE_NAME);
}

export async function getBook(isbn13: string): Promise<Book | undefined> {
	const db = await dbPromise;
	return db.get(BOOK_STORE_NAME, isbn13);
}

export async function updateBook(book: Book) {
	const db = await dbPromise;
	await db.put(BOOK_STORE_NAME, { ...book, updatedAt: Date.now() });
}

export async function updateBooks(books: Book[]) {
	const db = await dbPromise;
	const tx = db.transaction(BOOK_STORE_NAME, 'readwrite');
	const updatedAt = Date.now();

	await Promise.all(
		books.map((book) =>
			tx.store.put({
				...book,
				updatedAt,
			}),
		),
	);
	await tx.done;
}

export async function deleteBook(isbn13: string) {
	const db = await dbPromise;
	await db.delete(BOOK_STORE_NAME, isbn13);
}

export async function deleteBooks(isbn13s: string[]) {
	const db = await dbPromise;
	const tx = db.transaction(BOOK_STORE_NAME, 'readwrite');

	await Promise.all(isbn13s.map((isbn13) => tx.store.delete(isbn13)));
	await tx.done;
}

export async function saveNote(note: BookNote) {
	const db = await dbPromise;
	await db.put(NOTE_STORE_NAME, note);
}

export async function getNotesByBookId(bookId: string): Promise<BookNote[]> {
	const db = await dbPromise;
	return db.getAllFromIndex(NOTE_STORE_NAME, 'bookId', bookId);
}
