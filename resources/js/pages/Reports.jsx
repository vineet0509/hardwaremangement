import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Calling the stock report endpoint for a general overview report
    api.get('/reports/stock')
      .then(res => {
         if (res.data && res.data.overview) {
           setData(res.data);
         } else {
           setError('Invalid report data received.');
         }
      })
      .catch(err => {
         console.error(err);
         setError('Failed to fetch reports.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading reports...</div>;
  if (error || !data) return (
    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--danger)' }}>
      <AlertTriangle size={48} style={{ marginBottom: 16 }} />
      <h3>Error Loading Reports</h3>
      <p>{error || 'An unexpected error occurred.'}</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileText color="var(--primary)"/> Business & Stock Reports
        </h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Products in Stock</div>
          <div className="stat-value">{data.overview.total_products}</div>
          <TrendingUp className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-title">Low Stock Alert</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{data.overview.low_stock}</div>
          <AlertTriangle className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-title">Out of Stock</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{data.overview.out_of_stock}</div>
          <AlertTriangle className="stat-icon" style={{ color: 'var(--danger)' }} />
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Market Value</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>₹{data.overview.selling_value}</div>
          <TrendingUp className="stat-icon" />
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Recent Stock Transactions</h3>
        </div>
        <div className="table-responsive"><table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {(!data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) ? (
               <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent transactions found.</td></tr>
            ) : data.transactions.slice(0, 15).map(t => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.product?.name || `Product ID ${t.product_id}`}</td>
                <td>
                  <span className={`badge ${t.type === 'purchase' ? 'badge-success' : t.type === 'sale' ? 'badge-primary' : 'badge-warning'}`}>
                    {t.type}
                  </span>
                </td>
                <td style={{ color: t.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {t.quantity > 0 ? '+' : ''}{t.quantity}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{t.reference || t.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
};

export default Reports;
