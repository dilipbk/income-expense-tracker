import React from "react";
import { toast } from "react-hot-toast";
import { BsCloudDownload } from "react-icons/bs";
import { useTransaction } from "../../contexts/transactionContext";

const ImportTransactions = () => {
  const { importTransactions } = useTransaction();

  const handleImport = async () => {
    const promise = importTransactions();

    await toast.promise(promise, {
      loading: "importing transactions...",
      success: "successfully imported transactions",
      error: "cannot import transactions",
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="settings_item">
        <h3 className="settings_item_title">Import data from server</h3>

        <button
          className="btn btn-icon btn-success ml-auto"
          onClick={handleImport}
        >
          <BsCloudDownload />
        </button>
      </div>
    </div>
  );
};

export default ImportTransactions;
