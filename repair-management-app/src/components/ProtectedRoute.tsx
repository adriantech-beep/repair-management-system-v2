import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  //  const auth = isAuthenticated();
  const auth = false;
  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
