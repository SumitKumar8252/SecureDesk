import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MessageBanner from "../../components/common/MessageBanner";
import PaginationControls from "../../components/common/PaginationControls";
import { selectAuth } from "../auth/authSlice";
import { apiRequest } from "../../services/api";

const emptyAdminForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function AdminManager({ onAdminsChanged = () => {} }) {
  const { token } = useSelector(selectAuth);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyAdminForm);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
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

    const loadAdmins = async () => {
      setLoading(true);

      try {
        const data = await apiRequest("/admins", {
          token,
          query: {
            page,
            limit: 5,
            q: query,
          },
        });

        if (!ignore) {
          setAdmins(data.admins);
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
      loadAdmins();
    }

    return () => {
      ignore = true;
    };
  }, [page, query, refreshKey, token]);

  const resetForm = () => {
    setForm(emptyAdminForm);
    setEditingId("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: "",
    });
    setFeedback({ error: "", success: "" });
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Delete this admin and all users managed by them?")) {
      return;
    }

    try {
      await apiRequest(`/admins/${adminId}`, {
        method: "DELETE",
        token,
      });

      setFeedback({
        error: "",
        success: "Admin deleted successfully.",
      });
      setRefreshKey((current) => current + 1);
      setPage(1);
      onAdminsChanged();
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
      await apiRequest(editingId ? `/admins/${editingId}` : "/admins", {
        method: editingId ? "PUT" : "POST",
        token,
        body: form,
      });

      setFeedback({
        error: "",
        success: editingId ? "Admin updated successfully." : "Admin created successfully.",
      });
      resetForm();
      setRefreshKey((current) => current + 1);
      setPage(1);
      onAdminsChanged();
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
          <h2>Admin management</h2>
          <p className="supporting-text">Create, update, search, and remove admin accounts.</p>
        </div>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="input-group">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="input-group">
            <span>Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label className="input-group">
            <span>{editingId ? "New password (optional)" : "Password"}</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editingId}
            />
          </label>
        </div>

        <div className="inline-actions">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Saving..." : editingId ? "Update Admin" : "Create Admin"}
          </button>
          {editingId ? (
            <button type="button" className="button secondary" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="toolbar">
        <label className="input-group compact">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone"
          />
        </label>
      </div>

      <MessageBanner type="error" message={feedback.error} />
      <MessageBanner type="success" message={feedback.success} />

      {loading ? (
        <MessageBanner type="info" message="Loading admins..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length ? (
                admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.phone}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="button ghost" onClick={() => handleEdit(admin)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button danger ghost"
                          onClick={() => handleDelete(admin.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No admins found.</td>
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
