import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, theme, Spin, Alert, Divider, Space } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const onFinish = async (values: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => {
    try {
      setLoading(true);

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      // Create the profile
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: values.full_name,
          phone: values.phone,
          role: 'sales', // Default role
        },
      ]);

      if (profileError) throw profileError;

      message.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}40 100%)`,
    }}>

      <div style={{
        width: '100%',
        maxWidth: 520,
        margin: 'auto',
        padding: token.paddingMD,
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
                justifyContent: 'center',
                boxShadow: `0 ${token.controlHeightSM / 4}px ${token.controlHeightSM}px ${token.colorPrimary}25`
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
              Join CRM Admin
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
              Create your account to get started
            </Text>
          </div>

          {/* Signup Form */}
          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{
              marginBottom: token.marginLG
            }}
          >
            <Form.Item
              name="full_name"
              label={
                <Text style={{
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeightStrong,
                  color: token.colorTextHeading
                }}>
                  Full Name
                </Text>
              }
              rules={[{ required: true, message: 'Please input your full name!' }]}
              style={{ marginBottom: token.marginLG }}
            >
              <Input
                prefix={
                  <UserOutlined style={{
                    color: token.colorTextSecondary,
                    marginRight: token.marginXS
                  }} />
                }
                placeholder="John Doe"
                style={{
                  borderRadius: token.borderRadius,
                  padding: `${token.paddingSM}px ${token.paddingMD}px`
                }}
              />
            </Form.Item>

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
              name="phone"
              label={
                <Text style={{
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeightStrong,
                  color: token.colorTextHeading
                }}>
                  Phone Number
                </Text>
              }
              rules={[{ required: true, message: 'Please input your phone number!' }]}
              style={{ marginBottom: token.marginLG }}
            >
              <Input
                prefix={
                  <PhoneOutlined style={{
                    color: token.colorTextSecondary,
                    marginRight: token.marginXS
                  }} />
                }
                placeholder="+1 234 567 8900"
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
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
              style={{ marginBottom: token.marginLG }}
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

            <Form.Item
              name="confirm"
              label={
                <Text style={{
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeightStrong,
                  color: token.colorTextHeading
                }}>
                  Confirm Password
                </Text>
              }
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
              style={{ marginBottom: token.marginXL }}
            >
              <Input.Password
                prefix={
                  <LockOutlined style={{
                    color: token.colorTextSecondary,
                    marginRight: token.marginXS
                  }} />
                }
                placeholder="Confirm your password"
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
                icon={<UserAddOutlined />}
                style={{
                  height: token.controlHeightLG,
                  borderRadius: token.borderRadius,
                  fontSize: token.fontSizeLG,
                  fontWeight: token.fontWeightStrong,
                  boxShadow: `0 ${token.controlHeightSM / 4}px ${token.controlHeightSM}px ${token.colorPrimary}25`,
                  backgroundColor: token.colorPrimary,
                  borderColor: token.colorPrimary
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <Divider style={{
            margin: `${token.marginLG}px 0`,
            borderColor: token.colorBorderSecondary
          }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Already have an account?
            </Text>
          </Divider>

          {/* Sign In Link */}
          <div style={{ textAlign: 'center' }}>
            <Text
              type="secondary"
              style={{
                fontSize: token.fontSize,
                color: token.colorTextSecondary
              }}
            >
              Already have an account?{' '}
            </Text>
            <Link
              to="/login"
              style={{
                color: token.colorPrimary,
                fontSize: token.fontSize,
                fontWeight: token.fontWeightStrong,
                textDecoration: 'none',
                transition: `color ${token.motionDurationMid}`
              }}
            >
              Sign In
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
              © 2025 CRM Admin. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
