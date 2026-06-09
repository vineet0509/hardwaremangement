import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { PackageX, Trash2 } from 'lucide-react';

const DamagedGoods = () => {
  const [damagedGoods, setDamagedGoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDamagedGoods = () => {
    setLoading(true);
    api.get('/damaged-goods')
      .then(res => setDamagedGoods(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDamagedGoods();
  }, []);

  const handleRevert = (id) => {
    Swal.fire({
      title: 'Revert this record?',
      text: "This will add the quantity back to your active stock.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/damaged-goods/${id}`)
          .then(() => {
            Swal.fire('Reverted!', 'Stock has been restored.', 'success');
            fetchDamagedGoods();
          })
          .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to revert record.', 'error'));
      }
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h2><PackageX size={24} style={{ marginRight: 10, verticalAlign: 'middle', color: 'var(--danger)' }} /> Damaged & Wastage History</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Track inventory lost to damage, expiry, or theft.</p>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: 0 }}>
            <thead style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</th>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Loss</th>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: 24, textAlign: 'center' }}>Loading history...</td></tr>
              ) : damagedGoods.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No damaged goods reported yet.</td></tr>
              ) : (
                damagedGoods.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', verticalAlign: 'middle', fontWeight: 500 }}>
                      {new Date(record.date).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      {record.product ? record.product.name : 'Unknown Product'}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      <span style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>
                        -{record.quantity} {record.product?.unit || 'pcs'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', fontWeight: 600 }}>
                      ₹{parseFloat(record.loss_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text-muted)' }}>
                      {record.reason || '-'}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <button onClick={() => handleRevert(record.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <Trash2 size={14} style={{ marginRight: 6 }} /> Revert
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DamagedGoods;
