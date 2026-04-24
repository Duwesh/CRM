"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { 
  User, Search, Plus, Mail, Phone, 
  Building2, Star, Trash2, Loader2,
  Users
} from "lucide-react";
import { getContacts, createContact, updateContact, deleteContact } from "@/lib/db/contacts";
import { getClients } from "@/lib/db/clients";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Shadcn Form Imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  client_id: z.string().min(1, { message: "Please select a client." }),
  designation: z.string().optional(),
  department: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  whatsapp_number: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
});

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [clients, setClients] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  
  const { toast } = useToast();

  // Initialize Form
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      client_id: "",
      designation: "",
      department: "",
      mobile: "",
      email: "",
      whatsapp_number: "",
      birthday: "",
      notes: "",
      is_primary: false,
    },
  });

  useEffect(() => {
    fetchContacts();
    fetchClients();
  }, [currentPage, search]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const result = await getContacts({ page: currentPage, limit: itemsPerPage, search });
      setContacts(result.contacts);
      setTotalRecords(result.total);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const fetchClients = async () => {
    try {
      const clients = await getClients();
      setClients(clients);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, values);
      } else {
        await createContact(values);
      }

      setIsAddModalOpen(false);
      setEditingContact(null);
      form.reset();
      fetchContacts();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({
        title: "Success",
        description: `Contact record ${editingContact ? "updated" : "created"} successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save contact record.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    form.reset({
      name: contact.name || "",
      client_id: String(contact.client_id) || "",
      designation: contact.designation || "",
      department: contact.department || "",
      mobile: contact.mobile || "",
      email: contact.email || "",
      whatsapp_number: contact.whatsapp_number || "",
      birthday: contact.birthday || "",
      notes: contact.notes || "",
      is_primary: !!contact.is_primary,
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingContact(null);
    form.reset({
      name: "",
      client_id: "",
      designation: "",
      department: "",
      mobile: "",
      email: "",
      whatsapp_number: "",
      birthday: "",
      notes: "",
      is_primary: false,
    });
    setIsAddModalOpen(true);
  };

  const onDeleteRow = (contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    
    setSaving(true);
    try {
      await deleteContact(contactToDelete.id);
      setIsDeleteModalOpen(false);
      setContactToDelete(null);
      fetchContacts();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({
        title: "Record Deleted",
        description: "The contact record has been removed.",
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || "Failed to delete record.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  return (
    <Shell>
      {/* Header Area */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif text-white tracking-tight mb-2 antialiased">
              Contacts
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Key people at client organizations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={16}
              />
              <Input
                placeholder="Search contacts..."
                className="pl-11 h-12 bg-slate-900/50 border-white/5 rounded-2xl text-slate-300 placeholder:text-slate-600 focus:ring-amber-400/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              onClick={openAddModal}
              variant="gold"
              className="h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(251,191,36,0.1)] hover:shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all w-full sm:w-auto"
            >
              <Plus size={16} className="mr-2" /> Add Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
        <Table>
          <TableHeader className="bg-slate-950/40 border-b border-white/5 h-16">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                Name
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                Company
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-center">
                Designation
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-center">
                Mobile
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-center">
                Email
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-center">
                Primary
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5 bg-transparent">
                  <TableCell colSpan={7} className="h-20">
                    <div className="flex animate-pulse space-x-4 px-4 w-full">
                      <div className="rounded-full bg-slate-800 h-10 w-10"></div>
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-slate-800 rounded"></div>
                        <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow className="border-none">
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                    <Users size={48} className="text-slate-600" />
                    <div>
                      <p className="text-slate-400 font-serif text-lg">No contacts found</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Directory is empty</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (contacts || []).map((contact) => (
                <TableRow
                  key={contact.id}
                  className="group border-white/5 hover:bg-white/[0.02] transition-all bg-transparent"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-amber-500 font-serif text-sm group-hover:border-amber-500/30 transition-all">
                        {contact.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <button 
                          onClick={() => openEditModal(contact)}
                          className="text-left font-bold text-slate-100 hover:text-amber-400 transition-colors uppercase tracking-tight antialiased"
                        >
                          {contact.name}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {contact.Client?.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter bg-slate-900/50 border-white/5 text-slate-500 px-3 py-1">
                      {contact.designation || "Stakeholder"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <span className="text-[11px] text-emerald-400/80 font-mono tracking-tighter">
                      {contact.mobile || contact.phone || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <span className="text-[11px] text-sky-400/80 underline decoration-sky-800/50">
                      {contact.email || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    {contact.is_primary ? (
                      <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] font-black uppercase tracking-widest px-3">
                        Primary
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                          onClick={() => onDeleteRow(contact)}
                          className="h-8 w-8 flex items-center justify-center text-slate-700 hover:text-red-400 border border-transparent hover:border-red-400/20 hover:bg-red-400/5 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingContact ? "Edit Contact" : "Add Contact"}
        subtitle={editingContact ? `Updating profile for ${editingContact.name}` : "Key person at a client organization"}
        width="max-w-4xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset disabled={saving} className="space-y-8 p-1">
              <div className="space-y-8">
                {/* Row 1: Name & Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name ★</FormLabel>
                        <FormControl>
                          <Input placeholder="Rajesh Sharma" className="h-12 bg-slate-950/60 border-white/5 text-xs text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked Client ★</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Select Company...</option>
                             {(clients || []).map((c) => (
                               <option key={c.id} value={c.id}>
                                 {c.name}
                               </option>
                             ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Designation & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="CFO, Director, Owner..." className="h-12 bg-slate-950/60 border-white/5 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Finance, Accounts..." className="h-12 bg-slate-950/60 border-white/5 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Mobile & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" autoComplete="off" className="h-12 bg-slate-950/60 border-white/5 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="rajesh@company.com" autoComplete="off" className="h-12 bg-slate-950/60 border-white/5 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: WhatsApp & Birthday */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" autoComplete="off" className="h-12 bg-slate-950/60 border-white/5 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Birthday (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-12 bg-slate-950/60 border-white/5 text-xs text-slate-400" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <div className="px-1">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Decision maker, accounts contact..."
                            className="w-full h-28 rounded-xl border border-white/5 bg-slate-950/60 p-5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10 resize-none transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Primary Contact Toggle */}
                <div className="px-1">
                  <FormField
                    control={form.control}
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Contact?</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            value={field.value ? "true" : "false"}
                            onChange={(e) => field.onChange(e.target.value === "true")}
                          >
                            <option value="false">No — Stakeholder</option>
                            <option value="true">Yes — Primary Contact</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 bg-slate-900/50 p-6 px-10 border-t border-white/5 rounded-b-3xl">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  variant="outline"
                  disabled={saving}
                  className="border-white/5 hover:bg-white/5 text-slate-400 font-bold h-12 px-8 uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-10 uppercase text-[10px] tracking-[0.2em] shadow-[0_10px_30px_rgba(251,191,36,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingContact ? (
                    "Update Contact"
                  ) : (
                    "Save Contact"
                  )}
                </Button>
              </div>
            </fieldset>
          </form>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-white/10 shadow-2xl p-0 overflow-hidden">
          <div className="p-8 pb-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
              <Trash2 className="text-rose-500" size={24} />
            </div>
            <DialogTitle className="text-xl font-serif text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-200 underline">{contactToDelete?.name}</span>? 
              This action is permanent and all associated records will be marked as deleted.
            </DialogDescription>
          </div>
          <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)} 
              disabled={saving}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              disabled={saving}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Yes, Delete Contact"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
