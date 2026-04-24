"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { 
  Users2, Search, UserPlus, Mail, 
  Trash2, Edit2, ShieldCheck, 
  MoreVertical, User, Briefcase, Phone
} from "lucide-react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/db/team";
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
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner / Partner", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { value: "admin", label: "Admin", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "manager", label: "Manager", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "member", label: "Associate / Member", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
];

export default function TeamPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member",
    mobile: "",
    department: "",
    status: "active"
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data || []);
    } catch (err) {
      console.error("Team fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, formData);
        toast({ title: "Success", description: "Team member updated." });
      } else {
        await createTeamMember(formData);
        toast({ title: "Success", description: "Team member invited." });
      }
      setIsModalOpen(false);
      fetchMembers();
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save member.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteTeamMember(memberToDelete.id);
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({ title: "Removed", description: "Member deleted from firm." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete member.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "member",
      mobile: "",
      department: "",
      status: "active"
    });
    setEditingMember(null);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role || "member",
      mobile: member.mobile || "",
      department: member.department || "",
      status: member.status || "active"
    });
    setIsModalOpen(true);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Team Directory</h1>
            <p className="text-sm text-slate-400 mt-1">Manage firm members and role permissions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-[#c9a84c] transition-colors" />
              <Input 
                placeholder="Search staff..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-slate-900/50 border-white/5 focus:border-[#c9a84c]/50 h-10 rounded-full"
              />
            </div>
            
            <Button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-6 shadow-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Member</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Department</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400 border border-white/5">
                          {m.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{m.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{m.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="w-3 h-3 text-slate-600" /> {m.email}
                        </div>
                        {m.mobile && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone className="w-3 h-3 text-slate-600" /> {m.mobile}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-400">{m.department || "General"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                        ROLE_OPTIONS.find(r => r.value === m.role)?.color || "bg-slate-800 text-slate-500 border-white/5"
                      )}>
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                            <DropdownMenuItem onClick={() => openEditModal(m)} className="gap-2 cursor-pointer hover:bg-slate-800 transition-all">
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(m)} className="gap-2 text-rose-400 hover:text-rose-300 cursor-pointer hover:bg-rose-950/20 transition-all">
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
          <DialogContent className="sm:max-w-[550px] bg-slate-950 border border-white/10 p-0 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-transparent">
              <DialogTitle className="text-2xl font-serif text-white">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Grant access and define roles for your firm staff
              </DialogDescription>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name *</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address *</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@firm.com"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <Input 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="+91 ..."
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</label>
                  <Input 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Taxation / Audit"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role *</label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      {ROLE_OPTIONS.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  {editingMember ? "Update Profile" : "Send Invite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-slate-950 border border-white/10 shadow-2xl p-0 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                <Trash2 className="text-rose-500 w-6 h-6" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl font-serif text-white">Confirm Removal</DialogTitle>
                <DialogDescription className="text-slate-400 mt-2">
                  Are you sure you want to remove <span className="text-slate-200 font-bold">{memberToDelete?.name}</span>? 
                  This action will revoke their access to the firm portal immediately.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 pt-4 flex gap-3 justify-end bg-white/[0.02]">
              <Button 
                variant="ghost" 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete} 
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 shadow-lg shadow-rose-900/20"
              >
                Yes, Remove Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
