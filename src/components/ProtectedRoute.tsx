import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkAdminAuth } from "../services/auth";
import { Loader2 } from "lucide-react";
import HeartLoader from "./HeartLoader";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = checkAdminAuth();
            setIsAuthenticated(authStatus);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <HeartLoader text="جاري التحقق..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
