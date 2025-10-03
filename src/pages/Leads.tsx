import { useEffect, useState, useMemo, type SetStateAction } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Space,
  message,
  theme,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { leadsService } from '../services/leadsService';
import { usersService } from '../services/usersService';
import { StatusTag } from '../components/StatusTag';
import type { Lead, Profile, Status } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getWithAssignee();
      setLeads(data);
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch {
      message.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        !searchText ||
        lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (lead.company?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
        (lead.phone?.includes(searchText) ?? false);

      const matchesStatus = !statusFilter || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchText, statusFilter]);

  const handleCreate = async (values: Partial<Lead>) => {
    try {
      await leadsService.create(values);
      message.success('Lead created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchLeads();
    } catch {
      message.error('Failed to create lead');
    }
  };

  const handleUpdate = async (id: string, values: Partial<Lead>) => {
    try {
      await leadsService.update(id, values);
      message.success('Lead updated successfully');
      fetchLeads();
    } catch {
      message.error('Failed to update lead');
    }
  };

  const stats = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      qualified: leads.filter(l => l.status === 'Qualified').length,
      lost: leads.filter(l => l.status === 'Lost').length,
    };
  }, [leads]);

  const statusOptions: Record<Status, { color: string; label: string }> = {
    New: { color: 'blue', label: 'New' },
    Contacted: { color: 'orange', label: 'Contacted' },
    Qualified: { color: 'green', label: 'Qualified' },
    Lost: { color: 'red', label: 'Lost' },
  };

  const columns = [

    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a: Lead, b: Lead) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
      width: 120,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      sorter: (a: Lead, b: Lead) => (a.company || '').localeCompare(b.company || ''),
      render: (company: string) => (
        <Text type="secondary">{company || 'Not specified'}</Text>
      ),
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => (
        <Space size="small">
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (phone: string) => (
        <Space size="small">
          <PhoneOutlined />
          <Text>{phone || 'Not provided'}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: Object.entries(statusOptions).map(([value, { label }]) => ({
        text: label,
        value,
      })),
      render: (status: Status, record: Lead) => (
        <Select
          value={status}
          onChange={val => handleUpdate(record.id, { status: val })}
          size="small"
          style={{ width: 140 }}
        >
          <Option value="New">
            <StatusTag status="New" />
          </Option>
          <Option value="Contacted">
            <StatusTag status="Contacted" />
          </Option>
          <Option value="Qualified">
            <StatusTag status="Qualified" />
          </Option>
          <Option value="Lost">
            <StatusTag status="Lost" />
          </Option>
        </Select>
      ),
      width: 100,
    },
    {
      title: 'Assigned',
      dataIndex: 'assigned_to',
      render: (assignedTo: string, record: Lead) => (
        <Select
          value={assignedTo}
          onChange={val => handleUpdate(record.id, { assigned_to: val })}
          allowClear
          placeholder="Assign user"
          size="small"
          style={{ width: 160 }}
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                {user.full_name}
              </Space>
            </Option>
          ))}
        </Select>
      ),
      width: 100,
    },
  ];

  return (
    <div >
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: token.marginXL }}>
        <Col>
          <Title level={3}>Leads Management</Title>
          <Text type="secondary">Manage and track your sales leads</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add New Lead
          </Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row gutter={[16, 16]} justify="space-between" style={{ marginBottom: token.marginXL }}>
        {[
          { key: 'total', title: 'Total Leads', value: stats.total, color: token.colorPrimary },
          { key: 'new', title: 'New Leads', value: stats.newLeads, color: token.colorInfo },
          { key: 'contacted', title: 'Contacted', value: stats.contacted, color: token.colorWarning },
          { key: 'qualified', title: 'Qualified', value: stats.qualified, color: token.colorSuccess },
          { key: 'lost', title: 'Lost Leads', value: stats.lost, color: token.colorError },
        ].map(stat => (
          <Col xs={24} sm={12} md={4} key={stat.key}  >
            <Card>
              <Statistic title={stat.title} value={stat.value} valueStyle={{ color: stat.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: token.marginLG }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search leads..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(statusOptions).map(([value, { color, label }]) => (
                <Option key={value} value={value}>
                  <Tag color={color}>{label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button icon={<ReloadOutlined />} onClick={fetchLeads} loading={loading}>
              Refresh
            </Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Text type="secondary">
              {filteredLeads.length} of {leads.length} leads
            </Text>
            {(searchText || statusFilter) && (
              <Button type="link" onClick={() => { setSearchText(''); setStatusFilter(null); }}>
                Clear filters
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          dataSource={filteredLeads}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No leads found. Try adjusting filters."
              />
            ),
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title="Add New Lead"
        open={modalVisible}
        onOk={() => form.submit()}
        okText="Create Lead"
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the lead name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="john@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 8900" />
          </Form.Item>

          <Form.Item name="status" label="Initial Status" initialValue="New">
            <Select>
              <Option value="New">
                <StatusTag status="New" />
              </Option>
              <Option value="Contacted">
                <StatusTag status="Contacted" />
              </Option>
              <Option value="Qualified">
                <StatusTag status="Qualified" />
              </Option>
              <Option value="Lost">
                <StatusTag status="Lost" />
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="assigned_to" label="Assign To">
            <Select allowClear placeholder="Select a team member">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user.full_name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

