import {
	deleteBook,
	deleteBooks,
	getAllBooks,
	getBook,
	saveBook,
	saveBooks,
	updateBook,
	updateBooks,
} from '@/shared/api/storage';
import { BOOK_COLLECTIONS, BOOK_STATUSES } from '@/shared/constants/book';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { imageUrlToBase64, resizeImage } from '@/shared/lib/image';
import {
	asPositiveInteger,
	asNonNegativeInteger,
	asString,
	asTimestamp,
	isRecord,
} from '@/shared/lib/normalize';

const MIGRATION_KEY = 'noema_migrated_v6';

export type BookInput = Partial<Record<keyof Book, unknown>>;

export interface BookRepository {
	save(book: BookInput): Promise<Book>;
	saveMany(books: BookInput[]): Promise<Book[]>;
	update(book: BookInput): Promise<Book>;
	updateMany(books: BookInput[]): Promise<Book[]>;
	delete(isbn13: string, count?: number): Promise<BookDeleteResult>;
	deleteMany(isbn13s: string[]): Promise<void>;
	findAll(): Promise<Book[]>;
	upsert(book: unknown): Promise<Book | null>;
	upsertMany(books: unknown[]): Promise<Book[]>;
}

export type BookDeleteResult =
	| { deleted: true; book: null }
	| { deleted: false; book: Book };

function isBookLike(obj: unknown): obj is BookInput {
	return isRecord(obj) && 'isbn13' in obj;
}

function normalizeLocation(rawLocation: unknown) {
	if (!isRecord(rawLocation)) {
		return {
			bookcase: '',
			shelf: '',
			zone: '',
		};
	}

	return {
		bookcase: asString(rawLocation.bookcase).trim(),
		shelf: asString(rawLocation.shelf).trim(),
		zone: asString(rawLocation.zone).trim(),
	};
}

function normalizeReadingProgress(rawReadingProgress: unknown) {
	if (!isRecord(rawReadingProgress)) {
		return {
			currentPage: 0,
			totalPages: 0,
		};
	}

	const currentPage = asNonNegativeInteger(rawReadingProgress.currentPage, 0);
	const totalPages = asNonNegativeInteger(rawReadingProgress.totalPages, 0);

	return {
		currentPage,
		totalPages,
	};
}

function normalizeReadingPlan(rawReadingPlan: unknown) {
	if (!isRecord(rawReadingPlan)) {
		return {
			planned: false,
			priority: 0,
		};
	}

	return {
		planned: rawReadingPlan.planned === true,
		priority: asNonNegativeInteger(rawReadingPlan.priority, 0),
	};
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
		ownedCount: asPositiveInteger(raw.ownedCount, 1),
		location: normalizeLocation(raw.location),
		readingProgress: normalizeReadingProgress(raw.readingProgress),
		readingPlan: normalizeReadingPlan(raw.readingPlan),
		createdAt: asTimestamp(raw.createdAt, now),
		updatedAt: options.preserveUpdatedAt
			? asTimestamp(raw.updatedAt, now)
			: now,
	};
}

async function saveOrIncrement(book: Book) {
	const existing = await getBook(book.isbn13);

	if (!existing) {
		await saveBook(book);
		return book;
	}

	const updatedBook = await normalizeBook({
		...existing,
		ownedCount: existing.ownedCount + book.ownedCount,
		updatedAt: Date.now(),
	});

	await updateBook(updatedBook);
	return updatedBook;
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
		return saveOrIncrement(normalizedBook);
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

	async delete(isbn13, count = Number.MAX_SAFE_INTEGER) {
		const existing = await getBook(isbn13);

		if (!existing || count >= existing.ownedCount) {
			await deleteBook(isbn13);
			return { deleted: true, book: null };
		}

		const updatedBook = await normalizeBook({
			...existing,
			ownedCount: existing.ownedCount - Math.max(1, Math.floor(count)),
			updatedAt: Date.now(),
		});

		await updateBook(updatedBook);
		return { deleted: false, book: updatedBook };
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
