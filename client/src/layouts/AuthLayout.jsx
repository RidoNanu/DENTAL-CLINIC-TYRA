import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
            {/* LEFT SIDE: Form & Content */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: 'var(--color-bg-light)', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
                {/* Logo Area */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/" className="flex items-center" style={{ gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
                        <span style={{ color: 'var(--color-primary)' }}>TYRA</span> DENTISTREE
                    </Link>
                </div>

                {/* Form Wrapper */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: '480px', margin: '0 auto' }} className="animate-slide-up">
                    <Outlet />

                    {/* Copyright Footer */}
                    <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                        &copy; {new Date().getFullYear()} TYRA DENTISTREE. All rights reserved.
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Feature Image (Desktop Only) */}
            <div className="hidden lg:block" style={{ flex: '1.25', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-secondary)' }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(/assets/hero-dentist.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.9
                }} />

                {/* Overlay Gradient */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }} />

                {/* Testimonial / Brand Content */}
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', right: '10%', color: 'white' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐⭐⭐⭐⭐</div>
                        <p style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            "The most seamless dental experience I've ever had. Booking was instant and the care was world-class."
                        </p>
                        <div className="flex items-center" style={{ gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff' }} />
                            <div>
                                <div style={{ fontWeight: '700' }}>Sarah Johnson</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Patient since 2021</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
