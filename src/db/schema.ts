import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const nomineeType = pgEnum('nominee_type', ['individual', 'department'])

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: nomineeType('type').notNull(),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  closesAt: timestamp('closes_at', { withTimezone: true }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  revealedAt: timestamp('revealed_at', { withTimezone: true }),
})

export const nominees = pgTable('nominees', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: nomineeType('type').notNull(),
  imageUrl: text('image_url'), // null = show placeholder
})

export const categoryNominees = pgTable(
  'category_nominees',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    nomineeId: uuid('nominee_id')
      .notNull()
      .references(() => nominees.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.nomineeId] })],
)

export const votes = pgTable(
  'votes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    nomineeId: uuid('nominee_id')
      .notNull()
      .references(() => nominees.id, { onDelete: 'cascade' }),
    voterId: uuid('voter_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('one_vote_per_category').on(t.categoryId, t.voterId)],
)