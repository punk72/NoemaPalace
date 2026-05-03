import defaultCover from '../assets/default-cover.png';
import type { AladinBookItem } from '../services/aladin';

type BookPreviewProps = {
	book: AladinBookItem;
	alreadySaved: boolean;
	onSaveBook: () => void;
};

export default function BookPreview({
	book,
	alreadySaved,
	onSaveBook,
}: BookPreviewProps) {
	return (
		<div
			style={{
				border: '1px solid #ddd',
				borderRadius: 12,
				padding: 16,
				marginBottom: 24,
			}}
		>
			<img
				src={book.cover || defaultCover}
				alt={book.title}
				style={{
					width: 120,
					borderRadius: 8,
					display: 'block',
					marginBottom: 12,
				}}
			/>

			<h2 style={{ margin: '0 0 8px' }}>{book.title}</h2>
			<p><strong>저자:</strong> {book.author}</p>
			<p><strong>출판사:</strong> {book.publisher}</p>
			<p><strong>출간일:</strong> {book.pubDate}</p>
			<p><strong>ISBN13:</strong> {book.isbn13}</p>

			{alreadySaved ? (
				<p
					style={{
						marginTop: 12,
						color: '#2f6f3e',
						fontWeight: 600,
					}}
				>
					이미 내 서재에 있는 책입니다.
				</p>
			) : (
				<button
					onClick={onSaveBook}
					style={{
						marginTop: 12,
						padding: '10px 14px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: 'pointer',
					}}
				>
					내 서재에 저장
				</button>
			)}
		</div>
	);
}