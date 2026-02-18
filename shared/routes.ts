import { z } from 'zod';
import { 
  insertCompanySchema, 
  companies, 
  notes, 
  insertNoteSchema, 
  lists, 
  insertListSchema, 
  listItems, 
  insertListItemSchema,
  savedSearches,
  insertSavedSearchSchema
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies' as const,
      input: z.object({
        search: z.string().optional(),
        sector: z.string().optional(),
        stage: z.string().optional(),
        location: z.string().optional(),
        sort: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies' as const,
      input: insertCompanySchema,
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/companies/:id' as const,
      input: insertCompanySchema.partial(),
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/companies/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    enrich: {
      method: 'POST' as const,
      path: '/api/companies/:id/enrich' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    }
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/notes' as const,
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/notes' as const,
      input: insertNoteSchema.pick({ content: true }),
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  lists: {
    list: {
      method: 'GET' as const,
      path: '/api/lists' as const,
      responses: {
        200: z.array(z.custom<typeof lists.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/lists' as const,
      input: insertListSchema,
      responses: {
        201: z.custom<typeof lists.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/lists/:id' as const,
      responses: {
        200: z.object({
          list: z.custom<typeof lists.$inferSelect>(),
          items: z.array(z.custom<typeof companies.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/lists/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/lists/:id/items' as const,
      input: z.object({ companyId: z.number() }),
      responses: {
        201: z.custom<typeof listItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/lists/:id/items/:companyId' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  savedSearches: {
    list: {
      method: 'GET' as const,
      path: '/api/saved-searches' as const,
      responses: {
        200: z.array(z.custom<typeof savedSearches.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/saved-searches' as const,
      input: insertSavedSearchSchema,
      responses: {
        201: z.custom<typeof savedSearches.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/saved-searches/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  }
};

// ============================================
// HELPER: buildUrl
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
