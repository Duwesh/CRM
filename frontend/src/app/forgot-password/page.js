"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: err.message || "Could not send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-xl font-medium">
              {sent ? "Email Dispatched" : "Reset Access Key"}
            </CardTitle>
            <CardDescription className="text-[11px] font-mono uppercase tracking-wider">
              {sent ? "Check your inbox" : "Password Recovery Terminal"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <CheckCircle2 className="w-14 h-14 text-primary" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A password reset link has been sent to{" "}
                  <span className="text-foreground font-medium">{email}</span>.
                  <br />
                  The link expires in <span className="text-foreground">1 hour</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive it? Check your spam folder.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => router.push("/login")}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Enter the email address associated with your account and we&apos;ll
                  send you a secure reset link.
                </p>
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Email Address
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

                <Button
                  type="submit"
                  disabled={loading}
                  variant="gold"
                  className="w-full py-6 text-base"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Sign In
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
