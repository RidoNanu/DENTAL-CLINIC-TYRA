import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// For pages that REQUIRE login (e.g., My Appointments)
// Visitor -> Redirect to Login
export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// For pages that are VISITOR ONLY (e.g., Login, Register)
// Patient -> Redirect to My Appointments
export const PublicOnlyRoute = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
