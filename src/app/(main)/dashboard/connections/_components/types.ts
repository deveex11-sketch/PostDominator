import type { SupportedPlatform } from "@/types/oauth";

export interface SocialPlatform {
  id: SupportedPlatform;
  name: string;
  icon: string; // Icon name from lucide-react or simple-icons
  color: string;
  description: string;
  isConnected: boolean;
  connectedAccount?: {
    username: string;
    profileImage?: string;
    connectedAt: string;
  };
  apiName: string; // For API reference
  developerPortal: string;
}
