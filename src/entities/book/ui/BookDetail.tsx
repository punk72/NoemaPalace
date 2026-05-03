import { useEffect, useRef, useState } from 'react';
import defaultCover from '@/shared/assets/default-cover.png';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import {
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_COLLECTIONS,
	BOOK_STATUS_LABEL_KEYS,
	BOOK_STATUSES,
} from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';
import CoverInput from './CoverInput';

type Props = {
	book: Book;
	onBack: () => void;
	onUpdate: (book: Book) => Promise<void>;
	onDelete: (isbn13: string) => Promise<void>;
};

export default function BookDetail({
	book,
	onBack,
	onUpdate,
	onDelete,
}: Props) {
	const { t } = useI18n();
	const [editBook, setEditBook] = useState<Book>({ ...book });
	const [deleting, setDeleting] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const deleteConfirmRef = useRef<HTMLDivElement | null>(null);
	const selectStyle = {
		width: '100%',
		maxWidth: '100%',
		minWidth: 0,
		display: 'block',
		padding: '10px 8px',
		marginTop: 4,
		borderRadius: 8,
		border: '1px solid #ccc',
		boxSizing: 'border-box',
		fontSize: 13,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const;
	const selectLabelStyle = {
		minWidth: 0,
		maxWidth: '100%',
		display: 'flex',
		flexDirection: 'column',
		fontSize: 13,
		fontWeight: 600,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
	} as const;

	useEffect(() => {
		if (!confirmingDelete) return;

		deleteConfirmRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}, [confirmingDelete]);

	const handleChange = (field: keyof Book, value: string) => {
		setEditBook((prev) => ({
			...prev,
			[field]: value,
			updatedAt: Date.now(),
		}));
	};

	const handleSave = async () => {
		await onUpdate({
			...editBook,
			updatedAt: Date.now(),
		});

		onBack();
	};

	const handleDelete = async () => {
		if (deleting) return;

		try {
			setDeleting(true);
			await onDelete(book.isbn13);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div
			style={{
				maxWidth: 720,
				width: '100%',
				margin: '0 auto',
				padding: 24,
				boxSizing: 'border-box',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<button type="button" onClick={onBack} style={{ marginBottom: 16 }}>
				{t('book.detail.back')}
			</button>

			<div
				style={{
					border: '1px solid #ddd',
					borderRadius: 12,
					padding: 16,
					width: '100%',
					minWidth: 'min(100%, 360px)',
					boxSizing: 'border-box',
				}}
			>
				<img
					src={editBook.cover || defaultCover}
					alt={editBook.title}
					style={{
						width: 120,
						marginBottom: 12,
						borderRadius: 8,
					}}
				/>

				<h2>{editBook.title}</h2>

				<p><strong>{t('book.field.author')}:</strong> {editBook.author}</p>
				<p><strong>{t('book.field.publisher')}:</strong> {editBook.publisher}</p>
				<p><strong>{t('book.field.pubDate')}:</strong> {editBook.pubDate}</p>
				<p><strong>ISBN13:</strong> {editBook.isbn13}</p>

				<hr />

				<fieldset
					disabled={confirmingDelete || deleting}
					style={{
						border: 0,
						margin: 0,
						padding: 0,
						opacity: confirmingDelete || deleting ? 0.55 : 1,
						pointerEvents: confirmingDelete || deleting ? 'none' : 'auto',
					}}
				>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, calc((100% - 10px) / 2)))',
							gap: 10,
							width: '100%',
							maxWidth: '100%',
							boxSizing: 'border-box',
							overflow: 'hidden',
						}}
					>
						<label style={selectLabelStyle}>
							{t('book.field.status')}
							<select
								value={editBook.status}
								onChange={(e) => handleChange('status', e.target.value as BookStatus)}
								style={selectStyle}
							>
								{BOOK_STATUSES.map((status) => (
									<option key={status} value={status}>
										{t(BOOK_STATUS_LABEL_KEYS[status])}
									</option>
								))}
							</select>
						</label>

						<label style={selectLabelStyle}>
							{t('book.field.collection')}
							<select
								value={editBook.collection}
								onChange={(e) => handleChange('collection', e.target.value as BookCollection)}
								style={selectStyle}
							>
								{BOOK_COLLECTIONS.map((collection) => (
									<option key={collection} value={collection}>
										{t(BOOK_COLLECTION_LABEL_KEYS[collection])}
									</option>
								))}
							</select>
						</label>
					</div>

					<div style={{ marginTop: 16 }}>
						<CoverInput
							onChangeCover={(cover) => {
								setEditBook((prev) => ({
									...prev,
									cover,
									updatedAt: Date.now(),
								}));
							}}
							onRemoveCover={() => {
								setEditBook((prev) => ({
									...prev,
									cover: '',
									updatedAt: Date.now(),
								}));
							}}
							showRemoveButton={!!editBook.cover}
						/>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							gap: 10,
							marginTop: 20,
							flexWrap: 'wrap',
						}}
					>
						<button
							type="button"
							onClick={handleSave}
							style={{
								minWidth: 132,
								minHeight: 44,
								padding: '12px 18px',
								borderRadius: 10,
								border: '1px solid #ccc',
								fontWeight: 700,
								whiteSpace: 'nowrap',
								cursor: 'pointer',
							}}
						>
							{t('book.detail.save')}
						</button>
						<button
							type="button"
							onClick={() => setConfirmingDelete(true)}
							style={{
								minWidth: 132,
								minHeight: 44,
								padding: '12px 18px',
								borderRadius: 10,
								border: '1px solid #f0b8b8',
								color: 'red',
								cursor: 'pointer',
								fontWeight: 700,
								whiteSpace: 'nowrap',
							}}
						>
							{t('book.detail.delete')}
						</button>
					</div>
				</fieldset>

				{confirmingDelete && (
					<div
						ref={deleteConfirmRef}
						style={{
							marginTop: 12,
							padding: 12,
							border: '1px solid #f0b8b8',
							borderRadius: 8,
							background: '#fff5f5',
						}}
					>
						<p style={{ marginBottom: 10, color: '#9f1239' }}>
							{t('book.detail.deleteConfirm')}
						</p>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								gap: 10,
								flexWrap: 'wrap',
							}}
						>
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleting}
								style={{
									minWidth: 128,
									minHeight: 42,
									padding: '10px 16px',
									borderRadius: 10,
									border: '1px solid #f0b8b8',
									color: 'red',
									fontWeight: 700,
									whiteSpace: 'nowrap',
									cursor: deleting ? 'not-allowed' : 'pointer',
									opacity: deleting ? 0.6 : 1,
								}}
							>
								{deleting ? t('book.detail.deleting') : t('book.detail.confirmDelete')}
							</button>
							<button
								type="button"
								onClick={() => setConfirmingDelete(false)}
								disabled={deleting}
								style={{
									minWidth: 128,
									minHeight: 42,
									padding: '10px 16px',
									borderRadius: 10,
									border: '1px solid #ccc',
									fontWeight: 700,
									whiteSpace: 'nowrap',
									cursor: deleting ? 'not-allowed' : 'pointer',
									opacity: deleting ? 0.6 : 1,
								}}
							>
								{t('book.detail.cancel')}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
