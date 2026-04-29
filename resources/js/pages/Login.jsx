import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Package, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    api.post('/login', formData)
      .then(res => {
         const token = res.data.access_token;
         localStorage.setItem('auth_token', token);
         // Setup Axios interceptor immediately for this session
         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
         navigate('/dashboard');
      })
      .catch(err => {
         setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-hover)' }}>
      <div className="login-card" style={{ width: 400, padding: '40px', background: 'var(--surface)', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)' }}>
             <Package size={32} strokeWidth={2.5} />
          </div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Hardware Pro</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management Dashboard Login</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
           <div className="form-group" style={{ marginBottom: 16 }}>
             <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> Email Address</label>
             <input type="email" required className="form-control" style={{ padding: '12px' }}
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
           </div>
           
           <div className="form-group" style={{ marginBottom: 24 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Lock size={16} /> Password</label>
               <a href="#" onClick={(e) => { e.preventDefault(); alert("To reset your password, please contact the Software Administrator or use your registered recovery phone number."); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
             </div>
             <input type="password" required className="form-control" style={{ padding: '12px' }}
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
           </div>

           <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}>
              {loading ? 'Authenticating...' : 'Sign In Securely'}
           </button>

           <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
             Need a new SaaS installation?{' '}
             <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
               Start your 30-Day Free Trial
             </Link>
           </div>
           
           <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem' }}>
             <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
               Privacy Policy
             </Link>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
