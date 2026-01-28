import { User, ScanRequest, InsertScanRequest, SystemNode, AnalyticsData } from "@shared/schema";

// MOCK DATA DEFINITIONS
const MOCK_SYSTEMS: SystemNode[] = [
  {
    id: "sys_finance",
    name: "Finance System (SAP)",
    type: "system",
    metadata: { lastScan: "2023-10-25", complianceScore: 92 },
    children: [
      { id: "f_invoices", name: "Invoices", type: "folder" },
      { id: "f_payroll", name: "Payroll", type: "folder" }
    ]
  },
  {
    id: "sys_hr",
    name: "HR Portal (Workday)",
    type: "system",
    metadata: { lastScan: "2023-10-26", complianceScore: 88 },
    children: [
      { id: "f_employees", name: "Employee Records", type: "folder" },
      { id: "f_recruitment", name: "Recruitment", type: "folder" }
    ]
  },
  {
    id: "sys_logistics",
    name: "Logistics & Supply Chain",
    type: "system",
    metadata: { lastScan: "2023-10-24", complianceScore: 75 },
    children: [
      { id: "f_inventory", name: "Inventory", type: "folder" },
      { id: "f_shipping", name: "Shipping", type: "folder" }
    ]
  }
];

const MOCK_ANALYTICS: Record<string, AnalyticsData> = {
  "sys_finance": {
    systemId: "sys_finance",
    systemName: "Finance System (SAP)",
    kpis: [
      { label: "Compliance Score", value: "92%", trend: "up", trendValue: "+2%" },
      { label: "Critical Issues", value: 3, trend: "down", trendValue: "-1" },
      { label: "Files Scanned", value: 1250 },
      { label: "Risk Level", value: "Low" }
    ],
    complianceOverTime: [
      { date: "2023-08", score: 85 },
      { date: "2023-09", score: 89 },
      { date: "2023-10", score: 92 }
    ],
    issuesByCategory: [
      { category: "Access Control", count: 2 },
      { category: "Data Privacy", count: 1 },
      { category: "Retention", count: 5 }
    ]
  },
  "sys_hr": {
    systemId: "sys_hr",
    systemName: "HR Portal (Workday)",
    kpis: [
      { label: "Compliance Score", value: "88%", trend: "neutral", trendValue: "0%" },
      { label: "Critical Issues", value: 5, trend: "up", trendValue: "+2" },
      { label: "Files Scanned", value: 3400 },
      { label: "Risk Level", value: "Medium" }
    ],
    complianceOverTime: [
      { date: "2023-08", score: 90 },
      { date: "2023-09", score: 88 },
      { date: "2023-10", score: 88 }
    ],
    issuesByCategory: [
      { category: "Access Control", count: 8 },
      { category: "Data Privacy", count: 12 },
      { category: "Retention", count: 2 }
    ]
  },
  "sys_logistics": {
    systemId: "sys_logistics",
    systemName: "Logistics & Supply Chain",
    kpis: [
      { label: "Compliance Score", value: "75%", trend: "down", trendValue: "-5%" },
      { label: "Critical Issues", value: 12, trend: "up", trendValue: "+4" },
      { label: "Files Scanned", value: 890 },
      { label: "Risk Level", value: "High" }
    ],
    complianceOverTime: [
      { date: "2023-08", score: 82 },
      { date: "2023-09", score: 80 },
      { date: "2023-10", score: 75 }
    ],
    issuesByCategory: [
      { category: "Access Control", count: 5 },
      { category: "Data Privacy", count: 2 },
      { category: "Retention", count: 15 }
    ]
  }
};

const ACCESS_MAP: Record<string, string[]> = {
  "user1": ["sys_finance", "sys_hr"],
  "user2": ["sys_logistics"],
  "user3": ["sys_finance", "sys_hr", "sys_logistics"], // Admin-like
};

export interface IStorage {
  // User/Auth
  getUser(username: string): Promise<User | undefined>;
  getUserAccess(username: string): Promise<string[]>; // Returns system IDs
  
  // Systems
  getSystems(): Promise<SystemNode[]>;
  getSystemDetails(id: string): Promise<SystemNode | undefined>;
  
  // Analytics
  getAnalytics(systemId: string): Promise<AnalyticsData | undefined>;
  getGlobalAnalytics(): Promise<AnalyticsData>;
  
  // Scans
  createScanRequest(request: InsertScanRequest): Promise<ScanRequest>;
  getScanRequests(username?: string): Promise<ScanRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<number, ScanRequest>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.currentId = 1;
    
    // Seed mock users
    this.users.set("user1", { id: 1, username: "user1" });
    this.users.set("user2", { id: 2, username: "user2" });
    this.users.set("user3", { id: 3, username: "user3" });
  }

  async getUser(username: string): Promise<User | undefined> {
    return this.users.get(username);
  }

  async getUserAccess(username: string): Promise<string[]> {
    return ACCESS_MAP[username] || [];
  }

  async getSystems(): Promise<SystemNode[]> {
    return MOCK_SYSTEMS;
  }

  async getSystemDetails(id: string): Promise<SystemNode | undefined> {
    return MOCK_SYSTEMS.find(s => s.id === id);
  }

  async getAnalytics(systemId: string): Promise<AnalyticsData | undefined> {
    return MOCK_ANALYTICS[systemId];
  }
  
  async getGlobalAnalytics(): Promise<AnalyticsData> {
    // Mock aggregation
    return {
      systemId: "global",
      systemName: "All Systems",
      kpis: [
        { label: "Avg Compliance", value: "85%", trend: "up", trendValue: "+1%" },
        { label: "Total Critical Issues", value: 20, trend: "down", trendValue: "-2" },
        { label: "Total Files", value: 5540 },
        { label: "Overall Risk", value: "Medium" }
      ],
      complianceOverTime: [
        { date: "2023-08", score: 85 },
        { date: "2023-09", score: 86 },
        { date: "2023-10", score: 85 }
      ],
      issuesByCategory: [
        { category: "Access Control", count: 15 },
        { category: "Data Privacy", count: 15 },
        { category: "Retention", count: 22 }
      ]
    };
  }

  async createScanRequest(request: InsertScanRequest): Promise<ScanRequest> {
    const id = this.currentId++;
    const scan: ScanRequest = {
      ...request,
      id,
      status: 'Pending',
      requestedAt: new Date(),
      completedAt: null
    };
    this.scans.set(id, scan);
    
    // Simulate async processing
    setTimeout(() => {
      const s = this.scans.get(id);
      if (s) {
        s.status = 'Running';
        this.scans.set(id, s);
      }
    }, 2000);
    
    setTimeout(() => {
      const s = this.scans.get(id);
      if (s) {
        s.status = 'Completed';
        s.completedAt = new Date();
        this.scans.set(id, s);
      }
    }, 10000);
    
    return scan;
  }

  async getScanRequests(username?: string): Promise<ScanRequest[]> {
    // In a real app we might filter by user, but for this demo everyone sees the queue
    return Array.from(this.scans.values()).sort((a, b) => b.id - a.id);
  }
}

export const storage = new MemStorage();
