import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { downloadFile } from '../utils/webview';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plData, setPlData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/reports/stock'),
      api.get('/reports/profit-loss')
    ]).then(([stockRes, plRes]) => {
         if (stockRes.data && stockRes.data.overview) {
           setData(stockRes.data);
         }
         if (plRes.data) {
           setPlData(plRes.data);
         }
    }).catch(err => {
         console.error(err);
         setError('Failed to fetch reports.');
    }).finally(() => setLoading(false));
  }, []);

  const handleGSTExport = () => {
    const token = localStorage.getItem('auth_token');
    const url = `${window.location.origin}/api/reports/gst-export?token=${token}`;
    // Use downloadFile helper — works in both browser and Android WebView
    downloadFile(url, `gstr1_export_${new Date().getTime()}.csv`, 'text/csv');
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileText color="var(--primary)"/> Business & Financial Reports
        </h2>
        <button onClick={handleGSTExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <FileText size={18} /> Export GSTR-1 (CSV)
        </button>
      </div>

      {plData && (
        <>
          <h3 style={{ marginBottom: 16 }}>This Month's Profit & Loss</h3>
          <div className="stats-grid" style={{ marginBottom: 32 }}>
            <div className="stat-card">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>₹{plData.revenue}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Cost of Goods (COGS)</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>₹{plData.cogs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Gross Profit</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>₹{plData.gross_profit}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Net Profit</div>
              <div className="stat-value" style={{ color: plData.net_profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{plData.net_profit}
              </div>
            </div>
          </div>
        </>
      )}

      <h3 style={{ marginBottom: 16 }}>Inventory Overview</h3>

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
