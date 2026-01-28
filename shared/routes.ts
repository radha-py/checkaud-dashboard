import { z } from 'zod';
import { insertScanRequestSchema, scanRequests } from './schema';

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string() }),
      responses: {
        200: z.object({ username: z.string(), systems: z.array(z.string()) }), // Returns user + authorized system IDs
        401: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.object({ username: z.string(), systems: z.array(z.string()) }).nullable(),
      },
    },
  },
  systems: {
    list: {
      method: 'GET' as const,
      path: '/api/systems',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          hasAccess: z.boolean()
        })),
      },
    },
    details: {
      method: 'GET' as const,
      path: '/api/systems/:id',
      responses: {
        200: z.custom<any>(), // Returns recursive SystemNode structure
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics/:systemId',
      responses: {
        200: z.custom<any>(), // Returns AnalyticsData
        403: z.object({ message: z.string() }),
      },
    },
    global: {
      method: 'GET' as const,
      path: '/api/analytics/global',
      responses: {
        200: z.custom<any>(), // Returns aggregated AnalyticsData
      },
    },
  },
  scan: {
    request: {
      method: 'POST' as const,
      path: '/api/scan',
      input: z.object({ systemIds: z.array(z.string()) }),
      responses: {
        200: z.array(z.custom<typeof scanRequests.$inferSelect>()),
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/scan/history',
      responses: {
        200: z.array(z.custom<typeof scanRequests.$inferSelect>()),
      },
    },
  },
  chatbot: {
    ask: {
      method: 'POST' as const,
      path: '/api/chatbot/ask',
      input: z.object({ query: z.string() }),
      responses: {
        200: z.object({ answer: z.string(), intent: z.string().optional() }),
      },
    },
  },
};

export const errorSchemas = {
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

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
