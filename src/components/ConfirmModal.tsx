import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  isDeleting?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = "This action cannot be undone.",
  isDeleting = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-500/10 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-8">{subtitle}</p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 text-white font-medium transition-colors"
              style={{
                backgroundColor: '#334155',
                borderRadius: '8px',
                padding: '10px 24px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 text-white font-medium transition-colors"
              style={{
                backgroundColor: '#EF4444',
                borderRadius: '8px',
                padding: '10px 24px',
                opacity: isDeleting ? 0.7 : 1,
                cursor: isDeleting ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = '#DC2626';
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = '#EF4444';
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
