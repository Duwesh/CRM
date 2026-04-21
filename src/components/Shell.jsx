"use client";

import React, { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  User,
  Target,
  FileStack,
  CheckSquare,
  Calendar,
  FileText,
  Receipt,
  CircleDollarSign,
  Users2,
  MessageSquare,
  Bell,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const NavItem = ({ icon, label, href, badge, badgeColor, active }) => {
  return (
    <Link href={href} className={`nav-item ${active ? "active" : ""}`}>
      <span className="w-5 flex justify-center">{icon}</span>
      <span>{label}</span>
      {badge > 0 && (
        <span
          className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full mono"
          style={{
            backgroundColor: badgeColor || "#c9a84c",
            color: badgeColor ? "white" : "#0d1b2a",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

export default function Shell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    user: { name: "User", role: "Administrator" },
    firm: { name: "FirmEdge" },
  });
  const [counts, setCounts] = useState({
    clients: 0,
    leads: 0,
    tasks: 0,
  });

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUserInfo(res.data.data);
    } catch (err) {
      console.error("Shell info fetch error:", err);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/summary");
      if (res.data.status === "success" && res.data.data.stats) {
        setCounts({
          clients: res.data.data.stats.clients || 0,
          leads: res.data.data.stats.leads || 0,
          tasks: res.data.data.stats.tasks || 0,
        });
      }
    } catch (err) {
      console.error("Shell counts fetch error:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchMe();
    fetchCounts();

    const interval = setInterval(fetchCounts, 60000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener("refresh-counts", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-counts", handleRefresh);
    };
  }, [fetchMe, fetchCounts]);

  const initials = userInfo.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden text-text">
       {/* Quick Add Modal */}
       <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Access"
        subtitle="Initiate a new record or task instantly."
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            "Client",
            "Task",
            "Lead",
            "Engagement",
            "Invoice",
            "Contact",
            "Deadline",
          ].map((item) => (
            <button
              key={item}
              className="p-5 bg-navy-3/50 border border-border rounded-xl text-left hover:border-gold-border group transition-all"
              onClick={() => setIsQuickAddOpen(false)}
            >
              <div className="text-gold group-hover:scale-110 transition-transform mb-2">
                {item === "Client" && <Users size={20} />}
                {item === "Task" && <CheckSquare size={20} />}
                {item === "Lead" && <Target size={20} />}
                {item === "Engagement" && <FileStack size={20} />}
                {item === "Invoice" && <Receipt size={20} />}
                {item === "Contact" && <User size={20} />}
                {item === "Deadline" && <Calendar size={20} />}
              </div>
              <div className="text-sm font-medium text-text group-hover:text-gold-light">
                New {item}
              </div>
              <div className="text-[10px] text-text-3 mt-1 uppercase tracking-tighter">
                Initiate Entry
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <aside
        className={`${sidebarOpen ? "w-[240px]" : "w-0"} bg-navy-2 border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 overflow-y-auto z-50`}
      >
        <div className="p-6 border-b border-border">
          <div className="font-serif text-[22px] text-gold tracking-wide">
            FirmEdge
          </div>
          <div className="text-[10px] text-text-3 uppercase tracking-[1.5px] mt-1 font-mono">
            {userInfo.firm.type || "CA · Consulting CRM"}
          </div>
        </div>

        <div className="flex-1 py-4">
          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono">
            Main
          </div>
          <NavItem
            icon={<LayoutDashboard size={16} />}
            label="Dashboard"
            href="/dashboard"
            active={pathname === "/dashboard"}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Clients
          </div>
          <NavItem
            icon={<Users size={16} />}
            label="All Clients"
            href="/clients"
            badge={counts.clients}
            active={pathname === "/clients"}
          />
          <NavItem
            icon={<User size={16} />}
            label="Contacts"
            href="/contacts"
            active={pathname === "/contacts"}
          />
          <NavItem
            icon={<Target size={16} />}
            label="Leads"
            href="/leads"
            badge={counts.leads}
            badgeColor="#2dd4bf"
            active={pathname === "/leads"}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Work
          </div>
          <NavItem
            icon={<FileStack size={16} />}
            label="Engagements"
            href="/engagements"
            active={pathname === "/engagements"}
          />
          <NavItem
            icon={<CheckSquare size={16} />}
            label="Tasks"
            href="/tasks"
            badge={counts.tasks}
            badgeColor="#f87171"
            active={pathname === "/tasks"}
          />
          <NavItem
            icon={<Calendar size={16} />}
            label="Deadlines"
            href="/deadlines"
            active={pathname === "/deadlines"}
          />
          <NavItem
            icon={<FileText size={16} />}
            label="Documents"
            href="/documents"
            active={pathname === "/documents"}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Finance
          </div>
          <NavItem
            icon={<Receipt size={16} />}
            label="Invoices"
            href="/invoices"
            active={pathname === "/invoices"}
          />
          <NavItem
            icon={<CircleDollarSign size={16} />}
            label="Fee Tracker"
            href="/fees"
            active={pathname === "/fees"}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Team
          </div>
          <NavItem
            icon={<Users2 size={16} />}
            label="Team"
            href="/team"
            active={pathname === "/team"}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Comms
          </div>
          <NavItem
            icon={<MessageSquare size={16} />}
            label="Interactions"
            href="/interactions"
            active={pathname === "/interactions"}
          />
          <NavItem
            icon={<Bell size={16} />}
            label="Reminders"
            href="/reminders"
            active={pathname === "/reminders"}
          />
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-soft border border-gold-border text-gold-light flex items-center justify-center text-xs font-bold uppercase">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-text truncate">
                {userInfo.firm.name}
              </div>
              <div className="text-[10px] text-text-3 truncate capitalize">
                {userInfo.user.role}
              </div>
            </div>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 mt-4 text-xs text-text-2 hover:text-text"
          >
            <Settings size={14} /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-navy/60 backdrop-blur-md border-b border-border flex-shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-3 hover:text-text transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="font-serif text-xl">Good morning 👋</div>
              <div className="text-xs text-text-3 mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search clients, tasks..."
                className="bg-navy/80 border border-border-2 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-gold transition-all w-64"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-white/5 rounded-lg text-text-3 hover:text-text transition-all relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full border-2 border-navy-2 animate-pulse" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-[340px] bg-navy-2 border border-border-2 shadow-2xl rounded-xl overflow-hidden z-50 text-left"
                    >
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <span className="font-serif text-sm">
                          Notifications
                        </span>
                        <button className="text-[10px] text-gold uppercase tracking-widest font-mono">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {[
                          {
                            title: "Task Overdue",
                            desc: "GST Filing for Reliance is overdue by 2 days.",
                            time: "2h ago",
                            icon: <Clock size={14} />,
                            color: "text-red",
                          },
                          {
                            title: "New Document",
                            desc: "Priya Mehta uploaded Audit_Working_Draft.pdf",
                            time: "5h ago",
                            icon: <FileText size={14} />,
                            color: "text-blue",
                          },
                          {
                            title: "Invoice Paid",
                            desc: "Khanna, Rajesh paid INV-2024-002 (₹45,000)",
                            time: "1d ago",
                            icon: <CheckSquare size={14} />,
                            color: "text-green",
                          },
                          {
                            title: "Client Message",
                            desc: "Siddharth from Spectral Labs left a note.",
                            time: "2d ago",
                            icon: <MessageSquare size={14} />,
                            color: "text-amber",
                          },
                        ].map((notif, i) => (
                          <div
                            key={i}
                            className="p-4 border-b border-border hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 ${notif.color}`}>
                                {notif.icon}
                              </div>
                              <div>
                                <div className="text-[13px] font-medium text-text group-hover:text-gold-light transition-colors">
                                  {notif.title}
                                </div>
                                <div className="text-[11px] text-text-3 line-clamp-2 mt-0.5 leading-relaxed">
                                  {notif.desc}
                                </div>
                                <div className="text-[9px] text-text-3 font-mono mt-2 uppercase tracking-tighter">
                                  {notif.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/notifications"
                        className="p-3 bg-navy-3 block text-center text-[11px] text-text-3 hover:text-text transition-colors"
                      >
                        View All Activity
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="btn-gold flex items-center gap-2"
            >
              <Plus size={16} /> Quick Add
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">{children}</main>
      </div>
    </div>
  );
}
