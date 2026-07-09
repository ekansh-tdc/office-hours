'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Smartphone,
  Trash2
} from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldError,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'
import { apiKey } from '~/lib/auth-client'
import { formatDate } from '~/lib/format-date'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'

const apiKeySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80)
})

type ApiKeyForm = z.infer<typeof apiKeySchema>

type ApiKeyListItem = {
  id: string
  name: string | null
  prefix: string | null
  enabled: boolean | null
  createdAt: Date | string
  expiresAt: Date | string | null
  lastRequest: Date | string | null
}

export function ApiKeysPageClient({ apiBaseUrl }: { apiBaseUrl: string }) {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [renamingKeyId, setRenamingKeyId] = useState<string | null>(null)
  const [busyKeyId, setBusyKeyId] = useState<string | null>(null)

  const apiKeyForm = useForm<ApiKeyForm>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: ''
    }
  })

  const {
    data: apiKeys,
    isPending: apiKeysPending,
    refetch: refetchApiKeys
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await apiKey.list({
        query: {
          sortBy: 'createdAt',
          sortDirection: 'desc'
        }
      })

      if (error) throw new Error(error.message ?? 'Failed to load API keys')
      return (data?.apiKeys ?? []) as ApiKeyListItem[]
    }
  })

  async function createApiKey(values: ApiKeyForm) {
    const { data, error } = await apiKey.create({
      name: values.name
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to create API key')
      return
    }

    setNewApiKey(data?.key ?? null)
    setCopiedSecret(false)
    setCreateDialogOpen(false)
    apiKeyForm.reset({ name: '' })
    await queryClient.invalidateQueries({ queryKey: ['api-keys'] })
  }

  async function copySecretToClipboard() {
    if (!newApiKey) return

    try {
      await navigator.clipboard.writeText(newApiKey)
      setCopiedSecret(true)
      toastSuccessMessage('API key copied')
    } catch {
      toastErrorMessage('Could not copy API key')
    }
  }

  async function renameApiKey(keyId: string, name: string) {
    setBusyKeyId(keyId)
    const { error } = await apiKey.update({
      keyId,
      name
    })
    setBusyKeyId(null)

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to rename API key')
      return
    }

    setRenamingKeyId(null)
    toastSuccessMessage('API key updated')
    await refetchApiKeys()
  }

  async function deleteApiKey(keyId: string) {
    const confirmed = window.confirm('Delete this API key?')
    if (!confirmed) return

    setBusyKeyId(keyId)
    const { error } = await apiKey.delete({
      keyId
    })
    setBusyKeyId(null)

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to delete API key')
      return
    }

    toastSuccessMessage('API key deleted')
    await refetchApiKeys()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="API keys"
        description="Manage keys and setup instructions for phone automations."
        icon={KeyRound}
      />

      <Card>
        <CardHeader className="items-start gap-3 sm:grid sm:grid-cols-[1fr_auto]">
          <div>
            <CardTitle>Keys</CardTitle>
            <CardDescription>
              Create keys for iPhone, Samsung, or other automation routines.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus />
            Create key
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-48 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeysPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Loading API keys...
                    </TableCell>
                  </TableRow>
                ) : apiKeys?.length ? (
                  apiKeys.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="min-w-64">
                        {renamingKeyId === item.id ? (
                          <RenameApiKeyForm
                            defaultName={item.name ?? ''}
                            disabled={busyKeyId === item.id}
                            onCancel={() => setRenamingKeyId(null)}
                            onSave={name => renameApiKey(item.id, name)}
                          />
                        ) : (
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                              <KeyRound className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {item.name || 'Untitled key'}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Secret hidden after creation
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.enabled === false ? 'destructive' : 'secondary'
                          }
                        >
                          {item.enabled === false ? 'Disabled' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.prefix || '-'}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        {item.lastRequest
                          ? formatDate(item.lastRequest, { time: true })
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              busyKeyId === item.id || renamingKeyId === item.id
                            }
                            onClick={() => setRenamingKeyId(item.id)}
                          >
                            <Pencil />
                            Rename
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={busyKeyId === item.id}
                            onClick={() => deleteApiKey(item.id)}
                          >
                            {busyKeyId === item.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Trash2 />
                            )}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-32 text-center"
                    >
                      No API keys yet. Create one to connect a device
                      automation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ApiUsageInstructions apiBaseUrl={apiBaseUrl} />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Name this key by device or automation so you can identify it
              later.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={apiKeyForm.handleSubmit(createApiKey)}
            className="flex flex-col gap-6"
          >
            <Field orientation="vertical">
              <FieldContent>
                <FieldTitle>Name</FieldTitle>
                <Input
                  {...apiKeyForm.register('name')}
                  placeholder="iPhone arrival automation"
                  autoFocus
                  aria-invalid={!!apiKeyForm.formState.errors.name}
                />
                <FieldError errors={[apiKeyForm.formState.errors.name]} />
              </FieldContent>
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={apiKeyForm.formState.isSubmitting}
              >
                {apiKeyForm.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus />
                )}
                Create key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Copy this key now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm">
            {newApiKey}
          </div>
          <DialogFooter>
            <Button type="button" onClick={copySecretToClipboard}>
              {copiedSecret ? <Check /> : <Copy />}
              {copiedSecret ? 'Copied' : 'Copy key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApiUsageInstructions({ apiBaseUrl }: { apiBaseUrl: string }) {
  const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/api/track`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup guide</CardTitle>
        <CardDescription>
          Use this endpoint from phone automations when arriving at or leaving
          the office.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-semibold">Tracking API</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Send a POST request with your API key in the request headers.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <InstructionRow label="Method" value="POST" />
              <InstructionRow label="Endpoint" value={endpoint} />
              <InstructionRow label="Header" value="x-api-key: YOUR_API_KEY" />
              <InstructionRow
                label="Header"
                value="content-type: application/json"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Body
              </p>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                <code>{`{
  "type": "check_in",
  "tag": "office"
}`}</code>
              </pre>
              <p className="text-muted-foreground text-xs">
                `type` must be `check_in` or `check_out`. `tag` is optional.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              cURL
            </p>
            <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
              <code>{`curl -X POST ${endpoint} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{"type":"check_in","tag":"office"}'`}</code>
            </pre>
          </div>
        </div>

        <AutomationSetupGuide endpoint={endpoint} />
      </CardContent>
    </Card>
  )
}

