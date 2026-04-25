import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  UserPlus,
  ClipboardList,
  AlertTriangle,
  BadgeIndianRupee,
  BookCopy,
  BookCheck,
  CalendarPlus2,
  Wallet,
  BookOpenCheck,
  Clock3,
  ShieldAlert,
  LibraryBig,
  BookmarkPlus,
  UserPen,
  BookPlus,
  BellRing
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PanelCard from "../components/common/PanelCard";
import StatsGrid from "../components/dashboard/StatsGrid";
import DataTable from "../components/dashboard/DataTable";
import BookGrid from "../components/dashboard/BookGrid";
import ActivityList from "../components/dashboard/ActivityList";
import api from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../data/dashboardData";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatDateTime = (value) => {
  if (!value) return "Now";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const matchesSearch = (query, values) => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return values.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalized)
  );
};

const DashboardPage = ({ role }) => {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [bookRequests, setBookRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const titleMap = {
    admin: "Admin Dashboard",
    librarian: "Librarian Dashboard",
    faculty: "Faculty Dashboard",
    student: "Student Dashboard"
  };

  const navItems =
    role === "admin"
      ? roleNavConfig.admin.filter((item) => item.to !== "/admin/books")
      : roleNavConfig[role];

  const loadAdminData = async () => {
    const [overviewRes, transactionRes, usersRes] = await Promise.all([
      api.get("/reports/overview"),
      api.get("/transactions"),
      api.get("/users")
    ]);

    setOverview(overviewRes.data.overview || null);
    setTransactions(transactionRes.data.transactions || []);
    setUsers(usersRes.data.users || []);
  };

  const loadLibrarianData = async () => {
    const [booksRes, transactionRes, usersRes, recRes, reservationRes, requestRes] =
      await Promise.all([
        api.get("/books"),
        api.get("/transactions"),
        api.get("/users"),
        api.get("/recommendations"),
        api.get("/reservations"),
        api.get("/book-requests")
      ]);

    setBooks(booksRes.data.books || []);
    setTransactions(transactionRes.data.transactions || []);
    setUsers(usersRes.data.users || []);
    setRecommendations(recRes.data.recommendations || []);
    setReservations(reservationRes.data.reservations || []);
    setBookRequests(requestRes.data.requests || []);
  };

  const loadPersonalData = async () => {
    const [booksRes, transactionRes, recRes, reservationRes, requestRes, usersRes] =
      await Promise.all([
        api.get("/books"),
        api.get("/transactions"),
        api.get("/recommendations"),
        api.get("/reservations"),
        api.get("/book-requests"),
        api.get("/users")
      ]);

    setBooks(booksRes.data.books || []);
    setTransactions(
      (transactionRes.data.transactions || []).filter(
        (item) => item.borrowerName === user?.name
      )
    );
    setRecommendations(recRes.data.recommendations || []);
    setReservations(reservationRes.data.reservations || []);
    setBookRequests(requestRes.data.requests || []);
    setUsers(usersRes.data.users || []);
  };

  useEffect(() => {
    let intervalId;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (role === "admin") {
          await loadAdminData();
        } else if (role === "librarian") {
          await loadLibrarianData();
        } else if ((role === "faculty" || role === "student") && user) {
          await loadPersonalData();
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if ((role === "faculty" || role === "student") && !user) return;

    fetchDashboardData();

    intervalId = setInterval(fetchDashboardData, 15000);

    return () => clearInterval(intervalId);
  }, [role, user]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/users/${id}/approve`, {
        approvedBy: user?.name || "Admin"
      });
      toast.success("User approved successfully");
      await loadAdminData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/users/${id}/reject`, {
        approvedBy: user?.name || "Admin"
      });
      toast.success("User rejected successfully");
      await loadAdminData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject user");
    }
  };

  const adminStats = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: "Total Users",
        value: String(overview.totalUsers || 0),
        badge: "All Accounts",
        tone: "success",
        icon: Users
      },
      {
        label: "Approved Users",
        value: String(overview.approvedUsers || 0),
        badge: "Can Login",
        tone: "info",
        icon: UserCheck
      },
      {
        label: "Pending Requests",
        value: String(overview.pendingUsers || 0),
        badge: "Need Approval",
        tone: "warning",
        icon: UserPlus
      },
      {
        label: "Active Issues",
        value: String(overview.transactions?.activeIssues || 0),
        badge: "Currently Out",
        tone: "primary",
        icon: ClipboardList
      },
      {
        label: "Overdue",
        value: String(overview.transactions?.overdue || 0),
        badge: "Needs Attention",
        tone: "danger",
        icon: AlertTriangle
      },
      {
        label: "Total Fines",
        value: `Rs. ${overview.totalFines || 0}`,
        badge: "Collected",
        tone: "success",
        icon: BadgeIndianRupee
      }
    ];
  }, [overview]);

  const pendingUsers = useMemo(
    () => users.filter((item) => item.accessStatus === "pending"),
    [users]
  );

  const filteredPendingUsers = useMemo(() => {
    return pendingUsers.filter((item) =>
      matchesSearch(searchQuery, [
        item.name,
        item.username,
        item.role,
        item.department,
        item.email
      ])
    );
  }, [pendingUsers, searchQuery]);

  const recentUsers = useMemo(() => users.slice(0, 6), [users]);

  const filteredRecentUsers = useMemo(() => {
    return recentUsers.filter((item) =>
      matchesSearch(searchQuery, [
        item.name,
        item.username,
        item.role,
        item.department,
        item.email,
        item.accessStatus
      ])
    );
  }, [recentUsers, searchQuery]);

  const adminRows = useMemo(() => {
    return transactions
      .filter((item) =>
        matchesSearch(searchQuery, [
          item.bookTitle,
          item.bookIsbn,
          item.borrowerName,
          item.borrowerRole,
          item.status,
          item.fine
        ])
      )
      .slice(0, 5)
      .map((item) => ({
        id: item._id?.slice(-5) || "-",
        book: {
          type: "stack",
          title: item.bookTitle,
          subtitle: item.bookIsbn
        },
        user: {
          type: "stack",
          title: item.borrowerName,
          subtitle: item.borrowerRole
        },
        issueDate: formatDate(item.issueDate),
        dueDate: formatDate(item.dueDate),
        status: {
          type: "badge",
          label: item.status,
          tone:
            item.status === "overdue"
              ? "danger"
              : item.status === "returned"
              ? "primary"
              : "success"
        },
        fine: {
          type: "amount",
          label: `Rs. ${item.fine || 0}`,
          tone: item.fine > 0 ? "danger" : "normal"
        }
      }));
  }, [transactions, searchQuery]);

  const adminNotifications = useMemo(() => {
    if (role !== "admin") return [];

    const items = [];

    pendingUsers.slice(0, 4).forEach((item) => {
      items.push({
        id: `pending-${item._id}`,
        title: "New user approval request",
        message: `${item.name} (${item.role}) is waiting for admin approval.`,
        time: formatDateTime(item.createdAt)
      });
    });

    users
      .filter((item) => item.profileUpdateRequest?.status === "pending")
      .slice(0, 4)
      .forEach((item) => {
        items.push({
          id: `profile-${item._id}`,
          title: "Profile update request",
          message: `${item.name} requested profile changes.`,
          time: formatDateTime(item.profileUpdateRequest?.requestedAt)
        });
      });

    return items.slice(0, 8);
  }, [role, pendingUsers, users]);

  const librarianStats = useMemo(() => {
    const totalCopies = books.reduce((sum, book) => sum + Number(book.totalCopies || 0), 0);
    const availableBooks = books.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0);
    const today = new Date().toDateString();

    const issuedToday = transactions.filter(
      (item) => new Date(item.issueDate).toDateString() === today
    ).length;

    const totalFines = transactions.reduce((sum, item) => sum + Number(item.fine || 0), 0);

    return [
      {
        label: "Total Books",
        value: String(totalCopies),
        badge: "All Copies",
        tone: "info",
        icon: BookCopy
      },
      {
        label: "Available",
        value: String(availableBooks),
        badge: "Ready to Issue",
        tone: "success",
        icon: BookCheck
      },
      {
        label: "Issued Today",
        value: String(issuedToday),
        badge: "Today",
        tone: "warning",
        icon: CalendarPlus2
      },
      {
        label: "Fines Collected",
        value: `Rs. ${totalFines}`,
        badge: "Total",
        tone: "primary",
        icon: Wallet
      }
    ];
  }, [books, transactions]);

  const librarianActivity = useMemo(() => {
    return transactions
      .filter((item) =>
        matchesSearch(searchQuery, [
          item.bookTitle,
          item.borrowerName,
          item.borrowerRole,
          item.status,
          item.bookIsbn
        ])
      )
      .slice(0, 6)
      .map((item) => {
        const actionText =
          item.status === "returned"
            ? "returned by"
            : item.status === "overdue"
            ? "overdue with"
            : "issued to";

        return `${item.bookTitle} ${actionText} ${item.borrowerName} (${item.borrowerRole}) on ${formatDate(item.issueDate)}`;
      });
  }, [transactions, searchQuery]);

  const librarianNotifications = useMemo(() => {
    if (role !== "librarian") return [];

    const items = [];

    recommendations
      .filter((item) => item.status === "pending")
      .slice(0, 3)
      .forEach((item) => {
        items.push({
          id: `rec-${item._id}`,
          title: "Faculty recommendation",
          message: `${item.facultyName} recommended "${item.title}".`,
          time: formatDateTime(item.createdAt)
        });
      });

    reservations
      .filter((item) => item.status === "pending")
      .slice(0, 3)
      .forEach((item) => {
        items.push({
          id: `res-${item._id}`,
          title: item.requesterRole === "student" ? "Student issue request" : "Faculty reservation",
          message: `${item.requesterName} requested "${item.bookTitle}".`,
          time: formatDateTime(item.createdAt)
        });
      });

    bookRequests
      .filter((item) => item.status === "pending")
      .slice(0, 2)
      .forEach((item) => {
        items.push({
          id: `bookreq-${item._id}`,
          title: "Student new book request",
          message: `${item.requesterName} requested "${item.title}" to be added.`,
          time: formatDateTime(item.createdAt)
        });
      });

    return items.slice(0, 8);
  }, [role, recommendations, reservations, bookRequests]);

  const filteredFacultyTransactions = useMemo(() => {
    return transactions.filter((item) =>
      matchesSearch(searchQuery, [
        item.bookTitle,
        item.bookIsbn,
        item.status,
        item.issueDate,
        item.dueDate
      ])
    );
  }, [transactions, searchQuery]);

  const facultyStats = useMemo(() => {
    const active = transactions.filter((item) => item.status === "active").length;
    const overdue = transactions.filter((item) => item.status === "overdue").length;
    const myRecommendations = recommendations.filter(
      (item) => String(item.faculty) === String(user?._id)
    ).length;
    const myReservations = reservations.filter(
      (item) => String(item.user) === String(user?._id)
    ).length;

    return [
      {
        label: "Books Issued",
        value: String(active),
        badge: "Longer Duration",
        tone: "success",
        icon: BookOpenCheck
      },
      {
        label: "Overdue",
        value: String(overdue),
        badge: "Check Return",
        tone: "danger",
        icon: ShieldAlert
      },
      {
        label: "My Reservations",
        value: String(myReservations),
        badge: "Requested",
        tone: "info",
        icon: BookmarkPlus
      },
      {
        label: "Recommendations",
        value: String(myRecommendations),
        badge: "Sent",
        tone: "primary",
        icon: BookPlus
      }
    ];
  }, [transactions, recommendations, reservations, user]);

  const facultyRows = useMemo(() => {
    return filteredFacultyTransactions.map((item) => ({
      book: {
        type: "stack",
        title: item.bookTitle,
        subtitle: item.bookIsbn
      },
      issueDate: formatDate(item.issueDate),
      dueDate: formatDate(item.dueDate),
      status: {
        type: "badge",
        label: item.status,
        tone:
          item.status === "overdue"
            ? "danger"
            : item.status === "returned"
            ? "primary"
            : "success"
      },
      daysLeft:
        item.status === "returned"
          ? "Returned"
          : (() => {
              const diff = Math.ceil(
                (new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
              );

              if (diff < 0) {
                return {
                  type: "amount",
                  label: `${Math.abs(diff)} days overdue`,
                  tone: "danger"
                };
              }

              return `${diff} days left`;
            })()
    }));
  }, [filteredFacultyTransactions]);

  const facultyNotifications = useMemo(() => {
    if (role !== "faculty" || !user) return [];

    const items = [];

    reservations
      .filter((item) => String(item.user) === String(user._id))
      .slice(0, 3)
      .forEach((item) => {
        items.push({
          id: `faculty-res-${item._id}`,
          title: "Reservation status",
          message: `"${item.bookTitle}" reservation is ${item.status}.`,
          time: formatDateTime(item.createdAt)
        });
      });

    recommendations
      .filter((item) => String(item.faculty) === String(user._id))
      .slice(0, 3)
      .forEach((item) => {
        items.push({
          id: `faculty-rec-${item._id}`,
          title: "Recommendation status",
          message: `"${item.title}" recommendation is ${item.status}.`,
          time: formatDateTime(item.createdAt)
        });
      });

    const currentUserFromList = users.find((item) => String(item._id) === String(user._id));

    if (currentUserFromList?.profileUpdateRequest?.status === "approved") {
      items.push({
        id: "profile-approved",
        title: "Profile request approved",
        message: "Your profile update request was approved by admin.",
        time: formatDateTime(currentUserFromList.profileUpdateRequest.reviewedAt)
      });
    }

    if (currentUserFromList?.profileUpdateRequest?.status === "rejected") {
      items.push({
        id: "profile-rejected",
        title: "Profile request rejected",
        message: "Your profile update request was rejected by admin.",
        time: formatDateTime(currentUserFromList.profileUpdateRequest.reviewedAt)
      });
    }

    return items.slice(0, 8);
  }, [role, user, reservations, recommendations, users]);

  const filteredStudentTransactions = useMemo(() => {
    return transactions.filter((item) =>
      matchesSearch(searchQuery, [
        item.bookTitle,
        item.bookIsbn,
        item.status,
        item.issueDate,
        item.dueDate,
        item.fine
      ])
    );
  }, [transactions, searchQuery]);

  const studentStats = useMemo(() => {
    const active = transactions.filter((item) => item.status === "active").length;
    const overdue = transactions.filter((item) => item.status === "overdue").length;
    const dueSoon = transactions.filter((item) => {
      if (item.status !== "active") return false;
      const due = new Date(item.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const totalFines = transactions.reduce((sum, item) => sum + Number(item.fine || 0), 0);
    const myRequests = reservations.filter((item) => String(item.user) === String(user?._id)).length;

    return [
      {
        label: "Books Issued",
        value: String(active),
        badge: "Currently Active",
        tone: "success",
        icon: BookOpenCheck
      },
      {
        label: "Due Soon",
        value: String(dueSoon),
        badge: "Within 7 days",
        tone: "warning",
        icon: Clock3
      },
      {
        label: "Overdue",
        value: String(overdue),
        badge: "Fine Applied",
        tone: "danger",
        icon: ShieldAlert
      },
      {
        label: "Issue Requests",
        value: String(myRequests),
        badge: "Sent",
        tone: "primary",
        icon: BellRing
      }
    ];
  }, [transactions, reservations, user]);

  const studentRows = useMemo(() => {
    return filteredStudentTransactions.map((item) => ({
      book: {
        type: "stack",
        title: item.bookTitle,
        subtitle: item.bookIsbn
      },
      issueDate: formatDate(item.issueDate),
      dueDate: formatDate(item.dueDate),
      status: {
        type: "badge",
        label: item.status,
        tone:
          item.status === "overdue"
            ? "danger"
            : item.status === "returned"
            ? "primary"
            : "success"
      },
      fine: {
        type: "amount",
        label: `Rs. ${item.fine || 0}`,
        tone: item.fine > 0 ? "danger" : "normal"
      }
    }));
  }, [filteredStudentTransactions]);

  const studentNotifications = useMemo(() => {
    if (role !== "student" || !user) return [];

    const items = [];

    transactions.forEach((item) => {
      if (item.status === "overdue") {
        items.push({
          id: `student-overdue-${item._id}`,
          title: "Overdue fine alert",
          message: `"${item.bookTitle}" is overdue. Fine: Rs. ${item.fine || 0}.`,
          time: formatDateTime(item.dueDate)
        });
      } else if (item.status === "active") {
        const diffDays = Math.ceil(
          (new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays >= 0 && diffDays <= 3) {
          items.push({
            id: `student-due-${item._id}`,
            title: "Due date reminder",
            message: `"${item.bookTitle}" is due in ${diffDays} day(s).`,
            time: formatDateTime(item.dueDate)
          });
        }
      }
    });

    reservations
      .filter((item) => String(item.user) === String(user._id))
      .slice(0, 2)
      .forEach((item) => {
        items.push({
          id: `student-res-${item._id}`,
          title: "Issue request status",
          message: `"${item.bookTitle}" request is ${item.status}.`,
          time: formatDateTime(item.createdAt)
        });
      });

    bookRequests
      .filter((item) => String(item.user) === String(user._id))
      .slice(0, 2)
      .forEach((item) => {
        items.push({
          id: `student-bookreq-${item._id}`,
          title: "New book request status",
          message: `"${item.title}" request is ${item.status}.`,
          time: formatDateTime(item.createdAt)
        });
      });

    const currentUserFromList = users.find((item) => String(item._id) === String(user._id));

    if (currentUserFromList?.profileUpdateRequest?.status === "approved") {
      items.push({
        id: "student-profile-approved",
        title: "Profile request approved",
        message: "Your profile update request was approved by admin.",
        time: formatDateTime(currentUserFromList.profileUpdateRequest.reviewedAt)
      });
    }

    if (currentUserFromList?.profileUpdateRequest?.status === "rejected") {
      items.push({
        id: "student-profile-rejected",
        title: "Profile request rejected",
        message: "Your profile update request was rejected by admin.",
        time: formatDateTime(currentUserFromList.profileUpdateRequest.reviewedAt)
      });
    }

    return items.slice(0, 8);
  }, [role, user, transactions, reservations, bookRequests, users]);

  const availableBooks = books
    .filter((book) => Number(book.availableCopies || 0) > 0)
    .slice(0, 4)
    .map((book) => ({
      category: book.category || "General",
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      availability: `${book.availableCopies} Available`
    }));

  const controlledSearch = true;
  const notifications =
    role === "admin"
      ? adminNotifications
      : role === "librarian"
      ? librarianNotifications
      : role === "faculty"
      ? facultyNotifications
      : role === "student"
      ? studentNotifications
      : [];

  if (loading) {
    return (
      <DashboardLayout
        role={role}
        title={titleMap[role]}
        searchPlaceholder={roleSearchPlaceholders[role]}
        navItems={navItems}
        searchValue={controlledSearch ? searchQuery : undefined}
        onSearchChange={controlledSearch ? setSearchQuery : undefined}
        notifications={notifications}
      >
        <PanelCard title="Loading">
          <p>Loading dashboard data...</p>
        </PanelCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={role}
      title={titleMap[role]}
      searchPlaceholder={roleSearchPlaceholders[role]}
      navItems={navItems}
      searchValue={controlledSearch ? searchQuery : undefined}
      onSearchChange={controlledSearch ? setSearchQuery : undefined}
      notifications={notifications}
    >
      {role === "admin" && (
        <>
          <StatsGrid stats={adminStats} />

          <div className="action-strip">
            <Link to="/admin/users" className="action-btn primary" style={{ textAlign: "center" }}>
              Manage Users
            </Link>
            <Link to="/admin/reports" className="action-btn secondary" style={{ textAlign: "center" }}>
              View Reports
            </Link>
            <Link to="/admin/transactions" className="action-btn muted" style={{ textAlign: "center" }}>
              All Transactions
            </Link>
          </div>

          <PanelCard title="Pending Access Requests">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingUsers.length > 0 ? (
                    filteredPendingUsers.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.username}</td>
                        <td>{item.role}</td>
                        <td>{item.department || "-"}</td>
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
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No matching pending requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PanelCard>

          <PanelCard title="Recent Users">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentUsers.length > 0 ? (
                    filteredRecentUsers.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.role}</td>
                        <td>
                          <span
                            className={
                              item.accessStatus === "approved"
                                ? "badge badge-success"
                                : item.accessStatus === "pending"
                                ? "badge badge-warning"
                                : "badge badge-danger"
                            }
                          >
                            {item.accessStatus}
                          </span>
                        </td>
                        <td>{item.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No matching users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PanelCard>

          <PanelCard title="Recent Transactions">
            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "book", label: "Book" },
                { key: "user", label: "User" },
                { key: "issueDate", label: "Issue Date" },
                { key: "dueDate", label: "Due Date" },
                { key: "status", label: "Status" },
                { key: "fine", label: "Fine" }
              ]}
              rows={adminRows}
            />
          </PanelCard>
        </>
      )}

      {role === "librarian" && (
        <>
          <div className="action-strip">
            <Link to="/librarian/issue-book" className="action-btn primary" style={{ textAlign: "center" }}>
              Issue Book
            </Link>
            <Link to="/librarian/return-book" className="action-btn secondary" style={{ textAlign: "center" }}>
              Return Book
            </Link>
            <Link to="/librarian/books" className="action-btn muted" style={{ textAlign: "center" }}>
              Add New Book
            </Link>
          </div>

          <StatsGrid stats={librarianStats} />

          <PanelCard title="Recent Activity">
            <ActivityList items={librarianActivity.length > 0 ? librarianActivity : ["No matching activity found."]} />
          </PanelCard>
        </>
      )}

      {role === "faculty" && (
        <>
          <div className="action-strip">
            <Link to="/faculty/browse-books" className="action-btn primary" style={{ textAlign: "center" }}>
              Browse & Reserve Books
            </Link>
            <Link to="/faculty/recommendations" className="action-btn secondary" style={{ textAlign: "center" }}>
              Recommend Book
            </Link>
            <Link to="/faculty/history" className="action-btn muted" style={{ textAlign: "center" }}>
              Borrowing History
            </Link>
            <Link to="/faculty/profile" className="action-btn primary" style={{ textAlign: "center" }}>
              Update Profile
            </Link>
          </div>

          <StatsGrid stats={facultyStats} />

          <PanelCard title="Currently Issued Books">
            <DataTable
              columns={[
                { key: "book", label: "Book" },
                { key: "issueDate", label: "Issue Date" },
                { key: "dueDate", label: "Due Date" },
                { key: "status", label: "Status" },
                { key: "daysLeft", label: "Days Left" }
              ]}
              rows={facultyRows}
            />
          </PanelCard>
        </>
      )}

      {role === "student" && (
        <>
          <div className="action-strip">
            <Link to="/student/browse-books" className="action-btn primary" style={{ textAlign: "center" }}>
              Search & Request Books
            </Link>
            <Link to="/student/settings" className="action-btn secondary" style={{ textAlign: "center" }}>
              Request New Book
            </Link>
            <Link to="/student/history" className="action-btn muted" style={{ textAlign: "center" }}>
              Borrowing History
            </Link>
            <Link to="/student/profile" className="action-btn primary" style={{ textAlign: "center" }}>
              Update Profile
            </Link>
          </div>

          <StatsGrid stats={studentStats} />

          <PanelCard title="Issued Books and Due Dates">
            <DataTable
              columns={[
                { key: "book", label: "Book" },
                { key: "issueDate", label: "Issue Date" },
                { key: "dueDate", label: "Due Date" },
                { key: "status", label: "Status" },
                { key: "fine", label: "Fine" }
              ]}
              rows={studentRows}
            />
          </PanelCard>

          <PanelCard title="Available Books">
            <BookGrid books={availableBooks} actionLabel="Available" />
          </PanelCard>
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;