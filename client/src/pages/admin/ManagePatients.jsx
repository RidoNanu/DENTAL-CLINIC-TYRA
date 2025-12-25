import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Phone, Mail, Calendar, Users, Download, Filter, X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPatients, createPatient } from '../../services/patientService';
import { getAppointments } from '../../services/appointmentService';

// Force reload
const ManagePatients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [showOnlyWithVisits, setShowOnlyWithVisits] = useState(false); // New: Toggle for patient view filter
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        gender: '',
    });

    // Utility function to calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Utility function to format date of birth
    const formatDOB = (dateOfBirth) => {
        if (!dateOfBirth) return 'Not specified';
        const date = new Date(dateOfBirth);
        const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const age = calculateAge(dateOfBirth);
        return age !== null ? `${formatted} (${age} yrs)` : formatted;
    };

    // Utility function to format gender
    const formatGender = (gender) => {
        if (!gender) return null;
        const genderMap = {
            'male': 'Male',
            'female': 'Female',
            'other': 'Other',
            'prefer_not_to_say': 'Prefer not to say'
        };
        return genderMap[gender] || gender;
    };

    // API state management
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch patients and appointments on component mount
    useEffect(() => {
        fetchPatients();
        fetchAppointments();
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

    const fetchAppointments = async () => {
        try {
            const data = await getAppointments();
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    // Get last appointment for a patient
    const getLastAppointment = (patientId) => {
        const now = new Date();
        const patientAppointments = appointments.filter(
            apt => apt.patient_id === patientId &&
                (apt.status === 'completed' || new Date(apt.appointment_at) < now)
        ).sort((a, b) => new Date(b.appointment_at) - new Date(a.appointment_at)); // Sort descending for most recent

        return patientAppointments[0] || null;
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
                date_of_birth: newPatient.date_of_birth || null,
                gender: newPatient.gender || null,
            };

            const createdPatient = await createPatient(patientData);

            // Add new patient to the list
            setPatients([createdPatient, ...patients]);

            // Close modal and reset form
            setIsModalOpen(false);
            setNewPatient({ name: '', phone: '', email: '', date_of_birth: '', gender: '' });
        } catch (err) {
            console.error('Error creating patient:', err);
            alert('Failed to create patient: ' + (err.message || 'Unknown error'));
        } finally {
            setIsCreating(false);
        }
    };

    // Calculate counts for toggle display
    const patientsWithVisits = patients.filter(p =>
        appointments.some(
            apt => apt.patient_id === p.id &&
                (apt.status === 'completed' || new Date(apt.appointment_at) < new Date())
        )
    );

    const filteredPatients = patients.filter(p => {
        // FIRST: Apply visit filter toggle (if enabled)
        if (showOnlyWithVisits) {
            const hasCompletedAppointment = appointments.some(
                apt => apt.patient_id === p.id &&
                    (apt.status === 'completed' || new Date(apt.appointment_at) < new Date())
            );

            if (!hasCompletedAppointment) {
                return false; // Skip patients with no completed visits
            }
        }

        // THEN: Apply search/filter criteria
        const matchesSearch = (
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm)
        );

        let matchesDate = true;
        if (startDate || endDate) {
            const patientDate = new Date(p.created_at);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (patientDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (patientDate > end) matchesDate = false;
            }
        }

        // Gender filter
        let matchesGender = true;
        if (selectedGender) {
            if (selectedGender === 'not_specified') {
                matchesGender = !p.gender;
            } else {
                matchesGender = p.gender === selectedGender;
            }
        }

        // Age range filter
        let matchesAge = true;
        if (ageMin || ageMax) {
            const age = calculateAge(p.date_of_birth);
            if (age === null) {
                matchesAge = false; // Exclude patients without DOB from age filter
            } else {
                if (ageMin && age < parseInt(ageMin)) matchesAge = false;
                if (ageMax && age > parseInt(ageMax)) matchesAge = false;
            }
        }

        return matchesSearch && matchesDate && matchesGender && matchesAge;
    });

    const exportToCSV = () => {
        if (filteredPatients.length === 0) {
            alert("No patients to export");
            return;
        }

        const headers = ["Name", "Phone", "Email", "Date of Birth", "Gender", "Date Added"];
        const csvContent = [
            headers.join(","),
            ...filteredPatients.map(p => [
                `"${p.name}"`,
                `"${p.phone}"`,
                `"${p.email || ''}"`,
                `"${p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : ''}"`,
                `"${p.gender || ''}"`,
                `"${new Date(p.created_at).toLocaleDateString()}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (filteredPatients.length === 0) {
            alert("No patients to export");
            return;
        }

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("Patient Records Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

        // Table Config
        const tableColumn = ["Name", "Phone", "Email", "Date of Birth", "Gender", "Date Added"];
        const tableRows = filteredPatients.map(patient => [
            patient.name,
            patient.phone,
            patient.email || '-',
            patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not specified',
            patient.gender ? (patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)) : 'Not specified',
            new Date(patient.created_at).toLocaleDateString()
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [15, 23, 42] } // Match slate-900
        });

        doc.save(`patients_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="animate-fade-in">
            {/* Header - Responsive */}
            <div className="patients-header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: '800', color: '#0f172a' }}>Patient Records</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Manage and view clinic patient history</p>
                </div>
                <Button className="add-patient-btn" variant="primary" fullWidth onClick={() => setIsModalOpen(true)}>
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
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Patient</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Contact</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Date of Birth</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Gender</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Date Added</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Last Appointment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ height: '16px', width: '120px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                <div style={{ height: '12px', width: '80px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ height: '14px', width: '150px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        <div style={{ height: '14px', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ height: '14px', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ height: '24px', width: '70px', backgroundColor: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ height: '14px', width: '90px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ height: '14px', width: '110px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.5; }
                        }
                    `}</style>
                </Card>
            ) : (
                <>
                    {/* Unified Search and Filters Card */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                        marginBottom: '2rem'
                    }}>
                        {/* Header Row with Title and Export Buttons - Responsive */}
                        <div className="filter-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={18} color="#0ca4b5" />
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Search & Filter</span>
                            </div>

                            {/* Export Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={exportToCSV}
                                    disabled={filteredPatients.length === 0}
                                    title={filteredPatients.length === 0 ? "No records available to export" : "Export to CSV"}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 0.875rem',
                                        minHeight: '44px',
                                        backgroundColor: filteredPatients.length === 0 ? '#f8fafc' : 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        color: filteredPatients.length === 0 ? '#cbd5e1' : '#0f172a',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: filteredPatients.length === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: filteredPatients.length === 0 ? 0.5 : 1,
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (filteredPatients.length > 0) {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (filteredPatients.length > 0) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }
                                    }}
                                >
                                    <Download size={14} color={filteredPatients.length === 0 ? "#cbd5e1" : "#64748b"} />
                                    <span>CSV</span>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    disabled={filteredPatients.length === 0}
                                    title={filteredPatients.length === 0 ? "No records available to export" : "Export to PDF"}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 0.875rem',
                                        minHeight: '44px',
                                        backgroundColor: filteredPatients.length === 0 ? '#f8fafc' : 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        color: filteredPatients.length === 0 ? '#cbd5e1' : '#0f172a',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: filteredPatients.length === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: filteredPatients.length === 0 ? 0.5 : 1,
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (filteredPatients.length > 0) {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (filteredPatients.length > 0) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }
                                    }}
                                >
                                    <FileText size={14} color={filteredPatients.length === 0 ? "#cbd5e1" : "#ef4444"} />
                                    <span>PDF</span>
                                </button>
                                {(searchTerm || startDate || endDate || selectedGender || ageMin || ageMax) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStartDate('');
                                            setEndDate('');
                                            setSelectedGender('');
                                            setAgeMin('');
                                            setAgeMax('');
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            padding: '0.5rem 0.875rem',
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '0.5rem',
                                            color: '#dc2626',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#fee2e2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#fef2f2';
                                        }}
                                    >
                                        <X size={14} />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* View Toggle Filter */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            marginBottom: '1.25rem',
                            padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                            backgroundColor: '#f8fafc',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Filter size={16} color="#64748b" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginRight: 'auto' }}>
                                Patient View:
                            </span>

                            {/* Toggle Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                                <button
                                    onClick={() => setShowOnlyWithVisits(false)}
                                    style={{
                                        padding: ' 0.5rem 1rem',
                                        backgroundColor: !showOnlyWithVisits ? '#0ca4b5' : 'white',
                                        color: !showOnlyWithVisits ? 'white' : '#64748b',
                                        border: `1px solid ${!showOnlyWithVisits ? '#0ca4b5' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (showOnlyWithVisits) {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (showOnlyWithVisits) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }
                                    }}
                                >
                                    <Users size={14} />
                                    All Patients
                                    <span style={{
                                        backgroundColor: !showOnlyWithVisits ? 'rgba(255, 255, 255, 0.2)' : '#f0f9ff',
                                        color: !showOnlyWithVisits ? 'white' : '#0369a1',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {patients.length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setShowOnlyWithVisits(true)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: showOnlyWithVisits ? '#0ca4b5' : 'white',
                                        color: showOnlyWithVisits ? 'white' : '#64748b',
                                        border: `1px solid ${showOnlyWithVisits ? '#0ca4b5' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!showOnlyWithVisits) {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!showOnlyWithVisits) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }
                                    }}
                                >
                                    <Calendar size={14} />
                                    Patients With Visits Only
                                    <span style={{
                                        backgroundColor: showOnlyWithVisits ? 'rgba(255, 255, 255, 0.2)' : '#f0f9ff',
                                        color: showOnlyWithVisits ? 'white' : '#0369a1',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {patientsWithVisits.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Search Bar - Updated 19:23 */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 }}>
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 2.75rem 0.625rem 2.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        color: '#334155',
                                        fontWeight: '400'
                                    }}
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.borderColor = '#cbd5e1';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            padding: '0.25rem',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            color: '#94a3b8'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#64748b';
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '#94a3b8';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                        title="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filters Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            {/* Date Range Filter */}
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Calendar size={14} />
                                    Date Added
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label htmlFor="start-date-patients" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            From Date
                                        </label>
                                        <input
                                            id="start-date-patients"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{
                                                width: '100%',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                                backgroundColor: '#f8fafc',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#334155',
                                                cursor: 'pointer',
                                                padding: '0.625rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                minHeight: '44px',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label htmlFor="end-date-patients" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            To Date
                                        </label>
                                        <input
                                            id="end-date-patients"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{
                                                width: '100%',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                                backgroundColor: '#f8fafc',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#334155',
                                                cursor: 'pointer',
                                                padding: '0.625rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                minHeight: '44px',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Users size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
                                    Gender
                                </label>
                                <select
                                    value={selectedGender}
                                    onChange={(e) => setSelectedGender(e.target.value)}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #e2e8f0',
                                        outline: 'none',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        color: '#334155',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.625rem',
                                        borderRadius: '0.5rem'
                                    }}
                                >
                                    <option value="">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="not_specified">Not Specified</option>
                                </select>
                            </div>

                            {/* Age Range Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
                                    Age Range
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={ageMin}
                                        onChange={(e) => setAgeMin(e.target.value)}
                                        min="0"
                                        max="120"
                                        style={{
                                            flex: 1,
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            color: '#334155',
                                            padding: '0.5rem 0.625rem',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={ageMax}
                                        onChange={(e) => setAgeMax(e.target.value)}
                                        min="0"
                                        max="120"
                                        style={{
                                            flex: 1,
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            color: '#334155',
                                            padding: '0.5rem 0.625rem',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || startDate || endDate || selectedGender || ageMin || ageMax) && (
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                    Active:
                                </span>
                                {searchTerm && (
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        backgroundColor: '#f0f9ff',
                                        color: '#0369a1',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        <Search size={12} /> "{searchTerm}"
                                    </span>
                                )}
                                {(startDate || endDate) && (
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        backgroundColor: '#eff6ff',
                                        color: '#1e40af',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        <Calendar size={12} /> {startDate || '...'} to {endDate || '...'}
                                    </span>
                                )}
                                {selectedGender && (
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        backgroundColor: '#f0fdf4',
                                        color: '#15803d',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                    }}>
                                        <User size={12} /> {selectedGender === 'male' ? 'Male' : selectedGender === 'female' ? 'Female' : selectedGender.replace('_', ' ').charAt(0).toUpperCase() + selectedGender.replace('_', ' ').slice(1)}
                                    </span>
                                )}
                                {(ageMin || ageMax) && (
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        backgroundColor: '#fef3c7',
                                        color: '#92400e',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        <Calendar size={12} /> {ageMin || '0'}-{ageMax || '∞'} years
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Patients Table - Mobile Card View + Desktop Table View */}
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Mobile Card View */}
                        <div className="mobile-cards-view" style={{ display: 'block' }}>
                            {filteredPatients.length === 0 ? (
                                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                        {searchTerm
                                            ? `No patients found matching "${searchTerm}"`
                                            : showOnlyWithVisits
                                                ? 'No patients with visits found yet'
                                                : 'No patients yet. Add your first patient!'}
                                    </div>
                                </div>
                            ) : (
                                filteredPatients.map(patient => {
                                    const lastApt = getLastAppointment(patient.id);
                                    return (
                                        <div key={patient.id} style={{
                                            padding: '1.25rem',
                                            borderBottom: '1px solid #e2e8f0',
                                            transition: 'background-color 0.2s'
                                        }} className="hover:bg-slate-50">
                                            {/* Patient Name & ID */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                                                    <User size={24} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>{patient.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {patient.id}</div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                                                    <Phone size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                    <span>{patient.phone}</span>
                                                </div>
                                                {patient.email && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                                                        <Mail size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* DOB & Gender */}
                                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                                                    <Calendar size={16} style={{ color: '#94a3b8' }} />
                                                    <span>{formatDOB(patient.date_of_birth)}</span>
                                                </div>
                                                {patient.gender && (
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        backgroundColor: patient.gender === 'male' ? '#dbeafe' : patient.gender === 'female' ? '#fce7f3' : '#f3f4f6',
                                                        color: patient.gender === 'male' ? '#1e40af' : patient.gender === 'female' ? '#be185d' : '#374151',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        <Users size={12} />
                                                        {formatGender(patient.gender)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Last Appointment Info */}
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                <strong>Last Visit:</strong> {lastApt ? (
                                                    <span style={{ color: '#0f172a', fontWeight: '600' }}>
                                                        {new Date(lastApt.appointment_at).toLocaleDateString()}
                                                        {lastApt.shift && <span style={{ marginLeft: '0.5rem' }}>{lastApt.shift === 'morning' ? '☀️ Morning' : '🌙 Evening'}</span>}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontStyle: 'italic' }}>No visits yet</span>
                                                )}
                                            </div>

                                            {/* Date Added */}
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                Added: {new Date(patient.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="desktop-table-view" style={{ display: 'none' }}>
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
                                            Date of Birth
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                            Gender
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                            Date Added
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                            Last Appointment
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                                {searchTerm
                                                    ? `No patients found matching "${searchTerm}"`
                                                    : showOnlyWithVisits
                                                        ? 'No patients with visits found. Try switching to "All Patients" view.'
                                                        : 'No patients yet. Add your first patient!'}
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
                                                <td style={{ padding: '1rem 1.5rem', color: '#334155', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                                                        {formatDOB(patient.date_of_birth)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                                    {patient.gender ? (
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            backgroundColor: patient.gender === 'male' ? '#dbeafe' : patient.gender === 'female' ? '#fce7f3' : '#f3f4f6',
                                                            color: patient.gender === 'male' ? '#1e40af' : patient.gender === 'female' ? '#be185d' : '#374151',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <Users size={12} />
                                                            {formatGender(patient.gender)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>Not specified</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                    {new Date(patient.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                                    {(() => {
                                                        const lastApt = getLastAppointment(patient.id);
                                                        if (!lastApt) {
                                                            return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No visits yet</span>;
                                                        }
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <Calendar size={14} style={{ color: '#0ea5e9' }} />
                                                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                                                        {new Date(lastApt.appointment_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                {lastApt.shift && (
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                                                        {lastApt.shift === 'morning' ? '☀️' : '🌙'} {lastApt.shift}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {/* Add Patient Modal */}
            {/* Add Patient Modal */}
            {isModalOpen && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
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
                            overflow: 'hidden',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Add New Patient</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Create a new patient record</p>
                        </div>

                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
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

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                                    Date of Birth (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={newPatient.date_of_birth}
                                    onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
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
                                    Gender (Optional)
                                </label>
                                <select
                                    value={newPatient.gender}
                                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
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
                </div>,
                document.body
            )}

            {/* Responsive CSS */}
            <style>{`
                /* Mobile: Show cards, hide table */
                @media (max-width: 639px) {
                    .mobile-cards-view {
                        display: block !important;
                    }
                    .desktop-table-view {
                        display: none !important;
                    }
                    .patients-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .add-patient-btn {
                        width: 100% !important;
                    }
                    .filter-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .filter-header > div {
                        width: 100%;
                    }
                }
                
                /* Tablet and up: Hide cards, show table */
                @media (min-width: 640px) {
                    .mobile-cards-view {
                        display: none !important;
                    }
                    .desktop-table-view {
                        display: block !important;
                    }
                    .patients-header {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: flex-end !important;
                    }
                    .add-patient-btn {
                        width: auto !important;
                    }
                    .filter-header {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManagePatients;
