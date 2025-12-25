import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    fullWidth = false,
    icon: Icon,
    className = '',
    style = {},
    ...props
}, ref) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '1.25rem',
        position: 'relative',
        ...style
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--color-secondary)',
        marginLeft: '0.25rem', // Slight offset
    };

    const inputStyle = {
        padding: Icon ? '0.75rem 1rem 0.75rem 3rem' : '0.75rem 1rem', // More left padding for icon
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
        fontSize: '1rem',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-bg-light)', // Slight contrast bg
        outline: 'none',
        transition: 'all var(--transition-fast)',
        width: '100%',
        boxShadow: 'var(--shadow-sm)', // Inner depth hint
    };

    const inputWrapperStyle = {
        position: 'relative',
        width: '100%',
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--color-text-light)',
        pointerEvents: 'none',
        zIndex: 1,
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = error ? '#ef4444' : 'var(--color-primary)';
        e.target.style.backgroundColor = 'var(--color-white)';
        e.target.style.boxShadow = `0 0 0 4px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(12, 164, 181, 0.15)'}`;
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = error ? '#ef4444' : 'var(--color-border)';
        e.target.style.backgroundColor = 'var(--color-bg-light)';
        e.target.style.boxShadow = 'var(--shadow-sm)';
    };

    return (
        <div style={containerStyle} className={className}>
            <style>
                {`
                    input::placeholder {
                        color: #94a3b8;
                        opacity: 1;
                    }
                    input::-webkit-input-placeholder {
                        color: #94a3b8;
                        opacity: 1;
                    }
                    input::-moz-placeholder {
                        color: #94a3b8;
                        opacity: 1;
                    }
                    input:-ms-input-placeholder {
                        color: #94a3b8;
                        opacity: 1;
                    }
                `}
            </style>
            {label && <label htmlFor={props.id || props.name} style={labelStyle}>{label}</label>}
            <div style={inputWrapperStyle}>
                {Icon && <Icon size={20} style={iconStyle} />}
                <input
                    ref={ref}
                    id={props.id || props.name}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    aria-invalid={!!error}
                    {...props}
                />
            </div>
            {helperText && !error && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginLeft: '0.25rem' }}>{helperText}</span>
            )}
            {error && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '0.25rem', fontWeight: '500' }} role="alert">{error}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
