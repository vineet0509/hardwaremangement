import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Package } from 'lucide-react';
import '../../css/login.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    shop_name: ''
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
    
    // Using simple fetch to bypass Axios interceptors during auth creation
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(async res => {
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || 'Registration error');
        return data;
    })
    .then(data => {
        localStorage.setItem('auth_token', data.access_token);
        window.location.href = '/dashboard';
    })
    .catch(err => {
        setError(err.message);
    })
    .finally(() => setLoading(false));
  };

  return (
    <div className="login-container">
      <div className="login-bg-shape1"></div>
      <div className="login-bg-shape2"></div>
      
      <div className="login-card" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="login-header">
          <div className="login-logo">
            <Package size={32} strokeWidth={2.5} />
          </div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join us to manage your hardware store.</p>
          <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '8px' }}>
            🎉 Includes a 30-Day Free Trial
          </div>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Shop / Hardware Business Name</label>
            <div className="login-input-wrapper">
              <Package className="login-input-icon" size={20} />
              <input 
                type="text" 
                name="shop_name"
                className="form-control" 
                placeholder="Ex: Sharma Hardware" 
                required
                value={formData.shop_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Full Name</label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" size={20} />
              <input 
                type="text" 
                name="name"
                className="form-control" 
                placeholder="John Doe" 
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                className="form-control" 
                placeholder="admin@hardwareshop.com" 
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("To reset your password, please contact the Software Administrator or use your registered recovery phone number."); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
            </div>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={20} />
              <input 
                type="password" 
                name="password"
                className="form-control" 
                placeholder="••••••••" 
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={20} />
              <input 
                type="password" 
                name="password_confirmation"
                className="form-control" 
                placeholder="••••••••" 
                required
                minLength={8}
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn" style={{ marginTop: '30px' }}>
            {loading ? 'Creating Shop...' : <>Register Store <UserPlus size={20} /></>}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="forgot-password">
              Sign In
            </Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem' }}>
            By registering, you agree to our{' '}
            <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
