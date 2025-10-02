import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, Select, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { dealsService } from '../services/dealsService';
import { leadsService } from '../services/leadsService';
import { DealCard } from '../components/DealCard';
import { DealColumn } from '../components/DealColumn';
import type { Deal, Lead } from '../types';

const { Title } = Typography;
const { Option } = Select;

const stages = ['New', 'In Progress', 'Won', 'Lost'] as const;

interface DealCard extends Deal {
  leadName?: string;
  assigneeName?: string;
}

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [draggingDeal, setDraggingDeal] = useState<Deal | null>(null);
  const [form] = Form.useForm();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const fetchDeals = async () => {
    try {
      const data = await dealsService.getWithDetails();
      setDeals(data);
    } catch (error) {
      message.error('Failed to fetch deals');
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
    fetchDeals();
    fetchLeads();
  }, []);

  const handleCreate = async (values: Partial<Deal>) => {
    try {
      await dealsService.create(values);
      message.success('Deal created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchDeals();
    } catch (error) {
      message.error('Failed to create deal');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedDeal = deals.find((deal) => deal.id === active.id);
    if (!draggedDeal) return;

    // If dropping in a column (stage change)
    if (stages.includes(over.id as typeof stages[number])) {
      const newStage = over.id as typeof stages[number];
      if (draggedDeal.stage !== newStage) {
        try {
          await dealsService.update(draggedDeal.id, { stage: newStage });
          fetchDeals();
        } catch (error) {
          message.error('Failed to update deal stage');
        }
      }
    }
    // If dropping on another deal (reordering)
    else if (active.id !== over.id) {
      const oldIndex = deals.findIndex((deal) => deal.id === active.id);
      const newIndex = deals.findIndex((deal) => deal.id === over.id);
      
      const newDeals = arrayMove(deals, oldIndex, newIndex);
      setDeals(newDeals);
    }
    
    setDraggingDeal(null);
  };

  const handleDragStart = (event: any) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setDraggingDeal(deal);
    }
  };

  const groupedDeals = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter((deal) => deal.stage === stage);
    return acc;
  }, {} as Record<typeof stages[number], Deal[]>);

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Deals Pipeline</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add Deal
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
            {stages.map((stage) => (
              <DealColumn
                key={stage}
                title={stage}
                deals={groupedDeals[stage]}
              />
            ))}
          </div>

          <DragOverlay>
            {draggingDeal ? (
              <DealCard deal={draggingDeal} />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Modal
          title="Add New Deal"
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input the deal title!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lead_id"
              label="Related Lead"
              rules={[{ required: true, message: 'Please select a lead!' }]}
            >
              <Select>
                {leads.map(lead => (
                  <Option key={lead.id} value={lead.id}>{lead.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="value"
              label="Value"
              rules={[{ required: true, message: 'Please input the deal value!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="stage"
              label="Stage"
              initialValue="New"
            >
              <Select>
                {stages.map(stage => (
                  <Option key={stage} value={stage}>{stage}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}