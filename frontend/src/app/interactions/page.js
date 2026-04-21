"use client";

import React, { useEffect, useState, useCallback } from "react";
import Shell from "@/components/Shell";
import {
  MessageSquare, Search, Plus, Edit2, Trash2,
  Phone, Mail, Video, Users, FileText, ChevronDown,
} from "lucide-react";
import api from "@/lib/api";
import { INTERACTION_TYPES, INTERACTION_TYPE_VARIANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  "Phone Call": <Phone size={12} />,
  "Meeting": <Users size={12} />,
  "Email": <Mail size={12} />,
  "WhatsApp": <MessageSquare size={12} />,
  "Video Call": <Video size={12} />,
  "Letter": <FileText size={12} />,
};

const interactionSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  contact_name: z.string().optional(),
  interaction_type: z.string().default("Phone Call"),
  interaction_date: z.string().min(1, "Date is required"),
  summary: z.string().min(3, "Summary is required"),
  team_member_id: z.string().optional(),
  followup_date: z.string().optional(),
  action_required: z.string().optional(),
});

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const form = useForm({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      client_id: "",
      contact_name: "",
      interaction_type: "Phone Call",
      interaction_date: new Date().toISOString().split("T")[0],
      summary: "",
      team_member_id: "none",
      followup_date: "",
      action_required: "",
    },
  });

  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/interactions", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setInteractions(res.data.data.interactions || []);
      setTotal(res.data.data.total || 0);
    } catch {
      setInteractions([]);
      toast({ title: "Could not load interactions", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentPage]);

  const fetchMeta = async () => {
    try {
      const [cl, tm] = await Promise.all([
        api.get("/clients", { params: { limit: 200 } }),
        api.get("/team"),
      ]);
      setClients(cl.data.data.clients || []);
      setTeamMembers(tm.data.data.members || []);
    } catch {
      /* meta fetch is non-critical */
    }
  };

  useEffect(() => { fetchInteractions(); }, [fetchInteractions]);
  useEffect(() => { fetchMeta(); }, []);

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      client_id: "",
      contact_name: "",
      interaction_type: "Phone Call",
      interaction_date: new Date().toISOString().split("T")[0],
      summary: "",
      team_member_id: "none",
      followup_date: "",
      action_required: "",
    });
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    form.reset({
      client_id: String(item.client_id),
      contact_name: item.contact_name || "",
      interaction_type: item.interaction_type || "Phone Call",
      interaction_date: item.interaction_date || "",
      summary: item.summary || "",
      team_member_id: item.team_member_id ? String(item.team_member_id) : "none",
      followup_date: item.followup_date || "",
      action_required: item.action_required || "",
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        client_id: values.client_id ? Number(values.client_id) : null,
        team_member_id: values.team_member_id && values.team_member_id !== "none" ? Number(values.team_member_id) : null,
        followup_date: values.followup_date || null,
        action_required: values.action_required || null,
      };
      if (editingItem) {
        await api.put(`/interactions/${editingItem.id}`, payload);
        toast({ title: "Interaction updated" });
      } else {
        await api.post("/interactions", payload);
        toast({ title: "Interaction logged" });
      }
      setIsFormOpen(false);
      fetchInteractions();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`/interactions/${deletingItem.id}`);
      toast({ title: "Interaction deleted" });
      setIsDeleteOpen(false);
      setDeletingItem(null);
      fetchInteractions();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const filtered = interactions.filter((i) => {
    const matchType = typeFilter === "all" || i.interaction_type === typeFilter;
    const matchSearch =
      !search ||
      (i.Client?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.summary || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.contact_name || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Client Interactions</h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
            Calls, meetings, emails — full communication log
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary border border-border rounded-lg p-1">
            {["all", ...(INTERACTION_TYPES || []).map((t) => t.value)].slice(0, 5).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium rounded-md transition-all uppercase tracking-tighter",
                  typeFilter === t
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              placeholder="Search interactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48 h-9"
            />
          </div>
          <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
            <Plus size={16} /> Log Interaction
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Type", "Client", "Contact", "Summary", "By", "Follow-up", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <div className="font-serif text-base text-foreground">No interactions found</div>
                        <p className="text-xs text-muted-foreground mt-1">Log your first client interaction to get started.</p>
                      </td>
                    </tr>
                  )
                : filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3 text-[12px] text-muted-foreground font-mono whitespace-nowrap">
                        {item.interaction_date
                          ? new Date(item.interaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          INTERACTION_TYPE_VARIANTS[item.interaction_type] || "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          {TYPE_ICONS[item.interaction_type] || <MessageSquare size={12} />}
                          {item.interaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.Client?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">
                        {item.contact_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px] max-w-[200px] truncate">
                        {item.summary}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">
                        {item.TeamMember?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px]">
                        {item.followup_date ? (
                          <span className="text-amber-400 font-mono">
                            {new Date(item.followup_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
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
                            onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage((p) => p - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage((p) => p + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-navy-2 border-border-2">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingItem ? "Edit Interaction" : "Log Interaction"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {editingItem ? "Update the interaction record." : "Record a call, meeting, or email with a client."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Client *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue placeholder="Select client..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          {(clients || []).map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name of person you spoke to" className="bg-navy/80 border-border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interaction_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          {(INTERACTION_TYPES || []).map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground">{TYPE_ICONS[t.value]}</span>
                                {t.label}
                              </span>
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
                  name="interaction_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="bg-navy/80 border-border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Summary *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What was discussed? Key points, decisions, commitments..."
                        className="bg-navy/80 border-border-2 min-h-[90px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="team_member_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">By (Staff Member)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-navy/80 border-border-2">
                            <SelectValue placeholder="Select member..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-navy-2 border-border-2">
                          <SelectItem value="none">— None —</SelectItem>
                          {(teamMembers || []).map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followup_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Follow-up Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="bg-navy/80 border-border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="action_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Follow-up Action</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="What needs to be done next?" className="bg-navy/80 border-border-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={submitting}>
                  {submitting ? "Saving..." : editingItem ? "Update Interaction" : "Log Interaction"}
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
              Are you sure you want to delete this interaction log? 
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
              Delete Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
