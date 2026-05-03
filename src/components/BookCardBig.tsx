import defaultCover from '../assets/default-cover.png';
import type { Book } from '../types/book';
import { highlightText } from '../utils/highlight';

type BookCardProps = {
	book: Book;
	query: string;
	onSelect?: (book: Book) => void;
};

export default function BookCard({ book, query, onSelect }: BookCardProps) {
	return (
		<div
			onClick={() => onSelect?.(book)}
			style={{
				border: '1px solid #ddd',
				borderRadius: 12,
				padding: 12,
				display: 'flex',
				gap: 12,
				alignItems: 'flex-start',
				cursor: onSelect ? 'pointer' : 'default',
			}}
		>
			<img
				src={book.cover || defaultCover}
				alt={book.title}
				style={{
					width: 64,
					borderRadius: 6,
					flexShrink: 0,
				}}
			/>

			<div style={{ flex: 1 }}>
				<div style={{ fontWeight: 700, marginBottom: 4 }}>
					{ highlightText(book.title, query) }
				</div>
				<div style={{ fontSize: 14, color: '#444' }}>
					{highlightText(book.author, query)}
				</div>
				<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
					{highlightText(book.publisher, query)} · {book.pubDate}
				</div>
				<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
					상태: {book.status} / 분류: {book.collection}
				</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
					ISBN: {highlightText(book.isbn13, query)}
				</div>
			</div>
		</div>
	);
}