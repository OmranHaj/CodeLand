import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../../services/learningHub";

/**
 * ProtectedRoute component to guard private routes.
 * - Redirects unauthenticated / guest users to /login
 * - Optionally enforces role-based access (student vs parent)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const user = getUser();
  const isLoggedIn = Boolean(user && !user.isDemo);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const rawRole = (user.role || "").toLowerCase();
    const role =
      rawRole === "child"
        ? "student"
        : rawRole === "superadmin" || rawRole === "super_admin"
        ? "admin"
        : rawRole;

    const normalizedAllowed = allowedRoles.map((r) =>
      r === "superadmin" || r === "super_admin" ? "admin" : r.toLowerCase()
    );

    if (!normalizedAllowed.includes(role)) {
      const fallbackTarget =
        role === "admin"
          ? "/admin"
          : role === "parent"
          ? "/parent/dashboard"
          : "/student/dashboard";

      return <Navigate to={fallbackTarget} replace />;
    }
  }

  return children;
}
