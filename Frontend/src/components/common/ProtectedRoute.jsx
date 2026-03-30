import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectAuth } from "../../features/auth/authSlice";
import { getDashboardPath } from "../../utils/roles";
import PageLoader from "./PageLoader";

export default function ProtectedRoute({ allowedRole, children }) {
  const dispatch = useDispatch();
  const { token, user, status } = useSelector(selectAuth);

  useEffect(() => {
    if (token && !user && status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status, token, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status === "loading" && !user) {
    return <PageLoader message="Loading dashboard..." />;
  }

  if (!user && status === "failed") {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <PageLoader message="Restoring your session..." />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}
