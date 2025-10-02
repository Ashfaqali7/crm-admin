import { useMemo } from 'react';
import { Card, Typography, Empty, Badge, Button } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import type { Deal } from '../types';

const { Title } = Typography;

interface DealColumnProps {
  title: string;
  deals: (Deal & { lead?: { name: string } })[];
  style?: React.CSSProperties; // Allow custom styles from parent
  emptyComponent?: React.ReactNode; // Optional custom empty state
}

export function DealColumn({ title, deals = [], style, emptyComponent }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: { stage: title },
  });

  // Memoize deals to prevent unnecessary re-renders
  const sortedDeals = useMemo(() => deals, [deals]);

  return (
    <Card
      title={
        <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          <Badge
            count={deals.length}
            style={{ backgroundColor: '#1890ff', color: '#fff' }}
            showZero
            title={`${deals.length} deal${deals.length !== 1 ? 's' : ''}`}
          />
        </Title>
      }
      style={{
        flex: '1 1 280px',
        minWidth: 280,
        maxWidth: 320,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease, border 0.3s ease',
        border: isOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
        ...style,
      }}
      headStyle={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px',
      }}
      bodyStyle={{
        padding: 16,
        maxHeight: 'calc(100vh - 260px)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
      }}
      aria-label={`Deals in ${title} stage`}
    >
      <SortableContext
        items={sortedDeals.map((deal) => String(deal.id))}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef}>
          {sortedDeals.length > 0 ? (
            sortedDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          ) : (
            emptyComponent || (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={`No deals in ${title} stage`}
                style={{ margin: '24px 0', color: '#8c8c8c' }}
              >
                <Button
                  type="link"
                  onClick={() => {
                    // Trigger modal opening in parent component (e.g., Deals)
                    document.dispatchEvent(new CustomEvent('openAddDealModal', { detail: { stage: title } }));
                  }}
                >
                  Add a Deal
                </Button>
              </Empty>
            )
          )}
        </div>
      </SortableContext>
    </Card>
  );
}