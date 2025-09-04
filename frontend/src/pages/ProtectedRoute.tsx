import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoute;