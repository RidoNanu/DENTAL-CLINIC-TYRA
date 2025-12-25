import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, ShieldCheck, Star, Heart, Sparkles, Smile, Wrench, Quote, User, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BackgroundGradient from '../../components/common/BackgroundGradient';
import ClinicGalleryCarousel from '../../components/common/ClinicGalleryCarousel';

const Home = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const styles = {
        hero: {
            padding: '4rem 0 10rem', // Extra padding bottom for wave
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            position: 'relative',
            overflow: 'hidden',
        },
        heroWave: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            lineHeight: 0,
            zIndex: 1,
        },
        heading: {
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', // Responsive font size
            fontWeight: '800',
            color: 'var(--color-secondary)',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
        },
        highlight: {
            color: 'var(--color-primary)',
        },
        subtext: {
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', // Responsive font size
            color: 'var(--color-text-light)',
            marginBottom: '2.5rem',
            lineHeight: '1.7',
            maxWidth: '540px',
        },
        section: {
            padding: 'clamp(3rem, 10vw, 7rem) 0', // Responsive section padding
        },
        sectionHeader: {
            textAlign: 'center',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem auto',
        },
        tagline: {
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            fontSize: '0.875rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            display: 'block',
        },
        sectionTitle: {
            fontSize: 'clamp(2rem, 5vw, 2.75rem)', // Responsive title
            fontWeight: '700',
            color: 'var(--color-secondary)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
        },
        sectionDesc: {
            color: 'var(--color-text-light)',
            fontSize: 'clamp(1rem, 2vw, 1.125rem)', // Responsive description
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
        },
        whyUs: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            padding: 'clamp(3rem, 10vw, 7rem) 0',
            position: 'relative',
        },
    };

    const services = [
        { title: 'General Dentistry', desc: 'Routine checkups, cleanings, and preventative care for long-term health.', icon: <ShieldCheck size={48} /> },
        { title: 'Cosmetic Dentistry', desc: 'Whitening, veneers, and smile makeovers to boost your confidence.', icon: <Sparkles size={48} /> },
        { title: 'Orthodontics', desc: 'Invisalign and traditional braces for patients of all ages.', icon: <Smile size={48} /> },
        { title: 'Oral Surgery', desc: 'Expert care for extractions, implants, and complex procedures.', icon: <Wrench size={48} /> },
    ];

    const testimonials = [
        { name: 'John D.', text: "Best dental experience I've ever had. Painless and professional." },
        { name: 'Maria G.', text: "The team is so friendly! My kids actually look forward to their visits." },
        { name: 'Robert K.', text: "State of the art technology. I was impressed by their attention to detail." },
    ];

    return (
        <>
            <BackgroundGradient variant="default" pattern="waves" />
            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-layout" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '3rem',
                        alignItems: 'center'
                    }}>
                        {/* Text Content */}
                        <div className="flex flex-col animate-slide-up" style={{ minWidth: 0 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(12, 164, 181, 0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', width: 'fit-content', marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                                <Heart size={16} fill="currentColor" /> Family-Friendly Dental Care
                            </div>
                            <h1 style={styles.heading}>
                                Your Dental Health is <br className="md:hidden" />
                                <span style={styles.highlight}>Our Priority.</span>
                            </h1>
                            <p style={styles.subtext}>
                                Comprehensive care for you and your family. We combine advanced technology
                                with a gentle touch to bring out your best smile.
                            </p>

                            {/* CTA Buttons - Stack on mobile */}
                            <div className="cta-buttons" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                width: '100%'
                            }}>
                                <Link to="/book-appointment" style={{ width: '100%' }}>
                                    <Button size="large" style={{
                                        width: '100%',
                                        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                                        fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                                        boxShadow: '0 10px 25px -5px rgba(12, 164, 181, 0.4)'
                                    }}>
                                        Request Appointment
                                    </Button>
                                </Link>
                                <Link to="/services" style={{ width: '100%' }}>
                                    <Button variant="outline" size="large" style={{
                                        width: '100%',
                                        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                                        fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                                        background: 'white'
                                    }}>
                                        Explore Services
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats - Stack on mobile */}
                            <div className="hero-stats" style={{
                                marginTop: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                <div>
                                    <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '800', color: 'var(--color-secondary)' }}>Est. 2023</p>
                                    <p style={{ color: 'var(--color-text-light)', fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)' }}>Serving the Community</p>
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'var(--color-border)', display: 'none' }}></div>
                                <div>
                                    <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '800', color: 'var(--color-secondary)' }}>Modern</p>
                                    <p style={{ color: 'var(--color-text-light)', fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)' }}>Equipment & Techniques</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image / Illustration - Hidden on mobile */}
                        <div className="hero-image mobile-hidden" style={{
                            position: 'relative',
                            minWidth: '300px',
                            maxWidth: '600px',
                            height: '500px',
                            margin: '0 auto'
                        }}>
                            {/* Abstract Background Shape */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '110%', height: '110%', background: 'linear-gradient(135deg, #e0faff 0%, #dbeafe 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', zIndex: -1 }}></div>

                            {/* Actual Image */}
                            <img
                                src="/assets/hero-real.jpg"
                                alt="Dental team performing procedure"
                                loading="eager"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                                    boxShadow: '0 20px 40px -10px rgba(12, 164, 181, 0.3)',
                                    border: '4px solid rgba(255,255,255,0.8)'
                                }}
                            />

                            {/* Floating Badge - repositioned to not overlap */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-1rem',
                                right: '1rem',
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '1rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                zIndex: 2,
                                border: '1px solid rgba(0,0,0,0.05)'
                            }} className="animate-slide-up">
                                <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: '800', color: 'var(--color-secondary)', fontSize: '1rem' }}>Professional Care</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Modern & Hygienic</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SVG Wave */}
                <div style={styles.heroWave}>
                    <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Clinic Gallery Carousel */}
            <ClinicGalleryCarousel />

            {/* Services Preview */}
            <section style={styles.section}>
                <div className="container">
                    <div style={styles.sectionHeader} className="animate-slide-up">
                        <span style={styles.tagline}>Comprehensive Care</span>
                        <h2 style={styles.sectionTitle}>Our Services</h2>
                        <p style={styles.sectionDesc}>We provide a full range of dental treatments for you and your family.</p>
                    </div>
                    <div style={styles.grid}>
                        {services.map((s, i) => (
                            <Card key={i} hoverEffect className="hover-lift">
                                <div style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 6px rgba(12, 164, 181, 0.2))' }}>{s.icon}</div>
                                <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--color-secondary)' }}>{s.title}</h3>
                                <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>{s.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section style={styles.whyUs}>
                <div className="container">
                    <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ ...styles.tagline, color: 'var(--color-primary-light)' }}>The Difference</span>
                        <h2 style={{ ...styles.sectionTitle, color: 'var(--color-white)' }}>Why Choose Us?</h2>
                        <p style={{ ...styles.sectionDesc, color: '#94a3b8', marginBottom: '4rem', maxWidth: '600px' }}>
                            We combine clinical expertise with genuine empathy to deliver the best results.
                        </p>

                        <div style={styles.grid} className="w-full">
                            {[
                                { title: 'Caring Team', text: 'Qualified professionals dedicated to providing gentle, attentive care for all your dental needs.' },
                                { title: 'Modern Equipment', text: 'Digital X-Rays and current dental technology for accurate diagnosis and treatment.' },
                                { title: 'Comfort First', text: 'Relaxing environment with options to help you feel at ease during your visit.' }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                                    <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1rem', fontWeight: '700', color: 'var(--color-primary)' }}>{item.title}</h3>
                                    <p style={{ color: '#cbd5e1', lineHeight: '1.7' }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctor Highlight - CV Style Layout */}
            <section style={styles.section}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    {/* Two-column grid: Image | Content - Stack on mobile */}
                    <div className="doctor-profile" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: 'clamp(2rem, 5vw, 5rem)',
                        alignItems: 'center'
                    }}>
                        {/* Portrait Image */}
                        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}>
                            <div style={{ borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                                <img
                                    src="/assets/dr-tyra.jpg"
                                    alt="Dr. Tyra"
                                    loading="lazy"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>
                        </div>

                        {/* Professional Profile Content */}
                        <div className="animate-slide-up" style={{ textAlign: 'center' }}>
                            {/* Name */}
                            <h2 style={{
                                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                                fontWeight: '800',
                                color: 'var(--color-secondary)',
                                marginBottom: '0.5rem',
                                lineHeight: 1,
                                letterSpacing: '-0.02em'
                            }}>
                                Dr. Tyra
                            </h2>

                            {/* Role/Title */}
                            <p style={{
                                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                                color: 'var(--color-primary)',
                                marginBottom: '2rem',
                                fontWeight: '600',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                Clinic Owner & Lead Dentist
                            </p>

                            {/* Description */}
                            <p style={{
                                fontSize: 'clamp(0.95rem, 2vw, 1rem)',
                                color: 'var(--color-text)',
                                marginBottom: '2.5rem',
                                lineHeight: '1.7',
                                maxWidth: '600px',
                                margin: '0 auto 2.5rem auto'
                            }}>
                                At TYRA DENTISTREE, you are not just another patient — you are family. Dr. Tyra provides personalized, high-quality dental care with a focus on patient comfort and specialized treatments, ensuring every visit is a positive step towards your perfect smile.
                            </p>

                            {/* Professional Highlights */}
                            <div>
                                <div className="professional-highlights" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clean & Hygienic</div>
                                    <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient-Centered Care</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ ...styles.section, backgroundColor: 'var(--color-bg-subtle)' }}>
                <div className="container">
                    <div style={styles.sectionHeader}>
                        <span style={styles.tagline}>Testimonials</span>
                        <h2 style={styles.sectionTitle}>Patient Stories</h2>
                    </div>
                    <div style={styles.grid}>
                        {testimonials.map((t, i) => (
                            <Card key={i} style={{ border: 'none', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                                    <Quote size={32} />
                                </div>
                                <p style={{ fontStyle: 'italic', color: 'var(--color-text)', marginBottom: '1.5rem', fontSize: 'clamp(1rem, 2vw, 1.1rem)', lineHeight: '1.6' }}>{t.text}</p>
                                <div className="flex items-center" style={{ gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <User size={20} />
                                    </div>
                                    <p style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{t.name}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 0', textAlign: 'center', background: 'linear-gradient(to bottom, var(--color-white), var(--color-bg-subtle))' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>Ready for a Brighter Smile?</h2>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '3rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)', lineHeight: '1.7' }}>
                            Book your consultation today and take the first step towards perfect oral health.
                        </p>
                        <Link to="/book-appointment">
                            <Button size="large" style={{ padding: 'clamp(1rem, 2vw, 1.25rem) clamp(2rem, 4vw, 3rem)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', boxShadow: 'var(--shadow-lg)' }}>
                                Request Appointment <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Add responsive CSS in a style tag */}
            <style>{`
                @media (min-width: 768px) {
                    .hero-layout {
                        grid-template-columns: 1fr 1fr !important;
                    }
                    
                    .cta-buttons {
                        flex-direction: row !important;
                        width: auto !important;
                    }
                    
                    .cta-buttons a {
                        width: auto !important;
                    }
                    
                    .hero-stats {
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 2rem !important;
                    }
                    
                    .hero-stats > div:nth-child(2) {
                        display: block !important;
                        width: 1px !important;
                        height: 40px !important;
                    }
                    
                    .doctor-profile {
                        grid-template-columns: minmax(0, 320px) minmax(0, 1fr) !important;
                        text-align: left !important;
                    }
                    
                    .doctor-profile .animate-slide-up {
                        text-align: left !important;
                    }
                    
                    .doctor-profile .animate-slide-up p {
                        margin: 0 0 2.5rem 0 !important;
                    }
                    
                    .professional-highlights {
                        flex-direction: row !important;
                        gap: 4rem !important;
                        justify-content: flex-start !important;
                        align-items: flex-start !important;
                    }
                }
                
                @media (max-width: 767px) {
                    .hero-image {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
};

export default Home;
