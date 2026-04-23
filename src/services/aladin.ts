export interface AladinBookItem {
	title: string;
	author: string;
	publisher: string;
	cover: string;
	pubDate: string;
	isbn13: string;
}

export async function fetchBookByIsbn(isbn: string): Promise<AladinBookItem | null> {
	const ttbKey = 'ttbpunk720834001';
	const url =
		`/aladin_api/ttb/api/ItemLookUp.aspx` +
		`?ttbkey=${ttbKey}` +
		`&itemIdType=ISBN` +
		`&ItemId=${isbn}` +
		`&output=js` +
		`&Version=20131101`;


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