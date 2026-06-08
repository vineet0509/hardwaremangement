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
    if (customerInfo.selected) return;
    if ((customerInfo.phone?.length >= 3 || customerInfo.name?.length >= 3) && !editBillId) {
      const delayFn = setTimeout(() => {
        api.get(`/customers/search?q=${customerInfo.phone || customerInfo.name}`)
           .then(res => setCustomerResults(res.data))
           .catch(() => setCustomerResults([]));
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setCustomerResults([]);
    }
  }, [customerInfo.phone, customerInfo.name, editBillId, customerInfo.selected]);

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
                <p style="margin: 0 0 10px 0;"><strong>Scan to Pay ₹${billData.total} via UPI</strong></p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=${settings.upi_qr_code}&pn=${settings.company_name || 'Merchant'}&am=${billData.total}&cu=INR`)}" alt="UPI QR" style="width: 120px; height: 120px; border: 1px solid #ccc; padding: 5px; border-radius: 5px;">
                <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">UPI ID: ${settings.upi_qr_code}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>This is a computer generated invoice. No signature required.</p>
              <p><strong>Terms & Conditions:</strong> ${settings.terms_and_conditions ? settings.terms_and_conditions.replace(/\n/g, '<br/>') : getTermsAndConditions(settings.business_type)}</p>
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

               if (settings?.plan_limits?.features?.includes('whatsapp_sharing')) {
                 api.post('/bills/send-whatsapp', {
                   bill_id: res.data.id,
                   phone: wapn,
                   message: msgText
                 }).catch(console.error);
               }
             }).catch(console.error);
        }
        

        
        Swal.fire({
          title: 'Success!',
          text: `Bill ${res.data.bill_number} generated successfully.`,
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
    <div className="tally-wrapper">
      
      {/* HEADER SECTION */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ArrowLeft size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate('/bills')} />
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
              {editBillId ? `Edit Invoice #${editBillId}` : 'Sales Voucher'}
            </h2>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
            Date: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div className="tally-top-row">
          {/* Party Details */}
          <div className="tally-panel-party" style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Party A/c Name *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value, selected: false})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
              <input type="text" placeholder="Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value, selected: false})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            {customerResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {customerResults.map((c, i) => (
                  <div key={i} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onClick={() => { setCustomerInfo({ name: c.customer_name, phone: c.customer_phone || '', address: c.customer_address || '', selected: true }); setCustomerResults([]); }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.customer_phone}</div>
                  </div>
                ))}
              </div>
            )}
            <textarea placeholder="Address (Optional)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', marginTop: '10px', minHeight: '60px', resize: 'vertical' }}></textarea>
          </div>


        </div>
      </div>

      {/* GRID SECTION */}
      <div className="tally-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
            <tr>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '50px', textAlign: 'center' }}>S.No</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Name of Item</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '100px', textAlign: 'right' }}>Quantity</th>
              {isGstBill && <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>Base Rate</th>}
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>Rate (Inc. Tax)</th>
              {isGstBill && <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>GST Amt</th>}
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '140px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {/* Auto-complete Entry Row */}
            <tr className="tally-entry-row" style={{ background: '#f8fafc' }}>
              <td className="tally-cell-sno" style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>*</td>
              <td className="tally-cell-search" style={{ padding: '12px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Type to search and add item..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && search.trim() !== '') {
                      const exactMatch = products.find(p => p.sku === search || p.name.toLowerCase() === search.toLowerCase());
                      if (exactMatch) { addToCart(exactMatch); setSearch(''); } 
                      else if (products.length > 0) { addToCart(products[0]); setSearch(''); }
                    }
                  }}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px dashed #94a3b8', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', background: '#ffffff', color: '#0f172a' }} 
                />
                {search && products.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: '12px', right: '12px', zIndex: 100, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    {products.map(p => (
                      <div key={p.id} onClick={() => { addToCart(p); setSearch(''); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Stock: {p.quantity} {p.unit}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>₹{p.selling_price}</div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td className="tally-cell-filler" colSpan={isGstBill ? 6 : 4}></td>
            </tr>

            {cart.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              const itemDiscount = subtotal > 0 && discountAmount > 0 ? (itemTotal / subtotal) * discountAmount : 0;
              const discountedTotal = itemTotal - itemDiscount;
              const basePrice = discountedTotal / (1 + ((item.gst_slab || 0) / 100));
              const itemGstAmt = discountedTotal - basePrice;

              return (
                <tr key={item.product_id} className="tally-item-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td className="tally-cell-sno" style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{index + 1}</td>
                  <td className="tally-cell-name" style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                  <td className="tally-cell-qty" style={{ padding: '12px', textAlign: 'right' }}>
                    <input type="number" min="0" value={item.quantity} onChange={e => updateQuantity(item.product_id, e.target.value)} style={{ width: '80px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
                  </td>
                  {isGstBill && <td className="tally-cell-baserate" style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>₹{(basePrice / (item.quantity || 1)).toFixed(2)}</td>}
                  <td className="tally-cell-rate" style={{ padding: '12px', textAlign: 'right' }}>
                    <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateRate(item.product_id, e.target.value)} style={{ width: '100px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
                  </td>
                  {isGstBill && <td className="tally-cell-gst" style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>₹{itemGstAmt.toFixed(2)}</td>}
                  <td className="tally-cell-amount" style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{itemTotal.toFixed(2)}</td>
                  <td className="tally-cell-action" style={{ padding: '12px', textAlign: 'center' }}>
                    <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.product_id)} />
                  </td>
                </tr>
              );
            })}
            

          </tbody>
        </table>
      </div>

      {/* FOOTER SECTION */}
      <div className="tally-bottom-row">
        {/* Narration & Actions */}
        <div className="tally-panel-notes">
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Narration (Notes)</label>
            <textarea value={payment.notes || ''} onChange={e => setPayment({...payment, notes: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', minHeight: '80px', resize: 'none', marginBottom: '16px' }} placeholder="Additional notes..."></textarea>

            {/* Sales Ledger / Meta (Moved below Narration) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Sales Ledger</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: isGstBill ? '#eff6ff' : '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: isGstBill ? '1px solid #bfdbfe' : '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => setIsGstBill(!isGstBill)}>
                <input type="checkbox" checked={isGstBill} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: isGstBill ? '#1d4ed8' : '#475569' }}>GST Sales @ 18%</span>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', marginTop: '16px' }}>Payment Mode</label>
              <select value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', backgroundColor: '#fff' }}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit (Udhar)</option>
              </select>
              {payment.method === 'upi' && (
                <input type="text" maxLength="5" placeholder="Last 5 Digits of UPI Ref" value={payment.upi_digits} onChange={e => setPayment({...payment, upi_digits: e.target.value.replace(/[^0-9]/g, '')})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', marginTop: '10px' }} />
              )}
              {payment.method === 'credit' && udharCustomers.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Quick Select Udhar Customer:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {udharCustomers.map((cust, i) => (
                      <span key={i} onClick={() => setCustomerInfo({ name: cust.customer_name, phone: cust.customer_phone || '', address: customerInfo.address, selected: true })} style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', color: '#0f172a' }}>{cust.customer_name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {payment.method === 'upi' && settings?.upi_qr_code && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '16px' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Scan to Pay ₹{total.toFixed(2)}</span>
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${settings.upi_qr_code}&pn=${settings.company_name || 'Merchant'}&am=${total.toFixed(2)}&cu=INR`)}`} alt="UPI QR Code" style={{ width: '150px', height: '150px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'contain' }} />
               <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginTop: '8px' }}>UPI ID: {settings.upi_qr_code}</span>
            </div>
          )}
          
        </div>

        {/* Totals */}
        <div className="tally-panel-totals">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
            <span>Subtotal</span>
            <span>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>Less: Discount</span>
            <input type="number" value={payment.discount} onChange={e => setPayment({...payment, discount: e.target.value})} style={{ width: '100px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 600 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Add: Other Charges</span>
              <PlusCircle size={16} color="#3b82f6" style={{ cursor: 'pointer' }} onClick={addOtherCharge} />
            </div>
            <span style={{ fontWeight: 600, color: '#475569' }}>₹{otherChargesAmount.toFixed(2)}</span>
          </div>
          
          {payment.other_charges_details && payment.other_charges_details.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
              {payment.other_charges_details.map((charge, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Charge Name" value={charge.name} onChange={e => updateOtherCharge(index, 'name', e.target.value)} style={{ flex: 1, border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
                  <input type="number" placeholder="0" value={charge.amount} onChange={e => updateOtherCharge(index, 'amount', e.target.value)} style={{ width: '80px', textAlign: 'right', border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
                  <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeOtherCharge(index)} />
                </div>
              ))}
            </div>
          )}

          {isGstBill && (
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                <span>Output CGST (9%)</span>
                <span>₹{(tax / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                <span>Output SGST (9%)</span>
                <span>₹{(tax / 2).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ borderTop: '2px solid #0f172a', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Grand Total</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>₹{total.toFixed(2)}</div>
              {total !== rawTotal && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>(Round Off: {(total - rawTotal).toFixed(2)})</div>}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Amount Received</span>
              <input type="number" value={payment.paid} onChange={e => setPayment({...payment, paid: e.target.value})} style={{ width: '120px', textAlign: 'right', padding: '8px', border: '2px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 800, color: '#10b981' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Balance Due</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: liveDueAmount > 0 ? '#ef4444' : '#64748b' }}>₹{Math.abs(liveDueAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button onClick={() => { setCart([]); localStorage.removeItem('billing_draft'); }} style={{ padding: '14px 24px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <XCircle size={18} /> Clear
        </button>
        <button onClick={handleCheckout} style={{ padding: '14px 32px', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
          <Save size={18} /> {editBillId ? 'Update Voucher' : 'Save & Print Voucher'}
        </button>
      </div>
    </div>
  );
};

export default Billing;
