import { Card, Typography } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '../types';

const { Text } = Typography;

interface DealCardProps {
  deal: Deal & { lead?: { name: string } };
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        size="small" 
        style={{ marginBottom: 8 }}
        title={deal.title}
      >
        <div>
          <Text type="secondary">Lead: {deal.lead?.name}</Text>
        </div>
        <div>
          <Text strong>
            ${deal.value?.toLocaleString()}
          </Text>
        </div>
      </Card>
    </div>
  );
}