import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ClaimsPage } from './pages/modules/claims/ClaimsPage';
import { SignerPage } from './pages/modules/signer/SignerPage';
import { CalendarPage } from './pages/modules/calendar/CalendarPage';
import { AdminPage } from './pages/modules/admin/AdminPage';
import { TrainingPage } from './pages/modules/training/page';
import { useAuthStore } from './stores/authStore';

function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest-only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login"          element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="claims"   element={<ClaimsPage />} />
            <Route path="signer"   element={<SignerPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="admin"    element={<AdminPage />} />
            <Route path="training" element={<TrainingPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
