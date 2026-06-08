import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { printHtml } from '../utils/webview';
import { getTermsAndConditions } from '../utils/terms';
import { Search, ShoppingCart, Trash2, IndianRupee, Save, ArrowLeft, Package, User, Phone, MapPin, CreditCard, PlusCircle, XCircle, Banknote, Smartphone, ClipboardList, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [payment, setPayment] = useState({ discount: 0, other_charges: 0, other_charges_details: [], paid: 0, method: 'cash', upi_digits: '' });
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

        setPayment({ discount: b.discount || 0, other_charges: b.other_charges || 0, other_charges_details: typeof b.other_charges_details === 'string' ? JSON.parse(b.other_charges_details) : (b.other_charges_details || []), paid: b.paid_amount, method: b.payment_method, upi_digits: upi });
        
        setCart(b.items.map(i => ({
           product_id: i.product_id,
           name: i.product_name || i.product?.name || 'Unknown Product',
           description: i.description,
           unit: i.unit,
           price: i.price,
           gst_slab: i.gst_slab || i.product?.gst_slab || 0,
           quantity: i.quantity,
           stock: (i.product?.quantity || 0) + i.quantity
        })));
      }).catch(err => Swal.fire('Error', 'Failed to load bill for editing.', 'error'));
    }
  }, [editBillId]);

  // Pre-fill bill from a converted quotation
  useEffect(() => {
    if (location.state?.fromQuotation && !editBillId) {
      const q = location.state.fromQuotation;
      setCustomerInfo({ name: q.customer_name || '', phone: q.customer_phone || '', address: q.customer_address || '' });
      setIsGstBill(q.is_gst || false);
      setPayment(prev => ({ ...prev, discount: q.discount || 0 }));
      setCart((q.items || []).map(i => ({
        product_id: i.product_id,
        name: i.product_name,
        description: i.description || '',
        unit: i.unit,
        price: i.price,
        quantity: i.quantity,
        stock: 9999
      })));
    }
  }, []);

  // Load draft
  useEffect(() => {
    if (!editBillId && !location.state?.fromQuotation) {
      try {
        const draft = JSON.parse(localStorage.getItem('billing_draft'));
        if (draft && draft.cart && draft.cart.length > 0) {
          setCart(draft.cart);
          if (draft.customerInfo) setCustomerInfo(draft.customerInfo);
          if (draft.payment) setPayment(draft.payment);
          if (draft.isGstBill !== undefined) setIsGstBill(draft.isGstBill);
        }
      } catch (e) {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (!editBillId && !location.state?.fromQuotation) {
      if (cart.length > 0 || customerInfo.name) {
        localStorage.setItem('billing_draft', JSON.stringify({
          cart, customerInfo, payment, isGstBill
        }));
      } else {
        localStorage.removeItem('billing_draft');
      }
    }
  }, [cart, customerInfo, payment, isGstBill]);

  const addToCart = (product) => {
    if (product.quantity <= 0) return Swal.fire('Stock Out', 'Product is out of stock!', 'warning');
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, description: product.description, unit: product.unit, price: product.selling_price, gst_slab: product.gst_slab || 0, quantity: 1, stock: product.quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQ = parseFloat(quantity);
        if (isNaN(newQ)) return { ...item, quantity: 0 };
        if (newQ >= 0 && newQ <= item.stock) return { ...item, quantity: newQ };
        if (newQ > item.stock) return { ...item, quantity: item.stock };
      }
      return item;
    }));
  };

  const updateRate = (id, rate) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newRate = parseFloat(rate);
        return { ...item, price: isNaN(newRate) || newRate < 0 ? 0 : newRate };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.product_id !== id));

  const addOtherCharge = () => {
    setPayment(prev => ({
      ...prev,
      other_charges_details: [...(prev.other_charges_details || []), { name: '', amount: '' }]
    }));
  };

  const updateOtherCharge = (index, field, value) => {
    setPayment(prev => {
      const newDetails = [...(prev.other_charges_details || [])];
      newDetails[index][field] = value;
      const newTotalCharges = newDetails.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
      return { ...prev, other_charges_details: newDetails, other_charges: newTotalCharges };
    });
  };

  const removeOtherCharge = (index) => {
    setPayment(prev => {
      const newDetails = (prev.other_charges_details || []).filter((_, i) => i !== index);
      const newTotalCharges = newDetails.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
      return { ...prev, other_charges_details: newDetails, other_charges: newTotalCharges };
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = parseFloat(payment.discount) || 0;
  const otherChargesAmount = parseFloat(payment.other_charges) || 0;
  const tax = isGstBill ? cart.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;
    const itemDiscount = subtotal > 0 && discountAmount > 0 ? (itemTotal / subtotal) * discountAmount : 0;
    const discountedTotal = itemTotal - itemDiscount;
    const basePrice = discountedTotal / (1 + ((item.gst_slab || 0) / 100));
    return acc + (discountedTotal - basePrice);
  }, 0) : 0;
  const rawTotal = subtotal - discountAmount + otherChargesAmount;
  const total = Math.round(rawTotal);



  const liveDueAmount = parseFloat((total - parseFloat(payment.paid || 0)).toFixed(2));

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
    const isGst = billData.is_gst;
    // Use printHtml helper — works in both browser and Android WebView
    printHtml(`
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
                <h1>${settings.company_name || 'VyaparSync'}</h1>
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
                    <td>
                      <strong>${item.product_name}</strong>
                      ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                    </td>
                    <td class="text-right">${item.quantity} ${item.unit || ''}</td>
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
              ${parseFloat(billData.other_charges) > 0 ? (
                (() => {
                  let details = billData.other_charges_details;
                  if (typeof details === 'string') {
                    try { details = JSON.parse(details); } catch(e) { details = []; }
                  }
                  if (Array.isArray(details) && details.length > 0) {
                    return details.map(charge => `
                      <tr>
                        <td>${charge.name || 'Other Charge'}:</td>
                        <td class="text-right">+ ₹${charge.amount || 0}</td>
                      </tr>
                    `).join('');
                  } else {
                    return `
                      <tr>
                        <td>Other Charges:</td>
                        <td class="text-right">+ ₹${billData.other_charges}</td>
                      </tr>
                    `;
                  }
                })()
              ) : ''}
              ${Math.round(billData.total) !== billData.total ? `
              <tr>
                <td>Round Off:</td>
                <td class="text-right">₹${(Math.round(billData.total) - billData.total).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${isGst ? `
                <tr>
                  <td>CGST:</td>
                  <td class="text-right">₹${(billData.tax / 2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST:</td>
                  <td class="text-right">₹${(billData.tax / 2).toFixed(2)}</td>
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

            ${(billData.payment_method === 'upi' && settings.upi_qr_code) ? `
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
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
        </body>
      </html>
    `);
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
      discount: payment.discount || 0,
      other_charges: payment.other_charges || 0,
      other_charges_details: payment.other_charges_details || [],
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
             api.get('/settings').then(settingsRes => {
               const settings = settingsRes.data;
               let wapn = customerInfo.phone.replace(/[^0-9]/g,'');
               if (wapn.length === 10) wapn = '91' + wapn; // Assume India code if 10 digits
               
               let itemListStr = res.data.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity} ${i.unit || ''}) = Rs.${i.total}`).join('\n') || '';
               
               const shopName = settings.company_name || 'VyaparSync';
               const gstStr = (res.data.is_gst && settings.gst_number) ? `*GSTIN:* ${settings.gst_number}\n` : '';
               const pdfLink = `${window.location.origin}/api/bills/${res.data.id}/pdf?token=${localStorage.getItem('auth_token')}`;

               const msgText = `*${shopName} Invoice* 🧾\n${gstStr}-----------------------------------\n*Bill No:* ${res.data.bill_number}\n*Customer:* ${res.data.customer_name || 'Walk-in'}\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${res.data.total}\n*Amount Paid:* Rs. ${res.data.paid_amount}\n*Balance Due:* Rs. ${res.data.due_amount}\n*Payment Mode:* ${String(res.data.payment_method).toUpperCase()}\n\n*Download PDF Bill:* ${pdfLink}\n\nThank you for shopping with us!`;

               api.post('/bills/send-whatsapp', {
                 bill_id: res.data.id,
                 phone: wapn,
                 message: msgText
               }).catch(console.error);
             }).catch(console.error);
        }
        

        
        Swal.fire({
          title: 'Success!',
          text: `Bill ${res.data.bill_number} generated and sent to WhatsApp.`,
          icon: 'success',
          timer: 3000
        });
        
        localStorage.removeItem('billing_draft');
        setCart([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setPayment({ method: 'cash', paid: 0, discount: 0, other_charges: 0, upi_digits: '' });
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
              autoFocus
              type="text" placeholder="Search products by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && search.trim() !== '') {
                  const exactMatch = products.find(p => p.sku === search || p.name.toLowerCase() === search.toLowerCase());
                  if (exactMatch) {
                    addToCart(exactMatch);
                    setSearch('');
                  } else if (products.length === 1) {
                    addToCart(products[0]);
                    setSearch('');
                  } else if (products.length > 1) {
                    addToCart(products[0]);
                    setSearch('');
                  }
                }
              }}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%', fontSize: '1.05rem' }}
            />
          </div>
        </div>
        {/* Category Filter Strip — always visible, never scrolled away */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '10px 16px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          <button 
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '8px 18px',
              borderRadius: 24,
              border: selectedCategory === null ? 'none' : '1px solid var(--border)',
              background: selectedCategory === null ? 'var(--primary)' : 'var(--surface)',
              color: selectedCategory === null ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
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
                padding: '8px 16px',
                borderRadius: 24,
                border: selectedCategory === cat.id ? 'none' : '1px solid var(--border)',
                background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--surface)',
                color: selectedCategory === cat.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s',
                boxShadow: selectedCategory === cat.id ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="panel-body" style={{ background: 'var(--bg-color)', padding: '16px' }}>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {(!products || !Array.isArray(products) || products.length === 0) ? (
               <div style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>No products found matching your criteria.</div>
            ) : products.map(p => (
              <div 
                key={p.id} 
                className="product-card" 
                onClick={() => addToCart(p)} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ 
                    color: p.quantity > p.min_stock_alert ? 'var(--success)' : 'var(--danger)', 
                    background: p.quantity > p.min_stock_alert ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    letterSpacing: '0.02em'
                  }}>
                    {p.quantity} {p.unit}
                  </span>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusCircle size={18} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{p.sku}</div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                   <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>₹{p.selling_price}</div>
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
             {editBillId ? <><ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/bills')} /> Editing Bill #{editBillId}</> : <><ShoppingCart size={20} /> Current Bill {cart.length > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, marginLeft: 6 }}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>}</>}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => Swal.fire({ title: 'Clear Cart?', text: 'All items will be removed.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, clear it' }).then(r => { if (r.isConfirmed) { setCart([]); localStorage.removeItem('billing_draft'); setCustomerInfo({ name: '', phone: '', address: '' }); setPayment({ method: 'cash', paid: 0, discount: 0, upi_digits: '' }); } })}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', borderRadius: 8, padding: '6px 12px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              <XCircle size={15} /> Clear
            </button>
          )}
        </div>
        
        {/* Customer Details Block (Sticky Top, Below Header) */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)', flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Customer Details</div>
          
          <div style={{ position: 'relative' }}>
            <div className="responsive-customer-grid">
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '2px 10px' }}>
                <User size={15} color="var(--primary)" />
                <input type="text" placeholder="Full Name *" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', padding: '6px 6px', width: '100%', fontSize: '0.88rem' }}/>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '2px 10px' }}>
                <Phone size={15} color="var(--primary)" />
                <input type="text" placeholder="Phone Number *" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', padding: '6px 6px', width: '100%', fontSize: '0.88rem' }}/>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '2px 10px', marginBottom: '8px' }}>
              <MapPin size={15} color="var(--primary)" />
              <input type="text" placeholder="Billing Address *" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', padding: '6px 6px', width: '100%', fontSize: '0.88rem' }} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.04)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
               <input 
                 type="checkbox" 
                 id="gst_bill_toggle"
                 checked={isGstBill} 
                 onChange={e => setIsGstBill(e.target.checked)} 
                 style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
               />
               <label htmlFor="gst_bill_toggle" style={{ fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: isGstBill ? 'var(--primary)' : 'var(--text-main)' }}>
                 Generate GST Tax Invoice
               </label>
            </div>
            
            {customerResults.length > 0 && !editBillId && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}>
                 <div style={{ padding: '8px 14px', background: 'var(--surface-hover)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>MATCHING CUSTOMERS</div>
                 {customerResults.map((c, i) => (
                   <div key={i} style={{ padding: '10px 14px', cursor: 'pointer', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2px' }} onClick={() => {
                       setCustomerInfo({ name: c.customer_name, phone: c.customer_phone || '', address: c.customer_address || '' });
                       setCustomerResults([]);
                   }}>
                     <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{c.customer_name}</strong>
                     <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.customer_phone ? `📞 ${c.customer_phone}` : 'No Phone'} • 📍 {c.customer_address}</span>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List (Independently Scrollable panel-body) */}
        <div className="panel-body" style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', color: 'var(--text-muted)' }}>
              <ShoppingCart size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Cart is empty</div>
              <div style={{ fontSize: '0.8rem', marginTop: 2 }}>Add products from the left menu</div>
            </div>
          ) : cart.map(item => (
            <div key={item.product_id} className="cart-item" style={{ padding: '12px 0', borderBottom: '1px dashed var(--border)', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className="cart-item-title" style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>{item.name}</div>
                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={11} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: '6px', width: '100%' }}>
                {/* Editable Rate */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(79,70,229,0.05)', border: '1.5px solid rgba(79,70,229,0.2)', borderRadius: 6, padding: '2px 4px', gap: 2 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>₹</span>
                  <input
                    type="number" min="0" step="0.01" value={item.price}
                    onChange={e => updateRate(item.product_id, e.target.value)}
                    style={{ width: '100%', minWidth: '40px', border: 'none', outline: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'center' }}
                  />
                </div>

                {/* Quantity Controls */}
                <div className="cart-item-controls" style={{ background: 'var(--surface)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ width: 22, height: 22, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                  <input
                    type="number" min="0" max={item.stock} value={item.quantity}
                    onChange={e => updateQuantity(item.product_id, e.target.value)}
                    style={{ width: '30px', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ width: 22, height: 22, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>

                {/* Line Total */}
                <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem', textAlign: 'right', minWidth: '60px' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Payment (Sticky Bottom Panel) */}
        <div style={{ padding: '12px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          
          {/* Subtotal & Discount Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Discount</span>
              <div style={{ display: 'flex', alignItems: 'center', width: '60px' }}>
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '2px' }}>₹</span>
                 <input type="number" value={payment.discount} onChange={e => setPayment({...payment, discount: e.target.value})} style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', background: 'transparent' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Other Chg</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '2px' }}>₹</span>
                 <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.other_charges || 0}</span>
              </div>
            </div>

            <button type="button" onClick={addOtherCharge} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }} title="Add Other Charge">
               <PlusCircle size={14} /> Add Charge
            </button>
          </div>

          {/* Multiple Other Charges List */}
          {payment.other_charges_details && payment.other_charges_details.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {payment.other_charges_details.map((charge, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                  <input
                    type="text"
                    placeholder="Charge Name (e.g. Delivery)"
                    value={charge.name}
                    onChange={e => updateOtherCharge(index, 'name', e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', width: '70px', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '2px' }}>₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={charge.amount}
                      onChange={e => updateOtherCharge(index, 'amount', e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', background: 'transparent' }}
                    />
                  </div>
                  <button onClick={() => removeOtherCharge(index)} style={{ background: 'var(--danger)', color: 'white', border: 'none', width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* GST Details Row (Conditional) */}
          {isGstBill && (
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(79,70,229,0.04)', borderRadius: '8px', padding: '6px 12px', border: '1px solid rgba(79,70,229,0.1)', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--primary)' }}>
              <span style={{ fontWeight: 600 }}>CGST (9%): ₹{(tax / 2).toFixed(2)}</span>
              <span style={{ fontWeight: 600 }}>SGST (9%): ₹{(tax / 2).toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--surface-hover) 0%, rgba(16, 185, 129, 0.05) 100%)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--border)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>Grand Total {total !== rawTotal && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 8 }}>(Round Off: {(total - rawTotal).toFixed(2)})</span>}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>₹{typeof total === 'number' ? total.toFixed(2) : total}</span>
          </div>

          {/* Payment Mode Selection */}
          <div style={{ marginBottom: '8px' }}>
            <div className="responsive-payment-grid">
              {[
                { value: 'cash', label: 'Cash', emoji: '💵', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                { value: 'card', label: 'Card (Swipe)', emoji: '💳', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                { value: 'upi', label: 'UPI', emoji: '📱', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                { value: 'credit', label: 'Credit', emoji: '📝', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              ].map(mode => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setPayment(prev => ({ ...prev, method: mode.value }))}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: payment.method === mode.value ? `1.5px solid ${mode.color}` : '1px solid var(--border)',
                    background: payment.method === mode.value ? mode.bg : 'var(--surface)',
                    color: payment.method === mode.value ? mode.color : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{mode.emoji}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Received & Balance Due Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '8px', padding: '4px 10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Received</span>
              <div style={{ display: 'flex', alignItems: 'center', width: '80px' }}>
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '2px' }}>₹</span>
                 <input type="number" value={payment.paid} onChange={e => setPayment({...payment, paid: e.target.value})} style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', background: 'transparent', color: 'var(--success)' }} />
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: liveDueAmount < 0 ? 'rgba(16, 185, 129, 0.05)' : (liveDueAmount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface-hover)'), borderRadius: '8px', padding: '6px 10px', border: '1px solid', borderColor: liveDueAmount < 0 ? 'rgba(16, 185, 129, 0.2)' : (liveDueAmount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)') }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{liveDueAmount < 0 ? 'Advance' : 'Due'}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: liveDueAmount < 0 ? 'var(--primary)' : (liveDueAmount > 0 ? 'var(--danger)' : 'var(--text-muted)') }}>
                ₹{Math.abs(liveDueAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Conditional UPI Digits Input */}
          {payment.method === 'upi' && (
            <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settings?.upi_qr_code && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <img src={settings.upi_qr_code} alt="UPI QR Code" style={{ width: '100%', maxWidth: '280px', height: 'auto', maxHeight: '280px', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
              )}
              <div style={{ padding: '8px 12px', background: 'rgba(79, 70, 229, 0.03)', border: '1px dashed rgba(79, 70, 229, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>UPI Last 5 Digits *</label>
                 <input type="text" maxLength="5" placeholder="e.g. 12345" value={payment.upi_digits} onChange={e => setPayment({...payment, upi_digits: e.target.value.replace(/[^0-9]/g, '')})} style={{ fontWeight: 700, letterSpacing: '2px', fontSize: '0.85rem', textAlign: 'center', width: '90px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--surface)' }} />
              </div>
            </div>
          )}

          {/* Conditional Udhar Link Selector */}
          {payment.method === 'credit' && (
            <div style={{ marginBottom: '8px', background: 'var(--surface-hover)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Link Udhar Account</label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {udharCustomers.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No udhar accounts.</div>
                ) : udharCustomers.map((cust, i) => (
                   <button key={i} type="button" style={{ fontSize: '0.72rem', padding: '4px 10px', whiteSpace: 'nowrap', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 700, transition: 'all 0.1s' }}
                     onClick={() => {
                        setCustomerInfo({ name: cust.customer_name, phone: cust.customer_phone || '', address: customerInfo.address });
                     }}>
                     {cust.customer_name} <span style={{ color: 'var(--danger)' }}>₹{cust.total_due}</span>
                   </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Checkout Button */}
        <div className="panel-footer" style={{ padding: '12px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '8px', letterSpacing: '0.02em', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }} onClick={handleCheckout}>
            <Save size={20} /> {editBillId ? 'Save Adjusted Bill' : 'Complete Order & Print'}
          </button>
        </div>
      </div>


    </div>
  );
};

export default Billing;
