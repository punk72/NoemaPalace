import { openDB } from "idb";
import type { Book } from '@/entities/book/model/types';

const DB_NAME = 'noema-palace';
const STORE_NAME = 'books';

const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if(!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'isbn13' });
        }
    }
});

export async function saveBook(book: Book){
    const db = await dbPromise;
    await db.put(STORE_NAME, book);
}

export async function getAllBooks() : Promise<Book[]> {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function updateBook(book: Book) {
    const db = await dbPromise;
    await db.put(STORE_NAME, { ...book, updatedAt: Date.now() });
}

export async function deleteBook(isbn13: string) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, isbn13);
}
