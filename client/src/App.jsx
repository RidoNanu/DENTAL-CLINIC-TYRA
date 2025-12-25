import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import MainLayout from './layouts/MainLayout';

import AdminLayout from './layouts/AdminLayout'; // Implemented

// Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import About from './pages/public/About';
import CancelAppointment from './pages/public/CancelAppointment';



import BookAppointment from './pages/patient/BookAppointment';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard'; // Implemented
import ManageAppointments from './pages/admin/ManageAppointments'; // Implemented
import ManagePatients from './pages/admin/ManagePatients'; // Implemented
import ManageAdmins from './pages/admin/ManageAdmins'; // Admin user management
import Settings from './pages/admin/Settings'; // Implemented
import WalkInBooking from './pages/admin/WalkInBooking'; // Walk-in booking page

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/about" element={<About />} />

                            <Route path="/book-appointment" element={<BookAppointment />} />
                            <Route path="/appointment/cancel" element={<CancelAppointment />} />
                        </Route>

                        {/* Admin Login */}
                        <Route path="/admin/login" element={<AdminLogin />} />

                        {/* Admin Protected Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="appointments" element={<ManageAppointments />} />
                            <Route path="patients" element={<ManagePatients />} />
                            <Route path="walk-in-booking" element={<WalkInBooking />} />
                            <Route path="admins" element={<ManageAdmins />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
