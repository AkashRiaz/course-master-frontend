import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { getMeAsync } from "../store/slices/authSlice";
import { fetchMyEnrollments } from "../store/slices/enrollmentSlice";

export default function MainLayout() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const isAdminRoute = location.pathname.startsWith("/admin");

    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(getMeAsync());
        }
    }, [token, isAuthenticated, dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchMyEnrollments());
        }
    }, [isAuthenticated, dispatch]);

    return (
        <div className="min-h-screen flex flex-col">
            {!isAdminRoute && <Navbar />}

            <main
                className={`flex-1 w-full ${isAdminRoute
                    ? "max-w-none px-0 py-0"
                    : "max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4"
                    }`}
            >
                <Outlet />
            </main>

            {!isAdminRoute && <Footer />}
        </div>
    );
}
