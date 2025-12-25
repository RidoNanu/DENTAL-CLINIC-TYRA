import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '500px'
}) => {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out',
        },
        container: {
            backgroundColor: 'var(--color-white)',
            width: '100%',
            maxWidth: maxWidth,
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        header: {
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        title: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--color-secondary)',
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-light)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1,
        },
        content: {
            padding: '1.5rem',
            overflowY: 'auto',
        },
        footer: {
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: 'var(--color-bg-light)',
            borderBottomLeftRadius: '1rem',
            borderBottomRightRadius: '1rem',
        }
    };

    return createPortal(
        <div
            style={styles.overlay}
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div style={styles.container} role="dialog" aria-modal="true">
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <button
                        style={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div style={styles.content}>
                    {children}
                </div>

                {footer && (
                    <div style={styles.footer}>
                        {footer}
                    </div>
                )}
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>,
        document.body
    );
};

export default Modal;
