import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Package, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [login, setLogin] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleForgot = (e) => {
    e.preventDefault();

    if (!login || login.trim().length < 5) {
      return setError("Invalid input.");
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
        api.post('/forgot-password', { login })
          .then(res => {
             setMessage(res.data.message || 'Password reset link sent.');
          })
          .catch(err => {
             setError(err.response?.data?.message || 'Failed to send reset link. Please check your details.');
          })
          .finally(() => setLoading(false));
    });
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <div className="login-card" style={{ width: '100%', padding: '40px', background: 'var(--surface)', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain', margin: '0 auto 16px', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', background: 'linear-gradient(135deg, var(--primary), #b8962d)', width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
               <Package size={32} strokeWidth={2.5} />
            </div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                Forgot Password?
             </h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter your email or mobile to receive a reset link</p>
          </div>

          {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>{message}</div>}
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleForgot}>
             <div className="form-group" style={{ marginBottom: 24 }}>
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> Email or Mobile Number</label>
               <input type="text" required className="form-control"
                  value={login} onChange={e => setLogin(e.target.value)} />
             </div>

             <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}>
                {loading ? 'Sending Link...' : 'Send Reset Link'}
             </button>

             <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
               <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                 <ArrowLeft size={16} /> Back to Sign In
               </Link>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
