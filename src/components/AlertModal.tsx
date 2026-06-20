import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
}

export function AlertModal({ isOpen, onClose, title, message, isError = false }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-xl shadow-2xl border border-slate-100 flex items-center gap-3 px-5 py-4 pointer-events-auto">
        {isError ? (
          <AlertCircle className="text-rose-500" size={24} />
        ) : (
          <CheckCircle2 className="text-emerald-500" size={24} />
        )}
        <div>
          <h4 className={`font-bold text-sm ${isError ? 'text-rose-700' : 'text-slate-800'}`}>{title}</h4>
          <p className="text-xs text-slate-500">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}
