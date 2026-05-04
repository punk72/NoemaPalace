import { buildBookApiUrl } from '@/shared/api/bookApiConfig';
import type { BookLookupItem } from './types';

type AladinBookItem = {
	title?: string;
	author?: string;
	publisher?: string;
	cover?: string;
	pubDate?: string;
	isbn?: string;
	isbn13?: string;
};

export async function fetchBookByIsbn(isbn: string): Promise<BookLookupItem | null> {
	const ttbKey = 'ttbpunk720834001';
	const url = buildBookApiUrl('aladin', '/ttb/api/ItemLookUp.aspx', {
		ttbkey: ttbKey,
		itemIdType: 'ISBN',
		ItemId: isbn,
		output: 'js',
		Version: '20131101',
	});

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('도서 조회에 실패했습니다.');
	}

	const data = await response.json();
	const item = data?.item?.[0];
	if (!item) return null;

	return {
		title: item.title ?? '',
		author: item.author ?? '',
		publisher: item.publisher ?? '',
		cover: item.cover ?? '',
		pubDate: item.pubDate ?? '',
		isbn13: item.isbn13 ?? isbn,
	};
}

export async function searchBooksByKeyword(
	keyword: string,
): Promise<BookLookupItem[]> {
	const query = keyword.trim();
	if (!query) return [];

	const ttbKey = 'ttbpunk720834001';
	const url = buildBookApiUrl('aladin', '/ttb/api/ItemSearch.aspx', {
		ttbkey: ttbKey,
		Query: query,
		QueryType: 'Keyword',
		SearchTarget: 'Book',
		MaxResults: '8',
		output: 'js',
		Version: '20131101',
	});

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('도서 검색에 실패했습니다.');
	}

	const data = await response.json();
	const items = Array.isArray(data?.item) ? data.item : [];

	return items.map((item: AladinBookItem) => ({
		title: item.title ?? '',
		author: item.author ?? '',
		publisher: item.publisher ?? '',
		cover: item.cover ?? '',
		pubDate: item.pubDate ?? '',
		isbn13: item.isbn13 ?? item.isbn ?? '',
	}));
}
