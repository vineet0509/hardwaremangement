import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Truck, Phone, Mail, MapPin, Plus, Edit, Trash2, Save, X, IndianRupee, FileText } from 'lucide-react';
import Pagination from '../components/Pagination';

import Swal from 'sweetalert2';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [ledgerFormData, setLedgerFormData] = useState({
    type: 'payment',
    amount: '',
    transaction_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    setLoading(true);
    api.get('/suppliers')
      .then(res => {
        setSuppliers(res.data);
        setLoading(false);
      })
      .catch(err => {
        Swal.fire('Failed to load suppliers');
        setLoading(false);
      });
  };

  const fetchLedger = (supplierId) => {
    api.get(`/suppliers/${supplierId}/transactions`)
      .then(res => setLedgerTransactions(res.data))
      .catch(err => Swal.fire('Failed to load transaction logs.'));
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  const handleOpenLedger = (supplier) => {
    setSelectedSupplier(supplier);
    fetchLedger(supplier.id);
    setShowLedgerModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = editingSupplier 
      ? api.put(`/suppliers/${editingSupplier.id}`, formData)
      : api.post('/suppliers', formData);

    request.then(() => {
      Swal.fire(editingSupplier ? 'Supplier updated!' : 'Supplier added!');
      setShowModal(false);
      fetchSuppliers();
    }).catch(err => Swal.fire(err.response?.data?.message || 'Submission failed'));
  };

  const handleLedgerSubmit = (e) => {
    e.preventDefault();
    api.post(`/suppliers/${selectedSupplier.id}/transactions`, ledgerFormData)
      .then(() => {
        Swal.fire('Transaction recorded successfully!');
        setLedgerFormData({
          type: 'payment',
          amount: '',
          transaction_date: new Date().toISOString().slice(0, 16),
          notes: ''
        });
        fetchLedger(selectedSupplier.id);
        fetchSuppliers(); 
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Transaction logging failed.'));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to remove this supplier?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/suppliers/${id}`)
          .then(() => {
            Swal.fire('Supplier removed successfully');
            fetchSuppliers();
          })
          .catch(err => Swal.fire(err.response?.data?.message || 'Delete failed'));
      }
    });
  };

  if (loading) return <div style={{ padding: 20 }}>Loading Supplier List...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
          <Truck size={28} color="var(--primary)" />
          Supplier Directory
        </h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        {(() => {
          const totalPages = Math.ceil((suppliers || []).length / itemsPerPage);
          const currentSuppliers = (suppliers || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
          
          return (
            <>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '16px' }}>Name</th>
              <th style={{ padding: '16px' }}>Phone</th>
              <th style={{ padding: '16px' }}>Address</th>
              <th style={{ padding: '16px' }}>Total Due</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center' }}>Loading suppliers...</td></tr>
            ) : (!currentSuppliers || currentSuppliers.length === 0) ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers recorded.</td></tr>
            ) : currentSuppliers.map(sup => (
              <tr key={sup.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>
                  {sup.name}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button 
                      className="btn btn-secondary" 
                      title="Ledger History"
                      style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                      onClick={() => handleOpenLedger(sup)}
                    >
                      <FileText size={14} /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Ledger</span>
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px' }}
                      title="Edit"
                      onClick={() => handleOpenModal(sup)}
                    >
                      <Edit size={14} /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Edit</span>
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '4px 8px' }}
                      title="Delete"
                      onClick={() => handleDelete(sup.id)}
                    >
                      <Trash2 size={14} /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Delete</span>
                    </button>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>{sup.phone || 'N/A'}</td>
                <td style={{ padding: '16px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sup.address || 'N/A'}</td>
                <td style={{ padding: '16px', fontWeight: 700, color: (sup.total_due > 0) ? 'var(--danger)' : 'var(--success)' }}>
                  ₹{sup.total_due || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
        );
      })()}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: 450, background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              {editingSupplier ? 'Update Supplier' : 'Register New Supplier'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Supplier Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Physical Address</label>
                <textarea 
                  className="form-control" 
                  style={{ resize: 'none', height: 80 }}
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={18} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Transactions Modal */}
      {showLedgerModal && selectedSupplier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{selectedSupplier.name} - Ledger Log</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowLedgerModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
              {/* Transaction Creation Form */}
              <form onSubmit={handleLedgerSubmit} style={{ background: 'rgba(0,0,0,0.05)', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Record New Entry</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Type</label>
                    <select 
                      className="form-control" 
                      style={{ padding: 8 }}
                      value={ledgerFormData.type} 
                      onChange={e => setLedgerFormData({ ...ledgerFormData, type: e.target.value })}
                    >
                      <option value="payment">Payment Done (To Supplier)</option>
                      <option value="purchase">Purchase Due (Stock Taken)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Amount (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ padding: 8 }}
                      required 
                      value={ledgerFormData.amount} 
                      onChange={e => setLedgerFormData({ ...ledgerFormData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Date</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      style={{ padding: 8 }}
                      required 
                      value={ledgerFormData.transaction_date} 
                      onChange={e => setLedgerFormData({ ...ledgerFormData, transaction_date: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Notes</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: 8 }}
                      placeholder="Bill No, item context etc." 
                      value={ledgerFormData.notes} 
                      onChange={e => setLedgerFormData({ ...ledgerFormData, notes: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Record</button>
                </div>
              </form>

              {/* Transaction History Table */}
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: 8 }}>Date</th>
                      <th style={{ padding: 8 }}>Type</th>
                      <th style={{ padding: 8 }}>Amount</th>
                      <th style={{ padding: 8 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 8 }}>{new Date(tx.transaction_date).toLocaleString()}</td>
                        <td style={{ padding: 8 }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                            color: tx.type === 'purchase' ? 'var(--danger)' : 'var(--success)'
                          }}>
                            {tx.type === 'purchase' ? 'Purchase' : 'Payment'}
                          </span>
                        </td>
                        <td style={{ padding: 8, fontWeight: 600 }}>₹{tx.amount}</td>
                        <td style={{ padding: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tx.notes || '-'}</td>
                      </tr>
                    ))}
                    {ledgerTransactions.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No entries recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Outstanding Due: <span style={{ color: selectedSupplier.total_due > 0 ? 'var(--danger)' : 'var(--success)' }}>₹{selectedSupplier.total_due || 0}</span>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowLedgerModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
