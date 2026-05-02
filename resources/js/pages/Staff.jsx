import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Plus, Banknote, Calendar, CheckCircle } from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', role: 'Labour', monthly_salary: 0, joining_date: new Date().toISOString().slice(0, 16)
  });

  const [advanceData, setAdvanceData] = useState({
    amount: '', advance_date: new Date().toISOString().slice(0, 16), reason: ''
  });

  const fetchStaff = () => {
    setLoading(true);
    api.get('/staff')
      .then(res => setStaff(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = (e) => {
    e.preventDefault();
    api.post('/staff', formData)
      .then(() => { 
        setShowModal(false); 
        fetchStaff(); 
        setFormData({ name: '', phone: '', role: 'Labour', monthly_salary: 0, joining_date: new Date().toISOString().slice(0, 16) });
      })
      .catch(err => alert(err.response?.data?.message || 'Error occurred while saving staff.'));
  };

  const handleAddAdvance = (e) => {
    e.preventDefault();
    api.post(`/staff/${selectedStaff.id}/advance-payments`, advanceData)
      .then(() => { 
        setShowAdvanceModal(false); 
        fetchStaff(); 
        setAdvanceData({ amount: '', advance_date: new Date().toISOString().slice(0, 16), reason: '' });
      })
      .catch(err => alert(err.response?.data?.message || 'Error occurred while saving advance.'));
  };

  const paySalary = (s) => {
    // Basic simplified logic to pay current month salary 
    const isConfirmed = confirm(`Pay salary for ${s.name}? Basic: ₹${s.monthly_salary}`);
    if(isConfirmed) {
      api.post(`/staff/${s.id}/salary-records`, {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basic_salary: s.monthly_salary,
        paid_amount: s.monthly_salary,
        payment_date: new Date().toISOString().slice(0, 16)
      }).then(() => {
        alert('Salary paid successfully!');
        fetchStaff();
      }).catch(err => alert('Error: ' + err.response?.data?.message));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Users color="var(--primary)"/> Staff & Labour Management
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {loading ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '24px' }}>Loading...</div>
        ) : (!staff || !Array.isArray(staff) || staff.length === 0) ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '24px', color: 'var(--text-muted)' }}>No staff members found.</div>
        ) : staff.map(s => (
          <div key={s.id} className="stat-card" style={{ padding: '24px 20px' }}>
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{s.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.role} | {s.phone}</div>
              </div>
              <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {s.status}
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
              <div className="d-flex justify-content-between" style={{ marginBottom: 8, fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monthly Salary</span>
                <span style={{ fontWeight: 600 }}>₹{s.monthly_salary}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pending Advances</span>
                <span style={{ fontWeight: 600, color: s.pending_advance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ₹{s.pending_advance || 0}
                </span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => { setSelectedStaff(s); setShowAdvanceModal(true); }}>
                <Banknote size={16} /> Give Advance
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => paySalary(s)}>
                <CheckCircle size={16} /> Pay Salary
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdvanceModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Give Advance ({selectedStaff.name})</h3>
              <button className="close-btn" onClick={() => setShowAdvanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAdvance}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" className="form-control" required 
                    value={advanceData.amount} onChange={e => setAdvanceData({...advanceData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="datetime-local" className="form-control" required 
                    value={advanceData.advance_date} onChange={e => setAdvanceData({...advanceData, advance_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason / Notes</label>
                  <input type="text" className="form-control" 
                    value={advanceData.reason} onChange={e => setAdvanceData({...advanceData, reason: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdvanceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Advance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Staff / Labour</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Role</label>
                    <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="Manager">Manager</option>
                      <option value="Salesman">Salesman</option>
                      <option value="Labour">Labour</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input type="number" className="form-control" required value={formData.monthly_salary} onChange={e => setFormData({...formData, monthly_salary: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Joining Date</label>
                    <input type="datetime-local" className="form-control" required value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
