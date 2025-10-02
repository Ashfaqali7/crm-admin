import { Card, Typography } from 'antd';
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
}

export function DealColumn({ title, deals = [] }: DealColumnProps) {
  const { setNodeRef } = useDroppable({
    id: title,
  });

  return (
    <Card
      title={<Title level={5}>{title} ({deals.length})</Title>}
      style={{
        minWidth: 300,
        maxWidth: 300,
        height: 'fit-content',
      }}
      bodyStyle={{
        padding: '8px',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto',
      }}
    >
      <SortableContext
        id={title}
        items={deals.map(deal => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </Card>
  );
}