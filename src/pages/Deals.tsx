import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Typography, message, Spin, } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  // Optionally include pointerWithin collision detection for better column drops
  useEffect(() => {
    // noop: placeholder in case we want to dynamically change sensors later
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await dealsService.getWithDetails();
      setDeals(data);
    } catch (error) {
      message.error('Failed to fetch deals. Please try again.');
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
    fetchDeals();
    fetchLeads();
  }, []);

  const handleCreate = async (values: Partial<Deal>) => {
    setLoading(true);
    try {
      await dealsService.create(values);
      message.success({
        content: 'Deal created successfully',
        icon: <span role="img" aria-label="success">🎉</span>,
      });
      setModalVisible(false);
      form.resetFields();
      fetchDeals();
    } catch (error) {
      message.error('Failed to create deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setDraggingDeal(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string | undefined;

    const draggedDeal = deals.find((deal) => deal.id === activeId);
    if (!draggedDeal) {
      setDraggingDeal(null);
      return;
    }

    try {
      if (stages.includes(overId as typeof stages[number])) {
        const newStage = overId as typeof stages[number];
        if (draggedDeal.stage !== newStage) {
          await dealsService.update(draggedDeal.id, { stage: newStage });
          await fetchDeals();
        }
      } else {
        const overDeal = deals.find((d) => d.id === overId);
        if (overDeal && activeId !== overDeal.id) {
          const oldIndex = deals.findIndex((d) => d.id === activeId);
          const newIndex = deals.findIndex((d) => d.id === overId);
          const newDeals = arrayMove(deals, oldIndex, newIndex);
          setDeals(newDeals);
        }
      }
    } catch (error) {
      message.error('Failed to update deal. Please try again.');
    } finally {
      setDraggingDeal(null);
    }
  };

  const handleDragStart = (event: any) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setDraggingDeal(deal);
    }
  };

  const filteredDeals = deals.filter((deal) =>
    deal.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDeals = stages.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter((deal) => deal.stage === stage);
    return acc;
  }, {} as Record<typeof stages[number], Deal[]>);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: '#1F1F1F' }}>
          Deals Pipeline
        </Title>
        <div style={{ display: 'flex', gap: 16 }}>
          <Input
            placeholder="Search deals..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add Deal
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div
            style={{
              display: 'flex',
              gap: 24,
              overflowX: 'auto',
              padding: '16px 0',
              justifyContent: "space-between"
            }}
          >
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
              <DealCard
                deal={draggingDeal}

              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        title="Add New Deal"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okButtonProps={{ loading, type: 'primary' }}
        cancelButtonProps={{ type: 'default' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Deal Title"
            rules={[{ required: true, message: 'Please input the deal title!' }]}
            tooltip="Enter a descriptive title for the deal"
          >
            <Input placeholder="e.g., Annual Subscription Deal" />
          </Form.Item>

          <Form.Item
            name="lead_id"
            label="Related Lead"
            rules={[{ required: true, message: 'Please select a lead!' }]}
          >
            <Select
              placeholder="Select a lead"
              showSearch
              optionFilterProp="children"
            >
              {leads.map((lead) => (
                <Option key={lead.id} value={lead.id}>
                  {lead.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Deal Value"
            rules={[{ required: true, message: 'Please input the deal value!' }]}
            tooltip="Enter the deal value in USD"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              placeholder="e.g., 5000"
            />
          </Form.Item>

          <Form.Item
            name="stage"
            label="Stage"
            initialValue="New"
          >
            <Select>
              {stages.map((stage) => (
                <Option key={stage} value={stage}>
                  {stage}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}