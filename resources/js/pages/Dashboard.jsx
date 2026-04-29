import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../utils/api';
import { IndianRupee, Users, Package, AlertCircle, ShoppingCart, TrendingUp, CreditCard, Banknote, Clock, PlusCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        if (res.data && res.data.today_sales !== undefined) {
          setData(res.data);
        } else {
          setError('Invalid data received from server. Is the database set up?');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch dashboard data. Please check backend connection.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading robust dashboard data...</div>;
  if (error || !data) return (
    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--danger)' }}>
      <AlertCircle size={48} style={{ marginBottom: 16 }} />
      <h3>Error Loading Dashboard</h3>
      <p>{error || 'An unexpected error occurred.'}</p>
    </div>
  );

  const statCards = [
    { title: "Today's Revenue", value: `₹${data.today_sales}`, icon: IndianRupee, color: "var(--primary)" },
    { title: "Est. Gross Profit", value: `₹${data.today_profit}`, icon: TrendingUp, color: "var(--success)" },
    { title: "Pending Dues (Credit)", value: `₹${data.pending_dues?.reduce((a,b)=>a+b.due_amount, 0) || 0}`, icon: Clock, color: "var(--warning)" },
    { title: "Low Stock Items", value: data.low_stock_count, icon: AlertCircle, color: "var(--danger)" },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div>
      {/* Quick Action Shortcuts */}
      <div className="quick-actions-grid">
        <NavLink to="/billing" className="btn" style={{ padding: '16px', background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 12 }}>
          <ShoppingCart size={24} /> <strong>New POS Bill</strong>
        </NavLink>
        <NavLink to="/products" className="btn btn-outline" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 12 }}>
          <Package size={24} /> <strong>Add / Restock Products</strong>
        </NavLink>
        <NavLink to="/staff" className="btn btn-outline" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 12 }}>
          <Banknote size={24} /> <strong>Pay Advanced/Salary</strong>
        </NavLink>
        <NavLink to="/reports" className="btn btn-outline" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 12 }}>
          <TrendingUp size={24} /> <strong>View Business Reports</strong>
        </NavLink>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
            <stat.icon className="stat-icon" style={{ color: stat.color }} />
          </div>
        ))}
      </div>

      {/* Main Charts & Breakdowns */}
      <div className="charts-grid">
        {/* Chart */}
        <div className="chart-container">
          <h3>Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} width={80} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="chart-container">
          <h3>Today's Payment Breakdown</h3>
          {data.payment_breakdown && data.payment_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.payment_breakdown.map(p=>({...p, amount: parseFloat(p.amount)}))} dataKey="amount" nameKey="payment_method" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {data.payment_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 4 }} formatter={(val) => `₹${val}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No sales yet today.</div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
             {data.payment_breakdown?.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span style={{ textTransform: 'capitalize' }}>{p.payment_method}</span>: <strong>₹{parseFloat(p.amount)?.toFixed(2)}</strong>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="lists-grid">
        
        {/* Pending Customer Dues */}
        <div className="table-container" style={{ marginBottom: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="var(--warning)"/> Immediate Recoveries (Udhar)</h3>
          </div>
          <div className="table-responsive"><table style={{ fontSize: '0.9rem' }}>
            <tbody>
              {data.pending_dues?.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No pending credit sales.</td></tr>
              ) : data.pending_dues?.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.customer_name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.customer_phone || d.bill_number}</div>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                    ₹{d.due_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        {/* Immediate Restock List */}
        <div className="table-container" style={{ marginBottom: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18} color="var(--danger)"/> Critical Restock Required</h3>
          </div>
          <div className="table-responsive"><table style={{ fontSize: '0.9rem' }}>
            <tbody>
              {data.restock_list?.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>All items well stocked.</td></tr>
              ) : data.restock_list?.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.category?.name || 'Uncategorized'}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger">{r.quantity} {r.unit} left</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        {/* Top Categories */}
        <div className="table-container" style={{ marginBottom: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color="var(--success)"/> Top Performing Categories</h3>
          </div>
          <div className="table-responsive"><table style={{ fontSize: '0.9rem' }}>
            <tbody>
              {data.top_categories?.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No category data yet.</td></tr>
              ) : data.top_categories?.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.sold} units sold</div>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    ₹{c.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
      
      {/* Staff Expense Overview mapped from pending salaries optionally, skipping complex graph for brevity */}
      <div style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        Currently tracking ₹{data.pending_salaries} in unpaid salaries against ₹{data.month_sales} gross monthly revenue.
      </div>
    </div>
  );
};

export default Dashboard;
