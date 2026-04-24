"use client";

import React, { useEffect, useState, useCallback } from "react";
import Shell from "@/components/Shell";
import {
  Bell,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  MinusCircle,
} from "lucide-react";
import { getReminders, createReminder, updateReminder, toggleReminder, deleteReminder } from "@/lib/db/reminders";
import { getClients } from "@/lib/db/clients";
import { getTeamMembers } from "@/lib/db/team";
import { REMINDER_PRIORITY_STYLES } from "@/lib/constants";

const PRIORITY_ICONS = {
  high: <AlertCircle size={11} />,
  medium: <MinusCircle size={11} />,
  low: <Circle size={11} />,
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

const reminderSchema = z.object({
  reminder_text: z.string().min(3, "Reminder text is required"),
  client_id: z.string().optional(),
  reminder_date: z.string().min(1, "Date is required"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  assigned_to: z.string().optional(),
});

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const form = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      reminder_text: "",
      client_id: "none",
      reminder_date: "",
      priority: "medium",
      assigned_to: "none",
    },
  });

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const reminders = await getReminders();
      setReminders(reminders);
    } catch {
      setReminders([]);
      toast({ title: "Could not load reminders", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentPage, statusFilter]);

  const fetchMeta = async () => {
    try {
      const [clients, team] = await Promise.all([getClients(), getTeamMembers()]);
      setClients(clients);
      setTeamMembers(team);
    } catch {
      /* non-critical */
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);
  useEffect(() => {
    fetchMeta();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      reminder_text: "",
      client_id: "none",
      reminder_date: "",
      priority: "medium",
      assigned_to: "none",
    });
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    form.reset({
      reminder_text: item.reminder_text || "",
      client_id: item.client_id ? String(item.client_id) : "none",
      reminder_date: item.reminder_date || "",
      priority: item.priority || "medium",
      assigned_to: item.assigned_to ? String(item.assigned_to) : "none",
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        client_id: values.client_id && values.client_id !== "none" ? Number(values.client_id) : null,
        assigned_to: values.assigned_to && values.assigned_to !== "none" ? Number(values.assigned_to) : null,
      };
      if (editingItem) {
        await updateReminder(editingItem.id, payload);
        toast({ title: "Reminder updated" });
      } else {
        await createReminder(payload);
        toast({ title: "Reminder set" });
      }
      setIsFormOpen(false);
      fetchReminders();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleReminder(item.id, item.is_done);
      setReminders((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, is_done: !r.is_done } : r)),
      );
    } catch {
      toast({ title: "Could not update reminder", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteReminder(deletingItem.id);
      toast({ title: "Reminder deleted" });
      setIsDeleteOpen(false);
      setDeletingItem(null);
      fetchReminders();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const filtered = reminders.filter((r) => {
    if (!search) return true;
    return (
      (r.reminder_text || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.Client?.name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(total / itemsPerPage);
  const pendingCount = reminders.filter((r) => !r.is_done).length;

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
            Reminders
            {pendingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
            Never miss a follow-up or deadline
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary border border-border rounded-lg p-1">
            {["all", "pending", "done"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium rounded-md transition-all uppercase tracking-tighter",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              placeholder="Search reminders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48 h-9"
            />
          </div>
          <Button
            variant="gold"
            size="sm"
            className="gap-2"
            onClick={openCreate}
          >
            <Plus size={16} /> Set Reminder
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <div className="font-serif text-base text-foreground">
              No reminders found
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter === "done"
                ? "No completed reminders."
                : "Set your first reminder to stay on top of follow-ups."}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "group hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm border-border/50",
                item.is_done && "opacity-50",
              )}
            >
              <div className="p-4 flex items-start md:items-center justify-between gap-4">
                {/* Left: toggle + content */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    title={item.is_done ? "Mark as pending" : "Mark as done"}
                  >
                    {item.is_done ? (
                      <CheckCircle2 size={20} className="text-green-400" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <div>
                    <p
                      className={cn(
                        "font-medium text-sm text-foreground",
                        item.is_done && "line-through text-muted-foreground",
                      )}
                    >
                      {item.reminder_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {item.Client && (
                        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                          {item.Client.name}
                        </span>
                      )}
                      {item.reminder_date && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(item.reminder_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                      {item.assignee && (
                        <span className="text-[11px] text-muted-foreground">
                          → {item.assignee.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: priority + actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
                      REMINDER_PRIORITY_STYLES[item.priority] ||
                        REMINDER_PRIORITY_STYLES.medium,
                    )}
                  >
                    {PRIORITY_ICONS[item.priority] || PRIORITY_ICONS.medium}
                    {item.priority}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(item)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
                      onClick={() => {
                        setDeletingItem(item);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((p) => p - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-navy-2 border-border-2">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingItem ? "Edit Reminder" : "Set Reminder"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {editingItem
                ? "Update the reminder details."
                : "Never miss a follow-up or important deadline."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reminder_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                      Reminder *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Call Sharma ji regarding ITR documents"
                        className="bg-navy/80 border-border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                        Client
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue placeholder="General / No client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          <SelectItem value="none">— General —</SelectItem>
                          {(clients || []).map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminder_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                        Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="bg-navy/80 border-border-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                        Priority
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          <SelectItem value="high">
                            <span className="flex items-center gap-2">
                              <AlertCircle size={13} className="text-red-400" />{" "}
                              High
                            </span>
                          </SelectItem>
                          <SelectItem value="medium">
                            <span className="flex items-center gap-2">
                              <MinusCircle
                                size={13}
                                className="text-amber-400"
                              />{" "}
                              Medium
                            </span>
                          </SelectItem>
                          <SelectItem value="low">
                            <span className="flex items-center gap-2">
                              <Circle size={13} className="text-green-400" />{" "}
                              Low
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                        Assigned To
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue placeholder="Select member..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          <SelectItem value="none">— Unassigned —</SelectItem>
                          {(teamMembers || []).map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingItem
                      ? "Update Reminder"
                      : "Set Reminder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-white/10 shadow-2xl p-0 overflow-hidden">
          <div className="p-8 pb-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
              <Trash2 className="text-rose-500" size={24} />
            </div>
            <DialogTitle className="text-xl font-serif text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete this reminder? 
              This action is permanent and cannot be undone.
            </DialogDescription>
          </div>
          <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteOpen(false)} 
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              Delete Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
