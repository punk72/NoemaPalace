import { deleteBook, getAllBooks, saveBook, updateBook } from '@/shared/api/storage';
import { BOOK_COLLECTIONS, BOOK_STATUSES } from '@/shared/constants/book';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import { imageUrlToBase64, resizeImage } from '@/shared/lib/image';
import { asString, asTimestamp, isRecord } from '@/shared/lib/normalize';

const MIGRATION_KEY = 'noema_migrated_v2';

export type BookInput = Partial<Record<keyof Book, unknown>>;

export interface BookRepository {
	save(book: BookInput): Promise<Book>;
	update(book: BookInput): Promise<Book>;
	delete(isbn13: string): Promise<void>;
	findAll(): Promise<Book[]>;
	upsert(book: unknown): Promise<Book | null>;
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

	for (const raw of list) {
		if (!isBookLike(raw)) continue;

		const migratedBook = await normalizeBook(raw);
		await updateBook(migratedBook);
	}

	localStorage.setItem(MIGRATION_KEY, 'true');
}

export const bookRepository: BookRepository = {
	async save(book) {
		const normalizedBook = await normalizeBook(book);
		await saveBook(normalizedBook);
		return normalizedBook;
	},

	async update(book) {
		const normalizedBook = await normalizeBook(book);
		await updateBook(normalizedBook);
		return normalizedBook;
	},

	async delete(isbn13) {
		await deleteBook(isbn13);
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
};
