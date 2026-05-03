import { useI18n } from '@/shared/i18n';

type BookSearchProps = {
	query: string;
	onChangeQuery: (value: string) => void;
};

export default function BookSearch({
	query,
	onChangeQuery,
}: BookSearchProps) {
	const { t } = useI18n();

	return (
		<div style={{ marginBottom: 16 }}>
			<input
				type="search"
				value={query}
				onChange={(e) => onChangeQuery(e.target.value)}
				placeholder={t('search.placeholder')}
				style={{
					width: '100%',
					padding: 12,
					borderRadius: 8,
					border: '1px solid #ccc',
				}}
			/>
		</div>
	);
}
