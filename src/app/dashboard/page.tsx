import React from "react";
import { Metadata } from "next";
import { DashboardHomeView } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Overview | Instanet",
  description: "View your affiliate marketing performance overview",
};

const DashboardPage = () => {
  return <DashboardHomeView />;
};

export default DashboardPage;
