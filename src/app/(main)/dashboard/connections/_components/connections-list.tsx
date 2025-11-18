"use client";

import { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SocialConnection, SupportedPlatform } from "@/types/oauth";

import { ConnectionCard } from "./connection-card";
import type { SocialPlatform } from "./types";

const platforms: SocialPlatform[] = [
  // ... same mock data
];

export function ConnectionsList() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (success === "true") {
      toast.success("Account connected successfully!");
      fetchConnections();
    } else if (error) {
      toast.error(message ?? "Connection failed. Please try again.");
    }
  }, [searchParams]);

  const handleConnect = async (platformId: SupportedPlatform) => {
    window.location.href = `/api/auth/${platformId}`;
  };

  const handleDisconnect = async (platformId: SupportedPlatform) => {
    try {
      const response = await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });

      if (response.ok) {
        const platformName = platforms.find((p) => p.id === platformId)?.name ?? "Account";
        toast.success(`${platformName} disconnected successfully`);
        fetchConnections();
      } else {
        toast.error("Failed to disconnect account");
      }
    } catch (err) {
      console.error("Disconnect error:", err);
      toast.error("Failed to disconnect account");
    }
  };

  const handleRefresh = async () => {
    toast.info("Token refresh coming soon");
  };

  const connectedPlatforms = new Set(connections.map((c) => c.platform));
  const connectedCount = connectedPlatforms.size;
  const totalCount = platforms.length;

  const getConnectionForPlatform = (platformId: SupportedPlatform) =>
    connections.find((c) => c.platform === platformId);

  return (
    <div className="space-y-6">
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your social media account connections</CardDescription>
            </div>

            {connectedCount > 0 && (
              <Badge variant="outline" className="gap-2">
                <CheckCircle2 className="size-3" />
                {connectedCount} of {totalCount} connected
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-muted-foreground text-sm">
            {connectedCount === 0 ? (
              <p>No accounts connected yet. Connect your first account to get started.</p>
            ) : (
              <p>
                You have {connectedCount} {connectedCount === 1 ? "account" : "accounts"} connected. Connect more
                platforms to expand your reach.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <Card key={p.id} className="animate-pulse">
              <CardContent className="p-6">
                <div className="bg-muted h-20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => {
            const connection = getConnectionForPlatform(platform.id);
            return (
              <ConnectionCard
                key={platform.id}
                platform={{
                  ...platform,
                  isConnected: connectedPlatforms.has(platform.id),
                  connectedAccount:
                    connection != null
                      ? {
                          username: connection.platformUsername ?? connection.platformUserId,
                          profileImage: connection.platformProfileImage,
                          connectedAt: new Date(connection.connectedAt).toLocaleDateString(),
                        }
                      : undefined,
                }}
                isConnected={connectedPlatforms.has(platform.id)}
                onConnect={() => handleConnect(platform.id)}
                onDisconnect={() => handleDisconnect(platform.id)}
                onRefresh={() => handleRefresh()}
              />
            );
          })}
        </div>
      )}

      <Card className="border-dashed shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Having trouble connecting an account? Check our documentation or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-primary hover:underline">
              View Connection Guide →
            </a>
            <a href="#" className="text-primary hover:underline">
              Troubleshooting Tips →
            </a>
            <a href="#" className="text-primary hover:underline">
              Contact Support →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
