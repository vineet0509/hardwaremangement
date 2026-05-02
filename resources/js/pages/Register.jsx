import React, { useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Package, Phone, Store, ShieldCheck, BadgeCheck, Languages, Shield } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    shop_name: '',
    gst_number: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if(formData.password !== formData.password_confirmation) {
       return setError("Passwords do not match");
    }
    setLoading(true);
    setError(null);
    // Fetch CSRF cookie before registration
    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
        api.post('/register', formData)
          .then(res => {
              localStorage.setItem('auth_token', res.data.access_token);
              window.location.href = '/dashboard';
          })
          .catch(err => {
              setError(err.response?.data?.message || 'Registration error');
          })
          .finally(() => setLoading(false));
    });
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="login-card" style={{ maxWidth: 500, width: '100%', padding: '40px', background: 'var(--surface)', borderRadius: 20, marginTop: 40, marginBottom: 40, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
               <Package size={36} strokeWidth={2.5} />
            </div>
             <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.02em' }}>Register Store</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Start managing your hardware business today.</p>
             
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '16px', border: '1px solid #d1fae5' }}>
               <BadgeCheck size={16} /> 30-Day Free Trial Included
             </div>
          </div>

          <form onSubmit={handleRegister}>
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 10, fontSize: '0.85rem', marginBottom: 24, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            {/* Section: Shop Details */}
            <div style={{ marginBottom: 24 }}>
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={14} /> Store Information
               </h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input 
                    type="text" 
                    name="shop_name" 
                    className="form-control" 
                    placeholder="Official Shop Name (Ex: Apex Hardware)" 
                    required 
                    value={formData.shop_name} 
                    onChange={handleChange} 
                  />
                  <input 
                    type="text" 
                    name="gst_number" 
                    className="form-control" 
                    placeholder="GST Number (Optional)" 
                    value={formData.gst_number} 
                    onChange={handleChange} 
                  />
               </div>
            </div>

            {/* Section: Personal Info */}
            <div style={{ marginBottom: 24 }}>
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> Owner Details
               </h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="text" name="name" className="form-control" placeholder="Your Full Name" required value={formData.name} onChange={handleChange} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                     <input type="email" name="email" className="form-control" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
                     <input type="text" name="mobile" className="form-control" placeholder="Mobile Number" required value={formData.mobile} onChange={handleChange} />
                  </div>
               </div>
            </div>

            {/* Section: Security */}
            <div style={{ marginBottom: 32 }}>
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> Account Security
               </h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input type="password" name="password" className="form-control" placeholder="Password" required minLength={8} value={formData.password} onChange={handleChange} />
                  <input type="password" name="password_confirmation" className="form-control" placeholder="Confirm" required minLength={8} value={formData.password_confirmation} onChange={handleChange} />
               </div>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Use 8 or more characters with letters and numbers.</p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {loading ? 'Setting up your shop...' : <>Register Business <UserPlus size={20} /></>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign In Here
              </Link>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              By continuing, you agree to our <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>

        {/* Language and Footer links for Register Page */}
        <div style={{ marginTop: 0, marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
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

export default Register;
