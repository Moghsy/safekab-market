import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";
import { useAuth } from "@/context/AuthContext";

const AdminRoute = () => {
  const { user, loading, getIsAdmin } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || !getIsAdmin()) {
    if (user) {
      return <Navigate to="/" />;
    }
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoute;
