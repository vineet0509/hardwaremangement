import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Settings as SettingsIcon, AlertTriangle, Save, CheckCircle, Languages } from 'lucide-react';
import Swal from 'sweetalert2';

const Settings = () => {
  const [formData, setFormData] = useState({
    company_name: '', company_phone: '', company_address: '', gst_number: '',
    subscription_plan: 'full_time', subscription_expires_at: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        setFormData({
          company_name: res.data.company_name || '',
          company_phone: res.data.company_phone || '',
          company_address: res.data.company_address || '',
          gst_number: res.data.gst_number || '',
          subscription_plan: res.data.subscription_plan || 'full_time',
          subscription_expires_at: res.data.subscription_expires_at ? res.data.subscription_expires_at.split('T')[0] : ''
        });
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error fetching settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    api.post('/settings', formData)
      .then(res => {
        Swal.fire('Success', 'Settings saved successfully!', 'success').then(() => {
           window.location.reload(); // Quick refresh to update the sidebar dynamic company name
        });
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error saving settings', 'error'));
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
               window.location.href = '/login';
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
              <label className="form-label">Company / Shop Name</label>
              <input type="text" className="form-control" required
                value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="form-control"
                value={formData.company_phone} onChange={e => setFormData({...formData, company_phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input type="text" className="form-control"
                value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} />
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

        {/* Subscription Plan Settings */}
        <div className="stat-card" style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--surface-hover)' }}>
           <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Subscription Model</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
             Your current active subscription and plan details. Contact your administrator to extend your trial or renew your plan.
           </p>

            <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.15)', borderRadius: 8 }}>
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
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: formData.subscription_expires_at && new Date(formData.subscription_expires_at) < new Date() ? 'var(--danger)' : 'var(--warning)' }}>
                     <AlertTriangle size={18} />
                     <strong>
                        {formData.subscription_expires_at 
                          ? (new Date(formData.subscription_expires_at) < new Date() 
                              ? `Plan Expired on ${new Date(formData.subscription_expires_at).toLocaleDateString()}` 
                              : `Plan Expires on ${new Date(formData.subscription_expires_at).toLocaleDateString()}`)
                          : 'No expiration date set'}
                     </strong>
                   </div>
                 </div>
              )}
            </div>
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
