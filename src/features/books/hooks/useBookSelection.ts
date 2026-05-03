import { useState } from 'react';

import type { Book } from '@/entities/book/model/types';

export function useBookSelection() {
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(() => new Set());
	const [lastSelectionTargetId, setLastSelectionTargetId] = useState('');
	const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);

	const clearSelection = () => {
		setSelectedBookIds(new Set());
		setLastSelectionTargetId('');
		setConfirmingBulkDelete(false);
	};

	const toggleSelectionMode = () => {
		setSelectionMode((prev) => {
			if (prev) {
				clearSelection();
			}

			return !prev;
		});
	};

	const toggleBookSelection = (book: Book) => {
		setLastSelectionTargetId(book.isbn13);
		setSelectedBookIds((prev) => {
			const next = new Set(prev);

			if (next.has(book.isbn13)) {
				next.delete(book.isbn13);
			} else {
				next.add(book.isbn13);
			}

			return next;
		});
		setConfirmingBulkDelete(false);
	};

	const startSelectionFromBook = (book: Book) => {
		setSelectionMode(true);
		setLastSelectionTargetId(book.isbn13);
		setSelectedBookIds((prev) => {
			const next = new Set(prev);
			next.add(book.isbn13);
			return next;
		});
		setConfirmingBulkDelete(false);
	};

	const selectBooks = (books: Book[]) => {
		setSelectedBookIds(new Set(books.map((book) => book.isbn13)));
		setConfirmingBulkDelete(false);
	};

	const selectedCount = selectedBookIds.size;

	return {
		selectionMode,
		selectedBookIds,
		lastSelectionTargetId,
		confirmingBulkDelete,
		selectedCount,
		clearSelection,
		toggleSelectionMode,
		toggleBookSelection,
		startSelectionFromBook,
		selectBooks,
		setConfirmingBulkDelete,
	};
}
