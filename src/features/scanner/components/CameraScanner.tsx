import type { CameraDevice } from '@/entities/camera/model/types';
import { useI18n } from '@/shared/i18n';

type CameraScannerProps = {
	scanning: boolean;
	scanError: string;
	cameraDevices: CameraDevice[];
	selectedCameraId: string;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	onChangeCamera: (deviceId: string) => void;
};

export default function CameraScanner({
	scanning,
	scanError,
	cameraDevices,
	selectedCameraId,
	videoRef,
	onChangeCamera,
}: CameraScannerProps) {
	const { t } = useI18n();

	return (
		<>
			{/* 카메라 선택 */}
			{cameraDevices.length > 0 && !scanning && (
				<div style={{ marginBottom: 16 }}>
					<label
						htmlFor="camera-select"
						style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}
					>
						{t('scanner.cameraSelect')}
					</label>
					<select
						id="camera-select"
						value={selectedCameraId}
						onChange={(e) => onChangeCamera(e.target.value)}
						style={{
							width: '100%',
							padding: 12,
							borderRadius: 8,
							border: '1px solid var(--border)',
							background: 'var(--surface)',
							color: 'var(--text-h)',
							boxSizing: 'border-box',
						}}
					>
						{cameraDevices.map((device, index) => (
							<option key={device.deviceId} value={device.deviceId}>
								{device.label || t('scanner.cameraFallback', { index: index + 1 })}
							</option>
						))}
					</select>
				</div>
			)}

			{/* 에러 */}
			{scanError && (
				<p style={{ color: 'crimson', marginBottom: 16 }}>
					{scanError}
				</p>
			)}

			{/* 스캔 영역 */}
			{scanning && (
				<div
					style={{
						marginBottom: 12,
						border: '1px solid var(--border)',
						borderRadius: 12,
						padding: 10,
						background: 'var(--surface)',
						display: 'flex',
						flexDirection: 'column',
						minHeight: 0,
					}}
				>
					<p style={{ marginTop: 0, marginBottom: 10, fontSize: 13, color: 'var(--text)' }}>
						{t('scanner.barcodeGuide')}
					</p>

					<div
						style={{
							position: 'relative',
							height: 'clamp(84px, 18svh, 120px)',
							minHeight: 0,
						}}
					>
						<video
							ref={videoRef}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								borderRadius: 8,
								background: '#000',
							}}
							muted
							playsInline
							autoPlay
						/>

						{/* 스캔 가이드 라인 */}
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								width: '86%',
								height: 2,
								background: 'red',
								transform: 'translate(-50%, -50%)',
								opacity: 0.6,
								borderRadius: 2,
							}}
						/>
					</div>
				</div>
			)}
		</>
	);
}
