import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, Landmark, Sparkles } from "lucide-react";
import { searchAll } from "@/lib/search";
import { stateById } from "@/data/states";
import type { SearchResult, Place, StateData } from "@/types";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  placeholder,
  places,
  onSelectPlace,
  onSelectState,
}: {
  className?: string;
  placeholder?: string;
  places?: Place[];
  onSelectPlace?: (place: Place) => void;
  onSelectState?: (state: StateData) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const searchRes = searchAll(query, places);
      setResults(searchRes);
      setActiveIndex(searchRes.length > 0 ? 0 : -1);
    } else {
      setResults([]);
      setActiveIndex(-1);
    }
  }, [query, places]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    if (result.kind === "place" && result.place) {
      onSelectPlace?.(result.place);
    } else if (result.kind === "state" && result.state) {
      onSelectState?.(result.state);
    }
  };

  return (
    <div ref={boxRef} className={cn("relative w-full min-w-0", className)}>
      <div className="group flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-3.5 py-2 backdrop-blur-md transition-all focus-within:border-primary/70 focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/50 shadow-xs">
        <Search className="size-4 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : -1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : -1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const target = activeIndex >= 0 && results[activeIndex] ? results[activeIndex] : results[0];
              if (target) {
                handleSelect(target);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder || "Search places, states, Himalayan valleys, temples..."}
          aria-label="Search destinations in India"
          className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="rounded-full p-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <ul className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-96 min-w-0 w-full overflow-y-auto rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl backdrop-blur-2xl">
          {results.length === 0 ? (
            <li className="px-4 py-4 text-center text-sm text-muted-foreground">
              No matching destinations found for &ldquo;{query}&rdquo;.
            </li>
          ) : (
            results.map((result, idx) => {
              const isPlace = result.kind === "place";
              const state = isPlace && result.place ? stateById(result.place.state) : undefined;
              const isSelected = idx === activeIndex;

              return (
                <li key={`${result.kind}-${result.id}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left transition-colors cursor-pointer",
                      isSelected ? "bg-primary/10 text-primary-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          isPlace
                            ? result.place?.category === "hidden"
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-secondary text-foreground"
                            : "border-primary/30 bg-primary/15 text-primary"
                        )}
                      >
                        {isPlace ? (
                          result.place?.category === "hidden" ? (
                            <Sparkles className="size-4" />
                          ) : (
                            <Landmark className="size-4" />
                          )
                        ) : (
                          <MapPin className="size-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary font-semibold" : "text-foreground")}>
                          {result.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {isPlace ? state?.name || "India" : result.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-border/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      {isPlace
                        ? result.place?.category === "hidden"
                          ? "Hidden Gem"
                          : "Iconic"
                        : "State"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
