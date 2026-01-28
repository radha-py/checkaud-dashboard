import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSystems } from "@/hooks/use-systems";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Server, 
  LogOut, 
  User, 
  Search,
  Shield,
  Home,
  Upload,
  FolderOpen,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanRequestModal } from "@/components/ScanRequestModal";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOCK_FOLDER_DATA: Record<string, string[]> = {
  "": ["FIN", "HR", "IT"],
  "FIN": ["SAP_ERP", "SAP_S4"],
  "HR": ["Workday", "SuccessFactors"],
  "IT": ["ServiceNow", "Jira"],
  "FIN/SAP_ERP": ["Production", "Development"],
  "FIN/SAP_S4": ["Production", "QA"],
  "HR/Workday": ["Core", "Recruiting"],
  "HR/SuccessFactors": ["LMS", "Performance"],
  "IT/ServiceNow": ["ITSM", "CMDB"],
  "IT/Jira": ["Projects", "ServiceDesk"],
  "FIN/SAP_ERP/Production": ["2024_Q1", "2024_Q2", "2024_Q3"],
  "FIN/SAP_ERP/Development": ["Sprint1", "Sprint2"],
  "FIN/SAP_S4/Production": ["2024_Q1", "2024_Q2"],
  "FIN/SAP_S4/QA": ["TestCycle1", "TestCycle2"],
  "HR/Workday/Core": ["Annual_Audit", "Quarterly"],
  "HR/Workday/Recruiting": ["Compliance", "Security"],
  "HR/SuccessFactors/LMS": ["Training", "Certifications"],
  "HR/SuccessFactors/Performance": ["Reviews", "Goals"],
  "IT/ServiceNow/ITSM": ["Incidents", "Changes"],
  "IT/ServiceNow/CMDB": ["Assets", "Config"],
  "IT/Jira/Projects": ["DevOps", "Security"],
  "IT/Jira/ServiceDesk": ["Support", "Requests"],
  "FIN/SAP_ERP/Production/2024_Q1": ["Report_Jan", "Report_Feb", "Report_Mar"],
  "FIN/SAP_ERP/Production/2024_Q2": ["Report_Apr", "Report_May", "Report_Jun"],
  "FIN/SAP_ERP/Production/2024_Q3": ["Report_Jul", "Report_Aug"],
  "FIN/SAP_S4/Production/2024_Q1": ["Audit_Jan", "Audit_Feb"],
  "HR/Workday/Core/Annual_Audit": ["2024_Report"],
  "IT/ServiceNow/ITSM/Incidents": ["Security_Scan"],
};

const MOCK_AUDIT_DATA = {
  totalUsers: 1247,
  avgScore: 72,
  totalQueries: 21,
  criticalIssues: 8,
  usersByType: [
    { name: "Dialog", value: 523 },
    { name: "System", value: 412 },
    { name: "Service", value: 312 }
  ],
  impactDistribution: [
    { name: "Critical", value: 8 },
    { name: "Very high", value: 5 },
    { name: "High", value: 8 }
  ],
  scoresByQuery: [
    { query: "Debug ABAP programs", score: 95, impact: "Critical" },
    { query: "Delete change documents", score: 88, impact: "Critical" },
    { query: "Execute function modules", score: 82, impact: "Critical" },
    { query: "Database table access", score: 78, impact: "Critical" },
    { query: "Developer keys", score: 75, impact: "Critical" },
    { query: "Execute reports", score: 68, impact: "Very high" },
    { query: "Execute OS commands", score: 62, impact: "Very high" },
    { query: "Change all tables", score: 58, impact: "Very high" },
    { query: "Create users & profiles", score: 52, impact: "Very high" },
    { query: "Direct profile assignment", score: 45, impact: "High" }
  ],
  userMixByQuery: [
    { query: "Debug ABAP", Dialog: 45, System: 12, Service: 8 },
    { query: "Delete docs", Dialog: 32, System: 18, Service: 5 },
    { query: "Execute FM", Dialog: 28, System: 22, Service: 12 },
    { query: "DB Access", Dialog: 15, System: 35, Service: 20 },
    { query: "Dev keys", Dialog: 8, System: 5, Service: 2 }
  ]
};

const USER_TYPE_COLORS = ["#036DC1", "#008DFC", "#4EAFFD"];
const SCORE_COLORS = ["#21A330", "#1a2235"];
const IMPACT_COLORS: Record<string, string> = {
  "Critical": "#CC215A",
  "Very high": "#FF8442",
  "High": "#F7B100"
};
const SCORE_BAR_COLORS: Record<string, string> = {
  "Critical": "#E63946",
  "Very high": "#F4A261",
  "High": "#E9C46A"
};

