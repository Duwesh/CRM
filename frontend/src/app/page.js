"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="animate-pulse">
        <img src="/PV_Logo.png" alt="PV Logo" className="h-12 w-auto object-contain" />
      </div>
    </div>
  );
}
