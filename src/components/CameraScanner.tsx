import type { CameraDevice } from '../types/camera';

type CameraScannerProps = {
	scanning: boolean;
	scanError: string;
	cameraDevices: CameraDevice[];
	selectedCameraId: string;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	onChangeCamera: (deviceId: string) => void;
	onStartScanner: () => void;
	onStopScanner: () => void;
};

export default function CameraScanner({
	scanning,
	scanError,
	cameraDevices,
	selectedCameraId,
	videoRef,
	onChangeCamera,
	onStartScanner,
	onStopScanner,
}: CameraScannerProps) {
	return (
		<>
			<div style={{ marginBottom: 16 }}>
				{!scanning ? (
					<button
						onClick={onStartScanner}
						style={{
							padding: '12px 16px',
							borderRadius: 8,
							border: '1px solid #ccc',
							cursor: 'pointer',
						}}
					>
						선택한 카메라로 스캔
					</button>
				) : (
					<button
						onClick={onStopScanner}
						style={{
							padding: '12px 16px',
							borderRadius: 8,
							border: '1px solid #ccc',
							cursor: 'pointer',
						}}
					>
						스캔 중지
					</button>
				)}
			</div>

			{cameraDevices.length > 0 && !scanning && (
				<div style={{ marginBottom: 16 }}>
					<label
						htmlFor="camera-select"
						style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}
					>
						카메라 선택
					</label>
					<select
						id="camera-select"
						value={selectedCameraId}
						onChange={(e) => onChangeCamera(e.target.value)}
						style={{
							width: '100%',
							padding: 12,
							borderRadius: 8,
							border: '1px solid #ccc',
						}}
					>
						{cameraDevices.map((device, index) => (
							<option key={device.deviceId} value={device.deviceId}>
								{device.label || `카메라 ${index + 1}`}
							</option>
						))}
					</select>
				</div>
			)}

			{scanError && (
				<p style={{ color: 'crimson', marginBottom: 16 }}>
					{scanError}
				</p>
			)}

			{scanning && (
				<div
					style={{
						marginBottom: 16,
						border: '1px solid #ddd',
						borderRadius: 12,
						padding: 12,
					}}
				>
					<p style={{ marginTop: 0 }}>바코드를 카메라에 비춰주세요.</p>
					<video
						ref={videoRef}
						style={{
							width: '100%',
							maxHeight: 360,
							objectFit: 'cover',
							borderRadius: 8,
							background: '#000',
						}}
						muted
						playsInline
					/>
				</div>
			)}
		</>
	);
}