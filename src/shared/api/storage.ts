import { openDB } from 'idb';
import type { Book } from '@/entities/book/model/types';

const DB_NAME = 'noema-palace';
const STORE_NAME = 'books';

const dbPromise = openDB(DB_NAME, 1, {
	upgrade(db) {
		if (!db.objectStoreNames.contains(STORE_NAME)) {
			db.createObjectStore(STORE_NAME, { keyPath: 'isbn13' });
		}
	},
});

export async function saveBook(book: Book) {
	const db = await dbPromise;
	await db.put(STORE_NAME, book);
}

export async function saveBooks(books: Book[]) {
	const db = await dbPromise;
	const tx = db.transaction(STORE_NAME, 'readwrite');

	await Promise.all(books.map((book) => tx.store.put(book)));
	await tx.done;
}

export async function getAllBooks(): Promise<Book[]> {
	const db = await dbPromise;
	return db.getAll(STORE_NAME);
}

export async function updateBook(book: Book) {
	const db = await dbPromise;
	await db.put(STORE_NAME, { ...book, updatedAt: Date.now() });
}

export async function updateBooks(books: Book[]) {
	const db = await dbPromise;
	const tx = db.transaction(STORE_NAME, 'readwrite');
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
	await db.delete(STORE_NAME, isbn13);
}

export async function deleteBooks(isbn13s: string[]) {
	const db = await dbPromise;
	const tx = db.transaction(STORE_NAME, 'readwrite');

	await Promise.all(isbn13s.map((isbn13) => tx.store.delete(isbn13)));
	await tx.done;
}
