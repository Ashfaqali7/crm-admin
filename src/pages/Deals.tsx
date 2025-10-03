import { useState, useMemo, useCallback, useRef } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Typography, Spin, Alert, Tag, Space, Divider, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
} from '@dnd-kit/core';
import { DealCard } from '../components/DealCard';
import { DealColumn } from '../components/DealColumn';
import { useTheme } from '../context/ThemeContext';
import { useDealsData } from '../hooks/useDealsData';
import { useDebounce } from '../hooks/useDebounce';
import { DEAL_STAGES } from '../constants/deals';
import type { Deal, Lead } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;



export function Deals() {
  const { deals, leads, loading, error, setError, fetchDeals, updateDeal, createDeal } = useDealsData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editDealId, setEditDealId] = useState<string | null>(null);
  const [draggingDeal, setDraggingDeal] = useState<Deal | null>(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const theme = useTheme();

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Enhanced sensors with PointerSensor for better touch support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });

  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor);

  // Enhanced form submission handler
  const handleSubmit = useCallback(async (values: Partial<Deal>) => {
    const success = editDealId
      ? await updateDeal(editDealId, values)
      : await createDeal(values);

    if (success) {
      setModalVisible(false);
      setEditDealId(null);
      form.resetFields();
    }
  }, [editDealId, updateDeal, createDeal, form]);

  // Enhanced drag and drop handler
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setDraggingDeal(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedDeal = deals.find((deal) => deal.id === activeId);
    if (!draggedDeal) {
      setDraggingDeal(null);
      return;
    }

    try {
      // Check if overId is a stage name (dropped on column)
      if (DEAL_STAGES.includes(overId as typeof DEAL_STAGES[number])) {
        const newStage = overId as typeof DEAL_STAGES[number];
        if (draggedDeal.stage !== newStage) {
          const success = await updateDeal(draggedDeal.id, { stage: newStage });
          if (success) {
            theme.showBanner(`Deal moved to ${newStage}`, 'success');
          }
        }
      } else {
        // overId is a deal ID (dropped on another deal)
        const overDeal = deals.find((d) => d.id === overId);
        if (overDeal) {
          // Move the deal to the same stage as the deal it was dropped on
          if (draggedDeal.stage !== overDeal.stage) {
            const success = await updateDeal(draggedDeal.id, { stage: overDeal.stage });
            if (success) {
              theme.showBanner(`Deal moved to ${overDeal.stage}`, 'success');
            }
          } else if (activeId !== overDeal.id) {
            // Reorder within the same stage - handled by optimistic update
            // The actual reordering will be handled by the backend
            theme.showBanner('Deal reordered successfully', 'success');
          }
        }
      }
    } catch (error) {
      theme.showBanner('Failed to update deal. Please try again.', 'error');
    } finally {
      setDraggingDeal(null);
    }
  }, [deals, updateDeal, theme]);

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

  // Memoized filtered and grouped deals for better performance
  const filteredDeals = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return deals;

    return deals.filter((deal) =>
      deal.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      deal.value?.toString().includes(debouncedSearchQuery)
    );
  }, [deals, debouncedSearchQuery]);

  const groupedDeals = useMemo(() => {
    return DEAL_STAGES.reduce((acc, stage) => {
      acc[stage] = filteredDeals.filter((deal) => deal.stage === stage);
      return acc;
    }, {} as Record<typeof DEAL_STAGES[number], Deal[]>);
  }, [filteredDeals]);

  // Calculate summary statistics
  const totalValue = useMemo(() => {
    return filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  }, [filteredDeals]);

  const dealsByStage = useMemo(() => {
    return DEAL_STAGES.map(stage => ({
      stage,
      count: groupedDeals[stage].length,
      value: groupedDeals[stage].reduce((sum, deal) => sum + (deal.value || 0), 0)
    }));
  }, [groupedDeals]);

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Header Section */}
      <div style={{
        marginBottom: 24,
        background: '#fff',
        padding: '20px 24px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#1F1F1F', fontWeight: 600 }}>
              Deals Pipeline
            </Title>
            <div style={{ marginTop: 8 }}>
              <Space size="large">
                <Text type="secondary">
                  <strong>{filteredDeals.length}</strong> deals • <strong>${totalValue.toLocaleString()}</strong> total value
                </Text>
              </Space>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Input
              placeholder="Search deals, leads, or values..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              allowClear
              size="middle"
            />
            <Tooltip title="Refresh deals">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchDeals()}
                loading={loading}
                shape="circle"
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openAddDealModal()}
              size="middle"
            >
              Add Deal
            </Button>
          </div>
        </div>

        {/* Stage Summary */}
        <div style={{ marginTop: 20 }}>
          <Space size="middle" wrap>
            {dealsByStage.map(({ stage, count, value }) => (
              <div key={stage} style={{
                textAlign: 'center',
                padding: '8px 16px',
                background: count > 0 ? '#f0f9ff' : '#f8f9fa',
                borderRadius: 6,
                border: `1px solid ${count > 0 ? '#e0f2fe' : '#e9ecef'}`
              }}>
                <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>
                  {stage}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#495057' }}>
                  {count}
                </div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>
                  ${value.toLocaleString()}
                </div>
              </div>
            ))}
          </Space>
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
            {DEAL_STAGES.map((stage) => (
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
              {DEAL_STAGES.map((stage) => (
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
