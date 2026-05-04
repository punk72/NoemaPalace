import type { DuplicateBookGroup } from '@/features/books/lib/duplicateBooks';
import { useI18n } from '@/shared/i18n';

type DuplicateCandidatesPanelProps = {
	groups: DuplicateBookGroup[];
	onSelectGroup: (group: DuplicateBookGroup) => void;
};

export default function DuplicateCandidatesPanel({
	groups,
	onSelectGroup,
}: DuplicateCandidatesPanelProps) {
	const { t } = useI18n();

	if (!groups.length) return null;

	return (
		<div
			style={{
				display: 'grid',
				gap: 8,
				marginBottom: 16,
				padding: 12,
				border: '1px solid var(--border)',
				borderRadius: 8,
				background: 'var(--surface-soft)',
			}}
		>
			<div>
				<strong>{t('duplicates.title', { count: groups.length })}</strong>
				<p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: 13 }}>
					{t('duplicates.description')}
				</p>
			</div>

			<div style={{ display: 'grid', gap: 6 }}>
				{groups.slice(0, 4).map((group) => (
					<button
						key={group.key}
						type="button"
						onClick={() => onSelectGroup(group)}
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr auto',
							gap: 8,
							alignItems: 'center',
							padding: '8px 10px',
							borderRadius: 8,
							border: '1px solid var(--border)',
							background: 'var(--surface)',
							color: 'var(--text-h)',
							textAlign: 'left',
							cursor: 'pointer',
							minWidth: 0,
						}}
					>
						<span
							style={{
								minWidth: 0,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{group.title}
						</span>
						<span style={{ color: 'var(--text)', fontSize: 13 }}>
							{t('duplicates.count', { count: group.books.length })}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
