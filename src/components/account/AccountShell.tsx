import type { ReactNode } from "react";
import { Bookmark, Compass, CalendarDays, User, Settings, Ticket, NotebookPen, Sparkles } from "lucide-react";
import type { NavTab } from "@/components/Navbar";

const sections = [
  { id: "saved-places", label: "Saved places", icon: Bookmark },
  { id: "my-list", label: "List & notes", icon: NotebookPen },
  { id: "my-trips", label: "My trips", icon: CalendarDays },
  { id: "planner", label: "Trip planner", icon: Compass },
  { id: "booking-history", label: "Booking history", icon: Ticket },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function AccountShell({ active, onNavigate, onAskYatra, children }: {
  active: NavTab | null; onNavigate: (tab: NavTab) => void; onAskYatra: (prompt: string) => void; children: ReactNode;
}) {
  if (!sections.some(section => section.id === active)) return <>{children}</>;
  return <div className="account-shell site-container">
    <header className="account-intro"><div><p className="eyebrow text-primary">My Bhraman</p><h2 className="display-font">A journey taking shape.</h2><p>Keep the places you love. Add your notes. Make a plan.</p></div>
      <button className="brand-button brand-button-secondary" onClick={() => onAskYatra("Help me shape a trip to India. Ask me about my saved places, dates and interests.")}><Sparkles className="size-4 text-primary" />Ask Yatra</button>
    </header>
    <div className="account-layout"><nav className="account-navigation" aria-label="My Bhraman sections">
      {sections.map(({ id, label, icon: Icon }) => <button key={id} id={"account-nav-" + id} aria-current={active === id ? "page" : undefined} onClick={() => onNavigate(id)}><Icon className="size-4 shrink-0" />{label}</button>)}
    </nav><div className="account-content">{children}</div></div>
  </div>;
}

