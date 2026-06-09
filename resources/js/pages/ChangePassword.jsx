import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { Lock } from 'lucide-react';

const ChangePassword = () => {
  const [userData, setUserData] = useState({ email: '' });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    api.get('/me').then(res => {
      setUserData({ email: res.data.email });
    }).catch(console.error);
  }, []);

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
        api.post('/forgot-password', { login: userData.email })
          .then(res => Swal.fire('Sent!', res.data.message || 'Reset link sent to your email.', 'success'))
          .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to send reset link.', 'error'));
      }
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h2><Lock size={24} style={{ marginRight: 10, verticalAlign: 'middle', color: 'var(--primary)' }} /> Security & Access</h2>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="stat-card">
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Change Password</h3>
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
      </div>
    </div>
  );
};

export default ChangePassword;
