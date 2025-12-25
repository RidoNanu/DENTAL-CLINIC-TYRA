import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, User, Calendar, Stethoscope, LogOut, Settings, Menu, X, ChevronDown, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const { isAuthenticated, loading, admin, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Show loading while checking auth
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading...</div>
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const styles = {
        layout: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f1f5f9',
            position: 'relative',
            overflow: 'hidden' // Prevent scroll when sidebar is open on mobile
        },
        sidebar: {
            width: '260px',
            backgroundColor: '#0f172a', // Slate 900
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease-in-out',
        },
        logo: {
            padding: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        nav: {
            padding: '1.5rem 1rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            overflowY: 'auto'
        },
        navLink: {
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        activeLink: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        main: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease-in-out',
            width: '100%',
        },
        header: {
            height: '64px',
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        },
        content: {
            padding: '2rem',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            opacity: isSidebarOpen ? 1 : 0,
            visibility: isSidebarOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease',
        }
    };

    const links = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Walk-in Appointment', path: '/admin/walk-in-booking', icon: <Calendar size={20} /> },
        { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
        { name: 'Patients', path: '/admin/patients', icon: <Users size={20} /> },
        { name: 'Admin Users', path: '/admin/admins', icon: <User size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div style={styles.layout}>
            {/* Mobile/Desktop Styles Injection - Unifying the Sidebar Drawer behavior */}
            <style>
                {`
                    /* Sidebar slide animation - smooth and premium */
                    .admin-sidebar {
                        transform: translateX(${isSidebarOpen ? '0' : '-100%'});
                        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .admin-main {
                        margin-left: 0;
                    }
                    .mobile-menu-btn {
                        display: flex;
                        margin-right: 1rem;
                    }
                    
                    /* Nav link hover - subtle feedback */
                    .nav-link-item {
                        transition: all 0.15s ease;
                    }
                    .nav-link-item:hover {
                        color: rgba(255, 255, 255, 0.95) !important;
                        background-color: rgba(255, 255, 255, 0.04);
                    }
                    
                    /* Logout Button Hover - softer red */
                    .logout-btn:hover {
                        background-color: rgba(239, 68, 68, 0.08) !important;
                        color: #f87171 !important;
                        border-color: rgba(239, 68, 68, 0.15) !important;
                    }

                    @media (min-width: 1024px) {
                        /* Keep drawer behavior on all screens */
                    }
                `}
            </style>

            {/* Overlay - Active on all screens when sidebar is open */}
            <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside style={styles.sidebar} className="admin-sidebar">
                {/* Brand Header with integrated close button */}
                <div style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: 'white',
                        letterSpacing: '-0.01em',
                    }}>
                        <span style={{ color: 'var(--color-primary)' }}>TYRA</span> DENTISTREE
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            cursor: 'pointer',
                            color: 'rgba(148, 163, 184, 0.6)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(148, 163, 184, 0.6)';
                        }}
                        aria-label="Close sidebar"
                    >
                        <X size={16} />
                    </button>
                </div>

                <nav style={styles.nav}>
                    <p style={{ padding: '0 0.75rem', fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', color: '#475569', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Management</p>
                    {links.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="nav-link-item"
                            style={{
                                ...styles.navLink,
                                gap: '0.875rem',
                                ...(location.pathname === link.path ? styles.activeLink : {})
                            }}
                        >
                            <span style={{ opacity: location.pathname === link.path ? 1 : 0.7, transition: 'opacity 0.15s ease' }}>{link.icon}</span>
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                    <button
                        className="logout-btn"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.875rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        onClick={() => {
                            logout();
                            window.location.href = '/admin/login';
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main} className="admin-main">
                <header style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Hamburger Button */}
                        <div className="mobile-menu-btn" onClick={toggleSidebar} style={{ cursor: 'pointer', color: '#334155' }}>
                            <Menu size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-secondary)' }}>Overview</h2>
                    </div>

                    <div className="flex items-center" style={{ gap: '1.5rem' }}>
                        {/* User Profile Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => isUserMenuOpen ? null : e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ textAlign: 'right' }} className="hidden sm:block">
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>Dr. Admin</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Administrator</div>
                                </div>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b',
                                    border: '2px solid #fff',
                                    boxShadow: '0 0 0 1px #cbd5e1'
                                }}>
                                    <User size={20} />
                                </div>
                                <ChevronDown size={14} color="#94a3b8" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </div>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    width: '200px',
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    zIndex: 50
                                }}>
                                    <div style={{ padding: '0.5rem' }}>
                                        <button
                                            // Placeholder for change password
                                            className="hover:bg-slate-50"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                width: '100%',
                                                padding: '0.75rem',
                                                fontSize: '0.9rem',
                                                color: '#334155',
                                                border: 'none',
                                                background: 'transparent',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <Lock size={16} /> Change Password
                                        </button>
                                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.25rem 0' }}></div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                window.location.href = '/admin/login';
                                            }}
                                            className="hover:bg-red-50 hover:text-red-600"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                width: '100%',
                                                padding: '0.75rem',
                                                fontSize: '0.9rem',
                                                color: '#ef4444',
                                                border: 'none',
                                                background: 'transparent',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div style={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
