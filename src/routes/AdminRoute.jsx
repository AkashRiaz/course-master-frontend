import { Navigate } from "react-router-dom";

export default function AdminRoute({ children, me }) {
    if (!me) return <Navigate to="/login" replace />;
    if (me.role !== "admin") return <Navigate to="/student" replace />;
    return children;
}
