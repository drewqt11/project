import type React from "react";

// This layout can be expanded later if the dashboard needs a specific sidebar or other persistent UI elements
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 