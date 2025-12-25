import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const styles = {
        header: {
            textAlign: 'center',
            marginBottom: '2rem',
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
            gap: '1rem',
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
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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

        // Patient registration not implemented
        alert('Patient registration coming soon. Contact clinic directly.');
        setIsLoading(false);
    };

    return (
        <>
            <div style={styles.header}>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Join us for a better dental experience</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
                <Input
                    label="Full Name"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    placeholder="John Doe"
                    fullWidth
                    autoComplete="name"
                />

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

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    fullWidth
                    autoComplete="new-password"
                    helperText="Must be at least 6 characters"
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                    fullWidth
                    autoComplete="new-password"
                />

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    size="large"
                    style={{ marginTop: '0.75rem', boxShadow: 'var(--shadow-lg)' }}
                >
                    {isLoading ? 'Creating Account...' : 'Register'}
                </Button>
            </form>

            <div style={styles.footer}>
                Already have an account?
                <Link to="/login" style={styles.link}>
                    Sign in
                </Link>
            </div>
        </>
    );
};

export default Register;
