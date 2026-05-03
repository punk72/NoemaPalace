import { useState } from 'react';
import defaultCover from '../assets/default-cover.png';
import type { Book, BookCollection, BookStatus } from '../types/book';
import CoverInput from './CoverInput';
import { imageUrlToBase64, resizeImage } from '../utils/image';

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
	const [editBook, setEditBook] = useState<Book>({ ...book });

	const handleChange = (field: keyof Book, value: string) => {
		setEditBook((prev) => ({
			...prev,
			[field]: value,
			updatedAt: Date.now(),
		}));
	};

	const handleSave = async () => {
		let cover = editBook.cover || '';

		if (cover.startsWith('http')) {
			try {
				const base64 = await imageUrlToBase64(cover);
				cover = await resizeImage(base64);
			} catch (err) {
				console.warn('커버 URL을 base64로 변환하지 못했습니다. URL을 그대로 저장합니다.', err);
			}
		}

		await onUpdate({
			...editBook,
			cover,
			updatedAt: Date.now(),
		});

		onBack();
	};

	const handleDelete = async () => {
		if (!confirm('정말 삭제하시겠습니까?')) return;
		await onDelete(book.isbn13);
	};

	return (
		<div
			style={{
				maxWidth: 720,
				margin: '0 auto',
				padding: 24,
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<button onClick={onBack} style={{ marginBottom: 16 }}>
				← 목록으로
			</button>

			<div
				style={{
					border: '1px solid #ddd',
					borderRadius: 12,
					padding: 16,
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

				<p><strong>저자:</strong> {editBook.author}</p>
				<p><strong>출판사:</strong> {editBook.publisher}</p>
				<p><strong>출간일:</strong> {editBook.pubDate}</p>
				<p><strong>ISBN13:</strong> {editBook.isbn13}</p>

				<hr />

				<div style={{ display: 'grid', gap: 12 }}>
					<label>
						상태
						<select
							value={editBook.status}
							onChange={(e) => handleChange('status', e.target.value as BookStatus)}
							style={{
								width: '100%',
								padding: 10,
								marginTop: 4,
								borderRadius: 8,
								border: '1px solid #ccc',
							}}
						>
							<option value="안읽음">안읽음</option>
							<option value="읽는중">읽는중</option>
							<option value="읽음">읽음</option>
							<option value="대여중">대여중</option>
						</select>
					</label>

					<label>
						분류
						<select
							value={editBook.collection}
							onChange={(e) => handleChange('collection', e.target.value as BookCollection)}
							style={{
								width: '100%',
								padding: 10,
								marginTop: 4,
								borderRadius: 8,
								border: '1px solid #ccc',
							}}
						>
							<option value="만화">만화</option>
							<option value="소설">소설</option>
							<option value="학습">학습</option>
							<option value="그외">그외</option>
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

				<div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
					<button onClick={handleSave}>
						저장
					</button>
					<button onClick={handleDelete} style={{ color: 'red' }}>
						삭제
					</button>
				</div>
			</div>
		</div>
	);
}