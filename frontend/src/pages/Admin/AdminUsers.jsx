import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  Calendar,
  Mail,
  Award,
  BookOpen,
  FileText,
  AlertCircle,
  TrendingUp,
  UserRound,
  ShieldAlert,
  HeartHandshake,
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import {
  getAdminUserStats,
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
  updateAdminUserRole,
  getAdminAuditLogs,
} from "../../services/adminUserService.js";
import styles from "./AdminUsers.module.css";

export default function AdminUsers() {
  // Statistics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    parents: 0,
    superAdmins: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersThisMonth: 0,
    activeThisWeek: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Users List & Pagination State
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [limit, setLimit] = useState(20);

  // User Details Drawer State
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Audit Logs Drawer State
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Confirmation Modals State
  const [suspendModal, setSuspendModal] = useState({
    isOpen: false,
    user: null,
    reason: "",
    isSubmitting: false,
  });

  const [reactivateModal, setReactivateModal] = useState({
    isOpen: false,
    user: null,
    isSubmitting: false,
  });

  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
    newRole: "STUDENT",
    isSubmitting: false,
  });

  // Toast feedback
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((text, type = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load Dashboard Stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminUserStats();
      if (data) setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Users List
  const loadUsers = useCallback(
    async (pageToLoad = pagination.page) => {
      try {
        setLoading(true);
        const data = await getAdminUsers({
          page: pageToLoad,
          limit,
          search: debouncedSearch,
          role: roleFilter,
          status: statusFilter,
          sortBy,
          sortOrder,
        });

        if (data) {
          setUsers(data.items || []);
          setPagination(
            data.pagination || {
              page: pageToLoad,
              limit,
              total: 0,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        showToast(err.message || "Failed to load users list.", "error");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, limit, debouncedSearch, roleFilter, statusFilter, sortBy, sortOrder, showToast]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load User Details
  const handleOpenDetails = async (user) => {
    setDrawerUser(user);
    setDrawerLoading(true);
    try {
      const fullDetails = await getAdminUserById(user.id);
      if (fullDetails) {
        setDrawerUser(fullDetails);
      }
    } catch (err) {
      showToast(err.message || "Could not fetch full user details.", "error");
    } finally {
      setDrawerLoading(false);
    }
  };

  // Open Audit Logs
  const handleOpenAuditLogs = async () => {
    setIsAuditOpen(true);
    setAuditLoading(true);
    try {
      const logs = await getAdminAuditLogs(40);
      setAuditLogs(logs || []);
    } catch (err) {
      showToast("Could not load audit events.", "error");
    } finally {
      setAuditLoading(false);
    }
  };

  // Suspend action
  const handleConfirmSuspend = async () => {
    if (!suspendModal.user) return;
    setSuspendModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateAdminUserStatus(suspendModal.user.id, {
        status: "SUSPENDED",
        reason: suspendModal.reason.trim() || undefined,
      });

      showToast(`Account for ${suspendModal.user.name || suspendModal.user.email} suspended.`);
      setSuspendModal({ isOpen: false, user: null, reason: "", isSubmitting: false });

      loadUsers();
      loadStats();
      if (drawerUser && drawerUser.id === suspendModal.user.id) {
        handleOpenDetails(suspendModal.user);
      }
    } catch (err) {
      showToast(err.message || "Failed to suspend user.", "error");
      setSuspendModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Reactivate action
  const handleConfirmReactivate = async () => {
    if (!reactivateModal.user) return;
    setReactivateModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateAdminUserStatus(reactivateModal.user.id, {
        status: "ACTIVE",
      });

      showToast(`Account for ${reactivateModal.user.name || reactivateModal.user.email} reactivated.`);
      setReactivateModal({ isOpen: false, user: null, isSubmitting: false });

      loadUsers();
      loadStats();
      if (drawerUser && drawerUser.id === reactivateModal.user.id) {
        handleOpenDetails(reactivateModal.user);
      }
    } catch (err) {
      showToast(err.message || "Failed to reactivate user.", "error");
      setReactivateModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Change Role action
  const handleConfirmRoleChange = async () => {
    if (!roleModal.user) return;
    setRoleModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateAdminUserRole(roleModal.user.id, {
        role: roleModal.newRole,
      });

      showToast(`Role updated to ${roleModal.newRole} for ${roleModal.user.name || roleModal.user.email}.`);
      setRoleModal({ isOpen: false, user: null, newRole: "STUDENT", isSubmitting: false });

      loadUsers();
      loadStats();
      if (drawerUser && drawerUser.id === roleModal.user.id) {
        handleOpenDetails(roleModal.user);
      }
    } catch (err) {
      showToast(err.message || "Failed to update role.", "error");
      setRoleModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <HubLayout title="Admin Studio · User Management">
      <div className={styles.container}>
        {/* ================================================= */}
        {/* HERO BANNER */}
        {/* ================================================= */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrow}>
                <ShieldCheck size={13} /> USER ACCESS COMMAND
              </span>
            </div>
            <h1>User Management & Security Controls</h1>
            <p>
              Inspect CodeLand learner profiles, audit Parent-Child family linkages, manage account
              suspensions, and safely delegate administrator roles.
            </p>
          </div>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleOpenAuditLogs}
              id="btn-view-audit-logs"
            >
              <FileText size={15} />
              <span>Audit Logs</span>
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => {
                loadUsers();
                loadStats();
              }}
              disabled={loading || statsLoading}
              id="btn-refresh-users"
            >
              <RefreshCw size={15} className={loading ? styles.loadingSpinner : ""} />
              <span>Refresh Directory</span>
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* SUMMARY STATS CARDS */}
        {/* ================================================= */}
        <section className={styles.statsGrid}>
          {/* Total Users */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Total Accounts</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <Users size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.totalUsers}
            </div>
            <div className={styles.statSubtext}>Registered across all roles</div>
          </div>

          {/* Students */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Students</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd" }}>
                <UserRound size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.students}
            </div>
            <div className={styles.statSubtext}>Active young coders</div>
          </div>

          {/* Parents */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Parents</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(6, 182, 212, 0.15)", color: "#38bdf8" }}>
                <HeartHandshake size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.parents}
            </div>
            <div className={styles.statSubtext}>Family observatories</div>
          </div>

          {/* Super Admins */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Super Admins</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.superAdmins}
            </div>
            <div className={styles.statSubtext}>Platform administrators</div>
          </div>

          {/* Active This Week */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Active This Week</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.activeThisWeek}
            </div>
            <div className={styles.statSubtext}>Logged in past 7 days</div>
          </div>

          {/* Suspended */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>Suspended</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
                <UserX size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.suspendedUsers}
            </div>
            <div className={styles.statSubtext}>Access currently revoked</div>
          </div>

          {/* New This Month */}
          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span>New This Month</span>
              <div className={styles.statCardIcon} style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" }}>
                <Sparkles size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {statsLoading ? "..." : stats.newUsersThisMonth}
            </div>
            <div className={styles.statSubtext}>Joined this calendar month</div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CONTROLS BAR: SEARCH, FILTERS, SORTING */}
        {/* ================================================= */}
        <section className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or parent code..."
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="admin-search-users-input"
            />
            {searchInput && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            {/* Role Filter */}
            <div className={styles.selectWrapper}>
              <span className={styles.selectLabel}>Role:</span>
              <select
                className={styles.selectInput}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                id="select-role-filter"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="PARENT">Parents</option>
                <option value="ADMIN">Super Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className={styles.selectWrapper}>
              <span className={styles.selectLabel}>Status:</span>
              <select
                className={styles.selectInput}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                id="select-status-filter"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Sorting */}
            <div className={styles.selectWrapper}>
              <span className={styles.selectLabel}>Sort:</span>
              <select
                className={styles.selectInput}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="select-sort-by"
              >
                <option value="createdAt">Joined Date</option>
                <option value="lastActiveAt">Recently Active</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="totalXp">Highest XP</option>
                <option value="streakDays">Streak</option>
              </select>
            </div>

            {/* Limit */}
            <div className={styles.selectWrapper}>
              <span className={styles.selectLabel}>Per page:</span>
              <select
                className={styles.selectInput}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                id="select-page-limit"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* USERS DATA TABLE */}
        {/* ================================================= */}
        <section className={styles.tableContainer}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.emptyState}>
                        <div className={styles.loadingSpinner} />
                        <p>Loading CodeLand user directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                          <UserX size={28} />
                        </div>
                        <h3>No users found</h3>
                        <p>
                          No registered accounts match your current search and filter criteria.
                        </p>
                        {(searchInput || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                          <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => {
                              setSearchInput("");
                              setRoleFilter("ALL");
                              setStatusFilter("ALL");
                            }}
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const initials = (u.name || u.email || "?")
                      .slice(0, 2)
                      .toUpperCase();

                    const isStudent = u.role === "STUDENT";
                    const isParent = u.role === "PARENT";
                    const isAdminRole = u.role === "SUPER_ADMIN" || u.role === "ADMIN";
                    const isSuspended = u.status === "SUSPENDED";

                    return (
                      <tr key={u.id}>
                        {/* User Column */}
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar}>
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name || "Avatar"}
                                  className={styles.avatarImg}
                                />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userName}>
                                {u.name || "Unnamed Learner"}
                              </span>
                              <span className={styles.userEmail}>{u.email}</span>
                              <div className={styles.providersList}>
                                {u.providerSummary?.map((p) => (
                                  <span key={p} className={styles.providerPill}>
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              isStudent
                                ? styles.roleStudent
                                : isParent
                                ? styles.roleParent
                                : styles.roleAdmin
                            }`}
                          >
                            {isAdminRole && <ShieldCheck size={12} />}
                            {isParent && <HeartHandshake size={12} />}
                            {isStudent && <UserRound size={12} />}
                            <span>
                              {isAdminRole
                                ? "SUPER ADMIN"
                                : isParent
                                ? "PARENT"
                                : "STUDENT"}
                            </span>
                          </span>
                        </td>

                        {/* Status Column */}
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              isSuspended
                                ? styles.statusSuspended
                                : styles.statusActive
                            }`}
                          >
                            <span
                              className={
                                isSuspended
                                  ? styles.statusDotSuspended
                                  : styles.statusDot
                              }
                            />
                            <span>{u.status}</span>
                          </span>
                        </td>

                        {/* XP Column */}
                        <td>
                          <span className={`${styles.metricItem} ${styles.metricXp}`}>
                            <Sparkles size={14} />
                            <span>{u.totalXp?.toLocaleString() || 0}</span>
                          </span>
                        </td>

                        {/* Streak Column */}
                        <td>
                          <span
                            className={`${styles.metricItem} ${styles.metricStreak}`}
                          >
                            <Flame size={14} />
                            <span>{u.streakDays || 0}d</span>
                          </span>
                        </td>

                        {/* Joined Column */}
                        <td>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Last Activity Column */}
                        <td>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                            {u.lastActiveAt
                              ? new Date(u.lastActiveAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Never"}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.btnAction}
                              onClick={() => handleOpenDetails(u)}
                              title="View full account & learning details"
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </button>

                            {/* Suspend or Reactivate */}
                            {isSuspended ? (
                              <button
                                type="button"
                                className={`${styles.btnAction} ${styles.btnActionSuccess}`}
                                onClick={() =>
                                  setReactivateModal({
                                    isOpen: true,
                                    user: u,
                                    isSubmitting: false,
                                  })
                                }
                                title="Reactivate suspended account"
                              >
                                <Unlock size={14} />
                                <span>Reactivate</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={`${styles.btnAction} ${styles.btnActionDanger}`}
                                onClick={() =>
                                  setSuspendModal({
                                    isOpen: true,
                                    user: u,
                                    reason: "",
                                    isSubmitting: false,
                                  })
                                }
                                title="Suspend account access"
                              >
                                <Lock size={14} />
                                <span>Suspend</span>
                              </button>
                            )}

                            {/* Change Role Button */}
                            <button
                              type="button"
                              className={styles.btnAction}
                              onClick={() =>
                                setRoleModal({
                                  isOpen: true,
                                  user: u,
                                  newRole:
                                    u.role === "SUPER_ADMIN" || u.role === "ADMIN"
                                      ? "STUDENT"
                                      : "SUPER_ADMIN",
                                  isSubmitting: false,
                                })
                              }
                              title="Modify account role"
                            >
                              <ShieldAlert size={14} />
                              <span>Role</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className={styles.paginationBar}>
              <div className={styles.paginationInfo}>
                Showing Page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.totalPages}</strong> ({pagination.total} total accounts)
              </div>

              <div className={styles.paginationNav}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => {
                    const prevPage = pagination.page - 1;
                    setPagination((prev) => ({ ...prev, page: prevPage }));
                    loadUsers(prevPage);
                  }}
                >
                  <ChevronLeft size={15} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => {
                    const nextPage = pagination.page + 1;
                    setPagination((prev) => ({ ...prev, page: nextPage }));
                    loadUsers(nextPage);
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* USER DETAILS DRAWER */}
        {/* ================================================= */}
        {drawerUser && (
          <div className={styles.drawerBackdrop} onClick={() => setDrawerUser(null)}>
            <aside
              className={styles.drawer}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="User Account Details"
            >
              {/* Drawer Header */}
              <div className={styles.drawerHeader}>
                <div className={styles.drawerTitleGroup}>
                  <div className={styles.avatar}>
                    {drawerUser.avatar ? (
                      <img src={drawerUser.avatar} alt="Avatar" className={styles.avatarImg} />
                    ) : (
                      <span>
                        {(drawerUser.name || drawerUser.email || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#fff" }}>
                      {drawerUser.name || "Unnamed Learner"}
                    </h2>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{drawerUser.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.drawerCloseBtn}
                  onClick={() => setDrawerUser(null)}
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className={styles.drawerBody}>
                {drawerLoading ? (
                  <div className={styles.emptyState}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading comprehensive user details...</p>
                  </div>
                ) : (
                  <>
                    {/* Section 1: Account Information */}
                    <div className={styles.drawerSection}>
                      <div className={styles.sectionHeader}>
                        <UserRound size={15} />
                        <span>Account Overview</span>
                      </div>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Role</span>
                          <span className={styles.infoValue}>
                            {drawerUser.role === "CHILD" ? "STUDENT" : drawerUser.role}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Status</span>
                          <span
                            className={styles.infoValue}
                            style={{
                              color: drawerUser.status === "ACTIVE" ? "#34d399" : "#f87171",
                            }}
                          >
                            {drawerUser.status}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>User ID</span>
                          <span className={styles.infoValue} style={{ fontSize: "11px" }}>
                            {drawerUser.id}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Registered On</span>
                          <span className={styles.infoValue}>
                            {new Date(drawerUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Last Activity</span>
                          <span className={styles.infoValue}>
                            {drawerUser.lastActiveAt
                              ? new Date(drawerUser.lastActiveAt).toLocaleString()
                              : "No record"}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Connected Providers</span>
                          <span className={styles.infoValue}>
                            {drawerUser.providerSummary?.join(", ") || "None"}
                          </span>
                        </div>
                      </div>

                      {drawerUser.status === "SUSPENDED" && (
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "12px",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            borderRadius: "8px",
                          }}
                        >
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#f87171" }}>
                            SUSPENSION REASON:
                          </span>
                          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
                            {drawerUser.suspendReason || "Administrative review."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Learning Stats */}
                    <div className={styles.drawerSection}>
                      <div className={styles.sectionHeader}>
                        <Award size={15} />
                        <span>Learning & Achievements</span>
                      </div>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Total XP Earned</span>
                          <span className={styles.infoValue} style={{ color: "#fbbf24", fontWeight: 700 }}>
                            {drawerUser.totalXp?.toLocaleString() || 0} XP
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Current Streak</span>
                          <span className={styles.infoValue} style={{ color: "#f97316", fontWeight: 700 }}>
                            {drawerUser.streakDays || 0} Days
                          </span>
                        </div>
                      </div>

                      {/* Learning Progress Cards */}
                      {drawerUser.learningProgress && drawerUser.learningProgress.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <span className={styles.infoLabel} style={{ marginBottom: "8px", display: "block" }}>
                            Track Progress:
                          </span>
                          {drawerUser.learningProgress.map((p) => (
                            <div key={p.id} className={styles.relationCard}>
                              <div>
                                <strong style={{ fontSize: "13px", color: "#f1f5f9" }}>
                                  Track: {p.trackId}
                                </strong>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  Level: {p.levelId} &bull; XP: {p.xp}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: p.status === "COMPLETED" ? "#34d399" : "#60a5fa",
                                }}
                              >
                                {Math.round(p.progressPercent || 0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 3: Family Relations */}
                    <div className={styles.drawerSection}>
                      <div className={styles.sectionHeader}>
                        <HeartHandshake size={15} />
                        <span>Family & Relations</span>
                      </div>

                      {drawerUser.parent ? (
                        <div>
                          <span className={styles.infoLabel}>Linked Parent:</span>
                          <div className={styles.relationCard}>
                            <div>
                              <strong style={{ fontSize: "13px", color: "#fff" }}>
                                {drawerUser.parent.name || "Parent Account"}
                              </strong>
                              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {drawerUser.parent.email} &bull; Code: {drawerUser.parent.parentCode}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : drawerUser.children && drawerUser.children.length > 0 ? (
                        <div>
                          <span className={styles.infoLabel}>
                            Linked Children ({drawerUser.children.length}):
                          </span>
                          {drawerUser.children.map((child) => (
                            <div key={child.id} className={styles.relationCard}>
                              <div>
                                <strong style={{ fontSize: "13px", color: "#fff" }}>
                                  {child.name || "Student"}
                                </strong>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  {child.email} &bull; {child.totalXp} XP &bull; {child.streakDays}d Streak
                                </div>
                              </div>
                              <span
                                className={`${styles.statusBadge} ${
                                  child.status === "ACTIVE" ? styles.statusActive : styles.statusSuspended
                                }`}
                              >
                                {child.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                          No linked parent or student family accounts found.
                        </p>
                      )}
                    </div>

                    {/* Section 4: Quick Action Controls */}
                    <div className={styles.drawerSection}>
                      <div className={styles.sectionHeader}>
                        <ShieldAlert size={15} />
                        <span>Administrative Actions</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {drawerUser.status === "SUSPENDED" ? (
                          <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnActionSuccess}`}
                            onClick={() =>
                              setReactivateModal({
                                isOpen: true,
                                user: drawerUser,
                                isSubmitting: false,
                              })
                            }
                          >
                            <Unlock size={14} />
                            <span>Reactivate Account</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnActionDanger}`}
                            onClick={() =>
                              setSuspendModal({
                                isOpen: true,
                                user: drawerUser,
                                reason: "",
                                isSubmitting: false,
                              })
                            }
                          >
                            <Lock size={14} />
                            <span>Suspend Account</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.btnAction}
                          onClick={() =>
                            setRoleModal({
                              isOpen: true,
                              user: drawerUser,
                              newRole:
                                drawerUser.role === "SUPER_ADMIN" || drawerUser.role === "ADMIN"
                                  ? "STUDENT"
                                  : "SUPER_ADMIN",
                              isSubmitting: false,
                            })
                          }
                        >
                          <ShieldAlert size={14} />
                          <span>Change Role</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ================================================= */}
        {/* AUDIT LOGS DRAWER */}
        {/* ================================================= */}
        {isAuditOpen && (
          <div className={styles.drawerBackdrop} onClick={() => setIsAuditOpen(false)}>
            <aside
              className={styles.drawer}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Security Audit Trail"
            >
              <div className={styles.drawerHeader}>
                <div className={styles.drawerTitleGroup}>
                  <FileText size={20} color="#818cf8" />
                  <div>
                    <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#fff" }}>
                      Security Audit Trail
                    </h2>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Immutable record of sensitive admin actions
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.drawerCloseBtn}
                  onClick={() => setIsAuditOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.drawerBody}>
                {auditLoading ? (
                  <div className={styles.emptyState}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No audit events recorded yet.</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className={styles.drawerSection}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: log.action.includes("SUSPENDED")
                              ? "#f87171"
                              : log.action.includes("PROMOTED")
                              ? "#fbbf24"
                              : "#34d399",
                          }}
                        >
                          {log.action}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                        <strong>Admin:</strong> {log.admin?.name || log.admin?.email || log.adminId}
                        <br />
                        {log.targetUser && (
                          <>
                            <strong>Target:</strong> {log.targetUser.name || log.targetUser.email}
                            <br />
                          </>
                        )}
                        {log.metadata && (
                          <pre
                            style={{
                              margin: "8px 0 0 0",
                              padding: "8px",
                              background: "rgba(0,0,0,0.4)",
                              borderRadius: "6px",
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          >
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ================================================= */}
        {/* SUSPEND CONFIRMATION MODAL */}
        {/* ================================================= */}
        {suspendModal.isOpen && (
          <div
            className={styles.modalBackdrop}
            onClick={() =>
              !suspendModal.isSubmitting &&
              setSuspendModal((prev) => ({ ...prev, isOpen: false }))
            }
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Suspend {suspendModal.user?.name || suspendModal.user?.email}?
                  </h3>
                  <p className={styles.modalSubtitle}>
                    This account will immediately lose access to CodeLand on all active devices.
                  </p>
                </div>
              </div>

              <div className={styles.alertBox}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  All existing JWT sessions will be invalidated immediately. Learner progress, XP,
                  and family relationships will remain securely stored in the database.
                </span>
              </div>

              <div>
                <label
                  htmlFor="suspend-reason-input"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Suspension Reason (Optional):
                </label>
                <input
                  id="suspend-reason-input"
                  type="text"
                  placeholder="e.g. Terms violation, parent request, review..."
                  className={styles.searchInput}
                  value={suspendModal.reason}
                  onChange={(e) =>
                    setSuspendModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  disabled={suspendModal.isSubmitting}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setSuspendModal({ isOpen: false, user: null, reason: "", isSubmitting: false })}
                  disabled={suspendModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btnPrimary}`}
                  style={{ background: "#ef4444", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)" }}
                  onClick={handleConfirmSuspend}
                  disabled={suspendModal.isSubmitting}
                  id="btn-confirm-suspend-account"
                >
                  {suspendModal.isSubmitting ? (
                    <>
                      <span className={styles.loadingSpinner} style={{ width: 14, height: 14 }} />
                      <span>Suspending...</span>
                    </>
                  ) : (
                    <span>Suspend Account</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* REACTIVATE CONFIRMATION MODAL */}
        {/* ================================================= */}
        {reactivateModal.isOpen && (
          <div
            className={styles.modalBackdrop}
            onClick={() =>
              !reactivateModal.isSubmitting &&
              setReactivateModal((prev) => ({ ...prev, isOpen: false }))
            }
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={`${styles.modalIcon} ${styles.modalIconSuccess}`}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Reactivate {reactivateModal.user?.name || reactivateModal.user?.email}?
                  </h3>
                  <p className={styles.modalSubtitle}>
                    This account will be restored to active status and permitted to log in normally.
                  </p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setReactivateModal({ isOpen: false, user: null, isSubmitting: false })}
                  disabled={reactivateModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ background: "#10b981", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)" }}
                  onClick={handleConfirmReactivate}
                  disabled={reactivateModal.isSubmitting}
                  id="btn-confirm-reactivate-account"
                >
                  {reactivateModal.isSubmitting ? "Reactivating..." : "Reactivate Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* ROLE CHANGE CONFIRMATION MODAL */}
        {/* ================================================= */}
        {roleModal.isOpen && (
          <div
            className={styles.modalBackdrop}
            onClick={() =>
              !roleModal.isSubmitting &&
              setRoleModal((prev) => ({ ...prev, isOpen: false }))
            }
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={`${styles.modalIcon} ${styles.modalIconWarning}`}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Change Role for {roleModal.user?.name || roleModal.user?.email}
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Current role: <strong>{roleModal.user?.role}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="select-target-role"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                >
                  Select New Role:
                </label>
                <select
                  id="select-target-role"
                  className={styles.searchInput}
                  value={roleModal.newRole}
                  onChange={(e) =>
                    setRoleModal((prev) => ({ ...prev, newRole: e.target.value }))
                  }
                  disabled={roleModal.isSubmitting}
                >
                  <option value="STUDENT">Student (Child Learner)</option>
                  <option value="PARENT">Parent (Family Observatory)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Platform Access)</option>
                </select>
              </div>

              {roleModal.newRole === "SUPER_ADMIN" && (
                <div className={styles.alertBox}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    <strong>Warning:</strong> Promoting this user to Super Admin grants full
                    administrative access to student data, curriculum management, and platform
                    settings.
                  </span>
                </div>
              )}

              {roleModal.user?.role === "SUPER_ADMIN" && roleModal.newRole !== "SUPER_ADMIN" && (
                <div className={styles.alertBox}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    <strong>Demotion Notice:</strong> This user will lose administrative access. The
                    system requires that at least one active Super Admin always remains.
                  </span>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setRoleModal({ isOpen: false, user: null, newRole: "STUDENT", isSubmitting: false })}
                  disabled={roleModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleConfirmRoleChange}
                  disabled={roleModal.isSubmitting}
                  id="btn-confirm-role-change"
                >
                  {roleModal.isSubmitting ? "Updating Role..." : "Confirm Role Change"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* TOAST NOTIFICATION BANNER */}
        {/* ================================================= */}
        {toast && (
          <div
            className={styles.toastBanner}
            style={{
              borderColor: toast.type === "error" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)",
            }}
          >
            {toast.type === "error" ? (
              <AlertCircle size={18} color="#f87171" />
            ) : (
              <CheckCircle2 size={18} color="#34d399" />
            )}
            <span>{toast.text}</span>
          </div>
        )}
      </div>
    </HubLayout>
  );
}
