import React, { useMemo } from "react";
import { useSync } from "../contexts/syncContext";
import useOnline from "../hooks/useOnline";

const SyncStatus = ({ minimal = false }) => {
  const { syncStatus, pendingCount, lastSyncTime, isSyncing, triggerSync } =
    useSync();
  const { isOnline } = useOnline();

  const timeAgo = useMemo(() => {
    if (!lastSyncTime) return "Never";

    const now = Date.now();
    const diff = now - lastSyncTime;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }, [lastSyncTime]);

  if (minimal) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {isSyncing && (
          <div className="flex items-center gap-2 text-blue-600">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Syncing...</span>
          </div>
        )}

        {!isSyncing && pendingCount > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>{pendingCount} pending</span>
          </div>
        )}

        {!isSyncing && pendingCount === 0 && isOnline && (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Synced</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sync Status
        </h3>
        {!isOnline && (
          <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
            Offline
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Sync Status Indicator */}
        <div className="flex items-center gap-3">
          {isSyncing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-blue-600 dark:text-blue-400">
                Syncing in progress...
              </span>
            </>
          ) : syncStatus === "success" ? (
            <>
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-600 dark:text-green-400">
                All synced
              </span>
            </>
          ) : syncStatus === "error" ? (
            <>
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-600 dark:text-red-400">
                Sync failed
              </span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Idle</span>
            </>
          )}
        </div>

        {/* Pending Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Pending operations
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {pendingCount}
          </span>
        </div>

        {/* Last Sync Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Last sync</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {timeAgo}
          </span>
        </div>

        {/* Sync Button */}
        <button
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>

        {syncStatus === "error" && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Sync encountered errors. Will retry automatically.
          </p>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;
