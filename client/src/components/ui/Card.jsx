import React from 'react';

const Card = ({ children, className = '', padding, hoverEffect = false, style = {}, ...props }) => {
    // Determine responsive padding
    const getPadding = () => {
        if (padding) return padding; // Use explicit padding if provided

        // Default responsive padding
        // Will be overridden by CSS media queries for optimal performance
        return '1rem'; // Mobile default
    };

    const styles = {
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        padding: getPadding(),
        transition: 'all var(--transition-normal)',
        height: '100%', // Ensure full height in grids
        display: 'flex',
        flexDirection: 'column',
        ...style
    };

    const handleMouseEnter = (e) => {
        if (hoverEffect) {
            e.currentTarget.style.transform = 'translateY(-6px)'; // Significant premium lift
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            e.currentTarget.style.borderColor = 'var(--color-primary-light)'; // Subtle border tint
        }
    };

    const handleMouseLeave = (e) => {
        if (hoverEffect) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
        }
    };

    return (
        <div
            className={`responsive-card ${className}`}
            style={styles}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
