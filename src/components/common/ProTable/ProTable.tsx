import { useRef, useCallback, useState, useMemo } from 'react'
import { ProTable as AntProTable } from '@ant-design/pro-components'
import type { ProTableProps, ProColumns } from '@ant-design/pro-components'
import { Tooltip } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { ExportModal } from './ExportModal'
import { ResizableHeaderCell } from './ResizableHeaderCell'
import { PAGINATION } from '@/constants'

interface ExportableProTableProps<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>>
  extends ProTableProps<T, U> {
  /** 是否显示导出按钮 */
  exportable?: boolean
  /** 导出文件名（不含扩展名） */
  exportFileName?: string
  /** 获取全量数据的回调（用于"全量数据"导出） */
  onExportAllData?: () => Promise<T[]>
  tableId?: string
}

function ProTable<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>>(
  props: ExportableProTableProps<T, U>
) {
  const { exportable, exportFileName, onExportAllData, tableId, postData, columns, rowSelection, optionsRender, pagination, scroll, ...restProps } = props
  const { t } = useTranslation()
  const {
    tableSize,
    tableBordered,
    tableResizable,
    tableStriped,
    tableDefaultPageSize,
    tableShowIndex,
    tableFixedHeader,
    tableMaxHeight
    , tableShowSizeChanger, tableShowQuickJumper, tableShowTotal, tablePaginationPosition, tableRememberColumnWidths
  } = useAppStore(useShallow((s) => ({
    tableSize: s.tableSize,
    tableBordered: s.tableBordered,
    tableResizable: s.tableResizable,
    tableStriped: s.tableStriped,
    tableDefaultPageSize: s.tableDefaultPageSize,
    tableShowIndex: s.tableShowIndex,
    tableFixedHeader: s.tableFixedHeader,
    tableMaxHeight: s.tableMaxHeight,
    tableShowSizeChanger: s.tableShowSizeChanger,
    tableShowQuickJumper: s.tableShowQuickJumper,
    tableShowTotal: s.tableShowTotal,
    tablePaginationPosition: s.tablePaginationPosition,
    tableRememberColumnWidths: s.tableRememberColumnWidths,
  })))
  const dataRef = useRef<T[]>([])
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (!tableId || !tableRememberColumnWidths) return {}
    try {
      return JSON.parse(localStorage.getItem(`table-column-widths:${tableId}`) || '{}') as Record<string, number>
    } catch {
      return {}
    }
  })

  const handlePostData = useCallback(
    (data: T[]) => {
      dataRef.current = data
      return postData ? postData(data) : data
    },
    [postData]
  )

  // 通过 optionsRender 在工具栏图标区追加导出图标
  const mergedOptionsRender: typeof optionsRender = exportable
    ? (props, defaultDoms) => {
        const exportIcon = (
          <Tooltip key="export" title={t('common:export')}>
            <DownloadOutlined
              style={{ fontSize: 17, cursor: 'pointer' }}
              onClick={() => setExportOpen(true)}
            />
          </Tooltip>
        )
        const doms = optionsRender ? optionsRender(props, defaultDoms) : defaultDoms
        return [exportIcon, ...doms]
      }
    : optionsRender

  // 合并 rowSelection 以捕获选中行，受控管理 selectedRowKeys
  const mergedRowSelection = exportable
    ? {
        ...(typeof rowSelection === 'object' ? rowSelection : {}),
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: T[], info: { type: 'all' | 'none' | 'invert' | 'single' | 'multiple' }) => {
          setSelectedRowKeys(keys)
          setSelectedRows(rows)
          if (typeof rowSelection === 'object') {
            rowSelection.onChange?.(keys, rows, info)
          }
        },
      }
    : rowSelection

  // 默认分页配置：支持切换每页条数
  const defaultPagination = pagination === false
    ? false
    : {
        showSizeChanger: tableShowSizeChanger,
        showQuickJumper: tableShowQuickJumper,
        showTotal: tableShowTotal ? (total: number) => t('common:totalItems', { count: total }) : undefined,
        position: (tablePaginationPosition === 'center' ? ['bottomCenter'] : tablePaginationPosition === 'left' ? ['bottomLeft'] : ['bottomRight']) as ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[],
        pageSizeOptions: PAGINATION.PAGE_SIZE_OPTIONS.map(String),
        defaultPageSize: tableDefaultPageSize,
        ...(typeof pagination === 'object' ? pagination : {}),
      }

  // 可拖拽列宽：为所有列注入 onHeaderCell，没有 width 的列使用默认宽度 150
  const resizableColumns = useMemo(() => {
    if (!tableResizable || !columns) return columns
    return columns.map((col) => {
      const key = String((col as ProColumns<T>).dataIndex || (col as ProColumns<T>).key || '')
      if (!key) return col
      const width = columnWidths[key] ?? (col as ProColumns<T>).width ?? 150
      const originalOnHeaderCell = (col as ProColumns<T>).onHeaderCell
      return {
        ...col,
        width,
        onHeaderCell: (column) => ({
          ...originalOnHeaderCell?.(column),
          resizableWidth: width,
          resizable: true,
          onResizeEnd: (newWidth: number) => {
            setColumnWidths((prev) => {
              const next = { ...prev, [key]: newWidth }
              if (tableId && tableRememberColumnWidths) {
                localStorage.setItem(`table-column-widths:${tableId}`, JSON.stringify(next))
              }
              return next
            })
          },
        }),
      } as ProColumns<T>
    })
  }, [tableResizable, columns, columnWidths, tableId, tableRememberColumnWidths])

  // 添加序号列
  const finalColumns = useMemo(() => {
    if (!tableShowIndex || !resizableColumns) return resizableColumns

    const indexColumn: ProColumns<T> = {
      title: t('common:index'),
      dataIndex: '__index__',
      key: '__index__',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, __: T, index: number) => {
        // 计算全局索引（考虑分页）
        const current = (typeof pagination === 'object' && pagination.current) || 1
        const pageSize = (typeof pagination === 'object' && pagination.pageSize) || tableDefaultPageSize
        return (current - 1) * pageSize + index + 1
      },
    }

    return [indexColumn, ...resizableColumns]
  }, [tableShowIndex, resizableColumns, t, pagination, tableDefaultPageSize])

  const resizableComponents = useMemo(
    () => (tableResizable ? { header: { cell: ResizableHeaderCell } } : undefined),
    [tableResizable]
  )

  // 默认启用横向滚动，防止移动端表格挤压变形
  const defaultScroll = useMemo(() => {
    const baseScroll = scroll ?? { x: 'max-content' }
    // 如果启用固定表头，添加 y 轴滚动
    if (tableFixedHeader) {
      return { ...baseScroll, y: tableMaxHeight }
    }
    return baseScroll
  }, [scroll, tableFixedHeader, tableMaxHeight])

  // 斑马纹样式
  const rowClassName = useCallback(
    (_record: T, index: number) => {
      return tableStriped && index % 2 === 1 ? 'table-row-striped' : ''
    },
    [tableStriped]
  )

  return (
    <>
      <AntProTable<T, U>
        size={tableSize}
        bordered={tableBordered}
        columns={finalColumns}
        components={resizableComponents}
        postData={handlePostData}
        rowSelection={mergedRowSelection}
        optionsRender={mergedOptionsRender}
        pagination={defaultPagination}
        scroll={defaultScroll}
        rowClassName={rowClassName}
        {...restProps}
      />
      {exportable && columns && (
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          columns={columns}
          currentData={dataRef.current}
          selectedData={selectedRows}
          onFetchAllData={onExportAllData}
          defaultFileName={exportFileName}
        />
      )}
    </>
  )
}

export { ProTable }
