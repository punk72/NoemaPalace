import { useState } from 'react';

import defaultCover from '@/shared/assets/default-cover.png';
import {
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_COLLECTIONS,
	BOOK_STATUS_LABEL_KEYS,
	BOOK_STATUSES,
} from '@/shared/constants/book';
import type { BookLookupItem } from '@/features/books/api/types';
import type { BookCollection, BookStatus } from '@/entities/book/model/types';
import { useI18n } from '@/shared/i18n';
import CoverInput from './CoverInput';

type SaveBookOptions = {
	collection: BookCollection;
	status: BookStatus;
	cover: string;
};

type BookPreviewProps = {
	book: BookLookupItem;
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
	const { t } = useI18n();
	const [collection, setCollection] = useState<BookCollection>('그외');
	const [status, setStatus] = useState<BookStatus>('안읽음');
	const [previewCover, setPreviewCover] = useState(book.cover || '');
	const selectStyle = {
		width: '100%',
		minWidth: 0,
		display: 'block',
		padding: '10px 8px',
		marginTop: 4,
		borderRadius: 8,
		border: '1px solid #ccc',
		boxSizing: 'border-box',
	} as const;

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
				aria-label={t('book.preview.close')}
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
			<p><strong>{t('book.field.author')}:</strong> {book.author}</p>
			<p><strong>{t('book.field.publisher')}:</strong> {book.publisher}</p>
			<p><strong>{t('book.field.pubDate')}:</strong> {book.pubDate}</p>
			<p><strong>ISBN13:</strong> {book.isbn13}</p>

			{alreadySaved ? (
				<p
					style={{
						marginTop: 12,
						color: '#2f6f3e',
						fontWeight: 600,
					}}
				>
					{t('book.preview.alreadySaved')}
				</p>
			) : (
				<>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
							gap: 10,
							marginTop: 12,
						}}
					>
						<label
							style={{
								minWidth: 0,
								display: 'flex',
								flexDirection: 'column',
								fontSize: 13,
								fontWeight: 600,
								whiteSpace: 'nowrap',
							}}
						>
							{t('book.field.collection')}
							<select
								value={collection}
								onChange={(event) =>
									setCollection(event.target.value as BookCollection)
								}
								style={selectStyle}
							>
								{BOOK_COLLECTIONS.map((collectionOption) => (
									<option key={collectionOption} value={collectionOption}>
										{t(BOOK_COLLECTION_LABEL_KEYS[collectionOption])}
									</option>
								))}
							</select>
						</label>
						<label
							style={{
								minWidth: 0,
								display: 'flex',
								flexDirection: 'column',
								fontSize: 13,
								fontWeight: 600,
								whiteSpace: 'nowrap',
							}}
						>
							{t('book.field.status')}
							<select
								value={status}
								onChange={(event) =>
									setStatus(event.target.value as BookStatus)
								}
								style={selectStyle}
							>
								{BOOK_STATUSES.map((statusOption) => (
									<option key={statusOption} value={statusOption}>
										{t(BOOK_STATUS_LABEL_KEYS[statusOption])}
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
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: 16,
						}}
					>
						<button
							type="button"
							onClick={handleSaveClick}
							style={{
								width: 'min(100%, 240px)',
								minWidth: 180,
								minHeight: 44,
								padding: '12px 18px',
								borderRadius: 10,
								border: '1px solid #ccc',
								cursor: 'pointer',
								fontWeight: 700,
								textAlign: 'center',
								whiteSpace: 'nowrap',
							}}
						>
							{t('book.preview.save')}
						</button>
					</div>
				</>
			)}
		</div>
	);
}
