import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { getToken, clearToken } from "../../utils/auth";
import { getMe } from "../../services/auth.api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const [me, setMe] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? "font-semibold text-primary underline decoration-2 underline-offset-8"
        : "text-base-content/80 hover:text-primary"
    }`;

  const handleLogout = () => {
    clearToken();
    setMe(null);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return setMe(null);
      try {
        const res = await getMe();
        setMe(res.data);
      } catch {
        clearToken();
        setMe(null);
      }
    };
    loadMe();
  }, [token]);

  const initials = me?.name
    ? me.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  const portalPath = me?.role === "admin" ? "/admin" : "/student";
  const portalLabel = me?.role === "admin" ? "Admin Portal" : "Student Portal";

  return (
    <>
    <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur border-b border-base-300">
      <div className="navbar max-w-6xl mx-auto px-2">
        {/* LEFT: Logo */}
        <div className="navbar-start">
          <Logo />
        </div>

        {/* CENTER: Desktop menu */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal gap-1">
            <li>
              <NavLink className={navLinkClass} to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClass} to="/courses" end>
                Courses
              </NavLink>
            </li>

            {/* Show only the authenticated user's role-specific portal */}
            {token && me ? (
              <li>
                <NavLink className={navLinkClass} to={portalPath}>
                  {portalLabel}
                </NavLink>
              </li>
            ) : null}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="navbar-end gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop buttons if NOT logged in */}
          {!token && (
            <div className="hidden md:flex gap-2">
              <Link to="/login" className="btn btn-sm btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Desktop avatar if logged in */}
          {token && me && (
            <div className="hidden md:block dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                  {initials}
                </div>
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content mt-3 w-64 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl"
              >
                <div className="px-2 pb-2">
                  <p className="font-semibold">{me.name}</p>
                  <p className="text-sm text-base-content/70">{me.email}</p>
                  <p className="text-xs badge badge-outline mt-2">{me.role}</p>
                </div>

                <div className="my-2 border-t border-base-300" />

                <li>
                  <Link
                    to={portalPath}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold hover:bg-primary/10 hover:text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>{portalLabel}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold hover:bg-primary/10 hover:text-primary"
                  >
                    <UserRound className="h-4 w-4 text-primary" />
                    <span>My Profile</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold !text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="dropdown dropdown-end md:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>

            <ul
              tabIndex={0}
              className="
                menu menu-sm dropdown-content mt-3 p-3 shadow
                bg-base-100 rounded-box w-56 border border-base-300
                items-center text-center                 overflow-hidden
              "
            >
              <li>
                <NavLink className={navLinkClass} to="/" end>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink className={navLinkClass} to="/courses" end>
                  Courses
                </NavLink>
              </li>

              {token && me && (
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `${navLinkClass({ isActive })} flex items-center gap-2`
                    }
                    to={portalPath}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {portalLabel}
                  </NavLink>
                </li>
              )}

              <div className="my-2 w-full border-t border-base-300" />

              {!token ? (
                <>
                  <li className="w-full">
                    <Link to="/login" className="btn btn-ghost btn-sm w-full">
                      Login
                    </Link>
                  </li>
                  <li className="w-full">
                    <Link
                      to="/register"
                      className="btn btn-primary btn-sm w-full"
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-base-300 bg-base-200/60 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-content shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-base-content">
                          {me?.name || "Account"}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{me?.email || "No email available"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-base-300 pt-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-base-content/70">
                        <UserRound className="h-3.5 w-3.5" />
                        Account
                      </span>
                      <span className="badge badge-primary badge-sm gap-1 font-semibold capitalize">
                        <ShieldCheck className="h-3 w-3" />
                        {me?.role || "member"}
                      </span>
                    </div>
                  </div>

                  <div className="my-2 w-full border-t border-base-300" />

                  <li className="w-full">
                    <Link
                      to={portalPath}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-primary/10"
                    >
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      <span>{portalLabel}</span>
                    </Link>
                  </li>

                  <li className="w-full">
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-primary/10"
                    >
                      <UserRound className="h-5 w-5 text-primary" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li className="w-full">
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold !text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
    {showLogoutModal &&
      createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border-2 border-red-100 bg-white p-6 text-slate-900 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 !text-slate-500 hover:bg-slate-100 hover:!text-slate-900"
              aria-label="Close logout dialog"
              onClick={() => setShowLogoutModal(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-slate-200 pb-5 pr-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <LogOut className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                    Account action
                  </p>
                  <h2
                    id="logout-dialog-title"
                    className="mt-1 text-2xl font-bold text-slate-900"
                  >
                    Sign out of your account?
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                You are about to sign out as{" "}
                <span className="font-semibold text-slate-900">
                  {me?.name || "this account"}
                </span>
                . Choose an option below to continue.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-content">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {me?.name || "Your account"}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {me?.email || "Signed-in account"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                What happens next?
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-5 text-amber-900">
                <li>• Your current session will end on this device.</li>
                <li>• You will return to the home page.</li>
                <li>• You can sign in again whenever you are ready.</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="btn btn-outline w-full border-slate-300 !text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:!text-slate-900"
                onClick={() => setShowLogoutModal(false)}
              >
                Stay signed in
              </button>
              <button
                type="button"
                className="btn btn-error w-full"
                onClick={handleLogout}
              >
                Confirm sign out
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
