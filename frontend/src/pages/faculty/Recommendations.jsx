import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BookPlus,
  Send,
  ClipboardList,
  Bell,
  CheckCircle2,
  Clock3
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const emptyForm = {
  title: "",
  author: "",
  reason: ""
};

const Recommendations = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState(emptyForm);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRecommendations = async () => {
    try {
      const { data } = await api.get("/recommendations");
      setRecommendations(data.recommendations || []);
    } catch (error) {
      toast.error("Failed to load recommendations");
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const myRecommendations = useMemo(() => {
    return recommendations.filter((item) => String(item.faculty) === String(user?._id));
  }, [recommendations, user]);

  const filteredRecommendations = useMemo(() => {
    return myRecommendations.filter((item) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [item.title, item.author, item.reason, item.status].some((value) =>
        String(value || "").toLowerCase().includes(text)
      );
    });
  }, [myRecommendations, searchQuery]);

  const stats = useMemo(() => {
    return [
      {
        label: "Submitted",
        value: String(myRecommendations.length),
        badge: "Faculty",
        tone: "info",
        icon: ClipboardList
      },
      {
        label: "Pending",
        value: String(myRecommendations.filter((item) => item.status === "pending").length),
        badge: "Librarian Review",
        tone: "warning",
        icon: Bell
      },
      {
        label: "Approved",
        value: String(myRecommendations.filter((item) => item.status === "approved").length),
        badge: "Accepted",
        tone: "success",
        icon: CheckCircle2
      },
      {
        label: "Sent",
        value: String(myRecommendations.length),
        badge: "Realtime",
        tone: "primary",
        icon: Send
      }
    ];
  }, [myRecommendations]);

  const notifications = useMemo(() => {
    return myRecommendations.slice(0, 8).map((item) => ({
      id: item._id,
      title: "Recommendation status",
      message: `"${item.title}" recommendation is ${item.status}.`,
      time: new Date(item.createdAt).toLocaleString()
    }));
  }, [myRecommendations]);

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

      await api.post("/recommendations", {
        facultyId: user._id,
        title: formData.title.trim(),
        author: formData.author.trim(),
        reason: formData.reason.trim()
      });

      toast.success("Recommendation sent to librarian");
      setFormData(emptyForm);
      loadRecommendations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit recommendation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="faculty"
      title="Book Recommendations"
      searchPlaceholder={roleSearchPlaceholders.faculty}
      navItems={roleNavConfig.faculty}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <style>{`
        .faculty-rec-wrap {
          display: grid;
          gap: 24px;
        }

        .faculty-rec-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .faculty-rec-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faculty-rec-field.full {
          grid-column: 1 / -1;
        }

        .faculty-rec-field label {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .faculty-rec-field input,
        .faculty-rec-field textarea {
          width: 100%;
          background: rgba(3, 16, 43, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-radius: 14px;
          padding: 14px 16px;
          outline: none;
          font-size: 15px;
        }

        .faculty-rec-field input:focus,
        .faculty-rec-field textarea:focus {
          border-color: rgba(255, 140, 26, 0.45);
          box-shadow: 0 0 0 3px rgba(255, 140, 26, 0.08);
        }

        .faculty-rec-field textarea {
          resize: vertical;
          min-height: 120px;
        }

        .faculty-rec-submit {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .faculty-rec-table {
          overflow-x: auto;
        }

        .faculty-rec-empty {
          color: #9fb4d8;
          padding: 10px 0;
        }

        .faculty-rec-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 92px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .faculty-rec-badge.pending {
          background: rgba(245, 158, 11, 0.16);
          color: #f59e0b;
        }

        .faculty-rec-badge.approved {
          background: rgba(16, 185, 129, 0.16);
          color: #10b981;
        }

        .faculty-rec-badge.rejected {
          background: rgba(239, 68, 68, 0.16);
          color: #ef4444;
        }

        @media (max-width: 900px) {
          .faculty-rec-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="faculty-rec-wrap">
        <StatsGrid stats={stats} />

        <PanelCard title="Recommend a New Book">
          <form className="faculty-rec-form-grid" onSubmit={handleSubmit}>
            <div className="faculty-rec-field">
              <label>Book Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="faculty-rec-field">
              <label>Author</label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author"
                required
              />
            </div>

            <div className="faculty-rec-field full">
              <label>Reason for Recommendation</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Why should this book be added?"
                required
              />
            </div>

            <div className="faculty-rec-field full">
              <button type="submit" className="btn-primary faculty-rec-submit" disabled={submitting}>
                <BookPlus size={16} />
                {submitting ? "Submitting..." : "Submit Recommendation"}
              </button>
            </div>
          </form>
        </PanelCard>

        <PanelCard title="Submitted Recommendations">
          <div className="faculty-rec-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Recommended By</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecommendations.length > 0 ? (
                  filteredRecommendations.map((item) => (
                    <tr key={item._id}>
                      <td>{item.title}</td>
                      <td>{item.author}</td>
                      <td>{item.facultyName}</td>
                      <td>{item.reason}</td>
                      <td>
                        <span className={`faculty-rec-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="faculty-rec-empty">
                      No matching recommendations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;