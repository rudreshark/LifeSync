import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ Error Loading App</h1>
          <p style={{ color: '#666', marginBottom: '20px', maxWidth: '500px', textAlign: 'center' }}>
            Something went wrong. Please check the browser console (F12) for details.
          </p>
          <details style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            maxWidth: '600px',
            cursor: 'pointer'
          }}>
            <summary style={{ fontWeight: 'bold', color: '#333' }}>Error Details</summary>
            <pre style={{ 
              marginTop: '10px',
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#d32f2f'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
