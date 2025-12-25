import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-gray-800/50 bg-black/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
