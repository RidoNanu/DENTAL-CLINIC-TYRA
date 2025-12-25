import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('Error Boundary caught an error:', error);
        console.error('Error Info:', errorInfo);

        // Store error details in state
        this.setState({
            error,
            errorInfo,
        });

        // TODO: You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        // Reset error state and reload
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#f8fafc',
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                    }}>
                        {/* Error Icon */}
                        <div style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto 1.5rem',
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <AlertTriangle size={32} color="#dc2626" />
                        </div>

                        {/* Error Message */}
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#0f172a',
                            marginBottom: '0.5rem',
                        }}>
                            Something went wrong
                        </h1>

                        <p style={{
                            fontSize: '0.95rem',
                            color: '#64748b',
                            marginBottom: '2rem',
                            lineHeight: '1.6',
                        }}>
                            Something went wrong — please refresh the page.
                        </p>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                        }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#0ca4b5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#0891a0'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#0ca4b5'}
                            >
                                <RefreshCw size={18} />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'transparent',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                Try Again
                            </button>
                        </div>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.5rem',
                                textAlign: 'left',
                                fontSize: '0.85rem',
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.5rem',
                                }}>
                                    Error Details (Development)
                                </summary>
                                <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    color: '#dc2626',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}>
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    <br /><br />
                                    <strong>Stack:</strong>
                                    <br />
                                    {this.state.errorInfo?.componentStack}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
