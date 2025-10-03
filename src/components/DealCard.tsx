import { useMemo } from 'react';
import { Card, Typography, Space, Button, Tooltip, theme, Tag } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOutlined, EditOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Deal } from '../types';

const { Text, Title } = Typography;

interface DealCardProps {
  deal: Deal & { lead?: { name: string }; assigneeName?: string };
  style?: React.CSSProperties;
  openAddDealModal?: (dealId?: string) => void;
}

export function DealCard({ deal, style: parentStyle, openAddDealModal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(deal.id) });

  const { token } = theme.useToken();

  // Memoize deal data to prevent unnecessary re-renders
  const memoizedDeal = useMemo(() => deal, [deal]);

  // Map stage to icon, color, and status using theme tokens
  const stageConfig = useMemo(() => {
    switch (memoizedDeal.stage) {
      case 'Won':
        return {
          icon: <CheckCircleOutlined />,
          color: token.colorSuccess,
          bgColor: `${token.colorSuccess}15`,
          status: 'Won'
        };
      case 'Lost':
        return {
          icon: <CloseCircleOutlined />,
          color: token.colorError,
          bgColor: `${token.colorError}15`,
          status: 'Lost'
        };
      case 'In Progress':
        return {
          icon: <ClockCircleOutlined />,
          color: token.colorInfo,
          bgColor: `${token.colorInfo}15`,
          status: 'In Progress'
        };
      case 'New':
      default:
        return {
          icon: <ClockCircleOutlined />,
          color: token.colorWarning,
          bgColor: `${token.colorWarning}15`,
          status: 'New'
        };
    }
  }, [memoizedDeal.stage, token]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: 'grab',
    boxShadow: isDragging
      ? `0 8px 24px ${token.colorPrimary}33`
      : `0 2px 8px ${token.colorBorder}66`,
    borderRadius: token.borderRadiusLG,
    ...parentStyle,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      aria-label={`Deal: ${memoizedDeal.title}, Stage: ${memoizedDeal.stage}`}
    >
      <Card
        size="small"
        hoverable
        style={{
          marginBottom: token.marginLG,
          border: `2px solid ${stageConfig.color}33`,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: `all ${token.motionDurationMid}`,
          boxShadow: isDragging
            ? `0 8px 24px ${token.colorPrimary}33`
            : `0 2px 8px ${token.colorBorder}66`,
        }}
        styles={{
          body: {
            padding: token.paddingLG,
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={token.marginSM}>
          {/* Header with title and drag handle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: token.marginSM,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: token.colorText,
                  fontSize: token.fontSizeLG,
                  fontWeight: token.fontWeightStrong,
                  lineHeight: 1.3,
                }}
                ellipsis={{ tooltip: memoizedDeal.title }}
              >
                {memoizedDeal.title}
              </Title>
            </div>
            <Tooltip title="Drag to move">
              <Button
                type="text"
                size="small"
                icon={<DragOutlined />}
                style={{
                  color: token.colorTextSecondary,
                  cursor: 'grab',
                  fontSize: token.fontSizeLG,
                }}
                aria-label="Drag handle"
              />
            </Tooltip>
          </div>



          {/* Deal information */}
          <Space direction="vertical" style={{ width: '100%' }} size={token.marginXS}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: token.marginXXS,
            }}>
              <Text
                type="secondary"
                style={{
                  fontSize: token.fontSizeSM,
                  lineHeight: 1.4,
                }}
              >
                <strong>Lead:</strong> {memoizedDeal.lead?.name || 'Unassigned'}
              </Text>
              {memoizedDeal.assigneeName && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: token.fontSizeSM,
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Assignee:</strong> {memoizedDeal.assigneeName}
                </Text>
              )}
            </div>

            {/* Deal value */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${token.paddingSM}px ${token.padding}px`,
              background: stageConfig.bgColor,
              borderRadius: token.borderRadiusSM,
              border: `1px solid ${stageConfig.color}33`,
            }}>
              <Text
                strong
                style={{
                  color: stageConfig.color,
                  fontSize: token.fontSizeLG,
                  fontWeight: token.fontWeightStrong,
                }}
              >
                ${memoizedDeal.value?.toLocaleString()}
              </Text>
              <div style={{ color: stageConfig.color }}>
                {stageConfig.icon}
              </div>
            </div>
          </Space>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: token.marginSM,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            paddingTop: token.marginSM,
          }}>
            <Tooltip title="Edit Deal">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openAddDealModal?.(memoizedDeal.id);
                }}
                style={{
                  color: token.colorTextSecondary,
                  borderRadius: token.borderRadius,
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
