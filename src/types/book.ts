export type BookCollection = '만화' | '소설' | '학습' | '그외';
export type BookStatus = '미읽' | '읽는중' | '완독';

export interface Book {
	id: string;
	isbn13: string;
	title: string;
	author: string;
	publisher: string;
	cover: string;
	pubDate: string;
	collection: BookCollection;
	status: BookStatus;
	createdAt: number;
	updatedAt: number;
}