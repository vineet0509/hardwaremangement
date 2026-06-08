import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Package, Lock, Mail, Languages, Shield, FileText } from 'lucide-react';

import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = new URLSearchParams(location.search).get('session_expired');
  const verifiedSuccess = new URLSearchParams(location.search).get('verified');
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();

    if (formData.login.trim().length < 3) {
      return setError("Invalid email or mobile number.");
    }
    if (formData.password.length < 4) {
      return setError("Password is too short.");
    }

    setLoading(true);
    setError(null);

    // Fetch CSRF cookie before login
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
        const payload = { ...formData };
        payload.device_type = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform() ? 'mobile' : 'browser';

        api.post('/login', payload)
          .then(res => {
         const token = res.data.access_token;
         localStorage.setItem('auth_token', token);
         localStorage.setItem('login_date', new Date().toDateString());
         // Setup Axios interceptor immediately for this session
         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
         navigate('/dashboard');
      })
      .catch(err => {
         if (err.response?.status === 403 && err.response?.data?.unverified_email) {
            setUnverifiedEmail(err.response.data.unverified_email);
            setError(err.response.data.message);
         } else {
            setUnverifiedEmail(null);
            setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
         }
      })
          .finally(() => setLoading(false));
    });
  };

  const handleResendVerification = (e) => {
      e.preventDefault();
      setResendLoading(true);
      setResendMessage(null);
      api.post('/email/verification-notification', { email: unverifiedEmail })
          .then(res => setResendMessage(res.data.message || 'Verification link sent! Please check your email.'))
          .catch(err => setError(err.response?.data?.message || 'Failed to resend verification link.'))
          .finally(() => setResendLoading(false));
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <div className="login-card" style={{ width: '100%', padding: '40px', background: 'var(--surface)', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain', margin: '0 auto 16px', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', background: 'linear-gradient(135deg, var(--primary), #059669)', width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
               <Package size={32} strokeWidth={2.5} />
            </div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                <span style={{ color: '#111827' }}>Vyapar</span>
                <span style={{ color: '#00a8ff' }}>Sync</span>
             </h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management Dashboard Login</p>
          </div>

          {sessionExpired && !error && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
               Your session has expired. Please sign in again.
            </div>
          )}

          {verifiedSuccess && !error && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
               Your email has been successfully verified! You can now sign in.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>
               {error}
               {unverifiedEmail && (
                   <div style={{ marginTop: 12 }}>
                       {resendMessage ? (
                           <div style={{ color: 'var(--success)', fontWeight: 600 }}>{resendMessage}</div>
                       ) : (
                           <button onClick={handleResendVerification} disabled={resendLoading} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                               {resendLoading ? 'Sending...' : 'Resend Verification Link'}
                           </button>
                       )}
                   </div>
               )}
            </div>
          )}

          <form onSubmit={handleLogin}>
             <div className="form-group" style={{ marginBottom: 16 }}>
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> Email or Mobile Number</label>
               <input type="text" required className="form-control"
                  value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
             </div>

             <div className="form-group" style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                 <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Lock size={16} /> Password</label>
                 <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
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
                 Start your 30-Day Trial Period
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
            <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={14} /> Terms & Conditions</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire("VyaparSync SaaS v2.0\nSupport: support@vynkra.in"); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Help & Support</a>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8, marginTop: 8 }}>
            Powered by <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Vynkra Technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
