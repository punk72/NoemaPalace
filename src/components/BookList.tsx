import type { Book } from '../types/book';
import BookCard from './BookCard';

type BookListProps = {
	books: Book[];
    query: string;
    totalCount: number;
    isFiltered: boolean;
	onSelectBook?: (book: Book) => void;
    selectedBook: Book | null;
};

export default function BookList({ books, query, totalCount, isFiltered, onSelectBook, selectedBook }: BookListProps) {
	return (
		<div style={{ width: '100%', overflow: 'hidden' }}>
			<h2 style={{ marginBottom: 12 }}>
                내 서재 ({books.length}/{totalCount})
            </h2>

			{books.length === 0 ? (
				<p style={{ color: '#666' }}>
                    {isFiltered
			            ? '검색/필터 조건에 맞는 책이 없습니다.'
			            : '저장된 책이 없습니다.'}
                </p>
			) : (
				<div style={{ width: '100%', overflow: 'hidden' }}>
					{books.map((book) => (
						<BookCard
							key={book.isbn13}
							book={book}
                            query={query}
							onSelect={onSelectBook}
                            selected={selectedBook?.isbn13 === book.isbn13}
						/>
					))}
				</div>
			)}
		</div>
	);
}