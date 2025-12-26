import React from "react";
import toast from "react-hot-toast";
import readJSON from "../../utilities/readJSON";
import { useTransaction } from "../contexts/TransactionContext";

const ImportFile = ({ id = null, setLoading = () => {} }) => {
  // transaction context
  const { insertTransaction } = useTransaction();

  const handleFile = async (e) => {
    try {
      setLoading(true);
      const response = await readJSON(e.target?.files[0]);
      // check for file data
      if (response?.data?.length) {
        const promise = insertTransaction(response.data);
        await toast.promise(promise, {
          loading: "inserting data...",
          error: "error: cannot insert data",
          success: "transaction inserted successfully",
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to import file:", error);
      toast.error(error.message || "Failed to import file");
    }
    // reset input state
    e.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        id={id}
        className="hidden"
        accept="application/JSON"
        onChange={handleFile}
      />
    </>
  );
};

export default ImportFile;
