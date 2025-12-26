import { useEffect, useState } from "react";
import IndexedDB from "../../lib/indexedDB";
import { useAuth } from "../contexts/authContext";
import syncQueue from "../../lib/syncQueue";

const useIndexedDB = (NAME, VERSION, STORE, KEY_PATH, OLD_STORE) => {
  const DB = new IndexedDB(NAME, VERSION, STORE, KEY_PATH, OLD_STORE);

  const [data, setData] = useState(null);
  const { user } = useAuth();

  const wrapper =
    (callback) =>
    (...props) =>
      new Promise(async (resolve, reject) => {
        try {
          const response = await callback(...props);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

  const getData = wrapper(async () => {
    const response = await DB.get();
    setData(response);
    return response;
  });

  const createData = wrapper(async (data) => {
    const response = await DB.create(data);
    await getData();
    
    // Add to sync queue instead of direct Firebase sync
    if (user?.uid) {
      try {
        await syncQueue.add('CREATE', data, user.uid);
      } catch (error) {
        console.error('Failed to add to sync queue:', error);
        // Continue anyway - local operation succeeded
      }
    }

    return response;
  });
  const insertData = wrapper(async (data = []) => {
    const response = await DB.insert(data);
    // update local db
    await getData();
    return response;
  });
  const updateData = wrapper(async (data) => {
    const response = await DB.update(data);
    await getData();
    
    // Add to sync queue
    if (user?.uid) {
      try {
        await syncQueue.add('UPDATE', data, user.uid);
      } catch (error) {
        console.error('Failed to add to sync queue:', error);
      }
    }
    
    return response;
  });
  const deleteData = wrapper(async (id) => {
    const response = await DB.delete(id);
    await getData();
    
    // Add to sync queue
    if (user?.uid) {
      try {
        await syncQueue.add('DELETE', { id }, user.uid);
      } catch (error) {
        console.error('Failed to add to sync queue:', error);
      }
    }
    
    return response;
  });
  const deleteMultipleData = wrapper(async (keyList = []) => {
    const promises = keyList.map(async (id) => await DB.delete(id));
    const response = await Promise.all(promises);
    await getData();
    
    // Add each delete to sync queue
    if (user?.uid) {
      try {
        for (const id of keyList) {
          await syncQueue.add('DELETE', { id }, user.uid);
        }
      } catch (error) {
        console.error('Failed to add to sync queue:', error);
      }
    }
    
    return response;
  });

  const clearData = wrapper(async () => {
    await DB.clear();
    await getData();
  });

  // initiate database
  useEffect(() => {
    (async () => {
      try {
        await DB.init();
        await getData();
      } catch (err) {
        console.error("Failed to initialize IndexedDB:", err);
      }
    })();
  }, []);

  return {
    data,
    createData,
    insertData,
    updateData,
    deleteData,
    deleteMultipleData,
    clearData,
  };
};

export default useIndexedDB;
