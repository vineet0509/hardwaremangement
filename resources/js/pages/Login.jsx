import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Package, Lock, Mail, Languages, Shield } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Fetch CSRF cookie before login
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
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
    });
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <div className="login-card" style={{ width: '100%', padding: '40px', background: 'var(--surface)', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
               <Package size={32} strokeWidth={2.5} />
            </div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>Hardware Pro</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management Dashboard Login</p>
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleLogin}>
             <div className="form-group" style={{ marginBottom: 16 }}>
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> Email or Mobile Number</label>
               <input type="text" required className="form-control"
                  value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
             </div>
             
             <div className="form-group" style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                 <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Lock size={16} /> Password</label>
                 <a href="#" onClick={(e) => { e.preventDefault(); alert("To reset your password, please contact the Software Administrator or use your registered recovery phone number."); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
               </div>
               <input type="password" required className="form-control"
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
          </form>
        </div>

        {/* Language and Footer links for Login Page */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', padding: '8px 16px', borderRadius: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <Languages size={18} color="var(--primary)" />
            <select 
              style={{ border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
              onChange={(e) => {
                const lang = e.target.value;
                if(lang === 'en' || !lang) {
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
                } else {
                    document.cookie = `googtrans=/en/${lang}; path=/;`;
                    document.cookie = `googtrans=/en/${lang}; domain=${window.location.hostname}; path=/;`;
                }
                window.location.reload();
              }}
              defaultValue={document.cookie.split('; ').find(row => row.startsWith('googtrans='))?.split('=')[1]?.replace('/en/', '') || 'en'}
            >
              <option value="en">English (US)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ur">اردو (Urdu)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
            <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={14} /> Privacy Policy</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Hardware Shop Manager SaaS v2.0\nSupport: support@hardwareshop.com"); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
