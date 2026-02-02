import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Vets from '@/pages/Vets';
import Marketplace from '@/pages/Marketplace';
import Booking from '@/pages/Booking';
import HealthRecords from '@/pages/HealthRecords';
import Herds from '@/pages/Herds';
import VendorProducts from '@/pages/VendorProducts';
import Checkout from '@/pages/Checkout';
import AISymptomChecker from '@/pages/AISymptomChecker';
import FMDChecker from '@/pages/FMDChecker';
import Notifications from '@/pages/Notifications';
import Messages from '@/pages/Messages';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/Profile';
import VetOnboarding from '@/pages/VetOnboarding';
import Dashboard from '@/pages/Dashboard';
import VetDashboard from '@/pages/VetDashboard';
import VendorDashboard from '@/pages/VendorDashboard';

// Component to redirect to appropriate dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'vet') {
    return <Navigate to="/dashboard/vet" replace />;
  } else if (user?.role === 'vendor') {
    return <Navigate to="/dashboard/vendor" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/vets" element={<Vets />} />
                <Route path="/marketplace" element={<Marketplace />} />
                
                {/* Protected Routes - Require Authentication */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/vet" 
                  element={
                    <ProtectedRoute allowedRoles={['vet', 'admin']}>
                      <VetDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/vendor" 
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking" 
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/health-records" 
                  element={
                    <ProtectedRoute>
                      <HealthRecords />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/herds" 
                  element={
                    <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                      <Herds />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vendor-products" 
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorProducts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ai-symptom-checker" 
                  element={
                    <ProtectedRoute>
                      <AISymptomChecker />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fmd-checker" 
                  element={
                    <ProtectedRoute>
                      <FMDChecker />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vet-onboarding" 
                  element={
                    <ProtectedRoute allowedRoles={['vet', 'admin']}>
                      <VetOnboarding />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect /dashboard to appropriate role-based dashboard */}
                <Route path="/dashboard/redirect" element={<DashboardRedirect />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
