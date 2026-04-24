"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserProfile, completeFirmSetup } from "@/lib/db/auth";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login");
        return;
      }

      try {
        const profile = await getUserProfile();
        if (!profile || !profile.firm_id) {
          const pendingFirmName = localStorage.getItem("pendingFirmName");
          if (pendingFirmName) {
            localStorage.removeItem("pendingFirmName");
            await completeFirmSetup({ firmName: pendingFirmName });
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" />
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Authenticating
        </p>
      </div>
    </div>
  );
}
