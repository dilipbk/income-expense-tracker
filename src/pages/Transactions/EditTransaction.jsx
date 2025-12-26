import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import TransactionForm from "../../common/components/Transaction/TransactionForm";
import { useTransaction } from "../../common/contexts/transactionContext";

const EditTransaction = () => {
  // router hooks
  const navigate = useNavigate();
  const { id } = useParams();
  // transaction context
  const { transactions, updateTransaction } = useTransaction();
  // app states
  const [defState, setDefState] = useState();

  // handle default data
  useEffect(() => {
    if (id && transactions) {
      const targetedState = transactions.find((item) => item.id == id);
      if (targetedState) {
        setDefState({ ...targetedState });
      }
    }
  }, [id, transactions]);

  // handle submit
  const handleSubmit = async (values) => {
    try {
      // modify date to time number
      const date = new Date(values.date).getTime();
      const updated = { ...defState, ...values, date };
      const promise = updateTransaction(updated);
      await toast.promise(promise, {
        loading: "updating transaction...",
        success: "transaction updated successfully",
        error: "something went wrong",
      });
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Failed to update transaction");
    }
    navigate("/transactions", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Edit Transactions - Track Taka</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Edit Transaction</h2>
      </div>

      <div className="mt-10">
        <TransactionForm
          mode={"UPDATE"}
          initialValues={defState}
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  );
};

export default EditTransaction;
