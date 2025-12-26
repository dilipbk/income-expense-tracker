import React from "react";
import { Helmet } from "react-helmet";
import DateFilter from "../../common/components/DateFilter";
import TransactionTable from "../../common/components/TransactionTable";
import { useTransaction } from "../../common/contexts/transactionContext";
import useDateFilter from "../../common/hooks/useDateFilter";

const Transactions = () => {
  const { transactions } = useTransaction();
  const { filterDate, filterType, filteredData, setFilterDate, setFilterType } =
    useDateFilter(transactions);

  return (
    <>
      <Helmet>
        <title>Transactions - Track Taka</title>
      </Helmet>
      {/* page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>

        {/* <!-- header actions --> */}
        <div className="flex items-center gap-2">
          <DateFilter
            filterDate={filterDate}
            filterType={filterType}
            onFilterDateChange={setFilterDate}
            onFilterTypeChange={setFilterType}
          />
        </div>
      </div>

      <TransactionTable
        className="mt-10"
        data={filteredData}
        isInteractive
        showStats
      />
    </>
  );
};

export default Transactions;
