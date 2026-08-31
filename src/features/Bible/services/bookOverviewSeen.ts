/**
 * Tracks which Bible books the user has seen the overview for.
 * Stored in localStorage so the overview only shows once per book.
 */

const STORAGE_KEY = "exegesis_book_overview_seen";

function getSeenBooks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveSeenBooks(books: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...books]));
  } catch {
    // localStorage unavailable
  }
}

/** Check if the user has seen the overview for a book */
export function hasSeenBookOverview(bookName: string): boolean {
  return getSeenBooks().has(bookName);
}

/** Mark a book's overview as seen */
export function markBookOverviewSeen(bookName: string): void {
  const books = getSeenBooks();
  books.add(bookName);
  saveSeenBooks(books);
}

/** Reset all seen overviews (for debugging/testing) */
export function resetBookOverviews(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
