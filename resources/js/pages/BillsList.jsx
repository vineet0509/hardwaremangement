import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Receipt, Printer, Trash2, Banknote, X, Edit2, MessageSquare } from 'lucide-react';

const BillsList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showRepayModal, setShowRepayModal] = useState(false);
  const [targetBill, setTargetBill] = useState(null);
  const [repayData, setRepayData] = useState({ amount: '', method: 'cash', upi_digits: '' });

  const navigate = useNavigate();

  const [udharCustomers, setUdharCustomers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchBills = () => {
    setLoading(true);
    let url = `/bills?search=${search}`;
    if (customerFilter) url += `&customer=${encodeURIComponent(customerFilter)}`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    api.get(url)
      .then(res => setBills(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [search, customerFilter, dateFrom, dateTo]);

  useEffect(() => {
    api.get('/udhar').then(res => setUdharCustomers(res.data)).catch(console.error);
  }, []);

  const deleteBill = (id) => {
    if(confirm('Are you sure you want to delete this bill? Stock will be restored.')) {
      api.delete(`/bills/${id}`)
        .then(() => fetchBills())
        .catch(err => alert(err.response?.data?.message || 'Error deleting bill'));
    }
  };

  const handleRepay = (e) => {
    e.preventDefault();
    if (!repayData.amount || repayData.amount <= 0) return alert('Enter a valid amount.');
    if (repayData.method === 'upi' && repayData.upi_digits.length !== 5) return alert('Enter exactly 5 digits for UPI tracking.');

    api.post(`/bills/${targetBill.id}/repay`, repayData)
      .then(res => {
        alert(res.data.message);
        setShowRepayModal(false);
        fetchBills();
      })
      .catch(err => alert(err.response?.data?.message || 'Error processing repayment.'));
  };

  const sendWhatsAppReminder = (bill) => {
    if (!bill.customer_phone) return alert('No phone number available for this customer.');
    
    let wapn = bill.customer_phone.replace(/[^0-9]/g,'');
    if (wapn.length === 10) wapn = '91' + wapn;

    let msgText = '';
    
    if (bill.due_amount > 0) {
        msgText = `*Payment Reminder* ⏳\n-----------------------------------\nHello ${bill.customer_name},\nThis is a gentle reminder regarding your pending due for *Bill No: ${bill.bill_number}*.\n\n*Total Bill:* Rs. ${bill.total}\n*Amount Paid:* Rs. ${bill.paid_amount}\n*Balance Due:* Rs. ${bill.due_amount}\n\nPlease clear the pending amount at your earliest convenience.\nThank you!`;
    } else {
        const itemListStr = bill.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity})`).join('\n') || '';
        msgText = `*Invoice Details* 🧾\n-----------------------------------\nHello ${bill.customer_name},\nHere are the details for *Bill No: ${bill.bill_number}*.\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${bill.total}\n*Amount Paid:* Rs. ${bill.paid_amount}\n*Balance Due:* Rs. ${bill.due_amount}\n\nThank you for shopping with us!`;
    }

    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${wapn}?text=${msg}`, '_blank');
  };

  const printBill = async (id) => {
    try {
      const [billRes, settingsRes] = await Promise.all([
        api.get(`/bills/${id}`),
        api.get('/settings')
      ]);
      const bill = billRes.data;
      const settings = settingsRes.data;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
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
              <h1>${settings.company_name || 'Hardware Shop'}</h1>
              <p>${settings.company_address || ''}</p>
              <p>Ph: ${settings.company_phone || ''}</p>
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
                <strong>DATE:</strong> ${new Date(bill.created_at).toLocaleDateString()}<br/>
                <strong>PAYMENT MODE:</strong> <span style="text-transform: capitalize;">${bill.payment_method}</span>
              </div>
            </div>

            <div className="table-responsive"><table>
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
                       ${item.product && item.product.description ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${item.product.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
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
              <div class="row grand-total"><span>Grand Total:</span> <span>₹${bill.total}</span></div>
              <div style="height: 15px;"></div>
              <div class="row" style="color: #10b981;"><span>Amount Paid:</span> <span>₹${bill.paid_amount}</span></div>
              <div class="row" style="color: #ef4444;"><span>Balance Due:</span> <span>₹${bill.due_amount}</span></div>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
            
            <script>
              window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      alert('Error generating print layout: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 2, minWidth: 300 }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Bill No or Customer Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
          <select 
            className="form-control" 
            value={customerFilter} 
            onChange={(e) => setCustomerFilter(e.target.value)}
            style={{ padding: '8px 16px', maxWidth: 200 }}
          >
            <option value="">All Customers</option>
            {udharCustomers.map((c, i) => (
              <option key={i} value={c.customer_name}>{c.customer_name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 300, justifyContent: 'flex-end' }}>
          <input 
            type="date" 
            className="form-control" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
            style={{ padding: '8px 16px', maxWidth: 150 }}
            title="Start Date"
          />
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>to</span>
          <input 
            type="date" 
            className="form-control" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
            style={{ padding: '8px 16px', maxWidth: 150 }}
            title="End Date"
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive"><table>
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (!bills || !Array.isArray(bills) || bills.length === 0) ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bills found.</td></tr>
            ) : bills.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{b.bill_number}</td>
                <td>{new Date(b.created_at).toLocaleDateString()}</td>
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
                <td style={{ color: 'var(--success)' }}>₹{b.paid_amount}</td>
                <td style={{ color: 'var(--danger)' }}>₹{b.due_amount}</td>
                <td>
                  <span className={`badge ${b.status === 'paid' ? 'badge-success' : b.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {b.due_amount > 0 && (
                      <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => {
                        setTargetBill(b);
                        setRepayData({ amount: b.due_amount, method: 'cash', upi_digits: '' });
                        setShowRepayModal(true);
                      }} title="Settle Due Amount">
                        <Banknote size={16} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => navigate('/billing', { state: { editBillId: b.id } })} title="Edit Bill">
                      <Edit2 size={16} color="var(--primary)" />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => printBill(b.id)} title="View/Print Invoice">
                      <Printer size={16} color="var(--primary)" />
                    </button>
                    {b.customer_phone && (
                      <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: '#22c55e', color: '#22c55e' }} onClick={() => sendWhatsAppReminder(b)} title={b.due_amount > 0 ? "Send WhatsApp Due Reminder" : "Send WhatsApp Bill Copy"}>
                        <MessageSquare size={16} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => deleteBill(b.id)} title="Delete Bill & Restore Stock">
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
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
