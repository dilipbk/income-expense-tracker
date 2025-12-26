import React from "react";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../common/components/ErrorBoundary";
import Preloader from "../common/components/Preloader";
import OfflineBanner from "../common/components/OfflineBanner";
import InstallPrompt from "../common/components/InstallPrompt";
import { AuthProvider } from "../common/contexts/authContext";
import { GlobalProvider } from "../common/contexts/globalContext";
import { ThemeProvider } from "../common/contexts/themeContext";
import { TransactionProvider } from "../common/contexts/transactionContext";
import { SyncProvider } from "../common/contexts/syncContext";
import ServiceWorker from "../pwa/serviceWorker";
import AppRoutes from "./AppRoutes";

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SyncProvider>
          <ThemeProvider>
            <GlobalProvider>
              <TransactionProvider>
                {/* <OfflineBanner /> */}
                <InstallPrompt />
                <Preloader />
                <Toaster position="bottom-right" />
                <AppRoutes />
                <ServiceWorker />
              </TransactionProvider>
            </GlobalProvider>
          </ThemeProvider>
        </SyncProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
