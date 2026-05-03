export function highlightText(text: string, query: string) {
	if (!query) return text;

	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(`(${escaped})`, 'gi');

	const parts = text.split(regex);

	return parts.map((part, i) => {
		const isMatch = part.toLowerCase() === query.toLowerCase();

		return isMatch ? (
			<span
				key={i}
				style={{
					backgroundColor: '#ffe58a',
					display: 'inline',
				}}
			>
				{part}
			</span>
		) : (
			part
		);
	});
}