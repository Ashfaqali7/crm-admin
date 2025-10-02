import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'sales')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', { loading, hasUser: !!user, hasProfile: !!profile });

  const [showTimeout, setShowTimeout] = useState(false);
  useEffect(() => {
    // Only start the timeout when we're loading and there's no user yet.
    if (!loading || user) {
      setShowTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      if (loading && !user) {
        console.log('Loading timeout reached (no user)');
        setShowTimeout(true);
      }
    }, 5000); 

    return () => clearTimeout(timer);
  }, [loading, user]);

  if (loading && !user) {
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
          <div style={{ marginTop: '1rem', color: 'red' }}>
            <div>Loading is taking longer than expected.</div>
            <button onClick={() => localStorage.clear()}>
              Clear Session
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}