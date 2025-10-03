import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Spin, Alert, Button, Space, Typography, theme } from 'antd';
import { ReloadOutlined, LoginOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'sales')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const { token } = theme.useToken();

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

  // Show enhanced loading screen while auth is initializing
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: token.colorBgLayout,
        padding: token.paddingLG,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}>
          {/* Loading spinner with enhanced styling */}
          <div style={{
            marginBottom: token.marginLG,
          }}>
            <Spin
              size="large"
              style={{
                color: token.colorPrimary,
              }}
            />
          </div>

          <Title
            level={4}
            style={{
              color: token.colorText,
              marginBottom: token.marginSM,
              fontWeight: token.fontWeightStrong,
            }}
          >
            Loading CRM Admin
          </Title>

          <Text
            type="secondary"
            style={{
              display: 'block',
              marginBottom: token.marginLG,
              fontSize: token.fontSizeSM,
            }}
          >
            Please wait while we verify your credentials...
          </Text>

          {/* Progress indicator */}
          <div style={{
            width: '100%',
            height: 4,
            background: token.colorBgSpotlight,
            borderRadius: token.borderRadiusSM,
            overflow: 'hidden',
            marginBottom: token.marginLG,
          }}>
            <div style={{
              height: '100%',
              width: '60%',
              background: token.colorPrimary,
              borderRadius: token.borderRadiusSM,
              animation: 'loading-progress 2s ease-in-out infinite',
            }} />
          </div>

          {/* Timeout fallback options */}
          {showTimeout && (
            <Alert
              message="Taking longer than expected"
              description="Authentication is taking longer than usual. You can retry or clear your session and start fresh."
              type="warning"
              showIcon
              style={{
                marginBottom: token.marginLG,
                textAlign: 'left',
              }}
              action={
                <Space direction="vertical" size={token.marginSM}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                    style={{
                      borderRadius: token.borderRadius,
                    }}
                  >
                    Retry
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<LoginOutlined />}
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    style={{
                      borderRadius: token.borderRadius,
                    }}
                  >
                    Clear & Restart
                  </Button>
                </Space>
              }
            />
          )}
        </div>

        {/* Add custom loading animation styles */}
        <style>{`
          @keyframes loading-progress {
            0% { width: 30%; }
            50% { width: 80%; }
            100% { width: 30%; }
          }
        `}</style>
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