export default function Analytics() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: systems, isLoading: isSystemsLoading } = useSystems();
  
  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [level4, setLevel4] = useState("");
  const [level5, setLevel5] = useState("");
  const [dashboardReady, setDashboardReady] = useState(false);
  const [dataSource, setDataSource] = useState<"sharepoint" | "upload">("sharepoint");

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  const getFolders = (path: string) => MOCK_FOLDER_DATA[path] || [];

  const handleGenerateDashboard = () => {
    if (level1 && level2 && level3 && level4 && level5) {
      setDashboardReady(true);
    }
  };

  const handleFileUpload = () => {
    setDashboardReady(true);
  };

  if (isAuthLoading || !user) return null;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "linear-gradient(135deg, rgba(10,15,30,1), rgba(18,25,45,1))" }}>
      <aside className="w-72 border-r hidden md:flex flex-col sticky top-0 h-screen" style={{ background: "rgba(18, 25, 45, 0.95)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 font-bold text-xl" style={{ color: "#4EAFFD" }}>
            <Shield size={24} /> CheckAud
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <Link href="/home">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 mb-2 font-medium"
              style={{ color: "#c7d2fe" }}
            >
              <Home size={18} /> Home
            </Button>
          </Link>

          <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aa4ff", letterSpacing: "2px" }}>
            Data Source
          </div>
          
          <Select value={dataSource} onValueChange={(v: "sharepoint" | "upload") => { setDataSource(v); setDashboardReady(false); }}>
            <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
              <SelectItem value="sharepoint" className="text-white">OneDrive/SharePoint</SelectItem>
              <SelectItem value="upload" className="text-white">Upload File</SelectItem>
            </SelectContent>
          </Select>

          {dataSource === "sharepoint" ? (
            <>
              <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aa4ff", letterSpacing: "2px" }}>
                Folder Navigation
              </div>

              <Select value={level1} onValueChange={(v) => { setLevel1(v); setLevel2(""); setLevel3(""); setLevel4(""); setLevel5(""); setDashboardReady(false); }}>
                <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
                  <SelectValue placeholder="Level 1 Folder" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
                  {getFolders("").map(f => <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>)}
                </SelectContent>
              </Select>

              {level1 && (
                <Select value={level2} onValueChange={(v) => { setLevel2(v); setLevel3(""); setLevel4(""); setLevel5(""); setDashboardReady(false); }}>
                  <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
                    <SelectValue placeholder="Level 2 Folder" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
                    {getFolders(level1).map(f => <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {level2 && (
                <Select value={level3} onValueChange={(v) => { setLevel3(v); setLevel4(""); setLevel5(""); setDashboardReady(false); }}>
                  <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
                    <SelectValue placeholder="Level 3 Folder" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
                    {getFolders(`${level1}/${level2}`).map(f => <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {level3 && (
                <Select value={level4} onValueChange={(v) => { setLevel4(v); setLevel5(""); setDashboardReady(false); }}>
                  <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
                    <SelectValue placeholder="Level 4 Folder" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
                    {getFolders(`${level1}/${level2}/${level3}`).map(f => <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {level4 && (
                <Select value={level5} onValueChange={(v) => { setLevel5(v); setDashboardReady(false); }}>
                  <SelectTrigger className="w-full border-none" style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}>
                    <SelectValue placeholder="Level 5 Folder" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "rgba(25,35,70,0.98)", borderColor: "rgba(255,255,255,0.1)" }}>
                    {getFolders(`${level1}/${level2}/${level3}/${level4}`).map(f => <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {level1 && level2 && level3 && level4 && level5 && (
                <Button 
                  onClick={handleGenerateDashboard}
                  className="w-full gap-2 mt-4"
                  style={{ background: "#036DC1" }}
                >
                  <PlayCircle size={16} /> Generate Dashboard
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed flex flex-col items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(25,35,70,0.5)" }}>
                <Upload size={32} style={{ color: "#4EAFFD" }} />
                <p className="text-sm text-center" style={{ color: "#c7d2fe" }}>Upload Report.docx</p>
                <Button onClick={handleFileUpload} size="sm" style={{ background: "#036DC1" }}>
                  Select File
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <ScanRequestModal />
          </div>
        </div>
        
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="mb-3 px-2">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#9aa4ff" }}>Session</p>
            <p className="text-sm font-medium" style={{ color: "#e5edff" }}>{user.username}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            style={{ color: "#c7d2fe" }}
            onClick={() => { logout(); setLocation("/"); }}
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b px-6 flex items-center justify-between sticky top-0 z-30" style={{ background: "rgba(18, 25, 45, 0.95)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="md:hidden font-bold text-lg flex items-center gap-2" style={{ color: "#4EAFFD" }}>
            <Shield size={20} /> CheckAud
          </div>
          
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9aa4ff" }} />
              <Input 
                placeholder="Search analytics..." 
                className="pl-10 border-none"
                style={{ background: "rgba(25,35,70,0.8)", color: "#e5edff" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(78, 175, 253, 0.2)", border: "1px solid rgba(78, 175, 253, 0.3)" }}>
              <User size={18} style={{ color: "#4EAFFD" }} />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {!dashboardReady ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(25, 35, 70, 0.95), rgba(15, 20, 45, 0.95))", border: "1px solid rgba(255,255,255,0.15)" }}>
                <FolderOpen size={48} className="mx-auto mb-4" style={{ color: "#4EAFFD" }} />
                <h2 className="text-xl font-bold mb-2" style={{ color: "#ffffff" }}>Load a Report</h2>
                <p style={{ color: "#c7d2fe" }}>
                  Select a folder path from OneDrive/SharePoint or upload a Report.docx file to view analytics.
                </p>
              </div>

              <div className="mt-8 rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(25, 35, 70, 0.95), rgba(15, 20, 45, 0.95))", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#c7d2fe", letterSpacing: "2.5px" }}>How to Use This Dashboard</h3>
                <div className="space-y-3" style={{ color: "#e5edff" }}>
                  <p><strong>Option 1 - OneDrive/SharePoint:</strong> Navigate through 5 folder levels to locate your audit report, then click Generate Dashboard.</p>
                  <p><strong>Option 2 - File Upload:</strong> Upload your Report.docx file directly.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgba(33, 163, 48, 0.2), rgba(33, 163, 48, 0.1))", border: "1px solid rgba(33, 163, 48, 0.3)" }}>
                  <p style={{ color: "#21A330" }}>Report processed successfully!</p>
                </div>
              </motion.div>

              <div className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#c7d2fe", letterSpacing: "2.5px" }}>Key Metrics</div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { title: "Total Users", value: MOCK_AUDIT_DATA.totalUsers.toLocaleString() },
                  { title: "Average Score", value: `${MOCK_AUDIT_DATA.avgScore}/100` },
                  { title: "Total Queries", value: MOCK_AUDIT_DATA.totalQueries },
                  { title: "Critical Issues", value: MOCK_AUDIT_DATA.criticalIssues }
                ].map((kpi, i) => (
                  <div key={i} className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, rgba(25,35,70,0.95), rgba(15,20,45,0.95))", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
                    <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "#a8b4ff", letterSpacing: "0.6px" }}>{kpi.title}</div>
                    <div className="text-3xl font-extrabold" style={{ color: "#ffffff", textShadow: "0 2px 10px rgba(0,140,255,0.55)" }}>{kpi.value}</div>
                  </div>
                ))}
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={{ background: "rgba(18, 25, 45, 0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="rounded-xl px-4 py-2 mb-4" style={{ background: "linear-gradient(135deg, #1f3b64, #162b4d)" }}>
                    <span className="font-semibold" style={{ color: "#ffffff" }}>Users by Type</span>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_AUDIT_DATA.usersByType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="name" stroke="#c7d2fe" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#c7d2fe" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "rgba(25,35,70,0.95)", border: "none", borderRadius: "8px", color: "#fff" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {MOCK_AUDIT_DATA.usersByType.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={USER_TYPE_COLORS[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6" style={{ background: "rgba(18, 25, 45, 0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="rounded-xl px-4 py-2 mb-4" style={{ background: "linear-gradient(135deg, #1f3b64, #162b4d)" }}>
                    <span className="font-semibold" style={{ color: "#ffffff" }}>Audit Score</span>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ name: "Score", value: MOCK_AUDIT_DATA.avgScore }, { name: "Remaining", value: 100 - MOCK_AUDIT_DATA.avgScore }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                        >
                          <Cell fill="#21A330" />
                          <Cell fill="#FACC00" />
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <Tooltip contentStyle={{ background: "rgba(25,35,70,0.95)", border: "none", borderRadius: "8px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6" style={{ background: "rgba(18, 25, 45, 0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="rounded-xl px-4 py-2 mb-4" style={{ background: "linear-gradient(135deg, #1f3b64, #162b4d)" }}>
                    <span className="font-semibold" style={{ color: "#ffffff" }}>Impact Distribution</span>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_AUDIT_DATA.impactDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                        >
                          {MOCK_AUDIT_DATA.impactDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={IMPACT_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <Tooltip contentStyle={{ background: "rgba(25,35,70,0.95)", border: "none", borderRadius: "8px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6 mb-8" style={{ background: "rgba(18, 25, 45, 0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="rounded-xl px-4 py-2 mb-4" style={{ background: "linear-gradient(135deg, #1f3b64, #162b4d)" }}>
                  <span className="font-semibold" style={{ color: "#ffffff" }}>Security Scores by Query</span>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_AUDIT_DATA.scoresByQuery} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#c7d2fe" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="query" type="category" stroke="#c7d2fe" fontSize={11} tickLine={false} axisLine={false} width={110} />
                      <Tooltip contentStyle={{ background: "rgba(25,35,70,0.95)", border: "none", borderRadius: "8px", color: "#fff" }} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {MOCK_AUDIT_DATA.scoresByQuery.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SCORE_BAR_COLORS[entry.impact]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-6" style={{ background: "rgba(18, 25, 45, 0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="rounded-xl px-4 py-2 mb-4" style={{ background: "linear-gradient(135deg, #1f3b64, #162b4d)" }}>
                  <span className="font-semibold" style={{ color: "#ffffff" }}>User Mix by Query</span>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_AUDIT_DATA.userMixByQuery}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="query" stroke="#c7d2fe" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#c7d2fe" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "rgba(25,35,70,0.95)", border: "none", borderRadius: "8px", color: "#fff" }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="Dialog" fill="#036DC1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="System" fill="#008DFC" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Service" fill="#4EAFFD" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
}
