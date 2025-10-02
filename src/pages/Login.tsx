import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, theme } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

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
        navigate(from, { replace: true });
      } else {
        message.error("Invalid credentials.");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorBgContainer} 100%)`,
        padding: '20px'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(6px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8, color: token.colorPrimary }}>CRM Admin</Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="john@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>Don’t have an account? </Text>
            <Link to="/signup">Sign Up</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
