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
			{/* 스캔 버튼 */}
			<div style={{ marginBottom: 16 }}>
				<button
					type="button"
					onClick={scanning ? onStopScanner : onStartScanner}
					style={{
						width: '100%',
						padding: '12px 16px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: 'pointer',
						background: scanning ? '#ffecec' : '#fff',
						fontWeight: 600,
					}}
				>
					{scanning ? '스캔 중지' : '스캔 시작'}
				</button>
			</div>

			{/* 카메라 선택 */}
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
							boxSizing: 'border-box',
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
						marginBottom: 16,
						border: '1px solid #ddd',
						borderRadius: 12,
						padding: 12,
					}}
				>
					<p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
						바코드를 화면 중앙에 맞춰주세요
					</p>

					<div style={{ position: 'relative' }}>
						<video
							ref={videoRef}
							style={{
								width: '100%',
								maxHeight: 320,
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
								width: '70%',
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