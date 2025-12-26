import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { BsCloudUpload } from "react-icons/bs";
import { useTransaction } from "../../contexts/transactionContext";
import SettingsModal from "./SettingsModal";

const ExportTransactions = () => {
  const { exportTransactions } = useTransaction();
  const [showModal, setShowModal] = useState(false);

  const handleExport = async () => {
    setShowModal(false);
    const promise = exportTransactions();

    await toast.promise(promise, {
      loading: "exporting transactions...",
      success: "successfully exported transactions",
      error: "cannot export transactions",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="settings_item">
          <h3 className="settings_item_title">Export transactions to server</h3>

          <button
            className="btn btn-icon btn-warning ml-auto"
            onClick={() => setShowModal(true)}
          >
            <BsCloudUpload />
          </button>
        </div>
      </div>
      <SettingsModal
        isOpen={showModal}
        onAgree={handleExport}
        onDisagree={() => setShowModal(false)}
        onClose={() => setShowModal(false)}
        title="Export"
        description={
          "By exporting transactions to the server will remove all the existing transecitons."
        }
        agreeText="Export"
        disagreeText="Cancel"
      />
    </>
  );
};

export default ExportTransactions;
