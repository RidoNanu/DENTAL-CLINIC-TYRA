import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import apiClient from '../../lib/apiClient';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await apiClient.get('/admin');
            setAdmins(response.admins);
        } catch (err) {
            setError('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');
        setSuccess('');

        try {
            await apiClient.post('/admin', formData);
            setSuccess(`Admin account created for ${formData.email}`);
            setFormData({ email: '', password: '' });
            setShowAddForm(false);
            fetchAdmins();
        } catch (err) {
            setError(err.message || 'Failed to create admin');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, email) => {
        if (!confirm(`Delete admin account for ${email}?`)) return;

        try {
            await apiClient.delete(`/admin/${id}`);
            setSuccess(`Admin account deleted: ${email}`);
            fetchAdmins();
        } catch (err) {
            setError(err.message || 'Failed to delete admin');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="admins-header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                        Admin Users
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Manage admin accounts for the dashboard</p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="add-admin-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '44px', width: '100%' }}
                >
                    <UserPlus size={20} />
                    Add Admin
                </Button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <p style={{ color: '#15803d', margin: 0 }}>{success}</p>
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} style={{ color: '#dc2626' }} />
                    <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Add Admin Form */}
            {showAddForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '1.5rem' }}>
                        Create New Admin
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@example.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Password must be at least 6 characters long
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button type="submit" isLoading={formLoading} disabled={formLoading}>
                                Create Admin
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({ email: '', password: '' });
                                    setError('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Admins List - Responsive + Desktop Table View */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                {/* Mobile Card View */}
                <div className="mobile-admins-view" style={{ display: 'block' }}>
                    {admins.map((admin, index) => (
                        <div
                            key={admin.id}
                            style={{
                                padding: '1.25rem',
                                borderBottom: index !== admins.length - 1 ? '1px solid #f1f5f9' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e0f2fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0284c7',
                                    flexShrink: 0
                                }}>
                                    <Shield size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                                        {admin.email}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.875rem' }}>
                                        Created: {new Date(admin.created_at).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(admin.id, admin.email)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1rem',
                                            minHeight: '44px',
                                            border: '1px solid #fecaca',
                                            backgroundColor: '#fef2f2',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        title="Delete admin"
                                    >
                                        <Trash2 size={16} />
                                        Delete Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="desktop-admins-view" style={{ display: 'none' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: '1rem',
                        padding: '1rem 1.5rem',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <div>Email</div>
                        <div>Created</div>
                        <div>Actions</div>
                    </div>
                    {admins.map((admin) => (
                        <div
                            key={admin.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto auto',
                                gap: '1rem',
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid #f1f5f9',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e0f2fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0284c7'
                                }}>
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500', color: '#0f172a' }}>{admin.email}</div>
                                </div>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                {new Date(admin.created_at).toLocaleDateString()}
                            </div>
                            <button
                                onClick={() => handleDelete(admin.id, admin.email)}
                                style={{
                                    padding: '0.625rem',
                                    minHeight: '44px',
                                    minWidth: '44px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    borderRadius: '0.375rem',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Delete admin"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Responsive CSS */}
            <style>{`
                /* Mobile: Show cards, hide table */
                @media (max-width: 639px) {
                    .mobile-admins-view {
                        display: block !important;
                    }
                    .desktop-admins-view {
                        display: none !important;
                    }
                    .admins-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .add-admin-btn {
                        width: 100% !important;
                    }
                }
                
                /* Tablet and up: Hide cards, show table */
                @media (min-width: 640px) {
                    .mobile-admins-view {
                        display: none !important;
                    }
                    .desktop-admins-view {
                        display: block !important;
                    }
                    .admins-header {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                    }
                    .add-admin-btn {
                        width: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManageAdmins;
