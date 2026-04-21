"use client";

import React, { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { 
  FileText, FolderOpen, Search, Upload, 
  MoreVertical, File, Trash2, Edit2,
  ExternalLink, Download, FileUp, Folder
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
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    category: "General",
    file_type: "pdf",
    url: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [docRes, clientRes] = await Promise.all([
        api.get('/documents'),
        api.get('/clients?limit=100')
      ]);
      setDocs(docRes.data.data.documents || []);
      setClients(clientRes.data.data.clients || []);
    } catch (err) {
      console.error("Document fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await api.patch(`/documents/${editingDoc.id}`, formData);
        toast({ title: "Updated", description: "Metadata saved." });
      } else {
        await api.post('/documents', formData);
        toast({ title: "Logged", description: "Document record created." });
      }
      setIsModalOpen(false);
      fetchInitialData();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save document.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    try {
      await api.delete(`/documents/${documentToDelete}`);
      setDocs(docs.filter(d => d.id !== documentToDelete));
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
      toast({ title: "Deleted", description: "Document archived successfully." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete document metadata.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      client_id: "",
      category: "General",
      file_type: "pdf",
      url: ""
    });
    setEditingDoc(null);
  };

  const openEditModal = (d) => {
    setEditingDoc(d);
    setFormData({
      name: d.name,
      client_id: d.client_id?.toString() || "",
      category: d.category || "General",
      file_type: d.file_type || "pdf",
      url: d.url || ""
    });
    setIsModalOpen(true);
  };

  const filteredDocs = docs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.Client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Document Vault</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and audit firm documents and client logs</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-[#c9a84c] transition-colors" />
              <Input 
                placeholder="Search vault..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-slate-900/50 border-white/5 focus:border-[#c9a84c]/50 h-10 rounded-full"
              />
            </div>
            
            <Button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-[#c9a84c] hover:bg-[#b09341] text-[#0d1b2a] font-bold px-6 shadow-xl"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Log Document
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Document</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Log Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">Format</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No documents logged in vault.</td>
                  </tr>
                ) : filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-[#c9a84c]">
                           <File className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{d.name}</span>
                           <span className="text-[10px] text-slate-600 font-mono">#{d.id}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-sm text-slate-400">{d.Client?.name || "General"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-slate-700" />
                        <span className="text-xs text-slate-400">{d.category || "General"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono text-slate-500">
                        {d.created_at ? format(new Date(d.created_at), "dd MMM yyyy") : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className="bg-slate-900 text-slate-500 border-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                        {d.file_type || "PDF"}
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
                             <DropdownMenuItem onClick={() => window.open(d.url, '_blank')} className="gap-2 cursor-pointer hover:bg-slate-800 transition-all">
                              <ExternalLink className="w-3.5 h-3.5" /> Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(d)} className="gap-2 cursor-pointer hover:bg-slate-800 transition-all">
                              <Edit2 className="w-3.5 h-3.5" /> Edit Metadata
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => { setDocumentToDelete(d.id); setIsDeleteModalOpen(true); }} className="gap-2 text-rose-400 hover:text-rose-300 cursor-pointer transition-all hover:bg-rose-950/20">
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
                {editingDoc ? "Edit Document Metadata" : "Log New Document"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Log external links or shared files to client records
              </DialogDescription>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Name *</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. FY 2024 Audit Report"
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
                  <Input 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Audit, Taxation"
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document URL / Link</label>
                  <Input 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="bg-slate-900/50 border-white/5 h-11 focus:border-[#c9a84c] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">File Format</label>
                   <Select value={formData.file_type} onValueChange={(v) => setFormData({...formData, file_type: v})}>
                    <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 text-white uppercase tracking-widest font-bold text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">XLSX / Excel</SelectItem>
                      <SelectItem value="docx">DOCX / Word</SelectItem>
                      <SelectItem value="png">PNG / Image</SelectItem>
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
                  {editingDoc ? "Save Changes" : "Create Record"}
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
              <DialogTitle className="text-xl font-serif text-white">Confirm Removal</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Are you sure you want to permanently remove this document record? This action cannot be undone.
              </DialogDescription>
            </div>
            <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white px-6">
                Delete Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
