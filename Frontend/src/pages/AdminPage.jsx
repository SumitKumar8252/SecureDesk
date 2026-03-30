import { useSelector } from "react-redux";
import DashboardLayout from "../components/layout/DashboardLayout";
import { selectAuth } from "../features/auth/authSlice";
import UserManager from "../features/users/UserManager";
import { ROLES } from "../utils/roles";

export default function AdminPage() {
  const { user } = useSelector(selectAuth);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Create and manage only the users assigned to this admin account."
      user={user}
    >
      <div className="single-section">
        <UserManager viewerRole={ROLES.ADMIN} />
      </div>
    </DashboardLayout>
  );
}
