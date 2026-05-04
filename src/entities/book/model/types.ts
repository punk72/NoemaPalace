export type BookCollection = '만화' | '소설' | '학습' | '그외';
export type BookStatus = '읽음' | '안읽음' | '읽는중' | '대여중';

export interface BookLocation {
	bookcase: string;
	shelf: string;
	zone: string;
}

export interface BookReadingProgress {
	currentPage: number;
	totalPages: number;
}

export interface BookReadingPlan {
	planned: boolean;
	priority: number;
}

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
	ownedCount: number;
	location: BookLocation;
	readingProgress: BookReadingProgress;
	readingPlan: BookReadingPlan;
	createdAt: number;
	updatedAt: number;
}
