import React from "react";
import { Helmet } from "react-helmet";
import { BsChatLeftQuoteFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import ExportTransactions from "../common/components/Settings/ExportTransactions";
import ImportTransactions from "../common/components/Settings/ImportTransactions";
import Profile from "../common/components/Settings/Profile";
import SignIn from "../common/components/Settings/SignIn";
import SyncStatus from "../common/components/SyncStatus";
import { useAuth } from "../common/contexts/authContext";
import { useSync } from "../common/contexts/syncContext";

const Settings = () => {
  const { error, status } = useAuth();
  const { clearQueue, syncStats } = useSync();

  const handleClearQueue = async () => {
    if (window.confirm('Are you sure you want to clear all pending sync operations? This cannot be undone.')) {
      await clearQueue();
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Track Taka</title>
      </Helmet>
      <div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold">Settings</h2>
        </div>
        <div className="flex flex-col gap-4 max-w-[500px]">
          {status === "AUTHORIZED" ? (
            <>
              <Profile />
              
              {/* Sync Status Section */}
              <div className="space-y-4">
                <SyncStatus />
                
                {/* Advanced Sync Options */}
                {syncStats && syncStats.pendingCount > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Sync Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Creates:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {syncStats.byType.CREATE}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Updates:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {syncStats.byType.UPDATE}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deletes:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {syncStats.byType.DELETE}
                        </span>
                      </div>
                      {syncStats.retryStats.total > 0 && (
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Retrying:</span>
                          <span className="font-medium text-orange-600">
                            {syncStats.retryStats.total}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleClearQueue}
                      className="w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Clear Sync Queue
                    </button>
                  </div>
                )}
              </div>

              <ImportTransactions />
              <ExportTransactions />
            </>
          ) : (
            <>
              <SignIn />
            </>
          )}
          <Link to={"/feedback"} className="settings_item">
            <h3 className="settings_item_title">Share Your Feedback</h3>

            <button className="btn btn-icon btn-primary ml-auto">
              <BsChatLeftQuoteFill />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Settings;
