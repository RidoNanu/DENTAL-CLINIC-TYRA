import React from 'react';

/**
 * Loading Skeletons for Dashboard
 * Provides visual feedback while data is loading
 */

// KPI Card Skeleton
export const KPISkeleton = () => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
        }}>
            <div>
                <div style={{
                    height: '16px',
                    width: '120px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '0.75rem'
                }}></div>
                <div style={{
                    height: '32px',
                    width: '80px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px'
                }}></div>
            </div>
            <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px'
            }}></div>
        </div>
        <div style={{
            height: '14px',
            width: '60px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px'
        }}></div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
    <tr>
        {[1, 2, 3, 4].map(i => (
            <td key={i} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{
                    height: '16px',
                    width: i === 1 ? '140px' : i === 2 ? '100px' : i === 3 ? '80px' : '120px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
            </td>
        ))}
    </tr>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 3 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
        ))}
    </>
);

// Global pulse animation style
const pulseStyle = `
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
`;

// Inject styles into document if not already present
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.innerHTML = pulseStyle;
    document.head.appendChild(style);
}
