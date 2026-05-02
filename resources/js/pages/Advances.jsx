import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Plus, Calendar, User, IndianRupee, Trash2, X, CheckSquare } from 'lucide-react';

const Advances = () => {
  const [advances, setAdvances] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    staff_id: '', 
    amount: '', 
    reason: '', 
    advance_date: new Date().toISOString().slice(0, 16) 
  });

  const fetchAdvances = () => {
    setLoading(true);
    api.get('/staff-advances')
      .then(res => setAdvances(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStaff = () => {
    api.get('/staff')
      .then(res => setStaffList(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAdvances();
    fetchStaff(); // Needed for the 'Take New Advance' dropdown
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return alert('Enter a valid amount.');
    if (!formData.staff_id) return alert('Please select a staff member.');

    api.post(`/staff/${formData.staff_id}/advance-payments`, formData)
      .then(res => {
        alert('Advance recorded successfully!');
        setShowModal(false);
        setFormData({ staff_id: '', amount: '', reason: '', advance_date: new Date().toISOString().slice(0, 16) });
        fetchAdvances();
      })
      .catch(err => alert(err.response?.data?.message || 'Error processing advance.'));
  };

  const deleteAdvance = (id) => {
    if(confirm('Are you sure you want to delete this staff advance?')) {
      api.delete(`/advance-payments/${id}`)
        .then(() => fetchAdvances())
        .catch(err => alert(err.response?.data?.message || 'Error deleting.'));
    }
  };

  const markDeducted = (id) => {
    if(confirm('Mark this advance as deducted from their salary?')) {
      api.patch(`/advance-payments/${id}/deducted`)
        .then(() => fetchAdvances())
        .catch(err => alert(err.response?.data?.message || 'Error updating status.'));
    }
  }

  // Filter based on search (searching staff name)
  const filteredAdvances = advances.filter(a => 
     a.staff?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 400 }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Staff Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Give Staff Advance
        </button>
      </div>

      <div className="table-container">
        <div className="table-responsive"><table>
          <thead>
            <tr>
              <th>Advance Date</th>
              <th>Staff Member</th>
              <th className="text-right">Advance Amount</th>
              <th>Reason / Notes</th>
              <th>Status</th>
              <th width="150">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : filteredAdvances.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No staff advances found.</td></tr>
            ) : filteredAdvances.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{new Date(a.advance_date).toLocaleString()}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{a.staff?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.staff?.role || 'Staff'}</div>
                </td>
                <td className="text-right">
                  <strong style={{ color: 'var(--danger)' }}>₹{a.amount}</strong>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                 {a.reason || '-'}
                </td>
                <td>
                  <span className={`badge ${a.status === 'deducted' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'uppercase' }}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {a.status === 'pending' && (
                      <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => markDeducted(a.id)} title="Mark Deducted">
                        <CheckSquare size={16} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => deleteAdvance(a.id)} title="Delete Advance">
                      <Trash2 size={16} />
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
              <h3>Give Staff Advance</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label"><Calendar size={14} style={{ marginRight: 6 }}/>Advance Date</label>
                  <input type="datetime-local" className="form-control" value={formData.advance_date} onChange={e => setFormData({...formData, advance_date: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group mb-0">
                    <label className="form-label"><User size={14} style={{ marginRight: 6 }}/>Select Staff Member</label>
                    <select className="form-control" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} required>
                      <option value="">-- Choose Staff --</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 24 }}>
                  <div className="form-group mb-0">
                    <label className="form-label"><IndianRupee size={14} style={{ marginRight: 6 }}/>Advance Amount (₹)</label>
                    <input type="number" className="form-control" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="1" />
                  </div>
                  <div className="form-group mb-0" style={{ marginTop: 12 }}>
                    <label className="form-label">Reason / Notes (Optional)</label>
                    <input type="text" className="form-control" placeholder="e.g. Medical emergency" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: 0, marginTop: 16, paddingTop: 16, borderTop: 'none' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Save Staff Advance</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advances;
