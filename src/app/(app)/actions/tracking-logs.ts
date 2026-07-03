'use server'

import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { trackingLogsTable } from '~/db/schema'
import { authActionClient } from '~/lib/safe-action'

const trackingLogTypeSchema = z.enum(['check_in', 'check_out'])
const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')
const trackingLogFiltersSchema = z
  .record(z.string(), z.array(z.union([z.string(), z.boolean()])))
  .optional()
const EXPORT_LIMIT = 10000

const cleanTag = (tag?: string | null) => {
  const value = tag?.trim()
  return value ? value : null
}

const getTrackingLogsWhere = (
  userId: string,
  filters?: Record<string, (string | boolean)[]>
) => {
  const tagFilters = filters?.tag
    ?.filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean)

  const typeFilters = filters?.type?.filter(
    (value): value is 'check_in' | 'check_out' =>
      value === 'check_in' || value === 'check_out'
  )

  return and(
    eq(trackingLogsTable.userId, userId),
    tagFilters?.length ? inArray(trackingLogsTable.tag, tagFilters) : sql`true`,
    typeFilters?.length
      ? inArray(trackingLogsTable.type, typeFilters)
      : sql`true`
  )
}

const escapeCsvCell = (value: string | null) => {
  if (value == null) {
    return ''
  }

  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

export const getTrackingLogsAction = authActionClient
  .inputSchema(
    z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(10),
      sortOrder: sortOrderSchema,
      filters: trackingLogFiltersSchema
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    const where = getTrackingLogsWhere(ctx.user.id, parsedInput.filters)

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trackingLogsTable)
      .where(where)

    const rows = await db
      .select({
        id: trackingLogsTable.id,
        tag: trackingLogsTable.tag,
        type: trackingLogsTable.type,
        timestamp: trackingLogsTable.timestamp
      })
      .from(trackingLogsTable)
      .where(where)
      .orderBy(
        parsedInput.sortOrder === 'asc'
          ? asc(trackingLogsTable.timestamp)
          : desc(trackingLogsTable.timestamp)
      )
      .limit(parsedInput.limit)
      .offset((parsedInput.page - 1) * parsedInput.limit)

    return {
      rows,
      totalCount: countRow?.count ?? 0
    }
  })

export const exportTrackingLogsCsvAction = authActionClient
  .inputSchema(
    z.object({
      sortOrder: sortOrderSchema,
      filters: trackingLogFiltersSchema
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    const rows = await db
      .select({
        id: trackingLogsTable.id,
        tag: trackingLogsTable.tag,
        type: trackingLogsTable.type,
        timestamp: trackingLogsTable.timestamp
      })
      .from(trackingLogsTable)
      .where(getTrackingLogsWhere(ctx.user.id, parsedInput.filters))
      .orderBy(
        parsedInput.sortOrder === 'asc'
          ? asc(trackingLogsTable.timestamp)
          : desc(trackingLogsTable.timestamp)
      )
      .limit(EXPORT_LIMIT)

    const header = ['id', 'type', 'tag', 'timestamp']
    const csvRows = rows.map(row =>
      [
        row.id,
        row.type,
        row.tag,
        row.timestamp instanceof Date
          ? row.timestamp.toISOString()
          : new Date(row.timestamp).toISOString()
      ]
        .map(value => escapeCsvCell(value))
        .join(',')
    )

    return {
      csv: [header.join(','), ...csvRows].join('\n'),
      filename: `tracking-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      rowCount: rows.length,
      limit: EXPORT_LIMIT
    }
  })

export const getTrackingLogTagsAction = authActionClient
  .inputSchema(z.object({}).optional())
  .action(async ({ ctx }) => {
    const rows = await db
      .selectDistinct({ tag: trackingLogsTable.tag })
      .from(trackingLogsTable)
      .where(eq(trackingLogsTable.userId, ctx.user.id))
      .orderBy(asc(trackingLogsTable.tag))

    return rows
      .map(row => row.tag)
      .filter((tag): tag is string => Boolean(tag))
      .map(tag => ({ label: tag, value: tag }))
  })

export const createTrackingLogAction = authActionClient
  .inputSchema(
    z.object({
      type: trackingLogTypeSchema,
      tag: z.string().trim().max(80).optional()
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    const [row] = await db
      .insert(trackingLogsTable)
      .values({
        userId: ctx.user.id,
        type: parsedInput.type,
        tag: cleanTag(parsedInput.tag),
        timestamp: new Date()
      })
      .returning({
        id: trackingLogsTable.id,
        tag: trackingLogsTable.tag,
        type: trackingLogsTable.type,
        timestamp: trackingLogsTable.timestamp
      })

    return row
  })
