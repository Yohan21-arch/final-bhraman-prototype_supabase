import { Compass, Heart } from "lucide-react";
import { STATES_DATA } from "@/data/states";
import { SupabaseStatusIndicator } from "@/components/SupabaseStatusIndicator";
import type { StateData } from "@/types";

export function Footer({
  onSelectState,
  onDataRefreshed,
}: {
  onSelectState: (state: StateData) => void;
  onDataRefreshed?: () => void;
}) {
  return (
    <footer className="border-t border-border/80 bg-card/60 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                <Compass className="size-4" />
              </div>
              <span className="display-font text-xl font-bold tracking-tight text-foreground">
                Bhraman
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed">
              A cinematic editorial atlas dedicated to the extraordinary diversity of India. From ancient rock-cut temples and Himalayan cold deserts to secluded bioluminescent backwaters and tribal living root bridges.
            </p>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                Curated with <Heart className="size-3 text-red-400 fill-red-400" /> for conscious and curious travelers.
              </p>
              <SupabaseStatusIndicator onDataRefreshed={onDataRefreshed} />
            </div>
          </div>

          {/* Quick Regions */}
          <div className="space-y-3">
            <h4 className="display-font text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore by States
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {STATES_DATA.slice(0, 8).map((state) => (
                <li key={state.id}>
                  <button
                    onClick={() => onSelectState(state)}
                    className="hover:text-primary transition-colors truncate text-left"
                  >
                    {state.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Philosophy */}
          <div className="space-y-3">
            <h4 className="display-font text-sm font-semibold uppercase tracking-wider text-foreground">
              Field Ethos
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Leave no trace. Support local family-run homestays and regional master craftspeople. Respect sacred cultural rituals and biodiversity zones.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Bhraman. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-center">
            <span>India Travel Atlas</span>
            <span>Iconic & Offbeat</span>
            <span>Interactive Cartography</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
