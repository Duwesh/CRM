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
        <h1 className="font-serif text-3xl text-gold tracking-widest">FirmEdge</h1>
      </div>
    </div>
  );
}
