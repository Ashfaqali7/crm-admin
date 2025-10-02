import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { Area } from '@ant-design/charts';
import { leadsService } from '../services/leadsService';
import { dealsService } from '../services/dealsService';
import type { Lead,  } from '../types';

const { Title } = Typography;

export function Dashboard() {
  const [leadCount, setLeadCount] = useState(0);
  const [openDeals, setOpenDeals] = useState(0);
  const [wonDeals, setWonDeals] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [dealData, setDealData] = useState<{ stage: string; totalValue: number }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch leads
        const leads = await leadsService.getAll();
        setLeadCount(leads.length);
        setRecentLeads(leads.slice(0, 5));

        // Fetch deals
        const deals = await dealsService.getAll();
        setOpenDeals(deals.filter(d => d.stage === 'In Progress').length);
        setWonDeals(deals.filter(d => d.stage === 'Won').length);

        // Fetch deal data for chart
        const dealsByValue = await dealsService.getDealsByValue();
        setDealData(dealsByValue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const leadColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Leads" value={leadCount} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Open Deals" value={openDeals} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Won Deals" value={wonDeals} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Deals by Stage">
            <Area
              data={dealData}
              xField="stage"
              yField="totalValue"
              seriesField="stage"
              padding="auto"
              width={500}
              height={200}
              autoFit
              axis={{
                x: { title: { text: 'Stage' } },
                y: { title: { text: 'Total Value' } }
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}> 
          <Card title="Recent Leads">
            <Table 
              dataSource={recentLeads} 
              columns={leadColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}