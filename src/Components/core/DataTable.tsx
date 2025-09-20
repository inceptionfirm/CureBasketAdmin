// Data Table Component - Reusable table for all modules
import React, { useState, useMemo } from 'react';
import { clientConfigManager } from '../../config/clientConfig';
import BaseCard from './BaseCard';
import './DataTable.css';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filterable?: boolean;
  searchable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[], selectedRowKeys: string[]) => void;
  onRowClick?: (record: T, index: number) => void;
  onRefresh?: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  emptyText?: string;
  emptyImage?: string;
  rowKey?: string | ((record: T) => string);
  scroll?: { x?: number; y?: number };
  size?: 'small' | 'middle' | 'large';
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  pagination,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  onSelectionChange,
  onRowClick,
  onRefresh,
  className = '',
  title,
  subtitle,
  actions,
  emptyText = 'No data available',
  emptyImage,
  rowKey = 'id',
  scroll,
  size = 'middle',
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const config = clientConfigManager.getConfig();

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(record =>
        columns.some(column => {
          if (!column.searchable) return false;
          const value = record[column.dataIndex];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    if (filterable) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          result = result.filter(record => {
            const recordValue = record[key];
            if (typeof recordValue === 'string') {
              return recordValue.toLowerCase().includes(value.toLowerCase());
            }
            return recordValue === value;
          });
        }
      });
    }

    // Apply sorting
    if (sortField && sortable) {
      const column = columns.find(col => col.key === sortField);
      if (column?.sorter) {
        result.sort((a, b) => {
          const order = column.sorter!(a, b);
          return sortOrder === 'asc' ? order : -order;
        });
      }
    }

    return result;
  }, [data, searchTerm, filters, sortField, sortOrder, columns, searchable, filterable, sortable]);

  // Handle sort
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sorter || !sortable) return;

    if (sortField === column.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(column.key);
      setSortOrder('asc');
    }
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;

    const keys = checked ? filteredData.map((record, index) => getRowKey(record, index)) : [];
    setSelectedRowKeys(keys);
    onSelectionChange?.(checked ? filteredData : [], keys);
  };

  const handleSelectRow = (record: T, index: number, checked: boolean) => {
    if (!selectable) return;

    const key = getRowKey(record, index);
    const newSelectedKeys = checked
      ? [...selectedRowKeys, key]
      : selectedRowKeys.filter(k => k !== key);

    setSelectedRowKeys(newSelectedKeys);
    const selectedRecords = data.filter((r, i) => newSelectedKeys.includes(getRowKey(r, i)));
    onSelectionChange?.(selectedRecords, newSelectedKeys);
  };

  // Render cell content
  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = record[column.dataIndex];
    
    if (column.render) {
      return column.render(value, record, index);
    }

    if (column.ellipsis && typeof value === 'string' && value.length > 50) {
      return (
        <span title={value} className="data-table__cell-ellipsis">
          {value.substring(0, 50)}...
        </span>
      );
    }

    return value;
  };

  const tableClasses = [
    'data-table',
    `data-table--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <BaseCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      onRefresh={onRefresh}
      loading={loading}
      error={error}
      className={tableClasses}
    >
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="data-table__toolbar">
          {searchable && (
            <div className="data-table__search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="data-table__search-input"
              />
              <span className="data-table__search-icon">🔍</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="data-table__container" style={scroll ? { maxHeight: scroll.y, overflow: 'auto' } : {}}>
        <table className="data-table__table" style={scroll ? { minWidth: scroll.x } : {}}>
          <thead className="data-table__thead">
            <tr className="data-table__tr">
              {selectable && (
                <th className="data-table__th data-table__th--select">
                  <input
                    type="checkbox"
                    checked={selectedRowKeys.length === filteredData.length && filteredData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="data-table__checkbox"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`data-table__th ${column.align ? `data-table__th--${column.align}` : ''}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="data-table__th-content">
                    <span className="data-table__th-title">{column.title}</span>
                    {column.sorter && sortable && (
                      <span className="data-table__sort-icon">
                        {sortField === column.key ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-table__tbody">
            {filteredData.length > 0 ? (
              filteredData.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`data-table__tr ${selectedRowKeys.includes(getRowKey(record, index)) ? 'data-table__tr--selected' : ''}`}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {selectable && (
                    <td className="data-table__td data-table__td--select">
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.includes(getRowKey(record, index))}
                        onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                        className="data-table__checkbox"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`data-table__td ${column.align ? `data-table__td--${column.align}` : ''}`}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="data-table__tr">
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="data-table__td data-table__td--empty"
                >
                  <div className="data-table__empty">
                    {emptyImage && <img src={emptyImage} alt="No data" className="data-table__empty-image" />}
                    <span className="data-table__empty-text">{emptyText}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="data-table__pagination">
          <div className="data-table__pagination-info">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <div className="data-table__pagination-controls">
            <button
              className="data-table__pagination-btn"
              disabled={pagination.current <= 1}
              onClick={() => {/* Handle page change */}}
            >
              Previous
            </button>
            <span className="data-table__pagination-current">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              className="data-table__pagination-btn"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => {/* Handle page change */}}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </BaseCard>
  );
};

export default DataTable;
