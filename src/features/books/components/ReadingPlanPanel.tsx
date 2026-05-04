import defaultCover from '@/shared/assets/default-cover.png';
import type { Book } from '@/entities/book/model/types';
import { useI18n } from '@/shared/i18n';

type ReadingPlanPanelProps = {
	books: Book[];
	onSelectBook: (book: Book) => void;
};

export default function ReadingPlanPanel({
	books,
	onSelectBook,
}: ReadingPlanPanelProps) {
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
				<strong>{t('readingPlan.title')}</strong>
				<span style={{ color: 'var(--text)', fontSize: 12 }}>
					{t('readingPlan.count', { count: books.length })}
				</span>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
					gap: 8,
				}}
			>
				{books.map((book) => (
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
							{book.readingPlan.priority > 0 && (
								<span style={{ color: 'var(--text)', fontSize: 12 }}>
									{t('readingPlan.priority', { priority: book.readingPlan.priority })}
								</span>
							)}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}
