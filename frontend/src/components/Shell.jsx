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
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getNotifications } from "@/lib/db/notifications";

const NavItem = ({ icon, label, href, badge, badgeColor, active, onNavigate }) => {
  return (
    <Link href={href} onClick={onNavigate} className={`nav-item ${active ? "active" : ""}`}>
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
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("Tbl_Users")
        .select("name, role, Tbl_Firms(name)")
        .eq("supabase_uid", user.id)
        .maybeSingle();
      if (data) {
        setUserInfo({
          user: { name: data.name, role: data.role },
          firm: { name: data.Tbl_Firms?.name || "FirmEdge" },
        });
      }
    } catch (err) {
      console.error("Shell info fetch error:", err);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await supabase.rpc("get_dashboard_summary");
      if (data?.stats) {
        setCounts({
          clients: data.stats.clients || 0,
          leads: data.stats.leads || 0,
          tasks: data.stats.tasks || 0,
        });
      }
    } catch (err) {
      console.error("Shell counts fetch error:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setAuthChecked(true);
      if (window.innerWidth >= 768) setSidebarOpen(true);
      fetchMe();
      fetchCounts();
      fetchNotifications();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      }
    });

    const interval = setInterval(fetchCounts, 60000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener("refresh-counts", handleRefresh);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
      window.removeEventListener("refresh-counts", handleRefresh);
    };
  }, [fetchMe, fetchCounts, fetchNotifications, router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1b2a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );
  }

  const initials = userInfo.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden text-text">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Access"
        subtitle="Initiate a new record or task instantly."
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Client",     href: "/clients"     },
            { label: "Task",       href: "/tasks"       },
            { label: "Lead",       href: "/leads"       },
            { label: "Engagement", href: "/engagements" },
            { label: "Invoice",    href: "/invoices"    },
            { label: "Contact",    href: "/contacts"    },
            { label: "Deadline",   href: "/deadlines"   },
          ].map(({ label: item, href }) => (
            <button
              key={item}
              className="p-5 bg-navy-3/50 border border-border rounded-xl text-left hover:border-gold-border group transition-all"
              onClick={() => { setIsQuickAddOpen(false); router.push(href); }}
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
        className={`fixed md:relative inset-y-0 left-0 z-50 ${sidebarOpen ? "w-[240px]" : "w-0"} bg-navy-2 border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 overflow-y-auto overflow-x-hidden`}
      >
        <div className="min-w-[240px]">
        <div className="p-6 border-b border-border">
          <img
            src="/PV_Logo.png"
            alt="PV Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="text-[10px] text-text-3 uppercase tracking-[1.5px] mt-2 font-mono">
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
            onNavigate={closeSidebarOnMobile}
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
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<User size={16} />}
            label="Contacts"
            href="/contacts"
            active={pathname === "/contacts"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<Target size={16} />}
            label="Leads"
            href="/leads"
            badge={counts.leads}
            badgeColor="#2dd4bf"
            active={pathname === "/leads"}
            onNavigate={closeSidebarOnMobile}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Work
          </div>
          <NavItem
            icon={<FileStack size={16} />}
            label="Engagements"
            href="/engagements"
            active={pathname === "/engagements"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<CheckSquare size={16} />}
            label="Tasks"
            href="/tasks"
            badge={counts.tasks}
            badgeColor="#f87171"
            active={pathname === "/tasks"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<Calendar size={16} />}
            label="Deadlines"
            href="/deadlines"
            active={pathname === "/deadlines"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<FileText size={16} />}
            label="Documents"
            href="/documents"
            active={pathname === "/documents"}
            onNavigate={closeSidebarOnMobile}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Finance
          </div>
          <NavItem
            icon={<Receipt size={16} />}
            label="Invoices"
            href="/invoices"
            active={pathname === "/invoices"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<CircleDollarSign size={16} />}
            label="Fee Tracker"
            href="/fees"
            active={pathname === "/fees"}
            onNavigate={closeSidebarOnMobile}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Team
          </div>
          <NavItem
            icon={<Users2 size={16} />}
            label="Team"
            href="/team"
            active={pathname === "/team"}
            onNavigate={closeSidebarOnMobile}
          />

          <div className="px-5 py-3 text-[9px] uppercase tracking-[1.5px] text-text-3 font-semibold font-mono mt-2">
            Comms
          </div>
          <NavItem
            icon={<MessageSquare size={16} />}
            label="Interactions"
            href="/interactions"
            active={pathname === "/interactions"}
            onNavigate={closeSidebarOnMobile}
          />
          <NavItem
            icon={<Bell size={16} />}
            label="Reminders"
            href="/reminders"
            active={pathname === "/reminders"}
            onNavigate={closeSidebarOnMobile}
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
          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-xs text-text-2 hover:text-text transition-colors"
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="flex items-center gap-1.5 text-xs text-text-3 hover:text-red transition-colors"
              title="Sign out"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
        </div>{/* end min-w wrapper */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-navy/60 backdrop-blur-md border-b border-border flex-shrink-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-3 hover:text-text transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:block">
              <div className="text-xs text-text-3 mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search clients, tasks..."
                className="bg-navy/80 border border-border-2 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-gold transition-all w-64"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) fetchNotifications();
                }}
                className="p-2 hover:bg-white/5 rounded-lg text-text-3 hover:text-text transition-all relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full border-2 border-navy-2 animate-pulse" />
                )}
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
                        <span className="font-serif text-sm">Notifications</span>
                        {notifications.length > 0 && (
                          <span className="text-[10px] text-gold font-mono uppercase tracking-widest">
                            {notifications.length} active
                          </span>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifsLoading ? (
                          <div className="p-6 text-center text-[11px] text-text-3 font-mono uppercase tracking-widest">
                            Loading...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell size={24} className="text-text-3 mx-auto mb-3 opacity-40" />
                            <p className="text-[12px] text-text-3">All caught up</p>
                            <p className="text-[10px] text-text-3 opacity-60 mt-1">No pending tasks or deadlines</p>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <Link
                              key={notif.id}
                              href={notif.link || "/notifications"}
                              onClick={() => setIsNotificationsOpen(false)}
                              className="p-4 border-b border-border hover:bg-white/5 transition-colors cursor-pointer group flex gap-3"
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${notif.color}`}>
                                {notif.icon === "Clock" && <Clock size={14} />}
                                {notif.icon === "FileText" && <FileText size={14} />}
                                {notif.icon === "CheckSquare" && <CheckSquare size={14} />}
                                {notif.icon === "Calendar" && <Calendar size={14} />}
                                {notif.icon === "MessageSquare" && <MessageSquare size={14} />}
                              </div>
                              <div className="min-w-0">
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
                            </Link>
                          ))
                        )}
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
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
              <Plus size={16} />
              <span className="hidden sm:inline">Quick Add</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">{children}</main>
      </div>
    </div>
  );
}
