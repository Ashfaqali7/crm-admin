import { useMemo } from 'react';
import { Card, Typography, Space, Button, Tooltip } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOutlined, EditOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Deal } from '../types';

const { Text, Title } = Typography;

interface DealCardProps {
  deal: Deal & { lead?: { name: string }; assigneeName?: string };
  style?: React.CSSProperties; // Allow custom styles from parent (e.g., DragOverlay)
}

export function DealCard({ deal, style: parentStyle }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(deal.id) });

  // Memoize deal data to prevent unnecessary re-renders
  const memoizedDeal = useMemo(() => deal, [deal]);

  // Map stage to icon and color
  const stageConfig = useMemo(() => {
    switch (memoizedDeal.stage) {
      case 'Won':
        return { icon: <CheckCircleOutlined />, color: '#52c41a' };
      case 'Lost':
        return { icon: <CloseCircleOutlined />, color: '#ff4d4f' };
      case 'In Progress':
        return { icon: <ClockCircleOutlined />, color: '#1890ff' };
      case 'New':
      default:
        return { icon: <ClockCircleOutlined />, color: '#fa8c16' };
    }
  }, [memoizedDeal.stage]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: 'grab',
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    ...parentStyle,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      aria-label={`Deal: ${memoizedDeal.title}, Stage: ${memoizedDeal.stage}`}
    >
      <Card
        size="small"
        hoverable
        style={{
          marginBottom: 12,
          border: `1px solid ${stageConfig.color}`,
          borderRadius: 6,
          background: '#fff',
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {memoizedDeal.title}
            </Title>
            <Tooltip title="Drag to move">
              <div
                {...listeners}
                {...attributes}
                role="button"
                tabIndex={0}
                aria-label="Drag handle"
                style={{ cursor: 'grab', display: 'inline-flex', alignItems: 'center', padding: 6 }}
              >
                <DragOutlined />
              </div>
            </Tooltip>
          </div>
          <Space direction="horizontal" size={8} style={{ width: '100%' }}>
            <Text type="secondary">
              <strong>Lead:</strong> {memoizedDeal.lead?.name || 'Unassigned'}
            </Text>
            {memoizedDeal.assigneeName && (
              <Text type="secondary">
                <strong>Assignee:</strong> {memoizedDeal.assigneeName}
              </Text>
            )}
          </Space>
          <Space direction="horizontal" size={8} style={{ width: '100%', alignItems: 'center' }}>
            <Text strong style={{ color: stageConfig.color }}>
              ${memoizedDeal.value?.toLocaleString()}
            </Text>
            <span style={{ color: stageConfig.color }}>{stageConfig.icon}</span>
          </Space>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Tooltip title="Edit Deal">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  // Trigger edit modal (requires implementation in Deals component)
                  document.dispatchEvent(new CustomEvent('openEditDealModal', { detail: { dealId: memoizedDeal.id } }));
                }}
                aria-label={`Edit deal: ${memoizedDeal.title}`}
              />
            </Tooltip>
          </div>
        </Space>
      </Card>
    </div>
  );
}