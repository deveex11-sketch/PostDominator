"use client";

import { AppSidebar } from "./app-sidebar";

/**
 * Client-side wrapper for AppSidebar to prevent hydration mismatches
 */
export function ClientSidebarWrapper(props: React.ComponentProps<typeof AppSidebar>) {
  return <AppSidebar {...props} />;
}

