import { useRef, useState, useMemo } from 'react'
import { Button, Popconfirm, Space, Tag } from 'antd'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea, ProFormMoney } from '@ant-design/pro-components'
import { PageContainer } from '@/components/common/PageContainer'
import { ProTable } from '@/components/common/ProTable'
import { FormContainer } from '@/components/common/FormContainer'
import { HasPermission } from '@/components/common/HasPermission'
import { useTranslation } from 'react-i18next'
import { getProductList } from '@/api/modules/tenant'
import type { TenantProduct } from '@/types'
import { useProductMutations } from './hooks/useProduct'
import { SpecDrawer } from './components'

export const TenantProductPage: React.FC = () => {
  const { t } = useTranslation(['product', 'common'])
  const actionRef = useRef<ActionType>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<TenantProduct>()
  const [specOpen, setSpecOpen] = useState(false)
  const [specProduct, setSpecProduct] = useState<TenantProduct>()

  const clearSelection = () => setSelectedRowKeys([])
  const { submit, remove, batchRemove, batchStatus } = useProductMutations(actionRef, clearSelection)

  const handleEdit = (record?: TenantProduct) => {
    setCurrentRecord(record)
    setFormOpen(true)
  }

  const categoryOptions = useMemo(
    () => [
      { label: t('product:categoryElectronics'), value: '电子产品' },
      { label: t('product:categoryFood'), value: '食品' },
      { label: t('product:categoryClothing'), value: '服装' },
      { label: t('product:categoryHome'), value: '家居' },
    ],
    [t],
  )

  const unitOptions = useMemo(
    () => [
      { label: t('product:unitPiece'), value: '个' },
      { label: t('product:unitItem'), value: '件' },
      { label: t('product:unitBox'), value: '箱' },
      { label: t('product:unitKg'), value: 'kg' },
      { label: t('product:unitSet'), value: '台' },
    ],
    [t],
  )

  const columns: ProColumns<TenantProduct>[] = useMemo(
    () => [
      { title: t('common:id'), dataIndex: 'id', width: 60, search: false },
      {
        title: t('product:productName'),
        dataIndex: 'name',
        width: 180,
      },
      {
        title: t('product:category'),
        dataIndex: 'category',
        valueType: 'select',
        width: 120,
        valueEnum: {
          电子产品: { text: t('product:categoryElectronics') },
          食品: { text: t('product:categoryFood') },
          服装: { text: t('product:categoryClothing') },
          家居: { text: t('product:categoryHome') },
        },
      },
      {
        title: t('product:price'),
        dataIndex: 'price',
        valueType: 'money',
        width: 120,
        search: false,
      },
      {
        title: t('product:stock'),
        dataIndex: 'stock',
        valueType: 'digit',
        width: 100,
        search: false,
      },
      {
        title: t('product:unit'),
        dataIndex: 'unit',
        width: 80,
        search: false,
      },
      {
        title: t('common:status'),
        dataIndex: 'status',
        valueType: 'select',
        width: 100,
        valueEnum: {
          1: { text: t('product:onSale'), status: 'Success' },
          0: { text: t('product:offSale'), status: 'Default' },
        },
        render: (_: unknown, record: TenantProduct) => (
          <Tag color={record.status === 1 ? 'green' : 'default'}>
            {record.status === 1 ? t('product:onSale') : t('product:offSale')}
          </Tag>
        ),
      },
      {
        title: t('common:createTime'),
        dataIndex: 'createdAt',
        valueType: 'dateTime',
        width: 160,
        search: false,
      },
      {
        title: t('common:operation'),
        valueType: 'option',
        width: 200,
        render: (_text, record) => [
          <HasPermission key="edit" code="tenant:list:backend:product:update">
            <a onClick={() => handleEdit(record)}>{t('common:edit')}</a>
          </HasPermission>,
          <HasPermission key="spec" code="tenant:list:backend:product:update">
            <a onClick={() => { setSpecProduct(record); setSpecOpen(true) }}>
              {t('product:spec')}
            </a>
          </HasPermission>,
          <HasPermission key="delete" code="tenant:list:backend:product:delete">
            <Popconfirm title={t('common:confirmDelete')} onConfirm={() => remove.mutate(record.id)}>
              <a style={{ color: '#ff4d4f' }}>{t('common:delete')}</a>
            </Popconfirm>
          </HasPermission>,
        ],
      },
    ],
    [t, remove],
  )

  return (
    <PageContainer>
      <ProTable<TenantProduct>
        rowKey="id"
        actionRef={actionRef}
        headerTitle={t('product:title')}
        columns={columns}
        request={async (params) => {
          const result = await getProductList({
            pageNum: params.current,
            pageSize: params.pageSize,
            name: params.name,
            category: params.category,
            status: params.status,
          })
          return { data: result.list, success: true, total: result.total }
        }}
        search={{ labelWidth: 'auto' }}
        options={{ density: true, setting: true, reload: true }}
        exportable
        exportFileName={t('product:title')}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableAlertRender={({ selectedRowKeys: keys, onCleanSelected }) => (
          <Space>
            <span>{t('common:selected', { count: keys.length })}</span>
            <a onClick={onCleanSelected}>{t('common:cancelSelect')}</a>
          </Space>
        )}
        tableAlertOptionRender={({ onCleanSelected }) => (
          <Space>
            <HasPermission key="onSale" code="tenant:list:backend:product:update">
              <a
                onClick={() => {
                  batchStatus.mutate({ ids: selectedRowKeys as number[], status: 1 })
                  onCleanSelected()
                }}
              >
                {t('product:batchOnSale')}
              </a>
            </HasPermission>
            <HasPermission key="offSale" code="tenant:list:backend:product:update">
              <a
                onClick={() => {
                  batchStatus.mutate({ ids: selectedRowKeys as number[], status: 0 })
                  onCleanSelected()
                }}
              >
                {t('product:batchOffSale')}
              </a>
            </HasPermission>
            <HasPermission key="delete" code="tenant:list:backend:product:delete">
              <Popconfirm
                title={t('product:confirmDeleteProducts', { count: selectedRowKeys.length })}
                onConfirm={() => {
                  batchRemove.mutate(selectedRowKeys as number[])
                  onCleanSelected()
                }}
              >
                <a style={{ color: '#ff4d4f' }}>{t('common:batchDelete')}</a>
              </Popconfirm>
            </HasPermission>
          </Space>
        )}
        toolBarRender={() => [
          <HasPermission key="add" code="tenant:list:backend:product:create">
            <Button type="primary" onClick={() => handleEdit()}>
              {t('product:addProduct')}
            </Button>
          </HasPermission>,
        ]}
      />

      {/* 新增/编辑商品弹窗 */}
      <FormContainer
        title={currentRecord ? t('product:editProduct') : t('product:addProduct')}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={currentRecord}
        onFinish={async (values) => {
          await submit.mutateAsync({ record: currentRecord, values })
          return true
        }}
      >
        <ProFormText
          name="name"
          label={t('product:productName')}
          rules={[{ required: true, message: t('product:productNameRequired') }]}
        />
        <ProFormSelect
          name="category"
          label={t('product:category')}
          options={categoryOptions}
          rules={[{ required: true, message: t('product:categoryRequired') }]}
        />
        <ProFormMoney
          name="price"
          label={t('product:price')}
          locale="zh-CN"
          min={0}
          rules={[{ required: true, message: t('product:priceRequired') }]}
        />
        <ProFormDigit
          name="stock"
          label={t('product:stock')}
          min={0}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: t('product:stockRequired') }]}
        />
        <ProFormSelect
          name="unit"
          label={t('product:unit')}
          options={unitOptions}
          initialValue="个"
        />
        <ProFormSelect
          name="status"
          label={t('common:status')}
          initialValue={1}
          options={[
            { label: t('product:onSale'), value: 1 },
            { label: t('product:offSale'), value: 0 },
          ]}
        />
        <ProFormTextArea
          name="description"
          label={t('product:description')}
          colProps={{ span: 24 }}
          fieldProps={{ rows: 3 }}
        />
      </FormContainer>

      {/* 规格管理抽屉（可编辑表格） */}
      <SpecDrawer
        open={specOpen}
        product={specProduct}
        onClose={() => setSpecOpen(false)}
      />
    </PageContainer>
  )
}
