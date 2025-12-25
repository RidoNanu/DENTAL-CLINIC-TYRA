import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect for glassmorphism intensity
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'About', path: '/about' },
    ];

    const navStyles = {
        header: {
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
        },
        nav: {
            height: '80px',
        },
        logo: {
            fontSize: '1.5rem',
            fontWeight: '800', // Extra bold for premium feel
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            letterSpacing: '-0.02em',
        },
        link: {
            fontWeight: '500',
            color: 'var(--color-text)',
            transition: 'color var(--transition-fast)',
            fontSize: '0.95rem',
            padding: '0.5rem',
        },
        activeLink: {
            color: 'var(--color-primary)',
            fontWeight: '600',
        }
    };

    return (
        <header style={navStyles.header}>
            <div className="container" style={{ height: '100%' }}>
                <nav className="flex items-center justify-between" style={navStyles.nav}>
                    {/* Logo */}
                    <Link to="/" style={navStyles.logo}>
                        <span style={{ color: 'var(--color-primary)' }}>TYRA</span> DENTISTREE
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center" style={{ gap: '2.5rem' }}>
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                style={{
                                    ...navStyles.link,
                                    ...(location.pathname === link.path ? navStyles.activeLink : {})
                                }}
                                onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseOut={(e) => e.target.style.color = location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text)'}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/book-appointment"
                            style={{
                                ...navStyles.link,
                                ...(location.pathname === '/book-appointment' ? navStyles.activeLink : {})
                            }}
                            onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
                            onMouseOut={(e) => e.target.style.color = location.pathname === '/book-appointment' ? 'var(--color-primary)' : 'var(--color-text)'}
                        >
                            Request Appointment
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-secondary)' }}
                    >
                        {isOpen ? '✕' : '☰'}
                    </button>
                </nav>

                {/* Mobile Dropdown */}
                {isOpen && (
                    <div className="md:hidden animate-fade-in" style={{
                        position: 'absolute',
                        top: '80px',
                        left: 0,
                        right: 0,
                        padding: '1.5rem',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                        <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    style={{ ...navStyles.link, display: 'block', padding: '0.75rem 0', borderBottom: '1px solid var(--color-bg-light)' }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link
                                    to="/book-appointment"
                                    onClick={() => setIsOpen(false)}
                                    style={{ ...navStyles.link, display: 'block', padding: '0.75rem 0', borderBottom: '1px solid var(--color-bg-light)' }}
                                >
                                    Request Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
