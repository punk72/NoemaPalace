import { useEffect, useRef, useState } from 'react';
import defaultCover from '@/shared/assets/default-cover.png';
import type {
	Book,
	BookCollection,
	BookLocation,
	BookStatus,
} from '@/entities/book/model/types';
import {
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_COLLECTIONS,
	BOOK_STATUS_LABEL_KEYS,
	BOOK_STATUSES,
} from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';
import type { BookNote } from '@/entities/note/model/types';
import BookNotesPanel from '@/features/notes/components/BookNotesPanel';
import type { BookNoteInput } from '@/features/notes/services/noteRepository';
import CoverInput from './CoverInput';

type Props = {
	book: Book;
	notes: BookNote[];
	onBack: () => void;
	onUpdate: (book: Book) => Promise<void>;
	onDelete: (isbn13: string, count?: number) => Promise<void>;
	onSaveNote: (note: Omit<BookNoteInput, 'bookId'>) => Promise<void>;
};

export default function BookDetail({
	book,
	notes,
	onBack,
	onUpdate,
	onDelete,
	onSaveNote,
}: Props) {
	const { t } = useI18n();
	const [editBook, setEditBook] = useState<Book>({ ...book });
	const [isEditing, setIsEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [deleteCount, setDeleteCount] = useState(1);
	const deleteConfirmRef = useRef<HTMLDivElement | null>(null);
	const editLocation = editBook.location ?? {
		bookcase: '',
		shelf: '',
		zone: '',
	};
	const editReadingProgress = editBook.readingProgress ?? {
		currentPage: 0,
		totalPages: 0,
	};
	const editReadingPlan = editBook.readingPlan ?? {
		planned: false,
		priority: 0,
	};
	const locationText = [
		book.location?.bookcase,
		book.location?.shelf,
		book.location?.zone,
	]
		.filter(Boolean)
		.join(' · ');
	const readingProgressText =
		book.readingProgress?.totalPages
			? `${book.readingProgress.currentPage}/${book.readingProgress.totalPages}p`
			: book.readingProgress?.currentPage
				? `${book.readingProgress.currentPage}p`
				: '';
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

	const handleOwnedCountChange = (value: string) => {
		const ownedCount = Math.max(1, Number(value) || 1);

		setEditBook((prev) => ({
			...prev,
			ownedCount,
			updatedAt: Date.now(),
		}));
		setDeleteCount((prev) => Math.min(prev, ownedCount));
	};

	const handleLocationChange = (
		field: keyof BookLocation,
		value: string,
	) => {
		setEditBook((prev) => ({
			...prev,
			location: {
				...prev.location,
				[field]: value,
			},
			updatedAt: Date.now(),
		}));
	};

	const handleReadingProgressChange = (
		field: keyof Book['readingProgress'],
		value: string,
	) => {
		setEditBook((prev) => ({
			...prev,
			readingProgress: {
				...prev.readingProgress,
				[field]: Math.max(0, Number(value) || 0),
			},
			updatedAt: Date.now(),
		}));
	};

	const handleReadingPlanChange = (
		field: keyof Book['readingPlan'],
		value: boolean | number,
	) => {
		setEditBook((prev) => ({
			...prev,
			readingPlan: {
				...prev.readingPlan,
				[field]: value,
			},
			updatedAt: Date.now(),
		}));
	};

	const handleSave = async () => {
		await onUpdate({
			...editBook,
			updatedAt: Date.now(),
		});

		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditBook({ ...book });
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (deleting) return;

		try {
			setDeleting(true);
			await onDelete(book.isbn13, deleteCount);
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

				<h2>{editBook.title || t('manual.title')}</h2>

				<p><strong>ISBN13:</strong> {editBook.isbn13}</p>

				<hr />

				{!isEditing && (
					<div
						style={{
							display: 'grid',
							gap: 12,
							textAlign: 'left',
						}}
					>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
								gap: 10,
							}}
						>
							<p><strong>{t('book.field.author')}:</strong> {book.author}</p>
							<p><strong>{t('book.field.publisher')}:</strong> {book.publisher}</p>
							<p><strong>{t('book.field.pubDate')}:</strong> {book.pubDate}</p>
							<p><strong>{t('book.field.ownedCount')}:</strong> {book.ownedCount}</p>
							<p>
								<strong>{t('book.field.status')}:</strong>{' '}
								{t(BOOK_STATUS_LABEL_KEYS[book.status])}
							</p>
							<p>
								<strong>{t('book.field.collection')}:</strong>{' '}
								{t(BOOK_COLLECTION_LABEL_KEYS[book.collection])}
							</p>
						</div>

						<div
							style={{
								padding: 12,
								border: '1px solid var(--border)',
								borderRadius: 10,
								background: 'var(--surface-soft)',
							}}
						>
							<strong>{t('book.location.title')}</strong>
							<p style={{ marginTop: 6 }}>
								{locationText || t('book.detail.emptyValue')}
							</p>
						</div>

						<div
							style={{
								padding: 12,
								border: '1px solid var(--border)',
								borderRadius: 10,
								background: 'var(--surface-soft)',
							}}
						>
							<strong>{t('book.reading.title')}</strong>
							<p style={{ marginTop: 6 }}>
								{readingProgressText || t('book.detail.emptyValue')}
							</p>
						</div>

						<div
							style={{
								padding: 12,
								border: '1px solid var(--border)',
								borderRadius: 10,
								background: 'var(--surface-soft)',
							}}
						>
							<strong>{t('book.plan.title')}</strong>
							<p style={{ marginTop: 6 }}>
								{book.readingPlan?.planned
									? `${t('book.plan.planned')}${
										book.readingPlan.priority > 0
											? ` · ${t('book.plan.priority')} ${book.readingPlan.priority}`
											: ''
									}`
									: t('book.detail.emptyValue')}
							</p>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								gap: 10,
								marginTop: 8,
								flexWrap: 'wrap',
							}}
						>
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								disabled={confirmingDelete || deleting}
								style={{
									minWidth: 132,
									minHeight: 44,
									padding: '12px 18px',
									borderRadius: 10,
									border: '1px solid #ccc',
									fontWeight: 700,
									whiteSpace: 'nowrap',
									cursor: confirmingDelete || deleting ? 'not-allowed' : 'pointer',
								}}
							>
								{t('book.detail.edit')}
							</button>
							<button
								type="button"
								onClick={() => setConfirmingDelete(true)}
								disabled={confirmingDelete || deleting}
								style={{
									minWidth: 132,
									minHeight: 44,
									padding: '12px 18px',
									borderRadius: 10,
									border: '1px solid #f0b8b8',
									color: 'red',
									cursor: confirmingDelete || deleting ? 'not-allowed' : 'pointer',
									fontWeight: 700,
									whiteSpace: 'nowrap',
								}}
							>
								{t('book.detail.delete')}
							</button>
						</div>
					</div>
				)}

				{isEditing && (
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
					<label
						style={{
							...selectLabelStyle,
							marginBottom: 10,
							whiteSpace: 'normal',
						}}
					>
						{t('manual.title')}
						<input
							type="text"
							value={editBook.title}
							onChange={(e) => handleChange('title', e.target.value)}
							style={selectStyle}
						/>
					</label>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
							gap: 10,
							marginBottom: 10,
							width: '100%',
							maxWidth: '100%',
							boxSizing: 'border-box',
							overflow: 'hidden',
						}}
					>
						<label style={selectLabelStyle}>
							{t('book.field.author')}
							<input
								type="text"
								value={editBook.author}
								onChange={(e) => handleChange('author', e.target.value)}
								style={selectStyle}
							/>
						</label>

						<label style={selectLabelStyle}>
							{t('book.field.publisher')}
							<input
								type="text"
								value={editBook.publisher}
								onChange={(e) => handleChange('publisher', e.target.value)}
								style={selectStyle}
							/>
						</label>
					</div>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
							gap: 10,
							width: '100%',
							maxWidth: '100%',
							boxSizing: 'border-box',
							overflow: 'hidden',
						}}
					>
						<label style={selectLabelStyle}>
							{t('book.field.pubDate')}
							<input
								type="text"
								value={editBook.pubDate}
								onChange={(e) => handleChange('pubDate', e.target.value)}
								style={selectStyle}
							/>
						</label>

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

						<label style={selectLabelStyle}>
							{t('book.field.ownedCount')}
							<input
								type="number"
								min={1}
								value={editBook.ownedCount}
								onChange={(e) => handleOwnedCountChange(e.target.value)}
								style={selectStyle}
							/>
						</label>
					</div>

					<div
						style={{
							marginTop: 14,
							padding: 12,
							border: '1px solid var(--border)',
							borderRadius: 10,
							background: 'var(--surface-soft)',
						}}
					>
						<strong
							style={{
								display: 'block',
								marginBottom: 10,
								fontSize: 14,
							}}
						>
							{t('book.location.title')}
						</strong>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
								gap: 10,
								width: '100%',
								maxWidth: '100%',
								boxSizing: 'border-box',
								overflow: 'hidden',
							}}
						>
							<label style={selectLabelStyle}>
								{t('book.location.bookcase')}
								<input
									type="text"
									value={editLocation.bookcase}
									onChange={(e) =>
										handleLocationChange('bookcase', e.target.value)
									}
									style={selectStyle}
								/>
							</label>

							<label style={selectLabelStyle}>
								{t('book.location.shelf')}
								<input
									type="text"
									value={editLocation.shelf}
									onChange={(e) =>
										handleLocationChange('shelf', e.target.value)
									}
									style={selectStyle}
								/>
							</label>

							<label style={selectLabelStyle}>
								{t('book.location.zone')}
								<input
									type="text"
									value={editLocation.zone}
									onChange={(e) =>
										handleLocationChange('zone', e.target.value)
									}
									style={selectStyle}
								/>
							</label>
						</div>
					</div>

					<div
						style={{
							marginTop: 14,
							padding: 12,
							border: '1px solid var(--border)',
							borderRadius: 10,
							background: 'var(--surface-soft)',
						}}
					>
						<strong
							style={{
								display: 'block',
								marginBottom: 10,
								fontSize: 14,
							}}
						>
							{t('book.reading.title')}
						</strong>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
								gap: 10,
								width: '100%',
								maxWidth: '100%',
								boxSizing: 'border-box',
								overflow: 'hidden',
							}}
						>
							<label style={selectLabelStyle}>
								{t('book.reading.currentPage')}
								<input
									type="number"
									min={0}
									value={editReadingProgress.currentPage}
									onChange={(e) =>
										handleReadingProgressChange('currentPage', e.target.value)
									}
									style={selectStyle}
								/>
							</label>

							<label style={selectLabelStyle}>
								{t('book.reading.totalPages')}
								<input
									type="number"
									min={0}
									value={editReadingProgress.totalPages}
									onChange={(e) =>
										handleReadingProgressChange('totalPages', e.target.value)
									}
									style={selectStyle}
								/>
							</label>
						</div>
					</div>

					<div
						style={{
							marginTop: 14,
							padding: 12,
							border: '1px solid var(--border)',
							borderRadius: 10,
							background: 'var(--surface-soft)',
						}}
					>
						<strong
							style={{
								display: 'block',
								marginBottom: 10,
								fontSize: 14,
							}}
						>
							{t('book.plan.title')}
						</strong>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
								gap: 10,
								alignItems: 'end',
							}}
						>
							<label
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									minHeight: 42,
									fontSize: 13,
									fontWeight: 700,
								}}
							>
								<input
									type="checkbox"
									checked={editReadingPlan.planned}
									onChange={(e) =>
										handleReadingPlanChange('planned', e.target.checked)
									}
								/>
								{t('book.plan.planned')}
							</label>

							<label style={selectLabelStyle}>
								{t('book.plan.priority')}
								<input
									type="number"
									min={0}
									value={editReadingPlan.priority}
									onChange={(e) =>
										handleReadingPlanChange(
											'priority',
											Math.max(0, Number(e.target.value) || 0),
										)
									}
									style={selectStyle}
								/>
							</label>
						</div>
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
							onClick={handleCancelEdit}
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
							{t('book.detail.cancelEdit')}
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
				)}

				<BookNotesPanel
					notes={notes}
					onSaveNote={onSaveNote}
				/>

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
						{book.ownedCount > 1 && (
							<label
								style={{
									display: 'grid',
									gap: 4,
									marginBottom: 10,
									color: '#9f1239',
									fontSize: 13,
									fontWeight: 700,
								}}
							>
								{t('book.detail.deleteCount')}
								<input
									type="number"
									min={1}
									max={book.ownedCount}
									value={deleteCount}
									onChange={(event) =>
										setDeleteCount(
											Math.min(
												book.ownedCount,
												Math.max(1, Number(event.target.value) || 1),
											),
										)
									}
									style={{
										width: '100%',
										boxSizing: 'border-box',
										padding: '10px 8px',
										borderRadius: 8,
										border: '1px solid #f0b8b8',
									}}
								/>
							</label>
						)}
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
