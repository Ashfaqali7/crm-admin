import { Tag, type TagProps } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface StatusTagProps extends TagProps {
  status: string;
}

export function StatusTag({ status, ...props }: StatusTagProps) {
  const statusConfig: Record<string, { color: TagProps['color']; icon: React.ReactNode; text: string }> = {
    'Done': {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'Done'
    },
    'In Progress': {
      color: 'warning',
      icon: <ClockCircleOutlined />,
      text: 'In Progress'
    },
    'Pending': {
      color: 'processing',
      icon: <ClockCircleOutlined />,
      text: 'Pending'
    },
    'New': {
      color: 'blue',
      icon: <ClockCircleOutlined />,
      text: 'New'
    },
    'Contacted': {
      color: 'orange',
      icon: <ClockCircleOutlined />,
      text: 'Contacted'
    },
    'Qualified': {
      color: 'green',
      icon: <CheckCircleOutlined />,
      text: 'Qualified'
    },
    'Lost': {
      color: 'red',
      icon: <MinusCircleOutlined />,
      text: 'Lost'
    },
    'Won': {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'Won'
    }
  };

  const config = statusConfig[status] || { 
    color: 'default', 
    icon: <ClockCircleOutlined />, 
    text: status 
  };

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      {...props}
    >
      {config.text}
    </Tag>
  );
}