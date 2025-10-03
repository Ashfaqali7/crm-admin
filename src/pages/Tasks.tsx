import { useEffect, useState, useMemo, type SetStateAction } from 'react';
import {
  List,
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
  theme,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DownOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { tasksService } from '../services/tasksService';
import { leadsService } from '../services/leadsService';
import type { Task, Lead } from '../types';
import dayjs from 'dayjs';
import { StatusTag } from '../components/StatusTag';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function Tasks() {
  const { token } = theme.useToken();

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


  const renderDueDate = (due_date: string) => {
    const date = dayjs(due_date);
    const isOverdue = date.isBefore(dayjs(), 'day');
    const isToday = date.isSame(dayjs(), 'day');

    return (
      <Space style={{ gap: token.paddingXXS }}>
        <CalendarOutlined
          style={{
            color: isOverdue ? token.colorError : isToday ? token.colorWarning : token.colorTextSecondary,
            fontSize: token.fontSizeSM
          }}
        />
        <Text
          type={isOverdue ? 'danger' : isToday ? 'warning' : undefined}
          style={{
            fontSize: token.fontSizeSM,
            color: isOverdue ? token.colorError : isToday ? token.colorWarning : token.colorTextSecondary,
            fontWeight: isOverdue || isToday ? token.fontWeightStrong : 'normal'
          }}
        >
          {date.format('MMM D, YYYY')}
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
      key: 'In Progress',
      label: 'In Progress',
      onClick: () => setFilterStatus('In Progress'),
    },
    {
      key: 'Done',
      label: 'Done',
      onClick: () => setFilterStatus('Done'),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: token.colorBgLayout
    }}>
      <div

      >
        <Space
          style={{
            marginBottom: token.marginXXL,
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: token.paddingLG,
          }}
        >
          <Title
            level={3}
            style={{
              margin: 0,
              color: token.colorTextHeading,
              fontWeight: token.fontWeightStrong
            }}
          >
            Tasks
          </Title>
          <Space>
            <SearchInput
              placeholder="Search tasks..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
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
          <div style={{
            textAlign: 'center',
            padding: token.paddingXL,
            minHeight: token.controlHeightLG * 4
          }}>
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
                  padding: token.paddingLG,
                  marginBottom: token.marginSM,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  transition: `background-color ${token.motionDurationMid}`,
                  backgroundColor: task.status === 'Done' ? token.colorFillAlter : token.colorBgContainer,
                }}
                onMouseEnter={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) => (e.currentTarget.style.backgroundColor = token.colorFillSecondary)}
                onMouseLeave={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) =>
                  (e.currentTarget.style.backgroundColor = task.status === 'Done' ? token.colorFillAlter : token.colorBgContainer)
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
                <Space direction="vertical" style={{ flex: 1, width: '100%' }}>
                  <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: token.paddingSM,
                      minWidth: 0,
                      flex: 1
                    }}>
                      <Checkbox
                        checked={task.status === 'Done'}
                        onChange={(e) => handleStatusChange(task.id, e.target.checked)}
                        aria-label={`Toggle status for task: ${task.title}`}
                      />
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                          color: token.colorText,
                          fontSize: token.fontSizeLG,
                          lineHeight: token.lineHeightLG,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.title}
                      </Title>
                    </div>
                    <StatusTag status={task.status} />
                  </Space>
                  {task.description && (
                    <Text
                      type="secondary"
                      style={{
                        display: 'block',
                        marginTop: token.marginXS,
                        color: token.colorTextSecondary,
                        lineHeight: token.lineHeight
                      }}
                    >
                      {task.description}
                    </Text>
                  )}
                  <Space
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: token.marginSM,
                      width: '100%',
                      flexWrap: 'wrap',
                      gap: token.paddingSM
                    }}
                    size={token.marginSM}
                  >
                    <Text
                      type="secondary"
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM
                      }}
                    >
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
          title={
            <div style={{
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
              color: token.colorTextHeading
            }}>
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </div>
          }
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            setEditingTaskId(null);
            form.resetFields();
          }}
          okText={editingTaskId ? 'Update Task' : 'Create Task'}
          okButtonProps={{
            loading,
            type: 'primary',
            size: 'middle'
          }}
          cancelButtonProps={{
            type: 'default',
            size: 'middle'
          }}
          width={640}
          styles={{
            header: {
              padding: token.paddingLG,
              paddingBottom: token.paddingMD,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
            },
            body: {
              padding: token.paddingLG
            },
            footer: {
              padding: token.paddingMD,
              paddingTop: token.paddingLG,
              borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
            }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateOrUpdate}
            style={{ marginTop: token.marginLG }}
            size="middle"
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
                rules={[{ required: true, message: 'Please select a status!' }]}
              >
                <Select placeholder="Select task status">
                  <Option value="Pending">Pending</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Done">Done</Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
}
