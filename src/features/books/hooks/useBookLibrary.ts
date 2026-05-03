import { useCallback, useState } from 'react';

import type { Book } from '@/entities/book/model/types';
import { bookRepository, type BookInput } from '../services/bookRepository';

type BulkBookUpdates = Partial<Pick<Book, 'collection' | 'status'>>;

export function useBookLibrary() {
	const [books, setBooks] = useState<Book[]>([]);

	const reload = useCallback(async () => {
		const list = await bookRepository.findAll();
		const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
		setBooks(sorted);
		return sorted;
	}, []);

	const save = useCallback(async (book: BookInput) => {
		const savedBook = await bookRepository.save(book);
		await reload();
		return savedBook;
	}, [reload]);

	const update = useCallback(async (book: BookInput) => {
		const updatedBook = await bookRepository.update(book);
		await reload();
		return updatedBook;
	}, [reload]);

	const remove = useCallback(async (isbn13: string) => {
		await bookRepository.delete(isbn13);
		await reload();
	}, [reload]);

	const removeMany = useCallback(async (isbn13s: string[]) => {
		for (const isbn13 of isbn13s) {
			await bookRepository.delete(isbn13);
		}

		await reload();
	}, [reload]);

	const updateMany = useCallback(async (
		booksToUpdate: Book[],
		updates: BulkBookUpdates,
	) => {
		for (const book of booksToUpdate) {
			await bookRepository.update({
				...book,
				...updates,
			});
		}

		await reload();
	}, [reload]);

	const exportAll = useCallback(() => {
		return bookRepository.findAll();
	}, []);

	const importMany = useCallback(async (items: unknown[]) => {
		for (const item of items) {
			await bookRepository.upsert(item);
		}

		await reload();
	}, [reload]);

	return {
		books,
		reload,
		save,
		update,
		remove,
		removeMany,
		updateMany,
		exportAll,
		importMany,
	};
}
