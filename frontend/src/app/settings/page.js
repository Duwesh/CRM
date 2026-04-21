"use client";

import React, { useState } from "react";
import Shell from "@/components/Shell";
import { Building2, Palette, Save, Loader2 } from "lucide-react";
// import { User, Shield, Bell, Globe } from "lucide-react"; // reserved for future tabs

import api from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("firm");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    reg_number: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    logo_url: ""
  });

  const tabs = [
    { id: "firm", label: "Firm Profile", icon: <Building2 size={16} /> },
    // { id: "personal", label: "Personal Info", icon: <User size={16} /> },
    // { id: "security", label: "Security", icon: <Shield size={16} /> },
    // { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/settings/profile');
        if (res.data.data) {
          const d = res.data.data;
          setFormData({
            name: d.name || "",
            reg_number: d.reg_number || "",
            email: d.email || "",
            phone: d.phone || "",
            address: d.address || "",
            type: d.type || "",
            logo_url: d.logo_url || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch firm profile:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings/profile', formData);
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('logo', file);

    setLoading(true);
    try {
      const res = await api.post('/settings/upload-logo', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, logo_url: res.data.data.logo_url }));
      alert("Logo uploaded successfully!");
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="section-hdr mb-8">
        <h2 className="font-serif text-2xl text-text">Account Settings</h2>
        <p className="text-xs text-text-3 mt-1 font-mono uppercase tracking-wider">
          Configure your workspace and profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === tab.id ? 'bg-gold-soft border border-gold-border text-gold-light font-medium' : 'text-text-3 hover:bg-white/5 hover:text-text'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-card p-8 min-h-[400px]">
            {fetching ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="animate-spin w-8 h-8 text-gold" />
              </div>
            ) : activeTab === 'firm' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-text mb-4">Firm Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-text-3 uppercase">Legal Firm Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="w-full bg-navy/80 border border-border-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gold transition-all" 
                        value={formData.name} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-text-3 uppercase">GSTIN / Registration</label>
                      <input 
                        type="text" 
                        name="reg_number"
                        className="w-full bg-navy/80 border border-border-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gold transition-all" 
                        value={formData.reg_number} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-text-3 uppercase">Primary Email</label>
                      <input 
                        type="email" 
                        name="email"
                        className="w-full bg-navy/80 border border-border-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gold transition-all" 
                        value={formData.email} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-text-3 uppercase">Contact Phone</label>
                      <input 
                        type="text" 
                        name="phone"
                        className="w-full bg-navy/80 border border-border-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gold transition-all" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-mono text-text-3 uppercase">Office Address</label>
                      <textarea 
                        name="address"
                        rows="2"
                        className="w-full bg-navy/80 border border-border-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gold transition-all" 
                        value={formData.address} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-medium text-text mb-4">Firm Branding</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-xl bg-navy-3 border-2 border-dashed border-border-2 flex flex-col items-center justify-center text-text-3 overflow-hidden relative group-hover:border-gold transition-all transition-colors cursor-pointer">
                        {formData.logo_url ? (
                          <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Palette size={20} />
                            <span className="text-[9px] mt-2 font-mono uppercase">Upload</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleLogoUpload}
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-2 mb-1">Your firm logo will appear on reports and invoices.</p>
                      <p className="text-[10px] text-text-3">Allowed: JPG, PNG • Max size: 2MB • Suggested: 400x100px</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                   <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-gold min-w-[140px] flex items-center justify-center gap-2"
                   >
                     {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={16} /> Save Changes</>}
                   </button>
                </div>
              </div>
            ) : null}
            {/* Tabs below are commented out until implemented:
            ) : activeTab === 'personal' ? (
              <div className="text-center py-12">
                 <p className="text-text-3">Profile settings interface coming soon...</p>
                 <button onClick={() => setActiveTab('firm')} className="text-gold-light mt-4 text-sm underline">Back to Firm Profile</button>
              </div>
            ) : null
            */}
          </div>
        </div>
      </div>
    </Shell>
  );
}
