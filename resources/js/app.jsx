import React, { useEffect } from 'react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
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
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
            V
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>Vynkra Technologies</span>
        </div>
        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', background: 'rgba(79, 70, 229, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(79, 70, 229, 0.2)', transition: 'all 0.2s' }}>
          ← Back to Sign In
        </Link>
      </div>
      {children}
    </div>
  );
};

function App() {
  useEffect(() => {
    // Standard CSRF fetch for stateful forms
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).catch(console.error);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
        <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
        <Route path="/super-admin" element={<ProtectedRoute><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
        <Route path="/quotations" element={<ProtectedRoute><Layout><QuotationsList /></Layout></ProtectedRoute>} />
        <Route path="/quotations/create" element={<ProtectedRoute><Layout><QuotationCreate /></Layout></ProtectedRoute>} />
        <Route path="/about-us" element={<ProtectedRoute><Layout><AboutUs /></Layout></ProtectedRoute>} />
        <Route path="/contact-us" element={<ProtectedRoute><Layout><ContactUs /></Layout></ProtectedRoute>} />
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
