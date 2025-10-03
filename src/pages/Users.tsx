import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Select, message, theme, Space, Button, Tooltip, Avatar, Divider } from 'antd';
import { usersService } from '../services/usersService';
import type { Profile, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export function Users() {
  const { token } = theme.useToken();

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
      title: (
        <div style={{
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
          color: token.colorTextHeading
        }}>
          Name
        </div>
      ),
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: Profile, b: Profile) => a.full_name.localeCompare(b.full_name),
      render: (text: string) => (
        <Text style={{
          fontSize: token.fontSize,
          color: token.colorText,
          fontWeight: token.fontWeightStrong
        }}>
          {text}
        </Text>
      ),
    },
    {
      title: (
        <div style={{
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
          color: token.colorTextHeading
        }}>
          Role
        </div>
      ),
      dataIndex: 'role',
      key: 'role',
      render: (role: Role, record: Profile) => (
        <Select
          value={role}
          style={{
            width: 140,
            borderRadius: token.borderRadius
          }}
          size="middle"
          onChange={(value: Role) => handleRoleChange(record.id, value)}
        >
          <Option value="admin">
            <div style={{ display: 'flex', alignItems: 'center', gap: token.paddingXXS }}>
              <CrownOutlined style={{ color: token.colorPrimary }} />
              Admin
            </div>
          </Option>
          <Option value="sales">
            <div style={{ display: 'flex', alignItems: 'center', gap: token.paddingXXS }}>
              <TeamOutlined style={{ color: token.colorSuccess }} />
              Sales
            </div>
          </Option>
        </Select>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Sales', value: 'sales' },
      ],
      onFilter: (value: any, record: Profile) => record.role === value,
    },
    {
      title: (
        <div style={{
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
          color: token.colorTextHeading
        }}>
          Phone
        </div>
      ),
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => (
        <Text style={{
          fontSize: token.fontSize,
          color: token.colorTextSecondary
        }}>
          {text || 'Not provided'}
        </Text>
      ),
    },
    {
      title: (
        <div style={{
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
          color: token.colorTextHeading
        }}>
          Status
        </div>
      ),
      key: 'status',
      render: (_text: string, record: Profile) => {
        const isAdmin = record.role === 'admin';
        return (
          <Tag
            color={isAdmin ? 'warning' : 'success'}
            style={{
              borderRadius: token.borderRadius,
              fontSize: token.fontSizeSM,
              padding: `${token.paddingXXS}px ${token.paddingXS}px`,
              fontWeight: token.fontWeightStrong,
              border: 'none'
            }}
            icon={isAdmin ? <CrownOutlined /> : <TeamOutlined />}
          >
            {record.role.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  // Calculate user statistics
  const adminCount = users.filter(user => user.role === 'admin').length;
  const salesCount = users.filter(user => user.role === 'sales').length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: token.colorBgLayout
    }}>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          // boxShadow: token.boxShadow,
          backgroundColor: token.colorBgContainer,
        }}
        bodyStyle={{
          padding: token.paddingLG
        }}
      >
        {/* Header Section */}
        <div style={{
          marginBottom: token.marginXXL,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: token.paddingLG
        }}>
          <div>
            <Title
              level={3}
              style={{
                margin: 0,
                color: token.colorTextHeading,
                fontWeight: token.fontWeightStrong
              }}
            >
              <TeamOutlined style={{ marginRight: token.marginXS }} />
              Users Management
            </Title>
            <div style={{ marginTop: token.marginXS }}>
              <Space size={token.marginLG}>
                <Text
                  type="secondary"
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeLG
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: token.colorText,
                      fontSize: token.fontSizeLG
                    }}
                  >
                    {users.length}
                  </Text> total users •{' '}
                  <Text
                    strong
                    style={{
                      color: token.colorPrimary,
                      fontSize: token.fontSizeLG
                    }}
                  >
                    {adminCount}
                  </Text> admins •{' '}
                  <Text
                    strong
                    style={{
                      color: token.colorSuccess,
                      fontSize: token.fontSizeLG
                    }}
                  >
                    {salesCount}
                  </Text> sales
                </Text>
              </Space>
            </div>
          </div>

          <div style={{ display: 'flex', gap: token.paddingSM, alignItems: 'center' }}>
            <Tooltip title="Refresh users">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchUsers()}
                loading={loading}
                shape="circle"
                size="middle"
              />
            </Tooltip>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          marginBottom: token.marginLG,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: token.paddingLG
        }}>
          <Card
            size="small"
            style={{
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              backgroundColor: token.colorPrimaryBg
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <CrownOutlined style={{
                fontSize: token.fontSizeXL,
                color: token.colorPrimary,
                marginBottom: token.marginXS
              }} />
              <div style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText
              }}>
                {adminCount}
              </div>
              <div style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary
              }}>
                Administrators
              </div>
            </div>
          </Card>

          <Card
            size="small"
            style={{
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              backgroundColor: token.colorSuccessBg
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{
                fontSize: token.fontSizeXL,
                color: token.colorSuccess,
                marginBottom: token.marginXS
              }} />
              <div style={{
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
                color: token.colorText
              }}>
                {salesCount}
              </div>
              <div style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary
              }}>
                Sales Team
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            style: {
              marginTop: token.marginLG,
              padding: `${token.paddingSM}px 0`
            }
          }}
          scroll={{ x: 800 }}
          style={{
            borderRadius: token.borderRadiusLG,
            overflow: 'hidden'
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
