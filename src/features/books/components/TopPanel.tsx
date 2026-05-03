import type { RefObject } from 'react';

import type { AladinBookItem } from '@/features/books/api/aladin';
import type { Book, BookCollection, BookStatus } from '@/entities/book/model/types';
import type { CameraDevice } from '@/entities/camera/model/types';
import BookLookup from '@/features/books/components/BookLookup';
import BookPreview from '@/entities/book/ui/BookPreview';
import CameraScanner from '@/features/scanner/components/CameraScanner';
import type { ToolbarAction } from '@/features/toolbar/components/BottomToolbar';
import { useI18n, type Locale } from '@/shared/i18n';
import ScannerInterruptDialog from './ScannerInterruptDialog';

type TopPanelProps = {
	autoSave: boolean;
	book: AladinBookItem | null;
	booksCount: number;
	cameraDevices: CameraDevice[];
	error: string;
	filteredBooks: Book[];
	isbn: string;
	loading: boolean;
	pendingScannerAction: ToolbarAction | null;
	scanError: string;
	scannerActive: boolean;
	scannerBusy: boolean;
	selectedCameraId: string;
	showRegister: boolean;
	topPanelMaxHeight: string;
	videoRef: RefObject<HTMLVideoElement | null>;
	alreadySaved: boolean;
	onCancelScannerInterrupt: () => void;
	onChangeAutoSave: (value: boolean) => void;
	onChangeCamera: (deviceId: string) => void;
	onChangeIsbn: (value: string) => void;
	onClosePreview: () => void;
	onConfirmScannerInterrupt: () => void;
	onLookup: () => void;
	onSaveBook: (options: {
		collection: BookCollection;
		status: BookStatus;
		cover: string;
	}) => void;
	onToggleScanner: () => void;
};

export default function TopPanel({
	autoSave,
	book,
	booksCount,
	cameraDevices,
	error,
	filteredBooks,
	isbn,
	loading,
	pendingScannerAction,
	scanError,
	scannerActive,
	scannerBusy,
	selectedCameraId,
	showRegister,
	topPanelMaxHeight,
	videoRef,
	alreadySaved,
	onCancelScannerInterrupt,
	onChangeAutoSave,
	onChangeCamera,
	onChangeIsbn,
	onClosePreview,
	onConfirmScannerInterrupt,
	onLookup,
	onSaveBook,
	onToggleScanner,
}: TopPanelProps) {
	const { locale, setLocale, t } = useI18n();

	return (
		<section
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 10,
				minWidth: 0,
				flexShrink: 0,
				margin: '0 -10px 14px',
				padding: '12px 10px 16px',
				border: '1px solid var(--border)',
				borderTop: 0,
				borderRadius: '0 0 16px 16px',
				background: 'var(--surface-soft)',
				boxShadow: '0 12px 22px rgba(0, 0, 0, 0.08)',
				maxHeight: topPanelMaxHeight,
				overflowX: 'hidden',
				overflowY: 'auto',
				overscrollBehavior: 'contain',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 12,
					alignItems: 'center',
					marginBottom: 12,
					minWidth: 0,
				}}
			>
				<div style={{ minWidth: 0, textAlign: 'left' }}>
					<h1 style={{ margin: 0, fontSize: 28 }}>{t('app.brand')}</h1>
					<p style={{ marginTop: 2, color: '#666', fontSize: 14 }}>
						{t('app.subtitle')}
					</p>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-end',
						gap: 4,
						flexShrink: 0,
					}}
				>
					<select
						value={locale}
						aria-label={t('language.label')}
						onChange={(event) => setLocale(event.target.value as Locale)}
						style={{
							minWidth: 82,
							padding: '4px 6px',
							borderRadius: 6,
							border: '1px solid var(--border)',
							background: 'var(--surface)',
							color: 'var(--text-h)',
						}}
					>
						<option value="ko">{t('language.ko')}</option>
						<option value="en">{t('language.en')}</option>
					</select>
					<span style={{ color: '#666', fontSize: 13, lineHeight: 1.1 }}>
						{filteredBooks.length}/{booksCount}
					</span>
				</div>
			</div>

			{showRegister && (
				<>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
						<input
							type="checkbox"
							checked={autoSave}
							onChange={(event) => onChangeAutoSave(event.target.checked)}
						/>
						{t('lookup.autoSave')}
					</label>
					<BookLookup
						isbn={isbn}
						loading={loading}
						scanning={scannerBusy}
						onChangeIsbn={onChangeIsbn}
						onLookup={onLookup}
						onToggleScanner={onToggleScanner}
					/>
					{pendingScannerAction && (
						<ScannerInterruptDialog
							action={pendingScannerAction}
							onCancel={onCancelScannerInterrupt}
							onConfirm={onConfirmScannerInterrupt}
						/>
					)}
					<CameraScanner
						scanning={scannerActive}
						scanError={scanError}
						cameraDevices={cameraDevices}
						selectedCameraId={selectedCameraId}
						videoRef={videoRef}
						onChangeCamera={onChangeCamera}
					/>

					{error && (
						<p style={{ color: 'crimson', marginBottom: 16 }}>
							{error}
						</p>
					)}

					{book && (
						<BookPreview
							key={book.isbn13}
							book={book}
							alreadySaved={alreadySaved}
							onSaveBook={onSaveBook}
							onClose={onClosePreview}
						/>
					)}
				</>
			)}

		</section>
	);
}
