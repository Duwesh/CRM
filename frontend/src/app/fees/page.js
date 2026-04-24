"use client";

import React, { useEffect, useState, useCallback } from "react";
import Shell from "@/components/Shell";
import {
  Search, TrendingUp, ArrowUpRight, ArrowDownRight,
  Pencil, Loader2, CircleDollarSign, Wallet, Check, X
} from "lucide-react";
import { getFeesSummary, updateClientFee } from "@/lib/db/fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const formatCurrency = (amt) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt || 0);

const PctBar = ({ pct }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-primary" : "bg-destructive")}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
    <span className="text-xs font-mono w-8 text-right">{pct}%</span>
  </div>
);

export default function FeesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Edit annual fee dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [feeInput, setFeeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeesSummary({ search: debouncedSearch });
      setClients(data || []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const totals = clients.reduce(
    (acc, c) => ({
      annual: acc.annual + (c.annual_fee || 0),
      invoiced: acc.invoiced + c.invoiced,
      collected: acc.collected + c.collected,
      outstanding: acc.outstanding + c.outstanding,
    }),
    { annual: 0, invoiced: 0, collected: 0, outstanding: 0 }
  );
  const overallPct = totals.invoiced > 0 ? Math.round((totals.collected / totals.invoiced) * 100) : 0;

  const openEdit = (client) => {
    setEditClient(client);
    setFeeInput(client.annual_fee ? String(client.annual_fee) : "");
    setEditOpen(true);
  };

  const handleSaveFee = async () => {
    if (!editClient) return;
    setSubmitting(true);
    try {
      await updateClientFee(editClient.id, parseFloat(feeInput) || 0);
      setEditOpen(false);
      fetchFees();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const STATS = [
    { label: "Total Annual Fees", value: formatCurrency(totals.annual), icon: <CircleDollarSign size={16} />, cls: "text-foreground" },
    { label: "Total Invoiced", value: formatCurrency(totals.invoiced), icon: <Wallet size={16} />, cls: "text-foreground" },
    { label: "Total Collected", value: formatCurrency(totals.collected), icon: <ArrowUpRight size={16} />, cls: "text-green-500" },
    { label: "Outstanding", value: formatCurrency(totals.outstanding), icon: <ArrowDownRight size={16} />, cls: "text-destructive" },
    { label: "Recovery Rate", value: `${overallPct}%`, icon: <TrendingUp size={16} />, cls: "text-primary" },
  ];

  return (
    <Shell>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Fee Tracker</h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
            Annual fee schedule &amp; collection summary
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {STATS.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-2">{s.label}</p>
              <div className={cn("flex items-center gap-1.5 font-medium", s.cls)}>
                {s.icon}
                <span className="text-base">{s.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 text-sm"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-card/50 border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest">Client</TableHead>
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest text-right">Annual Fee</TableHead>
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest text-right">Invoiced</TableHead>
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest text-right">Collected</TableHead>
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest text-right">Outstanding</TableHead>
              <TableHead className="px-6 font-mono text-[10px] uppercase tracking-widest">% Collected</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <CircleDollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">No active clients with fee data found</p>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id} className="group hover:bg-white/5">
                  <TableCell className="px-6 py-3 font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="px-6 py-3 text-right font-mono text-sm">
                    {c.annual_fee ? formatCurrency(c.annual_fee) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right font-mono text-sm">{formatCurrency(c.invoiced)}</TableCell>
                  <TableCell className="px-6 py-3 text-right font-mono text-sm text-green-500">{formatCurrency(c.collected)}</TableCell>
                  <TableCell className={cn("px-6 py-3 text-right font-mono text-sm", c.outstanding > 0 ? "text-destructive" : "text-muted-foreground")}>
                    {formatCurrency(c.outstanding)}
                  </TableCell>
                  <TableCell className="px-6 py-3 min-w-[140px]">
                    <PctBar pct={c.pct_collected} />
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil size={13} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Annual Fee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Annual Fee</DialogTitle>
            {editClient && (
              <p className="text-xs text-muted-foreground mt-1">{editClient.name}</p>
            )}
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">
              Annual Fee (₹)
            </label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="h-10"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveFee()}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={submitting}>
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button variant="gold" size="sm" onClick={handleSaveFee} disabled={submitting}>
              {submitting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
