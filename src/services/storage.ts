import { openDB } from "idb";
import type { Book } from '../types/book';

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
