import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Printer, Trash2, MessageSquare, Plus, FileText, Edit2 } from 'lucide-react';

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchQuotations = () => {
    setLoading(true);
    api.get('/quotations')
      .then(res => setQuotations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filteredQuotations = quotations.filter(q => 
    (q.quotation_number?.toLowerCase().includes(search.toLowerCase())) ||
    (q.customer_name?.toLowerCase().includes(search.toLowerCase())) ||
    (q.customer_phone?.includes(search))
  );

  const deleteQuotation = (id) => {
    if(confirm('Are you sure you want to delete this quotation?')) {
      api.delete(`/quotations/${id}`)
        .then(() => fetchQuotations())
        .catch(err => alert(err.response?.data?.message || 'Error deleting quotation'));
    }
  };

  const sendWhatsAppQuote = (quotation) => {
    if (!quotation.customer_phone) return alert('No phone number available for this customer.');
    
    let wapn = quotation.customer_phone.replace(/[^0-9]/g,'');
    if (wapn.length === 10) wapn = '91' + wapn;

    const itemListStr = quotation.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity})`).join('\n') || '';
    const msgText = `*Quotation Details* 📝\n-----------------------------------\nHello ${quotation.customer_name},\nHere are the details for *Quotation No: ${quotation.quotation_number}*.\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Estimate:* Rs. ${quotation.total}\n\nThis is an estimate. Please contact us for more details.`;

    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${wapn}?text=${msg}`, '_blank');
  };

  const printQuotation = async (id) => {
    try {
      const [quoteRes, settingsRes] = await Promise.all([
        api.get(`/quotations/${id}`),
        api.get('/settings')
      ]);
      const quote = quoteRes.data;
      const settings = settingsRes.data;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Quotation - ${quote.quotation_number}</title>
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
              <h2 style="margin-top: 15px; color: #3b82f6;">ESTIMATE / QUOTATION</h2>
            </div>
            
            <div class="details">
              <div>
                <strong style="color: #64748b;">QUOTATION FOR:</strong><br/>
                <strong style="font-size: 1.1rem;">${quote.customer_name || 'Walk-in Customer'}</strong><br/>
                ${quote.customer_phone ? 'Phone: ' + quote.customer_phone + '<br/>' : ''}
                ${quote.customer_address ? 'Address: ' + quote.customer_address : ''}
              </div>
              <div style="text-align: right;">
                <strong>QUOTATION NO:</strong> ${quote.quotation_number}<br/>
                <strong>DATE:</strong> ${new Date(quote.created_at).toLocaleString()}<br/>
              </div>
            </div>

            <div className="table-responsive"><table>
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${quote.items.map(item => `
                  <tr>
                    <td>
                       <div style="font-weight: 600;">${item.product_name}</div>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td class="text-right">₹${item.price}</td>
                    <td class="text-right font-weight-bold">₹${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table></div>

            <div class="totals">
              <div class="row"><span>Subtotal:</span> <span>₹${quote.subtotal}</span></div>
              <div class="row"><span>Discount:</span> <span>₹${quote.discount}</span></div>
              <div class="row grand-total" style="color: #3b82f6;"><span>Total Estimate:</span> <span>₹${quote.total}</span></div>
            </div>

            <div class="footer">
              <p>This is an estimate and subject to change. Thank you!</p>
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
              placeholder="Search by Quotation No, Customer Name or Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => navigate('/quotations/create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={18} /> New Quotation
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive"><table>
          <thead>
            <tr>
              <th>Quotation No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items Count</th>
              <th>Total Estimate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (!filteredQuotations || filteredQuotations.length === 0) ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No quotations found.</td></tr>
            ) : filteredQuotations.map(q => (
              <tr key={q.id}>
                <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{q.quotation_number}</td>
                <td>{new Date(q.created_at).toLocaleString()}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{q.customer_name || 'Walk-in'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.customer_phone}</div>
                  {q.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4, fontWeight: 500 }}>
                      {q.notes}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{q.items?.length || 0} items</td>
                <td style={{ color: 'var(--blue)', fontWeight: 600 }}>₹{q.total}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => navigate('/quotations/create', { state: { editQuotationId: q.id } })} title="Edit Quotation">
                      <Edit2 size={16} color="var(--primary)" />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => printQuotation(q.id)} title="View/Print Quotation">
                      <Printer size={16} color="var(--primary)" />
                    </button>
                    {q.customer_phone && (
                      <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: '#22c55e', color: '#22c55e' }} onClick={() => sendWhatsAppQuote(q)} title="Send WhatsApp Quote">
                        <MessageSquare size={16} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => deleteQuotation(q.id)} title="Delete Quotation">
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
};

export default QuotationsList;
