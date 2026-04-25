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
  Boxes,
  PackageCheck,
  ShieldAlert,
  PlusCircle,
  Pencil,
  Trash2
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "Computer Science",
  edition: "",
  subject: "",
  totalCopies: 1
};

const getBookIcon = (category = "", title = "") => {
  const text = `${category} ${title}`.toLowerCase();

  if (text.includes("artificial intelligence") || text.includes("ai")) return BrainCircuit;
  if (text.includes("database") || text.includes("sql")) return Database;
  if (
    text.includes("algorithm") ||
    text.includes("data structure") ||
    text.includes("programming") ||
    text.includes("coding")
  ) {
    return Code2;
  }
  if (
    text.includes("digital") ||
    text.includes("electronics") ||
    text.includes("hardware")
  ) {
    return Cpu;
  }
  if (text.includes("network") || text.includes("communication")) return Network;

  return Sparkles;
};

const buildNotifications = (books) => {
  const items = [];

  books
    .filter((book) => Number(book.availableCopies || 0) === 0)
    .slice(0, 4)
    .forEach((book) => {
      items.push({
        id: `out-${book._id}`,
        title: "Out of stock",
        message: `${book.title} is currently unavailable.`,
        time: "Live"
      });
    });

  books
    .filter(
      (book) =>
        Number(book.availableCopies || 0) > 0 &&
        Number(book.availableCopies || 0) <= 2
    )
    .slice(0, 4)
    .forEach((book) => {
      items.push({
        id: `low-${book._id}`,
        title: "Low stock",
        message: `${book.title} has only ${book.availableCopies} copies left.`,
        time: "Live"
      });
    });

  return items.slice(0, 8);
};

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBooks = async () => {
    try {
      const { data } = await api.get("/books");
      setBooks(data.books || []);
    } catch (error) {
      toast.error("Failed to load books");
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const notifications = useMemo(() => buildNotifications(books), [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [
        book.title,
        book.author,
        book.isbn,
        book.category,
        book.edition,
        book.subject,
        book.status
      ].some((value) => String(value || "").toLowerCase().includes(text));
    });
  }, [books, searchQuery]);

  const stats = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, book) => sum + Number(book.totalCopies || 0), 0);
    const inStock = books.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0);
    const outOfStockTitles = books.filter((book) => Number(book.availableCopies || 0) === 0).length;

    return [
      {
        label: "Total Titles",
        value: String(totalTitles),
        badge: "Library",
        tone: "info",
        icon: LibraryBig
      },
      {
        label: "Total Copies",
        value: String(totalCopies),
        badge: "Catalog",
        tone: "primary",
        icon: Boxes
      },
      {
        label: "In Stock",
        value: String(inStock),
        badge: "Available",
        tone: "success",
        icon: PackageCheck
      },
      {
        label: "Out of Stock",
        value: String(outOfStockTitles),
        badge: "Attention",
        tone: "danger",
        icon: ShieldAlert
      }
    ];
  }, [books]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalCopies" ? Number(value) : value
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId("");
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "Computer Science",
      edition: book.edition || "",
      subject: book.subject || "",
      totalCopies: Number(book.totalCopies || 1)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this book?");
    if (!confirmed) return;

    try {
      await api.delete(`/books/${id}`);
      toast.success("Book deleted successfully");
      if (editingId === id) resetForm();
      loadBooks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete book");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/books/${editingId}`, formData);
        toast.success("Book updated successfully");
      } else {
        await api.post("/books", formData);
        toast.success("Book added successfully");
      }

      resetForm();
      loadBooks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      role="librarian"
      title="Manage Books"
      searchPlaceholder={roleSearchPlaceholders.librarian}
      navItems={roleNavConfig.librarian}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <style>{`
        .lib-book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 22px;
        }

        .lib-book-card {
          background: linear-gradient(180deg, rgba(9, 24, 54, 0.98), rgba(5, 16, 40, 0.98));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.22);
        }

        .lib-book-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .lib-book-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: rgba(255, 140, 26, 0.12);
          color: #ffb14a;
        }

        .lib-stock-badge {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .lib-stock-badge.out {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .lib-book-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
          color: #ffffff;
        }

        .lib-book-meta {
          color: #a9bddf;
          line-height: 1.8;
          margin-bottom: 18px;
        }

        .lib-book-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>

      <StatsGrid stats={stats} />

      <PanelCard title={editingId ? "Edit Book" : "Add New Book"}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Author</label>
            <input name="author" value={formData.author} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>ISBN</label>
            <input name="isbn" value={formData.isbn} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Category</label>
            <input name="category" value={formData.category} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Edition</label>
            <input name="edition" value={formData.edition} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Subject</label>
            <input name="subject" value={formData.subject} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Total Copies</label>
            <input
              name="totalCopies"
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-span" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Book" : "Add Book"}
            </button>

            {editingId ? (
              <button type="button" className="btn-outline" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </PanelCard>

      <PanelCard title="Library Books">
        {filteredBooks.length > 0 ? (
          <div className="lib-book-grid">
            {filteredBooks.map((book) => {
              const Icon = getBookIcon(book.category, book.title);
              const outOfStock = Number(book.availableCopies || 0) === 0;

              return (
                <div className="lib-book-card" key={book._id}>
                  <div className="lib-book-top">
                    <div className="lib-book-icon">
                      <Icon size={28} />
                    </div>

                    <span className={`lib-stock-badge ${outOfStock ? "out" : ""}`}>
                      {book.availableCopies} Available
                    </span>
                  </div>

                  <h3>{book.title}</h3>

                  <div className="lib-book-meta">
                    by {book.author}<br />
                    ISBN: {book.isbn}<br />
                    Category: {book.category || "General"}<br />
                    Edition: {book.edition || "-"}<br />
                    Subject: {book.subject || "-"}<br />
                    Total Copies: {book.totalCopies}<br />
                    Issued Copies: {book.issuedCopies || 0}<br />
                    Status: {book.status || "available"}
                  </div>

                  <div className="lib-book-actions">
                    <button className="btn-primary" onClick={() => handleEdit(book)}>
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      className="danger-btn"
                      style={{ width: "auto", padding: "14px 18px" }}
                      onClick={() => handleDelete(book._id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No matching books found.</p>
        )}
      </PanelCard>
    </DashboardLayout>
  );
};

export default ManageBooks;