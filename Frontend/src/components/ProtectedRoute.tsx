// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    return isLoggedIn ? children : <Navigate to="/login" replace />;
}
