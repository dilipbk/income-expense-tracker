import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../common/layout";
import Preloader from "../common/components/Preloader";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("../pages/Dashboard"));
const NotFound = lazy(() => import("../pages/Error/NotFound"));
const Feedback = lazy(() => import("../pages/Feedback"));
const Home = lazy(() => import("../pages/Home"));
const Settings = lazy(() => import("../pages/Settings"));
const Transactions = lazy(() => import("../pages/Transactions"));
const CreateTransaction = lazy(
  () => import("../pages/Transactions/CreateTransaction")
);
const EditTransaction = lazy(
  () => import("../pages/Transactions/EditTransaction")
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Preloader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* app routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/create" element={<CreateTransaction />} />
          <Route path="/transactions/edit/:id" element={<EditTransaction />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* not found page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
