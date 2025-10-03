import { Layout, Button, Space, Typography, Avatar, Dropdown, type MenuProps } from 'antd';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { createStyles } from 'antd-style';
import { useMediaQuery } from '../hooks/useMediaQuery';

const { Header } = Layout;
const { Title, Text } = Typography;

interface NavbarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export function Navbar({ collapsed, toggleCollapsed }: NavbarProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { styles } = useStyles();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      disabled: true,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: async () => {
        try {
          await signOut();
        } catch (err) {
          console.error('Error during signOut:', err);
        } finally {
          navigate('/login');
        }
      },
    },
  ];

  return (
    <Header className={styles.header}>
      {/* Left section */}
      <Space>
        <Button
          type="text"
          className={styles.collapseBtn}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        {!isMobile && (
          <Title level={4} className={styles.title}>
            CRM Admin
          </Title>
        )}
      </Space>

      {/* Right section */}
      <Space>
        <div className={styles.userInfo}>
          <Avatar size="small" icon={<UserOutlined />} className={styles.avatar} />
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong className={styles.userName}>
                {profile?.full_name || 'User'}
              </Text>
              <Text className={styles.userRole}>{profile?.role || 'Role'}</Text>
            </div>
          )}
        </div>

        <ThemeToggle />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']} arrow>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            className={styles.dropdownBtn}
            aria-label="User menu"
          />
        </Dropdown>
      </Space>
    </Header>
  );
}

const useStyles = createStyles(({ token }) => ({
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: `${token.paddingSM}px ${token.paddingLG}px`,
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorBorder}`,
    boxShadow: token.boxShadowSecondary,
  },
  collapseBtn: {
    fontSize: token.fontSizeLG,
    width: 32,
    height: 32,
    borderRadius: token.borderRadius,
  },
  title: {
    margin: 0,
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: token.marginSM,
    padding: `${token.paddingXS}px ${token.padding}px`,
    transition: `all ${token.motionDurationMid}`,
  },
  avatar: {
    backgroundColor: token.colorPrimary,
    border: `1px solid ${token.colorPrimary}`,
  },
  userName: {
    fontSize: token.fontSizeSM,
    color: token.colorText,
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: 10,
    color: token.colorTextSecondary,
    lineHeight: 1.2,
  },
  dropdownBtn: {
    borderRadius: token.borderRadius,
    transition: `all ${token.motionDurationMid}`,
  },
}));
