import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BrainCircuit,
  Database,
  Code2,
  Cpu,
  Network,
  Sparkles,
  LibraryBig,
  BookCheck,
  ClipboardList,
  BellRing
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const getBookIcon = (category = "", title = "") => {
  const text = `${category} ${title}`.toLowerCase();

  if (text.includes("artificial intelligence") || text.includes("ai")) return BrainCircuit;
  if (text.includes("database") || text.includes("sql")) return Database;
  if (
    text.includes("algorithm") ||
    text.includes("data structure") ||
    text.includes("programming") ||
    text.includes("coding")
  ) return Code2;
  if (
    text.includes("digital") ||
    text.includes("electronics") ||
    text.includes("hardware")
  ) return Cpu;
  if (text.includes("network") || text.includes("communication")) return Network;

  return Sparkles;
};

const BrowseBooks = () => {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBookId, setLoadingBookId] = useState("");

  const loadData = async () => {
    try {
      const [booksRes, reservationsRes, txRes] = await Promise.all([
        api.get("/books"),
        api.get("/reservations"),
        api.get("/transactions")
      ]);

      setBooks(booksRes.data.books || []);
      setReservations(reservationsRes.data.reservations || []);
      setTransactions(txRes.data.transactions || []);
    } catch (error) {
      toast.error("Failed to load books");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableBooks = useMemo(() => {
    return books
      .filter((book) => Number(book.availableCopies || 0) > 0)
      .filter((book) => {
        const text = searchQuery.toLowerCase();
        if (!text) return true;

        return [
          book.title,
          book.author,
          book.subject,
          book.isbn,
          book.category,
          book.edition
        ].some((value) => String(value || "").toLowerCase().includes(text));
      });
  }, [books, searchQuery]);

  const myRequests = useMemo(() => {
    return reservations.filter((item) => String(item.user) === String(user?._id));
  }, [reservations, user]);

  const myIssuedBooks = useMemo(() => {
    return transactions.filter((item) => item.borrowerName === user?.name);
  }, [transactions, user]);

  const stats = useMemo(() => {
    return [
      {
        label: "Available Titles",
        value: String(availableBooks.length),
        badge: "Student View",
        tone: "info",
        icon: LibraryBig
      },
      {
        label: "Issue Requests",
        value: String(myRequests.length),
        badge: "Sent",
        tone: "primary",
        icon: BellRing
      },
      {
        label: "Available Copies",
        value: String(availableBooks.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0)),
        badge: "In Stock",
        tone: "success",
        icon: BookCheck
      },
      {
        label: "Issued Books",
        value: String(myIssuedBooks.filter((item) => item.status !== "returned").length),
        badge: "Tracked",
        tone: "warning",
        icon: ClipboardList
      }
    ];
  }, [availableBooks, myRequests, myIssuedBooks]);

  const notifications = useMemo(() => {
    const items = [];

    myRequests.slice(0, 4).forEach((item) => {
      items.push({
        id: item._id,
        title: "Issue request update",
        message: `"${item.bookTitle}" request is ${item.status}.`,
        time: new Date(item.createdAt).toLocaleString()
      });
    });

    myIssuedBooks.forEach((item) => {
      if (item.status === "overdue") {
        items.push({
          id: `fine-${item._id}`,
          title: "Fine alert",
          message: `"${item.bookTitle}" is overdue. Fine Rs. ${item.fine || 0}.`,
          time: new Date(item.dueDate).toLocaleString()
        });
      }
    });

    return items.slice(0, 8);
  }, [myRequests, myIssuedBooks]);

  const handleRequestIssue = async (bookId) => {
    try {
      setLoadingBookId(bookId);
      await api.post("/reservations", {
        userId: user._id,
        bookId
      });
      toast.success("Book issue request sent to librarian");
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to request book");
    } finally {
      setLoadingBookId("");
    }
  };

  return (
    <DashboardLayout
      role="student"
      title="Browse Books"
      searchPlaceholder={roleSearchPlaceholders.student}
      navItems={roleNavConfig.student}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <style>{`
        .student-book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 22px;
        }

        .student-book-card {
          background: linear-gradient(180deg, rgba(9, 24, 54, 0.98), rgba(5, 16, 40, 0.98));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.22);
        }

        .student-book-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .student-book-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: rgba(255, 140, 26, 0.12);
          color: #ffb14a;
        }

        .student-book-stock {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .student-book-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
        }

        .student-book-meta {
          color: #a9bddf;
          line-height: 1.8;
          margin-bottom: 18px;
        }
      `}</style>

      <StatsGrid stats={stats} />

      <PanelCard title="Available Library Books">
        {availableBooks.length > 0 ? (
          <div className="student-book-grid">
            {availableBooks.map((book) => {
              const Icon = getBookIcon(book.category, book.title);

              return (
                <div className="student-book-card" key={book._id}>
                  <div className="student-book-top">
                    <div className="student-book-icon">
                      <Icon size={28} />
                    </div>
                    <span className="student-book-stock">{book.availableCopies} Available</span>
                  </div>

                  <h3>{book.title}</h3>

                  <div className="student-book-meta">
                    by {book.author}<br />
                    ISBN: {book.isbn}<br />
                    Subject: {book.subject || "-"}<br />
                    Category: {book.category || "General"}<br />
                    Edition: {book.edition || "-"}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleRequestIssue(book._id)}
                    disabled={loadingBookId === book._id}
                  >
                    {loadingBookId === book._id ? "Sending..." : "Request Issue"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No books found for your search.</p>
        )}
      </PanelCard>

      <PanelCard title="My Book Issue Requests">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>ISBN</th>
                <th>Status</th>
                <th>Requested At</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length > 0 ? (
                myRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.bookTitle}</td>
                    <td>{item.bookIsbn}</td>
                    <td>
                      <span
                        className={
                          item.status === "pending"
                            ? "badge badge-warning"
                            : item.status === "fulfilled"
                            ? "badge badge-success"
                            : "badge badge-danger"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No issue requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default BrowseBooks;