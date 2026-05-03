import type { BookCollection, BookStatus } from '@/entities/book/model/types';

export type BookSortBy = 'latest' | 'title' | 'author';
export type BookCollectionFilter = '전체' | BookCollection;
export type BookStatusFilter = '전체' | BookStatus;

export const BOOK_COLLECTIONS: BookCollection[] = ['만화', '소설', '학습', '그외'];
export const BOOK_STATUSES: BookStatus[] = ['안읽음', '읽는중', '읽음', '대여중'];

export const BOOK_COLLECTION_FILTERS: BookCollectionFilter[] = [
	'전체',
	...BOOK_COLLECTIONS,
];

export const BOOK_STATUS_FILTERS: BookStatusFilter[] = [
	'전체',
	...BOOK_STATUSES,
];

export const BOOK_SORT_OPTIONS: Array<{ label: string; value: BookSortBy }> = [
	{ label: '최신 등록순', value: 'latest' },
	{ label: '제목순', value: 'title' },
	{ label: '저자순', value: 'author' },
];
