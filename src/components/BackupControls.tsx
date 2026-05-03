type BackupControlsProps = {
	onExport: () => void;
	onImport: (file: File | null) => void;
};

export default function BackupControls({
	onExport,
	onImport,
}: BackupControlsProps) {
	return (
		<div
			style={{
				display: 'flex',
				gap: 8,
				marginBottom: 16,
				flexWrap: 'wrap',
			}}
		>
			<button
				onClick={onExport}
				style={{
					padding: '10px 14px',
					borderRadius: 8,
					border: '1px solid #ccc',
					cursor: 'pointer',
				}}
			>
				백업 내보내기
			</button>

			<label
				style={{
					padding: '10px 14px',
					borderRadius: 8,
					border: '1px solid #ccc',
					cursor: 'pointer',
					display: 'inline-block',
				}}
			>
				백업 가져오기
				<input
					type="file"
					accept="application/json"
					onChange={(e) => {
						onImport(e.target.files?.[0] ?? null);
						e.currentTarget.value = '';
					}}
					style={{ display: 'none' }}
				/>
			</label>
		</div>
	);
}