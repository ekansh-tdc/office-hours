import { and, desc, eq, gte, sql } from 'drizzle-orm'
import {
  ArrowRight,
  Clock,
  History,
  LayoutDashboard,
  LogIn,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { PageHeading } from '~/components/page-heading'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'
import { db } from '~/db'
import { trackingLogsTable } from '~/db/schema'
import { getAuthSession } from '~/lib/auth'
import { formatDate } from '~/lib/format-date'

export default async function Page() {
  const authSession = await getAuthSession()

  if (!authSession) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      checkIns: sql<number>`count(*) filter (where ${trackingLogsTable.type} = 'check_in')::int`,
      checkOuts: sql<number>`count(*) filter (where ${trackingLogsTable.type} = 'check_out')::int`
    })
    .from(trackingLogsTable)
    .where(eq(trackingLogsTable.userId, authSession.user.id))

  const [todayStats] = await db
    .select({
      total: sql<number>`count(*)::int`
    })
    .from(trackingLogsTable)
    .where(
      and(
        eq(trackingLogsTable.userId, authSession.user.id),
        gte(trackingLogsTable.timestamp, today)
      )
    )

  const recentLogs = await db
    .select({
      id: trackingLogsTable.id,
      tag: trackingLogsTable.tag,
      type: trackingLogsTable.type,
      timestamp: trackingLogsTable.timestamp
    })
    .from(trackingLogsTable)
    .where(eq(trackingLogsTable.userId, authSession.user.id))
    .orderBy(desc(trackingLogsTable.timestamp))
    .limit(5)

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Dashboard"
        description="Monitor office check-ins, check-outs, and recent tracking activity."
        icon={LayoutDashboard}
      >
        <Button asChild size="sm">
          <Link href="/app/tracking-logs">
            View logs
            <ArrowRight />
          </Link>
        </Button>
      </PageHeading>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total logs"
          value={stats?.total ?? 0}
          description="All recorded activity"
          icon={History}
        />
        <MetricCard
          title="Check-ins"
          value={stats?.checkIns ?? 0}
          description="Arrival events"
          icon={LogIn}
        />
        <MetricCard
          title="Check-outs"
          value={stats?.checkOuts ?? 0}
          description="Leave events"
          icon={LogOut}
        />
        <MetricCard
          title="Today"
          value={todayStats?.total ?? 0}
          description="Logs recorded today"
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest check-ins and check-outs across all tags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant={
                            log.type === 'check_in' ? 'default' : 'secondary'
                          }
                        >
                          {log.type === 'check_in' ? 'Check in' : 'Check out'}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.tag || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {formatDate(log.timestamp, { time: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-muted-foreground flex min-h-40 items-center justify-center rounded-md border border-dashed text-sm">
                No tracking logs yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Record a manual log or review the full tracking history.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-between">
              <Link href="/app/manual">
                Manual entry
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/app/tracking-logs">
                Tracking logs
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon
}: {
  title: string
  value: number
  description: string
  icon: FC<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  )
}
