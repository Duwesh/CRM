"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeFirmSetup } from "@/lib/db/auth";
import { Building2, Loader2 } from "lucide-react";
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

export default function OnboardingPage() {
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await completeFirmSetup({ firmName });
      router.push("/dashboard");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-20" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <img src="/PV_Logo.png" alt="PV Logo" className="h-14 w-auto object-contain mx-auto mb-3" />
          <p className="text-muted-foreground uppercase tracking-[3px] text-xs font-mono">
            Almost There
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl relative bg-card/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />

          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">Set Up Your Firm</CardTitle>
            <CardDescription className="text-[11px] font-mono uppercase tracking-wider">
              One-time configuration
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSetup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Firm Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="e.g. Sharma & Associates"
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
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
