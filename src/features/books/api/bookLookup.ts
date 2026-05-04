import { normalizeIsbn } from '@/shared/lib/isbn';
import { fetchBookByIsbn } from './aladin';
import { fetchNlkBookByIsbn } from './nlk';
import type {
	BookLookupContext,
	BookLookupError,
	BookLookupItem,
	BookLookupProvider,
	BookLookupProviderResult,
} from './types';

const REQUIRED_FIELDS = ['title', 'author', 'publisher'] as const;

function mergeBook(
	current: BookLookupProviderResult,
	next: BookLookupProviderResult,
	isbn: string,
): BookLookupProviderResult {
	if (!current) return next;
	if (!next) return current;

	return {
		title: current.title || next.title,
		isbn13: current.isbn13 || next.isbn13 || isbn,
		author: current.author || next.author,
		publisher: current.publisher || next.publisher,
		pubDate: current.pubDate || next.pubDate,
		cover: current.cover || next.cover,
	};
}

function hasRequiredFields(book: BookLookupProviderResult) {
	if (!book) return false;

	return REQUIRED_FIELDS.every((field) => book[field].trim() !== '');
}

const aladinProvider: BookLookupProvider = {
	name: 'aladin',
	lookup: (isbn) => fetchBookByIsbn(isbn),
};

const nlkProvider: BookLookupProvider = {
	name: 'nlk',
	async lookup(isbn, context) {
		if (hasRequiredFields(context.current)) return context.current;

		const result = await fetchNlkBookByIsbn(isbn);
		return mergeBook(context.current, result, isbn);
	},
};

const fallbackProvider: BookLookupProvider = {
	name: 'fallback',
	async lookup(isbn, context) {
		if (!context.current?.title) return null;

		return {
			...context.current,
			isbn13: context.current.isbn13 || isbn,
		};
	},
};

const defaultProviders: BookLookupProvider[] = [
	aladinProvider,
	nlkProvider,
	fallbackProvider,
];

async function lookupWithProvider(
	provider: BookLookupProvider,
	isbn: string,
	context: BookLookupContext,
) {
	try {
		return await provider.lookup(isbn, context);
	} catch (error) {
		context.errors.push({
			provider: provider.name,
			error,
		});
		return context.current;
	}
}

function logLookupErrors(errors: BookLookupError[]) {
	if (!errors.length) return;

	console.warn('도서 조회 provider 오류', errors);
}

export const lookupBookByIsbn = async (
	isbn: string,
	providers: BookLookupProvider[] = defaultProviders,
): Promise<BookLookupItem | null> => {
	const normalizedIsbn = normalizeIsbn(isbn);
	const context: BookLookupContext = {
		current: null,
		errors: [],
	};

	for (const provider of providers) {
		const result = await lookupWithProvider(provider, normalizedIsbn, context);
		context.current = mergeBook(context.current, result, normalizedIsbn);

		if (hasRequiredFields(context.current)) {
			break;
		}
	}

	logLookupErrors(context.errors);

	return context.current;
};
