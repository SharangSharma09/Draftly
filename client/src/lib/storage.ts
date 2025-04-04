import { HistoryEntry } from '@/pages/TextTransformer';

const STORAGE_KEY = 'text_transformer_history';

// Save transformation history to Chrome storage
export async function saveHistory(history: HistoryEntry[]): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [STORAGE_KEY]: history });
    } else {
      // Fallback to localStorage when Chrome storage is not available (e.g., in development)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

// Get transformation history from Chrome storage
export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      return data[STORAGE_KEY] || [];
    } else {
      // Fallback to localStorage when Chrome storage is not available
      const historyJson = localStorage.getItem(STORAGE_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    }
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

// Clear all transformation history
export async function clearHistoryStorage(): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove(STORAGE_KEY);
    } else {
      // Fallback to localStorage when Chrome storage is not available
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}
