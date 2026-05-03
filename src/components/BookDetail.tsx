import { useState } from 'react';
import defaultCover from '../assets/default-cover.png';
import type { Book } from '../types/book';

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
		await onUpdate(editBook);
		onBack();
	};

	const handleDelete = async () => {
		if (!confirm('정말 삭제하시겠습니까?')) return;
		await onDelete(book.isbn13);
		onBack();
	};

	return (
		<div>
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
					style={{ width: 120, marginBottom: 12 }}
				/>

				<h2>{editBook.title}</h2>

				<p><strong>저자:</strong> {editBook.author}</p>
				<p><strong>출판사:</strong> {editBook.publisher}</p>
				<p><strong>출간일:</strong> {editBook.pubDate}</p>

				<hr />

				{/* 상태 */}
				<label>상태</label>
				<select
					value={editBook.status}
					onChange={(e) => handleChange('status', e.target.value)}
				>
					<option value="미읽">미읽</option>
					<option value="읽는중">읽는중</option>
					<option value="읽음">읽음</option>
				</select>

				<br /><br />

				{/* 분류 */}
				<label>분류</label>
				<input
					value={editBook.collection}
					onChange={(e) => handleChange('collection', e.target.value)}
				/>

				<br /><br />

				{/* 커버 */}
				<label>커버 URL</label>
				<input
					value={editBook.cover || ''}
					onChange={(e) => handleChange('cover', e.target.value)}
					placeholder="이미지 URL 입력"
				/>

				<br /><br />

				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={handleSave}>저장</button>
					<button onClick={handleDelete} style={{ color: 'red' }}>
						삭제
					</button>
				</div>
			</div>
		</div>
	);
}