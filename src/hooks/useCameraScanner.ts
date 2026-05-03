import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { CameraDevice } from '../types/camera';

type UseCameraScannerOptions = {
	onScan: (text: string) => void;
};

export function useCameraScanner({ onScan }: UseCameraScannerOptions) {
	const [scanning, setScanning] = useState(false);
	const [scanError, setScanError] = useState('');
	const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
	const [selectedCameraId, setSelectedCameraId] = useState('');

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const controlsRef = useRef<{ stop: () => void } | null>(null);
	const lastScanRef = useRef({ text: '', time: 0 });
    const onScanRef = useRef(onScan);


	const mapCameraDevices = (devices: MediaDeviceInfo[]): CameraDevice[] => {
		return devices.map((device) => ({
			deviceId: device.deviceId,
			label: device.label ?? '',
		}));
	};

	const findBackCameraId = (devices: CameraDevice[]) => {
		const backCamera = devices.find((device) => {
			const label = device.label.toLowerCase();

			return (
				label.includes('back') ||
				label.includes('rear') ||
				label.includes('environment') ||
				label.includes('후면')
			);
		});

		return backCamera?.deviceId ?? devices[0]?.deviceId ?? '';
	};

	const loadCameraDevices = async () => {
		const devices = await BrowserMultiFormatReader.listVideoInputDevices();
		const mappedDevices = mapCameraDevices(devices);

		const nextCameraId =
			selectedCameraId &&
			mappedDevices.some((device) => device.deviceId === selectedCameraId)
				? selectedCameraId
				: findBackCameraId(mappedDevices);

		setCameraDevices(mappedDevices);
		setSelectedCameraId(nextCameraId);

		return {
			devices: mappedDevices,
			selectedId: nextCameraId,
		};
	};

	const cleanupVideoStream = () => {
		const videoEl = videoRef.current;

		if (videoEl?.srcObject instanceof MediaStream) {
			videoEl.srcObject.getTracks().forEach((track) => track.stop());
			videoEl.srcObject = null;
		}
	};

	const stopScanner = () => {
		controlsRef.current?.stop();
		controlsRef.current = null;

		cleanupVideoStream();
		setScanning(false);
	};

	const startScanner = async () => {
		try {
			stopScanner();
			setScanError('');

			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});

				stream.getTracks().forEach((track) => track.stop());
			} catch {
				setScanError('카메라 권한이 필요합니다.');
				return;
			}

			let devices = cameraDevices;
			let targetDeviceId = selectedCameraId;

			if (!devices.length || !targetDeviceId) {
				const loaded = await loadCameraDevices();
				devices = loaded.devices;
				targetDeviceId = loaded.selectedId;
			}

			if (!devices.length) {
				setScanError('사용 가능한 카메라가 없습니다.');
				return;
			}

			if (!targetDeviceId) {
				setScanError('선택된 카메라가 없습니다.');
				return;
			}

			setSelectedCameraId(targetDeviceId);
			setScanning(true);
		} catch (err) {
			console.error(err);
			setScanError('카메라를 시작할 수 없습니다.');
			setScanning(false);
		}
	};

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

	useEffect(() => {
		if (!scanning) return;
		if (!selectedCameraId) return;
		if (!videoRef.current) return;

		let cancelled = false;

		const startDecode = async () => {
			try {
				controlsRef.current?.stop();
				controlsRef.current = null;
				cleanupVideoStream();

				const reader = new BrowserMultiFormatReader();

				const controls = await reader.decodeFromVideoDevice(
					selectedCameraId,
					videoRef.current!,
					(result, scanErr) => {
						if (cancelled) return;

						if (result) {
							const text = result.getText().trim();
							const now = Date.now();

							if (
								lastScanRef.current.text === text &&
								now - lastScanRef.current.time < 2500
							) {
								return;
							}

							lastScanRef.current = {
								text,
								time: now,
							};

							console.log('SCAN RESULT:', text);
							onScanRef.current(text);

							return;
						}

						if (scanErr) {
							console.log('SCAN ERROR:', scanErr.name, scanErr.message);
						}
					}
				);

				if (cancelled) {
					controls.stop();
					return;
				}

				controlsRef.current = controls;
			} catch (err) {
				console.error(err);
				setScanError('카메라를 시작할 수 없습니다.');
				setScanning(false);
			}
		};

		void startDecode();

		return () => {
			cancelled = true;
			controlsRef.current?.stop();
			controlsRef.current = null;
			cleanupVideoStream();
		};
	}, [scanning, selectedCameraId]);

	useEffect(() => {
		return () => {
			controlsRef.current?.stop();
			controlsRef.current = null;
			cleanupVideoStream();
		};
	}, []);

	return {
		scanning,
		scanError,
		cameraDevices,
		selectedCameraId,
		videoRef,
		setSelectedCameraId,
		startScanner,
		stopScanner,
	};
}