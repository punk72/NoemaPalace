import { useState } from 'react';

import defaultCover from '@/shared/assets/default-cover.png';
import {
	BOOK_COLLECTIONS,
	BOOK_STATUSES,
} from '@/shared/constants/book';
import type { AladinBookItem } from '@/features/books/api/aladin';
import type { BookCollection, BookStatus } from '@/entities/book/model/types';
import CoverInput from './CoverInput';

type SaveBookOptions = {
	collection: BookCollection;
	status: BookStatus;
	cover: string;
};

type BookPreviewProps = {
	book: AladinBookItem;
	alreadySaved: boolean;
	onSaveBook: (options: SaveBookOptions) => void;
	onClose: () => void;
};

export default function BookPreview({
	book,
	alreadySaved,
	onSaveBook,
	onClose,
}: BookPreviewProps) {
	const [collection, setCollection] = useState<BookCollection>('그외');
	const [status, setStatus] = useState<BookStatus>('안읽음');
	const [previewCover, setPreviewCover] = useState(book.cover || '');

	const handleSaveClick = () => {
		onSaveBook({
			collection,
			status,
			cover: previewCover,
		});
	};

	return (
		<div
			style={{
				border: '1px solid #ddd',
				borderRadius: 12,
				padding: 16,
				marginBottom: 24,
				position: 'relative',
			}}
		>
			<button
				type="button"
				onClick={onClose}
				aria-label="미리보기 닫기"
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					border: 'none',
					background: 'transparent',
					fontSize: 18,
					cursor: 'pointer',
					color: '#999',
				}}
			>
				×
			</button>
			<img
				src={previewCover || defaultCover}
				alt={book.title}
				onError={(event) => {
					event.currentTarget.onerror = null;
					setPreviewCover('');
				}}
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
				<>
					<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
						<label style={{ flex: 1 }}>
							분류
							<select
								value={collection}
								onChange={(event) =>
									setCollection(event.target.value as BookCollection)
								}
								style={{ width: '100%', padding: 10, marginTop: 4 }}
							>
								{BOOK_COLLECTIONS.map((collectionOption) => (
									<option key={collectionOption} value={collectionOption}>
										{collectionOption}
									</option>
								))}
							</select>
						</label>
						<label style={{ flex: 1 }}>
							상태
							<select
								value={status}
								onChange={(event) =>
									setStatus(event.target.value as BookStatus)
								}
								style={{ width: '100%', padding: 10, marginTop: 4 }}
							>
								{BOOK_STATUSES.map((statusOption) => (
									<option key={statusOption} value={statusOption}>
										{statusOption}
									</option>
								))}
							</select>
						</label>
					</div>
					{!previewCover && (
						<CoverInput
							onChangeCover={(cover) => {
								setPreviewCover(cover);
							}}
						/>
					)}
					<button
						type="button"
						onClick={handleSaveClick}
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
				</>
			)}
		</div>
	);
}
