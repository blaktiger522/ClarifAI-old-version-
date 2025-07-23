import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transcription } from '@/types';

interface PendingSync {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: Transcription;
  timestamp: number;
}

interface SyncState {
  pendingSync: PendingSync[];
  lastSyncTimestamp: number | null;
  addPendingSync: (sync: Omit<PendingSync, 'timestamp'>) => void;
  removePendingSync: (id: string) => void;
  setLastSyncTimestamp: (timestamp: number) => void;
  clearPendingSync: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      pendingSync: [],
      lastSyncTimestamp: null,
      addPendingSync: (sync) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, { ...sync, timestamp: Date.now() }],
        })),
      removePendingSync: (id) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((sync) => sync.id !== id),
        })),
      setLastSyncTimestamp: (timestamp) =>
        set({ lastSyncTimestamp: timestamp }),
      clearPendingSync: () =>
        set({ pendingSync: [], lastSyncTimestamp: null }),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
