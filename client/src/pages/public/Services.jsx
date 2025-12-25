import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Sparkles, Gem, Activity, Hammer, Smile, Baby, Phone, Heart, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BackgroundGradient from '../../components/common/BackgroundGradient';
import { getPublicServices } from '../../services/serviceService';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await getPublicServices();
            setServices(data || []);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    // Icon mapping for services
    const getServiceIcon = (index) => {
        const icons = [Stethoscope, Activity, Smile, Hammer, Baby, Gem, Heart, Users, Sparkles, Phone];
        const IconComponent = icons[index % icons.length];
        return <IconComponent size={32} />;
    };

    const styles = {
        hero: {
            padding: 'clamp(3rem, 8vw, 6rem) 0 clamp(2rem, 5vw, 4rem)',
            background: 'linear-gradient(180deg, var(--color-bg-subtle) 0%, var(--color-white) 100%)',
            textAlign: 'center',
            marginBottom: '2rem',
        },
        title: {
            fontSize: 'clamp(2rem, 6vw, 3rem)', // Responsive: 32px → 48px
            fontWeight: '800',
            color: 'var(--color-secondary)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
        },
        subtitle: {
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', // Responsive: 16px → 20px
            color: 'var(--color-text-light)',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.7',
            padding: '0 1rem', // Add padding to prevent edge touching
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Better mobile support
            gap: 'clamp(1.5rem, 3vw, 2.5rem)', // Responsive gap
            paddingBottom: 'clamp(3rem, 8vw, 6rem)',
        },
        cardContent: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
            flexWrap: 'wrap', // Allow wrapping on very small screens
        },
        icon: {
            width: 'clamp(50px, 10vw, 60px)', // Responsive icon size
            height: 'clamp(50px, 10vw, 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: '12px',
            color: 'var(--color-primary)',
            flexShrink: 0, // Prevent icon from shrinking
        },
        cardTitle: {
            fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', // Responsive title
            fontWeight: '700',
            color: 'var(--color-secondary)',
        },
        description: {
            color: 'var(--color-text)',
            marginBottom: '2rem',
            flex: 1,
            lineHeight: '1.6',
            fontSize: 'clamp(0.95rem, 2vw, 1rem)', // Responsive description
        },
    };

    if (loading) {
        return (
            <>
                <BackgroundGradient variant="teal" pattern="bubbles" />
                <section style={styles.hero}>
                    <div className="container">
                        <div className="animate-slide-up">
                            <span style={{ color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Quality Service</span>
                            <h1 style={styles.title}>Our Services</h1>
                            <p style={styles.subtitle}>
                                We provide a comprehensive range of dental treatments using state-of-the-art technology.
                                Each procedure is tailored to your unique needs for optimal results.
                            </p>
                        </div>
                    </div>
                </section>
                <section className="container" style={{ ...styles.grid, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--color-text-light)' }}>Loading services...</p>
                </section>
            </>
        );
    }

    return (
        <>
            <BackgroundGradient variant="teal" pattern="bubbles" />
            <section style={styles.hero}>
                <div className="container">
                    <div className="animate-slide-up">
                        <span style={{ color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Quality Service</span>
                        <h1 style={styles.title}>Our Services</h1>
                        <p style={styles.subtitle}>
                            We provide a comprehensive range of dental treatments using state-of-the-art technology.
                            Each procedure is tailored to your unique needs for optimal results.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container" style={styles.grid}>
                {services.length > 0 ? (
                    services.map((service, index) => (
                        <Card key={service.id} hoverEffect className="hover-lift animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <div style={styles.cardContent}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.icon}>{getServiceIcon(index)}</div>
                                    <div style={styles.cardTitle}>{service.name}</div>
                                </div>

                                <p style={styles.description}>{service.description}</p>

                                <Link to="/book-appointment" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                                    <Button fullWidth variant="outline" className="group">
                                        Book Now
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-light)' }}>
                        <p>No services currently available.</p>
                    </div>
                )}
            </section>
        </>
    );
};

export default Services;
