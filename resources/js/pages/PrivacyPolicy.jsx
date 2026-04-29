import React from 'react';
import { Shield, Lock, FileText, Server, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ minHeight: '100vh', padding: '40px 20px', overflowY: 'auto' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '40px', backdropFilter: 'blur(12px)' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline" 
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Shield size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Last updated: April 2026</p>
        </div>

        <div style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1.05rem' }}>
          
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <FileText color="var(--primary)" /> 1. Introduction
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Welcome to the Hardware Shop Manager. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our Point of Sale (POS) and Store Management system.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Server color="var(--primary)" /> 2. Information We Collect
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              We collect information necessary to provide you with comprehensive billing and inventory management services:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Shop Data:</strong> Business name, domain, contact information, and configuration settings.</li>
              <li><strong>User Data:</strong> Staff names, emails, roles, and encrypted passwords.</li>
              <li><strong>Customer Data:</strong> Customer names, phone numbers, and addresses entered during billing for ledger management.</li>
              <li><strong>Transaction Data:</strong> Invoices, billing history, payment methods, and pending dues.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <EyeOff color="var(--primary)" /> 3. How We Use Your Information
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Your data is strictly used for the operation and improvement of the Hardware Shop Manager system. Specifically, we use it to:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Process transactions and generate bills.</li>
              <li>Maintain accurate inventory and stock alerts.</li>
              <li>Provide business analytics and dashboards.</li>
              <li>Manage staff access, salaries, and advances.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Lock color="var(--primary)" /> 4. Data Security & Multi-Tenancy
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We implement robust security measures to prevent unauthorized access. Our multi-tenant architecture ensures that your shop's data is strictly isolated. Users from one shop cannot access or view data from another shop. We use industry-standard encryption for passwords and sensitive information.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Shield color="var(--primary)" /> 5. Your Rights
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You have the right to access, update, or delete your personal and business information at any time. Shop administrators can manage these details directly through the system's settings. If you require complete account deletion, please contact the Super Administrator.
            </p>
          </section>

          <section>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              By using the Hardware Shop Manager, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
