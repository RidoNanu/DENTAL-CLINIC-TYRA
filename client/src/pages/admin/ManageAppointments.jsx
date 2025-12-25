import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Search, Filter, Edit3, Trash2, Calendar, CalendarX, User, FileText, X, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../../services/appointmentService';
import { getClinicSchedule } from '../../services/settingsService';

const ManageAppointments = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // API state management
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Expandable rows state
    const [expandedRow, setExpandedRow] = useState(null);

    // Status update state
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [toast, setToast] = useState(null);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, appointmentId: null, appointmentInfo: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Clinic schedule settings
    const [clinicSchedule, setClinicSchedule] = useState(null);

    // Fetch appointments and clinic schedule on mount
    useEffect(() => {
        fetchAppointments();
        fetchClinicSchedule();
    }, []);

    const fetchClinicSchedule = async () => {
        try {
            const data = await getClinicSchedule();
            setClinicSchedule(data);
        } catch (err) {
            console.error('Error fetching clinic schedule:', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAppointments();
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    // Utility: Check if appointment is in the past
    const isPastAppointment = (appointmentDate) => {
        if (!appointmentDate) return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const aptDate = new Date(appointmentDate);
        aptDate.setHours(0, 0, 0, 0);

        return aptDate < now;
    };

    // Get available status transitions based on current status
    const getAvailableStatuses = (currentStatus) => {
        const statusMap = {
            'pending': ['pending', 'confirmed', 'cancelled'],
            'confirmed': ['confirmed', 'completed', 'cancelled'],
            'completed': ['completed'], // No transitions from completed
            'cancelled': ['cancelled']  // No transitions from cancelled
        };
        return statusMap[currentStatus] || ['pending', 'confirmed', 'completed', 'cancelled'];
    };

    // Handle status update with confirmation for cancellations
    const handleStatusChange = (appointmentId, newStatus, appointmentInfo) => {
        // If changing to cancelled, show confirmation modal
        if (newStatus === 'cancelled') {
            setConfirmDialog({
                isOpen: true,
                appointmentId,
                appointmentInfo,
                action: 'cancel'
            });
        } else {
            // For other status changes, update immediately
            handleStatusUpdate(appointmentId, newStatus);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

            await updateAppointment(appointmentId, { status: newStatus });

            // Show success toast
            const statusLabels = {
                'pending': 'Pending',
                'confirmed': 'Confirmed',
                'completed': 'Completed',
                'cancelled': 'Cancelled'
            };
            setToast({ type: 'success', message: `Appointment status changed to ${statusLabels[newStatus]}` });
            setTimeout(() => setToast(null), 3000);

            // Refresh appointments list
            await fetchAppointments();
        } catch (err) {
            console.error('Error updating status:', err);
            setToast({ type: 'error', message: 'Failed to update status' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
        }
    };

    // Confirm and execute cancellation
    const confirmCancelAppointment = async () => {
        const { appointmentId } = confirmDialog;

        try {
            setIsDeleting(true);

            // Update status to cancelled instead of deleting
            await updateAppointment(appointmentId, { status: 'cancelled' });

            // Show success toast
            setToast({ type: 'success', message: 'Appointment cancelled successfully' });
            setTimeout(() => setToast(null), 3000);

            // Close dialog
            setConfirmDialog({ isOpen: false, appointmentId: null, appointmentInfo: null, action: null });

            // Refresh appointments list
            await fetchAppointments();
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            setToast({ type: 'error', message: 'Failed to cancel appointment' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsDeleting(false);
        }
    };

    // Toggle row expansion
    const toggleRowExpansion = (appointmentId) => {
        setExpandedRow(expandedRow === appointmentId ? null : appointmentId);
    };

    // Handle cancel appointment (shows confirmation dialog)
    const handleCancelAppointment = (appointmentId, appointmentInfo) => {
        setConfirmDialog({
            isOpen: true,
            appointmentId,
            appointmentInfo,
            action: 'cancel'
        });
    };

    // Export to CSV
    const exportToCSV = () => {
        if (filteredAppointments.length === 0) {
            setToast({ type: 'error', message: 'No appointments to export' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const headers = ["Patient Name", "Service", "Date", "Shift", "Status", "Token No."];
        const csvContent = [
            headers.join(","),
            ...filteredAppointments.map(apt => [
                `"${apt.patients?.name || 'Unknown'}"`,
                `"${apt.services?.name || 'No service'}"`,
                `"${apt.appointment_at ? new Date(apt.appointment_at).toLocaleDateString() : 'N/A'}"`,
                `"${apt.shift ? apt.shift.charAt(0).toUpperCase() + apt.shift.slice(1) : '-'}"`,
                `"${apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}"`,
                `"${apt.token_number || '-'}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setToast({ type: 'success', message: `Exported ${filteredAppointments.length} appointments to CSV` });
        setTimeout(() => setToast(null), 3000);
    };

    // Export to PDF
    const exportToPDF = () => {
        if (filteredAppointments.length === 0) {
            setToast({ type: 'error', message: 'No appointments to export' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("Appointment Records Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

        // Table Config
        const tableColumn = ["Patient Name", "Service", "Date", "Shift", "Status", "Token No."];
        const tableRows = filteredAppointments.map(apt => [
            apt.patients?.name || 'Unknown',
            apt.services?.name || 'No service',
            apt.appointment_at ? new Date(apt.appointment_at).toLocaleDateString() : 'N/A',
            apt.shift ? apt.shift.charAt(0).toUpperCase() + apt.shift.slice(1) : '-',
            apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending',
            apt.token_number || '-'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [15, 23, 42] } // Match slate-900
        });

        doc.save(`appointments_report_${new Date().toISOString().split('T')[0]}.pdf`);

        setToast({ type: 'success', message: `Exported ${filteredAppointments.length} appointments to PDF` });
        setTimeout(() => setToast(null), 3000);
    };


    const styles = {
        header: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem',
        },
        title: {
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.025em',
        },
        filters: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
        },
        th: {
            textAlign: 'left',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: '#f8fafc',
        },
        td: {
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            color: '#334155',
            fontWeight: '500',
            fontSize: '0.95rem',
            verticalAlign: 'middle'
        },
        row: {
            transition: 'background-color 0.2s',
        },
        badge: (status) => {
            const colors = {
                pending: { bg: '#fff7ed', text: '#ea580c' },
                confirmed: { bg: '#dcfce7', text: '#16a34a' },
                completed: { bg: '#eff6ff', text: '#2563eb' },
                cancelled: { bg: '#fef2f2', text: '#dc2626' },
            };
            const normalizedStatus = status?.toLowerCase() || 'pending';
            const style = colors[normalizedStatus] || colors.pending;
            return {
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: style.bg,
                color: style.text,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
            };
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = (apt.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.patients?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = (statusFilter.toLowerCase() === 'all' || apt.status?.toLowerCase() === statusFilter.toLowerCase());

        // Date filtering
        let matchesDate = true;
        if (startDate || endDate) {
            const aptDate = apt.appointment_at ? new Date(apt.appointment_at) : null;
            if (aptDate) {
                if (startDate) {
                    const filterStart = new Date(startDate);
                    filterStart.setHours(0, 0, 0, 0);
                    if (aptDate < filterStart) matchesDate = false;
                }
                if (endDate) {
                    const filterEnd = new Date(endDate);
                    filterEnd.setHours(23, 59, 59, 999);
                    if (aptDate > filterEnd) matchesDate = false;
                }
            } else {
                matchesDate = false; // Filter out appointments without dates when date filter is active
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="animate-fade-in">
            <div className="appointments-header" style={styles.header}>
                <div>
                    <h1 style={styles.title}>Appointments</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Manage bookings and schedules</p>
                </div>
                <Button
                    variant="primary"
                    fullWidth
                    className="new-booking-btn"
                    style={{ boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
                    onClick={() => navigate('/admin/walk-in-booking')}
                >
                    + New Booking
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                    <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>Error loading appointments</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
                    <Button onClick={fetchAppointments} size="small">Try Again</Button>
                </Card>
            )}

            {/* Loading State */}
            {loading ? (
                <Card style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Reference</th>
                                    <th style={styles.th}>Patient</th>
                                    <th style={styles.th}>Schedule</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} style={{ ...styles.row, backgroundColor: 'white' }}>
                                        <td style={styles.td}>
                                            <div style={{ height: '14px', width: '80px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ height: '16px', width: '120px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                    <div style={{ height: '12px', width: '90px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ height: '16px', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                            <div style={{ height: '14px', width: '110px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ height: '24px', width: '80px', backgroundColor: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <div style={{ height: '32px', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                <div style={{ height: '32px', width: '32px', backgroundColor: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                <div style={{ height: '32px', width: '32px', backgroundColor: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.5; }
                        }
                    `}</style>
                </Card>
            ) : (
                <>
                    {/* Filters Toolbar */}
                    <div className="appointments-toolbar" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: 'clamp(0.75rem, 2vw, 1.25rem)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
                        border: '1px solid #e2e8f0',
                        marginBottom: '2rem'
                    }}>
                        {/* Search Section */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Search size={20} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    fontWeight: '500',
                                    backgroundColor: 'transparent'
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 1.5rem' }}></div>

                        {/* Export Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={exportToCSV}
                                disabled={filteredAppointments.length === 0}
                                title={filteredAppointments.length === 0 ? "No records available to export" : "Export to CSV"}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.875rem',
                                    backgroundColor: filteredAppointments.length === 0 ? '#f8fafc' : 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    color: filteredAppointments.length === 0 ? '#cbd5e1' : '#0f172a',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: filteredAppointments.length === 0 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: filteredAppointments.length === 0 ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (filteredAppointments.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (filteredAppointments.length > 0) {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }
                                }}
                            >
                                <Download size={14} color={filteredAppointments.length === 0 ? "#cbd5e1" : "#64748b"} />
                                <span>CSV</span>
                            </button>
                            <button
                                onClick={exportToPDF}
                                disabled={filteredAppointments.length === 0}
                                title={filteredAppointments.length === 0 ? "No records available to export" : "Export to PDF"}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.875rem',
                                    backgroundColor: filteredAppointments.length === 0 ? '#f8fafc' : 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    color: filteredAppointments.length === 0 ? '#cbd5e1' : '#0f172a',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: filteredAppointments.length === 0 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: filteredAppointments.length === 0 ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (filteredAppointments.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (filteredAppointments.length > 0) {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }
                                }}
                            >
                                <FileText size={14} color={filteredAppointments.length === 0 ? "#cbd5e1" : "#ef4444"} />
                                <span>PDF</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 1.5rem' }}></div>

                        {/* Filter Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                                <Filter size={16} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter:</span>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    paddingRight: '1rem'
                                }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Date Range Filters - Standalone Section */}
                        <div className="date-range-wrapper" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#64748b' }}>
                                <Calendar size={16} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 140px', minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="start-date" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        From Date
                                    </label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            color: '#334155',
                                            cursor: 'pointer',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            minHeight: '44px',
                                            width: '100%',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 140px', minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="end-date" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        To Date
                                    </label>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            color: '#334155',
                                            cursor: 'pointer',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            minHeight: '44px',
                                            width: '100%',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <div style={{ flex: '0 0 auto', minWidth: 'fit-content', display: 'flex', alignItems: 'flex-end' }}>
                                        <button
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                            }}
                                            style={{
                                                border: 'none',
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626',
                                                padding: '0.625rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                minHeight: '44px',
                                                transition: 'background-color 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            title="Clear date filter"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                        >
                                            <X size={16} /> Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Appointments List - Mobile Card View + Desktop Table View */}
                    <Card style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        {/* Toast Notification */}
                        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                        {/* Mobile Card View */}
                        <div className="mobile-cards-view" style={{ display: 'block' }}>
                            {filteredAppointments.length === 0 ? (
                                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <CalendarX size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                        {searchTerm || statusFilter !== 'All' || startDate || endDate
                                            ? 'No appointments found matching your filters'
                                            : 'No appointments yet. They will appear here when patients book.'}
                                    </div>
                                </div>
                            ) : (
                                filteredAppointments.map(apt => {
                                    const isPast = isPastAppointment(apt.appointment_at);
                                    return (
                                        <div key={apt.id} style={{
                                            padding: '1.25rem',
                                            borderBottom: '1px solid #e2e8f0',
                                            opacity: (isPast || apt.status === 'cancelled') ? 0.6 : 1,
                                            backgroundColor: expandedRow === apt.id ? '#f8fafc' : 'white'
                                        }}>
                                            {/* Reference */}
                                            <div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                                #{String(apt.id).substring(0, 8)}
                                            </div>

                                            {/* Patient */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1rem', fontWeight: '600', flexShrink: 0 }}>
                                                    {apt.patients?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                                                        {apt.patients?.name || 'Unknown Patient'}
                                                        {isPast && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>(Past)</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{apt.services?.name || 'No service'}</div>
                                                </div>
                                            </div>

                                            {/* Schedule */}
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                                                    {apt.appointment_at ? new Date(apt.appointment_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                                {apt.shift && (
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
                                                        {apt.shift === 'morning' ? '☀️' : '🌙'} {apt.shift} Shift
                                                    </div>
                                                )}
                                                {apt.token_number && (
                                                    <div style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 'bold', backgroundColor: '#f5f3ff', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem' }}>
                                                        Token #{apt.token_number}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div style={{ marginBottom: '1rem' }}>
                                                <span style={styles.badge(apt.status)}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                                                    {(apt.status || 'pending').charAt(0).toUpperCase() + (apt.status || 'pending').slice(1)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                                                <select
                                                    value={apt.status || 'pending'}
                                                    onChange={(e) => handleStatusChange(apt.id, e.target.value, {
                                                        patientName: apt.patients?.name,
                                                        serviceName: apt.services?.name,
                                                        date: apt.appointment_at
                                                    })}
                                                    disabled={updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled'}
                                                    style={{
                                                        minHeight: '44px',
                                                        padding: '0.75rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid #e2e8f0',
                                                        backgroundColor: (updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled') ? '#f1f5f9' : 'white',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        color: (isPast || apt.status === 'completed' || apt.status === 'cancelled') ? '#94a3b8' : '#334155',
                                                        cursor: (updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {getAvailableStatuses(apt.status || 'pending').map(status => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button
                                                        onClick={() => !(isPast || apt.status === 'cancelled') && handleCancelAppointment(apt.id, {
                                                            patientName: apt.patients?.name,
                                                            serviceName: apt.services?.name,
                                                            date: apt.appointment_at
                                                        })}
                                                        disabled={isPast || apt.status === 'cancelled'}
                                                        style={{
                                                            flex: 1,
                                                            minHeight: '44px',
                                                            padding: '0.75rem',
                                                            borderRadius: '0.5rem',
                                                            backgroundColor: (isPast || apt.status === 'cancelled') ? '#f8fafc' : '#fef2f2',
                                                            border: '1px solid #fecaca',
                                                            color: (isPast || apt.status === 'cancelled') ? '#cbd5e1' : '#dc2626',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            cursor: (isPast || apt.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <Trash2 size={16} /> Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRowExpansion(apt.id)}
                                                        style={{
                                                            minHeight: '44px',
                                                            minWidth: '44px',
                                                            padding: '0.75rem',
                                                            borderRadius: '0.5rem',
                                                            backgroundColor: expandedRow === apt.id ? '#e0f2fe' : '#f8fafc',
                                                            border: '1px solid #cbd5e1',
                                                            color: '#334155',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {expandedRow === apt.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedRow === apt.id && (
                                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
                                                        <div><strong>Email:</strong> {apt.patients?.email || 'N/A'}</div>
                                                        <div><strong>Phone:</strong> {apt.patients?.phone || 'N/A'}</div>
                                                        {apt.notes && <div style={{ marginTop: '0.5rem' }}><strong>Notes:</strong> {apt.notes}</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="desktop-table-view" style={{ overflowX: 'auto', display: 'none' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Reference</th>
                                        <th style={styles.th}>Patient</th>
                                        <th style={styles.th}>Schedule</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <TableSkeleton rows={5} columns={5} />
                                    ) : filteredAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                    <CalendarX size={48} style={{ color: '#cbd5e1' }} />
                                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                        {searchTerm || statusFilter !== 'All' || startDate || endDate
                                                            ? 'No appointments found matching your filters'
                                                            : 'No appointments yet. They will appear here when patients book.'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAppointments.map(apt => {
                                            const isPast = isPastAppointment(apt.appointment_at);
                                            return (
                                                <React.Fragment key={apt.id}>
                                                    <tr style={{
                                                        ...styles.row,
                                                        backgroundColor: expandedRow === apt.id ? '#f8fafc' : 'white',
                                                        opacity: (isPast || apt.status === 'cancelled') ? 0.6 : 1
                                                    }} className="hover:bg-slate-50">
                                                        <td style={{ ...styles.td, fontFamily: 'monospace', color: '#64748b' }}>
                                                            #{String(apt.id).substring(0, 8)}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                                                    {apt.patients?.name?.charAt(0) || 'P'}
                                                                </div>
                                                                <div>
                                                                    <div style={{
                                                                        fontWeight: '600',
                                                                        color: '#0f172a'
                                                                    }}>
                                                                        {apt.patients?.name || 'Unknown Patient'}
                                                                        {isPast && (
                                                                            <span style={{
                                                                                marginLeft: '0.5rem',
                                                                                fontSize: '0.7rem',
                                                                                color: '#64748b',
                                                                                fontWeight: '500'
                                                                            }}>(Past)</span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{apt.services?.name || 'No service'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span style={{ fontWeight: '600', color: '#334155' }}>
                                                                    {apt.appointment_at ? new Date(apt.appointment_at).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                                {apt.shift && (
                                                                    <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        {apt.shift === 'morning' ? '☀️' : '🌙'} {apt.shift} Shift
                                                                    </span>
                                                                )}
                                                                {apt.token_number && (
                                                                    <span style={{ fontSize: '0.9rem', color: '#7c3aed', fontWeight: 'bold', backgroundColor: '#f5f3ff', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', marginTop: '2px' }}>
                                                                        Token #{apt.token_number}
                                                                    </span>
                                                                )}
                                                                {!apt.shift && apt.appointment_at && (
                                                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                                        {new Date(apt.appointment_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <span style={styles.badge(apt.status)}>
                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                                                                    {(apt.status || 'pending').charAt(0).toUpperCase() + (apt.status || 'pending').slice(1)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                {/* Status Update Dropdown with Smart Transitions */}
                                                                <select
                                                                    value={apt.status || 'pending'}
                                                                    onChange={(e) => handleStatusChange(apt.id, e.target.value, {
                                                                        patientName: apt.patients?.name,
                                                                        serviceName: apt.services?.name,
                                                                        date: apt.appointment_at
                                                                    })}
                                                                    disabled={updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled'}
                                                                    title={
                                                                        isPast ? 'Cannot edit past appointments' :
                                                                            apt.status === 'completed' ? 'Cannot change completed appointments' :
                                                                                apt.status === 'cancelled' ? 'Cannot change cancelled appointments' :
                                                                                    'Change appointment status'
                                                                    }
                                                                    style={{
                                                                        padding: '0.4rem 0.75rem',
                                                                        borderRadius: '0.5rem',
                                                                        border: '1px solid #e2e8f0',
                                                                        backgroundColor: (updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled') ? '#f1f5f9' : 'white',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '600',
                                                                        color: (isPast || apt.status === 'completed' || apt.status === 'cancelled') ? '#94a3b8' : '#334155',
                                                                        cursor: (updatingStatus[apt.id] || isPast || apt.status === 'completed' || apt.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                                                        outline: 'none'
                                                                    }}
                                                                >
                                                                    {getAvailableStatuses(apt.status || 'pending').map(status => (
                                                                        <option key={status} value={status}>
                                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* Cancel Button - Disabled for past/cancelled appointments */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="small"
                                                                    style={{
                                                                        padding: '0.5rem',
                                                                        color: (isPast || apt.status === 'cancelled') ? '#cbd5e1' : '#ef4444',
                                                                        backgroundColor: (isPast || apt.status === 'cancelled') ? 'transparent' : '#fef2f2',
                                                                        cursor: (isPast || apt.status === 'cancelled') ? 'not-allowed' : 'pointer'
                                                                    }}
                                                                    onClick={() => !(isPast || apt.status === 'cancelled') && handleCancelAppointment(apt.id, {
                                                                        patientName: apt.patients?.name,
                                                                        serviceName: apt.services?.name,
                                                                        date: apt.appointment_at
                                                                    })}
                                                                    disabled={isPast || apt.status === 'cancelled'}
                                                                    title={isPast ? 'Cannot cancel past appointments' : apt.status === 'cancelled' ? 'Already cancelled' : 'Cancel appointment'}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>

                                                                {/* Expand/Collapse Button */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="small"
                                                                    style={{ padding: '0.5rem', color: '#64748b' }}
                                                                    onClick={() => toggleRowExpansion(apt.id)}
                                                                >
                                                                    {expandedRow === apt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row - Patient Notes */}
                                                    {expandedRow === apt.id && (
                                                        <tr style={{ backgroundColor: '#f8fafc' }}>
                                                            <td colSpan="5" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                                    <FileText size={20} style={{ color: '#64748b', marginTop: '0.25rem' }} />
                                                                    <div style={{ flex: 1 }}>
                                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                                                                            Patient Medical Notes
                                                                        </h4>
                                                                        <div style={{
                                                                            backgroundColor: 'white',
                                                                            padding: '1rem',
                                                                            borderRadius: '0.5rem',
                                                                            border: '1px solid #e2e8f0',
                                                                            fontSize: '0.9rem',
                                                                            color: '#334155',
                                                                            lineHeight: '1.6'
                                                                        }}>
                                                                            {apt.patients?.notes ? (
                                                                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{apt.patients.notes}</p>
                                                                            ) : (
                                                                                <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>
                                                                                    No medical notes available for this patient.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {apt.patients?.email && (
                                                                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                                                <strong>Contact:</strong> {apt.patients.email} | {apt.patients.phone}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        }))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}



            {/* Confirmation Dialog for Cancellation */}
            {confirmDialog.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={() => !isDeleting && setConfirmDialog({ isOpen: false, appointmentId: null, appointmentInfo: null })}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                            width: '100%',
                            maxWidth: '500px',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Dialog Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: '#fef2f2'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AlertTriangle size={24} style={{ color: '#dc2626' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                        Cancel Appointment?
                                    </h2>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dialog Body */}
                        <div style={{ padding: '2rem' }}>
                            <p style={{ color: '#334155', marginBottom: '1rem', lineHeight: '1.6' }}>
                                Are you sure you want to cancel this appointment? This will permanently delete the appointment.
                            </p>

                            {confirmDialog.appointmentInfo && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Appointment Details
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.8' }}>
                                        <div><strong>Patient:</strong> {confirmDialog.appointmentInfo.patientName || 'Unknown'}</div>
                                        <div><strong>Service:</strong> {confirmDialog.appointmentInfo.serviceName || 'N/A'}</div>
                                        <div><strong>Date:</strong> {confirmDialog.appointmentInfo.date ? new Date(confirmDialog.appointmentInfo.date).toLocaleString() : 'N/A'}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dialog Footer */}
                        <div style={{
                            padding: '1.5rem',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                            backgroundColor: '#f8fafc'
                        }}>
                            <Button
                                variant="ghost"
                                onClick={() => setConfirmDialog({ isOpen: false, appointmentId: null, appointmentInfo: null })}
                                disabled={isDeleting}
                            >
                                Keep Appointment
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmCancelAppointment}
                                isLoading={isDeleting}
                                style={{
                                    backgroundColor: '#dc2626',
                                    borderColor: '#dc2626'
                                }}
                            >
                                {isDeleting ? 'Cancelling...' : 'Yes, Cancel Appointment'}
                            </Button>
                        </div>
                    </div>
                </div>
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
                    .appointments-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1rem !important;
                    }
                    .new-booking-btn {
                        width: 100%;
                    }
                    /* Toolbar stays in column mode - keep default */
                    .appointments-toolbar {
                        padding: 1rem !important;
                        gap: 1rem !important;
                    }
                    /* Hide horizontal dividers on mobile */
                    .appointments-toolbar > div[style*="width: '1px'"] {
                        display: none !important;
                    }
                    .date-filter-divider {
                        display: none !important;
                    }
                    /* Ensure all inputs and sections stack */
                    .date-range-wrapper > div:last-child {
                        flex-direction: column !important;
                        gap: 0.75rem !important;
                    }
                    .date-range-wrapper > div:last-child > div {
                        width: 100% !important;
                        flex: 1 1 auto !important;
                        min-width: 0 !important;
                    }
                    /* Force date inputs to full width on mobile */
                    .date-range-wrapper input[type="date"] {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
                
                /* Small mobile specific fixes (360px - 414px) */
                @media (max-width: 414px) {
                    .appointments-toolbar {
                        padding: 0.875rem !important;
                    }
                    /* Export buttons stack on very small screens */
                    .appointments-toolbar > div:nth-child(2) {
                        flex-direction: column !important;
                        gap: 0.75rem !important;
                    }
                    .appointments-toolbar button {
                        width: 100% !important;
                        justify-content: center !important;
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
                    .appointments-header {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: flex-end !important;
                    }
                    .new-booking-btn {
                        width: auto;
                    }
                    /* On desktop, keep toolbar in column so sections stack logically */
                    .date-filter-divider {
                        display: none !important;
                    }
                    .date-range-wrapper {
                        width: 100% !important;
                    }
                    /* Date inputs side by side on tablet+ */
                    .date-range-wrapper > div:last-child {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        gap: 0.75rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManageAppointments;
