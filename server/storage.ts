import { db } from "./db";
import {
  companies,
  notes,
  lists,
  listItems,
  savedSearches,
  type Company,
  type InsertCompany,
  type Note,
  type InsertNote,
  type List,
  type InsertList,
  type ListItem,
  type InsertListItem,
  type SavedSearch,
  type InsertSavedSearch,
  type UpdateCompanyRequest
} from "@shared/schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompanies(filters?: {
    search?: string;
    sector?: string;
    stage?: string;
    location?: string;
    sort?: string;
  }): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: UpdateCompanyRequest): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  // Notes
  getNotes(companyId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;

  // Lists
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  deleteList(id: number): Promise<void>;
  
  // List Items
  getListItems(listId: number): Promise<ListItem[]>;
  addListItem(item: InsertListItem): Promise<ListItem>;
  removeListItem(listId: number, companyId: number): Promise<void>;
  getCompanyListItems(companyId: number): Promise<ListItem[]>;

  // Saved Searches
  getSavedSearches(): Promise<SavedSearch[]>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompanies(filters?: {
    search?: string;
    sector?: string;
    stage?: string;
    location?: string;
    sort?: string;
  }): Promise<Company[]> {
    let query = db.select().from(companies);
    
    const conditions = [];
    
    if (filters?.search) {
      const searchLower = `%${filters.search.toLowerCase()}%`;
      conditions.push(or(
        ilike(companies.name, searchLower),
        ilike(companies.description, searchLower),
        ilike(companies.sector, searchLower)
      ));
    }
    
    if (filters?.sector) {
      conditions.push(eq(companies.sector, filters.sector));
    }
    
    if (filters?.stage) {
      conditions.push(eq(companies.stage, filters.stage));
    }

    if (filters?.location) {
      conditions.push(eq(companies.location, filters.location));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // Default sort by ID desc if not specified
    // @ts-ignore
    query = query.orderBy(desc(companies.id));

    return await query;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, updates: UpdateCompanyRequest): Promise<Company> {
    const [updated] = await db.update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Notes
  async getNotes(companyId: number): Promise<Note[]> {
    return await db.select().from(notes)
      .where(eq(notes.companyId, companyId))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  // Lists
  async getLists(): Promise<List[]> {
    return await db.select().from(lists).orderBy(desc(lists.createdAt));
  }

  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list;
  }

  async createList(list: InsertList): Promise<List> {
    const [newList] = await db.insert(lists).values(list).returning();
    return newList;
  }

  async deleteList(id: number): Promise<void> {
    await db.delete(listItems).where(eq(listItems.listId, id));
    await db.delete(lists).where(eq(lists.id, id));
  }

  // List Items
  async getListItems(listId: number): Promise<ListItem[]> {
    return await db.select().from(listItems).where(eq(listItems.listId, listId));
  }

  async addListItem(item: InsertListItem): Promise<ListItem> {
    // Check if exists
    const [existing] = await db.select().from(listItems)
      .where(and(eq(listItems.listId, item.listId), eq(listItems.companyId, item.companyId)));
    
    if (existing) return existing;

    const [newItem] = await db.insert(listItems).values(item).returning();
    return newItem;
  }

  async removeListItem(listId: number, companyId: number): Promise<void> {
    await db.delete(listItems)
      .where(and(eq(listItems.listId, listId), eq(listItems.companyId, companyId)));
  }

  async getCompanyListItems(companyId: number): Promise<ListItem[]> {
    return await db.select().from(listItems).where(eq(listItems.companyId, companyId));
  }

  // Saved Searches
  async getSavedSearches(): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches).orderBy(desc(savedSearches.createdAt));
  }

  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const [newSearch] = await db.insert(savedSearches).values(search).returning();
    return newSearch;
  }

  async deleteSavedSearch(id: number): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }
}

export const storage = new DatabaseStorage();
