import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ClinicGalleryCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const clinicImages = [
        {
            src: '/images/clinic/reception.jpg',
            alt: 'Modern reception area with elegant wooden desk and welcoming ambiance',
            title: 'Reception Area'
        },
        {
            src: '/images/clinic/treatment-room.jpg',
            alt: 'State-of-the-art dental treatment room with advanced equipment',
            title: 'Treatment Room'
        },
        {
            src: '/images/clinic/waiting-area.jpg',
            alt: 'Comfortable waiting lounge with warm lighting and relaxing seating',
            title: 'Waiting Lounge'
        }
    ];

    // Auto-play carousel
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            goToNext();
        }, 4000);

        return () => clearInterval(interval);
    }, [isHovered]);

    const goToSlide = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + clinicImages.length) % clinicImages.length);
    }, [clinicImages.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % clinicImages.length);
    }, [clinicImages.length]);

    // Touch handlers
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext]);

    // Get image at offset position with circular wrapping
    const getWrappedImage = (offset) => {
        const index = (currentIndex + offset + clinicImages.length) % clinicImages.length;
        return clinicImages[index];
    };

    const styles = {
        section: {
            padding: 'clamp(3rem, 8vw, 5rem) 0',
            backgroundColor: 'var(--color-bg-subtle)',
            position: 'relative',
            overflow: 'hidden',
        },
        header: {
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
        },
        badge: {
            color: 'var(--color-primary)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            display: 'block',
        },
        title: {
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '800',
            color: 'var(--color-secondary)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
        },
        subtitle: {
            fontSize: '1.125rem',
            color: 'var(--color-text-light)',
            maxWidth: '500px',
            margin: '0 auto',
        },
        carouselWrapper: {
            maxWidth: '1100px',
            margin: '0 auto',
            position: 'relative',
        },
        sliderContainer: {
            position: 'relative',
            height: 'clamp(300px, 60vw, 450px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
        },
        imageCard: {
            position: 'absolute',
            width: 'clamp(280px, 70vw, 550px)',
            height: 'clamp(250px, 55vw, 400px)',
            borderRadius: 'clamp(12px, 2vw, 16px)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
        },
        navButton: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'clamp(40px, 6vw, 50px)',
            height: 'clamp(40px, 6vw, 50px)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-secondary)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            padding: 0,
        },
        navButtonLeft: {
            left: 'clamp(-20px, -5vw, -70px)',
        },
        navButtonRight: {
            right: 'clamp(-20px, -5vw, -70px)',
        },
    };

    return (
        <section style={styles.section} aria-label="Clinic Environment Gallery">
            <div className="container">
                <div style={styles.header}>
                    <span style={styles.badge}>Premium Care Space</span>
                    <h2 style={styles.title}>Our Clinic Environment</h2>
                    <p style={styles.subtitle}>
                        A calm, hygienic and modern dental care space
                    </p>
                </div>

                <div
                    style={styles.carouselWrapper}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    role="region"
                    aria-label="Clinic photos carousel"
                >
                    {/* Slider Container */}
                    <div style={styles.sliderContainer}>
                        {clinicImages.map((image, imageIndex) => {
                            // Calculate position relative to current index
                            let position = imageIndex - currentIndex;

                            // Wrap around for circular effect
                            if (position > 1) position -= clinicImages.length;
                            if (position < -1) position += clinicImages.length;

                            // Calculate styles based on position
                            const isCenter = position === 0;
                            const isLeft = position === -1;
                            const isRight = position === 1;
                            const isVisible = isLeft || isCenter || isRight;

                            if (!isVisible) return null;

                            const positionStyles = isCenter ? {
                                transform: 'translateX(0) scale(1)',
                                opacity: 1,
                                filter: 'blur(0px) brightness(1.05)',
                                boxShadow: '0 0 60px rgba(12, 164, 181, 0.6), 0 0 40px rgba(12, 164, 181, 0.4), 0 0 100px rgba(12, 164, 181, 0.2), 0 25px 50px rgba(0, 0, 0, 0.15)',
                                zIndex: 3,
                            } : {
                                transform: `translateX(${position * 58}%) scale(0.85)`,
                                opacity: 0.6,
                                filter: 'blur(2px)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                zIndex: 1,
                            };

                            return (
                                <div
                                    key={imageIndex}
                                    style={{
                                        ...styles.imageCard,
                                        ...positionStyles,
                                    }}
                                    onClick={() => {
                                        if (isLeft) goToPrevious();
                                        else if (isRight) goToNext();
                                    }}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        loading={isCenter ? 'eager' : 'lazy'}
                                        style={styles.image}
                                    />
                                </div>
                            );
                        })}

                        {/* Navigation Arrows */}
                        <button
                            onClick={goToPrevious}
                            style={{ ...styles.navButton, ...styles.navButtonLeft }}
                            aria-label="Previous image"
                            className="hover-scale"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={goToNext}
                            style={{ ...styles.navButton, ...styles.navButtonRight }}
                            aria-label="Next image"
                            className="hover-scale"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Pagination Dots */}

                </div>
            </div>
        </section >
    );
};

export default ClinicGalleryCarousel;
