import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import OfferCreator from './views/OfferCreator';
import OfferHistory from './views/OfferHistory';
import OfferDetails from './views/OfferDetails';
import UsersManagement from './views/Admin/UsersManagement';
import OptionsManagement from './views/Admin/OptionsManagement';
import { useAuth } from './hooks/useAuth';

// Protected route component that requires authentication
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offers/new" 
            element={
              <ProtectedRoute>
                <OfferCreator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offers" 
            element={
              <ProtectedRoute>
                <OfferHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offers/:id" 
            element={
              <ProtectedRoute>
                <OfferDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin>
                <UsersManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/options" 
            element={
              <ProtectedRoute requireAdmin>
                <OptionsManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
