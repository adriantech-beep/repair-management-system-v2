import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, PlusCircle, Users, Wrench, Settings, LogOut } from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/api/authApi";
import useAuthStore from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getTenantSettings } from "@/api/tenantApi";

const navItems = [
  { label: "Create SO", to: "/service-orders/new", icon: PlusCircle },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Repair Jobs", to: "/repair-jobs", icon: Wrench },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Inventory", to: "/inventory", icon: Wrench },
  { label: "Users", to: "/users", icon: Users, adminOnly: true },
  { label: "Settings", to: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAdmin = user?.role === "Admin";
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const { data: tenant } = useQuery({
    queryKey: ["tenantSettings"],
    queryFn: getTenantSettings,
  });

  const handleLogout = async () => {
    try {
      if (accessToken && refreshToken) {
        await logout(accessToken, refreshToken);
      }
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border py-3 px-4">
        {state === "expanded" ? (
          <div className="flex items-center gap-3">
            {tenant?.logoUrl ? (
              <img 
                src={tenant.logoUrl} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-contain bg-white dark:bg-zinc-950 p-1 border border-sidebar-border shadow-xs"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {tenant?.companyName ? tenant.companyName.substring(0, 2).toUpperCase() : "RM"}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-sidebar-foreground truncate leading-tight">
                {tenant?.companyName ?? "Repair Management"}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 truncate leading-none mt-0.5">
                {tenant?.subdomain}.atechlabs.it.com
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {tenant?.logoUrl ? (
              <img 
                src={tenant.logoUrl} 
                alt="Logo" 
                className="h-7 w-7 rounded-lg object-contain bg-white dark:bg-zinc-950 p-1 border border-sidebar-border shadow-xs"
              />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                {tenant?.companyName ? tenant.companyName.substring(0, 2).toUpperCase() : "RM"}
              </div>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to}>
                  {({ isActive }) => (
                    <SidebarMenuButton 
                      isActive={isActive}
                      className={isActive ? "bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold" : ""}
                    >
                      <item.icon className={isActive ? "text-indigo-600 dark:text-indigo-400" : ""} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-650 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-all font-medium cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
