import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, Loader, Sun, Moon } from 'lucide-react';

const CancelAppointment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying | confirmed | confirming | error | success
    const [appointmentData, setAppointmentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid or missing cancellation link.');
            return;
        }

        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/public/appointment/verify-token?token=${token}`
            );

            const data = await response.json();

            if (data.success && data.data.action_type === 'cancel') {
                setAppointmentData(data.data.appointment);
                setStatus('confirmed');
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'This action link is invalid or has expired.');
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            setStatus('error');
            setErrorMessage('Unable to verify the cancellation link. Please try again later.');
        }
    };

    const handleCancelAppointment = async () => {
        setStatus('confirming');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/public/appointment/cancel?token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Failed to cancel appointment.');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            setStatus('error');
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '4rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            maxWidth: '600px',
            width: '100%',
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem',
        },
        title: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '0.5rem',
        },
        subtitle: {
            color: '#64748b',
            fontSize: '1.1rem',
        },
        iconContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
        },
        detailsCard: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: '1px solid #e2e8f0',
        },
        label: {
            color: '#64748b',
            fontWeight: '600',
        },
        value: {
            color: '#0f172a',
            fontWeight: '700',
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
        },
    };

    // Verifying state
    if (status === 'verifying') {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <Card style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={styles.iconContainer}>
                            <Loader size={48} style={{ color: '#0ca4b5', animation: 'spin 1s linear infinite' }} />
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Verifying Cancellation Link
                        </h2>
                        <p style={{ color: '#64748b' }}>Please wait while we verify your request...</p>
                    </Card>
                </div>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Cancel Appointment</h1>
                        <p style={styles.subtitle}>Tyra Dentistree</p>
                    </div>
                    <Card style={{ padding: '3rem', textAlign: 'center', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                        <div style={styles.iconContainer}>
                            <AlertCircle size={64} style={{ color: '#dc2626' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#dc2626' }}>
                            Unable to Cancel
                        </h2>
                        <p style={{ color: '#991b1b', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            {errorMessage}
                        </p>
                        <Button onClick={() => navigate('/')} variant="primary">
                            Back to Home
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Appointment Cancelled</h1>
                        <p style={styles.subtitle}>Tyra Dentistree</p>
                    </div>
                    <Card style={{ padding: '3rem', textAlign: 'center', border: '1px solid #dcfce7', backgroundColor: '#f0fdf4' }}>
                        <div style={styles.iconContainer}>
                            <CheckCircle size={64} style={{ color: '#16a34a' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#16a34a' }}>
                            Appointment Successfully Cancelled
                        </h2>
                        <p style={{ color: '#166534', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Your appointment has been cancelled. We're sorry we won't be seeing you this time.
                            <br /><br />
                            If you'd like to reschedule, please book a new appointment or contact us directly.
                        </p>
                        <div style={styles.buttonGroup}>
                            <Button onClick={() => navigate('/book-appointment')} variant="primary" fullWidth>
                                Book New Appointment
                            </Button>
                            <Button onClick={() => navigate('/')} variant="outline" fullWidth>
                                Back to Home
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Confirmation state (awaiting user confirmation)
    if (status === 'confirmed') {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };



        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Cancel Appointment</h1>
                        <p style={styles.subtitle}>Tyra Dentistree</p>
                    </div>
                    <Card style={{ padding: '2.5rem' }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <XCircle size={56} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                Are you sure?
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '1rem' }}>
                                You're about to cancel the following appointment:
                            </p>
                        </div>

                        {appointmentData && (
                            <div style={styles.detailsCard}>
                                {appointmentData.token_number && (
                                    <div style={styles.detailRow}>
                                        <span style={styles.label}>Token Number:</span>
                                        <span style={styles.value} className="text-xl text-blue-600">#{appointmentData.token_number}</span>
                                    </div>
                                )}
                                <div style={styles.detailRow}>
                                    <span style={styles.label}>Patient:</span>
                                    <span style={styles.value}>{appointmentData.patient_name}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.label}>Service:</span>
                                    <span style={styles.value}>{appointmentData.service_name}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.label}>Date:</span>
                                    <span style={styles.value}>{formatDate(appointmentData.appointment_at)}</span>
                                </div>
                                <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                                    <span style={styles.label}>Shift:</span>
                                    <span style={{ ...styles.value, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                                        {appointmentData.shift === 'morning' ? <Sun size={16} /> : <Moon size={16} />}
                                        {appointmentData.shift} Shift
                                    </span>
                                </div>
                            </div>
                        )}

                        <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', borderLeft: '3px solid #f97316' }}>
                            <p style={{ color: '#9a3412', fontSize: '0.95rem', margin: 0 }}>
                                <strong>Please note:</strong> This action cannot be undone. You will need to book a new appointment if you change your mind.
                            </p>
                        </div>

                        <div style={styles.buttonGroup}>
                            <Button onClick={handleCancelAppointment} variant="danger" fullWidth>
                                Yes, Cancel Appointment
                            </Button>
                            <Button onClick={() => navigate('/')} variant="outline" fullWidth>
                                No, Keep Appointment
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Confirming state (processing)
    if (status === 'confirming') {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <Card style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={styles.iconContainer}>
                            <Loader size={48} style={{ color: '#0ca4b5', animation: 'spin 1s linear infinite' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Cancelling Appointment
                        </h2>
                        <p style={{ color: '#64748b' }}>Please wait...</p>
                    </Card>
                </div>
            </div>
        );
    }

    return null;
};

export default CancelAppointment;
