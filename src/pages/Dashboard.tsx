import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { Column, Pie, Line } from '@ant-design/charts';
import { leadsService } from '../services/leadsService';
import { dealsService } from '../services/dealsService';
import { tasksService } from '../services/tasksService';
import type { Lead, Deal, Task } from '../types';

const { Title, Text } = Typography;

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

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} >Dashboard</Title>
      <Row gutter={[16, 16]} >
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Leads" value={totalLeads} />
            <Text type="secondary">New leads collected</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Deals" value={totalDeals} />
            <Text type="secondary">Deals in pipeline</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Deal Value" value={totalDealValue} precision={0} />
            <Text type="secondary">Combined value of deals</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Conversion" value={`${conversionRate}%`} />
            <Text type="secondary">Won deals rate</Text>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12} xl={10}>
          <Card title="Deals by Stage (Total Value)">
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={7}>
          <Card title="Leads by Status">
            <Pie {...pieConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={24} xl={7}>
          <Card title="Monthly Revenue">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
      {/* Tasks section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12} xl={8}>
          <Card title="Top Clients by Task Count">
            <Column {...topClientsConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card title="Tasks by Status">
            <Pie {...tasksStatusPieConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={24} xl={8}>
          <Card title="Tasks Over Time">
            <Line {...tasksLineConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title="Recent Tasks">
            <Table dataSource={recentTasks} columns={taskColumns} rowKey="id" pagination={false} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title="Recent Leads">
            <Table dataSource={recentLeads} columns={leadColumns} rowKey="id" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}