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
} from '@ant-design/icons';
import { tasksService } from '../services/tasksService';
import { leadsService } from '../services/leadsService';
import type { Task, Lead } from '../types';
import dayjs from 'dayjs';
import { StatusTag } from '../components/StatusTag';
import { createStyles } from 'antd-style';
import ExportButton from '../components/ExportButton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const useStyles = createStyles(({ token }) => ({
  container: {
    "&&": {
      minHeight: "100vh",
      backgroundColor: token.colorBgLayout,
      "@media (max-width: 768px)": {
        padding: token.paddingSM,
      },
    },
  },

  header: {
    "&&": {
      marginBottom: token.marginXXL,
      justifyContent: "space-between",
      width: "100%",
      flexWrap: "wrap",
      gap: token.paddingLG,
      "@media (max-width: 768px)": {
        marginBottom: token.marginLG,
      },
    },
  },

  title: {
    "&&": {
      margin: 0,
      color: token.colorTextHeading,
      fontWeight: token.fontWeightStrong,
    },
  },

  searchContainer: {
    "&&": {
      display: "flex",
      gap: token.marginSM,
      flexWrap: "wrap",
      "@media (max-width: 768px)": {
        width: "100%",
      },
    },
  },

  searchInput: {
    "&&": {
      minWidth: 200,
      "@media (max-width: 768px)": {
        flex: 1,
        minWidth: 0,
      },
    },
  },

  filterButton: {
    "&&": {
      "@media (max-width: 768px)": {
        flex: 1,
      },
    },
  },

  addButton: {
    "&&": {
      "@media (max-width: 768px)": {
        flex: 1,
      },
    },
  },

  spinnerContainer: {
    "&&": {
      textAlign: "center",
      padding: token.paddingXL,
      minHeight: token.controlHeightLG * 4,
    },
  },

  listItem: {
    "&&": {
      padding: token.paddingLG,
      marginBottom: token.marginSM,
      backgroundColor: token.colorBgContainer,
      border: `${token.lineWidth}px ${token.lineType} ${token.colorBorder}`,
      borderRadius: token.borderRadiusLG,
      transition: `background-color ${token.motionDurationMid}`,
      "&:hover": {
        backgroundColor: token.colorFillSecondary,
      },
      "@media (max-width: 768px)": {
        padding: token.paddingSM,
      },
    },
  },

  taskHeader: {
    "&&": {
      display: "flex",
      alignItems: "center",
      gap: token.paddingSM,
      minWidth: 0,
      flex: 1,
    },
  },

  taskTitle: {
    "&&": {
      margin: 0,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },

  taskDescription: {
    "&&": {
      display: "block",
      marginTop: token.marginXS,
      color: token.colorTextSecondary,
      lineHeight: token.lineHeight,
    },
  },

  taskInfo: {
    "&&": {
      display: "flex",
      justifyContent: "space-between",
      marginTop: token.marginSM,
      width: "100%",
      flexWrap: "wrap",
      gap: token.paddingSM,
    },
  },

  taskInfoText: {
    "&&": {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
    },
  },

  modalHeader: {
    "&&": {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      color: token.colorTextHeading,
    },
  },

  modalContent: {
    "&&": {
      marginTop: token.marginLG,
    },
  },

  dueDateContainer: {
    "&&": {
      gap: token.paddingXXS,
    },
  },

  dueDateIcon: {
    "&&": {
      // Styles will be applied inline as they depend on dynamic values
    },
  },

  doneTask: {
    "&&": {
      backgroundColor: token.colorFillAlter,
    },
  },

  pendingTask: {
    "&&": {
      backgroundColor: token.colorBgContainer,
    },
  },

  taskActions: {
    "&&": {
      display: "flex",
      gap: token.marginXS,
    },
  },
  
  modal: {
    "&&": {
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
    },
  },
}));

export function Tasks() {
  const { styles } = useStyles();
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
      <Space className={styles.dueDateContainer}>
        <CalendarOutlined
          className={styles.dueDateIcon}
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

  const exportColumns = [
    { key: 'title', title: 'Title' },
    { key: 'description', title: 'Description' },
    { 
      key: 'lead_id', 
      title: 'Lead',
      render: (value: string) => {
        const lead = leads.find(l => l.id === value);
        return lead ? lead.name : 'Unknown Lead';
      }
    },
    { 
      key: 'due_date', 
      title: 'Due Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'status', title: 'Status' },
    { 
      key: 'created_at', 
      title: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

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
    <div className={styles.container}>
      <Space className={styles.header}>
        <Title level={3} className={styles.title}>
          Tasks
        </Title>
        <Space className={styles.searchContainer}>
          <SearchInput
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            allowClear
          />
          <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
            <Button className={styles.filterButton}>
              Filter: {filterStatus || 'All'} <DownOutlined />
            </Button>
          </Dropdown>
          <ExportButton 
            data={filteredTasks} 
            columns={exportColumns} 
            filename="tasks-export" 
            disabled={filteredTasks.length === 0}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTaskId(null);
              setModalVisible(true);
              form.resetFields();
            }}
            className={styles.addButton}
          >
            Add Task
          </Button>
        </Space>
      </Space>

      {loading ? (
        <div className={styles.spinnerContainer}>
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
              className={`${styles.listItem} ${task.status === 'Done' ? styles.doneTask : styles.pendingTask}`}
              actions={[
                <div className={styles.taskActions}>
                  <Tooltip title="Edit Task">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(task)}
                      aria-label={`Edit task: ${task.title}`}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                    />
                  </Tooltip>
                </div>
              ]}
            >
              <Space direction="vertical" style={{ flex: 1, width: '100%' }}>
                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div className={styles.taskHeader}>
                    <Checkbox
                      checked={task.status === 'Done'}
                      onChange={(e) => handleStatusChange(task.id, e.target.checked)}
                      aria-label={`Toggle status for task: ${task.title}`}
                    />
                    <Title
                      level={5}
                      className={styles.taskTitle}
                      style={{
                        textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                        color: token.colorText,
                      }}
                    >
                      {task.title}
                    </Title>
                  </div>
                  <StatusTag status={task.status} />
                </Space>
                {task.description && (
                  <Text type="secondary" className={styles.taskDescription}>
                    {task.description}
                  </Text>
                )}
                <Space className={styles.taskInfo} size={token.marginSM}>
                  <Text type="secondary" className={styles.taskInfoText}>
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
        title={<div className={styles.modalHeader}>
          {editingTaskId ? 'Edit Task' : 'Add New Task'}
        </div>}
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
          className={styles.modalContent}
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
  );
}