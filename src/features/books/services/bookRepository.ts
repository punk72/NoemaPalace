import {
	deleteBook,
	deleteBooks,
	getAllBooks,
	saveBook,
	saveBooks,
	updateBook,
	updateBooks,
} from '@/shared/api/storage';
import { BOOK_COLLECTIONS, BOOK_STATUSES } from '@/shared/constants/book';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { imageUrlToBase64, resizeImage } from '@/shared/lib/image';
import { asString, asTimestamp, isRecord } from '@/shared/lib/normalize';

const MIGRATION_KEY = 'noema_migrated_v2';

export type BookInput = Partial<Record<keyof Book, unknown>>;

export interface BookRepository {
	save(book: BookInput): Promise<Book>;
	saveMany(books: BookInput[]): Promise<Book[]>;
	update(book: BookInput): Promise<Book>;
	updateMany(books: BookInput[]): Promise<Book[]>;
	delete(isbn13: string): Promise<void>;
	deleteMany(isbn13s: string[]): Promise<void>;
	findAll(): Promise<Book[]>;
	upsert(book: unknown): Promise<Book | null>;
	upsertMany(books: unknown[]): Promise<Book[]>;
}

function isBookLike(obj: unknown): obj is BookInput {
	return isRecord(obj) && 'isbn13' in obj;
}

async function normalizeCover(coverUrl: string) {
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
}

async function normalizeBook(raw: BookInput, options: { preserveUpdatedAt?: boolean } = {}) {
	const statusAliases: Record<string, BookStatus> = {
		미읽: '안읽음',
		완독: '읽음',
	};

	const now = Date.now();
	const rawStatus = asString(raw.status);
	const rawCollection = asString(raw.collection);
	const isbn13 = asString(raw.isbn13);
	const cover = await normalizeCover(asString(raw.cover));

	const status: BookStatus =
		BOOK_STATUSES.includes(rawStatus as BookStatus)
			? (rawStatus as BookStatus)
			: statusAliases[rawStatus] ?? '안읽음';

	const collection: BookCollection =
		BOOK_COLLECTIONS.includes(rawCollection as BookCollection)
			? (rawCollection as BookCollection)
			: '그외';

	return {
		id: asString(raw.id) || isbn13 || crypto.randomUUID(),
		isbn13,
		title: asString(raw.title),
		author: asString(raw.author),
		publisher: asString(raw.publisher),
		cover,
		pubDate: asString(raw.pubDate),
		collection,
		status,
		createdAt: asTimestamp(raw.createdAt, now),
		updatedAt: options.preserveUpdatedAt
			? asTimestamp(raw.updatedAt, now)
			: now,
	};
}

async function migrateBooks() {
	if (localStorage.getItem(MIGRATION_KEY)) return;

	const list = (await getAllBooks()) as unknown[];
	const migratedBooks: Book[] = [];

	for (const raw of list) {
		if (!isBookLike(raw)) continue;

		const migratedBook = await normalizeBook(raw);
		migratedBooks.push(migratedBook);
	}

	if (migratedBooks.length) {
		await updateBooks(migratedBooks);
	}

	localStorage.setItem(MIGRATION_KEY, 'true');
}

export const bookRepository: BookRepository = {
	async save(book) {
		const normalizedBook = await normalizeBook(book);
		await saveBook(normalizedBook);
		return normalizedBook;
	},

	async saveMany(books) {
		const normalizedBooks = await Promise.all(
			books.map((book) => normalizeBook(book)),
		);
		await saveBooks(normalizedBooks);
		return normalizedBooks;
	},

	async update(book) {
		const normalizedBook = await normalizeBook(book);
		await updateBook(normalizedBook);
		return normalizedBook;
	},

	async updateMany(books) {
		const normalizedBooks = await Promise.all(
			books.map((book) => normalizeBook(book)),
		);
		await updateBooks(normalizedBooks);
		return normalizedBooks;
	},

	async delete(isbn13) {
		await deleteBook(isbn13);
	},

	async deleteMany(isbn13s) {
		await deleteBooks(isbn13s);
	},

	async findAll() {
		await migrateBooks();
		return getAllBooks();
	},

	async upsert(book) {
		if (!isBookLike(book)) return null;
		if (!asString(book.isbn13) || !asString(book.title)) return null;

		const normalizedBook = await normalizeBook(book);
		await saveBook(normalizedBook);
		return normalizedBook;
	},

	async upsertMany(books) {
		const normalizedBooks = await Promise.all(
			books
				.filter(isBookLike)
				.filter((book) => asString(book.isbn13) && asString(book.title))
				.map((book) => normalizeBook(book)),
		);

		await saveBooks(normalizedBooks);
		return normalizedBooks;
	},
};
