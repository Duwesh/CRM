"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  User,
  Trash2,
  Edit2,
  Globe,
  Briefcase,
  Calendar,
  DollarSign,
  Shield,
  Tag,
  MapPin,
  Lock,
  FileText,
  Activity,
  Info,
  X,
  Loader2,
  UserCheck,
} from "lucide-react";
import Modal from "@/components/Modal";
import { getClients, createClient, updateClient, deleteClient } from "@/lib/db/clients";
import { getTeamMembers } from "@/lib/db/team";
import clientsData from "@/data/clients.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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

import {
  SERVICE_OPTIONS,
  CLIENT_TYPES,
  INDUSTRY_SECTORS,
  CONSTITUTION_TYPES,
  CLIENT_STATUSES,
  CLIENT_SOURCES,
} from "@/lib/constants";

const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.string().min(1, { message: "Please select a client type." }),
  pan: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  cin: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  constitution: z.string().optional().or(z.literal("")),
  since_year: z.string().optional().or(z.literal("")),
  annual_fee: z.string().optional().or(z.literal("")),
  manager_id: z.string().optional().or(z.literal("")),
  services: z.array(z.string()).default([]),
  registered_address: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  it_password: z.string().optional().or(z.literal("")),
  gst_password: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.string().default("active"),
  source: z.string().optional().or(z.literal("")),
});

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  const { toast } = useToast();

  // Initialize Form
  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      type: "",
      pan: "",
      gstin: "",
      cin: "",
      industry: "",
      constitution: "",
      since_year: "",
      annual_fee: "",
      manager_id: "",
      services: [],
      registered_address: "",
      email: "",
      phone: "",
      it_password: "",
      gst_password: "",
      notes: "",
      status: "active",
      source: "",
    },
  });

  useEffect(() => {
    fetchClients();
    fetchTeam();
  }, [currentPage, search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const clients = await getClients({ search });
      setClients(clients);
    } catch (err) {
      setClients(clientsData);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const fetchTeam = async () => {
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (err) {
      console.error("Team fetch failed", err);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    const data = { ...values };

    // Add services as string for the main client table column (if backend expects it)
    data.services_availed = values.services.join(", ");

    // Convert empty numeric-like strings to null if requested by backend
    if (data.manager_id === "") data.manager_id = null;
    if (data.annual_fee === "") data.annual_fee = null;
    if (data.since_year === "") data.since_year = null;

    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
      } else {
        await createClient(data);
      }

      setIsAddModalOpen(false);
      setEditingClient(null);
      form.reset();
      fetchClients();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({
        title: "Success",
        description: `Master client record ${
          editingClient ? "updated" : "established"
        } successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || `Failed to ${editingClient ? "update" : "save"} client record.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    form.reset({
      name: client.name || "",
      type: client.type || "",
      pan: client.pan || "",
      gstin: client.gstin || "",
      cin: client.cin || "",
      industry: client.industry || "",
      constitution: client.constitution || "",
      since_year: client.since_year ? String(client.since_year) : "",
      annual_fee: client.annual_fee ? String(client.annual_fee) : "",
      manager_id: client.manager_id ? String(client.manager_id) : "",
      services: client.services_availed
        ? client.services_availed.split(", ")
        : [],
      registered_address: client.registered_address || "",
      email: client.email || "",
      phone: client.phone || "",
      it_password: client.it_password || "",
      gst_password: client.gst_password || "",
      notes: client.notes || "",
      status: client.status || "active",
      source: client.source || "",
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingClient(null);
    form.reset({
      name: "",
      type: "",
      pan: "",
      gstin: "",
      cin: "",
      industry: "",
      constitution: "",
      since_year: "",
      annual_fee: "",
      manager_id: "",
      services: [],
      registered_address: "",
      email: "",
      phone: "",
      it_password: "",
      gst_password: "",
      notes: "",
      status: "active",
      source: "",
    });
    setIsAddModalOpen(true);
  };

  const onDeleteRow = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setSaving(true);
    try {
      await deleteClient(clientToDelete.id);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      fetchClients();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({
        title: "Record Terminated",
        description: "The client record has been permanently removed.",
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete record.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayClients = clients.filter((c) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "active") return c.status === "active";
    if (typeFilter === "inactive") return c.status === "inactive";
    if (typeFilter === "companies")
      return (
        c.type?.toLowerCase().includes("company") ||
        c.type?.toLowerCase().includes("llp")
      );
    if (typeFilter === "individuals") return c.type === "Individual";
    if (typeFilter === "huf") return c.type === "HUF";
    if (typeFilter === "trust")
      return (
        c.type?.toLowerCase().includes("trust") ||
        c.type?.toLowerCase().includes("ngo")
      );
    return true;
  });

  const paginatedClients = displayClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(displayClients.length / itemsPerPage);

  return (
    <Shell>
      {/* Header section with search and add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-tight antialiased">
            Client Master
          </h2>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Centralized directory of all firm entities
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-400 transition-colors"
            />
            <Input
              placeholder="Search master list..."
              className="h-11 pl-11 w-72 bg-slate-950/40 border-white/5 text-[11px] rounded-xl focus:ring-amber-400/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="px-6 h-11 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-all shadow-[0_10px_20px_rgba(251,191,36,0.15)] flex items-center hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={14} className="mr-2" /> Add Client
          </button>
        </div>
      </div>

      {/* Main Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-950/20 p-2 rounded-2xl border border-white/5 w-fit">
        {[
          "all",
          "active",
          "inactive",
          "companies",
          "individuals",
          "huf",
          "trust",
        ].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setTypeFilter(filter);
              setCurrentPage(1);
            }}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              typeFilter === filter
                ? "bg-slate-100 text-slate-950 shadow-lg scale-105"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Clients Table */}
      <div className="glass-card rounded-[24px] overflow-hidden border border-white/5 shadow-2xl relative">
        <Table>
          <TableHeader className="bg-slate-950/40 border-b border-white/5 h-14">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                Client Name & Manager
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                Type & Category
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                PAN & GSTIN
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                Services
              </TableHead>
              <TableHead className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased text-center">
                Status
              </TableHead>
              <TableHead className="px-8 text-[12px] font-bold text-slate-500 uppercase tracking-widest antialiased text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5 bg-transparent">
                  <TableCell className="px-8 py-5 h-20">
                    <Skeleton className="h-4 w-40 bg-slate-800" />
                  </TableCell>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-4 w-full bg-slate-800/50" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedClients.length === 0 ? (
              <TableRow className="border-none">
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                    <Users size={48} className="text-slate-600" />
                    <p className="text-slate-400 font-serif text-lg">
                      No matching entities found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="group border-white/5 hover:bg-white/[0.01] transition-all bg-transparent"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-amber-500 font-serif text-sm group-hover:border-amber-500/30 transition-all">
                        {client.name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div className="flex flex-col">
                        <button
                          onClick={() => openEditModal(client)}
                          className="text-left font-bold text-slate-200 hover:text-amber-400 transition-colors tracking-tight antialiased"
                        >
                          {client.name}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <User size={10} className="text-slate-600" />
                          {client.Manager?.name || "No Manager"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {client.type}
                      </span>
                      <span className="text-[10px] text-slate-500 italic">
                        {client.industry || "General"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 w-8">PAN</span>
                        <span className="text-slate-400 tracking-wider">
                          {client.pan || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 w-8">GST</span>
                        <span className="text-slate-500">
                          {client.gstin || "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {client.services_availed ? (
                        client.services_availed.split(", ").map((service) => (
                          <Badge
                            key={service}
                            variant="outline"
                            className="text-[8px] px-1.5 py-0 border-white/5 bg-slate-900 text-slate-400 capitalize"
                          >
                            {service}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-center">
                    <Badge
                      className={cn(
                        "text-[9px] font-bold px-2.5 py-0.5 border-none",
                        client.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-slate-800 text-slate-500",
                      )}
                    >
                      {client.status?.toUpperCase() || "ACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="h-8 w-8 flex items-center justify-center text-slate-600 hover:text-amber-400 hover:bg-amber-400/5 rounded-lg transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteRow(client)}
                        className="h-8 w-8 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between px-8">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, displayClients.length)} of{" "}
            {displayClients.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="bg-slate-950/40 border-white/5 text-xs text-slate-400 hover:text-white rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="bg-slate-950/40 border-white/5 text-xs text-slate-400 hover:text-white rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingClient ? "Edit Client" : "Add Client"}
        subtitle={
          editingClient
            ? `Updating profile for ${editingClient.name}`
            : "Complete client profile for your firm"
        }
        width="max-w-4xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset disabled={saving} className="space-y-8 p-1">
              <div className="space-y-8">
                {/* Row 1: Name & Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Client / Company Name ★
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Sharma Enterprises Pvt Ltd"
                              className="h-12 bg-slate-950/60 border-white/5 text-xs text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Client Type ★
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Select...</option>
                            {CLIENT_TYPES.map((type) => (
                              <option key={type}>{type}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: IDs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          PAN
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABCDE1234F"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs font-mono tracking-wider"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          GSTIN
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="22ABCDE1234F1Z5"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs font-mono tracking-wider"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          CIN (IF APPLICABLE)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="U12345MH2020PTC123456"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs font-mono tracking-wider"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Industry & Constitution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Industry / Sector
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Select...</option>
                            {INDUSTRY_SECTORS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="constitution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Constitution
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Select...</option>
                            {CONSTITUTION_TYPES.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Since, Fee, Manager */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="since_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Client Since (Year)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2020"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annual_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Annual Fee (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="50000"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manager_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Assigned Manager
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Unassigned</option>
                            {teamMembers?.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}{" "}
                                {member.role ? `(${member.role})` : ""}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Services */}
                <div className="px-1">
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                          <Tag size={12} className="mr-2 text-amber-500" />{" "}
                          Services Availed
                        </FormLabel>
                        <FormControl>
                          <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl flex flex-wrap gap-2.5 shadow-inner">
                            {SERVICE_OPTIONS.map((service) => (
                              <button
                                key={service}
                                type="button"
                                onClick={() => {
                                  const current = field.value || [];
                                  if (current.includes(service)) {
                                    field.onChange(
                                      current.filter((s) => s !== service),
                                    );
                                  } else {
                                    field.onChange([...current, service]);
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-full text-[10px] font-bold border transition-all duration-300",
                                  field.value?.includes(service)
                                    ? "bg-amber-400 border-amber-500 text-slate-950 shadow-[0_5px_15px_rgba(251,191,36,0.2)]"
                                    : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300",
                                )}
                              >
                                {service}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 6: Address */}
                <div className="px-1">
                  <FormField
                    control={form.control}
                    name="registered_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Registered Address
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Full address..."
                            className="w-full h-28 rounded-xl border border-white/5 bg-slate-950/60 p-5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10 resize-none transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 7: Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                          <Mail size={12} className="mr-2 text-amber-500" />{" "}
                          Primary Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="accounts@company.com"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                          <Phone size={12} className="mr-2 text-amber-500" />{" "}
                          Primary Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+91 98765 43210"
                            autoComplete="off"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 8: Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="it_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                          <Shield size={12} className="mr-2 text-amber-500" />{" "}
                          IT Password (Encrypted)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Income Tax portal password"
                            type="password"
                            autoComplete="new-password"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gst_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                          <Lock size={12} className="mr-2 text-amber-500" /> GST
                          Portal Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="GST portal password"
                            type="password"
                            autoComplete="new-password"
                            className="h-12 bg-slate-950/60 border-white/5 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 9: Notes */}
                <div className="px-1">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Notes / Internal Remarks
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Any special notes..."
                            className="w-full h-28 rounded-xl border border-white/5 bg-slate-950/60 p-5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10 resize-none transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 10: Status & Source */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Status
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            {CLIENT_STATUSES.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Source
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-12 w-full rounded-md border border-white/5 bg-slate-950/60 px-4 py-2 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-400/10"
                            {...field}
                          >
                            <option value="">Select...</option>
                            {CLIENT_SOURCES.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
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
                  ) : editingClient ? (
                    "Update Client"
                  ) : (
                    "Save Client"
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
              Are you sure you want to delete <span className="font-bold text-slate-200 underline">{clientToDelete?.name}</span>? 
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
                "Yes, Delete Client"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
