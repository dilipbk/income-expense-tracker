import React from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uuid from "react-uuid";
import TransactionForm from "../../common/components/Transaction/TransactionForm";
import { useTransaction } from "../../common/contexts/transactionContext";

const TOAST = "CREATE_TOAST";

const CreateTransaction = () => {
  // router hooks
  const navigate = useNavigate();
  // transaction context
  const { createTransaction } = useTransaction();

  // handle submit
  const handleSubmit = async (values) => {
    try {
      // modify date to time number
      const date = new Date(values.date).getTime();
      const transaction = {
        id: uuid(),
        title: values.title,
        category: values.category,
        type: values.type,
        amount: values.amount,
        date,
        createdAt: Date.now(),
      };
      const promise = createTransaction(transaction);
      await toast.promise(promise, {
        loading: "creating new transaction",
        success: "new transaction created",
        error: "something went wrong",
      });
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Failed to create transaction");
    }
    navigate("/transactions", { replace: true });
  };
  return (
    <>
      <Helmet>
        <title>Create Transaction - Track Taka</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Create Transaction</h2>
      </div>

      <div className="mt-10">
        <TransactionForm mode={"CREATE"} handleSubmit={handleSubmit} />
      </div>
    </>
  );
};

export default CreateTransaction;
