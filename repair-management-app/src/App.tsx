import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import CustomerPage from "./pages/CustomerPage";
import RepairJobsPage from "./pages/RepairJobsPage";
import RepairJobDetailPage from "./pages/RepairJobDetailPage";
import CreateServiceOrderPage from "./pages/CreateServiceOrderPage";
import InventoryPage from "./pages/InventoryPage";
import SignupPage from "./pages/SignupPage";
import OnboardingSuccessPage from "./pages/OnboardingSuccessPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
            path="/"
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route
              path="service-orders/new"
              element={<CreateServiceOrderPage />}
            />
            <Route path="repair-jobs" element={<RepairJobsPage />} />

            <Route
              path="repair-jobs/:repairJobId"
              element={<RepairJobDetailPage />}
            />

            <Route path="customers" element={<CustomerPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
