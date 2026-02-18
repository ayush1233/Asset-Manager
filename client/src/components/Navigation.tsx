import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  List, 
  Search, 
  PlusCircle, 
  LayoutDashboard,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/companies", icon: Building2, label: "Companies" },
    { href: "/lists", icon: List, label: "Lists" },
    { href: "/saved-searches", icon: Search, label: "Saved Searches" },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-50 border-r border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            ScoutFlow
          </span>
        </div>

        <Link href="/companies/new">
          <Button className="w-full justify-start gap-2 shadow-md mb-6" size="lg">
            <PlusCircle className="h-4 w-4" />
            New Company
          </Button>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "bg-white text-primary shadow-sm ring-1 ring-border" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 rounded-lg hover:text-slate-900 hover:bg-white/50 cursor-pointer transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-40">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function Header({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-slate-900">{title}</h1>
        <div className="flex items-center gap-4">
          {children}
          <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
        </div>
      </div>
    </header>
  );
}
