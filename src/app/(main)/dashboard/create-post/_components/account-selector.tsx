"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostStore } from "./post-store";

const ACCOUNTS = [
  { id: "facebook", name: "Facebook", color: "bg-[#1877F2]" },
  { id: "instagram", name: "Instagram", color: "bg-gradient-to-br from-purple-600 to-pink-500" },
  { id: "linkedin", name: "LinkedIn", color: "bg-[#0077B5]" },
  { id: "tiktok", name: "TikTok", color: "bg-[#000000]" },
  { id: "reddit", name: "Reddit", color: "bg-[#FF4500]" },
  { id: "x", name: "X", color: "bg-[#000000]" },
  { id: "youtube", name: "YouTube", color: "bg-[#FF0000]" },
] as const;

export function AccountSelector() {
  const { selectedAccounts, toggleAccount } = usePostStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACCOUNTS.map((account) => {
        const isSelected = selectedAccounts.includes(account.id);
        return (
          <button
            key={account.id}
            type="button"
            onClick={() => toggleAccount(account.id)}
            className={cn(
              "group relative flex size-12 items-center justify-center rounded-full border-2 transition-all hover:scale-105",
              isSelected
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-input hover:border-primary/50"
            )}
            title={account.name}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-xs font-semibold uppercase text-white",
                account.color
              )}
            >
              {account.id[0]}
            </div>
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary">
                <div className="size-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        );
      })}
      
      {/* Connect Account Button */}
      <button
        type="button"
        className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-input transition-colors hover:border-primary hover:bg-primary/5"
        title="Connect Account"
      >
        <Plus className="text-muted-foreground size-5" />
      </button>
    </div>
  );
}
