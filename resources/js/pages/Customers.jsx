import React, { useState, useEffect } from 'react';
import { Search, UserCheck, TrendingUp, AlertCircle, Eye, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ old_phone: '', customer_name: '', customer_phone: '', customer_address: '' });

  const fetchCustomers = () => {
    setLoading(true);
    api.get(`/customers?search=${search}`)
       .then(res => setCustomers(res.data.data || res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  };

  useEffect(() => {
    const debounce = setTimeout(fetchCustomers, 400);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    api.put(`/customers/${encodeURIComponent(formData.old_phone)}`, formData)
       .then(() => {
           setShowModal(false);
           fetchCustomers();
       })
       .catch(err => alert(err.response?.data?.message || 'Failed to update customer.'));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 400 }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive"><table>
          <thead>
            <tr>
              <th>Customer details</th>
              <th>Address</th>
              <th>Total Orders</th>
              <th>Lifetime Purchases</th>
              <th>Paid Amount</th>
              <th>Pending Udhar / Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading customers database...</td></tr>
            ) : (!customers || customers.length === 0) ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No customers found matching that query.</td></tr>
            ) : customers.map((c, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.customer_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.customer_phone}</div>
                </td>
                <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.customer_address}>
                  {c.customer_address || '-'}
                </td>
                <td>
                  <span className="badge" style={{ background: 'var(--surface-hover)' }}>{c.total_bills} Bills</span>
                </td>
                <td style={{ fontWeight: 600 }}>₹{c.lifetime_purchase}</td>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{c.lifetime_paid}</td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.current_due > 0 ? (
                        <>
                          <AlertCircle size={16} color="var(--danger)" />
                          <span style={{ color: 'var(--danger)', fontWeight: 800 }}>₹{c.current_due}</span>
                        </>
                      ) : c.current_due < 0 ? (
                        <>
                           <TrendingUp size={16} color="var(--primary)" />
                           <span style={{ color: 'var(--primary)', fontWeight: 800 }}>+₹{Math.abs(c.current_due)} (Credit)</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>All Cleared</span>
                      )}
                    </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline" style={{ padding: '6px 12px' }} title="View Purchase History" onClick={() => navigate(`/bills?customer=${encodeURIComponent(c.customer_name)}`)}>
                       <Eye size={16} /> History
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', borderColor: 'var(--primary)', color: 'var(--primary)' }} title="Edit Profile"
                      onClick={() => {
                        setFormData({ old_phone: c.customer_phone, customer_name: c.customer_name, customer_phone: c.customer_phone, customer_address: c.customer_address });
                        setShowModal(true);
                      }}>
                       <Edit2 size={16} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Customer Profile</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input type="text" className="form-control" required 
                    value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Phone (Mobile)</label>
                  <input type="text" className="form-control" required 
                    value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Address</label>
                  <textarea className="form-control" required value={formData.customer_address} 
                     onChange={e => setFormData({...formData, customer_address: e.target.value})} 
                     style={{ minHeight: '80px', resize: 'none' }}></textarea>
                </div>
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: 8, fontSize: '0.85rem' }}>
                   <strong>Note:</strong> Updating these details will retrospectively update all past bills for this customer ledger to maintain consistency.
                </div>
              </div>
              <div className="modal-footer">
                 <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                 <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
