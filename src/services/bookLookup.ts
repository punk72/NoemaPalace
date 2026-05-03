import { fetchBookByIsbn } from './aladin';
import { fetchNlkBookByIsbn } from './nlk';

export const lookupBookByIsbn = async (isbn: string) => {
	let result = await fetchBookByIsbn(isbn);

	if (!result) {
		result = await fetchNlkBookByIsbn(isbn);
	}

	return result;
};