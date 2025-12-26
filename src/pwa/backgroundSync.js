/**
 * Background Sync Registration
 * Registers background sync events when operations occur offline
 */

import syncManager from '../lib/syncManager';

/**
 * Register background sync tag
 * This will trigger a sync event in the service worker when network is available
 */
export const registerBackgroundSync = async () => {
  // Check if service worker and background sync are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return false;
  }

  if (!('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-transactions');
    console.log('[BackgroundSync] Sync registered successfully');
    return true;
  } catch (error) {
    console.error('[BackgroundSync] Failed to register sync:', error);
    return false;
  }
};

/**
 * Initialize background sync listeners
 * Automatically registers sync when offline operations occur
 */
export const initBackgroundSync = () => {
  // Listen for online event to trigger sync
  window.addEventListener('online', async () => {
    console.log('[BackgroundSync] Network online, triggering sync');
    
    // Try to register background sync
    const registered = await registerBackgroundSync();
    
    // If background sync not supported, trigger manual sync
    if (!registered) {
      console.log('[BackgroundSync] Falling back to manual sync');
      syncManager.sync();
    }
  });

  console.log('[BackgroundSync] Background sync initialized');
};

/**
 * Handle sync event in main context
 * This is called when service worker completes a sync
 */
export const handleSyncComplete = () => {
  // Notify user that sync completed
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Track Taka', {
      body: 'Your transactions have been synced',
      icon: '/icons/android-chrome-192x192.png',
      badge: '/icons/android-chrome-192x192.png',
      tag: 'sync-complete',
      silent: true,
    });
  }
};

export default {
  registerBackgroundSync,
  initBackgroundSync,
  handleSyncComplete,
};

