import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Receipt, Plus, Trash2, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    amount: '',
    description: ''
  });
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [dateFrom, dateTo]);

  const fetchExpenses = () => {
    setLoading(true);
    let url = '/expenses?';
    if (dateFrom) url += `date_from=${dateFrom}&`;
    if (dateTo) url += `date_to=${dateTo}&`;
    
    api.get(url)
      .then(res => {
        setExpenses(res.data);
        setLoading(false);
      })
      .catch(err => {
        Swal.fire('Error', 'Failed to load expenses', 'error');
        setLoading(false);
      });
  };

  const handleOpenModal = () => {
    setFormData({
      expense_date: new Date().toISOString().slice(0, 10),
      amount: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/expenses', formData)
      .then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Expense added!', showConfirmButton: false, timer: 1500 });
        setShowModal(false);
        fetchExpenses();
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Submission failed', 'error'));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/expenses/${id}`)
          .then(() => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Expense deleted', showConfirmButton: false, timer: 1500 });
            fetchExpenses();
          })
          .catch(err => Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error'));
      }
    });
  };

  const setQuickDate = (type) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (type === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (type === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else if (type === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading Expenses...</div>;

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
          <Receipt size={28} color="var(--primary)" />
          Other Expenses
        </h2>
        <button className="btn btn-primary" onClick={handleOpenModal} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="stat-card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('today')}>Today</button>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('this_month')}>This Month</button>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('all')}>All Time</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, alignItems: 'flex-end' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>From Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>To Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
              style={{ fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Recorded Expenses</div>
           <div style={{ fontSize: '2rem', color: 'var(--danger)', fontWeight: 800 }}>₹{totalExpenses.toFixed(2)}</div>
        </div>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '16px' }}>Date</th>
              <th style={{ padding: '16px' }}>Description</th>
              <th style={{ padding: '16px' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>{new Date(exp.expense_date).toLocaleDateString()}</td>
                <td style={{ padding: '16px' }}>{exp.description}</td>
                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--danger)' }}>
                  ₹{parseFloat(exp.amount).toFixed(2)}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => handleDelete(exp.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: 450, background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Record New Expense</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 6, fontWeight: 600 }}>Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required
                  value={formData.expense_date} 
                  onChange={e => setFormData({ ...formData, expense_date: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 6, fontWeight: 600 }}>Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount} 
                  onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 6, fontWeight: 600 }}>Description / Reason</label>
                <textarea 
                  className="form-control" 
                  style={{ resize: 'none', height: 80 }}
                  required
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={18} /> Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
