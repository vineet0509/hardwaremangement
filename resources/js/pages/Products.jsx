import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { downloadFile, downloadBlob } from '../utils/webview';
import { Plus, Search, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2, PackageX } from 'lucide-react';
import Pagination from '../components/Pagination';

import Swal from 'sweetalert2';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({
    name: '', category_id: '', supplier_id: '', purchase_price: 0, selling_price: 0, gst_slab: 18, quantity: 0, min_stock_alert: 5, unit: 'piece'
  });

  const [stockModal, setStockModal] = useState({ show: false, type: 'add', product: null });
  const [stockQty, setStockQty] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  const [damageModal, setDamageModal] = useState({ show: false, product: null });
  const [damageQty, setDamageQty] = useState('');
  const [damageReason, setDamageReason] = useState('');
  const [damageDate, setDamageDate] = useState(new Date().toISOString().split('T')[0]);

  const handleReportDamage = (e) => {
    e.preventDefault();
    if (!damageQty || damageQty <= 0) return;
    api.post('/damaged-goods', {
      product_id: damageModal.product.id,
      quantity: parseFloat(damageQty),
      reason: damageReason,
      date: damageDate
    })
      .then(() => {
        setDamageModal({ show: false, product: null });
        setDamageQty('');
        setDamageReason('');
        Swal.fire('Reported!', 'Damaged goods reported successfully.', 'success');
        fetchData();
      })
      .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to report damaged goods', 'error'));
  };

  const handleStockUpdate = (e) => {
    e.preventDefault();
    if (!stockQty || stockQty <= 0) return;
    const url = `/products/${stockModal.product.id}/${stockModal.type}-stock`;
    api.post(url, { 
      quantity: parseInt(stockQty), 
      price: stockPrice ? parseFloat(stockPrice) : null,
      reason: stockModal.type === 'add' ? 'Stock Restock' : 'Manual Adjustment' 
    })
      .then(() => {
        setStockModal({ show: false, type: 'add', product: null });
        setStockQty('');
        setStockPrice('');
        fetchData();
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Error updating stock'));
  };
  const handleExportCSV = () => {
    const token = localStorage.getItem('auth_token');
    const url = `${window.location.origin}/api/products/export?token=${token}`;
    // Use downloadFile helper — works in both browser and Android WebView
    downloadFile(url, `products_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const importData = new FormData();
    importData.append('file', file);

    api.post('/products/import', importData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => {
      Swal.fire(res.data.message);
      fetchData();
    })
    .catch(err => Swal.fire(err.response?.data?.message || 'Import failed'));
  };
  const handleDownloadSampleCSV = () => {
    const csvContent = "SKU,Product Name,Category,Purchase Price,Selling Price,Quantity,Min Stock Alert,Unit,Description\nSKU-1001,Sample Product,General,10.00,15.00,100,10,piece,Sample description";
    // Use downloadBlob helper — works in both browser and Android WebView
    downloadBlob(csvContent, 'sample_products.csv', 'text/csv;charset=utf-8;');
  };

  const fetchData = () => {
    setLoading(true);
    api.get(`/products?search=${search}`)
      .then(res => {
        setProducts(res.data.data || res.data);
        setCurrentPage(1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/categories')
       .then(res => setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
       .catch(err => { console.error(err); setCategories([]); });
       
    api.get('/suppliers')
       .then(res => setSuppliers(res.data))
       .catch(console.error);
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      supplier_id: formData.supplier_id ? formData.supplier_id : null 
    };
    const req = editProductId 
      ? api.put(`/products/${editProductId}`, payload)
      : api.post('/products', payload);
      
    req.then(() => {
        setShowModal(false);
        fetchData();
        setFormData({ name: '', category_id: '', purchase_price: 0, selling_price: 0, quantity: 0, min_stock_alert: 5, unit: 'piece' });
        setEditProductId(null);
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Error occurred while saving product.'));
  };

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this product? It will be soft-deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/products/${id}`)
          .then(() => fetchData())
          .catch(err => Swal.fire(err.response?.data?.message || 'Error deleting product'));
      }
    });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if(!newCatName) return;
    api.post('/categories', { name: newCatName })
      .then(res => {
        setCategories([...categories, res.data]);
        setFormData({...formData, category_id: res.data.id});
        setShowCatModal(false);
        setNewCatName('');
      })
      .catch(err => Swal.fire(err.response?.data?.message || 'Error adding category'));
  };

  return (
    <div>
      <div className="products-actions-wrapper" style={{ marginBottom: 24, display: 'flex', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280, maxWidth: 400 }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        <div className="products-buttons-grid" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleDownloadSampleCSV}>
            Sample CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            Export CSV
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
            Import CSV
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          </label>
          <button className="btn btn-primary" onClick={() => {
            setEditProductId(null);
            setFormData({ name: '', category_id: '', purchase_price: 0, selling_price: 0, gst_slab: 18, quantity: 0, min_stock_alert: 5, unit: 'piece' });
            setShowModal(true);
          }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        {(() => {
          const totalPages = Math.ceil((products || []).length / itemsPerPage);
          const currentProducts = (products || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
          
          return (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Cost Price</th>
                      <th>Sell Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                    ) : (!currentProducts || !Array.isArray(currentProducts) || currentProducts.length === 0) ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
                    ) : currentProducts.map(p => (
                      <tr key={p.id}>
                <td>
                  <span className="badge" style={{ background: 'var(--surface-hover)' }}>{p.sku}</span>
                  <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--primary)', color: 'var(--primary)' }} title="Edit Product"
                      onClick={() => {
                        setEditProductId(p.id);
                        setFormData({
                          name: p.name, category_id: p.category_id, supplier_id: p.supplier_id || '', purchase_price: p.purchase_price,
                          selling_price: p.selling_price, gst_slab: p.gst_slab || 0, quantity: p.quantity,
                          min_stock_alert: p.min_stock_alert, unit: p.unit
                        });
                        setShowModal(true);
                      }}>
                      <Edit2 size={14} /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Edit</span>
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px' }} title="Add Stock"
                      onClick={() => {
                        setStockModal({ show: true, type: 'add', product: p });
                        setStockPrice(p.purchase_price);
                      }}>
                      <ArrowUpCircle size={14} color="var(--success)" /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Add Stock</span>
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px' }} title="Remove Stock"
                      onClick={() => setStockModal({ show: true, type: 'remove', product: p })}>
                      <ArrowDownCircle size={14} color="var(--danger)" /> <span className="btn-label" style={{ fontSize: '0.75rem' }}>Remove Stock</span>
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--warning)' }} title="Report Damage"
                      onClick={() => setDamageModal({ show: true, product: p })}>
                      <PackageX size={14} color="var(--warning)" /> <span className="btn-label" style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>Damage</span>
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px' }} title="Delete Product"
                      onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 size={14} color="var(--danger)" /> <span className="btn-label" style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Delete</span>
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  {p.quantity <= p.min_stock_alert && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Low Stock
                    </span>
                  )}
                </td>
                <td>{p.category?.name}</td>
                <td>₹{p.purchase_price}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{p.selling_price}</td>
                <td>
                  <span className={`badge ${p.quantity > p.min_stock_alert ? 'badge-success' : 'badge-danger'}`}>
                    {p.quantity} {p.unit}
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
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editProductId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-control" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier (Optional)</label>
                  <select className="form-control"
                    value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})}>
                    <option value="">No Assigned Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">Category</label>
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setShowCatModal(true)}>+ New Category</button>
                  </div>
                  <select className="form-control" required
                    value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Purchase Price</label>
                    <input type="number" className="form-control" required 
                      value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Selling Price (With GST)</label>
                    <input type="number" className="form-control" required 
                      value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">GST Slab (%)</label>
                    <select className="form-control" value={formData.gst_slab} onChange={e => setFormData({...formData, gst_slab: parseInt(e.target.value)})}>
                      <option value="0">0% (Nil)</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Initial Quantity</label>
                    <input type="number" className="form-control" required disabled={editProductId !== null}
                      value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Unit</label>
                    <select className="form-control" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                      <optgroup label="Construction">
                        <option value="CFT">CFT (Cubic Feet)</option>
                        <option value="Brass">Brass</option>
                        <option value="MT">MT (Metric Ton)</option>
                        <option value="Bag">Bag(s)</option>
                        <option value="KG">Kilogram(s)</option>
                        <option value="RFT">RFT (Running Feet)</option>
                        <option value="SQFT">SQFT (Square Feet)</option>
                      </optgroup>
                      <optgroup label="General">
                        <option value="piece">Piece(s)</option>
                        <option value="nos">Numbers (NOS)</option>
                        <option value="box">Box(es)</option>
                        <option value="bundle">Bundle(s)</option>
                        <option value="meter">Meter(s)</option>
                        <option value="liter">Liter(s)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{stockModal.type === 'add' ? 'Add' : 'Remove'} Stock ({stockModal.product?.name})</h3>
              <button className="close-btn" onClick={() => setStockModal({ show: false, type: 'add', product: null })}>×</button>
            </div>
            <form onSubmit={handleStockUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Quantity to {stockModal.type}</label>
                  <input type="number" className="form-control" required min="1"
                    value={stockQty} onChange={e => setStockQty(e.target.value)} />
                </div>
                {stockModal.type === 'add' && (
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Purchase Price (Per {stockModal.product?.unit})</label>
                    <input type="number" step="0.01" className="form-control" required
                      value={stockPrice} onChange={e => setStockPrice(e.target.value)} />
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Current Stock: <strong style={{ color: 'var(--text-main)' }}>{stockModal.product?.quantity} {stockModal.product?.unit}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setStockModal({ show: false, type: 'add', product: null })}>Cancel</button>
                <button type="submit" className={`btn ${stockModal.type === 'add' ? 'btn-primary' : 'btn-danger'}`}>
                  Confirm {stockModal.type === 'add' ? 'Addition' : 'Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {damageModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Damaged Goods ({damageModal.product?.name})</h3>
              <button className="close-btn" onClick={() => setDamageModal({ show: false, product: null })}>×</button>
            </div>
            <form onSubmit={handleReportDamage}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Quantity Damaged</label>
                  <input type="number" step="0.01" className="form-control" required min="0.01" max={damageModal.product?.quantity}
                    value={damageQty} onChange={e => setDamageQty(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Reason (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Broken in transit"
                    value={damageReason} onChange={e => setDamageReason(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" required
                    value={damageDate} onChange={e => setDamageDate(e.target.value)} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Current Stock: <strong style={{ color: 'var(--text-main)' }}>{damageModal.product?.quantity} {damageModal.product?.unit}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setDamageModal({ show: false, product: null })}>Cancel</button>
                <button type="submit" className="btn btn-danger">
                  Report Damage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Add Category</h3>
              <button className="close-btn" onClick={() => setShowCatModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input type="text" className="form-control" required 
                    value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
