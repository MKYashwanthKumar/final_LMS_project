import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  UserPen
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const emptyForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  role: "student",
  department: "",
  studentId: "",
  year: "",
  facultyId: "",
  accessStatus: "approved"
};

const badgeClass = (status) => {
  if (status === "approved") return "badge badge-success";
  if (status === "pending") return "badge badge-warning";
  if (status === "rejected") return "badge badge-danger";
  return "badge badge-info";
};

const ManageUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Users",
        value: String(users.length),
        badge: "All Accounts",
        tone: "success",
        icon: Users
      },
      {
        label: "Approved",
        value: String(users.filter((u) => u.accessStatus === "approved").length),
        badge: "Can Login",
        tone: "info",
        icon: UserCheck
      },
      {
        label: "Pending",
        value: String(users.filter((u) => u.accessStatus === "pending").length),
        badge: "Need Approval",
        tone: "warning",
        icon: UserPlus
      },
      {
        label: "Profile Requests",
        value: String(users.filter((u) => u.profileUpdateRequest?.status === "pending").length),
        badge: "Review",
        tone: "primary",
        icon: UserPen
      }
    ];
  }, [users]);

  const pendingUsers = users.filter((u) => u.accessStatus === "pending");
  const pendingProfileRequests = users.filter(
    (u) => u.profileUpdateRequest?.status === "pending"
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId("");
  };

  const handleEdit = (selectedUser) => {
    setEditingId(selectedUser._id);
    setFormData({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      username: selectedUser.username || "",
      password: "",
      role: selectedUser.role || "student",
      department: selectedUser.department || "",
      studentId: selectedUser.studentId || "",
      year: selectedUser.year || "",
      facultyId: selectedUser.facultyId || "",
      accessStatus: selectedUser.accessStatus || "approved"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/users/${id}/approve`, {
        approvedBy: currentUser?.name || "Admin"
      });
      toast.success("User approved successfully");
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/users/${id}/reject`, {
        approvedBy: currentUser?.name || "Admin"
      });
      toast.success("User rejected successfully");
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject user");
    }
  };

  const handleApproveProfileRequest = async (id) => {
    try {
      await api.put(`/users/${id}/profile-request/approve`, {
        reviewedBy: currentUser?.name || "Admin"
      });
      toast.success("Profile update request approved");
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve profile request");
    }
  };

  const handleRejectProfileRequest = async (id) => {
    try {
      await api.put(`/users/${id}/profile-request/reject`, {
        reviewedBy: currentUser?.name || "Admin"
      });
      toast.success("Profile update request rejected");
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject profile request");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted successfully");
      if (editingId === id) resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...formData
      };

      if (!payload.password) {
        delete payload.password;
      }

      if (editingId) {
        await api.put(`/users/${editingId}`, {
          ...payload,
          approvedBy: currentUser?.name || "Admin"
        });
        toast.success("User updated successfully");
      } else {
        await api.post("/users", payload);
        toast.success("User created successfully");
      }

      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="User Management"
      searchPlaceholder={roleSearchPlaceholders.admin}
      navItems={roleNavConfig.admin.filter((item) => item.to !== "/admin/books")}
    >
      <StatsGrid stats={stats} />

      <PanelCard title={editingId ? "Edit User" : "Add New User"}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Password {editingId ? "(leave empty to keep same)" : ""}</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!editingId}
            />
          </div>

          <div className="field">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="field">
            <label>Access Status</label>
            <select
              name="accessStatus"
              value={formData.accessStatus}
              onChange={handleChange}
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="field">
            <label>Department</label>
            <input
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Student ID</label>
            <input
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Year</label>
            <input name="year" value={formData.year} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Faculty ID</label>
            <input
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
            />
          </div>

          <div className="full-span" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update User" : "Add User"}
            </button>

            {editingId && (
              <button type="button" className="btn-outline" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </PanelCard>

      <PanelCard title="Pending Access Requests">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length > 0 ? (
                pendingUsers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.username}</td>
                    <td>{item.role}</td>
                    <td>{item.department || "-"}</td>
                    <td>
                      <span className={badgeClass(item.accessStatus)}>{item.accessStatus}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="btn-primary"
                          style={{ padding: "10px 14px" }}
                          onClick={() => handleApprove(item._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="danger-btn"
                          style={{ width: "auto", padding: "10px 14px" }}
                          onClick={() => handleReject(item._id)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-outline"
                          style={{ padding: "10px 14px" }}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No pending requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard title="Pending Profile Update Requests">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Requested Changes</th>
                <th>Password</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProfileRequests.length > 0 ? (
                pendingProfileRequests.map((item) => {
                  const preview = item.profileUpdateRequest?.preview || {};
                  const changes = [
                    preview.name ? `Name: ${preview.name}` : "",
                    preview.email ? `Email: ${preview.email}` : "",
                    preview.department ? `Department: ${preview.department}` : "",
                    preview.studentId ? `Student ID: ${preview.studentId}` : "",
                    preview.facultyId ? `Faculty ID: ${preview.facultyId}` : "",
                    preview.year ? `Year: ${preview.year}` : ""
                  ].filter(Boolean);

                  return (
                    <tr key={`profile-${item._id}`}>
                      <td>{item.name}</td>
                      <td>{item.role}</td>
                      <td>{changes.length > 0 ? changes.join(", ") : "Profile details"}</td>
                      <td>{item.profileUpdateRequest?.hasPasswordChange ? "Yes" : "No"}</td>
                      <td>
                        {item.profileUpdateRequest?.requestedAt
                          ? new Date(item.profileUpdateRequest.requestedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn-primary"
                            style={{ padding: "10px 14px" }}
                            onClick={() => handleApproveProfileRequest(item._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="danger-btn"
                            style={{ width: "auto", padding: "10px 14px" }}
                            onClick={() => handleRejectProfileRequest(item._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No pending profile update requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard title="All Users">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.username}</td>
                  <td>{item.role}</td>
                  <td>
                    <span className={badgeClass(item.accessStatus)}>{item.accessStatus}</span>
                  </td>
                  <td>{item.email}</td>
                  <td>{item.department || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn-outline"
                        style={{ padding: "10px 14px" }}
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      {item.accessStatus !== "approved" && (
                        <button
                          className="btn-primary"
                          style={{ padding: "10px 14px" }}
                          onClick={() => handleApprove(item._id)}
                        >
                          Approve
                        </button>
                      )}

                      <button
                        className="danger-btn"
                        style={{ width: "auto", padding: "10px 14px" }}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="7">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default ManageUsers;