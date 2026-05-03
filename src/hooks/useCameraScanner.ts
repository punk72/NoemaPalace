import { useEffect, useMemo, useRef, useState } from 'react';
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

	const preferredCameraId = useMemo(() => {
		if (selectedCameraId) return selectedCameraId;

		const backCamera = cameraDevices.find((device) => {
			const label = device.label.toLowerCase();
			return (
				label.includes('back') ||
				label.includes('rear') ||
				label.includes('environment')
			);
		});

		return backCamera?.deviceId ?? cameraDevices[0]?.deviceId ?? '';
	}, [cameraDevices, selectedCameraId]);

	const stopScanner = () => {
		controlsRef.current?.stop();
		controlsRef.current = null;

		const videoEl = videoRef.current;
		if (videoEl?.srcObject instanceof MediaStream) {
			videoEl.srcObject.getTracks().forEach((track) => track.stop());
			videoEl.srcObject = null;
		}

		setScanning(false);
	};

	const loadCameraDevices = async () => {
		try {
			const devices = await BrowserMultiFormatReader.listVideoInputDevices();

			const mappedDevices: CameraDevice[] = devices.map((device) => ({
				deviceId: device.deviceId,
				label: device.label ?? '',
			}));

			setCameraDevices(mappedDevices);

			setSelectedCameraId((prev) => {
                if (prev && mappedDevices.some((d) => d.deviceId === prev)) {
                    return prev;
                }

                const backCamera = mappedDevices.find((device) => {
                    const label = device.label.toLowerCase();
                    return (
                        label.includes('back') ||
                        label.includes('rear') ||
                        label.includes('environment')
                    );
                });

                return backCamera?.deviceId ?? mappedDevices[0]?.deviceId ?? '';
            });
		} catch (err) {
			console.error('카메라 목록 로드 실패:', err);
		}
	};

	const startScanner = async () => {
		try {
			stopScanner();
			setScanError('');
			setScanning(true);

			const reader = new BrowserMultiFormatReader();
			const devices = await BrowserMultiFormatReader.listVideoInputDevices();

			const mappedDevices: CameraDevice[] = devices.map((device) => ({
				deviceId: device.deviceId,
				label: device.label ?? '',
			}));

			setCameraDevices(mappedDevices);

			if (!mappedDevices.length) {
				setScanError('사용 가능한 카메라가 없습니다.');
				setScanning(false);
				return;
			}

			const targetDeviceId =
				preferredCameraId ||
				mappedDevices.find((device) => {
					const label = device.label.toLowerCase();
					return (
						label.includes('back') ||
						label.includes('rear') ||
						label.includes('environment')
					);
				})?.deviceId ||
				mappedDevices[0].deviceId;

			const controls = await reader.decodeFromVideoDevice(
				targetDeviceId,
				videoRef.current!,
				(result, scanErr) => {
					if (result) {
						const text = result.getText().trim();
						console.log('SCAN RESULT:', text);

						stopScanner();
						onScan(text);
						return;
					}

					if (scanErr) {
						console.log('SCAN ERROR:', scanErr.name, scanErr.message);
					}
				}
			);

			controlsRef.current = controls;
		} catch (err) {
			console.error(err);
			setScanError('카메라를 시작할 수 없습니다.');
			setScanning(false);
		}
	};

    useEffect(() => {
        void (async () => {
            await loadCameraDevices();
        })();

        const videoEl = videoRef.current;
        return () => {
            controlsRef.current?.stop();
                        
            if (videoEl?.srcObject instanceof MediaStream) {
                videoEl.srcObject.getTracks().forEach((track) => track.stop());
                videoEl.srcObject = null;
            }
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