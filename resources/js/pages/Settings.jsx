import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Settings as SettingsIcon, AlertTriangle, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    company_name: '', company_phone: '', company_address: '', 
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
          subscription_plan: res.data.subscription_plan || 'full_time',
          subscription_expires_at: res.data.subscription_expires_at ? res.data.subscription_expires_at.split('T')[0] : ''
        });
      })
      .catch(err => alert(err.response?.data?.message || 'Error fetching settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    api.post('/settings', formData)
      .then(res => {
        alert('Settings saved successfully!');
        window.location.reload(); // Quick refresh to update the sidebar dynamic company name
      })
      .catch(err => alert(err.response?.data?.message || 'Error saving settings'));
  };


  const handlePasswordChange = (e) => {
    e.preventDefault();
    if(passwordData.new_password !== passwordData.new_password_confirmation) {
      return alert("New passwords do not match!");
    }
    api.post('/user/password', passwordData)
      .then(res => {
        alert(res.data.message || 'Password updated successfully!');
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
      })
      .catch(err => alert(err.response?.data?.message || 'Error updating password'));
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
      </div>
    </div>
  );
};

export default Settings;
