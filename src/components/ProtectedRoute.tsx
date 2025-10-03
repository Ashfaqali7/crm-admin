import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type ReactNode } from 'react';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'sales')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  console.log('ProtectedRoute state:', { loading, hasUser: !!user, hasProfile: !!profile });

  useEffect(() => {
    if (!loading) {
      setShowTimeout(false);
      return;
    }

    // Set a timeout to show fallback options if loading takes too long
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
        {showTimeout && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <div style={{ color: 'orange', marginBottom: '1rem' }}>
              Taking longer than expected to load...
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                marginRight: '8px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear & Restart
            </button>
          </div>
        )}
      </div>
    );
  }

  // If no user after loading is complete, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
