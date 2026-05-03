import type { Book } from '../types/book';
import BookCard from './BookCard';

type BookListProps = {
	books: Book[];
	onSelectBook?: (book: Book) => void;
};

export default function BookList({ books, onSelectBook }: BookListProps) {
	return (
		<div>
			<h2 style={{ marginBottom: 12 }}>내 서재</h2>

			{books.length === 0 ? (
				<p style={{ color: '#666' }}>저장된 책이 없습니다.</p>
			) : (
				<div style={{ display: 'grid', gap: 12 }}>
					{books.map((book) => (
						<BookCard
							key={book.isbn13}
							book={book}
							onSelect={onSelectBook}
						/>
					))}
				</div>
			)}
		</div>
	);
}