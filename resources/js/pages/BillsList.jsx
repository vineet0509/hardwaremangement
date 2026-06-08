import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { printHtml, downloadFile, openWhatsApp } from '../utils/webview';
import { getTermsAndConditions } from '../utils/terms';
import { Search, Receipt, Printer, Trash2, Banknote, X, Edit2, MessageSquare, FileText } from 'lucide-react';
import Pagination from '../components/Pagination';

import Swal from 'sweetalert2';

const BillsList = () => {
  const [bills, setBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ total_sale: 0, total_due: 0 });
  const [settings, setSettings] = useState({});
  const [whatsappLoading, setWhatsappLoading] = useState(null);
  const [user, setUser] = useState(null);

  const [showRepayModal, setShowRepayModal] = useState(false);
  const [targetBill, setTargetBill] = useState(null);
  const [repayData, setRepayData] = useState({ amount: '', method: 'cash', upi_digits: '' });



  const navigate = useNavigate();

  const [udharCustomers, setUdharCustomers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const fetchBills = () => {
    setLoading(true);
    let url = `/bills?search=${search}`;
    if (customerFilter) url += `&customer=${encodeURIComponent(customerFilter)}`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    api.get(url)
      .then(res => {
        setBills(res.data.data || res.data);
        setCurrentPage(1);
        if (res.data.summary_total_sale !== undefined) {
          setSummary({
            total_sale: res.data.summary_total_sale,
            total_due: res.data.summary_total_due
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [search, customerFilter, dateFrom, dateTo]);

  useEffect(() => {
    api.get('/udhar').then(res => setUdharCustomers(res.data)).catch(console.error);
    api.get('/settings').then(res => setSettings(res.data)).catch(console.error);
    api.get('/me').then(res => setUser(res.data)).catch(console.error);
  }, []);

  const deleteBill = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this bill? Stock will be restored.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/bills/${id}`)
          .then(() => fetchBills())
          .catch(err => Swal.fire(err.response?.data?.message || 'Error deleting bill'));
      }
    });
  };

  const handleRepay = (e) => {
    e.preventDefault();
    if (!repayData.amount || repayData.amount <= 0) return Swal.fire('Enter a valid amount.');
    if (repayData.method === 'upi' && repayData.upi_digits.length !== 5) return Swal.fire('Enter exactly 5 digits for UPI tracking.');

    api.post(`/bills/${targetBill.id}/repay`, repayData)
      .then(res => {
        Swal.fire(res.data.message);
        setShowRepayModal(false);
        fetchBills();
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Error processing repayment.'));
  };



  const sendWhatsAppReminder = async (billId) => {
    try {
      setWhatsappLoading(billId);
      const [billRes, settingsRes] = await Promise.all([
        api.get(`/bills/${billId}`),
        api.get('/settings')
      ]);
      const bill = billRes.data;
      const settings = settingsRes.data;

      if (!bill.customer_phone) return Swal.fire('No phone number available for this customer.');
      
      let wapn = bill.customer_phone.replace(/[^0-9]/g,'');
      if (wapn.length === 10) wapn = '91' + wapn;

      let msgText = '';
      
      const shopName = settings.company_name || 'VyaparSync';
      const gstStr = (bill.is_gst && settings.gst_number) ? `*GSTIN:* ${settings.gst_number}\n` : '';
      const pdfLink = `${window.location.origin}/api/bills/${bill.id}/pdf?token=${localStorage.getItem('auth_token')}`;

      if (bill.due_amount > 0) {
          msgText = `*Payment Reminder* ⏳\n${gstStr}-----------------------------------\nHello ${bill.customer_name},\nThis is a gentle reminder regarding your pending due for *Bill No: ${bill.bill_number}*.\n\n*Total Bill:* Rs. ${bill.total}\n*Amount Paid:* Rs. ${bill.paid_amount}\n*Balance Due:* Rs. ${bill.due_amount}\n\n*View PDF Bill:* ${pdfLink}\n\nPlease clear the pending amount at your earliest convenience.\nThank you!`;
      } else {
          const itemListStr = bill.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity} ${i.unit || ''}) = Rs.${i.total}`).join('\n') || '';
          msgText = `*${shopName} Invoice* 🧾\n${gstStr}-----------------------------------\nHello ${bill.customer_name},\nHere are the details for *Bill No: ${bill.bill_number}*.\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${bill.total}\n*Amount Paid:* Rs. ${bill.paid_amount}\n*Balance Due:* Rs. ${bill.due_amount}\n\n*View PDF Bill:* ${pdfLink}\n\nThank you for shopping with us!`;
      }

      // Use openWhatsApp helper — works in both browser and Android WebView
      openWhatsApp(wapn, msgText);
    } catch (err) {
      Swal.fire('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setWhatsappLoading(null);
    }
  };

  const printBill = async (id) => {
    try {
      const [billRes, settingsRes] = await Promise.all([
        api.get(`/bills/${id}`),
        api.get('/settings')
      ]);
      const bill = billRes.data;
      const settings = settingsRes.data;

      // Use printHtml helper — works in both browser and Android WebView
      printHtml(`
        <html>
          <head>
            <title>Invoice - ${bill.bill_number}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0 0 10px 0; color: #0f172a; }
              .header p { margin: 4px 0; color: #64748b; }
              .details { display: flex; justify-content: space-between; margin-bottom: 30px; line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; text-align: left; }
              th { background-color: #f8fafc; font-weight: 600; color: #475569; border-top: 1px solid #e2e8f0; }
              .text-right { text-align: right; }
              .totals { width: 300px; margin-left: auto; line-height: 1.8; }
              .totals .row { display: flex; justify-content: space-between; }
              .totals .grand-total { font-size: 1.3rem; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
              .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px dashed #cbd5e1; color: #64748b; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${settings.company_name || 'VyaparSync'}</h1>
              <p>${settings.company_address || ''}</p>
              <p>Ph: ${settings.company_phone || ''}</p>
              ${(bill.is_gst && settings.gst_number) ? `<p><strong>GSTIN: ${settings.gst_number}</strong></p>` : ''}
            </div>
            
            <div class="details">
              <div>
                <strong style="color: #64748b;">BILLED TO:</strong><br/>
                <strong style="font-size: 1.1rem;">${bill.customer_name || 'Walk-in Customer'}</strong><br/>
                ${bill.customer_phone ? 'Phone: ' + bill.customer_phone + '<br/>' : ''}
                ${bill.customer_address ? 'Address: ' + bill.customer_address : ''}
              </div>
              <div style="text-align: right;">
                <strong>INVOICE NO:</strong> ${bill.bill_number}<br/>
                <strong>DATE:</strong> ${new Date(bill.created_at).toLocaleString()}<br/>
                <strong>PAYMENT MODE:</strong> <span style="text-transform: capitalize;">${bill.payment_method}</span>
              </div>
            </div>

            <div class="table-responsive"><table>
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Discount</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${bill.items.map(item => `
                  <tr>
                    <td>
                       <div style="font-weight: 600;">${item.product_name}</div>
                       ${item.description ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity} ${item.unit || ''}</td>
                    <td class="text-right">₹${item.price}</td>
                    <td class="text-right">₹${item.discount}</td>
                    <td class="text-right font-weight-bold">₹${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table></div>

            <div class="totals">
              <div class="row"><span>Subtotal:</span> <span>₹${bill.subtotal}</span></div>
              <div class="row"><span>Discount:</span> <span>₹${bill.discount}</span></div>
              ${parseFloat(bill.other_charges) > 0 ? `
              <div class="row"><span>Other Charges:</span> <span>+ ₹${bill.other_charges}</span></div>
              ` : ''}
              ${bill.is_gst ? `
                <div class="row"><span>CGST (9%):</span> <span>₹${(bill.tax / 2).toFixed(2)}</span></div>
                <div class="row"><span>SGST (9%):</span> <span>₹${(bill.tax / 2).toFixed(2)}</span></div>
              ` : ''}
              ${parseFloat(bill.total) !== (parseFloat(bill.subtotal) - parseFloat(bill.discount) + parseFloat(bill.other_charges || 0)) ? `
                <div class="row"><span>Round Off:</span> <span>₹${(parseFloat(bill.total) - (parseFloat(bill.subtotal) - parseFloat(bill.discount) + parseFloat(bill.other_charges || 0))).toFixed(2)}</span></div>
              ` : ''}
              <div class="row grand-total"><span>Grand Total:</span> <span>₹${bill.total}</span></div>
              <div style="height: 15px;"></div>
              <div class="row" style="color: #10b981;"><span>Amount Paid:</span> <span>₹${bill.paid_amount}</span></div>
              <div class="row" style="color: #ef4444;"><span>Balance Due:</span> <span>₹${bill.due_amount}</span></div>
            </div>
            
            ${(bill.payment_method === 'upi' && settings.upi_qr_code) ? `
              <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Scan to Pay via UPI</strong></p>
                <img src="${settings.upi_qr_code}" alt="UPI QR" style="width: 120px; height: 120px; border: 1px solid #ccc; padding: 5px; border-radius: 5px;">
              </div>
            ` : ''}

            <div class="footer">
              <p>This is a computer generated invoice. No signature required.</p>
              <p><strong>Terms & Conditions:</strong> ${getTermsAndConditions(settings.business_type)}</p>
            </div>
            </div>
            
            <script>
              window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; }
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      Swal.fire('Error generating print layout: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExport = () => {
    let url = `${window.location.origin}/api/bills/export?token=${localStorage.getItem('auth_token')}&search=${search}`;
    if (customerFilter) url += `&customer=${encodeURIComponent(customerFilter)}`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    // Use downloadFile helper — works in both browser and Android WebView
    downloadFile(url, `bills_export_${dateFrom}_to_${dateTo}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const setQuickDate = (type) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (type === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (type === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      setDateFrom(yesterdayStr);
      setDateTo(yesterdayStr);
    } else if (type === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    }
  };

  return (
    <div>
      <div className="stat-card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('today')}>Today</button>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('yesterday')}>Yesterday</button>
           <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setQuickDate('this_month')}>This Month</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, alignItems: 'flex-end' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>Search Bills</label>
            <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Bill No / Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>Filter Customer</label>
            <select 
              className="form-control" 
              value={customerFilter} 
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            >
              <option value="">All Customers</option>
              {udharCustomers.map((c, i) => (
                <option key={i} value={c.customer_name}>{c.customer_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>From Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateFrom} 
              onChange={(e) => {
                const newFrom = e.target.value;
                setDateFrom(newFrom);
                if (newFrom && dateTo) {
                  const from = new Date(newFrom);
                  const to = new Date(dateTo);
                  if (to < from || (to - from) / (1000 * 60 * 60 * 24) > 31) {
                    const newTo = new Date(from);
                    newTo.setDate(newTo.getDate() + 31);
                    setDateTo(newTo.toISOString().split('T')[0]);
                  }
                }
              }} 
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>To Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateTo} 
              min={dateFrom}
              max={dateFrom ? new Date(new Date(dateFrom).getTime() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newTo = e.target.value;
                if (dateFrom) {
                  const from = new Date(dateFrom);
                  const to = new Date(newTo);
                  if (to < from) return setDateTo(dateFrom);
                  if ((to - from) / (1000 * 60 * 60 * 24) > 31) {
                    Swal.fire('Notice', 'Maximum date range is 1 month.', 'info');
                    const maxTo = new Date(from);
                    maxTo.setDate(maxTo.getDate() + 31);
                    return setDateTo(maxTo.toISOString().split('T')[0]);
                  }
                }
                setDateTo(newTo);
              }} 
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              className="btn btn-outline" 
              style={{ 
                flex: 1,
                padding: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8, 
                borderColor: 'var(--success)', 
                color: 'var(--success)', 
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.05)'
              }}
              onClick={handleExport}
            >
              <FileText size={18} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        {(() => {
          const totalPages = Math.ceil((bills || []).length / itemsPerPage);
          const currentBills = (bills || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
          
          return (
            <>
              <div className="table-responsive">
                <table className="table">
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Created By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (!currentBills || !Array.isArray(currentBills) || currentBills.length === 0) ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bills found.</td></tr>
            ) : currentBills.map(b => (
              <tr key={b.id} style={{ background: b.type === 'return' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                <td style={{ fontWeight: 600, color: b.type === 'return' ? 'var(--danger)' : 'var(--primary)' }}>
                  {b.bill_number}
                  {b.type === 'return' && <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: '0.7rem' }}>RETURN</span>}
                  <div className="action-btns" style={{ marginTop: 12 }}>
                    {b.due_amount > 0 && (
                      <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => {
                        setTargetBill(b);
                        setRepayData({ amount: b.due_amount, method: 'cash', upi_digits: '' });
                        setShowRepayModal(true);
                      }} title="Settle Due Amount">
                        <Banknote size={16} /><span className="btn-label">Settle</span>
                      </button>
                    )}

                    <button className="btn btn-outline" onClick={() => navigate('/billing', { state: { editBillId: b.id } })} title="Edit Bill">
                      <Edit2 size={16} color="var(--primary)" /><span className="btn-label">Edit</span>
                    </button>
                    <button className="btn btn-outline" onClick={() => printBill(b.id)} title="View/Print Invoice">
                      <Printer size={16} color="var(--primary)" /><span className="btn-label">Print</span>
                    </button>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }} onClick={() => downloadFile(`${window.location.origin}/api/bills/${b.id}/pdf?token=${localStorage.getItem('auth_token')}`, `bill_${b.bill_number}.pdf`, 'application/pdf')} title="Download Official PDF">
                      <FileText size={16} color="var(--primary)" /><span className="btn-label">PDF</span>
                    </button>
                    {b.customer_phone && (
                      <button 
                        className="btn btn-outline" 
                        style={{ borderColor: '#22c55e', color: '#22c55e', opacity: whatsappLoading === b.id ? 0.5 : 1 }} 
                        onClick={() => sendWhatsAppReminder(b.id)} 
                        disabled={whatsappLoading === b.id}
                        title={b.due_amount > 0 ? "Send WhatsApp Due Reminder" : "Send WhatsApp Bill Copy"}
                      >
                        {whatsappLoading === b.id ? '...' : <><MessageSquare size={16} /><span className="btn-label">WhatsApp</span></>}
                      </button>
                    )}
                    {user?.role !== 'staff' && (
                      <button className="btn btn-outline" onClick={() => deleteBill(b.id)} title="Delete Bill & Restore Stock">
                        <Trash2 size={16} color="var(--danger)" /><span className="btn-label">Delete</span>
                      </button>
                    )}
                  </div>
                </td>
                <td>{new Date(b.created_at).toLocaleString()}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.customer_name || 'Walk-in'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_phone}</div>
                  {b.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4, fontWeight: 500 }}>
                      {b.notes}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>₹{b.total}</td>
                <td style={{ color: 'var(--success)' }}>
                  <div style={{ fontWeight: 600 }}>₹{b.paid_amount}</div>
                </td>
                <td style={{ color: 'var(--danger)' }}>₹{b.due_amount}</td>
                <td>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    {b.creator ? b.creator.name : 'Admin'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${b.status === 'paid' ? 'badge-success' : b.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                    {b.status}
                  </span>
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
        
        <div style={{ padding: '16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '24px', fontWeight: 'bold' }}>
           <div style={{ fontSize: '1.1rem' }}>Total Sale: <span style={{ color: 'var(--primary)' }}>₹{Number(summary.total_sale).toFixed(2)}</span></div>
           <div style={{ fontSize: '1.1rem' }}>Total Due: <span style={{ color: 'var(--danger)' }}>₹{Number(summary.total_due).toFixed(2)}</span></div>
        </div>
      </div>

      {showRepayModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Settle Pending Due</h3>
              <button className="close-btn" onClick={() => setShowRepayModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>
                <strong>Customer:</strong> {targetBill?.customer_name || 'Walk-in'}<br/>
                <strong>Bill No:</strong> {targetBill?.bill_number}<br/>
                <strong style={{ color: 'var(--danger)' }}>Total Pending: ₹{targetBill?.due_amount}</strong>
              </p>
              <form onSubmit={handleRepay}>
                <div className="form-group">
                  <label className="form-label">Amount Paying Now (₹)</label>
                  <input type="number" className="form-control" value={repayData.amount} onChange={e => setRepayData({...repayData, amount: e.target.value})} max={targetBill?.due_amount} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={repayData.method} onChange={e => setRepayData({...repayData, method: e.target.value})}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / Online</option>
                  </select>
                </div>
                {repayData.method === 'upi' && (
                  <div className="form-group">
                    <label className="form-label">UPI Last 5 Digits</label>
                    <input type="text" className="form-control" maxLength="5" value={repayData.upi_digits} onChange={e => setRepayData({...repayData, upi_digits: e.target.value.replace(/[^0-9]/g, '')})} required />
                  </div>
                )}
                <div className="modal-footer" style={{ padding: 0, marginTop: 24, paddingTop: 24, borderTop: 'none' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Process Repayment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default BillsList;
