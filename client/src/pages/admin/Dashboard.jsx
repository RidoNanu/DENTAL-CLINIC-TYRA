import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { KPISkeleton, TableSkeleton } from '../../components/ui/Skeleton';

import { ArrowUp, Users, Calendar, TrendingUp, Activity, CheckCircle, XCircle, Loader, AlertCircle, Clock, Sun, Moon } from 'lucide-react';
import { getDashboardStats } from '../../services/dashboardService';
import { updateAppointment, getAppointmentsByDate, getAppointmentsByDateRange } from '../../services/appointmentService';

const Dashboard = () => {
    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingAppointment, setUpdatingAppointment] = useState(null);
    const [toast, setToast] = useState(null);

    // Modal state
    const [activeModal, setActiveModal] = useState(null); // null | 'today' | 'pending' | 'revenue'
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [allPendingAppointments, setAllPendingAppointments] = useState([]);
    const [revenueBreakdown, setRevenueBreakdown] = useState([]);

    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        // Patient info (for new walk-in patients)
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        // Appointment info
        serviceId: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
    });
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDashboardStats();
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and set up auto-refresh
    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const intervalId = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    // Fetch patients and services when booking modal opens
    useEffect(() => {
        if (activeModal === 'newBooking') {
            const fetchDropdownData = async () => {
                try {
                    const [patientsData, servicesData] = await Promise.all([
                        getPatients({ limit: 1000 }),
                        getServices({ limit: 1000 })
                    ]);
                    setPatients(patientsData);
                    setServices(servicesData);
                } catch (err) {
                    console.error('Error fetching dropdown data:', err);
                }
            };
            fetchDropdownData();
        }
    }, [activeModal]);

    // Fetch time slots when service or date changes
    useEffect(() => {
        if (bookingForm.serviceId && bookingForm.appointmentDate) {
            fetchAvailableTimeSlots(bookingForm.serviceId, bookingForm.appointmentDate);
        } else {
            setAvailableTimeSlots([]);
        }
    }, [bookingForm.serviceId, bookingForm.appointmentDate]);

    // Fetch today's appointments for modal
    const fetchTodayAppointments = async () => {
        try {
            setModalLoading(true);
            setModalError(null);
            setModalLoading(true);
            setModalError(null);
            // Fix: Use IST date explicitly
            const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST
            const appointments = await getAppointmentsByDate(today);
            setTodayAppointments(appointments);
        } catch (err) {
            console.error('Error fetching today\'s appointments:', err);
            setModalError(err.message || 'Failed to load appointments');
        } finally {
            setModalLoading(false);
        }
    };

    // Fetch all pending appointments for modal
    const fetchPendingAppointments = async () => {
        try {
            setModalLoading(true);
            setModalError(null);
            // Fetch appointments from today onwards, filter by pending status
            const today = new Date().toISOString().split('T')[0];
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1); // Next year
            const appointments = await getAppointmentsByDateRange(today, endDate.toISOString().split('T')[0]);
            const pending = appointments.filter(apt => apt.status === 'pending');
            setAllPendingAppointments(pending);
        } catch (err) {
            console.error('Error fetching pending appointments:', err);
            setModalError(err.message || 'Failed to load pending appointments');
        } finally {
            setModalLoading(false);
        }
    };

    // Fetch revenue breakdown for current month
    const fetchRevenueBreakdown = async () => {
        try {
            setModalLoading(true);
            setModalError(null);

            // Get first and last day of current month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const startDate = firstDay.toISOString().split('T')[0];
            const endDate = lastDay.toISOString().split('T')[0];

            const appointments = await getAppointmentsByDateRange(startDate, endDate);

            // Filter only confirmed and completed appointments (ones that generate revenue)
            const revenueAppts = appointments.filter(apt =>
                apt.status === 'confirmed' || apt.status === 'completed'
            );

            setRevenueBreakdown(revenueAppts);
        } catch (err) {
            console.error('Error fetching revenue breakdown:', err);
            setModalError(err.message || 'Failed to load revenue breakdown');
        } finally {
            setModalLoading(false);
        }
    };

    // Fetch available time slots for selected service and date
    const fetchAvailableTimeSlots = async (serviceId, date) => {
        if (!serviceId || !date) {
            setAvailableTimeSlots([]);
            return;
        }

        try {
            setLoadingTimeSlots(true);

            console.log('🔍 Fetching time slots for:', { serviceId, date });

            // Call public availability API
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/public/availability?start=${date}&end=${date}&service_id=${serviceId}`;
            console.log('📡 API URL:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch available time slots');
            }

            const result = await response.json();
            console.log('✅ API Response:', result);

            const dateData = result.data?.[date];
            console.log('📅 Date data for', date, ':', dateData);

            if (dateData) {
                const slots = dateData.available_slots || [];
                console.log('⏰ Available slots:', slots);
                setAvailableTimeSlots(slots);
            } else {
                console.log('❌ No date data found');
                setAvailableTimeSlots([]);
            }
        } catch (err) {
            console.error('💥 Error fetching time slots:', err);
            setAvailableTimeSlots([]);
        } finally {
            setLoadingTimeSlots(false);
        }
    };

    // Handle booking form submission
    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmittingBooking(true);

            // Step 1: Create or find the patient
            const patient = await findOrCreatePatient({
                name: bookingForm.patientName,
                email: bookingForm.patientEmail,
                phone: bookingForm.patientPhone
            });

            // Step 2: Combine date and time for appointment
            const appointmentDateTime = `${bookingForm.appointmentDate}T${bookingForm.appointmentTime}:00`;

            // Step 3: Create the appointment
            await createAppointment({
                patient_id: patient.id,
                service_id: bookingForm.serviceId,
                appointment_at: appointmentDateTime,
                notes: bookingForm.notes || null,
                status: 'confirmed'
            });

            // Show success toast
            setToast({ type: 'success', message: 'Walk-in booking created successfully!' });
            setTimeout(() => setToast(null), 3000);

            // Close modal and reset form
            setActiveModal(null);
            setBookingForm({
                patientName: '',
                patientEmail: '',
                patientPhone: '',
                serviceId: '',
                appointmentDate: '',
                appointmentTime: '',
                notes: ''
            });

            // Refresh dashboard data
            await fetchDashboardData();

        } catch (err) {
            console.error('Error creating booking:', err);
            setToast({ type: 'error', message: err.message || 'Failed to create booking' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    // Handle appointment approval (confirm)
    const handleApprove = async (appointmentId) => {
        try {
            setUpdatingAppointment(appointmentId);
            await updateAppointment(appointmentId, { status: 'confirmed' });
            setToast({ type: 'success', message: 'Appointment confirmed successfully!' });
            setTimeout(() => setToast(null), 3000);
            // Refresh dashboard data
            await fetchDashboardData();
            // Refresh modal data if pending modal is open
            if (activeModal === 'pending') {
                await fetchPendingAppointments();
            }
        } catch (err) {
            console.error('Error approving appointment:', err);
            setToast({ type: 'error', message: err.message || 'Failed to confirm appointment' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUpdatingAppointment(null);
        }
    };

    // Handle appointment rejection (cancel)
    const handleReject = async (appointmentId) => {
        try {
            setUpdatingAppointment(appointmentId);
            await updateAppointment(appointmentId, { status: 'cancelled' });
            setToast({ type: 'success', message: 'Appointment cancelled successfully!' });
            setTimeout(() => setToast(null), 3000);
            // Refresh dashboard data
            await fetchDashboardData();
            // Refresh modal data if pending modal is open
            if (activeModal === 'pending') {
                await fetchPendingAppointments();
            }
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            setToast({ type: 'error', message: err.message || 'Failed to cancel appointment' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUpdatingAppointment(null);
        }
    };

    // Handle appointment completion
    const handleComplete = async (appointmentId) => {
        try {
            setUpdatingAppointment(appointmentId);
            await updateAppointment(appointmentId, { status: 'completed' });
            setToast({ type: 'success', message: 'Appointment completed successfully!' });
            setTimeout(() => setToast(null), 3000);
            // Refresh dashboard data
            await fetchDashboardData();
            // Refresh modal data - re-fetch to keep list up to date
            await fetchTodayAppointments();
        } catch (err) {
            console.error('Error completing appointment:', err);
            setToast({ type: 'error', message: err.message || 'Failed to complete appointment' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUpdatingAppointment(null);
        }
    };

    const styles = {
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
        },
        kpiCard: {
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
        },
        kpiHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
        },
        kpiIcon: (color) => ({
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: color.bg,
            color: color.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }),
        kpiValue: {
            fontSize: '2.25rem',
            fontWeight: '800',
            color: '#0f172a',
            lineHeight: 1,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
        },
        kpiLabel: {
            color: '#64748b',
            fontSize: '0.95rem',
            fontWeight: '500',
        },
        trend: (positive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: positive ? '#16a34a' : '#dc2626',
            backgroundColor: positive ? '#dcfce7' : '#fee2e2',
            padding: '2px 8px',
            borderRadius: '1rem',
            marginTop: '0.5rem',
            width: 'fit-content'
        }),
        sectionHeader: {
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
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
            cursor: 'default'
        }
    };

    // Format stats from API data
    const stats = dashboardData ? [
        {
            label: "Morning Shift",
            value: dashboardData.morningShift.count.toString(),
            trend: dashboardData.morningShift.change,
            positive: true,
            icon: <Sun size={24} />,
            color: { bg: '#fef3c7', text: '#d97706' }
        },
        {
            label: "Evening Shift",
            value: dashboardData.eveningShift.count.toString(),
            trend: dashboardData.eveningShift.change,
            positive: true,
            icon: <Moon size={24} />,
            color: { bg: '#e0e7ff', text: '#4f46e5' }
        },
        {
            label: "Pending Requests",
            value: dashboardData.pendingRequests.count.toString(),
            trend: `+${dashboardData.pendingRequests.newCount} New`,
            positive: false,
            icon: <Activity size={24} />,
            color: { bg: '#fff7ed', text: '#ea580c' }
        },
        {
            label: "Today's Patients",
            value: dashboardData.totalPatients.count.toString(),
            trend: dashboardData.totalPatients.monthlyNew ? `+${dashboardData.totalPatients.monthlyNew}mo` : null,
            positive: true,
            icon: <Users size={24} />,
            color: { bg: '#dcfce7', text: '#16a34a' }
        },
    ] : [];

    // Format pending appointments from API data
    const pendingAppointments = dashboardData ? dashboardData.pendingAppointments.map(apt => {
        const date = new Date(apt.appointment_at);

        // Handle mixed singular/plural aliases from different endpoints
        let patientName = apt.patient?.name || apt.patients?.name || 'Unknown';

        // Check for "Booked as:" override in notes
        if (apt.notes) {
            const bookedAsMatch = apt.notes.match(/Booked as: (.*)/);
            if (bookedAsMatch && bookedAsMatch[1]) {
                patientName = bookedAsMatch[1].trim();
            }
        }

        return {
            id: apt.id,
            patient: patientName,
            treatment: apt.service?.name || apt.services?.name || 'No service',
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            shift: apt.shift ? (apt.shift.charAt(0).toUpperCase() + apt.shift.slice(1) + ' Shift') : ''
        };
    }) : [];

    // Error state
    if (error) {
        return (
            <div className="animate-fade-in">
                <Card style={{ padding: ' 3rem', textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>Failed to Load Dashboard</h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
                    <Button onClick={fetchDashboardData}>Retry</Button>
                </Card>
            </div>
        );
    }

    //Loading state
    if (loading) {
        return (
            <div className="animate-fade-in">
                <div style={styles.sectionHeader}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Dashboard</h1>
                        <p style={{ color: '#64748b' }}>Operations overview and daily metrics</p>
                    </div>
                </div>

                {/* Loading Skeletons for KPI Cards */}
                <div style={styles.grid}>
                    {[1, 2, 3, 4].map(i => (
                        <KPISkeleton key={i} />
                    ))}
                </div>

                {/* Loading Skeleton for Table */}
                <div style={{ marginTop: '2rem' }}>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Pending Approvals</h2>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Patient</th>
                                    <th style={styles.th}>Details</th>
                                    <th style={styles.th}>Schedule</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TableSkeleton rows={3} />
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header" style={styles.sectionHeader}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Operations overview and daily metrics</p>
                </div>
                <div className="dashboard-header-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <Button
                        variant="outline"
                        size="small"
                        fullWidth
                        onClick={async () => {
                            setActiveModal('today');
                            await fetchTodayAppointments();
                        }}
                        style={{ justifyContent: 'center' }}
                    >
                        <Calendar size={16} className="mr-2" /> Today
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        fullWidth
                        onClick={() => window.location.href = '/admin/walk-in-booking'}
                        style={{ justifyContent: 'center' }}
                    >
                        + New Booking
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.grid}>
                {stats.map((stat, index) => {
                    // Determine which modal to open based on card index
                    // Index 0: Morning Shift -> 'today' modal
                    // Index 1: Evening Shift -> 'today' modal (shows schedule)
                    // Index 2: Pending Requests -> 'pending' modal
                    // Index 3: Total Patients -> handled via redirect
                    const modalType = (index === 0 || index === 1) ? 'today' : index === 2 ? 'pending' : null;
                    const isClickable = modalType !== null || index === 3; // Make patients card clickable too

                    const handleCardClick = async () => {
                        if (!isClickable) return;

                        // Set modal type based on the card index
                        // Index 0: Morning Shift
                        // Index 1: Evening Shift
                        // Index 2: Pending Requests
                        // Index 3: Total Patients (All Today)

                        if (index === 0) setActiveModal('morning');
                        else if (index === 1) setActiveModal('evening');
                        else if (index === 2) setActiveModal('pending');
                        else if (index === 3) setActiveModal('all');

                        // Fetch data based on modal type
                        if (index === 0 || index === 1 || index === 3) {
                            await fetchTodayAppointments();
                        } else if (index === 2) {
                            await fetchPendingAppointments();
                        }
                    };

                    return (
                        <Card
                            key={stat.label}
                            style={{
                                ...styles.kpiCard,
                                cursor: isClickable ? 'pointer' : 'default',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            onClick={handleCardClick}
                        >
                            <div style={styles.kpiHeader}>
                                <div style={styles.kpiIcon(stat.color)}>
                                    {stat.icon}
                                </div>
                                <div style={styles.trend(stat.positive)}>
                                    <ArrowUp size={14} style={{ transform: stat.positive ? 'none' : 'rotate(180deg)' }} />
                                    {stat.trend}
                                </div>
                            </div>
                            <div style={styles.kpiValue}>{stat.value}</div>
                            <div style={styles.kpiLabel}>{stat.label}</div>
                        </Card>
                    );
                })}
            </div>

            <div className="dashboard-main-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(1.5rem, 3vw, 2rem)' }}>

                {/* Pending Approvals Table */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: '700', color: '#0f172a' }}>Pending Approvals</h2>
                        <Button variant="ghost" size="small" style={{ color: 'var(--color-primary)', display: 'none' }} className="md:inline-flex">View All</Button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-cards-view" style={{ display: 'block' }}>
                        {pendingAppointments.length > 0 ? pendingAppointments.map(apt => (
                            <div key={apt.id} style={{
                                padding: '1.25rem',
                                borderBottom: '1px solid #e2e8f0',
                                transition: 'background-color 0.2s'
                            }} className="hover:bg-slate-50">
                                {/* Patient Name */}
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                                    {apt.patient}
                                </div>

                                {/* Treatment */}
                                <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                    {apt.treatment}
                                </div>

                                {/* Date and Shift */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: '#f1f5f9',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: '#334155'
                                    }}>
                                        {apt.date}
                                    </span>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: '#e0f2fe',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: '#0369a1'
                                    }}>
                                        {apt.shift}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleApprove(apt.id)}
                                        disabled={updatingAppointment === apt.id}
                                        style={{
                                            flex: 1,
                                            minHeight: '44px',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            backgroundColor: '#0ca5b5',
                                            border: 'none',
                                            cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: updatingAppointment === apt.id ? 0.6 : 1,
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0b8fa0')}
                                        onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0ca5b5')}
                                    >
                                        {updatingAppointment === apt.id ? (
                                            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <CheckCircle size={18} strokeWidth={2} />
                                        )}
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => handleReject(apt.id)}
                                        disabled={updatingAppointment === apt.id}
                                        style={{
                                            flex: 1,
                                            minHeight: '44px',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: updatingAppointment === apt.id ? 0.6 : 1,
                                            color: '#dc2626',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fee2e2')}
                                        onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                                    >
                                        {updatingAppointment === apt.id ? (
                                            <Loader size={18} style={{ animation: 'spin 1s linear infinite', color: '#dc2626' }} />
                                        ) : (
                                            <XCircle size={18} strokeWidth={2} />
                                        )}
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                No pending approvals
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <table className="desktop-table-view" style={{ ...styles.table, display: 'none' }}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Patient</th>
                                <th style={styles.th}>Details</th>
                                <th style={styles.th}>Schedule</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingAppointments.length > 0 ? pendingAppointments.map(apt => (
                                <tr key={apt.id} style={styles.row} className="hover:bg-slate-50">
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patient}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: '500', fontSize: '0.9rem' }}>{apt.treatment}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {apt.date}
                                            </div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#64748b' }}>{apt.shift}</div>
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {/* Approve Button */}
                                            <button
                                                onClick={() => handleApprove(apt.id)}
                                                disabled={updatingAppointment === apt.id}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    padding: '0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#0ca5b5',
                                                    border: 'none',
                                                    cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: updatingAppointment === apt.id ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0b8fa0')}
                                                onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0ca5b5')}
                                                title="Approve appointment"
                                            >
                                                {updatingAppointment === apt.id ? (
                                                    <Loader size={18} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <CheckCircle size={18} color="white" strokeWidth={2} />
                                                )}
                                            </button>

                                            {/* Reject Button */}
                                            <button
                                                onClick={() => handleReject(apt.id)}
                                                disabled={updatingAppointment === apt.id}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    padding: '0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#fef2f2',
                                                    border: '1px solid #fecaca',
                                                    cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: updatingAppointment === apt.id ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fee2e2')}
                                                onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                                                title="Reject appointment"
                                            >
                                                {updatingAppointment === apt.id ? (
                                                    <Loader size={18} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <XCircle size={18} color="#ef4444" strokeWidth={2} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                        No pending approvals
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Quick Actions Column */}
                <div className="flex" style={{ flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#0f172a' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Button
                                variant="outline"
                                fullWidth
                                style={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: '600', height: '3rem' }}
                                onClick={() => window.location.href = '/admin/patients'}
                            >
                                <Users size={18} className="mr-2 text-slate-400" /> New Patient
                            </Button>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card style={{ backgroundColor: '#0f172a', color: 'white', border: 'none' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>System Health</h3>
                            <Activity size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Database</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">API Gateway</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Operational
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                    .dashboard-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .dashboard-header-buttons {
                        width: 100% !important;
                    }
                }
                
                /* Tablet and up: Hide cards, show table */
                @media (min-width: 640px) {
                    .mobile-cards-view {
                        display: none !important;
                    }
                    .desktop-table-view {
                        display: table !important;
                    }
                    .dashboard-header {
                        flex-direction: row !important;
                        align-items: flex-end !important;
                    }
                    .dashboard-header-buttons {
                        flex-direction: row !important;
                        width: auto !important;
                    }
                    .dashboard-main-layout {
                        grid-template-columns: 2fr 1fr !important;
                    }
                }
                
                /* Medium screens: stack dashboard layout */
                @media (max-width: 1023px) {
                    .dashboard-main-layout {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {/* Today's Appointments Modal (Shared for Morning/Evening/All) */}
            <Modal
                isOpen={['morning', 'evening', 'all', 'today'].includes(activeModal)}
                onClose={() => setActiveModal(null)}
                title={
                    activeModal === 'morning' ? "Morning Shift Patients" :
                        activeModal === 'evening' ? "Evening Shift Patients" :
                            "Total Patients (Today)"
                }
                maxWidth="800px"
            >
                {modalLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <Loader size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading appointments...</p>
                    </div>
                ) : modalError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#dc2626', fontWeight: '600' }}>{modalError}</p>
                    </div>
                ) : todayAppointments.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Calendar size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#64748b', fontSize: '1.rem' }}>No appointments scheduled for today</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Function to render a list of appointments */}
                        {(() => {
                            const renderList = (appointments, showCompleteButton = false) => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {appointments.length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No patients in this shift</p>
                                    ) : (
                                        appointments
                                            .sort((a, b) => (a.token_number || 999) - (b.token_number || 999)) // Sort by token
                                            .map(apt => {
                                                const time = new Date(apt.appointment_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                const statusColors = {
                                                    pending: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
                                                    confirmed: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
                                                    completed: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                                                    cancelled: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
                                                };
                                                const color = statusColors[apt.status] || statusColors.pending;

                                                return (
                                                    <div key={apt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl transition-all hover:shadow-sm gap-4">
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#64748b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                {apt.token_number || '-'}
                                                            </div>
                                                            <div>
                                                                <h4 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.1rem' }}>
                                                                    {(() => {
                                                                        let displayName = apt.patients?.name || 'Unknown Patient';
                                                                        if (apt.notes) {
                                                                            const match = apt.notes.match(/Booked as: (.*)/);
                                                                            if (match && match[1]) displayName = match[1].trim();
                                                                        }
                                                                        return displayName;
                                                                    })()}
                                                                </h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                                    <span>{apt.services?.name || 'No Service'}</span>
                                                                    <span style={{
                                                                        padding: '1px 6px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.75rem',
                                                                        backgroundColor: color.bg,
                                                                        color: color.text,
                                                                        border: `1px solid ${color.border}`
                                                                    }}>
                                                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Complete Button */}
                                                        {showCompleteButton && apt.status === 'confirmed' && (
                                                            <Button
                                                                size="small"
                                                                style={{
                                                                    backgroundColor: '#16a34a',
                                                                    color: 'white',
                                                                    borderColor: '#16a34a',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem'
                                                                }}
                                                                className="w-full sm:w-auto"
                                                                disabled={updatingAppointment === apt.id}
                                                                onClick={() => handleComplete(apt.id)}
                                                            >
                                                                {updatingAppointment === apt.id ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            );

                            // Filter appointments based on shift
                            const morningAppointments = todayAppointments.filter(apt => apt.shift === 'morning');
                            const eveningAppointments = todayAppointments.filter(apt => apt.shift === 'evening');

                            if (activeModal === 'morning') {
                                return renderList(morningAppointments, true);
                            } else if (activeModal === 'evening') {
                                return renderList(eveningAppointments, true);
                            } else {
                                // Total Patients View
                                return (
                                    <>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Sun size={20} className="text-amber-500" /> Morning Shift
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>({morningAppointments.length})</span>
                                            </h3>
                                            {renderList(morningAppointments, false)}
                                        </div>
                                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Moon size={20} className="text-indigo-500" /> Evening Shift
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>({eveningAppointments.length})</span>
                                            </h3>
                                            {renderList(eveningAppointments, false)}
                                        </div>
                                        <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                            Total Today: {todayAppointments.length}
                                        </div>
                                    </>
                                );
                            }
                        })()}
                    </div>
                )}
            </Modal>


            {/* Pending Requests Modal */}
            < Modal
                isOpen={activeModal === 'pending'}
                onClose={() => setActiveModal(null)}
                title="Pending Approval Requests"
                maxWidth="800px"
            >
                {
                    modalLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }} >
                            <Loader size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading pending requests...</p>
                        </div >
                    ) : modalError ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#dc2626', fontWeight: '600' }}>{modalError}</p>
                        </div>
                    ) : allPendingAppointments.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No pending requests</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>All appointments have been reviewed</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {allPendingAppointments.map(apt => {
                                const dateTime = new Date(apt.appointment_at);
                                const date = dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                                return (
                                    <div
                                        key={apt.id}
                                        style={{
                                            padding: '1rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                                                {(() => {
                                                    let displayName = apt.patients?.name || 'Unknown Patient';
                                                    if (apt.notes) {
                                                        const match = apt.notes.match(/Booked as: (.*)/);
                                                        if (match && match[1]) displayName = match[1].trim();
                                                    }
                                                    return displayName;
                                                })()}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                                <span>
                                                    <strong>Service:</strong> {apt.services?.name || 'N/A'}
                                                </span>
                                                <span>
                                                    <strong>Date:</strong> {date} {apt.shift ? `(${apt.shift.charAt(0).toUpperCase() + apt.shift.slice(1)} Shift)` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleApprove(apt.id)}
                                                disabled={updatingAppointment === apt.id}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: '0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#0ca5b5',
                                                    border: 'none',
                                                    cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: updatingAppointment === apt.id ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0b8fa0')}
                                                onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#0ca5b5')}
                                                title="Approve appointment"
                                            >
                                                {updatingAppointment === apt.id ? (
                                                    <Loader size={18} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <CheckCircle size={20} color="white" strokeWidth={2} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleReject(apt.id)}
                                                disabled={updatingAppointment === apt.id}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: '0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#fef2f2',
                                                    border: '1px solid #fecaca',
                                                    cursor: updatingAppointment === apt.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: updatingAppointment === apt.id ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fee2e2')}
                                                onMouseLeave={(e) => !updatingAppointment && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                                                title="Reject appointment"
                                            >
                                                {updatingAppointment === apt.id ? (
                                                    <Loader size={18} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <XCircle size={20} color="#ef4444" strokeWidth={2} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </Modal >

            {/* Revenue Breakdown Modal */}
            < Modal
                isOpen={activeModal === 'revenue'}
                onClose={() => setActiveModal(null)}
                title={`Revenue Breakdown - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                maxWidth="700px"
            >
                {
                    modalLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }} >
                            <Loader size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading revenue data...</p>
                        </div >
                    ) : modalError ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#dc2626', fontWeight: '600' }}>{modalError}</p>
                        </div>
                    ) : revenueBreakdown.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <TrendingUp size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No revenue this month</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>No confirmed or completed appointments yet</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {revenueBreakdown.map(apt => {
                                    const date = new Date(apt.appointment_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const price = apt.services?.price || 0;

                                    return (
                                        <div
                                            key={apt.id}
                                            style={{
                                                padding: '1rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                                                    {apt.patients?.name || 'Unknown Patient'}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                                                    <span style={{ color: 'var(--color-primary)' }}>{apt.services?.name || 'No service'}</span>
                                                    <span>•</span>
                                                    <span>{date}</span>
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '1.125rem',
                                                fontWeight: '700',
                                                color: '#16a34a',
                                                minWidth: '80px',
                                                textAlign: 'right'
                                            }}>
                                                ₹{price.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total Revenue */}
                            <div style={{
                                padding: '1.25rem',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '0.75rem',
                                border: '2px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
                                        TOTAL REVENUE
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {revenueBreakdown.length} appointment{revenueBreakdown.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '800',
                                    color: '#16a34a',
                                    letterSpacing: '-0.02em'
                                }}>
                                    ₹{revenueBreakdown.reduce((sum, apt) => sum + (apt.services?.price || 0), 0).toLocaleString()}
                                </div>
                            </div>
                        </>
                    )}
            </Modal >
        </div >
    );
};

export default Dashboard;
