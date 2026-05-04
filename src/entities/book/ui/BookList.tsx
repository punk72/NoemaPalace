import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Book } from '@/entities/book/model/types';
import { useI18n } from '@/shared/i18n';
import BookCard, { BOOK_CARD_HEIGHT } from './BookCard';

const VIRTUAL_OVERSCAN_COUNT = 6;
const EMPTY_SELECTED_BOOK_IDS = new Set<string>();

type BookListProps = {
	books: Book[];
	query: string;
	totalCount: number;
	isFiltered: boolean;
	onSelectBook?: (book: Book) => void;
	onLongPressBook?: (book: Book) => void;
	selectedBook: Book | null;
	selectionMode?: boolean;
	selectedBookIds?: Set<string>;
	activeSelectionId?: string;
	tools?: ReactNode;
};

function getVirtualRange(
	scrollTop: number,
	viewportHeight: number,
	totalCount: number,
) {
	const startIndex = Math.max(
		0,
		Math.floor(scrollTop / BOOK_CARD_HEIGHT) - VIRTUAL_OVERSCAN_COUNT,
	);
	const endIndex = Math.min(
		totalCount,
		Math.ceil((scrollTop + viewportHeight) / BOOK_CARD_HEIGHT) +
			VIRTUAL_OVERSCAN_COUNT,
	);

	return { startIndex, endIndex };
}

export default function BookList({
	books,
	query,
	totalCount,
	isFiltered,
	onSelectBook,
	onLongPressBook,
	selectedBook,
	selectionMode = false,
	selectedBookIds = EMPTY_SELECTED_BOOK_IDS,
	activeSelectionId = '',
	tools,
}: BookListProps) {
	const { t } = useI18n();
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const frameRef = useRef<number | null>(null);
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);

	const totalHeight = books.length * BOOK_CARD_HEIGHT;
	const { startIndex, endIndex } = getVirtualRange(
		scrollTop,
		viewportHeight,
		books.length,
	);
	const visibleBooks = useMemo(
		() => books.slice(startIndex, endIndex),
		[books, endIndex, startIndex],
	);

	const handleScroll = useCallback(() => {
		if (frameRef.current !== null) return;

		frameRef.current = window.requestAnimationFrame(() => {
			frameRef.current = null;
			setScrollTop(viewportRef.current?.scrollTop ?? 0);
		});
	}, []);

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		const updateViewportHeight = () => {
			setViewportHeight(viewport.clientHeight);
		};
		const observer = new ResizeObserver(updateViewportHeight);

		updateViewportHeight();
		observer.observe(viewport);

		return () => {
			observer.disconnect();

			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		viewport.scrollTop = 0;
		setScrollTop(0);
	}, [books, query]);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				minHeight: 0,
				minWidth: 0,
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<h2 style={{ marginBottom: 12 }}>
				{t('book.list.title', { visible: books.length, total: totalCount })}
			</h2>

			{tools}

			{books.length === 0 ? (
				<p style={{ color: '#666' }}>
					{isFiltered
						? t('book.list.emptyFiltered')
						: t('book.list.empty')}
				</p>
			) : (
				<div
					ref={viewportRef}
					onScroll={handleScroll}
					style={{
						flex: 1,
						minHeight: 0,
						width: '100%',
						minWidth: 0,
						overflowY: 'auto',
						overflowX: 'hidden',
						overscrollBehavior: 'contain',
						WebkitOverflowScrolling: 'touch',
					}}
				>
					<div
						style={{
							position: 'relative',
							height: totalHeight,
							minHeight: '100%',
							width: '100%',
						}}
					>
						{visibleBooks.map((book, visibleIndex) => {
							const index = startIndex + visibleIndex;

							return (
								<div
									key={book.isbn13}
									style={{
										position: 'absolute',
										top: index * BOOK_CARD_HEIGHT,
										left: 0,
										right: 0,
										height: BOOK_CARD_HEIGHT,
									}}
								>
									<BookCard
										book={book}
										query={query}
										onSelect={onSelectBook}
										onLongPress={onLongPressBook}
										selected={
											selectionMode
												? selectedBookIds.has(book.isbn13)
												: selectedBook?.isbn13 === book.isbn13
										}
										selectionMode={selectionMode}
										activeSelectionId={activeSelectionId}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
