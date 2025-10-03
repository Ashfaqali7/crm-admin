import { useState } from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const { Content, Sider } = Layout;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        style={{ background: token.colorSuccess }}
      >
        <div>
          <h2>CRM</h2>
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Navbar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <Content style={{ minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}