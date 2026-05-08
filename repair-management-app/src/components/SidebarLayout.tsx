import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex justify-between">
          <SidebarTrigger />
          <AppHeader />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
