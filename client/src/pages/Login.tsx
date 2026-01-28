import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    login(username.trim(), {
      onSuccess: () => setLocation("/home"),
      onError: () => setError("Invalid credentials. Try user1, user2, or user3"),
    });
  };

  const quickLogin = (user: string) => {
    login(user, {
      onSuccess: () => setLocation("/home"),
      onError: () => setError("Login failed"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/30">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CheckAud Dashboard</h1>
          <p className="text-slate-400 mt-2">Enterprise Compliance Monitoring</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    data-testid="input-username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoggingIn}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoggingIn}
                  />
                </div>
                <p className="text-xs text-slate-500">Password is not required for demo</p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md" data-testid="text-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                data-testid="button-login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-400 text-center mb-4">Quick access for demo</p>
              <div className="grid grid-cols-3 gap-2">
                {["user1", "user2", "user3"].map((user) => (
                  <Button
                    key={user}
                    variant="outline"
                    size="sm"
                    data-testid={`button-quick-${user}`}
                    onClick={() => quickLogin(user)}
                    disabled={isLoggingIn}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {user}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Secure enterprise access portal
        </p>
      </motion.div>
    </div>
  );
}
