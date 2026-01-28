import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { useAuth } from "@/hooks/use-auth";
import { Shield, BarChart3, Lock, ChevronRight, LayoutDashboard, Globe, LogOut, Scan, FileCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Landing() {
  const { user, logout, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 flex flex-col font-sans">
      <header className="border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">CheckAud<span className="text-blue-500">.ai</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
            <a href="#support" className="hover:text-blue-400 transition-colors">Support</a>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:inline">Welcome, {user.username}</span>
            <Link href="/analytics">
              <Button data-testid="button-view-analytics" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <LayoutDashboard size={16} /> View Analytics
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-logout"
              onClick={() => {
                logout();
                setLocation("/");
              }}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10" />
          
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                Enterprise Compliance Platform
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                Audit Compliance. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Simplified.</span>
              </h1>
              
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Automate your system audits with CheckAud. Real-time monitoring, 
                instant compliance scoring, and intelligent risk detection for enterprise infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/analytics">
                  <Button size="lg" data-testid="button-dashboard" className="h-12 px-8 text-lg gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                    Go to Dashboard <ChevronRight size={18} />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  View Documentation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Capabilities</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Designed for complex environments requiring rigorous compliance standards and continuous monitoring.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
                  title: "Real-Time Analytics",
                  desc: "Visualize compliance trends and anomalies instantly across all connected systems."
                },
                {
                  icon: <Scan className="h-8 w-8 text-emerald-500" />,
                  title: "Ad-Hoc Scans",
                  desc: "Schedule scans or run ad-hoc checks to ensure systems meet regulatory requirements."
                },
                {
                  icon: <Lock className="h-8 w-8 text-indigo-500" />,
                  title: "Secure Access",
                  desc: "Role-based access control ensures data privacy and operational security."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="mb-6 p-3 bg-slate-800 w-fit rounded-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-24">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Global Visibility Across <br />
                Your Infrastructure
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Gain a unified view of your entire compliance posture. Identify risks before they become incidents and track improvements over time.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "ISO 27001 Compliance Tracking",
                  "GDPR Data Privacy Audits",
                  "Infrastructure Security Scanning",
                  "Automated Reporting & Alerts"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <ChevronRight size={14} strokeWidth={3} />
                    </div>
                    <span className="font-medium text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-2xl opacity-20 transform rotate-3 scale-105" />
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
                 <div className="p-4 border-b border-slate-800 bg-slate-950 flex gap-2">
                   <div className="h-3 w-3 rounded-full bg-red-500" />
                   <div className="h-3 w-3 rounded-full bg-amber-500" />
                   <div className="h-3 w-3 rounded-full bg-green-500" />
                 </div>
                 <div className="p-8 grid grid-cols-2 gap-4">
                   <div className="col-span-2 h-32 bg-slate-800 rounded-lg flex items-center justify-center">
                     <Activity className="h-12 w-12 text-blue-500/50" />
                   </div>
                   <div className="h-32 bg-slate-800 rounded-lg flex items-center justify-center">
                     <FileCheck className="h-10 w-10 text-emerald-500/50" />
                   </div>
                   <div className="h-32 bg-slate-800 rounded-lg flex items-center justify-center">
                     <BarChart3 className="h-10 w-10 text-indigo-500/50" />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-500 h-6 w-6" />
              <span className="font-bold text-white text-lg">CheckAud.ai</span>
            </div>
            <p className="text-sm text-slate-600">Enterprise Compliance Monitoring Platform</p>
          </div>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
}
