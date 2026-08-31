import type { ApiResponse } from '@/types'

export type MockBody = Record<string, unknown> | unknown[] | string | null

export interface MockRequestContext {
  method: string
  pathname: string
  params: Record<string, string>
  query: Record<string, string>
  body: MockBody
}

// eslint-disable-next-line no-unused-vars
export type MockHandler = (context: MockRequestContext) => ApiResponse

export interface MockRoute {
  method: string
  pattern: string
  handler: MockHandler
}
