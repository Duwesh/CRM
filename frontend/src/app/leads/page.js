"use client";

import React, { useEffect, useState, useMemo } from "react";
import Shell from "@/components/Shell";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  IndianRupee,
  Trash2,
  Edit,
  ChevronDown,
  X,
  Target,
  ArrowRight,
  Filter,
  CalendarDays
} from "lucide-react";
import { LEAD_STAGES, LEAD_SOURCES } from "@/lib/constants";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getLeads, createLead, updateLead, deleteLead } from "@/lib/db/leads";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const leadSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  services_interest: z.string().optional(),
  estimated_value: z.string().optional(),
  stage: z.string().default("New Lead"),
  source: z.string().optional(),
  referred_by: z.string().optional(),
  notes: z.string().optional(),
  followup_date: z.string().optional(),
});

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      services_interest: "",
      estimated_value: "",
      stage: "New Lead",
      source: "Referral",
      referred_by: "",
      notes: "",
      followup_date: "",
    },
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const leads = await getLeads();
      setLeads(leads);
    } catch (err) {
      console.error("Failed to fetch leads", err);
      toast({
        title: "Error",
        description: "Failed to load leads. Using mock data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      // Clean up empty date strings to prevent DB errors
      const submissionData = {
        ...values,
        followup_date: values.followup_date === "" ? null : values.followup_date,
        estimated_value: values.estimated_value === "" ? 0 : parseFloat(values.estimated_value) || 0
      };

      if (selectedLead) {
        await updateLead(selectedLead.id, submissionData);
        toast({ title: "Success", description: "Lead updated successfully" });
      } else {
        await createLead(submissionData);
        toast({ title: "Success", description: "Lead created successfully" });
      }
      setIsModalOpen(false);
      fetchLeads();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    form.reset({
      name: lead.name,
      contact_person: lead.contact_person || "",
      phone: lead.phone || "",
      email: lead.email || "",
      services_interest: lead.services_interest || "",
      estimated_value: lead.estimated_value?.toString() || "",
      stage: lead.stage || "New Lead",
      source: lead.source || "Referral",
      referred_by: lead.referred_by || "",
      notes: lead.notes || "",
      followup_date: lead.followup_date || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteLead(selectedLead.id);
      toast({ title: "Success", description: "Lead deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchLeads();
      window.dispatchEvent(new CustomEvent("refresh-counts"));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const updateLeadStage = async (leadId, newStage) => {
    try {
      await updateLead(leadId, { stage: newStage });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      window.dispatchEvent(new CustomEvent("refresh-counts"));
      toast({ title: "Stage Updated", description: `Lead moved to ${newStage}` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update stage", variant: "destructive" });
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const search = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(search) ||
        lead.contact_person?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search)
      );
    });
  }, [leads, searchQuery]);

  const leadsByStage = useMemo(() => {
    const grouped = {};
    LEAD_STAGES.forEach((stage) => {
      grouped[stage] = filteredLeads.filter((l) => l.stage === stage);
    });
    return grouped;
  }, [filteredLeads]);

  return (
    <Shell>
      {/* Header */}
      <div className="section-hdr mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-foreground tracking-tight">Leads & Prospects</h2>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-[0.2em] antialiased">
            Track potential clients and conversion pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
            <Input
              placeholder="Search prospects..."
              className="pl-9 w-64 h-10 bg-slate-900/50 border-white/5 focus:border-gold/50 transition-all rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            onClick={() => {
              setSelectedLead(null);
              form.reset({
                name: "",
                contact_person: "",
                phone: "",
                email: "",
                services_interest: "",
                estimated_value: "",
                stage: "New Lead",
                source: "Referral",
                referred_by: "",
                notes: "",
                followup_date: "",
              });
              setIsModalOpen(true);
            }}
            variant="gold"
            className="gap-2 px-5 py-5 shadow-lg shadow-gold/10"
          >
            <Plus size={18} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide min-h-[calc(100vh-250px)]">
        {LEAD_STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80">
            {/* Stage Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest antialiased">
                  {stage}
                </span>
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-white/5 bg-slate-900 text-slate-400">
                  {leadsByStage[stage]?.length || 0}
                </Badge>
              </div>
              <div className="h-0.5 flex-grow mx-3 bg-white/5 rounded-full" />
              <div className="text-[10px] font-mono text-slate-600">
                ₹{leadsByStage[stage]?.reduce((sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0).toLocaleString()}
              </div>
            </div>

            {/* Leads Cards */}
            <div className="space-y-3 min-h-[200px] rounded-xl border border-dashed border-white/5 p-1">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="p-4 bg-slate-900/40 border-white/5">
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </Card>
                ))
              ) : leadsByStage[stage]?.map((lead) => (
                <Card
                  key={lead.id}
                  className="group relative p-4 bg-slate-900/40 hover:bg-slate-900/60 border-white/5 hover:border-gold/20 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleEdit(lead)}
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-slate-900 border-white/10">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(lead); }}>
                          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 focus:text-red-400"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedLead(lead); 
                            setIsDeleteModalOpen(true); 
                          }}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                        <div className="h-px bg-white/5 my-1" />
                        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Move To</div>
                        {LEAD_STAGES.filter(s => s !== stage).map(s => (
                          <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); updateLeadStage(lead.id, s); }}>
                            <ArrowRight className="mr-2 h-3.5 w-3.5" /> {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-1 text-[11px] font-mono text-gold/60 uppercase tracking-widest">
                    ₹{parseFloat(lead.estimated_value || 0).toLocaleString()}
                  </div>
                  <h4 className="text-sm font-medium text-slate-200 mb-1 group-hover:text-gold transition-colors">
                    {lead.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-4 line-clamp-1">
                    {lead.contact_person} • {lead.services_interest || "Multiple Services"}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="flex gap-2">
                       <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-white/5 bg-slate-950 text-slate-400 uppercase tracking-tighter">
                        {lead.source || "Walk-in"}
                      </Badge>
                    </div>
                    {lead.followup_date && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Calendar size={10} />
                        {new Date(lead.followup_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 shadow-2xl p-0 overflow-y-auto max-h-[90vh] scrollbar-hide">
          <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 sticky top-0 z-10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl tracking-wide">
                {selectedLead ? "Modify Lead / Prospect" : "Add Lead / Prospect"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">
                {selectedLead 
                  ? "Update potential client conversion and engagement data" 
                  : "Track potential client pipeline and growth opportunities"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogHeader className="opacity-0 h-0 w-0 overflow-hidden">
            <DialogTitle />
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name / Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="Potential client name" className="bg-slate-900/50 border-white/5 h-11 focus:ring-1 focus:ring-gold/30" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Person's name" className="bg-slate-900/50 border-white/5 h-11" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" className="bg-slate-900/50 border-white/5 h-11" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" className="bg-slate-900/50 border-white/5 h-11" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services_interest"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Services Interested In</FormLabel>
                      <FormControl>
                        <Input placeholder="ITR, GST, Audit..." className="bg-slate-900/50 border-white/5 h-11" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimated_value"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Value (₹/Yr)</FormLabel>
                      <FormControl>
                        <Input placeholder="25000" className="bg-slate-900/50 border-white/5 h-11" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/5 h-11">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10">
                          {LEAD_STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/5 h-11">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10">
                          {LEAD_SOURCES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="referred_by"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referred By</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of person who referred" className="bg-slate-900/50 border-white/5 h-11" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes / Next Action</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What's the next step? Meeting notes, requirements..." 
                        className="bg-slate-900/50 border-white/5 min-h-[100px] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followup_date"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 flex flex-col">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Follow-up Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full bg-slate-900/50 border-white/5 h-11 pl-3 text-left font-normal hover:bg-slate-900/80 transition-all",
                              !field.value && "text-slate-500"
                            )}
                          >
                            {field.value && !isNaN(new Date(field.value).getTime()) ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span className="text-slate-500">Pick a date</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 text-slate-500" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-950 border-white/10 shadow-2xl" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                          className="bg-slate-950 text-slate-200"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-slate-950 py-4 mt-4 border-t border-white/5 px-8 -mx-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="px-8 border-white/5 hover:bg-white/5 gap-2">
                  <X size={14} /> Cancel
                </Button>
                <Button type="submit" variant="gold" className="px-8 shadow-lg shadow-gold/20">
                  {selectedLead ? "Update Lead" : "Save Lead"}
                </Button>
              </div>
            </form>
          </Form>
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
            <DialogDescription className="text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-200 underline">{selectedLead?.name}</span>? 
              This will move the lead to archives and cannot be easily undone.
            </DialogDescription>
          </div>
          <div className="p-8 pt-4 flex gap-3 justify-end items-center bg-white/[0.02]">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              Delete Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
