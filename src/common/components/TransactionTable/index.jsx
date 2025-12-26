import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../contexts/transactionContext";
import useSelect from "../../hooks/useSelect";
import useTransactionFilter from "../../hooks/useTransactionFilter";
import Stats from "../Stats";
import TableBody from "./TableBody";
import TransactionFilter from "./TableFilter";
import TableHeader from "./TableHeader";
import TransactionHeader from "./TableNav";

const TransactionTable = ({
  className = "",
  data = [],
  showStats = false,
  isInteractive = false,
  small = false,
}) => {
  // transaction context
  const { deleteTransaction, deleteTransactions } = useTransaction();

  // filter states
  const {
    filteredData: tableData,
    filterCategories,
    filterSort,
    filterType,
    query,
    setFilterSort,
    setFilterType,
    setQuery,
    toggleFilterCategory,
  } = useTransactionFilter(data);
  const [showFilter, setShowFilter] = useState(false);

  // selected row states
  const {
    selected: selectedRows,
    clearSelect,
    removeSelect,
    toggleSelect,
    toggleAllSelect,
    isAllSelected,
  } = useSelect(tableData, "id");

  // transaction loading
  const [isLoading, setIsLoading] = useState(false);

  // delete selected rows
  const deleteSelectedRows = async () => {
    try {
      setIsLoading(true);
      const promise = deleteTransactions(selectedRows);
      await toast.promise(promise, {
        loading: "deleting selected transaction...",
        success: "selected transactions deleted",
        error: "something went wrong!",
      });
      // reset states
      clearSelect();
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to delete transactions:", error);
      toast.error("Failed to delete selected transactions");
      setIsLoading(false);
    }
  };

  // delete specific row
  const deleteRow = async (id) => {
    try {
      setIsLoading(true);
      const promise = deleteTransaction(id);
      await toast.promise(promise, {
        loading: "deleting transaction...",
        success: "transaction deleted",
        error: "something went wrong!",
      });

      // reset states
      removeSelect(id);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Failed to delete transaction");
      setIsLoading(false);
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      {showStats ? (
        <Stats
          transactions={tableData}
          className="mb-10"
          showWallet={filterType == "ALL"}
          showTotal={filterType == "ALL"}
          showExpenses={filterType !== "INCOME"}
          showIncome={filterType !== "EXPENSE"}
        />
      ) : null}

      {isInteractive ? (
        <TransactionHeader
          query={query}
          setQuery={setQuery}
          handleDelete={deleteSelectedRows}
          deleteAble={!!selectedRows.length}
          showFilter={() => setShowFilter(true)}
          isLoading={isLoading}
        />
      ) : null}

      <div className={`overflow-x-auto py-0`}>
        <table
          className={`w-full dark:border-gray-700 border ${
            small ? "table-sm" : ""
          }`}
        >
          <TableHeader
            toggleAllSelect={toggleAllSelect}
            isAllSelected={isAllSelected}
            isInteractive={isInteractive}
          />
          <TableBody
            tableData={small ? tableData.slice(0, 10) : tableData}
            isInteractive={isInteractive}
            selectedRows={selectedRows}
            handleRowDelete={deleteRow}
            handleRowSelect={toggleSelect}
            isLoading={isLoading}
          />
        </table>
      </div>

      {isInteractive ? (
        <TransactionFilter
          isOpen={showFilter}
          close={() => setShowFilter(false)}
          filterCategories={filterCategories}
          filterSort={filterSort}
          filterType={filterType}
          setFilterSort={setFilterSort}
          setFilterType={setFilterType}
          toggleFilterCategory={toggleFilterCategory}
        />
      ) : null}
    </div>
  );
};

export default TransactionTable;
