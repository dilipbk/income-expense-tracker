const indexedDBConfig = {
  NAME: import.meta.env.MODE === "production" ? "TRACK_TAKA" : "DEV-TRACK_TAKA",
  VERSION: 3, // Upgraded to fix store name mismatch
  STORE: "transections", // Keep original name to preserve existing user data
  OLD_STORE: "transactions", // Delete the incorrectly named store from v2
  KEY_PATH: "id",
};

export default indexedDBConfig;
