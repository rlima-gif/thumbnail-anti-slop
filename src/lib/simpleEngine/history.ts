import type { SimpleHistoryItem } from '../../types/simple.ts';
import { normalizeTargetModel } from '../../types/simple.ts';

const HISTORY_KEY = 'tas_simple_history_v1';

const memoryStorage: Record<string, string> = {};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return {
    getItem: (key: string) => memoryStorage[key] ?? null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value; },
    removeItem: (key: string) => { delete memoryStorage[key]; }
  };
}

export function getSimpleHistory(): SimpleHistoryItem[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: SimpleHistoryItem) => {
      if (item && item.data && typeof item.data === 'object') {
        const d = item.data as unknown as Record<string, unknown>;
        if (typeof d.targetModel === 'string') {
          d.targetModel = normalizeTargetModel(d.targetModel);
        }
        if (d.outputMetadata && typeof d.outputMetadata === 'object') {
          const meta = d.outputMetadata as Record<string, unknown>;
          if (typeof meta.targetModel === 'string') {
            meta.targetModel = normalizeTargetModel(meta.targetModel);
          }
        }
      }
      return item;
    });
  } catch {
    return [];
  }
}

export function saveSimpleHistoryItem(item: Omit<SimpleHistoryItem, 'id' | 'timestamp'>): SimpleHistoryItem {
  const newItem: SimpleHistoryItem = {
    ...item,
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };

  const storage = getStorage();
  if (!storage) return newItem;

  try {
    const current = getSimpleHistory();
    // Keep maximum 30 items
    const updated = [newItem, ...current.filter(i => i.id !== newItem.id)].slice(0, 30);
    storage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore quota errors
  }

  return newItem;
}

export function deleteSimpleHistoryItem(id: string): SimpleHistoryItem[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const current = getSimpleHistory();
    const updated = current.filter(i => i.id !== id);
    storage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSimpleHistory(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}
