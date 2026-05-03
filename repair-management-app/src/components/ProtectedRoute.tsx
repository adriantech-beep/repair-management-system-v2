import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const auth = Boolean(accessToken);

  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
