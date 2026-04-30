import { NavLink } from "react-router-dom";
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

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Repair Jobs", to: "/repairs", icon: Wrench },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();

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
        <NavLink to="/logout">
          {({ isActive }) => (
            <SidebarMenuButton isActive={isActive}>
              <span>Logout</span>
            </SidebarMenuButton>
          )}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
