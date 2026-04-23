import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { fetchBookByIsbn, type AladinBookItem } from './services/aladin';
import { saveBook, getAllBooks } from './services/storage';
import type { Book } from './types/book';

type CameraDevice = {
	deviceId: string;
	label: string;
};

export default function App() {
	const [isbn, setIsbn] = useState('');
	const [loading, setLoading] = useState(false);
	const [book, setBook] = useState<AladinBookItem | null>(null);
	const [books, setBooks] = useState<Book[]>([]);
	const [error, setError] = useState('');

	const [scanning, setScanning] = useState(false);
	const [scanError, setScanError] = useState('');
	const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
	const [selectedCameraId, setSelectedCameraId] = useState('');

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const readerRef = useRef<BrowserMultiFormatReader | null>(null);
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

	const loadBooks = async () => {
		try {
			const list = await getAllBooks();
			const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
			setBooks(sorted);
		} catch (err) {
			console.error('책 목록 로드 실패:', err);
		}
	};

	const loadCameraDevices = async () => {
		try {
			const devices = await BrowserMultiFormatReader.listVideoInputDevices();

			const mappedDevices: CameraDevice[] = devices.map((device) => ({
				deviceId: device.deviceId,
				label: device.label ?? '',
			}));

			setCameraDevices(mappedDevices);

			if (!selectedCameraId && mappedDevices.length > 0) {
				const backCamera = mappedDevices.find((device) => {
					const label = device.label.toLowerCase();
					return (
						label.includes('back') ||
						label.includes('rear') ||
						label.includes('environment')
					);
				});

				setSelectedCameraId(backCamera?.deviceId ?? mappedDevices[0].deviceId);
			}
		} catch (err) {
			console.error('카메라 목록 로드 실패:', err);
		}
	};

	useEffect(() => {
		loadBooks();
		loadCameraDevices();
	}, []);

	useEffect(() => {
		return () => {
			controlsRef.current?.stop();

			const videoEl = videoRef.current;
			if (videoEl?.srcObject instanceof MediaStream) {
				videoEl.srcObject.getTracks().forEach((track) => track.stop());
				videoEl.srcObject = null;
			}
		};
	}, []);

	const handleLookupFromValue = async (rawIsbn: string) => {
		const trimmed = rawIsbn.trim();

		if (!trimmed) {
			setError('ISBN을 입력해주세요.');
			setBook(null);
			return;
		}

		try {
			setLoading(true);
			setError('');
			setBook(null);

			const result = await fetchBookByIsbn(trimmed);

			if (!result) {
				setError('검색 결과가 없습니다.');
				return;
			}

			setBook(result);
		} catch (err) {
			console.error(err);
			setError('조회 중 오류가 발생했습니다.');
			setBook(null);
		} finally {
			setLoading(false);
		}
	};

	const handleLookup = async () => {
		await handleLookupFromValue(isbn);
	};

	const stopScanner = () => {
		controlsRef.current?.stop();
		controlsRef.current = null;
		readerRef.current = null;

		const videoEl = videoRef.current;
		if (videoEl?.srcObject instanceof MediaStream) {
			videoEl.srcObject.getTracks().forEach((track) => track.stop());
			videoEl.srcObject = null;
		}

		setScanning(false);
	};

	const startScanner = async () => {
		try {
			stopScanner();
			setScanError('');
			setScanning(true);

			const reader = new BrowserMultiFormatReader();
			readerRef.current = reader;

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

						setIsbn(text);
						stopScanner();

						setTimeout(() => {
							handleLookupFromValue(text);
						}, 100);

						return;
					}

					if (scanErr) {
						// 디버깅용. 너무 시끄러우면 주석 처리
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

	const alreadySaved =
		book !== null && books.some((b) => b.isbn13 === book.isbn13);

	const handleSaveBook = async () => {
		if (!book) return;

		if (alreadySaved) {
			setError('이미 내 서재에 등록된 책입니다.');
			return;
		}

		try {
			const now = Date.now();

			const newBook: Book = {
				id: book.isbn13,
				isbn13: book.isbn13,
				title: book.title,
				author: book.author,
				publisher: book.publisher,
				cover: book.cover,
				pubDate: book.pubDate,
				collection: '그외',
				status: '미읽',
				createdAt: now,
				updatedAt: now,
			};

			await saveBook(newBook);
			await loadBooks();
			setBook(null);
			setIsbn('');
			setError('');
			setScanError('');
		} catch (err) {
			console.error(err);
			setError('책 저장 중 오류가 발생했습니다.');
		}
	};

	return (
		<div
			style={{
				maxWidth: 720,
				margin: '0 auto',
				padding: 24,
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<h1 style={{ marginBottom: 8 }}>NoemaPalace</h1>
			<p style={{ marginTop: 0, color: '#666' }}>
				ISBN 기반 개인 서재 관리 앱
			</p>

			<div
				style={{
					display: 'flex',
					gap: 8,
					marginBottom: 16,
					flexWrap: 'wrap',
				}}
			>
				<input
					type="text"
					value={isbn}
					onChange={(e) => setIsbn(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !loading) {
							handleLookup();
						}
					}}
					placeholder="ISBN 입력"
					style={{
						flex: '1 1 240px',
						padding: 12,
						borderRadius: 8,
						border: '1px solid #ccc',
					}}
				/>

				<button
					onClick={handleLookup}
					disabled={loading}
					style={{
						padding: '12px 16px',
						borderRadius: 8,
						border: '1px solid #ccc',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1,
					}}
				>
					{loading ? '조회 중...' : '조회'}
				</button>

				{!scanning ? (
					<button
						onClick={startScanner}
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
						onClick={stopScanner}
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
						onChange={(e) => setSelectedCameraId(e.target.value)}
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

			{error && (
				<p style={{ color: 'crimson', marginBottom: 16 }}>
					{error}
				</p>
			)}

			{book && (
				<div
					style={{
						border: '1px solid #ddd',
						borderRadius: 12,
						padding: 16,
						marginBottom: 24,
					}}
				>
					{book.cover && (
						<img
							src={book.cover}
							alt={book.title}
							style={{
								width: 120,
								borderRadius: 8,
								display: 'block',
								marginBottom: 12,
							}}
						/>
					)}

					<h2 style={{ margin: '0 0 8px' }}>{book.title}</h2>
					<p><strong>저자:</strong> {book.author}</p>
					<p><strong>출판사:</strong> {book.publisher}</p>
					<p><strong>출간일:</strong> {book.pubDate}</p>
					<p><strong>ISBN13:</strong> {book.isbn13}</p>

					{alreadySaved ? (
						<p
							style={{
								marginTop: 12,
								color: '#2f6f3e',
								fontWeight: 600,
							}}
						>
							이미 내 서재에 있는 책입니다.
						</p>
					) : (
						<button
							onClick={handleSaveBook}
							style={{
								marginTop: 12,
								padding: '10px 14px',
								borderRadius: 8,
								border: '1px solid #ccc',
								cursor: 'pointer',
							}}
						>
							내 서재에 저장
						</button>
					)}
				</div>
			)}

			<div>
				<h2 style={{ marginBottom: 12 }}>내 서재</h2>

				{books.length === 0 ? (
					<p style={{ color: '#666' }}>저장된 책이 없습니다.</p>
				) : (
					<div style={{ display: 'grid', gap: 12 }}>
						{books.map((b) => (
							<div
								key={b.isbn13}
								style={{
									border: '1px solid #ddd',
									borderRadius: 12,
									padding: 12,
									display: 'flex',
									gap: 12,
									alignItems: 'flex-start',
								}}
							>
								{b.cover && (
									<img
										src={b.cover}
										alt={b.title}
										style={{
											width: 64,
											borderRadius: 6,
											flexShrink: 0,
										}}
									/>
								)}

								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 700, marginBottom: 4 }}>
										{b.title}
									</div>
									<div style={{ fontSize: 14, color: '#444' }}>
										{b.author}
									</div>
									<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
										{b.publisher} · {b.pubDate}
									</div>
									<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
										상태: {b.status} / 분류: {b.collection}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}