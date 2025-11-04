"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostStore } from "./post-store";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-gradient-to-br from-purple-600 to-pink-500",
  linkedin: "bg-[#0077B5]",
  tiktok: "bg-[#000000]",
  reddit: "bg-[#FF4500]",
  x: "bg-[#000000]",
  youtube: "bg-[#FF0000]",
};

const PLATFORM_NAMES: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  reddit: "Reddit",
  x: "X",
  youtube: "YouTube",
};

export function PostPreviewPanel() {
  const { selectedAccounts, content, mediaFile, firstComment, scheduledDate, isDraft } = usePostStore();
  const hasSelectedAccounts = selectedAccounts.length > 0;

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Post Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSelectedAccounts ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-sm">
              Select accounts to see preview
            </p>
          </div>
        ) : (
          selectedAccounts.map((account) => (
            <div
              key={account}
              className="space-y-4 rounded-lg border bg-card p-4"
            >
              {/* Platform Header */}
              <div className="flex items-center gap-3 border-b pb-3">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-white",
                    PLATFORM_COLORS[account] || "bg-muted"
                  )}
                >
                  <span className="text-xs font-semibold uppercase">
                    {account[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {PLATFORM_NAMES[account] || account}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    @youraccount • Just now
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>

              {/* Post Content */}
              {content && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {content}
                </div>
              )}

              {/* Media Preview */}
              {mediaFile && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {mediaFile.type.startsWith("image/") ? (
                    <div className="relative size-full">
                      <Image
                        src={URL.createObjectURL(mediaFile)}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <div className="text-center">
                        <p className="text-muted-foreground text-sm font-medium">
                          Video Preview
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {mediaFile.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* First Comment Preview */}
              {firstComment && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    First Comment:
                  </p>
                  <p className="text-sm">{firstComment}</p>
                </div>
              )}

              {/* Interaction Icons */}
              <div className="flex items-center gap-4 border-t pt-3">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="size-4" />
                  <span className="text-xs">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="size-4" />
                  <span className="text-xs">Comment</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="size-4" />
                  <span className="text-xs">Share</span>
                </Button>
              </div>
            </div>
          ))
        )}

        {/* Status Badge */}
        {(scheduledDate || isDraft) && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-muted-foreground mb-1 text-xs font-medium">Status:</p>
            {scheduledDate && (
              <p className="text-sm font-semibold">
                Scheduled for {new Date(scheduledDate).toLocaleString()}
              </p>
            )}
            {isDraft && (
              <p className="text-sm font-semibold">Saved as draft</p>
            )}
          </div>
        )}

        {hasSelectedAccounts && selectedAccounts.length > 1 && (
          <p className="text-muted-foreground text-center text-xs">
            Preview shown for {selectedAccounts.length} platform
            {selectedAccounts.length > 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
