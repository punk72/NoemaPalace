import { useMemo, useState } from 'react';

import type { Book } from '@/entities/book/model/types';
import {
	type BookCollectionFilter,
	type BookSortBy,
	type BookStatusFilter,
} from '@/shared/constants/book';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';

export function useBookFilters(books: Book[]) {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useLocalStorageState<BookStatusFilter>(
		STORAGE_KEYS.statusFilter,
		'전체',
	);
	const [collectionFilter, setCollectionFilter] =
		useLocalStorageState<BookCollectionFilter>(
			STORAGE_KEYS.collectionFilter,
			'전체',
		);
	const [sortBy, setSortBy] = useLocalStorageState<BookSortBy>(
		STORAGE_KEYS.sortBy,
		'latest',
	);

	const filteredBooks = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return books
			.filter((book) => {
				if (statusFilter !== '전체' && book.status !== statusFilter) {
					return false;
				}

				if (collectionFilter !== '전체' && book.collection !== collectionFilter) {
					return false;
				}

				if (!query) return true;

				return (
					book.title.toLowerCase().includes(query) ||
					book.author.toLowerCase().includes(query) ||
					book.publisher.toLowerCase().includes(query) ||
					book.isbn13.toLowerCase().includes(query)
				);
			})
			.sort((a, b) => {
				if (sortBy === 'title') {
					return a.title.localeCompare(b.title, 'ko');
				}

				if (sortBy === 'author') {
					return a.author.localeCompare(b.author, 'ko');
				}

				return b.createdAt - a.createdAt;
			});
	}, [books, collectionFilter, searchQuery, sortBy, statusFilter]);

	const isFiltered =
		searchQuery.trim() !== '' ||
		statusFilter !== '전체' ||
		collectionFilter !== '전체';

	return {
		searchQuery,
		setSearchQuery,
		statusFilter,
		setStatusFilter,
		collectionFilter,
		setCollectionFilter,
		sortBy,
		setSortBy,
		filteredBooks,
		isFiltered,
	};
}
