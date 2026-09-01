import { useRef, useState } from 'react'
import { Popconfirm, Space, Tag } from 'antd'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { ProTable } from '@/components/common/ProTable'
import { PageContainer } from '@/components/common/PageContainer'
import { HasPermission } from '@/components/common/HasPermission'
import { useTranslation } from 'react-i18next'
import { getOrderList } from '@/api/modules/tenant'
import type { TenantOrder } from '@/types'
import { useOrderMutations } from './hooks/useOrder'

export const TenantOrderPage: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const { t } = useTranslation(['order', 'common'])

  const clearSelection = () => setSelectedRowKeys([])
  const { batchRemove } = useOrderMutations(actionRef, clearSelection)

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: t('order:statusPending'), color: 'orange' },
    1: { text: t('order:statusPaid'), color: 'blue' },
    2: { text: t('order:statusShipped'), color: 'cyan' },
    3: { text: t('order:statusCompleted'), color: 'green' },
  }

  const columns: ProColumns<TenantOrder>[] = [
    { title: t('common:id'), dataIndex: 'id', width: 60, search: false },
    { title: t('order:orderNo'), dataIndex: 'orderNo', width: 180, copyable: true },
    { title: t('order:customer'), dataIndex: 'customerName', width: 120 },
    {
      title: t('order:amount'),
      dataIndex: 'amount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: t('common:status'),
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: {
        0: { text: t('order:statusPending') },
        1: { text: t('order:statusPaid') },
        2: { text: t('order:statusShipped') },
        3: { text: t('order:statusCompleted') },
      },
      render: (_: unknown, record: TenantOrder) => {
        const s = statusMap[record.status]
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: t('common:createTime'), dataIndex: 'createdAt', valueType: 'dateTime', width: 170, search: false },
  ]

  return (
    <PageContainer>
      <ProTable<TenantOrder>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const result = await getOrderList({
            pageNum: params.current,
            pageSize: params.pageSize,
            orderNo: params.orderNo,
            customerName: params.customerName,
            status: params.status,
          })
          return { data: result.list, success: true, total: result.total }
        }}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        headerTitle={t('order:title')}
        exportable
        exportFileName={t('order:title')}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
        tableAlertRender={({ selectedRowKeys: keys, onCleanSelected }) => (
          <Space>
            <span>{t('common:selected', { count: keys.length })}</span>
            <a onClick={onCleanSelected}>{t('common:cancelSelect')}</a>
          </Space>
        )}
        tableAlertOptionRender={({ onCleanSelected }) => (
          <Space>
            <HasPermission key="delete" code="tenant:list:backend:order:delete">
              <Popconfirm
                title={t('order:confirmDeleteOrders', { count: selectedRowKeys.length })}
                onConfirm={() => { batchRemove.mutate(selectedRowKeys); onCleanSelected() }}
              >
                <a style={{ color: '#ff4d4f' }}>{t('common:batchDelete')}</a>
              </Popconfirm>
            </HasPermission>
          </Space>
        )}
      />
    </PageContainer>
  )
}
