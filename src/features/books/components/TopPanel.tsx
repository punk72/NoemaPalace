import type { RefObject } from 'react';

import type { BookLookupItem } from '@/features/books/api/types';
import type { BookCollection, BookStatus } from '@/entities/book/model/types';
import type { CameraDevice } from '@/entities/camera/model/types';
import BookLookup from '@/features/books/components/BookLookup';
import BookPreview from '@/entities/book/ui/BookPreview';
import CameraScanner from '@/features/scanner/components/CameraScanner';
import ManualBookForm from '@/features/books/components/ManualBookForm';
import type { BookInput } from '@/features/books/services/bookRepository';
import { APP_THEMES, type AppTheme } from '@/features/settings/model/theme';
import type { ToolbarAction } from '@/features/toolbar/components/BottomToolbar';
import { useI18n, type Locale, type TranslationKey } from '@/shared/i18n';
import ScannerInterruptDialog from './ScannerInterruptDialog';

const THEME_LABEL_KEYS: Record<AppTheme, TranslationKey> = {
	system: 'settings.theme.system',
	light: 'settings.theme.light',
	dark: 'settings.theme.dark',
};

type TopPanelProps = {
	autoSave: boolean;
	book: BookLookupItem | null;
	booksCount: number;
	cameraDevices: CameraDevice[];
	error: string;
	filteredBooksCount: number;
	isbn: string;
	loading: boolean;
	pendingScannerAction: ToolbarAction | null;
	scanError: string;
	scannerActive: boolean;
	scannerBusy: boolean;
	selectedCameraId: string;
	showRegister: boolean;
	theme: AppTheme;
	topPanelMaxHeight: string;
	videoRef: RefObject<HTMLVideoElement | null>;
	alreadySaved: boolean;
	onCancelScannerInterrupt: () => void;
	onChangeAutoSave: (value: boolean) => void;
	onChangeCamera: (deviceId: string) => void;
	onChangeIsbn: (value: string) => void;
	onChangeTheme: (value: AppTheme) => void;
	onClosePreview: () => void;
	onConfirmScannerInterrupt: () => void;
	onLookup: () => void;
	onManualSaveBook: (book: BookInput) => Promise<void>;
	onSaveBook: (options: {
		collection: BookCollection;
		status: BookStatus;
		cover: string;
		ownedCount: number;
	}) => void;
	onToggleScanner: () => void;
};

export default function TopPanel({
	autoSave,
	book,
	booksCount,
	cameraDevices,
	error,
	filteredBooksCount,
	isbn,
	loading,
	pendingScannerAction,
	scanError,
	scannerActive,
	scannerBusy,
	selectedCameraId,
	showRegister,
	theme,
	topPanelMaxHeight,
	videoRef,
	alreadySaved,
	onCancelScannerInterrupt,
	onChangeAutoSave,
	onChangeCamera,
	onChangeIsbn,
	onChangeTheme,
	onClosePreview,
	onConfirmScannerInterrupt,
	onLookup,
	onManualSaveBook,
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
					<select
						value={theme}
						aria-label={t('settings.themeLabel')}
						onChange={(event) => onChangeTheme(event.target.value as AppTheme)}
						style={{
							minWidth: 82,
							padding: '4px 6px',
							borderRadius: 6,
							border: '1px solid var(--border)',
							background: 'var(--surface)',
							color: 'var(--text-h)',
						}}
					>
						{APP_THEMES.map((themeOption) => (
							<option key={themeOption} value={themeOption}>
								{t(THEME_LABEL_KEYS[themeOption])}
							</option>
						))}
					</select>
					<span style={{ color: '#666', fontSize: 13, lineHeight: 1.1 }}>
						{filteredBooksCount}/{booksCount}
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
						error={error}
						isbn={isbn}
						loading={loading}
						scanning={scannerBusy}
						onChangeIsbn={onChangeIsbn}
						onLookup={onLookup}
						onToggleScanner={onToggleScanner}
					/>
					<ManualBookForm
						initialIsbn={isbn}
						onSave={onManualSaveBook}
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
						scanError={error ? '' : scanError}
						cameraDevices={cameraDevices}
						selectedCameraId={selectedCameraId}
						videoRef={videoRef}
						onChangeCamera={onChangeCamera}
					/>

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
