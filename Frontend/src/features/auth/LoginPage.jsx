import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import MessageBanner from "../../components/common/MessageBanner";
import { fetchProfile, loginUser, resetAuthFeedback, selectAuth } from "./authSlice";
import { getDashboardPath } from "../../utils/roles";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, status, error } = useSelector(selectAuth);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(resetAuthFeedback());
  }, [dispatch]);

  useEffect(() => {
    if (token && !user && status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status, token, user]);

  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await dispatch(loginUser(form)).unwrap();
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (requestError) {
      return requestError;
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">SecureDesk</p>
          <h1>Role-based dashboard</h1>
          <p className="supporting-text">
            Sign in with your email and password to reach the correct dashboard for your role.
          </p>
          <div className="auth-role-strip">
            <span className="role-chip">Super Admin</span>
            <span className="role-chip">Admin</span>
            <span className="role-chip">User</span>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="input-group">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <MessageBanner type="error" message={error} />

          <button type="submit" className="button" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Need a new account?</span>
          <Link className="auth-link" to="/register">
            Create one
          </Link>
        </div>
      </section>
    </main>
  );
}
