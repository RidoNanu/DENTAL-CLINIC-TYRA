import React, { useState, useEffect } from 'react';
import { Save, Building2, Bell, Shield, Info, LogOut, Key, AlertCircle, Check, X, Calendar, Trash2, Sun, Moon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TimePicker from '../../components/ui/TimePicker';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import {
    getClinicSettings,
    updateClinicSettings,
    getClinicSchedule,  // New
    updateClinicSchedule, // New
    getNotificationSettings,
    updateNotificationSettings,
    getSystemInfo,
    changePassword
} from '../../services/settingsService';
import {
    getAdminScheduleExceptions,
    upsertScheduleException,
    deleteScheduleException
} from '../../services/scheduleExceptionService';

const Toggle = ({ enabled, onChange, label, disabled }) => (
    <div
        onClick={() => !disabled && onChange(!enabled)}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(0.75rem, 2vw, 1rem)',
            padding: 'clamp(0.625rem, 1.5vw, 0.75rem) 0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            minHeight: '44px'
        }}
    >
        <span style={{
            fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
            fontWeight: '500',
            color: '#334155',
            flex: 1,
            wordWrap: 'break-word',
            lineHeight: 1.4
        }}>{label}</span>
        <div style={{
            position: 'relative',
            width: '44px',
            height: '24px',
            backgroundColor: enabled ? 'var(--color-primary)' : '#cbd5e1',
            borderRadius: '9999px',
            transition: 'background-color 0.2s',
            flexShrink: 0
        }}>
            <div style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: enabled ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} />
        </div>
    </div>
);

// Helper to format time (HH:MM:SS or HH:MM → 9:00 AM)
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(hours), parseInt(minutes));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};


const SectionHeader = ({ icon: Icon, title, description }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-primary)' }}>
            <Icon size={20} />
        </div>
        <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{title}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{description}</p>
        </div>
    </div>
);

