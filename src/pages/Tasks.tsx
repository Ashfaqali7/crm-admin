import { useEffect, useState, useMemo } from 'react';
import {
  List,
  Card,
  Checkbox,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Typography,
  Space,
  message,
  Tag,
  Spin,
  Empty,
  Input as SearchInput,
  Tooltip,
  Dropdown,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { tasksService } from '../services/tasksService';
import { leadsService } from '../services/leadsService';
import type { Task, Lead } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksService.getWithLead();
      setTasks(data);
    } catch (error) {
      message.error('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      message.error('Failed to fetch leads. Please try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLeads();
  }, []);

  const handleCreateOrUpdate = async (values: any) => {
    setLoading(true);
    try {
      const task = {
        ...values,
        due_date: values.due_date.format('YYYY-MM-DD'),
        status: values.status || 'Pending',
      };
      if (editingTaskId) {
        await tasksService.update(editingTaskId, task);
        message.success({
          content: 'Task updated successfully',
          icon: <span role="img" aria-label="success">🎉</span>,
        });
      } else {
        await tasksService.create(task);
        message.success({
          content: 'Task created successfully',
          icon: <span role="img" aria-label="success">🎉</span>,
        });
      }
      setModalVisible(false);
      setEditingTaskId(null);
      form.resetFields();
      fetchTasks();
    } catch (error) {
      message.error(`Failed to ${editingTaskId ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, checked: boolean) => {
    try {
      await tasksService.update(taskId, { status: checked ? 'Done' : 'Pending' });
      fetchTasks();
    } catch (error) {
      message.error('Failed to update task status. Please try again.');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setModalVisible(true);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      lead_id: task.lead_id,
      due_date: task.due_date ? dayjs(task.due_date) : null,
      status: task.status,
    });
  };

  const handleDelete = async (taskId: string) => {
    try {
      await tasksService.delete(taskId);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      message.error('Failed to delete task. Please try again.');
    }
  };

  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Done
          </Tag>
        );
      default:
        return (
          <Tag color="blue" icon={<CheckCircleOutlined />}>
            Pending
          </Tag>
        );
    }
  };

  const renderDueDate = (due_date: string) => {
    const date = dayjs(due_date);
    const isOverdue = date.isBefore(dayjs(), 'day');
    const isToday = date.isSame(dayjs(), 'day');
    return (
      <Space>
        <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : isToday ? '#fa8c16' : undefined }} />
        <Text type={isOverdue ? 'danger' : isToday ? 'warning' : undefined}>
          {date.format('MMMM D, YYYY')}
        </Text>
      </Space>
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!filterStatus || task.status === filterStatus)
    );
  }, [tasks, searchQuery, filterStatus]);

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'all',
      label: 'All Statuses',
      onClick: () => setFilterStatus(null),
    },
    {
      key: 'Pending',
      label: 'Pending',
      onClick: () => setFilterStatus('Pending'),
    },
    {
      key: 'Done',
      label: 'Done',
      onClick: () => setFilterStatus('Done'),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          background: '#fff',
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space
          style={{
            marginBottom: 24,
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          <Title level={3} style={{ margin: 0, color: '#1F1F1F' }}>
            Tasks
          </Title>
          <Space>
            <SearchInput
              placeholder="Search tasks..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
              <Button>
                Filter: {filterStatus || 'All'} <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTaskId(null);
                setModalVisible(true);
                form.resetFields();
              }}
            >
              Add Task
            </Button>
          </Space>
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={filteredTasks}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No tasks yet. Create one to get started!"
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Add Task
                  </Button>
                </Empty>
              ),
            }}
            renderItem={(task) => (
              <List.Item
                style={{
                  padding: '16px',
                  marginBottom: 8,
                  border: '1px solid #a19595ff',
                  borderRadius: 6,
                  transition: 'background 0.3s',
                  background: task.status === 'Done' ? '#f5f5f5' : '#fff',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = task.status === 'Done' ? '#f5f5f5' : '#fff')
                }
                actions={[
                  <Tooltip title="Edit Task">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(task)}
                      aria-label={`Edit task: ${task.title}`}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete Task">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                    />
                  </Tooltip>,
                ]}
              >
                <Space direction="vertical" style={{ flex: 1 }}>
                  <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Checkbox
                        checked={task.status === 'Done'}
                        onChange={(e) => handleStatusChange(task.id, e.target.checked)}
                        aria-label={`Toggle status for task: ${task.title}`}
                      />
                      <Title
                        level={5}
                        style={{ margin: 0, textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}
                      >
                        {task.title}
                      </Title>
                    </div>
                    {renderStatusTag(task.status)}
                  </Space>
                  {task.description && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                      {task.description}
                    </Text>
                  )}
                  <Space
                    style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}
                    size="large"
                  >
                    <Text type="secondary">
                      <strong>Lead:</strong> {leads.find((l) => l.id === task.lead_id)?.name || 'Unknown'}
                    </Text>
                    {renderDueDate(task.due_date)}
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        )}

        <Modal
          title={editingTaskId ? 'Edit Task' : 'Add New Task'}
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            setEditingTaskId(null);
            form.resetFields();
          }}
          okText={editingTaskId ? 'Update Task' : 'Create Task'}
          okButtonProps={{ loading, type: 'primary' }}
          cancelButtonProps={{ type: 'default' }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateOrUpdate}
            style={{ marginTop: 16 }}
          >
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Task Title"
              rules={[{ required: true, message: 'Please input the task title!' }]}
              tooltip="Enter a concise title for the task"
            >
              <Input placeholder="e.g., Follow up with client" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the task description!' }]}
              tooltip="Provide details about the task"
            >
              <TextArea rows={4} placeholder="e.g., Schedule a call to discuss contract terms" />
            </Form.Item>
            <Form.Item
              name="lead_id"
              label="Related Lead"
              rules={[{ required: true, message: 'Please select a lead!' }]}
            >
              <Select placeholder="Select a lead" showSearch optionFilterProp="children">
                {leads.map((lead) => (
                  <Option key={lead.id} value={lead.id}>
                    {lead.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="due_date"
              label="Due Date"
              rules={[{ required: true, message: 'Please select a due date!' }]}
              tooltip="Select the task's due date"
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            {editingTaskId && (
              <Form.Item
                name="status"
                label="Status"
                initialValue="Pending"
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Done">Done</Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
}