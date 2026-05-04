import defaultCover from '@/shared/assets/default-cover.png';
import type { Book } from '@/entities/book/model/types';
import { useI18n } from '@/shared/i18n';

type ReadingNowPanelProps = {
	books: Book[];
	onSelectBook: (book: Book) => void;
};

function formatProgress(book: Book) {
	const { currentPage, totalPages } = book.readingProgress;

	if (!currentPage && !totalPages) return '';
	if (!totalPages) return `${currentPage}p`;

	return `${currentPage}/${totalPages}p`;
}

export default function ReadingNowPanel({
	books,
	onSelectBook,
}: ReadingNowPanelProps) {
	const { t } = useI18n();

	if (!books.length) return null;

	return (
		<section
			style={{
				display: 'grid',
				gap: 8,
				marginBottom: 12,
				padding: 12,
				border: '1px solid var(--border)',
				borderRadius: 8,
				background: 'var(--surface-soft)',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 8,
					alignItems: 'center',
				}}
			>
				<strong>{t('readingNow.title')}</strong>
				<span style={{ color: 'var(--text)', fontSize: 12 }}>
					{t('readingNow.count', { count: books.length })}
				</span>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
					gap: 8,
				}}
			>
				{books.map((book) => {
					const progress = formatProgress(book);

					return (
						<button
							key={book.isbn13}
							type="button"
							onClick={() => onSelectBook(book)}
							style={{
								display: 'grid',
								gridTemplateColumns: '34px minmax(0, 1fr)',
								gap: 8,
								alignItems: 'center',
								padding: 8,
								border: '1px solid var(--border-soft)',
								borderRadius: 8,
								background: 'var(--surface)',
								color: 'var(--text-h)',
								textAlign: 'left',
								cursor: 'pointer',
							}}
						>
							<img
								src={book.cover || defaultCover}
								alt=""
								style={{
									width: 34,
									height: 48,
									objectFit: 'cover',
									borderRadius: 4,
									background: 'var(--surface-soft)',
								}}
							/>
							<span style={{ minWidth: 0 }}>
								<strong
									style={{
										display: 'block',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										fontSize: 13,
									}}
								>
									{book.title}
								</strong>
								{progress && (
									<span style={{ color: 'var(--text)', fontSize: 12 }}>
										{progress}
									</span>
								)}
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}
