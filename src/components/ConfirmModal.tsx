import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', confirmColor = 'bg-rose-600 hover:bg-rose-700' }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-5 flex gap-4 items-start">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${confirmColor.includes('rose') ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
             <AlertTriangle size={20} />
           </div>
           <div>
             <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
             <p className="text-sm text-slate-500">{message}</p>
           </div>
        </div>
        <div className="bg-slate-50 px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${confirmColor}`}>{confirmText}</button>
        </div>
      </motion.div>
    </div>
  );
}
