import { SimpleHistoryItem, normalizeTargetModel } from '@/types/simple';

const HISTORY_KEY = 'tas_simple_history_v1';

export function getSimpleHistory(): SimpleHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
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

  if (typeof window === 'undefined') return newItem;

  try {
    const current = getSimpleHistory();
    // Keep maximum 30 items
    const updated = [newItem, ...current.filter(i => i.id !== newItem.id)].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore quota errors
  }

  return newItem;
}

export function deleteSimpleHistoryItem(id: string): SimpleHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSimpleHistory();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSimpleHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}
