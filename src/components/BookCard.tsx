import type { Book } from '../types/book';
import defaultCover from '../assets/default-cover.png';
import { highlightText } from '../utils/highlight';

type Props = {
	book: Book;
	query: string;
	onSelect?: (book: Book) => void;
};

export default function BookCard({ book, query, onSelect }: Props) {
	return (
		<div
			onClick={() => onSelect?.(book)}
			style={{
				display: 'flex',
				gap: 10,
				padding: '8px 10px',
				borderBottom: '1px solid #eee',
				cursor: 'pointer',
				alignItems: 'center',
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
			}}
		>
			<img
				src={book.cover || defaultCover}
				alt={book.title}
				style={{
					width: 44,
					height: 64,
					objectFit: 'cover',
					borderRadius: 6,
					flexShrink: 0,
					background: '#f3f3f3',
				}}
			/>

			<div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
				<div
					style={{
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        marginBottom: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
					}}
				>
					{highlightText(book.title, query)}
				</div>

				<div
					style={{
						fontSize: 13,
						color: '#666',
						marginBottom: 2,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%',
					}}
				>
					{highlightText(book.author, query)}
				</div>

				<div
					style={{
						display: 'flex',
						gap: 6,
						fontSize: 12,
						color: '#888',
					}}
				>
					<span>{book.status}</span>
					<span>·</span>
					<span>{book.collection}</span>
				</div>
			</div>
		</div>
	);
}