import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  UserPen,
  ShieldAlert,
  CheckCircle2,
  Clock3
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    studentId: "",
    year: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = async () => {
    try {
      const { data } = await api.get(`/users/${user._id}`);
      setProfile(data.user || null);

      if (data.user) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          department: data.user.department || "",
          studentId: data.user.studentId || "",
          year: data.user.year || "",
          password: ""
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadProfile();
    }
  }, [user]);

  const stats = useMemo(() => {
    const requestStatus = profile?.profileUpdateRequest?.status || "none";

    return [
      {
        label: "Profile",
        value: profile?.name || "-",
        badge: "Student",
        tone: "info",
        icon: UserPen
      },
      {
        label: "Request Status",
        value: requestStatus,
        badge: "Admin Review",
        tone:
          requestStatus === "approved"
            ? "success"
            : requestStatus === "pending"
            ? "warning"
            : requestStatus === "rejected"
            ? "danger"
            : "primary",
        icon:
          requestStatus === "approved"
            ? CheckCircle2
            : requestStatus === "pending"
            ? Clock3
            : ShieldAlert
      }
    ];
  }, [profile]);

  const notifications = useMemo(() => {
    const request = profile?.profileUpdateRequest;
    if (!request || request.status === "none") return [];

    return [
      {
        id: "student-profile-status",
        title: "Profile update request",
        message: `Your profile request is ${request.status}.`,
        time:
          request.reviewedAt
            ? new Date(request.reviewedAt).toLocaleString()
            : request.requestedAt
            ? new Date(request.requestedAt).toLocaleString()
            : "Live"
      }
    ];
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await api.post(`/users/${user._id}/profile-request`, formData);
      toast.success("Profile update request sent to admin");
      loadProfile();
      setFormData((prev) => ({
        ...prev,
        password: ""
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send profile update request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="student"
      title="Student Profile"
      searchPlaceholder={roleSearchPlaceholders.student}
      navItems={roleNavConfig.student}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Request Profile Update">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Department</label>
            <input name="department" value={formData.department} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Student ID</label>
            <input name="studentId" value={formData.studentId} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Year</label>
            <input name="year" value={formData.year} onChange={handleChange} />
          </div>

          <div className="field">
            <label>New Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave empty if not changing password"
            />
          </div>

          <div className="full-span">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Sending..." : "Send Request to Admin"}
            </button>
          </div>
        </form>
      </PanelCard>

      <PanelCard title="Current Request Status">
        <div className="info-card-block">
          <p>Status: {profile?.profileUpdateRequest?.status || "none"}</p>
          <p>
            Requested At:{" "}
            {profile?.profileUpdateRequest?.requestedAt
              ? new Date(profile.profileUpdateRequest.requestedAt).toLocaleString()
              : "-"}
          </p>
          <p>
            Reviewed At:{" "}
            {profile?.profileUpdateRequest?.reviewedAt
              ? new Date(profile.profileUpdateRequest.reviewedAt).toLocaleString()
              : "-"}
          </p>
          <p>Reviewed By: {profile?.profileUpdateRequest?.reviewedBy || "-"}</p>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default Profile;