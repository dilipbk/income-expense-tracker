/**
 * Sync Manager
 * Handles synchronization between IndexedDB and Firebase
 * Implements conflict resolution and retry logic
 */

import { createDocument, getDocument } from "./firestore";
import syncQueue from "./syncQueue";
import firestoreConfig from "../config/firestore.config";

// Event emitter for sync status updates
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(data));
  }
}

class SyncManager extends EventEmitter {
  constructor() {
    super();
    this.isSyncing = false;
    this.syncInterval = null;
  }

  /**
   * Start automatic sync monitoring
   * @param {number} intervalMs - Check interval in milliseconds (default 30s)
   */
  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Initial sync
    this.sync();

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);
  }

  /**
   * Stop automatic sync monitoring
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Main sync method
   * Processes all pending operations in the queue
   * @returns {Promise<Object>} Sync results
   */
  async sync() {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      console.log("[SyncManager] Sync already in progress");
      return { status: "already_syncing" };
    }

    // Check if online
    if (!navigator.onLine) {
      console.log("[SyncManager] Offline, skipping sync");
      this.emit("sync_skipped", { reason: "offline" });
      return { status: "offline" };
    }

    this.isSyncing = true;
    this.emit("sync_start", { timestamp: Date.now() });

    try {
      // Get operations that are ready to retry
      const operations = await syncQueue.getRetryableOperations();

      if (operations.length === 0) {
        this.emit("sync_complete", {
          status: "success",
          synced: 0,
          timestamp: Date.now(),
        });
        return { status: "no_operations" };
      }

      console.log(`[SyncManager] Syncing ${operations.length} operations`);
      this.emit("sync_progress", { total: operations.length, current: 0 });

      const results = {
        success: [],
        failed: [],
      };

      // Process operations
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];

        try {
          await this.processOperation(operation);
          results.success.push(operation.queueId);
          await syncQueue.remove(operation.queueId);
        } catch (error) {
          console.error("[SyncManager] Operation failed:", error);
          results.failed.push({
            queueId: operation.queueId,
            error: error.message,
          });

          // Update retry count
          await syncQueue.update(operation.queueId, {
            retryCount: operation.retryCount + 1,
            lastAttempt: Date.now(),
            error: error.message,
          });
        }

        this.emit("sync_progress", {
          total: operations.length,
          current: i + 1,
        });
      }

      this.emit("sync_complete", {
        status: results.failed.length === 0 ? "success" : "partial",
        synced: results.success.length,
        failed: results.failed.length,
        timestamp: Date.now(),
      });

      return {
        status: "complete",
        results,
      };
    } catch (error) {
      console.error("[SyncManager] Sync failed:", error);
      this.emit("sync_error", { error: error.message });
      return { status: "error", error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single operation
   * @param {Object} operation - Operation from sync queue
   */
  async processOperation(operation) {
    const { operationType, data, userId } = operation;

    if (!userId) {
      throw new Error("User ID required for sync operation");
    }

    // Get current state from Firebase
    const currentData = await getDocument(firestoreConfig.collection, userId);

    let updatedData;

    switch (operationType) {
      case "CREATE":
        updatedData = this.mergeCreate(currentData || {}, data);
        break;

      case "UPDATE":
        updatedData = this.mergeUpdate(currentData || {}, data);
        break;

      case "DELETE":
        updatedData = this.mergeDelete(currentData || {}, data);
        break;

      default:
        throw new Error(`Unknown operation type: ${operationType}`);
    }

    // Write back to Firebase
    await createDocument(firestoreConfig.collection, userId, updatedData);
  }

  /**
   * Merge CREATE operation
   * @param {Object} currentData - Current Firebase data
   * @param {Object} newItem - New item to add
   * @returns {Object} Merged data
   */
  mergeCreate(currentData, newItem) {
    // Simple last-write-wins strategy
    return {
      ...currentData,
      [newItem.id]: newItem,
    };
  }

  /**
   * Merge UPDATE operation
   * @param {Object} currentData - Current Firebase data
   * @param {Object} updatedItem - Updated item
   * @returns {Object} Merged data
   */
  mergeUpdate(currentData, updatedItem) {
    const existing = currentData[updatedItem.id];

    if (!existing) {
      // Item doesn't exist, treat as create
      return this.mergeCreate(currentData, updatedItem);
    }

    // Conflict resolution: Last-write-wins based on timestamp
    const localUpdated = updatedItem.updatedAt || updatedItem.createdAt;
    const remoteUpdated = existing.updatedAt || existing.createdAt;

    if (localUpdated >= remoteUpdated) {
      // Local is newer, use it
      return {
        ...currentData,
        [updatedItem.id]: {
          ...updatedItem,
          updatedAt: Date.now(),
        },
      };
    } else {
      // Remote is newer, keep it (conflict!)
      console.warn("[SyncManager] Conflict detected, keeping remote version");
      return currentData;
    }
  }

  /**
   * Merge DELETE operation
   * @param {Object} currentData - Current Firebase data
   * @param {Object} deleteInfo - Info about item to delete
   * @returns {Object} Merged data
   */
  mergeDelete(currentData, deleteInfo) {
    const { id } = deleteInfo;
    const { [id]: removed, ...rest } = currentData;
    return rest;
  }

  /**
   * Get sync statistics
   * @returns {Promise<Object>} Sync stats
   */
  async getStats() {
    const pendingCount = await syncQueue.getCount();
    const allOperations = await syncQueue.getAll();

    const stats = {
      pendingCount,
      byType: {
        CREATE: 0,
        UPDATE: 0,
        DELETE: 0,
      },
      retryStats: {
        total: 0,
        maxRetries: 0,
      },
    };

    allOperations.forEach((op) => {
      if (stats.byType[op.operationType] !== undefined) {
        stats.byType[op.operationType]++;
      }
      if (op.retryCount > 0) {
        stats.retryStats.total++;
        stats.retryStats.maxRetries = Math.max(
          stats.retryStats.maxRetries,
          op.retryCount
        );
      }
    });

    return stats;
  }

  /**
   * Clear all pending operations
   * @returns {Promise<void>}
   */
  async clearQueue() {
    await syncQueue.clear();
    this.emit("queue_cleared", { timestamp: Date.now() });
  }
}

// Export singleton instance
export default new SyncManager();
