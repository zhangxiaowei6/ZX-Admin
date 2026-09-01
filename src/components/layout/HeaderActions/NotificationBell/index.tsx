import { useState, useCallback } from 'react'
import { usePolling } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { Badge, List, Popover, Tabs, Tag, Typography, Button, Space, message, Tooltip, Grid } from 'antd'
import {
  BellOutlined,
  SoundOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getMessageList, markAllAsRead, getUnreadCount } from '@/api/modules/platform'
import { useMessageStore } from '@/stores'
import type { Message, MessageType } from '@/types/platform/message'
import { ActionIcon } from '../ActionIcon'
import './NotificationBell.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const typeIconMap: Record<MessageType, React.ReactNode> = {
  announcement: <SoundOutlined style={{ color: '#1677ff' }} />,
  notification: <InfoCircleOutlined style={{ color: '#fa8c16' }} />,
  message: <MessageOutlined style={{ color: '#52c41a' }} />,
}

const typeColorMap: Record<MessageType, string> = {
  announcement: 'blue',
  notification: 'orange',
  message: 'green',
}

const POLL_INTERVAL = 30000

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('message')
  const { t: tCommon } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const { unreadCount, setUnreadCount } = useMessageStore()

  const typeLabelMap: Record<MessageType, string> = {
    announcement: t('announcement'),
    notification: t('notification'),
    message: t('privateMessage'),
  }

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (e) {
      console.warn('[NotificationBell] Failed to fetch unread count:', e)
    }
  }, [setUnreadCount])

  // 轮询未读数，页面隐藏时自动暂停
  usePolling(refreshUnreadCount, { interval: POLL_INTERVAL })

  // 打开 Popover 时加载最近消息
  const fetchRecentMessages = useCallback(async (type?: string) => {
    setLoading(true)
    try {
      const result = await getMessageList({
        pageNum: 1,
        pageSize: 5,
        type: type === 'all' || !type ? undefined : (type as MessageType),
      })
      setMessages(result.list)
    } catch (e) {
      console.warn('[NotificationBell] Failed to fetch messages:', e)
    }
    setLoading(false)
  }, [])

  const handleOpenChange = useCallback((visible: boolean) => {
    setOpen(visible)
    if (visible) {
      fetchRecentMessages(activeTab)
    }
  }, [activeTab, fetchRecentMessages])

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key)
    fetchRecentMessages(key)
  }, [fetchRecentMessages])

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead()
    message.success(t('allReadSuccess'))
    refreshUnreadCount()
    fetchRecentMessages(activeTab)
  }, [refreshUnreadCount, fetchRecentMessages, activeTab, t])

  const handleViewAll = useCallback(() => {
    setOpen(false)
    window.dispatchEvent(new Event('overflow-popover-close'))
    navigate('/inbox')
  }, [navigate])

  const tabItems = [
    { key: 'all', label: `${t('all')}(${unreadCount.total})` },
    { key: 'announcement', label: `${t('announcement')}(${unreadCount.announcement})` },
    { key: 'notification', label: `${t('notification')}(${unreadCount.notification})` },
    { key: 'message', label: `${t('privateMessage')}(${unreadCount.message})` },
  ]

  const content = (
    <div style={{ width: 340, maxWidth: 'calc(100vw - 48px)' }}>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={handleTabChange}
        size="small"
        style={{ marginBottom: 0 }}
      />
      <List
        loading={loading}
        dataSource={messages}
        locale={{ emptyText: t('common:noMessages') }}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '8px 0' }}
            onClick={() => {
              setOpen(false)
              window.dispatchEvent(new Event('overflow-popover-close'))
              navigate('/inbox')
            }}
          >
            <List.Item.Meta
              avatar={typeIconMap[item.type]}
              title={
                <Space size={4}>
                  <Typography.Text
                    strong={!item.isRead}
                    ellipsis
                    style={{ maxWidth: 200, fontSize: 13 }}
                  >
                    {item.title}
                  </Typography.Text>
                  <Tag
                    color={typeColorMap[item.type]}
                    style={{ fontSize: 11, lineHeight: '16px', padding: '0 4px' }}
                  >
                    {typeLabelMap[item.type]}
                  </Tag>
                </Space>
              }
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(item.createdAt).fromNow()}
                </Typography.Text>
              }
            />
            {!item.isRead && (
              <Badge status="processing" style={{ marginLeft: 8 }} />
            )}
          </List.Item>
        )}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          padding: '8px 0 0',
          marginTop: 4,
        }}
      >
        <Button type="link" size="small" onClick={handleMarkAllRead}>
          {t('allRead')}
        </Button>
        <Button type="link" size="small" onClick={handleViewAll}>
          {t('common:viewAll')}
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={false}
      rootClassName="notification-bell-popover"
    >
      <Tooltip title={isMobile ? '' : tCommon('notifications')} open={open ? false : undefined}>
        <ActionIcon ariaLabel={tCommon('notifications')} style={{ position: 'relative' }}>
          <BellOutlined />
          {unreadCount.total > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ff4d4f',
              }}
            />
          )}
        </ActionIcon>
      </Tooltip>
    </Popover>
  )
}
