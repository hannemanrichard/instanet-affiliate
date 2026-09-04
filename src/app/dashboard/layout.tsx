import React from "react";
import { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AffiliateSidebar } from "@/shared/components";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { MobileDashboardTopNav } from "@/shared/components/layout/MobileDashboardTopNav";
import { MobileTabBar } from "@/shared/components/layout/MobileTabBar";

export const metadata: Metadata = {
  title: "Dashboard | Instanet",
  description: "Affiliate marketing platform dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AffiliateSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <DashboardHeader />
        <MobileDashboardTopNav />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:px-4 md:pb-6 md:pt-4">
          {children}
        </main>
        <MobileTabBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
