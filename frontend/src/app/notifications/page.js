"use client";

import React, { useEffect, useState, useCallback } from "react";
import Shell from "@/components/Shell";
import Link from "next/link";
import {
  Bell,
  Clock,
  FileText,
  CheckSquare,
  Calendar,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP = {
  Clock: <Clock size={16} />,
  FileText: <FileText size={16} />,
  CheckSquare: <CheckSquare size={16} />,
  Calendar: <Calendar size={16} />,
  MessageSquare: <MessageSquare size={16} />,
};

const TYPE_LABELS = {
  overdue_task: "Overdue Task",
  new_document: "Document",
  invoice_paid: "Invoice",
  upcoming_deadline: "Deadline",
  new_interaction: "Interaction",
};

const TYPE_FILTERS = ["all", "overdue_task", "upcoming_deadline", "new_document", "invoice_paid", "new_interaction"];
const FILTER_LABELS = {
  all: "All",
  overdue_task: "Overdue Tasks",
  upcoming_deadline: "Deadlines",
  new_document: "Documents",
  invoice_paid: "Invoices",
  new_interaction: "Interactions",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <Shell>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-text">Notifications</h1>
            <p className="text-[11px] text-text-3 font-mono uppercase tracking-widest mt-1">
              Activity &amp; Alerts
            </p>
          </div>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 text-xs text-text-3 hover:text-text transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all border ${
                filter === f
                  ? "bg-gold text-navy border-gold"
                  : "border-border-2 text-text-3 hover:text-text hover:border-border"
              }`}
            >
              {FILTER_LABELS[f]}
              {f === "all" && notifications.length > 0 && (
                <span className="ml-1.5 text-[9px] opacity-70">
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-navy-2 border border-border rounded-xl p-4 flex gap-4"
              >
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-navy-2 border border-border rounded-xl p-12 text-center">
              <Bell size={36} className="text-text-3 opacity-30 mx-auto mb-4" />
              <p className="text-sm text-text-2">No notifications</p>
              <p className="text-[11px] text-text-3 mt-1">
                {filter === "all"
                  ? "You're all caught up — no pending tasks or alerts."
                  : `No ${FILTER_LABELS[filter].toLowerCase()} notifications right now.`}
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link || "#"}
                className="bg-navy-2 border border-border rounded-xl p-4 flex gap-4 hover:border-gold-border hover:bg-navy-3/50 transition-all group block"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-navy-3 ${notif.color}`}
                >
                  {ICON_MAP[notif.icon] || <Bell size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-text-3 mb-1 block">
                        {TYPE_LABELS[notif.type] || notif.type}
                      </span>
                      <p className="text-[13px] font-medium text-text group-hover:text-gold-light transition-colors leading-snug">
                        {notif.title}
                      </p>
                      <p className="text-[12px] text-text-3 mt-1 leading-relaxed">
                        {notif.desc}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-3 font-mono uppercase tracking-tighter flex-shrink-0 mt-1">
                      {notif.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
