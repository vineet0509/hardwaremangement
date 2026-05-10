import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ShoppingCart, Trash2, IndianRupee, Save, ArrowLeft, Package, User, Phone, MapPin, CreditCard, PlusCircle } from 'lucide-react';

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
                ${(isGst && settings.gst_number) ? `<p><strong>GSTIN: ${settings.gst_number}</strong></p>` : ''}
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
             
             const shopName = settings.company_name || 'Hardware Shop';
             const gstStr = (res.data.is_gst && settings.gst_number) ? `*GSTIN:* ${settings.gst_number}\n` : '';
             const pdfLink = `${window.location.origin}/api/bills/${res.data.id}/pdf?token=${localStorage.getItem('auth_token')}`;

             const msgText = `*${shopName} Invoice* 🧾\n${gstStr}-----------------------------------\n*Bill No:* ${res.data.bill_number}\n*Customer:* ${res.data.customer_name || 'Walk-in'}\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${res.data.total}\n*Amount Paid:* Rs. ${res.data.paid_amount}\n*Balance Due:* Rs. ${res.data.due_amount}\n*Payment Mode:* ${String(res.data.payment_method).toUpperCase()}\n\n*Download PDF Bill:* ${pdfLink}\n\nThank you for shopping with us!`;

             api.post('/bills/send-whatsapp', {
               bill_id: res.data.id,
               phone: wapn,
               message: msgText
             }).catch(console.error);
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
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 700 }}>
            <Package size={24} color="var(--primary)" /> Products
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: 24, minWidth: '250px', flex: 1, margin: 0, transition: 'all 0.2s' }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" placeholder="Search products by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%', fontSize: '1.05rem' }}
            />
          </div>
        </div>
        <div className="panel-body" style={{ background: 'var(--surface-hover)' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 8 }}>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '12px 24px',
                borderRadius: 24,
                border: selectedCategory === null ? 'none' : '1px solid var(--border)',
                background: selectedCategory === null ? 'var(--primary)' : 'var(--surface)',
                color: selectedCategory === null ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.15rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: selectedCategory === null ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 24,
                  border: selectedCategory === cat.id ? 'none' : '1px solid var(--border)',
                  background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--surface)',
                  color: selectedCategory === cat.id ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: selectedCategory === cat.id ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {(!products || !Array.isArray(products) || products.length === 0) ? (
               <div style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>No products found matching your criteria.</div>
            ) : products.map(p => (
              <div key={p.id} className="product-card" onClick={() => addToCart(p)} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <span className="stock" style={{ color: p.quantity > p.min_stock_alert ? 'var(--success)' : 'var(--danger)', background: p.quantity > p.min_stock_alert ? '#dcfce7' : '#fee2e2', fontSize: '0.85rem' }}>
                  {p.quantity} {p.unit}
                </span>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: '1.3' }}>{p.name}</h4>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 'auto' }}>SKU: {p.sku}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                   <div className="price" style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>₹{p.selling_price}</div>
                   <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <PlusCircle size={22} />
                   </div>
                </div>
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
        
        <div className="panel-body" style={{ padding: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Cart Items (Top Priority) */}
          <div style={{ flex: 1, padding: '20px', minHeight: '250px' }}>
            {cart.map(item => (
              <div key={item.product_id} className="cart-item" style={{ padding: '20px 0' }}>
                <div className="cart-item-info">
                  <div className="cart-item-title" style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>{item.name}</div>
                  <div className="cart-item-price" style={{ fontSize: '1rem' }}>₹{item.price} × {item.quantity}  = <span style={{color: 'var(--text-main)', fontWeight: 800, fontSize: '1.2rem'}}>₹{(item.price * item.quantity).toFixed(2)}</span></div>
                </div>
                <div className="cart-item-controls" style={{ background: 'var(--surface)', padding: '8px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ width: 36, height: 36, borderRadius: 8, fontSize: '1.3rem' }}>-</button>
                  <input 
                    type="number" 
                    min="0"
                    max={item.stock}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                    style={{ width: 55, textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem', outline: 'none' }}
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ width: 36, height: 36, borderRadius: 8, fontSize: '1.3rem' }}>+</button>
                  <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)', marginLeft: 16, width: 36, height: 36, borderRadius: 8 }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cart is empty</div>
                <div style={{ fontSize: '0.9rem', marginTop: 4 }}>Add products from the left menu</div>
              </div>
            )}
          </div>

          {/* Customer Details Block */}
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--surface-hover)', flexShrink: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Customer Details</div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 16px', transition: 'border-color 0.2s' }}>
                <User size={18} color="var(--primary)" />
                <input type="text" placeholder="Full Name *" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', padding: '12px 10px', width: '100%', fontSize: '1.05rem' }}/>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 16px', transition: 'border-color 0.2s' }}>
                <Phone size={18} color="var(--primary)" />
                <input type="text" placeholder="Phone Number *" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', padding: '12px 10px', width: '100%', fontSize: '1.05rem' }}/>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', transition: 'border-color 0.2s' }}>
              <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
              <textarea placeholder="Billing Address *" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '1.05rem', minHeight: '50px', resize: 'none', paddingLeft: '12px' }}></textarea>
            </div>
            
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.05)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
               <input 
                 type="checkbox" 
                 id="gst_bill_toggle"
                 checked={isGstBill} 
                 onChange={e => setIsGstBill(e.target.checked)} 
                 style={{ width: 22, height: 22, cursor: 'pointer', accentColor: 'var(--primary)' }}
               />
               <label htmlFor="gst_bill_toggle" style={{ fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', color: isGstBill ? 'var(--primary)' : 'var(--text-main)' }}>
                 Generate GST Tax Invoice (18%)
               </label>
            </div>
            
            {customerResults.length > 0 && !editBillId && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', position: 'absolute', zIndex: 100, borderRadius: 12, marginTop: 8, maxHeight: 250, overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                 <div style={{ padding: '12px 20px', background: 'var(--surface-hover)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>MATCHING CUSTOMERS</div>
                 {customerResults.map((c, i) => (
                   <div key={i} style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={() => {
                       setCustomerInfo({ name: c.customer_name, phone: c.customer_phone || '', address: c.customer_address || '' });
                       setCustomerResults([]);
                   }}>
                     <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{c.customer_name}</strong>
                     <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{c.customer_phone ? `📞 ${c.customer_phone}` : 'No Phone'} • 📍 {c.customer_address}</span>
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Totals & Payment */}
          <div style={{ padding: '24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            
            <div style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '1.15rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 700 }}>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center', fontSize: '1.15rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Discount Amount</span>
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: 150 }}>
                   <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                   <input type="number" value={payment.discount} onChange={e => setPayment({...payment, discount: e.target.value})} style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontWeight: 700, fontSize: '1.15rem', background: 'transparent' }} />
                </div>
              </div>
              {isGstBill && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--primary)', fontSize: '1.15rem' }}>
                  <span style={{ fontWeight: 600 }}>Tax (GST 18%)</span>
                  <span style={{ fontWeight: 700 }}>₹{tax.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '2px dashed #cbd5e1', paddingTop: 16 }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Grand Total</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>₹{typeof total === 'number' ? total.toFixed(2) : total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Payment Mode</label>
                <div style={{ position: 'relative' }}>
                  <select className="form-control" value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})} style={{ padding: '16px', fontWeight: 700, fontSize: '1.15rem', color: 'var(--primary)', cursor: 'pointer', appearance: 'none', background: 'var(--surface-hover)' }}>
                    <option value="cash">💵 Cash Payment</option>
                    <option value="upi">📱 UPI / Online</option>
                    <option value="credit">📝 Credit (Udhar)</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Amount Received</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '4px 16px', transition: 'all 0.2s' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '1.2rem' }}>₹</span>
                  <input type="number" value={payment.paid} onChange={e => setPayment({...payment, paid: e.target.value})} style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 8px', fontWeight: 800, fontSize: '1.3rem', color: 'var(--success)', background: 'transparent' }} />
                </div>
              </div>
            </div>

            {payment.method === 'upi' && (
              <div style={{ marginBottom: 24, padding: '16px', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '12px' }}>
                 <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8, display: 'block' }}>UPI Last 5 Digits *</label>
                 <input type="text" maxLength="5" className="form-control" placeholder="e.g. 12345" value={payment.upi_digits} onChange={e => setPayment({...payment, upi_digits: e.target.value.replace(/[^0-9]/g, '')})} style={{ fontWeight: 700, letterSpacing: '4px', fontSize: '1.25rem', textAlign: 'center' }} />
              </div>
            )}

            {payment.method === 'credit' && (
              <div style={{ marginBottom: 24, background: 'var(--surface-hover)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800, display: 'block', marginBottom: 12 }}>Link to Existing Udhar Account</label>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                  {udharCustomers.length === 0 ? (
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', padding: '8px 0' }}>No active udhar customers.</div>
                  ) : udharCustomers.map((cust, i) => (
                     <button key={i} type="button" style={{ fontSize: '0.95rem', padding: '10px 18px', whiteSpace: 'nowrap', borderRadius: 24, border: '1px solid #cbd5e1', background: 'var(--surface)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                       onClick={() => {
                          setCustomerInfo({ name: cust.customer_name, phone: cust.customer_phone || '', address: customerInfo.address });
                       }}>
                       {cust.customer_name} <span style={{ color: 'var(--danger)', marginLeft: 6, fontWeight: 800 }}>₹{cust.total_due} Due</span>
                     </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: liveDueAmount < 0 ? 'rgba(16, 185, 129, 0.1)' : (liveDueAmount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-hover)'), border: '1px solid', borderColor: liveDueAmount < 0 ? 'rgba(16, 185, 129, 0.3)' : (liveDueAmount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'), borderRadius: '12px', padding: '20px 24px', marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                {liveDueAmount < 0 ? 'Total Advance Amount:' : (liveDueAmount > 0 ? 'Balance Due Amount:' : 'No Pending Due')}
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.6rem', color: liveDueAmount < 0 ? 'var(--primary)' : (liveDueAmount > 0 ? 'var(--danger)' : 'var(--text-muted)') }}>
                {liveDueAmount < 0 ? `+ ₹${Math.abs(liveDueAmount).toFixed(2)}` : (liveDueAmount > 0 ? `₹${liveDueAmount.toFixed(2)}` : '₹0.00')}
              </span>
            </div>
          </div>
        </div>

        <div className="panel-footer" style={{ padding: '16px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '20px', fontSize: '1.25rem', fontWeight: 800, borderRadius: '12px', letterSpacing: '0.02em', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }} onClick={handleCheckout}>
            <Save size={26} /> {editBillId ? 'Save Adjusted Bill' : 'Complete Order & Print'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
