import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getMe } from "../../../services/auth.api";
import AdminRoute from "../../../routes/AdminRoute";
import AdminSidebar from "./AdminSidebar";
// import AdminSidebar from "./components/AdminSidebar";
// import { useEffect, useState } from "react";
// import { getToken } from "../../utils/auth";
// import { getMe } from "../../services/auth.api";
// import AdminRoute from "../../routes/AdminRoute";

export default function AdminDashboard() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        const loadMe = async () => {
            try {
                const res = await getMe();
                setMe(res.data);
            } catch (err) {
                console.error("Failed to load user:", err);
                setAuthError(true);
            } finally {
                setLoading(false);
            }
        };
        loadMe();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (authError || !me) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="alert alert-error max-w-lg shadow-lg">
                    <div>
                        <h2 className="font-bold">Admin session expired</h2>
                        <p className="text-sm">
                            Please sign in again with a valid administrator account.
                        </p>
                    </div>
                    <a className="btn btn-sm" href="/login">
                        Sign in
                    </a>
                </div>
            </div>
        );
    }

    return (
        <AdminRoute me={me}>
            {/* full width override */}
            <div className="w-full max-w-none flex flex-col lg:flex-row min-h-[80vh]">

                {/* sidebar - hidden on mobile, shown via drawer */}
                <div className="hidden lg:block shrink-0">
                    <AdminSidebar />
                </div>

                {/* Mobile drawer toggle button */}
                <div className="lg:hidden">
                    <AdminSidebar />
                </div>

                {/* content area */}
                <main className="min-w-0 flex-1 p-2 pt-16 sm:p-4 sm:pt-16 lg:p-5 lg:pt-5 bg-base-100 w-full">
                    <Outlet />
                </main>

            </div>
        </AdminRoute>
    );
}
