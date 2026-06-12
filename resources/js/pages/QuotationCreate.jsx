import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { printHtml, openWhatsApp } from '../utils/webview';
import { getTermsAndConditions } from '../utils/terms';
import { Search, Trash2, Save, ArrowLeft, Package, FileText, User, Phone, MapPin, PlusCircle, XCircle } from 'lucide-react';

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
  const [otherChargesDetails, setOtherChargesDetails] = useState([]);
  const [isGst, setIsGst] = useState(false);
  const [notes, setNotes] = useState('');
  const [mobileTab, setMobileTab] = useState('products');
  const [settings, setSettings] = useState({});

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
    if (customerInfo.selected) return;
    if (customerInfo.phone?.length >= 3 || customerInfo.name?.length >= 3) {
      const delayFn = setTimeout(() => {
        api.get(`/customers/search?q=${customerInfo.phone || customerInfo.name}`)
           .then(res => setCustomerResults(res.data))
           .catch(() => setCustomerResults([]));
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setCustomerResults([]);
    }
  }, [customerInfo.phone, customerInfo.name, customerInfo.selected]);

  useEffect(() => {
    if (editQuotationId) {
      api.get(`/quotations/${editQuotationId}`).then(res => {
        const q = res.data;
        setCustomerInfo({ name: q.customer_name || '', phone: q.customer_phone || '', address: q.customer_address || '' });
        setIsGst(q.is_gst || false);
        setDiscount(q.discount);
        let details = q.other_charges_details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch(e) { details = []; }
        }
        if (Array.isArray(details) && details.length > 0) {
          setOtherChargesDetails(details);
        } else if (q.other_charges > 0) {
          setOtherChargesDetails([{ name: 'Other Charge', amount: q.other_charges }]);
        } else {
          setOtherChargesDetails([]);
        }
        setNotes(q.notes || '');
        setCart(q.items.map(i => ({
           product_id: i.product_id,
            name: i.product_name,
            unit: i.unit,
            price: i.price,
            quantity: i.quantity,
            stock: 9999 // unlimited stock assumption for quotations
        })));
      }).catch(err => Swal.fire('Error', 'Failed to load quotation for editing.', 'error'));
    }
  }, [editQuotationId]);

  // Load draft
  useEffect(() => {
    if (!editQuotationId) {
      try {
        const draft = JSON.parse(localStorage.getItem('quotation_draft'));
        if (draft && draft.cart && draft.cart.length > 0) {
          setCart(draft.cart);
          if (draft.customerInfo) setCustomerInfo(draft.customerInfo);
          if (draft.discount !== undefined) setDiscount(draft.discount);
          if (draft.otherChargesDetails !== undefined) {
             setOtherChargesDetails(draft.otherChargesDetails);
          } else if (draft.otherCharges !== undefined) {
             setOtherChargesDetails(draft.otherCharges > 0 ? [{ name: 'Other Charge', amount: draft.otherCharges }] : []);
          }
          if (draft.notes) setNotes(draft.notes);
          if (draft.isGst !== undefined) setIsGst(draft.isGst);
        }
      } catch (e) {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (!editQuotationId) {
      if (cart.length > 0 || customerInfo.name) {
        localStorage.setItem('quotation_draft', JSON.stringify({
          cart, customerInfo, discount, otherChargesDetails, notes, isGst
        }));
      } else {
        localStorage.removeItem('quotation_draft');
      }
    }
  }, [cart, customerInfo, discount, otherChargesDetails, notes, isGst]);

  const addOtherCharge = () => setOtherChargesDetails(prev => [...prev, { name: '', amount: '' }]);
  const updateOtherCharge = (index, field, value) => {
    setOtherChargesDetails(prev => {
      const newDetails = [...prev];
      newDetails[index][field] = value;
      return newDetails;
    });
  };
  const removeOtherCharge = (index) => setOtherChargesDetails(prev => prev.filter((_, i) => i !== index));

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, unit: product.unit, price: product.selling_price, gst_slab: product.gst_slab || 0, quantity: 1, stock: product.quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQ = parseFloat(quantity);
        if (isNaN(newQ)) return { ...item, quantity: 0 };
        return { ...item, quantity: newQ };
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

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = parseFloat(discount) || 0;
  const otherChargesAmount = otherChargesDetails.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
  const tax = isGst ? cart.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;
    const itemDiscount = subtotal > 0 && discountAmount > 0 ? (itemTotal / subtotal) * discountAmount : 0;
    const discountedTotal = itemTotal - itemDiscount;
    const basePrice = discountedTotal / (1 + ((item.gst_slab || 0) / 100));
    return acc + (discountedTotal - basePrice);
  }, 0) : 0;
  const rawTotal = subtotal - discountAmount + otherChargesAmount;
  const total = Math.round(rawTotal);

  const handlePreview = () => {
    if (cart.length === 0) return Swal.fire('Empty Quote', 'Add products to preview.', 'warning');
    
    // Use printHtml helper — works in both browser and Android WebView
    printHtml(`
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
                <h1>${settings.company_name || 'VyaparSync'}</h1>
                <p>${settings.company_address || ''}</p>
                <p>Phone: ${settings.company_phone || ''}</p>
                ${settings.gst_number ? `<p><strong>GSTIN: ${settings.gst_number}</strong></p>` : ''}
              </div>
              <div class="bill-info">
                <h2>ESTIMATE / QUOTATION</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
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
                <td class="text-right">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td class="text-right">- ₹${parseFloat(discount) || 0}</td>
              </tr>
              ${otherChargesAmount > 0 ? (
                (() => {
                  let details = otherChargesDetails;
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
                        <td class="text-right">+ ₹${otherChargesAmount}</td>
                      </tr>
                    `;
                  }
                })()
              ) : ''}
              ${Math.round(rawTotal) !== rawTotal ? `
              <tr>
                <td>Round Off:</td>
                <td class="text-right">₹${(Math.round(rawTotal) - rawTotal).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${isGst ? `
                <tr>
                  <td>CGST:</td>
                  <td class="text-right">₹${(tax / 2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST:</td>
                  <td class="text-right">₹${(tax / 2).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total Estimate:</td>
                <td class="text-right">₹${total.toFixed(2)}</td>
              </tr>
            </table>

            <div class="footer">
              <p>This is a computer generated quotation. Valid for 15 days.</p>
              <p><strong>Terms & Conditions:</strong> ${getTermsAndConditions(settings.business_type)}</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return Swal.fire('Empty Quote', 'Please add items first.', 'warning');

    const payload = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      discount: parseFloat(discount) || 0,
      other_charges: otherChargesAmount,
      other_charges_details: otherChargesDetails,
      tax: tax,
      is_gst: isGst,
      notes: notes,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: parseFloat(i.price) || 0, unit: i.unit }))
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
             
             let itemListStr = res.data.items?.map(i => `• ${i.product_name} (Qty: ${i.quantity} ${i.unit || ''}) = Rs.${i.total}`).join('\n') || '';
             
             const msgText = `*VyaparSync Quotation* 📝\n-----------------------------------\n*Quotation No:* ${res.data.quotation_number}\n*Customer:* ${res.data.customer_name || 'Walk-in'}\n\n*Items:*\n${itemListStr}\n-----------------------------------\n*Total Amount:* Rs. ${res.data.total}\n\nThis is an estimate and subject to change. Thank you!`;

             // Use openWhatsApp helper — works in both browser and Android WebView
             openWhatsApp(wapn, msgText);
        }
        
        Swal.fire({
          title: 'Generated!',
          text: `Quotation No: ${res.data.quotation_number} saved and sent to WhatsApp.`,
          icon: 'success',
          timer: 3000
        });
        
        localStorage.removeItem('quotation_draft');
        setCart([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setDiscount(0);
        setOtherChargesDetails([]);
        setNotes('');
        navigate('/quotations');
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Error occurred.', 'error'));
  };

  return (
    <div className="tally-wrapper">
      
      {/* HEADER SECTION */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ArrowLeft size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate('/quotations')} />
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
              {editQuotationId ? `Edit Quotation #${editQuotationId}` : 'Estimate / Quotation'}
            </h2>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
            Date: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div className="tally-top-row">
          {/* Party Details */}
          <div className="tally-panel-party" style={{ position: 'relative', zIndex: 50 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Customer Name *</label>
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

      {/* PRODUCT SEARCH & QUICK ADD SECTION */}
      <div style={{ marginBottom: '16px', position: 'relative', zIndex: 1000 }}>
        <input 
          type="text" 
          placeholder="🔍 Search products by name or SKU..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && search.trim() !== '') {
              const exactMatch = products.find(p => p.sku === search || p.name.toLowerCase() === search.toLowerCase());
              if (exactMatch) { addToCart(exactMatch); setSearch(''); } 
              else if (products.length > 0) { addToCart(products[0]); setSearch(''); }
            }
          }}
          style={{ width: '100%', padding: '12px 16px', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
        />
        {search && products.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', marginTop: '8px' }}>
            {products.map(p => (
              <div key={p.id} onClick={() => { addToCart(p); setSearch(''); }} style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Stock: {p.quantity} {p.unit}</span>
                    {p.sku && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SKU: {p.sku}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#d4af37', fontSize: '1.1rem', textAlign: 'right' }}>₹{p.selling_price}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID SECTION */}
      <div className="tally-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
            <tr>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '50px', textAlign: 'center' }}>S.No</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Name of Item</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '100px', textAlign: 'right' }}>Quantity</th>
              {isGst && <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>Base Rate</th>}
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>Rate (Inc. Tax)</th>
              {isGst && <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '120px', textAlign: 'right' }}>GST Amt</th>}
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '140px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>

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
                  {isGst && <td className="tally-cell-baserate" style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>₹{(basePrice / (item.quantity || 1)).toFixed(2)}</td>}
                  <td className="tally-cell-rate" style={{ padding: '12px', textAlign: 'right' }}>
                    <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateRate(item.product_id, e.target.value)} style={{ width: '100px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
                  </td>
                  {isGst && <td className="tally-cell-gst" style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>₹{itemGstAmt.toFixed(2)}</td>}
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Notes / Remarks</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', minHeight: '80px', resize: 'none', marginBottom: '16px' }} placeholder="Additional notes..."></textarea>

            {/* Sales Ledger / Meta (Moved below Narration) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Quotation Type</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: isGst ? '#eff6ff' : '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: isGst ? '1px solid #bfdbfe' : '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => setIsGst(!isGst)}>
                <input type="checkbox" checked={isGst} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: isGst ? '#1d4ed8' : '#475569' }}>GST Quotation @ 18%</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Totals */}
        <div className="tally-panel-totals">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
            <span>Subtotal</span>
            <span>₹{typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>Less: Discount</span>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: '100px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 600 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Add: Other Charges</span>
              <PlusCircle size={16} color="#3b82f6" style={{ cursor: 'pointer' }} onClick={addOtherCharge} />
            </div>
            <span style={{ fontWeight: 600, color: '#475569' }}>₹{otherChargesAmount.toFixed(2)}</span>
          </div>
          
          {otherChargesDetails && otherChargesDetails.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
              {otherChargesDetails.map((charge, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Charge Name" value={charge.name} onChange={e => updateOtherCharge(index, 'name', e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
                  <input type="number" placeholder="0" value={charge.amount} onChange={e => updateOtherCharge(index, 'amount', e.target.value)} style={{ width: '60px', flexShrink: 0, textAlign: 'right', border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
                  <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeOtherCharge(index)} />
                </div>
              ))}
            </div>
          )}

          {isGst && (
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
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Total Estimate</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d4af37' }}>₹{total.toFixed(2)}</div>
              {total !== rawTotal && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>(Round Off: {(total - rawTotal).toFixed(2)})</div>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button onClick={() => { setCart([]); localStorage.removeItem('quotation_draft'); }} style={{ padding: '14px 24px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <XCircle size={18} /> Clear
        </button>
        <button onClick={handlePreview} style={{ padding: '14px 24px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Preview
        </button>
        <button onClick={handleCheckout} style={{ padding: '14px 32px', background: '#d4af37', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
          <Save size={18} /> {editQuotationId ? 'Update Quotation' : 'Save & Send Quotation'}
        </button>
      </div>
    </div>
  );
};

export default QuotationCreate;
