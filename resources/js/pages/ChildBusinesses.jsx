import React, { useState, useEffect } from 'react';
import { Store, Plus, Power, Building, AlertCircle, Key, User, Phone, Mail } from 'lucide-react';
import api from '../utils/api';

const ChildBusinesses = () => {
    const [shops, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Form state
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gst_number: '',
        email: '',
        mobile: '',
        password: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [newCredentials, setNewCredentials] = useState(null); // shows after creation

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/child-businesses');
            setBusinesses(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch child shops.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await api.get('/me');
            setUser(res.data);
            // Pre-fill branch name with parent shop name from settings if available
            const settingsRes = await api.get('/settings');
            const parentShopName = settingsRes.data?.company_name || '';
            setFormData(prev => ({ ...prev, name: parentShopName }));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBusinesses();
        fetchUser();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setNewCredentials(null);
        try {
            const res = await api.post('/child-businesses', formData);
            setIsCreating(false);
            setFormData({ name: '', gst_number: '', email: '', mobile: '', password: '' });
            fetchBusinesses();
            // Show login credentials info
            setNewCredentials({
                shopName: res.data.business?.name,
                mobile: res.data.admin?.mobile,
                email: res.data.admin?.email,
                password: formData.password,
            });
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create child shop.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this shop?`)) return;

        try {
            await api.patch(`/child-businesses/${id}/toggle-status`, { is_active: !currentStatus });
            fetchBusinesses();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle status.');
        }
    };

    const openCreateForm = () => {
        setIsCreating(true);
        setNewCredentials(null);
        setFormError(null);
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px 0' }}>Branches</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your sub-branches. Each branch gets its own login.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={openCreateForm}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Plus size={18} /> Add New Branch
                    </button>
                )}
            </div>

            {/* Newly created credentials banner */}
            {newCredentials && (
                <div style={{
                    padding: 20,
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 12,
                    marginBottom: 24
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                        <Key size={18} /> Branch Created — Login Credentials
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Share these with the branch admin. They can log in using their <strong>mobile number</strong> and password.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                        <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>BRANCH</div>
                            <div style={{ fontWeight: 600 }}>{newCredentials.shopName}</div>
                        </div>
                        <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>LOGIN (MOBILE)</div>
                            <div style={{ fontWeight: 600 }}>{newCredentials.mobile}</div>
                        </div>
                        {newCredentials.email && (
                            <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>EMAIL</div>
                                <div style={{ fontWeight: 600 }}>{newCredentials.email}</div>
                            </div>
                        )}
                        <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>PASSWORD</div>
                            <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{newCredentials.password}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setNewCredentials(null)}
                        style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 8, marginBottom: 20 }}>
                    <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    {error}
                </div>
            )}

            {isCreating && (
                <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', marginBottom: 24 }}>
                    <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building size={20} color="var(--primary)" /> Create New Branch
                    </h3>
                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        The branch admin will log in using their <strong>mobile number</strong> and the password you set below.
                    </p>

                    {formError && (
                        <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' }}>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        <div className="form-group">
                            <label>Branch / Business Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Main Branch, Warehouse Branch"
                                required
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pre-filled with your shop name. Edit if needed.</small>
                        </div>
                        <div className="form-group">
                            <label>GST Number (Optional)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.gst_number}
                                onChange={e => setFormData({ ...formData, gst_number: e.target.value })}
                                placeholder="Branch GST (if different)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Admin Mobile <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                placeholder="Branch admin's mobile number"
                                required
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Used to log into this branch.</small>
                        </div>
                        <div className="form-group">
                            <label>Admin Email (Optional)</label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@branch.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Login Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min. 6 characters"
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ minWidth: 150 }}>
                                {formLoading ? 'Creating...' : 'Create Branch'}
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => { setIsCreating(false); setFormError(null); }}
                                style={{ background: 'var(--border)', color: 'var(--text-main)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>All Branches ({shops.length})</h3>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading branches...</div>
                ) : shops.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Store size={48} opacity={0.2} style={{ marginBottom: 16 }} />
                        <div>No branches found. Create one to get started!</div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Branch ID</th>
                                    <th>Branch Name</th>
                                    <th>Admin Login Info</th>
                                    <th>Status</th>
                                    <th>Created On</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.map(shop => (
                                    <tr key={shop.id}>
                                        <td><strong style={{ color: 'var(--primary)' }}>#{shop.id}</strong></td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{shop.name}</div>
                                            {shop.gst_number && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST: {shop.gst_number}</div>}
                                        </td>
                                        <td>
                                            {shop.users && shop.users.length > 0 ? (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Phone size={12} color="var(--text-muted)" />
                                                        <span>{shop.users[0].mobile || '—'}</span>
                                                    </div>
                                                    {shop.users[0].email && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                            <Mail size={11} color="var(--text-muted)" />
                                                            <span>{shop.users[0].email}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No Admin Found</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                borderRadius: 20,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: shop.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: shop.is_active ? '#10b981' : '#ef4444'
                                            }}>
                                                {shop.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(shop.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleToggleStatus(shop.id, shop.is_active)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 8,
                                                    border: 'none',
                                                    background: shop.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: shop.is_active ? '#ef4444' : '#10b981',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}
                                            >
                                                <Power size={14} />
                                                {shop.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChildBusinesses;
