import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const RoleGuard = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default RoleGuard;
