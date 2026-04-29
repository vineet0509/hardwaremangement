import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Shield, Store, Users, Calendar, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const SuperAdmin = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopUsers, setSelectedShopUsers] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = () => {
    api.get('/super-admin/shops')
      .then(res => {
        setShops(res.data);
        setLoading(false);
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error fetching shops');
        setLoading(false);
      });
  };

  const handleToggleStatus = (shopId) => {
    api.post(`/super-admin/shops/${shopId}/toggle-status`)
      .then(res => {
        alert(res.data.message);
        fetchShops();
      })
      .catch(err => alert(err.response?.data?.message || 'Error updating shop status'));
  };

  const handleExtendPlan = (shopId) => {
    const days = prompt("How many days to extend the trial/plan by?");
    if (days && !isNaN(days) && parseInt(days) > 0) {
      api.post(`/super-admin/shops/${shopId}/extend-plan`, { days: parseInt(days) })
        .then(res => {
          alert(res.data.message);
          fetchShops();
        })
        .catch(err => alert(err.response?.data?.message || 'Error extending plan'));
    }
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
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Manage all registered hardware shops and their system access.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
        <div className="stat-card" style={{ overflowX: 'auto' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={20} color="var(--primary)" />
            Registered Shops ({shops.length})
          </h3>
          
          <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Shop Name</th>
                <th style={{ padding: '12px 16px' }}>Domain</th>
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
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{shop.domain}</td>
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
              No shops found in the database.
            </div>
          )}
        </div>

        {/* Users Modal or Detail Box */}
        {selectedShopUsers && (
          <div className="stat-card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="var(--primary)" />
                Shop Users
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
