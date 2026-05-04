import { useState, type ChangeEvent } from 'react';

import type {
	BookNote,
	BookNoteLocation,
	BookNotePhoto,
	BookNoteType,
} from '@/entities/note/model/types';
import { useI18n } from '@/shared/i18n';
import { fileToBase64, resizeImage } from '@/shared/lib/image';

const NOTE_TYPE_LABEL_KEYS: Record<BookNoteType, 'notes.memo' | 'notes.quote' | 'notes.review'> = {
	memo: 'notes.memo',
	quote: 'notes.quote',
	review: 'notes.review',
};

type BookNotesPanelProps = {
	notes: BookNote[];
	onSaveNote: (note: {
		type: BookNoteType;
		page: number;
		content: string;
		photos: BookNotePhoto[];
		location: BookNoteLocation | null;
	}) => Promise<void>;
};

export default function BookNotesPanel({
	notes,
	onSaveNote,
}: BookNotesPanelProps) {
	const { t } = useI18n();
	const [type, setType] = useState<BookNoteType>('memo');
	const [page, setPage] = useState(0);
	const [content, setContent] = useState('');
	const [photos, setPhotos] = useState<BookNotePhoto[]>([]);
	const [location, setLocation] = useState<BookNoteLocation | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	const inputStyle = {
		width: '100%',
		minWidth: 0,
		boxSizing: 'border-box',
		padding: '10px 8px',
		borderRadius: 8,
		border: '1px solid #ccc',
		background: 'var(--surface)',
		color: 'var(--text-h)',
	} as const;

	const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (!files.length) return;

		try {
			const nextPhotos = await Promise.all(
				files.map(async (file) => ({
					id: crypto.randomUUID(),
					dataUrl: await resizeImage(await fileToBase64(file)),
					createdAt: Date.now(),
				})),
			);

			setPhotos((prev) => [...prev, ...nextPhotos]);
			event.target.value = '';
		} catch (err) {
			console.error(err);
			setError(t('notes.photoFailed'));
		}
	};

	const captureLocation = () => {
		if (!navigator.geolocation) {
			setError(t('notes.locationUnsupported'));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocation({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracy: position.coords.accuracy,
					capturedAt: Date.now(),
				});
				setError('');
			},
			() => {
				setError(t('notes.locationFailed'));
			},
			{
				enableHighAccuracy: true,
				maximumAge: 60000,
				timeout: 10000,
			},
		);
	};

	const handleSave = async () => {
		if (!content.trim()) {
			setError(t('notes.contentRequired'));
			return;
		}

		try {
			setSaving(true);
			setError('');
			await onSaveNote({
				type,
				page,
				content: content.trim(),
				photos,
				location,
			});
			setContent('');
			setPage(0);
			setPhotos([]);
			setLocation(null);
		} catch (err) {
			console.error(err);
			setError(t('notes.saveFailed'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<section
			style={{
				marginTop: 16,
				padding: 12,
				border: '1px solid var(--border)',
				borderRadius: 10,
				background: 'var(--surface-soft)',
			}}
		>
			<strong style={{ display: 'block', marginBottom: 10 }}>
				{t('notes.title')}
			</strong>

			<div style={{ display: 'grid', gap: 10 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
						gap: 10,
					}}
				>
					<label style={{ minWidth: 0, fontSize: 13, fontWeight: 700 }}>
						{t('notes.type')}
						<select
							value={type}
							onChange={(event) => setType(event.target.value as BookNoteType)}
							style={inputStyle}
						>
							<option value="memo">{t('notes.typeMemo')}</option>
							<option value="quote">{t('notes.typeQuote')}</option>
							<option value="review">{t('notes.typeReview')}</option>
						</select>
					</label>

					<label style={{ minWidth: 0, fontSize: 13, fontWeight: 700 }}>
						{t('notes.page')}
						<input
							type="number"
							min={0}
							value={page}
							onChange={(event) => setPage(Math.max(0, Number(event.target.value) || 0))}
							style={inputStyle}
						/>
					</label>
				</div>

				<textarea
					value={content}
					onChange={(event) => setContent(event.target.value)}
					placeholder={t('notes.placeholder')}
					rows={4}
					style={{
						...inputStyle,
						resize: 'vertical',
						lineHeight: 1.5,
					}}
				/>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gap: 8,
					}}
				>
					<label
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: 42,
							borderRadius: 8,
							border: '1px solid var(--border)',
							background: 'var(--surface)',
							color: 'var(--text-h)',
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						{t('notes.addPhoto')}
						<input
							type="file"
							accept="image/*"
							capture="environment"
							multiple
							onChange={handlePhotoChange}
							style={{ display: 'none' }}
						/>
					</label>

					<button
						type="button"
						onClick={captureLocation}
						style={{
							minHeight: 42,
							borderRadius: 8,
							border: '1px solid var(--border)',
							background: location ? 'var(--accent-bg)' : 'var(--surface)',
							color: location ? 'var(--accent)' : 'var(--text-h)',
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						{location ? t('notes.locationSaved') : t('notes.addLocation')}
					</button>
				</div>

				{photos.length > 0 && (
					<div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
						{photos.map((photo) => (
							<img
								key={photo.id}
								src={photo.dataUrl}
								alt=""
								style={{
									width: 58,
									height: 58,
									objectFit: 'cover',
									borderRadius: 8,
									border: '1px solid var(--border-soft)',
								}}
							/>
						))}
					</div>
				)}

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
						width: 'min(100%, 240px)',
						minHeight: 44,
						justifySelf: 'center',
						borderRadius: 10,
						border: '1px solid var(--border)',
						background: 'var(--surface)',
						color: 'var(--text-h)',
						fontWeight: 800,
						cursor: saving ? 'not-allowed' : 'pointer',
						opacity: saving ? 0.6 : 1,
					}}
				>
					{saving ? t('notes.saving') : t('notes.save')}
				</button>
			</div>

			{notes.length > 0 && (
				<div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
					{notes.map((note) => (
						<article
							key={note.id}
							style={{
								padding: 10,
								border: '1px solid var(--border-soft)',
								borderRadius: 8,
								background: 'var(--surface)',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									gap: 8,
									color: 'var(--text)',
									fontSize: 12,
									marginBottom: 6,
								}}
							>
								<span>{t(NOTE_TYPE_LABEL_KEYS[note.type])}</span>
								<span>{note.page ? `${note.page}p` : ''}</span>
							</div>
							<p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
								{note.content}
							</p>
							{note.photos.length > 0 && (
								<div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
									{note.photos.map((photo) => (
										<img
											key={photo.id}
											src={photo.dataUrl}
											alt=""
											style={{
												width: 48,
												height: 48,
												objectFit: 'cover',
												borderRadius: 6,
											}}
										/>
									))}
								</div>
							)}
							{note.location && (
								<p style={{ margin: '8px 0 0', color: 'var(--text)', fontSize: 12 }}>
									{t('notes.locationBadge')}
								</p>
							)}
						</article>
					))}
				</div>
			)}
		</section>
	);
}
