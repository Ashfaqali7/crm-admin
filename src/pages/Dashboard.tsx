import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, theme, Progress, Tabs } from 'antd';
import { Column, Pie, Line, Bar, DualAxes, Area } from '@ant-design/charts';
import { leadsService } from '../services/leadsService';
import { dealsService } from '../services/dealsService';
import { tasksService } from '../services/tasksService';
import type { Lead, Deal, Task } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function formatMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [leadsData, dealsData, tasksData] = await Promise.all([
          leadsService.getAll(),
          dealsService.getAll(),
          tasksService.getWithLead(),
        ]);

        setLeads(leadsData || []);
        setDeals(dealsData || []);
        setTasks(tasksData || []);
        setRecentLeads((leadsData || []).slice(0, 6));
        setRecentTasks((tasksData || []).slice(0, 6));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const totalLeads = leads.length;
  const totalDeals = deals.length;
  const totalDealValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'Won').length;
  const conversionRate = totalDeals ? Math.round((wonDeals / totalDeals) * 100) : 0;

  // Data for deals by stage (counts and values)
  const dealsByStage = useMemo(() => {
    const map = new Map<string, { stage: string; count: number; totalValue: number }>();
    for (const d of deals) {
      const key = d.stage || 'Unknown';
      const item = map.get(key) || { stage: key, count: 0, totalValue: 0 };
      item.count += 1;
      item.totalValue += d.value || 0;
      map.set(key, item);
    }
    return Array.from(map.values());
  }, [deals]);

  // Leads by status pie data
  const leadsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      map.set(l.status, (map.get(l.status) || 0) + 1);
    }
    return Array.from(map.entries()).map(([status, count]) => ({ type: status, value: count }));
  }, [leads]);

  // Monthly revenue line (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString(); // month-start ISO string
      months.push(key);
      map.set(key, 0);
    }

    for (const dl of deals) {
      if (!dl.created_at) continue;
      const dt = new Date(dl.created_at);
      const key = new Date(dt.getFullYear(), dt.getMonth(), 1).toISOString();
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + (dl.value || 0));
      }
    }

    return months.map(key => ({ month: key, revenue: Math.round(map.get(key) || 0) }));
  }, [deals]);

  // Tasks related metrics
  const tasksByLead = useMemo(() => {
    const map = new Map<string, { leadName: string; count: number }>();
    for (const t of tasks) {
      const leadName = (t as any).lead?.name || 'Unknown';
      const item = map.get(leadName) || { leadName, count: 0 };
      item.count += 1;
      map.set(leadName, item);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      map.set(t.status, (map.get(t.status) || 0) + 1);
    }
    return Array.from(map.entries()).map(([status, count]) => ({ type: status, value: count }));
  }, [tasks]);

  const tasksOverTime = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString();
      months.push(key);
      map.set(key, 0);
    }

    for (const t of tasks) {
      if (!t.created_at) continue;
      const dt = new Date(t.created_at);
      const key = new Date(dt.getFullYear(), dt.getMonth(), 1).toISOString();
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }

    return months.map(key => ({ month: key, count: map.get(key) || 0 }));
  }, [tasks]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDeals = deals.filter(d => {
      if (!d.created_at) return false;
      const dealDate = new Date(d.created_at);
      return dealDate >= thirtyDaysAgo;
    });

    const recentLeads = leads.filter(l => {
      if (!l.created_at) return false;
      const leadDate = new Date(l.created_at);
      return leadDate >= thirtyDaysAgo;
    });

    const wonRecentDeals = recentDeals.filter(d => d.stage === 'Won').length;
    const conversion = recentDeals.length ? Math.round((wonRecentDeals / recentDeals.length) * 100) : 0;

    return {
      leads: recentLeads.length,
      deals: recentDeals.length,
      wonDeals: wonRecentDeals,
      conversionRate: conversion
    };
  }, [deals, leads]);

  // Chart configs for tasks
  const topClientsConfig = {
    data: tasksByLead.map(t => ({ lead: t.leadName, value: t.count })),
    xField: 'lead',
    yField: 'value',
    label: { position: 'middle' },
    height: 300,
    autoFit: true,
  };

  const tasksStatusPieConfig = {
    appendPadding: 10,
    data: tasksByStatus,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider', labelHeight: 28,
      formatter: (d: any) => `${d?.type ?? 'Unknown'}: ${d?.value ?? 0}`
    },
    interactions: [{ type: 'element-active' }],
    height: 300,
  };

  const tasksLineConfig = {
    data: tasksOverTime.map(m => ({ month: formatMonthLabel(m.month), count: m.count })),
    xField: 'month',
    yField: 'count',
    smooth: true,
    height: 300,
    point: { size: 4, shape: 'diamond' },
  };

  const leadColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (t: string) => new Date(t).toLocaleDateString() },
  ];

  const taskColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Lead', dataIndex: ['lead', 'name'], key: 'lead' },
    { title: 'Due', dataIndex: 'due_date', key: 'due_date', render: (t: string) => t ? new Date(t).toLocaleDateString() : '' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (t: string) => new Date(t).toLocaleDateString() },
  ];

  // Chart configs
  const columnConfig = {
    data: dealsByStage.map(d => ({ stage: d.stage, value: d.totalValue })),
    xField: 'stage',
    yField: 'value',
    label: { position: 'middle' },
    meta: { value: { alias: 'Total Value' } },
    height: 300,
    autoFit: true,
  };

  const pieConfig = {
    appendPadding: 10,
    data: leadsByStatus,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: { type: 'spider', labelHeight: 28, formatter: (d: any) => `${d.type}: ${d.value}` },
    interactions: [{ type: 'element-active' }],
    height: 300,
  };

  const lineConfig = {
    data: monthlyRevenue.map(m => ({ month: formatMonthLabel(m.month), revenue: m.revenue })),
    xField: 'month',
    yField: 'revenue',
    smooth: true,
    height: 300,
    point: { size: 4, shape: 'diamond' },
    area: { style: { fill: 'l(270) 0:#ffffff 1:#d6e4ff' } },
  };

  // New advanced charts
  const dualAxesConfig = {
    data: [monthlyRevenue.map(m => ({ month: formatMonthLabel(m.month), revenue: m.revenue })),
    tasksOverTime.map(t => ({ month: formatMonthLabel(t.month), tasks: t.count }))],
    xField: 'month',
    yField: ['revenue', 'tasks'],
    height: 300,
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        color: '#1C6EA4',
      },
      {
        geometry: 'line',
        smooth: true,
        color: '#FF6B35',
      },
    ],
  };

  const areaConfig = {
    data: monthlyRevenue.map(m => ({ month: formatMonthLabel(m.month), revenue: m.revenue })),
    xField: 'month',
    yField: 'revenue',
    height: 300,
    areaStyle: () => {
      return {
        fill: 'l(270) 0:#ffffff 1:#1C6EA4',
      };
    },
  };

  return (
    <div style={{
      padding: token.paddingXS,
      background: token.colorBgLayout,
      minHeight: '100%',
    }}>
      {/* Dashboard Header */}
      <div style={{
        marginBottom: token.marginXL,
      }}>
        <Title
          level={3}
          style={{
            margin: 0,
            color: token.colorText,
            fontSize: 32,
            fontWeight: token.fontWeightStrong,
          }}
        >
          Dashboard
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: token.fontSizeLG,
            display: 'block',
            marginTop: token.marginXS,
          }}
        >
          Welcome back! Here's an overview of your CRM data.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[token.marginLG, token.marginLG]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}E0 100%)`,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Statistic
              title={
                <Text style={{
                  color: token.colorTextLightSolid,
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightStrong,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Total Leads
                </Text>
              }
              value={totalLeads}
              valueStyle={{
                color: token.colorTextLightSolid,
                fontSize: 28,
                fontWeight: token.fontWeightStrong,
              }}
            />
            <Text style={{
              color: token.colorTextLightSolid,
              fontSize: token.fontSizeSM,
              opacity: 0.8,
            }}>
              New leads collected
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}E0 100%)`,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Statistic
              title={
                <Text style={{
                  color: token.colorTextLightSolid,
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightStrong,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Total Deals
                </Text>
              }
              value={totalDeals}
              valueStyle={{
                color: token.colorTextLightSolid,
                fontSize: 28,
                fontWeight: token.fontWeightStrong,
              }}
            />
            <Text style={{
              color: token.colorTextLightSolid,
              fontSize: token.fontSizeSM,
              opacity: 0.8,
            }}>
              Deals in pipeline
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorWarning}E0 100%)`,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Statistic
              title={
                <Text style={{
                  color: token.colorTextLightSolid,
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightStrong,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Deal Value
                </Text>
              }
              value={totalDealValue}
              precision={0}
              prefix="$"
              valueStyle={{
                color: token.colorTextLightSolid,
                fontSize: 28,
                fontWeight: token.fontWeightStrong,
              }}
            />
            <Text style={{
              color: token.colorTextLightSolid,
              fontSize: token.fontSizeSM,
              opacity: 0.8,
            }}>
              Combined value of deals
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorInfo}E0 100%)`,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Statistic
              title={
                <Text style={{
                  color: token.colorTextLightSolid,
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightStrong,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Conversion Rate
                </Text>
              }
              value={conversionRate}
              suffix="%"
              valueStyle={{
                color: token.colorTextLightSolid,
                fontSize: 28,
                fontWeight: token.fontWeightStrong,
              }}
            />
            <Text style={{
              color: token.colorTextLightSolid,
              fontSize: token.fontSizeSM,
              opacity: 0.8,
            }}>
              Won deals rate
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[token.marginLG, token.marginLG]} style={{ marginTop: token.marginLG }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title={
              <Text style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
              }}>
                Recent Leads (30 days)
              </Text>
            }
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 'bold', color: token.colorPrimary }}>
              {performanceMetrics.leads}
            </div>
            <Text type="secondary">New leads in the last 30 days</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            title={
              <Text style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
              }}>
                Recent Deals (30 days)
              </Text>
            }
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 'bold', color: token.colorSuccess }}>
              {performanceMetrics.deals}
            </div>
            <Text type="secondary">New deals in the last 30 days</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            title={
              <Text style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
              }}>
                Won Deals (30 days)
              </Text>
            }
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 'bold', color: token.colorWarning }}>
              {performanceMetrics.wonDeals}
            </div>
            <Text type="secondary">Deals won in the last 30 days</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Tabs
        defaultActiveKey="1"
        size="large"
        style={{ marginTop: token.marginLG }}
        items={[
          {
            key: '1',
            label: 'Deals Analytics',
            children: (
              <Row gutter={[token.marginLG, token.marginLG]}>
                <Col xs={24} lg={12} xl={10}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Deals by Stage (Total Value)
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Column {...columnConfig} />
                  </Card>
                </Col>

                <Col xs={24} lg={12} xl={7}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Leads by Status
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Pie {...pieConfig} />
                  </Card>
                </Col>

                <Col xs={24} xl={7}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Monthly Revenue
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Line {...lineConfig} />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: '2',
            label: 'Tasks Analytics',
            children: (
              <Row gutter={[token.marginLG, token.marginLG]}>
                <Col xs={24} lg={12} xl={8}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Top Clients by Task Count
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Column {...topClientsConfig} />
                  </Card>
                </Col>

                <Col xs={24} lg={12} xl={8}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Tasks by Status
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Pie {...tasksStatusPieConfig} />
                  </Card>
                </Col>

                <Col xs={24} xl={8}>
                  <Card
                    title={
                      <Text style={{
                        fontSize: token.fontSizeLG,
                        fontWeight: token.fontWeightStrong,
                        color: token.colorText,
                      }}>
                        Tasks Over Time
                      </Text>
                    }
                    style={{
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadow,
                    }}
                    styles={{
                      body: {
                        padding: token.paddingLG,
                      }
                    }}
                  >
                    <Line {...tasksLineConfig} />
                  </Card>
                </Col>
              </Row>
            )
          },
        ]}
      />

      {/* Recent Data Tables */}
      <Row gutter={[token.marginLG, token.marginLG]} style={{ marginTop: token.marginLG }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Text style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
              }}>
                Recent Tasks
              </Text>
            }
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Table
              dataSource={recentTasks}
              columns={taskColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{
                borderRadius: token.borderRadius,
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Text style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
              }}>
                Recent Leads
              </Text>
            }
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              body: {
                padding: token.paddingLG,
              }
            }}
          >
            <Table
              dataSource={recentLeads}
              columns={leadColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{
                borderRadius: token.borderRadius,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
