import { Outlet } from "react-router-dom";
import SidebarLayout from "./SidebarLayout";

const AdminLayout = () => {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
};

export default AdminLayout;
