import { useCallback, useEffect, useState } from 'react';

import type { BookNote } from '@/entities/note/model/types';
import {
	noteRepository,
	type BookNoteInput,
} from '@/features/notes/services/noteRepository';

export function useBookNotes(bookId: string | null) {
	const [notes, setNotes] = useState<BookNote[]>([]);

	const reload = useCallback(async () => {
		if (!bookId) {
			setNotes([]);
			return [];
		}

		const list = await noteRepository.findByBookId(bookId);
		setNotes(list);
		return list;
	}, [bookId]);

	useEffect(() => {
		let cancelled = false;

		if (!bookId) {
			void Promise.resolve([]).then((list) => {
				if (!cancelled) {
					setNotes(list);
				}
			});
			return;
		}

		void noteRepository.findByBookId(bookId).then((list) => {
			if (!cancelled) {
				setNotes(list);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [bookId]);

	const save = useCallback(async (note: Omit<BookNoteInput, 'bookId'>) => {
		if (!bookId) return null;

		const savedNote = await noteRepository.save({
			...note,
			bookId,
		});
		await reload();
		return savedNote;
	}, [bookId, reload]);

	return {
		notes,
		reload,
		save,
	};
}