const Settings = () => {
    const { admin, logout } = useAuth();

    // State
    const [clinicInfo, setClinicInfo] = useState({
        clinic_name: '',
        phone: '',
        email: '',
        address: '',
        opening_hours: '',
        google_maps_url: '',
        instagram_url: ''
    });

    // Schedule State
    const [schedule, setSchedule] = useState({
        morning_start_time: '09:00:00',
        morning_end_time: '13:00:00',
        morning_shift_enabled: true,
        evening_start_time: '16:00:00',
        evening_end_time: '20:00:00',
        evening_shift_enabled: true
    });

    const [notifications, setNotifications] = useState({
        email_notifications_enabled: true,
        send_request_email: true,
        send_confirmation_email: true,
        send_cancellation_email: true
    });

    const [systemInfo, setSystemInfo] = useState(null);
    const [loading, setLoading] = useState({ clinic: false, notifications: false, schedule: false });
    const [toast, setToast] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    // ... password form state ...
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const [changingPassword, setChangingPassword] = useState(false);

    // Exception State
    const [exceptions, setExceptions] = useState([]);
    const [newException, setNewException] = useState({
        date: '',
        is_morning_open: false,
        is_evening_open: false,
        morning_start_time: '',
        morning_end_time: '',
        evening_start_time: '',
        evening_end_time: ''
    });
    const [loadingExceptions, setLoadingExceptions] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, exception: null });

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load exceptions independently to avoid blocking other settings
            const [clinic, notif, system, sched] = await Promise.all([
                getClinicSettings(),
                getNotificationSettings(),
                getSystemInfo(),
                getClinicSchedule()
            ]);

            let excepts = { data: [] };
            try {
                excepts = await getAdminScheduleExceptions();
            } catch (err) {
                console.error("Failed to load exceptions:", err);
                // Don't block - just show empty exceptions
            }

            if (clinic.data) setClinicInfo(clinic.data);
            if (notif.data) setNotifications(notif.data);
            if (system.data) setSystemInfo(system.data);
            if (sched.data) setSchedule(sched.data);
            if (excepts) setExceptions(excepts);  // excepts is already the data array!
        } catch (error) {
            console.error(error);
            showToast('Failed to load settings', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveSchedule = async () => {
        try {
            // Validation: Convert time strings to comparable numbers (HHMM format)
            const timeToMinutes = (timeStr) => {
                if (!timeStr) return null;
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            const morningStart = timeToMinutes(schedule.morning_start_time);
            const morningEnd = timeToMinutes(schedule.morning_end_time);
            const eveningStart = timeToMinutes(schedule.evening_start_time);
            const eveningEnd = timeToMinutes(schedule.evening_end_time);

            // Validation Rule 1: Morning start must be earlier than morning end
            if (schedule.morning_shift_enabled && morningStart >= morningEnd) {
                showToast('Morning start time must be earlier than morning end time', 'error');
                return;
            }

            // Validation Rule 2: Evening start must be earlier than evening end
            if (schedule.evening_shift_enabled && eveningStart >= eveningEnd) {
                showToast('Evening start time must be earlier than evening end time', 'error');
                return;
            }

            // Validation Rule 3: Morning and evening ranges must not overlap
            if (schedule.morning_shift_enabled && schedule.evening_shift_enabled) {
                // Check if morning end time overlaps with or is after evening start time
                if (morningEnd > eveningStart) {
                    showToast('Morning and evening shifts cannot overlap. Morning must end before evening starts', 'error');
                    return;
                }
            }

            setLoading({ ...loading, schedule: true });
            await updateClinicSchedule(schedule);
            showToast('Working hours updated successfully');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update working hours', 'error');
        } finally {
            setLoading({ ...loading, schedule: false });
        }
    };

    const handleSaveException = async () => {
        try {
            if (!newException.date) {
                showToast('Please select a date', 'error');
                return;
            }
            setLoadingExceptions(true);

            // Save the exception
            await upsertScheduleException(newException);

            // Reset form immediately after successful save
            setNewException({
                date: '',
                is_morning_open: false,
                is_evening_open: false,
                morning_start_time: '',
                morning_end_time: '',
                evening_start_time: '',
                evening_end_time: ''
            });
            showToast('Schedule exception saved');

            // Try to refresh list (non-blocking)
            try {
                const updated = await getAdminScheduleExceptions();
                if (updated) setExceptions(updated);  // updated is already the array!
            } catch (refreshError) {
                console.error('Failed to refresh exceptions list:', refreshError);
                // Still show success since the save worked
            }
        } catch (error) {
            console.error('Failed to save exception:', error);
            showToast(error.response?.data?.message || 'Failed to save exception', 'error');
        } finally {
            setLoadingExceptions(false);
        }
    };

    const handleDeleteException = async (exception) => {
        setDeleteModal({ show: false, exception: null });
        try {
            setLoadingExceptions(true);
            await deleteScheduleException(exception.id);
            showToast('Exception deleted');

            // Refresh list
            const updated = await getAdminScheduleExceptions();
            if (updated) setExceptions(updated);
        } catch (error) {
            showToast('Failed to delete exception', 'error');
        } finally {
            setLoadingExceptions(false);
        }
    }; const handleSaveClinicInfo = async () => {
        try {
            setLoading({ ...loading, clinic: true });
            await updateClinicSettings(clinicInfo);
            showToast('Clinic settings saved successfully');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save clinic settings', 'error');
        } finally {
            setLoading({ ...loading, clinic: false });
        }
    };

    const handleSaveNotifications = async () => {
        try {
            setLoading({ ...loading, notifications: true });
            await updateNotificationSettings(notifications);
            showToast('Notification settings saved successfully');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save notification settings', 'error');
        } finally {
            setLoading({ ...loading, notifications: false });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        try {
            setChangingPassword(true);
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            showToast('Password changed successfully. Please log in again.');
            setIsPasswordModalOpen(false);

            // Logout after 2 seconds
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '4rem'
    };

    return (
        <div className="animate-fade-in" style={containerStyle}>
            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Page Title */}
            <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                    Settings
                </h1>
                <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Manage clinic configurations and system preferences</p>
            </div>

            {/* 1. Admin Profile (Read-Only) */}
            <Card>
                <SectionHeader
                    icon={Shield}
                    title="Admin Profile"
                    description="Your administrator account information."
                />

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#334155' }}>
                            Email Address
                        </label>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            color: '#64748b'
                        }}>
                            {admin?.email || 'Loading...'}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#334155' }}>
                            Role
                        </label>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            color: '#64748b'
                        }}>
                            Administrator
                        </div>
                    </div>
                </div>

                <div className="settings-actions" style={{ paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Button
                        variant="outline"
                        onClick={() => setIsPasswordModalOpen(true)}
                        style={{ color: '#0ca4b5', borderColor: '#0ca4b5', minHeight: '44px', width: '100%', justifyContent: 'center' }}
                    >
                        <Key size={16} className="mr-2" /> Change Password
                    </Button>

                    <Button
                        variant="outline"
                        onClick={logout}
                        style={{ borderColor: '#ef4444', color: '#ef4444', minHeight: '44px', width: '100%', justifyContent: 'center' }}
                    >
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                </div>
            </Card>

            {/* 2. Clinic Information */}
            <Card>
                <SectionHeader
                    icon={Building2}
                    title="Clinic Information"
                    description="Details displayed on emails and public pages."
                />

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <Input
                        label="Clinic Name"
                        value={clinicInfo.clinic_name}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, clinic_name: e.target.value })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                        <Input
                            label="Phone Number"
                            value={clinicInfo.phone}
                            onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={clinicInfo.email}
                            onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Address"
                        value={clinicInfo.address}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                    />

                    <Input
                        label="Working Hours"
                        value={clinicInfo.opening_hours}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, opening_hours: e.target.value })}
                        placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM"
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <Input
                            label="Google Maps URL (optional)"
                            value={clinicInfo.google_maps_url || ''}
                            onChange={(e) => setClinicInfo({ ...clinicInfo, google_maps_url: e.target.value })}
                            placeholder="https://maps.google.com/..."
                        />
                        <Input
                            label="Instagram URL (optional)"
                            value={clinicInfo.instagram_url || ''}
                            onChange={(e) => setClinicInfo({ ...clinicInfo, instagram_url: e.target.value })}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleSaveClinicInfo}
                        isLoading={loading.clinic}
                        style={{ minWidth: '120px' }}
                    >
                        <Save size={18} className="mr-2" /> Save Changes
                    </Button>
                </div>
            </Card>

            {/* 3. Clinic Working Hours (Dynamic) */}
            <Card>
                <SectionHeader
                    icon={Building2} // Or Clock if available
                    title="Clinic Working Hours"
                    description="Set the Morning & Evening shift timings (used for bookings & emails)."
                />

                <div className="working-hours-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {/* Morning Shift */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fcd34d',
                        borderRadius: '0.75rem'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Morning Shift
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <Toggle
                                label="Enable Morning Shift"
                                enabled={schedule.morning_shift_enabled}
                                onChange={(val) => setSchedule({ ...schedule, morning_shift_enabled: val })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#92400e' }}>Start Time</label>
                                <Input
                                    type="time"
                                    value={schedule.morning_start_time}
                                    onChange={(e) => setSchedule({ ...schedule, morning_start_time: e.target.value })}
                                    style={{ borderColor: '#fcd34d' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#92400e' }}>End Time</label>
                                <Input
                                    type="time"
                                    value={schedule.morning_end_time}
                                    onChange={(e) => setSchedule({ ...schedule, morning_end_time: e.target.value })}
                                    style={{ borderColor: '#fcd34d' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Evening Shift */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #93c5fd',
                        borderRadius: '0.75rem'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Evening Shift
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <Toggle
                                label="Enable Evening Shift"
                                enabled={schedule.evening_shift_enabled}
                                onChange={(val) => setSchedule({ ...schedule, evening_shift_enabled: val })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#1e40af' }}>Start Time</label>
                                <Input
                                    type="time"
                                    value={schedule.evening_start_time}
                                    onChange={(e) => setSchedule({ ...schedule, evening_start_time: e.target.value })}
                                    style={{ borderColor: '#93c5fd' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#1e40af' }}>End Time</label>
                                <Input
                                    type="time"
                                    value={schedule.evening_end_time}
                                    onChange={(e) => setSchedule({ ...schedule, evening_end_time: e.target.value })}
                                    style={{ borderColor: '#93c5fd' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleSaveSchedule}
                        isLoading={loading.schedule}
                        style={{ minWidth: '120px' }}
                    >
                        <Save size={18} className="mr-2" /> Update Hours
                    </Button>
                </div>

            </Card>

            {/* Schedule Exceptions */}
            <Card>
                <SectionHeader
                    icon={Calendar}
                    title="Date-Specific Exceptions"
                    description="Override schedule for specific dates (e.g. Holidays)."
                />

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Add New Exception</h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <Input
                                type="date"
                                label="Date"
                                value={newException.date}
                                onChange={e => setNewException({ ...newException, date: e.target.value })}
                            />

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* Morning Shift Section */}
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Toggle
                                        label="Morning Shift Open?"
                                        enabled={newException.is_morning_open}
                                        onChange={val => setNewException({ ...newException, is_morning_open: val })}
                                    />
                                    {newException.is_morning_open && (
                                        <div className="time-inputs" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: '0.75rem',
                                            marginTop: '1rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid #e2e8f0'
                                        }}>
                                            <TimePicker
                                                label="Start Time"
                                                value={newException.morning_start_time}
                                                onChange={e => setNewException({ ...newException, morning_start_time: e.target.value })}
                                            />
                                            <TimePicker
                                                label="End Time"
                                                value={newException.morning_end_time}
                                                onChange={e => setNewException({ ...newException, morning_end_time: e.target.value })}
                                            />
                                            <p style={{
                                                gridColumn: '1 / -1',
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                                fontStyle: 'italic',
                                                margin: 0
                                            }}>
                                                Leave blank to use global schedule times
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Evening Shift Section */}
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Toggle
                                        label="Evening Shift Open?"
                                        enabled={newException.is_evening_open}
                                        onChange={val => setNewException({ ...newException, is_evening_open: val })}
                                    />
                                    {newException.is_evening_open && (
                                        <div className="time-inputs" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: '0.75rem',
                                            marginTop: '1rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid #e2e8f0'
                                        }}>
                                            <TimePicker
                                                label="Start Time"
                                                value={newException.evening_start_time}
                                                onChange={e => setNewException({ ...newException, evening_start_time: e.target.value })}
                                            />
                                            <TimePicker
                                                label="End Time"
                                                value={newException.evening_end_time}
                                                onChange={e => setNewException({ ...newException, evening_end_time: e.target.value })}
                                            />
                                            <p style={{
                                                gridColumn: '1 / -1',
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                                fontStyle: 'italic',
                                                margin: 0
                                            }}>
                                                Leave blank to use global schedule times
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button onClick={handleSaveException} isLoading={loadingExceptions}>
                                Add Exception
                            </Button>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>Upcoming Exceptions</h3>
                            <Button
                                variant="ghost"
                                onClick={async () => {
                                    try {
                                        const updated = await getAdminScheduleExceptions();
                                        if (updated) setExceptions(updated);  // updated is already the array!
                                        showToast('Refreshed exceptions list');
                                    } catch (error) {
                                        showToast('Failed to refresh', 'error');
                                    }
                                }}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                                Refresh
                            </Button>
                        </div>
                        {exceptions.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No exceptions set.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {exceptions.map(ex => {
                                    const exDate = new Date(ex.date);
                                    const dayName = exDate.toLocaleDateString('en-US', { weekday: 'short' });
                                    const monthDay = exDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const year = exDate.getFullYear();

                                    return (
                                        <div key={ex.id} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1.25rem',
                                            padding: '1.25rem',
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.75rem',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }}>
                                            {/* Date Badge */}
                                            <div style={{
                                                minWidth: '70px',
                                                padding: '0.75rem',
                                                backgroundColor: '#f1f5f9',
                                                borderRadius: '0.5rem',
                                                textAlign: 'center',
                                                border: '2px solid #e2e8f0'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>{dayName}</div>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: '800',
                                                    color: '#0f172a',
                                                    lineHeight: 1.2,
                                                    margin: '0.25rem 0'
                                                }}>{exDate.getDate()}</div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: '#64748b'
                                                }}>{monthDay.split(' ')[0]} {year}</div>
                                            </div>

                                            {/* Exception Details */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    color: '#0f172a',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    {exDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>

                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    {/* Morning Shift */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.5rem 0.75rem',
                                                        backgroundColor: ex.is_morning_open ? '#fef3c7' : '#fee2e2',
                                                        borderRadius: '0.5rem',
                                                        border: `1px solid ${ex.is_morning_open ? '#fbbf24' : '#fca5a5'}`
                                                    }}>
                                                        <Sun size={18} style={{
                                                            color: ex.is_morning_open ? '#f59e0b' : '#94a3b8',
                                                            flexShrink: 0
                                                        }} />
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{
                                                                fontWeight: '600',
                                                                color: ex.is_morning_open ? '#78350f' : '#7f1d1d',
                                                                fontSize: '0.875rem'
                                                            }}>Morning:</span>
                                                            <span style={{
                                                                marginLeft: '0.5rem',
                                                                color: ex.is_morning_open ? '#78350f' : '#7f1d1d',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                {ex.is_morning_open ? (
                                                                    ex.morning_start_time && ex.morning_end_time ? (
                                                                        <>
                                                                            {formatTime(ex.morning_start_time)} - {formatTime(ex.morning_end_time)}
                                                                            <span style={{
                                                                                marginLeft: '0.5rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600',
                                                                                color: '#f59e0b'
                                                                            }}>●</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {schedule.morning_start ? `${formatTime12(schedule.morning_start)} - ${formatTime12(schedule.morning_end)}` : 'Open'}
                                                                            <span style={{
                                                                                marginLeft: '0.5rem',
                                                                                padding: '0.125rem 0.375rem',
                                                                                backgroundColor: '#fef3c7',
                                                                                border: '1px solid #fbbf24',
                                                                                borderRadius: '0.25rem',
                                                                                fontSize: '0.65rem',
                                                                                fontWeight: '700',
                                                                                color: '#78350f',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.025em'
                                                                            }}>Global</span>
                                                                        </>
                                                                    )
                                                                ) : 'Closed'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Evening Shift */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.5rem 0.75rem',
                                                        backgroundColor: ex.is_evening_open ? '#ddd6fe' : '#fee2e2',
                                                        borderRadius: '0.5rem',
                                                        border: `1px solid ${ex.is_evening_open ? '#a78bfa' : '#fca5a5'}`
                                                    }}>
                                                        <Moon size={18} style={{
                                                            color: ex.is_evening_open ? '#6366f1' : '#94a3b8',
                                                            flexShrink: 0
                                                        }} />
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{
                                                                fontWeight: '600',
                                                                color: ex.is_evening_open ? '#4c1d95' : '#7f1d1d',
                                                                fontSize: '0.875rem'
                                                            }}>Evening:</span>
                                                            <span style={{
                                                                marginLeft: '0.5rem',
                                                                color: ex.is_evening_open ? '#4c1d95' : '#7f1d1d',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                {ex.is_evening_open ? (
                                                                    ex.evening_start_time && ex.evening_end_time ? (
                                                                        <>
                                                                            {formatTime(ex.evening_start_time)} - {formatTime(ex.evening_end_time)}
                                                                            <span style={{
                                                                                marginLeft: '0.5rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600',
                                                                                color: '#6366f1'
                                                                            }}>●</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {schedule.evening_start ? `${formatTime12(schedule.evening_start)} - ${formatTime12(schedule.evening_end)}` : 'Open'}
                                                                            <span style={{
                                                                                marginLeft: '0.5rem',
                                                                                padding: '0.125rem 0.375rem',
                                                                                backgroundColor: '#ddd6fe',
                                                                                border: '1px solid #a78bfa',
                                                                                borderRadius: '0.25rem',
                                                                                fontSize: '0.65rem',
                                                                                fontWeight: '700',
                                                                                color: '#4c1d95',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.025em'
                                                                            }}>Global</span>
                                                                        </>
                                                                    )
                                                                ) : 'Closed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <Button
                                                variant="ghost"
                                                onClick={() => setDeleteModal({ show: true, exception: ex })}
                                                style={{
                                                    color: '#ef4444',
                                                    padding: '0.5rem',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* 4. Notification Preferences */}
            <Card>
                <SectionHeader
                    icon={Bell}
                    title="Notification Preferences"
                    description="Control which emails are sent to patients."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Toggle
                        label="Enable Email Notifications"
                        enabled={notifications.email_notifications_enabled}
                        onChange={(val) => setNotifications({ ...notifications, email_notifications_enabled: val })}
                    />

                    <div style={{ paddingLeft: '2rem', marginTop: '0.5rem', borderLeft: '2px solid #e2e8f0' }}>
                        <Toggle
                            label="Send email when appointment is requested"
                            enabled={notifications.send_request_email}
                            onChange={(val) => setNotifications({ ...notifications, send_request_email: val })}
                            disabled={!notifications.email_notifications_enabled}
                        />
                        <Toggle
                            label="Send email when appointment is confirmed"
                            enabled={notifications.send_confirmation_email}
                            onChange={(val) => setNotifications({ ...notifications, send_confirmation_email: val })}
                            disabled={!notifications.email_notifications_enabled}
                        />
                        <Toggle
                            label="Send email when appointment is cancelled"
                            enabled={notifications.send_cancellation_email}
                            onChange={(val) => setNotifications({ ...notifications, send_cancellation_email: val })}
                            disabled={!notifications.email_notifications_enabled}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleSaveNotifications}
                        isLoading={loading.notifications}
                        style={{ minWidth: '120px' }}
                    >
                        <Save size={18} className="mr-2" /> Save Config
                    </Button>
                </div>
            </Card>

            {/* 5. System Information (Read-Only) */}
            {systemInfo && (
                <Card>
                    <SectionHeader
                        icon={Info}
                        title="System Information"
                        description="Application and server details."
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: '#64748b' }}>
                                Application
                            </label>
                            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>
                                {systemInfo.appName}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: '#64748b' }}>
                                Environment
                            </label>
                            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>
                                {systemInfo.environment}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: '#64748b' }}>
                                API Version
                            </label>
                            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>
                                {systemInfo.apiVersion}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: '#64748b' }}>
                                Server Uptime
                            </label>
                            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>
                                {systemInfo.uptime}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <Modal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    title="Change Password"
                >
                    <form onSubmit={handleChangePassword}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />

                            <Input
                                label="New Password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min. 6 characters"
                                required
                            />

                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />

                            {passwordError && (
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <AlertCircle size={16} />
                                    {passwordError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={changingPassword}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <Modal
                    isOpen={deleteModal.show}
                    onClose={() => setDeleteModal({ show: false, exception: null })}
                    title="Delete Exception"
                >
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                                    Are you sure you want to delete this exception?
                                </p>
                                {deleteModal.exception && (
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(deleteModal.exception.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteModal({ show: false, exception: null })}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleDeleteException(deleteModal.exception)}
                                style={{ backgroundColor: '#dc2626', color: 'white' }}
                                isLoading={loadingExceptions}
                            >
                                Delete Exception
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Responsive CSS */}
            <style>{`
                /* Desktop: Buttons in a row */
                @media (min-width: 640px) {
                    .settings-actions {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                    }
                    .settings-actions button {
                        width: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Settings;
