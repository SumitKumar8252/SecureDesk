import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MessageBanner from "../../components/common/MessageBanner";
import PaginationControls from "../../components/common/PaginationControls";
import { apiRequest } from "../../services/api";
import { selectAuth } from "../auth/authSlice";

const emptyTaskForm = {
  title: "",
  description: "",
  status: "todo",
};

export default function TaskManager() {
  const { token } = useSelector(selectAuth);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTaskForm);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    error: "",
    success: "",
  });

  useEffect(() => {
    let ignore = false;

    const loadTasks = async () => {
      setLoading(true);

      try {
        const data = await apiRequest("/tasks", {
          token,
          query: {
            page,
            limit: 6,
            q: query,
            status: statusFilter,
          },
        });

        if (!ignore) {
          setTasks(data.tasks);
          setPagination(data.pagination);
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({
            error: error.message,
            success: "",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadTasks();
    }

    return () => {
      ignore = true;
    };
  }, [page, query, refreshKey, statusFilter, token]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyTaskForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setFeedback({ error: "", success: "" });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE",
        token,
      });

      setFeedback({
        error: "",
        success: "Task deleted successfully.",
      });
      setRefreshKey((current) => current + 1);
      setPage(1);
    } catch (error) {
      setFeedback({
        error: error.message,
        success: "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ error: "", success: "" });

    try {
      await apiRequest(editingId ? `/tasks/${editingId}` : "/tasks", {
        method: editingId ? "PUT" : "POST",
        token,
        body: form,
      });

      setFeedback({
        error: "",
        success: editingId ? "Task updated successfully." : "Task created successfully.",
      });
      resetForm();
      setRefreshKey((current) => current + 1);
      setPage(1);
    } catch (error) {
      setFeedback({
        error: error.message,
        success: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <h2>My tasks</h2>
          <p className="supporting-text">Personal CRUD module for the user dashboard.</p>
        </div>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Title</span>
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label className="input-group">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="input-group span-2">
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </label>
        </div>

        <div className="inline-actions">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Saving..." : editingId ? "Update Task" : "Create Task"}
          </button>
          {editingId ? (
            <button type="button" className="button secondary" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="toolbar split-toolbar">
        <label className="input-group compact">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search title or description"
          />
        </label>
        <label className="input-group compact">
          <span>Status Filter</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <MessageBanner type="error" message={feedback.error} />
      <MessageBanner type="success" message={feedback.success} />

      {loading ? (
        <MessageBanner type="info" message="Loading tasks..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length ? (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>
                      <span className={`status-pill status-${task.status}`}>{task.status}</span>
                    </td>
                    <td>{task.description || "No description"}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="button ghost" onClick={() => handleEdit(task)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button danger ghost"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls page={page} pagination={pagination} onPageChange={setPage} />
    </section>
  );
}
