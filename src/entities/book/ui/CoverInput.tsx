import { useState } from 'react';
import { fileToBase64, imageUrlToBase64, resizeImage } from '@/shared/lib/image';
import { useI18n } from '@/shared/i18n';
import { useAppMessages, type AppMessageKey } from '@/shared/messages';

type CoverInputProps = {
	onChangeCover: (cover: string) => void;
	onRemoveCover?: () => void;
	showRemoveButton?: boolean;
};

export default function CoverInput({
	onChangeCover,
	onRemoveCover,
	showRemoveButton = false,
}: CoverInputProps) {
	const [coverUrl, setCoverUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorKey, setErrorKey] = useState<AppMessageKey | null>(null);
	const { t } = useI18n();
	const { formatMessage } = useAppMessages();
	const error = errorKey ? formatMessage(errorKey) : '';
	const actionStyle = {
		width: '100%',
		minWidth: 0,
		minHeight: 38,
		padding: '8px 10px',
		borderRadius: 8,
		border: '1px solid #ccc',
		background: '#fff',
		color: '#333',
		boxSizing: 'border-box',
		fontSize: 12,
		fontWeight: 600,
		lineHeight: 1.2,
		textAlign: 'center',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const;

	const applyUrlCover = async () => {
		const url = coverUrl.trim();
		if (!url) return;

		try {
			setLoading(true);
			setErrorKey(null);

			const base64 = await imageUrlToBase64(url);
			const resized = await resizeImage(base64);

			onChangeCover(resized);
			setCoverUrl('');
		} catch (err) {
			console.error(err);
			setErrorKey('messages.cover.urlFailed');
		} finally {
			setLoading(false);
		}
	};

	const applyFileCover = async (file: File | null) => {
		if (!file) return;

		try {
			setLoading(true);
			setErrorKey(null);

			const base64 = await fileToBase64(file);
			const resized = await resizeImage(base64);

			onChangeCover(resized);
		} catch (err) {
			console.error(err);
			setErrorKey('messages.cover.loadFailed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				border: '1px solid #ddd',
				borderRadius: 12,
				padding: 12,
				marginTop: 12,
				background: '#fafafa',
			}}
		>
			<div style={{ fontWeight: 700, marginBottom: 8 }}>
				{t('book.cover.title')}
			</div>

			<input
				type="text"
				value={coverUrl}
				onChange={(e) => setCoverUrl(e.target.value)}
				placeholder={t('book.cover.placeholder')}
				style={{
					width: '100%',
					padding: 10,
					borderRadius: 8,
					border: '1px solid #ccc',
					marginBottom: 8,
					boxSizing: 'border-box',
				}}
			/>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: showRemoveButton && onRemoveCover
						? 'repeat(3, minmax(0, 1fr))'
						: 'repeat(2, minmax(0, 1fr))',
					gap: 8,
				}}
			>
				<button
					type="button"
					onClick={applyUrlCover}
					disabled={loading}
					style={{
						...actionStyle,
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.65 : 1,
					}}
				>
					{t('book.cover.applyUrl')}
				</button>

				<label
					style={{
						...actionStyle,
						cursor: 'pointer',
						display: 'block',
					}}
				>
					{t('book.cover.choosePhoto')}
					<input
						type="file"
						accept="image/*"
						onChange={(e) => {
							applyFileCover(e.target.files?.[0] ?? null);
							e.currentTarget.value = '';
						}}
						style={{ display: 'none' }}
					/>
				</label>

				{showRemoveButton && onRemoveCover && (
					<button
						type="button"
						onClick={onRemoveCover}
						style={{
							...actionStyle,
							cursor: 'pointer',
							color: 'crimson',
						}}
					>
						{t('book.cover.remove')}
					</button>
				)}
			</div>

			{loading && (
				<p style={{ fontSize: 13, color: '#666' }}>
					{t('book.cover.processing')}
				</p>
			)}

			{error && (
				<p style={{ fontSize: 13, color: 'crimson' }}>
					{error}
				</p>
			)}
		</div>
	);
}
