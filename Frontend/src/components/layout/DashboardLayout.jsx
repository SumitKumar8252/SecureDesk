import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { getRoleLabel } from "../../utils/roles";

export default function DashboardLayout({ title, description, user, children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">SecureDesk</p>
            <h1>{title}</h1>
            <p className="supporting-text">{description}</p>
          </div>
          <div className="header-actions">
            <div className="identity-card">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className="role-chip">{getRoleLabel(user.role)}</span>
            </div>
            <button type="button" className="button secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
