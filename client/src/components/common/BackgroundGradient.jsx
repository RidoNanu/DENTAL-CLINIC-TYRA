import React from 'react';

const BackgroundGradient = ({ variant = 'default', pattern = 'waves' }) => {
    // Different gradient variants for variety across pages
    const gradients = {
        default: {
            primary: 'rgba(14, 165, 233, 0.05)',
            secondary: 'rgba(6, 182, 212, 0.08)',
            accent: 'rgba(14, 165, 233, 0.04)',
        },
        teal: {
            primary: 'rgba(6, 182, 212, 0.06)',
            secondary: 'rgba(20, 184, 166, 0.08)',
            accent: 'rgba(6, 182, 212, 0.04)',
        },
        blue: {
            primary: 'rgba(59, 130, 246, 0.05)',
            secondary: 'rgba(14, 165, 233, 0.07)',
            accent: 'rgba(59, 130, 246, 0.03)',
        }
    };

    const colors = gradients[variant] || gradients.default;

    // Pattern: Waves (Home page)
    const WavesPattern = () => (
        <>
            {/* Top Wave */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '120%',
                height: '60%',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                borderRadius: '0 0 50% 50%',
                transform: 'rotate(-5deg)',
            }} />

            {/* Bottom Wave */}
            <div style={{
                position: 'absolute',
                bottom: '-15%',
                right: '-10%',
                width: '110%',
                height: '50%',
                background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                borderRadius: '50% 50% 0 0',
                transform: 'rotate(3deg)',
            }} />
        </>
    );

    // Pattern: Bubbles/Circles (Services page)
    const BubblesPattern = () => (
        <>
            {/* Large Circle - Top Right */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '5%',
                width: '500px',
                height: '500px',
                background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
                borderRadius: '50%',
            }} />

            {/* Medium Circle - Middle Left */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '-10%',
                width: '400px',
                height: '400px',
                background: `radial-gradient(circle, ${colors.primary} 0%, transparent 65%)`,
                borderRadius: '50%',
            }} />

            {/* Large Circle - Bottom */}
            <div style={{
                position: 'absolute',
                bottom: '-25%',
                right: '20%',
                width: '600px',
                height: '600px',
                background: `radial-gradient(circle, ${colors.accent} 0%, transparent 75%)`,
                borderRadius: '50%',
            }} />

            {/* Small Accent Circle */}
            <div style={{
                position: 'absolute',
                top: '60%',
                right: '10%',
                width: '250px',
                height: '250px',
                background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 60%)`,
                borderRadius: '50%',
            }} />
        </>
    );

    // Pattern: Diagonal Shapes (About page)
    const DiagonalPattern = () => (
        <>
            {/* Diagonal stripe - Top */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '150%',
                height: '40%',
                background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.secondary} 50%, transparent 100%)`,
                transform: 'rotate(-15deg)',
            }} />

            {/* Diagonal stripe - Bottom */}
            <div style={{
                position: 'absolute',
                bottom: '-25%',
                right: '-25%',
                width: '140%',
                height: '45%',
                background: `linear-gradient(-60deg, transparent 0%, ${colors.primary} 40%, ${colors.secondary} 100%)`,
                transform: 'rotate(12deg)',
            }} />

            {/* Accent shape */}
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: `radial-gradient(ellipse, ${colors.accent} 0%, transparent 70%)`,
                borderRadius: '40% 60% 50% 50%',
                transform: 'rotate(25deg)',
            }} />
        </>
    );

    // Pattern: Curved Organic (Book Appointment page)
    const CurvedPattern = () => (
        <>
            {/* Organic blob - Top Left */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-15%',
                width: '60%',
                height: '50%',
                background: `radial-gradient(ellipse at top left, ${colors.secondary} 0%, ${colors.primary} 50%, transparent 100%)`,
                borderRadius: '40% 60% 70% 30%',
            }} />

            {/* Organic blob - Bottom Right */}
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '55%',
                height: '55%',
                background: `radial-gradient(ellipse at bottom right, ${colors.primary} 0%, ${colors.accent} 60%, transparent 100%)`,
                borderRadius: '60% 40% 30% 70%',
            }} />

            {/* Small accent blob */}
            <div style={{
                position: 'absolute',
                top: '50%',
                right: '15%',
                width: '250px',
                height: '200px',
                background: `radial-gradient(ellipse, ${colors.accent} 0%, transparent 70%)`,
                borderRadius: '30% 70% 70% 30%',
                transform: 'rotate(-20deg)',
            }} />
        </>
    );

    const patterns = {
        waves: WavesPattern,
        bubbles: BubblesPattern,
        diagonal: DiagonalPattern,
        curved: CurvedPattern,
    };

    const PatternComponent = patterns[pattern] || WavesPattern;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none'
        }}>
            <PatternComponent />
        </div>
    );
};

export default BackgroundGradient;
