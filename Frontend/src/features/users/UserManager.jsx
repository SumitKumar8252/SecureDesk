import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MessageBanner from "../../components/common/MessageBanner";
import PaginationControls from "../../components/common/PaginationControls";
import { apiRequest } from "../../services/api";
import { ROLES } from "../../utils/roles";
import { selectAuth } from "../auth/authSlice";

const emptyUserForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  adminId: "",
};

export default function UserManager({ viewerRole, adminRefreshKey = 0 }) {
  const { token } = useSelector(selectAuth);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
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

    const loadUsers = async () => {
      setLoading(true);

      try {
        const data = await apiRequest("/users", {
          token,
          query: {
            page,
            limit: 5,
            q: query,
          },
        });

        if (!ignore) {
          setUsers(data.users);
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
      loadUsers();
    }

    return () => {
      ignore = true;
    };
  }, [adminRefreshKey, page, query, refreshKey, token]);

  useEffect(() => {
    if (viewerRole !== ROLES.SUPER_ADMIN || !token) {
      return;
    }

    let ignore = false;

    const loadAdmins = async () => {
      try {
        const data = await apiRequest("/admins", {
          token,
          query: {
            page: 1,
            limit: 100,
          },
        });

        if (!ignore) {
          setAdmins(data.admins);
          setForm((current) => ({
            ...current,
            adminId: data.admins.some((admin) => admin.id === current.adminId)
              ? current.adminId
              : data.admins[0]?.id || "",
          }));
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({
            error: error.message,
            success: "",
          });
        }
      }
    };

    loadAdmins();

    return () => {
      ignore = true;
    };
  }, [adminRefreshKey, token, viewerRole]);

  const resetForm = () => {
    setEditingId("");
    setForm({
      ...emptyUserForm,
      adminId: admins[0]?.id || "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      adminId: user.createdByAdmin?.id || admins[0]?.id || "",
    });
    setFeedback({ error: "", success: "" });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user and all tasks owned by them?")) {
      return;
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: "DELETE",
        token,
      });

      setFeedback({
        error: "",
        success: "User deleted successfully.",
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
      await apiRequest(editingId ? `/users/${editingId}` : "/users", {
        method: editingId ? "PUT" : "POST",
        token,
        body: viewerRole === ROLES.SUPER_ADMIN ? form : { ...form, adminId: undefined },
      });

      setFeedback({
        error: "",
        success: editingId ? "User updated successfully." : "User created successfully.",
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

  const noAdminAvailable = viewerRole === ROLES.SUPER_ADMIN && admins.length === 0;

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <h2>User management</h2>
          <p className="supporting-text">
            {viewerRole === ROLES.SUPER_ADMIN
              ? "Manage users under any admin account."
              : "Manage only the users assigned to this admin account."}
          </p>
        </div>
      </div>

      {noAdminAvailable ? (
        <MessageBanner type="info" message="Create at least one admin before assigning users." />
      ) : null}

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
          {viewerRole === ROLES.SUPER_ADMIN ? (
            <label className="input-group">
              <span>Admin Owner</span>
              <select
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                required
                disabled={noAdminAvailable}
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="inline-actions">
          <button type="submit" className="button" disabled={submitting || noAdminAvailable}>
            {submitting ? "Saving..." : editingId ? "Update User" : "Create User"}
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
        <MessageBanner type="info" message="Loading users..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                {viewerRole === ROLES.SUPER_ADMIN ? <th>Admin Owner</th> : null}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    {viewerRole === ROLES.SUPER_ADMIN ? (
                      <td>{user.createdByAdmin ? user.createdByAdmin.name : "Not assigned"}</td>
                    ) : null}
                    <td>
                      <div className="row-actions">
                        <button type="button" className="button ghost" onClick={() => handleEdit(user)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button danger ghost"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewerRole === ROLES.SUPER_ADMIN ? "5" : "4"}>No users found.</td>
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
