import { useState } from 'react';

import {
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_COLLECTIONS,
	BOOK_STATUS_LABEL_KEYS,
	BOOK_STATUSES,
} from '@/shared/constants/book';
import type { BookCollection, BookStatus } from '@/entities/book/model/types';
import type { BookInput } from '@/features/books/services/bookRepository';
import type { BookLookupItem } from '@/features/books/api/types';
import { searchBooksByKeyword } from '@/features/books/api/aladin';
import { useI18n } from '@/shared/i18n';
import CoverInput from '@/entities/book/ui/CoverInput';

type ManualBookFormProps = {
	initialIsbn: string;
	onSave: (book: BookInput) => Promise<void>;
};

type ManualBookFields = {
	isbn13: string;
	title: string;
	author: string;
	publisher: string;
	pubDate: string;
	cover: string;
	collection: BookCollection;
	status: BookStatus;
	ownedCount: number;
	location: {
		bookcase: string;
		shelf: string;
		zone: string;
	};
};

const createManualBookKey = () =>
	`MANUAL-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;

const createEmptyFields = (initialIsbn: string): ManualBookFields => ({
	isbn13: initialIsbn.trim(),
	title: '',
	author: '',
	publisher: '',
	pubDate: '',
	cover: '',
	collection: '그외',
	status: '안읽음',
	ownedCount: 1,
	location: {
		bookcase: '',
		shelf: '',
		zone: '',
	},
});

export default function ManualBookForm({
	initialIsbn,
	onSave,
}: ManualBookFormProps) {
	const { t } = useI18n();
	const [expanded, setExpanded] = useState(false);
	const [fields, setFields] = useState(() => createEmptyFields(initialIsbn));
	const [query, setQuery] = useState('');
	const [candidates, setCandidates] = useState<BookLookupItem[]>([]);
	const [searching, setSearching] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const currentLocation = fields.location ?? {
		bookcase: '',
		shelf: '',
		zone: '',
	};

	const inputStyle = {
		width: '100%',
		minWidth: 0,
		boxSizing: 'border-box',
		padding: '10px 10px',
		borderRadius: 8,
		border: '1px solid var(--border)',
		background: 'var(--surface)',
		color: 'var(--text-h)',
	} as const;

	const labelStyle = {
		display: 'grid',
		gap: 4,
		minWidth: 0,
		fontSize: 13,
		fontWeight: 700,
	} as const;

	const updateField = <K extends keyof ManualBookFields>(
		field: K,
		value: ManualBookFields[K],
	) => {
		setFields((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const updateLocationField = (
		field: keyof ManualBookFields['location'],
		value: string,
	) => {
		setFields((prev) => ({
			...prev,
			location: {
				...prev.location,
				[field]: value,
			},
		}));
	};

	const applyCandidate = (candidate: BookLookupItem) => {
		setFields((prev) => ({
			...prev,
			isbn13: candidate.isbn13 || prev.isbn13,
			title: candidate.title || prev.title,
			author: candidate.author || prev.author,
			publisher: candidate.publisher || prev.publisher,
			pubDate: candidate.pubDate || prev.pubDate,
			cover: candidate.cover || prev.cover,
		}));
	};

	const handleSearch = async () => {
		if (!query.trim()) return;

		try {
			setSearching(true);
			setError('');
			setCandidates(await searchBooksByKeyword(query));
		} catch (err) {
			console.error(err);
			setError(t('manual.searchFailed'));
		} finally {
			setSearching(false);
		}
	};

	const handleSave = async () => {
		if (!fields.title.trim()) {
			setError(t('manual.titleRequired'));
			return;
		}

		try {
			setSaving(true);
			setError('');

			await onSave({
				...fields,
				isbn13: fields.isbn13.trim() || createManualBookKey(),
				title: fields.title.trim(),
				author: fields.author.trim(),
				publisher: fields.publisher.trim(),
				pubDate: fields.pubDate.trim(),
				ownedCount: fields.ownedCount,
				location: {
					bookcase: fields.location.bookcase.trim(),
					shelf: fields.location.shelf.trim(),
					zone: fields.location.zone.trim(),
				},
			});

			setFields(createEmptyFields(''));
			setCandidates([]);
			setQuery('');
		} catch (err) {
			console.error(err);
			setError(t('manual.saveFailed'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			style={{
				marginTop: 12,
				marginBottom: expanded ? 18 : 10,
				border: '1px solid var(--border)',
				borderRadius: 10,
				background: 'var(--surface)',
				overflow: 'hidden',
			}}
		>
			<button
				type="button"
				onClick={() => setExpanded((prev) => !prev)}
				style={{
					width: '100%',
					padding: '12px 14px',
					border: 0,
					background: 'transparent',
					color: 'var(--text-h)',
					textAlign: 'left',
					fontWeight: 800,
					cursor: 'pointer',
				}}
			>
				{expanded ? t('manual.close') : t('manual.open')}
			</button>

			{expanded && (
				<div style={{ display: 'grid', gap: 12, padding: '0 12px 14px' }}>
					<div style={{ display: 'flex', gap: 8 }}>
						<input
							type="text"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									void handleSearch();
								}
							}}
							placeholder={t('manual.searchPlaceholder')}
							style={inputStyle}
						/>
						<button
							type="button"
							onClick={handleSearch}
							disabled={searching}
							style={{
								minWidth: 82,
								borderRadius: 8,
								border: '1px solid var(--border)',
								background: 'var(--surface-soft)',
								color: 'var(--text-h)',
								fontWeight: 700,
								cursor: searching ? 'not-allowed' : 'pointer',
								opacity: searching ? 0.6 : 1,
							}}
						>
							{searching ? t('manual.searching') : t('manual.search')}
						</button>
					</div>

					{candidates.length > 0 && (
						<div style={{ display: 'grid', gap: 6 }}>
							{candidates.map((candidate) => (
								<button
									key={`${candidate.isbn13}-${candidate.title}`}
									type="button"
									onClick={() => applyCandidate(candidate)}
									style={{
										display: 'grid',
										gridTemplateColumns: '34px minmax(0, 1fr)',
										gap: 8,
										alignItems: 'center',
										padding: 8,
										borderRadius: 8,
										border: '1px solid var(--border-soft)',
										background: 'var(--surface-soft)',
										color: 'var(--text-h)',
										textAlign: 'left',
										cursor: 'pointer',
									}}
								>
									<img
										src={candidate.cover}
										alt=""
										style={{
											width: 34,
											height: 46,
											objectFit: 'cover',
											borderRadius: 4,
											background: 'var(--surface)',
										}}
									/>
									<span style={{ minWidth: 0 }}>
										<strong
											style={{
												display: 'block',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{candidate.title}
										</strong>
										<span
											style={{
												display: 'block',
												color: 'var(--text)',
												fontSize: 12,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{candidate.author} · {candidate.publisher}
										</span>
									</span>
								</button>
							))}
						</div>
					)}

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
							gap: 10,
						}}
					>
						<label style={labelStyle}>
							ISBN
							<input
								type="text"
								value={fields.isbn13}
								onChange={(event) => updateField('isbn13', event.target.value)}
								placeholder={t('manual.isbnPlaceholder')}
								style={inputStyle}
							/>
						</label>

						<label style={labelStyle}>
							{t('book.field.ownedCount')}
							<input
								type="number"
								min={1}
								value={fields.ownedCount}
								onChange={(event) =>
									updateField('ownedCount', Math.max(1, Number(event.target.value) || 1))
								}
								style={inputStyle}
							/>
						</label>
					</div>

					<label style={labelStyle}>
						{t('manual.title')}
						<input
							type="text"
							value={fields.title}
							onChange={(event) => updateField('title', event.target.value)}
							style={inputStyle}
						/>
					</label>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
							gap: 10,
						}}
					>
						<label style={labelStyle}>
							{t('book.field.author')}
							<input
								type="text"
								value={fields.author}
								onChange={(event) => updateField('author', event.target.value)}
								style={inputStyle}
							/>
						</label>

						<label style={labelStyle}>
							{t('book.field.publisher')}
							<input
								type="text"
								value={fields.publisher}
								onChange={(event) => updateField('publisher', event.target.value)}
								style={inputStyle}
							/>
						</label>
					</div>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
							gap: 10,
						}}
					>
						<label style={labelStyle}>
							{t('book.field.pubDate')}
							<input
								type="text"
								value={fields.pubDate}
								onChange={(event) => updateField('pubDate', event.target.value)}
								style={inputStyle}
							/>
						</label>

						<label style={labelStyle}>
							{t('book.field.collection')}
							<select
								value={fields.collection}
								onChange={(event) =>
									updateField('collection', event.target.value as BookCollection)
								}
								style={inputStyle}
							>
								{BOOK_COLLECTIONS.map((collection) => (
									<option key={collection} value={collection}>
										{t(BOOK_COLLECTION_LABEL_KEYS[collection])}
									</option>
								))}
							</select>
						</label>

						<label style={labelStyle}>
							{t('book.field.status')}
							<select
								value={fields.status}
								onChange={(event) =>
									updateField('status', event.target.value as BookStatus)
								}
								style={inputStyle}
							>
								{BOOK_STATUSES.map((status) => (
									<option key={status} value={status}>
										{t(BOOK_STATUS_LABEL_KEYS[status])}
									</option>
								))}
							</select>
						</label>
					</div>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
							gap: 10,
						}}
					>
						<label style={labelStyle}>
							{t('book.location.bookcase')}
							<input
								type="text"
								value={currentLocation.bookcase}
								onChange={(event) =>
									updateLocationField('bookcase', event.target.value)
								}
								style={inputStyle}
							/>
						</label>

						<label style={labelStyle}>
							{t('book.location.shelf')}
							<input
								type="text"
								value={currentLocation.shelf}
								onChange={(event) =>
									updateLocationField('shelf', event.target.value)
								}
								style={inputStyle}
							/>
						</label>

						<label style={labelStyle}>
							{t('book.location.zone')}
							<input
								type="text"
								value={currentLocation.zone}
								onChange={(event) =>
									updateLocationField('zone', event.target.value)
								}
								style={inputStyle}
							/>
						</label>
					</div>

					<CoverInput
						onChangeCover={(cover) => updateField('cover', cover)}
						onRemoveCover={() => updateField('cover', '')}
						showRemoveButton={Boolean(fields.cover)}
					/>

					{error && (
						<p style={{ margin: 0, color: 'crimson', fontSize: 13 }}>
							{error}
						</p>
					)}

					<button
						type="button"
						onClick={handleSave}
						disabled={saving}
						style={{
							width: 'min(100%, 260px)',
							minHeight: 44,
							justifySelf: 'center',
							borderRadius: 10,
							border: '1px solid var(--border)',
							background: 'var(--surface-soft)',
							color: 'var(--text-h)',
							fontWeight: 800,
							cursor: saving ? 'not-allowed' : 'pointer',
							opacity: saving ? 0.6 : 1,
						}}
					>
						{saving ? t('manual.saving') : t('manual.save')}
					</button>
				</div>
			)}
		</div>
	);
}
