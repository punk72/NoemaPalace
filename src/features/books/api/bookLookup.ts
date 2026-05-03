import { normalizeIsbn } from '@/shared/lib/isbn';
import { fetchBookByIsbn, type AladinBookItem } from './aladin';
import { fetchNlkBookByIsbn } from './nlk';

export const lookupBookByIsbn = async (isbn: string): Promise<AladinBookItem | null> => {
	const normalizedIsbn = normalizeIsbn(isbn);

	let result: AladinBookItem | null = null;

	try {
		result = await fetchBookByIsbn(normalizedIsbn);
	} catch (err) {
		console.warn('Aladin 조회 실패', err);
	}

	if (!result || !result.author || !result.publisher) {
		console.warn('NLK 조회를 시도합니다.');
		const nlk = await fetchNlkBookByIsbn(normalizedIsbn);

		if (nlk) {
			result = {
				title: result?.title || nlk.title,
				isbn13: result?.isbn13 || nlk.isbn13 || normalizedIsbn,
				author: result?.author || nlk.author,
				publisher: result?.publisher || nlk.publisher,
				pubDate: result?.pubDate || nlk.pubDate,
				cover: result?.cover || nlk.cover,
			};
		}
	}

	return result;
};
