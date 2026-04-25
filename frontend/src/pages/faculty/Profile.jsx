import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  UserPen,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  Mail,
  Building2,
  IdCard,
  KeyRound
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
    facultyId: "",
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
          facultyId: data.user.facultyId || "",
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

  const requestStatus = profile?.profileUpdateRequest?.status || "none";

  const stats = useMemo(() => {
    return [
      {
        label: "Faculty Profile",
        value: profile?.name || "-",
        badge: "Live",
        tone: "info",
        icon: UserPen
      },
      {
        label: "Department",
        value: profile?.department || "-",
        badge: "Academic",
        tone: "primary",
        icon: Building2
      },
      {
        label: "Faculty ID",
        value: profile?.facultyId || "-",
        badge: "Identity",
        tone: "success",
        icon: IdCard
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
            : "info",
        icon:
          requestStatus === "approved"
            ? CheckCircle2
            : requestStatus === "pending"
            ? Clock3
            : ShieldAlert
      }
    ];
  }, [profile, requestStatus]);

  const notifications = useMemo(() => {
    const request = profile?.profileUpdateRequest;
    if (!request || request.status === "none") return [];

    return [
      {
        id: "profile-request-status",
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
      await loadProfile();
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
      role="faculty"
      title="Faculty Profile"
      searchPlaceholder={roleSearchPlaceholders.faculty}
      navItems={roleNavConfig.faculty}
      notifications={notifications}
    >
      <style>{`
        .faculty-profile-wrap {
          display: grid;
          gap: 24px;
        }

        .faculty-profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .faculty-profile-card {
          background: linear-gradient(180deg, rgba(12, 28, 58, 0.96), rgba(6, 18, 42, 0.96));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 22px;
        }

        .faculty-profile-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .faculty-profile-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(255, 140, 26, 0.14);
          color: #ffb14a;
        }

        .faculty-profile-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
        }

        .faculty-profile-line {
          color: #a7bbde;
          line-height: 1.9;
          font-size: 15px;
        }

        .faculty-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .faculty-form-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faculty-form-field.full {
          grid-column: 1 / -1;
        }

        .faculty-form-field label {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .faculty-form-input-wrap {
          position: relative;
        }

        .faculty-form-input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f95bb;
        }

        .faculty-form-field input {
          width: 100%;
          background: rgba(3, 16, 43, 0.95);
          border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff;
          border-radius: 14px;
          padding: 14px 16px 14px 42px;
          outline: none;
          font-size: 15px;
        }

        .faculty-form-field input:focus {
          border-color: rgba(255, 140, 26, 0.45);
          box-shadow: 0 0 0 3px rgba(255, 140, 26, 0.08);
        }

        .faculty-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 110px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .faculty-status-badge.none {
          background: rgba(59, 130, 246, 0.16);
          color: #60a5fa;
        }

        .faculty-status-badge.pending {
          background: rgba(245, 158, 11, 0.16);
          color: #f59e0b;
        }

        .faculty-status-badge.approved {
          background: rgba(16, 185, 129, 0.16);
          color: #10b981;
        }

        .faculty-status-badge.rejected {
          background: rgba(239, 68, 68, 0.16);
          color: #ef4444;
        }

        @media (max-width: 900px) {
          .faculty-profile-grid,
          .faculty-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="faculty-profile-wrap">
        <StatsGrid stats={stats} />

        <div className="faculty-profile-grid">
          <div className="faculty-profile-card">
            <div className="faculty-profile-head">
              <div className="faculty-profile-icon">
                <UserPen size={22} />
              </div>
              <div className="faculty-profile-title">Current Faculty Details</div>
            </div>

            <div className="faculty-profile-line">
              <strong>Name:</strong> {profile?.name || "-"}<br />
              <strong>Email:</strong> {profile?.email || "-"}<br />
              <strong>Department:</strong> {profile?.department || "-"}<br />
              <strong>Faculty ID:</strong> {profile?.facultyId || "-"}<br />
              <strong>Role:</strong> {profile?.role || "faculty"}
            </div>
          </div>

          <div className="faculty-profile-card">
            <div className="faculty-profile-head">
              <div className="faculty-profile-icon">
                {requestStatus === "approved" ? (
                  <CheckCircle2 size={22} />
                ) : requestStatus === "pending" ? (
                  <Clock3 size={22} />
                ) : (
                  <ShieldAlert size={22} />
                )}
              </div>
              <div className="faculty-profile-title">Request Status</div>
            </div>

            <div className="faculty-profile-line" style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{" "}
              <span className={`faculty-status-badge ${requestStatus}`}>
                {requestStatus}
              </span>
            </div>

            <div className="faculty-profile-line">
              <strong>Requested At:</strong>{" "}
              {profile?.profileUpdateRequest?.requestedAt
                ? new Date(profile.profileUpdateRequest.requestedAt).toLocaleString()
                : "-"}
              <br />
              <strong>Reviewed At:</strong>{" "}
              {profile?.profileUpdateRequest?.reviewedAt
                ? new Date(profile.profileUpdateRequest.reviewedAt).toLocaleString()
                : "-"}
              <br />
              <strong>Reviewed By:</strong> {profile?.profileUpdateRequest?.reviewedBy || "-"}
            </div>
          </div>
        </div>

        <PanelCard title="Request Profile Update">
          <form className="faculty-form-grid" onSubmit={handleSubmit}>
            <div className="faculty-form-field">
              <label>Full Name</label>
              <div className="faculty-form-input-wrap">
                <UserPen size={16} />
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="faculty-form-field">
              <label>Email</label>
              <div className="faculty-form-input-wrap">
                <Mail size={16} />
                <input name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="faculty-form-field">
              <label>Department</label>
              <div className="faculty-form-input-wrap">
                <Building2 size={16} />
                <input name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>

            <div className="faculty-form-field">
              <label>Faculty ID</label>
              <div className="faculty-form-input-wrap">
                <IdCard size={16} />
                <input name="facultyId" value={formData.facultyId} onChange={handleChange} />
              </div>
            </div>

            <div className="faculty-form-field full">
              <label>New Password</label>
              <div className="faculty-form-input-wrap">
                <KeyRound size={16} />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty if not changing password"
                />
              </div>
            </div>

            <div className="faculty-form-field full">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request to Admin"}
              </button>
            </div>
          </form>
        </PanelCard>
      </div>
    </DashboardLayout>
  );
};

export default Profile;