import type { ReactNode } from 'react';

import type { Book } from '@/entities/book/model/types';
import { useI18n } from '@/shared/i18n';
import BookCard from './BookCard';

type BookListProps = {
	books: Book[];
    query: string;
    totalCount: number;
	isFiltered: boolean;
	onSelectBook?: (book: Book) => void;
	onLongPressBook?: (book: Book) => void;
    selectedBook: Book | null;
    selectionMode?: boolean;
	selectedBookIds?: Set<string>;
	activeSelectionId?: string;
	tools?: ReactNode;
};

export default function BookList({
	books,
	query,
	totalCount,
	isFiltered,
	onSelectBook,
	onLongPressBook,
	selectedBook,
	selectionMode = false,
	selectedBookIds = new Set<string>(),
	activeSelectionId = '',
	tools,
}: BookListProps) {
	const { t } = useI18n();

	return (
		<div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
			<h2 style={{ marginBottom: 12 }}>
                {t('book.list.title', { visible: books.length, total: totalCount })}
            </h2>

			{tools}

			{books.length === 0 ? (
				<p style={{ color: '#666' }}>
                    {isFiltered
			            ? t('book.list.emptyFiltered')
			            : t('book.list.empty')}
                </p>
			) : (
				<div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
					{books.map((book) => (
						<BookCard
							key={book.isbn13}
							book={book}
                            query={query}
							onSelect={onSelectBook}
							onLongPress={onLongPressBook}
                            selected={
								selectionMode
									? selectedBookIds.has(book.isbn13)
									: selectedBook?.isbn13 === book.isbn13
							}
                            selectionMode={selectionMode}
							activeSelectionId={activeSelectionId}
						/>
					))}
				</div>
			)}
		</div>
	);
}
