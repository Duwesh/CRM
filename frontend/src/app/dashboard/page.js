"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import {
  Users,
  CheckSquare,
  Calendar,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, icon, change, isUp, href }) => {
  const CardContentComp = (
    <Card className="relative overflow-hidden group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 cursor-pointer">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-[60px] transition-all group-hover:scale-110" />
      <CardContent className="p-5">
        <div className="text-primary mb-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-2xl font-bold font-mono tracking-tight mb-0.5">
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
          {title}
        </div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] mt-2 font-bold",
              isUp ? "text-green" : "text-destructive",
            )}
          >
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{CardContentComp}</Link>;
  }
  return CardContentComp;
};

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {
      clients: 0,
      tasks: 0,
      deadlines: 0,
      revenue: "₹0",
    },
    upcomingDeadlines: [],
    overdueInvoices: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/summary");
        setData(res.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // setData(dashboardData); // Optional fallback
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const { stats, upcomingDeadlines, overdueInvoices, recentActivity } = data;

  return (
    <Shell>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Active Clients"
          value={stats.clients}
          icon={<Users size={20} />}
          change={stats.clientsChange}
          isUp={stats.clientsIsUp}
          href="/clients"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.tasks}
          icon={<CheckSquare size={20} />}
          change={stats.tasksChange}
          isUp={stats.tasksIsUp}
          href="/tasks"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.deadlines}
          icon={<Calendar size={20} />}
          href="/deadlines"
        />
        <StatCard
          title="Outstanding Fees"
          value={stats.revenue}
          icon={<CircleDollarSign size={20} />}
          change={stats.revenueChange}
          isUp={stats.revenueIsUp}
          href="/fees"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-start sm:items-center justify-between space-y-0 pb-6 gap-3">
              <div>
                <CardTitle className="font-serif text-xl">
                  Upcoming Deadlines & Compliance
                </CardTitle>
                <CardDescription className="text-xs">
                  Action required in the next 30 days
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/deadlines">View All</Link>
              </Button>
            </CardHeader>

            <CardContent className="space-y-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-0 px-2"
                  >
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-0 group cursor-pointer hover:bg-muted/50 transition-colors px-2 rounded-lg"
                  >
                    <div className="font-mono text-[11px] text-muted-foreground min-w-[80px]">
                      {new Date(deadline.due_date)
                        .toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                        .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                        {deadline.form_name || deadline.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {deadline.Client?.name}
                      </div>
                    </div>
                    <Badge
                      variant={
                        deadline.priority === "High" ? "destructive" : "outline"
                      }
                      className="text-[10px] h-4 font-bold uppercase"
                    >
                      {deadline.priority || "NORMAL"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground text-xs">
                  No upcoming deadlines found.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-start sm:items-center justify-between space-y-0 pb-6 gap-3">
              <CardTitle className="font-serif text-xl">
                Active Engagements Pipeline
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/engagements">Full View</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {["Prospect", "Onboarding", "Active", "Review", "Closing"].map(
                (stage, i) => (
                  <div
                    key={stage}
                    className="min-w-[140px] flex-1 bg-secondary/50 border border-border rounded-lg p-3"
                  >
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex justify-between">
                      {stage}{" "}
                      <Badge
                        variant="secondary"
                        className="h-4 px-1 rounded text-[9px]"
                      >
                        0
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-card border border-border rounded-md text-[11px] text-muted-foreground italic text-center">
                        Empty
                      </div>
                    </div>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-[13px] font-semibold text-primary flex items-center gap-2">
                <CircleDollarSign size={14} /> Overdue Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : overdueInvoices.length > 0 ? (
                overdueInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="text-[12px] font-medium group-hover:text-primary transition-colors">
                        {inv.Client?.name}
                      </div>
                      <div className="text-[10px] text-destructive font-mono uppercase">
                        Due {new Date(inv.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-mono text-[12px] font-semibold text-foreground">
                      ₹{new Intl.NumberFormat("en-IN").format(inv.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No overdue invoices.
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground mt-4"
                asChild
              >
                <Link href="/fees">
                  Manage Collections <ChevronRight size={12} />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                <Activity size={14} /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((act, i) => (
                  <div
                    key={act.id}
                    className="flex gap-3 relative pb-4 last:pb-0"
                  >
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-[13px] top-7 bottom-0 w-[1px] bg-border" />
                    )}
                    <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 z-10">
                      <Clock size={12} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-tighter">
                        {new Date(act.interaction_date).toLocaleDateString()}
                      </div>
                      <div className="text-[12px] font-medium text-foreground">
                        <span className="text-primary">
                          {act.TeamMember?.name || "User"}
                        </span>{" "}
                        • {act.interaction_type}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {act.summary}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No recent activity.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
