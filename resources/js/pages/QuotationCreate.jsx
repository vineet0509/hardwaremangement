import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ShoppingCart, Trash2, IndianRupee, Save, ArrowLeft, Package, FileText } from 'lucide-react';

import Swal from 'sweetalert2';

const QuotationCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editQuotationId = location.state?.editQuotationId;
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [customerResults, setCustomerResults] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [mobileTab, setMobileTab] = useState('products');
  const [settings, setSettings] = useState({});
  const [isGst, setIsGst] = useState(false);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    api.get('/settings').then(res => setSettings(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const url = `/products?search=${search}` + (selectedCategory ? `&category_id=${selectedCategory}` : '');
    api.get(url)
      .then(res => setProducts(res.data.data || res.data))
      .catch(console.error);
  }, [search, selectedCategory]);

  useEffect(() => {
    if (customerInfo.phone.length >= 3 || customerInfo.name.length >= 3) {
      const delayFn = setTimeout(() => {
        api.get(`/customers/search?q=${customerInfo.phone || customerInfo.name}`)
           .then(res => setCustomerResults(res.data))
           .catch(() => setCustomerResults([]));
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setCustomerResults([]);
    }
  }, [customerInfo.phone, customerInfo.name]);

  useEffect(() => {
    if (editQuotationId) {
      api.get(`/quotations/${editQuotationId}`).then(res => {
        const q = res.data;
        setCustomerInfo({ name: q.customer_name || '', phone: q.customer_phone || '', address: q.customer_address || '' });
        setIsGst(q.is_gst || false);
        setDiscount(q.discount);
        setNotes(q.notes || '');
        setCart(q.items.map(i => ({
           product_id: i.product_id,
           name: i.product_name,
           price: i.price,
           quantity: i.quantity,
           stock: 9999 // unlimited stock assumption for quotations
        })));
      }).catch(err => Swal.fire('Error', 'Failed to load quotation for editing.', 'error'));
    }
  }, [editQuotationId]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.selling_price, quantity: 1, stock: product.quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQ = parseInt(quantity);
        if (isNaN(newQ)) return { ...item, quantity: 0 };
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.product_id !== id));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = isGst ? (subtotal - discount) * 0.18 : 0;
  const total = (subtotal - discount) + tax;

  const handlePreview = () => {
    if (cart.length === 0) return Swal.fire('Empty Quote', 'Add products to preview.', 'warning');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation - ${settings.company_name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.4; }
            .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .shop-info h1 { margin: 0; color: #000; font-size: 24px; }
            .shop-info p { margin: 5px 0; font-size: 14px; }
            .bill-info { text-align: right; }
            .bill-info h2 { margin: 0; color: #3b82f6; font-size: 20px; }
            .customer-section { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .customer-details h3 { margin: 0 0 10px 0; font-size: 16px; color: #666; border-bottom: 1px solid #eee; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f9f9f9; text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 14px; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .text-right { text-align: right; }
            .summary-table { width: 250px; margin-left: auto; margin-top: 20px; }
            .summary-table td { border: none; padding: 5px 10px; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #3b82f6 !important; color: #3b82f6; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px dashed #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="shop-info">
                <h1>${settings.company_name || 'Hardware Shop'}</h1>
                <p>${settings.company_address || ''}</p>
                <p>Phone: ${settings.company_phone || ''}</p>
                ${settings.gst_number ? `<p><strong>GSTIN: ${settings.gst_number}</strong></p>` : ''}
              </div>
              <div class="bill-info">
                <h2>ESTIMATE / QUOTATION</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Valid For:</strong> 7 Days</p>
              </div>
            </div>

            <div class="customer-section">
              <div class="customer-details">
                <h3>Quotation For:</h3>
                <p><strong>${customerInfo.name || 'Walk-in Customer'}</strong></p>
                <p>${customerInfo.phone || ''}</p>
                <p>${customerInfo.address || ''}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Items / Description</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${cart.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">₹${item.price}</td>
                    <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <table class="summary-table">
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td class="text-right">- ₹${parseFloat(discount).toFixed(2)}</td>
              </tr>
              ${isGst ? `
                <tr>
                  <td>GST (18%):</td>
                  <td class="text-right">₹${tax.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total Estimate:</td>
                <td class="text-right">₹${total.toFixed(2)}</td>
              </tr>
            </table>

            <div class="footer">
              <p>This is a computer generated estimate and subject to change based on stock availability.</p>
              <p>Thank you for choosing us!</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCheckout = () => {
    if (cart.length === 0) return Swal.fire('Empty Quote', 'Please add items first.', 'warning');

    const payload = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      discount: parseFloat(discount) || 0,
      tax: tax,
      is_gst: isGst,
      notes: notes,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: parseFloat(i.price) || 0 }))
    };

    const action = editQuotationId ? api.put(`/quotations/${editQuotationId}`, payload) : api.post('/quotations', payload);

    action.then(res => {
        if (editQuotationId) {
           Swal.fire('Success', 'Quotation updated successfully!', 'success');
           return navigate('/quotations');
        }

        if (customerInfo.phone) {
             let wapn = customerInfo.phone.replace(/[^0-9]/g,'');
             if (wapn.length === 10) wapn = '91' + wapn;
             
             let itemListStr = res.data.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity}) = Rs.${i.total}`).join('\n') || '';
             
             const msgText = `*Hardware Shop Quotation* 📝\n-----------------------------------\n*Quotation No:* ${res.data.quotation_number}\n*Customer:* ${res.data.customer_name || 'Walk-in'}\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${res.data.total}\n\nThis is an estimate and subject to change. Thank you!`;

             const msg = encodeURIComponent(msgText);
             window.open(`https://wa.me/${wapn}?text=${msg}`, '_blank');
        }
        
        Swal.fire({
          title: 'Generated!',
          text: `Quotation No: ${res.data.quotation_number} saved and sent to WhatsApp.`,
          icon: 'success',
          timer: 3000
        });
        
        setCart([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setDiscount(0);
        setNotes('');
        navigate('/quotations');
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error occurred.', 'error'));
  };

  return (
    <div className={`pos-grid mobile-tab-${mobileTab}`}>
      {/* Mobile Tabs */}
      <div className="mobile-pos-tabs" style={{ display: 'none' }}>
        <button 
          className={mobileTab === 'products' ? 'active' : ''} 
          onClick={() => setMobileTab('products')}
        >
          <Package size={18} /> Products
        </button>
        <button 
          className={mobileTab === 'cart' ? 'active' : ''} 
          onClick={() => setMobileTab('cart')}
        >
          <FileText size={18} /> Quote ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {/* Products Selection Panel */}
      <div className="pos-products-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>Products Menu</div>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', minWidth: '200px', flex: 1, margin: 0 }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        <div className="panel-body">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: selectedCategory === null ? 'var(--primary)' : 'var(--surface)',
                color: selectedCategory === null ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--surface)',
                  color: selectedCategory === cat.id ? 'white' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {(!products || !Array.isArray(products) || products.length === 0) ? (
               <div style={{ color: 'var(--text-muted)' }}>No products found.</div>
            ) : products.map(p => (
              <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                <span className="stock" style={{ color: p.quantity > p.min_stock_alert ? 'var(--success)' : 'var(--danger)' }}>
                  {p.quantity} {p.unit}
                </span>
                <h4>{p.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{p.sku}</div>
                <div className="price">₹{p.selling_price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="pos-cart-panel">
        <div className="panel-header" style={{ background: editQuotationId ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: editQuotationId ? 'var(--warning)' : 'var(--blue)' }}>
          <div className="d-flex align-items-center gap-2">
             {editQuotationId ? <><ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/quotations')} /> Editing Quotation #{editQuotationId}</> : <><ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/quotations')} /> New Quotation</>}
          </div>
        </div>
        
        <div className="panel-body" style={{ padding: 16 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <input type="text" className="form-control" placeholder="Customer Name *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={{ padding: '8px 12px' }}/>
              <input type="text" className="form-control" placeholder="Phone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={{ padding: '8px 12px' }}/>
            </div>
            <textarea className="form-control" placeholder="Customer Full Address (Optional)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{ padding: '8px 12px', minHeight: '50px', resize: 'none' }}></textarea>
            
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
               <input 
                 type="checkbox" 
                 id="gst_quote_toggle"
                 checked={isGst} 
                 onChange={e => setIsGst(e.target.checked)} 
                 style={{ width: 18, height: 18, cursor: 'pointer' }}
               />
               <label htmlFor="gst_quote_toggle" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: isGst ? 'var(--primary)' : 'var(--text-muted)' }}>
                 Generate GST Quotation (18%)
               </label>
            </div>

            {customerResults.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 100, borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                 {customerResults.map((c, i) => (
                   <div key={i} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => {
                       setCustomerInfo({ name: c.customer_name, phone: c.customer_phone || '', address: c.customer_address || '' });
                       setCustomerResults([]);
                   }}>
                     <strong style={{ display: 'block', color: 'var(--primary)' }}>{c.customer_name}</strong>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {c.customer_phone || 'N/A'} | Addr: {c.customer_address}</span>
                   </div>
                 ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} x {item.quantity}  = <span style={{color: 'var(--text-main)', fontWeight: 600}}>₹{item.price * item.quantity}</span></div>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                  <input 
                    type="number" 
                    min="0"
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                    style={{ width: 55, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '4px', borderRadius: 4, margin: '0 4px' }}
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'var(--danger)', marginLeft: 8 }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Quotation is empty</div>}
          </div>
        </div>

        <div className="panel-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Subtotal</span>
            <span>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span>Discount (₹)</span>
            <input type="number" className="form-control" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: 100, padding: '4px 8px', textAlign: 'right' }} />
          </div>
          {isGst && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--primary)', fontWeight: 600 }}>
              <span>Tax (GST 18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderTop: '1px dashed var(--border)', paddingTop: 16, fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total Estimate</span>
            <span style={{ color: 'var(--primary)' }}>₹{typeof total === 'number' ? total.toFixed(2) : total}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
             <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Additional Notes (Optional)</label>
             <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handlePreview}>
              <FileText size={20} /> Preview
            </button>
            <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleCheckout}>
              <Save size={20} /> {editQuotationId ? 'Update Quotation' : 'Generate Quotation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationCreate;
