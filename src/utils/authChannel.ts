type AuthEvent = 'logout' | 'switchPlatform'
type AppEvent = 'storeSettingUpdated'

interface AuthEventMessage {
  type: AuthEvent
  timestamp: number
  path?: string
}

const authChannel = new BroadcastChannel('auth-channel')
const appChannel = new BroadcastChannel('app-channel')

// 广播认证事件到其他标签页
export const broadcastAuthEvent = (event: AuthEvent, path?: string) => {
  authChannel.postMessage({ type: event, timestamp: Date.now(), path } satisfies AuthEventMessage)
}

// 监听其他标签页的认证事件
export const onAuthEvent = (callback: (event: AuthEvent, path?: string) => void) => {
  const handler = (e: MessageEvent<AuthEventMessage>) => {
    if (!e.data || (e.data.type !== 'logout' && e.data.type !== 'switchPlatform')) return
    callback(e.data.type, e.data.path)
  }
  authChannel.addEventListener('message', handler)
  return () => authChannel.removeEventListener('message', handler)
}

// 广播应用事件到其他标签页
export const broadcastAppEvent = (event: AppEvent) => {
  appChannel.postMessage({ type: event, timestamp: Date.now() })
}

// 监听其他标签页的应用事件
export const onAppEvent = (callback: (event: AppEvent) => void) => {
  const handler = (e: MessageEvent<{ type: AppEvent }>) => {
    callback(e.data.type)
  }
  appChannel.addEventListener('message', handler)
  return () => appChannel.removeEventListener('message', handler)
}

// 关闭所有 BroadcastChannel，供应用卸载时调用以释放资源
export const closeAuthChannels = () => {
  authChannel.close()
  appChannel.close()
}
