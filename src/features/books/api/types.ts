export type BookLookupProviderName = 'aladin' | 'nlk' | 'fallback';

export interface BookLookupItem {
	title: string;
	author: string;
	publisher: string;
	cover: string;
	pubDate: string;
	isbn13: string;
}

export type BookLookupProviderResult = BookLookupItem | null;

export type BookLookupError = {
	provider: BookLookupProviderName;
	error: unknown;
};

export type BookLookupContext = {
	current: BookLookupProviderResult;
	errors: BookLookupError[];
};

export interface BookLookupProvider {
	name: BookLookupProviderName;
	lookup(
		isbn: string,
		context: BookLookupContext,
	): Promise<BookLookupProviderResult>;
}
