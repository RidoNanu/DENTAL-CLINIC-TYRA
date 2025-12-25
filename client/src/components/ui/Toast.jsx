import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast Notification Component
 * 
 * Displays success or error messages with proper positioning below the navbar.
 * Includes smooth animations and responsive design.
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast: 'success' or 'error'
 * @param {Function} props.onClose - Callback when close button is clicked
 */
const Toast = ({ message, type = 'success', onClose }) => {
    const isSuccess = type === 'success';

    const styles = {
        container: {
            position: 'fixed',
            top: '6rem', // 96px - safely below navbar (88px) + 8px spacing
            right: '1.5rem',
            left: 'auto',
            zIndex: 9999,
            maxWidth: '400px',
            width: 'auto',
            backgroundColor: isSuccess ? '#dcfce7' : '#fef2f2',
            border: `1px solid ${isSuccess ? '#16a34a' : '#dc2626'}`,
            color: isSuccess ? '#166534' : '#991b1b',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            animation: 'slideIn 0.3s ease-out',
            // Mobile responsive
            '@media (max-width: 640px)': {
                left: '1rem',
                right: '1rem',
                maxWidth: 'none'
            }
        },
        icon: {
            flexShrink: 0
        },
        message: {
            flex: 1,
            lineHeight: '1.5'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            flexShrink: 0
        }
    };

    // Apply responsive styles for mobile
    const containerStyle = window.innerWidth <= 640
        ? { ...styles.container, left: '1rem', right: '1rem', maxWidth: 'none' }
        : styles.container;

    return (
        <>
            <div style={containerStyle}>
                <div style={styles.icon}>
                    {isSuccess ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <span style={styles.message}>{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={styles.closeButton}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        aria-label="Close notification"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 640px) {
                    @keyframes slideIn {
                        from {
                            transform: translateY(-20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                }
            `}</style>
        </>
    );
};

export default Toast;
