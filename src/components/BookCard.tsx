import defaultCover from '../assets/default-cover.png';
import type { Book } from '../types/book';

type BookCardProps = {
	book: Book;
	onSelect?: (book: Book) => void;
};

export default function BookCard({ book, onSelect }: BookCardProps) {
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
					{book.title}
				</div>
				<div style={{ fontSize: 14, color: '#444' }}>
					{book.author}
				</div>
				<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
					{book.publisher} · {book.pubDate}
				</div>
				<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
					상태: {book.status} / 분류: {book.collection}
				</div>
			</div>
		</div>
	);
}