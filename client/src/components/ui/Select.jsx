import React, { forwardRef } from 'react';

const Select = forwardRef(({
    label,
    error,
    options = [],
    fullWidth = false,
    className = '',
    placeholder = 'Select an option',
    ...props
}, ref) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '1rem',
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text)',
    };

    const selectStyle = {
        padding: '0.625rem 2rem 0.625rem 0.875rem', // Extra right padding for chevron
        borderRadius: '0.5rem',
        border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
        fontSize: '1rem',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-white)',
        outline: 'none',
        transition: 'all var(--transition-fast)',
        width: '100%',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23334155%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.7rem top 50%',
        backgroundSize: '0.65rem auto',
        cursor: 'pointer',
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = error ? '#ef4444' : 'var(--color-primary)';
        e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(12, 164, 181, 0.1)'}`;
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = error ? '#ef4444' : 'var(--color-border)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={containerStyle} className={className}>
            {label && <label htmlFor={props.id} style={labelStyle}>{label}</label>}
            <select
                ref={ref}
                style={selectStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                aria-invalid={!!error}
                {...props}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }} role="alert">{error}</span>
            )}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;
