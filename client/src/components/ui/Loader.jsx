import React from 'react';

const Loader = ({ size = 'medium', color = 'primary', className = '' }) => {
    const sizes = {
        small: '1rem',
        medium: '2rem',
        large: '3rem',
    };

    const colors = {
        primary: 'var(--color-primary)',
        white: 'var(--color-white)',
        secondary: 'var(--color-secondary)',
    };

    const spinnerStyle = {
        width: sizes[size],
        height: sizes[size],
        border: `3px solid rgba(0,0,0,0.1)`,
        borderLeftColor: colors[color],
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    return (
        <div className={className} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={spinnerStyle} role="status" aria-label="Loading"></div>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Loader;
