'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Download, Loader2 } from 'lucide-react'
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates
} from 'nuqs'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '~/components/data-table'
import { SortOrderEnum } from '~/components/data-table/enum'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/lib/format-date'
import {
  useSafeActionMutation,
  useSafeActionQuery
} from '~/lib/safe-action-client'
import {
  exportTrackingLogsCsvAction,
  getTrackingLogTagsAction,
  getTrackingLogsAction
} from '../../actions/tracking-logs'

type TrackingLog = {
  id: string
  tag: string | null
  type: 'check_in' | 'check_out'
  timestamp: Date
}

const columns: ColumnDef<TrackingLog>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    enableSorting: false,
    cell: ({ row }) => (
      <Badge
        variant={row.original.type === 'check_in' ? 'default' : 'secondary'}
      >
        {row.original.type === 'check_in' ? 'Check in' : 'Check out'}
      </Badge>
    )
  },
  {
    accessorKey: 'tag',
    header: 'Tag',
    enableSorting: false,
    cell: ({ row }) => row.original.tag || '—'
  },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => formatDate(row.original.timestamp, { time: true })
  }
]

export function TrackingLogsTable() {
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    sortOrder: parseAsString.withDefault(SortOrderEnum.DESC),
    filters: parseAsJson(v => v as Record<string, (string | boolean)[]>)
  })

  const input = {
    page: queryState.page,
    limit: queryState.limit,
    sortOrder:
      queryState.sortOrder === SortOrderEnum.ASC
        ? SortOrderEnum.ASC
        : SortOrderEnum.DESC,
    filters: queryState.filters ?? undefined
  }

  const { data, isPending } = useSafeActionQuery(
    'tracking-logs',
    getTrackingLogsAction,
    input
  )

  const { data: tagOptions } = useSafeActionQuery(
    'tracking-log-tags',
    getTrackingLogTagsAction,
    {}
  )

  const exportMutation = useSafeActionMutation(exportTrackingLogsCsvAction, {
    onSuccess: data => {
      if (!data) return

      const blob = new Blob([data.csv], {
        type: 'text/csv;charset=utf-8'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success(`Exported ${data.rowCount} tracking logs`, {
        description: `CSV exports are capped at ${data.limit.toLocaleString()} rows.`
      })
    },
    onError: error => {
      toast.error(error.message || 'Failed to export tracking logs')
    }
  })

  const filters = useMemo(
    () => [
      {
        id: 'type',
        label: 'Type',
        options: [
          { label: 'Check in', value: 'check_in' },
          { label: 'Check out', value: 'check_out' }
        ]
      },
      ...(tagOptions?.length
        ? [
            {
              id: 'tag',
              label: 'Tag',
              options: tagOptions
            }
          ]
        : [])
    ],
    [tagOptions]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Export uses the active filters and sort order. CSV is capped at 10,000
          rows.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportMutation.mutate({
              sortOrder: input.sortOrder,
              filters: input.filters
            })
          }
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Download />
          )}
          Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isPending}
        totalCount={data?.totalCount ?? 0}
        manualPagination
        manualSorting
        pageIndex={queryState.page - 1}
        pageSize={queryState.limit}
        initialSorting={[
          {
            id: 'timestamp',
            desc: queryState.sortOrder !== SortOrderEnum.ASC
          }
        ]}
        filters={filters}
        activeFilters={queryState.filters ?? {}}
        onParamsChange={params => {
          void setQueryState({
            page: params.page,
            limit: params.limit,
            sortOrder:
              params.sortOrder === SortOrderEnum.ASC
                ? SortOrderEnum.ASC
                : SortOrderEnum.DESC,
            filters: params.filters ?? null
          })
        }}
      />
    </div>
  )
}
