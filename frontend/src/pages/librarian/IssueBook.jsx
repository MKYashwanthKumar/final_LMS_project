import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BookCheck, Users, ClipboardList, ShieldAlert } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const buildNotifications = (books, transactions) => {
  const items = [];

  books
    .filter((book) => Number(book.availableCopies || 0) <= 2)
    .slice(0, 4)
    .forEach((book) => {
      items.push({
        id: `book-${book._id}`,
        title: "Low availability",
        message: `${book.title} has ${book.availableCopies} copies left.`,
        time: "Live"
      });
    });

  transactions
    .filter((item) => item.status === "overdue")
    .slice(0, 4)
    .forEach((item) => {
      items.push({
        id: `tx-${item._id}`,
        title: "Overdue return",
        message: `${item.borrowerName} has overdue book ${item.bookTitle}.`,
        time: "Live"
      });
    });

  return items.slice(0, 8);
};

const IssueBook = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    bookId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [usersRes, booksRes, txRes] = await Promise.all([
        api.get("/users"),
        api.get("/books"),
        api.get("/transactions")
      ]);

      setUsers(usersRes.data.users || []);
      setBooks(booksRes.data.books || []);
      setTransactions(txRes.data.transactions || []);
    } catch (error) {
      toast.error("Failed to load issue book data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.accessStatus === "approved" &&
          ["student", "faculty"].includes(user.role)
      ),
    [users]
  );

  const availableBooks = useMemo(
    () => books.filter((book) => Number(book.availableCopies || 0) > 0),
    [books]
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => ["active", "overdue"].includes(item.status))
      .filter((item) => {
        const text = searchQuery.toLowerCase();
        if (!text) return true;

        return [
          item.bookTitle,
          item.bookIsbn,
          item.borrowerName,
          item.borrowerRole,
          item.status
        ].some((value) => String(value || "").toLowerCase().includes(text));
      });
  }, [transactions, searchQuery]);

  const notifications = useMemo(
    () => buildNotifications(books, transactions),
    [books, transactions]
  );

  const stats = useMemo(() => {
    return [
      {
        label: "Approved Users",
        value: String(approvedUsers.length),
        badge: "Eligible",
        tone: "success",
        icon: Users
      },
      {
        label: "Available Books",
        value: String(availableBooks.length),
        badge: "Ready",
        tone: "info",
        icon: BookCheck
      },
      {
        label: "Active Issues",
        value: String(transactions.filter((t) => t.status === "active").length),
        badge: "Issued",
        tone: "primary",
        icon: ClipboardList
      },
      {
        label: "Overdue",
        value: String(transactions.filter((t) => t.status === "overdue").length),
        badge: "Attention",
        tone: "danger",
        icon: ShieldAlert
      }
    ];
  }, [approvedUsers, availableBooks, transactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await api.post("/transactions/issue", formData);
      toast.success("Book issued successfully");
      setFormData({ userId: "", bookId: "" });
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="librarian"
      title="Issue Book"
      searchPlaceholder={roleSearchPlaceholders.librarian}
      navItems={roleNavConfig.librarian}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Issue Book to Student / Faculty">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Select User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
              required
            >
              <option value="">Choose approved user</option>
              {approvedUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role}) - {user.department || "No dept"}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Select Book</label>
            <select
              value={formData.bookId}
              onChange={(e) => setFormData((prev) => ({ ...prev, bookId: e.target.value }))}
              required
            >
              <option value="">Choose available book</option>
              {availableBooks.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} - {book.availableCopies} available
                </option>
              ))}
            </select>
          </div>

          <div className="full-span">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Issuing..." : "Issue Book"}
            </button>
          </div>
        </form>
      </PanelCard>

      <PanelCard title="Current Issued / Overdue Books">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.bookTitle}
                      <br />
                      <span style={{ color: "#9fb4d8", fontSize: 12 }}>{item.bookIsbn}</span>
                    </td>
                    <td>
                      {item.borrowerName}
                      <br />
                      <span style={{ color: "#9fb4d8", fontSize: 12 }}>{item.borrowerRole}</span>
                    </td>
                    <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={item.status === "overdue" ? "badge badge-danger" : "badge badge-success"}>
                        {item.status}
                      </span>
                    </td>
                    <td>Rs. {item.fine || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No matching issue records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default IssueBook;