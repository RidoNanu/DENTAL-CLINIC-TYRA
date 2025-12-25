import React, { useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * TimePicker Component - 12-hour format with AM/PM
 * Premium UI/UX version
 */
const TimePicker = ({ label, value, onChange, placeholder }) => {
    // Parse existing value (HH:MM format) into 12-hour components
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '', minute: '', period: 'AM' };
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        return {
            hour: h === 0 ? '12' : h > 12 ? String(h - 12) : String(h),
            minute: minutes,
            period: h >= 12 ? 'PM' : 'AM'
        };
    };

    // Convert 12-hour format back to 24-hour (HH:MM)
    const formatTo24Hour = (hour, minute, period) => {
        if (!hour || !minute) return '';
        let h = parseInt(hour);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${minute}`;
    };

    const parsed = parseTime(value);
    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);
    const [period, setPeriod] = useState(parsed.period);

    const handleChange = (newHour, newMinute, newPeriod) => {
        setHour(newHour);
        setMinute(newMinute);
        setPeriod(newPeriod);
        onChange({ target: { value: formatTo24Hour(newHour, newMinute, newPeriod) } });
    };

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const selectStyle = {
        padding: '0.75rem 2.5rem 0.75rem 1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#0f172a',
        backgroundColor: 'white',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    };

    return (
        <div style={{ marginBottom: '0' }}>
            {label && (
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: '#334155'
                }}>
                    <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                    {label}
                </label>
            )}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: ' center',
                padding: 'clamp(0.375rem, 1vw, 0.5rem)',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0'
            }}>
                <select
                    value={hour}
                    onChange={(e) => handleChange(e.target.value, minute, period)}
                    style={{
                        ...selectStyle,
                        flex: '1 1 auto',
                        minWidth: '60px',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem) 2rem clamp(0.5rem, 2vw, 0.75rem) clamp(0.625rem, 2vw, 1rem)',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(12, 164, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                >
                    <option value="" disabled>HH</option>
                    {hours.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
                <span style={{
                    fontWeight: '700',
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    color: '#94a3b8',
                    flexShrink: 0
                }}>:</span>
                <select
                    value={minute}
                    onChange={(e) => handleChange(hour, e.target.value, period)}
                    style={{
                        ...selectStyle,
                        flex: '1 1 auto',
                        minWidth: '60px',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem) 2rem clamp(0.5rem, 2vw, 0.75rem) clamp(0.625rem, 2vw, 1rem)',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(12, 164, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                >
                    <option value="" disabled>MM</option>
                    {minutes.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <select
                    value={period}
                    onChange={(e) => handleChange(hour, minute, e.target.value)}
                    style={{
                        ...selectStyle,
                        minWidth: '70px',
                        flex: '0 0 auto',
                        fontWeight: '700',
                        color: period === 'AM' ? '#f59e0b' : '#6366f1',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem) 2rem clamp(0.5rem, 2vw, 0.75rem) clamp(0.625rem, 2vw, 1rem)',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(12, 164, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                >
                    <option value="AM" style={{ color: '#f59e0b' }}>AM</option>
                    <option value="PM" style={{ color: '#6366f1' }}>PM</option>
                </select>
            </div>
        </div>
    );
};

export default TimePicker;
