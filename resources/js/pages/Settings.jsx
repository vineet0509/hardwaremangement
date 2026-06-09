import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Settings as SettingsIcon, AlertTriangle, Save, CheckCircle, Languages } from 'lucide-react';
import Swal from 'sweetalert2';

const Settings = () => {
  const [formData, setFormData] = useState({
    company_name: '', company_phone: '', company_address: '', gst_number: '', business_type: '',
    subscription_plan: 'full_time', subscription_expires_at: '', latest_request: null,
    terms_and_conditions: '', upi_qr_code: '', upi_qr_code_url: '', company_logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [userData, setUserData] = useState({
    name: '', email: '', mobile: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(true);
  const [gstChecking, setGstChecking] = useState(false);
  const [gstResult, setGstResult] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('starter');

  const planBenefits = {
    monthly: [
      "1 Shop",
      "1 User",
      "Billing, Inventory, Customers, Suppliers",
      "Maximum 100 invoices per month",
      "(30-Day Trial Edition)"
    ],
    free: [
      "1 Shop",
      "1 User",
      "Billing, Inventory, Customers, Suppliers",
      "Maximum 100 invoices per month",
      "(Trial / Evaluation Edition)"
    ],
    starter: [
      "1 Shop",
      "2 Users",
      "Billing, Inventory, Customers, Suppliers",
      "Unlimited Invoices",
      "GST Reports",
      "WhatsApp Invoice Sharing"
    ],
    business: [
      "Everything in STARTER",
      "Staff Management (Max 25)",
      "Attendance & Salary Management",
      "Expense Tracking",
      "Maximum 5 Users"
    ],
    enterprise: [
      "Everything in BUSINESS",
      "Unlimited Shops & Users",
      "Role & Permission Management",
      "Branch Transfer",
      "API Access & AI Features"
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
            terms_and_conditions: settingsRes.data.terms_and_conditions || '',
            upi_qr_code: settingsRes.data.upi_qr_code || '',
            upi_qr_code_url: '',
            company_logo: null
          });
          if (settingsRes.data.company_logo) {
            setLogoPreview(`/${settingsRes.data.company_logo}`);
          }
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

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

      // Use a fresh axios instance to avoid api.js Content-Type conflicts that break FormData boundaries
      // Ensure Accept: application/json is sent so validation errors are returned as JSON, not HTML redirects.
      axios.post(window.API_URL ? `${window.API_URL}/settings` : '/api/settings', submitData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      })
      .then(res => {
        Swal.fire('Success', 'Settings saved successfully!', 'success').then(() => {
           window.location.reload(); 
        });
      })
      .catch(err => {
        console.error("Upload error:", err.response || err);
        const msg = err.response?.data?.message || err.response?.statusText || err.message || 'Error saving settings';
        Swal.fire('Error', msg, 'error');
      });
  };


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscriptionRequest = async (e) => {
    e.preventDefault();
    const planType = e.target.plan_type.value;

    const result = await Swal.fire({
      title: 'Confirm Upgrade',
      text: "You cannot downgrade your plan once upgraded. Are you sure you want to proceed?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed to payment!'
    });

    if (!result.isConfirmed) return;

    const resLoad = await loadRazorpay();
    if (!resLoad) {
      return Swal.fire('Error', 'Razorpay SDK failed to load. Are you online?', 'error');
    }

    try {
      const { data } = await api.post('/settings/subscription/order', { plan_type: planType });

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: formData.company_name || 'VyaparSync',
        description: `Subscription Upgrade: ${planType.toUpperCase()}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/settings/subscription/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_type: planType
            });
            Swal.fire('Success', verifyRes.data.message || 'Subscription upgraded successfully!', 'success');
            fetchSettings();
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.mobile || formData.company_phone
        },
        theme: {
          color: '#14b8a6'
        },
        config: {
          display: {
            blocks: {
              qr: {
                name: 'Pay via QR Code',
                instruments: [{ method: 'upi', flows: ['qr'] }]
              },
              other: {
                name: 'Other Methods',
                instruments: [{ method: 'upi' }, { method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }]
              }
            },
            sequence: ['block.qr', 'block.other'],
            preferences: { show_default_blocks: false }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        Swal.fire('Payment Failed', response.error.description, 'error');
      });
      rzp.open();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create order', 'error');
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    api.post('/user/profile', userData)
      .then(res => {
        Swal.fire('Success', res.data.message || 'Profile updated successfully!', 'success');
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error updating profile', 'error'));
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
                <label className="form-label">Company Logo (Optional)</label>
                {logoPreview && (
                  <div style={{ marginBottom: 12 }}>
                    <img src={logoPreview} alt="Company Logo" style={{ maxHeight: 80, borderRadius: 8, border: '1px solid var(--border)' }} />
                  </div>
                )}
                <input type="file" className="form-control" accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({...formData, company_logo: file});
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>This logo will appear on your generated bills and quotations.</p>
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
            <div className="form-group">
              <label className="form-label">Custom Terms & Conditions (For Invoice)</label>
              <textarea className="form-control" placeholder="Leave blank to use default terms based on your business type..." style={{ resize: 'vertical', minHeight: 80 }}
                value={formData.terms_and_conditions} onChange={e => setFormData({...formData, terms_and_conditions: e.target.value})} />
            </div>
            
            <div className="form-group" style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <h4 style={{ marginBottom: 12 }}>UPI ID for Payments</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
                Enter your shop's UPI ID (e.g. 9876543210@ybl). A dynamic QR Code with the bill amount will be generated on the billing screen when UPI is selected.
              </p>
              <input type="text" className="form-control" placeholder="example@upi"
                value={formData.upi_qr_code || ''} onChange={e => setFormData({...formData, upi_qr_code: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
              <Save size={18} /> Save Settings
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
                 <form onSubmit={handleSubscriptionRequest}>
                    <div className="form-group">
                      <select name="plan_type" className="form-control" required style={{ marginBottom: 12 }} value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                        <option value="starter">STARTER Plan - ₹999/year</option>
                        <option value="business">BUSINESS Plan - ₹2,499/year</option>
                        <option value="enterprise">ENTERPRISE Plan - ₹4,999/year</option>
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

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                        Upgrade Now
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
