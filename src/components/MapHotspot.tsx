import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Dispatch } from "@/data/dispatches";

const STATUS_STYLES: Record<Dispatch["status"], string> = {
  "en route": "bg-ember/20 text-ember-text border-ember/50",
  prepping: "bg-foreground/10 text-foreground border-border-strong",
  delivered: "bg-foreground/10 text-muted-foreground border-border-strong",
  matching: "bg-destructive/20 text-destructive-foreground border-destructive/60",
};

function StatusPill({ status }: { status: Dispatch["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${STATUS_STYLES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function Details({ d }: { d: Dispatch }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg leading-tight">{d.kitchen}</div>
          <div className="text-xs text-muted-foreground">{d.kitchenType}</div>
        </div>
        <StatusPill status={d.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 font-mono text-[11px]">
        <div>
          <dt className="text-muted-foreground uppercase tracking-wider">Neighborhood</dt>
          <dd className="mt-0.5 text-foreground">{d.neighborhood}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground uppercase tracking-wider">Meals</dt>
          <dd className="mt-0.5 text-foreground">{d.meals}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground uppercase tracking-wider">ETA</dt>
          <dd className="mt-0.5 text-ember-text">{d.eta}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground uppercase tracking-wider">Batch</dt>
          <dd className="mt-0.5 text-foreground">{d.id}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MapHotspot({ dispatch, index }: { dispatch: Dispatch; index: number }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const d = dispatch;
  const descId = `dispatch-desc-${d.id}`;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setHover(false);
          e.currentTarget.blur();
        }
      }}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-describedby={descId}
      aria-label={`Dispatch ${d.id}: ${d.kitchen}, ${d.neighborhood}. Open full ledger.`}
      className="group absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      style={{
        top: d.top,
        left: d.left,
        animation: `slideUp 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms both`,
      }}
    >
      <span id={descId} className="sr-only">
        {`${d.meals} meals from ${d.kitchen}, a ${d.kitchenType.toLowerCase()} in ${d.neighborhood}. Status ${d.status}, estimated arrival ${d.eta}. Funded by ${d.fundedBy}. Recipients: ${d.recipients}.`}
      </span>
      <span className="relative flex size-3.5 items-center justify-center">
        {d.status !== "delivered" && (
          <span className="absolute inset-0 rounded-full bg-ember animate-ember-ping" aria-hidden="true" />
        )}
        <span
          className={`absolute inset-0 rounded-full shadow-[0_0_18px_var(--ember-glow)] transition-transform group-hover:scale-150 ${
            d.status === "matching"
              ? "bg-destructive"
              : d.status === "delivered"
                ? "bg-foreground/70"
                : "bg-ember-glow"
          }`}
          aria-hidden="true"
        />
      </span>
    </button>
  );

  return (
    <>
      <HoverCard openDelay={80} closeDelay={80}>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent
          side="top"
          className="w-72 border-border-strong bg-popover text-popover-foreground"
        >
          <Details d={d} />
          <p className="mt-3 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Click for full ledger
          </p>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg border-border-strong bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl italic">
              Dispatch {d.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {d.meals} meals · {d.neighborhood} · {d.kitchen}
            </DialogDescription>
          </DialogHeader>

          <Details d={d} />

          <div className="mt-2 space-y-4 border-t border-border pt-4">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Ledger timeline
            </h4>
            <ol className="space-y-3">
              {d.timeline.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      s.done ? "bg-ember shadow-[0_0_10px_var(--ember-glow)]" : "bg-muted"
                    }`}
                    aria-hidden="true"
                  />
                  <span className={s.done ? "text-foreground" : "text-muted-foreground"}>
                    {s.label}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {s.time}
                  </span>
                  <span className="sr-only">{s.done ? "completed" : "pending"}</span>
                </li>
              ))}
            </ol>
          </div>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Funded by
              </dt>
              <dd className="mt-0.5">{d.fundedBy}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Recipients
              </dt>
              <dd className="mt-0.5">{d.recipients}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="mt-2 w-full bg-ember py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-ember-glow"
          >
            {d.status === "matching" ? "Complete this funding" : "Match this neighborhood"}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
