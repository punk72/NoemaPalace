import { useState } from 'react';
import defaultCover from '../assets/default-cover.png';
import type { AladinBookItem } from '../services/aladin';
import type { BookCollection, BookStatus } from '../types/book';
import CoverInput from './CoverInput';

type BookPreviewProps = {
	book: AladinBookItem;
	alreadySaved: boolean;
	onSaveBook: ( options : {
        collection: BookCollection;
        status: BookStatus;
        cover: string;
    }) => void;
    onClose: () => void;
};


export default function BookPreview({
	book,
	alreadySaved,
	onSaveBook,
	onClose
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
                onClick={onClose}
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
                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>

                        <label>
                            분류
                            <select
                                value={collection}
                                onChange={(e) => setCollection(e.target.value as BookCollection)}
                                style={{ width: '100%', padding: 10, marginTop: 4 }}
                            >
                                <option value="만화">만화</option>
                                <option value="소설">소설</option>
                                <option value="학습">학습</option>
                                <option value="그외">그외</option>
                            </select>
                        </label>
                        <label>
                            상태
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as BookStatus)}
                                style={{ width: '100%', padding: 10, marginTop: 4 }}
                            >
                                <option value="안읽음">안읽음</option>
                                <option value="읽는중">읽는중</option>
                                <option value="읽음">읽음</option>
                                <option value="대여중">대여중</option>
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
