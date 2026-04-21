"use client";

import React, { useEffect, useState, useCallback } from "react";
import Shell from "@/components/Shell";
import {
  Receipt, Search, Plus, Edit2, Trash2,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight,
  Download, Loader2, IndianRupee,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["unpaid", "partial", "paid", "overdue"];

const STATUS_STYLES = {
  paid:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  unpaid:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
  partial: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICONS = {
  paid:    <CheckCircle2 size={11} />,
  unpaid:  <Clock size={11} />,
  partial: <ArrowUpRight size={11} />,
  overdue: <AlertCircle size={11} />,
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const EMPTY_FORM = {
  client_id: "none",
  description: "",
  invoice_date: new Date().toISOString().split("T")[0],
  due_date: "",
  amount: "",
  gst_amount: "",
  amount_received: "",
  status: "unpaid",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [stats, setStats]       = useState({ total: 0, collected: 0, outstanding: 0, overdue: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem]   = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [submitting, setSubmitting]     = useState(false);

  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setInvoices(res.data.data.invoices || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast({ title: "Could not load invoices", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/invoices/stats");
      setStats(res.data.data || { total: 0, collected: 0, outstanding: 0, overdue: 0 });
    } catch { /* non-critical */ }
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients", { params: { limit: 200 } });
      setClients(res.data.data.clients || []);
    } catch { /* non-critical */ }
  };

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { setCurrentPage(1); }, [statusFilter, search]);

  const field = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (inv) => {
    setEditingItem(inv);
    setFormData({
      client_id:      String(inv.client_id),
      description:    inv.description || "",
      invoice_date:   inv.invoice_date || "",
      due_date:       inv.due_date || "",
      amount:         String(inv.amount || ""),
      gst_amount:     String(inv.gst_amount || ""),
      amount_received:String(inv.amount_received || ""),
      status:         inv.status || "unpaid",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id || formData.client_id === "none") {
      toast({ title: "Select a client", variant: "destructive" }); return;
    }
    if (!formData.amount || !formData.invoice_date) {
      toast({ title: "Amount and invoice date are required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        client_id:       Number(formData.client_id),
        amount:          Number(formData.amount),
        gst_amount:      Number(formData.gst_amount) || 0,
        amount_received: Number(formData.amount_received) || 0,
        due_date:        formData.due_date || null,
      };
      if (editingItem) {
        await api.put(`/invoices/${editingItem.id}`, payload);
        toast({ title: "Invoice updated" });
      } else {
        await api.post("/invoices", payload);
        toast({ title: "Invoice created" });
      }
      setIsFormOpen(false);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Save failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`/invoices/${deletingItem.id}`);
      toast({ title: "Invoice deleted" });
      setIsDeleteOpen(false);
      setDeletingItem(null);
      fetchInvoices();
      fetchStats();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchSearch = !search ||
      (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.Client?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.description || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Invoices</h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
            Professional fee bills raised
          </p>
        </div>
        <Button variant="gold" size="sm" className="gap-2 self-start md:self-auto" onClick={openCreate}>
          <Plus size={16} /> New Invoice
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Invoices", value: stats.total, icon: <Receipt size={16} />, color: "text-foreground" },
          { label: "Collected", value: `₹${fmt(stats.collected)}`, icon: <CheckCircle2 size={16} />, color: "text-emerald-400" },
          { label: "Outstanding", value: `₹${fmt(stats.outstanding)}`, icon: <IndianRupee size={16} />, color: "text-red-400" },
          { label: "Overdue", value: stats.overdue, icon: <AlertCircle size={16} />, color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {s.icon}
                <span className="text-[10px] font-mono uppercase tracking-widest">{s.label}</span>
              </div>
              <div className={cn("text-xl font-semibold font-serif", s.color)}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex bg-secondary border border-border rounded-lg p-1">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium rounded-md transition-all uppercase tracking-tighter",
                statusFilter === s ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-52 h-9" />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["Invoice #", "Client", "Description", "Date", "Amount", "GST", "Total", "Due Date", "Status", ""].map((h) => (
                <TableHead key={h} className="px-4 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <TableCell key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-20 text-center">
                      <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <div className="font-serif text-base text-foreground">No invoices found</div>
                      <p className="text-xs text-muted-foreground mt-1">Draft your first invoice to get started.</p>
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((inv) => {
                  const total = Number(inv.amount || 0) + Number(inv.gst_amount || 0);
                  return (
                    <TableRow key={inv.id} className="group border-border/50 hover:bg-white/[0.02]">
                      <TableCell className="px-4 py-3 font-mono text-primary font-bold text-[12px]">{inv.invoice_number}</TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{inv.Client?.name || "—"}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-[12px] max-w-[160px] truncate">{inv.description || "—"}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{fmtDate(inv.invoice_date)}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-[12px] text-foreground">₹{fmt(inv.amount)}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-[12px] text-muted-foreground">₹{fmt(inv.gst_amount)}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">₹{fmt(total)}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{fmtDate(inv.due_date)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
                          STATUS_STYLES[inv.status] || STATUS_STYLES.unpaid
                        )}>
                          {STATUS_ICONS[inv.status] || STATUS_ICONS.unpaid}
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {inv.pdf_url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
                              <a href={inv.pdf_url} target="_blank" rel="noreferrer"><Download size={13} /></a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(inv)}>
                            <Edit2 size={13} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => { setDeletingItem(inv); setIsDeleteOpen(true); }}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border/50">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage((p) => p - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} className="cursor-pointer">{i + 1}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage((p) => p + 1); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-navy-2 border-border-2">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingItem ? "Edit Invoice" : "New Invoice"}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {editingItem ? "Update the invoice details." : "Raise a professional fee bill for a client."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Client *</label>
                <Select value={formData.client_id} onValueChange={(v) => setFormData((p) => ({ ...p, client_id: v }))}>
                  <SelectTrigger className="bg-navy/80 border-border-2 h-9">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-2 border-border-2">
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-navy/80 border-border-2 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-2 border-border-2">
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Description *</label>
              <Input value={formData.description} onChange={field("description")} placeholder="e.g. Professional fees for GST Audit FY 2024-25" className="bg-navy/80 border-border-2 h-9" required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Amount (₹) *</label>
                <Input type="number" value={formData.amount} onChange={field("amount")} placeholder="25000" className="bg-navy/80 border-border-2 h-9" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">GST @ 18% (₹)</label>
                <Input type="number" value={formData.gst_amount} onChange={field("gst_amount")} placeholder="4500" className="bg-navy/80 border-border-2 h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Received (₹)</label>
                <Input type="number" value={formData.amount_received} onChange={field("amount_received")} placeholder="0" className="bg-navy/80 border-border-2 h-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Invoice Date *</label>
                <Input type="date" value={formData.invoice_date} onChange={field("invoice_date")} className="bg-navy/80 border-border-2 h-9" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Due Date</label>
                <Input type="date" value={formData.due_date} onChange={field("due_date")} className="bg-navy/80 border-border-2 h-9" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" disabled={submitting} className="min-w-[120px]">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : editingItem ? "Update Invoice" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-navy-2 border-border-2">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Delete Invoice</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Are you sure you want to delete <span className="text-foreground font-medium">{deletingItem?.invoice_number}</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
