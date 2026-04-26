import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
