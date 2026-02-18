import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  sector: text("sector"),
  stage: text("stage"),
  location: text("location"),
  score: integer("score").default(0),
  description: text("description"),
  logoUrl: text("logo_url"),
  summary: text("summary"),
  whatTheyDo: text("what_they_do").array(),
  keywords: text("keywords").array(),
  derivedSignals: text("derived_signals").array(),
  enrichmentStatus: text("enrichment_status").default("pending"), // pending, processing, completed, failed
  lastEnrichedAt: timestamp("last_enriched_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  companyId: integer("company_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filters: jsonb("filters").notNull(), // Stores the filter configuration
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const companiesRelations = relations(companies, ({ many }) => ({
  notes: many(notes),
  listItems: many(listItems),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  company: one(companies, {
    fields: [notes.companyId],
    references: [companies.id],
  }),
}));

export const listsRelations = relations(lists, ({ many }) => ({
  items: many(listItems),
}));

export const listItemsRelations = relations(listItems, ({ one }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  company: one(companies, {
    fields: [listItems.companyId],
    references: [companies.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCompanySchema = createInsertSchema(companies).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastEnrichedAt: true,
  derivedSignals: true,
  keywords: true,
  whatTheyDo: true,
  summary: true,
  enrichmentStatus: true
});

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export const insertListSchema = createInsertSchema(lists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertListItemSchema = createInsertSchema(listItems).omit({ id: true, createdAt: true });
export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type UpdateCompanyRequest = Partial<InsertCompany>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;

export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = z.infer<typeof insertListItemSchema>;

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;

export type EnrichmentResponse = {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  score: number;
};
