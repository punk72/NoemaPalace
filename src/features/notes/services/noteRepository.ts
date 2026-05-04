import type { BookNote, BookNoteLocation, BookNotePhoto, BookNoteType } from '@/entities/note/model/types';
import { getNotesByBookId, saveNote } from '@/shared/api/storage';
import { asNonNegativeInteger, asString, asTimestamp, isRecord } from '@/shared/lib/normalize';

export type BookNoteInput = {
	bookId: string;
	type: BookNoteType;
	page?: number;
	content: string;
	photos?: BookNotePhoto[];
	location?: BookNoteLocation | null;
};

function normalizeNote(input: unknown): BookNote | null {
	if (!isRecord(input)) return null;

	const bookId = asString(input.bookId);
	const content = asString(input.content).trim();
	if (!bookId || !content) return null;

	const now = Date.now();
	const rawType = asString(input.type);
	const type: BookNoteType =
		rawType === 'quote' || rawType === 'review' ? rawType : 'memo';

	return {
		id: asString(input.id) || crypto.randomUUID(),
		bookId,
		type,
		page: asNonNegativeInteger(input.page, 0),
		content,
		photos: Array.isArray(input.photos) ? input.photos : [],
		location: isRecord(input.location)
			? {
				latitude: Number(input.location.latitude),
				longitude: Number(input.location.longitude),
				accuracy: Number(input.location.accuracy),
				capturedAt: asTimestamp(input.location.capturedAt, now),
			}
			: null,
		createdAt: asTimestamp(input.createdAt, now),
		updatedAt: now,
	};
}

export const noteRepository = {
	async save(input: BookNoteInput) {
		const note = normalizeNote(input);
		if (!note) return null;

		await saveNote(note);
		return note;
	},

	async findByBookId(bookId: string) {
		const notes = await getNotesByBookId(bookId);
		return [...notes].sort((a, b) => b.createdAt - a.createdAt);
	},
};
