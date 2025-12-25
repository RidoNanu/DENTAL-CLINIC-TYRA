import React, { forwardRef } from 'react';
import Loader from './Loader';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    style = {},
    ...props
}, ref) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600', // Stronger font weight for premium feel
        borderRadius: 'var(--radius-lg)', // Modern rounded corners
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        border: '1px solid transparent',
        outline: 'none',
        gap: '0.5rem',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled || isLoading ? 0.6 : 1,
        pointerEvents: disabled || isLoading ? 'none' : 'auto',
        userSelect: 'none',
        position: 'relative',
        letterSpacing: '-0.01em',
        fontFamily: 'var(--font-sans)',
        ...style
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
            boxShadow: 'var(--shadow-md)',
        },
        secondary: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            boxShadow: 'var(--shadow-md)',
        },
        outline: {
            backgroundColor: 'transparent',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid transparent',
        },
        danger: {
            backgroundColor: '#ef4444',
            color: 'var(--color-white)',
            boxShadow: 'var(--shadow-sm)',
        }
    };

    const sizes = {
        small: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
        },
        medium: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
        },
        large: {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
        }
    };

    const handleMouseEnter = (e) => {
        if (disabled || isLoading) return;

        e.currentTarget.style.transform = 'translateY(-2px)'; // Higher lift

        if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
            e.currentTarget.style.filter = 'brightness(105%)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        } else if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--color-text)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
        } else { // Ghost
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
        }
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.filter = 'none';

        // Reset specific variant styles
        if (variant === 'primary') e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        else if (variant === 'secondary') e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        else if (variant === 'danger') e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        else if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.backgroundColor = 'transparent';
        } else {
            e.currentTarget.style.backgroundColor = 'transparent';
        }
    };

    return (
        <>
            <button
                ref={ref}
                style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
                className={className}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader size="small" color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} />}
                {!isLoading && children}
            </button>
            <style>{`
                button:focus {
                    outline: none;
                }
                button:focus-visible {
                    outline: 2px solid var(--color-primary);
                    outline-offset: 2px;
                }
            `}</style>
        </>
    );
});

Button.displayName = 'Button';
export default Button;
