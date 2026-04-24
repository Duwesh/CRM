"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { 
  FileStack, Search, Plus, Filter, 
  Trash2, Edit2, CalendarDays, User,
  MoreVertical, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { getEngagements, createEngagement, updateEngagement, deleteEngagement } from "@/lib/db/engagements";
import { getClients } from "@/lib/db/clients";
import { getTeamMembers } from "@/lib/db/team";
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
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending — Not Started", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "completed", label: "Completed", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "on_hold", label: "On Hold", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
];

export default function EngagementsPage() {
  const { toast } = useToast();
  const [engagements, setEngagements] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [engagementToDelete, setEngagementToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    type: "",
    period: "",
    assigned_to: "",
    deadline: "",
    fees: "",
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [engagements, clients, team] = await Promise.all([
        getEngagements(),
        getClients(),
        getTeamMembers(),
      ]);
      setEngagements(engagements);
      setClients(clients);
      setTeam(team);
    } catch (err) {
      console.error("Engagement data fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load engagement data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingEngagement) {
        await updateEngagement(editingEngagement.id, formData);
        toast({ title: "Success", description: "Engagement updated successfully." });
      } else {
        await createEngagement(formData);
        toast({ title: "Success", description: "New engagement created." });
      }
      setIsModalOpen(false);
      fetchInitialData();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save engagement.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!engagementToDelete) return;
    try {
      await deleteEngagement(engagementToDelete);
      setEngagements(engagements.filter(e => e.id !== engagementToDelete));
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      setIsDeleteModalOpen(false);
      setEngagementToDelete(null);
      toast({ title: "Deleted", description: "Engagement removed from records." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete engagement.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      client_id: "",
      type: "",
      period: "",
      assigned_to: "",
      deadline: "",
      fees: "",
      status: "pending",
      notes: ""
    });
    setEditingEngagement(null);
  };

  const openEditModal = (eng) => {
    setEditingEngagement(eng);
    setFormData({
      title: eng.title,
      client_id: eng.client_id.toString(),
      type: eng.type || "",
      period: eng.period || "",
      assigned_to: eng.assigned_to?.toString() || "",
      deadline: eng.deadline || "",
      fees: eng.fees || "",
      status: eng.status || "pending",
      notes: eng.notes || ""
    });
    setIsModalOpen(true);
  };

  const filteredEngagements = engagements.filter(eng => {
    const matchesStatus = statusFilter === "all" || eng.status === statusFilter;
    const matchesSearch = eng.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        eng.Client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Engagements</h1>
            <p className="text-sm text-slate-400 mt-1">All client work assignments</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-full p-1 shadow-inner">
              {["all", "active", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "px-4 py-1.5 text-[11px] font-bold rounded-full transition-all uppercase tracking-widest",
                    statusFilter === tab 
                      ? "bg-slate-800 text-white shadow-lg border border-white/5" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <Button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-6 shadow-xl shadow-gold/10"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
              New Engagement
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Engagement</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Assigned To</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Period</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Deadline</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Fees</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={9} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredEngagements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">No engagements found.</td>
                  </tr>
                ) : (
                  filteredEngagements.map((eng) => (
                    <tr key={eng.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{eng.title}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">{eng.period}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-300">{eng.Client?.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className="bg-slate-800 text-slate-400 border-none font-medium px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {eng.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-white/5 font-bold">
                             {team.find(t => t.id == eng.assigned_to)?.name?.[0] || <User className="w-3 h-3" />}
                           </div>
                           <span className="text-sm text-slate-400">{team.find(t => t.id == eng.assigned_to)?.name || "Unassigned"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400">{eng.period}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-sm",
                          eng.deadline && new Date(eng.deadline) < new Date() ? "text-rose-400 font-bold" : "text-slate-300"
                        )}>
                          {eng.deadline ? format(new Date(eng.deadline), "dd MMM yyyy") : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                          STATUS_OPTIONS.find(s => s.value === eng.status)?.color || "bg-slate-800 text-slate-500 border-white/5"
                        )}>
                          {eng.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-[#c9a84c]">
                          ₹{new Intl.NumberFormat('en-IN').format(eng.fees || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                            <DropdownMenuItem onClick={() => openEditModal(eng)} className="gap-2 cursor-pointer transition-all hover:bg-slate-800">
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => { setEngagementToDelete(eng.id); setIsDeleteModalOpen(true); }} className="gap-2 text-rose-400 hover:text-rose-300 cursor-pointer transition-all hover:bg-rose-950/20">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] bg-slate-950 border border-white/10 shadow-2xl p-0 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-transparent">
              <DialogTitle className="text-2xl font-serif text-white">
                {editingEngagement ? "Edit Engagement" : "New Engagement"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Create a work assignment for a client
              </DialogDescription>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engagement Title *</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. ITR Filing FY 2024-25"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] transition-all text-slate-100 placeholder:text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client *</label>
                  <Select 
                    value={formData.client_id} 
                    onValueChange={(v) => setFormData({...formData, client_id: v})}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-slate-100">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200 h-64">
                      {(clients || []).map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Type</label>
                   <Input 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    placeholder="e.g. ITR Filing"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Year / Period</label>
                  <Input 
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    placeholder="FY 2024-25 / Q1 FY25"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</label>
                  <Select 
                    value={formData.assigned_to} 
                    onValueChange={(v) => setFormData({...formData, assigned_to: v})}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-slate-100">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                       <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(team || []).map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full bg-slate-900/50 border-white/5 h-11 pl-3 text-left font-normal hover:bg-slate-900/80 transition-all",
                          !formData.deadline && "text-slate-700"
                        )}
                      >
                        {formData.deadline ? (
                          format(new Date(formData.deadline), "dd-MM-yyyy")
                        ) : (
                          <span className="text-slate-700">dd-mm-yyyy</span>
                        )}
                        <CalendarDays className="ml-auto h-4 w-4 text-slate-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.deadline ? new Date(formData.deadline) : undefined}
                        onSelect={(date) => setFormData({...formData, deadline: date ? format(date, "yyyy-MM-dd") : ""})}
                        initialFocus
                        className="bg-slate-950 text-slate-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fees (₹)</label>
                  <Input 
                    type="number"
                    value={formData.fees}
                    onChange={(e) => setFormData({...formData, fees: e.target.value})}
                    placeholder="15000"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-slate-100">
                      <SelectValue placeholder="Select Status" />
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes / Scope</label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Scope of work, special instructions..."
                  className="bg-slate-900/50 border-white/5 min-h-[100px] focus:border-[#c9a84c] text-slate-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
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
                  {editingEngagement ? "Update Engagement" : "Save Engagement"}
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
              <DialogTitle className="text-xl font-serif text-white">Confirm Termination</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Are you sure you want to permanently remove this engagement? This will archive all associated timeline events.
              </DialogDescription>
            </div>
            <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white px-6">
                Delete Engagement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
