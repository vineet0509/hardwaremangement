import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  User,
  UserPlus,
  Store,
  BadgeCheck,
  Languages
} from 'lucide-react';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  // Modal & Navigation States
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    shop_name: '',
    business_type: '',
    gst_number: ''
  });
  const [registerError, setRegisterError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginData.login.trim().length < 3) {
      return setLoginError("Invalid email or mobile number.");
    }
    if (loginData.password.length < 4) {
      return setLoginError("Password is too short.");
    }

    setLoginLoading(true);
    setLoginError(null);

    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
      api.post('/login', loginData)
        .then(res => {
          const token = res.data.access_token;
          localStorage.setItem('auth_token', token);
          localStorage.setItem('login_date', new Date().toDateString());
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setShowLoginModal(false);
          window.location.href = '/dashboard';
        })
        .catch(err => {
          setLoginError(err.response?.data?.message || 'Login failed. Invalid credentials.');
        })
        .finally(() => setLoginLoading(false));
    });
  };

  // Register handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.password_confirmation) {
      return setRegisterError("Passwords do not match");
    }
    if (!termsAccepted) {
      return setRegisterError("You must agree to the Terms and Conditions to register.");
    }

    // Indian GSTIN format validation
    if (registerData.gst_number) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(registerData.gst_number)) {
        return setRegisterError("Invalid GST number. Must be a valid 15-character Indian GSTIN format (e.g., 27AAPCS1234F1Z5).");
      }
    }

    setRegisterLoading(true);
    setRegisterError(null);

    axios.get(`${window.location.origin}/sanctum/csrf-cookie`).then(() => {
      api.post('/register', registerData)
        .then(res => {
          localStorage.setItem('auth_token', res.data.access_token);
          sessionStorage.setItem('just_registered', 'true');
          setShowRegisterModal(false);
          window.location.href = '/dashboard';
        })
        .catch(err => {
          setRegisterError(err.response?.data?.message || 'Registration failed. Try again.');
        })
        .finally(() => setRegisterLoading(false));
    });
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    navigate(`/#${sectionId}`);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div data-theme="dark" style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 0%, #0f1626, #07090e)', 
      color: '#cbd5e1',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. Header (Navbar) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrollPosition > 50 ? 'rgba(21, 28, 44, 0.92)' : 'rgba(11, 15, 25, 0.65)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 24px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <div style={{
              display: 'none',
              background: 'linear-gradient(135deg, var(--primary), #059669)',
              color: 'white',
              padding: '8px',
              borderRadius: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <Package size={22} strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: '#ffffff' }}>Vyapar</span>
              <span style={{ color: '#00a8ff' }}>Sync</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-only">
            <span onClick={() => handleNavClick('features')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.925rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Features</span>
            <span onClick={() => handleNavClick('pricing')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.925rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Pricing</span>
            <span onClick={() => handleNavClick('about')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.925rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>About</span>
            <span onClick={() => handleNavClick('contact')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.925rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Contact</span>
          </nav>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} className="desktop-only">
            {token ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button 
                  onClick={() => { setShowLoginModal(true); setShowRegisterModal(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setShowRegisterModal(true); setShowLoginModal(false); }}
                  className="btn btn-primary" 
                  style={{ padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  Start Trial <Sparkles size={16} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            className="mobile-only"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 73,
          left: 0,
          right: 0,
          background: '#0d1321',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 999,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }} className="mobile-only">
          <span onClick={() => handleNavClick('features')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer' }}>Features</span>
          <span onClick={() => handleNavClick('pricing')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer' }}>Pricing</span>
          <span onClick={() => handleNavClick('about')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer' }}>About</span>
          <span onClick={() => handleNavClick('contact')} style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer' }}>Contact</span>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {token ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '14px', borderRadius: '12px', width: '100%' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '14px', borderRadius: '12px', width: '100%', fontWeight: 'bold' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setShowRegisterModal(true); }}
                  className="btn btn-primary" 
                  style={{ padding: '14px', borderRadius: '12px', width: '100%' }}
                >
                  Start 30-Day Trial
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Page Render Zone (between header and footer) */}
      <main style={{
        minHeight: '80vh',
        paddingTop: '130px',
        paddingBottom: '80px',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        {children}
      </main>

      {/* 3. Footer Section */}
      <footer style={{
        background: '#0b0f19',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '64px 24px 24px',
        color: '#94a3b8'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Main Footer Links Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 40,
            marginBottom: 48
          }}>
            {/* Column 1: Brand Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>VyaparSync</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Advanced Multi-Tenant SaaS solution tailored for retail businesses, wholesalers, and retail building materials counters.
              </p>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                SaaS Version 2.0.4. Active, safe and isolated.
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Features</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <li><span onClick={() => handleNavClick('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Point of Sale (POS)</span></li>
                <li><span onClick={() => handleNavClick('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Smart Inventory Alerts</span></li>
                <li><span onClick={() => handleNavClick('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Customer Credit Udhar</span></li>
                <li><span onClick={() => handleNavClick('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Staff Advance Payroll</span></li>
              </ul>
            </div>

            {/* Column 3: Legal & Corporate */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal & Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <li><Link to="/about-us" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>About Us</Link></li>
                <li><Link to="/contact-us" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Contact Us</Link></li>
                <li><Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corporate Channels</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><Phone size={14} style={{ marginTop: 2, flexShrink: 0 }} /> <span>+91 9169704496</span></li>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><Mail size={14} style={{ marginTop: 2, flexShrink: 0 }} /> <span style={{ wordBreak: 'break-all' }}>support@vynkra.in</span></li>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} /> <span>Mishrapur, Lucknow, UP, IN</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.8rem'
          }}>
            <span>&copy; {new Date().getFullYear()} VyaparSync. All rights reserved.</span>
            <span>
              Powered by <a href="https://vynkra.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Vynkra Technologies</a>
            </span>
          </div>

        </div>
      </footer>

      {/* 9. POPUP MODAL: LOGIN FORM */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '20px',
            width: '95%',
            maxWidth: '440px',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '36px',
            position: 'relative',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: 'var(--text-main)'
          }}>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: 20, right: 20,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#ef4444'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'white', boxShadow: '0 8px 16px rgba(79,70,229,0.2)' }}>
                <Package size={28} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px' }}>VyaparSync</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Management Dashboard Login</p>
            </div>

            {loginError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.825rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Email or Mobile Number</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  placeholder="Enter email or registered mobile"
                  value={loginData.login} 
                  onChange={e => setLoginData({...loginData, login: e.target.value})} 
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("To reset password, please get in touch with Vynkra Technologies support team."); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</a>
                </div>
                <input 
                  type="password" 
                  required 
                  className="form-control" 
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  placeholder="••••••••"
                  value={loginData.password} 
                  onChange={e => setLoginData({...loginData, password: e.target.value})} 
                />
              </div>

              <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, borderRadius: '10px' }}>
                {loginLoading ? 'Verifying credentials...' : 'Sign In Securely'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Need a new SaaS setup?{' '}
                <button 
                  type="button"
                  onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Start 30-Day Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. POPUP MODAL: REGISTER FORM */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '20px',
            width: '95%',
            maxWidth: '520px',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '36px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: 'var(--text-main)'
          }}>
            <button 
              onClick={() => setShowRegisterModal(false)}
              style={{
                position: 'absolute',
                top: 20, right: 20,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#ef4444'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white', boxShadow: '0 8px 16px rgba(79,70,229,0.2)' }}>
                <Package size={28} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px' }}>Register Store</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Start managing your business today.</p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <BadgeCheck size={14} /> 30-Day Trial Period Included
              </div>
            </div>

            {registerError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.825rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={12} /> Store Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Official Business Name (Ex: Apex Store)" 
                    required 
                    value={registerData.shop_name} 
                    onChange={e => setRegisterData({...registerData, shop_name: e.target.value})} 
                  />
                  <select 
                    name="business_type" 
                    className="form-control" 
                    required 
                    value={registerData.business_type} 
                    onChange={e => setRegisterData({...registerData, business_type: e.target.value})}
                  >
                    <option value="" disabled>Select Type of Business</option>
                    <option value="Hardware / Building Materials">Hardware / Building Materials</option>
                    <option value="Electronics / Mobile Shop">Electronics / Mobile Shop</option>
                    <option value="Grocery / Supermarket">Grocery / Supermarket</option>
                    <option value="Clothing / Garments">Clothing / Garments</option>
                    <option value="Services / General">Services / General</option>
                  </select>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="GST Number (Optional)" 
                    value={registerData.gst_number} 
                    onChange={e => setRegisterData({...registerData, gst_number: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} /> Owner Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Your Full Name" 
                    required 
                    value={registerData.name} 
                    onChange={e => setRegisterData({...registerData, name: e.target.value})} 
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Email Address" 
                      required 
                      value={registerData.email} 
                      onChange={e => setRegisterData({...registerData, email: e.target.value})} 
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Mobile Number" 
                      required 
                      value={registerData.mobile} 
                      onChange={e => setRegisterData({...registerData, mobile: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={12} /> Account Security
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Password" 
                    required 
                    minLength={8} 
                    value={registerData.password} 
                    onChange={e => setRegisterData({...registerData, password: e.target.value})} 
                  />
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Confirm Password" 
                    required 
                    minLength={8} 
                    value={registerData.password_confirmation} 
                    onChange={e => setRegisterData({...registerData, password_confirmation: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="termsCheck"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: 4, cursor: 'pointer' }}
                />
                <label htmlFor="termsCheck" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer', margin: 0 }}>
                  I have read and agree to the <a href="/terms" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms and Conditions</a>, including the strict no-refund policy.
                </label>
              </div>

              <button type="submit" disabled={registerLoading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {registerLoading ? 'Setting up your store...' : <>Register Store <UserPlus size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Sign In Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicLayout;
