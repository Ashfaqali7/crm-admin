import { Menu, theme, Typography } from 'antd';
import {
  DashboardOutlined,
  FundOutlined,
  ContactsOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // Define menu items with better structure
  const baseMenuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/',
    },
    {
      key: 'leads',
      icon: <ContactsOutlined />,
      label: 'Leads',
      path: '/leads',
    },
    {
      key: 'deals',
      icon: <FundOutlined />,
      label: 'Deals',
      path: '/deals',
    },
    {
      key: 'tasks',
      icon: <ScheduleOutlined />,
      label: 'Tasks',
      path: '/tasks',
    },
  ];

  // Add admin-only items
  const adminMenuItems: MenuItem[] = profile?.role === 'admin' ? [
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users',
      path: '/users',
    },
  ] : [];

  const allMenuItems = [...baseMenuItems, ...adminMenuItems];

  // Convert to Ant Design menu format
  const menuItems = allMenuItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.path),
  }));

  return (
    <div style={{ height: '100%' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          height: '100%',
          padding: `${token.paddingXS}px 0`,
        }}
      />

      {/* Optional footer section for additional info */}
      <div style={{
        position: 'absolute',
        bottom: token.paddingLG,
        left: token.paddingSM,
        right: token.paddingSM,
        opacity: 0.7,
      }}>
        <Text
          style={{
            fontSize: 10,
            color: token.colorTextSecondary,
            display: 'block',
            textAlign: 'center',
          }}
        >
          CRM v1.0
        </Text>
      </div>
    </div>
  );
}
