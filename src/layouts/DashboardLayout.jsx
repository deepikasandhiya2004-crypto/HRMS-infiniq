import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream font-gellix">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}