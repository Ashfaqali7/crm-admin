import { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Typography, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { leadsService } from '../services/leadsService';
import { usersService } from '../services/usersService';
import type { Lead, Profile, Status } from '../types';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getWithAssignee();
      setLeads(data);
    } catch (error) {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const handleCreate = async (values: Partial<Lead>) => {
    try {
      await leadsService.create(values);
      message.success('Lead created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchLeads();
    } catch (error) {
      message.error('Failed to create lead');
    }
  };

  const handleUpdate = async (id: string, values: Partial<Lead>) => {
    try {
      await leadsService.update(id, values);
      message.success('Lead updated successfully');
      fetchLeads();
    } catch (error) {
      message.error('Failed to update lead');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Lead, b: Lead) => a.name.localeCompare(b.name),
    },
    {
      title: "Company",
      dataIndex: 'company',
      key: "company",
      sorter: (a: Lead, b: Lead) => (a.company || '').localeCompare(b.company || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'New', value: 'New' },
        { text: 'Contacted', value: 'Contacted' },
        { text: 'Qualified', value: 'Qualified' },
        { text: 'Lost', value: 'Lost' },
      ],
      onFilter: (value: string | number | boolean | React.Key, record: Lead) => record.status === value,
      render: (status: Status, record: Lead) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value: Status) => handleUpdate(record.id, { status: value })}
        >
          <Option value="New">New</Option>
          <Option value="Contacted">Contacted</Option>
          <Option value="Qualified">Qualified</Option>
          <Option value="Lost">Lost</Option>
        </Select>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      render: (assignedTo: string, record: Lead) => (
        <Select
          value={assignedTo}
          style={{ width: 120 }}
          onChange={(value) => handleUpdate(record.id, { assigned_to: value })}
          allowClear
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>{user.full_name}</Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Leads</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Lead
        </Button>
      </Space>

      <Table
        dataSource={leads}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Add New Lead"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="New"
          >
            <Select>
              <Option value="New">New</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Lost">Lost</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned_to"
            label="Assign To"
          >
            <Select allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.full_name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}