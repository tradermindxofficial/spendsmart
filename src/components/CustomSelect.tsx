'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  color?: string; // direct hex color for the option text
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Only use portal after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture position when opening
  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen((prev) => !prev);
  };

  // Update rect on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (triggerRef.current) {
        setRect(triggerRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !target.closest('#custom-select-portal')
      ) {
        setIsOpen(false);
      }
    };
    // slight delay so the toggle click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen]);

  // Resolve option text color from textColorClass or color prop
  const resolveColor = (opt: Option & { textColorClass?: string }) => {
    if (opt.color) return opt.color;
    const tc = (opt as any).textColorClass;
    if (tc === 'text-[#10B981]') return '#10B981';
    if (tc === 'text-[#EF4444]') return '#EF4444';
    return '#94A3B8';
  };

  const dropdownMenu =
    isOpen && rect && mounted
      ? createPortal(
          <div
            id="custom-select-portal"
            style={{
              position: 'fixed',
              top: rect.bottom + 6,
              left: rect.left,
              width: Math.max(rect.width, 160),
              zIndex: 999999,
            }}
          >
            <div
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid #10B981',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                padding: '6px',
                maxHeight: '260px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                const textColor = resolveColor(opt as any);

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      userSelect: 'none',
                      color: isSelected ? '#ffffff' : textColor,
                      backgroundColor: isSelected ? '#10B981' : 'transparent',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#10B981';
                        (e.currentTarget as HTMLDivElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLDivElement).style.color = textColor;
                      }
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: '#1E293B',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          border: isOpen ? '1px solid #10B981' : '1px solid #334155',
          boxShadow: isOpen ? '0 0 0 2px rgba(16,185,129,0.15)' : 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#ffffff',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          style={{
            width: '15px',
            height: '15px',
            flexShrink: 0,
            color: isOpen ? '#10B981' : '#64748b',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s, color 0.2s',
          }}
        />
      </button>

      {dropdownMenu}
    </div>
  );
}
