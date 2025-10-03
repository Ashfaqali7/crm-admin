import { useState, useEffect } from 'react';
import { Layout, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { createStyles } from 'antd-style';
import { useMediaQuery } from '../hooks/useMediaQuery';

const { Content, Sider } = Layout;
const { Title } = Typography;
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { styles } = useStyles({ collapsed });
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className={styles.rootLayout}>
      <>
        {!isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            collapsedWidth={80}
            width={200}
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
        )}

        {/* Mobile sidebar as drawer */}
        {isMobile && (
          <div
            className={`${styles.mobileSider} ${collapsed ? '' : styles.mobileSiderVisible}`}
          >
            <div className={styles.mobileSiderHeader}>
              <Title level={4} className={styles.mobileSiderTitle}>
                CRM
              </Title>
            </div>
            <div className={styles.mobileSiderContent}>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Mobile overlay */}
        {isMobile && !collapsed && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setCollapsed(true)}
          />
        )}
      </>

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
    position: sticky;
    // height: 100vh;
    top: 0;
    left: 0;
    z-index: 100;
    overflow: auto;
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
  mobileSider: css`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0;
    background: ${token.colorBgContainer};
    border-right: 1px solid ${token.colorBorder};
    z-index: 1000;
    overflow: auto;
    transition: width 0.3s ease;
  `,
  mobileSiderVisible: css`
    width: 240px;
  `,
  mobileSiderHeader: css`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 ${token.paddingLG}px;
    border-bottom: 1px solid ${token.colorBorder};
    background: ${token.colorBgSpotlight};
  `,
  mobileSiderTitle: css`
    margin: 0;
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeXL}px;
    font-weight: ${token.fontWeightStrong};
  `,
  mobileSiderContent: css`
    padding: ${token.paddingSM}px;
    height: calc(100vh - 64px);
    overflow-y: auto;
  `,
  mobileOverlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  `,
}));