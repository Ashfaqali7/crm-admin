import { createContext, useContext, useState, type ReactNode } from 'react';
import { ConfigProvider, message, theme } from 'antd';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  showBanner: (content: string, type: MessageType) => void;
};
type MessageType = "success" | "info" | "warning" | "error" | "loading";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Enhanced banner helper with better UX
  const showBanner = (content: string, type: MessageType = "success") => {
    messageApi.open({
      type: type,
      content,
      duration: type === 'error' ? 5 : 3, // Longer duration for errors
      style: {
        marginTop: '20px',
      },
    });
  };

  // Comprehensive theme configuration with design tokens
  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // Primary brand colors
      colorPrimary: '#1C6EA4',
      colorPrimaryHover: '#155a8a',
      colorPrimaryActive: '#134d73',

      // Status colors
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',

      // Link colors
      colorLink: '#1C6EA4',
      colorLinkHover: '#155a8a',
      colorLinkActive: '#134d73',

      // Text colors with proper hierarchy
      colorText: isDarkMode ? '#ffffff' : '#000000',
      colorTextSecondary: isDarkMode ? '#bfbfbf' : '#666666',
      colorTextTertiary: isDarkMode ? '#8c8c8c' : '#999999',
      colorTextQuaternary: isDarkMode ? '#666666' : '#bfbfbf',

      // Background colors
      colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDarkMode ? '#141414' : '#f5f5f5',
      colorBgSpotlight: isDarkMode ? '#2a2a2a' : '#f2f2f2',

      // Border colors
      colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
      colorBorderSecondary: isDarkMode ? '#303030' : '#f0f0f0',

      // Split line colors
      colorSplit: isDarkMode ? '#303030' : '#f0f0f0',

      // Typography scale
      fontSizeXS: 10,
      fontSizeSM: 12,
      fontSize: 14,
      fontSizeLG: 16,
      fontSizeXL: 20,
      fontSizeXXL: 24,
      fontSizeXXXL: 30,

      // Line heights for better readability
      lineHeight: 1.5714285714285714,
      lineHeightLG: 1.5,
      lineHeightSM: 1.6666666666666667,

      // Font weights
      fontWeightStrong: 600,

      // Spacing scale (following 8px grid system)
      paddingXXS: 2,
      paddingXS: 4,
      paddingSM: 8,
      padding: 12,
      paddingMD: 16,
      paddingLG: 20,
      paddingXL: 24,
      paddingXXL: 32,

      marginXXS: 2,
      marginXS: 4,
      marginSM: 8,
      margin: 12,
      marginMD: 16,
      marginLG: 20,
      marginXL: 24,
      marginXXL: 32,

      // Border radius scale
      borderRadiusXS: 2,
      borderRadiusSM: 4,
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusXL: 12,
      borderRadiusXXL: 16,

      // Component specific tokens
      controlHeight: 32,
      controlHeightSM: 24,
      controlHeightLG: 40,
      controlHeightXS: 20,

      // Card component tokens
      cardPaddingSM: 12,
      cardPadding: 16,
      cardPaddingLG: 20,

      // Button component tokens
      buttonPaddingHorizontal: 12,
      buttonPaddingHorizontalSM: 8,
      buttonPaddingHorizontalLG: 16,

      // Table component tokens
      tablePadding: 12,
      tablePaddingHorizontal: 8,
      tablePaddingVertical: 12,

      // Modal component tokens
      modalBodyPadding: 20,
      modalHeaderPadding: 16,
      modalFooterPadding: 16,

      // Form component tokens
      formItemMarginBottom: 20,

      // Animation durations
      motionDurationFast: '0.15s',
      motionDurationMid: '0.2s',
      motionDurationSlow: '0.3s',

      // Z-index scale
      zIndexBase: 0,
      zIndexPopupBase: 1000,
      zIndexAffix: 10,
      zIndexPopup: 1010,

      // Box shadows
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.06)',

      // Screen breakpoints (for reference)
      screenXS: 480,
      screenSM: 576,
      screenMD: 768,
      screenLG: 992,
      screenXL: 1200,
      screenXXL: 1600,
    },
    components: {
      // Card component customization
      Card: {
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        colorBorderSecondary: isDarkMode ? '#303030' : '#f0f0f0',
      },
      // Button component customization
      Button: {
        borderRadius: 6,
        controlHeight: 32,
        fontWeight: 500,
        primaryShadow: '0 2px 4px rgba(28, 110, 164, 0.3)',
      },
      // Input component customization
      Input: {
        borderRadius: 6,
        controlHeight: 32,
      },
      // Select component customization
      Select: {
        borderRadius: 6,
        controlHeight: 32,
      },
      // Table component customization
      Table: {
        borderRadius: 6,
        cellPaddingBlock: 12,
        cellPaddingInline: 16,
      },
      // Modal component customization
      Modal: {
        borderRadius: 12,
        titleFontSize: 16,
        titleLineHeight: 1.4,
      },
      // Menu component customization
      Menu: {
        borderRadius: 6,
        subMenuItemBorderRadius: 6,
      },
      // Typography component customization
      Typography: {
        titleMarginBottom: 0,
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, showBanner }}>
      <ConfigProvider theme={themeConfig}>
        {contextHolder}
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
