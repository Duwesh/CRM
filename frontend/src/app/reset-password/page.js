"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase sets the session from the URL hash on PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if a session is already active (page reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else {
        // Give Supabase a moment to process the hash
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) setInvalidLink(true);
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match" });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password must be at least 8 characters" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setDone(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: err.message || "Could not update password. The link may have expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (done) {
      return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <CheckCircle2 className="w-14 h-14 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Password Updated</p>
            <p className="text-sm text-muted-foreground">
              Your access key has been reset successfully.
            </p>
          </div>
          <Button variant="gold" className="w-full py-6" onClick={() => router.push("/login")}>
            Sign In Now
          </Button>
        </div>
      );
    }

    if (invalidLink) {
      return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <AlertCircle className="w-14 h-14 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Invalid or Expired Link</p>
            <p className="text-sm text-muted-foreground">
              This reset link is no longer valid. Please request a new one.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push("/forgot-password")}>
            Request New Link
          </Button>
        </div>
      );
    }

    if (!ready) {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Verifying Reset Link
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Choose a strong password of at least 8 characters.
        </p>

        <div className="space-y-2">
          <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10"
              minLength={8}
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

        <div className="space-y-2">
          <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="gold"
          className="w-full py-6 text-base"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-soft rounded-full blur-[100px] opacity-10" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <img src="/PV_Logo.png" alt="PV Logo" className="h-14 w-auto object-contain mx-auto mb-3" />
          <p className="text-muted-foreground uppercase tracking-[3px] text-xs font-mono">
            Premium CRM for CA Firms
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl relative bg-card/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">Set New Access Key</CardTitle>
            <CardDescription className="text-[11px] font-mono uppercase tracking-wider">
              Secure Password Reset
            </CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
