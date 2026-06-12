import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Receipt, LogOut, Settings as SettingsIcon, Banknote, Languages, Lock, Shield, Menu, X, Truck, AlertTriangle, Sun, Moon, ClipboardList, Info, HelpCircle, Compass, Building, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import OnboardingTour from './OnboardingTour';

import Swal from 'sweetalert2';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Inventory', icon: Package, 
      subItems: [
        { name: 'Products & Stock', path: '/products' },
        { name: 'Damaged & Wastage', path: '/damaged-goods' },
        { name: 'Suppliers', path: '/suppliers' },
      ]
    },
    { 
      name: 'Sales & Billing', icon: ShoppingCart, 
      subItems: [
        { name: 'Point of Sale', path: '/billing' },
        { name: 'Quotations', path: '/quotations' },
        { name: 'Bill History', path: '/bills' },
        { name: 'Customers', path: '/customers' },
      ]
    },
    { 
      name: 'Management', icon: Users, 
      subItems: [
        { name: 'Staff', path: '/staff' },
        { name: 'Attendance', path: '/attendance' },
        { name: 'Advances', path: '/advances' },
        { name: 'Expenses', path: '/expenses' },
        { name: 'Branches', path: '/child-businesses' },
      ]
    },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    {
      name: 'Help & Info', icon: Info,
      subItems: [
        { name: 'About Us', path: '/about-us' },
        { name: 'Contact Us', path: '/contact-us' },
        { name: 'Product Tour', action: 'tour' }
      ]
    }
  ];

  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'dark');
  const [showTour, setShowTour] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('pending');
  const [openCategories, setOpenCategories] = useState({
    'Inventory': false,
    'Sales & Billing': false,
    'Management': false
  });
  const profileRef = useRef(null);

  const toggleCategory = (catName) => {
    setOpenCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const handleStartTour = () => {
    localStorage.removeItem('onboarding_complete');
    setIsMobileMenuOpen(false);
    setShowTour(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Check if session date is valid (expires at 12 AM daily)
    const loginDate = localStorage.getItem('login_date');
    if (loginDate && loginDate !== new Date().toDateString()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('login_date');
        window.location.href = '/login?session_expired=1';
        return;
    }

    api.get('/settings').then(res => {
      setSettings(res.data);
      if (res.data && res.data.domain && window.location.hostname !== res.data.domain) {
         const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
         if (!isLocal) {
            window.location.href = `https://${res.data.domain}${window.location.pathname}`;
         }
      }
    }).catch(console.error);
    
    api.get('/me')
      .then(res => {
        setUser(res.data);
        if (res.data.role === 'staff') {
          fetchAttendanceStatus();
        }
        if (!localStorage.getItem('onboarding_complete')) {
          setShowTour(true);
        }
      })
      .catch(console.error)
      .finally(() => setAuthLoading(false));
  }, []);

  const [locationLoading, setLocationLoading] = useState(false);

  const fetchAttendanceStatus = () => {
    api.get('/attendance/status')
      .then(res => setAttendanceStatus(res.data.status))
      .catch(console.error);
  };

  const handleClockIn = () => {
    if (!navigator.geolocation) {
      Swal.fire('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        api.post('/attendance/clock-in', { latitude, longitude })
          .then(() => fetchAttendanceStatus())
          .catch(err => Swal.fire(err.response?.data?.message || 'Error clocking in.'))
          .finally(() => setLocationLoading(false));
      },
      (error) => {
        setLocationLoading(false);
        Swal.fire('You must allow location access to clock in.');
      }
    );
  };

  const handleClockOut = () => {
    if (!navigator.geolocation) {
      Swal.fire('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        api.post('/attendance/clock-out', { latitude, longitude })
          .then(() => fetchAttendanceStatus())
          .catch(err => Swal.fire(err.response?.data?.message || 'Error clocking out.'))
          .finally(() => setLocationLoading(false));
      },
      (error) => {
        setLocationLoading(false);
        Swal.fire('You must allow location access to clock out.');
      }
    );
  };

  // ✅ This useEffect must be ABOVE any early returns to follow the Rules of Hooks
  useEffect(() => {
    if (user && user.role === 'staff') {
      const perms = user.permissions || {};
      const allowedPaths = ['/billing', '/quotations', '/bills', '/privacy-policy', '/terms', '/about-us', '/contact-us', '/attendance'];
      
      if (perms.can_manage_inventory) {
        allowedPaths.push('/products');
        allowedPaths.push('/suppliers');
      }
      
      if (location.pathname !== '/' && !allowedPaths.some(p => location.pathname.startsWith(p))) {
        navigate('/billing', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: "Are you sure you want to log out?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        api.post('/logout').catch(console.error).finally(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('login_date');
          window.location.href = '/login';
        });
      }
    });
  };

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', gap: 20 }}>
         <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid rgba(212,175,55,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <img src="/logo.jpg" alt="VyaparSync Logo" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
         </div>
         <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Restoring secure session...</div>
      </div>
    );
  }

  let allNavItems = [...navItems];
  if (user && user.role === 'staff') {
    const perms = user.permissions || {};
    const allowed = ['/billing', '/quotations', '/bills', '/about-us', '/contact-us', '/attendance'];
    if (perms.can_manage_inventory) {
      allowed.push('/products');
      allowed.push('/suppliers');
    }

    allNavItems = navItems.map(item => {
      if (item.subItems) {
        const filteredSubs = item.subItems.filter(sub => allowed.includes(sub.path) || sub.action === 'tour');
        if (filteredSubs.length > 0) return { ...item, subItems: filteredSubs };
        return null;
      }
      return allowed.includes(item.path) ? item : null;
    }).filter(Boolean);
  }
  if (user && (user.is_super_admin === true || user.is_super_admin == 1)) {
    allNavItems.push({ name: 'Super Admin', path: '/super-admin', icon: Shield });
  }

  // Filter out features based on plan limits
  if (settings && settings.plan_limits && settings.plan_limits.features) {
    const features = settings.plan_limits.features;
    allNavItems = allNavItems.map(item => {
      if (item.name === 'Inventory') {
        let subs = [...item.subItems];
        if (!features.includes('damaged_goods')) {
          subs = subs.filter(s => s.name !== 'Damaged & Wastage');
        }
        return { ...item, subItems: subs };
      }
      
      if (item.name === 'Management') {
        let subs = [...item.subItems];
        if (!features.includes('staff_management')) {
          subs = subs.filter(s => s.name !== 'Staff' && s.name !== 'Advances');
        }
        if (!features.includes('attendance')) {
          subs = subs.filter(s => s.name !== 'Attendance');
        }
        if (!features.includes('expense_tracking')) {
          subs = subs.filter(s => s.name !== 'Expenses');
        }
        if (settings.plan_limits.shops === 1) { // If max shops is 1, no branches
          subs = subs.filter(s => s.name !== 'Branches');
        }
        if (subs.length === 0) return null;
        return { ...item, subItems: subs };
      }
      return item;
    }).filter(Boolean);
  }



  return (
    <div className="app-container">
      {/* Onboarding Tour Overlay */}
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} user={user} />}
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', padding: '10px', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
               <Package size={26} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: '1.2', letterSpacing: '0.02em', wordBreak: 'break-word' }}>
                 {settings?.company_name ? (
                   <span style={{ color: '#ffffff' }}>{settings.company_name}</span>
                 ) : (
                   <>
                     <span style={{ color: '#ffffff' }}>Vyapar</span>
                     <span style={{ color: '#00a8ff' }}>Sync</span>
                   </>
                 )}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 3 }}>
                 Management System
              </span>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 8,
              borderRadius: '50%',
              marginLeft: 'auto'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'none' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="nav-links">
          {allNavItems.map((item) => (
            <React.Fragment key={item.name}>
              {item.subItems ? (
                <>
                  <div 
                    className="nav-item" 
                    onClick={() => toggleCategory(item.name)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', paddingRight: '12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <item.icon size={20} />
                      {item.name}
                    </div>
                    {openCategories[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  {openCategories[item.name] && (
                    <div style={{ paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', marginBottom: '6px' }}>
                      {item.subItems.map(sub => {
                        if (sub.action === 'tour') {
                          return (
                            <button
                              key="tour"
                              onClick={() => { setIsMobileMenuOpen(false); handleStartTour(); }}
                              className="nav-item"
                              style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%', textAlign: 'left', background: 'transparent', color: '#a78bfa', border: 'none', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
                            >
                              <Compass size={16} /> {sub.name}
                            </button>
                          );
                        }
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`nav-item ${location.pathname.startsWith(sub.path) ? 'active' : ''}`}
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          >
                            {sub.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  key={item.path || item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  {item.name}
                </NavLink>
              )}
            </React.Fragment>
          ))}

          <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}></div>

        </nav>

        {/* Sidebar profile removed — profile lives in topbar header only */}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar d-flex justify-content-between align-items-center" style={{ zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'none' }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              {allNavItems.find(item => location.pathname.startsWith(item.path))?.name || (
                <span style={{ color: 'var(--primary)', letterSpacing: '-0.3px' }}>VyaparSync</span>
              )}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {user?.role === 'staff' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
                    {attendanceStatus === 'pending' && (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={handleClockIn} disabled={locationLoading}>
                        {locationLoading ? 'Locating...' : 'Clock In'}
                      </button>
                    )}
                    {attendanceStatus === 'clocked_in' && (
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleClockOut} disabled={locationLoading}>
                        {locationLoading ? 'Locating...' : 'Clock Out'}
                      </button>
                    )}
                    {attendanceStatus === 'clocked_out' && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shift Ended</span>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={toggleTheme} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--text-muted)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: 8,
                    borderRadius: '50%',
                    marginRight: 8
                  }}
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button 
                   onClick={() => navigate('/privacy-policy')}
                   className="hide-on-mobile"
                   style={{ 
                     background: 'none', 
                     border: 'none', 
                     cursor: 'pointer', 
                     color: 'var(--text-muted)', 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 6,
                     padding: '8px 12px',
                     borderRadius: 8,
                     fontSize: '0.9rem',
                     fontWeight: 600,
                     marginRight: 12
                   }}
                >
                  <Shield size={18} /> Privacy
                </button>

              {/* ── Unified Profile Button (Desktop + Mobile) ── */}
              <div ref={profileRef} style={{ position: 'relative' }}>

                {/* Desktop trigger: avatar + name */}
                <div
                  className="hide-on-mobile"
                  onClick={() => setShowProfileMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '5px 10px', borderRadius: 12, transition: 'background 0.2s', background: showProfileMenu ? 'var(--surface-hover)' : 'transparent' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = showProfileMenu ? 'var(--surface-hover)' : 'transparent'}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2, color: '#ffffff' }}>{user?.name || 'Admin'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>{user?.is_super_admin ? 'Super Admin' : (user?.role === 'staff' ? 'Cashier / Staff' : 'Business Manager')}</div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,168,255,0.4)', flexShrink: 0 }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <ChevronDown size={15} color="#fff" style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>

                {/* Mobile trigger: avatar only */}
                <div
                  className="show-on-mobile"
                  onClick={() => setShowProfileMenu(v => !v)}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,168,255,0.4)' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>

                {/* Dropdown — shared for both desktop and mobile */}
                {showProfileMenu && (
                  <div style={{
                    position: 'fixed',
                    top: 70,
                    right: 16,
                    width: 240,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    animation: 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)'
                  }}>

                    {/* Header */}
                    <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(0,168,255,0.12), rgba(5,150,105,0.08))', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,168,255,0.35)' }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{user?.name || 'Admin User'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{user?.is_super_admin ? '⚡ Super Admin' : (user?.role === 'staff' ? '👤 Cashier / Staff' : '🏪 Business Manager')}</div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: '8px 0' }}>

                      {(user?.is_super_admin === true || user?.is_super_admin == 1) && (
                        <button
                          onClick={() => { setShowProfileMenu(false); navigate('/super-admin'); }}
                          className="profile-menu-item"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        >
                          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={15} color="#6c63ff" /></span>
                          Super Admin Panel
                        </button>
                      )}

                      {user?.role !== 'staff' && (
                        <button
                          onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                          className="profile-menu-item"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,168,255,0.07)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        >
                          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,168,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><SettingsIcon size={15} color="var(--primary)" /></span>
                          Settings
                        </button>
                      )}

                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/change-password'); }}
                        className="profile-menu-item"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.color = 'var(--success)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-main)'; }}
                      >
                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Lock size={15} color="var(--success)" /></span>
                        Change Password
                      </button>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'var(--border)', margin: '6px 18px' }} />

                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/privacy-policy'); }}
                        className="profile-menu-item"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={13} color="var(--text-muted)" /></span>
                        Privacy Policy
                      </button>

                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/terms'); }}
                        className="profile-menu-item"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={13} color="var(--text-muted)" /></span>
                        Terms & Conditions
                      </button>

                      {/* Divider before logout */}
                      <div style={{ height: 1, background: 'var(--border)', margin: '6px 18px' }} />

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          Swal.fire({
                            title: 'Logout',
                            text: 'Are you sure you want to log out?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, logout'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              api.post('/logout').catch(console.error).finally(() => {
                                localStorage.removeItem('auth_token');
                                localStorage.removeItem('login_date');
                                window.location.href = '/';
                              });
                            }
                          });
                        }}
                        className="profile-menu-item"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogOut size={15} color="var(--danger)" /></span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </header>

        <div className="content-area">
          {settings && settings.is_expired && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: 'var(--danger)', 
              padding: '12px 20px', 
              borderRadius: 8, 
              marginBottom: 24, 
              fontWeight: 600, 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertTriangle size={20} />
              <div style={{ flex: 1 }}>Action Restricted Mode: This trial/subscription has expired. Data can only be reviewed.</div>
              {user?.role !== 'staff' && <button onClick={() => navigate('/settings')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Renew Plan</button>}
            </div>
          )}
          
          {settings && !settings.is_expired && settings.trial_days_remaining !== undefined && settings.subscription_plan !== 'full_time' && (
            (settings.subscription_plan === 'monthly' || settings.subscription_plan === 'yearly') ? (
              settings.trial_days_remaining <= 30 && (
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.15)', 
                  color: 'var(--warning)', 
                  padding: '12px 20px', 
                  borderRadius: 8, 
                  marginBottom: 24, 
                  fontWeight: 600, 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <AlertTriangle size={20} />
                  <div style={{ flex: 1 }}>Subscription Renewal: Your {settings.subscription_plan} plan will expire in {settings.trial_days_remaining} days.</div>
                  {user?.role !== 'staff' && <button onClick={() => navigate('/settings')} className="btn" style={{ background: 'var(--warning)', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Renew Now</button>}
                </div>
              )
            ) : (
              settings.trial_days_remaining <= 30 && (
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.15)', 
                  color: 'var(--warning)', 
                  padding: '12px 20px', 
                  borderRadius: 8, 
                  marginBottom: 24, 
                  fontWeight: 600, 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <AlertTriangle size={20} />
                  <div style={{ flex: 1 }}>Demo Plan: You have {settings.trial_days_remaining} days remaining on your trial.</div>
                  {user?.role !== 'staff' && <button onClick={() => navigate('/settings')} className="btn" style={{ background: 'var(--warning)', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Renew Now</button>}
                </div>
              )
            )
          )}
          {user?.role === 'staff' && attendanceStatus !== 'clocked_in' && !(
             ['/attendance', '/privacy-policy', '/terms', '/about-us', '/contact-us',
              ...(attendanceStatus === 'clocked_out' ? ['/billing', '/quotations'] : [])
             ].some(p => location.pathname.startsWith(p))
          ) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', padding: 20 }}>
              <AlertTriangle size={64} color="var(--warning)" style={{ marginBottom: 20 }} />
              <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>
                {attendanceStatus === 'clocked_out' ? 'Shift Ended' : 'Shift Not Started'}
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 500 }}>
                {attendanceStatus === 'clocked_out' 
                  ? 'Your shift for today has ended. You can still view your attendance history, privacy policy, terms, and continue to create new Bills or Quotations from the sidebar.' 
                  : <>You must clock in to access the system and perform operations. Please click the <strong>Clock In</strong> button in the top bar.</>}
              </p>
            </div>
          ) : (
            children
          )}
          
          {!['/billing', '/quotations/create'].includes(location.pathname) && (
            <footer style={{ 
              marginTop: 40, 
              padding: '20px 0', 
              borderTop: '1px solid var(--border)', 
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 }}>
                <span>&copy; {new Date().getFullYear()} VyaparSync</span>
                <a href="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>Privacy Policy</a>
                <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
                <a href="/about-us" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/about-us'); }}>About Us</a>
                <a href="/contact-us" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/contact-us'); }}>Contact Us</a>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 4 }}>
                Powered by <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Vynkra Technologies</span>
              </div>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;
