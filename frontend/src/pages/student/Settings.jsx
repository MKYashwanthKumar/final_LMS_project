import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BookPlus,
  Send,
  ClipboardList,
  Bell
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
  subject: "",
  reason: ""
};

const Settings = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState(emptyForm);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/book-requests");
      setRequests(data.requests || []);
    } catch (error) {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const myRequests = useMemo(() => {
    return requests.filter((item) => String(item.user) === String(user?._id));
  }, [requests, user]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((item) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [item.title, item.author, item.subject, item.reason, item.status].some((value) =>
        String(value || "").toLowerCase().includes(text)
      );
    });
  }, [myRequests, searchQuery]);

  const stats = useMemo(() => {
    return [
      {
        label: "Submitted Requests",
        value: String(myRequests.length),
        badge: "Student",
        tone: "info",
        icon: ClipboardList
      },
      {
        label: "Pending",
        value: String(myRequests.filter((item) => item.status === "pending").length),
        badge: "Librarian Review",
        tone: "warning",
        icon: Bell
      },
      {
        label: "Approved",
        value: String(myRequests.filter((item) => item.status === "approved").length),
        badge: "Accepted",
        tone: "success",
        icon: BookPlus
      },
      {
        label: "Sent",
        value: String(myRequests.length),
        badge: "Realtime",
        tone: "primary",
        icon: Send
      }
    ];
  }, [myRequests]);

  const notifications = useMemo(() => {
    return myRequests.slice(0, 8).map((item) => ({
      id: item._id,
      title: "New book request status",
      message: `"${item.title}" request is ${item.status}.`,
      time: new Date(item.createdAt).toLocaleString()
    }));
  }, [myRequests]);

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
      await api.post("/book-requests", {
        userId: user._id,
        title: formData.title,
        author: formData.author,
        subject: formData.subject,
        reason: formData.reason
      });
      toast.success("New book request sent to librarian");
      setFormData(emptyForm);
      loadRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="student"
      title="Request New Book"
      searchPlaceholder={roleSearchPlaceholders.student}
      navItems={roleNavConfig.student}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Request a New Book">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Book Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              required
            />
          </div>

          <div className="field">
            <label>Author</label>
            <input
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author"
            />
          </div>

          <div className="field">
            <label>Subject</label>
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
            />
          </div>

          <div className="full-span field">
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Why should this book be added?"
              rows="5"
              required
            />
          </div>

          <div className="full-span">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </PanelCard>

      <PanelCard title="My New Book Requests">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Subject</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.author || "-"}</td>
                    <td>{item.subject || "-"}</td>
                    <td>{item.reason}</td>
                    <td>
                      <span
                        className={
                          item.status === "approved"
                            ? "badge badge-success"
                            : item.status === "pending"
                            ? "badge badge-warning"
                            : "badge badge-danger"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No matching requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default Settings;