import { fetchBookByIsbn } from './aladin';
import { fetchNlkBookByIsbn } from './nlk';

export const lookupBookByIsbn = async (isbn: string) => {
	let result = null;

	try {
		result = await fetchBookByIsbn(isbn);
	} catch (err) {
		console.warn('Aladin 조회 실패, NLK 조회를 시도합니다.', err);
	}

	if (!result) {
		result = await fetchNlkBookByIsbn(isbn);
	}

	return result;
};
