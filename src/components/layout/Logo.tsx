import { BRAND } from '@/utils/constants'
export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden><rect width="32" height="32" rx="8" fill="rgb(var(--brand))" /><path d="M9 25V9.5L16 7l7 2.5V25" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12.5 13h2M17.5 13h2M12.5 17h2M17.5 17h2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M14 25v-3h4v3" stroke="#fff" strokeWidth="1.8" /></svg>
      {!collapsed && <div className="leading-tight"><p className="text-sm font-bold">{BRAND.name}</p><p className="text-[10px] text-muted">{BRAND.subtitle}</p></div>}
    </div>
  )
}
