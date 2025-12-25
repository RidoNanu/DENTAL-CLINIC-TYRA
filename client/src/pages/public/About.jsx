import React, { useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Camera, FlaskConical, ShieldCheck, Armchair } from 'lucide-react';
import BackgroundGradient from '../../components/common/BackgroundGradient';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const styles = {
        hero: {
            padding: '6rem 0 4rem',
            background: 'linear-gradient(135deg, var(--color-bg-light) 0%, #fff 100%)',
            textAlign: 'center',
        },
        title: {
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--color-secondary)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
        },
        subtitle: {
            fontSize: '1.25rem',
            color: 'var(--color-text-light)',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: '1.7',
        },
        section: {
            padding: '6rem 0',
        },
        heading: {
            fontSize: '2.25rem',
            fontWeight: '700',
            color: 'var(--color-secondary)',
            marginBottom: '1.5rem',
        },
        paragraph: {
            color: 'var(--color-text)',
            lineHeight: '1.8',
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
        },
        statCard: {
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--color-white)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
        },
        statNumber: {
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--color-primary)',
            lineHeight: 1,
            marginBottom: '0.5rem',
        },
        statLabel: {
            color: 'var(--color-text-light)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.875rem',
        }
    };

    return (
        <>
            <BackgroundGradient variant="blue" pattern="diagonal" />
            {/* Header */}
            <section style={styles.hero}>
                <div className="container animate-slide-up">
                    <span style={{ color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Our Legacy</span>
                    <h1 style={styles.title}>About TYRA DENTISTREE</h1>
                    <p style={styles.subtitle}>
                        Founded on the belief that everyone deserves a healthy smile, we have been serving our community with integrity, care, and compassion.
                    </p>
                </div>
            </section>

            {/* Story & Mission */}
            <section style={styles.section}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={styles.heading}>Our Story</h2>
                            <p style={styles.paragraph}>
                                TYRA DENTISTREE was established with a clear vision: to provide quality dental care that prioritizes patient comfort above all else.
                                By combining modern technology with a warm, welcoming environment, we strive to be a trusted partner in your oral health journey.
                            </p>
                            <p style={styles.paragraph}>
                                We believe that visiting the dentist shouldn't be anxiety-inducing. From our waiting rooms to our treatment chairs, every detail is designed
                                to make you feel at ease.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <ShieldCheck size={28} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-secondary)' }}>Clean & Hygienic</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Camera size={28} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-secondary)' }}>Modern Equipment</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Armchair size={28} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-secondary)' }}>Patient-Centered</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '6rem' }}>
                        <div className="text-center">
                            <h2 style={styles.heading}>Core Values</h2>
                            <p style={{ ...styles.paragraph, maxWidth: '600px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
                                These principles guide every decision we make and every interaction we have.
                            </p>
                        </div>
                        <div style={styles.grid}>
                            {[
                                { title: 'Compassion', text: 'We treat every patient like family, ensuring your comfort is our top priority.' },
                                { title: 'Continuous Improvement', text: 'We never stop learning. Our team stays current with ongoing education and training.' },
                                { title: 'Integrity', text: 'Transparent pricing and honest treatment plans. No hidden fees, ever.' }
                            ].map((val, i) => (
                                <Card key={i} hoverEffect style={{ padding: '2.5rem' }}>
                                    <div style={{ width: '50px', height: '4px', background: 'var(--color-primary)', marginBottom: '1.5rem', borderRadius: '2px' }}></div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)', fontWeight: '700' }}>{val.title}</h3>
                                    <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>{val.text}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities & Tech */}
            <section style={{ ...styles.section, backgroundColor: 'var(--color-bg-subtle)' }}>
                <div className="container">
                    <div className="text-center mb-12">
                        <span style={{ color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Infrastructure</span>
                        <h2 style={styles.heading}>Modern Facilities</h2>
                        <p style={{ ...styles.paragraph, maxWidth: '700px', margin: '0 auto' }}>
                            Equipped with current dental technology to ensure accurate diagnoses and effective treatments.
                        </p>
                    </div>

                    <div style={styles.grid}>
                        {[
                            { title: 'Digital Imaging', desc: 'Digital X-rays for safer and more accurate diagnostics.', icon: <Camera size={40} /> },
                            { title: 'Clean Facilities', desc: 'Maintained to high standards of cleanliness and hygiene.', icon: <ShieldCheck size={40} /> },
                            { title: 'Comfortable Environment', desc: 'Welcoming waiting area and treatment rooms designed for your comfort.', icon: <Armchair size={40} /> }
                        ].map((item, i) => (
                            <Card key={i} className="hover-lift">
                                <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>{item.title}</h3>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '1rem', lineHeight: '1.6' }}>{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;
