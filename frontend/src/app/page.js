"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="animate-pulse">
        <img src="/PV_Logo.png" alt="PV Logo" className="h-12 w-auto object-contain" />
      </div>
    </div>
  );
}
