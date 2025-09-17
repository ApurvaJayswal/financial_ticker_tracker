import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  LayoutDashboard, 
  Plus,
  BarChart3, 
  Globe,
  Bell,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Add Ticker",
    url: createPageUrl("AddTicker"),
    icon: Plus,
  },
  {
    title: "Market Analysis",
    url: createPageUrl("MarketAnalysis"),
    icon: BarChart3,
  },
  {
    title: "News Center",
    url: createPageUrl("NewsCenter"),
    icon: Globe,
  },
  {
    title: "Alerts",
    url: createPageUrl("Alerts"),
    icon: Bell,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Sidebar className="border-r border-slate-700/50 backdrop-blur-sm bg-slate-800/30">
          <SidebarHeader className="border-b border-slate-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  TickerTracker
                </h2>
                <p className="text-xs text-slate-400 font-medium">AI Financial Analysis</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-3">
                Market Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r hover:from-blue-900/50 hover:to-cyan-900/50 hover:text-blue-300 transition-all duration-300 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-800/50 to-cyan-800/50 text-blue-300 shadow-sm border border-blue-700/50' 
                            : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 font-medium">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-3">
                Market Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 font-medium">Markets Open</span>
                    <span className="ml-auto text-emerald-400 font-bold text-xs">LIVE</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 font-medium">Tracked</span>
                    <span className="ml-auto font-bold text-slate-100">0</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300 font-medium">Alerts</span>
                    <span className="ml-auto font-bold text-amber-400">0</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">T</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 text-sm truncate">Trader</p>
                <p className="text-xs text-slate-400 truncate">Financial Analyst</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200 text-slate-300" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                TickerTracker
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}