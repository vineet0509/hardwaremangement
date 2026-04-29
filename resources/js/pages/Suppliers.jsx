import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Truck, Phone, Mail, MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
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
        alert('Failed to load suppliers');
        setLoading(false);
      });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = editingSupplier 
      ? api.put(`/suppliers/${editingSupplier.id}`, formData)
      : api.post('/suppliers', formData);

    request.then(() => {
      alert(editingSupplier ? 'Supplier updated!' : 'Supplier added!');
      setShowModal(false);
      fetchSuppliers();
    }).catch(err => alert(err.response?.data?.message || 'Submission failed'));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this supplier?")) {
      api.delete(`/suppliers/${id}`)
        .then(() => {
          alert('Supplier removed successfully');
          fetchSuppliers();
        })
        .catch(err => alert(err.response?.data?.message || 'Delete failed'));
    }
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

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '16px' }}>Name</th>
              <th style={{ padding: '16px' }}>Phone</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Address</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => (
              <tr key={sup.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>{sup.name}</td>
                <td style={{ padding: '16px' }}>{sup.phone || 'N/A'}</td>
                <td style={{ padding: '16px' }}>{sup.email || 'N/A'}</td>
                <td style={{ padding: '16px', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sup.address || 'N/A'}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleOpenModal(sup)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDelete(sup.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default Suppliers;
