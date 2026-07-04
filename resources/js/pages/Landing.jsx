import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { openWhatsApp } from '../utils/webview';
import api from '../utils/api';
import Swal from 'sweetalert2';
import {
  Package,
  ShoppingCart,
  Users,
  FileText,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Layers,
  Languages,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
  Play,
  ArrowUpRight,
  HelpCircle,
  Menu,
  X,
  User,
  UserPlus,
  Store,
  ShieldCheck as ShieldIcon,
  BadgeCheck
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const [activeTab, setActiveTab] = useState('billing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Modal control states
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

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_expired') === '1') {
      setShowLoginModal(true);
      setLoginError("Your session has expired. Please sign in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      const payload = { ...loginData };
      payload.device_type = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform() ? 'mobile' : 'browser';

      api.post('/login', payload)
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
          setRegisterError(err.response?.data?.message || 'Registration error. Verify inputs.');
        })
        .finally(() => setRegisterLoading(false));
    });
  };

  // Contact Form handler
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus(null);
    api.post('/contact', contactForm)
      .then(res => {
        setContactStatus({ success: true, message: res.data.message });
        setContactForm({ name: '', email: '', message: '' });
      })
      .catch(err => {
        setContactStatus({
          success: false,
          message: err.response?.data?.message || 'Failed to send enquiry. Please contact support directly.'
        });
      })
      .finally(() => setContactLoading(false));
  };

  return (
    <div style={{
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      minHeight: '100vh',
      overflowX: 'hidden',
      transition: 'background 0.3s, color 0.3s'
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
          {/* Logo & Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <div style={{
              display: 'none',
              background: 'linear-gradient(135deg, var(--primary), #b8962d)',
              color: 'white',
              padding: '8px',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}>
              <Package size={22} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#ffffff' }}>Vyapar</span>
                <span style={{ color: 'var(--primary)' }}>Sync</span>
              </span>
              <span style={{ fontSize: '0.6rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                BY VYNKRA
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hide-on-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}>
            <span onClick={() => scrollToSection('features')} style={{ color: '#cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Features</span>
            <span onClick={() => scrollToSection('pricing')} style={{ color: '#cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Pricing</span>
            <span onClick={() => scrollToSection('about')} style={{ color: '#cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>About Us</span>
            <span onClick={() => scrollToSection('contact')} style={{ color: '#cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Contact</span>
          </nav>

          {/* Header Action Buttons */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {token ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => { setShowLoginModal(true); setShowRegisterModal(false); }}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', padding: '10px 16px', borderRadius: '8px', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 4
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(11, 15, 25, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: '0 20px 25px rgba(0,0,0,0.5)'
          }}>
            <span onClick={() => scrollToSection('features')} style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem' }}>Features</span>
            <span onClick={() => scrollToSection('pricing')} style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem' }}>Pricing</span>
            <span onClick={() => scrollToSection('about')} style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem' }}>About Us</span>
            <span onClick={() => scrollToSection('contact')} style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem' }}>Contact</span>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>

            {token ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '14px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center' }}>
                Go to Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                  style={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 600, cursor: 'pointer' }}
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
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section style={{
        padding: '160px 24px 80px',
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.15), transparent 60%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>

          {/* Animated Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#818cf8',
            padding: '8px 16px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 32,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <Sparkles size={16} color="#818cf8" /> Enterprise Store Control & BarcodePOS
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'calc(2.2rem + 1.8vw)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 auto 24px',
            color: '#fff'
          }}>
            Simplifying retail operations with <span style={{ background: 'linear-gradient(95deg, var(--primary) 10%, #d4af37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Automation</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'calc(0.95rem + 0.25vw)',
            color: 'var(--text-muted)',
            maxWidth: '750px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Supercharge your store workflows: lightning-fast billing, smart low-stock alerts, customer credit ledgers (Udhar), and custom PDF quotations in a single blazing-fast multitenant system.
          </p>

          {/* Call to Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 64
          }}>
            {token ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '16px 36px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                Open Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="btn btn-primary"
                  style={{ padding: '16px 36px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  Start 30-Day Trial <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn"
                  style={{
                    padding: '16px 36px',
                    borderRadius: '12px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
                >
                  Sign In Securely
                </button>
              </>
            )}
          </div>

          {/* Beautiful Dashboard Visual Mockup */}
          <div style={{
            position: 'relative',
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'rgba(21, 28, 44, 0.45)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '16px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}>
            {/* Platform Preview Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingLeft: 8, paddingRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Platform Dashboard Preview
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Interactive Illustration</span>
            </div>

            {/* Simulated Live Dashboard Panels */}
            <div style={{
              background: '#0b0f19',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'left'
            }}>

              {/* Mock Dashboard Headers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Apex store</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management Dashboard Overview</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ background: '#ecfdf5', color: '#b8962d', fontSize: '0.75rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }}></div> Active trial: 28 days left
                  </div>
                </div>
              </div>

              {/* Mock Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20,
                marginBottom: 32
              }}>
                <div style={{ background: '#151c2c', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Today's Revenue</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>₹48,950</div>
                  <span style={{ color: '#d4af37', fontSize: '0.75rem', fontWeight: 600 }}>↑ 18.2% from yesterday</span>
                </div>
                <div style={{ background: '#151c2c', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Estimated Profit</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: '#d4af37' }}>₹11,480</div>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Margin: ~23.4%</span>
                </div>
                <div style={{ background: '#151c2c', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div> Critical Restock
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>4 Products</div>
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Action Required</span>
                </div>
                <div style={{ background: '#151c2c', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ color: '#eab308', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Outstanding Credit (Udhar)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: '#eab308' }}>₹32,600</div>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>14 Active Customers</span>
                </div>
              </div>

              {/* Bottom Mock Split: POS Billing Preview & Stock Alerts */}
              <div className="responsive-mock-grid">

                {/* Simulated billing cart */}
                <div style={{ background: '#151c2c', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Point of Sale Terminal</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: 8, fontSize: '0.85rem' }}>
                      <div>
                        <strong>Ultratech Cement (50kg)</strong>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Quantity: 10 bags × ₹420</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>₹4,200.00</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: 8, fontSize: '0.85rem' }}>
                      <div>
                        <strong>Finolex 2.5sqmm Wire (Red)</strong>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Quantity: 2 rolls × ₹1,850</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>₹3,700.00</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, fontSize: '0.85rem' }}>
                      <div>
                        <strong>TATA Tiscon 12mm Rebar</strong>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Quantity: 15 rods × ₹620</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>₹9,300.00</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '2px solid rgba(255,255,255,0.1)', marginTop: 12, paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
                      <span style={{ color: '#9ca3af' }}>Subtotal:</span>
                      <span>₹17,200.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 12 }}>
                      <span style={{ color: '#9ca3af' }}>GST (18%):</span>
                      <span>₹3,096.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#d4af37' }}>
                      <span>Net Payable:</span>
                      <span>₹20,296.00</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Stock Alerts */}
                <div style={{ background: '#151c2c', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Warnings</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Asian Paints Apex White (20L)</div>
                        <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Only 1 bucket left (Min: 5)</div>
                      </div>
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>Restock</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Supreme PVC Elbow 3"</div>
                        <div style={{ fontSize: '0.7rem', color: '#fde047' }}>12 pcs left (Min: 50)</div>
                      </div>
                      <span style={{ background: '#d97706', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>Low</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                    💡 Dashboard alerts update instantly as staff run POS bills.
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Core Stats Metrics Strip */}
      <section style={{
        background: '#151c2c',
        borderY: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30,
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>99.9%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Cloud Server Uptime SLA</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d4af37' }}>45%+</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Reduction in Credit (Udhar) Leakage</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#818cf8' }}>Zero</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Manual Stock Audit Stress Hours</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ec4899' }}>100%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Multi-Tenant Database Isolation</div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid Section */}
      <section id="features" style={{
        padding: '100px 24px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 12 }}>Packed with Professional Grade Features</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              We've engineered every feature from the ground up to solve real operational bottlenecks faced by local retail merchants.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 30
          }}>
            {/* Feature 1 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>1. Lightning-Fast POS Billing</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Run your storefront smoothly. Create tax invoices, apply discounts, search products instantly by name or barcode, and handle splits between cash, card, and UPI payment methods.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>2. Smart Inventory & Stock Control</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Prevent lost sales. Tracking minimum threshold quantities logs warning badges on your dashboard. Filter low stock items instantly to auto-generate supplier procurement sheets.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>3. Customer Credit (Udhar) Ledger</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  No more manually paging through paper notebooks (Bahi Khata). Log customer outstanding balances, credit terms, partial repayments, and retrieve contact sheets for collections.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>4. Professional Quotations</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Generate professional-grade cost estimates for bulk projects. Quotations can be printed, downloaded as PDFs, or instantly converted into active sales invoices upon customer approval.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>5. Staff Salaries & Advances</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Track employee attendance, process net monthly salaries, log advance payouts, and manage employee files. Prevents errors or redundancies during payroll disbursements.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>6. In-Depth Accounting Reports</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Know your numbers. Automated analytical frameworks display 6-month revenues, gross profit margins, payment method summaries, and category performance rankings.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4.5 Interactive Product Screenshot Gallery */}
      <section style={{
        padding: '80px 24px',
        background: 'rgba(11, 15, 25, 0.4)',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: 16
            }}>
              <Sparkles size={14} /> LIVE APEX STORE SCREENSHOTS
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Explore Our High-Performance UI</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
              Take a detailed look at the interface designed to streamline your storefront, billing, inventory, and localization workflows.
            </p>
          </div>

          {/* Gallery Tabs Nav */}
          <div className="responsive-gallery-tabs">
            {[
              { id: 'billing', label: 'POS Billing & Quotation', icon: <ShoppingCart size={18} /> },
              { id: 'product', label: 'Product Creation', icon: <Package size={18} /> },
              { id: 'supplier', label: 'Supplier Ledgers', icon: <Users size={18} /> },
              { id: 'language', label: 'Hindi / Native Toggle', icon: <Languages size={18} /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="responsive-gallery-tab-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, var(--primary), #b8962d)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 10px 20px rgba(212, 175, 55, 0.25)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Tab Showcase Content */}
          <div className="responsive-showcase-grid">

            {/* Left Column: Descriptive Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeTab === 'billing' && (
                <>
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#818cf8', padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>POINT OF SALE TERMINAL</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>High Speed Billing & Quotations</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Our POS module is optimized for keyboard or barcode scanning speeds. Instantly parse cement, wiring, piping and fittings catalog items, calculate exact local GST (CGST/SGST), and apply discounts on the fly.
                  </p>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Generate detailed estimations or quotations with a single tap, download them as clean, professional business PDFs, and convert them to active tax invoices instantly once approved!
                  </p>
                </>
              )}

              {activeTab === 'product' && (
                <>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>CATALOG MANAGER</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>Smooth Product Catalog Setup</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Populate your business's inventory catalog effortlessly. Add brand manufacturers, tax classes, barcode references, raw buy-in rates, custom selling prices, and category tags.
                  </p>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Enable smart threshold indicators: you can set custom alert quantities on every single item. When quantities fall below that mark, glowing red badges dynamically trigger on your dashboard.
                  </p>
                </>
              )}

              {activeTab === 'supplier' && (
                <>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>LEDGER & ACCOUNTS</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>Procurements & Supplier Ledgers</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Maintain crystal-clear accounts with wholesale suppliers and manufacturing plants. Record incoming inventory bills, credit periods, payment records (cash, bank transfer), and outstanding balances.
                  </p>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Instantly pull transaction histories and ledger charts. Track every single penny and eliminate errors in supplier balances or duplicate payment disbursements.
                  </p>
                </>
              )}

              {activeTab === 'language' && (
                <>
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>LOCALIZATION SETTING</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>Multi-language & Hindi Translation</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    Bridge the operational gap with native languages. In one click, business managers and storefront billing operators can translate the entire system interface into Hindi or other native vernaculars.
                  </p>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                    This native localized toggle makes training your store attendants, billing assistants, and warehouse packers incredibly fast and completely effortless!
                  </p>
                </>
              )}
            </div>

            {/* Right Column: Visual UI Mockup Screenshot */}
            <div className="responsive-showcase-img-container">
              {activeTab === 'billing' && <img src="/images/billing_quotation.png" alt="POS Billing Terminal UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }} />}
              {activeTab === 'product' && <img src="/images/product_creation.png" alt="Product Setup Screen UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }} />}
              {activeTab === 'supplier' && <img src="/images/supplier_creation.png" alt="Supplier Accounts Ledger UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }} />}
              {activeTab === 'language' && <img src="/images/language_change.png" alt="Native Language Localization Switcher UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }} />}
            </div>

          </div>

        </div>
      </section>

      {/* 5. Subscriptions / Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 24px',
        background: 'rgba(21, 28, 44, 0.45)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Subscription Plans</div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Simple, Highly Transparent Pricing</h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Start with a 30-day evaluation trial, then upgrade to a commercial plan that aligns with your store's footprint.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Plan 1: Trial */}
            <div className="pricing-card" style={{
              background: 'rgba(21, 28, 44, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              transition: 'all 0.3s'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#d4af37', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>30-Day Trial</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 16, marginBottom: 8, color: '#fff' }}>Evaluation</h3>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>₹0</span>
                  <span style={{ color: '#94a3b8' }}>/ for 30 days</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}><Store size={16} color="#d4af37" /> 1 Shop & 1 User</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#d4af37" /> Billing, Inventory & Customers</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#d4af37" /> Maximum 100 invoices/mo</div>
                </div>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', marginTop: 24, fontWeight: 'bold', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}
              >
                Start Trial
              </button>
            </div>

            {/* Plan 2: Starter */}
            <div className="pricing-card" style={{
              background: 'rgba(21, 28, 44, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              transition: 'all 0.3s'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>Starter</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 16, marginBottom: 8, color: '#fff' }}>Small Business</h3>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>₹999</span>
                  <span style={{ color: '#94a3b8' }}>/ year</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}><Store size={16} color="#3b82f6" /> 1 Shop & 2 Users</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#3b82f6" /> Unlimited Invoices</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#3b82f6" /> GST Reports & WhatsApp Sharing</div>
                </div>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', marginTop: 24, fontWeight: 'bold', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}
              >
                Get Starter
              </button>
            </div>

            {/* Plan 3: Business */}
            <div className="pricing-card" style={{
              background: 'rgba(21, 28, 44, 0.65)',
              border: '2px solid var(--primary)',
              borderRadius: '20px',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(212, 175, 55, 0.15)',
              color: '#ffffff',
              transition: 'all 0.3s'
            }}>
              <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>Recommended</div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(212, 175, 55, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>Business</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 16, marginBottom: 8, color: '#fff' }}>Growing Team</h3>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>₹2,499</span>
                  <span style={{ color: '#94a3b8' }}>/ year</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}><Store size={16} color="var(--primary)" /> 1 Shop & 5 Users</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="var(--primary)" /> Staff Management (Max 25)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="var(--primary)" /> Attendance, Salary & Expenses</div>
                </div>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', marginTop: 24, fontWeight: 'bold', cursor: 'pointer' }}
              >
                Get Business
              </button>
            </div>

            {/* Plan 4: Enterprise */}
            <div className="pricing-card" style={{
              background: 'rgba(21, 28, 44, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              transition: 'all 0.3s'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>Enterprise</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 16, marginBottom: 8, color: '#fff' }}>Max Control</h3>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>₹4,999</span>
                  <span style={{ color: '#94a3b8' }}>/ year</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}><Store size={16} color="#f59e0b" /> Unlimited Shops & Users</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#f59e0b" /> Role & Branch Management</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#cbd5e1' }}><CheckCircle2 size={16} color="#f59e0b" /> API Access & AI Features</div>
                </div>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', marginTop: 24, fontWeight: 'bold', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}
              >
                Get Enterprise
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 6. About Us Segment */}
      <section id="about" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #b8962d)', width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#fff', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.2)' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 16 }}>Our Commitment & Vision</h2>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: 24 }}>
            Built by the retail and SaaS engineering team at <strong>Vynkra Technologies</strong>, our VyaparSync was created after observing first-hand the daily hurdles of traditional retail operationsers. Small businesses struggle with complicated desktop-only tools, manual stock counting, and lost credit ledger notes.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
            Our mission is simple: deliver high-performance, web-based, multi-tenant billing solutions that require zero IT expertise to operate. Your business ledger is securely backed up, completely private, and running on robust modern standards.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Link to="/about-us" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              Read More About Our Tech Stack <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Contact Us Form / Support Segment */}
      <section id="contact" style={{
        padding: '100px 24px',
        background: 'rgba(21, 28, 44, 0.45)',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--text-main)', marginBottom: 12 }}>Need Help or Custom Integration?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>The Vynkra Technologies customer success squad is standing by to help your business transition seamlessly.</p>
          </div>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 40 }}>

            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 700 }}>Direct Help Channels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: 12, borderRadius: 12 }}>
                    <Phone size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Phone Support (India)</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>+91 9169704496</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: 12, borderRadius: 12 }}>
                    <Mail size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Email Infrastructure</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>support@vynkra.in</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: 12, borderRadius: 12 }}>
                    <MapPin size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Head Office Location</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>Mishrapur, Lucknow, UP, India, 226026</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1.5, minWidth: 320, background: 'var(--surface)', padding: '32px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email address"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Message / Enquiry</label>
                  <textarea
                    className="form-control"
                    placeholder="Describe your query or store migration support needs..."
                    style={{ height: 100, resize: 'none' }}
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                {contactStatus && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    background: contactStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: contactStatus.success ? '#d4af37' : '#fca5a5',
                    border: `1px solid ${contactStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontWeight: 600
                  }}>
                    {contactStatus.message}
                  </div>
                )}

                <button type="submit" disabled={contactLoading} className="btn btn-primary" style={{ padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {contactLoading ? 'Sending Inquiry...' : 'Send Message'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Footer Section with all other links */}
      <footer style={{
        background: '#0b0f19',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '64px 24px 24px',
        color: 'var(--text-muted)'
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
                <div style={{ background: 'linear-gradient(135deg, var(--primary), #b8962d)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}><span style={{ color: '#ffffff' }}>Vyapar</span><span style={{ color: 'var(--primary)' }}>Sync</span></span>
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
                <li><span onClick={() => scrollToSection('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Point of Sale (POS)</span></li>
                <li><span onClick={() => scrollToSection('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Smart Inventory Alerts</span></li>
                <li><span onClick={() => scrollToSection('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Customer Credit Udhar</span></li>
                <li><span onClick={() => scrollToSection('features')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Staff Advance Payroll</span></li>
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
            {/* Close Button */}
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

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), #b8962d)', width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'white', boxShadow: '0 8px 16px rgba(212, 175, 55,0.2)' }}>
                <Package size={28} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px' }}><span style={{ color: '#2c3642ff' }}>Vyapar</span><span style={{ color: 'var(--primary)' }}>Sync</span></h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Management Dashboard Login</p>
            </div>

            {/* Error alerts */}
            {loginError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.825rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            {/* Form */}
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
                  onChange={e => setLoginData({ ...loginData, login: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire("To reset password, please get in touch with Vynkra Technologies support team."); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</a>
                </div>
                <input
                  type="password"
                  required
                  className="form-control"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
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
            {/* Close Button */}
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

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), #b8962d)', width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white', boxShadow: '0 8px 16px rgba(212, 175, 55,0.2)' }}>
                <Package size={28} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px' }}>Register Store</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Start managing your business today.</p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#d4af37', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <BadgeCheck size={14} /> 30-Day Trial Period Included
              </div>
            </div>

            {/* Error alerts */}
            {registerError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.825rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                {registerError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegisterSubmit}>
              {/* Section: Business Details */}
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
                    onChange={e => setRegisterData({ ...registerData, shop_name: e.target.value })}
                  />
                  <select
                    name="business_type"
                    className="form-control"
                    required
                    value={registerData.business_type}
                    onChange={e => setRegisterData({ ...registerData, business_type: e.target.value })}
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
                    onChange={e => setRegisterData({ ...registerData, gst_number: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  />
                </div>
              </div>

              {/* Section: Personal Info */}
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
                    onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email Address"
                      required
                      value={registerData.email}
                      onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mobile Number"
                      required
                      value={registerData.mobile}
                      onChange={e => setRegisterData({ ...registerData, mobile: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Security */}
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
                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm Password"
                    required
                    minLength={8}
                    value={registerData.password_confirmation}
                    onChange={e => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                  />
                </div>
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
      {/* Floating WhatsApp Button */}
      <div 
        onClick={() => openWhatsApp('918924074096', 'Hello VyaparSync! I would like to know more.')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 9999,
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.882-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
        </svg>
      </div>

    </div>
  );
};

export default Landing;
