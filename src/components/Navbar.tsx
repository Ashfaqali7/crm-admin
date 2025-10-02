import { Layout, Button, Space, Typography } from 'antd';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

interface NavbarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export function Navbar({ collapsed, toggleCollapsed }: NavbarProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <Header style={{ background:"#fff", padding: '0 16px',  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
        />
        <Title level={4} style={{ margin: 0 }}>CRM Admin</Title>
      </Space>
      <Space>
        <Typography.Text>
          {profile?.full_name} ({profile?.role})
        </Typography.Text>
        <ThemeToggle />
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={async () => {
            try {
              await signOut();
            } catch (err) {
              console.error('Error during signOut:', err);
            } finally {
              navigate('/login');
            }
          }}
          title="Logout"
        />
      </Space>
    </Header>
  );
}