import { Button, theme, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { token } = theme.useToken();

  return (
    <Tooltip
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      placement="bottom"
      arrow
    >
      <Button
        type="text"
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          borderRadius: token.borderRadiusLG,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `all ${token.motionDurationMid}`,
          color: token.colorTextSecondary,
          background: 'transparent',
        }}
        // Enhanced hover and focus states
        onMouseEnter={(e) => {
          e.currentTarget.style.background = token.colorBgSpotlight;
          e.currentTarget.style.color = token.colorPrimary;
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = token.colorTextSecondary;
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = token.colorBgSpotlight;
          e.currentTarget.style.color = token.colorPrimary;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${token.colorPrimary}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = token.colorTextSecondary;
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      />
    </Tooltip>
  );
}
