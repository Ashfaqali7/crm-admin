import { Menu } from 'antd';
import {
  DashboardOutlined,
  FundOutlined,
  ContactsOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/leads',
      icon: <ContactsOutlined />,
      label: 'Leads',
    },
    {
      key: '/deals',
      icon: <FundOutlined />,
      label: 'Deals',
    },
    {
      key: '/tasks',
      icon: <ScheduleOutlined />,
      label: 'Tasks',
    },
    ...(profile?.role === 'admin'
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Users',
          },
        ]
      : []),

  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
    />
  );
}