import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import MessageBanner from "../../components/common/MessageBanner";
import {
  fetchProfile,
  registerUser,
  resetAuthFeedback,
  selectAuth,
} from "./authSlice";
import { getDashboardPath, getRoleLabel, ROLES } from "../../utils/roles";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: ROLES.USER,
  secretCoupon: "",
  password: "",
  confirmPassword: "",
};

const roleOptions = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, status, error } = useSelector(selectAuth);
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState("");

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

    if (localError) {
      setLocalError("");
    }

    setForm((current) => {
      const nextForm = {
        ...current,
        [name]: value,
      };

      if (name === "role" && value === ROLES.USER) {
        nextForm.secretCoupon = "";
      }

      return nextForm;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (form.role !== ROLES.USER && !form.secretCoupon.trim()) {
      setLocalError("Enter the secret coupon for the selected role.");
      return;
    }

    try {
      const data = await dispatch(
        registerUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          secretCoupon: form.role === ROLES.USER ? undefined : form.secretCoupon,
          password: form.password,
        })
      ).unwrap();

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
          <h1>Create account</h1>
          <p className="supporting-text">
            Choose your role, then use the matching secret coupon if you are creating an admin or
            super admin account.
          </p>
          <div className="auth-role-strip">
            <span className="role-chip">User</span>
            <span className="role-chip">Admin</span>
            <span className="role-chip">Super Admin</span>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="input-group">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </label>

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
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </label>

          <label className="input-group">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange} required>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          {form.role !== ROLES.USER ? (
            <label className="input-group">
              <span>Secret coupon</span>
              <input
                type="text"
                name="secretCoupon"
                value={form.secretCoupon}
                onChange={handleChange}
                placeholder={`Enter ${getRoleLabel(form.role)} coupon`}
                required
              />
            </label>
          ) : null}

          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              required
            />
          </label>

          <label className="input-group">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              minLength={6}
              required
            />
          </label>

          <p className="form-hint">
            Users can sign up directly. Admin and Super Admin accounts need the matching secret
            coupon.
          </p>

          <MessageBanner type="error" message={localError || error} />

          <button type="submit" className="button" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link className="auth-link" to="/login">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
