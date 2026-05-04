import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { CameraDevice } from '@/entities/camera/model/types';
import { useAppMessages, type AppMessageKey } from '@/shared/messages';

type ScannerState = 'idle' | 'scanning' | 'paused' | 'interrupted';
type ScannerEvent = 'start' | 'stop' | 'interrupt' | 'resume';

type UseCameraScannerOptions = {
	onScan: (text: string) => void;
};

const DUPLICATE_SCAN_DELAY_MS = 2500;

const scannerStateMachine = (
	state: ScannerState,
	event: ScannerEvent,
): ScannerState => {
	if (event === 'stop') return 'idle';

	if (state === 'idle') {
		return event === 'start' ? 'paused' : state;
	}

	if (state === 'paused') {
		if (event === 'interrupt') return 'interrupted';
		return event === 'resume' || event === 'start' ? 'scanning' : state;
	}

	if (state === 'interrupted') {
		return event === 'resume' || event === 'start' ? 'scanning' : state;
	}

	if (event === 'interrupt') return 'interrupted';

	return state;
};

export function useCameraScanner({ onScan }: UseCameraScannerOptions) {
	const [scannerState, setScannerState] = useState<ScannerState>('idle');
	const [scanErrorKey, setScanErrorKey] = useState<AppMessageKey | null>(null);
	const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
	const [selectedCameraId, setSelectedCameraId] = useState('');
	const { formatMessage } = useAppMessages();
	const scanError = scanErrorKey ? formatMessage(scanErrorKey) : '';

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const controlsRef = useRef<{ stop: () => void } | null>(null);
	const lastScanRef = useRef({ text: '', time: 0 });
	const onScanRef = useRef(onScan);
	const scannerStateRef = useRef<ScannerState>(scannerState);
	const startRequestIdRef = useRef(0);

	const scannerActive = scannerState === 'scanning' || scannerState === 'interrupted';
	const scannerBusy = scannerState !== 'idle';

	const sendScannerEvent = useCallback((event: ScannerEvent) => {
		setScannerState((prevState) => {
			const nextState = scannerStateMachine(prevState, event);
			scannerStateRef.current = nextState;
			return nextState;
		});
	}, []);

	const cancelPendingStart = useCallback(() => {
		startRequestIdRef.current += 1;
	}, []);

	const mapCameraDevices = useCallback((devices: MediaDeviceInfo[]): CameraDevice[] => {
		return devices.map((device) => ({
			deviceId: device.deviceId,
			label: device.label ?? '',
		}));
	}, []);

	const findBackCameraId = useCallback((devices: CameraDevice[]) => {
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
	}, []);

	const cleanupVideoStream = useCallback(() => {
		const videoEl = videoRef.current;

		if (videoEl?.srcObject instanceof MediaStream) {
			videoEl.srcObject.getTracks().forEach((track) => track.stop());
			videoEl.srcObject = null;
		}
	}, []);

	const stopDecoder = useCallback(() => {
		controlsRef.current?.stop();
		controlsRef.current = null;
		cleanupVideoStream();
	}, [cleanupVideoStream]);

	const loadCameraDevices = useCallback(async () => {
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
	}, [findBackCameraId, mapCameraDevices, selectedCameraId]);

	const ensureCameraPermission = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});

			stream.getTracks().forEach((track) => track.stop());
			return true;
		} catch {
			setScanErrorKey('messages.scanner.permissionRequired');
			return false;
		}
	}, []);

	const startScanner = useCallback(async () => {
		const requestId = startRequestIdRef.current + 1;
		startRequestIdRef.current = requestId;

		setScanErrorKey(null);
		stopDecoder();
		sendScannerEvent('start');

		const permissionGranted = await ensureCameraPermission();
		if (startRequestIdRef.current !== requestId) return;

		if (!permissionGranted) {
			sendScannerEvent('stop');
			return;
		}

		let devices = cameraDevices;
		let targetDeviceId = selectedCameraId;

		if (!devices.length || !targetDeviceId) {
			const loaded = await loadCameraDevices();
			if (startRequestIdRef.current !== requestId) return;

			devices = loaded.devices;
			targetDeviceId = loaded.selectedId;
		}

		if (!devices.length) {
			setScanErrorKey('messages.scanner.noDevice');
			sendScannerEvent('stop');
			return;
		}

		if (!targetDeviceId) {
			setScanErrorKey('messages.scanner.noSelectedDevice');
			sendScannerEvent('stop');
			return;
		}

		setSelectedCameraId(targetDeviceId);
		sendScannerEvent('resume');
	}, [
		cameraDevices,
		ensureCameraPermission,
		loadCameraDevices,
		sendScannerEvent,
		selectedCameraId,
		stopDecoder,
	]);

	const stopScanner = useCallback(() => {
		cancelPendingStart();
		stopDecoder();
		sendScannerEvent('stop');
	}, [cancelPendingStart, sendScannerEvent, stopDecoder]);

	const interruptScanner = useCallback(() => {
		sendScannerEvent('interrupt');
	}, [sendScannerEvent]);

	const resumeScanner = useCallback(() => {
		sendScannerEvent('resume');
	}, [sendScannerEvent]);

	const toggleScanner = useCallback(() => {
		if (scannerBusy) {
			stopScanner();
			return;
		}

		void startScanner();
	}, [scannerBusy, startScanner, stopScanner]);

	useEffect(() => {
		onScanRef.current = onScan;
	}, [onScan]);

	useEffect(() => {
		if (!scannerActive) {
			stopDecoder();
			return;
		}

		if (!selectedCameraId || !videoRef.current) return;

		let cancelled = false;

		const startDecode = async () => {
			try {
				stopDecoder();

				const reader = new BrowserMultiFormatReader();
				const controls = await reader.decodeFromVideoDevice(
					selectedCameraId,
					videoRef.current!,
					(result, scanErr) => {
						if (cancelled) return;
						if (scannerStateRef.current !== 'scanning') return;

						if (result) {
							const text = result.getText().trim();
							const now = Date.now();
							const lastScan = lastScanRef.current;

							if (
								lastScan.text === text &&
								now - lastScan.time < DUPLICATE_SCAN_DELAY_MS
							) {
								return;
							}

							lastScanRef.current = {
								text,
								time: now,
							};

							onScanRef.current(text);
							return;
						}

						void scanErr;
					},
				);

				if (cancelled) {
					controls.stop();
					return;
				}

				controlsRef.current = controls;
			} catch (err) {
				console.error(err);
				setScanErrorKey('messages.scanner.startFailed');
				sendScannerEvent('stop');
			}
		};

		void startDecode();

		return () => {
			cancelled = true;
			stopDecoder();
		};
	}, [scannerActive, selectedCameraId, sendScannerEvent, stopDecoder]);

	useEffect(() => {
		return () => {
			stopDecoder();
		};
	}, [stopDecoder]);

	return {
		scannerActive,
		scannerBusy,
		scanError,
		cameraDevices,
		selectedCameraId,
		videoRef,
		setSelectedCameraId,
		startScanner,
		stopScanner,
		interruptScanner,
		resumeScanner,
		toggleScanner,
	};
}
