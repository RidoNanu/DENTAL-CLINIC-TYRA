import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login: authLogin, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await authLogin(email, password);

        if (result.success) {
            navigate('/admin/dashboard', { replace: true });
        } else {
            setError(result.message || 'Login failed. Please try again.');
        }

        setIsLoading(false);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'white',
        },
        imageSection: {
            flex: 1,
            backgroundImage: "url('/login-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'none', // Hidden on mobile by default
        },
        imageOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8))', // Darker gradient
        },
        formSection: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem, 3vw, 2rem)', // Responsive padding
            backgroundColor: 'white',
        },
        formContainer: {
            width: '100%',
            maxWidth: '420px',
        },
        header: {
            textAlign: 'left',
            marginBottom: '3rem'
        },
        logoContainer: {
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.025em',
            marginBottom: '0.5rem'
        },
        subtitle: {
            color: '#64748b',
            fontSize: '1rem',
        },
        // Revised Input Styles
        inputGroup: {
            marginBottom: '1.5rem',
            width: '100%'
        },
        label: {
            display: 'block',
            marginBottom: '0.625rem',
            fontWeight: '600',
            color: '#334155',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        inputWrapper: {
            position: 'relative',
            width: '100%',
        },
        inputIcon: {
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none', // Allows clicking through to input
            zIndex: 10,
        },
        errorAlert: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
        },
        errorIcon: {
            color: '#dc2626',
            flexShrink: 0,
            marginTop: '0.125rem',
        },
        errorText: {
            color: '#991b1b',
            fontSize: '0.875rem',
            fontWeight: '500',
        },
        // We will move input styles to a CSS class for better pseudo-selector support
    };

    return (
        <div style={styles.container}>
            <style>
                {`
                    @media (min-width: 1024px) {
                        .split-image-section { display: block !important; }
                    }
                    
                    /* Custom Input Styling to override defaults and handle placeholders */
                    .admin-input {
                        width: 100%;
                        padding: 1rem 1rem 1rem 3.5rem;
                        border-radius: 0.75rem;
                        border: 1px solid #e2e8f0;
                        font-size: 1rem;
                        background-color: #f8fafc;
                        outline: none;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-sizing: border-box;
                        -webkit-appearance: none;
                        appearance: none;
                        height: 3.5rem; /* Explicit height */
                        color: #0f172a;
                    }
                    
                    .admin-input:focus {
                        border-color: #0ca4b5;
                        background-color: white;
                        /* "Neon Tube" Style: High opacity glow that visually merges with the border */
                        box-shadow: 0 0 10px rgba(12, 164, 181, 0.75); 
                        outline: none;
                    }
                    
                    .admin-input::placeholder {
                        color: #94a3b8;
                        font-weight: 500;
                    }

                    /* Autofill Style Fix */
                    .admin-input:-webkit-autofill,
                    .admin-input:-webkit-autofill:hover, 
                    .admin-input:-webkit-autofill:focus, 
                    .admin-input:-webkit-autofill:active {
                        -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
                        -webkit-text-fill-color: #0f172a !important;
                        transition: background-color 5000s ease-in-out 0s;
                    }
                    
                    .admin-input:focus:-webkit-autofill {
                         -webkit-box-shadow: 0 0 0 30px white inset !important;
                    }
                `}
            </style>

            {/* Same image section structure */}
            <div style={styles.imageSection} className="split-image-section">
                <div style={styles.imageOverlay}>
                    <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', color: '#ffffff', zIndex: 20, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#ffffff' }}>TYRA DENTISTREE.</h2>
                        <p style={{ fontSize: '1.25rem', opacity: 1, maxWidth: '440px', color: '#e2e8f0', fontWeight: '500' }}>
                            A Multispeciality Dental Clinic Management System.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div style={styles.formSection}>
                <div style={styles.formContainer} className="animate-fade-in">
                    <div style={styles.header}>
                        <div style={styles.logoContainer}>
                            <ShieldCheck size={28} />
                        </div>
                        <h1 style={styles.title}>Welcome back</h1>
                        <p style={styles.subtitle}>Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {/* Error Alert */}
                        {error && (
                            <div style={styles.errorAlert}>
                                <AlertCircle size={20} style={styles.errorIcon} />
                                <p style={styles.errorText}>{error}</p>
                            </div>
                        )}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={20} style={styles.inputIcon} />
                                <input
                                    type="email"
                                    className="admin-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@tyradentistree.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={20} style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    style={{ paddingRight: '3.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s',
                                        zIndex: 10
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="login-remember-section" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '1rem', height: '1rem', borderRadius: '4px', accentColor: 'var(--color-primary)' }}
                                    disabled={isLoading}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Remember me</span>
                            </label>
                        </div>

                        <Button
                            fullWidth
                            isLoading={isLoading}
                            size="large"
                            style={{
                                borderRadius: '0.75rem',
                                height: '3.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)'
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Protected System • Authorized Personnel Only
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
