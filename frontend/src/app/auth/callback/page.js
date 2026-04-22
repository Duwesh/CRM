"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
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
        const res = await api.post("/auth/sync");
        if (res.data.data.needsOnboarding) {
          // If they registered with email and have a pending firm name, complete setup now
          const pendingFirmName = localStorage.getItem("pendingFirmName");
          if (pendingFirmName) {
            localStorage.removeItem("pendingFirmName");
            await api.post("/auth/complete-setup", { firmName: pendingFirmName });
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
