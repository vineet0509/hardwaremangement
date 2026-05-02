import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ShoppingCart, Trash2, IndianRupee, Save, ArrowLeft, Package } from 'lucide-react';

import Swal from 'sweetalert2';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editBillId = location.state?.editBillId;
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [customerResults, setCustomerResults] = useState([]);
  const [payment, setPayment] = useState({ method: 'cash', paid: 0, discount: 0, upi_digits: '' });
  const [udharCustomers, setUdharCustomers] = useState([]);
  const [mobileTab, setMobileTab] = useState('products');
  const [notify, setNotify] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isGstBill, setIsGstBill] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/udhar').then(res => setUdharCustomers(res.data)).catch(console.error);
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
    if ((customerInfo.phone.length >= 3 || customerInfo.name.length >= 3) && !editBillId) {
      const delayFn = setTimeout(() => {
        api.get(`/customers/search?q=${customerInfo.phone || customerInfo.name}`)
           .then(res => setCustomerResults(res.data))
           .catch(() => setCustomerResults([]));
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setCustomerResults([]);
    }
  }, [customerInfo.phone, customerInfo.name, editBillId]);

  useEffect(() => {
    if (editBillId) {
      api.get(`/bills/${editBillId}`).then(res => {
        const b = res.data;
        setCustomerInfo({ name: b.customer_name || '', phone: b.customer_phone || '', address: b.customer_address || '' });
        setIsGstBill(b.is_gst || false);
        
        let upi = '';
        if (b.payment_method === 'upi' && b.notes?.includes('UPI Ref: ')) {
           upi = b.notes.split('UPI Ref: ')[1]?.substring(0, 5) || '';
        }

        setPayment({ method: b.payment_method, paid: b.paid_amount, discount: b.discount, upi_digits: upi });
        
        setCart(b.items.map(i => ({
           product_id: i.product_id,
           name: i.product_name || i.product?.name,
           price: i.price,
           quantity: i.quantity,
           stock: (i.product?.quantity || 0) + i.quantity
        })));
      }).catch(err => Swal.fire('Error', 'Failed to load bill for editing.', 'error'));
    }
  }, [editBillId]);

  const addToCart = (product) => {
    if (product.quantity <= 0) return Swal.fire('Stock Out', 'Product is out of stock!', 'warning');
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
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
        if (newQ >= 0 && newQ <= item.stock) return { ...item, quantity: newQ };
        if (newQ > item.stock) return { ...item, quantity: item.stock };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.product_id !== id));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = isGstBill ? (subtotal - payment.discount) * 0.18 : 0;
  const total = (subtotal - payment.discount) + tax;
  const liveDueAmount = total - (parseFloat(payment.paid) || 0);

  useEffect(() => {
    if (!editBillId) {
      if (payment.method !== 'credit') {
        setPayment(prev => ({ ...prev, paid: total }));
      } else {
        setPayment(prev => ({ ...prev, paid: 0 }));
      }
    }
  }, [total, payment.method, editBillId]);

  const handlePrint = (billData) => {
    const printWindow = window.open('', '_blank');
    const isGst = billData.is_gst;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${billData.bill_number}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.4; }
            .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .shop-info h1 { margin: 0; color: #000; font-size: 24px; }
            .shop-info p { margin: 5px 0; font-size: 14px; }
            .bill-info { text-align: right; }
            .bill-info h2 { margin: 0; color: #666; font-size: 20px; }
            .customer-section { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .customer-details h3 { margin: 0 0 10px 0; font-size: 16px; color: #666; border-bottom: 1px solid #eee; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f9f9f9; text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 14px; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .text-right { text-align: right; }
            .summary-table { width: 250px; margin-left: auto; margin-top: 20px; }
            .summary-table td { border: none; padding: 5px 10px; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333 !important; }
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
                <h2>${isGst ? 'TAX INVOICE' : 'RETAIL INVOICE'}</h2>
                <p><strong>Bill No:</strong> ${billData.bill_number}</p>
                <p><strong>Date:</strong> ${new Date(billData.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div class="customer-section">
              <div class="customer-details">
                <h3>Bill To:</h3>
                <p><strong>${billData.customer_name}</strong></p>
                <p>${billData.customer_phone}</p>
                <p>${billData.customer_address}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Payment Mode:</strong> ${String(billData.payment_method).toUpperCase()}</p>
                <p><strong>Status:</strong> ${String(billData.status).toUpperCase()}</p>
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
                ${billData.items.map(item => `
                  <tr>
                    <td>${item.product_name}</td>
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
                <td class="text-right">₹${billData.subtotal}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td class="text-right">- ₹${billData.discount}</td>
              </tr>
              ${isGst ? `
                <tr>
                  <td>GST (18%):</td>
                  <td class="text-right">₹${billData.tax}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">₹${billData.total}</td>
              </tr>
              <tr>
                <td style="color: #666;">Paid Amount:</td>
                <td class="text-right" style="color: #666;">₹${billData.paid_amount}</td>
              </tr>
              ${billData.due_amount > 0 ? `
                <tr style="color: red; font-weight: bold;">
                  <td>Balance Due:</td>
                  <td class="text-right">₹${billData.due_amount}</td>
                </tr>
              ` : ''}
            </table>

            <div class="footer">
              <p>This is a computer generated invoice. No signature required.</p>
              <p>Thank you for your business!</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCheckout = () => {
    if (cart.length === 0) return Swal.fire('Empty Cart', 'Add products to bill.', 'warning');
    if (payment.method === 'upi' && (!payment.upi_digits || payment.upi_digits.length !== 5)) {
      return Swal.fire('UPI Required', 'Please enter last 5 digits of UPI transaction.', 'warning');
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      return Swal.fire('Customer Missing', 'Name, Phone, and Address are required!', 'warning');
    }

    const payload = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      payment_method: payment.method,
      discount: parseFloat(payment.discount) || 0,
      tax: tax,
      is_gst: isGstBill,
      paid_amount: parseFloat(payment.paid) || 0,
      notes: payment.method === 'upi' ? `UPI Ref: ${payment.upi_digits}` : '',
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: parseFloat(i.price) || 0 }))
    };

    const action = editBillId ? api.put(`/bills/${editBillId}`, payload) : api.post('/bills', payload);

    action.then(res => {
        if (editBillId) {
           Swal.fire('Success', 'Bill updated successfully!', 'success');
           return navigate('/bills');
        }

        if (customerInfo.phone) {
             let wapn = customerInfo.phone.replace(/[^0-9]/g,'');
             if (wapn.length === 10) wapn = '91' + wapn; // Assume India code if 10 digits
             
             let itemListStr = res.data.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity}) = Rs.${i.total}`).join('\n') || '';
             
             const msgText = `*Hardware Shop Invoice* 🧾\n-----------------------------------\n*Bill No:* ${res.data.bill_number}\n*Customer:* ${res.data.customer_name || 'Walk-in'}\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${res.data.total}\n*Amount Paid:* Rs. ${res.data.paid_amount}\n*Balance Due:* Rs. ${res.data.due_amount}\n*Payment Mode:* ${String(res.data.payment_method).toUpperCase()}\n\nThank you for shopping with us!`;

             const msg = encodeURIComponent(msgText);
             window.open(`https://wa.me/${wapn}?text=${msg}`, '_blank');
        }
        
        handlePrint(res.data);
        
        Swal.fire({
          title: 'Success!',
          text: `Bill ${res.data.bill_number} generated and sent to WhatsApp.`,
          icon: 'success',
          timer: 3000
        });
        
        setCart([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setPayment({ method: 'cash', paid: 0, discount: 0, upi_digits: '' });
        api.get('/udhar').then(res => setUdharCustomers(res.data)).catch(console.error); // refresh udhar list post checkout
        navigate('/bills');
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
          <ShoppingCart size={18} /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
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
        <div className="panel-header" style={{ background: editBillId ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: editBillId ? 'var(--warning)' : 'var(--primary)' }}>
          <div className="d-flex align-items-center gap-2">
             {editBillId ? <><ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/bills')} /> Editing Bill #{editBillId}</> : <><ShoppingCart size={20} /> Current Bill</>}
          </div>
        </div>
        
        <div className="panel-body" style={{ padding: 16 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <input type="text" className="form-control" placeholder="Customer Name *" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={{ padding: '8px 12px' }}/>
              <input type="text" className="form-control" placeholder="Phone *" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={{ padding: '8px 12px' }}/>
            </div>
            <textarea className="form-control" placeholder="Customer Full Address *" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{ padding: '8px 12px', minHeight: '50px', resize: 'none' }}></textarea>
            
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
               <input 
                 type="checkbox" 
                 id="gst_bill_toggle"
                 checked={isGstBill} 
                 onChange={e => setIsGstBill(e.target.checked)} 
                 style={{ width: 18, height: 18, cursor: 'pointer' }}
               />
               <label htmlFor="gst_bill_toggle" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: isGstBill ? 'var(--primary)' : 'var(--text-muted)' }}>
                 Generate GST Bill (18%)
               </label>
            </div>
            
            {customerResults.length > 0 && !editBillId && (
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
                    max={item.stock}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                    style={{ width: 55, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '4px', borderRadius: 4, margin: '0 4px' }}
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'var(--danger)', marginLeft: 8 }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cart is empty</div>}
          </div>
        </div>

        <div className="panel-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Subtotal</span>
            <span>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Discount (₹)</span>
            <input type="number" className="form-control" value={payment.discount} onChange={e => setPayment({...payment, discount: e.target.value})} style={{ width: 100, padding: '4px 8px', textAlign: 'right' }} />
          </div>
          {isGstBill && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--primary)', fontWeight: 600 }}>
              <span>Tax (GST 18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderTop: '1px dashed var(--border)', paddingTop: 16, fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--success)' }}>₹{typeof total === 'number' ? total.toFixed(2) : total}</span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Method</label>
              <select className="form-control" value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})} style={{ padding: '8px' }}>
                <option value="cash">Cash</option>
                <option value="upi">UPI / Online</option>
                <option value="credit">Credit (Udhar)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Paid</label>
              <input type="number" className="form-control" value={payment.paid} onChange={e => setPayment({...payment, paid: e.target.value})} style={{ padding: '8px' }} />
            </div>
          </div>

          {payment.method === 'upi' && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI Last 5 Digits</label>
                 <input type="text" maxLength="5" className="form-control" placeholder="12345" value={payment.upi_digits} onChange={e => setPayment({...payment, upi_digits: e.target.value.replace(/[^0-9]/g, '')})} style={{ padding: '8px' }} />
              </div>
            </div>
          )}

          {payment.method === 'credit' && (
            <div style={{ marginBottom: 16, background: 'var(--surface-hover)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Existing Udhar Accounts</label>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {udharCustomers.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No existing udhar customers.</div>
                ) : udharCustomers.map((cust, i) => (
                   <button key={i} type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap', borderRadius: 20 }}
                     onClick={() => {
                        setCustomerInfo({ name: cust.customer_name, phone: cust.customer_phone || '', address: customerInfo.address });
                        // Could also autofill address if udhar payload returned it, but leaving custom.
                     }}>
                     {cust.customer_name} <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>₹{cust.total_due} Due</span>
                   </button>
                ))}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>Click an account above to autofill their billing details.</p>
            </div>
          )}

          <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Bill Total Amount:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{typeof total === 'number' ? total.toFixed(2) : total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Amount Paid By Customer:</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(parseFloat(payment.paid) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{liveDueAmount < 0 ? 'Total Advance (Credit):' : 'Total Remaining Due:'}</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: liveDueAmount < 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {liveDueAmount < 0 ? `+ ₹${Math.abs(liveDueAmount).toFixed(2)}` : `₹${liveDueAmount.toFixed(2)}`}
              </span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleCheckout}>
            <Save size={20} /> {editBillId ? 'Save Adjusted Bill' : 'Generate Bill & Print'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
