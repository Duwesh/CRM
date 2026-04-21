"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import {
  CheckSquare, Search, Plus, Filter,
  Trash2, Edit2, CalendarDays, User,
  MoreVertical, CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import api from "@/lib/api";
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
  { value: "pending", label: "Pending", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "overdue", label: "Overdue", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High", color: "bg-rose-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "low", label: "Low", color: "bg-slate-500" },
];

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    description: "",
    client_id: "",
    assigned_to: "",
    due_date: "",
    priority: "medium",
    status: "pending",
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [taskRes, clientRes, teamRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/clients?limit=100'),
        api.get('/team')
      ]);
      setTasks(taskRes.data.data.tasks || []);
      setClients(clientRes.data.data.clients || []);
      setTeam(teamRes.data.data.members || []);
    } catch (err) {
      console.error("Task fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load management architecture.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        client_id: formData.client_id || null,
        assigned_to: formData.assigned_to || null,
      };
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, payload);
        toast({ title: "Updated", description: "Task synchronised successfully." });
      } else {
        await api.post('/tasks', payload);
        toast({ title: "Created", description: "New task assigned." });
      }
      setIsModalOpen(false);
      fetchInitialData();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to persist task state.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      toast({ title: "Deleted", description: "Task removed from board." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Execution error: Could not remove task.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      client_id: "",
      assigned_to: "",
      due_date: "",
      priority: "medium",
      status: "pending",
      notes: ""
    });
    setEditingTask(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      description: task.description || "",
      client_id: task.client_id?.toString() || "",
      assigned_to: task.assigned_to?.toString() || "",
      due_date: task.due_date || "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      notes: task.notes || ""
    });
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch = (task.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.Client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Tasks</h1>
            <p className="text-sm text-slate-400 mt-1">Track to-dos across all clients and engagements</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-full p-1 shadow-inner">
              {["all", "pending", "overdue", "completed"].map((tab) => (
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
              className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-6 shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Task</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Assigned To</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Due Date</th>
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
                ) : filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color || "bg-slate-500"
                      )} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">{task.description}</span>
                        {task.notes && <span className="text-[10px] text-slate-600 mt-1 line-clamp-1">{task.notes}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-400">{task.Client?.name || "-"}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-white/5">
                          {task.assignee?.name?.[0] || <User className="w-3 h-3" />}
                        </div>
                        <span className="text-xs text-slate-400">{task.assignee?.name || "Unassigned"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "text-xs font-mono font-bold",
                        task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' ? "text-rose-400" : "text-slate-400"
                      )}>
                        {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                        STATUS_OPTIONS.find(s => s.value === task.status)?.color || "bg-slate-800 text-slate-500 border-white/5"
                      )}>
                        {task.status?.replace('_', ' ')}
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
                            <DropdownMenuItem onClick={() => openEditModal(task)} className="gap-2 cursor-pointer hover:bg-slate-800 transition-all">
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTaskToDelete(task.id); setIsDeleteModalOpen(true); }} className="gap-2 text-rose-400 hover:text-rose-300 cursor-pointer hover:bg-rose-950/20 transition-all">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-slate-950 border border-white/10 p-0 overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-transparent">
              <DialogTitle className="text-2xl font-serif text-white">
                {editingTask ? "Update Task" : "Add Task"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Define task execution and assign responsibility
              </DialogDescription>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Description *</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g. Collect Form 16 from client"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</label>
                    <Select value={formData.assigned_to} onValueChange={(v) => setFormData({...formData, assigned_to: v})}>
                        <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                          {(team || []).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
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
                      <PopoverContent className="w-auto p-0 bg-slate-950 border-white/10">
                        <Calendar
                          mode="single"
                          selected={formData.due_date ? new Date(formData.due_date) : undefined}
                          onSelect={(d) => setFormData({...formData, due_date: d ? format(d, "yyyy-MM-dd") : ""})}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                        <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.color)} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                          {PRIORITY_OPTIONS.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Notes</label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Provide context or sub-tasks..."
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
                  disabled={submitting}
                  className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-8 shadow-xl min-w-[120px]"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editingTask ? "Save Changes" : "Save Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-slate-950 border-white/10 shadow-2xl p-0 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                <Trash2 className="text-rose-500" size={24} />
              </div>
              <DialogTitle className="text-xl font-serif text-white">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Are you sure you want to permanently remove this task? This action cannot be undone.
              </DialogDescription>
            </div>
            <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white px-6">
                Delete Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
