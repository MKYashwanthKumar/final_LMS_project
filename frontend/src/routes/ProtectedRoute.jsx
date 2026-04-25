import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleBasePaths } from "../data/dashboardData";

const ProtectedRoute = ({ roles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-loader">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={roleBasePaths[user.role]} replace />;
  }

  return children;
};

export default ProtectedRoute;