"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Building2, User, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
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
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await api.post("/auth/register", formData);
      router.push("/login?registered=true");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-gold-soft rounded-full blur-[100px] opacity-20" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-gold mb-2">FirmEdge</h1>
          <p className="text-text-3 uppercase tracking-[3px] text-xs font-mono">Premium CRM for CA Firms</p>
        </div>

        <div className="glass-card p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />
          
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-medium">Initiate Setup</h2>
             <span className="text-[10px] font-mono text-text-3">STEP {step}/2</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {step === 1 ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-mono text-text-3 uppercase tracking-wider mb-2">Firm Identity</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                    <input 
                      type="text" 
                      value={formData.firmName}
                      onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                      placeholder="e.g. Khanna & Associates"
                      className="w-full bg-navy/80 border border-border-2 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gold transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => formData.firmName && setStep(2)}
                  className="w-full btn-gold py-3 flex items-center justify-center gap-2"
                >
                  Continue Setup
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div>
                  <label className="block text-[11px] font-mono text-text-3 uppercase tracking-wider mb-2">Administrator Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your Full Name"
                      className="w-full bg-navy/80 border border-border-2 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gold transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-3 uppercase tracking-wider mb-2">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="name@firm.com"
                      className="w-full bg-navy/80 border border-border-2 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gold transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-3 uppercase tracking-wider mb-2">Secure Key</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-navy/80 border border-border-2 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gold transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red text-xs bg-red-soft border border-red/20 p-2.5 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
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
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Complete Setup"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <div className="text-xs text-text-3">
              Existing Firm? <Link href="/login" className="text-gold-light hover:underline ml-1">Access Terminal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
