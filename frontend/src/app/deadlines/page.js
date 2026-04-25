"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { 
  Calendar, Search, Plus, Filter, 
  Trash2, Edit2, CalendarDays, 
  MoreVertical, CheckCircle2, Clock, AlertTriangle,
  FileCheck2, Timer, CalendarX2
} from "lucide-react";
import { getDeadlines, createDeadline, updateDeadline, deleteDeadline } from "@/lib/db/deadlines";
import { getClients } from "@/lib/db/clients";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, differenceInDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "filed", label: "Filed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "missed", label: "Missed", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
];

export default function DeadlinesPage() {
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deadlineToDelete, setDeadlineToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    category: "",
    due_date: "",
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [deadlines, clients] = await Promise.all([
        getDeadlines(),
        getClients(),
      ]);
      setDeadlines(deadlines);
      setClients(clients);
    } catch (err) {
      console.error("Deadline fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
    };
    try {
      if (editingDeadline) {
        await updateDeadline(editingDeadline.id, payload);
        toast({ title: "Updated", description: "Deadline adjusted." });
      } else {
        await createDeadline(payload);
        toast({ title: "Saved", description: "New compliance deadline set." });
      }
      setIsModalOpen(false);
      fetchInitialData();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save deadline.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!deadlineToDelete) return;
    try {
      await deleteDeadline(deadlineToDelete);
      setDeadlines(deadlines.filter(d => d.id !== deadlineToDelete));
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      setIsDeleteModalOpen(false);
      setDeadlineToDelete(null);
      toast({ title: "Deleted", description: "Deadline removed from schedule." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete deadline.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      client_id: "",
      category: "",
      due_date: "",
      status: "pending",
      notes: ""
    });
    setEditingDeadline(null);
  };

  const openEditModal = (d) => {
    setEditingDeadline(d);
    setFormData({
      title: d.title,
      client_id: d.client_id?.toString() || "",
      category: d.category || "",
      due_date: d.due_date || "",
      status: d.status || "pending",
      notes: d.notes || ""
    });
    setIsModalOpen(true);
  };

  const filteredDeadlines = deadlines.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.Client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    overdue: deadlines.filter(d => d.due_date && new Date(d.due_date) < new Date() && d.status !== 'filed').length,
    dueSoon: deadlines.filter(d => {
      if (!d.due_date || d.status === 'filed') return false;
      const days = differenceInDays(new Date(d.due_date), new Date());
      return days >= 0 && days <= 7;
    }).length,
    completed: deadlines.filter(d => d.status === 'filed').length
  };

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Compliance Deadlines</h1>
            <p className="text-sm text-slate-400 mt-1">Statutory and regulatory filing dates</p>
          </div>
          
          <Button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-6 shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deadline
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-rose-500/20 transition-all" />
            <div className="space-y-1">
              <span className="text-rose-400 text-3xl font-serif">{stats.overdue}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Overdue</p>
            </div>
            <CalendarX2 className="w-8 h-8 text-rose-500/20" />
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-amber-500/20 transition-all" />
             <div className="space-y-1">
              <span className="text-amber-400 text-3xl font-serif">{stats.dueSoon}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Due This Week</p>
            </div>
            <Timer className="w-8 h-8 text-amber-500/20" />
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
             <div className="space-y-1">
              <span className="text-emerald-400 text-3xl font-serif">{stats.completed}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Filed / Completed</p>
            </div>
            <FileCheck2 className="w-8 h-8 text-emerald-500/20" />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Filing / Compliance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Days Left</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No active deadlines.</td>
                  </tr>
                ) : filteredDeadlines.map((d) => {
                  const daysLeft = d.due_date ? differenceInDays(new Date(d.due_date), new Date()) : null;
                  return (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{d.title}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-400">{d.Client?.name || "General"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className="bg-slate-800 text-slate-400 border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                          {d.category || "General"}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-xs font-mono font-bold",
                          daysLeft !== null && daysLeft < 0 && d.status !== 'filed' ? "text-rose-400" : "text-slate-400"
                        )}>
                          {d.due_date ? format(new Date(d.due_date), "dd MMM yyyy") : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {d.status === 'filed' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Done</span>
                        ) : daysLeft !== null ? (
                          <div className={cn(
                             "px-2 py-0.5 rounded-full inline-block text-[10px] font-bold uppercase",
                             daysLeft < 0 ? "bg-rose-500/10 text-rose-400" : (daysLeft <= 7 ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500")
                          )}>
                             {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : (daysLeft === 0 ? "Due Today" : `${daysLeft}d left`)}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-5">
                         <Badge className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                          STATUS_OPTIONS.find(s => s.value === d.status)?.color || "bg-slate-800 text-slate-500 border-white/5"
                        )}>
                          {d.status === 'filed' ? "Filed ✓" : (d.status?.replace('_', ' ') || "Pending")}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                            <DropdownMenuItem onClick={() => openEditModal(d)} className="gap-2 cursor-pointer hover:bg-slate-800 transition-all">
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => { setDeadlineToDelete(d.id); setIsDeleteModalOpen(true); }} className="gap-2 text-rose-400 hover:text-rose-300 cursor-pointer transition-all hover:bg-rose-950/20">
                               <Trash2 className="w-3.5 h-3.5" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[550px] bg-slate-950 border border-white/10 p-0 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-transparent">
              <DialogTitle className="text-2xl font-serif text-white">
                {editingDeadline ? "Edit Deadline" : "Add Compliance Deadline"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Track statutory and regulatory filing dates
              </DialogDescription>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filing / Compliance *</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. GSTR-3B for July 2025"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</label>
                   <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                      <SelectValue placeholder="General / No client" />
                    </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                          {(clients || []).map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200 font-bold uppercase tracking-widest">
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="Income Tax">Income Tax</SelectItem>
                      <SelectItem value="TDS / TCS">TDS / TCS</SelectItem>
                      <SelectItem value="ROC / MCA">ROC / MCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date *</label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full bg-slate-900/50 border-white/5 h-11 text-left font-normal text-white">
                          {formData.due_date ? format(new Date(formData.due_date), "dd-MM-yyyy") : "dd-mm-yyyy"}
                          <CalendarDays className="ml-auto h-4 w-4 text-slate-600" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-950 border-white/10" align="start">
                        <CalendarUI
                          mode="single"
                          selected={formData.due_date ? new Date(formData.due_date) : undefined}
                          onSelect={(d) => setFormData({...formData, due_date: d ? format(d, "yyyy-MM-dd") : ""})}
                        />
                      </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any specific notes..."
                  className="bg-slate-900/50 border-white/5 min-h-[100px] text-white"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border-white/10 text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-8 shadow-xl"
                >
                  Save Deadline
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-slate-950 border border-white/10 shadow-2xl p-0 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                <Trash2 className="text-rose-500" size={24} />
              </div>
              <DialogTitle className="text-xl font-serif text-white">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Are you sure you want to permanently remove this deadline? This action cannot be reversed.
              </DialogDescription>
            </div>
            <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white px-6">
                Delete Deadline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
