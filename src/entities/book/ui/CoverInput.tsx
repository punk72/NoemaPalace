import { useState } from 'react';
import { fileToBase64, imageUrlToBase64, resizeImage } from '@/shared/lib/image';

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
	const [error, setError] = useState('');

	const applyUrlCover = async () => {
		const url = coverUrl.trim();
		if (!url) return;

		try {
			setLoading(true);
			setError('');

			const base64 = await imageUrlToBase64(url);
			const resized = await resizeImage(base64);

			onChangeCover(resized);
			setCoverUrl('');
		} catch (err) {
			console.error(err);
			setError('이미지 URL을 불러오지 못했습니다.');
		} finally {
			setLoading(false);
		}
	};

	const applyFileCover = async (file: File | null) => {
		if (!file) return;

		try {
			setLoading(true);
			setError('');

			const base64 = await fileToBase64(file);
			const resized = await resizeImage(base64);

			onChangeCover(resized);
		} catch (err) {
			console.error(err);
			setError('이미지를 불러오지 못했습니다.');
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
				커버 이미지
			</div>

			<input
				type="text"
				value={coverUrl}
				onChange={(e) => setCoverUrl(e.target.value)}
				placeholder="이미지 URL 입력"
				style={{
					width: '100%',
					padding: 10,
					borderRadius: 8,
					border: '1px solid #ccc',
					marginBottom: 8,
					boxSizing: 'border-box',
				}}
			/>

			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				<button
					type="button"
					onClick={applyUrlCover}
					disabled={loading}
					style={{
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
				>
					URL 적용
				</button>

				<label
					style={{
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: 'pointer',
						display: 'inline-block',
					}}
				>
					사진 선택/촬영
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
							padding: '8px 12px',
							borderRadius: 8,
							border: '1px solid #ccc',
							cursor: 'pointer',
							color: 'crimson',
						}}
					>
						커버 제거
					</button>
				)}
			</div>

			{loading && (
				<p style={{ fontSize: 13, color: '#666' }}>
					커버 이미지를 처리하는 중입니다.
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
