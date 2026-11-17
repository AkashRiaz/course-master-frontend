import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  toggleBanUser,
} from "../../../services/admin.api";
import { useSelector } from "react-redux";
import {
  Trash2,
  Shield,
  ShieldOff,
  Ban,
  Unlock,
  MoreVertical,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // userId that's being acted upon
  const [showActions, setShowActions] = useState(null); // userId for which actions menu is shown
  const [actionMenuPosition, setActionMenuPosition] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const loadCurrentUser = async () => {
      try {
        const { getMe } = await import("../../../services/auth.api");
        const res = await getMe();
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to load current user:", err);
      }
    };
    loadCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showActions) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      const dropdown = target.closest(".dropdown");
      const menu = target.closest("[data-user-actions-menu]");

      if (!dropdown && !menu) {
        setShowActions(null);
        setActionMenuPosition(null);
      }
    };

    // Use a small delay to allow button clicks to register
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showActions]);

  const handleDelete = async (userId, userName) => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await deleteUser(userId);
      if (response.status >= 200 && response.status < 300) {
        const message = `User "${userName}" deleted successfully`;
        setSuccess(message);
        toast.success(message);
      }
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete user";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleMakeAdmin = async (userId, userName) => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await updateUserRole(userId, "admin");
      if (response.status >= 200 && response.status < 300) {
        const message = `"${userName}" is now an admin`;
        setSuccess(message);
        toast.success(message);
      }
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update user role";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleMakeStudent = async (userId, userName) => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await updateUserRole(userId, "student");
      if (response.status >= 200 && response.status < 300) {
        const message = `"${userName}" is now a student`;
        setSuccess(message);
        toast.success(message);
      }
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update user role";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleBan = async (userId, userName, isBanned) => {
    const action = isBanned ? "unban" : "ban";
    try {
      setActionLoading(userId);
      setError(null);
      const response = await toggleBanUser(userId);
      if (response.status >= 200 && response.status < 300) {
        const updatedUser = response.data;
        const responseName = updatedUser?.name || userName;
        const responseAction = updatedUser?.isBanned ? "banned" : "unbanned";
        const message = `User "${responseName}" ${responseAction} successfully`;
        setSuccess(message);
        toast.success(message);
      }
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err.response?.data?.message || `Failed to ${action} user`;
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const isCurrentUser = (userId) => {
    const currentUserId =
      currentUser?._id || currentUser?.id || user?._id || user?.id;
    return currentUserId === userId;
  };

  const table = useReactTable({
    data: users,
    columns: [{ accessorKey: "_id" }],
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="page-heading">Manage Users</h1>

      {success && (
        <div className="alert alert-success shadow-lg">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
      )}

      {users.length === 0 ? (
        <div className="alert alert-info">
          <span>No users found</span>
        </div>
      ) : (
        <div className="card bg-base-100 border-2 border-base-300 shadow-lg">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table min-w-[760px] w-full text-sm text-base-content sm:text-base">
                <thead className="bg-base-200 text-base-content/80">
                  <tr>
                    <th className="text-xs font-bold uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-xs font-bold uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-xs font-bold uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-xs font-bold uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-xs font-bold uppercase tracking-wide">
                      Joined
                    </th>
                    <th className="text-xs font-bold uppercase tracking-wide text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const userItem = row.original;
                    const isSelf = isCurrentUser(userItem._id);
                    const isLoading = actionLoading === userItem._id;
                    const showMenu = showActions === userItem._id;

                    return (
                      <tr
                        key={userItem._id}
                        className={`hover:bg-base-200/50 transition-colors ${
                          userItem.isBanned ? "opacity-60" : ""
                        }`}
                      >
                        <td className="font-semibold text-base-content">
                          {userItem.name}
                        </td>
                        <td className="max-w-56 break-all text-base-content/80">
                          {userItem.email}
                        </td>
                        <td>
                          <span
                            className={`badge badge-lg font-semibold ${
                              userItem.role === "admin"
                                ? "badge-error"
                                : "badge-primary"
                            }`}
                          >
                            {userItem.role?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {userItem.isBanned ? (
                            <span className="badge badge-warning badge-lg font-semibold">
                              <Ban className="w-3 h-3 mr-1" />
                              BANNED
                            </span>
                          ) : (
                            <span className="badge badge-success badge-lg font-semibold">
                              <Unlock className="w-3 h-3 mr-1" />
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap text-base-content/80">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <div
                              className="relative"
                            >
                              <button
                                type="button"
                                tabIndex={0}
                                className="btn btn-sm btn-outline border-slate-300 bg-white text-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary"
                                aria-label={`Actions for ${userItem.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  setShowActions(
                                    showMenu ? null : userItem._id,
                                  );
                                  setActionMenuPosition(
                                    showMenu
                                      ? null
                                      : {
                                          top: rect.bottom + 8,
                                          left: Math.max(8, rect.right - 256),
                                        },
                                  );
                                }}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </button>
                              {showMenu &&
                                actionMenuPosition &&
                                createPortal(
                                  <ul
                                    tabIndex={0}
                                    data-user-actions-menu
                                    className="menu visible fixed z-[10000] block w-64 rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 opacity-100 shadow-2xl"
                                    style={{
                                      top: actionMenuPosition.top,
                                      left: actionMenuPosition.left,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                <li className="pointer-events-none mb-1 border-b border-slate-100 px-3 py-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    User actions
                                  </span>
                                </li>
                                {/* Make Admin/Student */}
                                {userItem.role === "admin" ? (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmation({
                                          type: "role",
                                          targetRole: "student",
                                          userId: userItem._id,
                                          userName: userItem.name,
                                          userEmail: userItem.email,
                                        });
                                        setShowActions(null);
                                      }}
                                      disabled={isSelf || isLoading}
                                      className={`text-slate-700 hover:bg-slate-100 hover:text-primary ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
                                      title={
                                        isSelf
                                          ? "Cannot change your own role"
                                          : ""
                                      }
                                    >
                                      <ShieldOff className="w-4 h-4" />
                                      Make Student
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmation({
                                          type: "role",
                                          targetRole: "admin",
                                          userId: userItem._id,
                                          userName: userItem.name,
                                          userEmail: userItem.email,
                                        });
                                        setShowActions(null);
                                      }}
                                      disabled={isSelf || isLoading}
                                      className={`text-slate-700 hover:bg-slate-100 hover:text-primary ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
                                      title={
                                        isSelf
                                          ? "Cannot change your own role"
                                          : ""
                                      }
                                    >
                                      <Shield className="w-4 h-4" />
                                      Make Admin
                                    </button>
                                  </li>
                                )}

                                {/* Ban/Unban */}
                                <li>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmation({
                                        type: "ban",
                                        userId: userItem._id,
                                        userName: userItem.name,
                                        userEmail: userItem.email,
                                        isBanned: userItem.isBanned,
                                      });
                                      setShowActions(null);
                                    }}
                                    disabled={isSelf || isLoading}
                                    className={`text-slate-700 hover:bg-slate-100 hover:text-primary ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
                                    title={isSelf ? "Cannot ban yourself" : ""}
                                  >
                                    {userItem.isBanned ? (
                                      <>
                                        <Unlock className="w-4 h-4" />
                                        Unban User
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="w-4 h-4" />
                                        Ban User
                                      </>
                                    )}
                                  </button>
                                </li>

                                <div className="divider my-1"></div>

                                {/* Delete */}
                                <li>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmation({
                                        type: "delete",
                                        userId: userItem._id,
                                        userName: userItem.name,
                                        userEmail: userItem.email,
                                      });
                                      setShowActions(null);
                                    }}
                                    disabled={isSelf || isLoading}
                                    className={`text-red-600 hover:bg-red-50 hover:text-red-700 ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
                                    title={
                                      isSelf ? "Cannot delete yourself" : ""
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                </li>
                                  </ul>,
                                  document.body,
                                )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {confirmation &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setConfirmation(null);
              }
            }}
          >
            <div
              className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 bg-white p-5 text-slate-900 shadow-2xl sm:p-7 ${
                confirmation.type === "delete"
                  ? "border-red-200"
                  : confirmation.type === "ban"
                    ? "border-amber-200"
                    : "border-primary/30"
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-action-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close confirmation dialog"
                onClick={() => setConfirmation(null)}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  User action
                </p>
                <div className="mt-3 flex items-start gap-3 pr-8">
                  <div
                    className={`rounded-full p-3 ${
                      confirmation.type === "delete"
                        ? "bg-red-100 text-red-600"
                        : confirmation.type === "ban"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-primary/15 text-primary"
                    }`}
                  >
                    {confirmation.type === "delete" ? (
                      <Trash2 className="h-5 w-5" />
                    ) : confirmation.type === "ban" ? (
                      confirmation.isBanned ? (
                        <Unlock className="h-5 w-5" />
                      ) : (
                        <Ban className="h-5 w-5" />
                      )
                    ) : confirmation.targetRole === "admin" ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <ShieldOff className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="user-action-title"
                      className="text-xl font-bold text-slate-900"
                    >
                      {confirmation.type === "delete"
                        ? "Delete this user?"
                        : confirmation.type === "ban"
                          ? confirmation.isBanned
                            ? "Restore user access?"
                            : "Ban this user?"
                          : confirmation.targetRole === "admin"
                            ? "Grant admin access?"
                            : "Change user to student?"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {confirmation.type === "delete"
                        ? `Deleting "${confirmation.userName}" is permanent and cannot be undone.`
                        : confirmation.type === "ban"
                          ? confirmation.isBanned
                            ? `Allow "${confirmation.userName}" to access the platform again?`
                            : `Prevent "${confirmation.userName}" from accessing the platform?`
                          : confirmation.targetRole === "admin"
                            ? `Give "${confirmation.userName}" permission to manage the platform?`
                            : `Remove admin privileges from "${confirmation.userName}"?`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selected user
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  {confirmation.userName}
                </p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {confirmation.userEmail}
                </p>
                {confirmation.type === "role" && (
                  <p className="mt-2 text-sm font-semibold text-primary">
                    New role: {confirmation.targetRole}
                  </p>
                )}
                <p className="mt-2 font-mono text-xs text-slate-500">
                  ID: {confirmation.userId}
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="btn btn-outline w-full border-slate-300 !text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:!text-slate-900 sm:w-auto sm:min-w-28"
                  onClick={() => setConfirmation(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn w-full sm:w-auto ${
                    confirmation.type === "delete"
                      ? "btn-error"
                      : confirmation.type === "ban"
                        ? "btn-warning"
                        : "btn-primary"
                  }`}
                  onClick={async () => {
                    const action = confirmation;
                    setConfirmation(null);
                    if (action.type === "delete") {
                      await handleDelete(action.userId, action.userName);
                    } else if (action.type === "ban") {
                      await handleBan(
                        action.userId,
                        action.userName,
                        action.isBanned,
                      );
                    } else if (action.targetRole === "admin") {
                      await handleMakeAdmin(action.userId, action.userName);
                    } else {
                      await handleMakeStudent(action.userId, action.userName);
                    }
                  }}
                >
                  {confirmation.type === "delete"
                    ? "Delete User"
                    : confirmation.type === "ban"
                      ? confirmation.isBanned
                        ? "Unban User"
                        : "Ban User"
                      : confirmation.targetRole === "admin"
                        ? "Make Admin"
                        : "Make Student"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
