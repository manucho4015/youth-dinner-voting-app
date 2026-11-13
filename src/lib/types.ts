import type { categories, nominees } from '../db/schema'

export type Category = typeof categories.$inferSelect
export type Nominee = typeof nominees.$inferSelect