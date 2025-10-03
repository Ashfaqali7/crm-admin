import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, theme, Divider } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailOutlined, LockOutlined, LoginOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const { user } = await signIn(values.email, values.password);

      if (user) {
        message.success("Login successful!");
        navigate(from, { replace: true });
      } else {
        message.error("Invalid credentials.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      message.error(error.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}40 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >


      {/* Main Content Container */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          width: '100%',
          margin: 'auto',
          maxWidth: 520,
          padding: token.paddingMD
        }}>
          <Card
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
              backgroundColor: token.colorBgContainer,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              overflow: 'visible'
            }}
            bodyStyle={{
              padding: token.paddingXL
            }}
          >
            {/* Header Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: token.marginXXL
            }}>
              <div style={{
                marginBottom: token.marginLG,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: token.paddingSM
              }}>
                <div style={{
                  width: token.controlHeightLG,
                  height: token.controlHeightLG,
                  borderRadius: '50%',
                  backgroundColor: token.colorPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TeamOutlined style={{
                    fontSize: token.fontSizeXL,
                    color: token.colorWhite
                  }} />
                </div>
              </div>

              <Title
                level={2}
                style={{
                  margin: 0,
                  color: token.colorTextHeading,
                  fontWeight: token.fontWeightStrong,
                  fontSize: token.fontSizeHeading2
                }}
              >
                Welcome Back
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: token.fontSizeLG,
                  color: token.colorTextSecondary,
                  display: 'block',
                  marginTop: token.marginXS
                }}
              >
                Sign in to your CRM Admin account
              </Text>
            </div>

            {/* Login Form */}
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              style={{
                marginBottom: token.marginLG
              }}
            >
              <Form.Item
                name="email"
                label={
                  <Text style={{
                    fontSize: token.fontSize,
                    fontWeight: token.fontWeightStrong,
                    color: token.colorTextHeading
                  }}>
                    Email Address
                  </Text>
                }
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
                style={{ marginBottom: token.marginLG }}
              >
                <Input
                  prefix={
                    <MailOutlined style={{
                      color: token.colorTextSecondary,
                      marginRight: token.marginXS
                    }} />
                  }
                  placeholder="john@example.com"
                  style={{
                    borderRadius: token.borderRadius,
                    padding: `${token.paddingSM}px ${token.paddingMD}px`
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <Text style={{
                    fontSize: token.fontSize,
                    fontWeight: token.fontWeightStrong,
                    color: token.colorTextHeading
                  }}>
                    Password
                  </Text>
                }
                rules={[{ required: true, message: 'Please input your password!' }]}
                style={{ marginBottom: token.marginXL }}
              >
                <Input.Password
                  prefix={
                    <LockOutlined style={{
                      color: token.colorTextSecondary,
                      marginRight: token.marginXS
                    }} />
                  }
                  placeholder="Enter your password"
                  style={{
                    borderRadius: token.borderRadius,
                    padding: `${token.paddingSM}px ${token.paddingMD}px`
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<LoginOutlined />}
                  style={{
                    height: token.controlHeightLG,
                    borderRadius: token.borderRadius,
                    fontSize: token.fontSizeLG,
                    fontWeight: token.fontWeightStrong,
                    boxShadow: `0 ${token.controlHeightSM / 4}px ${token.controlHeightSM}px ${token.colorPrimary}25`
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Divider */}
            <Divider style={{
              margin: `${token.marginLG}px 0`,
              borderColor: token.colorBorderSecondary
            }}>
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                New to CRM Admin?
              </Text>
            </Divider>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center' }}>
              <Text
                type="secondary"
                style={{
                  fontSize: token.fontSize,
                  color: token.colorTextSecondary
                }}
              >
                Don't have an account?{' '}
              </Text>
              <Link
                to="/signup"
                style={{
                  color: token.colorPrimary,
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeightStrong,
                  textDecoration: 'none',
                  transition: `color ${token.motionDurationMid}`
                }}
              >
                Create Account
              </Link>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: token.marginLG,
              paddingTop: token.marginLG,
              borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
            }}>
              <Text
                type="secondary"
                style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextSecondary
                }}
              >
                © {new Date().getFullYear()} CRM Admin. All rights reserved.
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
