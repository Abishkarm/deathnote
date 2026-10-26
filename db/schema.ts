import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const entries = sqliteTable('entries', {
 id:text('id').primaryKey(),owner:text('owner').notNull(),name:text('name').notNull(),alias:text('alias').notNull(),universe:text('universe').notNull(),details:text('details').notNull(),kind:text('kind').notNull(),photo:text('photo'),created:integer('created').notNull(),updated:integer('updated').notNull()
}, (t) => [index('entries_owner_idx').on(t.owner)]);

export const notes = sqliteTable('notes', {
 id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),authorName:text('authorName').notNull(),recipient:text('recipient').notNull(),body:text('body').notNull(),status:text('status').notNull().default('draft'),created:integer('created').notNull(),updated:integer('updated').notNull()
},t=>[index('notes_owner_idx').on(t.owner),index('notes_status_idx').on(t.status)]);
