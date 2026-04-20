"use client";

import Link from "next/link";
import { Check, MessageSquare, X } from "lucide-react";

export interface RequestUser {
  id: string;
  name: string;
  avatar_url?: string | null;
}

export interface Request {
  id: string;
  status: "pending" | "accepted" | "rejected";
  from_user?: RequestUser;
  to_user?: RequestUser;
  created_at: string;
}

interface RequestCardProps {
  request: Request;
  type: "incoming" | "outgoing";
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

export function RequestCard({ request, type, onAccept, onReject, onCancel }: RequestCardProps) {
  const user = type === "incoming" ? request.from_user : request.to_user;
  if (!user) return null;

  const userName = user.name || "User";
  const initial = userName.charAt(0).toUpperCase() || "U";

  const statusTone: Record<string, string> = {
    pending: "text-muted-foreground",
    accepted: "text-[color-mix(in_oklch,var(--mint)_95%,white)]",
    rejected: "text-muted-foreground",
  };

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]">
      <Link
        href={`/users/${user.id}`}
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-sm font-semibold text-white"
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt={userName} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${user.id}`}
          className="text-[15px] font-medium text-foreground transition-colors hover:text-ember-gradient"
        >
          {userName}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {type === "incoming" ? "Wants to connect with you" : "You sent a request"}
          <span className="mx-1.5">·</span>
          <span className="font-mono tabular-nums">{timeAgo(request.created_at)}</span>
          <span className="mx-1.5">·</span>
          <span className={`capitalize ${statusTone[request.status]}`}>{request.status}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {type === "incoming" && request.status === "pending" && onAccept && onReject && (
          <>
            <button
              onClick={() => onReject(request.id)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
              aria-label="Reject"
            >
              <X size={14} />
            </button>
            <button
              onClick={() => onAccept(request.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-3.5 text-xs font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
            >
              <Check size={13} />
              Accept
            </button>
          </>
        )}
        {type === "outgoing" && request.status === "pending" && onCancel && (
          <button
            onClick={() => onCancel(request.id)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 text-xs text-destructive transition-colors hover:bg-destructive/20"
          >
            Cancel
          </button>
        )}
        {request.status === "accepted" && (
          <Link
            href="/chat"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 text-xs text-foreground transition-colors hover:bg-white/[0.08]"
          >
            <MessageSquare size={13} />
            Chat
          </Link>
        )}
      </div>
    </div>
  );
}
