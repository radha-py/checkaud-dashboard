import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Simple session setup for demo auth
  app.use(session({
    secret: 'mbrdi-checkaud-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { secure: false } // Set to true in production with HTTPS
  }));

  // === AUTH ===
  
  app.post(api.auth.login.path, async (req, res) => {
    const { username } = req.body;
    const user = await storage.getUser(username);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid user. Try user1, user2, or user3" });
    }
    
    const access = await storage.getUserAccess(username);
    
    // Set session
    (req.session as any).user = { username, access };
    
    res.json({ username, systems: access });
  });

  app.get(api.auth.me.path, (req, res) => {
    const user = (req.session as any).user;
    if (!user) {
      return res.json(null);
    }
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // === SYSTEMS ===

  app.get(api.systems.list.path, async (req, res) => {
    const user = (req.session as any).user;
    const allSystems = await storage.getSystems();
    
    // Mark access
    const result = allSystems.map(sys => ({
      id: sys.id,
      name: sys.name,
      hasAccess: user ? user.access.includes(sys.id) : false
    }));
    
    res.json(result);
  });

  app.get(api.systems.details.path, async (req, res) => {
    const user = (req.session as any).user;
    const { id } = req.params;
    
    if (!user || !user.access.includes(id)) {
      return res.status(403).json({ message: "Access Denied to this system." });
    }
    
    const system = await storage.getSystemDetails(id);
    if (!system) {
      return res.status(404).json({ message: "System not found" });
    }
    
    res.json(system);
  });

  // === ANALYTICS ===

  app.get(api.analytics.get.path, async (req, res) => {
    const user = (req.session as any).user;
    const { systemId } = req.params;
    
    if (!user || !user.access.includes(systemId)) {
      return res.status(403).json({ message: "Access Denied to this system's analytics." });
    }
    
    const data = await storage.getAnalytics(systemId);
    if (!data) {
       // Fallback mock if missing
       return res.json({
         systemId,
         systemName: "Unknown System",
         kpis: [],
         complianceOverTime: [],
         issuesByCategory: []
       });
    }
    res.json(data);
  });

  app.get(api.analytics.global.path, async (req, res) => {
    const user = (req.session as any).user;
    if (!user) return res.status(403).json({ message: "Unauthorized" });
    
    const data = await storage.getGlobalAnalytics();
    res.json(data);
  });

  // === SCANS ===

  app.post(api.scan.request.path, async (req, res) => {
    const user = (req.session as any).user;
    if (!user) return res.status(403).json({ message: "Unauthorized" });
    
    const { systemIds } = req.body;
    
    // Verify access
    const unauthorized = systemIds.filter((id: string) => !user.access.includes(id));
    if (unauthorized.length > 0) {
      return res.status(403).json({ message: `Unauthorized for systems: ${unauthorized.join(', ')}` });
    }
    
    const requests = [];
    for (const sysId of systemIds) {
      const scan = await storage.createScanRequest({
        systemId: sysId,
        requestedBy: user.username,
        status: 'Pending'
      });
      requests.push(scan);
    }
    
    res.json(requests);
  });

  app.get(api.scan.list.path, async (req, res) => {
    const scans = await storage.getScanRequests();
    res.json(scans);
  });

  // === CHATBOT ===

  const CHATBOT_KNOWLEDGE = [
    { keywords: ['access', 'permission', 'see'], answer: "Access is controlled via the IT Access Management Portal. If you cannot see a system, you likely do not have the required permissions mapped to your user ID." },
    { keywords: ['scan', 'ad-hoc', 'trigger'], answer: "You can request an Ad-Hoc scan from the Analytics page. Select the system and click 'Request Ad-Hoc Scan'. Scans typically take 5-10 minutes." },
    { keywords: ['analytics', 'data', 'update'], answer: "Analytics are updated daily at 00:00 UTC. Ad-hoc scans will update the data immediately upon completion." },
    { keywords: ['maintenance', 'down', 'stopped'], answer: "Scheduled maintenance occurs every Sunday from 2:00 AM to 4:00 AM UTC. If the bot is stopped, please contact the IT Service Desk." },
    { keywords: ['compare', 'comparison'], answer: "Use the 'Compare' toggle on the Analytics page to select multiple systems and view their KPIs side-by-side." },
    { keywords: ['hello', 'hi', 'help'], answer: "Hello! I am the CheckAud assistant. I can help with questions about access, scans, and dashboard features." }
  ];

  app.post(api.chatbot.ask.path, (req, res) => {
    const { query } = req.body;
    const lowerQuery = query.toLowerCase();
    
    let bestMatch = "I'm not sure about that. Please contact the MBRDI IT Helpdesk for complex queries.";
    
    for (const item of CHATBOT_KNOWLEDGE) {
      if (item.keywords.some(k => lowerQuery.includes(k))) {
        bestMatch = item.answer;
        break;
      }
    }
    
    res.json({ answer: bestMatch });
  });

  return httpServer;
}
