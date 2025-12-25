import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
    return (
        <div className="flex" style={{ flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />

            <main style={{ flex: 1 }}>
                {/* The Outlet renders the current route's element */}
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
