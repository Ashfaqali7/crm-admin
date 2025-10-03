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

  // Success helper
  const showBanner = (content: string, type: MessageType = "success") => {
    messageApi.open({
      type: type,
      content,
    });
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1C6EA4',
      colorLink: '#33A1E0',
      colorSuccess: '#154D71',
      colorWarning: '#FFF9AF',
      colorError: '#E03131',
      colorTextBase: isDarkMode ? '#FFFFFF' : '#000000',
      colorBgBase: isDarkMode ? '#000000' : '#FFFFFF',
      colorBorder: '#54565781',
      colorBorderSecondary: '#54565781',
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, showBanner, }}>
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
