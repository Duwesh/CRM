"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signUp } from "@/lib/db/auth";
import { Building2, User, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firmName: "",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        firmName: formData.firmName,
      });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error("Sign in failed. Please try logging in.");

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-teal-soft rounded-full blur-[100px] opacity-10" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <img src="/PV_Logo.png" alt="PV Logo" className="h-12 w-auto object-contain mx-auto mb-2" />
          <p className="text-muted-foreground uppercase tracking-[3px] text-xs font-mono">
            Premium CRM for CA Firms
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl relative p-8">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 rounded-t-xl" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-foreground">Create Account</h2>
              <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                {step === 1 ? "Step 1 of 2 — Firm details" : "Step 2 of 2 — Your credentials"}
              </p>
            </div>
            <div className="flex gap-1.5">
              <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
              <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    Firm Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      placeholder="e.g. Sharma & Associates"
                      autoComplete="off"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => formData.firmName && setStep(2)}
                  className="w-full btn-gold py-3 flex items-center justify-center gap-2 mt-2"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      autoComplete="off"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@firm.com"
                      autoComplete="off"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
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

                {error && (
                  <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-outline py-3 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-gold py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline ml-1">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
