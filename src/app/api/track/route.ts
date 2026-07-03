import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '~/db'
import { trackingLogsTable } from '~/db/schema'
import { auth } from '~/lib/auth'

const bodySchema = z.object({
  type: z.enum(['check_in', 'check_out']),
  tag: z.string().trim().max(255).nullish()
})

const cleanTag = (tag?: string | null) => {
  const value = tag?.trim()
  return value ? value : null
}

export async function POST(request: Request) {
  const key =
    request.headers.get('x-api-key') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!key) {
    return NextResponse.json({ error: 'Missing API key', }, { status: 401 })
  }

  const verified = await auth.api.verifyApiKey({
    body: { key }
  })

  if (!verified.valid || !verified.key) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const [log] = await db
    .insert(trackingLogsTable)
    .values({
      userId: verified.key.referenceId,
      type: parsed.data.type,
      tag: cleanTag(parsed.data.tag),
      timestamp: new Date()
    })
    .returning({
      id: trackingLogsTable.id,
      tag: trackingLogsTable.tag,
      type: trackingLogsTable.type,
      timestamp: trackingLogsTable.timestamp
    })

  return NextResponse.json({ log, message: 'Tracking log created successfully' }, { status: 201 })
}
