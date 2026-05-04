import { useI18n } from '@/shared/i18n';

type ReadingDashboardProps = {
	totalOwnedCount: number;
	readingCount: number;
	readCount: number;
	plannedCount: number;
};

export default function ReadingDashboard({
	totalOwnedCount,
	readingCount,
	readCount,
	plannedCount,
}: ReadingDashboardProps) {
	const { t } = useI18n();
	const items = [
		{
			label: t('dashboard.owned'),
			value: totalOwnedCount,
		},
		{
			label: t('dashboard.reading'),
			value: readingCount,
		},
		{
			label: t('dashboard.read'),
			value: readCount,
		},
		{
			label: t('dashboard.planned'),
			value: plannedCount,
		},
	];

	return (
		<section
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
				gap: 8,
				marginBottom: 12,
			}}
		>
			{items.map((item) => (
				<div
					key={item.label}
					style={{
						minWidth: 0,
						padding: '10px 8px',
						border: '1px solid var(--border)',
						borderRadius: 8,
						background: 'var(--surface-soft)',
						textAlign: 'center',
					}}
				>
					<strong
						style={{
							display: 'block',
							fontSize: 18,
							lineHeight: 1.1,
						}}
					>
						{item.value}
					</strong>
					<span
						style={{
							display: 'block',
							marginTop: 4,
							color: 'var(--text)',
							fontSize: 11,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{item.label}
					</span>
				</div>
			))}
		</section>
	);
}
