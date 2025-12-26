/**
 * Sync Queue System
 * Manages pending sync operations in IndexedDB
 * Persists across page refreshes and handles retry logic
 */

const SYNC_QUEUE_DB = "SYNC_QUEUE_DB";
const SYNC_QUEUE_STORE = "pending_operations";
const SYNC_QUEUE_VERSION = 1;

class SyncQueue {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  /**
   * Initialize the sync queue database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYNC_QUEUE_DB, SYNC_QUEUE_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const store = db.createObjectStore(SYNC_QUEUE_STORE, {
            keyPath: "queueId",
            autoIncrement: true,
          });

          // Create indexes for efficient querying
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("operationType", "operationType", {
            unique: false,
          });
          store.createIndex("retryCount", "retryCount", { unique: false });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  async ensureInit() {
    if (!this.db) {
      await this.initPromise;
    }
  }

  /**
   * Add operation to sync queue
   * @param {string} operationType - 'CREATE', 'UPDATE', or 'DELETE'
   * @param {Object} data - Transaction data
   * @param {string} userId - User ID for the operation
   * @returns {Promise<number>} Queue ID
   */
  async add(operationType, data, userId) {
    await this.ensureInit();

    const operation = {
      operationType,
      data,
      userId,
      timestamp: Date.now(),
      retryCount: 0,
      lastAttempt: null,
      error: null,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.add(operation);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending operations
   * @returns {Promise<Array>} Array of pending operations
   */
  async getAll() {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readonly");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get count of pending operations
   * @returns {Promise<number>} Count
   */
  async getCount() {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readonly");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove operation from queue
   * @param {number} queueId - Queue ID to remove
   * @returns {Promise<void>}
   */
  async remove(queueId) {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(queueId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update operation in queue (for retry tracking)
   * @param {number} queueId - Queue ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async update(queueId, updates) {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const getRequest = store.get(queueId);

      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          const updatedOperation = { ...operation, ...updates };
          const putRequest = store.put(updatedOperation);

          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error("Operation not found"));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear all operations from queue
   * @returns {Promise<void>}
   */
  async clear() {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get operations that need retry (with exponential backoff)
   * @returns {Promise<Array>} Operations ready for retry
   */
  async getRetryableOperations() {
    const all = await this.getAll();
    const now = Date.now();

    return all.filter((op) => {
      // Max 5 retries
      if (op.retryCount >= 5) return false;

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const backoffMs = Math.pow(2, op.retryCount) * 1000;
      const canRetry = !op.lastAttempt || now - op.lastAttempt > backoffMs;

      return canRetry;
    });
  }
}

// Export singleton instance
export default new SyncQueue();
