import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text
} from 'drizzle-orm/pg-core'
import { commonFieldDefs } from './common'

export const trackingLogTypeEnum = pgEnum('tracking_log_type', [
  'check_in',
  'check_out'
])

export const usersTable = pgTable('users', {
  id: commonFieldDefs.id('user'),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: commonFieldDefs.date('ban_expires'),
  ...commonFieldDefs.dates
})

export const sessionsTable = pgTable(
  'sessions',
  {
    id: commonFieldDefs.id('session'),
    expiresAt: commonFieldDefs.date('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    ...commonFieldDefs.dates
  },
  table => [index('sessions_userId_idx').on(table.userId)]
)

export const accountsTable = pgTable(
  'accounts',
  {
    id: commonFieldDefs.id('account'),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: commonFieldDefs.date('access_token_expires_at'),
    refreshTokenExpiresAt: commonFieldDefs.date('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...commonFieldDefs.dates
  },
  table => [index('accounts_userId_idx').on(table.userId)]
)

export const verificationsTable = pgTable(
  'verifications',
  {
    id: commonFieldDefs.id('verification'),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: commonFieldDefs.date('expires_at').notNull(),
    ...commonFieldDefs.dates
  },
  table => [index('verifications_identifier_idx').on(table.identifier)]
)

export const apikeysTable = pgTable(
  'apikeys',
  {
    id: commonFieldDefs.id('apikey'),
    configId: text('config_id').default('default').notNull(),
    name: text('name'),
    start: text('start'),
    referenceId: text('reference_id').notNull(),
    prefix: text('prefix'),
    key: text('key').notNull(),
    refillInterval: integer('refill_interval'),
    refillAmount: integer('refill_amount'),
    lastRefillAt: commonFieldDefs.date('last_refill_at'),
    enabled: boolean('enabled').default(true),
    rateLimitEnabled: boolean('rate_limit_enabled').default(true),
    rateLimitTimeWindow: integer('rate_limit_time_window').default(86400000),
    rateLimitMax: integer('rate_limit_max').default(10),
    requestCount: integer('request_count').default(0),
    remaining: integer('remaining'),
    lastRequest: commonFieldDefs.date('last_request'),
    expiresAt: commonFieldDefs.date('expires_at'),
    permissions: text('permissions'),
    metadata: text('metadata'),
    ...commonFieldDefs.dates
  },
  table => [
    index('apikeys_configId_idx').on(table.configId),
    index('apikeys_referenceId_idx').on(table.referenceId),
    index('apikeys_key_idx').on(table.key)
  ]
)

export const trackingLogsTable = pgTable(
  'tracking_logs',
  {
    id: commonFieldDefs.id('tracking_log'),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    tag: text('tag'),
    type: trackingLogTypeEnum('type').notNull(),
    timestamp: commonFieldDefs.date('timestamp').notNull().defaultNow(),
  },
  table => [
    index('tracking_logs_userId_timestamp_idx').on(
      table.userId,
      table.timestamp
    ),
    index('tracking_logs_userId_tag_timestamp_idx').on(
      table.userId,
      table.tag,
      table.timestamp
    )
  ]
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  trackingLogs: many(trackingLogsTable)
}))

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id]
  })
}))

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id]
  })
}))

export const trackingLogsRelations = relations(
  trackingLogsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [trackingLogsTable.userId],
      references: [usersTable.id]
    })
  })
)
