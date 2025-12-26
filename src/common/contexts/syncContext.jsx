import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import syncManager from "../../lib/syncManager";
import syncQueue from "../../lib/syncQueue";
import { useAuth } from "./authContext";

const SyncContext = createContext({
  syncStatus: 'idle',
  pendingCount: 0,
  lastSyncTime: null,
  isSyncing: false,
  triggerSync: async () => {},
  clearQueue: async () => {},
  syncStats: null,
});

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState(null);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await syncQueue.getCount();
      setPendingCount(count);
      
      const stats = await syncManager.getStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!user) {
      console.warn('Cannot sync: User not authenticated');
      return { status: 'no_user' };
    }

    if (!navigator.onLine) {
      console.warn('Cannot sync: Offline');
      return { status: 'offline' };
    }

    setSyncStatus('syncing');
    setIsSyncing(true);

    try {
      const result = await syncManager.sync();
      
      if (result.status === 'complete' || result.status === 'no_operations') {
        setSyncStatus('success');
        setLastSyncTime(Date.now());
      } else {
        setSyncStatus('error');
      }

      await updatePendingCount();
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      return { status: 'error', error: error.message };
    } finally {
      setIsSyncing(false);
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [user, updatePendingCount]);

  // Clear sync queue
  const clearQueue = useCallback(async () => {
    try {
      await syncManager.clearQueue();
      await updatePendingCount();
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }, [updatePendingCount]);

  // Listen to sync manager events
  useEffect(() => {
    const handleSyncStart = () => {
      setIsSyncing(true);
      setSyncStatus('syncing');
    };

    const handleSyncComplete = (data) => {
      setIsSyncing(false);
      setSyncStatus(data.status === 'success' ? 'success' : 'error');
      setLastSyncTime(data.timestamp);
      updatePendingCount();
    };

    const handleSyncError = () => {
      setIsSyncing(false);
      setSyncStatus('error');
    };

    syncManager.on('sync_start', handleSyncStart);
    syncManager.on('sync_complete', handleSyncComplete);
    syncManager.on('sync_error', handleSyncError);

    return () => {
      syncManager.off('sync_start', handleSyncStart);
      syncManager.off('sync_complete', handleSyncComplete);
      syncManager.off('sync_error', handleSyncError);
    };
  }, [updatePendingCount]);

  // Auto-sync when user comes online
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SyncContext] Network online, triggering sync');
      triggerSync();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [triggerSync]);

  // Start automatic sync when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('[SyncContext] User authenticated, starting auto-sync');
      syncManager.startAutoSync(30000); // Check every 30 seconds
      updatePendingCount();

      return () => {
        syncManager.stopAutoSync();
      };
    }
  }, [user, updatePendingCount]);

  // Update pending count periodically
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(updatePendingCount, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  const value = useMemo(
    () => ({
      syncStatus,
      pendingCount,
      lastSyncTime,
      isSyncing,
      triggerSync,
      clearQueue,
      syncStats,
    }),
    [syncStatus, pendingCount, lastSyncTime, isSyncing, triggerSync, clearQueue, syncStats]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

