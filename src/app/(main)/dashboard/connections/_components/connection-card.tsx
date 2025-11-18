"use client";

import { useState } from "react";

import { CheckCircle2, ExternalLink, RefreshCw, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { SocialPlatform } from "./types";

interface ConnectionCardProps {
  platform: SocialPlatform;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

const PlatformIcon = ({ platform, className }: { platform: SocialPlatform; className?: string }) => (
  <div className={className} style={{ backgroundColor: platform.color }}>
    <span className="text-xs font-bold text-white">{platform.name.charAt(0)}</span>
  </div>
);

export function ConnectionCard({ platform, isConnected, onConnect, onDisconnect, onRefresh }: ConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (_err) {
      toast.error(`Failed to connect ${platform.name}`);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      toast.success(`${platform.name} disconnected successfully`);
    } catch (_err) {
      toast.error(`Failed to disconnect ${platform.name}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success(`${platform.name} connection refreshed`);
    } catch (_err) {
      toast.error(`Failed to refresh ${platform.name} connection`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="shadow-xs transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${platform.color}15` }}
            >
              <PlatformIcon platform={platform} className="size-6 rounded" />
            </div>
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>

              {isConnected && (
                <Badge variant="outline" className="mt-1 gap-1 text-xs">
                  <CheckCircle2 className="size-3 text-green-600" />
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>

        <CardDescription className="mt-2">{platform.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected && platform.connectedAccount ? (
          <>
            <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-8">
                <AvatarImage
                  src={platform.connectedAccount.profileImage ?? undefined}
                  alt={platform.connectedAccount.username}
                />
                <AvatarFallback>{platform.connectedAccount.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{platform.connectedAccount.username}</p>
                <p className="text-muted-foreground text-xs">Connected {platform.connectedAccount.connectedAt}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Refresh
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect {platform.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to disconnect your {platform.name}
                      account? You&apos;ll need to reconnect it to schedule posts to this platform.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDisconnect}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted/20 rounded-lg border border-dashed p-4 text-center">
              <AlertCircle className="text-muted-foreground mx-auto mb-2 size-6" />
              <p className="text-muted-foreground text-sm">Not connected</p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                backgroundColor: isConnecting ? undefined : platform.color,
              }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  Connect {platform.name}
                </>
              )}
            </Button>
          </>
        )}

        <div className="border-t pt-2">
          <a
            href={platform.developerPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
          >
            <ExternalLink className="size-3" />
            <span>{platform.apiName} Documentation</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
