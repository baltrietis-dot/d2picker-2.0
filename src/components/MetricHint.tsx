import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricHintProps {
  label: string;
  hint: string;
  icon: ReactNode;
  className?: string;
}

export function MetricHint({ label, hint, icon, className = '' }: MetricHintProps) {
  return (
    <span
      className={`group/metric relative inline-flex items-center gap-1 outline-none ${className}`}
      tabIndex={0}
      title={hint}
    >
      {icon}
      <span>{label}</span>
      <HelpCircle className="h-3 w-3 shrink-0 text-white/25 transition-colors group-hover/metric:text-gold-300 group-focus/metric:text-gold-300" />
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-md border border-white/10 bg-obsidian-900 px-3 py-2 text-left text-[11px] font-medium normal-case leading-relaxed tracking-normal text-white/70 opacity-0 shadow-panel transition-all duration-150 group-hover/metric:visible group-hover/metric:opacity-100 group-focus/metric:visible group-focus/metric:opacity-100"
      >
        {hint}
      </span>
    </span>
  );
}
