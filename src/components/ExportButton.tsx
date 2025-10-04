import React, { useState } from 'react';
import { Button, Dropdown, type MenuProps, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { exportToCSV, exportToJSON, exportToExcel, type ExportColumn } from '../utils/exportUtils';

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    setLoading(true);

    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, columns, filename);
          break;
        case 'json':
          exportToJSON(data, filename);
          break;
        case 'excel':
          exportToExcel(data, columns, filename);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Export as CSV',
      onClick: () => handleExport('csv')
    },
    {
      key: 'excel',
      label: 'Export as Excel',
      onClick: () => handleExport('excel')
    },
    {
      key: 'json',
      label: 'Export as JSON',
      onClick: () => handleExport('json')
    }
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button
        icon={<DownloadOutlined />}
        loading={loading}
        disabled={disabled}
      >
        <Space>Export</Space>
      </Button>
    </Dropdown>
  );
};

export default ExportButton;