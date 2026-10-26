import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const entries = sqliteTable('entries', {
 id:text('id').primaryKey(),owner:text('owner').notNull(),name:text('name').notNull(),alias:text('alias').notNull(),universe:text('universe').notNull(),details:text('details').notNull(),kind:text('kind').notNull(),photo:text('photo'),created:integer('created').notNull(),updated:integer('updated').notNull()
}, (t) => [index('entries_owner_idx').on(t.owner)]);

