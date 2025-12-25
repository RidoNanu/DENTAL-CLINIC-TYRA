import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPatients, createPatient } from '../../services/patientService';

const ManagePatients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        phone: '',
        email: '',
    });

    // API state management
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch patients on component mount
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPatients();
            setPatients(data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError(err.message || 'Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async () => {
        if (!newPatient.name || !newPatient.phone) {
            alert('Name and phone are required');
            return;
        }

        try {
            setIsCreating(true);
            const patientData = {
                name: newPatient.name,
                phone: newPatient.phone,
                email: newPatient.email || null,
            };

            const createdPatient = await createPatient(patientData);

            // Add new patient to the list
            setPatients([createdPatient, ...patients]);

            // Close modal and reset form
            setIsModalOpen(false);
            setNewPatient({ name: '', phone: '', email: '' });
        } catch (err) {
            console.error('Error creating patient:', err);
            alert('Failed to create patient: ' + (err.message || 'Unknown error'));
        } finally {
            setIsCreating(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>Patient Records</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage and view clinic patient history</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <User size={18} style={{ marginRight: '0.5rem' }} /> Add Patient
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                    <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>Error loading patients</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
                    <Button onClick={fetchPatients} size="small">Try Again</Button>
                </Card>
            )}

            {/* Loading State */}
            {loading ? (
                <Card style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading patients...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </Card>
            ) : (
                <>
                    {/* Search */}
                    <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '500px' }}>
                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Patients Table */}
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Patient
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Contact
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Date Added
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                            {searchTerm ? `No patients found matching "${searchTerm}"` : 'No patients yet. Add your first patient!'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map(patient => (
                                        <tr key={patient.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{patient.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {patient.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#334155' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                                                    {patient.email && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Mail size={14} style={{ color: '#94a3b8' }} /> {patient.email}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Phone size={14} style={{ color: '#94a3b8' }} /> {patient.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {/* Add Patient Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={() => setIsModalOpen(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            width: '100%',
                            maxWidth: '500px',
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Add New Patient</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Create a new patient record</p>
                        </div>

                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Jane Doe"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +91 99999 99999"
                                    value={newPatient.phone}
                                    onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                                    Email Address (Optional)
                                </label>
                                <input
                                    type="email"
                                    placeholder="e.g. jane@example.com"
                                    value={newPatient.email}
                                    onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc' }}>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleAddPatient} isLoading={isCreating}>
                                {isCreating ? 'Creating...' : 'Add Patient'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePatients;
