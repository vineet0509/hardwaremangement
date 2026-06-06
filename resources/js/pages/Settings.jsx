import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Settings as SettingsIcon, AlertTriangle, Save, CheckCircle, Languages } from 'lucide-react';
import Swal from 'sweetalert2';

const Settings = () => {
  const [formData, setFormData] = useState({
    company_name: '', company_phone: '', company_address: '', gst_number: '', business_type: '',
    subscription_plan: 'full_time', subscription_expires_at: '', latest_request: null,
    razorpay_key: '', razorpay_secret: '', razorpay_webhook_secret: ''
  });
  const [userData, setUserData] = useState({
    name: '', email: '', mobile: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(true);
  const [gstChecking, setGstChecking] = useState(false);
  const [gstResult, setGstResult] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const planBenefits = {
    pro: [
      "Unlimited Invoicing & Billing",
      "Basic Inventory Management",
      "Customer & Supplier Tracking",
      "Standard Reports",
      "Email Support"
    ],
    business: [
      "All Pro Features",
      "Multiple Branches / Child Businesses",
      "Staff & Attendance Management",
      "Advanced Analytics & Reporting",
      "Priority Phone Support"
    ],
    enterprise: [
      "All Business Features",
      "Custom API Integrations",
      "Dedicated Account Manager",
      "99.9% Uptime SLA",
      "On-premise / Custom Cloud Deployment"
    ]
  };

  const handleVerifyGst = () => {
    if (!formData.gst_number) {
      return Swal.fire('Validation', 'Please enter a GST number first.', 'warning');
    }
    setGstChecking(true);
    setGstResult(null);
    api.get(`/verify-gst?gstin=${formData.gst_number}`)
      .then(res => {
        setGstResult(res.data);
      })
      .catch(err => {
        setGstResult({ success: false, valid: false, message: 'Verification API is offline or encountered an error.' });
      })
      .finally(() => setGstChecking(false));
  };

  const fetchSettings = () => {
    Promise.all([
      api.get('/settings'),
      api.get('/me')
    ])
      .then(([settingsRes, meRes]) => {
        setFormData({
          company_name: settingsRes.data.company_name || '',
          company_phone: settingsRes.data.company_phone || '',
          company_address: settingsRes.data.company_address || '',
          gst_number: settingsRes.data.gst_number || '',
          business_type: settingsRes.data.business_type || '',
          subscription_plan: settingsRes.data.subscription_plan || 'full_time',
          subscription_expires_at: settingsRes.data.subscription_expires_at ? settingsRes.data.subscription_expires_at.split('T')[0] : '',
          latest_request: settingsRes.data.latest_request || null,
          razorpay_key: settingsRes.data.razorpay_key || '',
          razorpay_secret: settingsRes.data.razorpay_secret || '',
          razorpay_webhook_secret: settingsRes.data.razorpay_webhook_secret || ''
        });
        if (settingsRes.data.latest_request && settingsRes.data.latest_request.status === 'pending') {
          setSelectedPlan(settingsRes.data.latest_request.plan_type);
        }
        setUserData({
          name: meRes.data.name || '',
          email: meRes.data.email || '',
          mobile: meRes.data.mobile || '',
        });
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error fetching settings', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Indian GSTIN format validation
    if (formData.gst_number) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(formData.gst_number)) {
        return Swal.fire('Error', 'Invalid GST number. Must be a valid 15-character Indian GSTIN format (e.g., 27AAPCS1234F1Z5).', 'error');
      }
    }

    api.post('/settings', formData)
      .then(res => {
        Swal.fire('Success', 'Settings saved successfully!', 'success').then(() => {
           window.location.reload(); 
        });
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error saving settings', 'error'));
  };

  const handleSubscriptionRequest = (e) => {
    e.preventDefault();
    const planType = e.target.plan_type.value;
    api.post('/subscription-request', { plan_type: planType })
      .then(res => {
        Swal.fire('Success', res.data.message || 'Request sent!', 'success');
        fetchSettings();
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to submit request', 'error'));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    api.post('/user/profile', userData)
      .then(res => {
        Swal.fire('Success', res.data.message || 'Profile updated successfully!', 'success');
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error updating profile', 'error'));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if(passwordData.new_password !== passwordData.new_password_confirmation) {
      return Swal.fire('Warning', "New passwords do not match!", 'warning');
    }
    api.post('/user/password', passwordData)
      .then(res => {
        Swal.fire('Success', res.data.message || 'Password updated successfully!', 'success');
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error updating password', 'error'));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!userData.email) return Swal.fire('Error', 'Email address not found in profile.', 'error');
    
    Swal.fire({
      title: 'Send Password Reset Link?',
      text: `A password reset link will be sent to ${userData.email}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, send it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.post('/forgot-password', { email: userData.email })
          .then(res => Swal.fire('Sent!', res.data.message || 'Reset link sent to your email.', 'success'))
          .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to send reset link.', 'error'));
      }
    });
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Your account will be deactivated. You can contact support to restore it within 30 days.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete my account!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete('/user')
          .then(() => {
            localStorage.removeItem('auth_token');
            Swal.fire('Deleted!', 'Your account has been soft deleted.', 'success').then(() => {
               window.location.href = '/';
            });
          })
          .catch(err => Swal.fire('Error', 'Could not delete account. Try again later.', 'error'));
      }
    });
  };

  if (loading) return <div>Loading settings...</div>;

  return (

    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <SettingsIcon color="var(--primary)" size={32} />
        <h2 style={{ margin: 0 }}>System Settings & Profile</h2>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Company Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Business Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Company / Business Name</label>
              <input type="text" className="form-control" required
                value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type of Business</label>
              <select className="form-control" value={formData.business_type} onChange={e => setFormData({...formData, business_type: e.target.value})}>
                  <option value="" disabled>Select Type of Business</option>
                  <option value="Hardware / Building Materials">Hardware / Building Materials</option>
                  <option value="Electronics / Mobile Shop">Electronics / Mobile Shop</option>
                  <option value="Grocery / Supermarket">Grocery / Supermarket</option>
                  <option value="Clothing / Garments">Clothing / Garments</option>
                  <option value="Services / General">Services / General</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="form-control"
                value={formData.company_phone} onChange={e => setFormData({...formData, company_phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>GST Number (Optional)</span>
                {formData.gst_number && (
                  <button 
                    type="button" 
                    onClick={handleVerifyGst} 
                    disabled={gstChecking}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {gstChecking ? 'Verifying...' : 'Verify Online'}
                  </button>
                )}
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" className="form-control" style={{ flex: 1 }}
                  value={formData.gst_number} onChange={e => {
                    setFormData({...formData, gst_number: e.target.value.toUpperCase().replace(/\s/g, '')});
                    setGstResult(null);
                  }} />
              </div>
              
              {gstResult && (
                <div style={{ 
                  marginTop: 8, 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  fontSize: '0.8rem', 
                  background: gstResult.valid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: gstResult.valid ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  color: gstResult.valid ? '#10b981' : '#ef4444'
                }}>
                  {gstResult.valid ? (
                    <div>
                      <strong>🟢 Valid GSTIN Checksum</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                        State: <b>{gstResult.details?.state_name}</b> ({gstResult.details?.state_code}) | PAN: <b>{gstResult.details?.pan}</b>
                      </div>
                      <a 
                        href={`https://services.gst.gov.in/services/searchtp`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'inline-block', marginTop: 4, color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.75rem' }}
                      >
                        Verify Taxpayer Details on Official GST Portal ↗
                      </a>
                    </div>
                  ) : (
                    <div>
                      <strong>🔴 Invalid GSTIN:</strong> {gstResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Business Address</label>
              <textarea className="form-control" style={{ resize: 'vertical', minHeight: 80 }}
                value={formData.company_address} onChange={e => setFormData({...formData, company_address: e.target.value})} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
              <Save size={18} /> Save Settings
            </button>
          </form>
        </div>

        {/* Payment Gateway Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Payment Gateway (Razorpay)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            Configure your own Razorpay API keys to receive money directly into your bank account via UPI/Cards. Leave blank to disable.
          </p>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Razorpay Key ID</label>
              <input type="text" className="form-control" placeholder="rzp_live_..."
                value={formData.razorpay_key} onChange={e => setFormData({...formData, razorpay_key: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Razorpay Key Secret</label>
              <input type="password" className="form-control" placeholder="Hidden..."
                value={formData.razorpay_secret} onChange={e => setFormData({...formData, razorpay_secret: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Webhook Secret (Optional)</label>
              <input type="password" className="form-control" placeholder="Required for auto-polling..."
                value={formData.razorpay_webhook_secret} onChange={e => setFormData({...formData, razorpay_webhook_secret: e.target.value})} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                If set, your Webhook URL is: <br/>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: 4 }}>{window.location.origin}/api/razorpay-webhook</code>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
              <Save size={18} /> Save Keys
            </button>
          </form>
        </div>

        {/* Subscription Plan Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--surface-hover)' }}>
           <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Subscription Model</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
             Your current active subscription and plan details.
           </p>

            <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.15)', borderRadius: 8, marginBottom: 24 }}>
              {formData.subscription_plan === 'full_time' ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                   <CheckCircle size={20} />
                   <strong>Lifetime License Active</strong>
                 </div>
              ) : (
                 <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginBottom: 12 }}>
                     <CheckCircle size={20} />
                     <strong style={{ textTransform: 'capitalize' }}>{formData.subscription_plan} Plan Active</strong>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: formData.subscription_expires_at && new Date(formData.subscription_expires_at) < new Date() ? 'var(--danger)' : 'var(--warning)', marginBottom: 16 }}>
                     <AlertTriangle size={18} />
                     <strong>
                        {formData.subscription_expires_at 
                          ? (new Date(formData.subscription_expires_at) < new Date() 
                              ? `Plan Expired on ${new Date(formData.subscription_expires_at).toLocaleDateString()}` 
                              : `Plan Expires on ${new Date(formData.subscription_expires_at).toLocaleDateString()}`)
                          : 'No expiration date set'}
                     </strong>
                   </div>
                   
                   <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                     <h4 style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Plan Benefits</h4>
                     <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                       {(planBenefits[formData.subscription_plan] || []).map((benefit, idx) => (
                         <li key={idx} style={{ marginBottom: 4 }}>{benefit}</li>
                       ))}
                     </ul>
                   </div>
                 </div>
              )}
            </div>

            {formData.subscription_plan !== 'full_time' && (
               <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 8 }}>
                 <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Renew or Upgrade Plan</h4>
                 
                 {formData.latest_request && formData.latest_request.status === 'pending' ? (
                   <div style={{ marginBottom: 16, padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                     <div style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>REQUEST PENDING</div>
                     <div style={{ fontSize: '0.9rem' }}>You requested the <strong style={{ textTransform: 'capitalize' }}>{formData.latest_request.plan_type}</strong> plan.</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Requested on {new Date(formData.latest_request.created_at).toLocaleDateString()}</div>
                   </div>
                 ) : formData.latest_request && formData.latest_request.status === 'rejected' && (
                    <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>REQUEST REJECTED</div>
                      <div style={{ fontSize: '0.9rem' }}>Your previous request was not approved. You can submit a new one.</div>
                    </div>
                 )}

                 <form onSubmit={handleSubscriptionRequest}>
                    <div className="form-group">
                      <select name="plan_type" className="form-control" required style={{ marginBottom: 12 }} value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                        <option value="pro">Pro Plan - ₹2,999</option>
                        <option value="business">Business Plan - ₹4,999</option>
                        <option value="enterprise">Enterprise Plan - ₹9,999</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 16, background: 'var(--surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                      <h4 style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>What you get</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {(planBenefits[selectedPlan] || []).map((benefit, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--success)', border: 'none' }}>
                     {formData.latest_request?.status === 'pending' ? 'Change Requested Plan' : 'Submit Renewal Request'}
                   </button>
                 </form>
               </div>
            )}
        </div>
        {/* Admin Profile Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Admin Profile</h3>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Admin Name</label>
              <input type="text" className="form-control" required
                value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input type="email" className="form-control" required
                value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Admin Mobile Number</label>
              <input type="text" className="form-control"
                value={userData.mobile} onChange={e => setUserData({...userData, mobile: e.target.value})} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
              <Save size={18} /> Update Profile
            </button>
          </form>
        </div>

        {/* Change Password Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Security & Access</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" required
                value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" required minLength={8}
                value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" required minLength={8}
                value={passwordData.new_password_confirmation} onChange={e => setPasswordData({...passwordData, new_password_confirmation: e.target.value})} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12, background: 'var(--text-main)', width: '100%' }}>
              Update Password
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="#" onClick={handleForgotPassword} style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot your current password?</a>
            </div>
          </form>
        </div>
        {/* Language Settings - Added for mobile accessibility */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Language & Localization</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Select your preferred system language. This will translate the interface using Google Translate.
          </p>
          
          <div className="form-group">
            <label className="form-label">System Language</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-color)', border: '1px solid var(--border)' }}>
              <Languages size={20} color="var(--primary)" />
              <select 
                className="form-control"
                style={{ border: 'none', background: 'transparent', padding: 0, height: 'auto', boxShadow: 'none' }}
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
                defaultValue={
                  document.cookie.split('; ').find(row => row.startsWith('googtrans='))?.split('=')[1]?.replace('/en/', '') || 'en'
                }
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
          </div>
          <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={14} color="var(--success)" />
            Language setting will be applied across the entire app.
          </div>
        </div>

        {/* Danger Zone */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: 'var(--danger)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: 12, marginBottom: 16 }}>Danger Zone</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Once you delete your account, you will be logged out immediately. Your data is preserved for 30 days before permanent removal.
          </p>
          <button 
            onClick={handleDeleteAccount}
            className="btn btn-secondary" 
            style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)', background: 'transparent' }}
          >
            Delete Account (Soft Delete)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
