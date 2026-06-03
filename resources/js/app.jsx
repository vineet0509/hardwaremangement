import React, { useEffect } from 'react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import BillsList from './pages/BillsList';
import Customers from './pages/Customers';
import Advances from './pages/Advances';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import QuotationsList from './pages/QuotationsList';
import QuotationCreate from './pages/QuotationCreate';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ChildBusinesses from './pages/ChildBusinesses';
import PublicLayout from './components/PublicLayout';
import api from './utils/api';
import '../css/app.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOrPrivateLayout = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Layout>{children}</Layout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
};

function App() {
  useEffect(() => {
    // Standard CSRF fetch for stateful forms
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).catch(console.error);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><Layout><BillsList /></Layout></ProtectedRoute>} />
        <Route path="/advances" element={<ProtectedRoute><Layout><Advances /></Layout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Layout><Staff /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/child-businesses" element={<ProtectedRoute><Layout><ChildBusinesses /></Layout></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
        <Route path="/super-admin" element={<ProtectedRoute><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
        <Route path="/quotations" element={<ProtectedRoute><Layout><QuotationsList /></Layout></ProtectedRoute>} />
        <Route path="/quotations/create" element={<ProtectedRoute><Layout><QuotationCreate /></Layout></ProtectedRoute>} />
        <Route path="/about-us" element={<PublicOrPrivateLayout><AboutUs /></PublicOrPrivateLayout>} />
        <Route path="/contact-us" element={<PublicOrPrivateLayout><ContactUs /></PublicOrPrivateLayout>} />
        <Route path="/privacy-policy" element={<PublicOrPrivateLayout><PrivacyPolicy /></PublicOrPrivateLayout>} />
        <Route path="/terms" element={<PublicOrPrivateLayout><Terms /></PublicOrPrivateLayout>} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
