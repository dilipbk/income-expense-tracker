# API Documentation

## Context Providers

### AuthContext

Manages user authentication state using Firebase Auth.

**Available methods:**
- `login()` - Sign in with Google
- `logout()` - Sign out current user

**State:**
- `user` - Current user object
- `status` - Authentication status: `INITIAL | LOADING | AUTHORIZED | UNAUTHORIZED`
- `error` - Error object if authentication fails

**Usage:**
```javascript
import { useAuth } from './common/contexts/authContext';

function MyComponent() {
  const { user, status, login, logout } = useAuth();
  // ...
}
```

### TransactionContext

Manages transactions using IndexedDB for local storage and Firebase for cloud sync.

**Available methods:**
- `createTransaction(transaction)` - Create a new transaction
- `updateTransaction(transaction)` - Update existing transaction
- `deleteTransaction(id)` - Delete transaction by ID
- `deleteTransactions(ids)` - Delete multiple transactions
- `importTransactions(authUser)` - Import from Firebase
- `exportTransactions(authUser)` - Export to Firebase
- `clearTransactions()` - Clear all local transactions

**State:**
- `transactions` - Array of all transactions

**Usage:**
```javascript
import { useTransaction } from './common/contexts/transactionContext';

function MyComponent() {
  const { transactions, createTransaction } = useTransaction();
  // ...
}
```

### GlobalContext

Manages global app state including sidebar visibility and online status.

**Available methods:**
- `toggleSidebar()` - Toggle sidebar open/closed
- `showSidebar()` - Open sidebar
- `hideSidebar()` - Close sidebar

**State:**
- `sidebar` - Boolean indicating if sidebar is open
- `isOnline` - Boolean indicating network connectivity

### ThemeContext

Manages dark/light theme switching.

**Available methods:**
- `toggleTheme()` - Toggle between dark and light theme

**State:**
- `theme` - Current theme: `'light' | 'dark'`

## Utility Functions

### authErrorMessage(error)

Converts Firebase auth error codes to user-friendly messages.

**Parameters:**
- `error` - Firebase auth error object

**Returns:** String with user-friendly error message

### sanitizeTransactions(transactions)

Filters and validates transaction data.

**Parameters:**
- `transactions` - Array of transaction objects

**Returns:** Object with transaction IDs as keys

## Hooks

### useDateFilter(transactions)

Filters transactions by date range (month/year/all).

**Returns:**
- `filteredData` - Filtered transactions
- `filterDate` - Current filter date
- `filterType` - Filter type: `'MONTH' | 'YEAR' | 'NONE'`
- `setFilterDate` - Function to set filter date
- `setFilterType` - Function to set filter type

### useTransactionFilter(transactions)

Advanced filtering for transactions by search, category, type, and sorting.

**Returns:**
- `filteredData` - Filtered transactions
- `filterType` - Current type filter
- `filterSort` - Current sort option
- `filterCategories` - Selected categories
- `query` - Search query string
- `setQuery` - Set search query
- `setFilterType` - Set type filter
- `setFilterSort` - Set sort option
- `toggleFilterCategory` - Toggle category filter

## Configuration

### Environment Variables

Required environment variables for Firebase configuration:

```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGE_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

### IndexedDB Configuration

Default configuration in `src/config/indexedDB.config.js`:
- Store name: `transactions`
- Key path: `id`

### Firebase Configuration

Collection name in `src/config/firestore.config.js`:
- Collection: `transactions`

