import { createContext, useCallback, useContext, useMemo } from "react";
import firestoreConfig from "../../config/firestore.config";
import indexedDBConfig from "../../config/indexedDB.config";
import { createDocument, getDocument } from "../../lib/firestore";
import { arrayToObj } from "../../utilities/objArraySwap";
import useIndexedDB from "../hooks/useIndexedDB";
import { useAuth } from "./authContext";

/**
 * Sanitizes and validates transaction data
 * Filters out transactions with missing required properties
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object with transaction IDs as keys
 */
export const sanitizeTransactions = (transactions) => {
  // sanitize transactions
  const filteredTransactions = transactions.filter((item) => {
    const hasAllProperties =
      item?.id &&
      item?.title &&
      typeof item.date === "number" &&
      ["income", "expense"].includes(item?.type) &&
      item?.category &&
      item?.createdAt;

    return hasAllProperties;
  });

  return arrayToObj(filteredTransactions, "id");
};

// transaction context
export const TransactionContext = createContext({
  transactions: [],
  createTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  importTransactions: async () => {},
  exportTransactions: async () => {},
  clearTransactions: async () => {},
});

// use transaction values
export const useTransaction = () => useContext(TransactionContext);

// transaction context provider
export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  // transaction state
  const {
    data: transactions,
    deleteData: deleteTransaction,
    deleteMultipleData: deleteTransactions,
    createData: createTransaction,
    updateData: updateTransaction,
    insertData: insertTransactions,
    clearData: clearTransactions,
  } = useIndexedDB(
    indexedDBConfig.NAME,
    indexedDBConfig.VERSION,
    indexedDBConfig.STORE,
    indexedDBConfig.KEY_PATH,
    indexedDBConfig.OLD_STORE
  );

  const importTransactions = useCallback(async (authUser) => {
    const myUser = authUser || user;
    if (!myUser) throw Error("unauthorized request");
    
    // get data from server
    const response = await getDocument(
      firestoreConfig.collection,
      myUser.uid
    );
    
    if (!response) return { message: "nothing to import" };
    
    const responseArr = Object.values(response);
    // filter the valid data
    const filteredResponse = responseArr.filter((item) => {
      const isExist = transactions.findIndex((t) => t.id === item.id);
      const hasAllProperties =
        item?.id &&
        item?.title &&
        typeof item.date === "number" &&
        ["income", "expense"].includes(item?.type) &&
        item?.amount &&
        item?.category &&
        item?.createdAt;
      return isExist < 0 && hasAllProperties;
    });

    // insert data to the local database
    await insertTransactions(filteredResponse);
    return { message: "successfully imported transactions" };
  }, [user, transactions, insertTransactions]);

  const exportTransactions = useCallback(async (authUser) => {
    const myUser = authUser || user;
    if (!myUser) throw Error("unauthorized request");

    const transactionsObj = sanitizeTransactions(transactions);

    await createDocument(
      firestoreConfig.collection,
      myUser.uid,
      transactionsObj
    );
    return { message: "successfully exported transactions" };
  }, [user, transactions]);

  // context value with memorization
  const value = useMemo(
    () => ({
      // main transaction
      transactions,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      deleteTransactions,
      exportTransactions,
      importTransactions,
      clearTransactions,
    }),
    [transactions, createTransaction, updateTransaction, deleteTransaction, deleteTransactions, exportTransactions, importTransactions, clearTransactions]
  );
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
