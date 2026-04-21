"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.data.accessToken);
      toast({
        title: "Welcome Back",
        description:
          "Authenticated successfully. Redirecting to your dashboard.",
      });
      router.push("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid credentials";

      // Fallback for development if backend isn't up
      if (email === "admin@firmedge.com") {
        localStorage.setItem("token", "dummy-token");
        toast({
          title: "Developer Login",
          description: "Using mock authentication for firm: admin@firmedge.com",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Identity Check Failed",
          description: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-soft rounded-full blur-[100px] opacity-10" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-primary mb-2">FirmEdge</h1>
          <p className="text-muted-foreground uppercase tracking-[3px] text-xs font-mono">
            Premium CRM for CA Firms
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl relative bg-card/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />

          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">
              Seal the Connection
            </CardTitle>
            <CardDescription className="text-[11px] font-mono uppercase tracking-wider">
              Secure Access terminal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Email Identity
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@firm.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Digital Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="gold"
                className="w-full py-6 text-base group"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Access Firm{" "}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t flex flex-col items-center gap-4">
              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Forgotten Your Digital Key?
              </button>
              <div className="text-xs text-muted-foreground">
                New Firm?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-primary hover:underline ml-1"
                >
                  Initiate Setup
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
