import React from "react";
import { toast } from "react-hot-toast";
import { BiLoader } from "react-icons/bi";
import { BsGoogle } from "react-icons/bs";
import { useAuth } from "../../contexts/authContext";
import { useTransaction } from "../../contexts/transactionContext";

const SignIn = () => {
  const { login, status } = useAuth();
  const { importTransactions } = useTransaction();

  const handleLogin = async () => {
    try {
      const response = await login();
      // if successfully logged in then import existing data
      if (response) {
        const promise = importTransactions(response);
        await toast.promise(promise, {
          loading: "importing existing transactions...",
          success: "successfully imported transactions",
          error: "cannot import transactions",
        });
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  return (
    <>
      {status === "UNAUTHORIZED" ? (
        <div className="settings_item">
          <h3 className="settings_item_title">Sign In With Google</h3>

          <button
            className="btn btn-icon btn-success ml-auto"
            onClick={handleLogin}
          >
            <BsGoogle />
          </button>
        </div>
      ) : (
        <div className="settings_item">
          <h3 className="settings_item_title">
            {status === "LOADING" ? "Signing In..." : "User Loading..."}
          </h3>

          <div className="btn btn-icon btn-primary ml-auto">
            <BiLoader className="animate-spin" />
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
