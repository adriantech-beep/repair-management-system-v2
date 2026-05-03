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
import { LayoutDashboard, Users, Wrench, Settings } from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/api/authApi";
import useAuthStore from "@/store/authStore";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Repair Jobs", to: "/repairs", icon: Wrench },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();

  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

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
      <SidebarHeader>
        <span className="px-2 text-sm font-semibold">
          {state === "expanded" ? "Repair Management" : "RM"}
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to}>
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
