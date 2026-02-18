import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client"; // Reusing the OpenAI client config from image module

import axios from "axios";
import * as cheerio from "cheerio";

// Helper to scrape and enrich
async function enrichCompanyData(website: string, companyName: string) {
  try {
    let scrapedContent = "";
    try {
      const response = await axios.get(website, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style').remove();
      scrapedContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    } catch (scrapeError) {
      console.warn(`Could not scrape ${website}, falling back to general knowledge`, scrapeError);
    }
    
    const prompt = `
      Analyze the company "${companyName}" with website "${website}".
      ${scrapedContent ? `Here is some content from their website: "${scrapedContent}"` : "Could not fetch website content, please use your general knowledge of this company if available."}
      
      Provide a JSON response with the following fields:
      - summary: A brief 2-sentence summary of what they do.
      - whatTheyDo: An array of 3-5 bullet points describing their key value propositions.
      - keywords: An array of 5-10 industry keywords.
      - derivedSignals: An array of 3-5 inferred signals (e.g., "Hiring Engineers", "Raised Series A", "AI-first").
      - score: A number between 0-100 indicating VC interest score based on market trends (AI, B2B SaaS, etc.).

      Return ONLY JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Enrichment failed:", error);
    throw error;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Companies Routes
  app.get(api.companies.list.path, async (req, res) => {
    try {
      const filters = req.query;
      const companies = await storage.getCompanies(filters);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get(api.companies.get.path, async (req, res) => {
    const company = await storage.getCompany(Number(req.params.id));
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  });

  app.post(api.companies.create.path, async (req, res) => {
    try {
      const input = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(input);
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put(api.companies.update.path, async (req, res) => {
    try {
      const input = api.companies.update.input.parse(req.body);
      const company = await storage.updateCompany(Number(req.params.id), input);
      res.json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete(api.companies.delete.path, async (req, res) => {
    try {
      await storage.deleteCompany(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Company not found" });
    }
  });

  app.post(api.companies.enrich.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const company = await storage.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Update status to processing
      await storage.updateCompany(id, { enrichmentStatus: "processing" });

      // Perform enrichment
      const enrichmentData = await enrichCompanyData(company.website, company.name);

      // Update company with results
      const updatedCompany = await storage.updateCompany(id, {
        summary: enrichmentData.summary,
        whatTheyDo: enrichmentData.whatTheyDo,
        keywords: enrichmentData.keywords,
        derivedSignals: enrichmentData.derivedSignals,
        score: enrichmentData.score,
        enrichmentStatus: "completed",
        lastEnrichedAt: new Date(),
      });

      res.json(updatedCompany);

    } catch (error) {
      console.error(error);
      // Update status to failed
      await storage.updateCompany(Number(req.params.id), { enrichmentStatus: "failed" });
      res.status(500).json({ message: "Enrichment failed" });
    }
  });

  // Notes Routes
  app.get(api.notes.list.path, async (req, res) => {
    const notes = await storage.getNotes(Number(req.params.companyId));
    res.json(notes);
  });

  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createNote({
        ...input,
        companyId: Number(req.params.companyId)
      });
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Lists Routes
  app.get(api.lists.list.path, async (req, res) => {
    const lists = await storage.getLists();
    res.json(lists);
  });

  app.post(api.lists.create.path, async (req, res) => {
    try {
      const input = api.lists.create.input.parse(req.body);
      const list = await storage.createList(input);
      res.status(201).json(list);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create list" });
    }
  });

  app.get(api.lists.get.path, async (req, res) => {
    const list = await storage.getList(Number(req.params.id));
    if (!list) return res.status(404).json({ message: "List not found" });
    
    const items = await storage.getListItems(list.id);
    const companies = await Promise.all(items.map(item => storage.getCompany(item.companyId)));
    // Filter out undefineds if company was deleted
    const validCompanies = companies.filter(c => c !== undefined);

    res.json({ list, items: validCompanies });
  });

  app.delete(api.lists.delete.path, async (req, res) => {
    await storage.deleteList(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.lists.addItem.path, async (req, res) => {
    try {
      const { companyId } = req.body;
      const item = await storage.addListItem({
        listId: Number(req.params.id),
        companyId
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item" });
    }
  });

  app.delete(api.lists.removeItem.path, async (req, res) => {
    await storage.removeListItem(Number(req.params.id), Number(req.params.companyId));
    res.status(204).send();
  });

  // Saved Searches Routes
  app.get(api.savedSearches.list.path, async (req, res) => {
    const searches = await storage.getSavedSearches();
    res.json(searches);
  });

  app.post(api.savedSearches.create.path, async (req, res) => {
    try {
      const input = api.savedSearches.create.input.parse(req.body);
      const search = await storage.createSavedSearch(input);
      res.status(201).json(search);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create saved search" });
    }
  });

  app.delete(api.savedSearches.delete.path, async (req, res) => {
    await storage.deleteSavedSearch(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data (One-time check)
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getCompanies();
  if (existing.length > 0) return;

  const mockCompanies = [
    {
      name: "Acme Corp",
      website: "https://acme.com",
      sector: "B2B SaaS",
      stage: "Series A",
      location: "San Francisco",
      description: "Building the next generation of roadrunner traps.",
      score: 85
    },
    {
      name: "Globex",
      website: "https://globex.com",
      sector: "Fintech",
      stage: "Seed",
      location: "New York",
      description: "Global financial exchange platform.",
      score: 72
    },
    {
      name: "Soylent",
      website: "https://soylent.com",
      sector: "FoodTech",
      stage: "Series B",
      location: "Los Angeles",
      description: "Engineered nutrition for the future.",
      score: 90
    },
    {
      name: "Initech",
      website: "https://initech.com",
      sector: "Enterprise Software",
      stage: "IPO",
      location: "Austin",
      description: "Automating TPS reports.",
      score: 60
    },
    {
      name: "Cyberdyne",
      website: "https://cyberdyne.com",
      sector: "AI/Robotics",
      stage: "Series C",
      location: "Silicon Valley",
      description: "Advanced robotics and AI defense systems.",
      score: 98
    }
  ];

  for (const company of mockCompanies) {
    await storage.createCompany(company);
  }
  
  console.log("Database seeded with mock companies");
}
