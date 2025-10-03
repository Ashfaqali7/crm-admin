
import { useState } from 'react';
import { Layout, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { createStyles } from 'antd-style';

const { Content, Sider } = Layout;
const { Title } = Typography;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { styles } = useStyles({ collapsed });

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className={styles.rootLayout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={280}
        className={`${styles.sider} ${collapsed ? styles.siderCollapsed : ''}`}
        trigger={null}
      >
        <div className={`${styles.siderHeader} ${collapsed ? styles.siderHeaderCollapsed : ''}`}>
          <Title level={4} className={`${styles.siderTitle} ${collapsed ? styles.siderTitleCollapsed : ''}`}>
            {collapsed ? 'C' : 'CRM'}
          </Title>
        </div>

        <div className={`${styles.siderContent} ${collapsed ? styles.siderContentCollapsed : ''}`}>
          <Sidebar />
        </div>
      </Sider>

      <Layout className={styles.innerLayout}>
        <Navbar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

const useStyles = createStyles(({ token, css }) => ({
  rootLayout: css`
    min-height: 100vh;
    width: 100%;
    background: ${token.colorBgLayout};
  `,
  sider: css`
    background: ${token.colorBgContainer};
    border-right: 1px solid ${token.colorBorder};
    box-shadow: ${token.boxShadow};
  `,
  siderCollapsed: css`
    box-shadow: none;
  `,
  siderHeader: css`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 ${token.paddingLG}px;
    border-bottom: 1px solid ${token.colorBorder};
    background: ${token.colorBgSpotlight};
    transition: all ${token.motionDurationMid};
  `,
  siderHeaderCollapsed: css`
    justify-content: center;
    padding: 0 ${token.paddingXS}px;
  `,
  siderTitle: css`
    margin: 0;
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeXL}px;
    font-weight: ${token.fontWeightStrong};
    text-align: left;
    transition: all ${token.motionDurationMid};
  `,
  siderTitleCollapsed: css`
    font-size: ${token.fontSizeLG}px;
    text-align: center;
  `,
  siderContent: css`
    padding: ${token.paddingSM}px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    overflow-x: hidden;
  `,
  siderContentCollapsed: css`
    padding: 0;
  `,
  innerLayout: css`
    background: ${token.colorBgLayout};
    transition: margin-left ${token.motionDurationMid};
  `,
  content: css`
    min-height: calc(100vh - 64px);
    padding: ${token.paddingLG}px;
    background: ${token.colorBgLayout};
    transition: all ${token.motionDurationMid};
  `,
  contentWrapper: css`
    min-height: 100%;
  `,
}));