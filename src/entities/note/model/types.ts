export type BookNoteType = 'memo' | 'quote' | 'review';

export interface BookNotePhoto {
	id: string;
	dataUrl: string;
	createdAt: number;
}

export interface BookNoteLocation {
	latitude: number;
	longitude: number;
	accuracy: number;
	capturedAt: number;
}

export interface BookNote {
	id: string;
	bookId: string;
	type: BookNoteType;
	page: number;
	content: string;
	photos: BookNotePhoto[];
	location: BookNoteLocation | null;
	createdAt: number;
	updatedAt: number;
}
