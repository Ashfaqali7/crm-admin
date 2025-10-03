import { useMemo } from 'react';
import { Card, Typography, Empty, Badge, Button, theme } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import { PlusOutlined } from '@ant-design/icons';
import type { Deal } from '../types';

const { Title } = Typography;

interface DealColumnProps {
  title: string;
  deals: (Deal & { lead?: { name: string } })[];
  style?: React.CSSProperties;
  openAddDealModal?: (dealId?: string) => void;
}

export function DealColumn({ title, deals = [], style, openAddDealModal }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: { stage: title },
  });

  const { token } = theme.useToken();

  // Memoize deals to prevent unnecessary re-renders
  const sortedDeals = useMemo(() => deals, [deals]);

  // Calculate total value for the column
  const totalValue = useMemo(() => {
    return sortedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  }, [sortedDeals]);

  return (
    <Card
      title={
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          <Title
            level={5}
            style={{
              margin: 0,
              color: token.colorText,
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
            }}
          >
            {title}
          </Title>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
          }}>
            <Badge
              count={deals.length}
              style={{
                backgroundColor: token.colorPrimary,
                color: token.colorTextLightSolid,
                borderRadius: token.borderRadius,
                fontSize: token.fontSizeSM,
                minWidth: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              showZero
              title={`${deals.length} deal${deals.length !== 1 ? 's' : ''}`}
            />
            {totalValue > 0 && (
              <span style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary,
                fontWeight: token.fontWeightStrong,
              }}>
                ${totalValue.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      }
      style={{
        flex: '1 1 280px',
        minWidth: 280,
        maxWidth: 320,
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: isOver
          ? `2px dashed ${token.colorPrimary}`
          : `1px solid ${token.colorBorder}`,
        boxShadow: isOver
          ? `0 0 0 2px ${token.colorPrimary}33`
          : token.boxShadow,
        transition: `all ${token.motionDurationMid}`,
        position: 'relative',
        ...style,
      }}
      styles={{
        header: {
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          padding: `${token.padding}px ${token.paddingLG}px`,
          borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
        },
        body: {
          padding: token.paddingLG,
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          // Custom scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: `${token.colorTextSecondary}33 transparent`,
        }
      }}
      aria-label={`Deals in ${title} stage`}
    >
      <SortableContext
        id={title}
        items={sortedDeals.map((deal) => String(deal.id))}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} style={{ minHeight: 100 }}>
          {sortedDeals.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: token.marginXS,
            }}>
              {sortedDeals.map((deal) => (
                <DealCard
                  openAddDealModal={openAddDealModal}
                  key={deal.id}
                  deal={deal}
                />
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeSM,
                }}>
                  No deals in {title} stage
                </span>
              }
              style={{
                margin: `${token.marginXXL}px 0`,
                padding: token.paddingLG,
              }}
            >
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => openAddDealModal?.()}
                style={{
                  borderColor: token.colorPrimary,
                  color: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  fontSize: token.fontSizeSM,
                }}
              >
                Add a Deal
              </Button>
            </Empty>
          )}
        </div>
      </SortableContext>

      {/* Drop zone indicator */}
      {isOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `${token.colorPrimary}08`,
          border: `2px dashed ${token.colorPrimary}`,
          borderRadius: token.borderRadiusLG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center',
            color: token.colorPrimary,
            fontSize: token.fontSizeLG,
            fontWeight: token.fontWeightStrong,
          }}>
            Drop deal here
          </div>
        </div>
      )}
    </Card>
  );
}
