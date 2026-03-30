import { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminManager from "../features/admins/AdminManager";
import UserManager from "../features/users/UserManager";
import { selectAuth } from "../features/auth/authSlice";
import { ROLES } from "../utils/roles";

export default function SuperAdminPage() {
  const { user } = useSelector(selectAuth);
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);

  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      description="Manage every admin and every user across the platform."
      user={user}
    >
      <div className="section-grid">
        <AdminManager onAdminsChanged={() => setAdminRefreshKey((current) => current + 1)} />
        <UserManager viewerRole={ROLES.SUPER_ADMIN} adminRefreshKey={adminRefreshKey} />
      </div>
    </DashboardLayout>
  );
}
