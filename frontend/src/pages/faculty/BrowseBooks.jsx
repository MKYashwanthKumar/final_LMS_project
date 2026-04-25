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
  BookmarkPlus,
  BookCheck,
  ClipboardList
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBookId, setLoadingBookId] = useState("");

  const loadData = async () => {
    try {
      const [booksRes, reservationsRes] = await Promise.all([
        api.get("/books"),
        api.get("/reservations")
      ]);

      setBooks(booksRes.data.books || []);
      setReservations(reservationsRes.data.reservations || []);
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
          book.category,
          book.subject,
          book.isbn,
          book.edition
        ].some((value) => String(value || "").toLowerCase().includes(text));
      });
  }, [books, searchQuery]);

  const myReservations = useMemo(() => {
    return reservations.filter((item) => String(item.user) === String(user?._id));
  }, [reservations, user]);

  const stats = useMemo(() => {
    return [
      {
        label: "Available Titles",
        value: String(availableBooks.length),
        badge: "Faculty View",
        tone: "info",
        icon: LibraryBig
      },
      {
        label: "My Reservations",
        value: String(myReservations.length),
        badge: "Requested",
        tone: "primary",
        icon: BookmarkPlus
      },
      {
        label: "Ready to Reserve",
        value: String(availableBooks.filter((book) => Number(book.availableCopies || 0) > 0).length),
        badge: "In Stock",
        tone: "success",
        icon: BookCheck
      },
      {
        label: "Reservation History",
        value: String(reservations.length),
        badge: "Tracked",
        tone: "warning",
        icon: ClipboardList
      }
    ];
  }, [availableBooks, myReservations, reservations]);

  const notifications = useMemo(() => {
    return myReservations.slice(0, 8).map((item) => ({
      id: item._id,
      title: "Reservation update",
      message: `"${item.bookTitle}" reservation is ${item.status}.`,
      time: new Date(item.createdAt).toLocaleString()
    }));
  }, [myReservations]);

  const handleReserve = async (bookId) => {
    try {
      setLoadingBookId(bookId);
      await api.post("/reservations", {
        userId: user._id,
        bookId
      });
      toast.success("Reservation request sent to librarian");
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reserve book");
    } finally {
      setLoadingBookId("");
    }
  };

  return (
    <DashboardLayout
      role="faculty"
      title="Browse Books"
      searchPlaceholder={roleSearchPlaceholders.faculty}
      navItems={roleNavConfig.faculty}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <style>{`
        .faculty-book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 22px;
        }

        .faculty-book-card {
          background: linear-gradient(180deg, rgba(9, 24, 54, 0.98), rgba(5, 16, 40, 0.98));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.22);
        }

        .faculty-book-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .faculty-book-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: rgba(255, 140, 26, 0.12);
          color: #ffb14a;
        }

        .faculty-book-stock {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .faculty-book-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
        }

        .faculty-book-meta {
          color: #a9bddf;
          line-height: 1.8;
          margin-bottom: 18px;
        }
      `}</style>

      <StatsGrid stats={stats} />

      <PanelCard title="Available Books for Faculty">
        {availableBooks.length > 0 ? (
          <div className="faculty-book-grid">
            {availableBooks.map((book) => {
              const Icon = getBookIcon(book.category, book.title);

              return (
                <div className="faculty-book-card" key={book._id}>
                  <div className="faculty-book-top">
                    <div className="faculty-book-icon">
                      <Icon size={28} />
                    </div>
                    <span className="faculty-book-stock">{book.availableCopies} Available</span>
                  </div>

                  <h3>{book.title}</h3>

                  <div className="faculty-book-meta">
                    by {book.author}<br />
                    ISBN: {book.isbn}<br />
                    Category: {book.category || "General"}<br />
                    Edition: {book.edition || "-"}<br />
                    Subject: {book.subject || "-"}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleReserve(book._id)}
                    disabled={loadingBookId === book._id}
                  >
                    <BookmarkPlus size={16} />
                    {loadingBookId === book._id ? "Sending..." : "Reserve Book"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No available books found.</p>
        )}
      </PanelCard>

      <PanelCard title="My Reservation Requests">
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
              {myReservations.length > 0 ? (
                myReservations.map((item) => (
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
                  <td colSpan="4">No reservation requests yet.</td>
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