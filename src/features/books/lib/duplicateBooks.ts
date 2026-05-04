import type { Book } from '@/entities/book/model/types';
import { normalizeSearchText } from '@/shared/lib/search';

export type DuplicateBookGroup = {
	key: string;
	title: string;
	author: string;
	books: Book[];
};

function getDuplicateKey(book: Book) {
	return normalizeSearchText(`${book.title}:${book.author}`);
}

export function getDuplicateBookGroups(books: Book[]): DuplicateBookGroup[] {
	const groups = new Map<string, Book[]>();

	books.forEach((book) => {
		const key = getDuplicateKey(book);
		if (!key) return;

		const group = groups.get(key) ?? [];
		group.push(book);
		groups.set(key, group);
	});

	return Array.from(groups.entries())
		.filter(([, group]) => group.length > 1)
		.map(([key, group]) => ({
			key,
			title: group[0].title,
			author: group[0].author,
			books: group,
		}))
		.sort((a, b) => b.books.length - a.books.length);
}
