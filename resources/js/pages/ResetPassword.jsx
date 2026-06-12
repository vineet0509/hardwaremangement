import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Package, Lock, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ 
      email: '', 
      password: '', 
      password_confirmation: '',
      token: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const email = params.get('email');
      
      if (!token) {
          Swal.fire('Invalid Link', 'No reset token provided. Please request a new link.', 'error').then(() => {
              navigate('/forgot-password');
          });
      }

      setFormData(prev => ({ ...prev, token: token || '', email: email || '' }));
  }, [location]);

  const handleReset = (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (formData.password !== formData.password_confirmation) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError(null);
    
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
        api.post('/reset-password', formData)
          .then(res => {
             Swal.fire('Success', res.data.message || 'Password has been successfully reset!', 'success').then(() => {
                 navigate('/login');
             });
          })
          .catch(err => {
             setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
          })
          .finally(() => setLoading(false));
    });
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <div className="login-card" style={{ width: '100%', padding: '40px', background: 'var(--surface)', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), #b8962d)', width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
               <Lock size={32} strokeWidth={2.5} />
            </div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                Create New Password
             </h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your new password must be different from previous used passwords.</p>
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleReset}>
             <div className="form-group" style={{ marginBottom: 16 }}>
               <label className="form-label">Email Address</label>
               <input type="email" required className="form-control"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} readOnly={!!(new URLSearchParams(location.search).get('email'))} />
             </div>
             
             <div className="form-group" style={{ marginBottom: 16 }}>
               <label className="form-label">New Password</label>
               <input type="password" required className="form-control" minLength={8}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>

             <div className="form-group" style={{ marginBottom: 24 }}>
               <label className="form-label">Confirm New Password</label>
               <input type="password" required className="form-control" minLength={8}
                  value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
             </div>

             <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <CheckCircle size={20} /> {loading ? 'Saving...' : 'Reset Password'}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
