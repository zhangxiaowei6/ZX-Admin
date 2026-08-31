import type { ApiResponse, PageResult } from '@/types'
import type { MockBody } from './types'

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export const ok = <T>(data: T, msg = 'success'): ApiResponse<T> => ({ code: 200, data, msg })

export const created = (id: number, msg = '新增成功'): ApiResponse<{ id: number }> => ok({ id }, msg)

export const changed = (msg = '操作成功'): ApiResponse<null> => ok(null, msg)

export const notFound = (resource = '数据'): ApiResponse<null> => ({
  code: 404,
  data: null,
  msg: `${resource}不存在`,
})

export const objectBody = <T extends object>(body: MockBody): Partial<T> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {}
  return body as Partial<T>
}

export const numberValue = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const numberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value.map(Number).filter(Number.isFinite)
}

export const nextId = (items: Array<{ id: number }>): number =>
  Math.max(0, ...items.map((item) => item.id).filter((id) => id > 0)) + 1

export const now = (): string => new Date().toISOString().replace('T', ' ').slice(0, 19)

export const containsText = (value: unknown, keyword: unknown): boolean => {
  const normalizedKeyword = String(keyword ?? '').trim().toLocaleLowerCase()
  if (!normalizedKeyword) return true
  return String(value ?? '').toLocaleLowerCase().includes(normalizedKeyword)
}

export const matchesNumber = (value: unknown, expected: unknown): boolean => {
  if (expected === undefined || expected === null || expected === '') return true
  return Number(value) === Number(expected)
}

export const paginate = <T>(items: T[], params: Record<string, unknown>): PageResult<T> => {
  const pageNum = Math.max(1, Math.trunc(numberValue(params.pageNum, 1)))
  const pageSize = Math.max(1, Math.trunc(numberValue(params.pageSize, 10)))
  const start = (pageNum - 1) * pageSize
  return {
    list: items.slice(start, start + pageSize),
    total: items.length,
  }
}

export const buildTree = <T extends { id: number; parentId: number; sort: number; children?: T[] }>(
  items: T[],
): T[] => {
  const nodes = clone(items).map((item) => ({ ...item, children: [] })) as T[]
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const roots: T[] = []

  nodes.forEach((node) => {
    const parent = nodeMap.get(node.parentId)
    if (node.parentId === 0 || !parent) roots.push(node)
    else {
      parent.children = parent.children || []
      parent.children.push(node)
    }
  })

  const sortNodes = (tree: T[]) => {
    tree.sort((left, right) => left.sort - right.sort || left.id - right.id)
    tree.forEach((node) => sortNodes(node.children || []))
  }
  sortNodes(roots)
  return roots
}

export const collectDescendantIds = <T extends { id: number; parentId: number }>(
  items: T[],
  rootId: number,
): Set<number> => {
  const ids = new Set<number>([rootId])
  let changedSize = 0
  while (changedSize !== ids.size) {
    changedSize = ids.size
    items.forEach((item) => {
      if (ids.has(item.parentId)) ids.add(item.id)
    })
  }
  return ids
}
