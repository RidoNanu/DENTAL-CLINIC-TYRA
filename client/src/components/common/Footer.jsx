import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Instagram, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
    const footerStyles = {
        wrapper: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            padding: '4rem 0 2rem',
            marginTop: 'auto',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
        },
        heading: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: 'var(--color-primary)',
        },
        text: {
            color: '#94a3b8',
            marginBottom: '0.5rem',
            lineHeight: '1.6',
        },
        link: {
            display: 'block',
            color: '#94a3b8',
            marginBottom: '0.75rem',
            transition: 'color 0.2s',
        },
        bottom: {
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            color: '#64748b',
        }
    };

    return (
        <footer style={footerStyles.wrapper}>
            <div className="container">
                <div style={footerStyles.grid}>
                    {/* Clinic Info */}
                    <div>
                        <h3 style={footerStyles.heading}>TYRA DENTISTREE</h3>
                        <p style={footerStyles.text}>
                            A Multispeciality Dental Clinic. Providing top-quality care with a gentle touch.
                            Our experienced team uses modern technology to ensure your customized treatment plan.
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                            <a href="https://www.instagram.com/tyra_dentistree" target="_blank" rel="noopener noreferrer" style={{ ...footerStyles.link, color: '#E1306C', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Instagram size={18} /> Follow us on Instagram
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={footerStyles.heading}>Quick Links</h3>
                        <Link to="/services" style={footerStyles.link}>Our Services</Link>
                        <Link to="/about" style={footerStyles.link}>About Us</Link>
                        <Link to="/doctors" style={footerStyles.link}>Meet Our Doctors</Link>
                        <Link to="/book-appointment" style={footerStyles.link}>Request Appointment</Link>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 style={footerStyles.heading}>Contact Us</h3>
                        <a href="https://share.google/FoIH3ypE8GKIGVz3g" target="_blank" rel="noopener noreferrer" style={{ ...footerStyles.text, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <MapPin size={18} /> View Location on Google Maps
                        </a>
                        <p style={{ ...footerStyles.text, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={18} /> +91 70059 06657</p>
                        <a href="mailto:tyradentistree@gmail.com" style={{ ...footerStyles.text, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}><Mail size={18} /> tyradentistree@gmail.com</a>
                        <p style={{ ...footerStyles.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> Mon - Sat: 9:00 AM - 7:00 PM</p>
                        <div style={{ marginTop: '1rem' }}>
                            <a href="https://wa.me/917005906657" target="_blank" rel="noopener noreferrer" style={{ ...footerStyles.link, color: '#25D366', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaWhatsapp size={18} /> Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <div style={footerStyles.bottom}>
                    <p>&copy; {new Date().getFullYear()} TYRA DENTISTREE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
