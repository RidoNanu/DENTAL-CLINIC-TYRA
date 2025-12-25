import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Sparkles, Activity, Smile, ArrowLeft, Check, User, Mail, Phone, Calendar, Clock, CheckCircle, AlertCircle, Loader, CheckCircle2, CalendarX, Sun, Moon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getPublicServices, getPublicClinicSettings } from '../../services/serviceService';
import { getAdminScheduleExceptions } from '../../services/scheduleExceptionService';
import { createPatient } from '../../services/patientService';
import { createAppointment } from '../../services/appointmentService';

const WalkInBooking = ({ isModal = false, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false); // Request loading
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [createdToken, setCreatedToken] = useState(null);

    // Selection State
    const [selections, setSelections] = useState({
        service: null,
        date: null,
        shift: null // 'morning' or 'evening'
    });

    // Patient Details State
    const [patientDetails, setPatientDetails] = useState({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        notes: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Service data
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [schedule, setSchedule] = useState({
        morning_start: '09:00:00',
        morning_end: '13:00:00',
        evening_start: '16:00:00',
        evening_end: '20:00:00',
        loaded: false
    });
    const [exceptions, setExceptions] = useState([]);

    const getShiftAvailability = (dateIso) => {
        if (!dateIso) return {
            morning: false,
            evening: false,
            morning_start: schedule.morning_start,
            morning_end: schedule.morning_end,
            evening_start: schedule.evening_start,
            evening_end: schedule.evening_end
        };

        const exception = exceptions.find(e => e.date === dateIso);
        if (exception) {
            return {
                morning: exception.is_morning_open,
                evening: exception.is_evening_open,
                morning_start: exception.morning_start_time || schedule.morning_start,
                morning_end: exception.morning_end_time || schedule.morning_end,
                evening_start: exception.evening_start_time || schedule.evening_start,
                evening_end: exception.evening_end_time || schedule.evening_end
            };
        }

        return {
            morning: schedule.morning_enabled,
            evening: schedule.evening_enabled,
            morning_start: schedule.morning_start,
            morning_end: schedule.morning_end,
            evening_start: schedule.evening_start,
            evening_end: schedule.evening_end
        };
    };

    // Fetch services and settings on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingServices(true);
                setError(null);

                const [servicesData, settingsData, exceptionsData] = await Promise.all([
                    getPublicServices(),
                    getPublicClinicSettings().catch(() => null),
                    getAdminScheduleExceptions().catch(() => ({ data: [] }))
                ]);

                // Handle Services
                if (servicesData && servicesData.length > 0) {
                    const servicesWithIcons = servicesData.map((service, index) => {
                        const icons = [<Stethoscope size={32} />, <Sparkles size={32} />, <Activity size={32} />, <Smile size={32} />];
                        return {
                            ...service,
                            icon: icons[index % icons.length]
                        };
                    });
                    setServices(servicesWithIcons);
                } else {
                    setServices([]);
                }

                // Handle Settings
                if (settingsData && settingsData.data) {
                    setSchedule({
                        morning_start: settingsData.data.morning_start_time,
                        morning_end: settingsData.data.morning_end_time,
                        morning_enabled: settingsData.data.morning_shift_enabled ?? true,
                        evening_start: settingsData.data.evening_start_time,
                        evening_end: settingsData.data.evening_end_time,
                        evening_enabled: settingsData.data.evening_shift_enabled ?? true,
                        loaded: true
                    });
                }

                // Handle Exceptions
                if (exceptionsData) {
                    setExceptions(exceptionsData);  // exceptionsData is already the array!
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load services');
                setServices([]);
            } finally {
                setLoadingServices(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format time (HH:MM:SS -> 9:00 AM)
    const formatTime12 = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hours), parseInt(minutes));
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Utility: Check if date is in the past
    const isPastDate = (isoDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(isoDate);
        return checkDate < today;
    };

    // Generate dates (next 30 days)
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            year: d.getFullYear(),
            full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            iso: dateString
        };
    });

    const handleSelect = (key, value) => {
        setSelections(prev => ({ ...prev, [key]: value }));
        setError(null);

        // Auto-advance
        if (key === 'service' && step === 1) {
            setStep(2);
        } else if (key === 'date' && step === 2) {
            setStep(3);
        } else if (key === 'shift' && step === 3) {
            setStep(4);
        }
    };

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!patientDetails.name || patientDetails.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        if (!patientDetails.phone || !/^[6-9]\d{9}$/.test(patientDetails.phone)) {
            errors.phone = 'Enter valid 10-digit Indian mobile number';
        }
        if (!patientDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientDetails.email)) {
            errors.email = 'Enter valid email address';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProceedToConfirm = () => {
        if (validateForm()) {
            setStep(5);
        }
    };

    const handleBack = () => {
        if (step > 1 && !success) {
            setStep(step - 1);
            setError(null);
        } else if (step === 1 && isModal && onClose) {
            onClose();
        }
    };

    const handleConfirm = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Create or find patient using admin service
            const patientPayload = {
                name: patientDetails.name.trim(),
                email: patientDetails.email.trim(),
                phone: patientDetails.phone.trim(),
                date_of_birth: patientDetails.date_of_birth || null,
                gender: patientDetails.gender || null,
                notes: patientDetails.notes.trim() || null
            };

            const patient = await createPatient(patientPayload);

            // Step 2: Create appointment using admin service
            // This will automatically generate a token number
            const appointmentPayload = {
                patient_id: patient.id,
                service_id: selections.service.id,
                shift: selections.shift.id, // 'morning' or 'evening'
                appointment_at: selections.date.iso,
                status: 'confirmed', // Walk-in bookings are immediately confirmed
                notes: patientDetails.notes.trim() || null
            };

            const appointment = await createAppointment(appointmentPayload);

            // Success! Appointment created with token number
            setSuccess(true);
            setStep(6);

        } catch (error) {
            console.error('Walk-in booking error:', error);
            setError(error.message || 'Failed to create appointment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookAnother = () => {
        setSelections({ service: null, date: null, shift: null });
        setPatientDetails({ name: '', email: '', phone: '', date_of_birth: '', gender: '', notes: '' });
        setFormErrors({});
        setError(null);
        setSuccess(false);
        setStep(1);
    };

    const styles = {
        container: {
            minHeight: isModal ? 'auto' : '100vh',
            background: isModal ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
            padding: isModal ? '0' : 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)',
            position: 'relative',
            overflow: 'hidden'
        },
        contentWrapper: {
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
        },
        progressContainer: {
            backgroundColor: 'white',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: 'clamp(12px, 2vw, 20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: 'clamp(1rem, 2vw, 2rem)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
            marginTop: 'clamp(1rem, 2vw, 2rem)'
        },
        optionCard: (isSelected) => ({
            padding: '1.5rem',
            cursor: 'pointer',
            border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
            backgroundColor: isSelected ? 'rgba(12, 164, 181, 0.05)' : 'transparent',
            transition: 'all 0.3s ease',
            borderRadius: '12px'
        })
    };

    // Success Screen
    if (success && step === 6) {
        return (
            <div style={styles.container}>
                <div style={styles.contentWrapper}>
                    <Card style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ color: '#10b981', marginBottom: '1.5rem', animation: 'scaleIn 0.5s ease-out' }}>
                                <CheckCircle2 size={80} style={{ margin: '0 auto', strokeWidth: 2 }} />
                            </div>
                            <h2 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem', fontSize: '2.25rem', fontWeight: '800' }}>
                                Request Submitted!
                            </h2>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                                Your appointment request has been received. The clinic will review your request and confirm your token number shortly.
                            </p>

                            <div style={{
                                backgroundColor: '#f0fdf4',
                                padding: '2rem',
                                borderRadius: '16px',
                                marginBottom: '2rem',
                                textAlign: 'left',
                                border: '2px solid #86efac'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={20} />
                                    Request Details
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <Stethoscope size={18} style={{ color: '#10b981', marginTop: '0.25rem', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#064e3b', fontWeight: '600' }}>Service</div>
                                            <div style={{ fontSize: '1rem', color: '#065f46', fontWeight: '700' }}>{selections.service?.name}</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', backgroundColor: '#bbf7d0' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <Calendar size={18} style={{ color: '#10b981', marginTop: '0.25rem', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#064e3b', fontWeight: '600' }}>Date & Shift</div>
                                            <div style={{ fontSize: '1rem', color: '#065f46', fontWeight: '700' }}>{selections.date?.full}</div>
                                            <div style={{ fontSize: '1rem', color: '#065f46', fontWeight: '700' }}>
                                                {selections.shift?.label} Shift
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#047857', fontStyle: 'italic' }}>
                                    * Token number will be assigned upon confirmation.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button onClick={() => navigate('/admin/dashboard')} variant="outline" style={{ minWidth: '140px' }}>
                                    Dashboard
                                </Button>
                                <Button onClick={handleBookAnother} style={{ minWidth: '140px' }}>
                                    Request Another
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {!isModal && (
                <>
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(12, 164, 181, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                </>
            )}

            {/* Embedded Responsive Styles */}
            <style>{`
                .content-wrapper { padding: 0; }
                .progress-container { padding: 1.5rem 1rem; }
                .stepper-wrapper { gap: 0.25rem; }
                .stepper-circle { width: 32px; height: 32px; font-size: 0.8rem; }
                .stepper-line { width: 1rem; margin: 0 4px; }
                .page-title { fontSize: 1.5rem; }
                .step-badge { font-size: 0.8rem; padding: 0.25rem 0.5rem; }
                
                /* Premium Service Card Hover */
                .option-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    background-color: white; /* Default background */
                }
                .option-card:hover {
                    transform: translateY(-5px);
                    background: linear-gradient(145deg, #ffffff 0%, #ecfeff 100%) !important; /* Soft Teal Tint */
                    border-color: #2dd4bf !important; /* Teal-400 */
                    box-shadow: 0 20px 25px -5px rgba(12, 164, 181, 0.15), 0 8px 10px -6px rgba(12, 164, 181, 0.1) !important;
                }

                @media (min-width: 640px) {
                    .content-wrapper { padding: 0 1rem; }
                    .progress-container { padding: 2.5rem; }
                    .stepper-wrapper { gap: 0.5rem; }
                    .stepper-circle { width: 44px; height: 44px; font-size: 1rem; }
                    .stepper-line { width: 40px; margin: 0 8px; }
                    .page-title { fontSize: 2.25rem; }
                    .step-badge { font-size: 0.9rem; padding: 0.25rem 0.75rem; }
                }
            `}</style>

            <div style={styles.contentWrapper} className="content-wrapper">
                <div style={{ ...styles.progressContainer, padding: undefined }} className="progress-container">
                    <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                        <Button variant="ghost" onClick={handleBack} disabled={step === 1 && !isModal} style={{ paddingLeft: 0, marginLeft: 0, opacity: (step === 1 && !isModal) ? 0 : 1, gap: '0.25rem' }}>
                            <ArrowLeft size={18} /> {step === 1 && isModal ? 'Cancel' : 'Back'}
                        </Button>
                        <div className="step-badge" style={{ color: 'var(--color-primary)', fontWeight: '600', background: 'rgba(12, 164, 181, 0.1)', borderRadius: '1rem' }}>
                            Step {step} of 5
                        </div>
                    </div>

                    <h1 className="page-title" style={{ fontWeight: '800', color: 'var(--color-secondary)', textAlign: 'center', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                        {step === 1 && 'Select Service'}
                        {step === 2 && 'Select Date'}
                        {step === 3 && 'Preferred Shift'}
                        {step === 4 && 'Your Details'}
                        {step === 5 && 'Confirm Request'}
                    </h1>

                    <div className="stepper-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>
                        {[1, 2, 3, 4, 5].map((s, index) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div className="stepper-circle" style={{
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', transition: 'all 0.3s ease', flexShrink: 0,
                                    backgroundColor: step >= s ? 'var(--color-primary)' : 'white',
                                    color: step >= s ? 'white' : 'var(--color-text-light)',
                                    border: step >= s ? 'none' : '2px solid var(--color-border)',
                                    boxShadow: step === s ? '0 0 0 4px rgba(12, 164, 181, 0.2)' : 'none'
                                }}>
                                    {step > s ? <Check size={16} /> : s}
                                </div>
                                {index < 4 && (
                                    <div className="stepper-line" style={{
                                        flex: 1, height: '3px', backgroundColor: step > s ? 'var(--color-primary)' : 'var(--color-border)',
                                        borderRadius: '2px', transition: 'background-color 0.4s ease'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem 1.5rem', borderRadius: '12px',
                        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #fca5a5'
                    }}>
                        <AlertCircle size={20} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{error}</span>
                    </div>
                )}

                {/* Step 1: Services */}
                {step === 1 && (
                    <div className="animate-slide-up">
                        <div style={styles.grid}>
                            {loadingServices ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Card key={i} style={{ ...styles.optionCard(false), pointerEvents: 'none' }}>
                                        <div style={{ width: '100%', height: '100px', backgroundColor: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
                                    </Card>
                                ))
                            ) : services.length === 0 ? (
                                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 2rem" }}>
                                    <CalendarX size={64} style={{ color: "#cbd5e1", marginBottom: "0.5rem" }} />
                                    <p style={{ color: "#64748b" }}>No Services Available</p>
                                </div>
                            ) : (
                                services.map(s => {
                                    const isEnquiry = s.name.toLowerCase().includes('enquiry') || s.name.toLowerCase().includes('call us');
                                    const isSelected = selections.service?.id === s.id;

                                    return (
                                        <Card
                                            key={s.id}
                                            // We disable the default hoverEffect to use our custom CSS class for "Good" hover
                                            hoverEffect={false}
                                            style={isEnquiry ? {
                                                padding: '1.5rem',
                                                border: '2px solid #bbf7d0', // Greenish border
                                                backgroundColor: '#f0fdf4', // Greenish bg
                                                borderRadius: '12px',
                                                cursor: 'default'
                                            } : {
                                                ...styles.optionCard(isSelected),
                                                backgroundColor: isSelected ? 'rgba(12, 164, 181, 0.05)' : undefined // Allow CSS hover to take effect for unselected
                                            }}
                                            onClick={() => !isEnquiry && handleSelect('service', s)}
                                            className={!isEnquiry ? "group option-card" : "group"}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div style={{ color: isEnquiry ? '#10b981' : 'var(--color-primary)' }}>{s.icon}</div>
                                            </div>
                                            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem', color: isEnquiry ? '#15803d' : 'inherit' }}>{s.name}</h3>
                                            <p style={{ color: isEnquiry ? '#166534' : 'var(--color-text-light)', fontSize: '0.9rem' }}>{s.description}</p>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Dates */}
                {step === 2 && (
                    <div className="animate-slide-up">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            {dates.slice(0, 12).map((d, i) => {
                                const isPast = isPastDate(d.iso);
                                const isSelected = selections.date?.iso === d.iso;
                                return (
                                    <Card
                                        key={i}
                                        hoverEffect={false}
                                        style={{
                                            ...styles.optionCard(isSelected),
                                            textAlign: 'center', padding: '1.5rem 1rem',
                                            opacity: isPast ? 0.5 : 1, cursor: isPast ? 'not-allowed' : 'pointer',
                                            backgroundColor: isPast ? '#f3f4f6' : (isSelected ? 'rgba(12, 164, 181, 0.05)' : undefined)
                                        }}
                                        onClick={() => !isPast && handleSelect('date', d)}
                                        className={!isPast ? "group option-card" : ""}
                                    >
                                        <div style={{ color: isPast ? '#9ca3af' : 'var(--color-text-light)', marginBottom: '0.5rem', fontWeight: '500' }}>{d.day}</div>
                                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: isPast ? '#9ca3af' : 'var(--color-primary)', marginBottom: '0.5rem', lineHeight: 1 }}>{d.date}</div>
                                        <div style={{ fontSize: '0.9rem', color: isPast ? '#9ca3af' : 'var(--color-text)' }}>{d.month} {d.year}</div>
                                        {isPast && <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', marginTop: '0.5rem' }}>PAST</div>}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Shift Selection */}
                {step === 3 && (
                    <div className="animate-slide-up">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(1.25rem, 2vw, 2rem)', maxWidth: '800px', margin: '0 auto' }}>
                            {(() => {
                                const avail = getShiftAvailability(selections.date?.iso);
                                const isMorningOpen = avail.morning;
                                const isSelected = selections.shift?.id === 'morning';

                                return (
                                    <Card
                                        hoverEffect={false}
                                        style={{
                                            ...styles.optionCard(isSelected),
                                            opacity: isMorningOpen ? 1 : 0.6,
                                            cursor: isMorningOpen ? 'pointer' : 'not-allowed',
                                            backgroundColor: isMorningOpen
                                                ? (isSelected ? 'rgba(12, 164, 181, 0.05)' : undefined)
                                                : '#f1f5f9'
                                        }}
                                        onClick={() => isMorningOpen && handleSelect('shift', { id: 'morning', label: 'Morning' })}
                                        className={isMorningOpen ? "group option-card" : ""}
                                    >
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <Sun size={48} style={{ color: isMorningOpen ? '#eab308' : '#94a3b8', margin: '0 auto 1.5rem' }} />
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: isMorningOpen ? 'var(--color-secondary)' : '#64748b', marginBottom: '0.5rem' }}>Morning Shift</h3>
                                            <p style={{ color: '#64748b' }}>
                                                {isMorningOpen
                                                    ? (schedule.loaded
                                                        ? `${formatTime12(schedule.morning_start)} - ${formatTime12(schedule.morning_end)}`
                                                        : 'Usually 9:00 AM - 1:00 PM')
                                                    : 'Not Available'}
                                            </p>
                                        </div>
                                    </Card>
                                );
                            })()}

                            {(() => {
                                const avail = getShiftAvailability(selections.date?.iso);
                                const isEveningOpen = avail.evening;
                                const isSelected = selections.shift?.id === 'evening';

                                return (
                                    <Card
                                        hoverEffect={false}
                                        style={{
                                            ...styles.optionCard(isSelected),
                                            opacity: isEveningOpen ? 1 : 0.6,
                                            cursor: isEveningOpen ? 'pointer' : 'not-allowed',
                                            backgroundColor: isEveningOpen
                                                ? (isSelected ? 'rgba(12, 164, 181, 0.05)' : undefined)
                                                : '#f1f5f9'
                                        }}
                                        onClick={() => isEveningOpen && handleSelect('shift', { id: 'evening', label: 'Evening' })}
                                        className={isEveningOpen ? "group option-card" : ""}
                                    >
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <Moon size={48} style={{ color: isEveningOpen ? '#6366f1' : '#94a3b8', margin: '0 auto 1.5rem' }} />
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: isEveningOpen ? 'var(--color-secondary)' : '#64748b', marginBottom: '0.5rem' }}>Evening Shift</h3>
                                            <p style={{ color: '#64748b' }}>
                                                {isEveningOpen
                                                    ? (schedule.loaded
                                                        ? `${formatTime12(schedule.evening_start)} - ${formatTime12(schedule.evening_end)}`
                                                        : 'Usually 4:00 PM - 8:00 PM')
                                                    : 'Not Available'}
                                            </p>
                                        </div>
                                    </Card>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Step 4: Patient Details */}
                {step === 4 && (
                    <Card style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }} className="animate-slide-up">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>
                                <User size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Full Name *
                            </label>
                            <Input name="name" value={patientDetails.name} onChange={handleDetailsChange} placeholder="Enter your full name" style={{ borderColor: formErrors.name ? '#ef4444' : undefined }} />
                            {formErrors.name && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{formErrors.name}</div>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>
                                <Phone size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Mobile Number *
                            </label>
                            <Input name="phone" value={patientDetails.phone} onChange={handleDetailsChange} placeholder="10-digit mobile number" maxLength={10} style={{ borderColor: formErrors.phone ? '#ef4444' : undefined }} />
                            {formErrors.phone && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{formErrors.phone}</div>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>
                                <Mail size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Email Address *
                            </label>
                            <Input name="email" type="email" value={patientDetails.email} onChange={handleDetailsChange} placeholder="your.email@example.com" style={{ borderColor: formErrors.email ? '#ef4444' : undefined }} />
                            {formErrors.email && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{formErrors.email}</div>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>
                                <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Date of Birth (Optional)
                            </label>
                            <Input name="date_of_birth" type="date" value={patientDetails.date_of_birth} onChange={handleDetailsChange} max={new Date().toISOString().split('T')[0]} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>Gender (Optional)</label>
                            <select name="gender" value={patientDetails.gender} onChange={handleDetailsChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', fontSize: '1rem', fontFamily: 'inherit', backgroundColor: 'white' }}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-secondary)' }}>Additional Notes (Optional)</label>
                            <textarea name="notes" value={patientDetails.notes} onChange={handleDetailsChange} placeholder="Any special requests or health information..." rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>

                        <Button onClick={handleProceedToConfirm} style={{ width: '100%' }}>Review Request</Button>
                    </Card>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && (
                    <Card style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }} className="animate-slide-up">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>Confirm Request</h2>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Service</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selections.service?.name}</div>
                            </div>

                            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Date & Shift</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                    <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    {selections.date?.full}
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {selections.shift?.id === 'morning' ? <Sun size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> : <Moon size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                                    {selections.shift?.label} Shift
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Patient Information</div>
                                <div style={{ fontWeight: '600' }}>{patientDetails.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{patientDetails.email}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{patientDetails.phone}</div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', fontSize: '0.85rem', color: '#c2410c' }}>
                                <strong>Note:</strong> Final confirmation depends on clinic availability. You will receive a token number via email upon confirmation.
                            </div>
                        </div>

                        <Button onClick={handleConfirm} disabled={isLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {isLoading && <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                            {isLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default WalkInBooking;
