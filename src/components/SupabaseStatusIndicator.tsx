import { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Sparkles, X, ExternalLink } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { destinationService } from "@/services/destinationService";
import { cn } from "@/lib/utils";

const SUPABASE_SCHEMA_SQL = `-- 1. Create the destinations table in Supabase SQL Editor
create table if not exists destinations (
  id text primary key,
  name text not null,
  state text not null,
  category text not null check (category in ('iconic', 'hidden')),
  short_desc text,
  why_visit text,
  best_time_to_visit text,
  how_to_reach text,
  entry_info text,
  traveler_tip text,
  tags jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  image_attributions jsonb default '[]'::jsonb,
  coordinates jsonb default '{"lat": 20.5937, "lng": 78.9629}'::jsonb,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
alter table destinations enable row level security;

-- 3. Allow public read access
create policy "Allow public read access to destinations"
  on destinations for select
  using (true);

-- 4. Allow public write access (enables app migration & destination inserts)
create policy "Allow public write to destinations"
  on destinations for all
  using (true)
  with check (true);`;

const RLS_POLICY_SQL = `create policy "Allow public write to destinations" on destinations for all using (true) with check (true);`;

export function SupabaseStatusIndicator({ onDataRefreshed }: { onDataRefreshed?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
    count: number;
    error?: string;
  }>({
    configured: isSupabaseConfigured(),
    connected: false,
    count: 0,
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedRls, setCopiedRls] = useState(false);
  const [copiedFullMigration, setCopiedFullMigration] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setSeedResult(null);
    const result = await destinationService.checkSupabaseStatus();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyRls = async () => {
    try {
      await navigator.clipboard.writeText(RLS_POLICY_SQL);
      setCopiedRls(true);
      setTimeout(() => setCopiedRls(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyFullMigration = async () => {
    try {
      const res = await fetch("/api/supabase/migration-sql");
      const sqlText = await res.text();
      await navigator.clipboard.writeText(sqlText);
      setCopiedFullMigration(true);
      setTimeout(() => setCopiedFullMigration(false), 2500);
    } catch {
      // fallback: open in new tab
      window.open("/api/supabase/migration-sql", "_blank");
    }
  };

  const handleSeedDestinations = async () => {
    setSeeding(true);
    setSeedResult(null);
    const result = await destinationService.migrateExistingDestinations({ force: true });
    setSeeding(false);
    if (result.success) {
      setSeedResult({
        success: true,
        message: `Successfully migrated ${result.count} of ${result.total} destinations into your Supabase table! All pages, search, and filters now reflect your live Supabase data.`,
      });
      await checkStatus();
      if (onDataRefreshed) onDataRefreshed();
    } else {
      setSeedResult({
        success: false,
        message: result.error || "Failed to migrate destinations.",
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        title="View Supabase Database Integration Status"
      >
        <Database className="size-3 text-primary" />
        <span>
          Supabase:{" "}
          <strong
            className={cn(
              "font-semibold",
              status.connected
                ? "text-emerald-500"
                : status.configured
                ? "text-amber-500"
                : "text-muted-foreground"
            )}
          >
            {status.connected
              ? `Connected (${status.count} places)`
              : status.configured
              ? "Configured (Awaiting Table)"
              : "Ready"}
          </strong>
        </span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            status.connected
              ? "bg-emerald-500 animate-pulse"
              : status.configured
              ? "bg-amber-500"
              : "bg-muted-foreground/50"
          )}
        />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/90 bg-card p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="display-font text-xl font-bold text-foreground">
                    Supabase Database Integration
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Seamless destination retrieval from Supabase with instant fallback
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Current Status Card */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connection Health
                </span>
                <button
                  onClick={checkStatus}
                  disabled={checking}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn("size-3", checking && "animate-spin")} />
                  <span>{checking ? "Checking..." : "Test Connection"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-card p-3 border border-border/60">
                  <span className="text-muted-foreground block text-[10px] uppercase">Environment</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-1">
                    {status.configured ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        Variables Set
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3.5 text-amber-500" />
                        Unset (Fallback Active)
                      </>
                    )}
                  </span>
                </div>

                <div className="rounded-lg bg-card p-3 border border-border/60">
                  <span className="text-muted-foreground block text-[10px] uppercase">Table &lsquo;destinations&rsquo;</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-1">
                    {status.connected ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        Accessible
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3.5 text-muted-foreground" />
                        {status.error ? "Check Schema" : "Local Baseline"}
                      </>
                    )}
                  </span>
                </div>

                <div className="rounded-lg bg-card p-3 border border-border/60">
                  <span className="text-muted-foreground block text-[10px] uppercase">Rows Retrieved</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-1 font-mono">
                    <Database className="size-3 text-primary" />
                    {status.connected ? `${status.count} Places` : "80+ Built-in"}
                  </span>
                </div>
              </div>

              {status.error && (
                <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{status.error}</span>
                </div>
              )}
            </div>

            {/* Live Data Active Banner */}
            {status.connected && status.count > 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-500 block">Supabase Destinations Active</span>
                  <span className="text-muted-foreground">
                    {status.count} curated destinations are actively loaded from your live Supabase database across all cards, filters, and search.
                  </span>
                </div>
              </div>
            )}

            {/* Zero Rows Migration Guide Banner */}
            {status.connected && status.count === 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-amber-500 block text-sm">
                      Table &lsquo;destinations&rsquo; is ready (0 rows)
                    </span>
                    <p className="text-muted-foreground">
                      Your Supabase table has been verified. To populate all 83 destinations into Supabase, you can click <strong>Migrate to Supabase</strong> below.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSeedDestinations}
                    disabled={seeding}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={cn("size-3.5", seeding && "animate-spin")} />
                    <span>{seeding ? "Migrating..." : "1-Click Migrate (83 Places)"}</span>
                  </button>

                  <button
                    onClick={handleCopyRls}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-all cursor-pointer"
                    title="Copy Row-Level Security write policy SQL"
                  >
                    {copiedRls ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        RLS Policy Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        Copy RLS Write Policy
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyFullMigration}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-all cursor-pointer"
                    title="Copy complete 83-destination PostgreSQL INSERT script"
                  >
                    {copiedFullMigration ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        Migration SQL Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        Copy Full 83 Places SQL
                      </>
                    )}
                  </button>

                  <a
                    href="/api/supabase/migration-sql"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
                  >
                    <ExternalLink className="size-3" />
                    <span>View SQL File</span>
                  </a>
                </div>

                {seedResult && (
                  <p
                    className={cn(
                      "text-xs pt-1 font-medium",
                      seedResult.success ? "text-emerald-500" : "text-amber-500"
                    )}
                  >
                    {seedResult.message}
                  </p>
                )}
              </div>
            )}

            {/* Quick Setup Guide & SQL Schema */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Supabase SQL Schema &amp; Policies
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Run this in your Supabase SQL Editor if you need to create or verify the table and policies:
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy Schema SQL
                    </>
                  )}
                </button>
              </div>

              <pre className="rounded-xl border border-border/80 bg-background/90 p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-44 scrollbar-thin">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>

            {/* Close button */}
            <div className="flex items-center justify-end pt-2 border-t border-border/60">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
