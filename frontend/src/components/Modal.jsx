"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, title, subtitle, children, width = "max-w-xl", showFooter = false }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full ${width} bg-navy-2 border border-border-2 rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className="px-8 pt-8 pb-6 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl text-text">{title}</h2>
                {subtitle && <p className="text-xs text-text-3 mt-1">{subtitle}</p>}
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg text-text-3 hover:text-text transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {children}
            </div>

            {showFooter && (
              <div className="px-8 py-4 bg-navy-3/50 flex justify-end gap-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-text-3 hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button 
                  className="btn-gold min-w-[100px]"
                  onClick={() => {
                    // This is just a UI placeholder for now
                    onClose();
                  }}
                >
                  Execute
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
