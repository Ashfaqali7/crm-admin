import { createContext, useContext, useState, type ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1C6EA4', // main brand blue
      colorLink: '#33A1E0', // links / hover
      colorSuccess: '#154D71', // success / accents
      colorWarning: '#FFF9AF', // warnings / highlights
      colorError: '#E03131',
      colorTextBase: isDarkMode ? '#FFFFFF' : '#000000', colorBgBase: isDarkMode ? '#000000' : '#FFFFFF',
      colorBorder: '#154D71',
      colorBorderSecondary: '#33A1E0',
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>
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