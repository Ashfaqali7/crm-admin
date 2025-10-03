import { useState, useMemo, useCallback, useRef, type SetStateAction } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Typography, Spin, Alert, Tag, Space, Divider, Tooltip, theme } from 'antd';
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
import { StatusTag } from '../components/StatusTag';
import type { Deal, Lead } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;



export function Deals() {
  // Access Ant Design theme tokens for consistent styling
  const { token } = theme.useToken();

  const { deals, leads, loading, error, setError, fetchDeals, updateDeal, createDeal } = useDealsData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editDealId, setEditDealId] = useState<string | null>(null);
  const [draggingDeal, setDraggingDeal] = useState<Deal | null>(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const themeContext = useTheme();

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
            themeContext.showBanner(`Deal moved to ${newStage}`, 'success');
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
              themeContext.showBanner(`Deal moved to ${overDeal.stage}`, 'success');
            }
          } else if (activeId !== overDeal.id) {
            // Reorder within the same stage - handled by optimistic update
            // The actual reordering will be handled by the backend
            themeContext.showBanner('Deal reordered successfully', 'success');
          }
        }
      }
    } catch (error) {
      themeContext.showBanner('Failed to update deal. Please try again.', 'error');
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: token.colorBgLayout
    }}>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{
            marginBottom: token.marginLG,
            borderRadius: token.borderRadiusLG
          }}
        />
      )}

      {/* Header Section */}
      <div style={{
        marginBottom: token.marginXXL,
        backgroundColor: token.colorBgContainer,
        padding: token.paddingXL,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadow,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: token.paddingLG
        }}>
          <div>
            <Title
              level={3}
              style={{
                margin: 0,
                color: token.colorTextHeading,
                fontWeight: token.fontWeightStrong
              }}
            >
              Deals Pipeline
            </Title>
            <div style={{ marginTop: token.marginXS }}>
              <Space size={token.marginLG}>
                <Text
                  type="secondary"
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeLG
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: token.colorText,
                      fontSize: token.fontSizeLG
                    }}
                  >
                    {filteredDeals.length}
                  </Text> deals •{' '}
                  <Text
                    strong
                    style={{
                      color: token.colorText,
                      fontSize: token.fontSizeLG
                    }}
                  >
                    ${totalValue.toLocaleString()}
                  </Text> total value
                </Text>
              </Space>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Input
              placeholder="Search deals, leads, or values..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
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
        <div style={{ marginTop: token.marginLG }}>
          <Space size={token.marginMD} wrap>
            {dealsByStage.map(({ stage, count, value }) => (
              <div
                key={stage}
                style={{
                  textAlign: 'center',
                  padding: `${token.paddingSM}px ${token.paddingLG}px`,
                  backgroundColor: count > 0 ? token.colorPrimaryBg : token.colorFillSecondary,
                  borderRadius: token.borderRadiusLG,
                  border: `${token.lineWidth}px ${token.lineType} ${count > 0 ? token.colorPrimaryBgHover : token.colorBorderSecondary}`,
                  minWidth: token.controlHeightLG * 2,
                  transition: `all ${token.motionDurationMid}`
                }}
              >
                <div style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextSecondary,
                  marginBottom: token.marginXS,
                  fontWeight: token.fontWeightStrong
                }}>
                  {stage}
                </div>
                <div style={{
                  fontSize: token.fontSizeXL,
                  fontWeight: token.fontWeightStrong,
                  color: token.colorText,
                  lineHeight: token.lineHeightSM
                }}>
                  {count}
                </div>
                <div style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextSecondary,
                  marginTop: token.marginXXS
                }}>
                  ${value.toLocaleString()}
                </div>
              </div>
            ))}
          </Space>
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: token.paddingXL,
          minHeight: token.controlHeightLG * 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
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
        title={
          <div style={{
            fontSize: token.fontSizeLG,
            fontWeight: token.fontWeightStrong,
            color: token.colorTextHeading
          }}>
            {editDealId ? 'Update Deal' : 'Add New Deal'}
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        okText={editDealId ? 'Update' : 'Add'}
        onCancel={() => {
          setModalVisible(false);
          setEditDealId(null);
          form.resetFields();
        }}
        width={640}
        okButtonProps={{
          loading,
          type: 'primary',
          size: 'middle'
        }}
        cancelButtonProps={{
          type: 'default',
          size: 'middle'
        }}
        styles={{
          header: {
            padding: token.paddingLG,
            paddingBottom: token.paddingMD,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
          },
          body: {
            padding: token.paddingLG
          },
          footer: {
            padding: token.paddingMD,
            paddingTop: token.paddingLG,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: token.marginLG }}
          size="middle"
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
                  <StatusTag status={stage} />
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
