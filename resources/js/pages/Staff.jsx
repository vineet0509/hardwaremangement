import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Plus, Banknote, Calendar, CheckCircle } from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  const [formData, setFormData] = useState({
    name: '', phone: '', role: 'Labour', monthly_salary: 0, 
    joining_date: new Date().toISOString().slice(0, 16), 
    emergency_contact: '', commission_percent: 0,
    enable_login: false, password: '',
    permissions: {
      can_edit_bills: false,
      can_manage_inventory: false,
      can_view_reports: false
    }
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
        setFormData({ 
          name: '', phone: '', role: 'Labour', monthly_salary: 0, 
          joining_date: new Date().toISOString().slice(0, 16), 
          emergency_contact: '', commission_percent: 0,
          enable_login: false, password: '',
          permissions: { can_edit_bills: false, can_manage_inventory: false, can_view_reports: false }
        });
      })
      .catch(err => alert(err.response?.data?.message || 'Error occurred while saving staff.'));
  };

  const handleEditStaff = (staff) => {
    setFormData({
      ...staff,
      joining_date: staff.joining_date ? staff.joining_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
      enable_login: !!staff.user_id,
      permissions: staff.permissions || { can_edit_bills: false, can_manage_inventory: false, can_view_reports: false }
    });
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const handleUpdateStaff = (e) => {
    e.preventDefault();
    api.put(`/staff/${selectedStaff.id}`, formData)
      .then(() => {
        setShowModal(false);
        fetchStaff();
        setSelectedStaff(null);
      })
      .catch(err => alert(err.response?.data?.message || 'Error updating staff.'));
  };

  const fetchPerformance = (staff) => {
    setSelectedStaff(staff);
    api.get(`/staff/${staff.id}/performance`)
      .then(res => {
        setPerformanceData(res.data);
        setShowPerformanceModal(true);
      })
      .catch(err => alert('Failed to fetch performance.'));
  };

  const fetchAttendance = (staff) => {
    setSelectedStaff(staff);
    api.get(`/staff/${staff.id}/attendances`)
      .then(res => {
        setAttendanceData(res.data);
        setShowAttendanceModal(true);
      })
      .catch(err => alert('Failed to fetch attendance.'));
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
        status: 'paid',
        payment_date: new Date().toISOString().slice(0, 10)
      })
      .then(() => { alert('Salary marked as paid!'); fetchStaff(); })
      .catch(err => alert(err.response?.data?.message || 'Error occurred.'));
    }
  };

  const handleToggleStatus = (s) => {
    const newStatus = s.status === 'active' ? 'inactive' : 'active';
    if(confirm(`Are you sure you want to mark ${s.name} as ${newStatus}?`)) {
      api.put(`/staff/${s.id}`, { status: newStatus })
        .then(() => fetchStaff())
        .catch(err => alert(err.response?.data?.message || 'Error updating status.'));
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
                <h3 style={{ margin: 0, color: 'var(--text-main)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleEditStaff(s)}>{s.name}</h3>
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

            <div className="d-flex gap-2 mb-2">
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => { setSelectedStaff(s); setShowAdvanceModal(true); }}>
                <Banknote size={16} /> Advance
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => paySalary(s)}>
                <CheckCircle size={16} /> Salary
              </button>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => fetchPerformance(s)}>
                Performance
              </button>
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => fetchAttendance(s)}>
                Attendance
              </button>
            </div>
            <div className="d-flex mt-2">
              <button 
                className={`btn btn-outline ${s.status === 'active' ? 'btn-danger' : 'btn-success'}`} 
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderColor: s.status === 'active' ? 'var(--danger)' : 'var(--success)', color: s.status === 'active' ? 'var(--danger)' : 'var(--success)' }} 
                onClick={() => handleToggleStatus(s)}>
                {s.status === 'active' ? 'Deactivate' : 'Activate'}
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
              <h3>{selectedStaff ? 'Edit Staff' : 'Add New Staff / Labour'}</h3>
              <button className="close-btn" onClick={() => { setShowModal(false); setSelectedStaff(null); }}>×</button>
            </div>
            <form onSubmit={selectedStaff ? handleUpdateStaff : handleAddStaff}>
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
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Emergency Contact</label>
                    <input type="text" className="form-control" value={formData.emergency_contact || ''} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Commission (%)</label>
                    <input type="number" step="0.1" className="form-control" value={formData.commission_percent || ''} onChange={e => setFormData({...formData, commission_percent: e.target.value})} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={formData.enable_login || false} onChange={e => setFormData({...formData, enable_login: e.target.checked})} style={{ width: 18, height: 18 }} />
                    Enable Login (Role: Staff)
                  </label>
                  <small style={{ color: 'var(--text-muted)' }}>They will log in using their phone number and the password below.</small>
                </div>
                {formData.enable_login && (
                  <div style={{ background: 'var(--bg-color)', padding: 16, borderRadius: 8, marginTop: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Login Password {selectedStaff && '(Leave blank to keep unchanged)'}</label>
                      <input type="text" className="form-control" required={!selectedStaff && formData.enable_login} placeholder="Minimum 6 characters" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    
                    <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: '0.9rem' }}>Permissions</h4>
                    <div className="d-flex" style={{ gap: 16, flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={formData.permissions.can_edit_bills} onChange={e => setFormData({...formData, permissions: {...formData.permissions, can_edit_bills: e.target.checked}})} />
                        Can Edit/Delete Bills
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={formData.permissions.can_manage_inventory} onChange={e => setFormData({...formData, permissions: {...formData.permissions, can_manage_inventory: e.target.checked}})} />
                        Can Manage Inventory
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={formData.permissions.can_view_reports} onChange={e => setFormData({...formData, permissions: {...formData.permissions, can_view_reports: e.target.checked}})} />
                        Can View Reports
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setSelectedStaff(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedStaff ? 'Update Staff' : 'Save Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPerformanceModal && performanceData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Performance: {selectedStaff?.name}</h3>
              <button className="close-btn" onClick={() => setShowPerformanceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-card">
                  <div className="stat-title">Bills Today</div>
                  <div className="stat-value">{performanceData.bills_today}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Revenue Today</div>
                  <div className="stat-value">₹{performanceData.revenue_today}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Bills This Month</div>
                  <div className="stat-value">{performanceData.bills_month}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Revenue This Month</div>
                  <div className="stat-value">₹{performanceData.revenue_month}</div>
                </div>
              </div>
              <div className="stat-card mt-3" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <div className="stat-title" style={{ color: 'var(--success)' }}>Est. Commission Earned This Month</div>
                <div className="stat-value text-success">₹{performanceData.commission_earned_month}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Based on {selectedStaff?.commission_percent || 0}% commission</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPerformanceModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Attendance: {selectedStaff?.name}</h3>
              <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {attendanceData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No attendance records found.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>
                          {record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-'}
                          {record.clock_in_location && (
                            <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                              <a href={`https://www.google.com/maps/search/?api=1&query=${record.clock_in_location}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>📍 Map</a>
                            </div>
                          )}
                        </td>
                        <td>
                          {record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-'}
                          {record.clock_out_location && (
                            <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                              <a href={`https://www.google.com/maps/search/?api=1&query=${record.clock_out_location}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>📍 Map</a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAttendanceModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
