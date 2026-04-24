"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/db/auth";
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error("No session returned");

      const profile = await getUserProfile();
      if (!profile) {
        router.push("/onboarding");
      } else {
        toast({ title: "Welcome Back", description: "Redirecting to your dashboard." });
        router.push("/dashboard");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: err.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  // TODO: handleGoogleLogin — enable when Google OAuth is configured
  // const handleGoogleLogin = async () => { ... };

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-soft rounded-full blur-[100px] opacity-10" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <img src="/PV_Logo.png" alt="PV Logo" className="h-12 w-auto object-contain mx-auto mb-2" />
          <p className="text-muted-foreground uppercase tracking-[3px] text-xs font-mono">
            Premium CRM for CA Firms
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl relative bg-card/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />

          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">Welcome Back</CardTitle>
            <CardDescription className="text-[11px] font-mono uppercase tracking-wider">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email / Password */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Email
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
                  Password
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
                className="w-full py-5 text-base group"
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

            {/* Google OAuth — coming soon
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              variant="outline"
              className="w-full py-5 flex items-center gap-3"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            */}

            <div className="pt-3 border-t flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot Password?
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
