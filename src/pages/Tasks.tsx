import { useEffect, useState } from 'react';
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
  Tag
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
  const [form] = Form.useForm();

  const fetchTasks = async () => {
    try {
      const data = await tasksService.getWithLead();
      setTasks(data);
    } catch (error) {
      message.error('Failed to fetch tasks');
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      message.error('Failed to fetch leads');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLeads();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const task = {
        ...values,
        due_date: values.due_date.format('YYYY-MM-DD'),
        status: 'Pending'
      };
      await tasksService.create(task);
      message.success('Task created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchTasks();
    } catch (error) {
      message.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, checked: boolean) => {
    try {
      await tasksService.update(taskId, {
        status: checked ? 'Done' : 'Pending'
      });
      fetchTasks();
    } catch (error) {
      message.error('Failed to update task status');
    }
  };

  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'Done':
        return <Tag color="green">Done</Tag>;
      default:
        return <Tag color="blue">Pending</Tag>;
    }
  };

  const renderDueDate = (due_date: string) => {
    const date = dayjs(due_date);
    const isOverdue = date.isBefore(dayjs(), 'day');
    const isToday = date.isSame(dayjs(), 'day');
    return (
      <Text type={isOverdue ? 'danger' : isToday ? 'warning' : undefined}>
        {date.format('MMMM D, YYYY')}
      </Text>
    );
  };

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>Tasks</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add Task
          </Button>
        </Space>
<List
  dataSource={tasks}
  locale={{ emptyText: "No tasks yet. Create one to get started!" }}
  renderItem={(task) => (
    <List.Item style={{ padding: "16px 12px", borderBottom: "1px solid #f0f0f0" }}>
      <Space direction="vertical" style={{ flex: 1 }}>
        {/* Title & Status */}
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox
            checked={task.status === 'Done'}
            onChange={(e) => handleStatusChange(task.id, e.target.checked)}
          />
          <Text delete={task.status === 'Done'} strong>
            {task.title}
          </Text>
          </div>
          {renderStatusTag(task.status)}
        </Space>

        {/* Description */}
        {task.description && (
          <Text type="secondary">{task.description}</Text>
        )}

        <Space style={{display:"flex",justifyContent:"space-between"}} size="large">
          <Text type="secondary">
           {leads.find(l => l.id === task.lead_id)?.name || 'Unknown'}
          </Text>
          <Text type="secondary">
           {renderDueDate(task.due_date)}
          </Text>
        </Space>
      </Space>
    </List.Item>
  )}
/>

        <Modal
          title="Add New Task"
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          okText="Create Task"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please add title!' }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the task description!' }]}
            >
              <TextArea rows={4} placeholder="Enter task details" />
            </Form.Item>

            <Form.Item
              name="lead_id"
              label="Related Lead"
              rules={[{ required: true, message: 'Please select a lead!' }]}
            >
              <Select placeholder="Select a lead">
                {leads.map(lead => (
                  <Option key={lead.id} value={lead.id}>{lead.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="due_date"
              label="Due Date"
              rules={[{ required: true, message: 'Please select a due date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
