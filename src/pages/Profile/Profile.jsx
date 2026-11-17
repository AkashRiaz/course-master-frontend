import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { getMe } from "../../services/auth.api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getMe();
        if (active) setProfile(response.data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your profile. Please sign in again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center p-4">
        <div className="alert alert-error shadow-lg">
          <span>{error || "Profile not found."}</span>
          <Link className="btn btn-sm" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">
        <div className="h-28 bg-gradient-to-r from-primary to-secondary sm:h-36" />
        <div className="px-5 pb-7 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-base-100 bg-primary text-3xl font-bold text-primary-content shadow-lg sm:h-28 sm:w-28">
                {initials || "U"}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-base-content sm:text-3xl">
                  {profile.name}
                </h1>
                <p className="text-sm text-base-content/65">{profile.email}</p>
              </div>
            </div>
            <span className="badge badge-primary badge-lg w-fit gap-2 capitalize">
              <ShieldCheck className="h-4 w-4" />
              {profile.role}
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/55">
                    Email address
                  </p>
                  <p className="mt-1 break-all font-medium text-base-content">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/55">
                    Member since
                  </p>
                  <p className="mt-1 font-medium text-base-content">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-base-300 p-4">
            <UserRound className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-base-content">Account status</p>
              <p className="text-sm text-base-content/65">
                {profile.isBanned ? "Access is currently restricted." : "Your account is active."}
              </p>
            </div>
            <span
              className={`ml-auto badge ${profile.isBanned ? "badge-warning" : "badge-success"}`}
            >
              {profile.isBanned ? "Banned" : "Active"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
