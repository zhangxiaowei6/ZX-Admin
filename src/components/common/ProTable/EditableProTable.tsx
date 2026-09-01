import { useRef, useCallback, useState, useMemo } from 'react'
import { EditableProTable as AntEditableProTable } from '@ant-design/pro-components'
import type { EditableProTableProps, ProColumns } from '@ant-design/pro-components'
import { Tooltip } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { ExportModal } from './ExportModal'
import { ResizableHeaderCell } from './ResizableHeaderCell'
import { PAGINATION } from '@/constants'

interface ExportableEditableProTableProps<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>>
  extends EditableProTableProps<T, U> {
  /** 是否显示导出按钮 */
  exportable?: boolean
  /** 导出文件名（不含扩展名） */
  exportFileName?: string
  /** 获取全量数据的回调（用于"全量数据"导出） */
  onExportAllData?: () => Promise<T[]>
}

function EditableProTable<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>>(
  props: ExportableEditableProTableProps<T, U>
) {
  const {
    exportable, exportFileName, onExportAllData,
    postData, columns, rowSelection, optionsRender, pagination, scroll,
    ...restProps
  } = props
  const {
    tableSize,
    tableBordered,
    tableResizable,
    tableDefaultPageSize,
    tableShowSizeChanger,
    tableShowQuickJumper,
    tableShowTotal,
    tablePaginationPosition,
  } = useAppStore(useShallow((s) => ({
    tableSize: s.tableSize,
    tableBordered: s.tableBordered,
    tableResizable: s.tableResizable,
    tableDefaultPageSize: s.tableDefaultPageSize,
    tableShowSizeChanger: s.tableShowSizeChanger,
    tableShowQuickJumper: s.tableShowQuickJumper,
    tableShowTotal: s.tableShowTotal,
    tablePaginationPosition: s.tablePaginationPosition,
  })))
  const { t } = useTranslation()
  const dataRef = useRef<T[]>([])
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

  const handlePostData = useCallback(
    (data: T[]) => {
      dataRef.current = data
      return postData ? postData(data) : data
    },
    [postData]
  )

  // 通过 optionsRender 在工具栏图标区追加导出图标
  const mergedOptionsRender: typeof optionsRender = exportable
    ? (p, defaultDoms) => {
        const exportIcon = (
          <Tooltip key="export" title={t('common:export')}>
            <DownloadOutlined
              style={{ fontSize: 17, cursor: 'pointer' }}
              onClick={() => setExportOpen(true)}
            />
          </Tooltip>
        )
        const doms = optionsRender ? optionsRender(p, defaultDoms) : defaultDoms
        return [exportIcon, ...(doms ?? [])]
      }
    : optionsRender

  // 拦截 onChange 以捕获选中行数据，供导出使用；保留页面自身的 onChange 回调
  const mergedRowSelection = exportable
    ? {
        ...(typeof rowSelection === 'object' ? rowSelection : {}),
        onChange: (keys: React.Key[], rows: T[], info: any) => {
          setSelectedRows(rows)
          if (typeof rowSelection === 'object') {
            rowSelection.onChange?.(keys as any, rows, info)
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
        position: (tablePaginationPosition === 'center' ? ['bottomCenter'] : tablePaginationPosition === 'left' ? ['bottomLeft'] : ['bottomRight']) as ('bottomLeft' | 'bottomCenter' | 'bottomRight')[],
        pageSizeOptions: PAGINATION.PAGE_SIZE_OPTIONS.map(String),
        defaultPageSize: tableDefaultPageSize,
        ...(typeof pagination === 'object' ? pagination : {}),
      }

  // 可拖拽列宽：为有 width 的列注入 onHeaderCell
  const resizableColumns = useMemo(() => {
    if (!tableResizable || !columns) return columns
    return columns.map((col) => {
      const key = String((col as any).dataIndex || (col as any).key || '')
      if (!key) return col
      const width = columnWidths[key] ?? (col as any).width
      if (!width) return col
      const originalOnHeaderCell = (col as ProColumns<T>).onHeaderCell
      return {
        ...col,
        width,
        onHeaderCell: (column) => ({
          ...originalOnHeaderCell?.(column),
          resizableWidth: width,
          resizable: true,
          onResizeEnd: (newWidth: number) => {
            setColumnWidths((prev) => ({ ...prev, [key]: newWidth }))
          },
        }),
      } as ProColumns<T>
    })
  }, [tableResizable, columns, columnWidths])

  const resizableComponents = useMemo(
    () => (tableResizable ? { header: { cell: ResizableHeaderCell } } : undefined),
    [tableResizable]
  )

  const defaultScroll = scroll ?? { x: 'max-content' }

  return (
    <>
      <AntEditableProTable<T, U>
        size={tableSize}
        bordered={tableBordered}
        columns={resizableColumns}
        components={resizableComponents}
        postData={handlePostData}
        rowSelection={mergedRowSelection}
        optionsRender={mergedOptionsRender}
        pagination={defaultPagination}
        scroll={defaultScroll}
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

export { EditableProTable }
