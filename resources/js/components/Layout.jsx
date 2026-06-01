import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Receipt, LogOut, Settings as SettingsIcon, Banknote, Languages, Lock, Shield, Menu, X, Truck, AlertTriangle, Sun, Moon, ClipboardList, Info, HelpCircle, Compass } from 'lucide-react';
import api from '../utils/api';
import OnboardingTour from './OnboardingTour';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products & Stock', path: '/products', icon: Package },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Point of Sale (Billing)', path: '/billing', icon: ShoppingCart },
    { name: 'Quotations', path: '/quotations', icon: ClipboardList },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Bill History', path: '/bills', icon: Receipt },
    { name: 'Other Expenses', path: '/expenses', icon: Banknote },
    { name: 'Staff Advances', path: '/advances', icon: Banknote },
    { name: 'Staff Management', path: '/staff', icon: Users },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'dark');
  const [showTour, setShowTour] = useState(false);

  const handleStartTour = () => {
    localStorage.removeItem('onboarding_complete');
    setIsMobileMenuOpen(false);
    setShowTour(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Check if session date is valid (expires at 12 AM daily)
    const loginDate = localStorage.getItem('login_date');
    if (loginDate && loginDate !== new Date().toDateString()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('login_date');
        window.location.href = '/?session_expired=1';
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
      .then(res => setUser(res.data))
      .catch(console.error)
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogout = () => {
    if(confirm("Are you sure you want to log out?")) {
       api.post('/logout').catch(console.error).finally(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('login_date');
          window.location.href = '/';
       });
    }
  };

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', gap: 20 }}>
         <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <Package size={32} className="animate-spin-slow" />
         </div>
         <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Restoring secure session...</div>
      </div>
    );
  }

  const allNavItems = [...navItems];
  if (user && (user.is_super_admin === true || user.is_super_admin == 1)) {
    allNavItems.push({ name: 'Super Admin', path: '/super-admin', icon: Shield });
  }

  return (
    <div className="app-container">
      {/* Onboarding Tour Overlay */}
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
               <Package size={26} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.02em', wordBreak: 'break-word' }}>
                 {settings?.company_name || 'Hardware Pro'}
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
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}

          <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}></div>

          <NavLink 
            to="/settings" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            <SettingsIcon size={20} /> Settings
          </NavLink>

          <NavLink 
            to="/about-us" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-item ${location.pathname === '/about-us' ? 'active' : ''}`}
          >
            <Info size={20} /> About Us
          </NavLink>

          <NavLink 
            to="/contact-us" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-item ${location.pathname === '/contact-us' ? 'active' : ''}`}
          >
            <HelpCircle size={20} /> Contact Us
          </NavLink>

          {/* Product Tour Button */}
          <button
            onClick={handleStartTour}
            className="nav-item"
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              background: 'rgba(139, 92, 246, 0.08)', 
              border: '1px solid rgba(139, 92, 246, 0.18)',
              color: '#a78bfa',
              cursor: 'pointer',
              borderRadius: 10,
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            <Compass size={20} /> Product Tour
          </button>

          <NavLink 
            to="/privacy-policy" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-item ${location.pathname === '/privacy-policy' ? 'active' : ''}`}
          >
            <Shield size={20} /> Privacy Policy
          </NavLink>

          <NavLink 
            to="/terms" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-item ${location.pathname === '/terms' ? 'active' : ''}`}
          >
            <FileText size={20} /> Terms & Conditions
          </NavLink>

          <div style={{ padding: '12px 16px', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Languages size={18} color="var(--primary)" />
              <select 
                style={{ border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#fff', width: '100%' }}
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
                <option value="en" style={{color: '#000'}}>English</option>
                <option value="hi" style={{color: '#000'}}>हिंदी (Hindi)</option>
                <option value="bn" style={{color: '#000'}}>বাংলা (Bengali)</option>
                <option value="mr" style={{color: '#000'}}>मराठी (Marathi)</option>
                <option value="te" style={{color: '#000'}}>తెలుగు (Telugu)</option>
                <option value="ta" style={{color: '#000'}}>தமிழ் (Tamil)</option>
                <option value="gu" style={{color: '#000'}}>ગુજરાતી (Gujarati)</option>
                <option value="kn" style={{color: '#000'}}>ಕನ್ನಡ (Kannada)</option>
                <option value="ur" style={{color: '#000'}}>اردو (Urdu)</option>
                <option value="ml" style={{color: '#000'}}>മലയാളം (Malayalam)</option>
                <option value="pa" style={{color: '#000'}}>ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="mobile-profile-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'Admin User'}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{user?.is_super_admin ? 'Super Admin' : 'Shop Manager'}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(user?.is_super_admin === true || user?.is_super_admin == 1) && (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/super-admin'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', background: 'rgba(79, 70, 229, 0.4)', border: '1px solid var(--primary)', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 12px', borderRadius: 8, width: '100%', textAlign: 'left', fontWeight: 600 }}
              >
                <Shield size={16} /> Super Admin Dashboard
              </button>
            )}
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/settings'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 12px', borderRadius: 8, width: '100%', textAlign: 'left' }}
            >
              <SettingsIcon size={16} /> Settings
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/privacy-policy'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 12px', borderRadius: 8, width: '100%', textAlign: 'left' }}
            >
              <Shield size={16} /> Privacy Policy
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/terms'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 12px', borderRadius: 8, width: '100%', textAlign: 'left' }}
            >
              <FileText size={16} /> Terms & Conditions
            </button>
            <button 
              onClick={() => {
                if(confirm("Are you sure you want to log out?")) {
                   api.post('/logout').catch(console.error).finally(() => {
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('login_date');
                      window.location.href = '/';
                   });
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 12px', borderRadius: 8, width: '100%', textAlign: 'left' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar d-flex justify-content-between align-items-center">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'none' }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
              {allNavItems.find(item => location.pathname.startsWith(item.path))?.name || 'Hardware Shop Manager'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

              <div className="hide-on-mobile" style={{ position: 'relative' }}>
               <div 
                 className="user-profile d-flex align-items-center" 
                 style={{ gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
                 onClick={() => setShowProfileMenu(!showProfileMenu)}
               >
                 <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>{user?.name || 'Admin User'}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.is_super_admin ? 'Super Admin' : 'Shop Manager'}</div>
                 </div>
                 <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                   {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                 </div>
               </div>

               {showProfileMenu && (
                 <div style={{ 
                   position: 'absolute', top: '110%', right: 0, width: 200, 
                   background: 'var(--surface)', border: '1px solid var(--border)', 
                   borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 100 
                 }}>
                   {(user?.is_super_admin === true || user?.is_super_admin == 1) && (
                     <button 
                       onClick={() => navigate('/super-admin')} 
                       style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(79, 70, 229, 0.1)', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}
                     >
                       <Shield size={16} /> Super Admin
                     </button>
                   )}
                   <button 
                     onClick={() => navigate('/settings')} 
                     style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}
                   >
                     <SettingsIcon size={16} /> Settings
                   </button>
                   <button 
                     onClick={() => navigate('/settings')} 
                     title="Scroll to Security in Settings"
                     style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}
                   >
                     <Lock size={16} /> Change Password
                   </button>
                   <button 
                     onClick={() => navigate('/privacy-policy')} 
                     style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}
                   >
                     <Shield size={16} /> Privacy Policy
                    </button>
                    <button 
                      onClick={() => navigate('/terms')} 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }} 
                    >
                      <FileText size={16} /> Terms & Conditions
                    </button>
                    <button style={{ display: 'none' }}>
                   </button>
                    <button 
                     onClick={() => {
                       if(confirm("Are you sure you want to log out?")) {
                          api.post('/logout').catch(console.error).finally(() => {
                             localStorage.removeItem('auth_token');
                             localStorage.removeItem('login_date');
                             window.location.href = '/';
                          });
                       }
                     }} 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.9rem' }}
                   >
                     <LogOut size={16} /> Logout
                   </button>
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
              <button onClick={() => navigate('/settings')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Renew Plan</button>
            </div>
          )}
          
          {settings && !settings.is_expired && settings.trial_days_remaining !== undefined && settings.subscription_plan !== 'full_time' && (
            (settings.subscription_plan === 'monthly' || settings.subscription_plan === 'yearly') ? (
              settings.trial_days_remaining <= 15 && (
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
                  <button onClick={() => navigate('/settings')} className="btn" style={{ background: 'var(--warning)', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Renew Now</button>
                </div>
              )
            ) : (
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
                <button onClick={() => navigate('/settings')} className="btn" style={{ background: 'var(--warning)', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Renew Now</button>
              </div>
            )
          )}
          {children}
          
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
                <span>&copy; {new Date().getFullYear()} Hardware Shop Manager</span>
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
