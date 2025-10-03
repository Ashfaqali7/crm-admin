import { Menu, theme } from 'antd';
import {
  DashboardOutlined,
  FundOutlined,
  ContactsOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';


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
  theme.useToken();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    active: item.path === location.pathname,
    onClick: () => {
      navigate(item.path);
      // Close sidebar on mobile after navigation
      if (isMobile) {
        // This would need to be handled by the parent component
      }
    },
  }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          height: '100%',
        }}
      />

    </div>
  );
}