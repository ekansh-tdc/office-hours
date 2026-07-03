import { History } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { TrackingLogsTable } from '../_components/tracking-logs-table'

export default async function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Tracking logs"
        description="Review check-ins and check-outs recorded from automations or manual entries."
        icon={History}
      />

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>
            Latest logs are shown first by default. Filter by type or tag,
            change timestamp sorting, and export the current view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrackingLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
