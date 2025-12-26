const idb =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

/**
 * IndexedDB wrapper class for managing local database operations
 * Provides methods for CRUD operations on IndexedDB
 */
class IndexedDB {
  /**
   * Creates an IndexedDB instance
   * @param {string} dbName - Database name
   * @param {number} version - Database version
   * @param {string} store - Object store name
   * @param {string} keyPath - Key path for the store
   * @param {string|null} oldStore - Old store name to delete during upgrade
   */
  constructor(dbName, version, store, keyPath, oldStore = null) {
    this.dbName = dbName;
    this.version = version;
    this.store = store;
    this.keyPath = keyPath;
    this.oldStore = oldStore;
  }

  #open() {
    return new Promise((resolve, reject) => {
      try {
        // open database
        const databaseReq = idb.open(this.dbName, this.version);
        // handle database error
        databaseReq.onerror = (event) => {
          reject(Error(event.target?.error?.toString()));
        };
        // handle database success
        databaseReq.onsuccess = (event) => {
          const db = event.target.result;
          if (db.objectStoreNames.contains(this.store)) {
            resolve(db);
          } else {
            reject(Error("Database store not found. Please refresh the page."));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        // check for browser support
        if (!idb) {
          reject(Error("browser does not support IndexedDB"));
        }
        // open database
        const databaseReq = idb.open(this.dbName, this.version);
        // handle database error
        databaseReq.onerror = (event) => {
          reject(Error(event.target?.error?.toString()));
        };
        // handle database upgrade
        databaseReq.onupgradeneeded = async (event) => {
          const db = event.target.result;
          const response = {};

          // handle stores
          if (!db.objectStoreNames.contains(this.store)) {
            db.createObjectStore(this.store, {
              keyPath: this.keyPath,
            });
            response[this.store] = `created successfully`;
          } else {
            response[this.store] = `already created`;
          }

          // handle old store
          if (this.oldStore && db.objectStoreNames.contains(this.oldStore)) {
            db.deleteObjectStore(this.oldStore);
            response[this.oldStore] = `deleted successfully`;
          }

          resolve(response);
        };
        // handle database success
        databaseReq.onsuccess = (event) => {
          resolve("no new collection to create");
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  get() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.#open();
        // collection transaction
        const tx = db.transaction(this.store, "readonly");
        const txstore = tx.objectStore(this.store);
        // collection data
        const data = txstore.getAll();

        // handle data success
        data.onsuccess = (event) => {
          // close database on transaction complete
          tx.oncomplete = () => db.close();
          resolve(data.result);
        };
        // handle data error
        data.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  create(data = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.#open();

        // collection transaction
        const tx = db.transaction(this.store, "readwrite");
        const txstore = tx.objectStore(this.store);
        // collection data
        const response = txstore.add(data);

        // handle data success
        response.onsuccess = (event) => {
          // close database on transaction complete
          tx.oncomplete = () => db.close();
          resolve(response.result);
        };
        // handle data error
        response.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  update(data = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.#open();
        // collection transaction
        const tx = db.transaction(this.store, "readwrite");
        const txstore = tx.objectStore(this.store);
        // put to collection data
        const response = txstore.put(data);

        // handle data success
        response.onsuccess = (event) => {
          // close database on transaction complete
          tx.oncomplete = () => db.close();
          resolve(response.result);
        };
        // handle data error
        response.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(key = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.#open();
        // collection transaction
        const tx = db.transaction(this.store, "readwrite");
        const txstore = tx.objectStore(this.store);
        // delete collection from data
        const data = txstore.delete(key);

        // handle data success
        data.onsuccess = (event) => {
          // close database on transaction complete
          tx.oncomplete = () => db.close();
          resolve(data.result);
        };
        // handle data error
        data.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  insert(dataArray = []) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.#open();

        // collection transaction
        const tx = db.transaction(this.store, "readwrite");
        dataArray.forEach((data) => {
          tx.objectStore(this.store).add(data);
        });

        // handle transaction success
        tx.oncomplete = (event) => {
          db.close();
          resolve(true);
        };

        // handle data error
        tx.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      // open database
      const databaseReq = idb.open(this.dbName, this.version);
      // handle database error
      databaseReq.onerror = (event) => {
        reject(Error(event.target?.error?.toString()));
      };
      // handle database success
      databaseReq.onsuccess = (event) => {
        const db = databaseReq.result;
        // collection transaction
        const tx = db.transaction(this.store, "readwrite");
        const txstore = tx.objectStore(this.store);
        // delete collection from data
        const data = txstore.clear();

        // handle data success
        data.onsuccess = (event) => {
          // close database on transaction complete
          tx.oncomplete = () => db.close();
          resolve(data.result);
        };
        // handle data error
        data.onerror = (event) => {
          reject(Error(event?.target?.error?.toString()));
        };
      };
    });
  }
}

export default IndexedDB;
