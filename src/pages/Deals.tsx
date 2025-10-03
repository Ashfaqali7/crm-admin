import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Typography, Spin, } from 'antd';
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
import { useTheme } from '../context/ThemeContext';

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
  const [editDealId, setEditDealId] = useState<string | null>(null);
  const [draggingDeal, setDraggingDeal] = useState<Deal | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await dealsService.getWithDetails();
      setDeals(data);
    } catch (error) {
      theme.showBanner('Failed to fetch deals. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      theme.showBanner('Failed to fetch leads. Please try again.', 'error');
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchLeads();
  }, []);

  const handleSubmit = async (values: Partial<Deal>) => {
    setLoading(true);
    try {
      if (editDealId) {
        await dealsService.update(editDealId, values);
        theme.showBanner('Deal updated successfully', 'success');
      } else {
        await dealsService.create(values);
        theme.showBanner('Deal created successfully', 'success');
      }

      setModalVisible(false);
      setEditDealId(null);
      form.resetFields();
      await fetchDeals();
    } catch (error) {
      theme.showBanner(editDealId ? 'Failed to update deal. Please try again.' : 'Failed to create deal. Please try again.', 'error');
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
      theme.showBanner('Failed to update deal. Please try again.', 'error');
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
  const openAddDealModal = (dealId?: string) => {
    if (dealId) {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setEditDealId(dealId);
        form.setFieldsValue({
          title: deal.title,
          lead_id: deal.lead_id,
          value: deal.value,
          stage: deal.stage,
        });
      }
    } else {
      setEditDealId(null);
      form.resetFields();
    }
    setModalVisible(true);
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
            onClick={() => openAddDealModal()}
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
                openAddDealModal={openAddDealModal}
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
        title={editDealId ? 'Update Deal' : 'Add New Deal'}
        open={modalVisible}
        onOk={() => form.submit()}
        okText={editDealId ? 'Update' : 'Add'}
        onCancel={() => {
          setModalVisible(false);
          setEditDealId(null);
          form.resetFields();
        }}
        width={600}
        okButtonProps={{ loading, type: 'primary' }}
        cancelButtonProps={{ type: 'default' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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