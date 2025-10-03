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

// ✅ Define styles using antd-style
const useStyles = createStyles(({ token, css }) => ({
  header: css`
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: ${token.paddingSM}px ${token.paddingLG}px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
    box-shadow: ${token.boxShadowSecondary};
  `,
  collapseBtn: css`
    font-size: ${token.fontSizeLG}px;
    width: 32px;
    height: 32px;
    border-radius: ${token.borderRadius}px;
  `,
  title: css`
    margin: 0;
    color: ${token.colorText};
    font-size: ${token.fontSizeLG}px;
    font-weight: ${token.fontWeightStrong};
  `,
  userInfo: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
    padding: ${token.paddingXS}px ${token.padding}px;
    transition: all ${token.motionDurationMid};
  `,
  avatar: css`
    background-color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimary};
  `,
  userName: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorText};
    line-height: 1.2;
  `,
  userRole: css`
    font-size: 10px;
    color: ${token.colorTextSecondary};
    line-height: 1.2;
  `,
  dropdownBtn: css`
    border-radius: ${token.borderRadius}px;
    transition: all ${token.motionDurationMid};
  `,
}));