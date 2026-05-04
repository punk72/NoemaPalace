import { useEffect, useRef, type PointerEvent } from 'react';
import type { Book } from '@/entities/book/model/types';
import defaultCover from '@/shared/assets/default-cover.png';
import {
	BOOK_COLLECTION_LABEL_KEYS,
	BOOK_STATUS_LABEL_KEYS,
} from '@/shared/constants/book';
import { useI18n } from '@/shared/i18n';
import { highlightText } from '@/shared/lib/highlight';

export const BOOK_CARD_HEIGHT = 112;

type Props = {
	book: Book;
	query: string;
	onSelect?: (book: Book) => void;
	onLongPress?: (book: Book) => void;
    selected?: boolean;
    selectionMode?: boolean;
	activeSelectionId?: string;
};

export default function BookCard({
	book,
	query,
	onSelect,
	onLongPress,
	selected,
	selectionMode,
	activeSelectionId,
}: Props) {
	const { t } = useI18n();
	const cardRef = useRef<HTMLDivElement | null>(null);
	const longPressTimerRef = useRef<number | null>(null);
	const longPressTriggeredRef = useRef(false);
	const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		if (!selectionMode || activeSelectionId !== book.isbn13) return;

		const frameId = window.requestAnimationFrame(() => {
			cardRef.current?.scrollIntoView({
				block: 'nearest',
				inline: 'nearest',
				behavior: 'smooth',
			});
		});

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [activeSelectionId, book.isbn13, selectionMode]);

	const clearLongPressTimer = () => {
		if (longPressTimerRef.current === null) return;

		window.clearTimeout(longPressTimerRef.current);
		longPressTimerRef.current = null;
	};

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		longPressTriggeredRef.current = false;
		pointerStartRef.current = {
			x: event.clientX,
			y: event.clientY,
		};
		clearLongPressTimer();

		longPressTimerRef.current = window.setTimeout(() => {
			longPressTriggeredRef.current = true;
			onLongPress?.(book);
		}, 520);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (!pointerStartRef.current) return;

		const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
		const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);

		if (deltaX > 8 || deltaY > 8) {
			clearLongPressTimer();
		}
	};

	const handlePointerEnd = () => {
		clearLongPressTimer();
		pointerStartRef.current = null;
	};

	const handleClick = () => {
		if (longPressTriggeredRef.current) {
			longPressTriggeredRef.current = false;
			return;
		}

		onSelect?.(book);
	};

	return (
		<div
			ref={cardRef}
			onClick={handleClick}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerEnd}
			onPointerCancel={handlePointerEnd}
			onPointerLeave={handlePointerEnd}
			onContextMenu={(event) => {
				if (longPressTriggeredRef.current) {
					event.preventDefault();
				}
			}}
			style={{
				display: 'flex',
				gap: 10,
				height: BOOK_CARD_HEIGHT,
				padding: '8px 10px',
				cursor: 'pointer',
				alignItems: 'center',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
				touchAction: 'manipulation',
				userSelect: 'none',
				scrollMarginBlock: 12,
                borderBottom: selected
					? '2px solid var(--selected-border)'
					: '1px solid var(--border-soft)',
                background: selected ? 'var(--selected-bg)' : 'var(--surface)',
			}}
		>
			{selectionMode && (
				<input
					type="checkbox"
					checked={selected}
					readOnly
					aria-label={t('book.list.selectLabel', { title: book.title })}
					style={{
						width: 18,
						height: 18,
						flexShrink: 0,
					}}
				/>
			)}

			<img
				src={book.cover || defaultCover}
				alt={book.title}
				style={{
					width: 44,
					height: 64,
					objectFit: 'cover',
					borderRadius: 6,
					flexShrink: 0,
					background: 'var(--surface-soft)',
				}}
			/>

			<div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
				<div
					style={{
                        fontSize: 15,
                        fontWeight: 700,
                        lineHeight: 1.4,
                        marginBottom: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'anywhere',
                        wordBreak: 'keep-all',
					}}
				>
					{highlightText(book.title, query)}
				</div>

				<div
					style={{
						fontSize: 13,
						color: 'var(--text)',
						marginBottom: 2,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%',
                        minWidth: 0,
					}}
				>
					{highlightText(book.author, query)}
				</div>

				<div
					style={{
						display: 'flex',
						gap: 6,
						fontSize: 12,
						color: 'var(--text)',
					}}
				>
					<span>{t(BOOK_STATUS_LABEL_KEYS[book.status])}</span>
					<span>·</span>
					<span>{t(BOOK_COLLECTION_LABEL_KEYS[book.collection])}</span>
				</div>
			</div>
		</div>
	);
}
