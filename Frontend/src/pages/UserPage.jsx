import { useSelector } from "react-redux";
import DashboardLayout from "../components/layout/DashboardLayout";
import { selectAuth } from "../features/auth/authSlice";
import TaskManager from "../features/tasks/TaskManager";

export default function UserPage() {
  const { user } = useSelector(selectAuth);

  return (
    <DashboardLayout
      title="User Dashboard"
      description="Use your personal workspace to manage task records."
      user={user}
    >
      <div className="single-section">
        <TaskManager />
      </div>
    </DashboardLayout>
  );
}
