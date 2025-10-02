import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Select, message } from 'antd';
import { usersService } from '../services/usersService';
import type { Profile, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

export function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    fetchUsers();
  }, [profile, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'sales') => {
    try {
      await usersService.update(userId, { role: newRole });
      message.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: Profile, b: Profile) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role, record: Profile) => (
        <Select
          value={role}
          style={{ width: 120 }}
          onChange={(value: Role) => handleRoleChange(record.id, value)}
        >
          <Option value="admin">Admin</Option>
          <Option value="sales">Sales</Option>
        </Select>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Sales', value: 'sales' },
      ],
      onFilter: (value: any, record: Profile) => record.role === value,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_text: string, record: Profile) => (
        <Tag color={record.role === 'admin' ? 'gold' : 'green'}>
          {record.role.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={2}>Users Management</Title>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}