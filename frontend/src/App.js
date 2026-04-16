import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import BookCourier from './pages/BookCourier';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import MyCouriers from './pages/MyCouriers';
import OrdersDashboard from './pages/OrdersDashboard';
import PlaceOrder from './pages/PlaceOrder';
import Register from './pages/Register';
import TrackCourier from './pages/TrackCourier';

const Guard = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const AUTH_PATHS = ['/login', '/register'];

function AppShell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  // Auth pages: no sidebar
  if (isAuthPage || !user) {
    return (
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // App pages: sidebar + main content
  return (
    <div className="sc-shell">
      <Sidebar />
      <div className="sc-main">
        <Routes>
          <Route path="/"             element={<HomeRedirect />} />
          <Route path="/track"        element={<TrackCourier />} />
          <Route path="/track/:id"    element={<TrackCourier />} />
          <Route path="/dashboard"    element={<Guard role="customer"><CustomerDashboard /></Guard>} />
          <Route path="/book"         element={<Guard role="customer"><BookCourier /></Guard>} />
          <Route path="/my-couriers"  element={<Guard role="customer"><MyCouriers /></Guard>} />
          <Route path="/place-order"  element={<Guard role="customer"><PlaceOrder /></Guard>} />
          <Route path="/admin"        element={<Guard role="admin"><AdminDashboard /></Guard>} />
          <Route path="/admin/orders" element={<Guard role="admin"><OrdersDashboard /></Guard>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