function AutomationSetupGuide({ endpoint }: { endpoint: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div>
        <h3 className="text-sm font-semibold">Phone automation setup</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Create one arrival automation with `check_in`, then duplicate it for
          leaving with `check_out`.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AutomationCard
          title="Apple Shortcuts"
          icon={Smartphone}
          steps={[
            'Open Shortcuts, go to Automation, and create a new personal automation.',
            'Choose Arrive, select your office location, and set it to run immediately.',
            'Add Get Contents of URL, paste the endpoint, and set Method to POST.',
            'Add headers: x-api-key with your API key, and content-type as application/json.',
            'Set the JSON body to {"type":"check_in","tag":"office"}.',
            'Create a second automation for Leave and change type to check_out.'
          ]}
        />

        <AutomationCard
          title="Samsung (Routines + HTTP Shortcuts)"
          icon={Settings}
          steps={[
            <span key="install">
              Install{' '}
              <a
                href="https://play.google.com/store/apps/details?id=ch.rmy.android.http_shortcuts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 font-medium underline underline-offset-2"
              >
                HTTP Shortcuts
                <ExternalLink className="inline size-3" />
              </a>{' '}
              from the Play Store.
            </span>,
            'Open HTTP Shortcuts, tap +, and create a new shortcut named "Check In".',
            'Set Method to POST, paste the endpoint URL, and add headers: x-api-key with your API key and content-type as application/json.',
            'Set the request body to {"type":"check_in","tag":"office"} and save the shortcut.',
            'Create a second shortcut named "Check Out" with the same setup but change type to check_out.',
            'Open Samsung Modes and Routines, create a new routine, and choose Location as the condition.',
            'Select Arriving at your office location, then add the action "Open an app or a page" and choose the "Check In" shortcut from HTTP Shortcuts.',
            'Create a second routine for Leaving and link it to the "Check Out" shortcut.'
          ]}
        />
      </div>

      <div className="bg-muted rounded-md p-3 text-xs">
        <p className="font-medium">Endpoint</p>
        <code className="mt-1 block overflow-x-auto">{endpoint}</code>
      </div>
    </div>
  )
}

function AutomationCard({
  title,
  icon: Icon,
  steps
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  steps: ReactNode[]
}) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
          <Icon className="size-4" />
        </span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-sm">
            <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              {index + 1}
            </span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function InstructionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[96px_1fr] sm:items-center">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </p>
      <code className="bg-muted rounded px-2 py-1 text-xs">{value}</code>
    </div>
  )
}

function RenameApiKeyForm({
  defaultName,
  disabled,
  onCancel,
  onSave
}: {
  defaultName: string
  disabled: boolean
  onCancel: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(defaultName)

  return (
    <form
      className="flex gap-2"
      onSubmit={event => {
        event.preventDefault()
        void onSave(name)
      }}
    >
      <Input
        value={name}
        onChange={event => setName(event.target.value)}
        disabled={disabled}
        className="h-8"
      />
      <Button type="submit" size="sm" disabled={disabled || !name.trim()}>
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </form>
  )
}
