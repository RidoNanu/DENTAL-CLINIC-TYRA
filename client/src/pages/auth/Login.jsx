import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const styles = {
        header: {
            textAlign: 'center',
            marginBottom: '2.5rem',
        },
        title: {
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-secondary)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.01em',
        },
        subtitle: {
            color: 'var(--color-text-light)',
            fontSize: '0.95rem',
            lineHeight: '1.5',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
        },
        footer: {
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: 'var(--color-text-light)',
        },
        link: {
            color: 'var(--color-primary)',
            fontWeight: '600',
            textDecoration: 'none',
            marginLeft: '0.35rem',
            transition: 'color var(--transition-fast)',
        },
        forgotPassword: {
            textAlign: 'right',
            fontSize: '0.875rem',
            color: 'var(--color-text-light)',
            textDecoration: 'none',
            marginTop: '-0.5rem',
            marginBottom: '0.5rem',
            display: 'inline-block',
            fontWeight: '500',
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        // Patient authentication not implemented
        // Redirect to admin login for now
        alert('Patient portal login coming soon. Please use Admin Login.');
        setIsLoading(false);
    };

    return (
        <>
            <div style={styles.header}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="name@example.com"
                    fullWidth
                    autoComplete="email"
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="••••••••"
                        fullWidth
                        autoComplete="current-password"
                    />
                    <Link to="/forgot-password" style={styles.forgotPassword} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-text-light)'}>
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    size="large"
                    style={{ marginTop: '0.5rem', boxShadow: 'var(--shadow-lg)' }}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div style={styles.footer}>
                Don't have an account?
                <Link to="/register" style={styles.link} className="hover:text-primary-dark">
                    Sign up
                </Link>
            </div>
        </>
    );
};

export default Login;
