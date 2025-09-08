export interface RecentlyViewedItem {
  source: string;
  page: string;
  title: string;
  timestamp: number;
}

const RECENTLY_VIEWED_KEY = "recentlyViewed";
const MAX_RECENT_ITEMS = 10;

/**
 * Get recently viewed PDFs from localStorage
 */
export const getRecentlyViewed = (): RecentlyViewedItem[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];

    const items: RecentlyViewedItem[] = JSON.parse(stored);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn("Error reading recently viewed items:", error);
    return [];
  }
};

/**
 * Add a PDF to recently viewed list
 * Removes duplicates and maintains max 10 items, most recent first
 */
export const addToRecentlyViewed = (
  item: Omit<RecentlyViewedItem, "timestamp">
): void => {
  try {
    const currentItems = getRecentlyViewed();

    // Remove any existing entry for the same source/page combination
    const filteredItems = currentItems.filter(
      (existing) =>
        !(existing.source === item.source && existing.page === item.page)
    );

    // Add new item at the beginning with current timestamp
    const newItem: RecentlyViewedItem = {
      ...item,
      timestamp: Date.now(),
    };

    const updatedItems = [newItem, ...filteredItems].slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.warn("Error saving recently viewed item:", error);
  }
};

/**
 * Clear all recently viewed items
 */
export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.warn("Error clearing recently viewed items:", error);
  }
};

/**
 * Get recently viewed items formatted for SearchResults component
 */
export const getRecentlyViewedForResults = () => {
  return getRecentlyViewed().map((item) => ({
    title: item.title,
    page: item.page,
    source: item.source,
  }));
};
