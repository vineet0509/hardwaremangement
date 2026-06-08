import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Shield, Store, Users, Calendar, CheckCircle, XCircle, ToggleLeft, ToggleRight, Phone, Mail } from 'lucide-react';

import Swal from 'sweetalert2';

const SuperAdmin = () => {
  const [shops, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopUsers, setSelectedShopUsers] = useState(null);
  const [activeTab, setActiveTab] = useState('businesses');
  const [loginLogs, setLoginLogs] = useState([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState([]);
  const [logsPagination, setLogsPagination] = useState({ current: 1, last: 1 });

  useEffect(() => {
    fetchBusinesses();
    fetchLogs(1);
    fetchSubscriptionRequests();
  }, []);

  const fetchSubscriptionRequests = () => {
    api.get('/super-admin/subscription-requests')
      .then(res => setSubscriptionRequests(res.data))
      .catch(console.error);
  };

  const fetchLogs = (page = 1) => {
    api.get(`/super-admin/login-logs?page=${page}`)
      .then(res => {
        setLoginLogs(res.data.data || res.data);
        setLogsPagination({
          current: res.data.current_page || 1,
          last: res.data.last_page || 1
        });
      })
      .catch(console.error);
  };

  const fetchBusinesses = () => {
    api.get('/super-admin/shops')
      .then(res => {
        setBusinesses(res.data);
        setLoading(false);
      })
      .catch(err => {
        Swal.fire(err.response?.data?.message || 'Error fetching businesses');
        setLoading(false);
      });
  };

  const handleToggleStatus = (businessId) => {
    api.post(`/super-admin/shops/${businessId}/toggle-status`)
      .then(res => {
        Swal.fire(res.data.message);
        fetchBusinesses();
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Error updating business status'));
  };

  const handleExtendPlan = (businessId) => {
    const days = prompt("How many days to extend the trial/plan by?");
    if (days && !isNaN(days) && parseInt(days) > 0) {
      api.post(`/super-admin/shops/${businessId}/extend-plan`, { days: parseInt(days) })
        .then(res => {
          Swal.fire(res.data.message);
          fetchBusinesses();
        })
        .catch(err => Swal.fire(err.response?.data?.message || 'Error extending plan'));
    }
  };

  const handleUpdatePlan = async (businessId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Plan Manually',
      html: `
        <select id="swal-plan" class="swal2-input" style="width:80%; padding:10px;">
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="full_time">Full Time (Lifetime)</option>
        </select>
        <br/><br/>
        <input id="swal-days" type="number" class="swal2-input" placeholder="Days to extend (optional)" style="width:80%; padding:10px;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const plan = document.getElementById('swal-plan').value;
        const days = document.getElementById('swal-days').value;
        return { plan_type: plan, days: days ? parseInt(days) : null };
      }
    });

    if (formValues) {
      api.post(`/super-admin/shops/${businessId}/update-plan`, formValues)
        .then(res => {
          Swal.fire('Success', res.data.message, 'success');
          fetchBusinesses();
        })
        .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error updating plan', 'error'));
    }
  };

  const handleApproveRequest = (id) => {
    Swal.fire({
      title: 'Approve Request?',
      text: "Are you sure you want to approve this subscription? This will extend the business's plan.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve'
    }).then((result) => {
      if (result.isConfirmed) {
        api.post(`/super-admin/subscription-requests/${id}/approve`)
          .then(res => {
            Swal.fire(res.data.message);
            fetchSubscriptionRequests();
            fetchBusinesses();
          })
          .catch(err => Swal.fire(err.response?.data?.message || 'Error approving request'));
      }
    });
  };

  const handleRejectRequest = (id) => {
    Swal.fire({
      title: 'Reject Request?',
      text: "Reject this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject'
    }).then((result) => {
      if (result.isConfirmed) {
        api.post(`/super-admin/subscription-requests/${id}/reject`)
          .then(res => {
            Swal.fire(res.data.message);
            fetchSubscriptionRequests();
          })
          .catch(err => Swal.fire(err.response?.data?.message || 'Error rejecting request'));
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Shield color="var(--primary)" size={32} />
        <div>
          <h2 style={{ margin: 0 }}>Super Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Manage all registered retail businesses and their system access.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button 
          onClick={() => setActiveTab('businesses')} 
          style={{ 
            padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', 
            background: activeTab === 'businesses' ? 'var(--primary)' : 'var(--surface)', 
            color: activeTab === 'businesses' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600 
          }}
        >
          Registered Businesses
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          style={{ 
            padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', 
            background: activeTab === 'requests' ? 'var(--primary)' : 'var(--surface)', 
            color: activeTab === 'requests' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          Plan Requests {subscriptionRequests.filter(r => r.status === 'pending').length > 0 && (
            <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '50%', fontSize: '0.75rem' }}>
              {subscriptionRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          style={{ 
            padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', 
            background: activeTab === 'logs' ? 'var(--primary)' : 'var(--surface)', 
            color: activeTab === 'logs' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600 
          }}
        >
          User Login Logs
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
        {activeTab === 'businesses' ? (
          <div className="stat-card" style={{ overflowX: 'auto' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={20} color="var(--primary)" />
              Registered Businesses ({shops.length})
            </h3>
          
          <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Business Name</th>
                <th style={{ padding: '12px 16px' }}>Contact Details</th>
                <th style={{ padding: '12px 16px' }}>Users</th>
                <th style={{ padding: '12px 16px' }}>Plan</th>
                <th style={{ padding: '12px 16px' }}>Expires</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map(shop => (
                <tr key={shop.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px' }}>{shop.id}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{shop.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    {shop.users && shop.users.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Phone size={14} /> <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{shop.users[0].mobile || 'No Mobile'}</span>
                        </div>
                        {shop.users[0].email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                            <Mail size={14} /> <span>{shop.users[0].email}</span>
                          </div>
                        )}
                      </>
                    ) : 'No User'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => setSelectedShopUsers(shop.users)}
                    >
                      <Users size={14} /> {shop.users_count} Users
                    </button>
                  </td>
                  <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      backgroundColor: shop.subscription_plan === 'full_time' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: shop.subscription_plan === 'full_time' ? 'var(--success)' : '#60a5fa'
                    }}>
                      {shop.subscription_plan}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                    {shop.trial_ends_at ? (
                      <span style={{ 
                        color: new Date(shop.trial_ends_at) < new Date() ? 'var(--danger)' : 'var(--success)',
                        fontWeight: new Date(shop.trial_ends_at) < new Date() ? 'bold' : 'normal'
                      }}>
                        {new Date(shop.trial_ends_at).toLocaleDateString()}
                        {new Date(shop.trial_ends_at) < new Date() && " (Expired)"}
                      </span>
                    ) : 'No Trial'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {shop.is_active ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem' }}>
                        <CheckCircle size={16} /> Active
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem' }}>
                        <XCircle size={16} /> Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleExtendPlan(shop.id)}
                      >
                        Extend 
                      </button>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#3b82f6', border: 'none' }}
                        onClick={() => handleUpdatePlan(shop.id)}
                      >
                        Change Plan
                      </button>
                      <button 
                        className={`btn ${shop.is_active ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleToggleStatus(shop.id)}
                      >
                        {shop.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {shop.is_active ? 'Deact' : 'Act'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>

          {shops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              No businesses found in the database.
            </div>
          )}
        </div>
        ) : activeTab === 'requests' ? (
          <div className="stat-card" style={{ overflowX: 'auto' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              Subscription & Renewal Requests
            </h3>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Business</th>
                    <th style={{ padding: '12px 16px' }}>Plan Type</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionRequests.map(request => (
                    <tr key={request.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>{request.shop?.name}</td>
                      <td style={{ padding: '16px', textTransform: 'capitalize' }}>{request.plan_type}</td>
                      <td style={{ padding: '16px' }}>₹{request.amount}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 8, fontSize: '0.85rem',
                          background: request.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : request.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: request.status === 'approved' ? 'var(--success)' : request.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                        }}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>{new Date(request.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {request.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--success)', border: 'none' }}
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {subscriptionRequests.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="stat-card" style={{ overflowX: 'auto' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              User Login Logs
            </h3>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th style={{ padding: '12px 16px' }}>Business</th>
                    <th style={{ padding: '12px 16px' }}>IP Address</th>
                    <th style={{ padding: '12px 16px' }}>Source</th>
                    <th style={{ padding: '12px 16px' }}>Login Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>{log.user?.name || 'Unknown User'} ({log.user?.email || 'N/A'})</td>
                      <td style={{ padding: '16px' }}>{log.shop?.name || 'Unknown Business'}</td>
                      <td style={{ padding: '16px' }}>{log.ip_address}</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: log.device_type === 'mobile' ? 'var(--primary)' : 'var(--text-color)' }}>
                        {log.device_type === 'mobile' ? 'Mobile App' : 'Browser'}
                      </td>
                      <td style={{ padding: '16px' }}>{new Date(log.login_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loginLogs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No login logs recorded.
              </div>
            )}

            {logsPagination.last > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={logsPagination.current === 1} 
                  onClick={() => fetchLogs(logsPagination.current - 1)}
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.9rem' }}>
                  Page {logsPagination.current} of {logsPagination.last}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={logsPagination.current === logsPagination.last} 
                  onClick={() => fetchLogs(logsPagination.current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Users Modal or Detail Box */}
        {selectedShopUsers && (
          <div className="stat-card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="var(--primary)" />
                Business Users
              </h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 12px' }}
                onClick={() => setSelectedShopUsers(null)}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {selectedShopUsers.map((user, index) => (
                <div key={index} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
